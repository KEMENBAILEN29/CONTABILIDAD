import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@gestoria.com"
  const password = process.env.ADMIN_PASSWORD ?? "Admin1234!"
  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      nombre: "Administrador Gestoría",
      role: "ADMIN",
    },
  })

  console.log(`Admin creado: ${admin.email}`)

  // Empresa de demostración
  const empresaPassword = await bcrypt.hash("Empresa1234!", 12)
  const empresa = await db.empresa.upsert({
    where: { cif: "B12345678" },
    update: {},
    create: {
      cif: "B12345678",
      nombre: "Empresa Demo SL",
      email: "demo@empresademo.com",
      passwordHash: empresaPassword,
    },
  })

  console.log(`Empresa demo creada: ${empresa.cif} - ${empresa.nombre}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
