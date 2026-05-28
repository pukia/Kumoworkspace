import React, { createContext, useContext, useState, useCallback } from "react";

// ─── Role Types ───────────────────────────────────────────────────────────────
export type UserRole = "admin" | "finance_manager" | "hr_manager" | "pm" | "product_manager" | "staff";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  dept: string;
  role: string;
  level: string;
  userRole: UserRole;
}

// ─── Fine-grained permissions ─────────────────────────────────────────────────
export interface Permissions {
  /** 頁面存取 */
  canViewDashboard: boolean;      // 總覽
  canViewFinance: boolean;        // 財務管理
  canViewAssets: boolean;         // 資產管理
  canViewAttendance: boolean;     // 出缺勤頁面存取（僅 admin / hr_manager）
  canViewAllAttendance: boolean;  // 全公司出缺勤（否則只能看自己）
  canViewProjects: boolean;       // 專案管理（唯讀或完整）
  canViewTasks: boolean;          // 工作事項（唯讀或完整）
  canViewAnnouncements: boolean;  // 最新公告
  canViewEmployees: boolean;      // 員工管理
  canViewPermissions: boolean;    // 權限管理
  canViewSettings: boolean;       // 系統設定

  /** 操作權限 */
  canPublishAnnouncement: boolean;  // 發佈/編輯公告
  canEditProject: boolean;          // 新增/編輯專案
  canEditTask: boolean;             // 新增/編輯/拖曳工作事項
}

const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  admin: {
    canViewDashboard: true,
    canViewFinance: true,
    canViewAssets: true,
    canViewAttendance: true,
    canViewAllAttendance: true,
    canViewProjects: true,
    canViewTasks: true,
    canViewAnnouncements: true,
    canViewEmployees: true,
    canViewPermissions: true,
    canViewSettings: true,
    canPublishAnnouncement: true,
    canEditProject: true,
    canEditTask: true,
  },
  finance_manager: {
    canViewDashboard: false,
    canViewFinance: true,
    canViewAssets: true,
    canViewAttendance: false,
    canViewAllAttendance: false,
    canViewProjects: false,
    canViewTasks: true,
    canViewAnnouncements: true,
    canViewEmployees: false,
    canViewPermissions: false,
    canViewSettings: true,
    canPublishAnnouncement: false,
    canEditProject: false,
    canEditTask: false,
  },
  hr_manager: {
    canViewDashboard: false,
    canViewFinance: false,
    canViewAssets: true,
    canViewAttendance: true,
    canViewAllAttendance: true,
    canViewProjects: false,
    canViewTasks: true,
    canViewAnnouncements: true,
    canViewEmployees: false,
    canViewPermissions: false,
    canViewSettings: true,
    canPublishAnnouncement: true,
    canEditProject: false,
    canEditTask: false,
  },
  pm: {
    canViewDashboard: false,
    canViewFinance: false,
    canViewAssets: false,
    canViewAttendance: false,
    canViewAllAttendance: false,
    canViewProjects: false,
    canViewTasks: true,
    canViewAnnouncements: true,
    canViewEmployees: false,
    canViewPermissions: false,
    canViewSettings: true,
    canPublishAnnouncement: false,
    canEditProject: false,
    canEditTask: true,
  },
  product_manager: {
    canViewDashboard: false,
    canViewFinance: false,
    canViewAssets: false,
    canViewAttendance: false,
    canViewAllAttendance: false,
    canViewProjects: true,
    canViewTasks: true,
    canViewAnnouncements: true,
    canViewEmployees: false,
    canViewPermissions: false,
    canViewSettings: true,
    canPublishAnnouncement: false,
    canEditProject: true,
    canEditTask: false,
  },
  staff: {
    canViewDashboard: false,
    canViewFinance: false,
    canViewAssets: false,
    canViewAttendance: false,
    canViewAllAttendance: false,
    canViewProjects: false,
    canViewTasks: true,
    canViewAnnouncements: true,
    canViewEmployees: false,
    canViewPermissions: false,
    canViewSettings: true,
    canPublishAnnouncement: false,
    canEditProject: false,
    canEditTask: false,
  },
};

// ─── Demo Users ───────────────────────────────────────────────────────────────
export const DEMO_USERS: Record<UserRole, AuthUser> = {
  admin: {
    id: 0, name: "系統管理者", email: "admin@company.com",
    dept: "管理層", role: "系統管理者", level: "L8 總經理", userRole: "admin",
  },
  finance_manager: {
    id: 5, name: "李美玲", email: "li.ml@company.com",
    dept: "財務部", role: "財務主管", level: "L5 主管", userRole: "finance_manager",
  },
  hr_manager: {
    id: 8, name: "陳雅婷", email: "chen.yt@company.com",
    dept: "人資部", role: "人資主管", level: "L5 主管", userRole: "hr_manager",
  },
  pm: {
    id: 13, name: "何家豪", email: "he.jh@company.com",
    dept: "專案管理部", role: "專案經理", level: "L5 主管", userRole: "pm",
  },
  product_manager: {
    id: 25, name: "張小華", email: "zhang.xh@company.com",
    dept: "產品管理部", role: "產品經理", level: "L5 主管", userRole: "product_manager",
  },
  staff: {
    id: 1, name: "王大明", email: "wang.dm@company.com",
    dept: "資訊部", role: "前端工程師", level: "L3 專員", userRole: "staff",
  },
};

// ─── Role display info ────────────────────────────────────────────────────────
export const ROLE_INFO: Record<UserRole, { label: string; desc: string; color: string; bg: string; icon: string }> = {
  admin:           { label: "系統管理者", desc: "完整系統存取權限",             color: "#7C3AED", bg: "#F5F3FF", icon: "crown" },
  finance_manager: { label: "財務主管",   desc: "財務管理與資產管理",           color: "#CA8A04", bg: "#FEF9C3", icon: "banknote" },
  hr_manager:      { label: "人資主管",   desc: "全公司出缺勤、資產與公告發佈", color: "#C2410C", bg: "#FFF7ED", icon: "users" },
  pm:              { label: "專案經理",   desc: "工作事項編輯",                 color: "#1D4ED8", bg: "#EFF6FF", icon: "folder" },
  product_manager: { label: "產品經理",   desc: "專案管理與產品規劃",           color: "#0891B2", bg: "#ECFEFF", icon: "box" },
  staff:           { label: "一般員工",   desc: "打卡與基本功能",              color: "#15803D", bg: "#F0FDF4", icon: "user" },
};

// ─── Build route access from permissions ─────────────────────────────────────
function buildNavAccess(perms: Permissions): string[] {
  const paths: string[] = ["/punch", "/notifications"]; // everyone can access
  if (perms.canViewDashboard)     paths.push("/");
  if (perms.canViewFinance)       paths.push("/finance");
  if (perms.canViewAssets)        paths.push("/assets");
  if (perms.canViewAttendance)    paths.push("/attendance");
  if (perms.canViewProjects)      paths.push("/projects");
  if (perms.canViewTasks)         paths.push("/tasks");
  if (perms.canViewAnnouncements) paths.push("/announcements");
  if (perms.canViewEmployees)     paths.push("/employees");
  if (perms.canViewPermissions)   paths.push("/permissions");
  if (perms.canViewSettings)      paths.push("/settings");
  return [...new Set(paths)];
}

export const NAV_ACCESS: Record<UserRole, string[]> = {
  admin:           [...buildNavAccess(ROLE_PERMISSIONS.admin), "/design-system", "/design-system-2", "/spec"],
  finance_manager: buildNavAccess(ROLE_PERMISSIONS.finance_manager),
  hr_manager:      buildNavAccess(ROLE_PERMISSIONS.hr_manager),
  pm:              buildNavAccess(ROLE_PERMISSIONS.pm),
  product_manager: buildNavAccess(ROLE_PERMISSIONS.product_manager),
  staff:           buildNavAccess(ROLE_PERMISSIONS.staff),
};

// ─── Context ─────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: AuthUser | null;
  permissions: Permissions;
  login: (role: UserRole) => void;
  logout: () => void;
  hasAccess: (path: string) => boolean;
  /** 預設首頁路徑 (admin → "/" 其他 → "/punch") */
  homePath: string;
}

const NULL_PERMS: Permissions = {
  canViewDashboard: false, canViewFinance: false, canViewAssets: false,
  canViewAttendance: false, canViewAllAttendance: false, canViewProjects: false,
  canViewTasks: false, canViewAnnouncements: false, canViewEmployees: false,
  canViewPermissions: false, canViewSettings: false, canPublishAnnouncement: false,
  canEditProject: false, canEditTask: false,
};

const ALL_ROLES: UserRole[] = ["admin", "finance_manager", "hr_manager", "pm", "product_manager", "staff"];

const AuthContext = createContext<AuthContextType>({
  user: null,
  permissions: NULL_PERMS,
  login: () => {},
  logout: () => {},
  hasAccess: () => false,
  homePath: "/punch",
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem("auth_role");
      if (stored && ALL_ROLES.includes(stored as UserRole)) {
        return DEMO_USERS[stored as UserRole];
      }
    } catch {}
    return null;
  });

  const permissions = user ? ROLE_PERMISSIONS[user.userRole] : NULL_PERMS;
  const homePath = user?.userRole === "admin" ? "/" : "/punch";

  const login = useCallback((role: UserRole) => {
    setUser(DEMO_USERS[role]);
    try { sessionStorage.setItem("auth_role", role); } catch {}
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try { sessionStorage.removeItem("auth_role"); } catch {}
  }, []);

  const hasAccess = useCallback((path: string) => {
    if (!user) return false;
    return NAV_ACCESS[user.userRole].includes(path);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, permissions, login, logout, hasAccess, homePath }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}