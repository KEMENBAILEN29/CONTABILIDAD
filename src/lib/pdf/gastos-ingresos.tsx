import { Document, Page, Text, View } from "@react-pdf/renderer"
import { pdfStyles, formatEuro, formatDateES } from "./shared"
import type { FacturaRow } from "@/types"

interface GastosIngresosProps {
  empresa: { cif: string; nombre: string }
  desde: Date
  hasta: Date
  facturas: FacturaRow[]
}

export function GastosIngresosDocument({ empresa, desde, hasta, facturas }: GastosIngresosProps) {
  const sorted = [...facturas].sort((a, b) => {
    if (!a.fechaFactura) return 1
    if (!b.fechaFactura) return -1
    return a.fechaFactura > b.fechaFactura ? 1 : -1
  })

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} orientation="landscape">
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Libro de Gastos e Ingresos</Text>
          <Text style={pdfStyles.subtitle}>
            {empresa.nombre} ({empresa.cif}) — {formatDateES(desde)} a {formatDateES(hasta)}
          </Text>
        </View>

        <View style={pdfStyles.tableHeader}>
          <Text style={{ width: "10%" }}>Fecha</Text>
          <Text style={{ width: "12%" }}>Nº Factura</Text>
          <Text style={{ width: "20%" }}>Emisor</Text>
          <Text style={{ width: "20%" }}>Receptor</Text>
          <Text style={{ width: "12%", textAlign: "right" }}>Base</Text>
          <Text style={{ width: "8%", textAlign: "right" }}>IVA%</Text>
          <Text style={{ width: "10%", textAlign: "right" }}>IVA</Text>
          <Text style={{ width: "8%", textAlign: "right" }}>Total</Text>
          <Text style={{ width: "10%", textAlign: "center" }}>Tipo</Text>
        </View>

        {sorted.map((f, i) => (
          <View key={f.id} style={i % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}>
            <Text style={{ width: "10%" }}>{formatDateES(f.fechaFactura)}</Text>
            <Text style={{ width: "12%" }}>{f.numeroFactura ?? "—"}</Text>
            <Text style={{ width: "20%" }}>{f.emisorNombre ?? "—"}</Text>
            <Text style={{ width: "20%" }}>{f.receptorNombre ?? "—"}</Text>
            <Text style={{ width: "12%", textAlign: "right" }}>{formatEuro(Number(f.baseImponible))}</Text>
            <Text style={{ width: "8%", textAlign: "right" }}>{f.ivaPorcentaje ? `${f.ivaPorcentaje}%` : "—"}</Text>
            <Text style={{ width: "10%", textAlign: "right" }}>{formatEuro(Number(f.ivaImporte))}</Text>
            <Text
              style={{
                width: "8%",
                textAlign: "right",
                color: f.tipo === "INGRESO" ? "#16A34A" : "#DC2626",
              }}
            >
              {formatEuro(Number(f.total))}
            </Text>
            <Text
              style={{
                width: "10%",
                textAlign: "center",
                color: f.tipo === "INGRESO" ? "#16A34A" : f.tipo === "GASTO" ? "#DC2626" : "#D97706",
              }}
            >
              {f.tipo ?? "—"}
            </Text>
          </View>
        ))}

        <Text style={pdfStyles.footer}>
          Generado por GestorIA Contabilidad — {new Date().toLocaleDateString("es-ES")}
        </Text>
      </Page>
    </Document>
  )
}
