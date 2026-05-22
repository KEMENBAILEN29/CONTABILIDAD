import { Document, Page, Text, View } from "@react-pdf/renderer"
import { pdfStyles, formatEuro, formatDateES } from "./shared"
import type { FacturaRow } from "@/types"

interface BalanceProps {
  empresa: { cif: string; nombre: string }
  hasta: Date
  facturas: FacturaRow[]
}

export function BalanceDocument({ empresa, hasta, facturas }: BalanceProps) {
  const ingresos = facturas.filter((f) => f.tipo === "INGRESO" || f.tipo === "AMBAS")
  const gastos = facturas.filter((f) => f.tipo === "GASTO" || f.tipo === "AMBAS")

  const totalDeudores = ingresos.reduce((s, f) => s + Number(f.total ?? 0), 0)
  const totalAcreedores = gastos.reduce((s, f) => s + Number(f.total ?? 0), 0)
  const patrimonioNeto = totalDeudores - totalAcreedores

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>Balance de Situación</Text>
          <Text style={pdfStyles.subtitle}>
            {empresa.nombre} ({empresa.cif}) — A fecha {formatDateES(hasta)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 16 }}>
          {/* ACTIVO */}
          <View style={{ flex: 1 }}>
            <Text style={pdfStyles.sectionTitle}>ACTIVO</Text>
            <View style={pdfStyles.tableHeader}>
              <Text style={{ flex: 1 }}>Concepto</Text>
              <Text style={{ width: "35%", textAlign: "right" }}>Importe</Text>
            </View>
            {ingresos.map((f, i) => (
              <View key={f.id} style={i % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}>
                <Text style={{ flex: 1 }}>{f.emisorNombre ?? f.concepto ?? "—"}</Text>
                <Text style={[{ width: "35%", textAlign: "right" }, pdfStyles.income]}>
                  {formatEuro(Number(f.total))}
                </Text>
              </View>
            ))}
            <View style={pdfStyles.totalRow}>
              <Text style={{ flex: 1 }}>Total Activo</Text>
              <Text style={[{ width: "35%", textAlign: "right" }, pdfStyles.income]}>
                {formatEuro(totalDeudores)}
              </Text>
            </View>
          </View>

          {/* PASIVO */}
          <View style={{ flex: 1 }}>
            <Text style={pdfStyles.sectionTitle}>PASIVO</Text>
            <View style={pdfStyles.tableHeader}>
              <Text style={{ flex: 1 }}>Concepto</Text>
              <Text style={{ width: "35%", textAlign: "right" }}>Importe</Text>
            </View>
            {gastos.map((f, i) => (
              <View key={f.id} style={i % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}>
                <Text style={{ flex: 1 }}>{f.emisorNombre ?? f.concepto ?? "—"}</Text>
                <Text style={[{ width: "35%", textAlign: "right" }, pdfStyles.expense]}>
                  {formatEuro(Number(f.total))}
                </Text>
              </View>
            ))}
            <View style={pdfStyles.totalRow}>
              <Text style={{ flex: 1 }}>Total Pasivo</Text>
              <Text style={[{ width: "35%", textAlign: "right" }, pdfStyles.expense]}>
                {formatEuro(totalAcreedores)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[pdfStyles.section, { marginTop: 16, backgroundColor: "#1E3A5F", padding: 12, borderRadius: 6 }]}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ flex: 1, color: "#FFFFFF", fontFamily: "Helvetica-Bold", fontSize: 13 }}>
              PATRIMONIO NETO
            </Text>
            <Text
              style={{
                width: "30%",
                textAlign: "right",
                color: patrimonioNeto >= 0 ? "#4ADE80" : "#F87171",
                fontFamily: "Helvetica-Bold",
                fontSize: 13,
              }}
            >
              {formatEuro(patrimonioNeto)}
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
