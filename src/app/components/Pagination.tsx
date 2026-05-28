import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ total, page, pageSize, onChange, className = "" }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1 && total <= pageSize) return null;

  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);

  // Build page number array with ellipsis
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return pages;
  };

  const btnBase: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 32, height: 32, borderRadius: 6,
    fontSize: "15px", fontWeight: 500, cursor: "pointer",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
    fontFamily: "inherit",
    transition: "background 0.1s, color 0.1s",
  };

  return (
    <div
      className={`flex items-center justify-between flex-wrap gap-3 px-4 py-3 ${className}`}
      style={{ borderColor: "transparent", borderTopColor: "#F3F4F6", borderTopWidth: "1px", borderTopStyle: "solid" }}
    >
      {/* Info */}
      <p style={{ fontSize: "14px", color: "#9CA3AF", flexShrink: 0 }}>
        顯示 <strong style={{ color: "#374151" }}>{start}–{end}</strong> 筆，共{" "}
        <strong style={{ color: "#374151" }}>{total}</strong> 筆
      </p>

      {/* Pages */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          style={{
            ...btnBase,
            background: page === 1 ? "#F9FAFB" : "#FFF",
            color: page === 1 ? "#D1D5DB" : "#374151",
            cursor: page === 1 ? "not-allowed" : "pointer",
          }}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {getPages().map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              style={{ minWidth: 32, textAlign: "center", fontSize: "15px", color: "#9CA3AF" }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              style={{
                ...btnBase,
                background: page === p ? "#111827" : "#FFF",
                color: page === p ? "#FFFFFF" : "#374151",
                borderColor: page === p ? "#111827" : "#E5E7EB",
              }}
              onMouseEnter={(e) => {
                if (page !== p) {
                  (e.currentTarget as HTMLElement).style.background = "#F3F4F6";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== p) {
                  (e.currentTarget as HTMLElement).style.background = "#FFF";
                }
              }}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          style={{
            ...btnBase,
            background: page === totalPages ? "#F9FAFB" : "#FFF",
            color: page === totalPages ? "#D1D5DB" : "#374151",
            cursor: page === totalPages ? "not-allowed" : "pointer",
          }}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}