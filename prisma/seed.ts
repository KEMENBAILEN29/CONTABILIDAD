import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@gestoria.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const adminNombre = process.env.ADMIN_NOMBRE ?? "Administrador Gestoría";

  const existing = await db.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`Admin already exists: ${adminEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await db.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      nombre: adminNombre,
      role: "ADMIN",
    },
  });

  console.log(`Created admin user: ${admin.email}`);

  // Create a demo empresa
  const demoPassword = await bcrypt.hash("demo1234", 12);
  const empresa = await db.empresa.create({
    data: {
      cif: "B12345678",
      nombre: "Empresa Demo S.L.",
      email: "demo@empresa.com",
      telefono: "912345678",
      direccion: "Calle Mayor 1, Madrid",
      passwordHash: demoPassword,
      activo: true,
    },
  });

  console.log(`Created demo empresa: ${empresa.cif} - ${empresa.nombre}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
