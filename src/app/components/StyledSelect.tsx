import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  key: string;
  label: string;
}

interface StyledSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** If provided, shows as first "all" option */
  allLabel?: string;
  /** Extra className on the wrapper */
  className?: string;
  /** If true, uses compact form-field style (thinner padding, lighter bg) */
  formField?: boolean;
  /** Placeholder text when no value is selected */
  placeholder?: string;
}

export function StyledSelect({
  value,
  onChange,
  options,
  allLabel,
  className = "",
  formField = false,
  placeholder,
}: StyledSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: Event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  const allOptions: SelectOption[] = allLabel
    ? [{ key: "all", label: allLabel }, ...options]
    : options;

  const activeLabel =
    allOptions.find((o) => o.key === value)?.label ??
    placeholder ??
    allLabel ??
    "";

  const hasValue = allOptions.some((o) => o.key === value);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
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
          color: hasValue ? "#111827" : "#9CA3AF",
          outline: "none",
          fontFamily: "inherit",
          boxShadow: formField ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
          transition: "border-color 0.15s",
        }}
      >
        <span className="truncate">{activeLabel}</span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 ml-2"
          style={{
            color: "#6B7280",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden"
          style={{
            background: "#FFF",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "#E5E7EB",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            maxHeight: "260px",
            overflowY: "auto",
          }}
        >
          {allOptions.map((opt) => {
            const isActive = opt.key === value;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 cursor-pointer"
                style={{
                  fontSize: "14px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#FFF" : "#374151",
                  background: isActive ? "#111827" : "transparent",
                  fontFamily: "inherit",
                  border: "none",
                  outline: "none",
                  textAlign: "left",
                  transition: "background 0.1s, color 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      "#F5F6F9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }
                }}
              >
                <span className="truncate">{opt.label}</span>
                {isActive && (
                  <Check
                    className="w-3.5 h-3.5 flex-shrink-0 ml-2"
                    style={{ color: "#FFF" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
