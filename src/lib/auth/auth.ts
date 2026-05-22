import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db/client"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "CIF o Email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const { identifier, password } = credentials as { identifier: string; password: string }
        if (!identifier || !password) return null

        const isCIF = !identifier.includes("@")

        if (isCIF) {
          const empresa = await db.empresa.findUnique({
            where: { cif: identifier.toUpperCase() },
          })
          if (!empresa || !empresa.activo) return null
          const valid = await bcrypt.compare(password, empresa.passwordHash)
          if (!valid) return null
          return {
            id: empresa.id,
            name: empresa.nombre,
            role: "CLIENTE" as const,
            cif: empresa.cif,
            empresaId: empresa.id,
          }
        } else {
          const user = await db.user.findUnique({
            where: { email: identifier.toLowerCase() },
          })
          if (!user) return null
          const valid = await bcrypt.compare(password, user.passwordHash)
          if (!valid) return null
          return {
            id: user.id,
            name: user.nombre,
            email: user.email,
            role: "ADMIN" as const,
          }
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role
        token.cif = (user as { cif?: string }).cif
        token.empresaId = (user as { empresaId?: string }).empresaId
      }
      return token
    },
    session({ session, token }) {
      session.user.role = (token.role as "ADMIN" | "CLIENTE") ?? "CLIENTE"
      session.user.cif = token.cif as string | undefined
      session.user.empresaId = token.empresaId as string | undefined
      return session
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
})
