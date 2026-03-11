"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToPDF(filename: string, rows: any[]) {
  if (!rows || rows.length === 0) return;

  const doc = new jsPDF();

  const headers = [Object.keys(rows[0])];
  const data = rows.map((row) => Object.values(row));

  autoTable(doc, {
    head: headers as any,
    body: data as any,
  });

  doc.save(filename);
}
