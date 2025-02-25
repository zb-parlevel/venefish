export type UserRole = 'admin' | 'manager' | 'staff';

export const ROLES = {
  ADMIN: 'admin' as UserRole,
  MANAGER: 'manager' as UserRole,
  STAFF: 'staff' as UserRole,
};

export const DEFAULT_ROLE = ROLES.STAFF;

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.STAFF]: 1,
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isValidRole(role: string): role is UserRole {
  return Object.values(ROLES).includes(role as UserRole);
}
