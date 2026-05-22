import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email?: string
      role: "ADMIN" | "CLIENTE"
      cif?: string
      empresaId?: string
    }
  }

  interface User {
    role: "ADMIN" | "CLIENTE"
    cif?: string
    empresaId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    cif?: string
    empresaId?: string
  }
}
