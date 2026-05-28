import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Bell, Mail, Inbox, Send, FileText, Trash2, Plus,
  Search, Star, StarOff, Paperclip, Reply, Forward,
  CheckCheck, X, ChevronDown, ChevronRight, ArrowLeft,
  Fingerprint, CheckSquare, Megaphone, Receipt,
  Clock, Package, FolderKanban, Archive,
  ReplyAll, Check, Users,
} from "lucide-react";
import { Pagination } from "../components/Pagination";
import { DraggableScroll } from "../components/DraggableScroll";
import { EMPLOYEES, DEPT_BG, DEPT_COLOR } from "../data/employees";

// ─── Types ────────────────────────────────────────────────────────────────────
type View       = "notifications" | "inbox" | "sent" | "drafts" | "trash";
type Category   = "all" | "punch" | "task" | "announcement" | "finance" | "attendance" | "asset" | "project";
type ReadFilter = "all" | "unread" | "read";
type Level      = "info" | "warning" | "success" | "urgent";
type ComposeMode = "new" | "reply" | "replyAll" | "forward";

interface NotifItem {
  id: string;
  category: Exclude<Category, "all">;
  level: Level;
  title: string;
  description: string;
  time: string;
  date: string;
  read: boolean;
}

interface Mail {
  id: string;
  from: { name: string; email: string; dept: string };
  to: { name: string; email: string }[];
  cc?: { name: string; email: string }[];
  subject: string;
  preview: string;
  body: string;
  time: string;
  date: string;
  read: boolean;
  starred: boolean;
  folder: Exclude<View, "notifications">;
  attachments?: { name: string; size: string }[];
  replyTo?: string; // id of the mail being replied to
}

interface ComposeContext {
  mode: ComposeMode;
  mail: Mail;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const CAT_CFG: Record<Exclude<Category, "all">, {
  label: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconBg: string; iconColor: string;
}> = {
  punch:        { label: "打卡",   Icon: Fingerprint,  iconBg: "#F3F4F6", iconColor: "#374151" },
  task:         { label: "工作",   Icon: CheckSquare,  iconBg: "#EFF6FF", iconColor: "#3B82F6" },
  announcement: { label: "公告",   Icon: Megaphone,    iconBg: "#FFF7ED", iconColor: "#EA580C" },
  finance:      { label: "財務",   Icon: Receipt,      iconBg: "#F0FDF4", iconColor: "#16A34A" },
  attendance:   { label: "出缺勤", Icon: Clock,        iconBg: "#FDF4FF", iconColor: "#9333EA" },
  asset:        { label: "資產",   Icon: Package,      iconBg: "#FEF9C3", iconColor: "#CA8A04" },
  project:      { label: "專案",   Icon: FolderKanban, iconBg: "#F0F9FF", iconColor: "#0284C7" },
};

const LEVEL_CFG: Record<Level, { dot: string; badge?: string; badgeColor?: string; badgeBg?: string }> = {
  urgent:  { dot: "#EF4444", badge: "緊急", badgeColor: "#DC2626", badgeBg: "#FEF2F2" },
  warning: { dot: "#F59E0B", badge: "注意", badgeColor: "#B45309", badgeBg: "#FEF3C7" },
  success: { dot: "#10B981" },
  info:    { dot: "#D1D5DB" },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INIT_NOTIFS: NotifItem[] = [
  { id: "n01", category: "punch",        level: "urgent",  title: "尚未完成上班打卡",           description: "今日 09:30 已過，系統未偵測到上班打卡紀錄，請盡快補打卡。",             time: "今天 09:32", date: "2026-03-11", read: false },
  { id: "n02", category: "task",         level: "urgent",  title: "任務今日截止",               description: "「Q1 財報整理」今日到期，目前狀態為進行中，請盡快完成。",               time: "今天 09:00", date: "2026-03-11", read: false },
  { id: "n03", category: "finance",      level: "info",    title: "費用申請待審核",             description: "你的差旅費申請 NT$4,500 已送出，等候財務部審核中。",                     time: "今天 08:45", date: "2026-03-11", read: false },
  { id: "n04", category: "task",         level: "info",    title: "新任務已指派給你",           description: "陳小明 將「設計稿審核 v2.3」指派給你，截止日期 3/14。",                 time: "昨天 10:15", date: "2026-03-10", read: false },
  { id: "n05", category: "announcement", level: "info",    title: "新公告：春季健康檢查通知",   description: "人事部發布「2026 年度員工健康檢查」公告，請於 3/20 前完成預約。",         time: "昨天 14:00", date: "2026-03-10", read: false },
  { id: "n06", category: "finance",      level: "success", title: "費用申請已核准",             description: "差旅費用申請（NT$4,500）已由財務部審核通過，將於下次薪資入帳。",         time: "昨天 11:30", date: "2026-03-10", read: false },
  { id: "n07", category: "asset",        level: "warning", title: "資產歸還期限即將到期",       description: "「MacBook Pro 16吋」借用期限將於 3/15 到期，請準時歸還或申請延期。",     time: "2 天前",     date: "2026-03-09", read: true  },
  { id: "n08", category: "attendance",   level: "success", title: "請假申請已核准",             description: "你提交的 3/8（週日）特別假申請已由主管核准。",                           time: "2 天前",     date: "2026-03-09", read: true  },
  { id: "n09", category: "project",      level: "info",    title: "你已加入新專案",             description: "王大明 將你加入「2026 品牌改版」專案，目前進度 25%。",                   time: "2 天前",     date: "2026-03-09", read: true  },
  { id: "n10", category: "task",         level: "info",    title: "任務狀態已更新",             description: "「前端頁面重構」由「進行中」更新為「待審核」，請複查。",                 time: "3 天前",     date: "2026-03-08", read: true  },
  { id: "n11", category: "finance",      level: "warning", title: "費用申請退回",               description: "「辦公耗材採購」申請因缺少收據被財務部退回，請補件後重新送審。",         time: "3 天前",     date: "2026-03-08", read: true  },
  { id: "n12", category: "announcement", level: "info",    title: "新公告：辦公室搬遷通知",     description: "總務部通知：3/20 起部分辦公區域將進行調整，請注意。",                   time: "3 天前",     date: "2026-03-08", read: true  },
  { id: "n13", category: "attendance",   level: "warning", title: "出勤異常提醒",               description: "上週三（3/4）出勤時數不足 8 小時，請至系統確認或補填工時。",             time: "5 天前",     date: "2026-03-06", read: true  },
  { id: "n14", category: "project",      level: "success", title: "專案里程碑達成",             description: "「系統重構」專案已完成第一期，進度 100%，可進行下一階段。",               time: "5 天前",     date: "2026-03-06", read: true  },
  { id: "n15", category: "asset",        level: "info",    title: "資產申請已核准",             description: "「外接螢幕 27 吋」申請已核准，可至資訊室領取，請攜帶員工證。",           time: "1 週前",     date: "2026-03-04", read: true  },
];

const INIT_MAILS: Mail[] = [
  {
    id: "m01",
    from: { name: "李志遠", email: "ceo@company.com", dept: "最高管理層" },
    to: [{ name: "全體員工", email: "all@company.com" }],
    subject: "【重要】2026 年 Q1 業績檢討全員會議通知",
    preview: "各位同仁，Q1 業績檢討會議將於 3/20（五）下午 2:00 舉行，請全體員工準時出席...",
    body: `各位同仁，

Q1 業績檢討會議將於 3/20（週五）下午 2:00–4:30 於 2F 大會議室舉行，請全體員工準時出席。

會議議程如下：
  1. Q1 業績回顧（14:00–14:30）
  2. 各部門成果報告（14:30–15:30）
  3. Q2 目標設定（15:30–16:00）
  4. 其他事項（16:00–16:30）

請各部門主管於 3/17（二）前提交 Q1 部門報告 PPT 至 meeting@company.com。

如有任何問題，請聯絡秘書室分機 101。

李志遠 總經理 敬上`,
    time: "今天 10:15", date: "2026-03-11",
    read: false, starred: true, folder: "inbox",
    attachments: [{ name: "Q1_review_agenda.pdf", size: "245 KB" }],
  },
  {
    id: "m02",
    from: { name: "王美玲", email: "hr@company.com", dept: "人事部" },
    to: [{ name: "系統管理者", email: "admin@company.com" }],
    subject: "2026 年度薪酬調整通知",
    preview: "您好，依據公司年度績效評核，您的薪資將於 4/1 起正式調整，詳情請至 HR 系統查閱...",
    body: `您好，

依據 2025 年度績效評核結果，您的薪資將於 2026/04/01 起正式調整。

調整詳情請至 HR 系統查閱，或於工作日前往 3F 人事室洽談。

如有任何問題，請聯絡人事部王美玲（分機 305）。

人事部 王美玲 敬上`,
    time: "昨天 16:30", date: "2026-03-10",
    read: false, starred: false, folder: "inbox",
  },
  {
    id: "m03",
    from: { name: "張志偉", email: "pm@company.com", dept: "專案管理部" },
    to: [{ name: "系統管理者", email: "admin@company.com" }],
    subject: "Re: 品牌改版專案 — 第二期進度確認",
    preview: "感謝您的回覆，第二期設計稿已收到，UI 團隊正在確認中，預計週五前完成審查...",
    body: `您好，

感謝您的回覆，第二期設計稿已收到，UI 團隊正在確認中。

預計本週五（3/14）前完成審查，如有問題會再與您聯繫。

另外，下週一（3/16）上午 10:00 將召開設計評審會議，煩請確認是否可出席？

謝謝！

張志偉 專案經理 敬上`,
    time: "昨天 14:00", date: "2026-03-10",
    read: false, starred: false, folder: "inbox",
  },
  {
    id: "m04",
    from: { name: "陳雅芳", email: "finance@company.com", dept: "財務部" },
    to: [{ name: "系統管理者", email: "admin@company.com" }],
    subject: "【提醒】3 月費用報銷截止日期",
    preview: "提醒您，3 月份費用報銷文件請於 3/25 前提交至財務部，逾期無法列入本月帳務...",
    body: `您好，

提醒您，3 月份費用報銷相關文件（發票、收據、費用申請單）請於 3/25（三）下班前提交至財務部 2F 辦公室。

逾期將無法列入本月帳務，請務必注意。

如有疑問，請聯絡財務部陳雅芳（分機 412）。

財務部 陳雅芳 敬上`,
    time: "2 天前", date: "2026-03-09",
    read: true, starred: false, folder: "inbox",
  },
  {
    id: "m05",
    from: { name: "林建宏", email: "it@company.com", dept: "資訊部" },
    to: [{ name: "全體員工", email: "all@company.com" }],
    subject: "【系統公告】3/15 系統維護停機通知",
    preview: "資訊部通知：本系統將於 3/15（日）凌晨 2:00–6:00 進行例行維護，期間暫停服務...",
    body: `各位使用者，

本系統將於 3/15（日）凌晨 02:00 – 06:00 進行例行維護作業，期間系統將暫停服務。

維護內容：
  • 資料庫效能優化
  • 安全性更新套用
  • 新功能部署上線

請於 3/14（六）晚間 23:00 前儲存所有工作，避免資料遺失。

如有緊急需求，請聯絡資訊部值班人員：0912-345-678。

資訊部 林建宏 敬上`,
    time: "3 天前", date: "2026-03-08",
    read: true, starred: false, folder: "inbox",
    attachments: [{ name: "maintenance_schedule.pdf", size: "128 KB" }],
  },
  {
    id: "m06",
    from: { name: "系統管理者", email: "admin@company.com", dept: "資訊部" },
    to: [{ name: "資訊部全體", email: "it-team@company.com" }],
    subject: "本週工作進度週報（3/3–3/7）",
    preview: "各位，以下是本週工作進度摘要，完成系統後台重構第一階段及 Bug 修復...",
    body: `各位，

以下是本週工作進度摘要：

本週完成：
  1. 系統後台重構第一階段
  2. 修復 3 個高優先度 Bug
  3. 完成員工管理模組設計稿審查

下週計畫：
  • 系統後台重構第二階段
  • 行動端適配開發
  • 權限管理模組測試

系統管理者 敬上`,
    time: "4 天前", date: "2026-03-07",
    read: true, starred: false, folder: "sent",
  },
  {
    id: "m07",
    from: { name: "系統管理者", email: "admin@company.com", dept: "資訊部" },
    to: [{ name: "王美玲", email: "hr@company.com" }],
    subject: "特休假申請 — 2026/03/28",
    preview: "您好，本人申請 2026/03/28（週五）使用特休假一天，請批准...",
    body: `王小姐您好，

本人申請 2026/03/28（週五）使用特休假一天，還望批准。

謝謝！

系統管理者 敬上`,
    time: "5 天前", date: "2026-03-06",
    read: true, starred: false, folder: "sent",
  },
  {
    id: "m08",
    from: { name: "系統管理者", email: "admin@company.com", dept: "資訊部" },
    to: [{ name: "張志偉", email: "pm@company.com" }],
    subject: "Q2 系統開發計畫草案",
    preview: "您好，以下是 Q2 系統開發計畫的初步規劃，請確認是否符合需求...",
    body: `您好，

以下是 Q2 系統開發計畫的初步規劃，請確認是否符合需求：

1. 使用者介面優化（4 月）
2. API 效能改善（5 月）
3. 行動端上線（6 月）

（草稿未完成）`,
    time: "1 天前", date: "2026-03-10",
    read: true, starred: false, folder: "drafts",
  },
];

// ─── User Picker (multi-select dropdown) ──────────────────────────────────────
interface PickedUser { name: string; email: string; dept: string }

const ALL_USERS: PickedUser[] = EMPLOYEES
  .filter(e => e.status === "active" || e.status === "probation")
  .map(e => ({ name: e.name, email: e.email, dept: e.dept }));

function UserPicker({ selected, onChange, placeholder, showSelectAll = false }: {
  selected: PickedUser[];
  onChange: (users: PickedUser[]) => void;
  placeholder: string;
  showSelectAll?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ALL_USERS.filter(u =>
      !selected.some(s => s.email === u.email) &&
      (u.name.toLowerCase().includes(q) || u.dept.includes(q) || u.email.toLowerCase().includes(q))
    );
  }, [query, selected]);

  const toggle = useCallback((user: PickedUser) => {
    if (selected.some(s => s.email === user.email)) {
      onChange(selected.filter(s => s.email !== user.email));
    } else {
      onChange([...selected, user]);
      setQuery("");
    }
  }, [selected, onChange]);

  const remove = useCallback((email: string) => {
    onChange(selected.filter(s => s.email !== email));
  }, [selected, onChange]);

  return (
    <div ref={wrapRef} className="relative flex-1" style={{ minWidth: 0 }}>
      {/* Trigger area */}
      <div
        className="flex flex-wrap items-center gap-1.5 cursor-text"
        style={{
          background: "#F9FAFB", borderRadius: 8, padding: "6px 10px",
          minHeight: 38,
        }}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {selected.map(u => (
          <span key={u.email} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5"
            style={{ background: DEPT_BG[u.dept] || "#F3F4F6", color: DEPT_COLOR[u.dept] || "#374151", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
            {u.name}
            <button onClick={(e) => { e.stopPropagation(); remove(u.email); }}
              style={{ background: "none", borderWidth: 0, cursor: "pointer", padding: 0, color: "inherit", lineHeight: 1, display: "flex" }}>
              <X style={{ width: 12, height: 12 }} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === "Backspace" && !query && selected.length > 0) {
              remove(selected[selected.length - 1].email);
            }
          }}
          placeholder={selected.length === 0 ? placeholder : ""}
          style={{
            borderWidth: 0, outline: "none", background: "transparent",
            fontSize: "13px", color: "#111827", fontFamily: "inherit",
            flex: 1, minWidth: 80, padding: "2px 0",
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden"
          style={{
            background: "#FFF", borderRadius: 10,
            boxShadow: "0 8px 32px rgba(17,24,39,0.14), 0 0 0 1px rgba(17,24,39,0.06)",
            maxHeight: 220, overflowY: "auto",
          }}>
          {/* Select All */}
          {showSelectAll && !query && (
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
              style={{
                borderWidth: 0, background: "transparent", cursor: "pointer", fontFamily: "inherit",
                borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              onClick={() => {
                if (selected.length === ALL_USERS.length) {
                  onChange([]);
                } else {
                  onChange([...ALL_USERS]);
                }
                inputRef.current?.focus();
              }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: selected.length === ALL_USERS.length ? "#111827" : "#F3F4F6", color: selected.length === ALL_USERS.length ? "#FFF" : "#6B7280", fontSize: "11px", fontWeight: 700 }}>
                <Users style={{ width: 14, height: 14 }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
                  {selected.length === ALL_USERS.length ? "取消全選" : "全選所有使用者"}
                </p>
                <p style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.3 }}>
                  共 {ALL_USERS.length} 位 · 已選 {selected.length} 位
                </p>
              </div>
              {selected.length === ALL_USERS.length && <Check style={{ width: 14, height: 14, color: "#111827", flexShrink: 0 }} />}
            </button>
          )}
          {/* Search hint */}
          {query && filtered.length === 0 && (
            <div className="px-3 py-3 text-center" style={{ fontSize: "12px", color: "#9CA3AF" }}>
              找不到符合「{query}」的使用者
            </div>
          )}
          {!query && filtered.length === 0 && !showSelectAll && (
            <div className="px-3 py-3 text-center" style={{ fontSize: "12px", color: "#9CA3AF" }}>
              所有使用者皆已選取
            </div>
          )}
          {filtered.map(user => {
            const isSelected = selected.some(s => s.email === user.email);
            return (
              <button key={user.email}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                style={{ borderWidth: 0, background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                onClick={() => { toggle(user); inputRef.current?.focus(); }}>
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: DEPT_BG[user.dept] || "#F3F4F6", color: DEPT_COLOR[user.dept] || "#374151", fontSize: "11px", fontWeight: 700 }}>
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>{user.name}</p>
                  <p className="truncate" style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.3 }}>{user.dept} · {user.email}</p>
                </div>
                {isSelected && <Check style={{ width: 14, height: 14, color: "#111827", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Compose Modal ──────────────────────────────────────────────────────────
function ComposeModal({ onClose, onSend, onDraft, composeCtx }: {
  onClose: () => void;
  onSend: (mail: Omit<Mail, "id" | "read" | "starred" | "folder" | "date" | "time">) => void;
  onDraft: () => void;
  composeCtx?: ComposeContext | null;
}) {
  const ME = { name: "系統管理者", email: "admin@company.com" };

  const resolveUsers = (contacts: { name: string; email: string }[]): PickedUser[] => {
    return contacts.map(c => {
      const emp = ALL_USERS.find(u => u.email === c.email);
      return emp || { name: c.name, email: c.email, dept: "" };
    });
  };

  const initTo = (): PickedUser[] => {
    if (!composeCtx) return [];
    const { mode, mail } = composeCtx;
    if (mode === "reply") {
      const target = mail.from.email === ME.email ? mail.to : [mail.from];
      return resolveUsers(target);
    }
    if (mode === "replyAll") {
      const recipients: { name: string; email: string }[] = [];
      if (mail.from.email !== ME.email) recipients.push(mail.from);
      mail.to.forEach(t => { if (t.email !== ME.email && !recipients.some(r => r.email === t.email)) recipients.push(t); });
      return resolveUsers(recipients);
    }
    return [];
  };
  const initCc = (): PickedUser[] => {
    if (!composeCtx || composeCtx.mode !== "replyAll") return [];
    return resolveUsers((composeCtx.mail.cc || []).filter(c => c.email !== ME.email));
  };
  const initSubj = (): string => {
    if (!composeCtx) return "";
    const { mode, mail } = composeCtx;
    const subj = mail.subject.replace(/^(Re:|Fwd:)\s*/gi, "").trim();
    if (mode === "forward") return `Fwd: ${subj}`;
    return `Re: ${subj}`;
  };
  const initBody = (): string => {
    if (!composeCtx) return "";
    const { mode, mail } = composeCtx;
    const quotedBody = mail.body.split("\n").map(line => `> ${line}`).join("\n");
    if (mode === "forward") {
      return `\n\n---------- 轉寄的郵件 ----------\n寄件人：${mail.from.name} ‹${mail.from.email}›\n日期：${mail.date} ${mail.time}\n主旨：${mail.subject}\n收件人：${mail.to.map(t => t.name).join(", ")}\n\n${mail.body}`;
    }
    return `\n\n──── 於 ${mail.date} ${mail.time}，${mail.from.name} ‹${mail.from.email}› 寫道 ────\n\n${quotedBody}`;
  };

  const [toUsers, setToUsers] = useState<PickedUser[]>(initTo);
  const [ccUsers, setCcUsers] = useState<PickedUser[]>(initCc);
  const [subj, setSubj]       = useState(initSubj);
  const [body, setBody]       = useState(initBody);
  const [showCc, setShowCc]   = useState(() => initCc().length > 0);

  const modeLabel = composeCtx
    ? composeCtx.mode === "reply" ? "回覆信件"
    : composeCtx.mode === "replyAll" ? "回覆全部"
    : composeCtx.mode === "forward" ? "轉寄信件"
    : "撰寫新信件"
    : "撰寫新信件";

  const modeIcon = composeCtx?.mode === "reply" ? <Reply className="w-4 h-4" />
    : composeCtx?.mode === "replyAll" ? <ReplyAll className="w-4 h-4" />
    : composeCtx?.mode === "forward" ? <Forward className="w-4 h-4" />
    : <Mail className="w-4 h-4" />;

  const labelStyle: React.CSSProperties = {
    fontSize: "12px", color: "#6B7280", fontWeight: 600,
    minWidth: 48, flexShrink: 0, letterSpacing: "0.02em",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center max-md:items-end max-md:justify-stretch"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ background: "rgba(17,24,39,0.25)", backdropFilter: "blur(2px)" }}>
      <div className="max-md:!w-full max-md:!max-h-[95vh] max-md:!rounded-b-none max-md:!rounded-t-2xl" style={{
        width: 600, maxHeight: "85vh", background: "#FFF",
        borderRadius: 16,
        boxShadow: "0 24px 80px rgba(17,24,39,0.2), 0 0 0 1px rgba(17,24,39,0.05)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#111827" }}>
              <span style={{ color: "#FFF" }}>{modeIcon}</span>
            </div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{modeLabel}</p>
              <p style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.3 }}>
                寄件人：{ME.name} ‹{ME.email}›
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onDraft} title="存成草稿"
              className="px-3 py-1.5 rounded-md transition-colors"
              style={{ fontSize: "12px", color: "#6B7280", background: "transparent", borderWidth: 0, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <FileText className="w-3.5 h-3.5 inline-block mr-1" style={{ verticalAlign: "-2px" }} />
              草稿
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "#9CA3AF", background: "transparent", borderWidth: 0, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#374151"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Fields ── */}
        <div className="px-5 py-4 flex flex-col gap-3 shrink-0"
          style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFBFC" }}>
          {/* To */}
          <div className="flex items-start gap-3">
            <span style={{ ...labelStyle, paddingTop: 10 }}>收件人</span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <UserPicker selected={toUsers} onChange={setToUsers} placeholder="搜尋並選擇收件人…" />
              <button onClick={() => setShowCc(v => !v)}
                className="px-2.5 py-1.5 rounded-md shrink-0 transition-colors"
                style={{ fontSize: "11px", color: showCc ? "#111827" : "#9CA3AF", background: showCc ? "#E5E7EB" : "transparent", borderWidth: 0, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                onMouseEnter={e => { if (!showCc) e.currentTarget.style.background = "#F3F4F6"; }}
                onMouseLeave={e => { if (!showCc) e.currentTarget.style.background = "transparent"; }}>
                Cc
              </button>
            </div>
          </div>
          {/* Cc */}
          {showCc && (
            <div className="flex items-start gap-3">
              <span style={{ ...labelStyle, paddingTop: 10 }}>副本</span>
              <UserPicker selected={ccUsers} onChange={setCcUsers} placeholder="搜尋並選擇副本…" showSelectAll />
            </div>
          )}
          {/* Subject */}
          <div className="flex items-center gap-3">
            <span style={labelStyle}>主旨</span>
            <input value={subj} onChange={e => setSubj(e.target.value)}
              style={{
                width: "100%", background: "#F9FAFB", borderWidth: 0,
                fontSize: "14px", color: "#111827", outline: "none",
                fontFamily: "inherit", padding: "9px 12px", borderRadius: 8,
              }}
              placeholder="信件主旨" />
          </div>
        </div>

        {/* ── Body ── */}
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="在此輸入信件內容…"
          autoFocus
          className="flex-1"
          style={{
            minHeight: 240, resize: "none",
            borderWidth: 0, outline: "none",
            fontSize: "14px", color: "#374151",
            padding: "16px 20px", fontFamily: "inherit", lineHeight: 1.85,
            background: "#FFF",
          }}
        />

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB", background: "#FAFBFC" }}>
          <div className="flex items-center gap-1">
            <button title="附加檔案"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "#9CA3AF", background: "transparent", borderWidth: 0, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#374151"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}>
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{ fontSize: "13px", color: "#6B7280", background: "#FFF", borderWidth: 0, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, boxShadow: "0 0 0 1px #E5E7EB" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#FFF"; }}>
              取消
            </button>
            <button
              onClick={() => {
                const toList = toUsers.map(u => ({ name: u.name, email: u.email }));
                const ccList = ccUsers.length > 0 ? ccUsers.map(u => ({ name: u.name, email: u.email })) : undefined;
                onSend({
                  from: { name: ME.name, email: ME.email, dept: "資訊部" },
                  to: toList.length > 0 ? toList : [{ name: "（未指定）", email: "" }],
                  cc: ccList,
                  subject: subj || "（無主旨）",
                  preview: body.replace(/^[\s>]+/g, "").slice(0, 60),
                  body,
                  replyTo: composeCtx ? composeCtx.mail.id : undefined,
                });
              }}
              disabled={toUsers.length === 0}
              className="px-5 py-2 rounded-lg flex items-center gap-2 transition-colors"
              style={{ fontSize: "13px", color: "#FFF", background: toUsers.length === 0 ? "#D1D5DB" : "#111827", borderWidth: 0, cursor: toUsers.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 600 }}
              onMouseEnter={e => { if (toUsers.length > 0) e.currentTarget.style.background = "#374151"; }}
              onMouseLeave={e => { if (toUsers.length > 0) e.currentTarget.style.background = "#111827"; }}>
              <Send className="w-3.5 h-3.5" />
              {composeCtx?.mode === "forward" ? "轉寄" : composeCtx ? "回覆" : "傳送"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Notification Row ────────────────────────────────────────────────────────
function NotifRow({ item, selected, onToggle, onMarkRead, onDelete, onSelect }: {
  item: NotifItem;
  selected: boolean;
  onToggle: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
  onSelect?: () => void;
}) {
  const cat   = CAT_CFG[item.category];
  const level = LEVEL_CFG[item.level];
  const CatIcon = cat.Icon;
  return (
    <>
      {/* Desktop row */}
      <div className="max-md:hidden flex items-start gap-3 px-5 py-4 group cursor-pointer transition-colors duration-100"
        style={{ borderBottomColor: "#F9FAFB", borderBottomWidth: "1px", borderBottomStyle: "solid", background: item.read ? "#FFF" : "#FAFBFE", position: "relative" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = item.read ? "#FFF" : "#FAFBFE"; }}
        onClick={() => { if (onSelect) { onSelect(); } else { onMarkRead(); } }}
      >
        {!item.read && (
          <span className="absolute left-0 top-1/2 w-0.5 h-6 rounded-r" style={{ background: "#111827", transform: "translateY(-50%)" }} />
        )}
        <div
          onClick={e => { e.stopPropagation(); onToggle(); }}
          className="mt-1 flex-shrink-0"
          style={{
            width: 16, height: 16, cursor: "pointer", borderRadius: 4,
            background: selected ? "#111827" : "#FFF",
            borderWidth: "1.5px", borderStyle: "solid",
            borderColor: selected ? "#111827" : "#D1D5DB",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s ease",
          }}
        >
          {selected && (
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: cat.iconBg }}>
          <CatIcon className="w-4 h-4" style={{ color: cat.iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: "13px", fontWeight: item.read ? 500 : 700, color: "#111827" }}>
              {item.title}
            </span>
            {level.badge && (
              <span className="px-1.5 py-0.5 rounded"
                style={{ fontSize: "11px", fontWeight: 700, background: level.badgeBg, color: level.badgeColor }}>
                {level.badge}
              </span>
            )}
          </div>
          <p style={{ fontSize: "12px", color: "#6B7280", marginTop: 2, lineHeight: 1.5 }}>{item.description}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="px-1.5 py-0.5 rounded"
              style={{ fontSize: "11px", fontWeight: 600, background: cat.iconBg, color: cat.iconColor }}>
              {cat.label}
            </span>
            <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{item.time}</span>
            {!item.read && <span className="w-1.5 h-1.5 rounded-full" style={{ background: level.dot }} />}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
          {!item.read && (
            <button onClick={e => { e.stopPropagation(); onMarkRead(); }} title="標為已讀"
              className="p-1 rounded" style={{ color: "#9CA3AF", background: "none", borderWidth: 0, cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#111827"; (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; (e.currentTarget as HTMLElement).style.background = "none"; }}>
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={e => { e.stopPropagation(); onDelete(); }} title="刪除"
            className="p-1 rounded" style={{ color: "#9CA3AF", background: "none", borderWidth: 0, cursor: "pointer" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#DC2626"; (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; (e.currentTarget as HTMLElement).style.background = "none"; }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile card */}
      <div className="md:hidden cursor-pointer active:scale-[0.98] transition-transform duration-100"
        style={{ background: item.read ? "#FFF" : "#FAFBFE", borderWidth: "1px", borderStyle: "solid", borderColor: item.read ? "#E5E7EB" : "#D1D5DB", borderRadius: 12, padding: "14px", position: "relative", overflow: "hidden" }}
        onClick={() => { if (onSelect) { onSelect(); } else { onMarkRead(); } }}
      >
        {!item.read && (
          <span className="absolute left-0 top-0 w-[3px] h-full rounded-r" style={{ background: level.dot }} />
        )}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: cat.iconBg }}>
            <CatIcon className="w-[18px] h-[18px]" style={{ color: cat.iconColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: "15px", fontWeight: item.read ? 500 : 700, color: "#111827", lineHeight: 1.3 }}>
                {item.title}
              </span>
              {level.badge && (
                <span className="px-1.5 py-0.5 rounded"
                  style={{ fontSize: "11px", fontWeight: 700, background: level.badgeBg, color: level.badgeColor }}>
                  {level.badge}
                </span>
              )}
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280", marginTop: 4, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
              {item.description}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: "#D1D5DB" }} />
        </div>
        <div className="flex items-center gap-2 mt-3" style={{ paddingLeft: 52 }}>
          <span className="px-2 py-0.5 rounded-md"
            style={{ fontSize: "11px", fontWeight: 600, background: cat.iconBg, color: cat.iconColor }}>
            {cat.label}
          </span>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{item.time}</span>
          {!item.read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: level.dot }} />}
        </div>
      </div>
    </>
  );
}

// ─── Notification Detail (Mobile) ────────────────────────────────────────────
function NotifDetail({ item, onBack, onMarkRead, onDelete }: {
  item: NotifItem;
  onBack: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  const cat = CAT_CFG[item.category];
  const level = LEVEL_CFG[item.level];
  const CatIcon = cat.Icon;

  return (
    <div className="flex flex-col h-full" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 8, overflow: "hidden" }}>
      {/* Back header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottomColor: "#E5E7EB", borderBottomWidth: "1px", borderBottomStyle: "solid", background: "#F9FAFB" }}>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ fontSize: "13px", fontWeight: 500, color: "#6B7280", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", cursor: "pointer", fontFamily: "inherit" }}
          onClick={onBack}
        >
          <ArrowLeft className="w-3.5 h-3.5" />返回列表
        </button>
        <div className="flex items-center gap-2">
          {!item.read && (
            <button onClick={onMarkRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ fontSize: "12px", fontWeight: 500, color: "#374151", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", cursor: "pointer", fontFamily: "inherit" }}>
              <CheckCheck className="w-3.5 h-3.5" /> 已讀
            </button>
          )}
          <button onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ fontSize: "12px", fontWeight: 500, color: "#DC2626", background: "#FEF2F2", borderWidth: "1px", borderStyle: "solid", borderColor: "#FECACA", cursor: "pointer", fontFamily: "inherit" }}>
            <Trash2 className="w-3.5 h-3.5" /> 刪除
          </button>
        </div>
      </div>

      {/* Detail body */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Category & level */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
            style={{ background: cat.iconBg }}>
            <CatIcon className="w-4 h-4" style={{ color: cat.iconColor }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: cat.iconColor }}>{cat.label}</span>
          </div>
          {level.badge && (
            <span className="px-2 py-1 rounded"
              style={{ fontSize: "11px", fontWeight: 700, background: level.badgeBg, color: level.badgeColor }}>
              {level.badge}
            </span>
          )}
          {!item.read && (
            <span className="px-2 py-1 rounded"
              style={{ fontSize: "11px", fontWeight: 600, background: "#EFF6FF", color: "#2563EB" }}>
              未讀
            </span>
          )}
        </div>

        {/* Title */}
        <h2 style={{ color: "#111827", marginBottom: 8 }}>{item.title}</h2>

        {/* Time */}
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
          <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{item.time}</span>
          <span style={{ fontSize: "12px", color: "#D1D5DB" }}>·</span>
          <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{item.date}</span>
        </div>

        {/* Divider */}
        <div style={{ borderBottomColor: "#F3F4F6", borderBottomWidth: "1px", borderBottomStyle: "solid", marginBottom: 20 }} />

        {/* Description */}
        <p style={{ fontSize: "15px", color: "#374151", lineHeight: 1.9 }}>
          {item.description}
        </p>

        {/* Info card */}
        <div className="mt-6 p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", marginBottom: 8 }}>通知詳情</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span style={{ fontSize: "12px", color: "#9CA3AF", minWidth: 56, flexShrink: 0 }}>類別</span>
              <span style={{ fontSize: "13px", color: "#374151" }}>{cat.label}通知</span>
            </div>
            <div className="flex items-start gap-3">
              <span style={{ fontSize: "12px", color: "#9CA3AF", minWidth: 56, flexShrink: 0 }}>時間</span>
              <span style={{ fontSize: "13px", color: "#374151" }}>{item.date} {item.time}</span>
            </div>
            <div className="flex items-start gap-3">
              <span style={{ fontSize: "12px", color: "#9CA3AF", minWidth: 56, flexShrink: 0 }}>狀態</span>
              <span style={{ fontSize: "13px", color: item.read ? "#16A34A" : "#2563EB" }}>{item.read ? "已讀" : "未讀"}</span>
            </div>
            <div className="flex items-start gap-3">
              <span style={{ fontSize: "12px", color: "#9CA3AF", minWidth: 56, flexShrink: 0 }}>優先</span>
              <span style={{ fontSize: "13px", color: level.badgeColor || "#374151" }}>
                {item.level === "urgent" ? "緊急" : item.level === "warning" ? "注意" : item.level === "success" ? "完成" : "一般"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Notifications View ──────────────────────────────────────────────────────
function NotificationsView({ items, setItems }: { items: NotifItem[]; setItems: React.Dispatch<React.SetStateAction<NotifItem[]>> }) {
  const [catFilter, setCatFilter]   = useState<Category>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [page, setPage]             = useState(1);
  const [mobileSelectedId, setMobileSelectedId] = useState<string | null>(null);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => items.filter(n => {
    if (catFilter  !== "all" && n.category !== catFilter) return false;
    if (readFilter === "unread" && n.read)  return false;
    if (readFilter === "read"   && !n.read) return false;
    if (search && !n.title.includes(search) && !n.description.includes(search)) return false;
    return true;
  }), [items, catFilter, readFilter, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const unread    = items.filter(n => !n.read).length;
  const urgent    = items.filter(n => n.level === "urgent").length;

  const markRead   = (id: string) => setItems(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteItem = (id: string) => setItems(p => p.filter(n => n.id !== id));
  const markAllRead = () => setItems(p => p.map(n => ({ ...n, read: true })));
  const deleteSelected = () => { setItems(p => p.filter(n => !selected.has(n.id))); setSelected(new Set()); };
  const toggleSel = (id: string) => setSelected(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const allChecked = paginated.length > 0 && paginated.every(n => selected.has(n.id));
  const toggleAll  = () => {
    if (allChecked) setSelected(p => { const s = new Set(p); paginated.forEach(n => s.delete(n.id)); return s; });
    else            setSelected(p => { const s = new Set(p); paginated.forEach(n => s.add(n.id)); return s; });
  };

  const mobileSelectedItem = mobileSelectedId ? items.find(n => n.id === mobileSelectedId) ?? null : null;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* ── Mobile detail overlay ── */}
      {mobileSelectedItem && (
        <div className="md:hidden flex flex-col h-full min-h-0">
          <NotifDetail
            item={mobileSelectedItem}
            onBack={() => setMobileSelectedId(null)}
            onMarkRead={() => markRead(mobileSelectedItem.id)}
            onDelete={() => { deleteItem(mobileSelectedItem.id); setMobileSelectedId(null); }}
          />
        </div>
      )}

      {/* ── List view (hidden on mobile when detail is open) ── */}
      <div className={`flex flex-col h-full min-h-0 ${mobileSelectedItem ? "max-md:hidden" : ""}`} style={{ background: "transparent" }}>
      {/* KPI strip */}
      <div className="grid grid-cols-4 max-md:grid-cols-2 gap-3 max-md:gap-2 mb-4 flex-shrink-0">
        {[
          { label: "全部通知", value: items.length,   color: "#111827" },
          { label: "未讀通知", value: unread,          color: "#2563EB" },
          { label: "緊急項目", value: urgent,          color: "#DC2626" },
          { label: "今日新增", value: items.filter(n => n.date === "2026-03-11").length, color: "#16A34A" },
        ].map(k => (
          <div key={k.label} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 8, padding: "12px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="tabular-nums" style={{ fontSize: "24px", fontWeight: 700, color: k.color }}>{k.value}</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }} className="flex-shrink-0 mb-0">
        {/* Search + read filter */}
        <div className="flex items-center gap-3 max-md:gap-2 px-4 max-md:px-3 py-3 max-md:py-2 max-md:flex-wrap" style={{ borderBottomColor: "#F3F4F6", borderBottomWidth: "1px", borderBottomStyle: "solid" }}>
          <div className="flex items-center gap-2 flex-1 px-3 py-2 max-md:py-1.5 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#9CA3AF" }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="搜尋通知…"
              style={{ flex: 1, background: "none", borderWidth: 0, outline: "none", fontSize: "13px", color: "#111827", fontFamily: "inherit" }} />
          </div>
          <div className="flex items-center gap-1 max-md:hidden">
            {(["all", "unread", "read"] as ReadFilter[]).map(f => (
              <button key={f} onClick={() => { setReadFilter(f); setPage(1); }}
                className="px-3 py-1.5 rounded-lg"
                style={{ fontSize: "12px", fontWeight: readFilter === f ? 600 : 400, background: readFilter === f ? "#111827" : "transparent", color: readFilter === f ? "#FFF" : "#6B7280", borderWidth: 0, cursor: "pointer", fontFamily: "inherit" }}>
                {f === "all" ? "全部" : f === "unread" ? "未讀" : "已讀"}
              </button>
            ))}
          </div>
        </div>
        {/* Category chips */}
        <DraggableScroll className="px-4 max-md:px-3 py-2.5 max-md:py-2" innerClassName="flex items-center gap-2 max-md:gap-1.5"
          mobileDropdown={{
            options: (["all", "punch", "task", "announcement", "finance", "attendance", "asset", "project"] as Category[]).map(c => ({
              key: c,
              label: c === "all" ? "全部類別" : CAT_CFG[c as Exclude<Category, "all">]?.label || c,
            })),
            activeKey: catFilter,
            onSelect: (k) => { setCatFilter(k as Category); setPage(1); },
          }}>
          {(["all", "punch", "task", "announcement", "finance", "attendance", "asset", "project"] as Category[]).map(c => {
            const active = catFilter === c;
            const cfg = c === "all" ? null : CAT_CFG[c];
            return (
              <button key={c} onClick={() => { setCatFilter(c); setPage(1); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ fontSize: "12px", fontWeight: active ? 600 : 400, borderWidth: "1px", borderStyle: "solid", borderColor: active ? "#111827" : "#E5E7EB", background: active ? "#111827" : "#FFF", color: active ? "#FFF" : "#374151", cursor: "pointer", fontFamily: "inherit", transition: "all 0.1s" }}>
                {c === "all" ? "全部類別" : cfg?.label}
              </button>
            );
          })}
        </DraggableScroll>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 max-md:gap-2 max-md:flex-wrap px-5 max-md:px-3 py-2.5 flex-shrink-0"
          style={{ background: "#F0F9FF", borderWidth: "1px", borderStyle: "solid", borderColor: "#BAE6FD", borderRadius: 8, marginTop: 8 }}>
          <span style={{ fontSize: "13px", color: "#0369A1", fontWeight: 500 }}>已選取 {selected.size} 筆</span>
          <button onClick={() => { selected.forEach(id => markRead(id)); setSelected(new Set()); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ fontSize: "12px", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", cursor: "pointer", fontFamily: "inherit" }}>
            <CheckCheck className="w-3.5 h-3.5" /> 標為已讀
          </button>
          <button onClick={deleteSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ fontSize: "12px", background: "#FEF2F2", borderWidth: "1px", borderStyle: "solid", borderColor: "#FECACA", color: "#DC2626", cursor: "pointer", fontFamily: "inherit" }}>
            <Trash2 className="w-3.5 h-3.5" /> 刪除選取
          </button>
        </div>
      )}

      {/* Mobile list header */}
      <div className="md:hidden flex items-center justify-between mt-2 mb-1 flex-shrink-0">
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280" }}>{filtered.length} 則通知</span>
        <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ fontSize: "12px", color: unread > 0 ? "#374151" : "#D1D5DB", background: "none", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", cursor: unread > 0 ? "pointer" : "default", fontFamily: "inherit" }}>
          <CheckCheck className="w-3.5 h-3.5" /> 全部已讀
        </button>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden flex-1 min-h-0 overflow-y-auto flex flex-col gap-2.5">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#F3F4F6" }}>
              <Bell className="w-5 h-5" style={{ color: "#9CA3AF" }} />
            </div>
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>沒有符合條件的通知</p>
          </div>
        ) : (
          paginated.map(item => (
            <NotifRow key={item.id} item={item} selected={selected.has(item.id)}
              onToggle={() => toggleSel(item.id)}
              onMarkRead={() => markRead(item.id)}
              onDelete={() => deleteItem(item.id)}
              onSelect={() => { markRead(item.id); setMobileSelectedId(item.id); }} />
          ))
        )}
      </div>
      <div className="md:hidden flex-shrink-0 mt-2">
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      {/* Desktop list */}
      <div className="max-md:hidden flex-1 min-h-0 overflow-y-auto mt-2" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px 8px 0 0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {/* Table header */}
        <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottomColor: "#E5E7EB", borderBottomWidth: "2px", borderBottomStyle: "solid", background: "#F9FAFB", borderRadius: "8px 8px 0 0" }}>
          <div
            onClick={toggleAll}
            style={{
              width: 16, height: 16, cursor: "pointer", borderRadius: 4, flexShrink: 0,
              background: allChecked ? "#111827" : "#FFF",
              borderWidth: "1.5px", borderStyle: "solid",
              borderColor: allChecked ? "#111827" : "#D1D5DB",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s ease",
            }}
          >
            {allChecked && (
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", flex: 1 }}>通知內容</span>
          <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ fontSize: "12px", color: unread > 0 ? "#374151" : "#D1D5DB", background: "none", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", cursor: unread > 0 ? "pointer" : "default", fontFamily: "inherit" }}>
            <CheckCheck className="w-3.5 h-3.5" /> 全部已讀
          </button>
        </div>

        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#F3F4F6" }}>
              <Bell className="w-5 h-5" style={{ color: "#9CA3AF" }} />
            </div>
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>沒有符合條件的通知</p>
          </div>
        ) : (
          paginated.map(item => (
            <NotifRow key={item.id} item={item} selected={selected.has(item.id)}
              onToggle={() => toggleSel(item.id)}
              onMarkRead={() => markRead(item.id)}
              onDelete={() => deleteItem(item.id)}
              onSelect={() => { markRead(item.id); setMobileSelectedId(item.id); }} />
          ))
        )}
      </div>
      <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage}
        className="max-md:hidden bg-transparent rounded-b-lg flex-shrink-0"
        style={{ borderTopWidth: 0, borderRightWidth: "1px", borderBottomWidth: "1px", borderLeftWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }} />
      </div>
    </div>
  );
}

// ─── Mail Item ──────────────────────────────────────────────────────────────
function MailItem({ mail, active, onSelect, onStar }: {
  mail: Mail; active: boolean;
  onSelect: () => void; onStar: () => void;
}) {
  return (
    <div onClick={onSelect} className="px-4 py-3.5 cursor-pointer transition-colors duration-100 relative"
      style={{ borderBottomColor: "#F9FAFB", borderBottomWidth: "1px", borderBottomStyle: "solid", background: active ? "#F3F4F6" : mail.read ? "#FFF" : "#FAFBFE" }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = mail.read ? "#FFF" : "#FAFBFE"; }}
    >
      {!mail.read && (
        <span className="absolute left-0 top-1/2 w-0.5 h-6 rounded-r" style={{ background: "#111827", transform: "translateY(-50%)" }} />
      )}
      <div className="flex items-start justify-between gap-2 mb-1">
        <span style={{ fontSize: "13px", fontWeight: mail.read ? 500 : 700, color: "#111827", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {mail.from.name}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {mail.attachments && <Paperclip className="w-3 h-3" style={{ color: "#9CA3AF" }} />}
          <button onClick={e => { e.stopPropagation(); onStar(); }}
            style={{ background: "none", borderWidth: 0, cursor: "pointer", padding: 0 }}>
            {mail.starred
              ? <Star className="w-3.5 h-3.5" style={{ color: "#F59E0B", fill: "#F59E0B" }} />
              : <Star className="w-3.5 h-3.5" style={{ color: "#D1D5DB" }} />}
          </button>
          <span style={{ fontSize: "11px", color: "#9CA3AF", whiteSpace: "nowrap" }}>{mail.time}</span>
        </div>
      </div>
      <p style={{ fontSize: "12px", fontWeight: mail.read ? 400 : 600, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
        {mail.subject}
      </p>
      <p style={{ fontSize: "12px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {mail.preview}
      </p>
    </div>
  );
}

// ─── Mail Detail ──────────────────────────────────────────────────────────────
function MailDetail({ mail, onReply, onReplyAll, onForward, onDelete, onInlineReplySend }: {
  mail: Mail;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
  onDelete: () => void;
  onInlineReplySend: (body: string) => void;
}) {
  const [inlineReplyOpen, setInlineReplyOpen] = useState(false);
  const [inlineReplyBody, setInlineReplyBody] = useState("");
  const [showMoreActions, setShowMoreActions] = useState(false);

  const handleInlineSend = () => {
    if (!inlineReplyBody.trim()) return;
    onInlineReplySend(inlineReplyBody);
    setInlineReplyBody("");
    setInlineReplyOpen(false);
  };

  const actionBtnStyle: React.CSSProperties = {
    fontSize: "13px", background: "#F3F4F6", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
    color: "#374151", cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 max-md:px-4 pt-5 max-md:pt-3 pb-4 max-md:pb-3 flex-shrink-0" style={{ borderBottomColor: "#F3F4F6", borderBottomWidth: "1px", borderBottomStyle: "solid" }}>
        <h2 style={{ color: "#111827", marginBottom: 12 }}>{mail.subject}</h2>
        <div className="flex items-start justify-between gap-4 max-md:flex-col max-md:gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 max-md:w-8 max-md:h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#111827" }}>
              <span style={{ color: "#FFF", fontSize: "14px", fontWeight: 700 }}>
                {mail.from.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{mail.from.name}</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>‹{mail.from.email}›</span>
                <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", background: "#F3F4F6", color: "#6B7280", fontWeight: 500 }}>
                  {mail.from.dept}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>收件人：</span>
                {mail.to.map((t, i) => (
                  <span key={i} style={{ fontSize: "12px", color: "#374151" }}>{t.name}{i < mail.to.length - 1 ? "、" : ""}</span>
                ))}
                {mail.cc && <>
                  <span style={{ fontSize: "12px", color: "#9CA3AF", marginLeft: 4 }}>副本：</span>
                  {mail.cc.map((c, i) => <span key={i} style={{ fontSize: "12px", color: "#374151" }}>{c.name}</span>)}
                </>}
              </div>
              <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: 2 }}>{mail.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 relative">
            <button onClick={onReply}
              className="flex items-center gap-1.5 px-3 py-2 max-md:px-2 max-md:py-1.5 rounded-lg"
              style={actionBtnStyle}
              title="回覆">
              <Reply className="w-3.5 h-3.5" /> <span className="max-md:hidden">回覆</span>
            </button>
            <div className="relative">
              <button onClick={() => setShowMoreActions(v => !v)}
                className="flex items-center gap-1 px-2 py-2 rounded-lg"
                style={actionBtnStyle}
                title="更多操作">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showMoreActions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMoreActions(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 py-1 min-w-[140px]"
                    style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                    <button onClick={() => { onReplyAll(); setShowMoreActions(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                      style={{ fontSize: "13px", color: "#374151", background: "none", borderWidth: 0, cursor: "pointer", fontFamily: "inherit" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                      <ReplyAll className="w-4 h-4" style={{ color: "#6B7280" }} />
                      回覆全部
                    </button>
                    <button onClick={() => { onForward(); setShowMoreActions(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                      style={{ fontSize: "13px", color: "#374151", background: "none", borderWidth: 0, cursor: "pointer", fontFamily: "inherit" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                      <Forward className="w-4 h-4" style={{ color: "#6B7280" }} />
                      轉寄
                    </button>
                    <div style={{ borderTopColor: "#F3F4F6", borderTopWidth: "1px", borderTopStyle: "solid", margin: "4px 0" }} />
                    <button onClick={() => { onDelete(); setShowMoreActions(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                      style={{ fontSize: "13px", color: "#DC2626", background: "none", borderWidth: 0, cursor: "pointer", fontFamily: "inherit" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                      <Trash2 className="w-4 h-4" />
                      刪除
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attachments */}
      {mail.attachments && mail.attachments.length > 0 && (
        <div className="px-6 max-md:px-4 py-3 flex items-center gap-3 max-md:gap-2 flex-shrink-0 overflow-x-auto" style={{ borderBottomColor: "#F3F4F6", borderBottomWidth: "1px", borderBottomStyle: "solid", background: "#FAFAFA" }}>
          {mail.attachments.map((att, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer flex-shrink-0"
              style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", background: "#FFF" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#111827"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; }}>
              <Paperclip className="w-3.5 h-3.5" style={{ color: "#6B7280" }} />
              <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{att.name}</span>
              <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{att.size}</span>
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 max-md:px-4 py-5 max-md:py-3">
        <pre style={{ fontFamily: "inherit", fontSize: "14px", color: "#374151", lineHeight: 2, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {mail.body}
        </pre>
      </div>

      {/* Inline Reply Area */}
      <div className="flex-shrink-0 px-6 max-md:px-4 py-3" style={{ borderTopColor: "#E5E7EB", borderTopWidth: "1px", borderTopStyle: "solid" }}>
        {!inlineReplyOpen ? (
          <div className="flex items-center gap-2">
            <button onClick={() => setInlineReplyOpen(true)}
              className="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg text-left"
              style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#9CA3AF", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#111827"; (e.currentTarget as HTMLElement).style.color = "#374151"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}>
              <Reply className="w-4 h-4 flex-shrink-0" />
              點此快速回覆 {mail.from.name}…
            </button>
            <button onClick={onReplyAll} title="回覆全部"
              className="p-2.5 rounded-lg flex-shrink-0"
              style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#6B7280", cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#111827"; (e.currentTarget as HTMLElement).style.color = "#111827"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.color = "#6B7280"; }}>
              <ReplyAll className="w-4 h-4" />
            </button>
            <button onClick={onForward} title="轉寄"
              className="p-2.5 rounded-lg flex-shrink-0"
              style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#6B7280", cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#111827"; (e.currentTarget as HTMLElement).style.color = "#111827"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.color = "#6B7280"; }}>
              <Forward className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 8, background: "#FFF" }}>
            {/* Reply header */}
            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottomColor: "#F3F4F6", borderBottomWidth: "1px", borderBottomStyle: "solid", background: "#F9FAFB", borderRadius: "8px 8px 0 0" }}>
              <div className="flex items-center gap-2">
                <Reply className="w-3.5 h-3.5" style={{ color: "#6B7280" }} />
                <span style={{ fontSize: "12px", color: "#6B7280" }}>
                  回覆給 <span style={{ fontWeight: 600, color: "#374151" }}>{mail.from.name}</span>
                  <span style={{ color: "#9CA3AF" }}> ‹{mail.from.email}›</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={onReply} title="在新視窗中回覆"
                  className="p-1 rounded" style={{ background: "none", borderWidth: 0, color: "#9CA3AF", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#111827"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /><path d="M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h5" />
                  </svg>
                </button>
                <button onClick={() => { setInlineReplyOpen(false); setInlineReplyBody(""); }}
                  className="p-1 rounded" style={{ background: "none", borderWidth: 0, color: "#9CA3AF", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#111827"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Reply body */}
            <textarea
              value={inlineReplyBody}
              onChange={e => setInlineReplyBody(e.target.value)}
              placeholder="輸入回覆內容…"
              autoFocus
              style={{
                width: "100%", minHeight: 100, resize: "none",
                borderWidth: 0, outline: "none",
                fontSize: "14px", color: "#374151",
                padding: "12px 16px", fontFamily: "inherit", lineHeight: 1.8,
                boxSizing: "border-box",
              }}
            />
            {/* Reply footer */}
            <div className="flex items-center justify-between px-3 py-2.5" style={{ borderTopColor: "#F3F4F6", borderTopWidth: "1px", borderTopStyle: "solid" }}>
              <button title="附加檔案"
                style={{ color: "#9CA3AF", background: "none", borderWidth: 0, cursor: "pointer" }}>
                <Paperclip className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => { setInlineReplyOpen(false); setInlineReplyBody(""); }}
                  className="px-3 py-1.5 rounded-lg"
                  style={{ fontSize: "12px", color: "#6B7280", background: "#F3F4F6", borderWidth: 0, cursor: "pointer", fontFamily: "inherit" }}>
                  取消
                </button>
                <button onClick={handleInlineSend}
                  disabled={!inlineReplyBody.trim()}
                  className="px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  style={{
                    fontSize: "12px", color: "#FFF",
                    background: inlineReplyBody.trim() ? "#111827" : "#D1D5DB",
                    borderWidth: 0, cursor: inlineReplyBody.trim() ? "pointer" : "not-allowed",
                    fontFamily: "inherit",
                  }}>
                  <Send className="w-3 h-3" />
                  回覆
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mail View ───────────────────────────────────────────────────────────────
function MailView({ mails, setMails, folder, onCompose, onComposeWithCtx }: {
  mails: Mail[];
  setMails: React.Dispatch<React.SetStateAction<Mail[]>>;
  folder: Exclude<View, "notifications">;
  onCompose: () => void;
  onComposeWithCtx: (ctx: ComposeContext) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [search, setSearch] = useState("");

  const list = mails.filter(m => m.folder === folder && (
    !search || m.subject.includes(search) || m.from.name.includes(search) || m.preview.includes(search)
  ));
  const selectedMail = list.find(m => m.id === selectedId) ?? null;

  const markRead = (id: string) => setMails(p => p.map(m => m.id === id ? { ...m, read: true } : m));
  const toggleStar = (id: string) => setMails(p => p.map(m => m.id === id ? { ...m, starred: !m.starred } : m));
  const deleteMail = (id: string) => {
    if (folder === "trash") setMails(p => p.filter(m => m.id !== id));
    else setMails(p => p.map(m => m.id === id ? { ...m, folder: "trash" } : m));
    if (selectedId === id) { setSelectedId(null); setMobileDetail(false); }
  };

  const handleInlineReply = (mail: Mail, body: string) => {
    const subj = mail.subject.replace(/^(Re:)\s*/gi, "").trim();
    const quotedBody = mail.body.split("\n").map(line => `> ${line}`).join("\n");
    const fullBody = `${body}\n\n──── 於 ${mail.date} ${mail.time}，${mail.from.name} ‹${mail.from.email}› 寫道 ────\n\n${quotedBody}`;
    const newMail: Mail = {
      id: `m${Date.now()}`,
      from: { name: "系統管理者", email: "admin@company.com", dept: "資訊部" },
      to: [{ name: mail.from.name, email: mail.from.email }],
      subject: `Re: ${subj}`,
      preview: body.slice(0, 60),
      body: fullBody,
      date: "2026-03-12",
      time: "剛剛",
      read: true,
      starred: false,
      folder: "sent",
      replyTo: mail.id,
    };
    setMails(p => [newMail, ...p]);
  };

  const FOLDER_LABELS: Record<typeof folder, string> = {
    inbox: "收件匣", sent: "寄件匣", drafts: "草稿", trash: "垃圾桶",
  };

  return (
    <div className="flex h-full w-full gap-0" style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
      {/* Left: list */}
      <div className={`${mobileDetail ? "max-md:hidden" : ""} w-[300px] max-md:w-full shrink-0 flex flex-col`} style={{ borderRightColor: "#F3F4F6", borderRightWidth: "1px", borderRightStyle: "solid" }}>
        {/* List header */}
        <div className="px-4 py-3 flex items-center justify-between flex-shrink-0"
          style={{ borderBottomColor: "#F3F4F6", borderBottomWidth: "1px", borderBottomStyle: "solid", background: "#F9FAFB" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
            {FOLDER_LABELS[folder]}
            <span className="ml-2 tabular-nums" style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 400 }}>{list.length} 封</span>
          </span>
          {folder === "inbox" && (
            null
          )}
        </div>
        {/* Search */}
        <div className="px-3 py-2 flex-shrink-0" style={{ borderBottomColor: "#F3F4F6", borderBottomWidth: "1px", borderBottomStyle: "solid" }}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#9CA3AF" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜尋郵件…"
              style={{ flex: 1, background: "none", borderWidth: 0, outline: "none", fontSize: "13px", color: "#111827", fontFamily: "inherit" }} />
          </div>
        </div>
        {/* Mail list */}
        <div className="flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Mail className="w-8 h-8" style={{ color: "#E5E7EB" }} />
              <p style={{ fontSize: "13px", color: "#9CA3AF" }}>此資料夾為空</p>
            </div>
          ) : (
            list.map(mail => (
              <MailItem key={mail.id} mail={mail} active={selectedId === mail.id}
                onSelect={() => { setSelectedId(mail.id); markRead(mail.id); setMobileDetail(true); }}
                onStar={() => toggleStar(mail.id)} />
            ))
          )}
        </div>
      </div>

      {/* Right: detail */}
      <div className={`flex-1 min-w-0 overflow-hidden ${mobileDetail ? "" : "max-md:hidden"}`}>
        {selectedMail ? (
          <div className="flex flex-col h-full">
            {/* Mobile back button */}
            <div className="md:hidden flex-shrink-0 px-4 pt-3 pb-2" style={{ borderBottomColor: "#F3F4F6", borderBottomWidth: "1px", borderBottomStyle: "solid" }}>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded"
                style={{ fontSize: "13px", fontWeight: 500, color: "#6B7280", background: "#F3F4F6" }}
                onClick={() => setMobileDetail(false)}
              >
                <ArrowLeft className="w-3.5 h-3.5" />返回列表
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
          <MailDetail mail={selectedMail}
            onReply={() => onComposeWithCtx({ mode: "reply", mail: selectedMail })}
            onReplyAll={() => onComposeWithCtx({ mode: "replyAll", mail: selectedMail })}
            onForward={() => onComposeWithCtx({ mode: "forward", mail: selectedMail })}
            onDelete={() => deleteMail(selectedMail.id)}
            onInlineReplySend={(body) => handleInlineReply(selectedMail, body)} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#F3F4F6" }}>
              <Mail className="w-7 h-7" style={{ color: "#D1D5DB" }} />
            </div>
            <div className="text-center">
              <p style={{ fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }}>選擇一封信件閱讀</p>
              <p style={{ fontSize: "12px", color: "#D1D5DB", marginTop: 4 }}>從左側點選任一郵件</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export function Notifications() {
  const [view,       setView]       = useState<View>("notifications");
  const [notifs,     setNotifs]     = useState<NotifItem[]>(INIT_NOTIFS);
  const [mails,      setMails]      = useState<Mail[]>(INIT_MAILS);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeCtx,  setComposeCtx]  = useState<ComposeContext | null>(null);

  const unreadNotifs = notifs.filter(n => !n.read).length;
  const unreadMails  = mails.filter(m => m.folder === "inbox" && !m.read).length;
  const draftCount   = mails.filter(m => m.folder === "drafts").length;

  const folderCount = (f: Mail["folder"]) => mails.filter(m => m.folder === f).length;

  const openCompose = (ctx?: ComposeContext) => {
    setComposeCtx(ctx || null);
    setComposeOpen(true);
  };

  const handleSend = (draft: Omit<Mail, "id" | "read" | "starred" | "folder" | "date" | "time">) => {
    const newMail: Mail = {
      ...draft, id: `m${Date.now()}`,
      read: true, starred: false, folder: "sent",
      date: "2026-03-12", time: "剛剛",
    };
    setMails(p => [newMail, ...p]);
    setComposeOpen(false);
    setComposeCtx(null);
  };

  const navItems: { key: View; label: string; Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; count?: number }[] = [
    { key: "notifications", label: "通知記錄", Icon: Bell,     count: unreadNotifs },
    { key: "inbox",         label: "收件匣",   Icon: Inbox,    count: unreadMails  },
    { key: "sent",          label: "寄件匣",   Icon: Send                          },
    { key: "drafts",        label: "草稿",     Icon: FileText, count: draftCount   },
    { key: "trash",         label: "垃圾桶",   Icon: Trash2                        },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-5 max-md:gap-3 overflow-hidden">
      {/* Page header */}
      <div className="flex items-center justify-between flex-shrink-0 max-md:flex-col max-md:items-stretch max-md:gap-3">
        <div>
          <h1 style={{ color: "#111827" }}>訊息中心</h1>
          <p className="max-md:hidden" style={{ fontSize: "15px", color: "#9CA3AF", marginTop: 2 }}>通知記錄與公司內部信件</p>
        </div>
        <button onClick={() => { openCompose(); if (view === "notifications") setView("inbox"); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 max-md:px-3 max-md:py-2 rounded-lg max-md:w-full"
          style={{ fontSize: "15px", fontWeight: 500, background: "#111827", color: "#FFF", borderWidth: 0, cursor: "pointer", fontFamily: "inherit" }}>
          <Plus className="w-4 h-4" /> <span className="max-md:hidden">撰寫新信件</span><span className="md:hidden">寫信</span>
        </button>
      </div>

      {/* Mobile nav tabs */}
      <DraggableScroll className="md:hidden flex-shrink-0 -mt-2 p-1 rounded-xl" style={{ background: "#F3F4F6" }} innerClassName="flex gap-1 pb-0"
        mobileDropdown={{
          options: navItems.map(n => ({ key: n.key, label: n.label + (n.count != null && n.count > 0 ? `（${n.count}）` : "") })),
          activeKey: view,
          onSelect: (k) => setView(k as View),
        }}>
        {navItems.map(item => {
          const active = view === item.key;
          const Icon = item.Icon;
          return (
            <button key={item.key} onClick={() => setView(item.key)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-all flex-shrink-0 whitespace-nowrap"
              style={{ background: active ? "#111827" : "transparent", color: active ? "#FFF" : "#6B7280", fontSize: "13px", fontWeight: active ? 600 : 500, boxShadow: active ? "0 1px 4px rgba(0,0,0,0.15)" : "none", cursor: "pointer", fontFamily: "inherit" }}>
              <Icon className="w-3.5 h-3.5" />
              <span>
                {item.label}
              </span>
              {item.count != null && item.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full tabular-nums"
                  style={{ fontSize: "11px", fontWeight: 700, background: active ? "rgba(255,255,255,0.2)" : "#E5E7EB", color: active ? "#FFF" : "#374151", lineHeight: 1 }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </DraggableScroll>

      {/* Body */}
      <div className="flex-1 min-h-0 flex gap-5 md:overflow-hidden">

        {/* Left nav — hidden on mobile (replaced by horizontal tabs above) */}
        <div className="flex-shrink-0 flex flex-col gap-3 max-md:hidden" style={{ width: 200 }}>
          <div style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "8px" }}>
            {/* Notifications */}
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", padding: "4px 8px 6px" }}>通知</p>
            {navItems.slice(0, 1).map(item => {
              const active = view === item.key;
              const Icon = item.Icon;
              return (
                <button key={item.key} onClick={() => setView(item.key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors duration-150"
                  style={{ background: active ? "#111827" : "transparent", borderWidth: 0, cursor: "pointer", fontFamily: "inherit" }}>
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? "#FFF" : "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: active ? 600 : 400, color: active ? "#FFF" : "#374151", flex: 1, textAlign: "left" }}>
                    {item.label}
                  </span>
                  {item.count != null && item.count > 0 && (
                    <span className="flex items-center justify-center rounded-full"
                      style={{ minWidth: 20, height: 18, background: active ? "rgba(255,255,255,0.2)" : "#111827", color: active ? "#FFF" : "#FFF", fontSize: "11px", fontWeight: 700, padding: "0 4px" }}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            <div style={{ borderTopColor: "#F3F4F6", borderTopWidth: "1px", borderTopStyle: "solid", margin: "6px 0" }} />

            {/* Mail */}
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.08em", padding: "4px 8px 6px" }}>公司信件</p>
            <button onClick={() => openCompose()}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1"
              style={{ background: "#F0FDF4", borderWidth: "1px", borderStyle: "dashed", borderColor: "#BBF7D0", cursor: "pointer", fontFamily: "inherit" }}>
              <Plus className="w-4 h-4 flex-shrink-0" style={{ color: "#16A34A" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#16A34A" }}>撰寫新信件</span>
            </button>

            {navItems.slice(1).map(item => {
              const active = view === item.key;
              const Icon = item.Icon;
              return (
                <button key={item.key} onClick={() => setView(item.key)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors duration-150"
                  style={{ background: active ? "#111827" : "transparent", borderWidth: 0, cursor: "pointer", fontFamily: "inherit" }}>
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? "#FFF" : "#6B7280" }} />
                  <span style={{ fontSize: "14px", fontWeight: active ? 600 : 400, color: active ? "#FFF" : "#374151", flex: 1, textAlign: "left" }}>
                    {item.label}
                  </span>
                  {item.count != null && item.count > 0 && (
                    <span className="flex items-center justify-center rounded-full"
                      style={{ minWidth: 20, height: 18, background: active ? "rgba(255,255,255,0.2)" : "#F3F4F6", color: active ? "#FFF" : "#374151", fontSize: "11px", fontWeight: 700, padding: "0 4px" }}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Storage usage */}
          <div style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: 8, padding: "12px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: 8 }}>信件儲存空間</p>
            <div className="w-full rounded-full mb-2" style={{ height: 5, background: "#F3F4F6" }}>
              <div className="rounded-full h-full" style={{ width: "23%", background: "#111827" }} />
            </div>
            <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
              <span className="tabular-nums" style={{ fontWeight: 600, color: "#374151" }}>230 MB</span>
              {" / 1 GB 已使用"}
            </p>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0 overflow-hidden h-full flex flex-col" style={{ background: "transparent" }}>
          {view === "notifications"
            ? <NotificationsView items={notifs} setItems={setNotifs} />
            : <MailView mails={mails} setMails={setMails} folder={view as Exclude<View, "notifications">} onCompose={() => openCompose()} onComposeWithCtx={(ctx) => openCompose(ctx)} />
          }
        </div>
      </div>

      {/* Compose modal */}
      {composeOpen && (
        <ComposeModal
          onClose={() => { setComposeOpen(false); setComposeCtx(null); }}
          onSend={handleSend}
          onDraft={() => { setComposeOpen(false); setComposeCtx(null); }}
          composeCtx={composeCtx}
        />
      )}
    </div>
  );
}