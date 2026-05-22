import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 9, color: "#0F172A" },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4, color: "#1E3A5F" },
  subtitle: { fontSize: 9, color: "#64748B", marginBottom: 16 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1E3A5F", paddingVertical: 6, paddingHorizontal: 4 },
  headerCell: { color: "#FFFFFF", fontFamily: "Helvetica-Bold", fontSize: 8 },
  row: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  altRow: { backgroundColor: "#F8FAFC" },
  cell: { fontSize: 8, color: "#0F172A" },
  footer: { marginTop: 16, borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  footerLabel: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  footerValue: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  positive: { color: "#16A34A" },
  negative: { color: "#DC2626" },
});

interface FacturaItem {
  fecha: string;
  numero: string;
  emisor: string;
  concepto: string;
  base: number;
  iva: number;
  total: number;
  tipo: string;
}

interface GastosIngresosData {
  empresa: string;
  desde: string;
  hasta: string;
  items: FacturaItem[];
  totalIngresos: number;
  totalGastos: number;
}

function fmt(n: number): string {
  return n.toFixed(2) + " €";
}

const COL_WIDTHS = { fecha: 50, numero: 60, emisor: 90, concepto: 100, base: 55, iva: 35, total: 60, tipo: 35 };

export function GastosIngresosDocument({ data }: { data: GastosIngresosData }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>Libro de Gastos e Ingresos</Text>
        <Text style={styles.subtitle}>{data.empresa} · {data.desde} — {data.hasta}</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { width: COL_WIDTHS.fecha }]}>Fecha</Text>
          <Text style={[styles.headerCell, { width: COL_WIDTHS.numero }]}>Nº Factura</Text>
          <Text style={[styles.headerCell, { width: COL_WIDTHS.emisor }]}>Emisor</Text>
          <Text style={[styles.headerCell, { width: COL_WIDTHS.concepto }]}>Concepto</Text>
          <Text style={[styles.headerCell, { width: COL_WIDTHS.base }]}>Base</Text>
          <Text style={[styles.headerCell, { width: COL_WIDTHS.iva }]}>IVA%</Text>
          <Text style={[styles.headerCell, { width: COL_WIDTHS.total }]}>Total</Text>
          <Text style={[styles.headerCell, { width: COL_WIDTHS.tipo }]}>Tipo</Text>
        </View>

        {data.items.map((item, i) => (
          <View key={i} style={[styles.row, i % 2 === 1 ? styles.altRow : {}]}>
            <Text style={[styles.cell, { width: COL_WIDTHS.fecha }]}>{item.fecha}</Text>
            <Text style={[styles.cell, { width: COL_WIDTHS.numero }]}>{item.numero}</Text>
            <Text style={[styles.cell, { width: COL_WIDTHS.emisor }]}>{item.emisor.substring(0, 18)}</Text>
            <Text style={[styles.cell, { width: COL_WIDTHS.concepto }]}>{item.concepto.substring(0, 22)}</Text>
            <Text style={[styles.cell, { width: COL_WIDTHS.base, textAlign: "right" }]}>{fmt(item.base)}</Text>
            <Text style={[styles.cell, { width: COL_WIDTHS.iva, textAlign: "right" }]}>{item.iva}%</Text>
            <Text style={[styles.cell, { width: COL_WIDTHS.total, textAlign: "right", fontFamily: "Helvetica-Bold" }, item.tipo === "INGRESO" ? styles.positive : styles.negative]}>
              {fmt(item.total)}
            </Text>
            <Text style={[styles.cell, { width: COL_WIDTHS.tipo }]}>{item.tipo}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <View><Text style={styles.footerLabel}>Total Ingresos</Text><Text style={[styles.footerValue, styles.positive]}>{fmt(data.totalIngresos)}</Text></View>
          <View><Text style={styles.footerLabel}>Total Gastos</Text><Text style={[styles.footerValue, styles.negative]}>{fmt(data.totalGastos)}</Text></View>
          <View><Text style={styles.footerLabel}>Resultado</Text><Text style={[styles.footerValue, (data.totalIngresos - data.totalGastos) >= 0 ? styles.positive : styles.negative]}>{fmt(data.totalIngresos - data.totalGastos)}</Text></View>
          <Text style={{ fontSize: 7, color: "#94A3B8", alignSelf: "flex-end" }}>GestorIA Contabilidad · {new Date().toLocaleDateString("es-ES")}</Text>
        </View>
      </Page>
    </Document>
  );
}
