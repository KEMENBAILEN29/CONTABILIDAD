# GestorIA Contabilidad

SaaS multi-tenant para gestorías: procesa facturas con OCR+IA (Claude API), genera informes PDF financieros por empresa cliente.

## Commands

- `pnpm dev` — Servidor de desarrollo en localhost:3000
- `pnpm build` — Build de producción
- `pnpm lint` — ESLint
- `pnpm test` — Vitest
- `npx prisma migrate dev` — Crear migración y aplicar
- `npx prisma generate` — Regenerar cliente Prisma
- `npx prisma db push` — Push rápido en desarrollo (no crea migración)
- `npx tsx prisma/seed.ts` — Seed admin inicial

## Tech Stack

Next.js 15 App Router + TypeScript strict + Tailwind CSS v4 + shadcn/ui + Supabase PostgreSQL + Prisma + NextAuth v5 (Credentials) + Claude API (visión) + @react-pdf/renderer + Vercel

## Architecture

### Directory Structure
- `src/app/(auth)/` — Solo página de login, sin sidebar
- `src/app/(admin)/` — Rutas protegidas role=ADMIN: gestión de clientes
- `src/app/(cliente)/` — Rutas protegidas role=CLIENTE: dashboard personal
- `src/app/api/` — API Routes: auth, facturas, admin, informes
- `src/components/` — Componentes por dominio: admin/, facturas/, dashboard/, proveedores/, informes/, shared/
- `src/lib/` — auth/ (NextAuth config), db/ (queries Prisma), ocr/ (Claude API), storage/ (Supabase), pdf/ (react-pdf)
- `src/types/` — Tipos compartidos + extensiones NextAuth
- `prisma/` — schema.prisma + migraciones + seed

### Data Flow
Server Components leen DB directamente via Prisma (no pasan por API).
Mutations usan Server Actions o POST a API Routes.
Subida de archivos: Client Component → POST /api/facturas/upload → Supabase Storage + crea Factura → lanza OCR async → polling estado cada 3s.
Informes PDF: GET /api/informes/{tipo} → Prisma query → react-pdf render → buffer → response.

### Key Patterns
- Sesión JWT incluye: `{ id, nombre, role, empresaId?, cif? }`
- En Server Components: `const session = await auth()` para obtener sesión
- Todos los queries de facturas/proveedores filtran SIEMPRE por `empresaId` de la sesión (CLIENTE) o del param (ADMIN)
- Nunca exponer `passwordHash` en respuestas de API
- Todos los importes en DB son `Decimal` — usar `Number(decimal)` solo para display, nunca para cálculos

## Code Organization Rules

1. **Server Components por defecto.** Solo añadir `"use client"` cuando haya interactividad.
2. **Un componente por archivo. Máx 300 líneas.**
3. **Path alias `@/` para `src/`.**
4. **Todos los queries DB pasan por `lib/db/*.ts`.**
5. **Validar con Zod** en todos los inputs de API Routes.

## Design System

### Colors
- Primary: `#1E3A5F` (sidebar, marca)
- Primary Light: `#2563EB` (botones CTA)
- Background: `#F8FAFC`
- Surface: `#FFFFFF` (cards)
- Text: `#0F172A`
- Muted: `#64748B`
- Border: `#E2E8F0`
- Income (verde): `#16A34A`
- Expense (rojo): `#DC2626`
- Warning (ámbar): `#D97706`

## Environment Variables

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL (Transaction mode para Prisma) |
| `DIRECT_URL` | Supabase PostgreSQL (Session mode, para migraciones) |
| `NEXTAUTH_SECRET` | Secret JWT para NextAuth |
| `NEXTAUTH_URL` | URL base de la app |
| `ANTHROPIC_API_KEY` | Clave API Anthropic para OCR |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | Service role key de Supabase (para Storage server-side) |

## Reglas No Negociables

1. **Nunca TypeScript `any`.** Strict mode activado.
2. **Todos los queries filtran por empresaId de sesión** — nunca confiar en `empresaId` del cliente sin verificarlo.
3. **Los importes financieros nunca se calculan con `float`.** Usar `Decimal` de Prisma en DB.
4. **Verificar sesión y rol en CADA API Route.**
5. **No commitear `.env.local`.**
