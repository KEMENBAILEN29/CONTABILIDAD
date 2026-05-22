import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#0F172A" },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4, color: "#1E3A5F" },
  subtitle: { fontSize: 10, color: "#64748B", marginBottom: 20 },
  columns: { flexDirection: "row", gap: 24 },
  column: { flex: 1 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#1E3A5F", paddingBottom: 4, borderBottomWidth: 2, borderBottomColor: "#1E3A5F", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  label: { fontSize: 9, color: "#64748B", flex: 1 },
  value: { fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "right", minWidth: 70 },
  total: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 2, borderTopColor: "#1E3A5F", marginTop: 4 },
  totalLabel: { fontFamily: "Helvetica-Bold", fontSize: 11, color: "#1E3A5F" },
  totalValue: { fontFamily: "Helvetica-Bold", fontSize: 11, textAlign: "right", minWidth: 70, color: "#1E3A5F" },
  footer: { fontSize: 7, color: "#94A3B8", marginTop: 40 },
});

interface BalanceData {
  empresa: string;
  fecha: string;
  activo: Array<{ nombre: string; importe: number }>;
  pasivo: Array<{ nombre: string; importe: number }>;
  totalActivo: number;
  totalPasivo: number;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}

export function BalanceDocument({ data }: { data: BalanceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Balance de Situación</Text>
        <Text style={styles.subtitle}>{data.empresa} · A fecha: {data.fecha}</Text>

        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>ACTIVO</Text>
            {data.activo.map((item, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{item.nombre}</Text>
                <Text style={styles.value}>{fmt(item.importe)}</Text>
              </View>
            ))}
            <View style={styles.total}>
              <Text style={styles.totalLabel}>Total Activo</Text>
              <Text style={styles.totalValue}>{fmt(data.totalActivo)}</Text>
            </View>
          </View>

          <View style={styles.column}>
            <Text style={styles.sectionTitle}>PASIVO</Text>
            {data.pasivo.map((item, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{item.nombre}</Text>
                <Text style={styles.value}>{fmt(item.importe)}</Text>
              </View>
            ))}
            <View style={styles.total}>
              <Text style={styles.totalLabel}>Total Pasivo</Text>
              <Text style={styles.totalValue}>{fmt(data.totalPasivo)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>Generado el {new Date().toLocaleDateString("es-ES")} · GestorIA Contabilidad</Text>
      </Page>
    </Document>
  );
}
