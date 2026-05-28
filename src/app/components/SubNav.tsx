interface SubNavTab {
  key: string;
  label: string;
  count?: number;
  countColor?: string;
}

interface SubNavProps {
  tabs: SubNavTab[];
  active: string;
  onChange: (key: string) => void;
}

export function SubNav({ tabs, active, onChange }: SubNavProps) {
  return (
    <div className="p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
              style={{
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                background: isActive ? "#111827" : "transparent",
                color: isActive ? "#FFF" : "#6B7280",
                boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
              }}
            >
              {tab.label}
              {tab.count != null && (
                <span
                  className="px-1.5 py-0.5 rounded-full tabular-nums"
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    background: isActive ? "rgba(255,255,255,0.2)" : "#E5E7EB",
                    color: isActive ? "#FFF" : "#374151",
                    lineHeight: 1,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}