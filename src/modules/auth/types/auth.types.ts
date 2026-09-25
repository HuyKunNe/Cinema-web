export type AuthenticationStatus =
  'idle' | 'loading' | 'anonymous' | 'authenticated' | 'expired' | 'error'

export type AuthIdentity = Readonly<{
  subject: string
  displayName: string | null
  email: string | null
}>

export type AuthAuthorization = Readonly<{
  roles: readonly string[]
  permissions: readonly string[]
}>

export type SignInState = Readonly<{
  returnUrl: string
}>
