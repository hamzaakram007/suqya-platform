import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.module';
import { OrderStateMachine } from '../order/order-state-machine';
import { DriverCandidate } from './dispatch.types';

@Injectable()
export class DispatchService {
  constructor(
    private prisma: PrismaService,
    private stateMachine: OrderStateMachine,
  ) {}

  async findNearbyDrivers(
    tenantId: string,
    latitude: number,
    longitude: number,
    tankCapacityLiters: number,
    limit = 10,
  ) {
    const drivers = await this.prisma.driver.findMany({
      where: {
        tenantId,
        isOnline: true,
        status: 'active',
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        truck: true,
        user: { include: { profile: true } },
      },
    });

    const candidates: DriverCandidate[] = drivers
      .filter((d) => !d.truck || d.truck.capacityLiters >= tankCapacityLiters)
      .map((d) => {
        const distance = this.haversineDistance(
          latitude,
          longitude,
          d.latitude!,
          d.longitude!,
        );
        const score = this.calculateScore(distance, Number(d.performanceScore));
        return { driverId: d.id, distance, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return candidates;
  }

  async assignDriver(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirstOrThrow({
      where: { id: orderId, tenantId },
      include: { address: true, tankSize: true },
    });

    if (!order.address?.latitude || !order.address?.longitude) {
      throw new NotFoundException('Order address missing coordinates');
    }

    await this.stateMachine.transition(this.prisma, orderId, 'dispatching');

    const candidates = await this.findNearbyDrivers(
      tenantId,
      order.address.latitude,
      order.address.longitude,
      order.tankSize.capacityLiters,
      5,
    );

    if (!candidates.length) {
      return { message: 'No available drivers', orderId };
    }

    const best = candidates[0];

    await this.prisma.orderAssignment.create({
      data: {
        orderId,
        driverId: best.driverId,
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { driverId: best.driverId },
    });

    await this.stateMachine.transition(this.prisma, orderId, 'driver_offered');

    return {
      orderId,
      driverId: best.driverId,
      distance: best.distance,
      score: best.score,
      timeoutSeconds: 30,
    };
  }

  async acceptJob(driverId: string, orderId: string) {
    const assignment = await this.prisma.orderAssignment.findFirst({
      where: { orderId, driverId, response: null },
    });

    if (!assignment) throw new NotFoundException('Job offer not found');

    await this.prisma.orderAssignment.update({
      where: { id: assignment.id },
      data: { response: 'accepted', respondedAt: new Date() },
    });

    await this.stateMachine.transition(this.prisma, orderId, 'accepted', driverId);
    return { message: 'Job accepted', orderId };
  }

  async rejectJob(driverId: string, orderId: string) {
    const assignment = await this.prisma.orderAssignment.findFirst({
      where: { orderId, driverId, response: null },
    });

    if (!assignment) throw new NotFoundException('Job offer not found');

    await this.prisma.orderAssignment.update({
      where: { id: assignment.id },
      data: { response: 'rejected', respondedAt: new Date() },
    });

    await this.stateMachine.transition(this.prisma, orderId, 'dispatching');
    return this.assignDriver(
      (await this.prisma.order.findUniqueOrThrow({ where: { id: orderId } })).tenantId,
      orderId,
    );
  }

  private calculateScore(distanceKm: number, performanceScore: number): number {
    const distanceScore = Math.max(0, 100 - distanceKm * 10);
    return distanceScore * 0.6 + performanceScore * 20 * 0.4;
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
