import { Document, Page, Text, View } from "@react-pdf/renderer"
import { pdfStyles, formatEuro, formatDateES } from "./shared"
import type { FacturaRow } from "@/types"

interface IVATrimestralProps {
  empresa: { cif: string; nombre: string }
  anio: number
  facturas: FacturaRow[]
}

interface DatosTrimestre {
  baseIngresos: number
  ivaRepercutido: number
  baseGastos: number
  ivaSoportado: number
  diferencia: number
}

function calcTrimestre(facturas: FacturaRow[], trimestre: number): DatosTrimestre {
  const tf = facturas.filter((f) => f.trimestre === trimestre)
  const ingresos = tf.filter((f) => f.tipo === "INGRESO" || f.tipo === "AMBAS")
  const gastos = tf.filter((f) => f.tipo === "GASTO" || f.tipo === "AMBAS")

  const baseIngresos = ingresos.reduce((s, f) => s + Number(f.baseImponible ?? 0), 0)
  const ivaRepercutido = ingresos.reduce((s, f) => s + Number(f.ivaImporte ?? 0), 0)
  const baseGastos = gastos.reduce((s, f) => s + Number(f.baseImponible ?? 0), 0)
  const ivaSoportado = gastos.reduce((s, f) => s + Number(f.ivaImporte ?? 0), 0)

  return {
    baseIngresos,
    ivaRepercutido,
    baseGastos,
    ivaSoportado,
    diferencia: ivaRepercutido - ivaSoportado,
  }
}

export function IVATrimestralDocument({ empresa, anio, facturas }: IVATrimestralProps) {
  const trimestres = [1, 2, 3, 4].map((t) => ({ t, data: calcTrimestre(facturas, t) }))

  const totales = trimestres.reduce(
    (acc, { data }) => ({
      baseIngresos: acc.baseIngresos + data.baseIngresos,
      ivaRepercutido: acc.ivaRepercutido + data.ivaRepercutido,
      baseGastos: acc.baseGastos + data.baseGastos,
      ivaSoportado: acc.ivaSoportado + data.ivaSoportado,
      diferencia: acc.diferencia + data.diferencia,
    }),
    { baseIngresos: 0, ivaRepercutido: 0, baseGastos: 0, ivaSoportado: 0, diferencia: 0 }
  )

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Resumen Trimestral IVA — {anio}</Text>
          <Text style={pdfStyles.subtitle}>
            {empresa.nombre} ({empresa.cif})
          </Text>
        </View>

        <View style={pdfStyles.tableHeader}>
          <Text style={{ width: "12%" }}>Trimestre</Text>
          <Text style={{ width: "18%", textAlign: "right" }}>Base Ingresos</Text>
          <Text style={{ width: "18%", textAlign: "right" }}>IVA Repercutido</Text>
          <Text style={{ width: "18%", textAlign: "right" }}>Base Gastos</Text>
          <Text style={{ width: "18%", textAlign: "right" }}>IVA Soportado</Text>
          <Text style={{ width: "16%", textAlign: "right" }}>Resultado</Text>
        </View>

        {trimestres.map(({ t, data }, i) => (
          <View key={t} style={i % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}>
            <Text style={{ width: "12%" }}>T{t}</Text>
            <Text style={{ width: "18%", textAlign: "right" }}>{formatEuro(data.baseIngresos)}</Text>
            <Text style={[{ width: "18%", textAlign: "right" }, pdfStyles.income]}>
              {formatEuro(data.ivaRepercutido)}
            </Text>
            <Text style={{ width: "18%", textAlign: "right" }}>{formatEuro(data.baseGastos)}</Text>
            <Text style={[{ width: "18%", textAlign: "right" }, pdfStyles.expense]}>
              {formatEuro(data.ivaSoportado)}
            </Text>
            <Text
              style={{
                width: "16%",
                textAlign: "right",
                color: data.diferencia >= 0 ? "#16A34A" : "#DC2626",
                fontFamily: "Helvetica-Bold",
              }}
            >
              {formatEuro(data.diferencia)}
            </Text>
          </View>
        ))}

        <View style={pdfStyles.totalRow}>
          <Text style={{ width: "12%" }}>TOTAL</Text>
          <Text style={{ width: "18%", textAlign: "right" }}>{formatEuro(totales.baseIngresos)}</Text>
          <Text style={[{ width: "18%", textAlign: "right" }, pdfStyles.income]}>
            {formatEuro(totales.ivaRepercutido)}
          </Text>
          <Text style={{ width: "18%", textAlign: "right" }}>{formatEuro(totales.baseGastos)}</Text>
          <Text style={[{ width: "18%", textAlign: "right" }, pdfStyles.expense]}>
            {formatEuro(totales.ivaSoportado)}
          </Text>
          <Text
            style={{
              width: "16%",
              textAlign: "right",
              color: totales.diferencia >= 0 ? "#16A34A" : "#DC2626",
            }}
          >
            {formatEuro(totales.diferencia)}
          </Text>
        </View>

        <Text style={pdfStyles.footer}>
          Generado por GestorIA Contabilidad — {new Date().toLocaleDateString("es-ES")}
        </Text>
      </Page>
    </Document>
  )
}
