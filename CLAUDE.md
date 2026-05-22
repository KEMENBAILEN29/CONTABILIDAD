# GestorIA Contabilidad

SaaS multi-tenant para gestorías: procesa facturas con OCR+IA (Claude API), genera informes PDF financieros por empresa cliente.

## Commands

- `pnpm dev` — Servidor de desarrollo en localhost:3000
- `pnpm build` — Build de producción
- `pnpm lint` — ESLint
- `pnpm test` — Vitest
- `npx prisma migrate dev` — Crear migración y aplicar
- `npx prisma generate` — Regenerar cliente Prisma
- `npx prisma db push` — Push rápido en desarrollo
- `npx tsx prisma/seed.ts` — Seed admin inicial

## Tech Stack

Next.js 15/16 App Router + TypeScript strict + Tailwind CSS v4 + shadcn/ui + Supabase PostgreSQL + Prisma + NextAuth v5 (Credentials) + Claude API (visión) + @react-pdf/renderer + Vercel

## Architecture

### Auth
Session JWT: `{ id, nombre, role: "ADMIN"|"CLIENTE", empresaId?, cif? }`
- ADMIN: login con email+password → rutas /admin/*
- CLIENTE: login con CIF+password → rutas /dashboard, /facturas, /proveedores, /informes

### Key Rules
1. TypeScript strict — cero `any`
2. Todos los queries filtran por `empresaId` de sesión
3. Importes financieros solo en Decimal (DB), nunca float para cálculos
4. Verificar sesión y rol en cada API Route
5. bcrypt cost mínimo 12
6. Nunca exponer passwordHash en respuestas

## Environment Variables

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL (Transaction mode) |
| `DIRECT_URL` | Supabase PostgreSQL (Session mode) |
| `NEXTAUTH_SECRET` | Secret JWT para NextAuth |
| `NEXTAUTH_URL` | URL base de la app |
| `ANTHROPIC_API_KEY` | Clave API Anthropic para OCR |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | Service role key de Supabase |
