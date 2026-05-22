import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#0F172A" },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4, color: "#1E3A5F" },
  subtitle: { fontSize: 10, color: "#64748B", marginBottom: 20 },
  table: { marginBottom: 20 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1E3A5F", paddingVertical: 8, paddingHorizontal: 8 },
  headerCell: { color: "#FFFFFF", fontFamily: "Helvetica-Bold", fontSize: 9 },
  row: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  altRow: { backgroundColor: "#F8FAFC" },
  cell: { fontSize: 9 },
  positive: { color: "#16A34A" },
  negative: { color: "#DC2626" },
  footer: { fontSize: 7, color: "#94A3B8", marginTop: 40 },
});

interface TrimestreData {
  trimestre: string;
  baseRepercutida: number;
  ivaRepercutido: number;
  baseSoportada: number;
  ivaSoportado: number;
  diferencia: number;
}

interface IVATrimestralData {
  empresa: string;
  año: number;
  trimestres: TrimestreData[];
  totalRepercutido: number;
  totalSoportado: number;
  totalDiferencia: number;
}

function fmt(n: number): string {
  return n.toFixed(2) + " €";
}

const COL: Record<string, number> = { trim: 60, baseRep: 80, ivaRep: 70, baseSop: 80, ivaSop: 70, dif: 70 };

export function IVATrimestralDocument({ data }: { data: IVATrimestralData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Resumen IVA Trimestral {data.año}</Text>
        <Text style={styles.subtitle}>{data.empresa}</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { width: COL.trim }]}>Trimestre</Text>
            <Text style={[styles.headerCell, { width: COL.baseRep }]}>Base Repercutida</Text>
            <Text style={[styles.headerCell, { width: COL.ivaRep }]}>IVA Repercutido</Text>
            <Text style={[styles.headerCell, { width: COL.baseSop }]}>Base Soportada</Text>
            <Text style={[styles.headerCell, { width: COL.ivaSop }]}>IVA Soportado</Text>
            <Text style={[styles.headerCell, { width: COL.dif }]}>A ingresar/dev.</Text>
          </View>
          {data.trimestres.map((t, i) => (
            <View key={i} style={[styles.row, i % 2 === 1 ? styles.altRow : {}]}>
              <Text style={[styles.cell, { width: COL.trim, fontFamily: "Helvetica-Bold" }]}>{t.trimestre}</Text>
              <Text style={[styles.cell, { width: COL.baseRep, textAlign: "right" }]}>{fmt(t.baseRepercutida)}</Text>
              <Text style={[styles.cell, { width: COL.ivaRep, textAlign: "right" }, styles.positive]}>{fmt(t.ivaRepercutido)}</Text>
              <Text style={[styles.cell, { width: COL.baseSop, textAlign: "right" }]}>{fmt(t.baseSoportada)}</Text>
              <Text style={[styles.cell, { width: COL.ivaSop, textAlign: "right" }, styles.negative]}>{fmt(t.ivaSoportado)}</Text>
              <Text style={[styles.cell, { width: COL.dif, textAlign: "right", fontFamily: "Helvetica-Bold" }, t.diferencia >= 0 ? styles.positive : styles.negative]}>
                {fmt(t.diferencia)}
              </Text>
            </View>
          ))}
          <View style={[styles.row, { backgroundColor: "#1E3A5F" }]}>
            <Text style={[styles.headerCell, { width: COL.trim }]}>TOTAL</Text>
            <Text style={[styles.headerCell, { width: COL.baseRep + COL.ivaRep, textAlign: "right" }]}>{fmt(data.totalRepercutido)}</Text>
            <Text style={[styles.headerCell, { width: COL.baseSop + COL.ivaSop, textAlign: "right" }]}>{fmt(data.totalSoportado)}</Text>
            <Text style={[styles.headerCell, { width: COL.dif, textAlign: "right" }]}>{fmt(data.totalDiferencia)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>Generado el {new Date().toLocaleDateString("es-ES")} · GestorIA Contabilidad</Text>
      </Page>
    </Document>
  );
}
