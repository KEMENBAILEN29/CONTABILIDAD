export type Role = "ADMIN" | "CLIENTE"

export type TipoFactura = "INGRESO" | "GASTO" | "AMBAS"

export type EstadoFactura = "PROCESANDO" | "PROCESADA" | "ERROR"

export interface SessionUser {
  id: string
  name: string
  email?: string
  role: Role
  cif?: string
  empresaId?: string
}

export interface EmpresaRow {
  id: string
  cif: string
  nombre: string
  email: string | null
  telefono: string | null
  direccion: string | null
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FacturaRow {
  id: string
  empresaId: string
  archivoUrl: string
  archivoNombre: string
  tipo: TipoFactura | null
  estado: EstadoFactura
  errorMensaje: string | null
  numeroFactura: string | null
  fechaFactura: Date | null
  emisorCif: string | null
  emisorNombre: string | null
  receptorCif: string | null
  receptorNombre: string | null
  baseImponible: string | null
  ivaPorcentaje: string | null
  ivaImporte: string | null
  total: string | null
  concepto: string | null
  trimestre: number | null
  anio: number | null
  subidoPorAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

export interface LineaFacturaRow {
  id: string
  facturaId: string
  descripcion: string
  cantidad: string
  precioUnitario: string
  ivaPorcentaje: string
  subtotal: string
  createdAt: Date
}

export interface FacturaConLineas extends FacturaRow {
  lineas: LineaFacturaRow[]
}

export interface ProveedorRow {
  id: string
  empresaId: string
  cif: string
  nombre: string
  email: string | null
  telefono: string | null
  totalFacturas: number
  totalImporte: string
  createdAt: Date
  updatedAt: Date
}

export interface OCRResult {
  numero_factura: string | null
  fecha_factura: string | null
  emisor_cif: string | null
  emisor_nombre: string | null
  receptor_cif: string | null
  receptor_nombre: string | null
  base_imponible: number | null
  iva_porcentaje: number | null
  iva_importe: number | null
  total: number | null
  concepto: string | null
  lineas: OCRLinea[]
}

export interface OCRLinea {
  descripcion: string
  cantidad: number
  precio_unitario: number
  iva_porcentaje: number
  subtotal: number
}

export interface ResumenDashboard {
  totalIngresos: number
  totalGastos: number
  balance: number
  facturasPendientes: number
}

export interface DatosMensuales {
  mes: string
  ingresos: number
  gastos: number
}

export interface FiltrosFactura {
  tipo?: TipoFactura
  estado?: EstadoFactura
  desde?: string
  hasta?: string
}
