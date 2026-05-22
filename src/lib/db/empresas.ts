import { db } from "./client"
import bcrypt from "bcryptjs"

export async function listEmpresas() {
  return db.empresa.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      cif: true,
      nombre: true,
      email: true,
      telefono: true,
      direccion: true,
      activo: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { facturas: true } },
    },
  })
}

export async function getEmpresaByCif(cif: string) {
  return db.empresa.findUnique({
    where: { cif: cif.toUpperCase() },
    select: {
      id: true,
      cif: true,
      nombre: true,
      email: true,
      telefono: true,
      direccion: true,
      activo: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getEmpresaById(id: string) {
  return db.empresa.findUnique({
    where: { id },
    select: {
      id: true,
      cif: true,
      nombre: true,
      email: true,
      telefono: true,
      direccion: true,
      activo: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function createEmpresa(data: {
  cif: string
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
  password: string
}) {
  const passwordHash = await bcrypt.hash(data.password, 12)
  return db.empresa.create({
    data: {
      cif: data.cif.toUpperCase(),
      nombre: data.nombre,
      email: data.email ?? null,
      telefono: data.telefono ?? null,
      direccion: data.direccion ?? null,
      passwordHash,
    },
  })
}

export async function updateEmpresa(
  cif: string,
  data: { nombre?: string; email?: string; telefono?: string; direccion?: string; password?: string }
) {
  const updates: Record<string, unknown> = {
    nombre: data.nombre,
    email: data.email ?? null,
    telefono: data.telefono ?? null,
    direccion: data.direccion ?? null,
  }
  if (data.password) {
    updates.passwordHash = await bcrypt.hash(data.password, 12)
  }
  return db.empresa.update({ where: { cif: cif.toUpperCase() }, data: updates })
}

export async function toggleEmpresaActivo(cif: string, activo: boolean) {
  return db.empresa.update({ where: { cif: cif.toUpperCase() }, data: { activo } })
}
