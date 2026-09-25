export const AUTH_ROLES = {
  USER: 'USER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
  SERVICE: 'SERVICE',
} as const

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES]

export const AUTH_PERMISSIONS = {
  BOOKING_CREATE: 'booking:create',
  BOOKING_READ: 'booking:read',
  BOOKING_CANCEL: 'booking:cancel',
  MOVIE_MANAGE: 'movie:manage',
  SHOWTIME_MANAGE: 'showtime:manage',
  INVENTORY_MANAGE: 'inventory:manage',
  PAYMENT_READ: 'payment:read',
  NOTIFICATION_MANAGE: 'notification:manage',
  USER_MANAGE: 'user:manage',
} as const

export type AuthPermission = (typeof AUTH_PERMISSIONS)[keyof typeof AUTH_PERMISSIONS]

export const ADMIN_AREA_ROLES: readonly AuthRole[] = [AUTH_ROLES.STAFF, AUTH_ROLES.ADMIN]
