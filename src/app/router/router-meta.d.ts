import 'vue-router'

import type { AuthPermission, AuthRole } from '@/modules/auth/constants/authorization.constants'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    guestOnly?: boolean
    requiredRoles?: readonly AuthRole[]
    requiredPermissions?: readonly AuthPermission[]
  }
}

export {}
