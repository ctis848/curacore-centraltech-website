"use client";

import { useState, useMemo } from "react";
import { jsPDF } from "jspdf";

export interface DataTableColumn<T> {
  label: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  searchable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  exportable?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  searchable = true,
  sortable = true,
  paginated = true,
  exportable = true,
}: DataTableProps<T>) {
  const [search, setSearch] = useState<string>("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // SEARCH
  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  // SORT
  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a: any, b: any) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortAsc]);

  // PAGINATION
  const paginatedData = paginated
    ? sorted.slice((page - 1) * pageSize, page * pageSize)
    : sorted;

  // EXPORT CSV
  const exportCSV = () => {
    const csv = [
      columns.map((c) => c.label).join(","),
      ...sorted.map((row: any) =>
        columns.map((c) => JSON.stringify(row[c.key] || "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    a.click();
  };

  // EXPORT PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Exported Data", 10, 10);

    sorted.forEach((row: any, i: number) => {
      doc.text(JSON.stringify(row), 10, 20 + i * 10);
    });

    doc.save("export.pdf");
  };

  return (
    <div className="space-y-4">

      {/* SEARCH */}
      {searchable && (
        <input
          className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {/* EXPORT BUTTONS */}
      {exportable && (
        <div className="flex gap-3">
          <button onClick={exportCSV} className="px-3 py-1 bg-blue-600 text-white rounded">
            Export CSV
          </button>
          <button onClick={exportPDF} className="px-3 py-1 bg-red-600 text-white rounded">
            Export PDF
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="p-3 text-left cursor-pointer"
                  onClick={() => {
                    if (!sortable) return;
                    setSortField(col.key as string);
                    setSortAsc(sortField === col.key ? !sortAsc : true);
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((row: any, i: number) => (
              <tr
                key={i}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {columns.map((col, j) => (
                  <td key={j} className="p-3">
                    {col.render ? col.render(row) : (row[col.key] as any)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {paginated && (
        <div className="flex justify-between items-center pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>Page {page}</span>

          <button
            disabled={page * pageSize >= sorted.length}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
