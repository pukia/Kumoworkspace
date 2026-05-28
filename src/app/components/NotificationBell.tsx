import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Bell, Fingerprint, CheckSquare, Megaphone,
  Receipt, Clock, Package, FolderKanban,
  CheckCheck, X, ChevronRight, BellOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = "punch" | "task" | "announcement" | "finance" | "attendance" | "asset" | "project";
type Level    = "info" | "warning" | "success" | "urgent";

interface Notification {
  id: string;
  category: Category;
  level: Level;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

// ─── Category Config ──────────────────────────────────────────────────────────
const CAT_CFG: Record<Category, {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}> = {
  punch:        { label: "打卡",   Icon: Fingerprint,  iconBg: "#F3F4F6", iconColor: "#374151" },
  task:         { label: "工作",   Icon: CheckSquare,  iconBg: "#EFF6FF", iconColor: "#3B82F6" },
  announcement: { label: "公告",   Icon: Megaphone,    iconBg: "#FFF7ED", iconColor: "#EA580C" },
  finance:      { label: "財務",   Icon: Receipt,      iconBg: "#F0FDF4", iconColor: "#16A34A" },
  attendance:   { label: "出缺勤", Icon: Clock,        iconBg: "#FDF4FF", iconColor: "#9333EA" },
  asset:        { label: "資產",   Icon: Package,      iconBg: "#FEF9C3", iconColor: "#CA8A04" },
  project:      { label: "專案",   Icon: FolderKanban, iconBg: "#F0F9FF", iconColor: "#0284C7" },
};

// ─── Level Config ─────────────────────────────────────────────────────────────
const LEVEL_CFG: Record<Level, {
  stripe: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  cardBg?: string;
}> = {
  urgent:  { stripe: "#EF4444", badge: "緊急", badgeColor: "#DC2626", badgeBg: "#FEF2F2", cardBg: "#FFFBFB" },
  warning: { stripe: "#F59E0B", badge: "注意", badgeColor: "#B45309", badgeBg: "#FFFBEB", cardBg: "#FFFDF7" },
  success: { stripe: "#10B981", cardBg: "transparent" },
  info:    { stripe: "#D1D5DB", cardBg: "transparent" },
};

// ─── Mock Data ──────────────────────────────────────────────────────────────
const INITIAL: Notification[] = [
  {
    id: "n1",
    category: "punch",
    level: "urgent",
    title: "尚未完成上班打卡",
    description: "今日 09:30 已過，系統未偵測到上班打卡紀錄，請盡快補打卡。",
    time: "09:32",
    read: false,
  },
  {
    id: "n2",
    category: "task",
    level: "urgent",
    title: "任務今日截止",
    description: "「Q1 財報整理」今日到期，目前狀態為進行中，請盡快完成。",
    time: "09:00",
    read: false,
  },
  {
    id: "n3",
    category: "task",
    level: "info",
    title: "新任務已指派給你",
    description: "陳小明 將「設計稿審核 v2.3」指派給你，截止日期 3/14。",
    time: "昨天 10:15",
    read: false,
  },
  {
    id: "n4",
    category: "announcement",
    level: "info",
    title: "新公告：春季健康檢查通知",
    description: "人事部發布「2026 年度員工健康檢查」公告，請於 3/20 前完成預約。",
    time: "昨天 14:00",
    read: false,
  },
  {
    id: "n5",
    category: "finance",
    level: "success",
    title: "費用申請已核准",
    description: "你的差旅費用申請（NT$4,500）已由財務部審核通過，將於下次薪資入帳。",
    time: "昨天 11:30",
    read: false,
  },
  {
    id: "n6",
    category: "asset",
    level: "warning",
    title: "資產歸還期限即將到期",
    description: "「MacBook Pro 16吋」借用期限將於 3/15 到期，請按時歸還或申請延期。",
    time: "2 天前",
    read: true,
  },
  {
    id: "n7",
    category: "attendance",
    level: "success",
    title: "請假申請已核准",
    description: "你提交的 3/8（週日）特別假申請已由主管核准。",
    time: "2 天前",
    read: true,
  },
  {
    id: "n8",
    category: "project",
    level: "info",
    title: "你已加入新專案",
    description: "王大明 將你加入「2026 品牌改版」專案，目前進度 25%。",
    time: "3 天前",
    read: true,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export function NotificationBell() {
  const [open,  setOpen]  = useState(false);
  const [tab,   setTab]   = useState<"all" | "unread">("all");
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef   = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter(n => !n.read).length;
  const displayed   = tab === "unread" ? items.filter(n => !n.read) : items;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markRead    = (id: string) => setItems(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setItems(p => p.map(n => ({ ...n, read: true })));
  const remove      = (id: string) => setItems(p => p.filter(n => n.id !== id));

  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Bell trigger */}
      <div
        ref={btnRef}
        className="relative cursor-pointer p-1.5 rounded-lg select-none transition-colors duration-150"
        style={{ color: open ? "#111827" : "#6B7280", background: open ? "#F3F4F6" : "transparent" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = open ? "#F3F4F6" : "transparent"; }}
        onClick={() => setOpen(v => !v)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute flex items-center justify-center rounded-full"
            style={{
              top: "1px",
              right: unreadCount > 9 ? "-2px" : "2px",
              minWidth: unreadCount > 9 ? "18px" : "9px",
              height: unreadCount > 9 ? "18px" : "9px",
              background: "#EF4444",
              color: "#FFF",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: 0,
              padding: unreadCount > 9 ? "0 4px" : 0,
              borderWidth: "2px", borderStyle: "solid", borderColor: "#FFFFFF",
            }}
          >
            {unreadCount > 9 ? "9+" : ""}
          </span>
        )}
      </div>

      {/* Dropdown Panel */}
      {open && (
        <>
          {/* Mobile overlay */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(17,24,39,0.3)", backdropFilter: "blur(2px)" }}
            onClick={() => setOpen(false)}
          />

          <div
            ref={panelRef}
            className="absolute right-0 top-full mt-2 z-50 flex flex-col w-[calc(100vw-32px)] max-w-[420px]"
            style={{
              maxHeight: "min(580px, 85vh)",
              background: "#FFFFFF",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "#E5E7EB",
              borderRadius: "12px",
              boxShadow: "0 12px 48px rgba(17,24,39,0.15), 0 4px 12px rgba(17,24,39,0.06)",
            }}
          >
            {/* ─── Header ────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                  <Bell className="w-4 h-4" style={{ color: "#374151" }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>通知中心</span>
                    {unreadCount > 0 && (
                      <span
                        className="flex items-center justify-center rounded-full px-2"
                        style={{ fontSize: "11px", fontWeight: 700, background: "#EF4444", color: "#FFF", minWidth: "22px", height: "20px" }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "1px" }}>
                    {unreadCount > 0 ? `${unreadCount} 則未讀通知` : "所有通知已讀"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors duration-150"
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: unreadCount > 0 ? "#374151" : "#D1D5DB",
                    cursor: unreadCount > 0 ? "pointer" : "default",
                    background: "transparent",
                  }}
                  onMouseEnter={e => { if (unreadCount > 0) { e.currentTarget.style.background = "#F3F4F6"; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">全部已讀</span>
                </button>
                <button
                  className="lg:hidden p-1.5 rounded-lg transition-colors duration-150"
                  style={{ color: "#9CA3AF" }}
                  onClick={() => setOpen(false)}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ─── List ──────────────────────────────────────────── */}
            <div className="overflow-y-auto flex-1 py-2">
              {displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#F9FAFB" }}>
                    <BellOff className="w-6 h-6" style={{ color: "#D1D5DB" }} />
                  </div>
                  <div className="text-center">
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#6B7280" }}>
                      {tab === "unread" ? "沒有未讀通知" : "沒有通知"}
                    </p>
                    <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "4px" }}>
                      {tab === "unread" ? "所有通知均已查閱" : "目前尚無任何通知"}
                    </p>
                  </div>
                </div>
              ) : (
                displayed.map((n) => {
                  const cat   = CAT_CFG[n.category];
                  const level = LEVEL_CFG[n.level];
                  const CatIcon = cat.Icon;
                  return (
                    <div
                      key={n.id}
                      className="group relative mx-2 mb-1 rounded-lg cursor-pointer transition-all duration-150"
                      style={{
                        background: !n.read ? (level.cardBg || "#FAFAFA") : "transparent",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#F9FAFB"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = !n.read ? (level.cardBg || "#FAFAFA") : "transparent"; }}
                      onClick={() => markRead(n.id)}
                    >
                      {/* Left color stripe */}
                      <span
                        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
                        style={{
                          background: !n.read ? level.stripe : "transparent",
                          transition: "background 0.15s",
                        }}
                      />

                      <div className="flex gap-3.5 px-4 py-3.5">
                        {/* Category Icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: cat.iconBg }}
                        >
                          <CatIcon className="w-[18px] h-[18px]" style={{ color: cat.iconColor } as React.CSSProperties} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Row 1: Category + Time */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 rounded-md"
                                style={{ fontSize: "11px", fontWeight: 600, background: cat.iconBg, color: cat.iconColor }}
                              >
                                {cat.label}
                              </span>
                              {level.badge && (
                                <span
                                  className="px-2 py-0.5 rounded-md flex items-center gap-1"
                                  style={{ fontSize: "11px", fontWeight: 700, background: level.badgeBg, color: level.badgeColor }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: level.stripe }} />
                                  {level.badge}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: "12px", color: "#9CA3AF", flexShrink: 0 }}>{n.time}</span>
                          </div>

                          {/* Row 2: Title */}
                          <p style={{
                            fontSize: "14px",
                            fontWeight: !n.read ? 700 : 500,
                            color: "#111827",
                            lineHeight: 1.4,
                            marginBottom: "4px",
                          }}>
                            {!n.read && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-0.5" style={{ background: level.stripe }} />
                            )}
                            {n.title}
                          </p>

                          {/* Row 3: Description */}
                          <p style={{
                            fontSize: "13px",
                            color: "#6B7280",
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}>
                            {n.description}
                          </p>
                        </div>

                        {/* Dismiss button */}
                        <button
                          className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 self-start mt-0.5"
                          style={{ color: "#9CA3AF", background: "transparent" }}
                          onMouseEnter={e => {
                            e.stopPropagation();
                            e.currentTarget.style.color = "#374151";
                            e.currentTarget.style.background = "#F3F4F6";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = "#9CA3AF";
                            e.currentTarget.style.background = "transparent";
                          }}
                          onClick={e => { e.stopPropagation(); remove(n.id); }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ─── Footer ────────────────────────────────────────── */}
            <div className="flex-shrink-0 px-4 py-3 flex items-center justify-center" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}>
              <button
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors duration-150"
                style={{ fontSize: "14px", color: "#374151", fontWeight: 500, background: "#F9FAFB" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#F9FAFB"; e.currentTarget.style.color = "#374151"; }}
                onClick={() => { navigate("/notifications"); setOpen(false); }}
              >
                查看全部通知記錄
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}