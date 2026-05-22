import { Document, Page, Text, View } from "@react-pdf/renderer"
import { pdfStyles, formatEuro, formatDateES } from "./shared"
import type { FacturaRow } from "@/types"

interface PYGProps {
  empresa: { cif: string; nombre: string }
  desde: Date
  hasta: Date
  facturas: FacturaRow[]
}

export function PYGDocument({ empresa, desde, hasta, facturas }: PYGProps) {
  const ingresos = facturas.filter((f) => f.tipo === "INGRESO" || f.tipo === "AMBAS")
  const gastos = facturas.filter((f) => f.tipo === "GASTO" || f.tipo === "AMBAS")

  const totalIngresos = ingresos.reduce((s, f) => s + Number(f.total ?? 0), 0)
  const totalGastos = gastos.reduce((s, f) => s + Number(f.total ?? 0), 0)
  const resultado = totalIngresos - totalGastos

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Cuenta de Pérdidas y Ganancias</Text>
          <Text style={pdfStyles.subtitle}>
            {empresa.nombre} ({empresa.cif}) — {formatDateES(desde)} a {formatDateES(hasta)}
          </Text>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>INGRESOS</Text>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.col1}>Nº Factura</Text>
            <Text style={pdfStyles.col2}>Fecha</Text>
            <Text style={pdfStyles.col1}>Emisor</Text>
            <Text style={pdfStyles.col3}>Importe</Text>
          </View>
          {ingresos.map((f, i) => (
            <View key={f.id} style={i % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}>
              <Text style={pdfStyles.col1}>{f.numeroFactura ?? "—"}</Text>
              <Text style={pdfStyles.col2}>{formatDateES(f.fechaFactura)}</Text>
              <Text style={pdfStyles.col1}>{f.emisorNombre ?? "—"}</Text>
              <Text style={[pdfStyles.col3, pdfStyles.income]}>{formatEuro(Number(f.total))}</Text>
            </View>
          ))}
          <View style={pdfStyles.totalRow}>
            <Text style={{ width: "75%" }}>Total Ingresos</Text>
            <Text style={[{ width: "25%", textAlign: "right" }, pdfStyles.income]}>
              {formatEuro(totalIngresos)}
            </Text>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>GASTOS</Text>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.col1}>Nº Factura</Text>
            <Text style={pdfStyles.col2}>Fecha</Text>
            <Text style={pdfStyles.col1}>Proveedor</Text>
            <Text style={pdfStyles.col3}>Importe</Text>
          </View>
          {gastos.map((f, i) => (
            <View key={f.id} style={i % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}>
              <Text style={pdfStyles.col1}>{f.numeroFactura ?? "—"}</Text>
              <Text style={pdfStyles.col2}>{formatDateES(f.fechaFactura)}</Text>
              <Text style={pdfStyles.col1}>{f.emisorNombre ?? "—"}</Text>
              <Text style={[pdfStyles.col3, pdfStyles.expense]}>{formatEuro(Number(f.total))}</Text>
            </View>
          ))}
          <View style={pdfStyles.totalRow}>
            <Text style={{ width: "75%" }}>Total Gastos</Text>
            <Text style={[{ width: "25%", textAlign: "right" }, pdfStyles.expense]}>
              {formatEuro(totalGastos)}
            </Text>
          </View>
        </View>

        <View style={[pdfStyles.section, { backgroundColor: "#1E3A5F", padding: 12, borderRadius: 6 }]}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ width: "75%", color: "#FFFFFF", fontFamily: "Helvetica-Bold", fontSize: 13 }}>
              RESULTADO DEL EJERCICIO
            </Text>
            <Text
              style={{
                width: "25%",
                textAlign: "right",
                color: resultado >= 0 ? "#4ADE80" : "#F87171",
                fontFamily: "Helvetica-Bold",
                fontSize: 13,
              }}
            >
              {formatEuro(resultado)}
            </Text>
          </View>
        </View>

        <Text style={pdfStyles.footer}>
          Generado por GestorIA Contabilidad — {new Date().toLocaleDateString("es-ES")}
        </Text>
      </Page>
    </Document>
  )
}
