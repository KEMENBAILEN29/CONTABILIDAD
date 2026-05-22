import { z } from "zod";

// ISO date string validated and constrained to sane year range
export const ISODateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)")
  .refine((s) => {
    const d = new Date(s);
    return !isNaN(d.getTime()) && d.getFullYear() >= 2000 && d.getFullYear() <= 2099;
  }, "Fecha fuera de rango permitido (2000–2099)");

export const InformeQuerySchema = z.object({
  desde: ISODateString,
  hasta: ISODateString,
}).refine((d) => new Date(d.desde) <= new Date(d.hasta), "La fecha de inicio debe ser anterior a la fecha fin");
