import React, { useState } from "react";
import {
  Sparkles, Compass, Palette, Type, Ruler, Layers, MousePointer, Bell,
  Layout, Workflow, GitBranch, Activity, Square, ChevronDown, Check, Search,
  Plus, X, AlertCircle, AlertTriangle, CheckCircle2, Info, ArrowRight,
  LayoutDashboard, Receipt, Clock, CheckSquare, Package, FolderKanban,
  Fingerprint, Mail, Users, ShieldCheck, Sliders, Settings,
  Loader2, Star, Heart, ExternalLink, Copy, ChevronRight, Box,
  Zap, Eye, FileText, Smartphone, Monitor, Tablet,
  Accessibility, ThumbsUp, ThumbsDown, Tag as TagIcon, Code2,
} from "lucide-react";
import { StyledSelect } from "../components/StyledSelect";
import { DraggableScroll } from "../components/DraggableScroll";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section =
  | "overview"
  | "ia"
  | "colors"
  | "typography"
  | "spacing"
  | "elevation"
  | "iconography"
  | "components"
  | "forms"
  | "feedback"
  | "patterns"
  | "motion"
  | "a11y"
  | "guidelines"
  | "tokens";

const NAV: { key: Section; label: string; en: string; Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
  { key: "overview",   label: "概覽",       en: "Overview",      Icon: Sparkles },
  { key: "ia",         label: "資訊架構",   en: "IA",            Icon: Workflow },
  { key: "colors",     label: "色彩系統",   en: "Colors",        Icon: Palette },
  { key: "typography", label: "文字排版",   en: "Typography",    Icon: Type },
  { key: "spacing",    label: "間距網格",   en: "Spacing",       Icon: Ruler },
  { key: "elevation",  label: "圓角陰影",   en: "Elevation",     Icon: Layers },
  { key: "iconography",label: "圖示系統",   en: "Iconography",   Icon: Box },
  { key: "components", label: "基礎元件",   en: "Components",    Icon: Square },
  { key: "forms",      label: "表單元件",   en: "Forms",         Icon: MousePointer },
  { key: "feedback",   label: "回饋提示",   en: "Feedback",      Icon: Bell },
  { key: "patterns",   label: "版型範例",   en: "Patterns",      Icon: Layout },
  { key: "motion",     label: "動效規範",   en: "Motion",        Icon: Activity },
  { key: "a11y",       label: "可訪問性",   en: "Accessibility", Icon: Accessibility },
  { key: "guidelines", label: "使用守則",   en: "Do & Don't",    Icon: ThumbsUp },
  { key: "tokens",     label: "命名與層級", en: "Tokens",        Icon: TagIcon },
];

// ─── Shared Atoms ─────────────────────────────────────────────────────────────
const Card = ({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={className} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ title, desc, en }: { title: string; desc: string; en?: string }) => (
  <div className="pb-5 mb-6" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
    <div className="flex items-baseline gap-3">
      <h2 style={{ color: "#111827", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</h2>
      {en && <span style={{ fontSize: "14px", color: "#9CA3AF", fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.06em" }}>{en}</span>}
    </div>
    <p style={{ fontSize: "15px", color: "#6B7280", marginTop: 6, lineHeight: 1.6 }}>{desc}</p>
  </div>
);

const SubTitle = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="flex items-baseline justify-between mb-4">
    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>{children}</h3>
    {hint && <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{hint}</span>}
  </div>
);

const Tag = ({ children, color = "#6B7280", bg = "#F3F4F6" }: { children: React.ReactNode; color?: string; bg?: string }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-md" style={{ fontSize: "12px", fontWeight: 600, color, background: bg, letterSpacing: "0.02em" }}>
    {children}
  </span>
);

// ─── 1. Overview ──────────────────────────────────────────────────────────────
function OverviewSection() {
  const principles = [
    { icon: Compass, title: "結構優先", desc: "以資訊架構為起點，先建立清晰的層級與動線，再思考視覺。" },
    { icon: Eye,     title: "克制留白", desc: "日系管理後台美學，仰賴乾淨的留白與細節，而非裝飾。" },
    { icon: Zap,     title: "可預測",   desc: "互動結果與位置具一致性，元件在不同頁面呈現相同行為。" },
    { icon: ShieldCheck, title: "權限可見", desc: "依角色顯示對應功能，避免無謂的禁用按鈕造成困惑。" },
  ];
  const stats = [
    { label: "色彩 Token", value: "48" },
    { label: "基礎元件",    value: "32" },
    { label: "頁面模組",    value: "13" },
    { label: "角色權限",    value: "6" },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="概覽" en="Overview" desc="KUMO WORKSPACE 設計系統 2.0，定義產品的視覺與互動語言" />

      {/* Hero */}
      <Card style={{ background: "linear-gradient(135deg, #111827 0%, #1E3A5F 100%)", borderColor: "transparent" }}>
        <div className="px-7 py-7 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles style={{ width: 16, height: 16, color: "#60A5FA" }} />
            <span style={{ fontSize: "12.5px", letterSpacing: "0.18em", color: "#93C5FD", fontWeight: 600 }}>DESIGN SYSTEM 2.0</span>
          </div>
          <h1 style={{ color: "#FFF", letterSpacing: "-0.02em" }}>雲のワークスペース</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", marginTop: 8, maxWidth: 560, lineHeight: 1.7 }}>
            為內部協作打造的設計語言。融合日系管理後台的克制留白、現代 SaaS 的清晰結構，與細粒度權限視覺化。
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#FFF", letterSpacing: "-0.02em" }}>{s.value}</div>
                <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Principles */}
      <Card className="p-5">
        <SubTitle hint="Design Principles">設計原則</SubTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex gap-3 p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                  <Icon style={{ width: 16, height: 16, color: "#111827" }} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: "13.5px", color: "#6B7280", lineHeight: 1.6 }}>{p.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Versioning */}
      <Card className="p-5">
        <SubTitle hint="Changelog">版本紀錄</SubTitle>
        <div className="space-y-3">
          {[
            { v: "2.0.0", date: "2026.05.06", note: "重構資訊架構、新增完整元件示範與動效規範", current: true },
            { v: "1.4.0", date: "2026.04.18", note: "新增 Sprint 看板色票、任務狀態膠囊" },
            { v: "1.3.0", date: "2026.03.22", note: "統一標題右側按鈕縮小版樣式" },
            { v: "1.0.0", date: "2026.01.10", note: "Design System 1.0 初版發布" },
          ].map((v) => (
            <div key={v.v} className="flex items-center gap-3 py-2" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: v.current ? "#16A34A" : "#D1D5DB" }} />
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827", fontFamily: "'JetBrains Mono', monospace", minWidth: 60 }}>{v.v}</span>
              {v.current && <Tag color="#16A34A" bg="#F0FDF4">當前</Tag>}
              <span style={{ fontSize: "13.5px", color: "#6B7280", flex: 1 }}>{v.note}</span>
              <span style={{ fontSize: "12.5px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>{v.date}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 2. Information Architecture ──────────────────────────────────────────────
function IASection() {
  const modules: { name: string; en: string; icon: any; desc: string; roles: string[]; children?: { name: string; desc: string }[] }[] = [
    { name: "總覽", en: "Dashboard", icon: LayoutDashboard, desc: "管理者首頁，集中呈現各模組關鍵指標。", roles: ["admin", "finance_manager", "hr_manager", "pm", "product_manager"] },
    { name: "打卡", en: "Punch", icon: Fingerprint, desc: "全員入口，快速上下班打卡與位置紀錄。", roles: ["admin", "finance_manager", "hr_manager", "pm", "product_manager", "staff"] },
    { name: "最新公告", en: "Announcements", icon: Bell, desc: "公司公告佈達。", roles: ["admin", "hr_manager", "pm", "product_manager", "staff"] },
    { name: "出缺勤", en: "Attendance", icon: Clock, desc: "出勤紀錄、請假審核。", roles: ["admin", "hr_manager"] },
    { name: "專案管理", en: "Projects", icon: FolderKanban, desc: "專案總覽、里程碑、團隊成員。", roles: ["admin", "pm", "product_manager"] },
    {
      name: "工作事項", en: "Tasks", icon: CheckSquare, desc: "Jira 風格任務看板與 Sprint 生命週期。",
      roles: ["admin", "pm", "product_manager", "staff"],
      children: [
        { name: "Sprint 看板", desc: "拖曳卡片、結算點數" },
        { name: "Sprint 報表", desc: "速率與燃盡圖" },
        { name: "任務追蹤",   desc: "員工任務追蹤面板" },
      ],
    },
    { name: "資產管理", en: "Assets", icon: Package, desc: "公司設備與資產盤點。", roles: ["admin", "hr_manager"] },
    { name: "財務管理", en: "Finance", icon: Receipt, desc: "費用申請、薪資與財報。", roles: ["admin", "finance_manager"] },
    { name: "權限管理", en: "Permissions", icon: ShieldCheck, desc: "六角色細粒度權限矩陣。", roles: ["admin"] },
    { name: "員工管理", en: "Employees", icon: Users, desc: "員工資料、組織架構。", roles: ["admin", "hr_manager"] },
    { name: "訊息中心", en: "Messages", icon: Mail, desc: "通知與內部信件回覆。", roles: ["admin", "finance_manager", "hr_manager", "pm", "product_manager", "staff"] },
    { name: "系統設定", en: "Settings", icon: Sliders, desc: "個人偏好與系統參數。", roles: ["admin"] },
  ];

  const roleColors: Record<string, { bg: string; color: string; label: string }> = {
    admin:           { bg: "#FEF2F2", color: "#DC2626", label: "系統管理者" },
    finance_manager: { bg: "#ECFDF5", color: "#059669", label: "財務主管" },
    hr_manager:      { bg: "#F5F3FF", color: "#7C3AED", label: "人資主管" },
    pm:              { bg: "#EFF6FF", color: "#2563EB", label: "專案經理" },
    product_manager: { bg: "#FFFBEB", color: "#CA8A04", label: "產品經理" },
    staff:           { bg: "#F3F4F6", color: "#374151", label: "一般員工" },
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="資訊架構" en="Information Architecture" desc="模組劃分、角色權限對應、頁面動線與導覽結構" />

      {/* Hierarchy Map */}
      <Card className="p-5">
        <SubTitle hint="Sitemap">站台地圖</SubTitle>
        <div className="rounded-lg p-5" style={{ background: "#FAFAFA", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
          <div className="flex flex-col items-center">
            {/* Root */}
            <div className="px-4 py-2 rounded-lg flex items-center gap-2" style={{ background: "#111827", color: "#FFF" }}>
              <Sparkles style={{ width: 14, height: 14, color: "#60A5FA" }} />
              <span style={{ fontSize: "14px", fontWeight: 700 }}>KUMO WORKSPACE</span>
            </div>
            <div className="w-px h-5" style={{ background: "#D1D5DB" }} />
            {/* Layer 2 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 w-full">
              {modules.slice(0, 6).map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.name} className="flex flex-col items-center">
                    <div className="w-px h-3" style={{ background: "#D1D5DB" }} />
                    <div className="px-3 py-2 rounded-md flex items-center gap-1.5 w-full justify-center" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                      <Icon style={{ width: 12, height: 12, color: "#374151" }} />
                      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#111827" }}>{m.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 w-full mt-1">
              {modules.slice(6).map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.name} className="flex flex-col items-center">
                    <div className="px-3 py-2 rounded-md flex items-center gap-1.5 w-full justify-center" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                      <Icon style={{ width: 12, height: 12, color: "#374151" }} />
                      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#111827" }}>{m.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Module table */}
      <Card>
        <div className="px-5 py-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
          <SubTitle hint={`共 ${modules.length} 個主模組`}>模組與角色對應</SubTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: "13.5px" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                <th className="text-left px-5 py-3" style={{ fontSize: "12.5px", fontWeight: 600, color: "#6B7280", letterSpacing: "0.05em" }}>模組</th>
                <th className="text-left px-3 py-3" style={{ fontSize: "12.5px", fontWeight: 600, color: "#6B7280", letterSpacing: "0.05em" }}>說明</th>
                <th className="text-left px-3 py-3" style={{ fontSize: "12.5px", fontWeight: 600, color: "#6B7280", letterSpacing: "0.05em" }}>可訪問角色</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => {
                const Icon = m.icon;
                return (
                  <tr key={m.name} style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                          <Icon style={{ width: 13, height: 13, color: "#374151" }} />
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{m.name}</div>
                          <div style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "'Noto Serif JP', serif" }}>{m.en}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3" style={{ color: "#6B7280" }}>
                      <div>{m.desc}</div>
                      {m.children && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {m.children.map((c) => (
                            <Tag key={c.name}>{c.name}</Tag>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {m.roles.map((r) => {
                          const rc = roleColors[r];
                          return <Tag key={r} color={rc.color} bg={rc.bg}>{rc.label}</Tag>;
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Navigation patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5">
          <SubTitle hint="Desktop / Mobile">導覽模式</SubTitle>
          <div className="space-y-3">
            {[
              { icon: Monitor, name: "桌面版", desc: "左側 240px 永久側欄，主內容區 padding 30px。" },
              { icon: Tablet,  name: "平板版", desc: "側欄保持，但縮小至 200px；主內容區 padding 24px。" },
              { icon: Smartphone, name: "手機版", desc: "側欄抽屜化，Tab 改為 StyledSelect 下拉。" },
            ].map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.name} className="flex gap-3 p-3 rounded-lg" style={{ background: "#F9FAFB" }}>
                  <Icon style={{ width: 18, height: 18, color: "#111827", marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{d.name}</div>
                    <div style={{ fontSize: "12.5px", color: "#6B7280", lineHeight: 1.6, marginTop: 2 }}>{d.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <SubTitle hint="User Flow">關鍵動線</SubTitle>
          <div className="space-y-2">
            {[
              ["登入", "打卡", "今日任務", "下班"],
              ["登入", "Sprint 看板", "拖曳卡片", "結算點數"],
              ["登入", "費用申請", "上傳憑證", "送出審核"],
            ].map((flow, i) => (
              <div key={i} className="flex items-center gap-1.5 py-2 px-3 rounded-lg" style={{ background: "#F9FAFB" }}>
                {flow.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-2 py-0.5 rounded" style={{ fontSize: "12.5px", fontWeight: 600, color: "#111827", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>{step}</span>
                    {idx < flow.length - 1 && <ChevronRight style={{ width: 11, height: 11, color: "#9CA3AF" }} />}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── 3. Colors ────────────────────────────────────────────────────────────────
function ColorsSection() {
  const Swatch = ({ name, hex, token, dark }: { name: string; hex: string; token: string; dark?: boolean }) => (
    <div className="flex flex-col">
      <div className="w-full h-20 rounded-lg mb-2 flex items-end p-2 transition-transform hover:scale-[1.02]" style={{ background: hex, borderWidth: "1px", borderStyle: "solid", borderColor: dark ? "transparent" : "#E5E7EB" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: dark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>{hex}</span>
      </div>
      <p style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>{name}</p>
      <p style={{ fontSize: "10px", color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{token}</p>
    </div>
  );

  const Scale = ({ name, base }: { name: string; base: number[] }) => {
    const labels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    const colors = ["#F9FAFB", "#F3F4F6", "#E5E7EB", "#D1D5DB", "#9CA3AF", "#6B7280", "#4B5563", "#374151", "#1F2937", "#111827"];
    return (
      <div>
        <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827", marginBottom: 8 }}>{name}</div>
        <div className="grid grid-cols-10 gap-1">
          {colors.map((c, i) => (
            <div key={i} className="rounded h-12 flex items-end p-1" style={{ background: c, borderWidth: "1px", borderStyle: "solid", borderColor: i < 3 ? "#E5E7EB" : "transparent" }}>
              <span style={{ fontSize: "9px", fontWeight: 600, color: i > 4 ? "#FFF" : "#374151" }}>{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="色彩系統" en="Colors" desc="48 個色彩 Token，依用途分為品牌色、語義色、中性色與角色色" />

      <Card className="p-5">
        <SubTitle hint="Brand">品牌色</SubTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          <Swatch name="深墨色" hex="#111827" token="ink-900" dark />
          <Swatch name="主背景" hex="#F5F6F9" token="bg-main" />
          <Swatch name="白色" hex="#FFFFFF" token="white" />
          <Swatch name="藍色強調" hex="#60A5FA" token="accent-blue" />
          <Swatch name="漸層深" hex="#1E3A5F" token="gradient-deep" dark />
          <Swatch name="品牌色" hex="#2563EB" token="brand" dark />
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Semantic">語義色</SubTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          <Swatch name="成功" hex="#16A34A" token="success" dark />
          <Swatch name="警告" hex="#CA8A04" token="warning" dark />
          <Swatch name="危險" hex="#DC2626" token="danger" dark />
          <Swatch name="資訊" hex="#2563EB" token="info" dark />
          <Swatch name="紫色" hex="#7C3AED" token="purple" dark />
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Neutral Scale">中性色階</SubTitle>
        <Scale name="Gray" base={[]} />
      </Card>

      <Card className="p-5">
        <SubTitle hint="Roles">角色色</SubTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { name: "管理者", c: "#DC2626", bg: "#FEF2F2" },
            { name: "財務主管", c: "#059669", bg: "#ECFDF5" },
            { name: "人資主管", c: "#7C3AED", bg: "#F5F3FF" },
            { name: "專案經理", c: "#2563EB", bg: "#EFF6FF" },
            { name: "產品經理", c: "#CA8A04", bg: "#FFFBEB" },
            { name: "一般員工", c: "#374151", bg: "#F3F4F6" },
          ].map((r) => (
            <div key={r.name} className="rounded-lg p-3 flex items-center gap-2" style={{ background: r.bg, borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: r.c, color: "#FFF", fontSize: "12.5px", fontWeight: 700 }}>
                {r.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: r.c }}>{r.name}</div>
                <div style={{ fontSize: "10px", color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{r.c}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 4. Typography ────────────────────────────────────────────────────────────
function TypographySection() {
  const scale = [
    { name: "Display", size: 32, weight: 800, sample: "雲のワークスペース", desc: "登入頁 / Hero" },
    { name: "H1",      size: 22, weight: 700, sample: "頁面標題 Page Title", desc: "頁面主標題" },
    { name: "H2",      size: 17, weight: 700, sample: "區塊標題 Section", desc: "卡片區塊" },
    { name: "H3",      size: 14, weight: 700, sample: "小節標題 Sub", desc: "子區塊" },
    { name: "Body",    size: 14, weight: 450, sample: "內文段落 Body Text", desc: "一般內文" },
    { name: "Small",   size: 12, weight: 450, sample: "輔助文字 Caption", desc: "說明文字" },
    { name: "Tiny",    size: 10, weight: 600, sample: "標籤 LABEL", desc: "標籤、徽章" },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="文字排版" en="Typography" desc="Noto Sans JP（無襯線）+ Noto Serif JP（襯線輔助），全站文字採繁體中文" />

      <Card className="p-5">
        <SubTitle hint="Type Scale">字級階層</SubTitle>
        <div className="space-y-3">
          {scale.map((s) => (
            <div key={s.name} className="flex items-center gap-4 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
              <div style={{ width: 80 }}>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>{s.name}</div>
                <div style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>{s.size}px / {s.weight}</div>
              </div>
              <div className="flex-1" style={{ fontSize: `${s.size}px`, fontWeight: s.weight, color: "#111827", lineHeight: 1.4 }}>
                {s.sample}
              </div>
              <div style={{ fontSize: "12.5px", color: "#9CA3AF" }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Font Family">字型家族</SubTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg p-4" style={{ background: "#F9FAFB" }}>
            <div style={{ fontSize: "12.5px", color: "#9CA3AF", letterSpacing: "0.05em" }}>PRIMARY · Sans</div>
            <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "20px", fontWeight: 700, color: "#111827", marginTop: 4 }}>Noto Sans JP</div>
            <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "14px", color: "#6B7280", marginTop: 6 }}>用於介面文字、標題、按鈕、表單。</div>
          </div>
          <div className="rounded-lg p-4" style={{ background: "#F9FAFB" }}>
            <div style={{ fontSize: "12.5px", color: "#9CA3AF", letterSpacing: "0.05em" }}>ACCENT · Serif</div>
            <div style={{ fontFamily: "'Noto Serif JP', serif", fontSize: "20px", fontWeight: 700, color: "#111827", marginTop: 4 }}>Noto Serif JP</div>
            <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: "14px", color: "#6B7280", marginTop: 6 }}>用於英文標籤、副標、品牌氛圍點綴。</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── 5. Spacing ───────────────────────────────────────────────────────────────
function SpacingSection() {
  const tokens = [
    { name: "xs",  px: 4 },
    { name: "sm",  px: 8 },
    { name: "md",  px: 12 },
    { name: "lg",  px: 16 },
    { name: "xl",  px: 24 },
    { name: "2xl", px: 30 },
    { name: "3xl", px: 48 },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="間距與網格" en="Spacing & Grid" desc="以 4px 為基礎倍數，頁面 padding 30px、卡片內距 20px、元件間距 12-16px" />

      <Card className="p-5">
        <SubTitle hint="4px Base">間距 Token</SubTitle>
        <div className="space-y-2">
          {tokens.map((t) => (
            <div key={t.name} className="flex items-center gap-3">
              <div style={{ width: 60, fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>{t.name}</div>
              <div style={{ width: 60, fontSize: "12.5px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>{t.px}px</div>
              <div style={{ height: 12, width: t.px * 2, background: "#111827", borderRadius: 2 }} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Grid">網格系統</SubTitle>
        <div className="grid grid-cols-12 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-16 rounded flex items-center justify-center" style={{ background: "#EFF6FF", borderWidth: "1px", borderStyle: "solid", borderColor: "#DBEAFE" }}>
              <span style={{ fontSize: "10px", color: "#2563EB", fontWeight: 600 }}>{i + 1}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "12.5px", color: "#9CA3AF", marginTop: 10 }}>桌面採 12 欄 grid，gutter 12-16px；手機自動降為 1-2 欄。</p>
      </Card>
    </div>
  );
}

// ─── 6. Elevation ─────────────────────────────────────────────────────────────
function ElevationSection() {
  const radii = [
    { name: "sm", v: 4 }, { name: "md", v: 6 }, { name: "lg", v: 8 }, { name: "xl", v: 10 }, { name: "2xl", v: 14 }, { name: "full", v: 999 },
  ];
  const elevs = [
    { name: "0 None", shadow: "none" },
    { name: "1 Subtle", shadow: "0 1px 3px rgba(0,0,0,0.04)" },
    { name: "2 Card", shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" },
    { name: "3 Pop", shadow: "0 4px 12px rgba(0,0,0,0.08)" },
    { name: "4 Modal", shadow: "0 10px 25px rgba(0,0,0,0.12)" },
    { name: "5 Floating", shadow: "0 20px 40px rgba(0,0,0,0.16)" },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="圓角與陰影" en="Radius & Elevation" desc="圓角採 4-14px 階層；陰影克制使用，避免浮誇" />

      <Card className="p-5">
        <SubTitle>圓角</SubTitle>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {radii.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16" style={{ background: "#111827", borderRadius: r.v }} />
              <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#111827" }}>{r.name}</div>
              <div style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>{r.v}px</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle>陰影層級</SubTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {elevs.map((e) => (
            <div key={e.name} className="rounded-lg h-20 flex items-center justify-center bg-white" style={{ boxShadow: e.shadow, borderWidth: e.shadow === "none" ? "1px" : "0", borderStyle: "solid", borderColor: "#E5E7EB" }}>
              <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>{e.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 7. Iconography ───────────────────────────────────────────────────────────
function IconographySection() {
  const icons = [
    LayoutDashboard, Receipt, Clock, Bell, CheckSquare, Package, FolderKanban,
    Fingerprint, Mail, Users, ShieldCheck, Sliders, Settings, Search, Plus,
    X, Check, ArrowRight, ChevronDown, ChevronRight, Star, Heart, Eye, Copy,
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="圖示系統" en="Iconography" desc="統一使用 lucide-react，1.5px 線寬，依語境決定 14/16/18/20px" />

      <Card className="p-5">
        <SubTitle hint="Sizes">尺寸規範</SubTitle>
        <div className="flex items-end gap-6">
          {[14, 16, 18, 20, 24].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <Bell style={{ width: s, height: s, color: "#111827" }} />
              <span style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>{s}px</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint={`常用 ${icons.length} 例`}>圖示樣本</SubTitle>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-3">
          {icons.map((Icon, i) => (
            <div key={i} className="rounded-lg aspect-square flex items-center justify-center" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
              <Icon style={{ width: 16, height: 16, color: "#374151" }} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 8. Components ────────────────────────────────────────────────────────────
function ComponentsSection() {
  return (
    <div className="space-y-6">
      <SectionTitle title="基礎元件" en="Components" desc="按鈕、徽章、頭像、分頁、Tab、卡片等通用元件" />

      {/* Buttons */}
      <Card className="p-5">
        <SubTitle hint="Buttons">按鈕</SubTitle>
        <div className="space-y-4">
          <div>
            <div style={{ fontSize: "12.5px", color: "#9CA3AF", marginBottom: 8 }}>主要 / 次要 / 危險 / Ghost</div>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded-md transition-colors" style={{ background: "#111827", color: "#FFF", fontSize: "14px", fontWeight: 600 }}>主要按鈕</button>
              <button className="px-4 py-2 rounded-md" style={{ background: "#FFF", color: "#111827", fontSize: "14px", fontWeight: 600, borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>次要按鈕</button>
              <button className="px-4 py-2 rounded-md" style={{ background: "#DC2626", color: "#FFF", fontSize: "14px", fontWeight: 600 }}>危險操作</button>
              <button className="px-4 py-2 rounded-md" style={{ background: "transparent", color: "#6B7280", fontSize: "14px", fontWeight: 600 }}>Ghost</button>
              <button disabled className="px-4 py-2 rounded-md cursor-not-allowed" style={{ background: "#F3F4F6", color: "#9CA3AF", fontSize: "14px", fontWeight: 600 }}>停用</button>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12.5px", color: "#9CA3AF", marginBottom: 8 }}>尺寸 sm / md / lg</div>
            <div className="flex flex-wrap items-end gap-2">
              <button className="px-3 py-1 rounded" style={{ background: "#111827", color: "#FFF", fontSize: "12.5px", fontWeight: 600 }}>SM</button>
              <button className="px-4 py-2 rounded-md" style={{ background: "#111827", color: "#FFF", fontSize: "14px", fontWeight: 600 }}>Medium</button>
              <button className="px-5 py-2.5 rounded-lg" style={{ background: "#111827", color: "#FFF", fontSize: "14px", fontWeight: 600 }}>Large</button>
              <button className="px-3 py-1.5 rounded-md inline-flex items-center gap-1.5" style={{ background: "#111827", color: "#FFF", fontSize: "13.5px", fontWeight: 600 }}>
                <Plus style={{ width: 12, height: 12 }} /> 帶圖示
              </button>
              <button className="rounded-md inline-flex items-center justify-center" style={{ width: 32, height: 32, background: "#FFF", color: "#374151", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                <Search style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Badges */}
      <Card className="p-5">
        <SubTitle hint="Badges">徽章</SubTitle>
        <div className="flex flex-wrap gap-2">
          {[
            { l: "進行中", c: "#2563EB", b: "#EFF6FF" },
            { l: "已完成", c: "#16A34A", b: "#F0FDF4" },
            { l: "待審核", c: "#CA8A04", b: "#FEF9C3" },
            { l: "已駁回", c: "#DC2626", b: "#FEF2F2" },
            { l: "草稿",   c: "#6B7280", b: "#F3F4F6" },
            { l: "高優先", c: "#7C3AED", b: "#F5F3FF" },
          ].map((b) => (
            <span key={b.l} className="inline-flex items-center px-2.5 py-0.5 rounded-full" style={{ fontSize: "12.5px", fontWeight: 600, color: b.c, background: b.b }}>
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: b.c }} />
              {b.l}
            </span>
          ))}
        </div>
      </Card>

      {/* Avatars */}
      <Card className="p-5">
        <SubTitle hint="Avatars">頭像</SubTitle>
        <div className="flex items-center gap-3">
          {[24, 32, 40, 48].map((s) => (
            <div key={s} className="rounded-full flex items-center justify-center" style={{ width: s, height: s, background: "linear-gradient(135deg, #1E3A5F, #60A5FA)", color: "#FFF", fontSize: s / 3, fontWeight: 700 }}>L</div>
          ))}
          <div className="flex -space-x-2">
            {["#DC2626", "#16A34A", "#CA8A04", "#7C3AED"].map((c, i) => (
              <div key={i} className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: c, color: "#FFF", fontSize: 11, fontWeight: 700, borderWidth: "2px", borderStyle: "solid", borderColor: "#FFF" }}>{["A","B","C","D"][i]}</div>
            ))}
            <div className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: "#F3F4F6", color: "#6B7280", fontSize: 11, fontWeight: 700, borderWidth: "2px", borderStyle: "solid", borderColor: "#FFF" }}>+5</div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="p-5">
        <SubTitle hint="Tabs · 灰底膠囊">分頁</SubTitle>
        <div className="inline-flex p-1 rounded-lg" style={{ background: "#F3F4F6" }}>
          {["總覽", "成員", "設定"].map((t, i) => (
            <button key={t} className="px-4 py-1.5 rounded-md transition-all" style={{ fontSize: "13.5px", fontWeight: 600, color: i === 0 ? "#FFF" : "#6B7280", background: i === 0 ? "#111827" : "transparent" }}>{t}</button>
          ))}
        </div>
      </Card>

      {/* Stat cards */}
      <Card className="p-5">
        <SubTitle hint="Stat Cards">統計卡片</SubTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "本月營收", v: "NT$ 1,284,500", t: "+12.4%", c: "#16A34A" },
            { l: "進行中專案", v: "8", t: "+2", c: "#16A34A" },
            { l: "待審申請", v: "23", t: "急", c: "#DC2626" },
            { l: "員工總數", v: "126", t: "持平", c: "#6B7280" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg p-4" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
              <div style={{ fontSize: "12.5px", color: "#9CA3AF", letterSpacing: "0.05em" }}>{s.l}</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#111827", marginTop: 4, letterSpacing: "-0.02em" }}>{s.v}</div>
              <div style={{ fontSize: "12.5px", color: s.c, marginTop: 4, fontWeight: 600 }}>{s.t}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 9. Forms ─────────────────────────────────────────────────────────────────
function FormsSection() {
  const [val, setVal] = useState("");
  const [sel, setSel] = useState("opt1");
  const [chk, setChk] = useState(true);
  const [tog, setTog] = useState(true);
  return (
    <div className="space-y-6">
      <SectionTitle title="表單元件" en="Forms" desc="輸入框、下拉、勾選、開關、單選等表單元件" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5">
          <SubTitle>文字輸入</SubTitle>
          <div className="space-y-3">
            <div>
              <label style={{ fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" }}>姓名</label>
              <input
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder="請輸入姓名"
                className="w-full px-3 py-2 rounded-md outline-none transition-colors"
                style={{ fontSize: "14px", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#111827" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" }}>搜尋</label>
              <div className="relative">
                <Search style={{ width: 14, height: 14, color: "#9CA3AF", position: "absolute", left: 10, top: 9 }} />
                <input placeholder="搜尋..." className="w-full pl-8 pr-3 py-2 rounded-md outline-none" style={{ fontSize: "14px", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#111827" }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" }}>錯誤狀態</label>
              <input value="無效輸入" readOnly className="w-full px-3 py-2 rounded-md outline-none" style={{ fontSize: "14px", borderWidth: "1px", borderStyle: "solid", borderColor: "#DC2626", color: "#111827", background: "#FEF2F2" }} />
              <p style={{ fontSize: "12.5px", color: "#DC2626", marginTop: 4 }}>此欄位格式錯誤</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <SubTitle>選擇器</SubTitle>
          <div className="space-y-3">
            <div>
              <label style={{ fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" }}>下拉選單</label>
              <StyledSelect
                value={sel}
                onChange={setSel}
                options={[
                  { key: "opt1", label: "選項一" },
                  { key: "opt2", label: "選項二" },
                  { key: "opt3", label: "選項三" },
                ]}
              />
            </div>
            <div>
              <label style={{ fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>勾選</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <button onClick={() => setChk(!chk)} className="rounded flex items-center justify-center transition-colors" style={{ width: 16, height: 16, background: chk ? "#111827" : "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: chk ? "#111827" : "#D1D5DB" }}>
                  {chk && <Check style={{ width: 11, height: 11, color: "#FFF" }} />}
                </button>
                <span style={{ fontSize: "14px", color: "#374151" }}>同意服務條款</span>
              </label>
            </div>
            <div>
              <label style={{ fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>開關</label>
              <button onClick={() => setTog(!tog)} className="rounded-full relative transition-colors" style={{ width: 36, height: 20, background: tog ? "#111827" : "#D1D5DB" }}>
                <div className="absolute top-0.5 rounded-full bg-white transition-all" style={{ width: 16, height: 16, left: tog ? 18 : 2, boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── 10. Feedback ─────────────────────────────────────────────────────────────
function FeedbackSection() {
  const alerts = [
    { Icon: Info,         c: "#2563EB", bg: "#EFF6FF", b: "#DBEAFE", title: "提示",   msg: "系統將於明日 02:00 進行例行維護。" },
    { Icon: CheckCircle2, c: "#16A34A", bg: "#F0FDF4", b: "#DCFCE7", title: "成功",   msg: "您的申請已成功送出。" },
    { Icon: AlertTriangle,c: "#CA8A04", bg: "#FEFCE8", b: "#FEF08A", title: "警告",   msg: "您的密碼將於 7 天內過期。" },
    { Icon: AlertCircle,  c: "#DC2626", bg: "#FEF2F2", b: "#FECACA", title: "錯誤",   msg: "發生錯誤，請稍後再試。" },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="回饋提示" en="Feedback" desc="Alert、Toast、Loading、Empty State 等回饋元件" />

      <Card className="p-5">
        <SubTitle hint="Alerts">警示框</SubTitle>
        <div className="space-y-2">
          {alerts.map((a) => (
            <div key={a.title} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: a.bg, borderWidth: "1px", borderStyle: "solid", borderColor: a.b }}>
              <a.Icon style={{ width: 16, height: 16, color: a.c, marginTop: 1 }} />
              <div className="flex-1">
                <div style={{ fontSize: "14px", fontWeight: 700, color: a.c }}>{a.title}</div>
                <div style={{ fontSize: "13.5px", color: "#374151", marginTop: 2 }}>{a.msg}</div>
              </div>
              <button><X style={{ width: 14, height: 14, color: a.c, opacity: 0.6 }} /></button>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5">
          <SubTitle hint="Loading">載入中</SubTitle>
          <div className="flex items-center gap-6 py-4">
            <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: "#111827" }} />
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#111827" }} />
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#111827", animationDelay: "0.2s" }} />
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#111827", animationDelay: "0.4s" }} />
            </div>
            <div className="flex-1">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                <div className="h-full rounded-full" style={{ background: "#111827", width: "60%" }} />
              </div>
              <div style={{ fontSize: "12.5px", color: "#9CA3AF", marginTop: 4 }}>60% 已完成</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <SubTitle hint="Empty State">空狀態</SubTitle>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: "#F3F4F6" }}>
              <FileText style={{ width: 20, height: 20, color: "#9CA3AF" }} />
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>暫無資料</div>
            <div style={{ fontSize: "12.5px", color: "#9CA3AF", marginTop: 2 }}>建立您的第一筆紀錄以開始使用</div>
            <button className="mt-3 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5" style={{ background: "#111827", color: "#FFF", fontSize: "13.5px", fontWeight: 600 }}>
              <Plus style={{ width: 12, height: 12 }} /> 新增
            </button>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SubTitle hint="Toast">即時通知</SubTitle>
        <div className="space-y-2">
          {alerts.slice(0, 3).map((a) => (
            <div key={a.title} className="flex items-center gap-3 p-3 rounded-lg max-w-md" style={{ background: "#FFF", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: a.bg }}>
                <a.Icon style={{ width: 14, height: 14, color: a.c }} />
              </div>
              <div className="flex-1">
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>{a.title}</div>
                <div style={{ fontSize: "12.5px", color: "#6B7280" }}>{a.msg}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 11. Patterns ─────────────────────────────────────────────────────────────
function PatternsSection() {
  return (
    <div className="space-y-6">
      <SectionTitle title="版型範例" en="Patterns" desc="頁面常見版型與組合範例" />

      {/* Page header */}
      <Card className="p-5">
        <SubTitle hint="Page Header">頁面標題列</SubTitle>
        <div className="rounded-lg p-4" style={{ background: "#F9FAFB" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ color: "#111827", marginBottom: 2 }}>專案管理</h2>
              <p style={{ fontSize: "13.5px", color: "#9CA3AF" }}>共 8 個進行中專案</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-md inline-flex items-center gap-1.5" style={{ fontSize: "13.5px", fontWeight: 600, color: "#374151", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                <ExternalLink style={{ width: 12, height: 12 }} /> 匯出
              </button>
              <button className="px-3 py-1.5 rounded-md inline-flex items-center gap-1.5" style={{ fontSize: "13.5px", fontWeight: 600, color: "#FFF", background: "#111827" }}>
                <Plus style={{ width: 12, height: 12 }} /> 新增專案
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* List item */}
      <Card>
        <div className="px-5 py-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
          <SubTitle hint="List">清單列項</SubTitle>
        </div>
        {[
          { name: "客戶後台改版", owner: "李雲生", status: "進行中", c: "#2563EB", bg: "#EFF6FF", date: "2026.05.20" },
          { name: "金流串接 v2", owner: "王小明", status: "已完成", c: "#16A34A", bg: "#F0FDF4", date: "2026.04.30" },
          { name: "行動 App POC",  owner: "張美華", status: "待啟動", c: "#CA8A04", bg: "#FEF9C3", date: "2026.06.15" },
        ].map((p) => (
          <div key={p.name} className="flex items-center gap-3 px-5 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1E3A5F, #60A5FA)", color: "#FFF", fontSize: 11, fontWeight: 700 }}>{p.name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{p.name}</div>
              <div style={{ fontSize: "12.5px", color: "#9CA3AF" }}>{p.owner} · {p.date}</div>
            </div>
            <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "12.5px", fontWeight: 600, color: p.c, background: p.bg }}>{p.status}</span>
            <ChevronRight style={{ width: 14, height: 14, color: "#D1D5DB" }} />
          </div>
        ))}
      </Card>

      {/* Modal preview */}
      <Card className="p-5">
        <SubTitle hint="Modal">對話框</SubTitle>
        <div className="rounded-lg p-6 flex items-center justify-center" style={{ background: "rgba(17,24,39,0.4)" }}>
          <div className="rounded-xl bg-white max-w-sm w-full" style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.16)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>確認刪除</h3>
              <X style={{ width: 16, height: 16, color: "#9CA3AF", cursor: "pointer" }} />
            </div>
            <div className="px-5 py-4">
              <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6 }}>此操作無法復原，確定要刪除此項目嗎？</p>
            </div>
            <div className="px-5 py-3 flex justify-end gap-2" style={{ background: "#F9FAFB", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
              <button className="px-3 py-1.5 rounded-md" style={{ fontSize: "13.5px", fontWeight: 600, color: "#374151", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>取消</button>
              <button className="px-3 py-1.5 rounded-md" style={{ fontSize: "13.5px", fontWeight: 600, color: "#FFF", background: "#DC2626" }}>確定刪除</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── 12. Motion ───────────────────────────────────────────────────────────────
function MotionSection() {
  return (
    <div className="space-y-6">
      <SectionTitle title="動效規範" en="Motion" desc="動效持續時間、曲線與用途，避免過度誇飾" />

      <Card className="p-5">
        <SubTitle hint="Duration">持續時間</SubTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "fast", v: 120, desc: "Hover、Active 反饋" },
            { name: "base", v: 200, desc: "切換 Tab、開合面板" },
            { name: "slow", v: 400, desc: "頁面切換、Modal" },
          ].map((m) => (
            <div key={m.name} className="rounded-lg p-4" style={{ background: "#F9FAFB" }}>
              <div className="flex items-baseline justify-between">
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{m.name}</span>
                <span style={{ fontSize: "12.5px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>{m.v}ms</span>
              </div>
              <div style={{ fontSize: "12.5px", color: "#6B7280", marginTop: 4 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Easing">緩動曲線</SubTitle>
        <div className="space-y-2 font-mono" style={{ fontSize: "13.5px" }}>
          {[
            { name: "ease-out",    v: "cubic-bezier(0.16, 1, 0.3, 1)",   desc: "進場、淡入" },
            { name: "ease-in-out", v: "cubic-bezier(0.4, 0, 0.2, 1)",    desc: "切換狀態" },
            { name: "spring",      v: "cubic-bezier(0.34, 1.56, 0.64, 1)", desc: "彈性互動" },
          ].map((e) => (
            <div key={e.name} className="flex items-center gap-3 py-2" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
              <span style={{ fontWeight: 700, color: "#111827", minWidth: 100 }}>{e.name}</span>
              <span style={{ color: "#6B7280", flex: 1 }}>{e.v}</span>
              <span style={{ color: "#9CA3AF", fontFamily: "'Noto Sans JP', sans-serif" }}>{e.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Demo">互動示範</SubTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "Hover 抬升", cls: "hover:-translate-y-1" },
            { name: "Hover 放大", cls: "hover:scale-105" },
            { name: "Hover 透明", cls: "hover:opacity-60" },
            { name: "Hover 旋轉", cls: "hover:rotate-3" },
          ].map((d) => (
            <div key={d.name} className={`rounded-lg p-5 flex items-center justify-center cursor-pointer transition-all duration-200 ${d.cls}`} style={{ background: "#111827", color: "#FFF", fontSize: "13.5px", fontWeight: 600 }}>
              {d.name}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 13. Accessibility ────────────────────────────────────────────────────────
// 計算 WCAG 對比度
function luminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a: string, b: string) {
  const l1 = luminance(a), l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
function rateContrast(r: number) {
  if (r >= 7) return { label: "AAA", color: "#16A34A", bg: "#F0FDF4" };
  if (r >= 4.5) return { label: "AA", color: "#16A34A", bg: "#F0FDF4" };
  if (r >= 3) return { label: "AA Large", color: "#CA8A04", bg: "#FEF9C3" };
  return { label: "Fail", color: "#DC2626", bg: "#FEF2F2" };
}

function A11ySection() {
  const pairs = [
    { fg: "#111827", bg: "#FFFFFF", label: "主文字 / 白底" },
    { fg: "#6B7280", bg: "#FFFFFF", label: "次要文字 / 白底" },
    { fg: "#9CA3AF", bg: "#FFFFFF", label: "輔助文字 / 白底" },
    { fg: "#FFFFFF", bg: "#111827", label: "白字 / 深墨底" },
    { fg: "#FFFFFF", bg: "#2563EB", label: "白字 / 品牌底" },
    { fg: "#FFFFFF", bg: "#DC2626", label: "白字 / 危險底" },
    { fg: "#FFFFFF", bg: "#16A34A", label: "白字 / 成功底" },
    { fg: "#CA8A04", bg: "#FEF9C3", label: "警告字 / 警告底" },
  ];
  const checklist = [
    "互動元件提供可見的 focus ring（2px solid #60A5FA）",
    "所有圖示按鈕需有 aria-label 或 title 描述",
    "顏色不可作為唯一資訊載體，需搭配文字或圖示",
    "表單欄位錯誤訊息需與顏色同時提示",
    "Modal 開啟時鎖定背景捲動，Esc 可關閉",
    "拖曳元件提供鍵盤替代操作（方向鍵 + Enter）",
    "圖表色彩不依賴紅綠對比，需含形狀或標籤輔助",
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="可訪問性" en="Accessibility · WCAG 2.1" desc="顏色對比度檢查與互動可達性原則" />

      <Card className="p-5">
        <SubTitle hint="Color Contrast">色彩對比度</SubTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pairs.map((p) => {
            const r = contrast(p.fg, p.bg);
            const rate = rateContrast(r);
            return (
              <div key={p.label} className="rounded-lg p-4 flex items-center gap-3" style={{ background: p.bg, borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                <div className="flex-1">
                  <div style={{ fontSize: "16px", fontWeight: 700, color: p.fg }}>Aa 範例文字</div>
                  <div style={{ fontSize: "13px", color: p.fg, opacity: 0.8, marginTop: 2 }}>{p.label}</div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: "20px", fontWeight: 800, color: p.fg, fontFamily: "'JetBrains Mono', monospace" }}>{r.toFixed(2)}</div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md mt-1" style={{ fontSize: "12px", fontWeight: 700, color: rate.color, background: rate.bg }}>{rate.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 12 }}>
          對比度標準：AA ≥ 4.5（內文）／ AA Large ≥ 3（18px 粗體或 24px 以上）／ AAA ≥ 7
        </p>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Focus Ring">鍵盤焦點</SubTitle>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-md outline-none" style={{ background: "#111827", color: "#FFF", fontSize: "14px", fontWeight: 600, boxShadow: "0 0 0 2px #FFF, 0 0 0 4px #60A5FA" }}>Focused 主要</button>
          <button className="px-4 py-2 rounded-md outline-none" style={{ background: "#FFF", color: "#111827", fontSize: "14px", fontWeight: 600, borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", boxShadow: "0 0 0 2px #FFF, 0 0 0 4px #60A5FA" }}>Focused 次要</button>
          <input placeholder="Focused 輸入框" className="px-3 py-2 rounded-md outline-none" style={{ fontSize: "14px", borderWidth: "1px", borderStyle: "solid", borderColor: "#60A5FA", boxShadow: "0 0 0 3px rgba(96,165,250,0.2)" }} />
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint={`${checklist.length} 項`}>無障礙清單</SubTitle>
        <ul className="space-y-2.5">
          {checklist.map((c) => (
            <li key={c} className="flex items-start gap-2.5">
              <CheckCircle2 style={{ width: 16, height: 16, color: "#16A34A", marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6 }}>{c}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ─── 14. Do & Don't ───────────────────────────────────────────────────────────
function GuidelinesSection() {
  const rules = [
    {
      topic: "按鈕主從關係",
      do: "同一動作組僅一顆深色主要按鈕，其餘為次要或 Ghost。",
      dont: "並列多顆深色按鈕導致使用者不知該點哪一顆。",
      doDemo: (
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-md" style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 600 }}>儲存</button>
          <button className="px-3 py-1.5 rounded-md" style={{ background: "#FFF", color: "#374151", fontSize: "13px", fontWeight: 600, borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>取消</button>
        </div>
      ),
      dontDemo: (
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-md" style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 600 }}>儲存</button>
          <button className="px-3 py-1.5 rounded-md" style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 600 }}>提交</button>
          <button className="px-3 py-1.5 rounded-md" style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 600 }}>取消</button>
        </div>
      ),
    },
    {
      topic: "陰影使用",
      do: "卡片用 elevation-2，懸浮層才用更深陰影。",
      dont: "對所有元件加重陰影，導致層級混亂、視覺浮誇。",
      doDemo: (
        <div className="rounded-lg p-3 bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", fontSize: "13px", color: "#111827" }}>克制 · 細微</div>
      ),
      dontDemo: (
        <div className="rounded-lg p-3 bg-white" style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.3)", fontSize: "13px", color: "#111827" }}>一般卡片用過深陰影</div>
      ),
    },
    {
      topic: "色彩語義",
      do: "紅色僅用於危險或錯誤、綠色僅用於成功。",
      dont: "為了好看用紅色當主要按鈕，造成誤觸與誤判。",
      doDemo: (
        <button className="px-3 py-1.5 rounded-md" style={{ background: "#DC2626", color: "#FFF", fontSize: "13px", fontWeight: 600 }}>刪除帳號</button>
      ),
      dontDemo: (
        <button className="px-3 py-1.5 rounded-md" style={{ background: "#DC2626", color: "#FFF", fontSize: "13px", fontWeight: 600 }}>儲存設定</button>
      ),
    },
    {
      topic: "標題與留白",
      do: "標題與內容間留 16-20px，區塊間 24-30px。",
      dont: "標題緊貼內容，視覺密集難以閱讀。",
      doDemo: (
        <div className="bg-white rounded-lg" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
          <div className="p-3"><div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>標題</div><div style={{ fontSize: "12px", color: "#6B7280", marginTop: 8 }}>內容文字</div></div>
        </div>
      ),
      dontDemo: (
        <div className="bg-white rounded-lg" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
          <div className="p-3"><div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>標題</div><div style={{ fontSize: "12px", color: "#6B7280", marginTop: 0 }}>內容文字</div></div>
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="使用守則" en="Do & Don't" desc="常見錯誤示範與正確做法對比" />

      {rules.map((r) => (
        <Card key={r.topic} className="p-5">
          <SubTitle>{r.topic}</SubTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg p-4" style={{ background: "#F0FDF4", borderWidth: "1px", borderStyle: "solid", borderColor: "#BBF7D0" }}>
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp style={{ width: 14, height: 14, color: "#16A34A" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#16A34A", letterSpacing: "0.05em" }}>DO</span>
              </div>
              <div className="mb-3">{r.doDemo}</div>
              <p style={{ fontSize: "13px", color: "#166534", lineHeight: 1.6 }}>{r.do}</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: "#FEF2F2", borderWidth: "1px", borderStyle: "solid", borderColor: "#FECACA" }}>
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown style={{ width: 14, height: 14, color: "#DC2626" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#DC2626", letterSpacing: "0.05em" }}>DON'T</span>
              </div>
              <div className="mb-3">{r.dontDemo}</div>
              <p style={{ fontSize: "13px", color: "#991B1B", lineHeight: 1.6 }}>{r.dont}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── 15. Tokens & Naming ──────────────────────────────────────────────────────
function TokensSection() {
  const zIndex = [
    { name: "base",     v: 0,   desc: "一般內容" },
    { name: "raised",   v: 10,  desc: "卡片懸浮" },
    { name: "dropdown", v: 50,  desc: "下拉選單" },
    { name: "sticky",   v: 100, desc: "黏性標頭" },
    { name: "drawer",   v: 200, desc: "側邊抽屜" },
    { name: "modal",    v: 300, desc: "對話框 + 遮罩" },
    { name: "toast",    v: 400, desc: "即時通知" },
    { name: "tooltip",  v: 500, desc: "工具提示" },
  ];
  const naming = [
    { type: "色彩",   pattern: "color-{role}-{shade}",   ex: "color-ink-900 / color-bg-main" },
    { type: "間距",   pattern: "space-{size}",           ex: "space-md / space-2xl" },
    { type: "字級",   pattern: "text-{role}",            ex: "text-h1 / text-body" },
    { type: "圓角",   pattern: "radius-{size}",          ex: "radius-md / radius-full" },
    { type: "陰影",   pattern: "shadow-{level}",         ex: "shadow-card / shadow-modal" },
    { type: "動效",   pattern: "duration-{speed}",       ex: "duration-fast / duration-base" },
    { type: "Z-Index",pattern: "z-{layer}",              ex: "z-modal / z-toast" },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="命名與層級" en="Tokens & Z-Index" desc="設計 Token 命名規範與 Z-Index 階層配置" />

      <Card className="p-5">
        <SubTitle hint="Naming Convention">命名規範</SubTitle>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["類別", "Pattern", "範例"].map((h) => (
                  <th key={h} className="text-left px-4 py-3" style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {naming.map((n) => (
                <tr key={n.type} style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                  <td className="px-4 py-3" style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{n.type}</td>
                  <td className="px-4 py-3"><code style={{ fontSize: "12.5px", color: "#1E40AF", background: "#EFF6FF", padding: "2px 8px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace" }}>{n.pattern}</code></td>
                  <td className="px-4 py-3" style={{ fontSize: "13px", color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{n.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Z-Index Scale">Z-Index 階層</SubTitle>
        <div className="space-y-2">
          {zIndex.map((z) => (
            <div key={z.name} className="flex items-center gap-3 py-2.5" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
              <div style={{ minWidth: 90 }}>
                <code style={{ fontSize: "13px", fontWeight: 700, color: "#111827", fontFamily: "'JetBrains Mono', monospace" }}>z-{z.name}</code>
              </div>
              <div style={{ minWidth: 60, fontSize: "13px", color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{z.v}</div>
              <div className="flex-1" style={{ fontSize: "14px", color: "#374151" }}>{z.desc}</div>
              <div className="rounded h-2" style={{ width: Math.min(z.v / 5 + 20, 200), background: "linear-gradient(90deg, #111827, #60A5FA)", opacity: 0.3 + z.v / 1000 }} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Code Sample">CSS 變數使用</SubTitle>
        <pre className="overflow-x-auto rounded-lg px-4 py-3" style={{ background: "#1E293B", color: "#E2E8F0", fontSize: "13px", lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
{`:root {
  --color-ink-900: #111827;
  --color-bg-main: #F5F6F9;
  --space-md: 12px;
  --radius-md: 6px;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06);
  --duration-base: 200ms;
  --z-modal: 300;
}

.card {
  background: var(--color-bg-main);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  transition: all var(--duration-base) ease-out;
}`}
        </pre>
      </Card>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function DesignSystem2() {
  const [section, setSection] = useState<Section>("overview");

  const renderSection = () => {
    switch (section) {
      case "overview":   return <OverviewSection />;
      case "ia":         return <IASection />;
      case "colors":     return <ColorsSection />;
      case "typography": return <TypographySection />;
      case "spacing":    return <SpacingSection />;
      case "elevation":  return <ElevationSection />;
      case "iconography":return <IconographySection />;
      case "components": return <ComponentsSection />;
      case "forms":      return <FormsSection />;
      case "feedback":   return <FeedbackSection />;
      case "patterns":   return <PatternsSection />;
      case "motion":     return <MotionSection />;
      case "a11y":       return <A11ySection />;
      case "guidelines": return <GuidelinesSection />;
      case "tokens":     return <TokensSection />;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #111827 0%, #1E3A5F 100%)" }}>
            <Sparkles style={{ width: 18, height: 18, color: "#60A5FA" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ color: "#111827", letterSpacing: "-0.02em" }}>Design System</h1>
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 700, color: "#FFF", background: "linear-gradient(135deg, #111827, #1E3A5F)", letterSpacing: "0.05em" }}>2.0</span>
            </div>
            <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: 2 }}>KUMO WORKSPACE 設計語言系統 · 僅系統管理者可見</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-md inline-flex items-center gap-1.5" style={{ fontSize: "12.5px", fontWeight: 600, color: "#374151", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
            <Copy style={{ width: 11, height: 11 }} /> 複製 Tokens
          </button>
          <button className="px-3 py-1.5 rounded-md inline-flex items-center gap-1.5" style={{ fontSize: "12.5px", fontWeight: 600, color: "#FFF", background: "#111827" }}>
            <ExternalLink style={{ width: 11, height: 11 }} /> 在 Figma 開啟
          </button>
        </div>
      </div>

      {/* Mobile select / Desktop tab */}
      <div className="md:hidden">
        <StyledSelect
          value={section}
          onChange={(v) => setSection(v as Section)}
          options={NAV.map((n) => ({ key: n.key, label: n.label }))}
        />
      </div>

      <div className="hidden md:block">
        <DraggableScroll>
          <div className="inline-flex p-1 rounded-lg gap-1" style={{ background: "#F3F4F6" }}>
            {NAV.map((n) => {
              const active = section === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => setSection(n.key)}
                  className="px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 transition-all whitespace-nowrap"
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: active ? "#FFF" : "#6B7280",
                    background: active ? "#111827" : "transparent",
                  }}
                >
                  <n.Icon style={{ width: 12, height: 12 }} />
                  {n.label}
                </button>
              );
            })}
          </div>
        </DraggableScroll>
      </div>

      {/* Content */}
      {renderSection()}
    </div>
  );
}

export default DesignSystem2;
