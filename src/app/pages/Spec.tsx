import React, { useState } from "react";
import {
  FileText, Target, Cpu, Workflow, Boxes, Palette, ShieldCheck, FolderTree,
  GitBranch, ListTodo, Sparkles, ChevronRight, ChevronDown, CheckCircle2, Circle,
  LayoutDashboard, Receipt, Clock, Bell, CheckSquare, Package, FolderKanban,
  Fingerprint, Mail, Users, Sliders, Settings, Check, X, Code2, Calendar,
  GitFork, LogIn, Send, Upload, FileCheck, Megaphone, UserPlus, Lock, Reply,
  Play, MapPin, AlertCircle,
} from "lucide-react";
import { StyledSelect } from "../components/StyledSelect";
import { DraggableScroll } from "../components/DraggableScroll";
import { Mermaid } from "../components/Mermaid";

type Section =
  | "overview" | "tech" | "ia" | "modules" | "flows" | "design"
  | "auth" | "structure" | "changelog" | "roadmap";

const NAV: { key: Section; label: string; en: string; Icon: any }[] = [
  { key: "overview",  label: "產品概述",   en: "Overview",   Icon: Target },
  { key: "tech",      label: "技術規格",   en: "Tech Stack", Icon: Cpu },
  { key: "ia",        label: "資訊架構",   en: "IA",         Icon: Workflow },
  { key: "modules",   label: "模組規格",   en: "Modules",    Icon: Boxes },
  { key: "flows",     label: "功能流程",   en: "Flows",      Icon: GitFork },
  { key: "design",    label: "設計系統",   en: "Design",     Icon: Palette },
  { key: "auth",      label: "認證授權",   en: "Auth",       Icon: ShieldCheck },
  { key: "structure", label: "檔案結構",   en: "Structure",  Icon: FolderTree },
  { key: "changelog", label: "版本紀錄",   en: "Changelog",  Icon: GitBranch },
  { key: "roadmap",   label: "未來規劃",   en: "Roadmap",    Icon: ListTodo },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────
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
    {hint && <span style={{ fontSize: "14px", color: "#9CA3AF" }}>{hint}</span>}
  </div>
);

const Tag = ({ children, color = "#6B7280", bg = "#F3F4F6" }: { children: React.ReactNode; color?: string; bg?: string }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-md" style={{ fontSize: "13.5px", fontWeight: 600, color, background: bg, letterSpacing: "0.02em" }}>
    {children}
  </span>
);

const KV = ({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) => (
  <div className="flex items-center gap-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
    <span style={{ fontSize: "14px", color: "#6B7280", minWidth: 110 }}>{k}</span>
    <span style={{ fontSize: "15px", fontWeight: 600, color: "#111827", fontFamily: mono ? "'JetBrains Mono', monospace" : undefined }}>{v}</span>
  </div>
);

// ─── 1. Overview ──────────────────────────────────────────────────────────────
function Overview() {
  const principles = [
    { title: "結構優先", desc: "資訊架構先於視覺", icon: Workflow },
    { title: "克制留白", desc: "日系後台美學", icon: Sparkles },
    { title: "可預測",   desc: "互動結果一致", icon: Target },
    { title: "權限可見", desc: "依角色顯示功能", icon: ShieldCheck },
  ];
  const roles = [
    { k: "admin",           label: "系統管理者", duty: "全模組管理、設計系統檢視", home: "/", c: "#DC2626", bg: "#FEF2F2" },
    { k: "finance_manager", label: "財務主管",   duty: "財務、薪資、報表",         home: "/", c: "#059669", bg: "#ECFDF5" },
    { k: "hr_manager",      label: "人資主管",   duty: "員工、出缺勤、資產、公告", home: "/", c: "#7C3AED", bg: "#F5F3FF" },
    { k: "pm",              label: "專案經理",   duty: "專案、任務、Sprint",       home: "/", c: "#2563EB", bg: "#EFF6FF" },
    { k: "product_manager", label: "產品經理",   duty: "產品、任務、公告",         home: "/", c: "#CA8A04", bg: "#FFFBEB" },
    { k: "staff",           label: "一般員工",   duty: "打卡、任務、訊息、公告",   home: "/punch", c: "#374151", bg: "#F3F4F6" },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="產品概述" en="Overview" desc="KUMO WORKSPACE 是內部協作管理平台，整合打卡、出缺勤、專案、任務、財務等模組" />

      {/* Hero */}
      <Card style={{ background: "linear-gradient(135deg, #111827 0%, #1E3A5F 100%)", borderColor: "transparent" }}>
        <div className="px-7 py-7 text-white">
          <div className="flex items-center gap-2 mb-3">
            <FileText style={{ width: 16, height: 16, color: "#60A5FA" }} />
            <span style={{ fontSize: "12.5px", letterSpacing: "0.18em", color: "#93C5FD", fontWeight: 600 }}>PRODUCT SPEC v2.0</span>
          </div>
          <h1 style={{ color: "#FFF", letterSpacing: "-0.02em" }}>雲のワークスペース</h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", marginTop: 8, maxWidth: 560, lineHeight: 1.7 }}>
            內部協作管理平台規格書。定義產品範疇、技術選型、資訊架構、模組規格與設計語言。
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { l: "模組數", v: "13" },
              { l: "角色數", v: "6" },
              { l: "頁面數", v: "16" },
              { l: "版本",   v: "v2.0" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#FFF", letterSpacing: "-0.02em" }}>{s.v}</div>
                <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Principles */}
      <Card className="p-5">
        <SubTitle hint="Design Principles">設計理念</SubTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {principles.map((p) => (
            <div key={p.title} className="p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
              <div className="w-8 h-8 rounded-md flex items-center justify-center mb-2" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                <p.icon style={{ width: 14, height: 14, color: "#111827" }} />
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{p.title}</div>
              <div style={{ fontSize: "12.5px", color: "#6B7280", marginTop: 2 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Roles */}
      <Card>
        <div className="px-5 py-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
          <SubTitle hint="6 角色">目標使用者</SubTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["角色", "識別碼", "主要職責", "預設首頁"].map((h) => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: "12.5px", fontWeight: 600, color: "#6B7280", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.k} style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: r.c, color: "#FFF", fontSize: 10, fontWeight: 700 }}>{r.label.charAt(0)}</div>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{r.label}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><Tag color={r.c} bg={r.bg}>{r.k}</Tag></td>
                  <td className="px-5 py-3" style={{ fontSize: "13.5px", color: "#6B7280" }}>{r.duty}</td>
                  <td className="px-5 py-3"><code style={{ fontSize: "12.5px", color: "#111827", background: "#F3F4F6", padding: "2px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace" }}>{r.home}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── 2. Tech ──────────────────────────────────────────────────────────────────
function Tech() {
  return (
    <div className="space-y-6">
      <SectionTitle title="技術規格" en="Tech Stack" desc="技術選型、環境特性與開發約定" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5">
          <SubTitle hint="Stack">技術棧</SubTitle>
          <KV k="前端框架" v="React 18 + TypeScript" />
          <KV k="樣式" v="Tailwind CSS v4" />
          <KV k="路由" v={<>react-router <Tag color="#DC2626" bg="#FEF2F2">非 dom</Tag></>} mono />
          <KV k="圖示" v="lucide-react" mono />
          <KV k="字型" v="Noto Sans JP + Serif JP" />
          <KV k="狀態管理" v="React Context" />
          <KV k="入口" v="src/app/App.tsx" mono />
        </Card>

        <Card className="p-5">
          <SubTitle hint="Constraints">環境約定</SubTitle>
          <ul className="space-y-2.5">
            {[
              "Tailwind v4 inline border 須拆分 borderWidth / Style / Color",
              "字型匯入只在 /src/styles/fonts.css 頂部",
              "不使用 text-2xl / font-bold / leading-none",
              "Design System 文字最小 10px 並加深顏色",
              "幣值統一 NT$ X,XXX 格式",
              "全站文字繁體中文",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check style={{ width: 14, height: 14, color: "#16A34A", marginTop: 2 }} />
                <span style={{ fontSize: "13.5px", color: "#374151", lineHeight: 1.6 }}>{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5">
        <SubTitle hint="Code Convention">程式碼範例</SubTitle>
        <pre className="overflow-x-auto rounded-lg px-4 py-3" style={{ background: "#1E293B", color: "#E2E8F0", fontSize: "13.5px", lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace" }}>
{`// ✓ 正確 — Tailwind v4 inline 邊框
<div style={{
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#E5E7EB",
}} />

// ✗ 錯誤 — border 簡寫於 v4 不生效
<div style={{ border: "1px solid #E5E7EB" }} />`}
        </pre>
      </Card>
    </div>
  );
}

// ─── 3. IA ────────────────────────────────────────────────────────────────────
function IA() {
  const access: Record<string, boolean[]> = {
    "總覽":     [true, true, true, true, true, false],
    "打卡":     [true, true, true, true, true, true],
    "公告":     [true, false, true, true, true, true],
    "出缺勤":   [true, false, true, false, false, false],
    "專案":     [true, false, false, true, true, false],
    "任務":     [true, false, false, true, true, true],
    "資產":     [true, false, true, false, false, false],
    "財務":     [true, true, false, false, false, false],
    "權限":     [true, false, false, false, false, false],
    "員工":     [true, false, true, false, false, false],
    "訊息":     [true, true, true, true, true, true],
    "設定":     [true, false, false, false, false, false],
    "DS / 2.0": [true, false, false, false, false, false],
  };
  const cols = ["admin", "finance", "hr", "pm", "product", "staff"];
  const colColors = ["#DC2626", "#059669", "#7C3AED", "#2563EB", "#CA8A04", "#374151"];

  return (
    <div className="space-y-6">
      <SectionTitle title="資訊架構" en="Information Architecture" desc="路由、模組層級與角色存取矩陣" />

      <Card className="p-5">
        <SubTitle hint="Sitemap">站台地圖</SubTitle>
        <pre className="rounded-lg px-4 py-3" style={{ background: "#FAFAFA", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6", fontSize: "13.5px", lineHeight: 1.7, color: "#374151", fontFamily: "'JetBrains Mono', monospace" }}>
{`KUMO WORKSPACE
├─ /                  總覽
├─ /punch             打卡
├─ /announcements     最新公告
├─ /attendance        出缺勤
├─ /projects          專案管理
├─ /tasks             工作事項
│  ├─ Sprint 看板
│  ├─ Sprint 報表
│  └─ 任務追蹤
├─ /assets            資產管理
├─ /finance           財務管理
├─ /permissions       權限管理
├─ /employees         員工管理
├─ /notifications     訊息中心
├─ /settings          系統設定
├─ /design-system     Design System
└─ /design-system-2   Design System 2.0  [admin]`}
        </pre>
      </Card>

      <Card>
        <div className="px-5 py-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
          <SubTitle hint="6 角色 × 13 模組">存取矩陣</SubTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: "13.5px" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                <th className="text-left px-4 py-3" style={{ fontSize: "12.5px", fontWeight: 600, color: "#6B7280" }}>模組</th>
                {cols.map((c, i) => (
                  <th key={c} className="text-center px-2 py-3" style={{ fontSize: "12.5px", fontWeight: 700, color: colColors[i], letterSpacing: "0.02em" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(access).map(([mod, perms]) => (
                <tr key={mod} style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                  <td className="px-4 py-2.5" style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>{mod}</td>
                  {perms.map((ok, i) => (
                    <td key={i} className="text-center px-2 py-2.5">
                      {ok ? (
                        <CheckCircle2 style={{ width: 14, height: 14, color: colColors[i], display: "inline" }} />
                      ) : (
                        <span style={{ fontSize: "13.5px", color: "#D1D5DB" }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Responsive">響應式導覽</SubTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "桌面", spec: "240px 永久側欄", padding: "padding 30px" },
            { name: "平板", spec: "200px 側欄",     padding: "padding 24px" },
            { name: "手機", spec: "抽屜側欄",       padding: "Tab → 下拉" },
          ].map((d) => (
            <div key={d.name} className="rounded-lg p-4" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{d.name}</div>
              <div style={{ fontSize: "12.5px", color: "#6B7280", marginTop: 4 }}>{d.spec}</div>
              <div style={{ fontSize: "12.5px", color: "#9CA3AF", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{d.padding}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 4. Modules ───────────────────────────────────────────────────────────────
function Modules() {
  const list = [
    { icon: Fingerprint,     name: "打卡",     path: "/punch",         desc: "上下班打卡、位置紀錄。全員可見、staff 預設首頁。", tags: ["全員"] },
    { icon: Clock,           name: "出缺勤",   path: "/attendance",    desc: "出勤紀錄列表、請假審核流程。",                       tags: ["HR", "Admin"] },
    { icon: FolderKanban,    name: "專案管理", path: "/projects",      desc: "專案總覽卡片、里程碑、團隊成員。",                   tags: ["PM", "Product", "Admin"] },
    { icon: CheckSquare,     name: "工作事項", path: "/tasks",         desc: "Jira 風格 Sprint 看板：規劃 → 進行 → 結算 → 報表。", tags: ["Kanban", "Sprint", "報表"] },
    { icon: Package,         name: "資產管理", path: "/assets",        desc: "設備盤點、領用紀錄。",                               tags: ["HR", "Admin"] },
    { icon: Receipt,         name: "財務管理", path: "/finance",       desc: "費用申請、薪資、財報，幣值 NT$ 格式。",              tags: ["Finance", "Admin"] },
    { icon: ShieldCheck,     name: "權限管理", path: "/permissions",   desc: "六角色權限矩陣，由 AuthContext 集中定義。",          tags: ["Admin"] },
    { icon: Users,           name: "員工管理", path: "/employees",     desc: "員工資料、組織架構樹。",                             tags: ["HR", "Admin"] },
    { icon: Bell,            name: "最新公告", path: "/announcements", desc: "公司公告佈達。",                                     tags: ["全員（除 finance）"] },
    { icon: Mail,            name: "訊息中心", path: "/notifications", desc: "系統通知、內部信件回覆。",                           tags: ["全員"] },
    { icon: Sliders,         name: "系統設定", path: "/settings",      desc: "個人偏好、系統參數。",                               tags: ["Admin"] },
    { icon: LayoutDashboard, name: "總覽",     path: "/",              desc: "管理者首頁，集中關鍵指標。",                         tags: ["除 staff"] },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="模組規格" en="Modules" desc={`共 ${list.length} 個主模組，工作事項含 3 個子模組`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map((m) => (
          <Card key={m.path} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #F9FAFB, #F3F4F6)", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                <m.icon style={{ width: 16, height: 16, color: "#111827" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{m.name}</h3>
                  <code style={{ fontSize: "10px", color: "#6B7280", background: "#F3F4F6", padding: "1px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace" }}>{m.path}</code>
                </div>
                <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: 4, lineHeight: 1.6 }}>{m.desc}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {m.tags.map((t) => <Tag key={t}>{t}</Tag>)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tasks deep dive */}
      <Card className="p-5">
        <SubTitle hint="Tasks · 深入規格">工作事項（Jira 風格）</SubTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "Sprint 看板", desc: "欄位拖曳卡片、即時點數結算、外部文件連結（Figma、Google Docs）" },
            { name: "Sprint 報表", desc: "速率（Velocity）、燃盡圖（Burndown）" },
            { name: "任務追蹤",   desc: "員工任務追蹤面板，依負責人聚合" },
          ].map((s) => (
            <div key={s.name} className="rounded-lg p-3" style={{ background: "#F9FAFB" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>{s.name}</div>
              <div style={{ fontSize: "12.5px", color: "#6B7280", marginTop: 4, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 py-3 px-3 rounded-lg mt-3" style={{ background: "#F0F9FF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E0F2FE" }}>
          <span style={{ fontSize: "12.5px", color: "#0369A1", fontWeight: 600 }}>Sprint 生命週期：</span>
          {["規劃", "進行", "結算", "報表"].map((s, i, a) => (
            <React.Fragment key={s}>
              <span className="px-2 py-0.5 rounded" style={{ fontSize: "12.5px", fontWeight: 600, color: "#0369A1", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#BAE6FD" }}>{s}</span>
              {i < a.length - 1 && <ChevronRight style={{ width: 11, height: 11, color: "#7DD3FC" }} />}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 5. Design ────────────────────────────────────────────────────────────────
function Design() {
  const tokens = [
    { name: "深墨色",   hex: "#111827", t: "ink-900",     dark: true },
    { name: "主背景",   hex: "#F5F6F9", t: "bg-main" },
    { name: "白色",     hex: "#FFFFFF", t: "white" },
    { name: "藍強調",   hex: "#60A5FA", t: "accent-blue" },
    { name: "漸層深",   hex: "#1E3A5F", t: "gradient",    dark: true },
    { name: "品牌色",   hex: "#2563EB", t: "brand",       dark: true },
  ];
  const semantics = [
    { name: "成功", c: "#16A34A", bg: "#F0FDF4" },
    { name: "警告", c: "#CA8A04", bg: "#FEF9C3" },
    { name: "危險", c: "#DC2626", bg: "#FEF2F2" },
    { name: "資訊", c: "#2563EB", bg: "#EFF6FF" },
    { name: "紫色", c: "#7C3AED", bg: "#F5F3FF" },
  ];
  const scale = [
    { name: "Display", size: 32, weight: 800 },
    { name: "H1",      size: 22, weight: 700 },
    { name: "H2",      size: 17, weight: 700 },
    { name: "H3",      size: 14, weight: 700 },
    { name: "Body",    size: 14, weight: 450 },
    { name: "Small",   size: 12, weight: 450 },
    { name: "Tiny",    size: 10, weight: 600 },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="設計系統" en="Design Tokens" desc="色彩、字級、間距、圓角、動效核心 Token 摘要" />

      <Card className="p-5">
        <SubTitle hint="Brand">品牌色</SubTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {tokens.map((t) => (
            <div key={t.t}>
              <div className="h-16 rounded-lg mb-2 flex items-end p-2" style={{ background: t.hex, borderWidth: "1px", borderStyle: "solid", borderColor: t.dark ? "transparent" : "#E5E7EB" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: t.dark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>{t.hex}</span>
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>{t.name}</div>
              <div style={{ fontSize: "10px", color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>{t.t}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Semantic">語義色</SubTitle>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {semantics.map((s) => (
            <div key={s.name} className="rounded-lg p-3" style={{ background: s.bg, borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: s.c }}>{s.name}</div>
              <div style={{ fontSize: "10px", color: "#6B7280", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{s.c}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5">
          <SubTitle hint="Type Scale">字級</SubTitle>
          <div className="space-y-2">
            {scale.map((s) => (
              <div key={s.name} className="flex items-baseline gap-3 py-1.5" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#111827", minWidth: 60 }}>{s.name}</span>
                <span style={{ fontSize: `${Math.min(s.size, 18)}px`, fontWeight: s.weight, color: "#374151", flex: 1 }}>{s.name}</span>
                <span style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>{s.size}/{s.weight}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SubTitle hint="Spacing · 4px base">間距</SubTitle>
          <div className="space-y-2">
            {[["xs", 4], ["sm", 8], ["md", 12], ["lg", 16], ["xl", 24], ["2xl", 30], ["3xl", 48]].map(([n, v]) => (
              <div key={n as string} className="flex items-center gap-3">
                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#111827", minWidth: 40 }}>{n}</span>
                <span style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace", minWidth: 40 }}>{v}px</span>
                <div style={{ height: 10, width: (v as number) * 2, background: "#111827", borderRadius: 2 }} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SubTitle hint="Motion">動效</SubTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "fast", v: "120ms", desc: "Hover 反饋" },
            { name: "base", v: "200ms", desc: "Tab 切換、面板開合" },
            { name: "slow", v: "400ms", desc: "頁面切換、Modal" },
          ].map((m) => (
            <div key={m.name} className="rounded-lg p-3" style={{ background: "#F9FAFB" }}>
              <div className="flex items-baseline justify-between">
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>{m.name}</span>
                <span style={{ fontSize: "10px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>{m.v}</span>
              </div>
              <div style={{ fontSize: "12.5px", color: "#6B7280", marginTop: 2 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 6. Auth ──────────────────────────────────────────────────────────────────
function Auth() {
  return (
    <div className="space-y-6">
      <SectionTitle title="認證授權" en="Authentication & Authorization" desc="登入流程、權限守衛、預設帳號" />

      <Card className="p-5">
        <SubTitle hint="Demo Accounts">預設帳號</SubTitle>
        <div className="rounded-lg p-4" style={{ background: "#FEF2F2", borderWidth: "1px", borderStyle: "solid", borderColor: "#FECACA" }}>
          <div className="flex items-center gap-2">
            <ShieldCheck style={{ width: 14, height: 14, color: "#DC2626" }} />
            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#DC2626" }}>系統管理者</span>
          </div>
          <div className="flex gap-3 mt-2 font-mono" style={{ fontSize: "14px" }}>
            <span><span style={{ color: "#9CA3AF" }}>帳號</span> <span style={{ fontWeight: 700, color: "#111827" }}>lys</span></span>
            <span><span style={{ color: "#9CA3AF" }}>密碼</span> <span style={{ fontWeight: 700, color: "#111827" }}>123456</span></span>
          </div>
        </div>
        <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: 10 }}>其他角色透過快速登入卡片切換（縮小版位於正式登入下方）。</p>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Login Flow">登入流程</SubTitle>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { s: "/login" },
            { s: "帳密 / SSO Tab" },
            { s: "驗證" },
            { s: "admin → /" },
            { s: "其他 → /punch" },
          ].map((step, i, a) => (
            <React.Fragment key={i}>
              <div className="px-3 py-1.5 rounded-md" style={{ background: i === a.length - 1 || i === a.length - 2 ? "#111827" : "#FFF", color: i === a.length - 1 || i === a.length - 2 ? "#FFF" : "#111827", fontSize: "13.5px", fontWeight: 600, borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>{step.s}</div>
              {i < a.length - 1 && <ChevronRight style={{ width: 14, height: 14, color: "#9CA3AF" }} />}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 p-3 rounded-lg" style={{ background: "#FFFBEB", borderWidth: "1px", borderStyle: "solid", borderColor: "#FEF3C7" }}>
          <div style={{ fontSize: "12.5px", color: "#CA8A04", fontWeight: 600 }}>備註</div>
          <div style={{ fontSize: "12.5px", color: "#374151", marginTop: 2 }}>SSO 三按鈕（Google / Microsoft / SAML）目前皆走 <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>handleDemoLogin("staff")</code>。</div>
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle hint="Guard">權限守衛</SubTitle>
        <ul className="space-y-2">
          {[
            "Root.tsx 內 isRouteAllowed 對每個路徑檢查",
            "未通過 → 渲染 AccessDenied 元件",
            "hasAccess(path) 由 AuthContext 提供，用於側邊欄過濾",
            "Design System 2.0 額外限定 admin",
          ].map((l) => (
            <li key={l} className="flex items-start gap-2">
              <Circle style={{ width: 6, height: 6, color: "#111827", marginTop: 6, fill: "#111827" }} />
              <span style={{ fontSize: "13.5px", color: "#374151" }}>{l}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ─── 7. Structure ─────────────────────────────────────────────────────────────
function Structure() {
  return (
    <div className="space-y-6">
      <SectionTitle title="檔案結構" en="File Structure" desc="專案目錄組織" />

      <Card className="p-5">
        <SubTitle hint="src/app">主要目錄</SubTitle>
        <pre className="rounded-lg px-4 py-3 overflow-x-auto" style={{ background: "#1E293B", color: "#E2E8F0", fontSize: "13.5px", lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
{`src/app/
├── App.tsx                # 預設導出
├── routes.ts              # react-router 設定
├── context/
│   └── AuthContext.tsx    # 角色、權限、登入登出
├── components/
│   ├── Root.tsx           # 側欄 + Top bar + Outlet
│   ├── StyledSelect.tsx   # 自製下拉
│   ├── DraggableScroll.tsx
│   ├── DatePicker.tsx
│   ├── EmployeeTaskTracker.tsx
│   ├── HierarchySection.tsx
│   ├── NotificationBell.tsx
│   ├── Pagination.tsx
│   ├── ReadOnlyBanner.tsx
│   ├── SubNav.tsx
│   ├── ExportCSV.tsx
│   └── figma/, ui/
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Punch.tsx
│   ├── Announcements.tsx
│   ├── Attendance.tsx
│   ├── Projects.tsx
│   ├── Tasks.tsx
│   ├── Assets.tsx
│   ├── Finance.tsx
│   ├── Permissions.tsx
│   ├── Employees.tsx
│   ├── Notifications.tsx
│   ├── Settings.tsx
│   ├── DesignSystem.tsx
│   ├── DesignSystem2.tsx
│   ├── Spec.tsx
│   └── AccessDenied.tsx
└── data/`}
        </pre>
      </Card>
    </div>
  );
}

// ─── 8. Changelog ─────────────────────────────────────────────────────────────
function Changelog() {
  const log = [
    { v: "2.0.0", date: "2026-05-06", note: "重構 IA、Design System 2.0、Spec 頁面", current: true },
    { v: "1.4.0", date: "2026-04-18", note: "Sprint 看板色票、任務狀態膠囊" },
    { v: "1.3.0", date: "2026-03-22", note: "統一標題右側按鈕縮小版樣式" },
    { v: "1.2.0", date: "2026-02-15", note: "DraggableScroll 與手機版下拉切換" },
    { v: "1.0.0", date: "2026-01-10", note: "Design System 1.0 初版發布" },
  ];
  return (
    <div className="space-y-6">
      <SectionTitle title="版本紀錄" en="Changelog" desc="主要版本與里程碑" />
      <Card className="p-5">
        <div className="relative">
          <div className="absolute left-2 top-2 bottom-2 w-px" style={{ background: "#E5E7EB" }} />
          <div className="space-y-4">
            {log.map((l) => (
              <div key={l.v} className="flex gap-4 relative">
                <div className="rounded-full shrink-0 mt-1.5 z-10" style={{ width: 10, height: 10, background: l.current ? "#16A34A" : "#D1D5DB", marginLeft: -2, borderWidth: "2px", borderStyle: "solid", borderColor: "#FFF", boxShadow: l.current ? "0 0 0 3px rgba(22,163,74,0.15)" : "none" }} />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#111827", fontFamily: "'JetBrains Mono', monospace" }}>{l.v}</span>
                    {l.current && <Tag color="#16A34A" bg="#F0FDF4">當前</Tag>}
                    <span style={{ fontSize: "12.5px", color: "#9CA3AF", fontFamily: "'JetBrains Mono', monospace" }}>
                      <Calendar style={{ width: 10, height: 10, display: "inline", marginRight: 3 }} />
                      {l.date}
                    </span>
                  </div>
                  <div style={{ fontSize: "13.5px", color: "#374151", marginTop: 3 }}>{l.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── 9. Roadmap ───────────────────────────────────────────────────────────────
function Roadmap() {
  const items = [
    { t: "SSO 真實串接（目前為 demo）", p: "高" },
    { t: "Tokens 抽至 theme.css 變數",  p: "高" },
    { t: "Sprint 報表自動週期匯出",     p: "中" },
    { t: "訊息中心推播整合",           p: "中" },
    { t: "國際化（多語系）",           p: "低" },
    { t: "桌面 / 行動原生 App 評估",   p: "低" },
  ];
  const pColor: Record<string, { c: string; bg: string }> = {
    高: { c: "#DC2626", bg: "#FEF2F2" },
    中: { c: "#CA8A04", bg: "#FEF9C3" },
    低: { c: "#6B7280", bg: "#F3F4F6" },
  };
  return (
    <div className="space-y-6">
      <SectionTitle title="未來規劃" en="Roadmap" desc="待辦事項與優先級" />
      <Card>
        {items.map((i, idx) => (
          <div key={i.t} className="flex items-center gap-3 px-5 py-3" style={{ borderTopWidth: idx === 0 ? 0 : "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
            <div className="rounded flex items-center justify-center" style={{ width: 16, height: 16, borderWidth: "1.5px", borderStyle: "solid", borderColor: "#D1D5DB" }} />
            <span className="flex-1" style={{ fontSize: "14px", color: "#111827" }}>{i.t}</span>
            <Tag color={pColor[i.p].c} bg={pColor[i.p].bg}>{i.p}優先</Tag>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── Flows (Mermaid Dynamic) ──────────────────────────────────────────────────
const FLOWS: { key: string; title: string; desc: string; icon: any; chart: string }[] = [
  {
    key: "login", title: "登入流程", desc: "帳密 / SSO 雙模式，依角色決定首頁", icon: LogIn,
    chart: `flowchart TD
  A([進入 /login]):::start --> B{選擇登入方式}
  B -->|帳密| C[輸入帳號密碼]
  B -->|SSO| D[Google / Microsoft / SAML]
  C --> E{驗證通過?}
  E -->|否| F[顯示錯誤訊息]:::err
  F --> C
  E -->|是| G[寫入 AuthContext]:::sys
  D --> H[handleDemoLogin]:::sys
  H --> G
  G --> I{角色?}
  I -->|admin| J([跳轉 /]):::end1
  I -->|其他| K([跳轉 /punch]):::end1
  classDef start fill:#111827,stroke:#111827,color:#FFF
  classDef end1 fill:#16A34A,stroke:#16A34A,color:#FFF
  classDef sys fill:#EFF6FF,stroke:#BFDBFE,color:#1E3A8A
  classDef err fill:#FEF2F2,stroke:#FECACA,color:#991B1B`,
  },
  {
    key: "punch", title: "打卡流程", desc: "上下班打卡，含 GPS 定位", icon: Fingerprint,
    chart: `flowchart LR
  A([進入 /punch]):::start --> B[取得 GPS]:::sys
  B --> C{時段?}
  C -->|上班前| D[點擊上班打卡]
  C -->|下班後| E[點擊下班打卡]
  D --> F[寫入紀錄 + 時間 + 座標]:::sys
  E --> F
  F --> G([顯示成功 Toast]):::end1
  classDef start fill:#111827,stroke:#111827,color:#FFF
  classDef end1 fill:#16A34A,stroke:#16A34A,color:#FFF
  classDef sys fill:#EFF6FF,stroke:#BFDBFE,color:#1E3A8A`,
  },
  {
    key: "leave", title: "請假申請流程", desc: "員工提交 → HR 審核 → 通知", icon: Calendar,
    chart: `flowchart TD
  A([/attendance/]):::start --> B[員工填寫表單]:::user
  B --> C[選擇假別 / 日期 / 原因]
  C --> D[上傳附件]
  D --> E[送出申請]
  E --> F[建立 pending 紀錄]:::sys
  F --> G[HR 審核]:::user
  G --> H{審核結果?}
  H -->|核准| I[扣除假數]:::sys
  I --> J([通知員工 - 核准]):::end1
  H -->|駁回| K([通知員工 + 顯示原因]):::end1
  classDef start fill:#111827,stroke:#111827,color:#FFF
  classDef end1 fill:#16A34A,stroke:#16A34A,color:#FFF
  classDef sys fill:#EFF6FF,stroke:#BFDBFE,color:#1E3A8A
  classDef user fill:#FFFBEB,stroke:#FEF3C7,color:#92400E`,
  },
  {
    key: "sprint", title: "Sprint 生命週期", desc: "工作事項核心流程", icon: CheckSquare,
    chart: `flowchart LR
  A([建立 Sprint]):::start --> B[規劃任務]
  B --> C[估算點數]
  C --> D[啟動 Sprint]
  D --> E[進行中 - 看板拖曳]
  E --> F{期限到?}
  F -->|否| E
  F -->|是| G[結算點數]
  G --> H[產生報表]:::sys
  H --> I([速率 + 燃盡圖]):::end1
  classDef start fill:#111827,stroke:#111827,color:#FFF
  classDef end1 fill:#16A34A,stroke:#16A34A,color:#FFF
  classDef sys fill:#EFF6FF,stroke:#BFDBFE,color:#1E3A8A`,
  },
  {
    key: "drag", title: "任務看板拖曳", desc: "Jira 風格欄位狀態變更", icon: GitFork,
    chart: `flowchart TD
  A([點選任務卡]):::start --> B[拖曳至目標欄]:::user
  B --> C[驗證狀態轉換]:::sys
  C --> D{允許?}
  D -->|是| E[更新 status]:::sys
  E --> F[寫入歷程]
  F --> G[觸發訂閱者通知]
  G --> H([看板即時刷新]):::end1
  D -->|否| I[回彈原欄]:::err
  I --> J([顯示 Toast 警告]):::end1
  classDef start fill:#111827,stroke:#111827,color:#FFF
  classDef end1 fill:#16A34A,stroke:#16A34A,color:#FFF
  classDef sys fill:#EFF6FF,stroke:#BFDBFE,color:#1E3A8A
  classDef user fill:#FFFBEB,stroke:#FEF3C7,color:#92400E
  classDef err fill:#FEF2F2,stroke:#FECACA,color:#991B1B`,
  },
  {
    key: "expense", title: "費用申請流程", desc: "員工 → 主管 → 財務 三層審核", icon: Receipt,
    chart: `flowchart TD
  A([/finance/]):::start --> B[員工填寫費用單]:::user
  B --> C[上傳憑證]
  C --> D[送出]
  D --> E[主管初審]:::user
  E --> F{初審通過?}
  F -->|否| Z([退件 + 標註原因]):::err
  F -->|是| G[財務複審]:::user
  G --> H{複審通過?}
  H -->|否| Z
  H -->|是| I[排入薪資週期]:::sys
  I --> J([通知撥款]):::end1
  classDef start fill:#111827,stroke:#111827,color:#FFF
  classDef end1 fill:#16A34A,stroke:#16A34A,color:#FFF
  classDef sys fill:#EFF6FF,stroke:#BFDBFE,color:#1E3A8A
  classDef user fill:#FFFBEB,stroke:#FEF3C7,color:#92400E
  classDef err fill:#FEF2F2,stroke:#FECACA,color:#991B1B`,
  },
  {
    key: "announce", title: "公告發布流程", desc: "HR / Admin 發布、全員可見", icon: Megaphone,
    chart: `flowchart LR
  A([/announcements/]):::start --> B[HR/Admin 撰寫]:::user
  B --> C[選擇對象 / 部門]
  C --> D{發送時機?}
  D -->|立即| E[推播 + 站內通知]:::sys
  D -->|排程| F[加入排程佇列]:::sys
  F -->|時間到| E
  E --> G([全員可見]):::end1
  classDef start fill:#111827,stroke:#111827,color:#FFF
  classDef end1 fill:#16A34A,stroke:#16A34A,color:#FFF
  classDef sys fill:#EFF6FF,stroke:#BFDBFE,color:#1E3A8A
  classDef user fill:#FFFBEB,stroke:#FEF3C7,color:#92400E`,
  },
  {
    key: "employee", title: "員工建立流程", desc: "HR 建檔、權限分派、寄送邀請", icon: UserPlus,
    chart: `flowchart TD
  A([/employees/]):::start --> B[HR 點擊新增]:::user
  B --> C[填寫基本資料]
  C --> D[指派部門 + 職級]
  D --> E[選擇角色]
  E --> F[建立帳號]:::sys
  F --> G[寄送邀請信]:::sys
  G --> H[員工首次登入]:::user
  H --> I[修改密碼]
  I --> J([完成入職]):::end1
  classDef start fill:#111827,stroke:#111827,color:#FFF
  classDef end1 fill:#16A34A,stroke:#16A34A,color:#FFF
  classDef sys fill:#EFF6FF,stroke:#BFDBFE,color:#1E3A8A
  classDef user fill:#FFFBEB,stroke:#FEF3C7,color:#92400E`,
  },
  {
    key: "perm", title: "權限分派流程", desc: "僅 admin 可調整角色細粒度權限", icon: ShieldCheck,
    chart: `flowchart LR
  A([/permissions/]):::start --> B[admin 進入]:::user
  B --> C[選擇角色]
  C --> D[勾選權限矩陣]
  D --> E[即時預覽影響]:::sys
  E --> F[儲存設定]
  F --> G([該角色全員生效]):::end1
  classDef start fill:#111827,stroke:#111827,color:#FFF
  classDef end1 fill:#16A34A,stroke:#16A34A,color:#FFF
  classDef sys fill:#EFF6FF,stroke:#BFDBFE,color:#1E3A8A
  classDef user fill:#FFFBEB,stroke:#FEF3C7,color:#92400E`,
  },
  {
    key: "msg", title: "訊息回覆流程", desc: "內部信件雙向溝通", icon: Reply,
    chart: `flowchart TD
  A([收到通知]):::start --> B[點擊鈴鐺]:::user
  B --> C[進入 /notifications]
  C --> D{訊息類型?}
  D -->|系統通知| E[標記已讀]
  E --> Z([完成]):::end1
  D -->|內部信件| F[展開內容]
  F --> G[輸入回覆]:::user
  G --> H[寫入會話]:::sys
  H --> I[通知對方]:::sys
  I --> J([出現於對方收件匣]):::end1
  classDef start fill:#111827,stroke:#111827,color:#FFF
  classDef end1 fill:#16A34A,stroke:#16A34A,color:#FFF
  classDef sys fill:#EFF6FF,stroke:#BFDBFE,color:#1E3A8A
  classDef user fill:#FFFBEB,stroke:#FEF3C7,color:#92400E`,
  },
  {
    key: "asset", title: "資產領用流程", desc: "員工申請、HR 配發、回收", icon: Package,
    chart: `flowchart TD
  A([員工申請]):::start --> B[選擇資產類型]
  B --> C[HR 審核]:::user
  C --> D{庫存是否足夠?}
  D -->|有| E[建立領用紀錄]:::sys
  E --> F[實體交付]
  F --> G([資產綁定員工]):::end1
  D -->|無| H[啟動採購流程]
  H --> I([或退件通知]):::err
  classDef start fill:#111827,stroke:#111827,color:#FFF
  classDef end1 fill:#16A34A,stroke:#16A34A,color:#FFF
  classDef sys fill:#EFF6FF,stroke:#BFDBFE,color:#1E3A8A
  classDef user fill:#FFFBEB,stroke:#FEF3C7,color:#92400E
  classDef err fill:#FEF2F2,stroke:#FECACA,color:#991B1B`,
  },
  {
    key: "project", title: "專案建立流程", desc: "PM 開立專案並組建團隊", icon: FolderKanban,
    chart: `flowchart LR
  A([/projects/]):::start --> B[PM 點擊新增]:::user
  B --> C[填寫名稱 / 期程 / 預算]
  C --> D[邀請成員]
  D --> E[建立里程碑]
  E --> F[綁定 Sprint]:::sys
  F --> G([專案啟動]):::end1
  classDef start fill:#111827,stroke:#111827,color:#FFF
  classDef end1 fill:#16A34A,stroke:#16A34A,color:#FFF
  classDef sys fill:#EFF6FF,stroke:#BFDBFE,color:#1E3A8A
  classDef user fill:#FFFBEB,stroke:#FEF3C7,color:#92400E`,
  },
];

function Flows() {
  return (
    <div className="space-y-6">
      <SectionTitle title="功能流程" en="Feature Flows" desc="使用 Mermaid 動態渲染的主要功能流程圖，支援判斷分支與多種節點樣式" />

      {/* Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span style={{ fontSize: "14px", color: "#6B7280", marginRight: 4, fontWeight: 600 }}>節點圖例：</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded" style={{ background: "#111827", color: "#FFF", fontSize: "13.5px", fontWeight: 600 }}>起始</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded" style={{ background: "#FFF", color: "#111827", fontSize: "13.5px", fontWeight: 600, borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>操作</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded" style={{ background: "#FFFBEB", color: "#92400E", fontSize: "13.5px", fontWeight: 600, borderWidth: "1px", borderStyle: "solid", borderColor: "#FEF3C7" }}>使用者</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded" style={{ background: "#EFF6FF", color: "#1E3A8A", fontSize: "13.5px", fontWeight: 600, borderWidth: "1px", borderStyle: "solid", borderColor: "#BFDBFE" }}>系統</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded" style={{ background: "#FEF2F2", color: "#991B1B", fontSize: "13.5px", fontWeight: 600, borderWidth: "1px", borderStyle: "solid", borderColor: "#FECACA" }}>例外</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full" style={{ background: "#16A34A", color: "#FFF", fontSize: "13.5px", fontWeight: 600 }}>結束</span>
        </div>
      </Card>

      {FLOWS.map((f) => (
        <Card key={f.key} className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #111827, #1E3A5F)" }}>
              <f.icon style={{ width: 16, height: 16, color: "#60A5FA" }} />
            </div>
            <div className="flex-1">
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>{f.title}</h3>
              <p style={{ fontSize: "14px", color: "#6B7280", marginTop: 2 }}>{f.desc}</p>
            </div>
            <Tag color="#1E3A8A" bg="#EFF6FF">Mermaid</Tag>
          </div>
          <div className="rounded-lg p-4 overflow-x-auto" style={{ background: "#FAFAFA", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
            <Mermaid chart={f.chart} />
          </div>
        </Card>
      ))}
    </div>
  );
}


// ─── Main ─────────────────────────────────────────────────────────────────────
export function Spec() {
  const [section, setSection] = useState<Section>("overview");

  const render = () => {
    switch (section) {
      case "overview":  return <Overview />;
      case "tech":      return <Tech />;
      case "ia":        return <IA />;
      case "modules":   return <Modules />;
      case "flows":     return <Flows />;
      case "design":    return <Design />;
      case "auth":      return <Auth />;
      case "structure": return <Structure />;
      case "changelog": return <Changelog />;
      case "roadmap":   return <Roadmap />;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #111827 0%, #1E3A5F 100%)" }}>
            <FileText style={{ width: 18, height: 18, color: "#60A5FA" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ color: "#111827", letterSpacing: "-0.02em" }}>產品規格書</h1>
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 700, color: "#FFF", background: "linear-gradient(135deg, #111827, #1E3A5F)", letterSpacing: "0.05em" }}>SPEC v2.0</span>
            </div>
            <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: 2 }}>KUMO WORKSPACE Product Specification · 僅系統管理者可見</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-md inline-flex items-center gap-1.5" style={{ fontSize: "12.5px", fontWeight: 600, color: "#374151", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
            <Code2 style={{ width: 11, height: 11 }} /> 檢視 Markdown
          </button>
        </div>
      </div>

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

      {render()}
    </div>
  );
}

export default Spec;
