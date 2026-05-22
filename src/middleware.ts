import { auth } from "@/lib/auth/auth"
import { NextResponse } from "next/server"

const PUBLIC_ROUTES = ["/login"]
const ADMIN_ROUTES = ["/admin"]
const CLIENTE_ROUTES = ["/dashboard", "/facturas", "/proveedores", "/informes"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))
  if (isPublic) {
    if (session) {
      const dest = session.user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  const isCliente = CLIENTE_ROUTES.some((r) => pathname.startsWith(r))

  if (isAdmin && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (isCliente && session.user.role !== "CLIENTE") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url))
  }

  if (pathname === "/") {
    const dest = session.user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"
    return NextResponse.redirect(new URL(dest, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)"],
}
