import { UserRole } from '@prisma/client';

/** Roles allowed for self-registration via OTP */
export const SELF_REGISTER_ROLES: UserRole[] = [
  UserRole.customer,
  UserRole.driver,
  UserRole.supplier,
];

export function assertSelfRegisterRole(role: string): UserRole {
  if (!SELF_REGISTER_ROLES.includes(role as UserRole)) {
    throw new Error(`Role '${role}' requires admin invitation`);
  }
  return role as UserRole;
}
