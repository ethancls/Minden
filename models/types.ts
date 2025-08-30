export type UserRole = 'ADMIN' | 'USER' | string

export interface SessionUser {
  id: string
  email?: string | null
  name?: string | null
  image?: string | null
  role?: UserRole
  locale?: string
}

