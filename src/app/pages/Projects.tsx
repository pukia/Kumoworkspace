/* Projects page – task data from shared module */
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, Search, X, Check, AlertTriangle, ChevronRight,
  Pencil, Trash2, FileText, MessageSquare, Target, AlertCircle, CheckCircle,
  Calendar, Users, LayoutGrid, List as ListIcon, Flag, TrendingUp,
  Download, Send, MoreHorizontal, DollarSign, Layers, ExternalLink,
  GitBranch, BookOpen, Bug, Zap, Briefcase, Clock, UserPlus, Milestone,
  ChevronLeft, CircleDot, Link2, Globe, Paperclip,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { DraggableScroll } from "../components/DraggableScroll";
import { StyledSelect } from "../components/StyledSelect";
import { DatePicker } from "../components/DatePicker";
import { exportCSV } from "../components/ExportCSV";
import { SHARED_PROJECTS } from "../data/projects-shared";
import { INIT_TASKS, getProjectTaskStats, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_TYPE_LABELS } from "../data/tasks-shared";
import type { SharedTask, TaskStatus as TStatus, TaskType as TType, TaskPriority as TPriority } from "../data/tasks-shared";
import { buildSprintOptions } from "../data/sprints-shared";
import { useNavigate } from "react-router";

const PAGE_SIZE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────
type ProjectStatus = "planning" | "inProgress" | "onHold" | "completed" | "cancelled";
type Priority      = "high" | "medium" | "low";
type RiskLevel     = "high" | "medium" | "low";

interface Milestone  { id: number; name: string; date: string; completed: boolean }
interface ProjDoc    { id: number; name: string; type: string; uploadDate: string; uploadBy: string }
interface Discussion { id: number; author: string; message: string; date: string }
interface Risk       { id: number; description: string; level: RiskLevel; status: "active" | "monitoring" | "resolved" }

interface Project {
  id: number; name: string; client: string; manager: string; team: string[];
  status: ProjectStatus; progress: number;
  startDate: string; endDate: string; budget: number; spent: number;
  description: string;
  milestones: Milestone[]; documents: ProjDoc[];
  discussions: Discussion[]; risks: Risk[];
}

// ─── External Link (per-task document links) ──────────────────────────────────
type ExtServiceKey = "figma" | "google_doc" | "google_sheet" | "google_slide" | "google_drive" | "notion" | "github" | "gitlab" | "jira" | "confluence" | "miro" | "slack" | "other";

interface TaskExternalLink {
  id: number;
  service: ExtServiceKey;
  title: string;
  url: string;
}

const EXT_SERVICES: Record<ExtServiceKey, { label: string; color: string; bg: string; icon: string }> = {
  figma:        { label: "Figma",         color: "#A259FF", bg: "#F5EDFF", icon: "F" },
  google_doc:   { label: "Google Docs",   color: "#4285F4", bg: "#E8F0FE", icon: "D" },
  google_sheet: { label: "Google Sheets", color: "#0F9D58", bg: "#E6F4EA", icon: "S" },
  google_slide: { label: "Google Slides", color: "#F4B400", bg: "#FEF7E0", icon: "P" },
  google_drive: { label: "Google Drive",  color: "#4285F4", bg: "#E8F0FE", icon: "G" },
  notion:       { label: "Notion",        color: "#111827", bg: "#F3F4F6", icon: "N" },
  github:       { label: "GitHub",        color: "#24292F", bg: "#F3F4F6", icon: "H" },
  gitlab:       { label: "GitLab",        color: "#FC6D26", bg: "#FFF3EB", icon: "L" },
  jira:         { label: "Jira",          color: "#0052CC", bg: "#DEEBFF", icon: "J" },
  confluence:   { label: "Confluence",    color: "#1868DB", bg: "#DEEBFF", icon: "C" },
  miro:         { label: "Miro",          color: "#FFD02F", bg: "#FFFBE6", icon: "M" },
  slack:        { label: "Slack",         color: "#E01E5A", bg: "#FDE8EF", icon: "K" },
  other:        { label: "其他連結",       color: "#6B7280", bg: "#F9FAFB", icon: "?" },
};

// Mock external links data per task
const INIT_TASK_LINKS: Record<string, TaskExternalLink[]> = {
  "TASK-002": [
    { id: 1, service: "figma", title: "首頁 UI 設計稿 v3", url: "https://www.figma.com/file/abc123" },
    { id: 2, service: "google_doc", title: "網站改版需求規格", url: "https://docs.google.com/document/d/xyz" },
  ],
  "TASK-006": [
    { id: 1, service: "github", title: "Bug Issue #482", url: "https://github.com/org/repo/issues/482" },
    { id: 2, service: "slack", title: "#frontend-bugs 討論串", url: "https://slack.com/archives/C0123" },
  ],
  "TASK-008": [
    { id: 1, service: "notion", title: "效能優化筆記", url: "https://notion.so/perf-notes" },
    { id: 2, service: "google_sheet", title: "查詢效能基準數據", url: "https://docs.google.com/spreadsheets/d/abc" },
    { id: 3, service: "github", title: "PR #215 - Index optimization", url: "https://github.com/org/repo/pull/215" },
  ],
  "TASK-011": [
    { id: 1, service: "github", title: "CI/CD Pipeline Config", url: "https://github.com/org/repo/actions" },
    { id: 2, service: "confluence", title: "DevOps 部署流程文件", url: "https://confluence.atlassian.net/wiki/devops" },
  ],
  "TASK-013": [
    { id: 1, service: "jira", title: "JIRA-1024 PDF 匯出問題", url: "https://jira.atlassian.net/browse/JIRA-1024" },
  ],
  "TASK-016": [
    { id: 1, service: "figma", title: "購物車 UI Flow", url: "https://www.figma.com/file/cart-flow" },
    { id: 2, service: "google_doc", title: "購物車 API 規格書", url: "https://docs.google.com/document/d/cart-api" },
    { id: 3, service: "miro", title: "系統架構白板", url: "https://miro.com/board/abc" },
  ],
  "TASK-020": [
    { id: 1, service: "figma", title: "App 原型 - Phase 1", url: "https://www.figma.com/file/app-proto" },
    { id: 2, service: "google_slide", title: "設計提案簡報", url: "https://docs.google.com/presentation/d/app" },
  ],
  "TASK-022": [
    { id: 1, service: "google_sheet", title: "設備清單與規格", url: "https://docs.google.com/spreadsheets/d/hw" },
    { id: 2, service: "google_drive", title: "RFID 技術文件資料夾", url: "https://drive.google.com/drive/folders/rfid" },
  ],
};

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<ProjectStatus, { label: string; bg: string; color: string; dot: string }> = {
  planning:   { label: "規劃中", bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
  inProgress: { label: "進行中", bg: "#F0FDF4", color: "#15803D", dot: "#16A34A" },
  onHold:     { label: "暫停",   bg: "#FEF9C3", color: "#A16207", dot: "#CA8A04" },
  completed:  { label: "已完成", bg: "#F3F4F6", color: "#374151", dot: "#6B7280" },
  cancelled:  { label: "已取消", bg: "#FEF2F2", color: "#DC2626", dot: "#DC2626" },
};

const RISK_CFG: Record<RiskLevel, { label: string; color: string; bg: string; border: string }> = {
  high:   { label: "高", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  medium: { label: "中", color: "#A16207", bg: "#FEF9C3", border: "#FDE68A" },
  low:    { label: "低", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
};
const PRIORITY_CFG: Record<Priority, { label: string; color: string; bg: string }> = {
  high:   { label: "高", color: "#DC2626", bg: "#FEF2F2" },
  medium: { label: "中", color: "#CA8A04", bg: "#FEF9C3" },
  low:    { label: "低", color: "#6B7280", bg: "#F9FAFB" },
};

// ─── Initial Data ────────────────────────────��───────────────────────────────
const INITIAL_PROJECTS: Project[] = [
  {
    id: 1, name: "電商平台改版專案", client: "ABC 電商公司", manager: "張三",
    team: ["李四", "王五", "趙六", "陳十三"], status: "inProgress", progress: 65,
    startDate: "2026-01-15", endDate: "2026-04-30", budget: 850000, spent: 520000,
    description: "重新設計使用者介面，優化購物流程與會員系統，提升整體轉換率與用戶體驗。",
    milestones: [
      { id: 1, name: "需求分析完成",  date: "2026-01-30", completed: true },
      { id: 2, name: "UI/UX 設計完成", date: "2026-02-28", completed: true },
      { id: 3, name: "前端開發完成",  date: "2026-03-31", completed: false },
      { id: 4, name: "系統測試完成",  date: "2026-04-20", completed: false },
      { id: 5, name: "正式上線",      date: "2026-04-30", completed: false },
    ],
    documents: [
      { id: 1, name: "需求規格書.pdf",    type: "PDF",   uploadDate: "2026-01-20", uploadBy: "張三" },
      { id: 2, name: "UI設計稿.fig",      type: "Figma", uploadDate: "2026-02-15", uploadBy: "李四" },
      { id: 3, name: "技術架構文件.docx", type: "Word",  uploadDate: "2026-02-20", uploadBy: "王五" },
    ],
    discussions: [
      { id: 1, author: "張三", message: "請大家注意本週五的進度會議，務必出席。",     date: "2026-03-05" },
      { id: 2, author: "李四", message: "首頁設計已完成，請查看 Figma 最新版本。",   date: "2026-03-06" },
      { id: 3, author: "王五", message: "購物車整合遇到第三方 API 問題，需要討論。", date: "2026-03-07" },
    ],
    risks: [
      { id: 1, description: "第三方支付 API 整合延遲", level: "medium", status: "active" },
      { id: 2, description: "預算可能超支",            level: "low",    status: "monitoring" },
    ],
  },
  {
    id: 2, name: "企業內部 ERP 系統", client: "XYZ 製造公司", manager: "李四",
    team: ["張三", "孫八", "周九"], status: "inProgress", progress: 40,
    startDate: "2026-02-01", endDate: "2026-06-30", budget: 1200000, spent: 380000,
    description: "建置完整的企業資源規劃系統，整合財務、人事、庫存等模組，支援多廠區操作。",
    milestones: [
      { id: 1, name: "系統分析",    date: "2026-02-20", completed: true },
      { id: 2, name: "資料庫設計",  date: "2026-03-15", completed: true },
      { id: 3, name: "核心模組開發", date: "2026-05-01", completed: false },
      { id: 4, name: "系統整合測試", date: "2026-06-15", completed: false },
    ],

    documents: [
      { id: 1, name: "系統分析報告.pdf", type: "PDF", uploadDate: "2026-02-10", uploadBy: "李四" },
      { id: 2, name: "資料庫 ER 圖.pdf", type: "PDF", uploadDate: "2026-03-10", uploadBy: "張三" },
    ],
    discussions: [
      { id: 1, author: "李四", message: "財務模組需求已確認，可以開始開發。", date: "2026-03-01" },
      { id: 2, author: "孫八", message: "人事模組需要與客戶再次確認薪資計算規則。", date: "2026-03-08" },
    ],
    risks: [
      { id: 1, description: "客戶需求變更頻繁", level: "high", status: "active" },
    ],
  },
  {
    id: 3, name: "行動 App 開發", client: "DEF 連鎖餐飲", manager: "王五",
    team: ["錢七", "吳十"], status: "planning", progress: 15,
    startDate: "2026-03-01", endDate: "2026-07-31", budget: 650000, spent: 95000,
    description: "開發 iOS 與 Android 點餐 App，整合會員積點、優惠推播與後台管理功能。",
    milestones: [
      { id: 1, name: "產品規劃", date: "2026-03-15", completed: true },
      { id: 2, name: "原型設計", date: "2026-04-01", completed: false },
      { id: 3, name: "開發階段一", date: "2026-05-31", completed: false },
      { id: 4, name: "Beta 測試", date: "2026-07-01", completed: false },
    ],

    documents: [], discussions: [], risks: [],
  },
  {
    id: 4, name: "官網 SEO 優化專案", client: "GHI 科技公司", manager: "趙六",
    team: ["李四", "鄭十一"], status: "completed", progress: 100,
    startDate: "2025-11-01", endDate: "2026-02-28", budget: 280000, spent: 265000,
    description: "全面優化網站技術架構與內容策略，成功將主要關鍵字排名提升至首頁。",
    milestones: [
      { id: 1, name: "網站分析", date: "2025-11-15", completed: true },
      { id: 2, name: "內容優化", date: "2025-12-31", completed: true },
      { id: 3, name: "技術優化", date: "2026-02-15", completed: true },
      { id: 4, name: "成效驗收", date: "2026-02-28", completed: true },
    ],
    documents: [], discussions: [], risks: [],
  },
  {
    id: 5, name: "智慧倉儲管理系統", client: "JKL 物流公司", manager: "孫八",
    team: ["張三", "王五", "周九", "吳十", "馮十二"], status: "inProgress", progress: 75,
    startDate: "2025-12-15", endDate: "2026-04-15", budget: 950000, spent: 820000,
    description: "開發智慧倉儲管理系統，整合 RFID 感測器、自動化設備與 WMS 核心功能。",
    milestones: [
      { id: 1, name: "需求確認", date: "2026-01-05", completed: true },
      { id: 2, name: "系統開發", date: "2026-03-15", completed: true },
      { id: 3, name: "設備整合", date: "2026-04-01", completed: false },
      { id: 4, name: "上線驗收", date: "2026-04-15", completed: false },
    ],

    documents: [
      { id: 1, name: "硬體規格書.pdf",  type: "PDF",  uploadDate: "2026-01-10", uploadBy: "孫八" },
      { id: 2, name: "系統架構圖.pptx", type: "PPT",  uploadDate: "2026-02-01", uploadBy: "張三" },
    ],
    discussions: [
      { id: 1, author: "孫八",   message: "RFID 設備已到貨，可以開始整合測試。", date: "2026-03-05" },
      { id: 2, author: "馮十二", message: "客戶要求加入即時庫存盤點功能。",      date: "2026-03-09" },
    ],
    risks: [
      { id: 1, description: "預算已接近上限，追加預算審核中", level: "high",   status: "active" },
      { id: 2, description: "硬體設備交期延遲2週",            level: "medium", status: "monitoring" },
    ],
  },
  {
    id: 6, name: "品牌形象網站建置", client: "MNO 設計公司", manager: "錢七",
    team: ["李四"], status: "onHold", progress: 30,
    startDate: "2026-02-15", endDate: "2026-05-31", budget: 320000, spent: 110000,
    description: "設計與建置全新的品牌形象官網，強調視覺識別與互動體驗。",
    milestones: [
      { id: 1, name: "品牌定位", date: "2026-03-01", completed: true },
      { id: 2, name: "視覺設計", date: "2026-03-31", completed: false },
      { id: 3, name: "前端開發", date: "2026-05-01", completed: false },
    ],
    documents: [], discussions: [],
    risks: [
      { id: 1, description: "客戶已暫停專案，待內部決策", level: "high", status: "active" },
    ],
  },
];

// ─── Historical (Archived) Projects ──────────────────────────────────────────
const HISTORICAL_PROJECTS: Project[] = [
  {
    id: 102, name: "客戶 CRM 系統建置", client: "PQR 金融集團", manager: "張三",
    team: ["王五", "孫八", "陳二"], status: "completed", progress: 100,
    startDate: "2025-08-01", endDate: "2025-12-31", budget: 980000, spent: 920000,
    description: "建置客製化客戶關係管理系統，整合行銷自動化、銷售漏斗管理與客服工單模組。",
    milestones: [
      { id: 1, name: "需求訪談", date: "2025-08-20", completed: true },
      { id: 2, name: "系統架構設計", date: "2025-09-15", completed: true },
      { id: 3, name: "核心模組開發", date: "2025-11-15", completed: true },
      { id: 4, name: "UAT 驗收", date: "2025-12-20", completed: true },
      { id: 5, name: "正式上線", date: "2025-12-31", completed: true },
    ],
    documents: [
      { id: 1, name: "CRM 需求規格書.pdf", type: "PDF", uploadDate: "2025-08-25", uploadBy: "張三" },
      { id: 2, name: "驗收報告.pdf", type: "PDF", uploadDate: "2025-12-31", uploadBy: "張三" },
    ],
    discussions: [
      { id: 1, author: "張三", message: "系統已正式上線，客戶滿意度達 4.8/5。", date: "2025-12-31" },
    ],
    risks: [],
  },
  {
    id: 103, name: "舊版 ERP 資料遷移", client: "STU 製造集團", manager: "吳十",
    team: ["王五", "陳二"], status: "completed", progress: 100,
    startDate: "2025-09-01", endDate: "2026-01-15", budget: 420000, spent: 395000,
    description: "將舊版 Oracle ERP 資料遷移至新系統，包含資料清洗、格式轉換與完整性驗證。",
    milestones: [
      { id: 1, name: "資料盤點", date: "2025-09-20", completed: true },
      { id: 2, name: "遷移工具開發", date: "2025-10-31", completed: true },
      { id: 3, name: "試遷移驗證", date: "2025-12-15", completed: true },
      { id: 4, name: "正式遷移完成", date: "2026-01-15", completed: true },
    ],
    documents: [],
    discussions: [],
    risks: [],
  },
  {
    id: 104, name: "行動支付 SDK 整合", client: "VWX 零售集團", manager: "孫八",
    team: ["王五", "吳十"], status: "cancelled", progress: 35,
    startDate: "2025-10-01", endDate: "2026-03-31", budget: 560000, spent: 198000,
    description: "整合 LINE Pay、街口支付與 Apple Pay SDK 至客戶 POS 系統，因客戶策略調整而取消。",
    milestones: [
      { id: 1, name: "SDK 評估", date: "2025-10-15", completed: true },
      { id: 2, name: "LINE Pay 整合", date: "2025-11-30", completed: true },
      { id: 3, name: "街口支付整合", date: "2026-01-15", completed: false },
      { id: 4, name: "Apple Pay 整合", date: "2026-02-28", completed: false },
    ],
    documents: [
      { id: 1, name: "SDK 評估報告.pdf", type: "PDF", uploadDate: "2025-10-18", uploadBy: "孫八" },
    ],
    discussions: [
      { id: 1, author: "孫八", message: "客戶因內部策略調整決定暫停此專案。", date: "2025-12-10" },
    ],
    risks: [
      { id: 1, description: "客戶方決策層變更導致專案取消", level: "high", status: "resolved" },
    ],
  },
  {
    id: 105, name: "員工入口網站改版", client: "（內部專案）", manager: "趙六",
    team: ["李四", "周九"], status: "completed", progress: 100,
    startDate: "2025-07-01", endDate: "2025-10-31", budget: 180000, spent: 165000,
    description: "重新設計公司內部員工入口網站，新增請假申請、公告佈告欄與線上學習平台。",
    milestones: [
      { id: 1, name: "需求收集", date: "2025-07-15", completed: true },
      { id: 2, name: "設計定稿", date: "2025-08-15", completed: true },
      { id: 3, name: "開發完成", date: "2025-10-15", completed: true },
      { id: 4, name: "上線", date: "2025-10-31", completed: true },
    ],
    documents: [], discussions: [], risks: [],
  },
  {
    id: 106, name: "AI 客服聊天機器人", client: "YZA 電信公司", manager: "錢七",
    team: ["趙六", "鄭十一", "陳十三"], status: "completed", progress: 100,
    startDate: "2025-06-01", endDate: "2025-11-30", budget: 750000, spent: 710000,
    description: "開發基於自然語言處理的智慧客服機器人，整合知識庫自動回覆與真人客服轉接功能，上線後客服效率提升 60%。",
    milestones: [
      { id: 1, name: "NLP 模型選型", date: "2025-06-20", completed: true },
      { id: 2, name: "知識庫建置", date: "2025-08-15", completed: true },
      { id: 3, name: "對話流程開發", date: "2025-10-01", completed: true },
      { id: 4, name: "壓力測試", date: "2025-11-10", completed: true },
      { id: 5, name: "正式上線", date: "2025-11-30", completed: true },
    ],
    documents: [
      { id: 1, name: "NLP 技術評估.pdf", type: "PDF", uploadDate: "2025-06-25", uploadBy: "錢��" },
      { id: 2, name: "上線成效報告.pdf", type: "PDF", uploadDate: "2025-11-30", uploadBy: "錢七" },
    ],
    discussions: [
      { id: 1, author: "錢七", message: "上線首月自動回覆率達 78%，客戶滿意度 4.6/5。", date: "2025-11-28" },
    ],
    risks: [],
  },
  {
    id: 107, name: "跨境電商物流串接", client: "BCD 國際貿易", manager: "馮十二",
    team: ["張三", "孫八"], status: "cancelled", progress: 20,
    startDate: "2025-09-15", endDate: "2026-02-28", budget: 480000, spent: 105000,
    description: "串接 DHL、FedEx 與順豐國際物流 API，實現自動報關與即時追蹤功能，因客戶業務重組而終止。",
    milestones: [
      { id: 1, name: "API 規格調研", date: "2025-10-01", completed: true },
      { id: 2, name: "DHL 串接完成", date: "2025-11-15", completed: false },
      { id: 3, name: "FedEx 串接完成", date: "2025-12-31", completed: false },
      { id: 4, name: "報關自動化", date: "2026-02-15", completed: false },
    ],
    documents: [
      { id: 1, name: "物流 API 規格書.pdf", type: "PDF", uploadDate: "2025-10-05", uploadBy: "馮十二" },
    ],
    discussions: [
      { id: 1, author: "馮十二", message: "客戶因業務重組決定終止合作，已完成結算。", date: "2025-11-20" },
    ],
    risks: [
      { id: 1, description: "客戶組織重整導致專案終止", level: "high", status: "resolved" },
    ],
  },
];

type TopTab = "active" | "history";

const nextId = (arr: { id: number }[]) => Math.max(...arr.map(x => x.id), 0) + 1;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtNT = (n: number) => `NT$${(n / 1000).toFixed(0)}K`;
const fmtM  = (n: number) => `NT$${(n / 1000000).toFixed(2)}M`;
const bp    = (p: Project) => Math.min(Math.round((p.spent / p.budget) * 100), 100);

const hasRisk = (p: Project) =>
  p.spent / p.budget > 0.9 || p.risks.some(r => r.level === "high" && r.status === "active");

const riskLabel = (p: Project) => {
  if (p.spent / p.budget > 0.9) return "預算接近上限";
  if (p.risks.some(r => r.level === "high" && r.status === "active")) return "高風險警示";
  return "";
};

/** Compute project progress from linked tasks (story-point based) */
const computeTaskProgress = (projectId: number) => {
  const stats = getProjectTaskStats(projectId);
  return stats.totalPoints > 0 ? stats.progressPct : null;
};

/** Task status distribution for mini bar */
const getTaskDistribution = (projectId: number) => {
  const tasks = INIT_TASKS.filter(t => t.projectId === projectId);
  if (tasks.length === 0) return null;
  const total = tasks.length;
  const counts: Record<string, number> = { done: 0, review: 0, inProgress: 0, todo: 0, backlog: 0 };
  tasks.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
  return { total, counts };
};

/** Mini task status distribution bar */
const TaskDistBar = ({ projectId }: { projectId: number }) => {
  const dist = getTaskDistribution(projectId);
  if (!dist) return null;
  const colors: Record<string, string> = { done: "#15803D", review: "#7C3AED", inProgress: "#2563EB", todo: "#374151", backlog: "#D1D5DB" };
  const order = ["done", "review", "inProgress", "todo", "backlog"];
  return (
    <div className="flex rounded-full overflow-hidden" style={{ height: 4, background: "#F3F4F6" }}>
      {order.map(s => {
        const pct = (dist.counts[s] / dist.total) * 100;
        return pct > 0 ? <div key={s} style={{ width: `${pct}%`, background: colors[s] }} /> : null;
      })}
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={className} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  const c = STATUS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded" style={{ fontSize: "12px", fontWeight: 500, background: c.bg, color: c.color, whiteSpace: "nowrap" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />{c.label}
    </span>
  );
};

const Avatar = ({ name, size = 24, dark = false }: { name: string; size?: number; dark?: boolean }) => (
  <div className="rounded-full flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, background: dark ? "#374151" : "#F3F4F6", borderWidth: dark ? "2px" : "0", borderStyle: "solid", borderColor: "#FFF" }}
    title={name}>
    <span style={{ fontSize: size * 0.38, fontWeight: 600, color: dark ? "#FFF" : "#374151" }}>{name.charAt(0)}</span>
  </div>
);

const ProgressBar = ({ value, color = "#111827", height = 4 }: { value: number; color?: string; height?: number }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height, background: "#F3F4F6" }}>
    <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
  </div>
);

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111827", borderRadius: "8px", padding: "10px 14px", color: "#FFF", fontSize: "13px", lineHeight: 1.8, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
      <p style={{ fontWeight: 600, marginBottom: "4px" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey}><span style={{ color: p.fill || p.stroke, marginRight: 6 }}>●</span>{p.name}：NT${(p.value / 1000).toFixed(0)}K</p>
      ))}
    </div>
  );
};

type DetailTab = "overview" | "tasks" | "milestones" | "documents" | "discussions" | "risks";
const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: "overview",     label: "總覽" },
  { key: "tasks",        label: "任務" },
  { key: "milestones",   label: "里程碑" },
  { key: "documents",    label: "文件" },
  { key: "discussions",  label: "討論" },
  { key: "risks",        label: "風險" },
];

const KNOWN_MEMBERS = ["張三","李四","王五","趙六","錢七","孫八","周九","吳十","鄭十一","馮十二","陳十三"];
const PRIORITY_OPTIONS: { key: Priority; label: string }[] = [
  { key: "high", label: "高優先" }, { key: "medium", label: "中優先" }, { key: "low", label: "低優先" },
];

const emptyForm = () => ({
  name: "", client: "", manager: "", status: "planning" as ProjectStatus,
  priority: "medium" as Priority,
  startDate: "", endDate: "", budget: 0, description: "", team: [] as string[],
  milestones: [] as { name: string; date: string }[],
  sprint: "" as string,
});



// ─── Main Component ─────────────────────────────────────────────────────────
// ─── Task type icon helper ────────────────────────────────────────────────────
const TaskTypeIcon = ({ type, size = 16 }: { type: TType; size?: number }) => {
  const cfg = TASK_TYPE_LABELS[type];
  const icons: Record<TType, any> = { task: BookOpen, story: Flag, bug: Bug, improvement: Zap };
  const Icon = icons[type];
  return <Icon style={{ width: size, height: size, color: cfg.color }} />;
};

export function Projects() {
  const { permissions } = useAuth();
  const canEdit = permissions.canEditProject;
  const navigate = useNavigate();
  const [projects, setProjects]           = useState<Project[]>(INITIAL_PROJECTS);
  const [topTab, setTopTab]               = useState<TopTab>("active");
  const [searchTerm, setSearchTerm]       = useState("");
  const [filterStatus, setFilterStatus]   = useState<"all" | ProjectStatus>("all");
  const [viewMode, setViewMode]           = useState<"card" | "list">("card");
  const [projPage, setProjPage]           = useState(1);
  const [historyProjects]                 = useState<Project[]>(HISTORICAL_PROJECTS);
  const [historySearch, setHistorySearch]  = useState("");
  const [historyPage, setHistoryPage]     = useState(1);

  // Detail panel
  const [selectedId, setSelectedId]       = useState<number | null>(null);
  const [detailTab, setDetailTab]         = useState<DetailTab>("overview");
  const [newMsg, setNewMsg]               = useState("");

  // Form
  const [isFormOpen, setIsFormOpen]       = useState(false);
  const [editingId, setEditingId]         = useState<number | null>(null);
  const [form, setForm]                   = useState(emptyForm());
  const [formErrors, setFormErrors]       = useState<Record<string, string>>({});
  const [formStep, setFormStep]           = useState(0);
  const [teamInput, setTeamInput]         = useState("");
  const [showMemberList, setShowMemberList] = useState(false);

  // External links per task
  const [taskLinks, setTaskLinks] = useState<Record<string, TaskExternalLink[]>>(INIT_TASK_LINKS);
  const [linkPopup, setLinkPopup] = useState<{ taskId: string; mode: "list" | "add" } | null>(null);
  const [newLink, setNewLink] = useState<{ service: ExtServiceKey; title: string; url: string }>({ service: "figma", title: "", url: "" });
  const linkPopupRef = useRef<HTMLDivElement>(null);

  // Close link popup on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (linkPopupRef.current && !linkPopupRef.current.contains(e.target as Node)) setLinkPopup(null);
    };
    if (linkPopup) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [linkPopup]);

  const addTaskLink = () => {
    if (!linkPopup || !newLink.title.trim() || !newLink.url.trim()) return;
    const tid = linkPopup.taskId;
    const existing = taskLinks[tid] || [];
    const id = existing.length > 0 ? Math.max(...existing.map(l => l.id)) + 1 : 1;
    setTaskLinks(prev => ({ ...prev, [tid]: [...(prev[tid] || []), { id, service: newLink.service, title: newLink.title.trim(), url: newLink.url.trim() }] }));
    setNewLink({ service: "figma", title: "", url: "" });
    setLinkPopup({ taskId: tid, mode: "list" });
    showToast("外部連結已新增");
  };
  const removeTaskLink = (taskId: string, linkId: number) => {
    setTaskLinks(prev => ({ ...prev, [taskId]: (prev[taskId] || []).filter(l => l.id !== linkId) }));
    showToast("連結已移除", false);
  };

  // Delete
  const [deleteId, setDeleteId]           = useState<number | null>(null);

  // Toast
  const [toast, setToast]                 = useState<{ msg: string; ok: boolean } | null>(null);

  // ─── Derived ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => projects.filter(p => {
    const s = searchTerm.toLowerCase();
    const matchS = p.name.toLowerCase().includes(s) || p.client.toLowerCase().includes(s) || p.manager.includes(s);
    const matchF = filterStatus === "all" || p.status === filterStatus;
    return matchS && matchF;
  }), [projects, searchTerm, filterStatus]);

  const selected      = useMemo(() => [...projects, ...historyProjects].find(p => p.id === selectedId) ?? null, [projects, historyProjects, selectedId]);

  const filteredHistory = useMemo(() => historyProjects.filter(p => {
    const s = historySearch.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.client.toLowerCase().includes(s) || p.manager.includes(s);
  }), [historyProjects, historySearch]);
  const pagedHistory = useMemo(() => filteredHistory.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE), [filteredHistory, historyPage]);
  const pagedProjects = useMemo(() => filtered.slice((projPage - 1) * PAGE_SIZE, projPage * PAGE_SIZE), [filtered, projPage]);

  const stats = useMemo(() => ({
    total:      projects.length,
    inProgress: projects.filter(p => p.status === "inProgress").length,
    planning:   projects.filter(p => p.status === "planning").length,
    completed:  projects.filter(p => p.status === "completed").length,
    onHold:     projects.filter(p => p.status === "onHold").length,
    totalBudget: projects.reduce((s, p) => s + p.budget, 0),
    totalSpent:  projects.reduce((s, p) => s + p.spent, 0),
    atRisk:     projects.filter(p => hasRisk(p) && p.status !== "completed").length,
  }), [projects]);

  const chartData = useMemo(() => projects.map(p => ({
    name: p.name.length > 7 ? p.name.slice(0, 7) + "…" : p.name,
    預算: p.budget, 已用: p.spent,
  })), [projects]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const openAdd = () => {
    if (!canEdit) return;
    setEditingId(null); setForm(emptyForm()); setFormErrors({}); setFormStep(0); setTeamInput(""); setShowMemberList(false); setIsFormOpen(true);
  };
  const openEdit = (p: Project) => {
    if (!canEdit) return;
    setEditingId(p.id);
    setForm({ name: p.name, client: p.client, manager: p.manager, status: p.status, priority: "medium" as Priority, startDate: p.startDate, endDate: p.endDate, budget: p.budget, description: p.description, team: [...p.team], milestones: p.milestones.map(m => ({ name: m.name, date: m.date })), sprint: "" });
    setFormErrors({}); setFormStep(0); setTeamInput(""); setShowMemberList(false); setIsFormOpen(true);
  };
  const setF = <K extends keyof ReturnType<typeof emptyForm>>(k: K, v: any) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setFormErrors(e => { const { [k]: _, ...r } = e; return r; });
  };
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim())    errs.name    = "請輸入專案名稱";
    if (!form.client.trim())  errs.client  = "請輸入客戶名稱";
    if (!form.manager.trim()) errs.manager = "請輸入負責人";
    if (!form.startDate)      errs.startDate = "請選擇開始日期";
    if (!form.endDate)        errs.endDate   = "請選擇結束日期";
    if (!form.budget || form.budget <= 0) errs.budget = "請輸入有效預算";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const submitForm = () => {
    if (!validate()) return;
    const teamArr = form.team;
    const msArr: Milestone[] = form.milestones.filter(m => m.name.trim()).map((m, i) => ({ id: i + 1, name: m.name.trim(), date: m.date, completed: false }));
    if (editingId != null) {
      setProjects(prev => prev.map(p => p.id === editingId ? { ...p, name: form.name, client: form.client, manager: form.manager, status: form.status, startDate: form.startDate, endDate: form.endDate, budget: form.budget, description: form.description, team: teamArr, milestones: msArr.length > 0 ? msArr : p.milestones } : p));
      showToast("專案已更新");
      if (selectedId === editingId) setSelectedId(editingId);
    } else {
      const np: Project = {
        id: nextId(projects), name: form.name, client: form.client, manager: form.manager,
        team: teamArr, status: form.status, progress: 0, startDate: form.startDate,
        endDate: form.endDate, budget: form.budget, spent: 0, description: form.description,
        milestones: msArr, documents: [], discussions: [], risks: [],
      };
      setProjects(prev => [np, ...prev]);
      showToast("專案已建立");
    }
    setIsFormOpen(false);
  };
  const confirmDelete = () => {
    if (deleteId == null) return;
    setProjects(prev => prev.filter(p => p.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
    showToast("專案已刪除", false);
  };
  const toggleMilestone = (msId: number) => {
    if (!selectedId) return;
    setProjects(prev => prev.map(p => p.id === selectedId
      ? { ...p, milestones: p.milestones.map(m => m.id === msId ? { ...m, completed: !m.completed } : m) }
      : p));
  };
  // Task data comes from shared module
  const getLinkedTasks = (projId: number) => INIT_TASKS.filter(t => t.projectId === projId);
  const sprintOptions = useMemo(() => buildSprintOptions(INIT_TASKS), []);
  const sendMessage = () => {
    if (!selectedId || !newMsg.trim()) return;
    setProjects(prev => prev.map(p => p.id === selectedId
      ? { ...p, discussions: [...p.discussions, { id: nextId(p.discussions), author: p.manager, message: newMsg.trim(), date: "2026-03-10" }] }
      : p));
    setNewMsg(""); showToast("留言已送出");
  };
  const updateStatus = (id: number, status: ProjectStatus) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    showToast(`狀態已更新為：${STATUS_CFG[status].label}`);
  };

  // ─── Style helpers ────────────────────────────────────────────────────────
  const iStyle = (err?: string): React.CSSProperties => ({
    width: "100%", padding: "8px 12px", fontSize: "14px", background: "#F9FAFB",
    borderWidth: "1px", borderStyle: "solid", borderColor: err ? "#DC2626" : "#E5E7EB",
    borderRadius: "6px", color: "#111827", outline: "none", fontFamily: "inherit",
  });
  const lStyle: React.CSSProperties = { display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "5px" };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: toast.ok ? "#111827" : "#DC2626", color: "#FFF", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontSize: "13px", fontWeight: 500 }}>
          {toast.ok ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 max-md:flex-col max-md:items-stretch">
        <div>
          <h1 style={{ color: "#111827" }}>專案管理</h1>
          <p style={{ fontSize: "15px", color: "#9CA3AF", marginTop: 2 }}>追蹤與管理所有客戶專案的進度、預算與資源</p>
        </div>
        <div className="flex gap-2 max-md:w-full">
          <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:flex-1"
            style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "13px", color: "#374151" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
            onClick={() => exportCSV("專案報表.csv", [
              { header: "專案名稱", accessor: (p: any) => p.name },
              { header: "客戶", accessor: (p: any) => p.client },
              { header: "負責人", accessor: (p: any) => p.manager },
              { header: "狀態", accessor: (p: any) => STATUS_CFG[p.status as ProjectStatus]?.label ?? p.status },
              { header: "進度(%)", accessor: (p: any) => p.progress },
              { header: "開始日期", accessor: (p: any) => p.startDate },
              { header: "結束日期", accessor: (p: any) => p.endDate },
              { header: "預算", accessor: (p: any) => p.budget },
              { header: "已花費", accessor: (p: any) => p.spent },
              { header: "團隊成員", accessor: (p: any) => p.team?.join("、") ?? "" },
            ], filtered)}>
            <Download className="w-3.5 h-3.5" />匯出報表
          </button>
          {canEdit && (
            <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:flex-1"
              style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 500 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}
              onClick={openAdd}>
              <Plus className="w-3.5 h-3.5" />新增專案
            </button>
          )}
        </div>
      </div>

      {/* ── Top Tabs ─────────────────────────────────────────────────────── */}
      <DraggableScroll className="p-1 rounded-xl" style={{ background: "#F3F4F6" }} innerClassName="flex items-center gap-1"
        mobileDropdown={{
          options: [
            { key: "active", label: `進行中專案 (${projects.length})` },
            { key: "history", label: `歷史專案 (${historyProjects.length})` },
          ],
          activeKey: topTab,
          onSelect: (k) => setTopTab(k as TopTab),
        }}>
        {([
          { key: "active" as TopTab, label: "進行中專案", count: projects.length },
          { key: "history" as TopTab, label: "歷史專案", count: historyProjects.length },
        ]).map(t => (
          <button key={t.key} onClick={() => { setTopTab(t.key); setProjPage(1); setHistoryPage(1); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
            style={{ fontSize: "13px", fontWeight: topTab === t.key ? 600 : 500, background: topTab === t.key ? "#111827" : "transparent", color: topTab === t.key ? "#FFF" : "#6B7280", boxShadow: topTab === t.key ? "0 1px 4px rgba(0,0,0,0.15)" : "none" }}>
            {t.label}
            <span className="px-1.5 py-0.5 rounded-full tabular-nums" style={{ fontSize: "11px", fontWeight: 700, background: topTab === t.key ? "rgba(255,255,255,0.2)" : "#E5E7EB", color: topTab === t.key ? "#FFF" : "#374151", lineHeight: 1 }}>
              {t.count}
            </span>
          </button>
        ))}
      </DraggableScroll>

      {topTab === "active" && (<>
      {/* ── Stats Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "進行中專案", value: `${stats.inProgress}`,          sub: `共 ${stats.total} 個`,        icon: TrendingUp, color: "#16A34A", bg: "#F0FDF4" },
          { label: "規劃中",    value: `${stats.planning}`,             sub: `暫停 ${stats.onHold} 個`,     icon: Layers,     color: "#3B82F6", bg: "#EFF6FF" },
          { label: "風險專案",  value: `${stats.atRisk}`,              sub: "需要關注",                    icon: AlertTriangle, color: "#CA8A04", bg: "#FEF9C3" },
          { label: "總預算",    value: fmtM(stats.totalBudget),         sub: `已用 ${fmtM(stats.totalSpent)}`, icon: DollarSign, color: "#374151", bg: "#F9FAFB" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.04em" }}>{item.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                </div>
              </div>
              <p className="tabular-nums" style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>{item.value}</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 4 }}>{item.sub}</p>
            </Card>
          );
        })}
      </div>

      {/* ── Budget Chart ────────────────────────────────────────────────── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>各專案預算執行狀況</h3>
            <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "2px" }}>總預算 vs 已使用金額對比</p>
          </div>
          <div className="flex items-center gap-4">
            {[{ color: "#E5E7EB", label: "預算" }, { color: "#111827", label: "花用" }].map(i => (
              <span key={i.label} className="flex items-center gap-1.5" style={{ fontSize: "13px", color: "#6B7280" }}>
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: i.color }} />{i.label}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barGap={4} barCategoryGap="25%">
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis key="xaxis" dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis key="yaxis" stroke="#9CA3AF" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={42} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip key="tooltip" content={<ChartTip />} cursor={{ fill: "#F9FAFB" }} />
            <Bar key="bar-budget" dataKey="預算" fill="#E5E7EB" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar key="bar-spent"  dataKey="已用" fill="#111827" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Filter bar + View toggle ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1" style={{ minWidth: 180 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
          <input type="text" placeholder="搜尋專案名稱、客戶、負責人..."
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setProjPage(1); }}
            className="w-full pl-9 pr-3 py-2 rounded outline-none"
            style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#111827", fontFamily: "inherit" }} />
        </div>
        <StyledSelect
          value={filterStatus}
          onChange={v => { setFilterStatus(v as any); setProjPage(1); }}
          allLabel="全部狀態"
          options={Object.entries(STATUS_CFG).map(([k, v]) => ({ key: k, label: v.label }))}
          className="max-md:w-full"
        />
        <div className="flex items-center ml-auto">
          <span style={{ fontSize: "13px", color: "#9CA3AF", marginRight: "8px" }}>{filtered.length} 個專案</span>
          <div className="flex rounded overflow-hidden" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
            {[{ mode: "card", Icon: LayoutGrid }, { mode: "list", Icon: ListIcon }].map(({ mode, Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode as any)}
                className="w-8 h-8 flex items-center justify-center"
                style={{ background: viewMode === mode ? "#111827" : "#FFF", color: viewMode === mode ? "#FFF" : "#9CA3AF" }}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Project Grid / List ──────────────────────────────────────── */}
      {viewMode === "card" ? (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pagedProjects.map(p => {
            const sc  = STATUS_CFG[p.status];
            const pct = bp(p);
            const nextMs = p.milestones.find(m => !m.completed);
            const risk = hasRisk(p);
            return (
              <div key={p.id} className="flex flex-col" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                {/* Card header */}
                <div className="px-5 py-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="truncate" style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>{p.name}</h3>
                        {risk && <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#CA8A04" }} />}
                      </div>
                      <p style={{ fontSize: "13px", color: "#9CA3AF" }}>{p.client}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <StatusBadge status={p.status} />
                      <div className="relative group">
                        <button className="w-7 h-7 rounded flex items-center justify-center"
                          style={{ color: "#9CA3AF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute right-0 top-8 z-20 hidden group-hover:block"
                          style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", width: "140px", padding: "4px" }}>
                          {[
                            { label: "查看詳情", icon: FileText, action: () => { setSelectedId(p.id); setDetailTab("overview"); } },
                            ...(canEdit ? [
                              { label: "編輯專案", icon: Pencil,   action: () => openEdit(p) },
                              { label: "刪除專案", icon: Trash2,   action: () => setDeleteId(p.id), red: true },
                            ] : []),
                          ].map(item => {
                            const Icon = item.icon;
                            return (
                              <button key={item.label} onClick={item.action}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded text-left"
                                style={{ fontSize: "13px", color: item.red ? "#DC2626" : "#374151" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                                <Icon className="w-3.5 h-3.5" />{item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  {risk && (
                    <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded"
                      style={{ background: "#FFFBEB", borderWidth: "1px", borderStyle: "solid", borderColor: "#FDE68A" }}>
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D97706" }} />
                      <p style={{ fontSize: "13px", color: "#92400E" }}>{riskLabel(p)}</p>
                    </div>
                  )}
                </div>
                {/* Card body */}
                <div className="px-5 py-4 space-y-3">
                  <p className="line-clamp-2" style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6 }}>{p.description}</p>
                  {nextMs && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                      <Target className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#9CA3AF" }} />
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: "11px", color: "#9CA3AF" }}>下一個里程碑</p>
                        <p className="truncate" style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{nextMs.name}</p>
                      </div>
                      <span style={{ fontSize: "12px", color: "#9CA3AF", whiteSpace: "nowrap" }}>{nextMs.date}</span>
                    </div>
                  )}
                  {/* Progress – computed from tasks when available */}
                  {(() => {
                    const taskProg = computeTaskProgress(p.id);
                    const displayProg = taskProg !== null ? taskProg : p.progress;
                    const taskStats = getProjectTaskStats(p.id);
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                            {taskProg !== null ? "任務進度" : "專案進度"}
                          </span>
                          <div className="flex items-center gap-2">
                            {taskProg !== null && (
                              <span className="tabular-nums" style={{ fontSize: "11px", color: "#9CA3AF" }}>
                                {taskStats.donePoints}/{taskStats.totalPoints} pts
                              </span>
                            )}
                            <span className="tabular-nums" style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{displayProg}%</span>
                          </div>
                        </div>
                        {taskProg !== null ? (
                          <TaskDistBar projectId={p.id} />
                        ) : (
                          <ProgressBar value={displayProg} color={p.status === "completed" ? "#6B7280" : "#111827"} />
                        )}
                      </div>
                    );
                  })()}
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                    <div className="space-y-2">
                      <div>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>專案經理</p>
                        <div className="flex items-center gap-1.5">
                          <Avatar name={p.manager} size={18} dark />
                          <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>{p.manager}</span>
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "#9CA3AF" }}>期間</p>
                        <p className="tabular-nums" style={{ fontSize: "12px", color: "#374151" }}>{p.startDate} ～</p>
                        <p className="tabular-nums" style={{ fontSize: "12px", color: "#374151" }}>{p.endDate}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "3px" }}>預算執行 {pct}%</p>
                        <ProgressBar value={pct} color={pct > 90 ? "#DC2626" : pct > 75 ? "#CA8A04" : "#6B7280"} height={3} />
                        <p className="tabular-nums mt-1" style={{ fontSize: "11px", color: pct > 90 ? "#DC2626" : "#9CA3AF" }}>
                          {fmtNT(p.spent)} / {fmtNT(p.budget)}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "4px" }}>團隊</p>
                        <div className="flex -space-x-1.5">
                          {p.team.slice(0, 5).map((m, i) => <Avatar key={i} name={m} size={22} dark />)}
                          {p.team.length > 5 && (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#F3F4F6", borderWidth: "2px", borderStyle: "solid", borderColor: "#FFF" }}>
                              <span style={{ fontSize: "8px", color: "#6B7280" }}>+{p.team.length - 5}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Card footer */}
                <div className="mt-auto px-5 py-3 flex items-center justify-between" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", background: "#FAFAFA" }}>
                  {(() => {
                    const ts = getProjectTaskStats(p.id);
                    return (
                      <div className="flex items-center gap-2">
                        {ts.total > 0 ? (
                          <>
                            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{ts.total} 項任務</span>
                            <span className="flex items-center gap-1">
                              {ts.done > 0 && <span style={{ fontSize: "11px", color: "#15803D", fontWeight: 600 }}>✓{ts.done}</span>}
                              {ts.inProgress > 0 && <span style={{ fontSize: "11px", color: "#2563EB", fontWeight: 600 }}>▶{ts.inProgress}</span>}
                              {ts.review > 0 && <span style={{ fontSize: "11px", color: "#7C3AED", fontWeight: 600 }}>◎{ts.review}</span>}
                            </span>
                            <span style={{ fontSize: "12px", color: "#D1D5DB" }}>·</span>
                          </>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>0 項任務 ·</span>
                        )}
                        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{p.milestones.filter(m => m.completed).length}/{p.milestones.length} 里程碑</span>
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-2">
                    {getLinkedTasks(p.id).length > 0 && (
                      <button className="flex items-center gap-1 px-2.5 py-1.5 rounded"
                        style={{ fontSize: "12px", color: "#2563EB", background: "#EFF6FF", borderWidth: "1px", borderStyle: "solid", borderColor: "#BFDBFE" }}
                        onClick={() => navigate(`/tasks?project=${p.id}`)}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#DBEAFE"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; }}>
                        <GitBranch className="w-3 h-3" />看板
                      </button>
                    )}
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded"
                      style={{ fontSize: "13px", color: "#374151", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                      onClick={() => { setSelectedId(p.id); setDetailTab("overview"); }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#FFF"; }}>
                      查看詳情<ChevronRight className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <Pagination total={filtered.length} page={projPage} pageSize={PAGE_SIZE} onChange={(p) => setProjPage(p)} />
        </div>
        </>
      ) : (
        // ── List View ────────────────────────────────────────────────────────
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full hidden md:table">
              <thead>
                <tr style={{ background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                  {["專案名稱", "客戶", "負責人", "狀態", "任務進度", "預算執行", "截止日期", "操作"].map((h, i) => (
                    <th key={h} className="px-5 py-2.5 text-left" style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedProjects.map((p, idx) => {
                  const pct = bp(p);
                  return (
                    <tr key={p.id}
                      style={{ borderBottomWidth: idx < pagedProjects.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F9FAFB" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {hasRisk(p) && <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#CA8A04" }} />}
                          <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{p.name}</p>
                        </div>
                        <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{p.client}</p>
                      </td>
                      <td className="px-5 py-3.5" style={{ fontSize: "13px", color: "#6B7280" }}>{p.client}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Avatar name={p.manager} size={20} dark />
                          <span style={{ fontSize: "13px", color: "#374151" }}>{p.manager}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3.5" style={{ minWidth: "120px" }}>
                        {(() => {
                          const taskProg = computeTaskProgress(p.id);
                          const ts = getProjectTaskStats(p.id);
                          const displayProg = taskProg !== null ? taskProg : p.progress;
                          return (
                            <div>
                              <div className="flex items-center gap-2">
                                {taskProg !== null ? <TaskDistBar projectId={p.id} /> : <ProgressBar value={displayProg} />}
                                <span className="tabular-nums" style={{ fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>{displayProg}%</span>
                              </div>
                              {ts.total > 0 && (
                                <p className="tabular-nums mt-0.5" style={{ fontSize: "11px", color: "#9CA3AF" }}>{ts.done}/{ts.total} 任務 · {ts.donePoints} pts</p>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-3.5" style={{ minWidth: "90px" }}>
                        <ProgressBar value={pct} color={pct > 90 ? "#DC2626" : pct > 75 ? "#CA8A04" : "#6B7280"} height={3} />
                        <p className="tabular-nums mt-1" style={{ fontSize: "11px", color: "#9CA3AF" }}>{pct}%</p>
                      </td>
                      <td className="px-5 py-3.5 tabular-nums" style={{ fontSize: "13px", color: "#6B7280", whiteSpace: "nowrap" }}>{p.endDate}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button className="w-8 h-8 rounded flex items-center justify-center" title="查看"
                            style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                            onClick={() => { setSelectedId(p.id); setDetailTab("overview"); }}>
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <>
                              <button className="w-8 h-8 rounded flex items-center justify-center" title="編輯"
                                style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                                onClick={() => openEdit(p)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button className="w-8 h-8 rounded flex items-center justify-center" title="刪除"
                                style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                                onClick={() => setDeleteId(p.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden">
              {pagedProjects.map((p, idx) => {
                const pct = bp(p);
                return (
                  <div key={p.id} className="px-4 py-3" style={{ borderBottomWidth: idx < pagedProjects.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {hasRisk(p) && <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#CA8A04" }} />}
                          <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{p.name}</span>
                        </div>
                        <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 1 }}>{p.client}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={p.manager} size={20} dark />
                        <span style={{ fontSize: "12px", color: "#374151" }}>{p.manager}</span>
                      </div>
                      <span className="tabular-nums" style={{ fontSize: "12px", color: "#6B7280" }}>截止 {p.endDate}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2 flex-1">
                        {(() => {
                          const tp = computeTaskProgress(p.id);
                          const dp = tp !== null ? tp : p.progress;
                          return (<>
                            <span style={{ fontSize: "11px", color: "#9CA3AF", flexShrink: 0 }}>{tp !== null ? "任務" : "進度"}</span>
                            {tp !== null ? <TaskDistBar projectId={p.id} /> : <ProgressBar value={dp} />}
                            <span className="tabular-nums" style={{ fontSize: "12px", color: "#374151" }}>{dp}%</span>
                          </>);
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span style={{ fontSize: "11px", color: "#9CA3AF", flexShrink: 0 }}>預算</span>
                        <ProgressBar value={pct} color={pct > 90 ? "#DC2626" : pct > 75 ? "#CA8A04" : "#6B7280"} height={3} />
                        <span className="tabular-nums" style={{ fontSize: "12px", color: "#9CA3AF" }}>{pct}%</span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "#6B7280" }}
                          onClick={() => { setSelectedId(p.id); setDetailTab("overview"); }}><FileText className="w-3.5 h-3.5" /></button>
                        {canEdit && (
                          <>
                            <button className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "#6B7280" }}
                              onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></button>
                            <button className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "#DC2626" }}
                              onClick={() => setDeleteId(p.id)}><Trash2 className="w-3.5 h-3.5" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Pagination total={filtered.length} page={projPage} pageSize={PAGE_SIZE} onChange={(p) => setProjPage(p)} />
        </Card>
      )}
      </>)}

      {/* ── History Tab ────────────────────────────────────────────────── */}
      {topTab === "history" && (<>
        {/* Summary stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "已完成專案", value: historyProjects.filter(p => p.status === "completed").length, color: "#15803D", bg: "#F0FDF4", icon: CheckCircle },
            { label: "已取消專案", value: historyProjects.filter(p => p.status === "cancelled").length, color: "#DC2626", bg: "#FEF2F2", icon: AlertCircle },
            { label: "總結算金額", value: fmtM(historyProjects.reduce((s, p) => s + p.spent, 0)), color: "#374151", bg: "#F9FAFB", icon: DollarSign },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.04em" }}>{item.label}</p>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  </div>
                </div>
                <p className="tabular-nums" style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>{item.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative" style={{ minWidth: 180 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
          <input type="text" placeholder="搜尋歷史專案名稱、客戶、負責人..."
            value={historySearch} onChange={e => { setHistorySearch(e.target.value); setHistoryPage(1); }}
            className="w-full pl-9 pr-3 py-2 rounded outline-none"
            style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#111827", fontFamily: "inherit" }} />
        </div>

        {/* History list */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full hidden md:table">
              <thead>
                <tr style={{ background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                  {["專案名稱", "客戶", "負責人", "狀態", "結案日期", "預算結算", "結案率", "操作"].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left" style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedHistory.map((p, idx) => {
                  const pct = bp(p);
                  const sc = STATUS_CFG[p.status];
                  return (
                    <tr key={p.id}
                      style={{ borderBottomWidth: idx < pagedHistory.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F9FAFB" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      <td className="px-5 py-3.5">
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{p.name}</p>
                      </td>
                      <td className="px-5 py-3.5" style={{ fontSize: "13px", color: "#6B7280" }}>{p.client}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Avatar name={p.manager} size={20} dark />
                          <span style={{ fontSize: "13px", color: "#374151" }}>{p.manager}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3.5 tabular-nums" style={{ fontSize: "13px", color: "#6B7280", whiteSpace: "nowrap" }}>{p.endDate}</td>
                      <td className="px-5 py-3.5">
                        <p className="tabular-nums" style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{fmtNT(p.spent)}</p>
                        <p className="tabular-nums" style={{ fontSize: "11px", color: "#9CA3AF" }}>預算 {fmtNT(p.budget)}（{pct}%）</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={p.progress} color={p.status === "cancelled" ? "#DC2626" : "#6B7280"} />
                          <span className="tabular-nums" style={{ fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="w-8 h-8 rounded flex items-center justify-center" title="查看"
                          style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                          onClick={() => { setSelectedId(p.id); setDetailTab("overview"); }}>
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Mobile */}
            <div className="md:hidden">
              {pagedHistory.map((p, idx) => (
                <div key={p.id} className="px-4 py-3" style={{ borderBottomWidth: idx < pagedHistory.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{p.name}</span>
                      <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 1 }}>{p.client}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={p.manager} size={18} dark />
                        <span style={{ fontSize: "12px", color: "#374151" }}>{p.manager}</span>
                      </div>
                      <span className="tabular-nums" style={{ fontSize: "12px", color: "#6B7280" }}>結案 {p.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums" style={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}>{fmtNT(p.spent)}</span>
                      <button className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "#6B7280" }}
                        onClick={() => { setSelectedId(p.id); setDetailTab("overview"); }}><FileText className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Pagination total={filteredHistory.length} page={historyPage} pageSize={PAGE_SIZE} onChange={(p) => setHistoryPage(p)} />
        </Card>
      </>)}

      {/* ── Project Detail Modal ─────────────────────────────────────────── */}
      {selectedId != null && selected && (() => {
        const isHistoryProject = historyProjects.some(p => p.id === selectedId);
        return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: "rgba(17,24,39,0.45)" }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedId(null); }}>
          <div className="w-full flex flex-col" style={{ maxWidth: "860px", maxHeight: "90vh", background: "#FFF", borderRadius: "12px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden" }}>
            {/* Modal header */}
            <div className="px-6 py-5 flex-shrink-0" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>{selected.name}</h2>
                    <StatusBadge status={selected.status} />
                    {isHistoryProject && (
                      <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: "#F3F4F6", color: "#6B7280" }}>已歸檔</span>
                    )}
                    {hasRisk(selected) && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ fontSize: "12px", background: "#FFFBEB", color: "#92400E", borderWidth: "1px", borderStyle: "solid", borderColor: "#FDE68A" }}>
                        <AlertTriangle className="w-3 h-3" />{riskLabel(selected)}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "14px", color: "#6B7280" }}>{selected.client} · 負責人：{selected.manager}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {canEdit && !isHistoryProject && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded" style={{ fontSize: "13px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151" }}
                      onClick={() => { setSelectedId(null); openEdit(selected); }}>
                      <Pencil className="w-3.5 h-3.5" />編輯
                    </button>
                  )}
                  <button className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    onClick={() => setSelectedId(null)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Tab bar */}
              <DraggableScroll className="mt-4 p-1 rounded-xl" style={{ background: "#F3F4F6" }} innerClassName="flex items-center gap-1"
                mobileDropdown={{
                  options: DETAIL_TABS.map(t => ({ key: t.key, label: t.label })),
                  activeKey: detailTab,
                  onSelect: (k) => setDetailTab(k as DetailTab),
                }}>
                {DETAIL_TABS.map(t => {
                  const counts: Partial<Record<DetailTab, number>> = {
                    tasks: getLinkedTasks(selected.id).length, milestones: selected.milestones.length,
                    documents: selected.documents.length, discussions: selected.discussions.length,
                    risks: selected.risks.length,
                  };
                  return (
                    <button key={t.key} onClick={() => setDetailTab(t.key)}
                      className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
                      style={{ fontSize: "13px", fontWeight: detailTab === t.key ? 600 : 500, background: detailTab === t.key ? "#111827" : "transparent", color: detailTab === t.key ? "#FFF" : "#6B7280", boxShadow: detailTab === t.key ? "0 1px 4px rgba(0,0,0,0.15)" : "none" }}>
                      {t.label}
                      {counts[t.key] != null && (
                        <span className="px-1.5 py-0.5 rounded-full tabular-nums" style={{ fontSize: "11px", fontWeight: 700, background: detailTab === t.key ? "rgba(255,255,255,0.2)" : "#E5E7EB", color: detailTab === t.key ? "#FFF" : "#374151", lineHeight: 1 }}>
                          {counts[t.key]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </DraggableScroll>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* ─ 總覽 ─ */}
              {detailTab === "overview" && (() => {
                const taskStats = getProjectTaskStats(selected.id);
                const taskProg = taskStats.totalPoints > 0 ? taskStats.progressPct : null;
                const displayProg = taskProg !== null ? taskProg : selected.progress;
                return (
                <>
                  <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7 }}>{selected.description}</p>
                  {/* Progress */}
                  <div className="p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: "13px", color: "#6B7280" }}>{taskProg !== null ? "任務完成進度" : "整體進度"}</span>
                      <span className="tabular-nums" style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>{displayProg}%</span>
                    </div>
                    {taskProg !== null ? (
                      <>
                        <TaskDistBar projectId={selected.id} />
                        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}>
                          {[
                            { label: "已完成", value: taskStats.done, color: "#15803D" },
                            { label: "進行中", value: taskStats.inProgress, color: "#2563EB" },
                            { label: "審核中", value: taskStats.review, color: "#7C3AED" },
                            { label: "待辦", value: taskStats.total - taskStats.done - taskStats.inProgress - taskStats.review, color: "#6B7280" },
                          ].map(s => (
                            <div key={s.label} className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                              <span style={{ fontSize: "12px", color: "#6B7280" }}>{s.label}</span>
                              <span className="tabular-nums" style={{ fontSize: "12px", fontWeight: 700, color: "#111827" }}>{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <ProgressBar value={displayProg} height={6} color={selected.status === "completed" ? "#6B7280" : "#111827"} />
                    )}
                  </div>
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Calendar, label: "專案期間", value: `${selected.startDate} ～ ${selected.endDate}` },
                      { icon: DollarSign, label: "預算執行", value: `${fmtNT(selected.spent)} / ${fmtNT(selected.budget)}（${bp(selected)}%）` },
                      ...(() => {
                        const sp = SHARED_PROJECTS.find(p => p.id === selected.id);
                        return sp ? [{ icon: Layers, label: "故事點", value: `${sp.completedPoints} / ${sp.totalPoints} pts` }] : [];
                      })(),
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex items-start gap-3 p-3 rounded" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                          <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#F3F4F6" }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: "#374151" }} />
                          </div>
                          <div><p style={{ fontSize: "11px", color: "#9CA3AF" }}>{item.label}</p><p className="tabular-nums" style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{item.value}</p></div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Story Points Tracking */}
                  {(() => {
                    const sp = SHARED_PROJECTS.find(p => p.id === selected.id);
                    if (!sp) return null;
                    const remaining = sp.totalPoints - sp.completedPoints;
                    const pct = sp.totalPoints > 0 ? Math.round((sp.completedPoints / sp.totalPoints) * 100) : 0;
                    const startMs = new Date(sp.startDate).getTime();
                    const endMs = new Date(sp.endDate).getTime();
                    const nowMs = new Date("2026-03-10").getTime();
                    const elapsed = Math.max(0, nowMs - startMs);
                    const totalTime = endMs - startMs;
                    const timePct = totalTime > 0 ? Math.round((elapsed / totalTime) * 100) : 0;
                    const weeksElapsed = Math.max(1, Math.round(elapsed / (7 * 86400000)));
                    const weeklyVelocity = Math.round((sp.completedPoints / weeksElapsed) * 10) / 10;
                    const weeksRemaining = Math.max(0, Math.round((endMs - nowMs) / (7 * 86400000)));
                    const projectedCompletion = weeklyVelocity > 0 ? Math.round(remaining / weeklyVelocity) : Infinity;
                    const onTrack = projectedCompletion <= weeksRemaining;
                    return (
                      <div className="p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4" style={{ color: "#374151" }} />
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>故事點追蹤</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full" style={{
                            fontSize: "11px", fontWeight: 700,
                            background: onTrack ? "#F0FDF4" : "#FEF2F2",
                            color: onTrack ? "#15803D" : "#DC2626",
                          }}>
                            {onTrack ? "進度正常" : "進度落後"}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-3 mb-3">
                          {[
                            { label: "總點數", value: sp.totalPoints, color: "#374151" },
                            { label: "已完成", value: sp.completedPoints, color: "#15803D" },
                            { label: "剩餘", value: remaining, color: "#2563EB" },
                            { label: "週速率", value: weeklyVelocity, color: "#7C3AED" },
                          ].map(c => (
                            <div key={c.label} className="text-center">
                              <div className="tabular-nums" style={{ fontSize: "18px", fontWeight: 700, color: c.color, lineHeight: 1 }}>{c.value}</div>
                              <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: 2 }}>{c.label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ fontSize: "11px", color: "#9CA3AF" }}>故事點進度</span>
                            <span className="tabular-nums" style={{ fontSize: "11px", fontWeight: 600, color: "#374151" }}>{sp.completedPoints}/{sp.totalPoints} pts（{pct}%）</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: "#E5E7EB", overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: sp.color, transition: "width 0.3s" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ fontSize: "11px", color: "#9CA3AF" }}>時間進度</span>
                            <span className="tabular-nums" style={{ fontSize: "11px", fontWeight: 600, color: "#374151" }}>{timePct}%</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: "#E5E7EB", overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(timePct, 100)}%`, height: "100%", borderRadius: 3, background: pct >= timePct ? "#15803D" : "#DC2626", transition: "width 0.3s" }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}>
                          <TrendingUp className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                          <span style={{ fontSize: "12px", color: "#6B7280" }}>
                            以目前速率（{weeklyVelocity} pts/週），預計還需 <strong style={{ color: "#111827" }}>{projectedCompletion === Infinity ? "—" : `${projectedCompletion} 週`}</strong> 完成
                            {weeksRemaining > 0 && <span>，剩餘 {weeksRemaining} 週</span>}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  {/* Team */}
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "10px" }}>團隊成員（{selected.team.length} 人）</h4>
                    <div className="flex flex-wrap gap-2">
                      {[selected.manager, ...selected.team].map((m, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                          <Avatar name={m} size={24} dark />
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{m}</p>
                            <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{i === 0 ? "專案經理" : "開發人員"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Status change */}
                  {!isHistoryProject && <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "10px" }}>快速更新狀態</h4>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(STATUS_CFG) as ProjectStatus[]).map(s => (
                        <button key={s} onClick={() => updateStatus(selected.id, s)}
                          className="px-3 py-1.5 rounded"
                          style={{ fontSize: "13px", fontWeight: selected.status === s ? 600 : 400, background: selected.status === s ? STATUS_CFG[s].bg : "#F9FAFB", color: selected.status === s ? STATUS_CFG[s].color : "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: selected.status === s ? STATUS_CFG[s].dot + "40" : "#E5E7EB" }}>
                          {STATUS_CFG[s].label}
                        </button>
                      ))}
                    </div>
                  </div>}
                </>
                );
              })()}

              {/* ─ 任務（from shared kanban data） ─ */}
              {detailTab === "tasks" && (() => {
                const linkedTasks = getLinkedTasks(selected.id);
                const stats = getProjectTaskStats(selected.id);
                return (
                  <>
                    {/* Summary bar */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        {[
                          { label: "全部", value: stats.total, color: "#374151" },
                          { label: "進行中", value: stats.inProgress, color: "#2563EB" },
                          { label: "審核中", value: stats.review, color: "#7C3AED" },
                          { label: "已完成", value: stats.done, color: "#15803D" },
                        ].map(s => (
                          <div key={s.label} className="flex items-center gap-1.5">
                            <span className="tabular-nums" style={{ fontSize: "16px", fontWeight: 700, color: s.color }}>{s.value}</span>
                            <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{s.label}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-1.5 ml-2 pl-2" style={{ borderLeftWidth: "1px", borderLeftStyle: "solid", borderLeftColor: "#E5E7EB" }}>
                          <Layers className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                          <span className="tabular-nums" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{stats.donePoints}/{stats.totalPoints} pts</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/tasks?project=${selected.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded"
                        style={{ fontSize: "13px", fontWeight: 500, background: "#111827", color: "#FFF" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#1F2937"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#111827"; }}
                      >
                        <GitBranch className="w-3.5 h-3.5" />前往看板
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>

                    {linkedTasks.length === 0 ? (
                      <div className="py-10 text-center">
                        <p style={{ color: "#9CA3AF", fontSize: "14px", marginBottom: 8 }}>此專案尚無關聯的看板任務</p>
                        <button onClick={() => navigate(`/tasks?project=${selected.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded"
                          style={{ fontSize: "13px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151" }}>
                          <Plus className="w-3.5 h-3.5" />前往工作事項建立
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {linkedTasks.map(t => {
                          const tc = TASK_STATUS_LABELS[t.status];
                          const pc = TASK_PRIORITY_LABELS[t.priority];
                          const isDone = t.status === "done";
                          const links = taskLinks[t.id] || [];
                          const isPopupOpen = linkPopup?.taskId === t.id;
                          return (
                            <div key={t.id} className="rounded" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: isPopupOpen ? "#93C5FD" : "#E5E7EB" }}>
                              {/* Main row */}
                              <div className="flex items-center gap-3 p-3 cursor-pointer"
                                onClick={() => navigate(`/tasks?project=${selected.id}`)}
                                onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                              >
                                <TaskTypeIcon type={t.type} size={16} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace", fontWeight: 600 }}>{t.id}</span>
                                    <p className="truncate" style={{ fontSize: "14px", fontWeight: 500, color: isDone ? "#9CA3AF" : "#111827", textDecoration: isDone ? "line-through" : "none" }}>{t.title}</p>
                                  </div>
                                  <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 1 }}>{t.assignee} · 截止：{t.dueDate}</p>
                                </div>
                                {/* Link count badge */}
                                <div className="relative">
                                  <button
                                    onClick={e => { e.stopPropagation(); setLinkPopup(isPopupOpen ? null : { taskId: t.id, mode: "list" }); setNewLink({ service: "figma", title: "", url: "" }); }}
                                    className="flex items-center gap-1 px-2 py-1 rounded transition-colors"
                                    title="外部文件連結"
                                    style={{ fontSize: "11px", fontWeight: 600, background: links.length > 0 ? "#EFF6FF" : "#F3F4F6", color: links.length > 0 ? "#2563EB" : "#9CA3AF", borderWidth: "1px", borderStyle: "solid", borderColor: links.length > 0 ? "#BFDBFE" : "transparent" }}
                                  >
                                    <Paperclip className="w-3 h-3" />
                                    {links.length > 0 && <span>{links.length}</span>}
                                  </button>
                                </div>
                                <span className="tabular-nums px-1.5 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: "#F3F4F6", color: "#374151" }}>{t.storyPoints} pts</span>
                                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: pc.bg, color: pc.color }}>{pc.label}</span>
                                <span className="px-2 py-0.5 rounded" style={{ fontSize: "12px", fontWeight: 500, background: tc.bg, color: tc.color }}>{tc.label}</span>
                              </div>

                              {/* Inline link chips row (collapsed preview) */}
                              {links.length > 0 && !isPopupOpen && (
                                <div className="flex items-center gap-1.5 px-3 pb-2.5 flex-wrap">
                                  {links.slice(0, 4).map(lk => {
                                    const svc = EXT_SERVICES[lk.service];
                                    return (
                                      <a key={lk.id} href={lk.url} target="_blank" rel="noopener noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors"
                                        style={{ fontSize: "11px", background: svc.bg, color: svc.color, textDecoration: "none" }}
                                        onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
                                        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                                        title={`${svc.label}: ${lk.title}`}
                                      >
                                        <span style={{ fontSize: "10px", fontWeight: 700, width: 14, height: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 3, background: svc.color, color: "#FFF" }}>{svc.icon}</span>
                                        <span className="truncate" style={{ maxWidth: 100 }}>{lk.title}</span>
                                        <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" style={{ opacity: 0.6 }} />
                                      </a>
                                    );
                                  })}
                                  {links.length > 4 && <span style={{ fontSize: "11px", color: "#9CA3AF" }}>+{links.length - 4}</span>}
                                </div>
                              )}

                              {/* Expanded link popup */}
                              {isPopupOpen && (
                                <div ref={linkPopupRef} className="mx-3 mb-3 rounded-lg" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} onClick={e => e.stopPropagation()}>
                                  <div className="flex items-center justify-between px-3 py-2" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                                    <div className="flex items-center gap-1.5">
                                      <Link2 className="w-3.5 h-3.5" style={{ color: "#374151" }} />
                                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>外部文件連結</span>
                                      {links.length > 0 && <span className="px-1.5 rounded-full" style={{ fontSize: "11px", fontWeight: 600, background: "#EFF6FF", color: "#2563EB" }}>{links.length}</span>}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {canEdit && linkPopup.mode === "list" && (
                                        <button onClick={() => setLinkPopup({ taskId: t.id, mode: "add" })} className="flex items-center gap-1 px-2 py-1 rounded" style={{ fontSize: "12px", fontWeight: 500, background: "#111827", color: "#FFF" }}>
                                          <Plus className="w-3 h-3" />新增
                                        </button>
                                      )}
                                      <button onClick={() => setLinkPopup(null)} className="p-1 rounded" style={{ color: "#9CA3AF" }}><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </div>

                                  {linkPopup.mode === "add" ? (
                                    <div className="p-3 space-y-2.5">
                                      <div>
                                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>服務類型</label>
                                        <div className="flex flex-wrap gap-1.5">
                                          {(Object.keys(EXT_SERVICES) as ExtServiceKey[]).map(k => {
                                            const s = EXT_SERVICES[k];
                                            const sel = newLink.service === k;
                                            return (
                                              <button key={k} onClick={() => setNewLink(p => ({ ...p, service: k }))}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded transition-colors"
                                                style={{ fontSize: "11px", fontWeight: sel ? 600 : 400, background: sel ? s.bg : "#F9FAFB", color: sel ? s.color : "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: sel ? s.color + "40" : "#E5E7EB" }}>
                                                <span style={{ fontSize: "9px", fontWeight: 700, width: 13, height: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 2, background: sel ? s.color : "#D1D5DB", color: "#FFF" }}>{s.icon}</span>
                                                {s.label}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <div>
                                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>文件標題</label>
                                        <input type="text" placeholder="例如：UI 設計稿 v2" value={newLink.title} onChange={e => setNewLink(p => ({ ...p, title: e.target.value }))}
                                          style={{ width: "100%", padding: "6px 10px", fontSize: "13px", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 6, outline: "none", background: "#F9FAFB", color: "#111827" }} />
                                      </div>
                                      <div>
                                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>連結網址</label>
                                        <input type="url" placeholder="https://..." value={newLink.url} onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
                                          style={{ width: "100%", padding: "6px 10px", fontSize: "13px", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 6, outline: "none", background: "#F9FAFB", color: "#111827" }} />
                                      </div>
                                      <div className="flex items-center gap-2 pt-1">
                                        <button onClick={addTaskLink} disabled={!newLink.title.trim() || !newLink.url.trim()}
                                          className="flex items-center gap-1 px-3 py-1.5 rounded"
                                          style={{ fontSize: "13px", fontWeight: 500, background: !newLink.title.trim() || !newLink.url.trim() ? "#E5E7EB" : "#111827", color: !newLink.title.trim() || !newLink.url.trim() ? "#9CA3AF" : "#FFF" }}>
                                          <Check className="w-3.5 h-3.5" />確認新增
                                        </button>
                                        <button onClick={() => { setNewLink({ service: "figma", title: "", url: "" }); setLinkPopup({ taskId: t.id, mode: "list" }); }}
                                          className="px-3 py-1.5 rounded" style={{ fontSize: "13px", color: "#6B7280", background: "#F9FAFB" }}>
                                          取消
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-2">
                                      {links.length === 0 ? (
                                        <div className="py-6 text-center">
                                          <Globe className="w-6 h-6 mx-auto mb-2" style={{ color: "#D1D5DB" }} />
                                          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>尚無外部連結</p>
                                          {canEdit && <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>點擊上方「新增」按鈕來串連文件</p>}
                                        </div>
                                      ) : (
                                        <div className="space-y-1">
                                          {links.map(lk => {
                                            const svc = EXT_SERVICES[lk.service];
                                            return (
                                              <div key={lk.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded group"
                                                onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                                                <span style={{ fontSize: "10px", fontWeight: 700, width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 5, background: svc.color, color: "#FFF", flexShrink: 0 }}>{svc.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                  <p className="truncate" style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{lk.title}</p>
                                                  <p className="truncate" style={{ fontSize: "11px", color: "#9CA3AF" }}>{svc.label} · {lk.url}</p>
                                                </div>
                                                <a href={lk.url} target="_blank" rel="noopener noreferrer"
                                                  className="flex items-center gap-1 px-2 py-1 rounded flex-shrink-0"
                                                  style={{ fontSize: "11px", fontWeight: 500, color: "#2563EB", background: "#EFF6FF", textDecoration: "none" }}>
                                                  開啟<ExternalLink className="w-3 h-3" />
                                                </a>
                                                {canEdit && (
                                                  <button onClick={() => removeTaskLink(t.id, lk.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                    style={{ color: "#DC2626" }} title="移除連結">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}

              {/* ─ 里程碑 ─ */}
              {detailTab === "milestones" && (
                <div className="space-y-2">
                  {selected.milestones.map((ms, i) => (
                    <div key={ms.id} className="flex items-center gap-4 p-3 rounded" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                      <button onClick={() => toggleMilestone(ms.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: ms.completed ? "#111827" : "#F3F4F6", borderWidth: ms.completed ? "none" : "2px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                        {ms.completed ? <CheckCircle className="w-4 h-4" style={{ color: "#FFF" }} /> : <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 700 }}>{i + 1}</span>}
                      </button>
                      <div className="flex-1">
                        <p style={{ fontSize: "14px", fontWeight: 500, color: ms.completed ? "#6B7280" : "#111827" }}>{ms.name}</p>
                        <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "1px" }}>{ms.date}</p>
                      </div>
                      {ms.completed
                        ? <span className="px-2 py-0.5 rounded" style={{ fontSize: "12px", background: "#F0FDF4", color: "#15803D", fontWeight: 500 }}>完成</span>
                        : <span className="px-2 py-0.5 rounded" style={{ fontSize: "12px", background: "#F9FAFB", color: "#9CA3AF" }}>進行中</span>}
                    </div>
                  ))}
                  {selected.milestones.length === 0 && <div className="py-10 text-center" style={{ color: "#9CA3AF", fontSize: "14px" }}>尚無里程碑</div>}
                </div>
              )}

              {/* ─ 文件 ─ */}
              {detailTab === "documents" && (
                <>
                  <button className="flex items-center gap-2 px-4 py-2 rounded" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#374151" }}>
                    <Plus className="w-3.5 h-3.5" />上傳文件
                  </button>
                  {selected.documents.length === 0 ? (
                    <div className="py-10 text-center" style={{ color: "#9CA3AF", fontSize: "14px" }}>尚無文件</div>
                  ) : (
                    <div className="space-y-2">
                      {selected.documents.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 p-4 rounded" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                          <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0" style={{ background: "#F3F4F6" }}>
                            <FileText className="w-4 h-4" style={{ color: "#374151" }} />
                          </div>
                          <div className="flex-1">
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{doc.name}</p>
                            <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{doc.uploadBy} · {doc.uploadDate}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", background: "#F3F4F6", color: "#374151" }}>{doc.type}</span>
                          <button className="px-3 py-1.5 rounded" style={{ fontSize: "13px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151" }}>
                            下載
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ─ 討論 ─ */}
              {detailTab === "discussions" && (
                <>
                  <div className="space-y-3">
                    {selected.discussions.length === 0 ? (
                      <div className="py-8 text-center" style={{ color: "#9CA3AF", fontSize: "14px" }}>尚無討論訊息</div>
                    ) : (
                      selected.discussions.map(d => (
                        <div key={d.id} className="flex items-start gap-3">
                          <Avatar name={d.author} size={32} dark />
                          <div className="flex-1 p-3 rounded" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                            <div className="flex items-center gap-2 mb-1">
                              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{d.author}</p>
                              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{d.date}</span>
                            </div>
                            <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6 }}>{d.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="text" placeholder="輸入留言..." value={newMsg} onChange={e => setNewMsg(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                      className="flex-1 px-3 py-2 rounded outline-none" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#111827", fontFamily: "inherit" }} />
                    <button onClick={sendMessage} className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: "#111827", color: "#FFF" }}>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {/* ─ 風險 ─ */}
              {detailTab === "risks" && (
                <>
                  {selected.risks.length === 0 ? (
                    <div className="py-10 text-center" style={{ color: "#9CA3AF", fontSize: "14px" }}>目前無已登記的風險項目</div>
                  ) : (
                    <div className="space-y-3">
                      {selected.risks.map(r => {
                        const rc = RISK_CFG[r.level];
                        return (
                          <div key={r.id} className="flex items-start gap-3 p-4 rounded" style={{ background: rc.bg, borderWidth: "1px", borderStyle: "solid", borderColor: rc.border }}>
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: rc.color }} />
                            <div className="flex-1">
                              <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{r.description}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span style={{ fontSize: "12px", color: rc.color, fontWeight: 600 }}>風險等級：{rc.label}</span>
                                <span style={{ fontSize: "12px", color: "#6B7280" }}>{r.status === "active" ? "● 處理中" : r.status === "monitoring" ? "○ 觀察中" : "✓ 已解決"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}>
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
                {(() => { const s = getProjectTaskStats(selected.id); return `${s.done}/${s.total}`; })()} 任務完成 · {selected.milestones.filter(m => m.completed).length}/{selected.milestones.length} 里程碑達成
              </p>
              <button className="px-4 py-2 rounded" style={{ fontSize: "14px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151" }}
                onClick={() => setSelectedId(null)}>
                關閉
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── New / Edit Modal ─────────────────────────────────────────────── */}
      {isFormOpen && (() => {
        const FORM_STEPS = [
          { key: "basic", label: "基本資訊", icon: Briefcase },
          { key: "schedule", label: "排程與預算", icon: Calendar },
          { key: "team", label: "團隊配置", icon: Users },
          { key: "detail", label: "確認送出", icon: Layers },
        ];
        const curStep = FORM_STEPS[formStep];
        const filteredMembers = KNOWN_MEMBERS.filter(m => !form.team.includes(m) && m !== form.manager && m.toLowerCase().includes(teamInput.toLowerCase()));
        const addMember = (m: string) => { setF("team", [...form.team, m]); setTeamInput(""); };
        const removeMember = (m: string) => { setF("team", form.team.filter((x: string) => x !== m)); };
        const addMs = () => { setF("milestones", [...form.milestones, { name: "", date: "" }]); };
        const updateMs = (i: number, field: "name" | "date", v: string) => {
          const ms = [...form.milestones]; ms[i] = { ...ms[i], [field]: v }; setF("milestones", ms);
        };
        const removeMs = (i: number) => { setF("milestones", form.milestones.filter((_: any, idx: number) => idx !== i)); };
        const canNext = () => {
          if (formStep === 0) return !!(form.name.trim() && form.client.trim());
          if (formStep === 1) return !!(form.startDate && form.endDate && form.budget > 0);
          if (formStep === 2) return !!form.manager.trim();
          return true;
        };
        const stepValidate = () => {
          const errs: Record<string, string> = {};
          if (formStep === 0) {
            if (!form.name.trim()) errs.name = "請輸入專案名稱";
            if (!form.client.trim()) errs.client = "請輸入客戶名稱";
          } else if (formStep === 1) {
            if (!form.startDate) errs.startDate = "請選擇開始日期";
            if (!form.endDate) errs.endDate = "請選擇結束日期";
            if (!form.budget || form.budget <= 0) errs.budget = "請輸入有效預算";
            if (form.startDate && form.endDate && form.startDate > form.endDate) errs.endDate = "結束日期不可早於開始日期";
          } else if (formStep === 2) {
            if (!form.manager.trim()) errs.manager = "請指定專案經理";
          }
          setFormErrors(errs);
          return Object.keys(errs).length === 0;
        };
        const goNext = () => { if (stepValidate()) setFormStep(s => Math.min(s + 1, 3)); };
        const goBack = () => { setFormErrors({}); setFormStep(s => Math.max(s - 1, 0)); };
        const durationDays = form.startDate && form.endDate
          ? Math.max(0, Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000))
          : null;

        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-md:p-0" style={{ background: "rgba(17,24,39,0.45)" }}
          onClick={e => { if (e.target === e.currentTarget) setIsFormOpen(false); }}>
          <div className="w-full max-w-2xl flex flex-col max-md:max-w-none max-md:h-full max-md:rounded-none" style={{ background: "#FFF", borderRadius: "12px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "90vh", overflow: "hidden" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                  <Briefcase className="w-[18px] h-[18px]" style={{ color: "#374151" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>{editingId ? "編輯專案" : "新增專案"}</h2>
                  <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "1px" }}>{curStep.label}（{formStep + 1} / {FORM_STEPS.length}）</p>
                </div>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center px-6 py-3 gap-1 flex-shrink-0" style={{ background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
              {FORM_STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = i < formStep;
                const active = i === formStep;
                return (
                  <div key={s.key} className="flex items-center gap-1 flex-1">
                    <button onClick={() => { if (i < formStep) { setFormErrors({}); setFormStep(i); } }}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md"
                      style={{ background: active ? "#111827" : "transparent", cursor: i < formStep ? "pointer" : "default" }}>
                      {done ? (
                        <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ background: "#15803D" }}>
                          <Check className="w-3 h-3" style={{ color: "#FFF" }} />
                        </div>
                      ) : (
                        <Icon className="w-3.5 h-3.5" style={{ color: active ? "#FFF" : "#9CA3AF" }} />
                      )}
                      <span className="max-md:hidden" style={{ fontSize: "12px", fontWeight: active ? 600 : 400, color: active ? "#FFF" : done ? "#374151" : "#9CA3AF" }}>{s.label}</span>
                    </button>
                    {i < FORM_STEPS.length - 1 && <div className="flex-1 h-px mx-1" style={{ background: done ? "#15803D" : "#E5E7EB" }} />}
                  </div>
                );
              })}
            </div>

            {/* Body */}
            <div className="px-6 py-5 max-md:px-4 max-md:py-4 overflow-y-auto flex-1 space-y-4" style={{ minHeight: "380px" }}>

              {/* Step 0: Basic Info */}
              {formStep === 0 && <>
                <div>
                  <label style={lStyle}>專案名稱 <span style={{ color: "#DC2626" }}>*</span></label>
                  <input type="text" placeholder="例如：電商平台改版專案" value={form.name} onChange={e => setF("name", e.target.value)} style={iStyle(formErrors.name)} />
                  {formErrors.name && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "3px" }}>{formErrors.name}</p>}
                </div>
                <div>
                  <label style={lStyle}>客戶名稱 <span style={{ color: "#DC2626" }}>*</span></label>
                  <input type="text" placeholder="客戶公司名稱或「（內部專案）」" value={form.client} onChange={e => setF("client", e.target.value)} style={iStyle(formErrors.client)} />
                  {formErrors.client && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "3px" }}>{formErrors.client}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={lStyle}>專案狀態</label>
                    <StyledSelect value={form.status} onChange={v => setF("status", v as ProjectStatus)}
                      options={(Object.keys(STATUS_CFG) as ProjectStatus[]).map(s => ({ key: s, label: STATUS_CFG[s].label }))} formField />
                  </div>
                  <div>
                    <label style={lStyle}>優先等級</label>
                    <StyledSelect value={form.priority} onChange={v => setF("priority", v as Priority)}
                      options={PRIORITY_OPTIONS.map(p => ({ key: p.key, label: p.label }))} formField />
                  </div>
                </div>
                <div>
                  <label style={lStyle}>專案描述</label>
                  <textarea rows={3} placeholder="簡要說明專案目標、範疇與預期成果" value={form.description} onChange={e => setF("description", e.target.value)}
                    style={{ ...iStyle(), resize: "none" }} />
                </div>
              </>}

              {/* Step 1: Schedule & Budget */}
              {formStep === 1 && <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={lStyle}>開始日期 <span style={{ color: "#DC2626" }}>*</span></label>
                    <DatePicker value={form.startDate} onChange={v => setF("startDate", v)} placeholder="選擇開始日期" formField />
                    {formErrors.startDate && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "3px" }}>{formErrors.startDate}</p>}
                  </div>
                  <div>
                    <label style={lStyle}>結束日期 <span style={{ color: "#DC2626" }}>*</span></label>
                    <DatePicker value={form.endDate} onChange={v => setF("endDate", v)} placeholder="選擇結束日期" formField minDate={form.startDate || undefined} />
                    {formErrors.endDate && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "3px" }}>{formErrors.endDate}</p>}
                  </div>
                </div>
                {durationDays !== null && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#EFF6FF", borderWidth: "1px", borderStyle: "solid", borderColor: "#BFDBFE" }}>
                    <Clock className="w-3.5 h-3.5" style={{ color: "#2563EB" }} />
                    <span style={{ fontSize: "13px", color: "#2563EB" }}>專案期間：{durationDays} 天（約 {Math.ceil(durationDays / 30)} 個月）</span>
                  </div>
                )}
                <div>
                  <label style={lStyle}>專案預算 <span style={{ color: "#DC2626" }}>*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: "14px", color: "#9CA3AF" }}>NT$</span>
                    <input type="text" inputMode="numeric" placeholder="0" value={form.budget || ""}
                      onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ""); setF("budget", v ? Number(v) : 0); }}
                      style={{ ...iStyle(formErrors.budget), paddingLeft: "42px" }} />
                  </div>
                  {formErrors.budget && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "3px" }}>{formErrors.budget}</p>}
                  {form.budget > 0 && (
                    <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>= {fmtNT(form.budget)}</p>
                  )}
                </div>
              </>}

              {/* Step 2: Team */}
              {formStep === 2 && <>
                <div>
                  <label style={lStyle}>專案經理 <span style={{ color: "#DC2626" }}>*</span></label>
                  <StyledSelect value={form.manager} onChange={v => setF("manager", v)}
                    options={KNOWN_MEMBERS.map(m => ({ key: m, label: m }))} formField placeholder="選擇專案經理" />
                  {formErrors.manager && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "3px" }}>{formErrors.manager}</p>}
                </div>
                <div>
                  <label style={lStyle}>團隊成員</label>
                  {form.team.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {form.team.map((m: string) => (
                        <span key={m} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ fontSize: "12px", fontWeight: 500, background: "#F3F4F6", color: "#374151" }}>
                          <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#374151", fontSize: "9px", fontWeight: 700, color: "#FFF" }}>{m[0]}</span>
                          {m}
                          <button onClick={() => removeMember(m)} className="w-3.5 h-3.5 rounded-full flex items-center justify-center ml-0.5" style={{ color: "#9CA3AF" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}>
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <div className="flex items-center gap-2" style={{ ...iStyle(), padding: "0 12px" }}>
                      <UserPlus className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#9CA3AF" }} />
                      <input type="text" placeholder="搜尋成員姓名…" value={teamInput}
                        onChange={e => { setTeamInput(e.target.value); setShowMemberList(true); }}
                        onFocus={() => setShowMemberList(true)}
                        onBlur={() => { setTimeout(() => setShowMemberList(false), 300); }}
                        style={{ border: "none", outline: "none", background: "transparent", fontSize: "14px", color: "#111827", width: "100%", padding: "8px 0", fontFamily: "inherit" }} />
                    </div>
                    {showMemberList && filteredMembers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg overflow-hidden" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", maxHeight: "180px", overflowY: "auto" }}>
                        {filteredMembers.map(m => (
                          <button key={m} className="w-full flex items-center gap-2.5 px-3 py-2 text-left"
                            style={{ fontSize: "13px", color: "#374151" }}
                            onMouseDown={e => { e.preventDefault(); addMember(m); }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                            <Avatar name={m} size={22} />
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>已選 {form.team.length} 人{form.manager ? `（不含經理 ${form.manager}）` : ""}</p>
                </div>

                {/* Sprint 分配 */}
                <div>
                  <label style={lStyle}>安排至 Sprint（選填）</label>
                  <div className="space-y-1.5">
                    {sprintOptions.map(sp => {
                      const selected = form.sprint === sp.key;
                      const isActive = sp.status === "active";
                      const isBacklog = sp.status === "backlog";
                      const pctUsed = sp.capacity > 0 ? Math.min(100, Math.round((sp.allocated / sp.capacity) * 100)) : 0;
                      const remaining = sp.capacity > 0 ? Math.max(0, sp.capacity - sp.allocated) : 0;
                      const overloaded = sp.capacity > 0 && sp.allocated > sp.capacity;
                      return (
                        <button key={sp.key} type="button" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                          style={{
                            borderWidth: "1px", borderStyle: "solid",
                            borderColor: selected ? "#2563EB" : "#E5E7EB",
                            background: selected ? "#EFF6FF" : "#FFF",
                          }}
                          onClick={() => setF("sprint", selected ? "" : sp.key)}
                          onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.borderColor = "#93C5FD"; }}
                          onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; }}>
                          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ borderWidth: "2px", borderStyle: "solid", borderColor: selected ? "#2563EB" : "#D1D5DB", background: selected ? "#2563EB" : "transparent" }}>
                            {selected && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FFF" }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{sp.label}</span>
                              {isActive && <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: "#15803D", background: "#DCFCE7" }}>進行中</span>}
                            </div>
                            {sp.sub && <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px" }}>{sp.sub}</p>}
                            {/* Capacity bar */}
                            {!isBacklog && (
                              <div className="mt-1.5">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span style={{ fontSize: "11px", color: "#6B7280" }}>
                                    {sp.taskCount} 個任務 · 已分配 {sp.allocated} 點{isActive ? ` · 已完成 ${sp.done} 點` : ""}
                                  </span>
                                  <span style={{ fontSize: "11px", fontWeight: 600, color: overloaded ? "#DC2626" : remaining <= 5 && sp.capacity > 0 ? "#D97706" : "#6B7280" }}>
                                    {overloaded ? `超額 ${sp.allocated - sp.capacity} 點` : `剩餘 ${remaining} / ${sp.capacity} 點`}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "#E5E7EB" }}>
                                  <div className="h-full rounded-full transition-all" style={{
                                    width: `${Math.min(100, pctUsed)}%`,
                                    background: overloaded ? "#DC2626" : pctUsed >= 80 ? "#D97706" : "#2563EB",
                                  }} />
                                </div>
                              </div>
                            )}
                            {isBacklog && sp.taskCount > 0 && (
                              <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>{sp.taskCount} 個任務 · {sp.allocated} 點待分配</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>
                    {form.sprint ? `已選擇：${sprintOptions.find(s => s.key === form.sprint)?.label || form.sprint}` : "未選擇，可稍後在工作事項頁面分配"}
                  </p>
                </div>
              </>}

              {/* Step 3: Milestones + Summary */}
              {formStep === 3 && <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label style={{ ...lStyle, marginBottom: 0 }}>里程碑（選填）</label>
                    <button onClick={addMs} className="flex items-center gap-1 px-2 py-1 rounded"
                      style={{ fontSize: "12px", color: "#2563EB", background: "#EFF6FF" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#DBEAFE"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; }}>
                      <Plus className="w-3 h-3" />新增
                    </button>
                  </div>
                  {form.milestones.length === 0 && (
                    <div className="flex flex-col items-center py-6 rounded-lg" style={{ background: "#FAFAFA", borderWidth: "1px", borderStyle: "dashed", borderColor: "#D1D5DB" }}>
                      <Target className="w-5 h-5 mb-1.5" style={{ color: "#D1D5DB" }} />
                      <p style={{ fontSize: "13px", color: "#9CA3AF" }}>尚未設定里程碑</p>
                      <button onClick={addMs} className="mt-2 px-3 py-1 rounded" style={{ fontSize: "12px", color: "#374151", background: "#F3F4F6" }}>
                        <Plus className="w-3 h-3 inline mr-1" />新增第一個
                      </button>
                    </div>
                  )}
                  {form.milestones.length > 0 && (
                    <div className="space-y-2">
                      {form.milestones.map((ms: { name: string; date: string }, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <CircleDot className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#9CA3AF" }} />
                          <input type="text" placeholder={`里程碑 ${i + 1} 名稱`} value={ms.name}
                            onChange={e => updateMs(i, "name", e.target.value)}
                            style={{ ...iStyle(), flex: 1 }} />
                          
                          <button onClick={() => removeMs(i)} className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                            style={{ color: "#9CA3AF" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary Preview */}
                <div className="rounded-lg overflow-hidden" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                  <div className="px-4 py-2.5" style={{ background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.05em" }}>專案摘要</span>
                  </div>
                  <div className="px-4 py-3 space-y-2.5">
                    {([
                      ["專案名稱", form.name || "—", true],
                      ["客戶", form.client || "—", false],
                      ["期間", form.startDate && form.endDate ? `${form.startDate} ~ ${form.endDate}${durationDays != null ? `（${durationDays}天）` : ""}` : "—", false],
                      ["經理", form.manager || "—", false],
                      ["團隊", form.team.length > 0 ? (form.team as string[]).join("、") : "—", false],
                    ] as [string, string, boolean][]).map(([label, val, bold]) => (
                      <div key={label} className="flex items-center justify-between">
                        <span style={{ fontSize: "13px", color: "#6B7280" }}>{label}</span>
                        <span style={{ fontSize: "13px", fontWeight: bold ? 600 : 400, color: "#111827" }}>{val}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: "13px", color: "#6B7280" }}>狀態 / 優先</span>
                      <span className="flex items-center gap-2">
                        <StatusBadge status={form.status} />
                        <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 500, background: PRIORITY_CFG[form.priority].bg, color: PRIORITY_CFG[form.priority].color }}>{PRIORITY_OPTIONS.find(p => p.key === form.priority)?.label}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: "13px", color: "#6B7280" }}>預算</span>
                      <span className="tabular-nums" style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{form.budget > 0 ? `NT$${form.budget.toLocaleString()}` : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: "13px", color: "#6B7280" }}>Sprint</span>
                      <span style={{ fontSize: "13px", color: form.sprint ? "#111827" : "#9CA3AF" }}>{form.sprint ? (sprintOptions.find(s => s.key === form.sprint)?.label || "—") : "未分配"}</span>
                    </div>
                    {form.milestones.filter((m: { name: string }) => m.name.trim()).length > 0 && (
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: "13px", color: "#6B7280" }}>里程碑</span>
                        <span style={{ fontSize: "13px", color: "#374151" }}>{form.milestones.filter((m: { name: string }) => m.name.trim()).length} 個</span>
                      </div>
                    )}
                  </div>
                </div>
              </>}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 flex-shrink-0" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}>
              <div>
                {formStep > 0 && (
                  <button onClick={goBack} className="flex items-center gap-1 px-4 py-2 rounded"
                    style={{ fontSize: "14px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", fontFamily: "inherit" }}>
                    <ChevronLeft className="w-3.5 h-3.5" />上一步
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded"
                  style={{ fontSize: "14px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", fontFamily: "inherit" }}>
                  取消
                </button>
                {formStep < 3 ? (
                  <button onClick={goNext} className="px-5 py-2 rounded flex items-center gap-1.5"
                    style={{ fontSize: "14px", fontWeight: 600, background: "#111827", color: "#FFF", fontFamily: "inherit", opacity: canNext() ? 1 : 0.5 }}>
                    下一步<ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button onClick={submitForm} className="px-5 py-2 rounded flex items-center gap-2"
                    style={{ fontSize: "14px", fontWeight: 600, background: "#111827", color: "#FFF", fontFamily: "inherit" }}>
                    <Check className="w-4 h-4" />{editingId ? "儲存變更" : "建立專案"}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
        );
      })()}

      {/* ── Delete Confirm ───────────────────────────────────────────────── */}
      {deleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(17,24,39,0.45)" }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div className="w-full max-w-sm p-6" style={{ background: "#FFF", borderRadius: "12px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "#FEF2F2" }}>
              <Trash2 className="w-5 h-5" style={{ color: "#DC2626" }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>確認刪除此專案？</h3>
            <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6 }}>
              「{projects.find(p => p.id === deleteId)?.name}」及其所有任務、里程碑、文件將被永久刪除，無法還原。
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded"
                style={{ fontSize: "14px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", fontFamily: "inherit" }}>
                取消
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2 rounded"
                style={{ fontSize: "14px", fontWeight: 600, background: "#DC2626", color: "#FFF", fontFamily: "inherit" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#B91C1C"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#DC2626"; }}>
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
