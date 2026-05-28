import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Plus, X, Edit3, Trash2, ChevronDown,
  Mail, Phone, Building2, Calendar, Shield,
  UserCheck, UserX, Download, Users,
  Key, Lock, Unlock, AlertTriangle, Check, ShieldCheck,
} from "lucide-react";
import { Pagination } from "../components/Pagination";
import { StyledSelect } from "../components/StyledSelect";
import {
  type Employee, type EmpStatus, type LoginMethod, type PermAction,
  DEPTS, LEVELS, STATUS_MAP, LOGIN_MAP, DEPT_BG, DEPT_COLOR,
  PERM_MODULES, PERM_ACTIONS, ROLE_PRESETS,
  EMPLOYEES, defaultPermsForLevel, countPermissions, getPermLevel,
  fullPerms, noPerms, matchesPreset,
} from "../data/employees";
import { DatePicker } from "../components/DatePicker";
import { exportCSV } from "../components/ExportCSV";


const PAGE_SIZE = 10;

// ─── Sub-components ───────────────────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={className} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
    {children}
  </div>
);

const Av = ({ name, dept, size = 36 }: { name: string; dept?: string; size?: number }) => (
  <div className="rounded-full flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, background: dept ? DEPT_BG[dept] || "#F3F4F6" : "#F3F4F6" }}>
    <span style={{ fontSize: size * 0.38, fontWeight: 700, color: dept ? DEPT_COLOR[dept] || "#374151" : "#374151" }}>
      {name.charAt(0)}
    </span>
  </div>
);

const StatusBadge = ({ s }: { s: EmpStatus }) => {
  const c = STATUS_MAP[s];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md w-fit"
      style={{ fontSize: "13px", fontWeight: 600, background: c.bg, color: c.color, whiteSpace: "nowrap" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />{c.label}
    </span>
  );
};

const LoginBadge = ({ method, enabled, status }: { method: LoginMethod; enabled: boolean; status?: EmpStatus }) => {
  const m = LOGIN_MAP[method];
  if (status === "onleave") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md w-fit"
        style={{ fontSize: "13px", fontWeight: 600, background: "#F3F4F6", color: "#9CA3AF", whiteSpace: "nowrap" }}>
        --
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md w-fit"
      style={{ fontSize: "13px", fontWeight: 600, background: enabled ? "#F9FAFB" : "#FEF2F2", color: enabled ? m.color : "#9CA3AF", whiteSpace: "nowrap" }}>
      {enabled ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
      {m.label}
    </span>
  );
};

const PermBadge = ({ perms }: { perms: Record<string, import("../data/employees").ModulePermission> }) => {
  const p = getPermLevel(perms);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
      style={{ fontSize: "12px", fontWeight: 600, background: p.bg, color: p.color, whiteSpace: "nowrap" }}>
      <ShieldCheck className="w-3 h-3" />{p.label}
    </span>
  );
};

const PermCheck = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!checked)}
    className="flex items-center justify-center"
    style={{
      width: 20, height: 20,
      background: checked ? "#111827" : "#FFF",
      borderWidth: checked ? "0" : "1.5px",
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState<EmpStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [detailTarget, setDetailTarget] = useState<Employee | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);


  const filtered = useMemo(() => {
    return employees.filter(e => {
      const q = searchTerm.toLowerCase();
      if (q && !e.name.toLowerCase().includes(q) && !e.employeeNo.toLowerCase().includes(q) && !e.email.toLowerCase().includes(q) && !e.dept.includes(q) && !e.role.includes(q)) return false;
      if (filterDept !== "all" && e.dept !== filterDept) return false;
      if (filterStatus !== "all" && e.status !== filterStatus) return false;
      return true;
    });
  }, [employees, searchTerm, filterDept, filterStatus]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === "active").length,
    inactive: employees.filter(e => e.status === "inactive").length,
    onleave: employees.filter(e => e.status === "onleave").length,
    probation: employees.filter(e => e.status === "probation").length,
    loginEnabled: employees.filter(e => e.loginEnabled).length,
  }), [employees]);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };
  const openAdd = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (emp: Employee) => { setEditTarget(emp); setShowModal(true); };

  const saveEmployee = (data: Employee) => {
    if (editTarget) {
      setEmployees(prev => prev.map(e => e.id === data.id ? data : e));
      showToast("員工資料已更新");
    } else {
      setEmployees(prev => [...prev, { ...data, id: Math.max(...prev.map(e => e.id)) + 1 }]);
      showToast("新員工已建立");
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setEmployees(prev => prev.filter(e => e.id !== deleteTarget.id));
    showToast("員工已刪除");
    setDeleteTarget(null);
  };

  const toggleLogin = (emp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, loginEnabled: !e.loginEnabled } : e));
    showToast(emp.loginEnabled ? `已停用 ${emp.name} 的登入權限` : `已啟用 ${emp.name} 的登入權限`);
  };

  const iStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", fontSize: "15px",
    background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "6px",
    color: "#111827", outline: "none", fontFamily: "inherit",
  };
  const lStyle: React.CSSProperties = { display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: 5 };

  return (
    <div className="h-full flex flex-col gap-4">
      {toast && (
        <div className="fixed top-6 right-6 z-[100] px-5 py-3 rounded-lg flex items-center gap-2"
          style={{ background: toast.ok ? "#111827" : "#DC2626", color: "#FFF", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", fontSize: "15px", fontWeight: 500 }}>
          {toast.ok ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 max-md:flex-col max-md:items-stretch">
        <div>
          <h1>員工管理</h1>
          <p style={{ fontSize: "15px", color: "#9CA3AF", marginTop: 2 }}>管理公司全體員工資料與系統登入設定</p>
        </div>
        <div className="flex items-center gap-2 max-md:w-full">
          <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:flex-1"
            style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "13px", color: "#374151" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
            onClick={() => exportCSV("員工清單.csv", [
              { header: "員工編號", accessor: (e: any) => e.employeeNo },
              { header: "姓名", accessor: (e: any) => e.name },
              { header: "部門", accessor: (e: any) => e.dept },
              { header: "職位", accessor: (e: any) => e.role },
              { header: "職級", accessor: (e: any) => e.level },
              { header: "狀態", accessor: (e: any) => STATUS_MAP[e.status as EmpStatus]?.label ?? e.status },
              { header: "Email", accessor: (e: any) => e.email },
              { header: "電話", accessor: (e: any) => e.phone },
              { header: "到職日", accessor: (e: any) => e.hireDate },
              { header: "登入方式", accessor: (e: any) => LOGIN_MAP[e.loginMethod as LoginMethod]?.label ?? e.loginMethod },
              { header: "帳號啟用", accessor: (e: any) => e.loginEnabled ? "是" : "否" },
            ], filtered)}>
            <Download className="w-3.5 h-3.5" />匯出
          </button>
          <button onClick={openAdd} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:flex-1"
            style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 500 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}>
            <Plus className="w-3.5 h-3.5" />新增員工
          </button>
        </div>
      </div>



      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "總人數", value: stats.total, unit: "人", icon: Users, c: "#374151", bg: "#F9FAFB" },
          { label: "在職", value: stats.active, unit: "人", icon: UserCheck, c: "#16A34A", bg: "#F0FDF4" },
          { label: "離職", value: stats.inactive, unit: "人", icon: UserX, c: "#DC2626", bg: "#FEF2F2" },
          { label: "留停", value: stats.onleave, unit: "人", icon: AlertTriangle, c: "#CA8A04", bg: "#FEF9C3" },
          { label: "試用期", value: stats.probation, unit: "人", icon: Shield, c: "#3B82F6", bg: "#EFF6FF" },
          { label: "可登入", value: stats.loginEnabled, unit: "人", icon: Key, c: "#7C3AED", bg: "#F5F3FF" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.04em" }}>{item.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: item.c }} />
                </div>
              </div>
              <p className="tabular-nums" style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                {item.value}
                <span style={{ fontSize: "14px", fontWeight: 500, color: "#9CA3AF", marginLeft: 2 }}>{item.unit}</span>
              </p>
            </Card>
          );
        })}
      </div>

      {/* Main Table */}
      <Card className="flex-1 flex flex-col min-h-0">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 p-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
          <div className="relative flex-1" style={{ minWidth: 140 }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
            <input type="text" placeholder="搜尋姓名、員編、Email、部門..."
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
              value={filterStatus}
              onChange={v => { setFilterStatus(v as any); setPage(1); }}
              allLabel="全部狀態"
              options={Object.entries(STATUS_MAP).map(([k, v]) => ({ key: k, label: v.label }))}
              className="max-md:w-full"
            />
            {(searchTerm || filterDept !== "all" || filterStatus !== "all") && (
              <button className="px-3 py-2 rounded flex items-center gap-1.5"
                style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#9CA3AF" }}
                onClick={() => { setSearchTerm(""); setFilterDept("all"); setFilterStatus("all"); }}>
                <X className="w-3.5 h-3.5" />清除篩選
              </button>
            )}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: "13px", color: "#9CA3AF" }}>共 {filtered.length} 筆</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 overflow-auto">
          {/* Desktop header */}
          <div className="hidden md:grid px-5 py-2.5 sticky top-0" style={{
            gridTemplateColumns: "2.2fr 0.8fr 1.4fr 1fr 1fr 0.8fr",
            borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA",
          }}>
            {["姓名 / 員編", "部門 / 職位", "登入方式", "到職日", "狀態", "操作"].map(h => (
              <span key={h} style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em" }}>{h}</span>
            ))}
          </div>

          {paged.length === 0
            ? <div className="py-12 text-center" style={{ color: "#9CA3AF", fontSize: "14px" }}>找不到符合條件的員工</div>
            : paged.map((emp, idx) => (
                <div key={emp.id}>
                  {/* Desktop row */}
                  <div
                    className="hidden md:grid items-center px-5 py-3.5 group cursor-pointer"
                    style={{
                      gridTemplateColumns: "2.2fr 0.8fr 1.4fr 1fr 1fr 0.8fr",
                      borderBottomWidth: idx < paged.length - 1 ? "1px" : "0",
                      borderBottomStyle: "solid",
                      borderBottomColor: "#F9FAFB",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    onClick={() => setDetailTarget(emp)}>
                    <div className="flex items-center gap-3">
                      <Av name={emp.name} dept={emp.dept} size={36} />
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{emp.name}</p>
                        <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 1 }}>{emp.employeeNo} · {emp.email}</p>
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ fontSize: "12px", fontWeight: 600, background: DEPT_BG[emp.dept] || "#F3F4F6", color: DEPT_COLOR[emp.dept] || "#374151" }}>
                        {emp.dept}
                      </span>
                      <p style={{ fontSize: "12px", color: "#6B7280", marginTop: 2 }}>{emp.role}</p>
                    </div>
                    <LoginBadge method={emp.loginMethod} enabled={emp.loginEnabled} status={emp.status} />
                    <span className="tabular-nums" style={{ fontSize: "13px", color: "#374151" }}>{emp.hireDate}</span>
                    <StatusBadge s={emp.status} />
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(emp)} className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                        title="編輯"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toggleLogin(emp)} className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ color: emp.loginEnabled ? "#16A34A" : "#DC2626", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        title={emp.loginEnabled ? "停用登入" : "啟用登入"}>
                        {emp.loginEnabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}</button>
                      <button onClick={() => setDeleteTarget(emp)} className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                        title="刪除"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden px-4 py-3 cursor-pointer"
                    style={{ borderBottomWidth: idx < paged.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}
                    onClick={() => setDetailTarget(emp)}>
                    <div className="flex items-center gap-3">
                      <Av name={emp.name} dept={emp.dept} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{emp.name}</span>
                          <StatusBadge s={emp.status} />
                        </div>
                        <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 1 }}>{emp.employeeNo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-2 pl-[48px]">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: DEPT_BG[emp.dept] || "#F3F4F6", color: DEPT_COLOR[emp.dept] || "#374151" }}>{emp.dept}</span>
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>{emp.role}</span>
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>·</span>
                      <LoginBadge method={emp.loginMethod} enabled={emp.loginEnabled} status={emp.status} />
                    </div>
                    <div className="flex items-center justify-between mt-2 pl-[48px]">
                      <span className="tabular-nums" style={{ fontSize: "12px", color: "#6B7280" }}>到職 {emp.hireDate}</span>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(emp)} className="w-7 h-7 rounded flex items-center justify-center"
                          style={{ color: "#9CA3AF" }} title="編輯"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toggleLogin(emp)} className="w-7 h-7 rounded flex items-center justify-center"
                          style={{ color: emp.loginEnabled ? "#16A34A" : "#DC2626" }}
                          title={emp.loginEnabled ? "停用登入" : "啟用登入"}>
                          {emp.loginEnabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}</button>
                        <button onClick={() => setDeleteTarget(emp)} className="w-7 h-7 rounded flex items-center justify-center"
                          style={{ color: "#9CA3AF" }} title="刪除"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          }
        </div>
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>
      {/* Detail Slide-over */}
      {detailTarget && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0" style={{ background: "rgba(17,24,39,0.4)" }} onClick={() => setDetailTarget(null)} />
          <div className="relative w-full max-w-lg flex flex-col" style={{ background: "#FFF", boxShadow: "-4px 0 32px rgba(0,0,0,0.12)" }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
              <div className="flex items-center gap-3">
                <Av name={detailTarget.name} dept={detailTarget.dept} size={42} />
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>{detailTarget.name}</h2>
                  <p style={{ fontSize: "13px", color: "#9CA3AF" }}>{detailTarget.employeeNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { openEdit(detailTarget); setDetailTarget(null); }} className="px-3 py-1.5 rounded flex items-center gap-1.5"
                  style={{ fontSize: "13px", fontWeight: 500, background: "#F3F4F6", color: "#374151", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                  <Edit3 className="w-3.5 h-3.5" />編輯
                </button>
                <button onClick={() => setDetailTarget(null)} className="w-8 h-8 rounded flex items-center justify-center" style={{ color: "#9CA3AF" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge s={detailTarget.status} />
                <LoginBadge method={detailTarget.loginMethod} enabled={detailTarget.loginEnabled} status={detailTarget.status} />
                <PermBadge perms={detailTarget.permissions} />
              </div>
              <div className="space-y-4">
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", paddingBottom: 8 }}>基本資料</h3>
                {[
                  { icon: Building2, label: "部門", value: detailTarget.dept },
                  { icon: Shield, label: "職位 / 職級", value: `${detailTarget.role} · ${detailTarget.level}` },
                  { icon: Mail, label: "Email", value: detailTarget.email },
                  { icon: Phone, label: "電話", value: detailTarget.phone },
                  { icon: Calendar, label: "到職日", value: detailTarget.hireDate },
                ].map(row => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F9FAFB" }}>
                        <Icon className="w-4 h-4" style={{ color: "#9CA3AF" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>{row.label}</p>
                        <p style={{ fontSize: "14px", color: "#111827", marginTop: 1 }}>{row.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-4">
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", paddingBottom: 8 }}>登入資訊</h3>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F9FAFB" }}>
                    <Key className="w-4 h-4" style={{ color: "#9CA3AF" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>登入方式</p>
                    <p style={{ fontSize: "14px", color: "#111827", marginTop: 1 }}>{LOGIN_MAP[detailTarget.loginMethod].label}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F9FAFB" }}>
                    {detailTarget.loginEnabled ? <Unlock className="w-4 h-4" style={{ color: "#16A34A" }} /> : <Lock className="w-4 h-4" style={{ color: "#DC2626" }} />}
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>帳號狀態</p>
                    <p style={{ fontSize: "14px", color: detailTarget.loginEnabled ? "#15803D" : "#DC2626", marginTop: 1, fontWeight: 600 }}>
                      {detailTarget.loginEnabled ? "已啟用" : "已停用"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F9FAFB" }}>
                    <Calendar className="w-4 h-4" style={{ color: "#9CA3AF" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>最後登入</p>
                    <p style={{ fontSize: "14px", color: "#111827", marginTop: 1 }}>{detailTarget.lastLogin ?? "從未登入"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", paddingBottom: 8 }}>快速操作</h3>
                <button onClick={() => { toggleLogin(detailTarget); setDetailTarget({ ...detailTarget, loginEnabled: !detailTarget.loginEnabled }); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
                  style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#374151", textAlign: "left" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#F9FAFB"; }}>
                  {detailTarget.loginEnabled ? <Lock className="w-4 h-4" style={{ color: "#DC2626" }} /> : <Unlock className="w-4 h-4" style={{ color: "#16A34A" }} />}
                  {detailTarget.loginEnabled ? "停用登入權限" : "啟用登入權限"}
                </button>
                <button onClick={() => showToast(`已發送密碼重設信件至 ${detailTarget.email}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
                  style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#374151", textAlign: "left" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#F9FAFB"; }}>
                  <Mail className="w-4 h-4" style={{ color: "#3B82F6" }} />
                  發送密碼重設信件
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && <EmployeeModal employee={editTarget} onSave={saveEmployee} onClose={() => setShowModal(false)} iStyle={iStyle} lStyle={lStyle} />}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0" style={{ background: "rgba(17,24,39,0.4)" }} onClick={() => setDeleteTarget(null)} />
          <div className="relative p-6 rounded-lg" style={{ background: "#FFF", maxWidth: 400, width: "90%", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "#FEF2F2" }}>
              <Trash2 className="w-5 h-5" style={{ color: "#DC2626" }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "8px", textAlign: "center" }}>確認刪除此員工？</h3>
            <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6, textAlign: "center" }}>
              即將刪除 <strong style={{ color: "#111827" }}>{deleteTarget.name}</strong>（{deleteTarget.employeeNo}）的所有資料，此操作無法復原。
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 rounded"
                style={{ fontSize: "14px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", fontFamily: "inherit" }}>
                取消
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2 rounded"
                style={{ fontSize: "14px", fontWeight: 600, background: "#DC2626", color: "#FFF", fontFamily: "inherit" }}>
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Employee Modal ───────────────────────────────────────────────────────────
function EmployeeModal({
  employee, onSave, onClose, iStyle, lStyle,
}: {
  employee: Employee | null;
  onSave: (data: Employee) => void;
  onClose: () => void;
  iStyle: React.CSSProperties;
  lStyle: React.CSSProperties;
}) {
  const isEdit = !!employee;
  const [form, setForm] = useState<Employee>(employee ?? {
    id: 0, employeeNo: `EMP-${String(Date.now()).slice(-3)}`, name: "", email: "", phone: "",
    dept: "資訊部", role: "", level: "L3 專員", status: "active",
    hireDate: "2026-03-12", loginMethod: "email", loginEnabled: true, lastLogin: null,
    permissions: defaultPermsForLevel("L3 專員"),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalTab, setModalTab] = useState<"basic" | "perms">("basic");
  const set = (k: keyof Employee) => (v: any) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "請輸入姓名";
    if (!form.email.trim()) e.email = "請輸入 Email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email 格式不正確";
    if (!form.role.trim()) e.role = "請輸入職位";
    if (!form.phone.trim()) e.phone = "請輸入電話";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => { if (validate()) onSave(form); };

  const togglePerm = (modKey: string, action: PermAction) => {
    setForm(f => {
      const perms = { ...f.permissions };
      perms[modKey] = { ...perms[modKey], [action]: !perms[modKey][action] };
      return { ...f, permissions: perms };
    });
  };

  const toggleModuleAll = (modKey: string) => {
    setForm(f => {
      const mp = f.permissions[modKey];
      const allOn = PERM_ACTIONS.every(a => mp[a.key]);
      const perms = { ...f.permissions };
      perms[modKey] = { view: !allOn, create: !allOn, edit: !allOn, delete: !allOn, export: !allOn };
      return { ...f, permissions: perms };
    });
  };

  const toggleActionAll = (action: PermAction) => {
    setForm(f => {
      const allOn = PERM_MODULES.every(m => f.permissions[m.key][action]);
      const perms = { ...f.permissions };
      PERM_MODULES.forEach(m => { perms[m.key] = { ...perms[m.key], [action]: !allOn }; });
      return { ...f, permissions: perms };
    });
  };

  const applyModalPreset = (presetKey: string) => {
    const preset = ROLE_PRESETS.find(p => p.key === presetKey);
    if (!preset) return;
    setForm(f => ({ ...f, permissions: preset.gen() }));
  };

  const { granted, total } = countPermissions(form.permissions);
  const currentPreset = matchesPreset(form.permissions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center max-md:p-0 p-4">
      <div className="absolute inset-0" style={{ background: "rgba(17,24,39,0.4)" }} onClick={onClose} />
      <div className="relative w-full max-w-3xl flex flex-col rounded-lg overflow-hidden max-md:max-w-none max-md:h-full max-md:rounded-none"
        style={{ background: "#FFF", maxHeight: "90vh", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>{isEdit ? "編輯員工" : "新增員工"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded flex items-center justify-center" style={{ color: "#9CA3AF" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal tabs */}
        <div className="px-6 pb-0">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
            {([
              { key: "basic" as const, label: "基本資料與登入" },
              { key: "perms" as const, label: `權限設定 (${granted}/${total})` },
            ]).map(t => {
              const active = modalTab === t.key;
              return (
                <button key={t.key} onClick={() => setModalTab(t.key)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
                  style={{ fontSize: "13px", fontWeight: active ? 600 : 500, background: active ? "#111827" : "transparent", color: active ? "#FFF" : "#6B7280", boxShadow: active ? "0 1px 4px rgba(0,0,0,0.15)" : "none" }}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-md:p-4 space-y-5">
          {modalTab === "basic" && (
            <>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: 12, borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", paddingBottom: 8 }}>基本資料</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={lStyle}>員工編號</label>
                    <input style={{ ...iStyle, background: "#F3F4F6", color: "#9CA3AF" }} value={form.employeeNo} readOnly />
                  </div>
                  <div>
                    <label style={lStyle}>姓名 *</label>
                    <input style={iStyle} value={form.name} onChange={e => set("name")(e.target.value)} placeholder="請輸入姓名" />
                    {errors.name && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: 3 }}>{errors.name}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label style={lStyle}>Email *</label>
                    <input style={iStyle} type="email" value={form.email} onChange={e => set("email")(e.target.value)} placeholder="name@company.com" />
                    {errors.email && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: 3 }}>{errors.email}</p>}
                  </div>
                  <div>
                    <label style={lStyle}>電話 *</label>
                    <input style={iStyle} value={form.phone} onChange={e => set("phone")(e.target.value)} placeholder="0912-345-678" />
                    {errors.phone && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: 3 }}>{errors.phone}</p>}
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: 12, borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", paddingBottom: 8 }}>組織資訊</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={lStyle}>部門</label>
                    <StyledSelect value={form.dept} onChange={v => set("dept")(v)}
                      options={DEPTS.map(d => ({ key: d, label: d }))} formField />
                  </div>
                  <div>
                    <label style={lStyle}>職位 *</label>
                    <input style={iStyle} value={form.role} onChange={e => set("role")(e.target.value)} placeholder="請輸入職位" />
                    {errors.role && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: 3 }}>{errors.role}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label style={lStyle}>職級</label>
                    <StyledSelect value={form.level} onChange={v => set("level")(v)}
                      options={LEVELS.map(l => ({ key: l, label: l }))} formField />
                  </div>
                  <div>
                    <label style={lStyle}>到職日</label>
                    <DatePicker value={form.hireDate} onChange={v => set("hireDate")(v)} placeholder="選擇到職日" formField />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label style={lStyle}>員工狀態</label>
                    <StyledSelect value={form.status} onChange={v => set("status")(v as EmpStatus)}
                      options={Object.entries(STATUS_MAP).map(([k, v]) => ({ key: k, label: v.label }))} formField />
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: 12, borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", paddingBottom: 8 }}>登入設定</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={lStyle}>登入方式</label>
                    <StyledSelect value={form.loginMethod} onChange={v => set("loginMethod")(v as LoginMethod)}
                      options={Object.entries(LOGIN_MAP).map(([k, v]) => ({ key: k, label: v.label }))} formField />
                  </div>
                  <div>
                    <label style={lStyle}>登入權限</label>
                    <div className="flex items-center gap-3 mt-1">
                      <button onClick={() => set("loginEnabled")(!form.loginEnabled)}
                        style={{ width: 42, height: 24, flexShrink: 0, background: form.loginEnabled ? "#111827" : "#D1D5DB", borderRadius: 12, border: "none", cursor: "pointer", padding: 0, position: "relative", transition: "background 0.18s" }}>
                        <span style={{ position: "absolute", top: 3, left: form.loginEnabled ? 21 : 3, width: 18, height: 18, background: "#FFF", borderRadius: "50%", transition: "left 0.18s", boxShadow: "0 1px 4px rgba(0,0,0,0.22)" }} />
                      </button>
                      <span style={{ fontSize: "14px", color: form.loginEnabled ? "#15803D" : "#DC2626", fontWeight: 600 }}>
                        {form.loginEnabled ? "已啟用" : "已停用"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                  <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.7 }}>
                    {form.loginMethod === "email" && "員工使用 Email 和密碼登入系統，系統將自動發送帳號啟用信件。"}
                    {form.loginMethod === "google" && "員工使用公 Google Workspace 帳號透過 OAuth 2.0 進行單一登入。"}
                    {form.loginMethod === "microsoft" && "員工使用公司 Microsoft 365 帳號透過 Azure AD 進行單一登入。"}
                    {form.loginMethod === "sso" && "員工使用企業 SAML/OIDC 協定透過指定身分提供者進行單一登入。"}
                  </p>
                </div>
              </div>
            </>
          )}

          {modalTab === "perms" && (
            <>
              {/* Role selection cards */}
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: 12, borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", paddingBottom: 8 }}>選擇角色範本</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ROLE_PRESETS.map(pr => {
                    const isActive = currentPreset === pr.label;
                    const presetPerms = pr.gen();
                    const { granted: pGranted, total: pTotal } = countPermissions(presetPerms);
                    return (
                      <button key={pr.key} onClick={() => applyModalPreset(pr.key)}
                        className="p-4 rounded-lg text-left transition-all cursor-pointer"
                        style={{
                          background: isActive ? pr.bg : "#FAFAFA",
                          borderWidth: "2px", borderStyle: "solid",
                          borderColor: isActive ? pr.color : "#E5E7EB",
                          boxShadow: isActive ? `0 0 0 1px ${pr.color}20` : "none",
                        }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: isActive ? `${pr.color}18` : "#F3F4F6" }}>
                            <ShieldCheck className="w-3.5 h-3.5" style={{ color: isActive ? pr.color : "#9CA3AF" }} />
                          </div>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: isActive ? pr.color : "#374151" }}>{pr.label}</span>
                          {isActive && (
                            <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ background: pr.color }}>
                              <Check className="w-3 h-3" style={{ color: "#FFF" }} />
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: "12px", color: isActive ? pr.color : "#9CA3AF", lineHeight: 1.5 }}>{pr.desc}</p>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: 4 }}>{pGranted} / {pTotal} 項權限</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Read-only permissions preview */}
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: 12, borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", paddingBottom: 8 }}>
                  權限預覽
                  <span style={{ fontSize: "12px", fontWeight: 500, color: "#9CA3AF", marginLeft: 8 }}>（由角色範本決定，不可個別編輯）</span>
                </h3>
                <div className="overflow-x-auto">
                  <div className="rounded-lg overflow-hidden" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", minWidth: 540 }}>
                    <div className="grid items-center px-4 py-2.5" style={{ gridTemplateColumns: "1.8fr repeat(5, 1fr)", background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF" }}>模組</span>
                      {PERM_ACTIONS.map(a => <span key={a.key} className="text-center" style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF" }}>{a.label}</span>)}
                    </div>
                    {PERM_MODULES.map((mod, mi) => {
                      const Icon = mod.icon;
                      const mp = form.permissions[mod.key];
                      const allOn = PERM_ACTIONS.every(a => mp[a.key]);
                      return (
                        <div key={mod.key} className="grid items-center px-4 py-2" style={{ gridTemplateColumns: "1.8fr repeat(5, 1fr)", borderBottomWidth: mi < PERM_MODULES.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: allOn ? "#FAFBFF" : "transparent" }}>
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" style={{ color: "#9CA3AF" }} />
                            <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{mod.label}</span>
                          </div>
                          {PERM_ACTIONS.map(a => (
                            <div key={a.key} className="flex justify-center">
                              {mp[a.key]
                                ? <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "#111827" }}>
                                    <Check className="w-3 h-3" style={{ color: "#FFF" }} />
                                  </div>
                                : <div className="w-5 h-5 rounded" style={{ background: "#F3F4F6", borderWidth: "1.5px", borderStyle: "solid", borderColor: "#E5E7EB" }} />
                              }
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-6 max-md:px-4 py-4 gap-3 max-md:flex-col-reverse" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}>
          <div className="max-md:hidden">{modalTab === "perms" && <span style={{ fontSize: "13px", color: "#9CA3AF" }}>已啟用 <strong style={{ color: "#374151" }}>{granted}</strong> / {total} 項權限</span>}</div>
          <div className="flex items-center gap-3 max-md:w-full">
            <button onClick={onClose} className="px-5 py-2 rounded max-md:flex-1" style={{ fontSize: "14px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", fontFamily: "inherit" }}>取消</button>
            <button onClick={submit} className="px-5 py-2 rounded flex items-center justify-center gap-2 max-md:flex-1" style={{ fontSize: "14px", fontWeight: 600, background: "#111827", color: "#FFF", fontFamily: "inherit" }}>{isEdit ? "儲存變更" : "建立員工"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}