import React, { useState, useRef, useCallback } from "react";
import {
  Palette, Type, Square, Layout, Layers, MousePointer,
  ChevronDown, Check, Plus, Trash2, Search, Bell, Star,
  AlertCircle, AlertTriangle, CheckCircle, Info,
  ArrowRight, Download, Upload, Copy, ExternalLink,
  Eye, EyeOff, Settings, Mail, Lock, User, Calendar,
  BarChart3, TrendingUp, Clock, Heart, Zap, Loader2,
  CalendarDays, MoreHorizontal, Bug, BookOpen, GripVertical,
  Megaphone, Shield, Users, FileText, Cloud, Smartphone, Globe, Sparkles,
} from "lucide-react";
import { StyledSelect } from "../components/StyledSelect";
import { DraggableScroll } from "../components/DraggableScroll";
import { toPng } from "html-to-image";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "colors" | "typography" | "components" | "layout" | "forms" | "feedback" | "showcase";

const NAV: { key: Section; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "colors",     label: "色彩系統",   Icon: Palette },
  { key: "typography", label: "文字排版",   Icon: Type },
  { key: "components", label: "基礎元件",   Icon: Square },
  { key: "forms",      label: "表單元件",   Icon: MousePointer },
  { key: "feedback",   label: "回饋提示",   Icon: AlertCircle },
  { key: "layout",     label: "佈局規範",   Icon: Layout },
  { key: "showcase",   label: "產品宣傳",   Icon: Megaphone },
];

// ─── Shared Components ────────────────────────────────────────────────────────
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

const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: 12 }}>{children}</h3>
);

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="overflow-x-auto rounded-lg px-4 py-3 mt-2" style={{ background: "#1E293B", color: "#E2E8F0", fontSize: "12px", lineHeight: 1.6, fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
    <code>{children}</code>
  </pre>
);

const ColorSwatch = ({ name, hex, token, dark }: { name: string; hex: string; token: string; dark?: boolean }) => (
  <div className="flex flex-col">
    <div className="w-full h-16 rounded-lg mb-2 flex items-end p-2" style={{ background: hex, borderWidth: "1px", borderStyle: "solid", borderColor: dark ? "transparent" : "#E5E7EB" }}>
      <span style={{ fontSize: "10px", fontWeight: 600, color: dark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)" }}>{hex}</span>
    </div>
    <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{name}</p>
    <p style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{token}</p>
  </div>
);

// ─── 色彩系統 ─────────────────────────────────────────────────────────────────
function ColorsSection() {
  return (
    <div className="space-y-6">
      <SectionTitle title="色彩系統" desc="系統使用的所有色彩規範，包含主色、語義色與中性色" />

      {/* Primary */}
      <Card className="p-5">
        <SubTitle>主色（Primary）</SubTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          <ColorSwatch name="深墨色" hex="#111827" token="--ink-900" dark />
          <ColorSwatch name="主背景" hex="#F5F6F9" token="--bg-main" />
          <ColorSwatch name="白色" hex="#FFFFFF" token="--white" />
          <ColorSwatch name="藍色強調" hex="#60A5FA" token="--accent-blue" />
          <ColorSwatch name="漸層起點" hex="#1E3A5F" token="--gradient-start" dark />
          <ColorSwatch name="品牌色" hex="#2563EB" token="--brand" dark />
        </div>
      </Card>

      {/* Semantic */}
      <Card className="p-5">
        <SubTitle>語義色（Semantic）</SubTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          <ColorSwatch name="成功" hex="#16A34A" token="--success" dark />
          <ColorSwatch name="成功背景" hex="#F0FDF4" token="--success-bg" />
          <ColorSwatch name="警告" hex="#CA8A04" token="--warning" dark />
          <ColorSwatch name="警告背景" hex="#FEF9C3" token="--warning-bg" />
          <ColorSwatch name="危險" hex="#DC2626" token="--danger" dark />
          <ColorSwatch name="危險背景" hex="#FEF2F2" token="--danger-bg" />
          <ColorSwatch name="資訊" hex="#2563EB" token="--info" dark />
          <ColorSwatch name="資訊背景" hex="#EFF6FF" token="--info-bg" />
          <ColorSwatch name="紫色" hex="#7C3AED" token="--purple" dark />
          <ColorSwatch name="紫色背景" hex="#F5F3FF" token="--purple-bg" />
        </div>
      </Card>

      {/* Neutral */}
      <Card className="p-5">
        <SubTitle>中性色（Neutral）</SubTitle>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-4">
          {[
            { name: "900", hex: "#111827" },
            { name: "800", hex: "#1F2937" },
            { name: "700", hex: "#374151" },
            { name: "600", hex: "#4B5563" },
            { name: "500", hex: "#6B7280" },
            { name: "400", hex: "#9CA3AF" },
            { name: "300", hex: "#D1D5DB" },
            { name: "200", hex: "#E5E7EB" },
            { name: "100", hex: "#F3F4F6" },
            { name: "50",  hex: "#F9FAFB" },
          ].map(c => (
            <ColorSwatch key={c.name} name={`Gray ${c.name}`} hex={c.hex} token={`--gray-${c.name}`} dark={parseInt(c.name) >= 500} />
          ))}
        </div>
      </Card>

      {/* Role Colors */}
      <Card className="p-5">
        <SubTitle>角色色彩</SubTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { name: "管理者", hex: "#7C3AED" },
            { name: "財務主管", hex: "#CA8A04" },
            { name: "人資主管", hex: "#C2410C" },
            { name: "專案經理", hex: "#1D4ED8" },
            { name: "產品經理", hex: "#0891B2" },
            { name: "一般員工", hex: "#15803D" },
          ].map(r => (
            <ColorSwatch key={r.name} name={r.name} hex={r.hex} token={`--role-${r.name}`} dark />
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 文字排版 ─────────────────────────────────────────────────────────────────
function TypographySection() {
  return (
    <div className="space-y-6">
      <SectionTitle title="文字排版" desc="字型、字級與行高規範" />

      <Card className="p-5 space-y-6">
        <SubTitle>字型家族</SubTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg" style={{ background: "#F9FAFB" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.1em", marginBottom: 8 }}>主要字型</p>
            <p style={{ fontSize: "28px", fontWeight: 700, color: "#111827", fontFamily: "'Noto Sans JP', sans-serif" }}>Noto Sans JP</p>
            <p style={{ fontSize: "14px", color: "#6B7280", marginTop: 4 }}>用於所有 UI 介面文字、按鈕、標籤</p>
            <p style={{ fontSize: "13px", fontFamily: "'Noto Sans JP', sans-serif", color: "#374151", marginTop: 8, lineHeight: 1.8 }}>
              永字八法 ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz 0123456789
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: "#F9FAFB" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.1em", marginBottom: 8 }}>襯線字型</p>
            <p style={{ fontSize: "28px", fontWeight: 700, color: "#111827", fontFamily: "'Noto Serif JP', serif" }}>Noto Serif JP</p>
            <p style={{ fontSize: "14px", color: "#6B7280", marginTop: 4 }}>用於品牌標題、裝飾文字</p>
            <p style={{ fontSize: "13px", fontFamily: "'Noto Serif JP', serif", color: "#374151", marginTop: 8, lineHeight: 1.8 }}>
              永字八法 ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz 0123456789
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-2">
        <SubTitle>字級規範</SubTitle>
        <div className="space-y-0">
          {[
            { label: "H1 頁面標題", size: "24px", weight: 700, sample: "總覽" },
            { label: "H2 區塊標題", size: "18px", weight: 700, sample: "本月出缺勤統計" },
            { label: "H3 卡片標題", size: "14px", weight: 700, sample: "待辦事項" },
            { label: "Body 正文", size: "14px", weight: 400, sample: "這是一段標準正文內容，使用 14px 字級。" },
            { label: "Small 輔助說明", size: "13px", weight: 400, sample: "最後更新於 2026/03/18 14:30" },
            { label: "Caption 註解", size: "12px", weight: 400, sample: "共 24 筆資料" },
            { label: "Micro 微型", size: "11px", weight: 600, sample: "進行中" },
            { label: "表頭文字", size: "12px", weight: 700, sample: "員工姓名" },
          ].map(t => (
            <div key={t.label} className="flex items-baseline gap-6 py-2" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
              <div className="flex-shrink-0" style={{ width: 160 }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF" }}>{t.label}</span>
                <p style={{ fontSize: "11px", color: "#D1D5DB", fontFamily: "monospace", marginTop: 2 }}>{t.size} / {t.weight}</p>
              </div>
              <span style={{ fontSize: t.size, fontWeight: t.weight, color: t.label === "表頭文字" ? "#9CA3AF" : "#111827" }}>{t.sample}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle>數值格式規範</SubTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "貨幣", sample: "NT$ 1,250,000", desc: "NT$ + 千分位" },
            { label: "日期", sample: "2026/03/18", desc: "YYYY/MM/DD" },
            { label: "百分比", sample: "85.5%", desc: "小數點一位" },
          ].map(f => (
            <div key={f.label} className="p-3 rounded-lg" style={{ background: "#F9FAFB" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em" }}>{f.label}</p>
              <p className="tabular-nums" style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginTop: 4 }}>{f.sample}</p>
              <p style={{ fontSize: "12px", color: "#6B7280", marginTop: 2 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── 基礎元件 ────────────────────────────────────────────────────────────────
function ComponentsSection() {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <div className="space-y-6">
      <SectionTitle title="基礎元件" desc="按鈕、標籤、卡片、表格等核心 UI 元件展示" />

      {/* Buttons */}
      <Card className="p-5">
        <SubTitle>按鈕（Button）</SubTitle>
        <div className="space-y-6">

          {/* ── 狀態總覽 ── */}
          <div className="rounded-lg overflow-hidden" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
            <div className="px-4 py-2.5" style={{ background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>按鈕狀態總覽（6 種狀態）</p>
            </div>
            <div>
              {[
                { state: "Default", desc: "預設靜止狀態", visual: "使用基礎色值，cursor: pointer", color: "#111827", tag: "預設", tagBg: "#F3F4F6", tagColor: "#374151" },
                { state: "Hover", desc: "滑鼠懸停時觸發", visual: "背景色加深一階（主要按鈕）或變淺一階（次要按鈕），可搭配 boxShadow", color: "#1F2937", tag: "懸停", tagBg: "#EFF6FF", tagColor: "#1D4ED8" },
                { state: "Active / Pressed", desc: "滑鼠按下（mousedown）時觸發", visual: "背景色再深一階，提供明確的按壓回饋", color: "#374151", tag: "按壓", tagBg: "#FFF7ED", tagColor: "#C2410C" },
                { state: "Focus", desc: "鍵盤 Tab 聚焦時觸發", visual: "顯示 2px outline ring，色值同按鈕主色 20% 透明度", color: "#6B7280", tag: "聚焦", tagBg: "#F5F3FF", tagColor: "#7C3AED" },
                { state: "Loading", desc: "非同步操作進行中", visual: "顯示旋轉 Loader2 圖示，文字改為「處理中…」，cursor: not-allowed，背景色同 Hover", color: "#374151", tag: "載入", tagBg: "#ECFDF5", tagColor: "#059669" },
                { state: "Disabled", desc: "不可操作狀態", visual: "背景 #E5E7EB、文字 #9CA3AF、cursor: not-allowed、移除所有互動效果", color: "#E5E7EB", tag: "禁用", tagBg: "#FEF2F2", tagColor: "#DC2626" },
              ].map((s) => (
                <div key={s.state} className="flex items-start gap-4 px-4 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                  <div className="flex items-center gap-2.5 flex-shrink-0" style={{ width: 150 }}>
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{s.state}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 700, background: s.tagBg, color: s.tagColor }}>{s.tag}</span>
                      <span style={{ fontSize: "13px", color: "#374151" }}>{s.desc}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: 1.5 }}>{s.visual}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 色階漸變示意 ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 10 }}>色階漸變規則（Default → Hover → Active → Disabled）</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: "深墨色系", colors: ["#111827", "#1F2937", "#374151", "#E5E7EB"] },
                { label: "藍色系",   colors: ["#2563EB", "#1D4ED8", "#1E40AF", "#E5E7EB"] },
                { label: "綠色系",   colors: ["#16A34A", "#15803D", "#166534", "#E5E7EB"] },
                { label: "紅色系",   colors: ["#DC2626", "#B91C1C", "#991B1B", "#E5E7EB"] },
              ].map(group => (
                <div key={group.label} className="p-3 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", marginBottom: 8 }}>{group.label}</p>
                  <div className="flex items-center gap-1">
                    {group.colors.map((c, i) => (
                      <div key={c + i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full rounded-md" style={{ background: c, height: 32 }} />
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#6B7280", fontFamily: "monospace" }}>{c}</span>
                        <span style={{ fontSize: "10px", color: "#9CA3AF" }}>{["Default", "Hover", "Active", "Disabled"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 次要按鈕色階 ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 10 }}>次要按鈕色階（背景漸深 / 邊框不變）</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: "灰底按鈕", colors: ["#F3F4F6", "#E5E7EB", "#D1D5DB", "#F9FAFB"], border: "#E5E7EB" },
                { label: "白底按鈕", colors: ["#FFFFFF", "#F9FAFB", "#F3F4F6", "#F9FAFB"], border: "#E5E7EB" },
                { label: "Ghost 按鈕", colors: ["transparent", "#F3F4F6", "#E5E7EB", "#F9FAFB"], border: "none" },
              ].map(group => (
                <div key={group.label} className="p-3 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", marginBottom: 8 }}>{group.label}</p>
                  <div className="flex items-center gap-1">
                    {group.colors.map((c, i) => (
                      <div key={c + i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full rounded-md" style={{ background: c === "transparent" ? "#FFF" : c, height: 28, borderWidth: "1px", borderStyle: c === "transparent" ? "dashed" : "solid", borderColor: group.border === "none" ? "#D1D5DB" : group.border }} />
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#6B7280", fontFamily: "monospace" }}>{c === "transparent" ? "trans" : c}</span>
                        <span style={{ fontSize: "10px", color: "#9CA3AF" }}>{["Default", "Hover", "Active", "Disabled"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 主要按鈕：四狀態 ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 10 }}>主要按鈕</p>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 560 }}>
                <thead>
                  <tr>
                    {["預設", "Hover", "Active / Pressed", "Disabled"].map(h => (
                      <th key={h} className="px-3 py-2 text-left" style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "深墨色", default_: "#111827", hover: "#1F2937", active: "#374151", icon: Plus, text: "新增項目" },
                    { label: "藍色",   default_: "#2563EB", hover: "#1D4ED8", active: "#1E40AF", icon: null, text: "儲存變更" },
                    { label: "綠色",   default_: "#16A34A", hover: "#15803D", active: "#166534", icon: Check, text: "已完成" },
                    { label: "紅色",   default_: "#DC2626", hover: "#B91C1C", active: "#991B1B", icon: Trash2, text: "刪除" },
                  ].map(row => {
                    const BtnIcon = row.icon;
                    const renderBtn = (bg: string, disabled = false) => (
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: disabled ? "#E5E7EB" : bg, color: disabled ? "#9CA3AF" : "#FFF", fontSize: "13px", fontWeight: 600, cursor: disabled ? "not-allowed" : "default", borderWidth: 0, pointerEvents: "none" as const }}>
                        {BtnIcon && <BtnIcon className="w-4 h-4" />}{row.text}
                      </button>
                    );
                    return (
                      <tr key={row.label}>
                        <td className="px-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{renderBtn(row.default_)}</td>
                        <td className="px-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{renderBtn(row.hover)}</td>
                        <td className="px-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{renderBtn(row.active)}</td>
                        <td className="px-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{renderBtn("", true)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 次要按鈕：四狀態 ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 10 }}>次要按鈕</p>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 560 }}>
                <thead>
                  <tr>
                    {["預設", "Hover", "Active / Pressed", "Disabled"].map(h => (
                      <th key={h} className="px-3 py-2 text-left" style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "灰底", icon: Download, text: "匯出", defaultBg: "#F3F4F6", hoverBg: "#E5E7EB", activeBg: "#D1D5DB", borderC: "#E5E7EB", textC: "#374151" },
                    { label: "白底", icon: Copy, text: "複製", defaultBg: "#FFF", hoverBg: "#F9FAFB", activeBg: "#F3F4F6", borderC: "#E5E7EB", textC: "#374151" },
                    { label: "Ghost", icon: null, text: "取消", defaultBg: "transparent", hoverBg: "#F3F4F6", activeBg: "#E5E7EB", borderC: "transparent", textC: "#6B7280" },
                  ].map(row => {
                    const BtnIcon = row.icon;
                    const renderBtn = (bg: string, border: string, disabled = false) => (
                      <button className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: disabled ? "#F9FAFB" : bg, color: disabled ? "#D1D5DB" : row.textC, fontSize: "13px", fontWeight: 500, cursor: disabled ? "not-allowed" : "default", borderWidth: border === "transparent" && !disabled ? 0 : "1px", borderStyle: "solid", borderColor: disabled ? "#E5E7EB" : border, pointerEvents: "none" as const }}>
                        {BtnIcon && <BtnIcon className="w-4 h-4" />}{row.text}
                      </button>
                    );
                    return (
                      <tr key={row.label}>
                        <td className="px-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{renderBtn(row.defaultBg, row.borderC)}</td>
                        <td className="px-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{renderBtn(row.hoverBg, row.borderC)}</td>
                        <td className="px-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{renderBtn(row.activeBg, row.borderC)}</td>
                        <td className="px-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{renderBtn("", "", true)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 標題右側按鈕（縮小版）：四狀態 ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 10 }}>標題右側按鈕（縮小版）</p>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 480 }}>
                <thead>
                  <tr>
                    {["預設", "Hover", "Active / Pressed", "Disabled"].map(h => (
                      <th key={h} className="px-3 py-2 text-left" style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "深墨", icon: Plus, text: "新增", isPrimary: true },
                    { label: "灰底", icon: Download, text: "匯出報表", isPrimary: false },
                  ].map(row => {
                    const BtnIcon = row.icon;
                    const colors = row.isPrimary
                      ? { def: "#111827", hov: "#1F2937", act: "#374151", text: "#FFF", border: "transparent" }
                      : { def: "#F3F4F6", hov: "#E5E7EB", act: "#D1D5DB", text: "#374151", border: "#E5E7EB" };
                    const renderBtn = (bg: string, disabled = false) => (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{
                        background: disabled ? "#E5E7EB" : bg, color: disabled ? "#9CA3AF" : colors.text,
                        fontSize: "12px", fontWeight: row.isPrimary ? 600 : 500, cursor: disabled ? "not-allowed" : "default",
                        borderWidth: !row.isPrimary && !disabled ? "1px" : 0, borderStyle: "solid", borderColor: disabled ? "transparent" : colors.border,
                        pointerEvents: "none" as const,
                      }}>
                        <BtnIcon className="w-3.5 h-3.5" />{row.text}
                      </button>
                    );
                    return (
                      <tr key={row.label}>
                        <td className="px-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{renderBtn(colors.def)}</td>
                        <td className="px-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{renderBtn(colors.hov)}</td>
                        <td className="px-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{renderBtn(colors.act)}</td>
                        <td className="px-3 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{renderBtn("", true)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Loading 狀態 ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 10 }}>Loading 狀態</p>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg" style={{ background: "#374151", color: "#FFF", fontSize: "13px", fontWeight: 600, cursor: "not-allowed", borderWidth: 0 }}>
                <Loader2 className="w-4 h-4 animate-spin" />處理中...
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg" style={{ background: "#1D4ED8", color: "#FFF", fontSize: "13px", fontWeight: 600, cursor: "not-allowed", borderWidth: 0 }}>
                <Loader2 className="w-4 h-4 animate-spin" />儲存中...
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg" style={{ background: "#B91C1C", color: "#FFF", fontSize: "13px", fontWeight: 600, cursor: "not-allowed", borderWidth: 0 }}>
                <Loader2 className="w-4 h-4 animate-spin" />刪除中...
              </button>
            </div>
          </div>

          {/* ── 互動式預覽 ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 10 }}>互動式預覽（可實際 hover / press 操作）</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "新增項目", bg: "#111827", hoverBg: "#1F2937", activeBg: "#374151", icon: Plus },
                { label: "儲存變更", bg: "#2563EB", hoverBg: "#1D4ED8", activeBg: "#1E40AF", icon: null },
                { label: "已完成",   bg: "#16A34A", hoverBg: "#15803D", activeBg: "#166534", icon: Check },
                { label: "刪除",     bg: "#DC2626", hoverBg: "#B91C1C", activeBg: "#991B1B", icon: Trash2 },
              ].map(btn => {
                const BtnIcon = btn.icon;
                return (
                  <button key={btn.label} className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors"
                    style={{ background: btn.bg, color: "#FFF", fontSize: "13px", fontWeight: 600, cursor: "pointer", borderWidth: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = btn.hoverBg; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = btn.bg; }}
                    onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.background = btn.activeBg; }}
                    onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.background = btn.hoverBg; }}>
                    {BtnIcon && <BtnIcon className="w-4 h-4" />}{btn.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {[
                { label: "匯出", bg: "#F3F4F6", hoverBg: "#E5E7EB", activeBg: "#D1D5DB", icon: Download, textC: "#374151", border: "#E5E7EB" },
                { label: "複製", bg: "#FFF", hoverBg: "#F9FAFB", activeBg: "#F3F4F6", icon: Copy, textC: "#374151", border: "#E5E7EB" },
              ].map(btn => {
                const BtnIcon = btn.icon;
                return (
                  <button key={btn.label} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                    style={{ background: btn.bg, color: btn.textC, fontSize: "13px", fontWeight: 500, cursor: "pointer", borderWidth: "1px", borderStyle: "solid", borderColor: btn.border }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = btn.hoverBg; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = btn.bg; }}
                    onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.background = btn.activeBg; }}
                    onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.background = btn.hoverBg; }}>
                    {BtnIcon && <BtnIcon className="w-4 h-4" />}{btn.label}
                  </button>
                );
              })}
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{ background: "transparent", color: "#6B7280", fontSize: "13px", fontWeight: 500, cursor: "pointer", borderWidth: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.background = "#E5E7EB"; }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}>
                取消
              </button>
            </div>
          </div>

          {/* ── 色彩對照表 ── */}
          <div className="p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: 8 }}>色值速查</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              {[
                { label: "深墨色", def: "#111827", hov: "#1F2937", act: "#374151" },
                { label: "藍色",   def: "#2563EB", hov: "#1D4ED8", act: "#1E40AF" },
                { label: "綠色",   def: "#16A34A", hov: "#15803D", act: "#166534" },
                { label: "紅色",   def: "#DC2626", hov: "#B91C1C", act: "#991B1B" },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: c.def }} />
                    <div className="w-3 h-3 rounded-sm" style={{ background: c.hov }} />
                    <div className="w-3 h-3 rounded-sm" style={{ background: c.act }} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151", width: 56 }}>{c.label}</span>
                  <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{c.def} → {c.hov} → {c.act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Task Card (Kanban) */}
      <Card className="p-5 space-y-6">
        <SubTitle>任務卡片（Task Card — Kanban）</SubTitle>

        {/* ── 結構說明 ── */}
        <div className="rounded-lg overflow-hidden" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
          <div className="px-4 py-2.5" style={{ background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>卡片結構解析</p>
          </div>
          <div>
            {[
              { zone: "頂部列", desc: "類型圖示 + 任務編號（monospace）｜右側：優先度符號 + 三點選單", color: "#2563EB" },
              { zone: "標題區", desc: "任務名稱 16px/600，最多兩行截斷", color: "#111827" },
              { zone: "專案指示", desc: "彩色小圓點 + 專案名稱 11px（僅關聯專案時顯示）", color: "#9CA3AF" },
              { zone: "描述預覽", desc: "說明文字 12px/500 灰色，line-clamp-2 最多兩行", color: "#9CA3AF" },
              { zone: "標籤列", desc: "圓角膠囊 11px/700，背景 #F3F4F6 文字 #6B7280", color: "#6B7280" },
              { zone: "分隔線", desc: "1px #F3F4F6 水平分隔", color: "#F3F4F6" },
              { zone: "底部列", desc: "日期（含逾期標示）｜右側：Story Points 徽章 + 頭像", color: "#6B7280" },
            ].map(s => (
              <div key={s.zone} className="flex items-start gap-4 px-4 py-2.5" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                <div className="flex items-center gap-2 flex-shrink-0" style={{ width: 90 }}>
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{s.zone}</span>
                </div>
                <span style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5 }}>{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 卡片預覽 ── */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 12 }}>實際卡片預覽（4 種代表狀態）</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: "TASK-001", title: "建立 CI/CD 自動化流程", desc: "使用 GitHub Actions 建立自動測試與部署管線，涵蓋 staging / production 環境", type: "improvement" as const, priority: "high" as const, labels: ["DevOps", "自動化"], dueDate: "03-18", assignee: "孫八", assigneeColor: "#EF4444", points: 8, project: { name: "KUMO 2.0", color: "#2563EB" }, overdue: false },
              { id: "TASK-007", title: "修復匯出 CSV 格式錯誤", desc: "匯出報表 CSV 檔案中文亂碼與欄位對齊問題", type: "bug" as const, priority: "critical" as const, labels: ["Bug", "報表"], dueDate: "03-08", assignee: "吳十", assigneeColor: "#0EA5E9", points: 3, project: null, overdue: true },
              { id: "TASK-012", title: "Q1 行銷活動企劃書", desc: "規劃第一季度線上行銷活動方案與預算分配", type: "story" as const, priority: "medium" as const, labels: ["行銷", "企劃"], dueDate: "03-25", assignee: "李四", assigneeColor: "#8B5CF6", points: 5, project: { name: "品牌升級計畫", color: "#F59E0B" }, overdue: false },
              { id: "TASK-018", title: "新增權限管理 API", desc: "開發 RBAC 權限控制的 RESTful API 端點", type: "task" as const, priority: "low" as const, labels: ["API", "後端"], dueDate: "04-01", assignee: "王五", assigneeColor: "#EC4899", points: 8, project: { name: "內部系統", color: "#16A34A" }, overdue: false },
            ].map(task => {
              const typeCfg: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
                task:        { label: "任務", color: "#2563EB", bg: "#DBEAFE", icon: <AlertCircle className="w-3 h-3" /> },
                story:       { label: "需求", color: "#7C3AED", bg: "#EDE9FE", icon: <BookOpen className="w-3 h-3" /> },
                bug:         { label: "缺陷", color: "#DC2626", bg: "#FEE2E2", icon: <Bug className="w-3 h-3" /> },
                improvement: { label: "優化", color: "#15803D", bg: "#DCFCE7", icon: <Zap className="w-3 h-3" /> },
              };
              const priCfg: Record<string, { color: string; icon: string }> = {
                critical: { color: "#DC2626", icon: "▲▲" },
                high:     { color: "#EA580C", icon: "▲" },
                medium:   { color: "#CA8A04", icon: "●" },
                low:      { color: "#6B7280", icon: "▼" },
              };
              const tc = typeCfg[task.type];
              const pc = priCfg[task.priority];
              return (
                <div key={task.id} style={{
                  background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
                  borderRadius: 10, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", cursor: "grab",
                  transition: "box-shadow 0.15s, border-color 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)"; e.currentTarget.style.borderColor = "#D1D5DB"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 4, background: tc.bg, color: tc.color, flexShrink: 0 }}>{tc.icon}</span>
                      <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace", fontWeight: 600 }}>{task.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "14px", fontWeight: 900, color: pc.color, lineHeight: 1, letterSpacing: "-1px" }}>{pc.icon}</span>
                      <span className="w-6 h-6 rounded flex items-center justify-center" style={{ color: "#9CA3AF" }}><MoreHorizontal className="w-4 h-4" /></span>
                    </div>
                  </div>
                  {/* Title */}
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#111827", lineHeight: 1.5, marginBottom: task.project ? 6 : 10 }}>{task.title}</p>
                  {/* Project */}
                  {task.project && (
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: task.project.color }} />
                      <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>{task.project.name}</span>
                    </div>
                  )}
                  {/* Desc */}
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "#9CA3AF", lineHeight: 1.6, marginBottom: 10 }} className="line-clamp-2">{task.desc}</p>
                  {/* Labels */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {task.labels.map(l => (
                      <span key={l} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: 10, background: "#F3F4F6", color: "#6B7280", fontWeight: 700 }}>{l}</span>
                    ))}
                  </div>
                  {/* Divider */}
                  <div style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", marginBottom: 10 }} />
                  {/* Bottom */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5" style={{ color: task.overdue ? "#DC2626" : "#9CA3AF" }}>
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span style={{ fontSize: "12px", fontWeight: 600 }}>{task.dueDate}</span>
                      {task.overdue && <span style={{ fontSize: "13px", fontWeight: 600 }}>逾期</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#6B7280", background: "#F3F4F6", borderRadius: 4, padding: "2px 7px" }}>{task.points}pt</span>
                      <div title={task.assignee} style={{ width: 26, height: 26, borderRadius: "50%", background: task.assigneeColor, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, borderWidth: "1.5px", borderStyle: "solid", borderColor: "#FFF" }}>
                        {task.assignee.charAt(0)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 樣式規格表 ── */}
        <div className="p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: 10 }}>任務卡片樣式規格</p>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 500 }}>
              <thead>
                <tr>
                  {["屬性", "數值", "說明"].map(h => (
                    <th key={h} className="px-3 py-1.5 text-left" style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { attr: "圓角", val: "10px", note: "border-radius" },
                  { attr: "內距", val: "16px", note: "padding 四邊" },
                  { attr: "邊框", val: "1px solid #E5E7EB", note: "hover → #D1D5DB" },
                  { attr: "陰影", val: "0 1px 3px rgba(0,0,0,0.06)", note: "hover → 0 6px 16px rgba(0,0,0,0.1)" },
                  { attr: "拖曳中", val: "opacity 0.35 + rotate(1.5deg) scale(0.98)", note: "視覺回饋" },
                  { attr: "標題", val: "16px / 600 / #111827", note: "line-height 1.5" },
                  { attr: "說明", val: "12px / 500 / #9CA3AF", note: "line-clamp-2" },
                  { attr: "編號", val: "11px / monospace / 600", note: "色值 #9CA3AF" },
                  { attr: "標籤", val: "11px / 700 / #6B7280", note: "bg #F3F4F6, radius 10px, px 8px" },
                  { attr: "點數", val: "13px / 700 / #6B7280", note: "bg #F3F4F6, radius 4px" },
                  { attr: "頭像", val: "26px 圓形", note: "背景色 = assigneeColor, 1.5px 白邊" },
                ].map(r => (
                  <tr key={r.attr}>
                    <td className="px-3 py-2" style={{ fontSize: "12px", fontWeight: 600, color: "#374151", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{r.attr}</td>
                    <td className="px-3 py-2" style={{ fontSize: "11px", color: "#111827", fontFamily: "monospace", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{r.val}</td>
                    <td className="px-3 py-2" style={{ fontSize: "11px", color: "#9CA3AF", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 類型圖示與優先度速查 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: 10 }}>類型圖示（TypeIcon）</p>
            <div className="space-y-2">
              {[
                { type: "task", label: "任務", color: "#2563EB", bg: "#DBEAFE", icon: <AlertCircle className="w-3 h-3" /> },
                { type: "story", label: "需求", color: "#7C3AED", bg: "#EDE9FE", icon: <BookOpen className="w-3 h-3" /> },
                { type: "bug", label: "缺陷", color: "#DC2626", bg: "#FEE2E2", icon: <Bug className="w-3 h-3" /> },
                { type: "improvement", label: "優化", color: "#15803D", bg: "#DCFCE7", icon: <Zap className="w-3 h-3" /> },
              ].map(t => (
                <div key={t.type} className="flex items-center gap-3">
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 4, background: t.bg, color: t.color, flexShrink: 0 }}>{t.icon}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151", width: 36 }}>{t.label}</span>
                  <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{t.color} / {t.bg}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: 10 }}>優先度符號（PriorityDot）</p>
            <div className="space-y-2">
              {[
                { level: "critical", label: "緊急", color: "#DC2626", icon: "▲▲", bg: "#FEF2F2" },
                { level: "high",     label: "高",   color: "#EA580C", icon: "▲",  bg: "#FFF7ED" },
                { level: "medium",   label: "中",   color: "#CA8A04", icon: "●",  bg: "#FEFCE8" },
                { level: "low",      label: "低",   color: "#6B7280", icon: "▼",  bg: "#F9FAFB" },
              ].map(p => (
                <div key={p.level} className="flex items-center gap-3">
                  <span style={{ fontSize: "14px", fontWeight: 900, color: p.color, lineHeight: 1, letterSpacing: "-1px", width: 20, textAlign: "center" }}>{p.icon}</span>
                  <span className="px-2 py-0.5 rounded" style={{ fontSize: "12px", fontWeight: 600, color: p.color, background: p.bg }}>{p.label}</span>
                  <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{p.color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 狀態欄位色彩 ── */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 10 }}>看板欄位色彩對照</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "待辦",   color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", headerBg: "#E5E7EB" },
              { label: "進行中", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", headerBg: "#BFDBFE" },
              { label: "審核中", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", headerBg: "#DDD6FE" },
              { label: "已完成", color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0", headerBg: "#BBF7D0" },
            ].map(col => (
              <div key={col.label} className="rounded-lg overflow-hidden" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: col.border }}>
                <div className="px-3 py-2" style={{ background: col.headerBg }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: col.color }}>{col.label}</span>
                </div>
                <div className="px-3 py-2.5 space-y-1" style={{ background: col.bg }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: col.color }} />
                    <span style={{ fontSize: "10px", color: "#6B7280", fontFamily: "monospace" }}>color: {col.color}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: col.bg, borderWidth: "1px", borderStyle: "solid", borderColor: "#D1D5DB" }} />
                    <span style={{ fontSize: "10px", color: "#6B7280", fontFamily: "monospace" }}>bg: {col.bg}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: col.headerBg }} />
                    <span style={{ fontSize: "10px", color: "#6B7280", fontFamily: "monospace" }}>header: {col.headerBg}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Badges / Tags */}
      <Card className="p-5">
        <SubTitle>標籤與徽章（Badge / Tag）</SubTitle>
        <div className="space-y-4">
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 8 }}>狀態標籤</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "進行中", bg: "#EFF6FF", color: "#1D4ED8" },
                { label: "已完成", bg: "#F0FDF4", color: "#15803D" },
                { label: "審核中", bg: "#F5F3FF", color: "#7C3AED" },
                { label: "待辦",   bg: "#F9FAFB", color: "#374151" },
                { label: "逾期",   bg: "#FEF2F2", color: "#DC2626" },
                { label: "暫停",   bg: "#FEF9C3", color: "#A16207" },
              ].map(b => (
                <span key={b.label} className="px-2.5 py-1 rounded-md" style={{ fontSize: "12px", fontWeight: 600, background: b.bg, color: b.color }}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 8 }}>優先度</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "緊急", bg: "#FEF2F2", color: "#DC2626", dot: "#DC2626" },
                { label: "高",   bg: "#FFF7ED", color: "#C2410C", dot: "#EA580C" },
                { label: "中",   bg: "#FEF9C3", color: "#A16207", dot: "#CA8A04" },
                { label: "低",   bg: "#F0FDF4", color: "#15803D", dot: "#16A34A" },
              ].map(b => (
                <span key={b.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ fontSize: "12px", fontWeight: 600, background: b.bg, color: b.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.dot }} />
                  {b.label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 8 }}>成員頭像晶片</p>
            <div className="flex items-center gap-2">
              {["張", "李", "王", "陳", "趙"].map((n, i) => (
                <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: ["#3B82F6", "#8B5CF6", "#EC4899", "#84CC16", "#F59E0B"][i], color: "#FFF", fontSize: "12px", fontWeight: 700 }}>
                  {n}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#F3F4F6", color: "#6B7280", fontSize: "11px", fontWeight: 600 }}>
                +3
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tab */}
      <Card className="p-5">
        <SubTitle>Tab 頁籤</SubTitle>
        <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: 12 }}>灰底圓角容器 + 深色膠囊風格</p>
        <div className="inline-flex rounded-lg p-1" style={{ background: "#F3F4F6" }}>
          {[
            { key: "tab1", label: "看板" },
            { key: "tab2", label: "任務追蹤" },
            { key: "tab3", label: "Sprint 報表" },
            { key: "tab4", label: "歷史任務" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-4 py-2 rounded-md transition-all"
              style={{
                fontSize: "13px", fontWeight: activeTab === t.key ? 600 : 400,
                background: activeTab === t.key ? "#111827" : "transparent",
                color: activeTab === t.key ? "#FFF" : "#6B7280",
                cursor: "pointer", borderWidth: 0,
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <SubTitle>
          <span className="px-5 pt-5 block">表格（Table）</span>
        </SubTitle>
        <p className="px-5 pb-2" style={{ fontSize: "12px", color: "#9CA3AF" }}>
          表頭 12px/700/#9CA3AF、背景 #FAFAFA、列行 px-5 py-3.5、hover #FAFAFA、無斑馬紋
        </p>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFAFA" }}>
                {["員工姓名", "部門", "狀態", "到職日", "操作"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "張三", dept: "技術部", status: "在職", date: "2023/06/15" },
                { name: "李四", dept: "行銷部", status: "在職", date: "2024/01/10" },
                { name: "王五", dept: "設計部", status: "留停", date: "2023/09/01" },
              ].map((row, i) => (
                <tr key={i} className="transition-colors" onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td className="px-5 py-3.5" style={{ fontSize: "14px", fontWeight: 500, color: "#111827", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{row.name}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: "14px", color: "#6B7280", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{row.dept}</td>
                  <td className="px-5 py-3.5" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                    <span className="px-2 py-0.5 rounded" style={{ fontSize: "12px", fontWeight: 600, background: row.status === "在職" ? "#F0FDF4" : "#F3F4F6", color: row.status === "在職" ? "#15803D" : "#9CA3AF" }}>{row.status}</span>
                  </td>
                  <td className="px-5 py-3.5 tabular-nums" style={{ fontSize: "14px", color: "#6B7280", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{row.date}</td>
                  <td className="px-5 py-3.5" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                    <button style={{ fontSize: "13px", color: "#2563EB", fontWeight: 500, background: "none", borderWidth: 0, cursor: "pointer" }}>編輯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stat Cards */}
      <Card className="p-5">
        <SubTitle>統計卡片（以出缺勤為標準）</SubTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          {[
            { label: "本月出勤", value: "22", unit: "天", icon: CheckCircle, color: "#16A34A", bg: "#F0FDF4" },
            { label: "遲到次數", value: "1", unit: "次", icon: Clock, color: "#CA8A04", bg: "#FEF9C3" },
            { label: "請假天數", value: "2", unit: "天", icon: Calendar, color: "#2563EB", bg: "#EFF6FF" },
            { label: "加班時數", value: "8.5", unit: "hr", icon: Zap, color: "#7C3AED", bg: "#F5F3FF" },
          ].map(s => {
            const SIcon = s.icon;
            return (
              <div key={s.label} className="p-4 rounded-lg" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF" }}>{s.label}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                    <SIcon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="tabular-nums" style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>{s.value}</span>
                  <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{s.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── 表單元件 ────────────────────────────────────────────────────────────────
function FormsSection() {
  const [inputVal, setInputVal] = useState("");
  const [selectVal, setSelectVal] = useState("option1");
  const [checked, setChecked] = useState(true);
  const [toggleVal, setToggleVal] = useState(true);
  const [searchVal, setSearchVal] = useState("");

  return (
    <div className="space-y-6">
      <SectionTitle title="表單元件" desc="輸入框、下拉選單、核取方塊等互動元件" />

      <Card className="p-5 space-y-6">
        <SubTitle>文字輸入框（Input）</SubTitle>

        {/* ── 狀態總覽 ── */}
        <div className="rounded-lg overflow-hidden" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
          <div className="px-4 py-2.5" style={{ background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>輸入框狀態總覽（7 種狀態）</p>
          </div>
          <div>
            {[
              { state: "Default", desc: "預設靜止，尚未互動", visual: "背景 #F9FAFB、邊框 #E5E7EB、placeholder 文字 #9CA3AF", tag: "預設", tagBg: "#F3F4F6", tagColor: "#374151", dot: "#E5E7EB" },
              { state: "Hover", desc: "滑鼠移入，尚未聚焦", visual: "邊框色加深為 #D1D5DB，背景不變", tag: "懸停", tagBg: "#EFF6FF", tagColor: "#1D4ED8", dot: "#D1D5DB" },
              { state: "Focus", desc: "點擊後進入編輯態", visual: "邊框 #111827、背景變白 #FFF、外圈 ring 0 0 0 2px rgba(17,24,39,0.08)", tag: "聚焦", tagBg: "#F5F3FF", tagColor: "#7C3AED", dot: "#111827" },
              { state: "Filled", desc: "已輸入有效內容", visual: "邊框 #E5E7EB、背景 #F9FAFB、文字 #111827", tag: "已填", tagBg: "#ECFDF5", tagColor: "#059669", dot: "#059669" },
              { state: "Disabled", desc: "不可編輯狀態", visual: "背景 #F3F4F6、邊框 #E5E7EB、文字 #9CA3AF、cursor: not-allowed", tag: "禁用", tagBg: "#FEF2F2", tagColor: "#DC2626", dot: "#D1D5DB" },
              { state: "Read-only", desc: "僅供閱讀，不可修改", visual: "背景 #F9FAFB、邊框 transparent、文字 #374151、無 hover/focus 效果", tag: "唯讀", tagBg: "#FFF7ED", tagColor: "#C2410C", dot: "#9CA3AF" },
              { state: "Error", desc: "驗證失敗狀態", visual: "背景 #FEF2F2、邊框 #FECACA、文字 #DC2626、搭配底部紅色錯誤訊息", tag: "錯誤", tagBg: "#FEF2F2", tagColor: "#DC2626", dot: "#DC2626" },
            ].map(s => (
              <div key={s.state} className="flex items-start gap-4 px-4 py-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                <div className="flex items-center gap-2.5 flex-shrink-0" style={{ width: 130 }}>
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.dot }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{s.state}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 700, background: s.tagBg, color: s.tagColor }}>{s.tag}</span>
                    <span style={{ fontSize: "13px", color: "#374151" }}>{s.desc}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: 1.5 }}>{s.visual}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 靜態狀態展示 ── */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 12 }}>各狀態靜態預覽</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
            {/* Default */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 700, background: "#F3F4F6", color: "#374151" }}>Default</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>預設靜止</span>
              </div>
              <div style={{ width: "100%", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 6, padding: "8px 12px", fontSize: "14px", color: "#9CA3AF", pointerEvents: "none" as const }}>
                請輸入內容
              </div>
            </div>
            {/* Hover */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 700, background: "#EFF6FF", color: "#1D4ED8" }}>Hover</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>滑鼠懸停</span>
              </div>
              <div style={{ width: "100%", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#D1D5DB", borderRadius: 6, padding: "8px 12px", fontSize: "14px", color: "#9CA3AF", pointerEvents: "none" as const }}>
                請輸入內容
              </div>
            </div>
            {/* Focus */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 700, background: "#F5F3FF", color: "#7C3AED" }}>Focus</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>聚焦編輯中</span>
              </div>
              <div style={{ width: "100%", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#111827", borderRadius: 6, padding: "8px 12px", fontSize: "14px", color: "#9CA3AF", boxShadow: "0 0 0 2px rgba(17,24,39,0.08)", pointerEvents: "none" as const }}>
                <span style={{ borderRight: "2px solid #111827", paddingRight: 1, animation: "none" }}>&nbsp;</span>
              </div>
            </div>
            {/* Filled */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 700, background: "#ECFDF5", color: "#059669" }}>Filled</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>已填入內容</span>
              </div>
              <div style={{ width: "100%", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 6, padding: "8px 12px", fontSize: "14px", color: "#111827", pointerEvents: "none" as const }}>
                王大明
              </div>
            </div>
            {/* Disabled */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 700, background: "#FEF2F2", color: "#DC2626" }}>Disabled</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>禁用</span>
              </div>
              <div style={{ width: "100%", background: "#F3F4F6", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 6, padding: "8px 12px", fontSize: "14px", color: "#9CA3AF", cursor: "not-allowed" }}>
                無法輸入
              </div>
            </div>
            {/* Read-only */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 700, background: "#FFF7ED", color: "#C2410C" }}>Read-only</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>唯讀</span>
              </div>
              <div style={{ width: "100%", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "transparent", borderRadius: 6, padding: "8px 12px", fontSize: "14px", color: "#374151", pointerEvents: "none" as const }}>
                EMP-2024-001
              </div>
            </div>
            {/* Error */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 700, background: "#FEF2F2", color: "#DC2626" }}>Error</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>驗證錯誤</span>
              </div>
              <div style={{ width: "100%", background: "#FEF2F2", borderWidth: "1px", borderStyle: "solid", borderColor: "#FECACA", borderRadius: 6, padding: "8px 12px", fontSize: "14px", color: "#DC2626", pointerEvents: "none" as const }}>
                incorrect@
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0" style={{ color: "#DC2626" }} />
                <span style={{ fontSize: "12px", color: "#DC2626" }}>Email 格式不正確</span>
              </div>
            </div>
            {/* Success */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 700, background: "#ECFDF5", color: "#059669" }}>Success</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>驗證通過（選用）</span>
              </div>
              <div className="relative" style={{ width: "100%" }}>
                <div style={{ width: "100%", background: "#F0FDF4", borderWidth: "1px", borderStyle: "solid", borderColor: "#BBF7D0", borderRadius: 6, padding: "8px 36px 8px 12px", fontSize: "14px", color: "#111827", pointerEvents: "none" as const }}>
                  admin@company.com
                </div>
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#16A34A" }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── 色值速查 ── */}
        <div className="p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em", marginBottom: 10 }}>輸入框色值速查</p>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 520 }}>
              <thead>
                <tr>
                  {["狀態", "背景色", "邊框色", "文字色", "其他"].map(h => (
                    <th key={h} className="px-3 py-1.5 text-left" style={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { state: "Default", bg: "#F9FAFB", border: "#E5E7EB", text: "#9CA3AF", extra: "placeholder" },
                  { state: "Hover", bg: "#F9FAFB", border: "#D1D5DB", text: "#9CA3AF", extra: "—" },
                  { state: "Focus", bg: "#FFFFFF", border: "#111827", text: "#111827", extra: "ring: rgba(17,24,39,0.08)" },
                  { state: "Filled", bg: "#F9FAFB", border: "#E5E7EB", text: "#111827", extra: "—" },
                  { state: "Disabled", bg: "#F3F4F6", border: "#E5E7EB", text: "#9CA3AF", extra: "cursor: not-allowed" },
                  { state: "Read-only", bg: "#F9FAFB", border: "transparent", text: "#374151", extra: "無互動效果" },
                  { state: "Error", bg: "#FEF2F2", border: "#FECACA", text: "#DC2626", extra: "紅色提示文字" },
                ].map(r => (
                  <tr key={r.state}>
                    <td className="px-3 py-2" style={{ fontSize: "12px", fontWeight: 600, color: "#374151", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{r.state}</td>
                    <td className="px-3 py-2" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ background: r.bg === "transparent" ? "#FFF" : r.bg, borderWidth: "1px", borderStyle: r.bg === "transparent" ? "dashed" : "solid", borderColor: "#D1D5DB" }} />
                        <span style={{ fontSize: "11px", color: "#6B7280", fontFamily: "monospace" }}>{r.bg}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ background: r.border === "transparent" ? "#FFF" : r.border, borderWidth: "1px", borderStyle: r.border === "transparent" ? "dashed" : "solid", borderColor: "#D1D5DB" }} />
                        <span style={{ fontSize: "11px", color: "#6B7280", fontFamily: "monospace" }}>{r.border}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ background: r.text }} />
                        <span style={{ fontSize: "11px", color: "#6B7280", fontFamily: "monospace" }}>{r.text}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2" style={{ fontSize: "11px", color: "#9CA3AF", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>{r.extra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 帶圖示變體 ── */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 12 }}>帶圖示變體</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: 6 }}>左側圖示（搜尋）</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9CA3AF" }} />
                <input value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="搜尋..."
                  style={{ width: "100%", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 6, padding: "8px 12px 8px 36px", fontSize: "14px", color: "#111827", outline: "none" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#111827"; e.currentTarget.style.background = "#FFF"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(17,24,39,0.08)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: 6 }}>左側圖示（Email）</p>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9CA3AF" }} />
                <input placeholder="name@company.com"
                  style={{ width: "100%", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 6, padding: "8px 12px 8px 36px", fontSize: "14px", color: "#111827", outline: "none" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#111827"; e.currentTarget.style.background = "#FFF"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(17,24,39,0.08)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: 6 }}>密碼（右側切換）</p>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9CA3AF" }} />
                <input type="password" placeholder="請輸入密碼" readOnly
                  style={{ width: "100%", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 6, padding: "8px 36px 8px 36px", fontSize: "14px", color: "#111827", outline: "none" }}
                />
                <Eye className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9CA3AF", cursor: "pointer" }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── 互動式預覽 ── */}
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 12 }}>互動式預覽（可實際操作 hover / focus）</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>一般輸入框</label>
              <input value={inputVal} onChange={e => setInputVal(e.target.value)} placeholder="請輸入內容"
                className="transition-all"
                style={{ width: "100%", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 6, padding: "8px 12px", fontSize: "14px", color: "#111827", outline: "none" }}
                onMouseEnter={e => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = "#D1D5DB"; }}
                onMouseLeave={e => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = "#E5E7EB"; }}
                onFocus={e => { e.currentTarget.style.borderColor = "#111827"; e.currentTarget.style.background = "#FFF"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(17,24,39,0.08)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: 4 }}>試試看：hover → 邊框 #D1D5DB ｜ focus → 邊框 #111827 + ring</p>
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Disabled 輸入框</label>
              <input disabled value="無法輸入" style={{ width: "100%", background: "#F3F4F6", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 6, padding: "8px 12px", fontSize: "14px", color: "#9CA3AF", outline: "none", cursor: "not-allowed" }} />
              <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: 4 }}>disabled 屬性：無法聚焦，cursor 為禁止符號</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-6">
        <SubTitle>下拉選單（StyledSelect）</SubTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label style={{ fontSize: "14px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>系統統一下拉</label>
            <StyledSelect value={selectVal} onChange={setSelectVal}
              options={[
                { key: "option1", label: "選項一" },
                { key: "option2", label: "選項二" },
                { key: "option3", label: "選項三" },
              ]} formField />
          </div>
          <div>
            <label style={{ fontSize: "14px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>篩選型下拉</label>
            <StyledSelect value="all" onChange={() => {}}
              options={[
                { key: "all", label: "全部部門" },
                { key: "tech", label: "技術部" },
                { key: "hr", label: "人資部" },
              ]} formField />
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-6">
        <SubTitle>核取方塊與切換</SubTitle>
        <div className="flex flex-wrap gap-8">
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 8 }}>核取方塊</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setChecked(!checked)}
                style={{ width: 18, height: 18, background: checked ? "#111827" : "#FFF", borderWidth: checked ? 0 : "1px", borderStyle: "solid", borderColor: "#D1D5DB", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
              <span style={{ fontSize: "14px", color: "#374151" }}>記住我的登入狀態</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", marginBottom: 8 }}>Toggle 開關</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setToggleVal(!toggleVal)}
                style={{ width: 42, height: 24, flexShrink: 0, background: toggleVal ? "#111827" : "#D1D5DB", borderRadius: 12, borderWidth: 0, cursor: "pointer", padding: 0, position: "relative", transition: "background 0.18s" }}>
                <span style={{ position: "absolute", top: 3, left: toggleVal ? 21 : 3, width: 18, height: 18, background: "#FFF", borderRadius: "50%", transition: "left 0.18s", boxShadow: "0 1px 4px rgba(0,0,0,0.22)" }} />
              </button>
              <span style={{ fontSize: "14px", color: "#374151" }}>{toggleVal ? "已啟用" : "已停用"}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── 回饋提示 ─────────────────────────────────────────────────────────────────
function FeedbackSection() {
  return (
    <div className="space-y-6">
      <SectionTitle title="回饋提示" desc="Alert、Toast、空狀態等回饋元件" />

      <Card className="p-5 space-y-4">
        <SubTitle>Alert 提示訊息</SubTitle>
        {[
          { type: "成功", icon: CheckCircle, bg: "#F0FDF4", border: "#BBF7D0", color: "#15803D", text: "資料已成功儲存！" },
          { type: "警告", icon: AlertTriangle, bg: "#FEF9C3", border: "#FDE68A", color: "#A16207", text: "預算已使用超過 80%，請留意支出。" },
          { type: "錯誤", icon: AlertCircle, bg: "#FEF2F2", border: "#FECACA", color: "#DC2626", text: "操作失敗，請稍後再試或聯繫管理者。" },
          { type: "資訊", icon: Info, bg: "#EFF6FF", border: "#BFDBFE", color: "#1D4ED8", text: "系統將於今晚 22:00 進行維護更新。" },
        ].map(a => {
          const AIcon = a.icon;
          return (
            <div key={a.type} className="flex items-start gap-3 px-4 py-3 rounded-lg" style={{ background: a.bg, borderWidth: "1px", borderStyle: "solid", borderColor: a.border }}>
              <AIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: a.color }} />
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: a.color }}>{a.type}</p>
                <p style={{ fontSize: "13px", color: a.color, marginTop: 1 }}>{a.text}</p>
              </div>
            </div>
          );
        })}
      </Card>

      <Card className="p-5">
        <SubTitle>空狀態</SubTitle>
        <div className="flex flex-col items-center py-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#F3F4F6" }}>
            <Search className="w-7 h-7" style={{ color: "#D1D5DB" }} />
          </div>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>找不到符合的資料</p>
          <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: 4 }}>請嘗試調整篩選條件或關鍵字</p>
          <button className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg" style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 600, cursor: "pointer", borderWidth: 0 }}>
            <Plus className="w-4 h-4" />新增第一筆資料
          </button>
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle>Loading 載入狀態</SubTitle>
        <div className="flex items-center gap-8 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ borderWidth: "3px", borderStyle: "solid", borderColor: "#E5E7EB", borderTopColor: "#111827" }} />
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Spinner</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full" style={{ background: "#111827", animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Dots</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#E5E7EB" }}>
              <div className="h-full rounded-full" style={{ width: "65%", background: "#111827", transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Progress Bar</span>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle>通知鈴鐺紅點</SubTitle>
        <div className="flex items-center gap-6">
          <div className="relative p-2 rounded-lg" style={{ background: "#F3F4F6" }}>
            <Bell className="w-5 h-5" style={{ color: "#374151" }} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#DC2626", color: "#FFF", fontSize: "9px", fontWeight: 700 }}>3</span>
          </div>
          <span style={{ fontSize: "13px", color: "#6B7280" }}>右上角通知鈴鐺帶未讀計數紅點</span>
        </div>
      </Card>
    </div>
  );
}

// ─── 佈局規範 ────────────────────────────────────────────────────────────────
function LayoutSection() {
  return (
    <div className="space-y-6">
      <SectionTitle title="佈局規範" desc="間距、圓角、陰影與響應式斷點" />

      <Card className="p-5">
        <SubTitle>間距系統（Spacing）</SubTitle>
        <div className="space-y-3">
          {[
            { token: "4px", label: "xs — 微間距", px: 4 },
            { token: "8px", label: "sm — 小間距", px: 8 },
            { token: "12px", label: "md — 中間距", px: 12 },
            { token: "16px", label: "lg — 大間距", px: 16 },
            { token: "20px", label: "xl — 特大間距", px: 20 },
            { token: "24px", label: "2xl — 段落間距", px: 24 },
            { token: "30px", label: "頁面內距（桌面版）", px: 30 },
          ].map(s => (
            <div key={s.token} className="flex items-center gap-4">
              <span className="tabular-nums flex-shrink-0" style={{ width: 60, fontSize: "12px", fontWeight: 600, color: "#6B7280", fontFamily: "monospace" }}>{s.token}</span>
              <div className="h-5 rounded" style={{ width: s.px * 3, background: "#111827", minWidth: 12 }} />
              <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle>圓角規範（Border Radius）</SubTitle>
        <div className="flex flex-wrap gap-6">
          {[
            { value: "4px", label: "sm" },
            { value: "6px", label: "md" },
            { value: "8px", label: "lg（卡片）" },
            { value: "12px", label: "xl（按鈕）" },
            { value: "9999px", label: "full（膠囊）" },
          ].map(r => (
            <div key={r.value} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 flex items-center justify-center" style={{ borderWidth: "2px", borderStyle: "solid", borderColor: "#111827", borderRadius: r.value }}>
                <span style={{ fontSize: "11px", color: "#6B7280", fontFamily: "monospace" }}>{r.value}</span>
              </div>
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{r.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle>陰影規範（Box Shadow）</SubTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "細微", shadow: "0 1px 3px rgba(0,0,0,0.04)", desc: "卡片預設" },
            { name: "輕柔", shadow: "0 4px 6px rgba(0,0,0,0.05)", desc: "hover 浮起" },
            { name: "浮層", shadow: "0 10px 25px rgba(0,0,0,0.1)", desc: "Modal / Dropdown" },
          ].map(s => (
            <div key={s.name} className="p-5 rounded-lg" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", boxShadow: s.shadow }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{s.name}</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>{s.desc}</p>
              <p style={{ fontSize: "11px", color: "#D1D5DB", fontFamily: "monospace", marginTop: 4 }}>{s.shadow}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle>響應式斷點</SubTitle>
        <div className="space-y-2">
          {[
            { bp: "max-md", value: "< 768px", desc: "手機版：Tab 改下拉、表格改卡片堆疊、卡片間距 p-4" },
            { bp: "md",     value: ">= 768px", desc: "平板版：側邊欄固定顯示" },
            { bp: "lg",     value: ">= 1024px", desc: "桌面版：完整佈局" },
            { bp: "xl",     value: ">= 1280px", desc: "寬螢幕：最大寬度擴展" },
          ].map(b => (
            <div key={b.bp} className="flex items-center gap-4 py-2.5" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
              <span className="px-2 py-1 rounded" style={{ fontSize: "12px", fontWeight: 700, color: "#2563EB", background: "#EFF6FF", fontFamily: "monospace" }}>{b.bp}</span>
              <span className="tabular-nums" style={{ fontSize: "13px", fontWeight: 600, color: "#111827", width: 100 }}>{b.value}</span>
              <span style={{ fontSize: "13px", color: "#6B7280" }}>{b.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SubTitle>邊框規範（Tailwind v4 inline style 注意事項）</SubTitle>
        <div className="p-4 rounded-lg" style={{ background: "#FEF9C3", borderWidth: "1px", borderStyle: "solid", borderColor: "#FDE68A" }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#A16207" }} />
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#A16207" }}>重要提醒</p>
              <p style={{ fontSize: "13px", color: "#A16207", marginTop: 2 }}>
                Tailwind v4 環境下，inline style 的 border 簡寫會被覆蓋，<br />
                請務必拆分為 <code style={{ background: "rgba(0,0,0,0.1)", padding: "1px 4px", borderRadius: 3 }}>borderWidth</code> /
                <code style={{ background: "rgba(0,0,0,0.1)", padding: "1px 4px", borderRadius: 3 }}>borderStyle</code> /
                <code style={{ background: "rgba(0,0,0,0.1)", padding: "1px 4px", borderRadius: 3 }}>borderColor</code>
              </p>
            </div>
          </div>
        </div>
        <CodeBlock>{`// ❌ 錯誤
style={{ border: "1px solid #E5E7EB" }}

// ✅ 正確
style={{
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#E5E7EB",
}}`}</CodeBlock>
      </Card>
    </div>
  );
}

// ─── Logo 元件 ──────────────────────────────────────────────────────────────────
const KumoLogo = ({ size = 48, light = false }: { size?: number; light?: boolean }) => (
  <div className="flex items-center justify-center rounded-2xl relative overflow-hidden" style={{ width: size, height: size, background: "linear-gradient(135deg, #111827 0%, #1E3A5F 100%)" }}>
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="#fff" strokeWidth="1.5" fill="none" />
      <path d="M12 7v10M7 9.5l5 3 5-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill="#60A5FA" />
    </svg>
  </div>
);

// ─── 產品宣傳 ─────────────────────────────────────────────────────────────────
function ShowcaseSection() {
  const darkHeroRef = useRef<HTMLDivElement>(null);
  const lightHeroRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { width: 1920, height: 1080, style: { transform: "scale(1)", transformOrigin: "top left" }, pixelRatio: 1, canvasWidth: 1920, canvasHeight: 1080 });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error("Download failed", e); }
  }, []);

  const features = [
    { icon: Clock, title: "智慧打卡", desc: "GPS 定位 + 人臉辨識，自動記錄上下班與加班時數" },
    { icon: Layers, title: "專案看板", desc: "Jira 風格看板 + Sprint 生命週期，拖曳式任務管理" },
    { icon: BarChart3, title: "財務報表", desc: "即時營收追蹤、費用分析與預算管控一目瞭然" },
    { icon: Shield, title: "六角色權限", desc: "Admin 至 Staff 六級 RBAC，14 項細粒度權限控制" },
    { icon: Users, title: "員工管理", desc: "完整人事資料、出缺勤統計與績效評估系統" },
    { icon: FileText, title: "公告系統", desc: "即時公告推播、已讀追蹤，訊息不遺漏" },
    { icon: Smartphone, title: "響應式設計", desc: "桌面與行動裝置完美適配，隨時隨地辦公" },
    { icon: Globe, title: "雲端部署", desc: "高可用架構、自動備份、99.9% SLA 保證" },
  ];

  const stats = [
    { value: "12+", label: "功能模組" },
    { value: "6", label: "角色權限" },
    { value: "14", label: "細粒度權限" },
    { value: "99.9%", label: "SLA 保證" },
  ];

  const testimonials = [
    { name: "林經理", role: "人資部門主管", text: "導入 KUMO 後，出缺勤管理效率提升 60%，人事行政大幅簡化。" },
    { name: "張總監", role: "產品研發總監", text: "Sprint 看板與結算點數讓團隊產能透明化，每個衝刺都能精準回顧。" },
    { name: "陳協理", role: "財務部門協理", text: "財務儀表板一眼掌握營收全貌，月結報表從 3 天縮短到 30 分鐘。" },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="產品宣傳" desc="KUMO Workspace 品牌主視覺與宣傳頁面素材展示" />

      {/* ── Hero: 深色主視覺 ── */}
      <div className="relative">
        <Card className="overflow-hidden">
          <div ref={darkHeroRef} className="relative flex flex-col items-center justify-center text-center" style={{ minHeight: 420, background: "linear-gradient(160deg, #0F172A 0%, #1E3A5F 40%, #111827 100%)" }}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute rounded-full" style={{ width: 400, height: 400, top: -100, right: -80, background: "radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)" }} />
              <div className="absolute rounded-full" style={{ width: 300, height: 300, bottom: -60, left: -40, background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />
              <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            </div>
            <div className="relative z-10 flex flex-col items-center px-6 py-16">
              <KumoLogo size={72} />
              <div className="mt-6 mb-2">
                <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.2, fontFamily: "'Noto Sans JP', sans-serif" }}>KUMO</h2>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: "0.25em", marginTop: 4 }}>WORKSPACE</p>
              </div>
              <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)", marginTop: 16, maxWidth: 420, lineHeight: 1.7 }}>
                雲端企業協作管理平台
              </p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: 8, maxWidth: 480, lineHeight: 1.6 }}>
                整合 人事、專案、財務、打卡、權限於一體的企業級SaaS解決方案
              </p>
            </div>
          </div>
        </Card>
        <button onClick={() => handleDownload(darkHeroRef, "kumo-hero-dark-1920x1080.png")} className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(255,255,255,0.2)", color: "#FFF", fontSize: "12px", fontWeight: 500 }}>
          <Download style={{ width: 14, height: 14 }} />下載 1920×1080
        </button>
      </div>

      {/* ── Hero: 白色主視覺 ── */}
      <div className="relative">
        <Card className="overflow-hidden">
          <div ref={lightHeroRef} className="relative flex flex-col items-center justify-center text-center" style={{ minHeight: 420, background: "linear-gradient(160deg, #FFFFFF 0%, #F0F4FF 40%, #F8FAFC 100%)" }}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute rounded-full" style={{ width: 400, height: 400, top: -100, right: -80, background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)" }} />
              <div className="absolute rounded-full" style={{ width: 300, height: 300, bottom: -60, left: -40, background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)" }} />
              <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            </div>
            <div className="relative z-10 flex flex-col items-center px-6 py-16">
              <KumoLogo size={72} />
              <div className="mt-6 mb-2">
                <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.2, fontFamily: "'Noto Sans JP', sans-serif" }}>KUMO</h2>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.25em", marginTop: 4 }}>WORKSPACE</p>
              </div>
              <p style={{ fontSize: "18px", color: "#374151", marginTop: 16, maxWidth: 420, lineHeight: 1.7 }}>
                雲端企業協作管理平台
              </p>
              <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: 8, maxWidth: 480, lineHeight: 1.6 }}>
                整合 人事、專案、財務、打卡、權限於一體的企業級SaaS解決方案
              </p>
            </div>
          </div>
        </Card>
        <button onClick={() => handleDownload(lightHeroRef, "kumo-hero-light-1920x1080.png")} className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer" style={{ background: "rgba(17,24,39,0.08)", backdropFilter: "blur(8px)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(17,24,39,0.1)", color: "#374151", fontSize: "12px", fontWeight: 500 }}>
          <Download style={{ width: 14, height: 14 }} />下載 1920×1080
        </button>
      </div>

      {/* ── 核心數據 ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-5 text-center">
            <p style={{ fontSize: "28px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>{s.value}</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 4 }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* ── 功能亮點 ── */}
      <Card className="p-6">
        <SubTitle>核心功能</SubTitle>
        <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: -8, marginBottom: 16 }}>涵蓋企業日常營運所需的完整功能模組</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="p-4 rounded-lg transition-colors" style={{ background: "#FAFAFA", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "#EFF6FF" }}>
                  <Icon style={{ width: 18, height: 18, color: "#2563EB" } as React.CSSProperties} />
                </div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: 4 }}>{f.title}</p>
                <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 產品截圖展示 ── */}
      <Card className="p-6">
        <SubTitle>產品印象</SubTitle>
        <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: -8, marginBottom: 16 }}>實際應用場景與視覺風格</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { src: "https://images.unsplash.com/photo-1758873268663-5a362616b5a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB0ZWFtJTIwY29sbGFib3JhdGlvbiUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzM3MjUwNTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", label: "團隊協作" },
            { src: "https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGRhc2hib2FyZCUyMGRhdGElMjBhbmFseXRpY3N8ZW58MXx8fHwxNzczODQ4ODgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", label: "數據儀表板" },
            { src: "https://images.unsplash.com/photo-1759752394755-1241472b589d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRlcnByaXNlJTIwZGlnaXRhbCUyMHRyYW5zZm9ybWF0aW9uJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzM4NDg4ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", label: "數位轉型" },
          ].map(img => (
            <div key={img.label} className="relative overflow-hidden rounded-lg" style={{ aspectRatio: "16/10" }}>
              <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
              <span className="absolute bottom-3 left-3" style={{ fontSize: "12px", fontWeight: 600, color: "#FFF" }}>{img.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 客戶見證 ── */}
      <Card className="p-6">
        <SubTitle>客戶見證</SubTitle>
        <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: -8, marginBottom: 16 }}>來自各部門主管的實際使用心得</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map(t => (
            <div key={t.name} className="p-5 rounded-lg" style={{ background: "#FAFAFA", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
              <Sparkles style={{ width: 16, height: 16, color: "#F59E0B", marginBottom: 12 } as React.CSSProperties} />
              <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>「{t.text}」</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#E5E7EB" }}>
                  <User style={{ width: 14, height: 14, color: "#6B7280" } as React.CSSProperties} />
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{t.name}</p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── CTA 區塊 ── */}
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center justify-center text-center px-6 py-12" style={{ background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)" }}>
          <KumoLogo size={48} />
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginTop: 16 }}>準備好提升團隊效率了嗎？</p>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: 6, maxWidth: 380, lineHeight: 1.6 }}>
            立即體驗 KUMO Workspace，讓企業管理化繁為簡
          </p>
          <div className="flex gap-3 mt-6">
            <span className="px-6 py-2.5 rounded-lg" style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 600 }}>免費試用</span>
            <span className="px-6 py-2.5 rounded-lg" style={{ background: "#FFF", color: "#111827", fontSize: "13px", fontWeight: 600, borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>聯繫我們</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function DesignSystem() {
  const [section, setSection] = useState<Section>("colors");

  const filteredNav = NAV;
  const sectionComponents: Record<Section, React.ReactNode> = {
    colors:     <ColorsSection />,
    typography: <TypographySection />,
    components: <ComponentsSection />,
    forms:      <FormsSection />,
    feedback:   <FeedbackSection />,
    layout:     <LayoutSection />,
    showcase:   <ShowcaseSection />,
  };

  return (
    <div className="h-full max-md:h-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 style={{ color: "#111827" }}>Design System</h1>
          <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 700, background: "#F5F3FF", color: "#7C3AED" }}>v3.2</span>
        </div>
        <p style={{ fontSize: "15px", color: "#9CA3AF", marginTop: 2 }}>KUMO Workspace 設計規範與元件庫，僅限管理者檢視</p>
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
            <button key={item.key} onClick={() => setSection(item.key)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg whitespace-nowrap"
              style={{ background: active ? "#111827" : "#FFF", color: active ? "#FFF" : "#6B7280", fontSize: "13px", fontWeight: active ? 600 : 400, borderWidth: active ? 0 : "1px", borderStyle: "solid", borderColor: active ? "transparent" : "#E5E7EB", cursor: "pointer" }}>
              <Icon className="w-3.5 h-3.5" style={{ color: active ? "#FFF" : "#9CA3AF" } as React.CSSProperties} />
              {item.label}
            </button>
          );
        })}
      </DraggableScroll>

      {/* Body */}
      <div className="flex-1 min-h-0 flex gap-5 max-md:flex-col overflow-hidden max-md:overflow-visible">
        {/* Left nav (desktop) */}
        <div className="flex-shrink-0 hidden md:block" style={{ width: 180 }}>
          <Card className="p-2">
            {filteredNav.map(item => {
              const active = section === item.key;
              const Icon = item.Icon;
              return (
                <button key={item.key} onClick={() => setSection(item.key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-lg transition-colors duration-150 text-left"
                  style={{ background: active ? "#111827" : "transparent", color: active ? "#FFF" : "#374151", borderWidth: 0, cursor: "pointer" }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? "#FFF" : "#6B7280" } as React.CSSProperties} />
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
