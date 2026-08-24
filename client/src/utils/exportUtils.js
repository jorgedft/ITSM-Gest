import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToExcel(data, columns, fileName) {
  if (!data || data.length === 0) {
    alert("No hay datos para exportar");
    return;
  }
  const rows = data.map((row) =>
    Object.fromEntries(columns.map((col) => [col.header, col.accessor(row) ?? ""]))
  );
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  ws["!cols"] = columns.map((col) => ({ wch: Math.max(col.header.length + 2, 16) }));
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const date = new Date().toISOString().split("T")[0];
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `${fileName}_${date}.xlsx`);
}

export function exportToPDF(data, columns, fileName, title) {
  if (!data || data.length === 0) {
    alert("No hay datos para exportar");
    return;
  }
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "letter" });
  doc.setFontSize(18);
  doc.setTextColor(14, 165, 233);
  doc.text("ITSM - Gestion TI", 14, 16);
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(title, 14, 24);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generado: ${new Date().toLocaleString("es-MX")} | Total: ${data.length} registros`,
    14,
    30
  );
  autoTable(doc, {
    startY: 35,
    head: [columns.map((c) => c.header)],
    body: data.map((row) =>
      columns.map((col) => {
        const val = col.accessor(row);
        return val !== null && val !== undefined ? String(val) : "—";
      })
    ),
    styles: { fontSize: 7.5, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [240, 249, 255] },
    margin: { left: 14, right: 14 },
  });
  const date = new Date().toISOString().split("T")[0];
  doc.save(`${fileName}_${date}.pdf`);
}