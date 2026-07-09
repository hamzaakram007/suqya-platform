export type UserRole = 'customer' | 'driver' | 'supplier' | 'admin' | 'dispatcher';

export type OrderStatus =
  | 'pending'
  | 'supplier_review'
  | 'dispatching'
  | 'driver_offered'
  | 'accepted'
  | 'filling'
  | 'in_transit'
  | 'delivered'
  | 'payment_pending'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PaymentType = 'cash' | 'card' | 'credit' | 'wallet' | 'split';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiUser {
  id: string;
  phone: string;
  role: UserRole;
  name?: string;
}

export interface TankSize {
  id: string;
  capacityLiters: number;
  nameAr: string;
  nameEn: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentType: PaymentType;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  createdAt: string;
}

export interface TrackingData {
  orderId: string;
  status: OrderStatus;
  driver?: {
    id: string;
    latitude: number;
    longitude: number;
  };
}

export interface DashboardKpis {
  totalOrders: number;
  completedOrders: number;
  activeDrivers: number;
  totalRevenue: number;
}
