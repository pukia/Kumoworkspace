import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus, Search, Filter, X,
  AlertCircle, BookOpen, Bug, Zap,
  CalendarDays, ChevronDown, ChevronUp,
  MoreHorizontal, ArrowUpRight, Clock,
  CheckCircle2, Circle, MessageSquare, User, Flag, Tag, Check,
  Building2, BarChart2, GitBranch, ChevronRight, Paperclip,
  ArrowRight, Send, ThumbsUp, Reply, Trophy, Award, Settings,
  ChevronLeft, Users, UserPlus, Mail, Archive, Target,
  ExternalLink, Link, Trash2, FileText,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import { DraggableScroll } from "../components/DraggableScroll";
import { StyledSelect } from "../components/StyledSelect";
import { DatePicker } from "../components/DatePicker";
import { EMPLOYEES } from "../data/employees";
import { SHARED_PROJECTS, PROJECT_STATUS_CFG } from "../data/projects-shared";
import type { SharedProject } from "../data/projects-shared";
import { INIT_TASKS as SHARED_INIT_TASKS } from "../data/tasks-shared";
import { toast, Toaster } from "sonner";
import { useSearchParams } from "react-router";
import { EmployeeTaskTracker } from "../components/EmployeeTaskTracker";
import { EMPLOYEES as EMP_LIST } from "../data/employees";



// ─── Types ────────────────��───────────────────────────────────────────────────
type Status    = "todo" | "inProgress" | "review" | "done";
type Priority  = "critical" | "high" | "medium" | "low";
type IssueType = "task" | "story" | "bug" | "improvement";

interface Task {
  id: string;
  title: string;
  desc: string;
  status: Status;
  priority: Priority;
  type: IssueType;
  assignee: string;
  assigneeColor: string;
  dept: string;
  dueDate: string;
  storyPoints: number;
  labels: string[];
  createdDate: string;
  sprintNum?: number | null;
  projectId?: number | null;
}

interface CommentEntry {
  id: string;
  actor: string;
  color: string;
  text: string;
  timestamp: string;
  likes: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const PRIORITY_CFG: Record<Priority, { label: string; color: string; bg: string; icon: string }> = {
  critical: { label: "緊急", color: "#DC2626", bg: "#FEF2F2", icon: "▲▲" },
  high:     { label: "高",   color: "#EA580C", bg: "#FFF7ED", icon: "▲"  },
  medium:   { label: "中",   color: "#CA8A04", bg: "#FEFCE8", icon: "●"  },
  low:      { label: "低",   color: "#6B7280", bg: "#F9FAFB", icon: "▼"  },
};

const STATUS_CFG: Record<Status, { label: string; color: string; bg: string; border: string; headerBg: string }> = {
  todo:       { label: "待辦",    color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", headerBg: "#E5E7EB" },
  inProgress: { label: "進行中",  color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", headerBg: "#BFDBFE" },
  review:     { label: "審核中",  color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", headerBg: "#DDD6FE" },
  done:       { label: "已完成",  color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0", headerBg: "#BBF7D0" },
};

const TYPE_CFG: Record<IssueType, { label: string; color: string; bg: string }> = {
  task:        { label: "任務", color: "#2563EB", bg: "#DBEAFE" },
  story:       { label: "需求", color: "#7C3AED", bg: "#EDE9FE" },
  bug:         { label: "缺陷", color: "#DC2626", bg: "#FEE2E2" },
  improvement: { label: "優化", color: "#15803D", bg: "#DCFCE7" },
};

// ─── Initial Data (from shared module) ────────────────────────────────────────
const INIT_TASKS: Task[] = SHARED_INIT_TASKS as Task[];

const COLUMNS: { key: Status; }[] = [
  { key: "todo"       },
  { key: "inProgress" },
  { key: "review"     },
  { key: "done"       },
];

const TODAY = "2026-03-10";

// ─── Archived Task ────────────────────────────────────────────────────────────
interface ArchivedTask extends Task {
  archivedDate: string;
  sprintNum: number;
  sprintRange: string;
  finalStatus: Status;
}

const INIT_ARCHIVED: ArchivedTask[] = [
  { id: "TASK-A01", title: "建立 CI/CD 自動化流程", desc: "使用 GitHub Actions 建立自動測試與部署管線，涵蓋 staging / production 環境", status: "done", priority: "high", type: "improvement", assignee: "孫八", assigneeColor: "#EF4444", dept: "技術部", dueDate: "2026-02-14", storyPoints: 8, labels: ["DevOps", "自動化"], createdDate: "2026-02-01", archivedDate: "2026-02-14", sprintNum: 5, sprintRange: "2026/02/01 – 2026/02/14", finalStatus: "done", projectId: 2 },
  { id: "TASK-A02", title: "Q4 財務報表製作", desc: "整理 10-12 月財務資料並產出年度報表，提交董事會審核", status: "done", priority: "critical", type: "task", assignee: "張三", assigneeColor: "#3B82F6", dept: "財務部", dueDate: "2026-02-07", storyPoints: 5, labels: ["財務", "報表"], createdDate: "2026-02-01", archivedDate: "2026-02-14", sprintNum: 5, sprintRange: "2026/02/01 – 2026/02/14", finalStatus: "done", projectId: null },
  { id: "TASK-A03", title: "客戶 B 需求確認會議", desc: "與客戶 B 進行第二輪需求釐清，確認驗收標準", status: "done", priority: "high", type: "task", assignee: "王五", assigneeColor: "#EC4899", dept: "技術部", dueDate: "2026-02-10", storyPoints: 2, labels: ["客戶", "會議"], createdDate: "2026-02-03", archivedDate: "2026-02-14", sprintNum: 5, sprintRange: "2026/02/01 – 2026/02/14", finalStatus: "done", projectId: 3 },
  { id: "TASK-A04", title: "產品頁面 SEO 優化", desc: "改善 meta tags、sitemap 與結構化資料，提升搜尋排名", status: "done", priority: "medium", type: "improvement", assignee: "李四", assigneeColor: "#8B5CF6", dept: "行銷部", dueDate: "2026-02-12", storyPoints: 3, labels: ["網站", "行銷"], createdDate: "2026-02-02", archivedDate: "2026-02-14", sprintNum: 5, sprintRange: "2026/02/01 – 2026/02/14", finalStatus: "done", projectId: 4 },
  { id: "TASK-A05", title: "修復匯出 CSV 格式錯誤", desc: "匯出報表 CSV 檔案中文亂碼與欄位對齊問題", status: "done", priority: "high", type: "bug", assignee: "吳十", assigneeColor: "#0EA5E9", dept: "技術部", dueDate: "2026-02-06", storyPoints: 3, labels: ["Bug", "報表"], createdDate: "2026-02-01", archivedDate: "2026-02-14", sprintNum: 5, sprintRange: "2026/02/01 – 2026/02/14", finalStatus: "done", projectId: 1 },
  { id: "TASK-A06", title: "新員工入職流程標準化", desc: "建立 SOP 文件與 checklist，整合至 HR 系統", status: "done", priority: "medium", type: "story", assignee: "趙六", assigneeColor: "#F59E0B", dept: "人資部", dueDate: "2026-02-13", storyPoints: 5, labels: ["HR", "流程"], createdDate: "2026-02-03", archivedDate: "2026-02-14", sprintNum: 5, sprintRange: "2026/02/01 – 2026/02/14", finalStatus: "done", projectId: null },

  { id: "TASK-A07", title: "後台 Dashboard 重構", desc: "將 Dashboard 元件拆分模組化，導入 lazy loading 與 Suspense", status: "done", priority: "high", type: "improvement", assignee: "孫八", assigneeColor: "#EF4444", dept: "技術部", dueDate: "2026-02-28", storyPoints: 13, labels: ["前端", "效能"], createdDate: "2026-02-15", archivedDate: "2026-02-28", sprintNum: 6, sprintRange: "2026/02/15 – 2026/02/28", finalStatus: "done", projectId: 1 },
  { id: "TASK-A08", title: "年度員工滿意度調查", desc: "設計問卷、發放並統計分析結果，產出報告", status: "done", priority: "medium", type: "task", assignee: "趙六", assigneeColor: "#F59E0B", dept: "人資部", dueDate: "2026-02-25", storyPoints: 3, labels: ["HR", "問卷"], createdDate: "2026-02-15", archivedDate: "2026-02-28", sprintNum: 6, sprintRange: "2026/02/15 – 2026/02/28", finalStatus: "done", projectId: null },
  { id: "TASK-A09", title: "API Rate Limiting 實作", desc: "為公開 API 加入流量控制機制，防止濫用", status: "done", priority: "critical", type: "task", assignee: "吳十", assigneeColor: "#0EA5E9", dept: "技術部", dueDate: "2026-02-20", storyPoints: 5, labels: ["API", "安全"], createdDate: "2026-02-15", archivedDate: "2026-02-28", sprintNum: 6, sprintRange: "2026/02/15 – 2026/02/28", finalStatus: "done", projectId: 2 },
  { id: "TASK-A10", title: "品牌視覺更新提案", desc: "製作品牌識別更新提案書，包含 Logo 變體與色彩系統", status: "done", priority: "low", type: "story", assignee: "周九", assigneeColor: "#6366F1", dept: "行銷部", dueDate: "2026-02-27", storyPoints: 3, labels: ["設計", "品牌"], createdDate: "2026-02-17", archivedDate: "2026-02-28", sprintNum: 6, sprintRange: "2026/02/15 – 2026/02/28", finalStatus: "done", projectId: 6 },
  { id: "TASK-A11", title: "客戶端錯誤監控整合", desc: "導入 Sentry 進行前端錯誤追蹤與告警", status: "done", priority: "high", type: "improvement", assignee: "陳二", assigneeColor: "#84CC16", dept: "技術部", dueDate: "2026-02-22", storyPoints: 5, labels: ["DevOps", "監控"], createdDate: "2026-02-15", archivedDate: "2026-02-28", sprintNum: 6, sprintRange: "2026/02/15 – 2026/02/28", finalStatus: "done", projectId: 5 },
  { id: "TASK-A12", title: "2 月社群內容排程", desc: "規劃 2 月份 IG/FB/LinkedIn 貼文內容與互動策略", status: "done", priority: "low", type: "task", assignee: "林一", assigneeColor: "#D946EF", dept: "行銷部", dueDate: "2026-02-18", storyPoints: 2, labels: ["社群", "內容"], createdDate: "2026-02-15", archivedDate: "2026-02-28", sprintNum: 6, sprintRange: "2026/02/15 – 2026/02/28", finalStatus: "done", projectId: null },
  { id: "TASK-A13", title: "訂單通知信件模板優化", desc: "重新設計交易確認與出貨通知的 Email 模板", status: "review", priority: "medium", type: "story", assignee: "李四", assigneeColor: "#8B5CF6", dept: "行銷部", dueDate: "2026-02-28", storyPoints: 3, labels: ["行銷", "設計"], createdDate: "2026-02-18", archivedDate: "2026-02-28", sprintNum: 6, sprintRange: "2026/02/15 – 2026/02/28", finalStatus: "review", projectId: 1 },
  { id: "TASK-A14", title: "資料庫備份機制升級", desc: "將備份頻率從每日改為每 6 小時，並增加異地備援", status: "done", priority: "critical", type: "task", assignee: "王五", assigneeColor: "#EC4899", dept: "技術部", dueDate: "2026-02-24", storyPoints: 8, labels: ["DB", "安全"], createdDate: "2026-02-16", archivedDate: "2026-02-28", sprintNum: 6, sprintRange: "2026/02/15 – 2026/02/28", finalStatus: "done", projectId: 2 },
];

// ─── Assignee list ────────────────────────────────────────────────────────────
const ASSIGNEES = [
  { name: "張三", color: "#3B82F6", dept: "財務部" },
  { name: "李四", color: "#8B5CF6", dept: "行銷部" },
  { name: "王五", color: "#EC4899", dept: "技術部" },
  { name: "趙六", color: "#F59E0B", dept: "人資部" },
  { name: "錢七", color: "#10B981", dept: "總務部" },
  { name: "孫八", color: "#EF4444", dept: "技術部" },
  { name: "周九", color: "#6366F1", dept: "行銷部" },
  { name: "吳十", color: "#0EA5E9", dept: "�����術部" },
  { name: "林一", color: "#D946EF", dept: "行銷部" },
  { name: "陳二", color: "#84CC16", dept: "技術部" },
];

const DEPARTMENTS = ["財務部", "行銷部", "技術部", "人資部", "總務部"];
const LABEL_OPTIONS = ["財務", "報表", "網站", "行銷", "客戶", "會議", "招募", "HR", "採購", "Bug", "緊急", "效能", "DB", "預算", "規劃", "文件", "API", "DevOps", "自動化", "培訓", "安全", "稽核", "社群", "內容", "問卷"];

// ─── Sub-components ──────────────────────────────────────────────────────────
function Avatar({ name, color, size = 24 }: { name: string; color: string; size?: number }) {
  return (
    <div
      title={name}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: color, color: "#FFF",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.42, fontWeight: 700, flexShrink: 0,
        borderWidth: "1.5px", borderStyle: "solid", borderColor: "#FFF",
      }}
    >
      {name.charAt(0)}
    </div>
  );
}

function TypeIcon({ type, size = 16 }: { type: IssueType; size?: number }) {
  const cfg = TYPE_CFG[type];
  const icons: Record<IssueType, React.ReactNode> = {
    task:        <AlertCircle className="w-3 h-3" />,
    story:       <BookOpen    className="w-3 h-3" />,
    bug:         <Bug         className="w-3 h-3" />,
    improvement: <Zap         className="w-3 h-3" />,
  };
  return (
    <span
      title={cfg.label}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: size, height: size, borderRadius: 4,
        background: cfg.bg, color: cfg.color, flexShrink: 0,
      }}
    >
      {icons[type]}
    </span>
  );
}

function PriorityDot({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CFG[priority];
  return (
    <span
      title={cfg.label + "優先"}
      style={{
        fontSize: "14px", fontWeight: 900, color: cfg.color,
        lineHeight: 1, letterSpacing: "-1px", flexShrink: 0,
      }}
    >
      {cfg.icon}
    </span>
  );
}

// ─── Task Card (Kanban) ────────────────────────────────────────────────────────
function KanbanCard({
  task,
  onClick,
  onMove,
  columns,
  onDragStart,
  onDragEnd,
  isDragging,
  canDrag = true,
}: {
  task: Task;
  onClick: () => void;
  onMove: (id: string, status: Status) => void;
  columns: { key: Status }[];
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  canDrag?: boolean;
}) {
  const isOverdue = task.status !== "done" && task.dueDate < TODAY;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) { e.preventDefault(); return; }
        e.dataTransfer.setData("taskId", task.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.();
      }}
      onDragEnd={() => onDragEnd?.()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onClick}
      style={{
        background: "#FFFFFF",
        borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
        borderRadius: "10px",
        padding: "16px",
        cursor: canDrag ? "grab" : "default",
        position: "relative",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.15s, border-color 0.15s, opacity 0.15s",
        opacity: isDragging ? 0.35 : 1,
        transform: isDragging ? "rotate(1.5deg) scale(0.98)" : "none",
      }}
      onMouseEnter={(e) => {
        if (isDragging) return;
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 16px rgba(0,0,0,0.1)";
        (e.currentTarget as HTMLElement).style.borderColor = "#D1D5DB";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB";
        setMenuOpen(false);
      }}
    >
      {/* Top row: type + priority + menu */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TypeIcon type={task.type} size={20} />
          <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace", fontWeight: 600 }}>{task.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <PriorityDot priority={task.priority} />
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ color: "#9CA3AF" }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        {/* Move menu */}
        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute", top: 36, right: 10, zIndex: 10,
              background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
              borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              padding: "4px", minWidth: 130,
            }}
          >
            <p style={{ fontSize: "11px", color: "#9CA3AF", padding: "4px 8px 2px", fontWeight: 600 }}>移至欄位</p>
            {columns.filter(c => c.key !== task.status).map(c => (
              <button
                key={c.key}
                onClick={(e) => { e.stopPropagation(); onMove(task.id, c.key); setMenuOpen(false); }}
                className="w-full text-left px-2 py-1.5 rounded"
                style={{ fontSize: "13px", color: "#374151", display: "block" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {STATUS_CFG[c.key].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <p style={{ fontSize: "16px", fontWeight: 600, color: "#111827", lineHeight: 1.5, marginBottom: task.projectId ? "6px" : "10px" }}>
        {task.title}
      </p>

      {/* Project indicator */}
      {task.projectId != null && (() => {
        const proj = SHARED_PROJECTS.find(p => p.id === task.projectId);
        if (!proj) return null;
        return (
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: proj.color }} />
            <span className="truncate" style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>{proj.name}</span>
          </div>
        );
      })()}

      {/* Desc preview */}
      <p style={{ fontSize: "12px", fontWeight: 500, color: "#9CA3AF", lineHeight: 1.6, marginBottom: "10px" }} className="line-clamp-2">
        {task.desc}
      </p>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.labels.map(l => (
            <span
              key={l}
              style={{
                fontSize: "11px", padding: "2px 8px", borderRadius: "10px",
                background: "#F3F4F6", color: "#6B7280", fontWeight: 700,
              }}
            >
              {l}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", marginBottom: "10px" }} />

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5" style={{ color: isOverdue ? "#DC2626" : "#9CA3AF" }}>
          <CalendarDays className="w-3.5 h-3.5" />
          <span style={{ fontSize: "12px", fontWeight: 600 }}>{task.dueDate.slice(5)}</span>
          {isOverdue && <span style={{ fontSize: "13px", fontWeight: 600 }}>逾期</span>}
        </div>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: "13px", fontWeight: 700, color: "#6B7280",
              background: "#F3F4F6", borderRadius: 4, padding: "2px 7px",
            }}
          >
            {task.storyPoints}pt
          </span>
          <Avatar name={task.assignee} color={task.assigneeColor} size={26} />
        </div>
      </div>
    </div>
  );
}

// ─── Task Detail Modal ────────────────────────────────────────────────────────
function TaskDetail({ task, onClose, onMove, columns }: {
  task: Task;
  onClose: () => void;
  onMove: (id: string, status: Status) => void;
  columns: { key: Status }[];
}) {
  const sc  = STATUS_CFG[task.status];
  const pc  = PRIORITY_CFG[task.priority];
  const tc  = TYPE_CFG[task.type];
  const isOverdue = task.status !== "done" && task.dueDate < TODAY;

  // ── Mock sub-tasks per task id ──────────────────────────────────────
  const MOCK_SUBTASKS: Record<string, { id: string; text: string; done: boolean }[]> = {
    "TASK-001": [
      { id: "s1", text: "收集 1–3 月原始財務資料", done: true },
      { id: "s2", text: "建立季度彙整試算表", done: true },
      { id: "s3", text: "產出 PDF 報表並送審", done: true },
    ],
    "TASK-002": [
      { id: "s1", text: "撰寫新產品介紹文案", done: true },
      { id: "s2", text: "設計首頁 Banner 視覺稿", done: true },
      { id: "s3", text: "前端切版並上版", done: false },
    ],
    "TASK-003": [
      { id: "s1", text: "準備需求訪談問題清單", done: true },
      { id: "s2", text: "召開視訊會議", done: true },
      { id: "s3", text: "整理會議紀錄並寄送確認", done: false },
    ],
    "TASK-006": [
      { id: "s1", text: "複現問題並記錄環境資訊", done: true },
      { id: "s2", text: "定位根本原因（CSS z-index）", done: true },
      { id: "s3", text: "修復並撰寫單元測��", done: false },
      { id: "s4", text: "部署至 Staging 驗證", done: false },
    ],
    "TASK-008": [
      { id: "s1", text: "匯出慢查詢日誌（> 500ms）", done: true },
      { id: "s2", text: "分析 Top 10 瓶頸查詢", done: true },
      { id: "s3", text: "加入複合索引", done: true },
      { id: "s4", text: "重構 N+1 ORM 查詢", done: false },
    ],
    "TASK-011": [
      { id: "s1", text: "建立 GitHub Actions workflow 檔案", done: true },
      { id: "s2", text: "設定測試自動觸發條件", done: true },
      { id: "s3", text: "串接 Staging 自動部署", done: false },
      { id: "s4", text: "設定 Slack 通知", done: false },
      { id: "s5", text: "撰寫 CI/CD 操作文件", done: false },
    ],
  };
  const defaultSubtasks = [
    { id: "s1", text: "確認需求與範圍", done: true },
    { id: "s2", text: "執行主要工作項目", done: false },
    { id: "s3", text: "驗收與交付", done: false },
  ];

  const subtasks = MOCK_SUBTASKS[task.id] ?? defaultSubtasks;
  const [localSubtasks, setLocalSubtasks] = useState(subtasks);
  const doneCount = localSubtasks.filter(s => s.done).length;
  const progress  = Math.round((doneCount / localSubtasks.length) * 100);

  const toggleSub = (id: string) => {
    setLocalSubtasks(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const MOCK_ACTIVITY = [
    { actor: task.assignee, color: task.assigneeColor, action: "建立了此事項", date: task.createdDate },
    { actor: "系統管理者", color: "#6B7280", action: `將優先度設為「${pc.label}」`, date: task.createdDate },
    { actor: task.assignee, color: task.assigneeColor, action: `更新狀態為「${sc.label}」`, date: task.dueDate },
  ];

  const MOCK_COMMENTS_MAP: Record<string, CommentEntry[]> = {
    "TASK-001": [
      { id: "c1", actor: "陳小芬", color: "#7C3AED", text: "Q1 報告已完成，PDF 已上傳至共享雲端硬碟，請各位確認後簽核。", timestamp: "2026/03/02 10:24", likes: 2 },
      { id: "c2", actor: "系統管理者", color: "#374151", text: "收到，已轉交財務長審閱，預計本週五前回覆。", timestamp: "2026/03/02 11:05", likes: 0 },
    ],
    "TASK-002": [
      { id: "c1", actor: "林志偉", color: "#0284C7", text: "Banner 視覺稿已確認，前端這週開始切版，預計週四完成，有問題再同步。", timestamp: "2026/03/04 09:15", likes: 1 },
    ],
    "TASK-006": [
      { id: "c1", actor: "王大明", color: "#B45309", text: "已在本機複現，根本原因是 Modal z-index 與 Tooltip 衝突，正在 hotfix 分支處理。", timestamp: "2026/03/05 14:32", likes: 3 },
      { id: "c2", actor: "陳小芬", color: "#7C3AED", text: "謝謝確認，這個 bug 客戶那邊反映很久了，辛苦了！", timestamp: "2026/03/05 15:10", likes: 1 },
    ],
    "TASK-008": [
      { id: "c1", actor: "林志偉", color: "#0284C7", text: "慢查詢日誌已分析完畢，Top 3 瓶頸都在訂單查詢模組，加入複合索引後效能提升約 68%。", timestamp: "2026/03/06 16:00", likes: 5 },
    ],
  };

  const [comments, setComments] = useState<CommentEntry[]>(MOCK_COMMENTS_MAP[task.id] ?? []);
  const [inputText, setInputText] = useState("");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // ── External links ─────────────────────────────────────────────────
  type ExtLink = { id: string; title: string; url: string; type: "figma" | "google_doc" | "google_sheet" | "notion" | "github" | "other" };
  const LINK_TYPE_CFG: Record<ExtLink["type"], { label: string; color: string; bg: string; icon: string }> = {
    figma:        { label: "Figma",        color: "#A259FF", bg: "#F5F0FF", icon: "🎨" },
    google_doc:   { label: "Google 文件",   color: "#4285F4", bg: "#EBF3FF", icon: "📄" },
    google_sheet: { label: "Google 試算表", color: "#34A853", bg: "#EDFBF0", icon: "📊" },
    notion:       { label: "Notion",       color: "#111827", bg: "#F5F6F9", icon: "📝" },
    github:       { label: "GitHub",       color: "#111827", bg: "#F5F6F9", icon: "🐙" },
    other:        { label: "其他連結",      color: "#6B7280", bg: "#F9FAFB", icon: "🔗" },
  };
  const MOCK_LINKS_MAP: Record<string, ExtLink[]> = {
    "TASK-001": [
      { id: "l1", title: "Q1 財務報表範本", url: "https://docs.google.com/spreadsheets/d/example", type: "google_sheet" },
      { id: "l2", title: "報表封面設計稿", url: "https://www.figma.com/file/example", type: "figma" },
    ],
    "TASK-002": [
      { id: "l1", title: "官網改版設計稿", url: "https://www.figma.com/file/example", type: "figma" },
      { id: "l2", title: "文案需求文件", url: "https://docs.google.com/document/d/example", type: "google_doc" },
      { id: "l3", title: "素材整理 Notion", url: "https://notion.so/example", type: "notion" },
    ],
    "TASK-006": [
      { id: "l1", title: "Bug Report Issue #142", url: "https://github.com/example/issues/142", type: "github" },
    ],
    "TASK-011": [
      { id: "l1", title: "CI/CD 架構圖", url: "https://www.figma.com/file/example", type: "figma" },
      { id: "l2", title: "部署 SOP 文件", url: "https://docs.google.com/document/d/example", type: "google_doc" },
      { id: "l3", title: "GitHub Actions Repo", url: "https://github.com/example/actions", type: "github" },
    ],
  };
  const [extLinks, setExtLinks] = useState<ExtLink[]>(MOCK_LINKS_MAP[task.id] ?? []);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkType, setNewLinkType] = useState<ExtLink["type"]>("other");

  const detectLinkType = (url: string): ExtLink["type"] => {
    if (/figma\.com/i.test(url)) return "figma";
    if (/docs\.google\.com\/document/i.test(url)) return "google_doc";
    if (/docs\.google\.com\/spreadsheets/i.test(url)) return "google_sheet";
    if (/notion\.so/i.test(url)) return "notion";
    if (/github\.com/i.test(url)) return "github";
    return "other";
  };

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    const detectedType = detectLinkType(newLinkUrl.trim());
    setExtLinks(prev => [...prev, {
      id: `l${Date.now()}`,
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim(),
      type: detectedType,
    }]);
    setNewLinkTitle("");
    setNewLinkUrl("");
    setNewLinkType("other");
    setShowAddLink(false);
  };

  const removeLink = (id: string) => setExtLinks(prev => prev.filter(l => l.id !== id));

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const feedBottomRef = useRef<HTMLDivElement>(null);

  const nowTimestamp = () => {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const handleSubmitComment = () => {
    const text = inputText.trim();
    if (!text) return;
    const prefix = replyingTo ? `@${replyingTo} ` : "";
    setComments(prev => [...prev, {
      id: `c${Date.now()}`,
      actor: "系統管理者",
      color: "#374151",
      text: prefix + text,
      timestamp: nowTimestamp(),
      likes: 0,
    }]);
    setInputText("");
    setReplyingTo(null);
    setTimeout(() => feedBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const toggleLike = (id: string) => {
    setLikedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, likes: likedIds.has(id) ? c.likes - 1 : c.likes + 1 } : c
    ));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 max-md:p-0"
      style={{ background: "rgba(17,24,39,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full flex flex-col max-md:h-full max-md:rounded-none"
        style={{
          maxWidth: 1080, background: "#FFF", borderRadius: 14,
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)", maxHeight: "92vh", overflow: "hidden",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div
          className="px-7 max-md:px-4 py-4 flex items-center justify-between gap-4 flex-shrink-0"
          style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB", background: "#FAFAFA" }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <TypeIcon type={task.type} size={18} />
            <span style={{ fontSize: "13px", color: "#9CA3AF", fontFamily: "monospace" }}>{task.id}</span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "#D1D5DB", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", fontWeight: 600, background: tc.bg, color: tc.color, padding: "2px 10px", borderRadius: 6 }}>
              {tc.label}
            </span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "#D1D5DB", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", fontWeight: 600, background: pc.bg, color: pc.color, padding: "2px 10px", borderRadius: 6 }}>
              {pc.label}優先
            </span>
          </div>
          {/* Quick status pills + close */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1" style={{ background: "#F3F4F6", borderRadius: 8, padding: "3px" }}>
              {columns.map(c => {
                const cfg = STATUS_CFG[c.key];
                const isActive = c.key === task.status;
                return (
                  <button
                    key={c.key}
                    onClick={() => { if (!isActive) onMove(task.id, c.key); }}
                    style={{
                      fontSize: "12px", fontWeight: isActive ? 700 : 500,
                      padding: "4px 12px", borderRadius: 6,
                      background: isActive ? cfg.bg : "transparent",
                      color: isActive ? cfg.color : "#9CA3AF",
                      borderWidth: "1.5px",
                      borderStyle: "solid",
                      borderColor: isActive ? cfg.border : "transparent",
                      cursor: isActive ? "default" : "pointer",
                      transition: "all 0.15s", whiteSpace: "nowrap", fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#374151"; }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", background: "#FFF" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#FFF"; }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="flex max-md:flex-col overflow-hidden flex-1" style={{ minHeight: 0 }}>

          {/* ── Main ─────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-8 max-md:px-4 py-7 max-md:py-4" style={{ minWidth: 0 }}>

            {/* Title */}
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", lineHeight: 1.4, marginBottom: 16 }}>
              {task.title}
            </h1>

            {/* Quick info bar */}
            <div className="flex items-center gap-5 mb-7 flex-wrap">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                <Avatar name={task.assignee} color={task.assigneeColor} size={20} />
                <span style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>{task.assignee}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" style={{ color: isOverdue ? "#DC2626" : "#9CA3AF" }} />
                <span style={{ fontSize: "13px", color: isOverdue ? "#DC2626" : "#6B7280", fontWeight: isOverdue ? 700 : 500 }}>
                  {task.dueDate}{isOverdue ? " ⚠ 逾期" : ""}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                <span style={{ fontSize: "13px", color: "#374151", fontWeight: 700 }}>{task.storyPoints} pt</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                <span style={{ fontSize: "13px", color: "#6B7280" }}>{task.dept}</span>
              </div>
            </div>

            {/* Description */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4" style={{ color: "#6B7280" }} />
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#374151" }}>描述</span>
              </div>
              <div className="rounded-lg px-5 py-4" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                <p style={{ fontSize: "15px", color: "#4B5563", lineHeight: 1.85 }}>{task.desc}</p>
              </div>
            </section>

            {/* Sub-tasks */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#374151" }}>子任務</span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>{doneCount}/{localSubtasks.length}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: progress === 100 ? "#15803D" : "#6B7280" }}>{progress}%</span>
              </div>
              <div className="rounded-full mb-4 overflow-hidden" style={{ height: 6, background: "#E5E7EB" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: progress === 100 ? "#15803D" : "#2563EB" }}
                />
              </div>
              <div className="space-y-2">
                {localSubtasks.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer"
                    style={{ background: s.done ? "#F0FDF4" : "#F9FAFB", border: `1px solid ${s.done ? "#BBF7D0" : "#F3F4F6"}` }}
                    onClick={() => toggleSub(s.id)}
                  >
                    {s.done
                      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#16A34A" }} />
                      : <Circle       className="w-4 h-4 flex-shrink-0" style={{ color: "#D1D5DB" }} />
                    }
                    <span style={{ fontSize: "15px", color: s.done ? "#6B7280" : "#111827", textDecoration: s.done ? "line-through" : "none", fontWeight: 500 }}>
                      {s.text}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Labels */}
            {task.labels.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#374151" }}>標籤</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.labels.map(l => (
                    <span
                      key={l}
                      style={{ fontSize: "13px", padding: "4px 12px", borderRadius: 20, background: "#EFF6FF", color: "#2563EB", fontWeight: 700, borderWidth: "1px", borderStyle: "solid", borderColor: "#BFDBFE" }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* External Links */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#374151" }}>外部連結</span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>{extLinks.length}</span>
                </div>
                <button
                  onClick={() => setShowAddLink(!showAddLink)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                  style={{ fontSize: "12px", fontWeight: 700, color: "#2563EB", background: "#EFF6FF", borderWidth: "1px", borderStyle: "solid", borderColor: "#BFDBFE", transition: "all 0.15s" }}
                >
                  <Plus className="w-3 h-3" />
                  新增連結
                </button>
              </div>

              {/* Add link form */}
              {showAddLink && (
                <div className="rounded-xl mb-3 p-4" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={newLinkTitle}
                      onChange={e => setNewLinkTitle(e.target.value)}
                      placeholder="連結名稱（如：設計稿 v2）"
                      className="w-full rounded-lg px-3.5 py-2.5 outline-none"
                      style={{ fontSize: "13px", background: "#FFFFFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#111827" }}
                    />
                    <input
                      type="url"
                      value={newLinkUrl}
                      onChange={e => {
                        setNewLinkUrl(e.target.value);
                        setNewLinkType(detectLinkType(e.target.value));
                      }}
                      placeholder="貼上網址（自動偵測 Figma、Google 文件、Notion…）"
                      className="w-full rounded-lg px-3.5 py-2.5 outline-none"
                      style={{ fontSize: "13px", background: "#FFFFFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#111827" }}
                    />
                    {newLinkUrl.trim() && (
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>偵測類型：</span>
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{ fontSize: "11px", fontWeight: 700, color: LINK_TYPE_CFG[newLinkType].color, background: LINK_TYPE_CFG[newLinkType].bg }}
                        >
                          {LINK_TYPE_CFG[newLinkType].icon} {LINK_TYPE_CFG[newLinkType].label}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleAddLink}
                        disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg"
                        style={{
                          fontSize: "13px", fontWeight: 700,
                          background: (newLinkTitle.trim() && newLinkUrl.trim()) ? "#111827" : "#F3F4F6",
                          color: (newLinkTitle.trim() && newLinkUrl.trim()) ? "#FFFFFF" : "#D1D5DB",
                          cursor: (newLinkTitle.trim() && newLinkUrl.trim()) ? "pointer" : "not-allowed",
                          transition: "all 0.15s",
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        新增
                      </button>
                      <button
                        onClick={() => { setShowAddLink(false); setNewLinkTitle(""); setNewLinkUrl(""); }}
                        className="px-4 py-1.5 rounded-lg"
                        style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280", background: "#FFFFFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Link list */}
              {extLinks.length > 0 ? (
                <div className="space-y-2">
                  {extLinks.map(link => {
                    const cfg = LINK_TYPE_CFG[link.type];
                    return (
                      <div
                        key={link.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg group"
                        style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6", transition: "all 0.15s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "#F3F4F6"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "#F9FAFB"; }}
                      >
                        <span
                          className="flex items-center justify-center rounded-lg flex-shrink-0"
                          style={{ width: 32, height: 32, background: cfg.bg, fontSize: "15px" }}
                        >
                          {cfg.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:underline"
                            style={{ fontSize: "13px", fontWeight: 600, color: "#111827", textDecoration: "none" }}
                          >
                            <span className="truncate">{link.title}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" style={{ color: "#9CA3AF" }} />
                          </a>
                          <span
                            className="px-1.5 py-0.5 rounded mt-0.5 inline-block"
                            style={{ fontSize: "10px", fontWeight: 700, color: cfg.color, background: cfg.bg }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <button
                          onClick={() => removeLink(link.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md flex-shrink-0"
                          style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#DC2626"; (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          title="移除連結"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg px-5 py-6 text-center" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                  <Link className="w-5 h-5 mx-auto mb-2" style={{ color: "#D1D5DB" }} />
                  <p style={{ fontSize: "13px", color: "#9CA3AF" }}>尚未新增外部連結</p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: 4 }}>點擊上方「新增連結」加入 Figma、Google 文件等</p>
                </div>
              )}
            </section>

            {/* Activity log */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#374151" }}>活動紀錄</span>
                </div>
                <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>
                  {comments.length} 則留言
                </span>
              </div>

              {/* System activity entries */}
              <div className="space-y-0 mb-4">
                {MOCK_ACTIVITY.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 py-2.5"
                    style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Avatar name={a.actor} color={a.color} size={26} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>{a.actor}</span>
                      <span style={{ fontSize: "13px", color: "#9CA3AF" }}> {a.action}</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#C4C9D4", whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 }}>{a.date}</span>
                  </div>
                ))}
              </div>

              {/* Comment bubbles */}
              {comments.length > 0 && (
                <div className="space-y-3 mb-5">
                  {comments.map((c) => {
                    const isSelf = c.actor === "系統管理者";
                    const liked = likedIds.has(c.id);
                    return (
                      <div key={c.id} className={`flex items-start gap-3 ${isSelf ? "flex-row-reverse" : ""}`}>
                        <div className="flex-shrink-0 mt-1">
                          <Avatar name={c.actor} color={c.color} size={30} />
                        </div>
                        <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"} max-w-[78%]`}>
                          <div className={`flex items-center gap-2 mb-1 ${isSelf ? "flex-row-reverse" : ""}`}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>{c.actor}</span>
                            <span style={{ fontSize: "11px", color: "#C4C9D4" }}>{c.timestamp}</span>
                          </div>
                          <div
                            style={{
                              background: isSelf ? "#EFF6FF" : "#F9FAFB",
                              border: `1px solid ${isSelf ? "#BFDBFE" : "#E5E7EB"}`,
                              borderRadius: isSelf ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                              padding: "10px 14px",
                              fontSize: "14px",
                              color: "#111827",
                              lineHeight: 1.7,
                              wordBreak: "break-word",
                            }}
                          >
                            {c.text.startsWith("@") ? (
                              <>
                                <span style={{ color: "#2563EB", fontWeight: 700 }}>
                                  {c.text.split(" ")[0]}
                                </span>
                                {" " + c.text.split(" ").slice(1).join(" ")}
                              </>
                            ) : c.text}
                          </div>
                          {/* Reaction row */}
                          <div className={`flex items-center gap-2 mt-1.5 ${isSelf ? "flex-row-reverse" : ""}`}>
                            <button
                              onClick={() => toggleLike(c.id)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                              style={{
                                fontSize: "11px", fontWeight: 600,
                                color: liked ? "#2563EB" : "#9CA3AF",
                                background: liked ? "#EFF6FF" : "transparent",
                                border: `1px solid ${liked ? "#BFDBFE" : "transparent"}`,
                                transition: "all 0.15s",
                              }}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              {(c.likes + (liked ? 1 : 0)) > 0 && (
                                <span>{c.likes + (liked ? 1 : 0)}</span>
                              )}
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => {
                                  setReplyingTo(c.actor);
                                  textareaRef.current?.focus();
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                                style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF" }}
                              >
                                <Reply className="w-3 h-3" />
                                <span>回覆</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={feedBottomRef} />
                </div>
              )}

              {/* Comment input */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", background: "#FFFFFF" }}
              >
                {/* Reply hint */}
                {replyingTo && (
                  <div
                    className="flex items-center justify-between px-4 py-2"
                    style={{ background: "#EFF6FF", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#BFDBFE" }}
                  >
                    <span style={{ fontSize: "12px", color: "#2563EB", fontWeight: 600 }}>
                      回覆給 @{replyingTo}
                    </span>
                    <button onClick={() => setReplyingTo(null)}>
                      <X className="w-3.5 h-3.5" style={{ color: "#93C5FD" }} />
                    </button>
                  </div>
                )}
                <div className="flex items-start gap-3 px-4 pt-3 pb-2">
                  <div className="flex-shrink-0 mt-1">
                    <Avatar name="系統管理者" color="#374151" size={28} />
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="新增留言…（Enter 送出 / Shift+Enter 換行）"
                    rows={2}
                    style={{
                      flex: 1,
                      resize: "none",
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: "14px",
                      color: "#111827",
                      lineHeight: 1.7,
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 pb-3">
                  <span style={{ fontSize: "11px", color: "#D1D5DB" }}>
                    {inputText.length > 0 ? `${inputText.length} 字` : ""}
                  </span>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!inputText.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg"
                    style={{
                      fontSize: "13px", fontWeight: 700,
                      background: inputText.trim() ? "#111827" : "#F3F4F6",
                      color: inputText.trim() ? "#FFFFFF" : "#D1D5DB",
                      border: "none", cursor: inputText.trim() ? "pointer" : "not-allowed",
                      transition: "all 0.15s",
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    送出
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <div
            className="flex-shrink-0 overflow-y-auto py-7 max-md:py-4 px-6 max-md:px-4 max-md:w-full"
            style={{ width: 280, borderLeftWidth: "1px", borderLeftStyle: "solid", borderLeftColor: "#E5E7EB", background: "#FAFAFA" }}
          >
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 16 }}>詳細資訊</p>
            <div className="space-y-5">

              {/* Status */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: 600 }}>狀態</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, background: sc.bg, color: sc.color, padding: "4px 12px", borderRadius: 8, display: "inline-block", border: `1px solid ${sc.border}` }}>
                  {sc.label}
                </span>
              </div>

              {/* Priority */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Flag className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: 600 }}>優先度</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, background: pc.bg, color: pc.color, padding: "4px 12px", borderRadius: 8, display: "inline-block" }}>
                  {pc.label}
                </span>
              </div>

              {/* Type */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <GitBranch className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: 600 }}>類型</span>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, background: tc.bg, color: tc.color, padding: "4px 12px", borderRadius: 8, display: "inline-block" }}>
                  {tc.label}
                </span>
              </div>

              {/* Assignee */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: 600 }}>負責人</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar name={task.assignee} color={task.assigneeColor} size={26} />
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>{task.assignee}</span>
                </div>
              </div>

              {/* Department */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Building2 className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: 600 }}>部門</span>
                </div>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>{task.dept}</span>
              </div>

              {/* Due date */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CalendarDays className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: 600 }}>截止日期</span>
                </div>
                <span style={{ fontSize: "15px", fontWeight: 600, color: isOverdue ? "#DC2626" : "#374151" }}>
                  {task.dueDate}{isOverdue ? " ⚠" : ""}
                </span>
              </div>

              {/* Created date */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: 600 }}>建立日期</span>
                </div>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>{task.createdDate}</span>
              </div>

              {/* Story points */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BarChart2 className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: 600 }}>故事點數</span>
                </div>
                <span style={{ fontSize: "22px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                  {task.storyPoints}
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#9CA3AF", marginLeft: 4 }}>pt</span>
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB", margin: "24px 0" }} />

            {/* Sub-task progress summary */}
            <div className="mb-6">
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 10 }}>子任務進度</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 8, background: "#E5E7EB" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: progress === 100 ? "#15803D" : "#2563EB" }}
                  />
                </div>
                <span style={{ fontSize: "13px", fontWeight: 800, color: progress === 100 ? "#15803D" : "#2563EB", whiteSpace: "nowrap" }}>
                  {doneCount}/{localSubtasks.length}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB", marginBottom: 20 }} />

            {/* Project info */}
            {task.projectId != null && (() => {
              const proj = SHARED_PROJECTS.find(p => p.id === task.projectId);
              if (!proj) return null;
              const stCfg = PROJECT_STATUS_CFG[proj.status];
              const projPct = proj.totalPoints > 0 ? Math.round((proj.completedPoints / proj.totalPoints) * 100) : 0;
              return (
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 10 }}>所屬專案</p>
                  <div className="px-3 py-2.5 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: proj.color }} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{proj.name}</span>
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, background: stCfg.bg, color: stCfg.color }}>{stCfg.label}</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: 4 }}>{proj.client} · {proj.manager}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1" style={{ height: 4, borderRadius: 2, background: "#E5E7EB" }}>
                        <div style={{ width: `${projPct}%`, height: "100%", borderRadius: 2, background: proj.color, transition: "width 0.3s" }} />
                      </div>
                      <span className="tabular-nums" style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600 }}>{projPct}%</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Sprint info */}
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 10 }}>所屬 Sprint</p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: "#EFF6FF", borderWidth: "1px", borderStyle: "solid", borderColor: "#BFDBFE" }}>
                <GitBranch className="w-3.5 h-3.5" style={{ color: "#2563EB", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#1D4ED8" }}>Sprint 7</p>
                  <p style={{ fontSize: "11px", color: "#3B82F6" }}>2026/03/01 – 2026/03/14</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Task Modal ───────────────────────────────────────────────────────
function CreateTaskModal({
  onClose,
  onCreate,
  defaultStatus,
  currentSprintNum,
  currentSprintStart,
  currentSprintEnd,
  sprintStatus: spStatus,
  defaultProjectId,
}: {
  onClose: () => void;
  onCreate: (task: Task) => void;
  defaultStatus?: Status;
  currentSprintNum: number;
  currentSprintStart: string;
  currentSprintEnd: string;
  sprintStatus: "idle" | "active" | "completed";
  defaultProjectId?: string;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<Status>(defaultStatus ?? "todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [type, setType] = useState<IssueType>("task");
  const [assigneeIdx, setAssigneeIdx] = useState(0);
  const [dept, setDept] = useState(ASSIGNEES[0].dept);
  const [dueDate, setDueDate] = useState("");
  const [storyPoints, setStoryPoints] = useState(3);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<string>(String(currentSprintNum));
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId ?? "none");
  const labelsRef = useRef<HTMLDivElement>(null);

  // Sprint options
  const sprintOptions = useMemo(() => {
    const opts: { key: string; label: string; sub?: string; active?: boolean }[] = [];
    // Current sprint
    const statusLabel = spStatus === "active" ? "進行中" : spStatus === "completed" ? "���結束" : "規劃中";
    opts.push({
      key: String(currentSprintNum),
      label: `Sprint ${currentSprintNum}（${statusLabel}）`,
      sub: `${currentSprintStart.replace(/-/g, "/")} – ${currentSprintEnd.replace(/-/g, "/")}`,
      active: true,
    });
    // Next sprint (planned)
    const nextNum = currentSprintNum + 1;
    const spEndDate = new Date(currentSprintEnd);
    const spDays = Math.max(1, Math.ceil((spEndDate.getTime() - new Date(currentSprintStart).getTime()) / 86400000));
    const nextStart = new Date(spEndDate.getTime() + 86400000);
    const nextEnd = new Date(nextStart.getTime() + spDays * 86400000);
    const fmtD = (d: Date) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
    opts.push({
      key: String(nextNum),
      label: `Sprint ${nextNum}（下一期）`,
      sub: `${fmtD(nextStart)} – ${fmtD(nextEnd)}`,
    });
    return opts;
  }, [currentSprintNum, currentSprintStart, currentSprintEnd, spStatus]);

  // Sync dept when assignee changes
  const handleAssigneeChange = (idx: number) => {
    setAssigneeIdx(idx);
    setDept(ASSIGNEES[idx].dept);
  };

  // Close labels dropdown on outside click
  useEffect(() => {
    if (!labelsOpen) return;
    const handler = (e: Event) => {
      if (labelsRef.current && !labelsRef.current.contains(e.target as Node)) {
        setLabelsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [labelsOpen]);

  const toggleLabel = (l: string) => {
    setSelectedLabels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const canSubmit = title.trim().length > 0 && dueDate.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const a = ASSIGNEES[assigneeIdx];
    const newId = `TASK-${String(Date.now()).slice(-3).padStart(3, "0")}`;
    onCreate({
      id: newId,
      title: title.trim(),
      desc: desc.trim(),
      status,
      priority,
      type,
      assignee: a.name,
      assigneeColor: a.color,
      dept,
      dueDate,
      storyPoints,
      labels: selectedLabels,
      createdDate: TODAY,
      sprintNum: Number(selectedSprint),
      projectId: selectedProjectId === "none" ? null : Number(selectedProjectId),
    });
    onClose();
  };

  const fieldLabel = (text: string, required?: boolean) => (
    <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
      {text}{required && <span style={{ color: "#DC2626", marginLeft: 2 }}>*</span>}
    </label>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#E5E7EB",
    fontSize: "14px",
    color: "#111827",
    background: "#FFFFFF",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 max-md:p-0"
      style={{ background: "rgba(17,24,39,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full flex flex-col max-md:h-full max-md:rounded-none"
        style={{
          maxWidth: 640, background: "#FFF", borderRadius: 14,
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)", maxHeight: "92vh", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="px-7 max-md:px-4 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB", background: "#FAFAFA" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#111827" }}>
              <Plus className="w-4 h-4" style={{ color: "#FFF" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>建立新事項</h2>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 1 }}>填寫事項資訊以新增至看板</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", background: "#FFF" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#FFF"; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 max-md:px-4 py-6" style={{ minHeight: 0 }}>
          <div className="space-y-5">

            {/* Title */}
            <div>
              {fieldLabel("事項標題", true)}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：完成第二季財務報表"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#111827"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
              />
            </div>

            {/* Description */}
            <div>
              {fieldLabel("描述")}
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="詳細描述事項內容…"
                rows={3}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.7 }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#111827"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
              />
            </div>

            {/* Row: Status + Priority + Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                {fieldLabel("狀態")}
                <StyledSelect
                  value={status}
                  onChange={(v) => setStatus(v as Status)}
                  options={(["todo", "inProgress"] as Status[]).map(s => ({ key: s, label: STATUS_CFG[s].label }))}
                  formField
                />
              </div>
              <div>
                {fieldLabel("優先度")}
                <StyledSelect
                  value={priority}
                  onChange={(v) => setPriority(v as Priority)}
                  options={(["critical", "high", "medium", "low"] as Priority[]).map(p => ({ key: p, label: PRIORITY_CFG[p].label }))}
                  formField
                />
              </div>
              <div>
                {fieldLabel("類型")}
                <StyledSelect
                  value={type}
                  onChange={(v) => setType(v as IssueType)}
                  options={(["task", "story", "bug", "improvement"] as IssueType[]).map(t => ({ key: t, label: TYPE_CFG[t].label }))}
                  formField
                />
              </div>
            </div>

            {/* Row: Assignee + Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {fieldLabel("負責人", true)}
                <StyledSelect
                  value={String(assigneeIdx)}
                  onChange={(v) => handleAssigneeChange(Number(v))}
                  options={ASSIGNEES.map((a, i) => ({ key: String(i), label: `${a.name}（${a.dept}）` }))}
                  formField
                />
              </div>
              <div>
                {fieldLabel("部門")}
                <StyledSelect
                  value={dept}
                  onChange={(v) => setDept(v)}
                  options={DEPARTMENTS.map(d => ({ key: d, label: d }))}
                  formField
                />
              </div>
            </div>

            {/* Row: Project */}
            <div>
              {fieldLabel("所屬專案")}
              <StyledSelect
                value={selectedProjectId}
                onChange={v => setSelectedProjectId(v)}
                options={[
                  { key: "none", label: "無（獨立任務）" },
                  ...SHARED_PROJECTS
                    .filter(p => p.status === "inProgress" || p.status === "planning")
                    .map(p => ({ key: String(p.id), label: `${p.name}` })),
                ]}
                formField
              />
              {selectedProjectId !== "none" && (() => {
                const proj = SHARED_PROJECTS.find(p => p.id === Number(selectedProjectId));
                if (!proj) return null;
                const stCfg = PROJECT_STATUS_CFG[proj.status];
                return (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: proj.color }} />
                    <div className="flex-1 min-w-0">
                      <span style={{ fontSize: "12px", color: "#374151" }}>{proj.client}</span>
                      <span style={{ fontSize: "11px", color: "#9CA3AF", marginLeft: 6 }}>{proj.completedPoints}/{proj.totalPoints} pts</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, background: stCfg.bg, color: stCfg.color }}>{stCfg.label}</span>
                  </div>
                );
              })()}
            </div>

            {/* Row: Sprint */}
            <div>
              {fieldLabel("所屬 Sprint")}
              <div className="flex flex-col gap-1.5">
                {sprintOptions.map(opt => {
                  const active = selectedSprint === opt.key;
                  const isCurrent = opt.active;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedSprint(opt.key)}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-lg text-left transition-all w-full"
                      style={{
                        background: active ? "#EFF6FF" : "#FAFAFA",
                        borderWidth: active ? "1.5px" : "1px",
                        borderStyle: "solid",
                        borderColor: active ? "#2563EB" : "#E5E7EB",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = "#D1D5DB"; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = "#E5E7EB"; }}
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: active ? "#DBEAFE" : "#F0FDF4",
                        }}
                      >
                        <GitBranch className="w-4 h-4" style={{ color: active ? "#2563EB" : isCurrent ? "#15803D" : "#6B7280" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: "13px", fontWeight: active ? 700 : 500, color: active ? "#1D4ED8" : "#374151" }}>
                            {opt.label}
                          </span>
                        </div>
                        {opt.sub && (
                          <span style={{ fontSize: "11px", color: active ? "#3B82F6" : "#9CA3AF" }}>
                            {opt.sub}
                          </span>
                        )}
                      </div>
                      {/* Radio indicator */}
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 18, height: 18, borderRadius: "50%",
                          borderWidth: active ? "5px" : "2px", borderStyle: "solid",
                          borderColor: active ? "#2563EB" : "#D1D5DB",
                          background: "#FFF",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row: Due date + Story points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {fieldLabel("截止日期", true)}
                <DatePicker
                  value={dueDate}
                  onChange={(v) => setDueDate(v)}
                  placeholder="選擇截止日期"
                  formField
                />
              </div>
              <div>
                {fieldLabel("故事點數")}
                <div className="flex items-center gap-0" style={{ borderRadius: 8, overflow: "hidden", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", display: "inline-flex" }}>
                  <button
                    onClick={() => setStoryPoints(Math.max(1, storyPoints - 1))}
                    className="flex items-center justify-center"
                    style={{
                      width: 36, height: 36,
                      background: storyPoints <= 1 ? "#F9FAFB" : "#FFF",
                      color: storyPoints <= 1 ? "#D1D5DB" : "#374151",
                      cursor: storyPoints <= 1 ? "not-allowed" : "pointer",
                      borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "#E5E7EB",
                      transition: "all 0.15s", flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { if (storyPoints > 1) (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = storyPoints <= 1 ? "#F9FAFB" : "#FFF"; }}
                    disabled={storyPoints <= 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 56, height: 36,
                      background: "#FFF", color: "#111827",
                      fontSize: "15px", fontWeight: 700,
                      userSelect: "none",
                    }}
                  >
                    {storyPoints}<span style={{ fontSize: "11px", fontWeight: 500, marginLeft: 2, opacity: 0.7 }}>pt</span>
                  </div>
                  <button
                    onClick={() => setStoryPoints(Math.min(99, storyPoints + 1))}
                    className="flex items-center justify-center"
                    style={{
                      width: 36, height: 36,
                      background: storyPoints >= 99 ? "#F9FAFB" : "#FFF",
                      color: storyPoints >= 99 ? "#D1D5DB" : "#374151",
                      cursor: storyPoints >= 99 ? "not-allowed" : "pointer",
                      borderLeftWidth: "1px", borderLeftStyle: "solid", borderLeftColor: "#E5E7EB",
                      transition: "all 0.15s", flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { if (storyPoints < 99) (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = storyPoints >= 99 ? "#F9FAFB" : "#FFF"; }}
                    disabled={storyPoints >= 99}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Labels */}
            <div>
              {fieldLabel("標籤")}
              {/* Selected labels */}
              {selectedLabels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedLabels.map(l => (
                    <span
                      key={l}
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => toggleLabel(l)}
                      style={{
                        fontSize: "12px", padding: "3px 10px", borderRadius: 12,
                        background: "#EFF6FF", color: "#2563EB", fontWeight: 600,
                        borderWidth: "1px", borderStyle: "solid", borderColor: "#BFDBFE",
                      }}
                    >
                      {l}
                      <X className="w-3 h-3" />
                    </span>
                  ))}
                </div>
              )}
              {/* Labels dropdown */}
              <div ref={labelsRef} className="relative">
                <button
                  onClick={() => setLabelsOpen(!labelsOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg w-full"
                  style={{
                    background: "#F9FAFB",
                    borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
                    fontSize: "13px", color: "#9CA3AF", cursor: "pointer", fontFamily: "inherit",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {selectedLabels.length > 0 ? `已選 ${selectedLabels.length} 個標籤` : "點選選擇標籤"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" style={{ transform: labelsOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                </button>
                {labelsOpen && (
                  <div
                    className="absolute left-0 right-0 mt-1 rounded-lg overflow-auto"
                    style={{
                      background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxHeight: 200, zIndex: 20,
                    }}
                  >
                    <div className="p-1.5 grid grid-cols-3 max-md:grid-cols-2 gap-0.5">
                      {LABEL_OPTIONS.map(l => {
                        const active = selectedLabels.includes(l);
                        return (
                          <button
                            key={l}
                            onClick={() => toggleLabel(l)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded"
                            style={{
                              fontSize: "12px", fontWeight: active ? 700 : 500,
                              color: active ? "#2563EB" : "#374151",
                              background: active ? "#EFF6FF" : "transparent",
                              textAlign: "left", fontFamily: "inherit", cursor: "pointer",
                            }}
                            onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                            onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          >
                            <div
                              className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0"
                              style={{
                                borderWidth: "1.5px", borderStyle: "solid",
                                borderColor: active ? "#2563EB" : "#D1D5DB",
                                background: active ? "#2563EB" : "transparent",
                              }}
                            >
                              {active && <Check className="w-2.5 h-2.5" style={{ color: "#FFF" }} />}
                            </div>
                            {l}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-7 max-md:px-4 py-4 flex items-center justify-between gap-3 flex-shrink-0"
          style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB", background: "#FAFAFA" }}
        >
          <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
            <span style={{ color: "#DC2626" }}>*</span> 為必填欄位
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg"
              style={{
                fontSize: "13px", fontWeight: 600, color: "#6B7280",
                borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
                background: "#FFF", cursor: "pointer", fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#FFF"; }}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg"
              style={{
                fontSize: "13px", fontWeight: 700,
                background: canSubmit ? "#111827" : "#E5E7EB",
                color: canSubmit ? "#FFF" : "#9CA3AF",
                cursor: canSubmit ? "pointer" : "not-allowed",
                borderWidth: "1px", borderStyle: "solid",
                borderColor: canSubmit ? "#111827" : "#E5E7EB",
                transition: "all 0.15s", fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
              onMouseLeave={(e) => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = "#111827"; }}
            >
              <Plus className="w-3.5 h-3.5" />
              建立事項
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sprint Config Modal (large) ──────────────────────────────────────────────
const SPRINT_ALL_EMPLOYEES = EMPLOYEES
  .filter(e => e.status === "active" || e.status === "probation")
  .map(e => ({ id: e.id, name: e.name, dept: e.dept, role: e.role, email: e.email }));

const SPRINT_DEPT_LIST = Array.from(new Set(SPRINT_ALL_EMPLOYEES.map(e => e.dept)));

const DURATION_PRESETS = [
  { label: "1 週", days: 7 },
  { label: "2 週", days: 14 },
  { label: "3 週", days: 21 },
  { label: "4 週", days: 28 },
];

type ConfigStep = "basic" | "members";

function SprintConfigModal({
  sprintNum, sprintStart, sprintEnd,
  onChangeNum, onChangeStart, onChangeEnd,
  sprintMembers, onChangeMembers,
  sprintGoal, onChangeGoal,
  tasks,
  onClose, onConfirm,
}: {
  sprintNum: number; sprintStart: string; sprintEnd: string;
  onChangeNum: (n: number) => void; onChangeStart: (d: string) => void; onChangeEnd: (d: string) => void;
  sprintMembers: number[]; onChangeMembers: (ids: number[]) => void;
  sprintGoal: string; onChangeGoal: (g: string) => void;
  tasks: Task[];
  onClose: () => void; onConfirm: () => void;
}) {
  const [step, setStep] = useState<ConfigStep>("basic");
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [leftDeptFilter, setLeftDeptFilter] = useState("all");
  const [leftChecked, setLeftChecked] = useState<Set<number>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<number>>(new Set());

  const available = useMemo(() =>
    SPRINT_ALL_EMPLOYEES.filter(e => !sprintMembers.includes(e.id)), [sprintMembers]);
  const selected = useMemo(() =>
    SPRINT_ALL_EMPLOYEES.filter(e => sprintMembers.includes(e.id)), [sprintMembers]);

  const filteredLeft = useMemo(() => {
    let list = available;
    if (leftDeptFilter !== "all") list = list.filter(e => e.dept === leftDeptFilter);
    if (leftSearch.trim()) {
      const q = leftSearch.trim().toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q) || e.role.toLowerCase().includes(q));
    }
    return list;
  }, [available, leftDeptFilter, leftSearch]);

  const filteredRight = useMemo(() => {
    if (!rightSearch.trim()) return selected;
    const q = rightSearch.trim().toLowerCase();
    return selected.filter(e => e.name.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q));
  }, [selected, rightSearch]);

  const moveRight = () => {
    if (leftChecked.size === 0) return;
    onChangeMembers([...sprintMembers, ...Array.from(leftChecked)]);
    setLeftChecked(new Set());
  };
  const moveLeft = () => {
    if (rightChecked.size === 0) return;
    onChangeMembers(sprintMembers.filter(id => !rightChecked.has(id)));
    setRightChecked(new Set());
  };
  const moveAllRight = () => {
    onChangeMembers([...sprintMembers, ...filteredLeft.map(e => e.id)]);
    setLeftChecked(new Set());
  };
  const moveAllLeft = () => {
    onChangeMembers([]);
    setRightChecked(new Set());
  };

  const toggleLeftCheck = (id: number) => {
    setLeftChecked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const toggleRightCheck = (id: number) => {
    setRightChecked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const toggleAllLeft = () => {
    if (leftChecked.size === filteredLeft.length && filteredLeft.length > 0) setLeftChecked(new Set());
    else setLeftChecked(new Set(filteredLeft.map(e => e.id)));
  };
  const toggleAllRight = () => {
    if (rightChecked.size === filteredRight.length && filteredRight.length > 0) setRightChecked(new Set());
    else setRightChecked(new Set(filteredRight.map(e => e.id)));
  };

  const sprintDays = sprintStart && sprintEnd
    ? Math.max(0, Math.ceil((new Date(sprintEnd).getTime() - new Date(sprintStart).getTime()) / 86400000))
    : 0;

  const dateError = sprintStart && sprintEnd && new Date(sprintEnd) <= new Date(sprintStart);

  // Auto-set end date from preset
  const applyPreset = (days: number) => {
    if (!sprintStart) return;
    const start = new Date(sprintStart);
    const end = new Date(start.getTime() + days * 86400000);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    onChangeEnd(fmt(end));
  };

  // Auto-adjust end date when start date changes
  const handleStartChange = (d: string) => {
    const oldDuration = sprintDays > 0 ? sprintDays : 14;
    onChangeStart(d);
    if (d) {
      const start = new Date(d);
      const end = new Date(start.getTime() + oldDuration * 86400000);
      const fmt = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      onChangeEnd(fmt(end));
    }
  };

  // Department distribution of selected members
  const deptDistribution = useMemo(() => {
    const map = new Map<string, number>();
    selected.forEach(e => map.set(e.dept, (map.get(e.dept) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [selected]);

  // Task stats for overview
  const totalTasks = tasks.length;
  const totalPoints = tasks.reduce((s, t) => s + t.storyPoints, 0);
  const avgPointsPerPerson = sprintMembers.length > 0 ? Math.round(totalPoints / sprintMembers.length * 10) / 10 : 0;

  // Capacity model
  const PTS_PER_PERSON_PER_14D = 6;
  const capacityPerPerson = sprintDays > 0 ? Math.round(PTS_PER_PERSON_PER_14D * (sprintDays / 14) * 10) / 10 : 0;
  const teamCapacity = Math.round(sprintMembers.length * capacityPerPerson);
  const usagePct = teamCapacity > 0 ? Math.round((totalPoints / teamCapacity) * 100) : 0;
  const capacityStatus: { label: string; color: string; bg: string; border: string }
    = usagePct <= 70 ? { label: "有餘裕", color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" }
    : usagePct <= 90 ? { label: "合理", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" }
    : usagePct <= 110 ? { label: "緊湊", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" }
    : { label: "超量", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" };

  // Per-project breakdown
  const projectBreakdown = useMemo(() => {
    const map = new Map<number | null, { name: string; color: string; client: string; taskCount: number; points: number; donePoints: number; projTotal: number; projCompleted: number }>();
    tasks.forEach(t => {
      const pid = t.projectId ?? null;
      if (!map.has(pid)) {
        const proj = pid != null ? SHARED_PROJECTS.find(p => p.id === pid) : null;
        map.set(pid, {
          name: proj ? proj.name : "獨立任���",
          color: proj ? proj.color : "#9CA3AF",
          client: proj ? proj.client : "",
          taskCount: 0, points: 0, donePoints: 0,
          projTotal: proj ? proj.totalPoints : 0,
          projCompleted: proj ? proj.completedPoints : 0,
        });
      }
      const entry = map.get(pid)!;
      entry.taskCount++;
      entry.points += t.storyPoints;
      if (t.status === "done") entry.donePoints += t.storyPoints;
    });
    return Array.from(map.entries()).sort((a, b) => b[1].points - a[1].points);
  }, [tasks]);

  // Per-member load
  const memberLoad = useMemo(() => {
    const map = new Map<string, { color: string; points: number; tasks: number }>();
    tasks.forEach(t => {
      if (!map.has(t.assignee)) map.set(t.assignee, { color: t.assigneeColor, points: 0, tasks: 0 });
      const e = map.get(t.assignee)!;
      e.points += t.storyPoints;
      e.tasks++;
    });
    return Array.from(map.entries()).sort((a, b) => b[1].points - a[1].points);
  }, [tasks]);

  const maxMemberPts = memberLoad.length > 0 ? memberLoad[0][1].points : 1;

  const canConfirm = sprintStart && sprintEnd && !dateError && sprintDays > 0;

  const cbStyle = (checked: boolean): React.CSSProperties => ({
    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
    borderWidth: "1.5px", borderStyle: "solid",
    borderColor: checked ? "#111827" : "#D1D5DB",
    background: checked ? "#111827" : "#FFF",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all 0.15s",
  });

  const renderEmpRow = (e: { id: number; name: string; dept: string; role: string }, checked: boolean, toggle: (id: number) => void) => (
    <div
      key={e.id}
      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer"
      style={{ transition: "background 0.1s" }}
      onClick={() => toggle(e.id)}
      onMouseEnter={ev => { ev.currentTarget.style.background = "#F9FAFB"; }}
      onMouseLeave={ev => { ev.currentTarget.style.background = "transparent"; }}
    >
      <div style={cbStyle(checked)}>
        {checked && <Check className="w-2.5 h-2.5" style={{ color: "#FFF" }} />}
      </div>
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 28, height: 28, borderRadius: "50%", background: "#F3F4F6", fontSize: "11px", fontWeight: 600, color: "#374151" }}
      >
        {e.name.slice(-1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate" style={{ fontSize: "12.5px", fontWeight: 600, color: "#111827" }}>{e.name}</div>
        <div className="truncate" style={{ fontSize: "11px", color: "#9CA3AF" }}>{e.dept} · {e.role}</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div
        className="flex flex-col w-full mx-4 max-md:mx-0 max-md:h-full max-md:rounded-none"
        style={{
          background: "#FFF", borderRadius: 16, maxWidth: 940, maxHeight: "92vh",
          boxShadow: "0 24px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 max-md:px-4 py-4 flex-shrink-0"
          style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{ width: 36, height: 36, borderRadius: 10, background: "#111827" }}
            >
              <Settings className="w-4 h-4" style={{ color: "#FFF" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", lineHeight: 1.3, margin: 0 }}>Sprint {sprintNum} 設定</h2>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 1 }}>
                設定時程、目標與成員配置
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer"
            style={{ color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", background: "#FFF" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step tabs */}
        <div className="px-6 max-md:px-4 pt-4 pb-0 flex-shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
            {([
              { key: "basic" as ConfigStep, label: "基本設定", icon: <Settings className="w-3.5 h-3.5" /> },
              { key: "members" as ConfigStep, label: `成員配置`, icon: <Users className="w-3.5 h-3.5" />, badge: sprintMembers.length > 0 ? sprintMembers.length : undefined },
            ]).map(tab => {
              const active = step === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStep(tab.key)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-1 justify-center cursor-pointer"
                  style={{
                    fontSize: "13px", fontWeight: active ? 600 : 500,
                    background: active ? "#111827" : "transparent",
                    color: active ? "#FFF" : "#6B7280",
                    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                    borderWidth: 0,
                  }}
                >
                  {tab.icon}{tab.label}
                  {tab.badge !== undefined && (
                    <span
                      className="px-1.5 py-0.5 rounded-full tabular-nums"
                      style={{
                        fontSize: "11px", fontWeight: 700,
                        background: active ? "rgba(255,255,255,0.2)" : "#E5E7EB",
                        color: active ? "#FFF" : "#374151",
                        lineHeight: 1,
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 max-md:px-4 py-5" style={{ minHeight: 0 }}>

          {/* ── Step 1: Basic ──────────────────────────────────────────── */}
          {step === "basic" && (
            <div className="space-y-6">
              {/* Sprint number */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                  Sprint 編號
                </label>
                <div className="flex items-center gap-0" style={{ borderRadius: 10, overflow: "hidden", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", display: "inline-flex" }}>
                  <button
                    onClick={() => onChangeNum(Math.max(1, sprintNum - 1))}
                    className="flex items-center justify-center cursor-pointer"
                    style={{
                      width: 40, height: 40, background: sprintNum <= 1 ? "#F9FAFB" : "#FFF",
                      color: sprintNum <= 1 ? "#D1D5DB" : "#374151", borderWidth: 0,
                      borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "#E5E7EB",
                      transition: "all 0.15s", flexShrink: 0,
                    }}
                    onMouseEnter={e => { if (sprintNum > 1) e.currentTarget.style.background = "#F3F4F6"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = sprintNum <= 1 ? "#F9FAFB" : "#FFF"; }}
                    disabled={sprintNum <= 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 72, height: 40, background: "#FFF", color: "#111827",
                      fontSize: "18px", fontWeight: 800, userSelect: "none",
                    }}
                  >
                    {sprintNum}
                  </div>
                  <button
                    onClick={() => onChangeNum(sprintNum + 1)}
                    className="flex items-center justify-center cursor-pointer"
                    style={{
                      width: 40, height: 40, background: "#FFF",
                      color: "#374151", borderWidth: 0,
                      borderLeftWidth: "1px", borderLeftStyle: "solid", borderLeftColor: "#E5E7EB",
                      transition: "all 0.15s", flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; }}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sprint Goal */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                  Sprint 目標
                  <span style={{ fontSize: "11px", fontWeight: 400, color: "#9CA3AF", marginLeft: 6 }}>（選填）</span>
                </label>
                <textarea
                  value={sprintGoal}
                  onChange={e => onChangeGoal(e.target.value)}
                  placeholder="描述本次 Sprint 的主要目標，例如：完成用戶註冊流程重構"
                  rows={2}
                  className="w-full outline-none"
                  style={{
                    padding: "10px 14px", borderRadius: 10,
                    borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
                    fontSize: "14px", color: "#111827", background: "#FFF",
                    resize: "none", lineHeight: 1.7, fontFamily: "inherit",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#111827"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
                />
              </div>

              {/* Date row */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                  Sprint 時程
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", display: "block", marginBottom: 4, letterSpacing: "0.04em" }}>
                      開始日期
                    </label>
                    <DatePicker value={sprintStart} onChange={handleStartChange} placeholder="選擇開始日期" formField />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", display: "block", marginBottom: 4, letterSpacing: "0.04em" }}>
                      結束日期
                    </label>
                    <DatePicker value={sprintEnd} onChange={onChangeEnd} placeholder="選擇結束日期" formField />
                    {dateError && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <AlertCircle className="w-3 h-3" style={{ color: "#DC2626" }} />
                        <span style={{ fontSize: "11px", color: "#DC2626" }}>結束日期必須晚於開始日期</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration presets */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500 }}>快速設定：</span>
                  {DURATION_PRESETS.map(p => {
                    const isActive = sprintDays === p.days && !dateError;
                    return (
                      <button
                        key={p.days}
                        onClick={() => applyPreset(p.days)}
                        className="px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                        style={{
                          fontSize: "12px", fontWeight: isActive ? 700 : 500,
                          background: isActive ? "#111827" : "#F3F4F6",
                          color: isActive ? "#FFF" : "#6B7280",
                          borderWidth: 0,
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#E5E7EB"; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? "#111827" : "#F3F4F6"; }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                  {sprintStart && sprintEnd && !dateError && (
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                      style={{ background: "#EFF6FF", fontSize: "12px", fontWeight: 600, color: "#2563EB" }}
                    >
                      <CalendarDays className="w-3 h-3" />
                      共 {sprintDays} 天
                    </span>
                  )}
                </div>
              </div>

              {/* Sprint overview summary */}
              <div style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", paddingTop: 20 }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>
                  Sprint 概覽
                </label>

                {/* Stats cards */}
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "待處理任務", value: `${totalTasks}`, sub: "件", color: "#374151", bg: "#F9FAFB", border: "#E5E7EB", icon: <AlertCircle className="w-3.5 h-3.5" /> },
                          { label: "總故事點數", value: `${totalPoints}`, sub: "pts", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", icon: <BarChart2 className="w-3.5 h-3.5" /> },
                          { label: "參與成員", value: `${sprintMembers.length}`, sub: "人", color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0", icon: <Users className="w-3.5 h-3.5" /> },
                          { label: "人均點數", value: `${avgPointsPerPerson}`, sub: "pts/人", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", icon: <BarChart2 className="w-3.5 h-3.5" /> },
                        ].map(card => (
                          <div key={card.label} className="px-3.5 py-3 rounded-lg" style={{ background: card.bg, borderWidth: "1px", borderStyle: "solid", borderColor: card.border }}>
                            <div className="flex items-center gap-1.5 mb-2" style={{ color: card.color, opacity: 0.7 }}>
                              {card.icon}
                              <span style={{ fontSize: "11px", fontWeight: 600 }}>{card.label}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="tabular-nums" style={{ fontSize: "20px", fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</span>
                              <span style={{ fontSize: "11px", color: card.color, opacity: 0.6 }}>{card.sub}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ── Capacity Analysis ────────────────────────────── */}
                      {sprintMembers.length > 0 && (
                        <div className="mt-4 p-4 rounded-lg" style={{ background: capacityStatus.bg, borderWidth: "1px", borderStyle: "solid", borderColor: capacityStatus.border }}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <BarChart2 className="w-4 h-4" style={{ color: capacityStatus.color }} />
                              <span style={{ fontSize: "13px", fontWeight: 700, color: capacityStatus.color }}>
                                容量分析
                              </span>
                              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "11px", fontWeight: 700, background: capacityStatus.color, color: "#FFF" }}>
                                {capacityStatus.label}
                              </span>
                            </div>
                            <span className="tabular-nums" style={{ fontSize: "13px", fontWeight: 700, color: capacityStatus.color }}>
                              {totalPoints} / {teamCapacity} pts（{usagePct}%）
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="mb-2" style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.6)", overflow: "hidden" }}>
                            <div style={{
                              width: `${Math.min(usagePct, 100)}%`, height: "100%", borderRadius: 4,
                              background: capacityStatus.color, transition: "width 0.3s",
                            }} />
                          </div>
                          <div className="flex items-center gap-4 flex-wrap">
                            <span style={{ fontSize: "11px", color: capacityStatus.color, opacity: 0.8 }}>
                              團隊容量 = {sprintMembers.length} 人 x {capacityPerPerson} pts = {teamCapacity} pts
                            </span>
                            <span style={{ fontSize: "11px", color: capacityStatus.color, opacity: 0.8 }}>
                              基準：{PTS_PER_PERSON_PER_14D} pts / 人 / 2 週
                            </span>
                            {teamCapacity > totalPoints && (
                              <span style={{ fontSize: "11px", color: "#15803D" }}>
                                剩餘 {teamCapacity - totalPoints} pts 可分配
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Capacity warning when no members */}
                      {sprintMembers.length === 0 && totalTasks > 0 && (
                        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg" style={{ background: "#FFFBEB", borderWidth: "1px", borderStyle: "solid", borderColor: "#FDE68A" }}>
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D97706" }} />
                          <span style={{ fontSize: "12px", color: "#92400E" }}>
                            尚未配置成員，請至「成員配置」分頁加入成員以啟用容量分析
                          </span>
                        </div>
                      )}

                      {/* ── Project Breakdown ────────────────────────────── */}
                      {projectBreakdown.length > 0 && (
                        <div className="mt-4" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", paddingTop: 16 }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4" style={{ color: "#374151" }} />
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>專案任務分佈</span>
                            <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                              {projectBreakdown.filter(([pid]) => pid != null).length} 個專案連結
                            </span>
                          </div>
                          <div className="space-y-2">
                            {projectBreakdown.map(([pid, data]) => {
                              const pctOfSprint = totalPoints > 0 ? Math.round((data.points / totalPoints) * 100) : 0;
                              return (
                                <div key={pid ?? "none"} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "#FAFAFA", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: data.color }} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="truncate" style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{data.name}</span>
                                      {data.client && <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{data.client}</span>}
                                    </div>
                                    {pid != null && (
                                      <div className="flex items-center gap-3 mt-1">
                                        <div className="flex-1" style={{ height: 3, borderRadius: 2, background: "#E5E7EB", maxWidth: 120 }}>
                                          <div style={{ width: `${data.projTotal > 0 ? Math.round(((data.projCompleted + data.donePoints) / data.projTotal) * 100) : 0}%`, height: "100%", borderRadius: 2, background: data.color, transition: "width 0.3s" }} />
                                        </div>
                                        <span className="tabular-nums" style={{ fontSize: "10px", color: "#9CA3AF" }}>
                                          專案進度 {data.projTotal > 0 ? Math.round(((data.projCompleted + data.donePoints) / data.projTotal) * 100) : 0}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 flex-shrink-0">
                                    <div className="text-center">
                                      <div className="tabular-nums" style={{ fontSize: "14px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>{data.taskCount}</div>
                                      <div style={{ fontSize: "10px", color: "#9CA3AF" }}>任務</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="tabular-nums" style={{ fontSize: "14px", fontWeight: 700, color: "#2563EB", lineHeight: 1 }}>{data.points}</div>
                                      <div style={{ fontSize: "10px", color: "#9CA3AF" }}>pts</div>
                                    </div>
                                    <div className="text-center" style={{ minWidth: 32 }}>
                                      <div className="tabular-nums" style={{ fontSize: "14px", fontWeight: 700, color: "#6B7280", lineHeight: 1 }}>{pctOfSprint}%</div>
                                      <div style={{ fontSize: "10px", color: "#9CA3AF" }}>佔比</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ─��� Member Load ──────────────────────────────────── */}
                      {memberLoad.length > 0 && (
                        <div className="mt-4" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", paddingTop: 16 }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4" style={{ color: "#374151" }} />
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>成員負載分析</span>
                            {sprintMembers.length > 0 && (
                              <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                                建議每人 ≤ {Math.round(capacityPerPerson)} pts
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {memberLoad.map(([name, data]) => {
                              const overload = sprintMembers.length > 0 && data.points > capacityPerPerson * 1.3;
                              const barPct = maxMemberPts > 0 ? Math.round((data.points / maxMemberPts) * 100) : 0;
                              return (
                                <div key={name} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: overload ? "#FEF2F2" : "#FAFAFA", borderWidth: "1px", borderStyle: "solid", borderColor: overload ? "#FECACA" : "#F3F4F6" }}>
                                  <div className="flex items-center justify-center flex-shrink-0" style={{ width: 26, height: 26, borderRadius: "50%", background: data.color, color: "#FFF", fontSize: "11px", fontWeight: 700 }}>
                                    {name.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="truncate" style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{name}</span>
                                      <span className="tabular-nums" style={{ fontSize: "11px", color: "#9CA3AF" }}>{data.tasks} 件</span>
                                      {overload && (
                                        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 700, background: "#DC2626", color: "#FFF" }}>
                                          超量
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-1" style={{ height: 4, borderRadius: 2, background: overload ? "#FECACA" : "#E5E7EB" }}>
                                      <div style={{ width: `${barPct}%`, height: "100%", borderRadius: 2, background: overload ? "#DC2626" : data.color, transition: "width 0.3s" }} />
                                    </div>
                                  </div>
                                  <span className="tabular-nums flex-shrink-0" style={{ fontSize: "13px", fontWeight: 700, color: overload ? "#DC2626" : "#111827", minWidth: 36, textAlign: "right" }}>
                                    {data.points}<span style={{ fontSize: "10px", fontWeight: 500, color: "#9CA3AF", marginLeft: 1 }}>pts</span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                </>
              </div>
            </div>
          )}

          {/* ── Step 2: Members ─────────────────────────────────────────── */}
          {step === "members" && (
            <div>
              <div className="flex flex-col md:flex-row gap-3" style={{ minHeight: 340 }}>
                {/* Left panel: available */}
                <div
                  className="flex-1 flex flex-col rounded-xl overflow-hidden"
                  style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", minWidth: 0 }}
                >
                  <div className="px-3 py-2.5 flex items-center justify-between flex-shrink-0" style={{ background: "#F9FAFB", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>
                      可選員工（{available.length}）
                    </span>
                    <button onClick={toggleAllLeft} className="cursor-pointer" style={{ fontSize: "11px", color: "#6B7280", background: "none", borderWidth: 0, textDecoration: "underline" }}>
                      {leftChecked.size === filteredLeft.length && filteredLeft.length > 0 ? "取消全選" : "全選"}
                    </button>
                  </div>
                  <div className="px-3 py-2 flex gap-2 flex-shrink-0" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                    <div className="flex-1 flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: "#F3F4F6" }}>
                      <Search className="w-3 h-3" style={{ color: "#9CA3AF" }} />
                      <input
                        value={leftSearch} onChange={e => setLeftSearch(e.target.value)}
                        placeholder="搜尋姓名 / 部門 / 職稱"
                        className="flex-1 bg-transparent outline-none"
                        style={{ fontSize: "11px", color: "#111827", borderWidth: 0 }}
                      />
                    </div>
                    <StyledSelect
                      value={leftDeptFilter}
                      onChange={v => setLeftDeptFilter(v)}
                      allLabel="全部"
                      options={SPRINT_DEPT_LIST.map(d => ({ key: d, label: d }))}
                      className="max-w-[90px]"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto" style={{ maxHeight: 280 }}>
                    {filteredLeft.length === 0 ? (
                      <div className="flex items-center justify-center py-8" style={{ color: "#9CA3AF", fontSize: "12px" }}>無符合條件的員工</div>
                    ) : filteredLeft.map(e => renderEmpRow(e, leftChecked.has(e.id), toggleLeftCheck))}
                  </div>
                </div>

                {/* Middle buttons */}
                <div className="flex md:flex-col items-center justify-center gap-2 py-2 md:py-0 md:px-1 flex-shrink-0">
                  <button
                    onClick={moveAllRight} title="全部加入"
                    className="flex items-center justify-center cursor-pointer"
                    style={{ width: 32, height: 28, borderRadius: 6, background: "#F3F4F6", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#6B7280" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#E5E7EB"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#F3F4F6"; }}
                  >
                    <div className="flex items-center"><ChevronRight className="w-3 h-3" /><ChevronRight className="w-3 h-3" style={{ marginLeft: -6 }} /></div>
                  </button>
                  <button
                    onClick={moveRight} title="加入選取" disabled={leftChecked.size === 0}
                    className="flex items-center justify-center cursor-pointer"
                    style={{ width: 32, height: 28, borderRadius: 6, background: leftChecked.size > 0 ? "#111827" : "#F3F4F6", borderWidth: "1px", borderStyle: "solid", borderColor: leftChecked.size > 0 ? "#111827" : "#E5E7EB", color: leftChecked.size > 0 ? "#FFF" : "#D1D5DB", transition: "all 0.15s" }}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={moveLeft} title="移除選取" disabled={rightChecked.size === 0}
                    className="flex items-center justify-center cursor-pointer"
                    style={{ width: 32, height: 28, borderRadius: 6, background: rightChecked.size > 0 ? "#111827" : "#F3F4F6", borderWidth: "1px", borderStyle: "solid", borderColor: rightChecked.size > 0 ? "#111827" : "#E5E7EB", color: rightChecked.size > 0 ? "#FFF" : "#D1D5DB", transition: "all 0.15s" }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={moveAllLeft} title="全部移除"
                    className="flex items-center justify-center cursor-pointer"
                    style={{ width: 32, height: 28, borderRadius: 6, background: "#F3F4F6", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#6B7280" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#E5E7EB"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#F3F4F6"; }}
                  >
                    <div className="flex items-center"><ChevronLeft className="w-3 h-3" /><ChevronLeft className="w-3 h-3" style={{ marginLeft: -6 }} /></div>
                  </button>
                </div>

                {/* Right panel: selected */}
                <div
                  className="flex-1 flex flex-col rounded-xl overflow-hidden"
                  style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", minWidth: 0 }}
                >
                  <div className="px-3 py-2.5 flex items-center justify-between flex-shrink-0" style={{ background: "#F0FDF4", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#BBF7D0" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#15803D" }}>
                      <span className="inline-flex items-center gap-1"><UserPlus className="w-3 h-3" />Sprint 成員（{selected.length}）</span>
                    </span>
                    <button onClick={toggleAllRight} className="cursor-pointer" style={{ fontSize: "11px", color: "#6B7280", background: "none", borderWidth: 0, textDecoration: "underline" }}>
                      {rightChecked.size === filteredRight.length && filteredRight.length > 0 ? "取消全選" : "全選"}
                    </button>
                  </div>
                  <div className="px-3 py-2 flex-shrink-0" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: "#F3F4F6" }}>
                      <Search className="w-3 h-3" style={{ color: "#9CA3AF" }} />
                      <input
                        value={rightSearch} onChange={e => setRightSearch(e.target.value)}
                        placeholder="搜尋已選成員"
                        className="flex-1 bg-transparent outline-none"
                        style={{ fontSize: "11px", color: "#111827", borderWidth: 0 }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto" style={{ maxHeight: 280 }}>
                    {filteredRight.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-1" style={{ color: "#9CA3AF" }}>
                        <Users className="w-5 h-5" />
                        <span style={{ fontSize: "12px" }}>尚未選擇成員</span>
                        <span style={{ fontSize: "11px", color: "#D1D5DB" }}>從左側選取並加入</span>
                      </div>
                    ) : filteredRight.map(e => renderEmpRow(e, rightChecked.has(e.id), toggleRightCheck))}
                  </div>
                </div>
              </div>

              {/* Department distribution */}
              {deptDistribution.length > 0 && (
                <div className="mt-4 px-4 py-3 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Building2 className="w-3.5 h-3.5" style={{ color: "#6B7280" }} />
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>部門分佈</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {deptDistribution.map(([dept, count]) => (
                      <span
                        key={dept}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "12px", color: "#374151" }}
                      >
                        {dept}
                        <span className="tabular-nums" style={{ fontWeight: 700, color: "#111827", background: "#F3F4F6", borderRadius: 4, padding: "0 5px", fontSize: "11px" }}>
                          {count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notification hint */}
              {sprintMembers.length > 0 && (
                <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg" style={{ background: "#EFF6FF", borderWidth: "1px", borderStyle: "solid", borderColor: "#BFDBFE" }}>
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#2563EB" }} />
                  <span style={{ fontSize: "11px", color: "#1D4ED8" }}>
                    確認後，系統將自動發送 Sprint {sprintNum} 的通知信至 {sprintMembers.length} 位成員的信箱
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-3 px-6 max-md:px-4 py-4 flex-shrink-0"
          style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", background: "#FAFAFA" }}
        >
          {/* Left: step indicator */}
          <div className="flex items-center gap-2">
            {(["basic", "members"] as ConfigStep[]).map((s, i) => (
              <div
                key={s}
                className="flex items-center gap-1.5"
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: step === s ? "#111827" : s === "basic" && step === "members" ? "#15803D" : "#E5E7EB",
                    color: step === s || (s === "basic" && step === "members") ? "#FFF" : "#9CA3AF",
                    fontSize: "11px", fontWeight: 700,
                  }}
                >
                  {s === "basic" && step === "members" ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                {i === 0 && (
                  <div style={{ width: 20, height: 2, borderRadius: 1, background: step === "members" ? "#15803D" : "#E5E7EB" }} />
                )}
              </div>
            ))}
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {step === "members" && (
              <button
                onClick={() => setStep("basic")}
                className="flex items-center gap-1 px-4 py-2 rounded-lg cursor-pointer"
                style={{
                  fontSize: "13px", fontWeight: 500, color: "#374151",
                  background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />上一步
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg cursor-pointer"
              style={{ fontSize: "13px", fontWeight: 500, color: "#6B7280", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; }}
            >
              取消
            </button>
            {step === "basic" ? (
              <button
                onClick={() => setStep("members")}
                className="flex items-center gap-1 px-5 py-2 rounded-lg cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 600, color: "#FFF", background: "#111827", borderWidth: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = "#1F2937"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#111827"; }}
              >
                下一步<ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onConfirm}
                disabled={!canConfirm}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg cursor-pointer"
                style={{
                  fontSize: "13px", fontWeight: 600,
                  color: canConfirm ? "#FFF" : "#9CA3AF",
                  background: canConfirm ? "#111827" : "#E5E7EB",
                  borderWidth: 0,
                  cursor: canConfirm ? "pointer" : "not-allowed",
                }}
                onMouseEnter={e => { if (canConfirm) e.currentTarget.style.background = "#1F2937"; }}
                onMouseLeave={e => { if (canConfirm) e.currentTarget.style.background = "#111827"; }}
              >
                <Check className="w-3.5 h-3.5" />確認儲存
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settlement Modal ────────────────────────────────────────────────────────
function SettlementModal({ tasks, onClose, sprintNum, sprintStart, sprintEnd }: {
  tasks: Task[]; onClose: () => void;
  sprintNum: number; sprintStart: string; sprintEnd: string;
}) {
  // Compute per-person stats from all tasks
  const memberStats = useMemo(() => {
    const map = new Map<string, {
      name: string; color: string; dept: string;
      doneTasks: Task[]; allTasks: Task[];
      totalPoints: number; donePoints: number;
    }>();
    ASSIGNEES.forEach(a => {
      map.set(a.name, {
        name: a.name, color: a.color, dept: a.dept,
        doneTasks: [], allTasks: [],
        totalPoints: 0, donePoints: 0,
      });
    });
    tasks.forEach(t => {
      const m = map.get(t.assignee);
      if (!m) return;
      m.allTasks.push(t);
      m.totalPoints += t.storyPoints;
      if (t.status === "done") {
        m.doneTasks.push(t);
        m.donePoints += t.storyPoints;
      }
    });
    return Array.from(map.values())
      .filter(m => m.allTasks.length > 0)
      .sort((a, b) => b.donePoints - a.donePoints);
  }, [tasks]);

  const totalDonePoints = memberStats.reduce((s, m) => s + m.donePoints, 0);
  const totalAllPoints  = memberStats.reduce((s, m) => s + m.totalPoints, 0);
  const totalDoneTasks  = memberStats.reduce((s, m) => s + m.doneTasks.length, 0);
  const totalAllTasks   = memberStats.reduce((s, m) => s + m.allTasks.length, 0);

  // Timeline helpers
  const sprintStartMs = new Date(sprintStart).getTime();
  const sprintEndMs   = new Date(sprintEnd).getTime();
  const sprintDuration = sprintEndMs - sprintStartMs;
  const todayMs = new Date(TODAY).getTime();
  const todayPct = Math.min(100, Math.max(0, ((todayMs - sprintStartMs) / sprintDuration) * 100));

  const rankMedals = ["🥇", "🥈", "🥉"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex flex-col max-md:mx-3"
        style={{
          background: "#FFF",
          borderRadius: 14,
          width: "min(960px, calc(100vw - 24px))",
          maxHeight: "calc(100vh - 48px)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: 10, background: "#FEF3C7" }}
            >
              <Trophy className="w-5 h-5" style={{ color: "#D97706" }} />
            </div>
            <div>
              <h2 style={{ color: "#111827", margin: 0 }}>Sprint 結算報告</h2>
              <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: 1 }}>
                Sprint {sprintNum} · {sprintStart.replace(/-/g, "/")} – {sprintEnd.replace(/-/g, "/")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "transparent", borderWidth: 0,
              color: "#9CA3AF", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5" style={{ scrollbarWidth: "thin" }}>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "已完成任務", value: `${totalDoneTasks}/${totalAllTasks}`, sub: "件", color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
              { label: "已結算點數", value: `${totalDonePoints}`, sub: `/ ${totalAllPoints} pts`, color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
              { label: "完成率", value: `${totalAllTasks ? Math.round((totalDoneTasks / totalAllTasks) * 100) : 0}%`, sub: "", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
              { label: "Sprint 進度", value: `${Math.round(todayPct)}%`, sub: `Day ${Math.ceil((todayMs - sprintStartMs) / 86400000)}`, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
            ].map(card => (
              <div
                key={card.label}
                className="px-4 py-3 rounded-lg"
                style={{ background: card.bg, borderWidth: "1px", borderStyle: "solid", borderColor: card.border }}
              >
                <div style={{ fontSize: "12px", fontWeight: 600, color: card.color, marginBottom: 4 }}>{card.label}</div>
                <div className="flex items-baseline gap-1.5">
                  <span style={{ fontSize: "22px", fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</span>
                  {card.sub && <span style={{ fontSize: "12px", color: card.color, opacity: 0.7 }}>{card.sub}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Member list */}
          <div style={{ marginBottom: 6 }}>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4" style={{ color: "#9CA3AF" }} />
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>個人績效排行</span>
            </div>

            {/* Table header - desktop */}
            <div
              className="hidden md:grid items-center mb-2"
              style={{
                gridTemplateColumns: "36px 1fr 100px 100px 80px 1fr",
                gap: "12px", padding: "0 16px",
              }}
            >
              {["", "成員", "已完成", "點數", "完成率", "任務時程"].map((h, i) => (
                <span key={i} style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em" }}>{h}</span>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {memberStats.map((m, idx) => {
                const doneRate = m.allTasks.length ? Math.round((m.doneTasks.length / m.allTasks.length) * 100) : 0;
                return (
                  <div
                    key={m.name}
                    className="rounded-lg"
                    style={{
                      background: idx === 0 ? "#FFFBEB" : "#FAFAFA",
                      borderWidth: "1px", borderStyle: "solid",
                      borderColor: idx === 0 ? "#FDE68A" : "#F3F4F6",
                      padding: "12px 16px",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = idx === 0 ? "#FDE68A" : "#F3F4F6"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {/* Desktop row */}
                    <div
                      className="hidden md:grid items-center"
                      style={{ gridTemplateColumns: "36px 1fr 100px 100px 80px 1fr", gap: "12px" }}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center" style={{ fontSize: "16px" }}>
                        {idx < 3 ? rankMedals[idx] : (
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#9CA3AF" }}>#{idx + 1}</span>
                        )}
                      </div>
                      {/* Avatar + name */}
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.name} color={m.color} size={32} />
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{m.name}</div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{m.dept}</div>
                        </div>
                      </div>
                      {/* Done tasks */}
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#15803D" }} />
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{m.doneTasks.length}</span>
                        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>/ {m.allTasks.length}</span>
                      </div>
                      {/* Points */}
                      <div className="flex items-center gap-1">
                        <BarChart2 className="w-3.5 h-3.5" style={{ color: "#2563EB" }} />
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{m.donePoints}</span>
                        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>/ {m.totalPoints}</span>
                      </div>
                      {/* Rate */}
                      <div>
                        <div
                          style={{
                            width: "100%", height: 6, borderRadius: 3,
                            background: "#E5E7EB", overflow: "hidden",
                          }}
                        >
                          <div style={{
                            width: `${doneRate}%`, height: "100%", borderRadius: 3,
                            background: doneRate === 100 ? "#15803D" : doneRate >= 50 ? "#2563EB" : "#D97706",
                            transition: "width 0.4s",
                          }} />
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", marginTop: 2, textAlign: "center" }}>{doneRate}%</div>
                      </div>
                      {/* Timeline data */}
                      {(() => {
                        const earliest = m.allTasks.reduce((min, t) => t.createdDate < min ? t.createdDate : min, m.allTasks[0].createdDate);
                        const latest = m.allTasks.reduce((max, t) => t.dueDate > max ? t.dueDate : max, m.allTasks[0].dueDate);
                        const overdueCount = m.allTasks.filter(t => t.status !== "done" && t.dueDate < TODAY).length;
                        const nearDueCount = m.allTasks.filter(t => {
                          if (t.status === "done") return false;
                          const diff = (new Date(t.dueDate).getTime() - new Date(TODAY).getTime()) / 86400000;
                          return diff >= 0 && diff <= 2;
                        }).length;
                        const fmtShort = (d: string) => {
                          const dt = new Date(d);
                          return `${dt.getMonth() + 1}/${dt.getDate()}`;
                        };
                        return (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="w-3 h-3 flex-shrink-0" style={{ color: "#9CA3AF" }} />
                              <span style={{ fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>
                                {fmtShort(earliest)} – {fmtShort(latest)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {overdueCount > 0 && (
                                <span
                                  className="inline-flex items-center gap-1"
                                  style={{
                                    fontSize: "11px", fontWeight: 600, color: "#DC2626",
                                    background: "#FEF2F2", borderRadius: 4, padding: "1px 6px",
                                  }}
                                >
                                  <Clock className="w-3 h-3" />逾期 {overdueCount}
                                </span>
                              )}
                              {nearDueCount > 0 && (
                                <span
                                  className="inline-flex items-center gap-1"
                                  style={{
                                    fontSize: "11px", fontWeight: 600, color: "#D97706",
                                    background: "#FFFBEB", borderRadius: 4, padding: "1px 6px",
                                  }}
                                >
                                  <AlertCircle className="w-3 h-3" />即將到期 {nearDueCount}
                                </span>
                              )}
                              {overdueCount === 0 && nearDueCount === 0 && (
                                <span
                                  className="inline-flex items-center gap-1"
                                  style={{
                                    fontSize: "11px", fontWeight: 600, color: "#15803D",
                                    background: "#F0FDF4", borderRadius: 4, padding: "1px 6px",
                                  }}
                                >
                                  <CheckCircle2 className="w-3 h-3" />進度正常
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Mobile card */}
                    <div className="md:hidden">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div style={{ fontSize: "14px", width: 24, textAlign: "center" }}>
                            {idx < 3 ? rankMedals[idx] : <span style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF" }}>#{idx + 1}</span>}
                          </div>
                          <Avatar name={m.name} color={m.color} size={28} />
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{m.name}</div>
                            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{m.dept}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>{m.donePoints}</div>
                            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>點數</div>
                          </div>
                          <div className="text-center">
                            <div style={{ fontSize: "14px", fontWeight: 800, color: "#15803D" }}>{m.doneTasks.length}</div>
                            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>完成</div>
                          </div>
                        </div>
                      </div>
                      {/* Mobile progress bar */}
                      <div style={{ width: "100%", height: 5, borderRadius: 3, background: "#E5E7EB", overflow: "hidden" }}>
                        <div style={{
                          width: `${doneRate}%`, height: "100%", borderRadius: 3,
                          background: doneRate === 100 ? "#15803D" : doneRate >= 50 ? "#2563EB" : "#D97706",
                        }} />
                      </div>
                      <div style={{ fontSize: "11px", color: "#6B7280", marginTop: 2 }}>完成率 {doneRate}% · {m.doneTasks.length}/{m.allTasks.length} 任務</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status legend */}
          <div
            className="hidden md:flex items-center gap-5 mt-4 pt-4"
            style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}
          >
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF" }}>狀態說明：</span>
            {[
              { color: "#DC2626", label: "逾期" },
              { color: "#D97706", label: "即將到期（2 日內）" },
              { color: "#15803D", label: "進度正常" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: "11px", color: "#6B7280" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end px-6 py-3.5 flex-shrink-0"
          style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", background: "#FAFAFA" }}
        >
          <button
            onClick={onClose}
            className="flex items-center justify-center px-5 py-2 rounded-lg cursor-pointer"
            style={{
              background: "#111827", color: "#FFF",
              fontSize: "13px", fontWeight: 600,
              borderWidth: 0, transition: "all 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1F2937"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#111827"; }}
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sprint Record & History ──────────────────────────���─────────────────────────
interface SprintRecord {
  num: number;
  start: string;
  end: string;
  totalTasks: number;
  doneTasks: number;
  totalPoints: number;
  donePoints: number;
  members: number;
  topMember: string;
  topPoints: number;
  byStatus: Record<Status, number>;
}

const MOCK_HISTORY: SprintRecord[] = [
  { num: 1, start: "2025-12-01", end: "2025-12-14", totalTasks: 10, doneTasks: 7, totalPoints: 34, donePoints: 22, members: 6, topMember: "孫八", topPoints: 8, byStatus: { todo: 0, inProgress: 1, review: 2, done: 7 } },
  { num: 2, start: "2025-12-15", end: "2025-12-28", totalTasks: 12, doneTasks: 9, totalPoints: 42, donePoints: 30, members: 7, topMember: "王五", topPoints: 10, byStatus: { todo: 1, inProgress: 1, review: 1, done: 9 } },
  { num: 3, start: "2026-01-05", end: "2026-01-18", totalTasks: 14, doneTasks: 11, totalPoints: 50, donePoints: 38, members: 8, topMember: "張三", topPoints: 12, byStatus: { todo: 1, inProgress: 0, review: 2, done: 11 } },
  { num: 4, start: "2026-01-19", end: "2026-02-01", totalTasks: 11, doneTasks: 8, totalPoints: 38, donePoints: 26, members: 7, topMember: "吳十", topPoints: 11, byStatus: { todo: 1, inProgress: 1, review: 1, done: 8 } },
  { num: 5, start: "2026-02-02", end: "2026-02-15", totalTasks: 16, doneTasks: 13, totalPoints: 55, donePoints: 44, members: 9, topMember: "孫八", topPoints: 15, byStatus: { todo: 1, inProgress: 1, review: 1, done: 13 } },
  { num: 6, start: "2026-02-16", end: "2026-03-01", totalTasks: 13, doneTasks: 10, totalPoints: 48, donePoints: 35, members: 8, topMember: "李四", topPoints: 9, byStatus: { todo: 1, inProgress: 1, review: 1, done: 10 } },
];

// ─── Sprint Report Tab ──────────────────────────────────────────────────────
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";

function ChartTooltipSprint({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#111827", borderRadius: 8, padding: "10px 14px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    }}>
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#FFF", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2" style={{ fontSize: "12px", color: "#D1D5DB", marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span>{p.name}：</span>
          <span style={{ fontWeight: 700, color: "#FFF" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function SprintReportTab({ history }: { history: SprintRecord[] }) {
  const [expandedNum, setExpandedNum] = useState<number | null>(null);

  const velocityData = history.map(r => ({
    name: `Sprint ${r.num}`,
    完成點數: r.donePoints,
    總點數: r.totalPoints,
  }));

  const rateData = history.map(r => ({
    name: `Sprint ${r.num}`,
    完成率: r.totalTasks ? Math.round((r.doneTasks / r.totalTasks) * 100) : 0,
  }));

  const avgVelocity = history.length ? Math.round(history.reduce((s, r) => s + r.donePoints, 0) / history.length) : 0;
  const avgRate = history.length ? Math.round(history.reduce((s, r) => s + (r.totalTasks ? (r.doneTasks / r.totalTasks) * 100 : 0), 0) / history.length) : 0;
  const totalSprintPoints = history.reduce((s, r) => s + r.donePoints, 0);
  const totalSprintTasks = history.reduce((s, r) => s + r.doneTasks, 0);
  const bestSprint = history.length ? history.reduce((best, r) => r.donePoints > best.donePoints ? r : best, history[0]) : null;

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ color: "#9CA3AF" }}>
        <BarChart2 className="w-12 h-12 mb-3" style={{ opacity: 0.3 }} />
        <div style={{ fontSize: "15px", fontWeight: 600 }}>尚無 Sprint 歷史記錄</div>
        <div style={{ fontSize: "13px", marginTop: 4 }}>完成第一個 Sprint 後即可查看報表</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "累計完成點數", value: totalSprintPoints, sub: "pts", color: "#111827", bg: "#F9FAFB", border: "#E5E7EB" },
          { label: "累計完成任務", value: totalSprintTasks, sub: "件", color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
          { label: "平均 Velocity", value: avgVelocity, sub: "pts / sprint", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
          { label: "平均完成率", value: `${avgRate}%`, sub: "", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
        ].map(c => (
          <div key={c.label} className="px-4 py-3 rounded-lg" style={{ background: c.bg, borderWidth: "1px", borderStyle: "solid", borderColor: c.border }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: c.color, opacity: 0.7, marginBottom: 4 }}>{c.label}</div>
            <div className="flex items-baseline gap-1.5">
              <span style={{ fontSize: "22px", fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</span>
              {c.sub && <span style={{ fontSize: "12px", color: c.color, opacity: 0.5 }}>{c.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Velocity chart */}
        <div className="rounded-xl p-4" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: 16 }}>Velocity 趨勢</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={velocityData} barGap={4} barCategoryGap="25%">
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis key="xaxis" dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="yaxis" width={42} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <RTooltip key="tooltip" content={<ChartTooltipSprint />} cursor={false} />
              <Bar key="bar-total" dataKey="總點數" fill="#D1D5DB" radius={[4, 4, 0, 0]} />
              <Bar key="bar-done" dataKey="完成點數" fill="#111827" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Completion rate chart */}
        <div className="rounded-xl p-4" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: 16 }}>完成率趨勢</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={rateData}>
              <defs key="defs">
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111827" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis key="xaxis" dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="yaxis" width={42} domain={[0, 100]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} unit="%" />
              <RTooltip key="tooltip" content={<ChartTooltipSprint />} cursor={false} />
              <Area key="area-rate" type="monotone" dataKey="完成率" stroke="#111827" strokeWidth={2} fill="url(#rateGrad)" activeDot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sprint history table */}
      <div className="rounded-xl" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6", overflow: "hidden" }}>
        <div className="px-5 py-3.5" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>Sprint 歷史總覽</span>
        </div>

        {/* Desktop table header */}
        <div
          className="hidden md:grid px-5 py-2.5"
          style={{
            gridTemplateColumns: "80px 160px 80px 90px 80px 120px 1fr",
            gap: "12px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA",
          }}
        >
          {["Sprint", "週期", "任務", "點數", "完成率", "MVP", "狀態分佈"].map(h => (
            <span key={h} style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em" }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {[...history].reverse().map(r => {
          const rate = r.totalTasks ? Math.round((r.doneTasks / r.totalTasks) * 100) : 0;
          const isExpanded = expandedNum === r.num;
          const fmtD = (d: string) => d.replace(/-/g, "/").slice(5);
          return (
            <div key={r.num}>
              {/* Desktop row */}
              <div
                className="hidden md:grid items-center px-5 py-3 cursor-pointer"
                style={{
                  gridTemplateColumns: "80px 160px 80px 90px 80px 120px 1fr",
                  gap: "12px",
                  borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#FAFAFA",
                  background: isExpanded ? "#FAFAFA" : "transparent",
                  transition: "background 0.15s",
                }}
                onClick={() => setExpandedNum(isExpanded ? null : r.num)}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = "#FAFAFA"; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>Sprint {r.num}</span>
                <span style={{ fontSize: "12px", color: "#6B7280" }}>{fmtD(r.start)} – {fmtD(r.end)}</span>
                <div className="flex items-center gap-1">
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#15803D" }}>{r.doneTasks}</span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>/ {r.totalTasks}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#2563EB" }}>{r.donePoints}</span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>/ {r.totalPoints}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: "#E5E7EB", overflow: "hidden" }}>
                      <div style={{ width: `${rate}%`, height: "100%", borderRadius: 3, background: rate >= 80 ? "#15803D" : rate >= 50 ? "#2563EB" : "#D97706" }} />
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", minWidth: 32, textAlign: "right" }}>{rate}%</span>
                  </div>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>
                  🏆 {r.topMember} <span style={{ color: "#9CA3AF", fontWeight: 400 }}>({r.topPoints}pts)</span>
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  {(["done", "review", "inProgress", "todo"] as Status[]).filter(s => r.byStatus[s] > 0).map(s => {
                    const cnt = r.byStatus[s];
                    return (
                      <span
                        key={s}
                        style={{
                          fontSize: "11px", fontWeight: 600, color: STATUS_CFG[s].color,
                          background: STATUS_CFG[s].bg, borderRadius: 4, padding: "1px 6px",
                        }}
                      >
                        {STATUS_CFG[s].label} {cnt}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Mobile row */}
              <div
                className="md:hidden px-4 py-3 cursor-pointer"
                style={{
                  borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#FAFAFA",
                  background: isExpanded ? "#FAFAFA" : "transparent",
                }}
                onClick={() => setExpandedNum(isExpanded ? null : r.num)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>Sprint {r.num}</span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{fmtD(r.start)} – {fmtD(r.end)}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>任務 <b style={{ color: "#15803D" }}>{r.doneTasks}/{r.totalTasks}</b></span>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>點數 <b style={{ color: "#2563EB" }}>{r.donePoints}/{r.totalPoints}</b></span>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>完成率 <b>{rate}%</b></span>
                </div>
                <div style={{ width: "100%", height: 4, borderRadius: 2, background: "#E5E7EB", overflow: "hidden" }}>
                  <div style={{ width: `${rate}%`, height: "100%", borderRadius: 2, background: rate >= 80 ? "#15803D" : rate >= 50 ? "#2563EB" : "#D97706" }} />
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-5 py-4" style={{ background: "#F9FAFB", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: 2 }}>Sprint 天數</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                        {Math.ceil((new Date(r.end).getTime() - new Date(r.start).getTime()) / 86400000)} 天
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: 2 }}>參與人數</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{r.members} 人</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: 2 }}>人均點數</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{r.members ? Math.round(r.donePoints / r.members * 10) / 10 : 0} pts</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: 2 }}>未完成任務</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: r.totalTasks - r.doneTasks > 0 ? "#DC2626" : "#15803D" }}>
                        {r.totalTasks - r.doneTasks} 件
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Best sprint highlight */}
      {bestSprint && (
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-4"
          style={{ background: "#FFFBEB", borderWidth: "1px", borderStyle: "solid", borderColor: "#FDE68A" }}
        >
          <Trophy className="w-5 h-5 flex-shrink-0" style={{ color: "#D97706" }} />
          <div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#92400E" }}>
              歷史最佳：Sprint {bestSprint.num}
            </span>
            <span style={{ fontSize: "13px", color: "#92400E", marginLeft: 8 }}>
              完成 {bestSprint.donePoints} 點 · {bestSprint.doneTasks} 任務 · MVP {bestSprint.topMember}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── History Tab ─────────────────────────────────────────────────────────────
function HistoryTab({
  archivedTasks,
  onViewDetail,
}: {
  archivedTasks: ArchivedTask[];
  onViewDetail?: (taskId: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSprint, setFilterSprint] = useState<string>("all");
  const [filterType, setFilterType] = useState<IssueType | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "done" | "undone">("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [expandedSprint, setExpandedSprint] = useState<Set<number>>(new Set(
    Array.from(new Set(archivedTasks.map(t => t.sprintNum)))
  ));
  const [detailTask, setDetailTask] = useState<ArchivedTask | null>(null);

  const sprintNums = useMemo(() =>
    Array.from(new Set(archivedTasks.map(t => t.sprintNum))).sort((a, b) => b - a),
    [archivedTasks]
  );

  const filtered = useMemo(() => {
    return archivedTasks.filter(t => {
      const s = searchTerm.toLowerCase();
      const matchS = !s || t.title.toLowerCase().includes(s) || t.desc.toLowerCase().includes(s) || t.assignee.includes(s) || t.id.toLowerCase().includes(s);
      const matchSprint = filterSprint === "all" || t.sprintNum === Number(filterSprint);
      const matchType = filterType === "all" || t.type === filterType;
      const matchPri = filterPriority === "all" || t.priority === filterPriority;
      const matchStatus = filterStatus === "all"
        || (filterStatus === "done" && t.finalStatus === "done")
        || (filterStatus === "undone" && t.finalStatus !== "done");
      const matchProj = filterProject === "all" || String(t.projectId) === filterProject;
      return matchS && matchSprint && matchType && matchPri && matchStatus && matchProj;
    });
  }, [archivedTasks, searchTerm, filterSprint, filterType, filterPriority, filterStatus, filterProject]);

  const grouped = useMemo(() => {
    const map = new Map<number, ArchivedTask[]>();
    filtered.forEach(t => {
      if (!map.has(t.sprintNum)) map.set(t.sprintNum, []);
      map.get(t.sprintNum)!.push(t);
    });
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  const totalPoints = filtered.reduce((s, t) => s + t.storyPoints, 0);
  const doneCount = filtered.filter(t => t.finalStatus === "done").length;
  const hasFilters = searchTerm || filterSprint !== "all" || filterType !== "all" || filterPriority !== "all" || filterStatus !== "all" || filterProject !== "all";

  const toggleSprint = (num: number) => {
    setExpandedSprint(prev => {
      const n = new Set(prev);
      n.has(num) ? n.delete(num) : n.add(num);
      return n;
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "歷史任務總數", value: `${filtered.length}`, sub: "件", color: "#374151", bg: "#F9FAFB", border: "#E5E7EB" },
          { label: "完成任務", value: `${doneCount}`, sub: `/ ${filtered.length}`, color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
          { label: "累計點數", value: `${totalPoints}`, sub: "pts", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
          { label: "涵蓋 Sprint", value: `${grouped.length}`, sub: "個", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
        ].map(card => (
          <div
            key={card.label}
            className="px-4 py-3 rounded-lg"
            style={{ background: card.bg, borderWidth: "1px", borderStyle: "solid", borderColor: card.border }}
          >
            <div style={{ fontSize: "12px", fontWeight: 600, color: card.color, opacity: 0.8, marginBottom: 4 }}>{card.label}</div>
            <div className="flex items-baseline gap-1.5">
              <span className="tabular-nums" style={{ fontSize: "22px", fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</span>
              <span style={{ fontSize: "12px", color: card.color, opacity: 0.6 }}>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: 140 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
          <input
            type="text" placeholder="搜尋歷史任務..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded outline-none"
            style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#111827", fontFamily: "inherit" }}
          />
        </div>

        <StyledSelect
          value={filterProject}
          onChange={v => setFilterProject(v)}
          allLabel="全部專案"
          options={SHARED_PROJECTS.filter(p => p.status !== "cancelled").map(p => ({ key: String(p.id), label: p.name }))}
          className="max-md:w-full"
        />
        <StyledSelect
          value={filterSprint}
          onChange={v => setFilterSprint(v)}
          allLabel="全部 Sprint"
          options={sprintNums.map(n => ({ key: String(n), label: `Sprint ${n}` }))}
          className="max-md:w-full"
        />
        <StyledSelect
          value={filterStatus}
          onChange={v => setFilterStatus(v as any)}
          allLabel="全部狀態"
          options={[{ key: "done", label: "已完成" }, { key: "undone", label: "未完成" }]}
          className="max-md:w-full"
        />
        <StyledSelect
          value={filterType}
          onChange={v => setFilterType(v as any)}
          allLabel="全部類型"
          options={(["task", "story", "bug", "improvement"] as IssueType[]).map(t => ({ key: t, label: TYPE_CFG[t].label }))}
          className="max-md:w-full"
        />
        <StyledSelect
          value={filterPriority}
          onChange={v => setFilterPriority(v as any)}
          allLabel="全部優先度"
          options={(["critical", "high", "medium", "low"] as Priority[]).map(p => ({ key: p, label: PRIORITY_CFG[p].label }))}
          className="max-md:w-full"
        />
        {hasFilters && (
          <button
            onClick={() => { setSearchTerm(""); setFilterSprint("all"); setFilterType("all"); setFilterPriority("all"); setFilterStatus("all"); setFilterProject("all"); }}
            className="flex items-center gap-1 px-2.5 py-2 rounded"
            style={{ background: "#FEF2F2", color: "#DC2626", borderWidth: "1px", borderStyle: "solid", borderColor: "#FECACA", fontSize: "12px" }}
          >
            <X className="w-3 h-3" />清除
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ background: "#FAFAFA", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
          <div className="flex items-center justify-center mb-4" style={{ width: 56, height: 56, borderRadius: 14, background: "#F3F4F6" }}>
            <Archive className="w-6 h-6" style={{ color: "#9CA3AF" }} />
          </div>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>
            {hasFilters ? "找不到符合條件的歷史任務" : "目前沒有歷史任務"}
          </p>
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            {hasFilters ? "請嘗試調整篩選條件" : "結束 Sprint 後，任務將自動歸檔至此"}
          </p>
        </div>
      )}

      {/* Grouped by Sprint */}
      {grouped.map(([sprintNum, spTasks]) => {
        const isExpanded = expandedSprint.has(sprintNum);
        const spRange = spTasks[0]?.sprintRange ?? "";
        const spDone = spTasks.filter(t => t.finalStatus === "done").length;
        const spPts = spTasks.reduce((s, t) => s + t.storyPoints, 0);
        const spDonePts = spTasks.filter(t => t.finalStatus === "done").reduce((s, t) => s + t.storyPoints, 0);
        const spRate = spTasks.length ? Math.round((spDone / spTasks.length) * 100) : 0;

        return (
          <div key={sprintNum} className="rounded-xl overflow-hidden" style={{ background: "#FFFFFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            {/* Sprint group header */}
            <button
              className="w-full flex items-center justify-between px-5 py-4 max-md:px-4 max-md:py-3 cursor-pointer transition-colors"
              style={{ background: isExpanded ? "#FAFAFA" : "#FFFFFF", borderWidth: 0 }}
              onClick={() => toggleSprint(sprintNum)}
              onMouseEnter={e => { e.currentTarget.style.background = "#FAFAFA"; }}
              onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = "#FFFFFF"; }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF" }}>
                  <GitBranch className="w-4 h-4" style={{ color: "#2563EB" }} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Sprint {sprintNum}</span>
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{ fontSize: "11px", fontWeight: 600, background: spRate === 100 ? "#F0FDF4" : "#FFFBEB", color: spRate === 100 ? "#15803D" : "#D97706" }}
                    >
                      {spRate}% 完成
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{spRange}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 max-md:hidden">
                <div className="flex items-center gap-4" style={{ fontSize: "13px", color: "#6B7280" }}>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#15803D" }} />
                    <span className="tabular-nums" style={{ fontWeight: 600 }}>{spDone}/{spTasks.length}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" style={{ color: "#2563EB" }} />
                    <span className="tabular-nums" style={{ fontWeight: 600 }}>{spDonePts}/{spPts} pts</span>
                  </span>
                </div>
                <ChevronDown
                  className="w-4 h-4 transition-transform"
                  style={{ color: "#9CA3AF", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </div>
              <ChevronDown
                className="w-4 h-4 transition-transform md:hidden"
                style={{ color: "#9CA3AF", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            {/* Expanded cards */}
            {isExpanded && (
              <div style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                {/* Mobile sprint stats */}
                <div className="md:hidden flex items-center gap-3 px-4 py-2.5" style={{ background: "#FAFAFA" }}>
                  <span className="flex items-center gap-1" style={{ fontSize: "12px", color: "#6B7280" }}>
                    <CheckCircle2 className="w-3 h-3" style={{ color: "#15803D" }} />
                    <span className="tabular-nums" style={{ fontWeight: 600 }}>{spDone}/{spTasks.length}</span>
                  </span>
                  <span className="flex items-center gap-1" style={{ fontSize: "12px", color: "#6B7280" }}>
                    <BarChart2 className="w-3 h-3" style={{ color: "#2563EB" }} />
                    <span className="tabular-nums" style={{ fontWeight: 600 }}>{spDonePts}/{spPts} pts</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 max-md:p-3">
                  {spTasks.map(task => {
                    const tc = TYPE_CFG[task.type];
                    const pc = PRIORITY_CFG[task.priority];
                    const sc = STATUS_CFG[task.finalStatus];
                    const isDone = task.finalStatus === "done";

                    return (
                      <div
                        key={task.id}
                        className="rounded-lg cursor-pointer transition-all"
                        style={{
                          background: "#FFFFFF",
                          borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
                          padding: "16px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                        onClick={() => setDetailTask(task)}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#D1D5DB"; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                      >
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <TypeIcon type={task.type} size={18} />
                            <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace", fontWeight: 600 }}>{task.id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PriorityDot priority={task.priority} />
                            <span
                              className="px-2 py-0.5 rounded"
                              style={{
                                fontSize: "11px", fontWeight: 600,
                                background: isDone ? "#F0FDF4" : sc.bg,
                                color: isDone ? "#15803D" : sc.color,
                              }}
                            >
                              {isDone ? "已完成" : sc.label}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <p style={{
                          fontSize: "14px", fontWeight: 600, color: "#111827", lineHeight: 1.5, marginBottom: task.projectId ? "4px" : "8px",
                          textDecoration: isDone ? "none" : undefined,
                        }}>
                          {task.title}
                        </p>

                        {/* Project indicator (list view) */}
                        {task.projectId != null && (() => {
                          const proj = SHARED_PROJECTS.find(p => p.id === task.projectId);
                          if (!proj) return null;
                          return (
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: proj.color }} />
                              <span className="truncate" style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>{proj.name}</span>
                            </div>
                          );
                        })()}

                        {/* Desc */}
                        <p className="line-clamp-2" style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: 1.6, marginBottom: "10px" }}>
                          {task.desc}
                        </p>

                        {/* Labels */}
                        {task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {task.labels.map(l => (
                              <span
                                key={l}
                                style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "10px", background: "#F3F4F6", color: "#6B7280", fontWeight: 600 }}
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Divider */}
                        <div style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", marginBottom: "10px" }} />

                        {/* Bottom */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5" style={{ color: "#9CA3AF" }}>
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span style={{ fontSize: "12px", fontWeight: 500 }}>{task.dueDate.slice(5)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6B7280", background: "#F3F4F6", borderRadius: 4, padding: "2px 7px" }}>
                              {task.storyPoints}pt
                            </span>
                            <Avatar name={task.assignee} color={task.assigneeColor} size={24} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── History Detail Modal ──────────────────────────────────────────── */}
      {detailTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 max-md:p-0"
          style={{ background: "rgba(17,24,39,0.55)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDetailTask(null); }}
        >
          <div
            className="w-full flex flex-col max-md:h-full max-md:rounded-none"
            style={{
              maxWidth: 640, background: "#FFF", borderRadius: 14,
              boxShadow: "0 32px 80px rgba(0,0,0,0.22)", maxHeight: "90vh", overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              className="px-7 max-md:px-4 py-5 flex items-start justify-between flex-shrink-0"
              style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <TypeIcon type={detailTask.type} size={20} />
                  <span style={{ fontSize: "12px", color: "#9CA3AF", fontFamily: "monospace", fontWeight: 600 }}>{detailTask.id}</span>
                  <span
                    className="px-2 py-0.5 rounded"
                    style={{
                      fontSize: "11px", fontWeight: 600,
                      background: detailTask.finalStatus === "done" ? "#F0FDF4" : STATUS_CFG[detailTask.finalStatus].bg,
                      color: detailTask.finalStatus === "done" ? "#15803D" : STATUS_CFG[detailTask.finalStatus].color,
                    }}
                  >
                    {detailTask.finalStatus === "done" ? "已完成" : STATUS_CFG[detailTask.finalStatus].label}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded"
                    style={{ fontSize: "11px", fontWeight: 600, background: "#EFF6FF", color: "#2563EB" }}
                  >
                    Sprint {detailTask.sprintNum}
                  </span>
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", lineHeight: 1.4 }}>
                  {detailTask.title}
                </h2>
              </div>
              <button
                onClick={() => setDetailTask(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ml-3"
                style={{ color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", background: "#FFF" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-7 max-md:px-4 py-6" style={{ minHeight: 0 }}>
              {/* Description */}
              <div className="mb-6">
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 8 }}>描述</p>
                <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.7 }}>{detailTask.desc}</p>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 6 }}>負責人</p>
                  <div className="flex items-center gap-2">
                    <Avatar name={detailTask.assignee} color={detailTask.assigneeColor} size={28} />
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{detailTask.assignee}</p>
                      <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{detailTask.dept}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 6 }}>優先度</p>
                  <div className="flex items-center gap-2">
                    <PriorityDot priority={detailTask.priority} />
                    <span style={{ fontSize: "14px", fontWeight: 600, color: PRIORITY_CFG[detailTask.priority].color }}>
                      {PRIORITY_CFG[detailTask.priority].label}
                    </span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 6 }}>截止日期</p>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" style={{ color: "#6B7280" }} />
                    <span style={{ fontSize: "14px", color: "#374151" }}>{detailTask.dueDate}</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 6 }}>故事點數</p>
                  <span style={{ fontSize: "22px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
                    {detailTask.storyPoints}
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#9CA3AF", marginLeft: 4 }}>pt</span>
                  </span>
                </div>
              </div>

              {/* Labels */}
              {detailTask.labels.length > 0 && (
                <div className="mb-6">
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 8 }}>標籤</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detailTask.labels.map(l => (
                      <span key={l} style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "10px", background: "#F3F4F6", color: "#374151", fontWeight: 600 }}>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Archive info */}
              <div style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", paddingTop: 16 }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", marginBottom: 8 }}>歸檔資訊</p>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                  <Archive className="w-3.5 h-3.5" style={{ color: "#9CA3AF", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                      Sprint {detailTask.sprintNum} · {detailTask.sprintRange}
                    </p>
                    <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                      歸檔於 {detailTask.archivedDate} · 建立於 {detailTask.createdDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-7 max-md:px-4 py-4 flex items-center justify-end gap-2 flex-shrink-0"
              style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB", background: "#FAFAFA" }}
            >
              <button
                onClick={() => setDetailTask(null)}
                className="px-5 py-2 rounded-lg"
                style={{
                  fontSize: "13px", fontWeight: 600, color: "#374151",
                  borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
                  background: "#FFF", fontFamily: "inherit", cursor: "pointer",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; }}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function Tasks() {
  const { permissions, user } = useAuth();
  const canEdit = permissions.canEditTask;
  const canViewTrackerReport = user?.userRole === "admin" || user?.userRole === "pm" || user?.userRole === "product_manager";
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectFilter = searchParams.get("project");
  const activeProjects = useMemo(() => SHARED_PROJECTS.filter(p => p.status === "inProgress" || p.status === "planning"), []);
  const defaultProjectId = initialProjectFilter ?? (activeProjects.length > 0 ? String(activeProjects[0].id) : String(SHARED_PROJECTS[0]?.id ?? 1));
  const [tasks, setTasks]           = useState<Task[]>(INIT_TASKS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterType, setFilterType]         = useState<IssueType | "all">("all");
  const [filterProject, setFilterProject]   = useState<string>(defaultProjectId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsedCols, setCollapsedCols] = useState<Set<Status>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<Status | undefined>(undefined);
  const [showSettlement, setShowSettlement] = useState(false);
  const [sprintNum, setSprintNum] = useState(7);
  const [sprintStart, setSprintStart] = useState("2026-03-01");
  const [sprintEnd, setSprintEnd] = useState("2026-03-14");
  const [showSprintConfig, setShowSprintConfig] = useState(false);
  const [sprintStatus, setSprintStatus] = useState<"idle" | "active" | "completed">("idle");
  const [sprintBannerDismissed, setSprintBannerDismissed] = useState(() => sessionStorage.getItem("sprintBannerDismissed") === "1");
  const [sprintMembers, setSprintMembers] = useState<number[]>([]);
  const [sprintGoal, setSprintGoal] = useState("完成 Q1 功能開發與效能優化");
  const [sprintStartedAt, setSprintStartedAt] = useState<string | null>(null);
  const [sprintHistory, setSprintHistory] = useState<SprintRecord[]>(MOCK_HISTORY);
  const [mainTab, setMainTab] = useState<"board" | "report" | "history" | "tracker">("board");
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [archivedTasks, setArchivedTasks] = useState<ArchivedTask[]>(INIT_ARCHIVED);

  const [draggingId, setDraggingId]   = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);
  const [mobileColIdx, setMobileColIdx] = useState(0);

  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef  = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  const selected = useMemo(() => tasks.find(t => t.id === selectedId) ?? null, [tasks, selectedId]);

  // Sync URL when project filter changes
  useEffect(() => {
    const cur = searchParams.get("project");
    if (cur !== filterProject) {
      const next = new URLSearchParams(searchParams);
      next.set("project", filterProject);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProject]);

  const filteredTasks = useMemo(() => tasks.filter(t => {
    const s = searchTerm.toLowerCase();
    const matchS = !s || t.title.toLowerCase().includes(s) || t.desc.toLowerCase().includes(s) || t.assignee.includes(s) || t.id.toLowerCase().includes(s);
    const matchP = filterPriority === "all" || t.priority === filterPriority;
    const matchT = filterType === "all" || t.type === filterType;
    const matchProj = String(t.projectId) === filterProject;
    const notDone = t.status !== "done";
    return matchS && matchP && matchT && matchProj && notDone;
  }), [tasks, searchTerm, filterPriority, filterType, filterProject]);

  const byStatus = useMemo(() => {
    const m: Record<Status, Task[]> = { todo: [], inProgress: [], review: [], done: [] };
    filteredTasks.forEach(t => m[t.status].push(t));
    return m;
  }, [filteredTasks]);

  const moveTask = (id: string, newStatus: Status) => {
    if (!canEdit) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const addTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  const openCreateModal = (defaultStatus?: Status) => {
    setCreateDefaultStatus(defaultStatus);
    setShowCreateModal(true);
  };

  const toggleCollapse = (col: Status) => {
    setCollapsedCols(prev => {
      const n = new Set(prev);
      n.has(col) ? n.delete(col) : n.add(col);
      return n;
    });
  };

  const hasFilters  = searchTerm || filterPriority !== "all" || filterType !== "all";
  const totalPoints = filteredTasks.reduce((s, t) => s + t.storyPoints, 0);

  // Sprint lifecycle
  const todayDate = new Date(TODAY);
  const spStartDate = new Date(sprintStart);
  const spEndDate = new Date(sprintEnd);
  const sprintDays = Math.max(1, Math.ceil((spEndDate.getTime() - spStartDate.getTime()) / 86400000));
  const daysPassed = sprintStatus === "active"
    ? Math.max(0, Math.ceil((todayDate.getTime() - spStartDate.getTime()) / 86400000))
    : 0;
  const daysRemaining = sprintStatus === "active" ? Math.max(0, sprintDays - daysPassed) : sprintDays;
  const sprintProgress = sprintStatus === "active" ? Math.min(100, Math.round((daysPassed / sprintDays) * 100)) : 0;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const donePointsTotal = tasks.filter(t => t.status === "done").reduce((s, t) => s + t.storyPoints, 0);
  const allPointsTotal = tasks.reduce((s, t) => s + t.storyPoints, 0);
  const taskCompletionRate = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;

  const handleStartSprint = () => {
    setSprintStatus("active");
    setSprintStartedAt(TODAY);
  };

  const handleEndSprint = () => {
    // Record this sprint
    const uniqueAssignees = new Set(tasks.map(t => t.assignee));
    const memberPoints: Record<string, number> = {};
    tasks.filter(t => t.status === "done").forEach(t => {
      memberPoints[t.assignee] = (memberPoints[t.assignee] || 0) + t.storyPoints;
    });
    const topEntry = Object.entries(memberPoints).sort((a, b) => b[1] - a[1])[0];
    const statusCounts: Record<Status, number> = { todo: 0, inProgress: 0, review: 0, done: 0 };
    tasks.forEach(t => { statusCounts[t.status]++; });

    const record: SprintRecord = {
      num: sprintNum,
      start: sprintStart,
      end: sprintEnd,
      totalTasks: tasks.length,
      doneTasks,
      totalPoints: allPointsTotal,
      donePoints: donePointsTotal,
      members: sprintMembers.length > 0 ? sprintMembers.length : uniqueAssignees.size,
      topMember: topEntry ? topEntry[0] : "—",
      topPoints: topEntry ? topEntry[1] : 0,
      byStatus: statusCounts,
    };

    setSprintHistory(prev => [...prev, record]);

    // Archive all tasks into history
    const newArchived: ArchivedTask[] = tasks.map(t => ({
      ...t,
      archivedDate: TODAY,
      sprintNum,
      sprintRange: `${sprintStart.replace(/-/g, "/")} – ${sprintEnd.replace(/-/g, "/")}`,
      finalStatus: t.status,
    }));
    setArchivedTasks(prev => [...newArchived, ...prev]);

    setSprintStatus("completed");
    setShowEndConfirm(false);
  };

  const handleNewSprint = () => {
    setSprintNum(prev => prev + 1);
    setSprintStatus("idle");
    setSprintStartedAt(null);
    // Auto advance dates by sprint duration
    const nextStart = new Date(spEndDate.getTime() + 86400000);
    const nextEnd = new Date(nextStart.getTime() + sprintDays * 86400000);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    setSprintStart(fmt(nextStart));
    setSprintEnd(fmt(nextEnd));
    setSprintMembers([]);
    setSprintGoal("");
  };


  return (
    <div className="h-full flex flex-col" style={{ minHeight: 0 }}>
      <Toaster position="top-right" richColors />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 max-md:flex-col max-md:items-stretch max-md:gap-3">
        <div>
          <h1 style={{ color: "#111827" }}>工作事項</h1>
          <p style={{ fontSize: "15px", color: "#9CA3AF", marginTop: 2 }}>
            Sprint {sprintNum} · {sprintStart.replace(/-/g, "/")} – {sprintEnd.replace(/-/g, "/")}
          </p>
        </div>
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 max-md:w-full">
          {/* Project selector */}
          <StyledSelect
            value={filterProject}
            onChange={v => setFilterProject(v)}
            options={SHARED_PROJECTS.filter(p => p.status !== "cancelled").map(p => ({ key: String(p.id), label: p.name }))}
            formField
            className="max-md:w-full"
          />
          {/* Sprint action button */}
          {sprintStatus === "idle" && (
            <button
              onClick={handleStartSprint}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:w-full cursor-pointer"
              style={{
                background: "#15803D", color: "#FFF", fontSize: "13px", fontWeight: 500,
                borderWidth: 0, transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#166534"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#15803D"; }}
            >
              <Zap className="w-3.5 h-3.5" />開始 Sprint
            </button>
          )}
          {sprintStatus === "active" && (
            <button
              onClick={() => setShowEndConfirm(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:w-full cursor-pointer"
              style={{
                background: "#DC2626", color: "#FFF", fontSize: "13px", fontWeight: 500,
                borderWidth: 0, transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#B91C1C"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#DC2626"; }}
            >
              <Flag className="w-3.5 h-3.5" />結束 Sprint
            </button>
          )}
          {sprintStatus === "completed" && (
            <button
              onClick={handleNewSprint}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:w-full cursor-pointer"
              style={{
                background: "#2563EB", color: "#FFF", fontSize: "13px", fontWeight: 500,
                borderWidth: 0, transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1D4ED8"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#2563EB"; }}
            >
              <ArrowRight className="w-3.5 h-3.5" />下一個 Sprint
            </button>
          )}
          {/* Settlement */}
          <button
            onClick={() => setShowSettlement(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:w-full cursor-pointer"
            style={{
              background: "#F9FAFB", color: "#374151", fontSize: "13px", fontWeight: 500,
              borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.borderColor = "#D1D5DB"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
          >
            <Trophy className="w-3.5 h-3.5" />結算點數
          </button>
          {/* Sprint config */}
          {(sprintStatus === "idle" || sprintStatus === "active") && (
            <button
              onClick={() => setShowSprintConfig(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:w-full cursor-pointer"
              style={{
                background: "#F9FAFB", color: "#374151", fontSize: "13px", fontWeight: 500,
                borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.borderColor = "#D1D5DB"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
            >
              <Settings className="w-3.5 h-3.5" />Sprint 設定
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => openCreateModal()}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:w-full cursor-pointer"
              style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 500, borderWidth: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}
            >
              <Plus className="w-3.5 h-3.5" />建立事項
            </button>
          )}
        </div>
      </div>

      {/* ── Sprint Status Banner ─────────────────────────────────────────── */}
      {sprintStatus === "active" && (
        <div
          className="rounded-xl mb-5 p-4 md:p-5"
          style={{
            background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
            borderWidth: "1px", borderStyle: "solid", borderColor: "#374151",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Sprint progress */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center justify-center"
                  style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.1)" }}
                >
                  <Zap className="w-4 h-4" style={{ color: "#34D399" }} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFF" }}>
                  Sprint {sprintNum} 進行中
                </span>
                <span
                  style={{
                    fontSize: "11px", fontWeight: 600, color: "#34D399",
                    background: "rgba(52,211,153,0.15)", borderRadius: 4, padding: "2px 8px",
                  }}
                >
                  Day {daysPassed} / {sprintDays}
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: 8 }}>
                <div
                  style={{
                    width: `${sprintProgress}%`, height: "100%", borderRadius: 3,
                    background: sprintProgress >= 80 ? "#F59E0B" : "#34D399",
                    transition: "width 0.4s",
                  }}
                />
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                  剩餘 <b style={{ color: daysRemaining <= 2 ? "#F59E0B" : "rgba(255,255,255,0.8)" }}>{daysRemaining} 天</b>
                </span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                  時程進度 <b style={{ color: "rgba(255,255,255,0.8)" }}>{sprintProgress}%</b>
                </span>
              </div>
              {sprintGoal && (
                <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(255,255,255,0.08)" }}>
                  <Flag className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                    目標：<span style={{ color: "rgba(255,255,255,0.75)" }}>{sprintGoal}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="text-center">
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFF", lineHeight: 1 }}>{doneTasks}/{tasks.length}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: 4 }}>完成任務</div>
              </div>
              <div className="text-center">
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#FFF", lineHeight: 1 }}>{donePointsTotal}<span style={{ fontSize: "12px", fontWeight: 400, opacity: 0.5 }}>/{allPointsTotal}</span></div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: 4 }}>結算點數</div>
              </div>
              <div className="text-center">
                <div style={{
                  fontSize: "20px", fontWeight: 800, lineHeight: 1,
                  color: taskCompletionRate >= 80 ? "#34D399" : taskCompletionRate >= 50 ? "#F59E0B" : "#FCA5A5",
                }}>{taskCompletionRate}%</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: 4 }}>完成率</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {sprintStatus === "idle" && !sprintBannerDismissed && (
        <div
          className="rounded-lg mb-4 px-3 py-2.5 flex items-center gap-2"
          style={{ background: "#F0FDF4", borderWidth: "1px", borderStyle: "solid", borderColor: "#BBF7D0" }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 26, height: 26, borderRadius: 6, background: "#DCFCE7" }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: "#15803D" }} />
          </div>
          <div className="flex-1">
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#15803D" }}>準備開始 Sprint {sprintNum}</div>
            <div style={{ fontSize: "11px", color: "#6B7280", marginTop: 1 }}>
              已規劃 {tasks.length} 個任務 · {allPointsTotal} 點{sprintMembers.length > 0 ? ` · ${sprintMembers.length} 位成員` : ""} · 預計 {sprintDays} 天（{sprintStart.replace(/-/g, "/")} – {sprintEnd.replace(/-/g, "/")}）
              {sprintGoal && <> · 目標：{sprintGoal}</>}
            </div>
          </div>
          <button
            className="flex-shrink-0 cursor-pointer rounded-md hover:bg-green-100 transition-colors"
            style={{ padding: 4 }}
            onClick={() => { setSprintBannerDismissed(true); sessionStorage.setItem("sprintBannerDismissed", "1"); }}
            aria-label="關閉提示"
          >
            <X className="w-3.5 h-3.5" style={{ color: "#6B7280" }} />
          </button>
        </div>
      )}

      {sprintStatus === "completed" && (
        <div
          className="rounded-xl mb-5 px-5 py-4 flex flex-col md:flex-row md:items-center gap-3"
          style={{ background: "#FFFBEB", borderWidth: "1px", borderStyle: "solid", borderColor: "#FDE68A" }}
        >
          <div className="flex items-center gap-3 flex-1">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 32, height: 32, borderRadius: 8, background: "#FEF3C7" }}
            >
              <Trophy className="w-4 h-4" style={{ color: "#D97706" }} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#92400E" }}>Sprint {sprintNum} ��結束</div>
              <div style={{ fontSize: "12px", color: "#92400E", opacity: 0.7, marginTop: 2 }}>
                完成 {doneTasks}/{tasks.length} 任務 · {donePointsTotal}/{allPointsTotal} 點 · 完成率 {taskCompletionRate}%
              </div>
            </div>
          </div>
          <button
            onClick={() => setMainTab("report")}
            className="flex items-center gap-1.5 cursor-pointer max-md:ml-11"
            style={{
              fontSize: "13px", fontWeight: 600, color: "#D97706", background: "transparent",
              borderWidth: 0, padding: 0,
            }}
          >
            查看報表 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
        {([
          { key: "board" as const, label: "看板", icon: <GitBranch className="w-3.5 h-3.5" /> },
          ...(canViewTrackerReport ? [{ key: "tracker" as const, label: "任務追蹤", icon: <Users className="w-3.5 h-3.5" /> }] : []),
          ...(canViewTrackerReport ? [{ key: "report" as const, label: "Sprint 報表", icon: <BarChart2 className="w-3.5 h-3.5" /> }] : []),
          { key: "history" as const, label: "歷史任務", icon: <Archive className="w-3.5 h-3.5" /> },
        ]).map(tab => {
          const active = mainTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setMainTab(tab.key)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
              style={{
                fontSize: "13px", fontWeight: active ? 600 : 500,
                background: active ? "#111827" : "transparent",
                color: active ? "#FFF" : "#6B7280",
                boxShadow: active ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
              }}
            >
              {tab.icon}{tab.label}
              {tab.key === "report" && sprintHistory.length > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full tabular-nums"
                  style={{
                    fontSize: "11px", fontWeight: 700,
                    background: active ? "rgba(255,255,255,0.2)" : "#E5E7EB",
                    color: active ? "#FFF" : "#374151",
                    lineHeight: 1,
                  }}
                >
                  {sprintHistory.length}
                </span>
              )}
              {tab.key === "history" && archivedTasks.length > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full tabular-nums"
                  style={{
                    fontSize: "11px", fontWeight: 700,
                    background: active ? "rgba(255,255,255,0.2)" : "#E5E7EB",
                    color: active ? "#FFF" : "#374151",
                    lineHeight: 1,
                  }}
                >
                  {archivedTasks.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Report Tab ──────────────────────────────────────────────── */}
      {mainTab === "report" && canViewTrackerReport && <SprintReportTab history={sprintHistory} />}

      {/* ── History Tab ────────���─────────────────────────────────────��───── */}
      {mainTab === "history" && (
        <HistoryTab
          archivedTasks={archivedTasks}
          onViewDetail={(taskId) => setSelectedId(taskId)}
        />
      )}

      {/* ── Tracker Tab ──────────────────────────────────────────────────── */}
      {mainTab === "tracker" && canViewTrackerReport && <EmployeeTaskTracker employees={EMP_LIST} />}

      {/* ── Board Tab ────────────────────────────────────────────────────── */}
      {mainTab === "board" && (<>

      {/* ── Sprint stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {COLUMNS.map(col => {
          const cfg = STATUS_CFG[col.key];
          const count = byStatus[col.key].length;
          return (
            <div
              key={col.key}
              className="px-4 py-3 rounded-lg flex items-center justify-between"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <span style={{ fontSize: "14px", fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
              <span style={{ fontSize: "22px", fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* ── Priority Legend ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280" }}>優先度圖示：</span>
        {(["critical", "high", "medium", "low"] as Priority[]).map(p => {
          const c = PRIORITY_CFG[p];
          return (
            <span key={p} className="flex items-center gap-1.5">
              <span style={{ fontSize: "14px", fontWeight: 900, color: c.color, lineHeight: 1, letterSpacing: "-1px" }}>{c.icon}</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: c.color }}>{c.label}</span>
            </span>
          );
        })}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1" style={{ minWidth: 140 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
          <input
            type="text" placeholder="搜尋事項、指派人、ID..."
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); }}
            className="w-full pl-9 pr-3 py-2 rounded outline-none"
            style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#111827", fontFamily: "inherit" }}
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-3 py-2 rounded"
          style={{
            background: showFilters ? "#111827" : "#FFF",
            color: showFilters ? "#FFF" : "#374151",
            borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px",
          }}
        >
          <Filter className="w-3.5 h-3.5" />篩選
        </button>

        {showFilters && (
          <>
            <StyledSelect
              value={filterPriority}
              onChange={v => { setFilterPriority(v as any); }}
              allLabel="全部優先度"
              options={(["critical","high","medium","low"] as Priority[]).map(p => ({ key: p, label: PRIORITY_CFG[p].label }))}
              className="max-md:w-full"
            />
            <StyledSelect
              value={filterType}
              onChange={v => { setFilterType(v as any); }}
              allLabel="全部類型"
              options={(["task","story","bug","improvement"] as IssueType[]).map(t => ({ key: t, label: TYPE_CFG[t].label }))}
              className="max-md:w-full"
            />
          </>
        )}

        {hasFilters && (
          <button
            onClick={() => { setSearchTerm(""); setFilterPriority("all"); setFilterType("all"); }}
            className="flex items-center gap-1 px-2.5 py-2 rounded"
            style={{ background: "#FEF2F2", color: "#DC2626", borderWidth: "1px", borderStyle: "solid", borderColor: "#FECACA", fontSize: "12px" }}
          >
            <X className="w-3 h-3" />清除
          </button>
        )}

        <div className="ml-auto flex items-center gap-3" style={{ fontSize: "12px", color: "#9CA3AF" }}>
          <span><strong style={{ color: "#111827" }}>{filteredTasks.length}</strong> 件事項</span>
          <span><strong style={{ color: "#111827" }}>{totalPoints}</strong> pt</span>
          {/* Assignee avatars */}
          <div className="flex -space-x-1">
            {Array.from(new Map(tasks.map(t => [t.assignee, t])).values()).slice(0, 6).map(t => (
              <Avatar key={t.assignee} name={t.assignee} color={t.assigneeColor} size={24} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile Column Switcher ─────────────────────────────────────── */}
      <div className="hidden max-md:flex items-center justify-center mb-3 px-1.5 py-1.5">
        <div className="flex items-center gap-1">
          {COLUMNS.map((col, i) => {
            const cfg = STATUS_CFG[col.key];
            const active = i === mobileColIdx;
            return (
              <button
                key={col.key}
                onClick={() => {
                  setMobileColIdx(i);
                  boardRef.current?.scrollTo({ left: i * boardRef.current.offsetWidth, behavior: "smooth" });
                }}
                className="px-3 py-1.5 rounded-lg transition-all"
                style={{
                  fontSize: "12px",
                  fontWeight: active ? 700 : 500,
                  background: active ? "#FFFFFF" : "transparent",
                  color: active ? cfg.color : "#6B7280",
                  whiteSpace: "nowrap",
                  boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Board View ──────────────────────────────────────────────────── */}
      {(
        <div
          ref={boardRef}
          className="flex gap-3 overflow-auto flex-1 pb-4 max-md:snap-x max-md:snap-mandatory max-md:flex-none max-md:overflow-x-auto max-md:overflow-y-visible max-md:scrollbar-none"
          onScroll={() => {
            const el = boardRef.current;
            if (!el || el.offsetWidth === 0) return;
            const idx = Math.round(el.scrollLeft / el.offsetWidth);
            if (idx !== mobileColIdx && idx >= 0 && idx < COLUMNS.length) setMobileColIdx(idx);
          }}
          style={{
            alignItems: "flex-start",
            minHeight: 0,
            scrollbarColor: "#D1D5DB #F3F4F6",
            scrollbarWidth: "thin",
            cursor: "grab",
            userSelect: "none",
          }}
          onMouseDown={e => {
            const el = boardRef.current;
            if (!el) return;
            dragRef.current = { isDown: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
            el.style.cursor = "grabbing";
          }}
          onMouseMove={e => {
            const el = boardRef.current;
            if (!dragRef.current.isDown || !el) return;
            e.preventDefault();
            const x    = e.pageX - el.offsetLeft;
            const walk = (x - dragRef.current.startX) * 1.2;
            el.scrollLeft = dragRef.current.scrollLeft - walk;
          }}
          onMouseUp={() => {
            dragRef.current.isDown = false;
            if (boardRef.current) boardRef.current.style.cursor = "grab";
          }}
          onMouseLeave={() => {
            dragRef.current.isDown = false;
            if (boardRef.current) boardRef.current.style.cursor = "grab";
          }}
        >
          {COLUMNS.map(col => {
            const cfg = STATUS_CFG[col.key];
            const colTasks = byStatus[col.key];
            const isCollapsed = collapsedCols.has(col.key);
            const colPts = colTasks.reduce((s, t) => s + t.storyPoints, 0);

            return (
              <div
                key={col.key}
                className="max-md:!w-[calc(100vw-72px)] max-md:!min-w-[calc(100vw-72px)] max-md:snap-start"
                style={{
                  minWidth: isCollapsed ? 44 : 300,
                  width: isCollapsed ? 44 : 300,
                  flexShrink: 0,
                  transition: "min-width 0.2s, width 0.2s",
                }}
              >
                {/* Column header */}
                <div
                  className="flex items-center justify-between mb-2 px-3 py-2.5 rounded-lg"
                  style={{ background: cfg.headerBg }}
                >
                  {!isCollapsed ? (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        <span style={{ fontSize: "14px", fontWeight: 700, color: cfg.color, whiteSpace: "nowrap" }}>
                          {cfg.label}
                        </span>
                        <span
                          style={{
                            fontSize: "12px", fontWeight: 700, color: cfg.color,
                            background: "#FFF", borderRadius: 10, padding: "0px 6px",
                            border: `1px solid ${cfg.border}`,
                          }}
                        >
                          {colTasks.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span style={{ fontSize: "12px", color: cfg.color, opacity: 0.7 }}>{colPts}pt</span>
                        <button
                          onClick={() => toggleCollapse(col.key)}
                          title="收合欄位"
                          style={{ color: cfg.color, opacity: 0.6, display: "flex", alignItems: "center" }}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => openCreateModal(col.key)}
                            style={{ color: cfg.color, opacity: 0.6, display: "flex", alignItems: "center" }}
                            title="新至此欄"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleCollapse(col.key)}
                      className="w-full flex flex-col items-center gap-2"
                      style={{ color: cfg.color }}
                    >
                      <ChevronDown className="w-4 h-4" />
                      <span
                        style={{
                          fontSize: "12px", fontWeight: 700, writingMode: "vertical-rl",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {cfg.label}
                      </span>
                      <span
                        style={{
                          fontSize: "12px", fontWeight: 700, color: cfg.color,
                          background: "#FFF", borderRadius: 10, padding: "1px 5px",
                        }}
                      >
                        {colTasks.length}
                      </span>
                    </button>
                  )}
                </div>

                {/* Cards — Drop Zone */}
                {!isCollapsed && (
                  <div
                    className="space-y-2"
                    onDragOver={canEdit ? (e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (dragOverCol !== col.key) setDragOverCol(col.key);
                    } : undefined}
                    onDragEnter={canEdit ? (e) => {
                      e.preventDefault();
                      setDragOverCol(col.key);
                    } : undefined}
                    onDragLeave={canEdit ? (e) => {
                      // only clear if leaving the column container itself
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setDragOverCol(null);
                      }
                    } : undefined}
                    onDrop={canEdit ? (e) => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData("taskId");
                      if (id) moveTask(id, col.key);
                      setDragOverCol(null);
                      setDraggingId(null);
                    } : undefined}
                    style={{
                      minHeight: 60,
                      borderRadius: 10,
                      padding: dragOverCol === col.key ? "6px" : "0px",
                      border: dragOverCol === col.key
                        ? `2px dashed ${cfg.color}`
                        : "2px solid transparent",
                      background: dragOverCol === col.key ? cfg.bg : "transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    {colTasks.length === 0 ? (
                      <div
                        className="flex flex-col items-center justify-center py-8 rounded-lg"
                        style={{
                          border: dragOverCol === col.key ? "none" : `2px dashed ${cfg.border}`,
                          color: cfg.color,
                          opacity: dragOverCol === col.key ? 1 : 0.5,
                          background: dragOverCol === col.key ? "transparent" : undefined,
                        }}
                      >
                        <Plus className="w-5 h-5 mb-1" />
                        <span style={{ fontSize: "12px" }}>
                          {dragOverCol === col.key ? "放開以移至此欄" : "拖曳或新增"}
                        </span>
                      </div>
                    ) : (
                      colTasks.map(task => (
                        <KanbanCard
                          key={task.id}
                          task={task}
                          onClick={() => setSelectedId(task.id)}
                          onMove={moveTask}
                          columns={COLUMNS}
                          onDragStart={() => setDraggingId(task.id)}
                          onDragEnd={() => { setDraggingId(null); setDragOverCol(null); }}
                          isDragging={draggingId === task.id}
                          canDrag={canEdit}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      </>)}

      {/* ── Task Detail Modal ────────────────────────────────────────────── */}
      {selected && (
        <TaskDetail
          task={selected}
          onClose={() => setSelectedId(null)}
          onMove={moveTask}
          columns={COLUMNS}
        />
      )}

      {/* ── Create Task Modal ──────────────────────────────────────────── */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreate={addTask}
          defaultStatus={createDefaultStatus}
          currentSprintNum={sprintNum}
          currentSprintStart={sprintStart}
          currentSprintEnd={sprintEnd}
          sprintStatus={sprintStatus}
          defaultProjectId={filterProject}
        />
      )}

      {/* ── Settlement Modal ───────────────────────────────────────────── */}
      {showSettlement && (
        <SettlementModal
          tasks={tasks}
          onClose={() => setShowSettlement(false)}
          sprintNum={sprintNum}
          sprintStart={sprintStart}
          sprintEnd={sprintEnd}
        />
      )}

      {/* ── Sprint Config Modal ─────────────────────────────────────────── */}
      {showSprintConfig && (
        <SprintConfigModal
          sprintNum={sprintNum}
          sprintStart={sprintStart}
          sprintEnd={sprintEnd}
          onChangeNum={setSprintNum}
          onChangeStart={setSprintStart}
          onChangeEnd={setSprintEnd}
          sprintMembers={sprintMembers}
          onChangeMembers={setSprintMembers}
          sprintGoal={sprintGoal}
          onChangeGoal={setSprintGoal}
          tasks={tasks}
          onClose={() => setShowSprintConfig(false)}
          onConfirm={() => {
            setShowSprintConfig(false);
            if (sprintMembers.length > 0) {
              const names = SPRINT_ALL_EMPLOYEES
                .filter(e => sprintMembers.includes(e.id))
                .map(e => e.name);
              toast.success(
                `已儲存 Sprint ${sprintNum} 設定，系統通知已發送給 ${names.length} 位成員`,
                { description: names.join("、"), duration: 5000 }
              );
            } else {
              toast.success(`已儲存 Sprint ${sprintNum} 設定`);
            }
          }}
        />
      )}

      {/* ── End Sprint Confirmation ──────────────────────────────────────── */}
      {showEndConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowEndConfirm(false); }}
        >
          <div
            className="rounded-xl w-full max-w-md mx-4"
            style={{ background: "#FFF", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
          >
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex items-center justify-center"
                  style={{ width: 40, height: 40, borderRadius: 10, background: "#FEF2F2" }}
                >
                  <Flag className="w-5 h-5" style={{ color: "#DC2626" }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "#111827" }}>結束 Sprint {sprintNum}？</h3>
                  <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: 2 }}>
                    此操作將記錄本次 Sprint 數據並歸檔
                  </p>
                </div>
              </div>
              <div
                className="rounded-lg px-4 py-3 mb-4"
                style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}
              >
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#15803D" }}>{doneTasks}/{tasks.length}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>完成任務</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#2563EB" }}>{donePointsTotal}/{allPointsTotal}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>結算點數</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#7C3AED" }}>{taskCompletionRate}%</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>完成率</div>
                  </div>
                </div>
                {tasks.length - doneTasks > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                    <AlertCircle className="w-3.5 h-3.5" style={{ color: "#D97706" }} />
                    <span style={{ fontSize: "12px", color: "#D97706" }}>
                      尚有 {tasks.length - doneTasks} 個未完成任務將記錄為未結算
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div
              className="flex items-center justify-end gap-2 px-6 py-3.5"
              style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", background: "#FAFAFA", borderRadius: "0 0 12px 12px" }}
            >
              <button
                onClick={() => setShowEndConfirm(false)}
                className="px-4 py-2 rounded cursor-pointer"
                style={{
                  fontSize: "13px", fontWeight: 500, color: "#6B7280",
                  background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; }}
              >
                取消
              </button>
              <button
                onClick={handleEndSprint}
                className="px-4 py-2 rounded cursor-pointer"
                style={{
                  fontSize: "13px", fontWeight: 600, color: "#FFF",
                  background: "#DC2626", borderWidth: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#B91C1C"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#DC2626"; }}
              >
                確認結束
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}