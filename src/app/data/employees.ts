import React from "react";
import {
  LayoutDashboard, Receipt, Clock, FolderKanban, Bell,
  CheckSquare, Package, Fingerprint, Settings, Mail, Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type EmpStatus = "active" | "inactive" | "onleave" | "probation";
export type LoginMethod = "email" | "google" | "microsoft" | "sso";
export type PermAction = "view" | "create" | "edit" | "delete" | "export";

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export interface Employee {
  id: number;
  employeeNo: string;
  name: string;
  email: string;
  phone: string;
  dept: string;
  role: string;
  level: string;
  status: EmpStatus;
  hireDate: string;
  loginMethod: LoginMethod;
  loginEnabled: boolean;
  lastLogin: string | null;
  avatar?: string;
  permissions: Record<string, ModulePermission>;
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const DEPTS = ["資訊部", "財務部", "人事部", "業務部", "行銷部", "營運部", "設計部", "法務部", "專案管理部", "產品管理部"];
export const LEVELS = ["L1 實習生", "L2 初級專員", "L3 專員", "L4 資深專員", "L5 主管", "L6 經理", "L7 副總", "L8 總經理"];

export const STATUS_MAP: Record<EmpStatus, { label: string; bg: string; color: string; dot: string }> = {
  active:    { label: "在職", bg: "#F0FDF4", color: "#15803D", dot: "#16A34A" },
  inactive:  { label: "離職", bg: "#FEF2F2", color: "#DC2626", dot: "#DC2626" },
  onleave:   { label: "留停", bg: "#FEF9C3", color: "#A16207", dot: "#CA8A04" },
  probation: { label: "試用期", bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6" },
};

export const LOGIN_MAP: Record<LoginMethod, { label: string; color: string }> = {
  email:     { label: "Email 密碼", color: "#374151" },
  google:    { label: "Google SSO", color: "#EA4335" },
  microsoft: { label: "Microsoft 365", color: "#0078D4" },
  sso:       { label: "企業 SAML SSO", color: "#7C3AED" },
};

export const DEPT_BG: Record<string, string> = {
  "資訊部": "#EFF6FF", "財務部": "#FEF9C3", "人事部": "#F0FDF4",
  "業務部": "#FEF2F2", "行銷部": "#F5F3FF", "營運部": "#FFF7ED",
  "設計部": "#FCE7F3", "法務部": "#F0F9FF", "專案管理部": "#E0E7FF",
  "產品管理部": "#F5F3FF",
};

export const DEPT_COLOR: Record<string, string> = {
  "資訊部": "#1D4ED8", "財務部": "#A16207", "人事部": "#15803D",
  "業務部": "#DC2626", "行銷部": "#7C3AED", "營運部": "#C2410C",
  "設計部": "#BE185D", "法務部": "#0369A1", "專案管理部": "#4338CA",
  "產品管理部": "#0891B2",
};

// ── Permission modules & actions ──
export const PERM_MODULES: { key: string; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
  { key: "dashboard",     label: "總覽",     icon: LayoutDashboard },
  { key: "punch",         label: "打卡",     icon: Fingerprint },
  { key: "finance",       label: "財務管理", icon: Receipt },
  { key: "attendance",    label: "出缺勤",   icon: Clock },
  { key: "projects",      label: "專案管理", icon: FolderKanban },
  { key: "announcements", label: "最新公告", icon: Bell },
  { key: "tasks",         label: "工作事項", icon: CheckSquare },
  { key: "assets",        label: "資產管理", icon: Package },
  { key: "employees",     label: "員工管理", icon: Users },
  { key: "notifications", label: "訊息中心", icon: Mail },
  { key: "settings",      label: "系統設定", icon: Settings },
];

export const PERM_ACTIONS: { key: PermAction; label: string }[] = [
  { key: "view",   label: "檢視" },
  { key: "create", label: "新增" },
  { key: "edit",   label: "編輯" },
  { key: "delete", label: "刪除" },
  { key: "export", label: "匯出" },
];

// ── Permission presets ──
export const fullPerms = (): ModulePermission => ({ view: true, create: true, edit: true, delete: true, export: true });
export const viewOnly  = (): ModulePermission => ({ view: true, create: false, edit: false, delete: false, export: false });
export const noPerms   = (): ModulePermission => ({ view: false, create: false, edit: false, delete: false, export: false });
export const viewEdit  = (): ModulePermission => ({ view: true, create: true, edit: true, delete: false, export: false });
export const viewEditExport = (): ModulePermission => ({ view: true, create: true, edit: true, delete: false, export: true });

export function allModulesPerms(fn: () => ModulePermission): Record<string, ModulePermission> {
  const r: Record<string, ModulePermission> = {};
  PERM_MODULES.forEach(m => { r[m.key] = fn(); });
  return r;
}

export const ROLE_PRESETS: { key: string; label: string; desc: string; color: string; bg: string; gen: () => Record<string, ModulePermission> }[] = [
  { key: "admin",   label: "系統管理員", desc: "所有模組完整存取權限",             color: "#7C3AED", bg: "#F5F3FF", gen: () => allModulesPerms(fullPerms) },
  { key: "manager", label: "部門主管",   desc: "檢視、新增、編輯、匯出（無刪除）", color: "#1D4ED8", bg: "#EFF6FF", gen: () => allModulesPerms(viewEditExport) },
  { key: "finance_manager", label: "財務主管", desc: "財務與資產完整管理，其餘模組僅檢視", color: "#A16207", bg: "#FEF9C3", gen: () => {
    const p = allModulesPerms(viewOnly);
    p.finance  = fullPerms();
    p.assets   = viewEditExport();
    p.projects = noPerms();
    p.tasks    = viewOnly();
    p.announcements = viewOnly();
    p.punch    = viewOnly();
    p.notifications = viewOnly();
    p.dashboard = noPerms();
    p.employees = noPerms();
    p.settings  = noPerms();
    return p;
  }},
  { key: "hr_manager", label: "人資主管", desc: "出缺勤與公告完整管理，資產可編輯", color: "#15803D", bg: "#F0FDF4", gen: () => {
    const p = allModulesPerms(viewOnly);
    p.attendance    = fullPerms();
    p.announcements = viewEditExport();
    p.assets   = viewEditExport();
    p.punch    = viewEditExport();
    p.projects = noPerms();
    p.tasks    = viewOnly();
    p.notifications = viewOnly();
    p.dashboard = noPerms();
    p.finance   = noPerms();
    p.employees = noPerms();
    p.settings  = noPerms();
    return p;
  }},
  { key: "pm", label: "專案經理", desc: "任務編輯管理，其模組僅檢視", color: "#4338CA", bg: "#EEF2FF", gen: () => {
    const p = allModulesPerms(noPerms);
    p.tasks         = fullPerms();
    p.announcements = viewOnly();
    p.punch         = viewOnly();
    p.notifications = viewOnly();
    return p;
  }},
  { key: "product_manager", label: "產品經理", desc: "專案管理與工作事項，打卡與公告", color: "#0891B2", bg: "#ECFEFF", gen: () => {
    const p = allModulesPerms(noPerms);
    p.projects      = fullPerms();
    p.tasks         = viewOnly();
    p.announcements = viewOnly();
    p.punch         = viewOnly();
    p.notifications = viewOnly();
    return p;
  }},
  { key: "staff",   label: "一般員工",   desc: "檢視與基本編輯權限",               color: "#0369A1", bg: "#F0F9FF", gen: () => {
    const p = allModulesPerms(viewEdit);
    p.employees = viewOnly();
    p.settings  = noPerms();
    return p;
  }},
  { key: "viewer",  label: "僅檢視",     desc: "所有模組僅可檢視",                 color: "#CA8A04", bg: "#FEF9C3", gen: () => allModulesPerms(viewOnly) },
  { key: "none",    label: "無權限",     desc: "無任何模組權限",                   color: "#DC2626", bg: "#FEF2F2", gen: () => allModulesPerms(noPerms) },
];

export function defaultPermsForLevel(level: string): Record<string, ModulePermission> {
  const find = (k: string) => ROLE_PRESETS.find(p => p.key === k)!.gen();
  if (level.startsWith("L8") || level.startsWith("L7")) return find("admin");
  if (level.startsWith("L6") || level.startsWith("L5")) return find("manager");
  if (level.startsWith("L4") || level.startsWith("L3")) return find("staff");
  if (level.startsWith("L2")) return find("viewer");
  return find("none");
}

// ── Perm helpers ──
export function countPermissions(perms: Record<string, ModulePermission>): { total: number; granted: number } {
  let total = 0, granted = 0;
  Object.values(perms).forEach(mp => {
    PERM_ACTIONS.forEach(a => { total++; if (mp[a.key]) granted++; });
  });
  return { total, granted };
}

export function getPermLevel(perms: Record<string, ModulePermission>): { label: string; color: string; bg: string } {
  const { total, granted } = countPermissions(perms);
  if (granted === total)  return { label: "完整權限", color: "#7C3AED", bg: "#F5F3FF" };
  if (granted === 0)      return { label: "無權限",   color: "#DC2626", bg: "#FEF2F2" };
  const ratio = granted / total;
  if (ratio > 0.7) return { label: "高權限", color: "#1D4ED8", bg: "#EFF6FF" };
  if (ratio > 0.3) return { label: "中權限", color: "#CA8A04", bg: "#FEF9C3" };
  return { label: "低權限", color: "#C2410C", bg: "#FFF7ED" };
}

export function matchesPreset(perms: Record<string, ModulePermission>): string | null {
  for (const preset of ROLE_PRESETS) {
    const presetPerms = preset.gen();
    let match = true;
    for (const mod of PERM_MODULES) {
      for (const a of PERM_ACTIONS) {
        if ((perms[mod.key]?.[a.key] ?? false) !== presetPerms[mod.key][a.key]) {
          match = false;
          break;
        }
      }
      if (!match) break;
    }
    if (match) return preset.label;
  }
  return null;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mkEmp = (
  id: number, no: string, name: string, email: string, phone: string,
  dept: string, role: string, level: string, status: EmpStatus,
  hireDate: string, loginMethod: LoginMethod, loginEnabled: boolean, lastLogin: string | null,
): Employee => ({
  id, employeeNo: no, name, email, phone, dept, role, level, status,
  hireDate, loginMethod, loginEnabled, lastLogin,
  permissions: defaultPermsForLevel(level),
});

export const EMPLOYEES: Employee[] = [
  mkEmp(1,  "EMP-001", "王大明", "wang.dm@company.com",  "0912-345-678", "資訊部", "前端工程師",     "L4 資深專員", "active",    "2021-03-15", "email",     true,  "2026-03-12 09:02"),
  mkEmp(2,  "EMP-002", "林美玲", "lin.ml@company.com",   "0923-456-789", "財務部", "會計師",         "L4 資深專員", "active",    "2020-07-01", "google",    true,  "2026-03-12 08:45"),
  mkEmp(3,  "EMP-003", "陳志豪", "chen.zh@company.com",  "0934-567-890", "業務部", "業務經理",       "L6 經理",     "active",    "2019-01-10", "microsoft", true,  "2026-03-11 17:30"),
  mkEmp(4,  "EMP-004", "張雅婷", "chang.yt@company.com", "0945-678-901", "人事部", "人資專員",       "L3 專員",     "active",    "2022-09-05", "email",     true,  "2026-03-12 08:55"),
  mkEmp(5,  "EMP-005", "劉建宏", "liu.jh@company.com",   "0956-789-012", "資訊部", "後端工程師",     "L4 資深專員", "active",    "2021-06-20", "sso",       true,  "2026-03-12 09:10"),
  mkEmp(6,  "EMP-006", "黃淑芬", "huang.sf@company.com", "0967-890-123", "行銷部", "行銷企劃",       "L3 專員",     "onleave",   "2022-02-14", "google",    false, "2026-01-15 10:00"),
  mkEmp(7,  "EMP-007", "吳俊傑", "wu.jj@company.com",    "0978-901-234", "營運部", "營運主管",       "L5 主管",     "active",    "2020-11-01", "microsoft", true,  "2026-03-12 08:30"),
  mkEmp(8,  "EMP-008", "許雅琪", "hsu.yc@company.com",   "0989-012-345", "設計部", "UI設計師",       "L3 專員",     "probation", "2026-01-15", "email",     true,  "2026-03-12 09:20"),
  mkEmp(9,  "EMP-009", "楊宗翰", "yang.zh@company.com",  "0910-123-456", "資訊部", "資料工程師",     "L4 資深專員", "active",    "2021-08-01", "sso",       true,  "2026-03-11 18:00"),
  mkEmp(10, "EMP-010", "蔡佳穎", "tsai.jy@company.com",  "0921-234-567", "法務部", "法務專員",       "L3 專員",     "active",    "2023-04-10", "email",     true,  "2026-03-12 08:40"),
  mkEmp(11, "EMP-011", "周承翰", "chou.ch@company.com",  "0932-345-678", "業務部", "業務專員",       "L2 初級專員", "active",    "2024-06-01", "google",    true,  "2026-03-12 09:05"),
  mkEmp(12, "EMP-012", "鄭曉萱", "cheng.xx@company.com", "0943-456-789", "財務部", "出納",           "L3 專員",     "active",    "2022-12-01", "email",     true,  "2026-03-12 08:50"),
  mkEmp(13, "EMP-013", "何家豪", "he.jh@company.com",    "0954-567-890", "專案管理部", "專案經理",      "L5 主管",     "active",    "2019-09-15", "sso",       true,  "2026-03-12 07:50"),
  mkEmp(14, "EMP-014", "方怡君", "fang.yj@company.com",  "0965-678-901", "人事部", "人資主管",       "L5 主管",     "active",    "2018-05-01", "microsoft", true,  "2026-03-12 08:35"),
  mkEmp(15, "EMP-015", "羅志偉", "luo.zw@company.com",   "0976-789-012", "營運部", "倉儲管理員",     "L2 初級專員", "inactive",  "2020-03-20", "email",     false, "2025-12-31 17:00"),
  mkEmp(16, "EMP-016", "簡佩珊", "jian.ps@company.com",  "0987-890-123", "行銷部", "社群行銷",       "L3 專員",     "active",    "2023-08-15", "google",    true,  "2026-03-12 09:15"),
  mkEmp(17, "EMP-017", "蘇冠宇", "su.gy@company.com",    "0918-901-234", "設計部", "產品設計師",     "L4 資深專員", "active",    "2021-11-20", "email",     true,  "2026-03-12 09:00"),
  mkEmp(18, "EMP-018", "葉心怡", "yeh.xy@company.com",   "0929-012-345", "財務部", "財務分析師",     "L4 資深專員", "active",    "2022-01-10", "microsoft", true,  "2026-03-12 08:55"),
  mkEmp(19, "EMP-019", "潘國強", "pan.gq@company.com",   "0940-123-456", "法務部", "法務主管",       "L5 主管",     "active",    "2019-06-01", "sso",       true,  "2026-03-11 16:30"),
  mkEmp(20, "EMP-020", "謝欣霓", "hsieh.xn@company.com", "0951-234-567", "業務部", "客戶經理",       "L4 資深專員", "active",    "2020-10-15", "google",    true,  "2026-03-12 08:25"),
  mkEmp(21, "EMP-021", "林佳慧", "lin.jh2@company.com",  "0962-345-678", "資訊部", "QA 測試工程師",  "L3 專員",     "probation", "2026-02-01", "email",     true,  "2026-03-12 09:30"),
  mkEmp(22, "EMP-022", "孫偉翔", "sun.wx@company.com",   "0973-456-789", "營運部", "物流協調",       "L3 專員",     "active",    "2023-03-01", "email",     true,  "2026-03-12 08:15"),
  mkEmp(23, "EMP-023", "李美玲", "li.ml@company.com",    "0984-567-890", "財務部", "財務主管",       "L5 主管",     "active",    "2017-04-01", "microsoft", true,  "2026-03-12 08:20"),
  mkEmp(24, "EMP-024", "陳雅婷", "chen.yt@company.com",  "0915-678-901", "人事部", "人資主管",       "L5 主管",     "active",    "2018-02-15", "microsoft", true,  "2026-03-12 08:30"),
  mkEmp(25, "EMP-025", "張小華", "zhang.xh@company.com", "0926-345-678", "產品管理部", "產品經理",     "L5 主管",     "active",    "2020-08-01", "sso",       true,  "2026-03-12 08:45"),
];