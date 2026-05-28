/**
 * CSV Export Utility
 * Generates a UTF-8 BOM CSV and triggers a browser download.
 */

export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

export function exportCSV<T>(
  filename: string,
  columns: CsvColumn<T>[],
  data: T[],
) {
  const BOM = "\uFEFF";
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const header = columns.map(c => escape(c.header)).join(",");
  const rows = data.map(row =>
    columns.map(c => escape(c.accessor(row))).join(","),
  );
  const csv = BOM + [header, ...rows].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Format amount to NT$ string */
export function ntd(n: number): string {
  return `NT$ ${n.toLocaleString()}`;
}
