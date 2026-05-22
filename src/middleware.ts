import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login"];
const ADMIN_ROUTES = ["/admin"];
const CLIENTE_ROUTES = ["/dashboard", "/facturas", "/proveedores", "/informes"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isCliente = CLIENTE_ROUTES.some((r) => pathname.startsWith(r));

  if (isPublic) {
    if (session) {
      const role = session.user?.role;
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      if (role === "CLIENTE") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.user?.role;

  if (isAdmin && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isCliente && role !== "CLIENTE") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/") {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (role === "CLIENTE") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
