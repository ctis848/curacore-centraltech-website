export function exportToCSV(filename: string, rows: any[]) {
  if (!rows.length) return;

  const header = Object.keys(rows[0]).join(",");
  const body = rows.map((row) =>
    Object.values(row)
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [header, ...body].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
