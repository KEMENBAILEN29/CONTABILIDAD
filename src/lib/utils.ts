import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "—"
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return "—"
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(num)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

export function calcTrimestre(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date
  return Math.ceil((d.getMonth() + 1) / 3)
}

export function calcAnio(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date
  return d.getFullYear()
}

export function formatCIF(cif: string | null | undefined): string {
  if (!cif) return "—"
  return cif.toUpperCase()
}

export function getMesNombre(mes: number): string {
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  return meses[mes - 1] ?? String(mes)
}
