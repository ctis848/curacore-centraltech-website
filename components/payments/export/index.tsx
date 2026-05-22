import React from "react";
import { PaymentRow } from "@/app/admin/payments/page";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";

interface ExportBarProps {
  payments: PaymentRow[];
}

export default function ExportBar({ payments }: ExportBarProps) {
  function exportCSV() {
    const headers = [
      "ID",
      "UserID",
      "Email",
      "Reference",
      "Amount",
      "Currency",
      "Status",
      "Gateway",
      "Channel",
      "InvoiceID",
      "CreatedAt",
      "AdminNotes",
    ];

    const rows = payments.map((p) => [
      p.id,
      p.userid ?? "",
      p.email ?? "",
      p.reference ?? "",
      p.amount,
      p.currency ?? "",
      p.status ?? "",
      p.gateway ?? "",
      p.channel ?? "",
      p.invoice_id ?? "",
      p.created_at ?? "",
      p.admin_notes ?? "",
    ]);

    const csv =
      [headers.join(","), ...rows.map((r) =>
        r
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(
      payments.map((p) => ({
        ID: p.id,
        UserID: p.userid ?? "",
        Email: p.email ?? "",
        Reference: p.reference ?? "",
        Amount: p.amount,
        Currency: p.currency ?? "",
        Status: p.status ?? "",
        Gateway: p.gateway ?? "",
        Channel: p.channel ?? "",
        InvoiceID: p.invoice_id ?? "",
        CreatedAt: p.created_at ?? "",
        AdminNotes: p.admin_notes ?? "",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payments.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Payments", 14, 10);

    autoTable(doc, {
      head: [
        [
          "ID",
          "Email",
          "Reference",
          "Amount",
          "Status",
          "Gateway",
          "Channel",
          "Created",
        ],
      ],
      body: payments.map((p) => [
        p.id,
        p.email ?? "",
        p.reference ?? "",
        p.amount,
        p.status ?? "",
        p.gateway ?? "",
        p.channel ?? "",
        p.created_at ?? "",
      ]),
    });

    doc.save("payments.pdf");
  }

  async function exportZIP() {
    const zip = new JSZip();

    const jsonContent = JSON.stringify(payments, null, 2);
    zip.file("payments.json", jsonContent);

    const headers = [
      "ID",
      "UserID",
      "Email",
      "Reference",
      "Amount",
      "Currency",
      "Status",
      "Gateway",
      "Channel",
      "InvoiceID",
      "CreatedAt",
      "AdminNotes",
    ];

    const rows = payments.map((p) => [
      p.id,
      p.userid ?? "",
      p.email ?? "",
      p.reference ?? "",
      p.amount,
      p.currency ?? "",
      p.status ?? "",
      p.gateway ?? "",
      p.channel ?? "",
      p.invoice_id ?? "",
      p.created_at ?? "",
      p.admin_notes ?? "",
    ]);

    const csv =
      [headers.join(","), ...rows.map((r) =>
        r
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )].join("\n");

    zip.file("payments.csv", csv);

    const worksheet = XLSX.utils.json_to_sheet(
      payments.map((p) => ({
        ID: p.id,
        UserID: p.userid ?? "",
        Email: p.email ?? "",
        Reference: p.reference ?? "",
        Amount: p.amount,
        Currency: p.currency ?? "",
        Status: p.status ?? "",
        Gateway: p.gateway ?? "",
        Channel: p.channel ?? "",
        InvoiceID: p.invoice_id ?? "",
        CreatedAt: p.created_at ?? "",
        AdminNotes: p.admin_notes ?? "",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    const wbout = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    zip.file("payments.xlsx", wbout);

    const pdfDoc = new jsPDF();
    pdfDoc.text("Payments", 14, 10);
    autoTable(pdfDoc, {
      head: [
        [
          "ID",
          "Email",
          "Reference",
          "Amount",
          "Status",
          "Gateway",
          "Channel",
          "Created",
        ],
      ],
      body: payments.map((p) => [
        p.id,
        p.email ?? "",
        p.reference ?? "",
        p.amount,
        p.status ?? "",
        p.gateway ?? "",
        p.channel ?? "",
        p.created_at ?? "",
      ]),
    });
    const pdfBlob = pdfDoc.output("arraybuffer");
    zip.file("payments.pdf", pdfBlob);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments_export.zip";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-3 mb-4 items-center">
      <button
        onClick={exportCSV}
        className="px-4 py-2 bg-slate-700 text-white rounded"
      >
        Export CSV
      </button>
      <button
        onClick={exportExcel}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Export Excel
      </button>
      <button
        onClick={exportPDF}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Export PDF
      </button>
      <button
        onClick={exportZIP}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Export ZIP
      </button>
    </div>
  );
}
