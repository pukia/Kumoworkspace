import React, { useState } from "react";
import {
  LayoutDashboard, Receipt, Clock, Megaphone, CheckSquare,
  Package, FolderKanban, Users, SlidersHorizontal, Check,
  Info, ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type PermLevel = 0 | 1 | 2 | 3 | 4;

type RoleId =
  | "c_suite" | "vp" | "manager" | "supervisor"
  | "senior"  | "staff" | "probation" | "external";

type ModuleId =
  | "dashboard" | "finance"  | "attendance" | "announcements"
  | "tasks"     | "assets"   | "projects"   | "hr" | "settings_mod";

// ─── Permission levels ────────────────────────────────────────────────────────
const PERM_CFG = [
  { label: "無",     short: "無",    desc: "無任何存取",               bg: "#F3F4F6", color: "#9CA3AF", border: "#E5E7EB" },
  { label: "個人",   short: "個人",  desc: "僅限自己的資料",           bg: "#DBEAFE", color: "#1D4ED8", border: "#BFDBFE" },
  { label: "部門",   short: "部門",  desc: "可查看同部門資料",         bg: "#FEF3C7", color: "#B45309", border: "#FDE68A" },
  { label: "全覽",   short: "全覽",  desc: "可查看全公司資料（唯讀）", bg: "#DCFCE7", color: "#15803D", border: "#BBF7D0" },
  { label: "管理",   short: "管理",  desc: "完整管理（讀取＋寫入＋刪除）", bg: "#111827", color: "#FFFFFF", border: "#111827" },
] as const;

// ─── Role definitions ─────────────────────────────────────────────────────────
interface RoleDef {
  id: RoleId;
  level: number;
  title: string;
  subtitle: string;
  responsibility: string;
  members: number;
  bg: string;
  text: string;
  abbr: string;
}

const ROLES: RoleDef[] = [
  {
    id: "c_suite", level: 1,
    title: "最高管理者", subtitle: "CEO / COO / CFO / 董事長",
    responsibility: "公司最高決策層，擁有全系統最高權限，可存取所有資料及設定。",
    members: 3, bg: "#111827", text: "#FFFFFF", abbr: "C層",
  },
  {
    id: "vp", level: 2,
    title: "高階主管", subtitle: "副總裁 / 總監 / 執行長",
    responsibility: "負責各事業部門策略規劃與跨部門管理，可查看全公司報表。",
    members: 8, bg: "#1F2937", text: "#FFFFFF", abbr: "VP",
  },
  {
    id: "manager", level: 3,
    title: "中階主管", subtitle: "部門經理 / 部長 / 處長",
    responsibility: "帶領部門達成目標，負責部門預算、人員與專案管理。",
    members: 15, bg: "#374151", text: "#FFFFFF", abbr: "經理",
  },
  {
    id: "supervisor", level: 4,
    title: "基層主管", subtitle: "組長 / 課長 / 主任",
    responsibility: "直接管理第一線員工，協調日常業務與任務分配。",
    members: 28, bg: "#4B5563", text: "#FFFFFF", abbr: "組長",
  },
  {
    id: "senior", level: 5,
    title: "資深員工", subtitle: "資深工程師 / 資深顧問 / 資深專員",
    responsibility: "具備深厚專業能力，可跨部門協作，負責指導初階員工。",
    members: 45, bg: "#6B7280", text: "#FFFFFF", abbr: "資深",
  },
  {
    id: "staff", level: 6,
    title: "一般員工", subtitle: "正職員工 / 工程師 / 業務 / 專員",
    responsibility: "執行日常業務工作，存取自身相關資料及所屬專案。",
    members: 120, bg: "#9CA3AF", text: "#FFFFFF", abbr: "員工",
  },
  {
    id: "probation", level: 7,
    title: "試用員工", subtitle: "試用期人員（90 天適用期）",
    responsibility: "新進試用階段，權限最小化，正式到職後自動升級為一般員工。",
    members: 12, bg: "#D1D5DB", text: "#374151", abbr: "試用",
  },
  {
    id: "external", level: 8,
    title: "外部人員", subtitle: "外包廠商 / 約聘人員 / 顧問 / 合作夥伴",
    responsibility: "非正式員工，依合約授予最低限度必要權限，到期自動撤銷。",
    members: 20, bg: "#E5E7EB", text: "#6B7280", abbr: "外部",
  },
];

// ─── Module definitions ───────────────────────────────────────────────────────
interface ModuleDef {
  id: ModuleId;
  label: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const MODULES: ModuleDef[] = [
  { id: "dashboard",     label: "總覽儀表板", Icon: LayoutDashboard   },
  { id: "finance",       label: "財務管理",   Icon: Receipt           },
  { id: "attendance",    label: "出缺勤管理", Icon: Clock             },
  { id: "announcements", label: "最新公告",   Icon: Megaphone         },
  { id: "tasks",         label: "工作事項",   Icon: CheckSquare       },
  { id: "assets",        label: "資產管理",   Icon: Package           },
  { id: "projects",      label: "專案管理",   Icon: FolderKanban      },
  { id: "hr",            label: "人事管理",   Icon: Users             },
  { id: "settings_mod",  label: "系統設定",   Icon: SlidersHorizontal },
];

// ─── Default permission matrix ────────────────────────────────────────────────
type Matrix = Record<RoleId, Record<ModuleId, PermLevel>>;

const DEFAULT_MATRIX: Matrix = {
  c_suite:    { dashboard: 4, finance: 4, attendance: 4, announcements: 4, tasks: 4, assets: 4, projects: 4, hr: 4, settings_mod: 4 },
  vp:         { dashboard: 3, finance: 3, attendance: 4, announcements: 4, tasks: 3, assets: 3, projects: 4, hr: 3, settings_mod: 2 },
  manager:    { dashboard: 3, finance: 2, attendance: 3, announcements: 4, tasks: 3, assets: 2, projects: 3, hr: 2, settings_mod: 1 },
  supervisor: { dashboard: 2, finance: 1, attendance: 2, announcements: 4, tasks: 2, assets: 2, projects: 3, hr: 1, settings_mod: 0 },
  senior:     { dashboard: 2, finance: 1, attendance: 2, announcements: 3, tasks: 2, assets: 1, projects: 3, hr: 0, settings_mod: 0 },
  staff:      { dashboard: 1, finance: 1, attendance: 1, announcements: 3, tasks: 2, assets: 1, projects: 2, hr: 0, settings_mod: 0 },
  probation:  { dashboard: 1, finance: 0, attendance: 1, announcements: 2, tasks: 1, assets: 0, projects: 1, hr: 0, settings_mod: 0 },
  external:   { dashboard: 0, finance: 0, attendance: 0, announcements: 1, tasks: 1, assets: 0, projects: 1, hr: 0, settings_mod: 0 },
};

// ─── Permission Badge ─────────────────────────────────────────────────────────
function PermBadge({
  level, onClick, title,
}: { level: PermLevel; onClick?: () => void; title?: string }) {
  const cfg = PERM_CFG[level];
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "3px 9px", borderRadius: 20,
        background: cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontSize: "11px", fontWeight: 700,
        cursor: onClick ? "pointer" : "default",
        minWidth: 46, whiteSpace: "nowrap",
        transition: "opacity 0.1s",
        fontFamily: "inherit",
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
      onMouseLeave={e => { if (onClick) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
    >
      {cfg.short}
    </button>
  );
}

// ─── Role Detail Card ─────────────────────────────────────────────────────────
function RoleDetailCard({ role, matrix }: { role: RoleDef; matrix: Matrix }) {
  const totalPerm = Object.values(matrix[role.id]).reduce((a, b) => a + b, 0);
  const maxPerm   = MODULES.length * 4;
  const pct = Math.round((totalPerm / maxPerm) * 100);

  return (
    <div style={{
       background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 8,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "16px 20px",
    }}>
      {/* Role header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: role.bg }}>
          <span style={{ color: role.text, fontSize: "14px", fontWeight: 700 }}>
            {role.level}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{role.title}</span>
            <span className="px-2 py-0.5 rounded"
              style={{ fontSize: "11px", fontWeight: 600, background: "#F3F4F6", color: "#6B7280" }}>
              {role.members} 人
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: 2 }}>{role.subtitle}</p>
        </div>
      </div>

      {/* Responsibility */}
      <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>
        {role.responsibility}
      </p>

      {/* Permission coverage bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>整體權限覆蓋率</span>
          <span className="tabular-nums" style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{pct}%</span>
        </div>
        <div className="w-full rounded-full" style={{ height: 6, background: "#F3F4F6" }}>
          <div className="rounded-full h-full transition-all duration-500"
            style={{ width: `${pct}%`, background: role.bg }} />
        </div>
      </div>

      {/* Permission list */}
      <div className="space-y-1.5">
        {MODULES.map(mod => {
          const perm = matrix[role.id][mod.id];
          const ModIcon = mod.Icon;
          return (
            <div key={mod.id} className="flex items-center gap-2">
              <ModIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#9CA3AF" }} />
              <span className="flex-1" style={{ fontSize: "13px", color: "#374151" }}>{mod.label}</span>
              <PermBadge level={perm} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function HierarchySection() {
  const [matrix, setMatrix]           = useState<Matrix>(DEFAULT_MATRIX);
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);
  const [saved, setSaved]             = useState(false);

  const totalMembers = ROLES.reduce((s, r) => s + r.members, 0);
  const selectedRoleDef = selectedRole ? ROLES.find(r => r.id === selectedRole) ?? null : null;

  const cycle = (modId: ModuleId, roleId: RoleId) =>
    setMatrix(prev => ({
      ...prev,
      [roleId]: { ...prev[roleId], [modId]: ((prev[roleId][modId] + 1) % 5) as PermLevel },
    }));

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
        <h2 style={{ color: "#111827" }}>員工階級制度</h2>
        <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: 3 }}>
          定義公司組織架構及各職級對系統功能模組的存取權限
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "職級總數",   value: `${ROLES.length} 級`,    sub: "共 8 個階層" },
          { label: "模組總數",   value: `${MODULES.length} 個模組`, sub: "涵蓋全系統功能" },
          { label: "人員總數",   value: `${totalMembers} 人`,    sub: "含外部人員" },
        ].map(k => (
          <div key={k.label} style={{
             background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 8,
            padding: "12px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <p className="tabular-nums" style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>{k.value}</p>
            <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: 2 }}>{k.label}</p>
            <p style={{ fontSize: "12px", color: "#D1D5DB", marginTop: 1 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Pyramid ──────────────────────────────────────────────────────────── */}
      <div>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: 10 }}>
          組織階層架構
        </p>

        {/* Top label */}
        <div className="text-center mb-1">
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>▲ 最高層</span>
        </div>

        {ROLES.map((role, idx) => {
          const indent  = (ROLES.length - 1 - idx) * 13;
          const isActive = selectedRole === role.id;
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRole(isActive ? null : role.id)}
              style={{
                marginLeft:  indent,
                marginRight: indent,
                background:  role.bg,
                color:       role.text,
                padding:     "10px 18px",
                borderRadius:
                  idx === 0                  ? "8px 8px 0 0"
                  : idx === ROLES.length - 1 ? "0 0 8px 8px"
                  : 0,
                borderBottomWidth: idx < ROLES.length - 1 ? "1px" : 0,
                borderBottomStyle: "solid",
                borderBottomColor: "rgba(255,255,255,0.08)",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 14,
                boxShadow: isActive ? `inset 0 0 0 2px rgba(255,255,255,0.5)` : "none",
                transition: "filter 0.12s, box-shadow 0.12s",
                filter: isActive ? "brightness(1.1)" : "none",
              }}
            >
              {/* Level badge */}
              <span style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700, flexShrink: 0, color: role.text,
              }}>
                {role.level}
              </span>

              <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "15px", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {role.title}
                </span>
                <span style={{ fontSize: "13px", opacity: 0.65, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {role.subtitle}
                </span>
              </div>

              <span style={{ fontSize: "13px", opacity: 0.6, whiteSpace: "nowrap", flexShrink: 0 }}>
                {role.members} 人
              </span>

              {isActive && (
                <span style={{ fontSize: "11px", opacity: 0.8, flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  <ChevronRight className="w-3.5 h-3.5" />
                  檢視詳情
                </span>
              )}
            </div>
          );
        })}

        {/* Bottom label */}
        <div className="text-center mt-1">
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>▼ 基層 / 外部</span>
        </div>
      </div>

      {/* ── Selected role detail ─────────────────────────────────────────────── */}
      {selectedRoleDef && (
        <div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: 10 }}>
            職級詳情 —{" "}
            <span style={{ color: "#111827" }}>{selectedRoleDef.title}</span>
          </p>
          <RoleDetailCard role={selectedRoleDef} matrix={matrix} />
        </div>
      )}

      {/* ── Permission Matrix ──────────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
            資訊存取權限矩陣
          </p>
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            點擊格子循環切換權限等級
          </p>
        </div>

        <div style={{
          overflowX: "auto",
          background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
          borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <table style={{ borderCollapse: "collapse", minWidth: 840, width: "100%" }}>
            <colgroup>
              <col style={{ width: 155 }} />
              {ROLES.map(r => <col key={r.id} style={{ width: 90 }} />)}
            </colgroup>

            {/* ── Header ── */}
            <thead>
              <tr style={{ borderBottomWidth: "2px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
                {/* Module col header */}
                <th style={{
                  padding: "12px 16px", textAlign: "left",
                  fontSize: "13px", fontWeight: 600, color: "#6B7280",
                  background: "#F9FAFB",
                  position: "sticky", left: 0, zIndex: 3,
                  borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "#E5E7EB",
                }}>
                  功能模組
                </th>

                {/* Role col headers */}
                {ROLES.map(role => {
                  const isCol = selectedRole === role.id;
                  return (
                    <th
                      key={role.id}
                      onClick={() => setSelectedRole(isCol ? null : role.id)}
                      style={{
                        padding: "10px 6px", textAlign: "center",
                        cursor: "pointer", borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "#F3F4F6",
                        background: isCol ? role.bg : "#F9FAFB",
                        transition: "background 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <span style={{
                          width: 30, height: 30, borderRadius: "50%",
                          background: isCol ? "rgba(255,255,255,0.18)" : role.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "12px", fontWeight: 700, color: role.text,
                        }}>
                          {role.level}
                        </span>
                        <span style={{
                          fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap",
                          color: isCol ? role.text : "#374151",
                        }}>
                          {role.abbr}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* ── Body ── */}
            <tbody>
              {MODULES.map((mod, mi) => {
                const ModIcon = mod.Icon;
                return (
                  <tr
                    key={mod.id}
                    style={{ borderBottomWidth: mi < MODULES.length - 1 ? "1px" : 0, borderBottomStyle: "solid", borderBottomColor: "#F9FAFB" }}
                  >
                    {/* Sticky module label */}
                    <td style={{
                      padding: "9px 16px",
                      background: "#FFF",
                      position: "sticky", left: 0, zIndex: 1,
                      borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "#E5E7EB",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ModIcon className="w-3.5 h-3.5" style={{ color: "#9CA3AF", flexShrink: 0 }} />
                        <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500, whiteSpace: "nowrap" }}>
                          {mod.label}
                        </span>
                      </div>
                    </td>

                    {/* Permission cells */}
                    {ROLES.map(role => {
                      const perm  = matrix[role.id][mod.id];
                      const isCol = selectedRole === role.id;
                      return (
                        <td
                          key={role.id}
                          style={{
                            padding: "8px 6px", textAlign: "center",
                            borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "#F9FAFB",
                            background: isCol ? `${role.bg}18` : "transparent",
                            transition: "background 0.15s",
                          }}
                        >
                          <PermBadge
                            level={perm}
                            title={`${role.title} ／ ${mod.label}：${PERM_CFG[perm].desc}（點擊切換）`}
                            onClick={() => cycle(mod.id, role.id)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Legend ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 8,
        padding: "14px 18px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Info className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>權限等級說明</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
          {PERM_CFG.map((cfg, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                padding: "2px 10px", borderRadius: 20,
                background: cfg.bg, color: cfg.color,
                border: `1px solid ${cfg.border}`,
                fontSize: "11px", fontWeight: 700,
              }}>
                {cfg.short}
              </span>
              <span style={{ fontSize: "13px", color: "#374151" }}>{cfg.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tip ── */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg"
        style={{ background: "#FFFBEB", borderWidth: "1px", borderStyle: "solid", borderColor: "#FDE68A" }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#B45309" }} />
        <p style={{ fontSize: "12px", color: "#92400E", lineHeight: 1.7 }}>
          權限矩陣的變更將立即影響對應職級的所有員工。建議更改前先通知相關人員，並確認符合公司資安政策。
          儲存後變更將永久生效並記入稽核日誌。
        </p>
      </div>

      {/* ── Save ── */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={save}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 24px", borderRadius: 8,
            background: saved ? "#16A34A" : "#111827",
            color: "#FFF", fontSize: "13px", fontWeight: 600,
            border: "none", cursor: "pointer", transition: "background 0.2s",
            fontFamily: "inherit",
          }}
        >
          {saved && <Check style={{ width: 16, height: 16 }} />}
          {saved ? "已儲存設定" : "儲存設定"}
        </button>
      </div>
    </div>
  );
}