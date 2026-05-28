import React, { useRef, useState, useCallback, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * DraggableScroll — Horizontal drag-to-scroll container for mobile tabs.
 * Supports both mouse drag and touch swipe with momentum.
 * Hides scrollbar and shows grab cursor on hover.
 * Optionally renders a custom styled dropdown on mobile when `mobileDropdown` is provided.
 */
interface DropdownOption {
  key: string;
  label: string;
}

interface DraggableScrollProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Extra class on the inner flex wrapper */
  innerClassName?: string;
  innerStyle?: React.CSSProperties;
  /** When provided, renders a custom dropdown on mobile instead of scrollable tabs */
  mobileDropdown?: {
    options: DropdownOption[];
    activeKey: string;
    onSelect: (key: string) => void;
  };
}

/** Custom styled dropdown that matches the site's Japanese-style design */
function StyledDropdown({
  options,
  activeKey,
  onSelect,
}: {
  options: DropdownOption[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on click / touch outside
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

  const activeLabel = options.find(o => o.key === activeKey)?.label ?? "";

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between cursor-pointer"
        style={{
          background: "#FFF",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: open ? "#111827" : "#E5E7EB",
          borderRadius: "8px",
          padding: "10px 14px",
          fontSize: "14px",
          fontWeight: 600,
          color: "#111827",
          outline: "none",
          fontFamily: "inherit",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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
          {options.map((opt) => {
            const isActive = opt.key === activeKey;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onSelect(opt.key);
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
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "#F5F6F9";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
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

export function DraggableScroll({
  children,
  className = "",
  style,
  innerClassName = "",
  innerStyle,
  mobileDropdown,
}: DraggableScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });
  const animFrameRef = useRef<number>(0);

  // Prevent click if user dragged
  const handleClickCapture = useCallback(
    (e: React.MouseEvent) => {
      if (dragState.current.moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    []
  );

  const startDrag = useCallback((pageX: number) => {
    const el = containerRef.current;
    if (!el) return;
    cancelAnimationFrame(animFrameRef.current);
    dragState.current = {
      isDown: true,
      startX: pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      moved: false,
      lastX: pageX,
      lastTime: Date.now(),
      velocity: 0,
    };
    setIsDragging(true);
  }, []);

  const moveDrag = useCallback((pageX: number) => {
    const el = containerRef.current;
    const ds = dragState.current;
    if (!ds.isDown || !el) return;

    const x = pageX - el.offsetLeft;
    const walk = (x - ds.startX) * 1.2; // drag speed multiplier
    el.scrollLeft = ds.scrollLeft - walk;

    // Track velocity for momentum
    const now = Date.now();
    const dt = now - ds.lastTime;
    if (dt > 0) {
      ds.velocity = (pageX - ds.lastX) / dt;
    }
    ds.lastX = pageX;
    ds.lastTime = now;

    if (Math.abs(walk) > 3) {
      ds.moved = true;
    }
  }, []);

  const endDrag = useCallback(() => {
    const el = containerRef.current;
    const ds = dragState.current;
    if (!ds.isDown) return;
    ds.isDown = false;
    setIsDragging(false);

    // Momentum scrolling
    if (el && Math.abs(ds.velocity) > 0.15) {
      let v = -ds.velocity * 180; // momentum factor
      const decel = 0.95;
      const tick = () => {
        if (Math.abs(v) < 0.5) return;
        el.scrollLeft += v;
        v *= decel;
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    }

    // Reset moved flag after a tick so click handler can catch it
    setTimeout(() => {
      ds.moved = false;
    }, 0);
  }, []);

  // Mouse events
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      startDrag(e.pageX);
    },
    [startDrag]
  );
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState.current.isDown) return;
      e.preventDefault();
      moveDrag(e.pageX);
    },
    [moveDrag]
  );
  const onMouseUp = useCallback(() => endDrag(), [endDrag]);
  const onMouseLeave = useCallback(() => {
    if (dragState.current.isDown) endDrag();
  }, [endDrag]);

  // Touch events — passive for better perf, but we need to prevent vertical scroll during horizontal drag
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let isHorizontal: boolean | null = null;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStartX = t.pageX;
      touchStartY = t.pageY;
      isHorizontal = null;
      startDrag(t.pageX);
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      // Determine direction on first move
      if (isHorizontal === null) {
        const dx = Math.abs(t.pageX - touchStartX);
        const dy = Math.abs(t.pageY - touchStartY);
        if (dx > 3 || dy > 3) {
          isHorizontal = dx > dy;
        }
      }
      if (isHorizontal) {
        e.preventDefault(); // prevent page scroll during horizontal swipe
        moveDrag(t.pageX);
      }
    };

    const onTouchEnd = () => {
      endDrag();
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [startDrag, moveDrag, endDrag]);

  return (
    <>
      {/* Mobile custom dropdown */}
      {mobileDropdown && (
        <div className={`md:hidden ${className}`} style={style}>
          <StyledDropdown
            options={mobileDropdown.options}
            activeKey={mobileDropdown.activeKey}
            onSelect={mobileDropdown.onSelect}
          />
        </div>
      )}

      {/* Desktop scrollable tabs (hidden on mobile when dropdown is active) */}
      <div
        ref={containerRef}
        className={`overflow-x-auto ${mobileDropdown ? "max-md:hidden " : ""}${className}`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: isDragging ? "none" : "auto",
          ...style,
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onClickCapture={handleClickCapture}
      >
        <div
          className={`max-md:py-2 ${innerClassName}`}
          style={{ minWidth: "max-content", ...innerStyle }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
