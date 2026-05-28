import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Receipt,
  Clock,
  Bell,
  CheckSquare,
  Package,
  Menu,
  X,
  FolderKanban,
  ChevronRight,
  LogOut,
  Settings,
  Fingerprint,
  Mail,
  Users,
  ShieldCheck,
  Sliders,
  Palette,
  Sparkles,
  FileText,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { NotificationBell } from "./NotificationBell";
import { useAuth, ROLE_INFO } from "../context/AuthContext";
import { AccessDenied } from "../pages/AccessDenied";

interface SubNavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}
interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  en: string;
  children?: SubNavItem[];
}

const navigation: NavItem[] = [
  { name: "總覽",     path: "/",             icon: LayoutDashboard, en: "Dashboard" },
  { name: "打卡",     path: "/punch",         icon: Fingerprint,     en: "Punch" },
  { name: "最新公告", path: "/announcements", icon: Bell,             en: "Announcements" },
  { name: "出缺勤",   path: "/attendance",   icon: Clock,            en: "Attendance" },
  { name: "專案管理", path: "/projects",      icon: FolderKanban,    en: "Projects" },
  { name: "工作事項", path: "/tasks",         icon: CheckSquare,     en: "Tasks" },
  { name: "資產管理", path: "/assets",        icon: Package,          en: "Assets" },
  { name: "財務管理", path: "/finance",       icon: Receipt,         en: "Finance" },
  { name: "權限管理", path: "/permissions",  icon: ShieldCheck,      en: "Permissions" },
  { name: "員工管理", path: "/employees",     icon: Users,            en: "Employees" },
  { name: "訊息中心", path: "/notifications", icon: Mail,             en: "Messages" },
  { name: "系統設定", path: "/settings",      icon: Sliders,          en: "Settings" },
  { name: "Design System", path: "/design-system", icon: Palette,    en: "Design" },
  { name: "Design System 2.0", path: "/design-system-2", icon: Sparkles, en: "Design 2.0" },
  { name: "產品規格書", path: "/spec", icon: FileText, en: "Spec" },
];

const pageNames: Record<string, string> = {
  "/":               "總覽",
  "/punch":          "打卡",
  "/finance":        "財務管理",
  "/attendance":     "出缺勤",
  "/projects":       "專案管理",
  "/announcements":  "最新公告",
  "/tasks":          "工作事項",
  "/assets":         "資產管理",
  "/settings":       "系統設定",
  "/notifications":  "訊息中心",
  "/employees":      "員工管理",
  "/permissions":    "權限管理",
  "/design-system":  "Design System",
  "/design-system-2":"Design System 2.0",
  "/spec":           "產品規格書",
};

const parentPages: Record<string, { name: string; path: string }> = {
};

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { user, permissions, logout, hasAccess } = useAuth();

  // ── Scroll to top on route change ──
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  // ── Auth guard: redirect to login if not logged in ──
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // ── Close sidebar on route change (mobile) ──
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const currentPath = location.pathname;
  const pageName = pageNames[currentPath] ?? "";
  const parent = parentPages[currentPath];
  const roleInfo = ROLE_INFO[user.userRole];

  // ── Permission guard: block unauthorized direct URL access ──
  const isRouteAllowed = (() => {
    const p = currentPath;
    // Always-accessible routes
    if (["/punch", "/notifications", "/access-denied"].includes(p)) return true;
    // Permission-mapped routes
    if (p === "/" && permissions.canViewDashboard) return true;
    if (p === "/finance" && permissions.canViewFinance) return true;
    if (p === "/assets" && permissions.canViewAssets) return true;
    if (p === "/attendance" && permissions.canViewAttendance) return true;
    if (p === "/projects" && permissions.canViewProjects) return true;
    if (p === "/tasks" && permissions.canViewTasks) return true;
    if (p === "/announcements" && permissions.canViewAnnouncements) return true;
    if (p === "/employees" && permissions.canViewEmployees) return true;
    if (p === "/permissions" && permissions.canViewPermissions) return true;
    if (p === "/settings" && permissions.canViewSettings) return true;
    if (p === "/design-system" && user.userRole === "admin") return true;
    if (p === "/design-system-2" && user.userRole === "admin") return true;
    if (p === "/spec" && user.userRole === "admin") return true;
    return false;
  })();

  // Filter nav items based on permissions
  const visibleNav = navigation.filter((item) => hasAccess(item.path));

  return (
    <div className="flex h-screen" style={{ background: "#F5F6F9", fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ── Sidebar overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: 240,
          borderRightWidth: "1px",
          borderRightStyle: "solid",
          borderRightColor: "#E5E7EB",
        }}
      >
        {/* Logo / brand */}
        <div className="flex items-center justify-between h-14 px-5 shrink-0" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #111827 0%, #1E3A5F 100%)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="#fff" strokeWidth="1.5" fill="none" />
                <path d="M12 7v10M7 9.5l5 3 5-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2" fill="#60A5FA" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.2, fontFamily: "'Noto Sans JP', sans-serif" }}>KUMO</span>
              <span style={{ fontSize: "9.5px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.08em", lineHeight: 1, marginTop: "1px" }}>WORKSPACE</span>
            </div>
          </div>
          <button className="md:hidden p-1" onClick={() => setSidebarOpen(false)}>
            <X style={{ width: 18, height: 18, color: "#6B7280" }} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            const isChildActive = item.children?.some((c) => currentPath === c.path);
            const active = isActive || isChildActive;

            return (
              <div key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 no-underline transition-colors"
                  style={{
                    fontSize: "14px",
                    fontWeight: active ? 600 : 450,
                    color: active ? "#111827" : "#6B7280",
                    background: active ? "#F3F4F6" : "transparent",
                    marginBottom: 2,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "#F9FAFB";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Icon style={{ width: 18, height: 18, color: active ? "#111827" : "#9CA3AF", flexShrink: 0 }} />
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 400, lineHeight: 1.2 }}>
                      {item.en}
                    </span>
                  </div>
                </Link>
                {item.children?.map((child) => {
                  const ChildIcon = child.icon;
                  const childActive = currentPath === child.path;
                  return (
                    <Link
                      key={child.path}
                      to={child.path}
                      className="flex items-center gap-2.5 rounded-md px-3 py-1.5 no-underline ml-5"
                      style={{
                        fontSize: "13px",
                        fontWeight: childActive ? 600 : 450,
                        color: childActive ? "#111827" : "#9CA3AF",
                        background: childActive ? "#F3F4F6" : "transparent",
                        marginBottom: 1,
                      }}
                    >
                      <ChildIcon style={{ width: 15, height: 15, color: childActive ? "#111827" : "#D1D5DB" }} />
                      {child.name}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User / role badge at bottom */}
        <div className="px-3 py-3 shrink-0" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}>
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: roleInfo.bg, color: roleInfo.color, fontSize: "12px", fontWeight: 700 }}
            >
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }} className="truncate">{user.name}</p>
              <p style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.3 }} className="truncate">{roleInfo.label}</p>
            </div>
            <button
              className="p-1.5 rounded-md transition-colors shrink-0"
              style={{ color: "#6B7280" }}
              title="登出"
              onClick={() => { logout(); navigate("/login"); }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6B7280"; }}
            >
              <LogOut style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center h-14 px-4 md:px-6 shrink-0 bg-white"
          style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}
        >
          {/* Mobile hamburger */}
          <button className="md:hidden p-1.5 mr-2 -ml-1" onClick={() => setSidebarOpen(true)}>
            <Menu style={{ width: 20, height: 20, color: "#374151" }} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {parent && (
              <>
                <Link
                  to={parent.path}
                  className="no-underline"
                  style={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 450 }}
                >
                  {parent.name}
                </Link>
                <ChevronRight style={{ width: 14, height: 14, color: "#D1D5DB" }} />
              </>
            )}
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{pageName}</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-[0px]">
          <div className="min-h-full max-md:pt-4 max-md:px-4 max-md:pb-6 flex flex-col p-[30px]">
            {isRouteAllowed ? <Outlet /> : <AccessDenied />}
          </div>
        </main>
      </div>
    </div>
  );
}