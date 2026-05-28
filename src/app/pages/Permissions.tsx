import React, { useState, useMemo } from "react";
import {
  Search, ChevronDown, X, Check, AlertTriangle, ShieldCheck,
  Shield, Users, Copy, Download, Clock,
  BarChart3, ArrowRight, Sparkles, ArrowUpDown, Plus, Pencil, Trash2, Palette,
} from "lucide-react";
import { Pagination } from "../components/Pagination";
import { SubNav } from "../components/SubNav";
import { StyledSelect } from "../components/StyledSelect";
import {
  type Employee, type PermAction, type ModulePermission,
  DEPTS, PERM_MODULES, PERM_ACTIONS, ROLE_PRESETS,
  EMPLOYEES, DEPT_BG, DEPT_COLOR,
  countPermissions, getPermLevel, matchesPreset,
  fullPerms, noPerms,
} from "../data/employees";
import { exportCSV } from "../components/ExportCSV";

const PAGE_SIZE = 10;

// ─── Audit Log mock ──────────────────────────────────────────────────────────
interface AuditEntry {
  id: number;
  timestamp: string;
  operator: string;
  target: string;
  action: string;
  detail: string;
}

const AUDIT_LOG: AuditEntry[] = [
  { id: 1, timestamp: "2026-03-13 09:15", operator: "系統管理者", target: "王大明", action: "套用預設", detail: "套用「一般員工」權限範本" },
  { id: 2, timestamp: "2026-03-13 08:42", operator: "系統管理者", target: "陳志豪", action: "套用預設", detail: "套用「部門主管」權限範本" },
  { id: 3, timestamp: "2026-03-12 17:30", operator: "方怡君",     target: "張雅婷", action: "個別修改", detail: "啟用「專案管理」模組的刪除權限" },
  { id: 4, timestamp: "2026-03-12 16:10", operator: "系統管理者", target: "許雅琪", action: "複製權限", detail: "從蘇冠宇複製權限設定" },
  { id: 5, timestamp: "2026-03-12 14:22", operator: "系統管理者", target: "周承翰", action: "套用預設", detail: "套用「僅檢視」權限範本" },
  { id: 6, timestamp: "2026-03-11 11:05", operator: "何家豪",     target: "楊宗翰", action: "個別修改", detail: "停用「系統設定」模組的所有權限" },
  { id: 7, timestamp: "2026-03-11 09:30", operator: "系統管理者", target: "全體 — 行銷部", action: "批量修改", detail: "為行銷部全員啟用「最新公告」匯出權限" },
  { id: 8, timestamp: "2026-03-10 15:44", operator: "系統管理者", target: "羅志偉", action: "套用預設", detail: "套用「無權限」範本（離職處理）" },
  { id: 9, timestamp: "2026-03-10 10:00", operator: "方怡君",     target: "林佳慧", action: "套用預設", detail: "套用「一般員工」權限範本（新人到職）" },
  { id: 10, timestamp: "2026-03-09 16:22", operator: "系統管理者", target: "全體 — 設計部", action: "批量修改", detail: "為設計部全員啟用「資產管理」檢視權限" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={className} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
    {children}
  </div>
);

const Av = ({ name, dept, size = 32 }: { name: string; dept?: string; size?: number }) => (
  <div className="rounded-full flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, background: dept ? DEPT_BG[dept] || "#F3F4F6" : "#F3F4F6" }}>
    <span style={{ fontSize: size * 0.38, fontWeight: 700, color: dept ? DEPT_COLOR[dept] || "#374151" : "#374151" }}>
      {name.charAt(0)}
    </span>
  </div>
);

const PermBadge = ({ perms }: { perms: Record<string, ModulePermission> }) => {
  const p = getPermLevel(perms);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
      style={{ fontSize: "12px", fontWeight: 600, background: p.bg, color: p.color, whiteSpace: "nowrap" }}>
      <ShieldCheck className="w-3 h-3" />{p.label}
    </span>
  );
};

const PermCheck = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button onClick={onChange}
    className="flex items-center justify-center"
    style={{
      width: 22, height: 22,
      background: checked ? "#111827" : "#FFF",
      borderWidth: checked ? 0 : "1.5px",
      borderStyle: "solid",
      borderColor: checked ? "transparent" : "#D1D5DB",
      borderRadius: 4, cursor: "pointer",
      transition: "all 0.12s",
    }}>
    {checked && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
  </button>
);

type TabKey = "matrix" | "templates" | "audit";

// ─── Custom preset type ──────────────────────────────────────────────────────
interface CustomPreset {
  key: string;
  label: string;
  desc: string;
  color: string;
  bg: string;
  permissions: Record<string, ModulePermission>;
  isBuiltIn?: false;
}

const PRESET_COLORS: { color: string; bg: string; label: string }[] = [
  { color: "#7C3AED", bg: "#F5F3FF", label: "紫色" },
  { color: "#1D4ED8", bg: "#EFF6FF", label: "藍色" },
  { color: "#15803D", bg: "#F0FDF4", label: "綠色" },
  { color: "#CA8A04", bg: "#FEF9C3", label: "黃色" },
  { color: "#DC2626", bg: "#FEF2F2", label: "紅色" },
  { color: "#C2410C", bg: "#FFF7ED", label: "橘色" },
  { color: "#0369A1", bg: "#F0F9FF", label: "天藍" },
  { color: "#BE185D", bg: "#FCE7F3", label: "粉紅" },
  { color: "#4338CA", bg: "#E0E7FF", label: "靛藍" },
  { color: "#374151", bg: "#F3F4F6", label: "灰色" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Permissions() {
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("matrix");

  // Matrix tab state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [page, setPage] = useState(1);
  const [copyModal, setCopyModal] = useState<Employee | null>(null);
  const [compareIds, setCompareIds] = useState<[number, number] | null>(null);

  // Audit tab state
  const [auditPage, setAuditPage] = useState(1);

  // Custom template state
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [tplEditorOpen, setTplEditorOpen] = useState(false);
  const [tplEditingKey, setTplEditingKey] = useState<string | null>(null);
  const [tplName, setTplName] = useState("");
  const [tplDesc, setTplDesc] = useState("");
  const [tplColor, setTplColor] = useState(PRESET_COLORS[0].color);
  const [tplBg, setTplBg] = useState(PRESET_COLORS[0].bg);
  const [tplPerms, setTplPerms] = useState<Record<string, ModulePermission>>(() => {
    const r: Record<string, ModulePermission> = {};
    PERM_MODULES.forEach(m => { r[m.key] = noPerms(); });
    return r;
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  const openNewTemplate = () => {
    setTplEditingKey(null);
    setTplName("");
    setTplDesc("");
    setTplColor(PRESET_COLORS[0].color);
    setTplBg(PRESET_COLORS[0].bg);
    const r: Record<string, ModulePermission> = {};
    PERM_MODULES.forEach(m => { r[m.key] = noPerms(); });
    setTplPerms(r);
    setTplEditorOpen(true);
  };

  const openEditBuiltIn = (preset: typeof ROLE_PRESETS[number]) => {
    setTplEditingKey("builtin:" + preset.key);
    setTplName(preset.label + "（複本）");
    setTplDesc(preset.desc);
    setTplColor(preset.color);
    setTplBg(preset.bg);
    setTplPerms(JSON.parse(JSON.stringify(preset.gen())));
    setTplEditorOpen(true);
  };

  const openEditCustom = (preset: CustomPreset) => {
    setTplEditingKey(preset.key);
    setTplName(preset.label);
    setTplDesc(preset.desc);
    setTplColor(preset.color);
    setTplBg(preset.bg);
    setTplPerms(JSON.parse(JSON.stringify(preset.permissions)));
    setTplEditorOpen(true);
  };

  const saveTplEditor = () => {
    if (!tplName.trim()) { showToast("請輸入範本名稱", false); return; }
    if (tplEditingKey && tplEditingKey.startsWith("builtin:")) {
      const newKey = "custom_" + Date.now();
      setCustomPresets(prev => [...prev, {
        key: newKey, label: tplName.trim(), desc: tplDesc.trim(),
        color: tplColor, bg: tplBg,
        permissions: JSON.parse(JSON.stringify(tplPerms)),
      }]);
      showToast(`已從內建範本建立「${tplName.trim()}」自訂範本`);
    } else if (tplEditingKey) {
      setCustomPresets(prev => prev.map(p => p.key === tplEditingKey ? {
        ...p, label: tplName.trim(), desc: tplDesc.trim(),
        color: tplColor, bg: tplBg,
        permissions: JSON.parse(JSON.stringify(tplPerms)),
      } : p));
      showToast(`範本「${tplName.trim()}」已更新`);
    } else {
      const newKey = "custom_" + Date.now();
      setCustomPresets(prev => [...prev, {
        key: newKey, label: tplName.trim(), desc: tplDesc.trim(),
        color: tplColor, bg: tplBg,
        permissions: JSON.parse(JSON.stringify(tplPerms)),
      }]);
      showToast(`已新增範本「${tplName.trim()}」`);
    }
    setTplEditorOpen(false);
  };

  const deleteCustomPreset = (key: string) => {
    setCustomPresets(prev => prev.filter(p => p.key !== key));
    showToast("範本已刪除");
    setDeleteConfirm(null);
  };

  const tplTogglePerm = (modKey: string, action: PermAction) => {
    setTplPerms(prev => {
      const next = { ...prev };
      next[modKey] = { ...next[modKey], [action]: !next[modKey][action] };
      return next;
    });
  };
  const tplToggleModuleAll = (modKey: string) => {
    setTplPerms(prev => {
      const next = { ...prev };
      const allOn = PERM_ACTIONS.every(a => next[modKey][a.key]);
      next[modKey] = { view: !allOn, create: !allOn, edit: !allOn, delete: !allOn, export: !allOn };
      return next;
    });
  };
  const tplToggleColumnAll = (action: PermAction) => {
    setTplPerms(prev => {
      const next = { ...prev };
      const allOn = PERM_MODULES.every(m => next[m.key][action]);
      PERM_MODULES.forEach(m => { next[m.key] = { ...next[m.key], [action]: !allOn }; });
      return next;
    });
  };
  const tplSetAll = (on: boolean) => {
    const r: Record<string, ModulePermission> = {};
    PERM_MODULES.forEach(m => { r[m.key] = on ? fullPerms() : noPerms(); });
    setTplPerms(r);
  };

  // ── Filter ──
  const LEVEL_TIERS = ["all", "L7-L8", "L5-L6", "L3-L4", "L1-L2"];
  const levelLabel = (t: string) => {
    if (t === "all") return "全部職級";
    if (t === "L7-L8") return "L7-L8 高階";
    if (t === "L5-L6") return "L5-L6 主管";
    if (t === "L3-L4") return "L3-L4 專員";
    return "L1-L2 初階";
  };
  const matchLevel = (level: string, tier: string) => {
    if (tier === "all") return true;
    const [a, b] = tier.split("-");
    return level.startsWith(a) || level.startsWith(b);
  };

  const filtered = useMemo(() => {
    const list = employees.filter(e => {
      const q = searchTerm.toLowerCase();
      if (q && !e.name.includes(q) && !e.employeeNo.toLowerCase().includes(q) && !e.role.includes(q)) return false;
      if (filterDept !== "all" && e.dept !== filterDept) return false;
      if (!matchLevel(e.level, filterLevel)) return false;
      return true;
    });
    if (sortBy === "default") return list;
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "name_asc": return a.name.localeCompare(b.name, "zh-Hant");
        case "name_desc": return b.name.localeCompare(a.name, "zh-Hant");
        case "empno_asc": return a.employeeNo.localeCompare(b.employeeNo);
        case "empno_desc": return b.employeeNo.localeCompare(a.employeeNo);
        case "dept": return a.dept.localeCompare(b.dept, "zh-Hant");
        case "level_asc": return a.level.localeCompare(b.level);
        case "level_desc": return b.level.localeCompare(a.level);
        case "perm_asc": {
          const pa = countPermissions(a.permissions).granted;
          const pb = countPermissions(b.permissions).granted;
          return pa - pb;
        }
        case "perm_desc": {
          const pa = countPermissions(a.permissions).granted;
          const pb = countPermissions(b.permissions).granted;
          return pb - pa;
        }
        default: return 0;
      }
    });
  }, [employees, searchTerm, filterDept, filterLevel, sortBy]);

  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  // ── Stats ──
  const stats = useMemo(() => {
    const levels = { full: 0, high: 0, mid: 0, low: 0, none: 0 };
    employees.forEach(e => {
      const l = getPermLevel(e.permissions);
      if (l.label === "完整權限") levels.full++;
      else if (l.label === "高權限") levels.high++;
      else if (l.label === "中權限") levels.mid++;
      else if (l.label === "低權限") levels.low++;
      else levels.none++;
    });
    return levels;
  }, [employees]);

  // ── Permission handlers ──
  const applyPreset = (empId: number, presetKey: string) => {
    const preset = ROLE_PRESETS.find(p => p.key === presetKey);
    if (!preset) return;
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, permissions: preset.gen() } : e));
    const emp = employees.find(e => e.id === empId);
    showToast(`已將 ${emp?.name} 設為「${preset.label}」`);
  };



  const copyPermsFrom = (sourceId: number, targetId: number) => {
    const src = employees.find(e => e.id === sourceId);
    if (!src) return;
    setEmployees(prev => prev.map(e => e.id === targetId ? { ...e, permissions: JSON.parse(JSON.stringify(src.permissions)) } : e));
    showToast(`已將 ${src.name} 的權限複製至目標員工`);
    setCopyModal(null);
  };



  return (
    <div className="h-full flex flex-col gap-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] px-5 py-3 rounded-lg flex items-center gap-2"
          style={{ background: toast.ok ? "#111827" : "#DC2626", color: "#FFF", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", fontSize: "15px", fontWeight: 500 }}>
          {toast.ok ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 max-md:flex-col max-md:items-stretch">
        <div>
          <h1>權限管理</h1>
          <p style={{ fontSize: "15px", color: "#9CA3AF", marginTop: 2 }}>管理員工對系統各模組的存取權限，支援角色範本與批量操作</p>
        </div>
        <div className="flex items-center gap-2 max-md:w-full">
          <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:flex-1"
            style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "13px", color: "#374151" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
            onClick={() => exportCSV("權限管理表.csv", [
              { header: "員工編號", accessor: (e: any) => e.employeeNo },
              { header: "姓名", accessor: (e: any) => e.name },
              { header: "部門", accessor: (e: any) => e.dept },
              { header: "層級", accessor: (e: any) => e.level },
              { header: "權限等級", accessor: (e: any) => getPermLevel(e.permissions) },
              { header: "已授權數", accessor: (e: any) => countPermissions(e.permissions).granted },
              { header: "總權限數", accessor: (e: any) => countPermissions(e.permissions).total },
              ...PERM_MODULES.map(m => ({
                header: `${m.label}`,
                accessor: (e: any) => {
                  const p = e.permissions[m.key];
                  if (!p) return "無";
                  return PERM_ACTIONS.filter((a: any) => p[a.key]).map((a: any) => a.label).join("/") || "無";
                },
              })),
            ], filtered)}>
            <Download className="w-3.5 h-3.5" />匯出權限表
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "完整權限", value: stats.full, color: "#7C3AED", bg: "#F5F3FF" },
          { label: "高權限",   value: stats.high, color: "#1D4ED8", bg: "#EFF6FF" },
          { label: "中權限",   value: stats.mid,  color: "#CA8A04", bg: "#FEF9C3" },
          { label: "低權限",   value: stats.low,  color: "#C2410C", bg: "#FFF7ED" },
          { label: "無權限",   value: stats.none, color: "#DC2626", bg: "#FEF2F2" },
        ].map(item => (
          <Card key={item.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.04em" }}>{item.label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: item.color }} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <p className="tabular-nums" style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                {item.value}
                <span style={{ fontSize: "14px", fontWeight: 500, color: "#9CA3AF", marginLeft: 2 }}>人</span>
              </p>
              {/* Mini bar */}
              <div className="flex-1 mb-1.5">
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                  <div className="h-full rounded-full" style={{ width: `${employees.length > 0 ? (item.value / employees.length) * 100 : 0}%`, background: item.color, transition: "width 0.3s" }} />
                </div>
              </div>
              <span className="tabular-nums mb-0.5" style={{ fontSize: "11px", color: "#9CA3AF" }}>{employees.length > 0 ? Math.round((item.value / employees.length) * 100) : 0}%</span>
            </div>
          </Card>
        ))}
      </div>

      {/* SubNav */}
      <SubNav
        tabs={[
          { key: "matrix",    label: "權限矩陣", count: employees.length },
          { key: "templates", label: "角色範本" },
          { key: "audit",     label: "變更紀錄", count: AUDIT_LOG.length },
        ]}
        active={activeTab}
        onChange={k => setActiveTab(k as TabKey)}
      />

      {/* ═══════════════════ TAB: 權限矩陣 ═══════════════════ */}
      {activeTab === "matrix" && (
        <Card className="flex-1 flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
              <input type="text" placeholder="搜尋姓名、員編、職位..."
                value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 rounded outline-none"
                style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#111827", fontFamily: "inherit" }} />
            </div>
            <div className="flex gap-2 flex-wrap max-md:w-full max-md:flex-col">
              <StyledSelect
                value={filterDept}
                onChange={v => { setFilterDept(v); setPage(1); }}
                allLabel="全部部門"
                options={DEPTS.map(d => ({ key: d, label: d }))}
                className="max-md:w-full"
              />
              <StyledSelect
                value={filterLevel}
                onChange={v => { setFilterLevel(v); setPage(1); }}
                allLabel="全部職級"
                options={LEVEL_TIERS.slice(1).map(t => ({ key: t, label: levelLabel(t) }))}
                className="max-md:w-full"
              />
              <StyledSelect
                value={sortBy}
                onChange={v => { setSortBy(v); setPage(1); }}
                allLabel="預設排序"
                options={[
                  { key: "name_asc", label: "姓名 A→Z" },
                  { key: "name_desc", label: "姓名 Z→A" },
                  { key: "empno_asc", label: "員編 小→大" },
                  { key: "empno_desc", label: "員編 大→小" },
                  { key: "dept", label: "依部門" },
                  { key: "level_asc", label: "職級 低→高" },
                  { key: "level_desc", label: "職級 高→低" },
                  { key: "perm_asc", label: "權限 少→多" },
                  { key: "perm_desc", label: "權限 多→少" },
                ]}
                className="max-md:w-full"
              />
              {(searchTerm || filterDept !== "all" || filterLevel !== "all" || sortBy !== "default") && (
                <button className="px-3 py-2 rounded flex items-center gap-1.5"
                  style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#9CA3AF" }}
                  onClick={() => { setSearchTerm(""); setFilterDept("all"); setFilterLevel("all"); setSortBy("default"); }}>
                  <X className="w-3.5 h-3.5" />清除
                </button>
              )}
            </div>

            <span style={{ fontSize: "13px", color: "#9CA3AF", marginLeft: "auto" }}>共 {filtered.length} 筆</span>
          </div>

          {/* Matrix List */}
          <div className="flex-1 min-h-0 overflow-auto">
            {paged.map((emp, idx) => {
              const { granted, total } = countPermissions(emp.permissions);
              const pct = Math.round((granted / total) * 100);
              const presetMatch = matchesPreset(emp.permissions);

              return (
                <div key={emp.id} style={{ borderBottomWidth: idx < paged.length - 1 ? "1px" : 0, borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                  {/* Summary row */}
                  {/* Desktop */}
                  <div className="hidden md:flex items-center gap-3 px-5 py-3"
                    style={{ transition: "background 0.1s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#FAFAFA"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>

                    <Av name={emp.name} dept={emp.dept} size={34} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{emp.name}</span>
                        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{emp.employeeNo}</span>
                        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: DEPT_BG[emp.dept] || "#F3F4F6", color: DEPT_COLOR[emp.dept] || "#374151" }}>{emp.dept}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "#6B7280", marginTop: 1 }}>{emp.role} · {emp.level}</p>
                    </div>

                    {/* Preset match */}
                    {presetMatch && (
                      <span className="px-2 py-0.5 rounded-md" style={{ fontSize: "11px", fontWeight: 600, background: "#F0FDF4", color: "#15803D", whiteSpace: "nowrap" }}>
                        {presetMatch}
                      </span>
                    )}

                    {/* Progress */}
                    <div className="flex items-center gap-2" style={{ width: 140 }}>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                        <div className="h-full rounded-full transition-all duration-300" style={{
                          width: `${pct}%`,
                          background: pct === 100 ? "#7C3AED" : pct > 70 ? "#1D4ED8" : pct > 30 ? "#CA8A04" : pct > 0 ? "#C2410C" : "#D1D5DB",
                        }} />
                      </div>
                      <span className="tabular-nums" style={{ fontSize: "12px", fontWeight: 600, color: "#374151", minWidth: 42, textAlign: "right" }}>
                        {granted}/{total}
                      </span>
                    </div>

                    <PermBadge perms={emp.permissions} />

                    {/* Quick actions */}
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <StyledSelect
                        value=""
                        onChange={v => { if (v) applyPreset(emp.id, v); }}
                        placeholder="套用範本"
                        options={ROLE_PRESETS.map(p => ({ key: p.key, label: p.label }))}
                      />
                      <button onClick={() => setCopyModal(emp)} className="w-7 h-7 rounded flex items-center justify-center"
                        style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                        title="複製其他員工的權限">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden px-4 py-3"
                    style={{ transition: "background 0.1s" }}>
                    {/* Row 1: avatar + name */}
                    <div className="flex items-center gap-2.5">
                      <Av name={emp.name} dept={emp.dept} size={34} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{emp.name}</span>
                          <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{emp.employeeNo}</span>
                        </div>
                        <p style={{ fontSize: "12px", color: "#6B7280", marginTop: 1 }}>{emp.role} · {emp.level}</p>
                      </div>
                    </div>

                    {/* Row 2: badges + progress */}
                    <div className="flex items-center gap-2 flex-wrap mt-2.5 pl-[46px]">
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: DEPT_BG[emp.dept] || "#F3F4F6", color: DEPT_COLOR[emp.dept] || "#374151" }}>{emp.dept}</span>
                      <PermBadge perms={emp.permissions} />
                      {presetMatch && (
                        <span className="px-2 py-0.5 rounded-md" style={{ fontSize: "11px", fontWeight: 600, background: "#F0FDF4", color: "#15803D", whiteSpace: "nowrap" }}>
                          {presetMatch}
                        </span>
                      )}
                    </div>

                    {/* Row 3: progress bar */}
                    <div className="flex items-center gap-2.5 mt-2.5 pl-[46px]">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                        <div className="h-full rounded-full transition-all duration-300" style={{
                          width: `${pct}%`,
                          background: pct === 100 ? "#7C3AED" : pct > 70 ? "#1D4ED8" : pct > 30 ? "#CA8A04" : pct > 0 ? "#C2410C" : "#D1D5DB",
                        }} />
                      </div>
                      <span className="tabular-nums" style={{ fontSize: "12px", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
                        {granted}/{total}
                      </span>
                    </div>

                    {/* Row 4: quick actions */}
                    <div className="flex items-center gap-2 mt-2.5 pl-[58px]" onClick={e => e.stopPropagation()}>
                      <StyledSelect
                        value=""
                        onChange={v => { if (v) applyPreset(emp.id, v); }}
                        placeholder="套用範本"
                        options={ROLE_PRESETS.map(p => ({ key: p.key, label: p.label }))}
                        className="flex-1"
                      />
                      <button onClick={() => setCopyModal(emp)} className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ color: "#9CA3AF", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                        title="複製其他員工的權限">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {paged.length === 0 && (
              <div className="py-12 text-center" style={{ color: "#9CA3AF", fontSize: "14px" }}>找不到符合條件的員工</div>
            )}
          </div>

          {/* Footer with pagination */}
          <div className="flex items-center justify-end px-5 py-1" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
            <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
          </div>
        </Card>
      )}

      {/* ═══════════════════ TAB: 角色範本 ═══════════════════ */}
      {activeTab === "templates" && (
        <div className="flex flex-col gap-4 flex-1">
          {/* Section: 內建範本 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: "#6B7280" }} />
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#374151" }}>內建範本</span>
              <span className="px-2 py-0.5 rounded-md" style={{ fontSize: "11px", fontWeight: 600, background: "#F3F4F6", color: "#6B7280" }}>{ROLE_PRESETS.length}</span>
            </div>
            <button onClick={openNewTemplate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ background: "#111827", color: "#FFF", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
              <Plus className="w-4 h-4" />新增範本
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {ROLE_PRESETS.map(preset => {
              const presetPerms = preset.gen();
              const { granted, total } = countPermissions(presetPerms);
              const matchCount = employees.filter(e => matchesPreset(e.permissions) === preset.label).length;
              return (
                <Card key={preset.key} className="flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: preset.bg }}>
                        <Shield className="w-5 h-5" style={{ color: preset.color }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md" style={{ fontSize: "12px", fontWeight: 600, background: preset.bg, color: preset.color }}>
                          {matchCount} 人使用中
                        </span>
                        <button onClick={() => openEditBuiltIn(preset)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                          title="以此為基礎建立自訂範本">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>{preset.label}</h3>
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, background: "#F3F4F6", color: "#9CA3AF", letterSpacing: "0.04em" }}>內建</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6 }}>{preset.desc}</p>

                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.round((granted / total) * 100)}%`, background: preset.color }} />
                      </div>
                      <span className="tabular-nums" style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{granted}/{total}</span>
                    </div>

                    <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: `repeat(${PERM_MODULES.length}, 1fr)` }}>
                      {PERM_MODULES.map(mod => {
                        const mp = presetPerms[mod.key];
                        const cnt = PERM_ACTIONS.filter(a => mp[a.key]).length;
                        const opacity = cnt / PERM_ACTIONS.length;
                        return (
                          <div key={mod.key} title={`${mod.label}: ${cnt}/${PERM_ACTIONS.length}`}>
                            <div className="w-full rounded" style={{
                              height: 20,
                              background: cnt === 0 ? "#F3F4F6" : preset.color,
                              opacity: cnt === 0 ? 1 : Math.max(0.2, opacity),
                            }} />
                            <p className="text-center mt-0.5" style={{ fontSize: "9px", color: "#9CA3AF" }}>{mod.label.substring(0, 2)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{matchCount} 人</span>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.color = "#FFF"; e.currentTarget.style.borderColor = "#111827"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                      onClick={() => {
                        setActiveTab("matrix");
                        showToast(`請在權限矩陣中選擇員工並套用「${preset.label}」`);
                      }}>
                      <Sparkles className="w-3.5 h-3.5" />套用範本
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Section: 自訂範本 */}
          <div className="flex items-center gap-2 mt-2">
            <Palette className="w-4 h-4" style={{ color: "#6B7280" }} />
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#374151" }}>自訂範本</span>
            <span className="px-2 py-0.5 rounded-md" style={{ fontSize: "11px", fontWeight: 600, background: "#F3F4F6", color: "#6B7280" }}>{customPresets.length}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {customPresets.map(preset => {
              const { granted, total } = countPermissions(preset.permissions);
              return (
                <Card key={preset.key} className="flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: preset.bg }}>
                        <Shield className="w-5 h-5" style={{ color: preset.color }} />
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditCustom(preset)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                          title="編輯範本">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm(preset.key)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                          title="刪除範本">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>{preset.label}</h3>
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, background: preset.bg, color: preset.color, letterSpacing: "0.04em" }}>自訂</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6 }}>{preset.desc || "尚無描述"}</p>

                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                        <div className="h-full rounded-full" style={{ width: `${total > 0 ? Math.round((granted / total) * 100) : 0}%`, background: preset.color }} />
                      </div>
                      <span className="tabular-nums" style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{granted}/{total}</span>
                    </div>

                    <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: `repeat(${PERM_MODULES.length}, 1fr)` }}>
                      {PERM_MODULES.map(mod => {
                        const mp = preset.permissions[mod.key] || noPerms();
                        const cnt = PERM_ACTIONS.filter(a => mp[a.key]).length;
                        const opacity = cnt / PERM_ACTIONS.length;
                        return (
                          <div key={mod.key} title={`${mod.label}: ${cnt}/${PERM_ACTIONS.length}`}>
                            <div className="w-full rounded" style={{
                              height: 20,
                              background: cnt === 0 ? "#F3F4F6" : preset.color,
                              opacity: cnt === 0 ? 1 : Math.max(0.2, opacity),
                            }} />
                            <p className="text-center mt-0.5" style={{ fontSize: "9px", color: "#9CA3AF" }}>{mod.label.substring(0, 2)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                    <div className="flex items-center gap-1.5">
                      <span className="tabular-nums" style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF" }}>{granted}/{total} 權限</span>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                      style={{ fontSize: "13px", fontWeight: 500, background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.color = "#FFF"; e.currentTarget.style.borderColor = "#111827"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                      onClick={() => openEditCustom(preset)}>
                      <Pencil className="w-3.5 h-3.5" />編輯範本
                    </button>
                  </div>
                </Card>
              );
            })}

            {/* Add new template card */}
            <button onClick={openNewTemplate}
              className="flex flex-col items-center justify-center gap-3 rounded-lg cursor-pointer"
              style={{
                background: "#FAFAFA", borderWidth: "2px", borderStyle: "dashed", borderColor: "#E5E7EB",
                borderRadius: "8px", minHeight: 200, transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#111827"; e.currentTarget.style.background = "#F9FAFB"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#FAFAFA"; }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                <Plus className="w-5 h-5" style={{ color: "#6B7280" }} />
              </div>
              <div className="text-center">
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>新增自訂範本</p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>自訂模組權限組合</p>
              </div>
            </button>
          </div>

          {/* Summary card */}
          <Card className="p-5 mt-2">
            <div className="flex items-start gap-4 max-md:flex-col">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                  <BarChart3 className="w-5 h-5" style={{ color: "#6B7280" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>權限分佈概覽</h3>
                  <p style={{ fontSize: "13px", color: "#6B7280" }}>全體 {employees.length} 位員工</p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3 w-full">
                {[
                  { label: "完整權限", count: stats.full, color: "#7C3AED" },
                  { label: "高權限",   count: stats.high, color: "#1D4ED8" },
                  { label: "中權限",   count: stats.mid,  color: "#CA8A04" },
                  { label: "低權限",   count: stats.low,  color: "#C2410C" },
                  { label: "無權限",   count: stats.none, color: "#DC2626" },
                ].map(item => (
                  <div key={item.label} className="flex flex-col items-center gap-1.5 p-2 rounded-lg" style={{ background: "#FAFAFA" }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="tabular-nums" style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>{item.count}</span>
                    <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════ TAB: 變更紀錄 ═══════════════════ */}
      {activeTab === "audit" && (
        <Card className="flex-1 flex flex-col min-h-0">
          <div className="p-4 flex items-center gap-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
            <Clock className="w-4 h-4" style={{ color: "#9CA3AF" }} />
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>近期權限變更紀錄</span>
            <span style={{ fontSize: "13px", color: "#9CA3AF", marginLeft: "auto" }}>共 {AUDIT_LOG.length} 筆</span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            {/* Header */}
            <div className="hidden md:grid px-5 py-2.5 sticky top-0" style={{
              gridTemplateColumns: "1.2fr 1fr 1.2fr 0.8fr 2fr",
              borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA",
            }}>
              {["時間", "操作人員", "對象", "操作類型", "詳細說明"].map(h => (
                <span key={h} style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em" }}>{h}</span>
              ))}
            </div>
            {AUDIT_LOG.slice((auditPage - 1) * PAGE_SIZE, auditPage * PAGE_SIZE).map((entry, idx) => {
              const actionColor = entry.action === "套用預設" ? "#1D4ED8" : entry.action === "個別修改" ? "#CA8A04" : entry.action === "批量修改" ? "#7C3AED" : "#374151";
              const actionBg = entry.action === "套用預設" ? "#EFF6FF" : entry.action === "個別修改" ? "#FEF9C3" : entry.action === "批量修改" ? "#F5F3FF" : "#F3F4F6";
              return (
                <div key={entry.id}>
                  {/* Desktop row */}
                  <div className="hidden md:grid items-center px-5 py-3.5" style={{
                    gridTemplateColumns: "1.2fr 1fr 1.2fr 0.8fr 2fr",
                    borderBottomWidth: idx < 9 ? "1px" : 0, borderBottomStyle: "solid", borderBottomColor: "#F9FAFB",
                    transition: "background 0.1s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#FAFAFA"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <span className="tabular-nums" style={{ fontSize: "13px", color: "#6B7280" }}>{entry.timestamp}</span>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{entry.operator}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{entry.target}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded w-fit" style={{ fontSize: "11px", fontWeight: 600, background: actionBg, color: actionColor, whiteSpace: "nowrap" }}>
                      {entry.action}
                    </span>
                    <span style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.5 }}>{entry.detail}</span>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden px-4 py-3" style={{ borderBottomWidth: idx < 9 ? "1px" : 0, borderBottomStyle: "solid", borderBottomColor: "#F9FAFB" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{entry.target}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: actionBg, color: actionColor }}>{entry.action}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.5, marginTop: 4 }}>{entry.detail}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span style={{ fontSize: "12px", color: "#374151" }}>{entry.operator}</span>
                      <span className="tabular-nums" style={{ fontSize: "12px", color: "#9CA3AF" }}>{entry.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination total={AUDIT_LOG.length} page={auditPage} pageSize={PAGE_SIZE} onChange={setAuditPage} />
        </Card>
      )}

      {/* ── Copy Modal ─────────────────────────────────────────── */}
      {copyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" style={{ background: "rgba(17,24,39,0.4)" }} onClick={() => setCopyModal(null)} />
          <div className="relative p-6 max-md:p-4 rounded-lg" style={{ background: "#FFF", maxWidth: 440, width: "90%", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                <Copy className="w-4 h-4" style={{ color: "#1D4ED8" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>複製權限</h3>
                <p style={{ fontSize: "13px", color: "#9CA3AF" }}>選擇來源員工，將其權限複製至 <strong style={{ color: "#111827" }}>{copyModal.name}</strong></p>
              </div>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto mt-4">
              {employees.filter(e => e.id !== copyModal.id).map(src => (
                <button key={src.id} onClick={() => copyPermsFrom(src.id, copyModal.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left"
                  style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "transparent", transition: "all 0.1s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "transparent"; }}>
                  <Av name={src.name} dept={src.dept} size={28} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{src.name}</p>
                    <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{src.dept} · {src.role}</p>
                  </div>
                  <PermBadge perms={src.permissions} />
                  <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D1D5DB" }} />
                </button>
              ))}
            </div>
            <button onClick={() => setCopyModal(null)} className="w-full mt-4 py-2.5 rounded-lg"
              style={{ fontSize: "14px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", fontFamily: "inherit" }}>
              取消
            </button>
          </div>
        </div>
      )}



      {/* ── Template Editor Modal ───────────────────────────────── */}
      {tplEditorOpen && (() => {
        const isBuiltInEdit = tplEditingKey?.startsWith("builtin:");
        const isNew = !tplEditingKey;
        const title = isBuiltInEdit ? "以內建範本為基礎建立" : isNew ? "新增自訂範本" : "編輯自訂範本";
        const { granted: tplGranted, total: tplTotal } = countPermissions(tplPerms);
        const allAll = PERM_MODULES.every(m => PERM_ACTIONS.every(a => tplPerms[m.key]?.[a.key]));
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" style={{ background: "rgba(17,24,39,0.5)" }} onClick={() => setTplEditorOpen(false)} />
            <div className="relative flex flex-col rounded-xl" style={{
              background: "#FFF", maxWidth: 720, width: "95%", maxHeight: "90vh",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}>
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 max-md:px-4 flex-shrink-0" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: tplBg }}>
                    <Shield className="w-4.5 h-4.5" style={{ color: tplColor }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>{title}</h3>
                    <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                      {tplGranted}/{tplTotal} 項權限已啟用（{tplTotal > 0 ? Math.round((tplGranted / tplTotal) * 100) : 0}%）
                    </p>
                  </div>
                </div>
                <button onClick={() => setTplEditorOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ color: "#9CA3AF", transition: "all 0.12s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body (scrollable) */}
              <div className="flex-1 overflow-y-auto px-6 py-5 max-md:px-4 space-y-5">
                {/* Basic info row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>範本名稱 *</label>
                    <input type="text" value={tplName} onChange={e => setTplName(e.target.value)}
                      placeholder="例如：行銷部專員"
                      className="w-full px-3 py-2.5 rounded-lg outline-none"
                      style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#111827", fontFamily: "inherit" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>說明描述</label>
                    <input type="text" value={tplDesc} onChange={e => setTplDesc(e.target.value)}
                      placeholder="簡短描述此範本用途"
                      className="w-full px-3 py-2.5 rounded-lg outline-none"
                      style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#111827", fontFamily: "inherit" }} />
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>主題色彩</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(c => (
                      <button key={c.color} onClick={() => { setTplColor(c.color); setTplBg(c.bg); }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                        style={{
                          borderWidth: "2px", borderStyle: "solid",
                          borderColor: tplColor === c.color ? c.color : "#E5E7EB",
                          background: tplColor === c.color ? c.bg : "#FFF",
                          cursor: "pointer", transition: "all 0.12s",
                        }}>
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />
                        <span style={{ fontSize: "12px", fontWeight: 500, color: tplColor === c.color ? c.color : "#6B7280" }}>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick fill row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>快速填入：</span>
                  {[
                    { label: "全部開啟", fn: () => tplSetAll(true) },
                    { label: "全部關閉", fn: () => tplSetAll(false) },
                    { label: "僅檢視", fn: () => {
                      const r: Record<string, ModulePermission> = {};
                      PERM_MODULES.forEach(m => { r[m.key] = { view: true, create: false, edit: false, delete: false, export: false }; });
                      setTplPerms(r);
                    }},
                    { label: "檢視＋編輯", fn: () => {
                      const r: Record<string, ModulePermission> = {};
                      PERM_MODULES.forEach(m => { r[m.key] = { view: true, create: true, edit: true, delete: false, export: false }; });
                      setTplPerms(r);
                    }},
                  ].map(btn => (
                    <button key={btn.label} onClick={btn.fn} className="px-2.5 py-1 rounded-md"
                      style={{ fontSize: "12px", fontWeight: 600, background: "#F3F4F6", color: "#374151", cursor: "pointer", transition: "all 0.1s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.color = "#FFF"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#374151"; }}>
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Permission matrix */}
                <div className="overflow-x-auto">
                  <div className="rounded-lg overflow-hidden" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", minWidth: 540 }}>
                    {/* Header */}
                    <div className="grid items-center px-4 py-2.5" style={{
                      gridTemplateColumns: "1.6fr 0.5fr repeat(5, 1fr)",
                      background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB",
                    }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF" }}>模組</span>
                      <span className="text-center" style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF" }}>全選</span>
                      {PERM_ACTIONS.map(a => (
                        <span key={a.key} className="text-center" style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF" }}>{a.label}</span>
                      ))}
                    </div>
                    {/* Module rows */}
                    {PERM_MODULES.map((mod, mi) => {
                      const Icon = mod.icon;
                      const mp = tplPerms[mod.key] || noPerms();
                      const allOn = PERM_ACTIONS.every(a => mp[a.key]);
                      const noneOn = PERM_ACTIONS.every(a => !mp[a.key]);
                      return (
                        <div key={mod.key} className="grid items-center px-4 py-2.5" style={{
                          gridTemplateColumns: "1.6fr 0.5fr repeat(5, 1fr)",
                          borderBottomWidth: mi < PERM_MODULES.length - 1 ? "1px" : 0, borderBottomStyle: "solid", borderBottomColor: "#F3F4F6",
                          background: allOn ? tplBg + "40" : "transparent",
                          transition: "background 0.12s",
                        }}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5" style={{ color: noneOn ? "#D1D5DB" : "#6B7280" }} />
                            <span style={{ fontSize: "13px", fontWeight: 500, color: noneOn ? "#9CA3AF" : "#374151" }}>{mod.label}</span>
                          </div>
                          <div className="flex justify-center">
                            <PermCheck checked={allOn} onChange={() => tplToggleModuleAll(mod.key)} />
                          </div>
                          {PERM_ACTIONS.map(a => (
                            <div key={a.key} className="flex justify-center">
                              <PermCheck checked={mp[a.key]} onChange={() => tplTogglePerm(mod.key, a.key)} />
                            </div>
                          ))}
                        </div>
                      );
                    })}
                    {/* Column toggles */}
                    <div className="grid items-center px-4 py-2.5" style={{
                      gridTemplateColumns: "1.6fr 0.5fr repeat(5, 1fr)",
                      background: "#F9FAFB", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB",
                    }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280" }}>全部切換</span>
                      <div className="flex justify-center">
                        <PermCheck checked={allAll} onChange={() => tplSetAll(!allAll)} />
                      </div>
                      {PERM_ACTIONS.map(a => {
                        const colAllOn = PERM_MODULES.every(m => (tplPerms[m.key] || noPerms())[a.key]);
                        return (
                          <div key={a.key} className="flex justify-center">
                            <PermCheck checked={colAllOn} onChange={() => tplToggleColumnAll(a.key)} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-between px-6 py-4 max-md:px-4 gap-3 flex-shrink-0" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: tplColor }} />
                  <span className="tabular-nums" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                    {tplGranted}/{tplTotal} 權限
                  </span>
                  {/* Mini preview bar */}
                  <div className="hidden sm:flex h-1.5 rounded-full overflow-hidden" style={{ width: 80, background: "#F3F4F6" }}>
                    <div className="h-full rounded-full" style={{ width: `${tplTotal > 0 ? Math.round((tplGranted / tplTotal) * 100) : 0}%`, background: tplColor, transition: "width 0.2s" }} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTplEditorOpen(false)} className="px-4 py-2.5 rounded-lg"
                    style={{ fontSize: "14px", fontWeight: 500, background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", cursor: "pointer", fontFamily: "inherit" }}>
                    取消
                  </button>
                  <button onClick={saveTplEditor} className="px-5 py-2.5 rounded-lg flex items-center gap-2"
                    style={{ fontSize: "14px", fontWeight: 600, background: "#111827", color: "#FFF", cursor: "pointer", fontFamily: "inherit" }}>
                    <Check className="w-4 h-4" />
                    {isBuiltInEdit ? "建立範本" : isNew ? "新增範本" : "儲存變更"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Delete Confirm Modal ──────────────────────────────── */}
      {deleteConfirm && (() => {
        const preset = customPresets.find(p => p.key === deleteConfirm);
        if (!preset) return null;
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0" style={{ background: "rgba(17,24,39,0.4)" }} onClick={() => setDeleteConfirm(null)} />
            <div className="relative p-6 max-md:p-4 rounded-xl" style={{ background: "#FFF", maxWidth: 400, width: "90%", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#FEF2F2" }}>
                  <Trash2 className="w-4.5 h-4.5" style={{ color: "#DC2626" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>刪除範本</h3>
                  <p style={{ fontSize: "13px", color: "#9CA3AF" }}>此操作無法復原</p>
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6, marginBottom: 20 }}>
                確定要刪除自訂範本「<strong style={{ color: "#111827" }}>{preset.label}</strong>」嗎？已套用此範本的員工權限不會受到影響。
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-lg"
                  style={{ fontSize: "14px", fontWeight: 500, background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", cursor: "pointer", fontFamily: "inherit" }}>
                  取消
                </button>
                <button onClick={() => deleteCustomPreset(preset.key)} className="flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2"
                  style={{ fontSize: "14px", fontWeight: 600, background: "#DC2626", color: "#FFF", cursor: "pointer", fontFamily: "inherit" }}>
                  <Trash2 className="w-3.5 h-3.5" />確認刪除
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}