import React, { useState } from "react";
import {
  User, Shield, Bell, Monitor, Info,
  Eye, EyeOff, Check, Fingerprint, CheckSquare,
  Megaphone, Receipt, Clock, Package, FolderKanban,
  Globe, Calendar, Server, CircleDot, Laptop,
  Smartphone, RefreshCw, Network, Sliders,
  MapPin, Timer, FileText, DollarSign, AlertTriangle,
  Lock, Trash2, Database, ToggleLeft, Wrench,
  ChevronDown,
} from "lucide-react";
import { HierarchySection } from "../components/HierarchySection";
import { DraggableScroll } from "../components/DraggableScroll";
import { StyledSelect } from "../components/StyledSelect";
import { useAuth } from "../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "profile" | "security" | "notifications" | "display" | "system" | "hierarchy" | "features";

// ─── Sub-components ───────────────────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={className} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
    {children}
  </div>
);

const SectionTitle = ({ title, desc }: { title: string; desc: string }) => (
  <div className="pb-4 mb-5" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
    <h2 style={{ color: "#111827" }}>{title}</h2>
    <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: 3 }}>{desc}</p>
  </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label style={{ fontSize: "14px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
    {children}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    style={{
      width: "100%", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
      borderRadius: "6px", padding: "8px 12px", fontSize: "15px", color: "#111827",
      outline: "none", minHeight: "44px", ...props.style,
    }}
    onFocus={e => { e.currentTarget.style.borderColor = "#111827"; e.currentTarget.style.background = "#FFF"; }}
    onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#F9FAFB"; }}
  />
);



const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: 42, height: 24, flexShrink: 0,
      background: value ? "#111827" : "#D1D5DB",
      borderRadius: 12, border: "none", cursor: "pointer",
      padding: 0, position: "relative", transition: "background 0.18s",
    }}
  >
    <span style={{
      position: "absolute", top: 3,
      left: value ? 21 : 3,
      width: 18, height: 18,
      background: "#FFF", borderRadius: "50%",
      transition: "left 0.18s",
      boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
    }} />
  </button>
);

const SaveBtn = ({ onClick, saved }: { onClick: () => void; saved: boolean }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors duration-150"
    style={{
      background: saved ? "#16A34A" : "#111827",
      color: "#FFF", fontSize: "13px", fontWeight: 600,
      border: "none", cursor: "pointer",
    }}
  >
    {saved ? <><Check className="w-4 h-4" />已儲存</> : "儲存變更"}
  </button>
);

// ─── Nav config ───────────────────────────────────────────────────────────────
const ADMIN_SECTIONS: Section[] = ["profile", "security", "notifications", "display", "hierarchy", "system", "features"];
const BASIC_SECTIONS: Section[] = ["profile", "security", "notifications"];

const NAV: { key: Section; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "profile",       label: "個人資料", Icon: User     },
  { key: "security",      label: "帳號安全", Icon: Shield   },
  { key: "notifications", label: "通知設定", Icon: Bell     },
  { key: "display",       label: "顯示偏好", Icon: Monitor  },
  { key: "hierarchy",     label: "員工階級", Icon: Network  },
  { key: "system",        label: "系統資訊", Icon: Info     },
  { key: "features",      label: "功能設定", Icon: Sliders  },
];

// ─── 個人資料 ─────────────────────────────────────────────────────────────────
function ProfileSection() {
  const [form, setForm] = useState({
    name: "系統管理者", displayName: "Admin", email: "admin@company.com",
    phone: "02-1234-5678", dept: "資訊部", position: "系統管理員", bio: "",
  });
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6">
      <SectionTitle title="個人資料" desc="管理你的帳號基本資訊與聯絡方式" />

      {/* Avatar */}
      <Card className="p-5 max-md:p-4 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#111827" }}>
          <span style={{ color: "#FFF", fontSize: "22px", fontWeight: 700 }}>管</span>
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>頭像</p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>支援 JPG、PNG，建議尺寸 400×400px</p>
          <button className="mt-2 px-3 py-1.5 rounded-md"
            style={{ fontSize: "12px", fontWeight: 500, background: "#F3F4F6", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", cursor: "pointer" }}>
            上傳照片
          </button>
        </div>
      </Card>

      {/* Form */}
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel>姓名</FieldLabel>
            <Input value={form.name} onChange={e => set("name")(e.target.value)} />
          </div>
          <div>
            <FieldLabel>顯示名稱</FieldLabel>
            <Input value={form.displayName} onChange={e => set("displayName")(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel>電子郵件</FieldLabel>
            <Input type="email" value={form.email} onChange={e => set("email")(e.target.value)} />
          </div>
          <div>
            <FieldLabel>電話號碼</FieldLabel>
            <Input value={form.phone} onChange={e => set("phone")(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel>部門</FieldLabel>
            <StyledSelect value={form.dept} onChange={set("dept")}
              options={["資訊部", "財務部", "人事部", "業務部", "行銷部", "營運部"].map(d => ({ key: d, label: d }))} formField />
          </div>
          <div>
            <FieldLabel>職位</FieldLabel>
            <Input value={form.position} onChange={e => set("position")(e.target.value)} />
          </div>
        </div>
        <div>
          <FieldLabel>個人簡介</FieldLabel>
          <textarea
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="簡短介紹自己（選填）"
            rows={3}
            style={{
              width: "100%", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
              borderRadius: "6px", padding: "8px 12px", fontSize: "14px", color: "#111827",
              outline: "none", resize: "vertical", fontFamily: "inherit",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#111827"; e.currentTarget.style.background = "#FFF"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#F9FAFB"; }}
          />
        </div>
        <div className="flex justify-end pt-1">
          <SaveBtn onClick={save} saved={saved} />
        </div>
      </Card>
    </div>
  );
}

// ─── 帳號安全 ─────────────────────────────────────────────────────────────────
function SecuritySection() {
  const [show, setShow] = useState({ cur: false, new: false, confirm: false });
  const [twoFA, setTwoFA] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ cur: "", new: "", confirm: "" });
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const sessions = [
    { device: "MacBook Pro", icon: Laptop,     location: "台北市, 台灣", time: "目前使中", active: true  },
    { device: "iPhone 15",   icon: Smartphone,  location: "台北市, 台灣", time: "2 小時前",   active: false },
    { device: "Chrome / Win",icon: Globe,        location: "新北市, 台灣", time: "昨天",        active: false },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="帳號安全" desc="管理密碼、兩步驟驗證與登入裝置" />

      {/* Password */}
      <Card className="p-5 space-y-4">
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>修改密碼</h3>
        {([
          { key: "cur" as const,     label: "目前密碼" },
          { key: "new" as const,     label: "新密碼"   },
          { key: "confirm" as const, label: "確認新密碼" },
        ]).map(f => (
          <div key={f.key}>
            <FieldLabel>{f.label}</FieldLabel>
            <div className="relative">
              <Input
                type={show[f.key] ? "text" : "password"}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder="••••••••"
                style={{ paddingRight: 40 }}
              />
              <button
                onClick={() => setShow(s => ({ ...s, [f.key]: !s[f.key] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {show[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
        <p style={{ fontSize: "12px", color: "#9CA3AF" }}>密碼須至少 8 碼，包含英文字母與數字</p>
        <div className="flex justify-end pt-1">
          <SaveBtn onClick={save} saved={saved} />
        </div>
      </Card>

      {/* 2FA */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>兩步驟驗證（2FA）</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 3 }}>
              啟用後，每次登入需輸入驗證碼，提升帳號安全性
            </p>
          </div>
          <Toggle value={twoFA} onChange={setTwoFA} />
        </div>
        {twoFA && (
          <div className="mt-4 px-4 py-3 rounded-lg" style={{ background: "#F0FDF4", borderWidth: "1px", borderStyle: "solid", borderColor: "#BBF7D0" }}>
            <p style={{ fontSize: "13px", color: "#15803D", fontWeight: 500 }}>
              ✓ 兩步驟驗證已啟用，請使用 Google Authenticator 或 Authy 掃描 QR Code
            </p>
          </div>
        )}
      </Card>

      {/* Sessions */}
      <Card>
        <div className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA", borderRadius: "8px 8px 0 0" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>登入裝置</h3>
          <button style={{ fontSize: "12px", color: "#DC2626", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}>
            登出所有裝置
          </button>
        </div>
        {sessions.map((s, i) => {
          const SIcon = s.icon;
          return (
            <div key={i} className="flex items-center gap-4 px-5 py-4"
              style={{ borderBottomWidth: i < sessions.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F9FAFB" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: s.active ? "#111827" : "#F3F4F6" }}>
                <SIcon className="w-5 h-5" style={{ color: s.active ? "#FFF" : "#6B7280" } as React.CSSProperties} />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{s.device}</p>
                <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{s.location} · {s.time}</p>
              </div>
              {s.active
                ? <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: "#F0FDF4", color: "#15803D" }}>使用中</span>
                : <button style={{ fontSize: "12px", color: "#6B7280", background: "none", border: "none", cursor: "pointer" }}>登出</button>
              }
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ─── 通知設定 ─────────────────────────────────────────────────────────────────
function NotificationsSection() {
  const [saved, setSaved] = useState(false);
  const [emailFreq, setEmailFreq] = useState("instant");
  const [push, setPush] = useState(true);
  const [cats, setCats] = useState({
    punch:        { label: "打卡提醒",   desc: "上班打卡逾時、忘記下班打卡",     Icon: Fingerprint,  enabled: true  },
    task:         { label: "工作事項",   desc: "任務指派、截止日提醒、狀態更新", Icon: CheckSquare,  enabled: true  },
    announcement: { label: "最新公告",   desc: "公司發布新公告重要訊息",       Icon: Megaphone,    enabled: true  },
    finance:      { label: "財務申請",   desc: "費用申請核准、退回通知",         Icon: Receipt,      enabled: true  },
    attendance:   { label: "出缺勤",     desc: "請假審核結果、出勤異常",         Icon: Clock,        enabled: false },
    asset:        { label: "資產管理",   desc: "資產歸還提醒、申請審核",         Icon: Package,      enabled: true  },
    project:      { label: "專案動態",   desc: "專案進度更新、成員異動",         Icon: FolderKanban, enabled: false },
  });
  const toggle = (k: keyof typeof cats) =>
    setCats(p => ({ ...p, [k]: { ...p[k], enabled: !p[k].enabled } }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6">
      <SectionTitle title="通知設定" desc="選擇你想收到的通知類型與接收方式" />

      {/* Category toggles */}
      <Card>
        <div className="px-5 py-3.5" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA", borderRadius: "8px 8px 0 0" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>通知類別</h3>
          <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>選擇要開啟的通知項目</p>
        </div>
        {(Object.entries(cats) as [keyof typeof cats, (typeof cats)[keyof typeof cats]][]).map(([key, cat], i, arr) => {
          const CatIcon = cat.Icon;
          return (
            <div key={key} className="flex items-center gap-4 px-5 py-4"
              style={{ borderBottomWidth: i < arr.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F9FAFB" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: cat.enabled ? "#F3F4F6" : "#FAFAFA", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                <CatIcon className="w-4 h-4" style={{ color: cat.enabled ? "#374151" : "#D1D5DB" } as React.CSSProperties} />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: "14px", fontWeight: 500, color: cat.enabled ? "#111827" : "#9CA3AF" }}>{cat.label}</p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 1 }}>{cat.desc}</p>
              </div>
              <Toggle value={cat.enabled} onChange={() => toggle(key)} />
            </div>
          );
        })}
      </Card>

      {/* Delivery settings */}
      <Card className="p-5 space-y-5">
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>接收方式</h3>

        {/* Push */}
        <div className="flex items-center justify-between py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F9FAFB" }}>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>系統內通知</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>在右上角鈴鐺顯示即時通知</p>
          </div>
          <Toggle value={push} onChange={setPush} />
        </div>

        {/* Email frequency */}
        <div>
          <FieldLabel>Email 通知頻率</FieldLabel>
          <StyledSelect value={emailFreq} onChange={setEmailFreq}
            options={[
              { key: "instant", label: "即時發送" },
              { key: "daily", label: "每日摘要（每天 09:00）" },
              { key: "weekly", label: "每週摘要（每週一 09:00）" },
              { key: "off", label: "關閉 Email 通知" },
            ]} formField />
        </div>

        <div className="flex justify-end pt-1">
          <SaveBtn onClick={save} saved={saved} />
        </div>
      </Card>
    </div>
  );
}

// ─── 顯示偏好 ────────────────────────────────────────────────────────────────
function DisplaySection() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    language:   "zh-TW",
    timezone:   "Asia/Taipei",
    dateFormat: "YYYY/MM/DD",
    timeFormat: "24h",
    startPage:  "/",
    pageSize:   "10",
    density:    "comfortable",
  });
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6">
      <SectionTitle title="顯示偏好" desc="自訂介面語言、時區與日期呈現方式" />

      <Card className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <FieldLabel>介面語言</FieldLabel>
            <StyledSelect value={form.language} onChange={set("language")}
              options={[{ key: "zh-TW", label: "繁體中文" }, { key: "ja", label: "日本語" }, { key: "en", label: "English" }]} formField />
          </div>
          <div>
            <FieldLabel>時區</FieldLabel>
            <StyledSelect value={form.timezone} onChange={set("timezone")}
              options={[{ key: "Asia/Taipei", label: "Asia/Taipei (UTC+8)" }, { key: "Asia/Tokyo", label: "Asia/Tokyo (UTC+9)" }, { key: "UTC", label: "UTC (UTC+0)" }]} formField />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <FieldLabel>日期格式</FieldLabel>
            <StyledSelect value={form.dateFormat} onChange={set("dateFormat")}
              options={[
                { key: "YYYY/MM/DD", label: "2026/03/10" },
                { key: "YYYY-MM-DD", label: "2026-03-10" },
                { key: "MM/DD/YYYY", label: "03/10/2026" },
                { key: "DD/MM/YYYY", label: "10/03/2026" },
              ]} formField />
          </div>
          <div>
            <FieldLabel>時間格式</FieldLabel>
            <div className="flex gap-3">
              {([["24h", "24 小時制（14:30）"], ["12h", "12 小時制（2:30 PM）"]] as const).map(([v, lbl]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer flex-1 px-3 py-2.5 rounded-lg"
                  style={{ border: `1px solid ${form.timeFormat === v ? "#111827" : "#E5E7EB"}`, background: form.timeFormat === v ? "#F9FAFB" : "transparent" }}>
                  <input type="radio" name="timeFormat" value={v} checked={form.timeFormat === v}
                    onChange={() => set("timeFormat")(v)} style={{ accentColor: "#111827" }} />
                  <span style={{ fontSize: "13px", color: "#374151" }}>{lbl}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <FieldLabel>預設起始頁面</FieldLabel>
            <StyledSelect value={form.startPage} onChange={set("startPage")}
              options={[
                { key: "/", label: "總覽" },
                { key: "/punch", label: "打卡" },
                { key: "/tasks", label: "工作事項" },
                { key: "/attendance", label: "出缺勤" },
                { key: "/announcements", label: "最新公告" },
              ]} formField />
          </div>
          <div>
            <FieldLabel>每頁顯示筆數</FieldLabel>
            <StyledSelect value={form.pageSize} onChange={set("pageSize")}
              options={[{ key: "10", label: "10 筆" }, { key: "20", label: "20 筆" }, { key: "50", label: "50 筆" }]} formField />
          </div>
        </div>

        {/* Density */}
        <div>
          <FieldLabel>頁面密度</FieldLabel>
          <div className="flex max-md:flex-col gap-3">
            {([
              ["comfortable", "寬鬆", "項目間距較大，閱讀舒適"],
              ["standard",    "標準", "預設間距，資訊密度適中"],
              ["compact",     "緊湊", "間距縮小，顯示更多內容"],
            ] as const).map(([v, lbl, sub]) => (
              <button key={v} onClick={() => set("density")(v)}
                className="flex-1 text-left px-4 py-3 rounded-lg transition-colors duration-150"
                style={{ border: `1px solid ${form.density === v ? "#111827" : "#E5E7EB"}`, background: form.density === v ? "#F9FAFB" : "transparent" }}>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ border: `2px solid ${form.density === v ? "#111827" : "#D1D5DB"}` }}>
                    {form.density === v && <span className="w-1.5 h-1.5 rounded-full block" style={{ background: "#111827" }} />}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{lbl}</span>
                </div>
                <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: 3, paddingLeft: "22px" }}>{sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <SaveBtn onClick={save} saved={saved} />
        </div>
      </Card>
    </div>
  );
}

// ─── 系統資訊 ─────────────────────────────────────────────────────────────────
function SystemSection() {
  const [checking, setChecking] = useState(false);
  const [checked,  setChecked]  = useState(false);
  const check = () => {
    setChecking(true);
    setTimeout(() => { setChecking(false); setChecked(true); setTimeout(() => setChecked(false), 3000); }, 1800);
  };

  const info = [
    { label: "應用程式版本",  value: "v3.2.1" },
    { label: "建置日期",       value: "2026-03-01" },
    { label: "API 版本",       value: "v2.0.4" },
    { label: "Node.js 版本",   value: "20.11.0 LTS" },
    { label: "資料庫",         value: "PostgreSQL 15.4" },
    { label: "授權類型",       value: "Enterprise License" },
  ];

  const services = [
    { name: "主應用伺服器",   status: "online",  latency: "12ms"  },
    { name: "資料庫伺服器",   status: "online",  latency: "3ms"   },
    { name: "檔案儲存服務",   status: "online",  latency: "28ms"  },
    { name: "Email 發送服務", status: "warning", latency: "320ms" },
    { name: "推播通知服務",   status: "online",  latency: "45ms"  },
  ];

  const statusCfg = {
    online:  { label: "正常", dot: "#16A34A", bg: "#F0FDF4", color: "#15803D" },
    warning: { label: "異常", dot: "#CA8A04", bg: "#FEF9C3", color: "#A16207" },
    offline: { label: "離線", dot: "#DC2626", bg: "#FEF2F2", color: "#DC2626" },
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="系統資訊" desc="查看目前系統版本、服務狀態與授權資訊" />

      {/* App info */}
      <Card>
        <div className="px-5 py-3.5 flex items-center gap-3"
          style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA", borderRadius: "8px 8px 0 0" }}>
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: "#111827" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="#fff" strokeWidth="1.5" fill="none" />
              <path d="M12 7v10M7 9.5l5 3 5-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2" fill="#60A5FA" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>KUMO Workspace</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF" }}>Cloud Enterprise Collaboration Platform</p>
          </div>
        </div>
        {info.map((row, i) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3"
            style={{ borderBottomWidth: i < info.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F9FAFB" }}>
            <span style={{ fontSize: "13px", color: "#6B7280" }}>{row.label}</span>
            <span className="tabular-nums" style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{row.value}</span>
          </div>
        ))}
      </Card>

      {/* Service status */}
      <Card>
        <div className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA", borderRadius: "8px 8px 0 0" }}>
          <div>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>服務狀態</h3>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 1 }}>最後檢查：3 分鐘前</p>
          </div>
          <button
            onClick={check}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors duration-150"
            style={{ fontSize: "12px", fontWeight: 500, background: "#F3F4F6", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", cursor: "pointer" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#E5E7EB"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
            {checked ? "完成" : checking ? "檢查中…" : "重新檢查"}
          </button>
        </div>
        {services.map((s, i) => {
          const cfg = statusCfg[s.status as keyof typeof statusCfg];
          return (
            <div key={s.name} className="flex items-center gap-3 px-5 py-3.5"
              style={{ borderBottomWidth: i < services.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F9FAFB" }}>
              <Server className="w-4 h-4 flex-shrink-0" style={{ color: "#9CA3AF" }} />
              <span className="flex-1" style={{ fontSize: "13px", color: "#374151" }}>{s.name}</span>
              <span className="tabular-nums" style={{ fontSize: "12px", color: "#9CA3AF" }}>{s.latency}</span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                style={{ fontSize: "11px", fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                {cfg.label}
              </span>
            </div>
          );
        })}
      </Card>

      {/* Copyright */}
      <div className="text-center py-2">
        <p style={{ fontSize: "12px", color: "#D1D5DB" }}>
          © 2026 Internal Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// ─── 功能介紹 ─────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  // ── 開合狀態（預設全部收合）──
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (key: string) => setOpenGroups(p => ({ ...p, [key]: !p[key] }));

  // ── 打卡設定 ──
  const [punchSettings, setPunchSettings] = useState({
    gpsPunch: true,
    lateGrace: "10",
    punchReminder: true,
    reminderTime: "08:50",
    autoPunchOut: false,
    autoPunchOutTime: "18:30",
  });

  // ── 出缺勤設定 ──
  const [attendanceSettings, setAttendanceSettings] = useState({
    autoApproveHalfDay: false,
    maxOvertimeHours: "46",
    annualLeaveCarryOver: true,
    carryOverLimit: "5",
    sickLeaveProof: "3",
  });

  // ── 工作事項設定 ──
  const [taskSettings, setTaskSettings] = useState({
    defaultSprintDays: "14",
    maxStoryPoints: "13",
    autoCloseSprint: false,
    requireReview: true,
    taskComments: true,
    externalLinks: true,
  });

  // ── 財務設定 ──
  const [financeSettings, setFinanceSettings] = useState({
    requireApproval: true,
    singleExpenseLimit: "50000",
    budgetWarningThreshold: "80",
    autoRejectOverBudget: false,
    receiptRequired: true,
    receiptMinAmount: "500",
  });

  // ── 公告設定 ──
  const [announcementSettings, setAnnouncementSettings] = useState({
    autoArchive: true,
    archiveDays: "30",
    maxPinned: "3",
    allowComments: true,
    requireApproval: false,
  });

  // ── 資產管理設定 ──
  const [assetSettings, setAssetSettings] = useState({
    returnReminder: true,
    reminderDaysBefore: "7",
    autoDepreciation: true,
    depreciationMethod: "straight-line",
    maintenanceAlert: true,
    maintenanceCycleDays: "180",
  });

  // ── 安全性設定 ──
  const [securitySettings, setSecuritySettings] = useState({
    passwordExpiry: true,
    passwordExpiryDays: "90",
    maxLoginAttempts: "5",
    sessionTimeout: "480",
    ipWhitelist: false,
    auditLog: true,
    dataRetentionDays: "365",
  });

  const FeatureGroup = ({ title, icon: Icon, color, children, groupKey }: {
    title: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    color: string; children: React.ReactNode; groupKey: string;
  }) => {
    const isOpen = !!openGroups[groupKey];
    return (
      <Card>
        <div
          onClick={() => toggleGroup(groupKey)}
          className="w-full px-5 py-3.5 flex items-center gap-3 text-left"
          style={{
            borderBottomWidth: isOpen ? "1px" : "0",
            borderBottomStyle: "solid",
            borderBottomColor: "#F3F4F6",
            background: "#FAFAFA",
            borderRadius: isOpen ? "8px 8px 0 0" : "8px",
            cursor: "pointer",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#FAFAFA"; }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: color + "18" }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <h3 className="flex-1" style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{title}</h3>
          <ChevronDown
            className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
            style={{
              color: "#9CA3AF",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </div>
        {isOpen && (
          <div className="p-5 space-y-4">{children}</div>
        )}
      </Card>
    );
  };

  const ToggleRow = ({ label, desc, value, onChange }: {
    label: string; desc: string; value: boolean; onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{label}</p>
        <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 1 }}>{desc}</p>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );

  const InlineField = ({ label, value, onChange, suffix, width = 80 }: {
    label: string; value: string; onChange: (v: string) => void; suffix?: string; width?: number;
  }) => (
    <div className="flex items-center gap-3 py-1">
      <span style={{ fontSize: "13px", color: "#6B7280", minWidth: 140 }}>{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width, background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
            borderRadius: "6px", padding: "6px 10px", fontSize: "13px", color: "#111827",
            outline: "none", textAlign: "center",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "#111827"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
        />
        {suffix && <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionTitle title="功能設定" desc="控制系統各模組的功能開關與參數配置，僅限管理者操作" />

      {/* ── 打卡設定 ── */}
      <FeatureGroup title="打卡功能" icon={Fingerprint} color="#2563EB" groupKey="punch">
        <ToggleRow label="GPS 定位打卡" desc="啟用後員工須在指定範圍內才能打卡"
          value={punchSettings.gpsPunch} onChange={v => setPunchSettings(p => ({ ...p, gpsPunch: v }))} />
        <InlineField label="遲到容許時間" value={punchSettings.lateGrace}
          onChange={v => setPunchSettings(p => ({ ...p, lateGrace: v }))} suffix="分鐘" />
        <ToggleRow label="打卡提醒通知" desc="上班前自動推送提醒通知"
          value={punchSettings.punchReminder} onChange={v => setPunchSettings(p => ({ ...p, punchReminder: v }))} />
        {punchSettings.punchReminder && (
          <InlineField label="提醒發送時間" value={punchSettings.reminderTime}
            onChange={v => setPunchSettings(p => ({ ...p, reminderTime: v }))} width={100} />
        )}
        <ToggleRow label="自動下班打卡" desc="超過指定時間未打卡時自動記錄下班"
          value={punchSettings.autoPunchOut} onChange={v => setPunchSettings(p => ({ ...p, autoPunchOut: v }))} />
        {punchSettings.autoPunchOut && (
          <InlineField label="自動打卡時間" value={punchSettings.autoPunchOutTime}
            onChange={v => setPunchSettings(p => ({ ...p, autoPunchOutTime: v }))} width={100} />
        )}
      </FeatureGroup>

      {/* ── 出缺勤設定 ── */}
      <FeatureGroup title="出缺勤管理" icon={Clock} color="#7C3AED" groupKey="attendance">
        <ToggleRow label="半天假自動核准" desc="半天以內的請假不須主管審核"
          value={attendanceSettings.autoApproveHalfDay} onChange={v => setAttendanceSettings(p => ({ ...p, autoApproveHalfDay: v }))} />
        <InlineField label="每月加班上限" value={attendanceSettings.maxOvertimeHours}
          onChange={v => setAttendanceSettings(p => ({ ...p, maxOvertimeHours: v }))} suffix="小時" />
        <ToggleRow label="特休假遞延" desc="允許未休完的特休假遞延至隔年"
          value={attendanceSettings.annualLeaveCarryOver} onChange={v => setAttendanceSettings(p => ({ ...p, annualLeaveCarryOver: v }))} />
        {attendanceSettings.annualLeaveCarryOver && (
          <InlineField label="遞延上限" value={attendanceSettings.carryOverLimit}
            onChange={v => setAttendanceSettings(p => ({ ...p, carryOverLimit: v }))} suffix="天" />
        )}
        <InlineField label="病假證明門檻" value={attendanceSettings.sickLeaveProof}
          onChange={v => setAttendanceSettings(p => ({ ...p, sickLeaveProof: v }))} suffix="天以上需附證明" width={60} />
      </FeatureGroup>

      {/* ── 工作事項設 ── */}
      <FeatureGroup title="工作事項" icon={CheckSquare} color="#EA580C" groupKey="task">
        <InlineField label="Sprint 預設天數" value={taskSettings.defaultSprintDays}
          onChange={v => setTaskSettings(p => ({ ...p, defaultSprintDays: v }))} suffix="天" />
        <InlineField label="Story Point 上限" value={taskSettings.maxStoryPoints}
          onChange={v => setTaskSettings(p => ({ ...p, maxStoryPoints: v }))} suffix="點" />
        <ToggleRow label="Sprint 自動結算" desc="Sprint 到期時自動結算並歸檔完成的任務"
          value={taskSettings.autoCloseSprint} onChange={v => setTaskSettings(p => ({ ...p, autoCloseSprint: v }))} />
        <ToggleRow label="需經 Code Review" desc="任務移至「已完成」前須先通過審核欄位"
          value={taskSettings.requireReview} onChange={v => setTaskSettings(p => ({ ...p, requireReview: v }))} />
        <ToggleRow label="任務留言功能" desc="允許團隊成員在任務卡片上留言討論"
          value={taskSettings.taskComments} onChange={v => setTaskSettings(p => ({ ...p, taskComments: v }))} />
        <ToggleRow label="外部連結功能" desc="允許在任務卡片中加入 Figma、GitHub 等外部連結"
          value={taskSettings.externalLinks} onChange={v => setTaskSettings(p => ({ ...p, externalLinks: v }))} />
      </FeatureGroup>

      {/* ── 財務設定 ── */}
      <FeatureGroup title="財務管理" icon={Receipt} color="#CA8A04" groupKey="finance">
        <ToggleRow label="費用申請須審核" desc="所有費用申請需經主管或財務主管核准"
          value={financeSettings.requireApproval} onChange={v => setFinanceSettings(p => ({ ...p, requireApproval: v }))} />
        <InlineField label="單筆金額上限" value={financeSettings.singleExpenseLimit}
          onChange={v => setFinanceSettings(p => ({ ...p, singleExpenseLimit: v }))} suffix="NT$" width={100} />
        <InlineField label="預算警示門檻" value={financeSettings.budgetWarningThreshold}
          onChange={v => setFinanceSettings(p => ({ ...p, budgetWarningThreshold: v }))} suffix="% 時發出警示" />
        <ToggleRow label="超支自動退回" desc="當申請超出預算時自動退回申請"
          value={financeSettings.autoRejectOverBudget} onChange={v => setFinanceSettings(p => ({ ...p, autoRejectOverBudget: v }))} />
        <ToggleRow label="強制附收據" desc="金額達門檻時強制要求上傳收據"
          value={financeSettings.receiptRequired} onChange={v => setFinanceSettings(p => ({ ...p, receiptRequired: v }))} />
        {financeSettings.receiptRequired && (
          <InlineField label="收據門檻金額" value={financeSettings.receiptMinAmount}
            onChange={v => setFinanceSettings(p => ({ ...p, receiptMinAmount: v }))} suffix="NT$" width={100} />
        )}
      </FeatureGroup>

      {/* ── 公告設定 ── */}
      <FeatureGroup title="最新公告" icon={Megaphone} color="#15803D" groupKey="announcement">
        <ToggleRow label="公告自動下架" desc="超過保留天數的公告自動歸檔"
          value={announcementSettings.autoArchive} onChange={v => setAnnouncementSettings(p => ({ ...p, autoArchive: v }))} />
        {announcementSettings.autoArchive && (
          <InlineField label="保留天數" value={announcementSettings.archiveDays}
            onChange={v => setAnnouncementSettings(p => ({ ...p, archiveDays: v }))} suffix="天" />
        )}
        <InlineField label="置頂公告上限" value={announcementSettings.maxPinned}
          onChange={v => setAnnouncementSettings(p => ({ ...p, maxPinned: v }))} suffix="則" />
        <ToggleRow label="允許留言" desc="員工可在公告下方留言或反應"
          value={announcementSettings.allowComments} onChange={v => setAnnouncementSettings(p => ({ ...p, allowComments: v }))} />
        <ToggleRow label="公告發佈須審核" desc="公告須經管理者審核後才會發佈"
          value={announcementSettings.requireApproval} onChange={v => setAnnouncementSettings(p => ({ ...p, requireApproval: v }))} />
      </FeatureGroup>

      {/* ── 資產管理設定 ── */}
      <FeatureGroup title="資產管理" icon={Package} color="#0891B2" groupKey="asset">
        <ToggleRow label="歸還到期提醒" desc="資產借用到期前自動發送歸還提醒"
          value={assetSettings.returnReminder} onChange={v => setAssetSettings(p => ({ ...p, returnReminder: v }))} />
        {assetSettings.returnReminder && (
          <InlineField label="提前提醒天數" value={assetSettings.reminderDaysBefore}
            onChange={v => setAssetSettings(p => ({ ...p, reminderDaysBefore: v }))} suffix="天" />
        )}
        <ToggleRow label="自動折舊計算" desc="系統自動按照折舊方法計算資產殘值"
          value={assetSettings.autoDepreciation} onChange={v => setAssetSettings(p => ({ ...p, autoDepreciation: v }))} />
        {assetSettings.autoDepreciation && (
          <div className="flex items-center gap-3 py-1">
            <span style={{ fontSize: "13px", color: "#6B7280", minWidth: 140 }}>折舊方法</span>
            <StyledSelect value={assetSettings.depreciationMethod}
              onChange={v => setAssetSettings(p => ({ ...p, depreciationMethod: v }))}
              options={[
                { key: "straight-line", label: "直線法" },
                { key: "declining-balance", label: "餘額遞減法" },
                { key: "sum-of-years", label: "年數合計法" },
              ]} formField />
          </div>
        )}
        <ToggleRow label="定期保養提醒" desc="依照設備保養週期自動提醒維護"
          value={assetSettings.maintenanceAlert} onChange={v => setAssetSettings(p => ({ ...p, maintenanceAlert: v }))} />
        {assetSettings.maintenanceAlert && (
          <InlineField label="保養週期" value={assetSettings.maintenanceCycleDays}
            onChange={v => setAssetSettings(p => ({ ...p, maintenanceCycleDays: v }))} suffix="天" />
        )}
      </FeatureGroup>

      {/* ── 安全性與資料 ── */}
      <FeatureGroup title="安全性與資料" icon={Lock} color="#DC2626" groupKey="security">
        <ToggleRow label="密碼定期到期" desc="強制使用者定期更換密碼"
          value={securitySettings.passwordExpiry} onChange={v => setSecuritySettings(p => ({ ...p, passwordExpiry: v }))} />
        {securitySettings.passwordExpiry && (
          <InlineField label="密碼有效天數" value={securitySettings.passwordExpiryDays}
            onChange={v => setSecuritySettings(p => ({ ...p, passwordExpiryDays: v }))} suffix="天" />
        )}
        <InlineField label="登入失敗鎖定" value={securitySettings.maxLoginAttempts}
          onChange={v => setSecuritySettings(p => ({ ...p, maxLoginAttempts: v }))} suffix="次後鎖定帳號" />
        <InlineField label="Session 逾時" value={securitySettings.sessionTimeout}
          onChange={v => setSecuritySettings(p => ({ ...p, sessionTimeout: v }))} suffix="分鐘" />
        <ToggleRow label="IP 白名單" desc="僅允許特定 IP 位址存取系統"
          value={securitySettings.ipWhitelist} onChange={v => setSecuritySettings(p => ({ ...p, ipWhitelist: v }))} />
        <ToggleRow label="操作稽核日誌" desc="記錄所有使用者的重要操作行為"
          value={securitySettings.auditLog} onChange={v => setSecuritySettings(p => ({ ...p, auditLog: v }))} />
        <InlineField label="資料保留期限" value={securitySettings.dataRetentionDays}
          onChange={v => setSecuritySettings(p => ({ ...p, dataRetentionDays: v }))} suffix="天" />
      </FeatureGroup>

      {/* Save */}
      <div className="flex justify-end pt-1 pb-4">
        <SaveBtn onClick={save} saved={saved} />
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.userRole === "admin";
  const allowedSections = isAdmin ? ADMIN_SECTIONS : BASIC_SECTIONS;
  const filteredNav = NAV.filter(n => allowedSections.includes(n.key));
  const [section, setSection] = useState<Section>("profile");

  const sectionComponents: Record<Section, React.ReactNode> = {
    profile:       <ProfileSection />,
    security:      <SecuritySection />,
    notifications: <NotificationsSection />,
    display:       <DisplaySection />,
    hierarchy:     <HierarchySection />,
    system:        <SystemSection />,
    features:      <FeaturesSection />,
  };

  return (
    <div className="h-full max-md:h-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 style={{ color: "#111827" }}>系統設定</h1>
        <p style={{ fontSize: "15px", color: "#9CA3AF", marginTop: 2 }}>{isAdmin ? "管理帳號、通知與顯示偏好" : "管理個人帳號與通知偏好"}</p>
      </div>

      {/* Mobile tab nav */}
      <DraggableScroll className="md:hidden flex-shrink-0 -mx-2 px-2" innerClassName="flex gap-1.5 pb-1"
        mobileDropdown={{
          options: filteredNav.map(n => ({ key: n.key, label: n.label })),
          activeKey: section,
          onSelect: (k) => setSection(k as Section),
        }}>
        {filteredNav.map(item => {
          const active = section === item.key;
          const Icon = item.Icon;
          return (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg whitespace-nowrap"
              style={{
                background: active ? "#111827" : "#FFF",
                color: active ? "#FFF" : "#6B7280",
                fontSize: "13px", fontWeight: active ? 600 : 400,
                border: active ? "none" : "1px solid #E5E7EB",
                cursor: "pointer",
              }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: active ? "#FFF" : "#9CA3AF" } as React.CSSProperties} />
              {item.label}
            </button>
          );
        })}
      </DraggableScroll>

      {/* Body */}
      <div className="flex-1 min-h-0 flex gap-5 max-md:flex-col overflow-hidden max-md:overflow-visible">

        {/* Left nav (desktop only) */}
        <div className="flex-shrink-0 hidden md:block" style={{ width: 200 }}>
          <Card className="p-2">
            {filteredNav.map(item => {
              const active = section === item.key;
              const Icon = item.Icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-lg transition-colors duration-150 text-left"
                  style={{
                    background: active ? "#111827" : "transparent",
                    color: active ? "#FFF" : "#374151",
                    border: "none", cursor: "pointer",
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0"
                    style={{ color: active ? "#FFF" : "#6B7280" } as React.CSSProperties} />
                  <span style={{ fontSize: "14px", fontWeight: active ? 600 : 400 }}>{item.label}</span>
                </button>
              );
            })}
          </Card>
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {sectionComponents[section]}
        </div>
      </div>
    </div>
  );
}