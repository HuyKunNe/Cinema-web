export type AuthenticationStatus =
  | 'idle'
  | 'loading'
  | 'anonymous'
  | 'authenticated'
  | 'expired'
  | 'error'

export type AuthIdentity = Readonly<{
  subject: string
  displayName: string | null
  email: string | null
}>

export type SignInState = Readonly<{
  returnUrl: string
}>
