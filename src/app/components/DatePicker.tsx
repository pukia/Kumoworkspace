import { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function startDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function todayStr() {
  return fmt(new Date());
}

interface DatePickerProps {
  value: string;            // "YYYY-MM-DD"
  onChange: (v: string) => void;
  placeholder?: string;
  formField?: boolean;
  minDate?: string;         // "YYYY-MM-DD" – dates before this are disabled
}

export function DatePicker({ value, onChange, placeholder = "選擇日期", formField = true, minDate }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Calendar view state – default to minDate month when no value is set
  const fallback = minDate ? new Date(minDate) : new Date();
  const parsed = value ? new Date(value) : fallback;
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    } else if (minDate) {
      const d = new Date(minDate);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value, minDate]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const goToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onChange(fmt(now));
    setOpen(false);
  };

  const days = daysInMonth(viewYear, viewMonth);
  const start = startDay(viewYear, viewMonth);
  const today = todayStr();

  const displayLabel = value
    ? `${new Date(value).getFullYear()} 年 ${new Date(value).getMonth() + 1} 月 ${new Date(value).getDate()} 日`
    : placeholder;

  return (
    <div ref={ref} className="relative" style={{ width: "100%" }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between cursor-pointer"
        style={{
          background: formField ? "#F9FAFB" : "#FFF",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: open ? "#111827" : "#E5E7EB",
          borderRadius: formField ? "6px" : "8px",
          padding: formField ? "8px 12px" : "8px 14px",
          fontSize: formField ? "15px" : "14px",
          fontWeight: formField ? 400 : 600,
          color: value ? "#111827" : "#9CA3AF",
          outline: "none",
          fontFamily: "inherit",
          boxShadow: formField ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
          transition: "border-color 0.15s",
        }}
      >
        <span className="truncate">{displayLabel}</span>
        <CalendarDays
          className="w-4 h-4 flex-shrink-0 ml-2"
          style={{ color: "#6B7280" }}
        />
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div
          className="absolute z-50"
          style={{
            top: "calc(100% + 6px)",
            left: 0,
            width: 296,
            background: "#FFF",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "#E5E7EB",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
            padding: "14px",
            fontFamily: "inherit",
          }}
        >
          {/* Header: month/year nav */}
          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <button
              type="button"
              onClick={prevMonth}
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: "transparent",
                borderWidth: 0,
                color: "#374151",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827", letterSpacing: "0.01em" }}>
              {viewYear} 年 {MONTHS[viewMonth]}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 28, height: 28, borderRadius: 6,
                background: "transparent",
                borderWidth: 0,
                color: "#374151",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7" style={{ marginBottom: 4 }}>
            {WEEKDAYS.map(w => (
              <div
                key={w}
                className="flex items-center justify-center"
                style={{ height: 28, fontSize: "11px", fontWeight: 600, color: "#9CA3AF" }}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: start }).map((_, i) => (
              <div key={`e-${i}`} style={{ height: 34 }} />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const d = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const isSelected = dateStr === value;
              const isToday = dateStr === today;
              const isDisabled = minDate && new Date(dateStr) < new Date(minDate);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    if (!isDisabled) {
                      onChange(dateStr);
                      setOpen(false);
                    }
                  }}
                  className="flex items-center justify-center cursor-pointer"
                  style={{
                    height: 34,
                    width: "100%",
                    borderRadius: 8,
                    fontSize: "13px",
                    fontWeight: isSelected ? 700 : isToday ? 600 : 400,
                    color: isSelected ? "#FFF" : isToday ? "#111827" : "#374151",
                    background: isSelected ? "#111827" : "transparent",
                    borderWidth: isToday && !isSelected ? "1px" : 0,
                    borderStyle: "solid",
                    borderColor: isToday && !isSelected ? "#D1D5DB" : "transparent",
                    transition: "all 0.12s",
                    fontFamily: "inherit",
                    opacity: isDisabled ? 0.5 : 1,
                    pointerEvents: isDisabled ? "none" : "auto",
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = "#F3F4F6";
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between"
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "#F3F4F6",
            }}
          >
            <button
              type="button"
              onClick={goToday}
              className="cursor-pointer"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#6B7280",
                background: "transparent",
                borderWidth: 0,
                padding: "4px 8px",
                borderRadius: 6,
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#111827"; e.currentTarget.style.background = "#F3F4F6"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#6B7280"; e.currentTarget.style.background = "transparent"; }}
            >
              今天
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="cursor-pointer"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#EF4444",
                  background: "transparent",
                  borderWidth: 0,
                  padding: "4px 8px",
                  borderRadius: 6,
                  transition: "all 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                清除
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}