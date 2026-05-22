import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#0F172A" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4, color: "#1E3A5F" },
  subtitle: { fontSize: 10, color: "#64748B", marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#1E3A5F", marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  label: { flex: 1, color: "#64748B" },
  value: { textAlign: "right", minWidth: 80, fontFamily: "Helvetica-Bold" },
  total: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, marginTop: 4, borderTopWidth: 2, borderTopColor: "#1E3A5F" },
  totalLabel: { fontSize: 12, fontWeight: "bold", color: "#1E3A5F" },
  totalValue: { fontSize: 12, fontWeight: "bold", textAlign: "right", minWidth: 80, color: "#1E3A5F" },
  positive: { color: "#16A34A" },
  negative: { color: "#DC2626" },
});

interface PYGData {
  empresa: string;
  desde: string;
  hasta: string;
  ingresos: Array<{ concepto: string; importe: number }>;
  gastos: Array<{ concepto: string; importe: number }>;
  totalIngresos: number;
  totalGastos: number;
  resultado: number;
}

function formatEUR(n: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

export function PYGDocument({ data }: { data: PYGData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Cuenta de Pérdidas y Ganancias</Text>
        <Text style={styles.subtitle}>{data.empresa} · Período: {data.desde} — {data.hasta}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INGRESOS</Text>
          {data.ingresos.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>{item.concepto || "Ingreso"}</Text>
              <Text style={[styles.value, styles.positive]}>{formatEUR(item.importe)}</Text>
            </View>
          ))}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total ingresos</Text>
            <Text style={[styles.totalValue, styles.positive]}>{formatEUR(data.totalIngresos)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GASTOS</Text>
          {data.gastos.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>{item.concepto || "Gasto"}</Text>
              <Text style={[styles.value, styles.negative]}>{formatEUR(item.importe)}</Text>
            </View>
          ))}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total gastos</Text>
            <Text style={[styles.totalValue, styles.negative]}>{formatEUR(data.totalGastos)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESULTADO DEL EJERCICIO</Text>
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Resultado</Text>
            <Text style={[styles.totalValue, data.resultado >= 0 ? styles.positive : styles.negative]}>
              {formatEUR(data.resultado)}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 8, color: "#94A3B8", marginTop: 40 }}>
          Generado el {new Date().toLocaleDateString("es-ES")} · GestorIA Contabilidad
        </Text>
      </Page>
    </Document>
  );
}
