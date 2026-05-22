import { db } from "./client";
import bcrypt from "bcryptjs";
import type { EmpresaRow } from "@/types";

export async function listEmpresas(): Promise<EmpresaRow[]> {
  return db.empresa.findMany({
    orderBy: { nombre: "asc" },
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
  });
}

export async function getEmpresaByCif(cif: string): Promise<EmpresaRow | null> {
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
  });
}

export async function getEmpresaById(id: string): Promise<EmpresaRow | null> {
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
  });
}

export async function createEmpresa(data: {
  cif: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  password: string;
}): Promise<EmpresaRow> {
  const passwordHash = await bcrypt.hash(data.password, 12);
  return db.empresa.create({
    data: {
      cif: data.cif.toUpperCase(),
      nombre: data.nombre,
      email: data.email ?? null,
      telefono: data.telefono ?? null,
      direccion: data.direccion ?? null,
      passwordHash,
    },
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
  });
}

export async function updateEmpresa(
  id: string,
  data: {
    nombre?: string;
    email?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    password?: string;
  }
): Promise<EmpresaRow> {
  const updateData: Record<string, unknown> = {
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono,
    direccion: data.direccion,
  };
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 12);
  }
  return db.empresa.update({
    where: { id },
    data: updateData,
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
  });
}

export async function toggleEmpresaActivo(id: string, activo: boolean): Promise<void> {
  await db.empresa.update({ where: { id }, data: { activo } });
}
