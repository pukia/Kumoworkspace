import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye, EyeOff, Mail, Lock, AlertCircle, Loader2,
  Shield, Crown, Users, User, ChevronRight,
  Banknote, FolderKanban,
  Box,
} from "lucide-react";
import { useAuth, DEMO_USERS, ROLE_INFO, type UserRole } from "../context/AuthContext";

// ─── SVG icons ────────────────────────────────────────────────────────────────
const MicrosoftIcon = () => (
  <svg viewBox="0 0 21 21" width="18" height="18" fill="none">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

type LoginTab = "email" | "sso";

const ROLE_ICONS: Record<UserRole, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  admin: Crown,
  finance_manager: Banknote,
  hr_manager: Users,
  pm: FolderKanban,
  product_manager: Box,
  staff: User,
};

const ROLE_ORDER: UserRole[] = ["admin", "finance_manager", "hr_manager", "pm", "product_manager", "staff"];

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState<LoginTab>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const getHomePath = (role: UserRole) => role === "admin" ? "/" : "/punch";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("請輸入帳號"); return; }
    if (!password.trim()) { setError("請輸入密碼"); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Admin login via username/password
      if (email.trim() === "lys" && password === "123456") {
        login("admin");
        navigate(getHomePath("admin"));
        return;
      }
      // Demo email-based login for other roles
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("帳號或密碼不正確"); return; }
      const lc = email.toLowerCase();
      let role: UserRole = "staff";
      if (lc.includes("finance") || lc.includes("li.ml")) role = "finance_manager";
      else if (lc.includes("hr") || lc.includes("chen.yt")) role = "hr_manager";
      else if (lc.includes("pm") || lc.includes("he.jh")) role = "pm";
      else if (lc.includes("product_manager")) role = "product_manager";
      login(role);
      navigate(getHomePath(role));
    }, 1000);
  };

  const handleSSO = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login("admin");
      navigate("/");
    }, 1000);
  };

  const handleDemoLogin = (role: UserRole) => {
    setLoadingRole(role);
    setTimeout(() => {
      setLoadingRole(null);
      login(role);
      navigate(getHomePath(role));
    }, 500);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F5F6F9" }}>
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col items-center justify-center relative"
        style={{ background: "#111827" }}>
        <div className="absolute inset-0 overflow-hidden" style={{ opacity: 0.06 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute"
              style={{ width: "1px", height: "100%", background: "#FFF", left: `${(i + 1) * 8.33}%` }} />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute"
              style={{ width: "100%", height: "1px", background: "#FFF", top: `${(i + 1) * 8.33}%` }} />
          ))}
        </div>

        <div className="relative z-10 text-center px-10">
          <div className="w-16 h-16 rounded-xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.15)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="#fff" strokeWidth="1.5" fill="none" />
              <path d="M12 7v10M7 9.5l5 3 5-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2" fill="#60A5FA" />
            </svg>
          </div>
          <h1 style={{ color: "#FFFFFF", fontSize: "32px", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.03em" }}>
            KUMO
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginTop: 6, letterSpacing: "0.15em", fontWeight: 500 }}>
            WORKSPACE
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", marginTop: 16, lineHeight: 1.7 }}>
            雲端企業協作管理平台
          </p>
          <div className="mt-10 space-y-3">
            {[
              "七大核心模組整合管理",
              "角色權限細粒度控管",
              "即時數據儀表板",
            ].map(item => (
              <div key={item} className="flex items-center gap-3 justify-center">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#6B7280" }} />
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
            &copy; 2026 Company Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-[480px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#111827" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="#fff" strokeWidth="1.5" fill="none" />
                <path d="M12 7v10M7 9.5l5 3 5-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2" fill="#60A5FA" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.2 }}>KUMO</p>
              <p style={{ fontSize: "10px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.12em" }}>WORKSPACE</p>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-lg" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="flex mx-6 mt-6 rounded-lg p-1" style={{ background: "#F3F4F6" }}>
              {([
                { key: "email" as LoginTab, label: "Email 登入", icon: Mail },
                { key: "sso" as LoginTab, label: "SSO 單一登入", icon: Shield },
              ]).map(t => {
                const TIcon = t.icon;
                const active = tab === t.key;
                return (
                  <button key={t.key} onClick={() => { setTab(t.key); setError(""); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md transition-all"
                    style={{
                      fontSize: "15px", fontWeight: active ? 600 : 500,
                      background: active ? "#FFF" : "transparent",
                      color: active ? "#111827" : "#9CA3AF",
                      boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}>
                    <TIcon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg"
                style={{ background: "#FEF2F2", borderWidth: "1px", borderStyle: "solid", borderColor: "#FECACA" }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#DC2626" }} />
                <span style={{ fontSize: "15px", color: "#DC2626" }}>{error}</span>
              </div>
            )}

            <div className="px-6 pb-6 pt-5">
              {tab === "email" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label style={{ fontSize: "15px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>帳號</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9CA3AF" }} />
                      <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="使用者帳號或 Email"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none"
                        style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "16px", color: "#111827", fontFamily: "inherit", transition: "border-color 0.15s" }}
                        onFocus={e => { e.currentTarget.style.borderColor = "#111827"; e.currentTarget.style.background = "#FFF"; }}
                        onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#F9FAFB"; }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label style={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>密碼</label>
                      <button type="button" style={{ fontSize: "14px", color: "#6B7280", background: "none", border: "none", cursor: "pointer" }}>忘記密碼？</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9CA3AF" }} />
                      <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="請輸入密碼"
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg outline-none"
                        style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "16px", color: "#111827", fontFamily: "inherit", transition: "border-color 0.15s" }}
                        onFocus={e => { e.currentTarget.style.borderColor = "#111827"; e.currentTarget.style.background = "#FFF"; }}
                        onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#F9FAFB"; }}
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }}>
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setRemember(!remember)}
                      style={{ width: 18, height: 18, background: remember ? "#111827" : "#FFF", border: remember ? "none" : "1px solid #D1D5DB", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {remember && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </button>
                    <span style={{ fontSize: "15px", color: "#6B7280" }}>記住我的登入狀態</span>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all"
                    style={{ background: loading ? "#374151" : "#111827", color: "#FFF", fontSize: "16px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#1F2937"; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#111827"; }}>
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" />登入中...</> : "登入系統"}
                  </button>
                  
                </form>
              )}

              {tab === "sso" && (
                <div className="space-y-3">
                  <p style={{ fontSize: "15px", color: "#6B7280", marginBottom: 8, lineHeight: 1.7 }}>
                    選擇您公司的身分提供者進行單一登入
                  </p>
                  {[
                    { provider: "google", icon: <GoogleIcon />, label: "使用 Google Workspace 登入" },
                    { provider: "microsoft", icon: <MicrosoftIcon />, label: "使用 Microsoft 365 登入" },
                    { provider: "saml", icon: <Shield className="w-[18px] h-[18px]" style={{ color: "#7C3AED" }} />, label: "企業 SAML / OIDC 登入" },
                  ].map(item => (
                    <button key={item.provider} onClick={() => handleDemoLogin("staff")} disabled={loading}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                      style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", cursor: loading ? "not-allowed" : "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; }}>
                      {item.icon}
                      <span style={{ fontSize: "16px", fontWeight: 500, color: "#374151" }}>{item.label}</span>
                    </button>
                  ))}
                  {loading && (
                    <div className="flex items-center justify-center gap-2 pt-3">
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#9CA3AF" }} />
                      <span style={{ fontSize: "15px", color: "#9CA3AF" }}>正在跳轉至身分提供者...</span>
                    </div>
                  )}
                </div>
              )}

              {tab === "email" && (
                <>
                  <div className="flex items-center gap-3 mt-5">
                    <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
                    <span style={{ fontSize: "13px", color: "#9CA3AF" }}>或使用其他方式</span>
                    <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => handleDemoLogin("staff")}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg"
                      style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; }}>
                      <GoogleIcon />
                      <span style={{ fontSize: "14px", color: "#374151" }}>Google</span>
                    </button>
                    <button onClick={() => handleDemoLogin("staff")}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg"
                      style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", cursor: "pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; }}>
                      <MicrosoftIcon />
                      <span style={{ fontSize: "14px", color: "#374151" }}>Microsoft</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ─── Demo Role Cards ─────────────────────────────────────── */}
          <div className="mt-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.1em" }}>DEMO 快速切換</span>
              <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(["finance_manager", "hr_manager", "pm", "product_manager", "staff"] as UserRole[]).map(role => {
                const info = ROLE_INFO[role];
                const Icon = ROLE_ICONS[role];
                const isLoading = loadingRole === role;
                return (
                  <button key={role} onClick={() => handleDemoLogin(role)} disabled={loadingRole !== null}
                    className="flex flex-col items-center py-2 px-1 rounded-lg transition-all group"
                    style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: isLoading ? info.color : "#E5E7EB", cursor: loadingRole !== null ? "not-allowed" : "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = info.color; e.currentTarget.style.boxShadow = `0 0 0 1px ${info.color}20`; }}
                    onMouseLeave={e => { if (!isLoading) { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; } }}>
                    <div className="w-6 h-6 rounded-md flex items-center justify-center mb-1" style={{ background: info.bg }}>
                      {isLoading
                        ? <Loader2 className="w-3 h-3 animate-spin" style={{ color: info.color }} />
                        : <Icon className="w-3 h-3" style={{ color: info.color }} />}
                    </div>
                    <p style={{ fontSize: "10px", fontWeight: 600, color: "#374151", lineHeight: 1.2, textAlign: "center" }}>{info.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-5">
            
            <p style={{ fontSize: "13px", color: "#D1D5DB", marginTop: 4 }}>
              &copy; 2026 Company Inc. v2.1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}