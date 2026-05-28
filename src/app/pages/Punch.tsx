import React, { useState, useEffect } from "react";
import { LogIn, LogOut, Check, CalendarDays, FileEdit, ClipboardCheck, ShieldCheck, CheckCircle2, X, Clock, Plus } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type PunchStatus = "normal" | "late" | "early" | "leave" | "today" | "pending";

interface PunchRecord {
  date: string;
  weekday: string;
  checkIn: string | null;
  checkOut: string | null;
  status: PunchStatus;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<PunchStatus, { label: string; bg: string; color: string; dot: string }> = {
  pending: { label: "待打卡", bg: "#F9FAFB", color: "#9CA3AF", dot: "#D1D5DB"  },
  today:   { label: "上班中", bg: "#F0FDF4", color: "#15803D", dot: "#16A34A"  },
  normal:  { label: "正常",   bg: "#F0FDF4", color: "#15803D", dot: "#16A34A"  },
  late:    { label: "遲到",   bg: "#FEF9C3", color: "#A16207", dot: "#CA8A04"  },
  early:   { label: "早退",   bg: "#FFF7ED", color: "#C2410C", dot: "#EA580C"  },
  leave:   { label: "請假",   bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6"  },
};

// ─── History (past records, not today) ───────────────────────────────────────
const historyRecords: PunchRecord[] = [
  { date: "3/9",  weekday: "週一", checkIn: "08:55", checkOut: "18:10", status: "normal" },
  { date: "3/6",  weekday: "週五", checkIn: "08:50", checkOut: "17:55", status: "normal" },
  { date: "3/5",  weekday: "週四", checkIn: "09:15", checkOut: "18:20", status: "late"   },
  { date: "3/4",  weekday: "週三", checkIn: "08:52", checkOut: "18:15", status: "normal" },
  { date: "3/3",  weekday: "週二", checkIn: "09:05", checkOut: "18:00", status: "normal" },
  { date: "3/2",  weekday: "週一", checkIn: "08:58", checkOut: "18:05", status: "normal" },
  { date: "2/27", weekday: "週五", checkIn: "08:45", checkOut: "18:20", status: "normal" },
  { date: "2/26", weekday: "週四", checkIn: "09:00", checkOut: "17:50", status: "normal" },
  { date: "2/25", weekday: "週三", checkIn: null,    checkOut: null,    status: "leave"  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const getNow = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const calcElapsed = (checkIn: string, end: string): string => {
  const [ih, im] = checkIn.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = Math.max(0, eh * 60 + em - (ih * 60 + im));
  return `${Math.floor(diff / 60)}h ${String(diff % 60).padStart(2, "0")}m`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Card = ({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={className} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", ...style }}>
    {children}
  </div>
);

// ─── Leave System ─────────────────────────────────────────────────────────────
type LeaveType = "annual" | "personal" | "sick" | "official" | "marriage" | "bereavement";
type LeaveStatus = "pending" | "manager" | "hr" | "approved" | "rejected";

interface LeaveRecord {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  submittedAt: string;
  approverNote?: string;
}

const LEAVE_TYPE_CFG: Record<LeaveType, { label: string; bg: string; color: string }> = {
  annual:     { label: "特休假", bg: "#EFF6FF", color: "#1D4ED8" },
  personal:   { label: "事假",   bg: "#F3F4F6", color: "#374151" },
  sick:       { label: "病假",   bg: "#FEF2F2", color: "#DC2626" },
  official:   { label: "公假",   bg: "#F5F3FF", color: "#7C3AED" },
  marriage:   { label: "婚假",   bg: "#FDF2F8", color: "#DB2777" },
  bereavement:{ label: "喪假",   bg: "#F9FAFB", color: "#4B5563" },
};

const LEAVE_STATUS_CFG: Record<LeaveStatus, { label: string; bg: string; color: string; dot: string; step: number }> = {
  pending:  { label: "送出申請", bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF", step: 1 },
  manager:  { label: "主管審核中", bg: "#FEF9C3", color: "#A16207", dot: "#CA8A04", step: 2 },
  hr:       { label: "人資確認中", bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", step: 3 },
  approved: { label: "已核准",   bg: "#F0FDF4", color: "#15803D", dot: "#16A34A", step: 4 },
  rejected: { label: "已駁回",   bg: "#FEF2F2", color: "#DC2626", dot: "#DC2626", step: 0 },
};

const INIT_LEAVES: LeaveRecord[] = [
  { id: "L01", type: "annual", startDate: "2026-03-28", endDate: "2026-03-28", days: 1, reason: "家庭旅遊",   status: "manager",  submittedAt: "2026-03-09 14:20" },
  { id: "L02", type: "sick",   startDate: "2026-03-05", endDate: "2026-03-05", days: 1, reason: "感冒就醫",   status: "approved", submittedAt: "2026-03-04 18:45", approverNote: "請好好休息" },
  { id: "L03", type: "personal", startDate: "2026-02-20", endDate: "2026-02-20", days: 0.5, reason: "辦理證件",   status: "approved", submittedAt: "2026-02-18 09:10" },
  { id: "L04", type: "personal", startDate: "2026-02-12", endDate: "2026-02-12", days: 1, reason: "私人事務",   status: "rejected", submittedAt: "2026-02-10 16:30", approverNote: "當週案件較多，請改期" },
];

const SUPERVISORS = [
  { id: "sup1", name: "張志偉", title: "資訊部 部門主管", email: "pm@company.com" },
  { id: "sup2", name: "王美玲", title: "人事部 部門主管", email: "hr@company.com" },
  { id: "sup3", name: "陳雅芳", title: "財務部 部門主管", email: "finance@company.com" },
  { id: "sup4", name: "李志遠", title: "總經理", email: "ceo@company.com" },
];

const calcDaysBetween = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
  const diffMs = e.getTime() - s.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

const FLOW_STEPS = [
  { step: 1, label: "送出申請",   sub: "員工填寫",   Icon: FileEdit       },
  { step: 2, label: "主管審核",   sub: "部門主管",   Icon: ClipboardCheck },
  { step: 3, label: "人資確認",   sub: "HR 入帳",   Icon: ShieldCheck    },
  { step: 4, label: "核准完成",   sub: "通知申請人", Icon: CheckCircle2   },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Punch() {
  const [currentTime, setCurrentTime] = useState(getNow);
  const [checkInTime,  setCheckInTime]  = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"punch" | "records" | "leave">("punch");

  // Leave state
  const [leaves, setLeaves] = useState<LeaveRecord[]>(INIT_LEAVES);
  const [leaveForm, setLeaveForm] = useState<{ type: LeaveType; startDate: string; endDate: string; halfDay: boolean; reason: string; ccId: string }>({
    type: "annual", startDate: "", endDate: "", halfDay: false, reason: "", ccId: SUPERVISORS[0].id,
  });
  const [showForm, setShowForm] = useState(false);
  const [ccDropdownOpen, setCcDropdownOpen] = useState(false);

  // Auto-calc days from date range
  const computedDays = (() => {
    const base = calcDaysBetween(leaveForm.startDate, leaveForm.endDate);
    if (base === 0) return 0;
    return leaveForm.halfDay && base === 1 ? 0.5 : base;
  })();

  const submitLeave = () => {
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason.trim()) {
      showToast("請完整填寫表單");
      return;
    }
    if (computedDays <= 0) {
      showToast("結束日期須等於或晚於開始日期");
      return;
    }
    const newLeave: LeaveRecord = {
      id: `L${Date.now()}`,
      type: leaveForm.type,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      days: computedDays,
      reason: leaveForm.reason,
      status: "manager",
      submittedAt: "2026-03-10 " + currentTime,
    };
    setLeaves(p => [newLeave, ...p]);
    setLeaveForm({ type: "annual", startDate: "", endDate: "", halfDay: false, reason: "", ccId: SUPERVISORS[0].id });
    setShowForm(false);
    setCcDropdownOpen(false);
    showToast("請假申請已送出 ✓");
  };

  const cancelLeave = (id: string) => {
    setLeaves(p => p.filter(l => l.id !== id));
    showToast("申請已撤回");
  };

  // Live clock — ticks every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getNow()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleCheckIn = () => {
    const t = currentTime;
    setCheckInTime(t);
    showToast(`上班打卡成功 ✓ ${t}`);
  };

  const handleCheckOut = () => {
    const t = currentTime;
    setCheckOutTime(t);
    showToast(`下班打卡成功 ✓ ${t}`);
  };

  // Derived state
  const canCheckIn  = checkInTime === null;
  const canCheckOut = checkInTime !== null && checkOutTime === null;
  const bothDone    = checkInTime !== null && checkOutTime !== null;

  const todayStatus: PunchStatus = checkInTime === null ? "pending" : checkOutTime !== null ? "normal" : "today";

  const elapsed = checkInTime
    ? calcElapsed(checkInTime, checkOutTime ?? currentTime)
    : "—";

  // Today's dynamic record merged with history for table
  const todayRecord: PunchRecord = {
    date: "3/10", weekday: "二",
    checkIn: checkInTime,
    checkOut: checkOutTime,
    status: todayStatus,
  };
  const allRecords = [todayRecord, ...historyRecords];

  // Monthly stats
  const statNormal  = allRecords.filter(r => r.status === "normal" || r.status === "today").length;
  const statLate    = allRecords.filter(r => r.status === "late").length;
  const statLeave   = allRecords.filter(r => r.status === "leave").length;

  // Card header badge
  const headerBadge = checkInTime === null
    ? { label: "待打卡", bg: "#F3F4F6", color: "#6B7280" }
    : checkOutTime !== null
      ? { label: "已下班", bg: "#EFF6FF", color: "#1D4ED8" }
      : { label: "上班中", bg: "#F0FDF4", color: "#15803D" };

  // Button style helper
  const btnStyle = (active: boolean): React.CSSProperties => active
    ? { background: "#F3F4F6", borderWidth: "1px", borderStyle: "solid", borderColor: "#D1D5DB", color: "#374151", fontSize: "15px", fontWeight: 600, cursor: "pointer" }
    : { background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6", color: "#D1D5DB", fontSize: "15px", fontWeight: 600, cursor: "not-allowed" };

  return (
    <div className="h-full flex flex-col gap-5">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: "#111827", color: "#FFF", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", fontSize: "15px", fontWeight: 500 }}>
          <Check className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 style={{ color: "#111827" }}>個人打卡</h1>
          <p style={{ fontSize: "15px", color: "#9CA3AF", marginTop: 2 }}>記錄每日上下班打卡時間</p>
        </div>
        <span className="px-3 py-1.5 rounded-lg"
          style={{ fontSize: "13px", fontWeight: 600, background: "#F3F4F6", color: "#374151" }}>
          2026年3月10日 週二
        </span>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-1 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
        {([
          { key: "punch",   label: "今日打卡",   badge: null },
          { key: "records", label: "本月紀錄",   badge: allRecords.length },
          { key: "leave",   label: "請假申請",   badge: leaves.filter(l => l.status === "manager" || l.status === "hr").length },
        ] as const).map(tab => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
              style={{
                fontSize: "13px",
                fontWeight: active ? 600 : 500,
                background: active ? "#111827" : "transparent",
                color: active ? "#FFF" : "#6B7280",
                boxShadow: active ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
              }}
            >
              {tab.label}
              {tab.badge !== null && (
                <span className="px-1.5 py-0.5 rounded-full tabular-nums"
                  style={{
                    fontSize: "11px", fontWeight: 700,
                    background: active ? "rgba(255,255,255,0.2)" : "#E5E7EB",
                    color: active ? "#FFF" : "#374151",
                    lineHeight: 1,
                  }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* ── Tab: 今日打卡 ────────────────────────────────────────────── */}
        {activeTab === "punch" && (
          <div className="flex justify-center">
            <Card className="p-5 sm:p-6 flex flex-col gap-5" style={{ maxWidth: 400, width: "100%", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(17,24,39,0.02)" }}>

              {/* Header */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>今日打卡</h3>
                  <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.08em" }}>PUNCH</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                  style={{ fontSize: "11px", background: headerBadge.bg, color: headerBadge.color, fontWeight: 600 }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: headerBadge.color, boxShadow: `0 0 0 3px ${headerBadge.bg}` }} />
                  {headerBadge.label}
                </span>
              </div>

              {/* Live Clock */}
              <div className="rounded-2xl flex flex-col items-center justify-center w-full relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #111827 0%, #1E3A5F 100%)",
                  padding: "26px 16px",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}>
                {/* Decorative glow */}
                <div className="absolute pointer-events-none" style={{ top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.18), transparent 70%)" }} />
                <div className="absolute pointer-events-none" style={{ bottom: -30, left: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.08), transparent 70%)" }} />

                {/* Live dot */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "#60A5FA", opacity: 0.6 }} />
                    <span className="relative rounded-full w-1.5 h-1.5" style={{ background: "#60A5FA" }} />
                  </span>
                  <span style={{ fontSize: "9px", color: "#60A5FA", fontWeight: 700, letterSpacing: "0.15em" }}>LIVE</span>
                </div>

                <p className="tabular-nums relative" style={{ fontSize: "46px", fontWeight: 800, color: "#FFF", letterSpacing: "0.04em", lineHeight: 1 }}>
                  {currentTime}
                </p>
                <div className="flex items-center gap-2 mt-3 relative">
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.04em" }}>
                    2026.03.10
                  </span>
                  <span className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>週二</span>
                </div>
              </div>

              {/* Punch Buttons */}
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <button
                  disabled={!canCheckIn}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-150"
                  style={canCheckIn
                    ? { background: "#111827", color: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#111827", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 1px 2px rgba(17,24,39,0.15)" }
                    : { background: "#F9FAFB", color: "#D1D5DB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6", fontSize: "14px", fontWeight: 600, cursor: "not-allowed" }}
                  onMouseEnter={e => { if (canCheckIn) { const el = e.currentTarget as HTMLElement; el.style.background = "#1F2937"; el.style.transform = "translateY(-1px)"; } }}
                  onMouseLeave={e => { if (canCheckIn) { const el = e.currentTarget as HTMLElement; el.style.background = "#111827"; el.style.transform = "translateY(0)"; } }}
                  onClick={handleCheckIn}
                >
                  {checkInTime ? <Check className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  上班打卡
                </button>
                <button
                  disabled={!canCheckOut}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-150"
                  style={canCheckOut
                    ? { background: "#FFF", color: "#111827", borderWidth: "1px", borderStyle: "solid", borderColor: "#111827", fontSize: "14px", fontWeight: 600, cursor: "pointer" }
                    : { background: "#F9FAFB", color: "#D1D5DB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6", fontSize: "14px", fontWeight: 600, cursor: "not-allowed" }}
                  onMouseEnter={e => { if (canCheckOut) { const el = e.currentTarget as HTMLElement; el.style.background = "#F9FAFB"; el.style.transform = "translateY(-1px)"; } }}
                  onMouseLeave={e => { if (canCheckOut) { const el = e.currentTarget as HTMLElement; el.style.background = "#FFF"; el.style.transform = "translateY(0)"; } }}
                  onClick={handleCheckOut}
                >
                  {checkOutTime ? <Check className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                  下班打卡
                </button>
              </div>

              {/* Hint */}
              {!bothDone && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6", marginTop: -8 }}>
                  <div className="w-1 h-1 rounded-full mt-2 shrink-0" style={{ background: canCheckIn ? "#9CA3AF" : "#16A34A" }} />
                  <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.5 }}>
                    {canCheckIn ? "請先完成上班打卡，才能進行下班打卡" : "上班打卡完成，可進行下班打卡"}
                  </p>
                </div>
              )}

              {/* Today Summary */}
              <div className="w-full pt-4" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.08em" }}>今日紀錄</span>
                  <span style={{ fontSize: "10px", color: "#D1D5DB", fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.1em" }}>TODAY</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "上班打卡", value: checkInTime  ?? "未打卡", done: !!checkInTime,  accent: "#16A34A" },
                    { label: "下班打卡", value: checkOutTime ?? "未打卡", done: !!checkOutTime, accent: "#2563EB" },
                    { label: "在班時數", value: elapsed,                  done: !!checkInTime,  accent: "#111827" },
                  ].map(row => (
                    <div key={row.label}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors"
                      style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-4 rounded-full" style={{ background: row.done ? row.accent : "#E5E7EB" }} />
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "#6B7280" }}>{row.label}</span>
                      </div>
                      <span className="tabular-nums" style={{ fontSize: "18px", fontWeight: 700, color: row.done ? "#111827" : "#D1D5DB", letterSpacing: "0.02em" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jump to records */}
              <button
                className="w-full py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 group"
                style={{ fontSize: "12.5px", fontWeight: 600, color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", background: "transparent" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#111827"; el.style.color = "#FFF"; el.style.borderColor = "#111827"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "#6B7280"; el.style.borderColor = "#E5E7EB"; }}
                onClick={() => setActiveTab("records")}
              >
                查看本月打卡紀錄
                <span className="transition-transform duration-150" style={{ display: "inline-block" }}>→</span>
              </button>
            </Card>
          </div>
        )}

        {/* ── Tab: 本月紀錄 ─────────────────────────────────────────────── */}
        {activeTab === "records" && (
          <div className="space-y-4">

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: "正常出勤", value: statNormal, unit: "天", color: "#15803D", bg: "#F0FDF4", dot: "#16A34A" },
                { label: "遲到次數", value: statLate,   unit: "次", color: "#A16207", bg: "#FEF9C3", dot: "#CA8A04" },
                { label: "請假天數", value: statLeave,  unit: "天", color: "#1D4ED8", bg: "#EFF6FF", dot: "#3B82F6" },
              ].map(k => (
                <Card key={k.label} className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between sm:justify-start gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: k.dot }} />
                    <p style={{ fontSize: "14px", color: "#6B7280", fontWeight: 500 }}>{k.label}</p>
                  </div>
                  <p className="tabular-nums" style={{ fontSize: "24px", fontWeight: 700, color: k.color, lineHeight: 1.2 }}>
                    {k.value}<span style={{ fontSize: "13px", fontWeight: 500, color: "#9CA3AF", marginLeft: 2 }}>{k.unit}</span>
                  </p>
                </Card>
              ))}
            </div>

            {/* Table */}
            <Card>
              <div className="px-5 py-3.5 flex items-center justify-between"
                style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA", borderRadius: "8px 8px 0 0" }}>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>本月打卡紀錄</h3>
                  <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: 1 }}>系統管理者 · 2026年3月</p>
                </div>
                <span className="tabular-nums px-2.5 py-1 rounded"
                  style={{ fontSize: "12px", fontWeight: 600, background: "#F3F4F6", color: "#374151" }}>
                  共 {allRecords.length} 筆
                </span>
              </div>

              {/* Table header */}
              <div className="grid px-5 py-2.5"
                style={{ gridTemplateColumns: "1fr 1fr 1.2fr 1.2fr 1fr", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA" }}>
                {["日期", "星期", "上班打卡", "下班打卡", "狀態"].map(h => (
                  <span key={h} style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em" }}>{h}</span>
                ))}
              </div>

              {allRecords.map((r, idx) => {
                const cfg = STATUS_CFG[r.status];
                const isToday = idx === 0;
                return (
                  <div key={r.date}
                    className="grid items-center px-5 py-3.5"
                    style={{
                      gridTemplateColumns: "1fr 1fr 1.2fr 1.2fr 1fr",
                      borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: isToday ? "#111827" : "transparent",
                      borderBottomWidth: idx < allRecords.length - 1 ? "1px" : 0, borderBottomStyle: "solid", borderBottomColor: "#F9FAFB",
                      background: isToday ? "#FAFAFA" : "transparent",
                    }}
                    onMouseEnter={e => { if (!isToday) (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
                    onMouseLeave={e => { if (!isToday) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: isToday ? 700 : 500, color: "#111827" }}>{r.date}</span>
                    <span style={{ fontSize: "14px", color: "#6B7280" }}>{r.weekday}</span>
                    <span className="tabular-nums" style={{ fontSize: "14px", fontWeight: 600, color: r.checkIn ? "#111827" : "#D1D5DB" }}>
                      {r.checkIn ?? "—"}
                    </span>
                    <span className="tabular-nums" style={{ fontSize: "14px", color: r.checkOut ? "#111827" : "#D1D5DB" }}>
                      {r.checkOut ?? (r.status === "today" ? "上班中…" : "—")}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
                      style={{ fontSize: "11px", fontWeight: 600, background: cfg.bg, color: cfg.color, width: "fit-content" }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </Card>
          </div>
        )}

        {/* ── Tab: 請假申請 ─────────────────────────────────────────────── */}
        {activeTab === "leave" && (
          <div className="space-y-4">

            {/* Approval Flow Visualization */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>請假審核流程</h3>
                  <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.08em" }}>WORKFLOW</span>
                </div>
                <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "11px", fontWeight: 600, background: "#F0FDF4", color: "#15803D" }}>
                  四步驟
                </span>
              </div>

              {/* Steps */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
                {FLOW_STEPS.map((s, i) => {
                  const StepIcon = s.Icon;
                  return (
                    <React.Fragment key={s.step}>
                      <div className="flex flex-col items-center gap-2 flex-shrink-0" style={{ minWidth: 90 }}>
                        <div className="relative w-11 h-11 rounded-full flex items-center justify-center"
                          style={{ background: "#111827", boxShadow: "0 1px 3px rgba(17,24,39,0.15), 0 0 0 4px #F9FAFB" }}>
                          <StepIcon className="w-5 h-5" style={{ color: "#FFF" }} />
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center tabular-nums"
                            style={{ background: "#FFF", color: "#111827", fontSize: "9px", fontWeight: 700, borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                            {s.step}
                          </span>
                        </div>
                        <div className="text-center">
                          <p style={{ fontSize: "12px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>{s.label}</p>
                          <p style={{ fontSize: "10px", color: "#9CA3AF", marginTop: 2, letterSpacing: "0.02em" }}>{s.sub}</p>
                        </div>
                      </div>
                      {i < FLOW_STEPS.length - 1 && (
                        <div className="flex-1 flex items-center justify-center" style={{ minWidth: 20, marginBottom: 28 }}>
                          <div className="w-full" style={{ height: 2, background: "repeating-linear-gradient(to right, #D1D5DB 0, #D1D5DB 4px, transparent 4px, transparent 8px)" }} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Hint */}
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg mt-4" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#9CA3AF" }} />
                <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>
                  申請送出後將通知部門主管，主管審核通過後再由 HR 確認排班與時數扣抵。預計處理時間 1–2 個工作天。
                </p>
              </div>
            </Card>

            {/* Quota + Apply Button */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "特休剩餘", value: 12, total: 14, unit: "天", color: "#1D4ED8", bg: "#EFF6FF" },
                { label: "病假",     value: 28, total: 30, unit: "天", color: "#DC2626", bg: "#FEF2F2" },
                { label: "事假",     value: 6,  total: 7,  unit: "天", color: "#374151", bg: "#F3F4F6" },
                { label: "本年累計", value: 4.5, total: null, unit: "天", color: "#15803D", bg: "#F0FDF4" },
              ].map(q => (
                <Card key={q.label} className="px-4 py-3.5">
                  <p style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500, marginBottom: 6 }}>{q.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <p className="tabular-nums" style={{ fontSize: "22px", fontWeight: 700, color: q.color, lineHeight: 1 }}>{q.value}</p>
                    {q.total !== null && (
                      <span className="tabular-nums" style={{ fontSize: "11px", color: "#9CA3AF" }}>/ {q.total} {q.unit}</span>
                    )}
                    {q.total === null && (
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{q.unit}</span>
                    )}
                  </div>
                  {q.total !== null && (
                    <div className="mt-2 rounded-full overflow-hidden" style={{ height: 4, background: "#F3F4F6" }}>
                      <div className="h-full rounded-full" style={{ width: `${(q.value / q.total) * 100}%`, background: q.color }} />
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Apply button (opens modal) */}
            <button onClick={() => setShowForm(true)}
              className="w-full py-3 rounded-lg transition-all duration-150 flex items-center justify-center gap-2"
              style={{ fontSize: "14px", fontWeight: 600, background: "#111827", color: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#111827", cursor: "pointer", boxShadow: "0 1px 2px rgba(17,24,39,0.15)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}
            >
              <Plus className="w-4 h-4" />
              新增請假申請
            </button>

            {/* Leave Records List */}
            <Card>
              <div className="px-5 py-3.5 flex items-center justify-between"
                style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA", borderRadius: "8px 8px 0 0" }}>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" style={{ color: "#6B7280" }} />
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>申請紀錄</h3>
                </div>
                <span className="tabular-nums px-2.5 py-1 rounded"
                  style={{ fontSize: "12px", fontWeight: 600, background: "#F3F4F6", color: "#374151" }}>
                  共 {leaves.length} 筆
                </span>
              </div>

              {leaves.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                    <CalendarDays className="w-5 h-5" style={{ color: "#9CA3AF" }} />
                  </div>
                  <p style={{ fontSize: "14px", color: "#9CA3AF" }}>尚無請假紀錄</p>
                </div>
              ) : (
                <div>
                  {leaves.map((l, idx) => {
                    const typeCfg   = LEAVE_TYPE_CFG[l.type];
                    const statusCfg = LEAVE_STATUS_CFG[l.status];
                    const isLast = idx === leaves.length - 1;
                    const canCancel = l.status === "pending" || l.status === "manager";
                    return (
                      <div key={l.id}
                        className="px-5 py-4"
                        style={{ borderBottomWidth: isLast ? 0 : "1px", borderBottomStyle: "solid", borderBottomColor: "#F9FAFB" }}>
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span className="px-2 py-0.5 rounded-md" style={{ fontSize: "11px", fontWeight: 600, background: typeCfg.bg, color: typeCfg.color }}>
                                {typeCfg.label}
                              </span>
                              <span className="tabular-nums" style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                                {l.startDate}{l.startDate !== l.endDate ? ` → ${l.endDate}` : ""}
                              </span>
                              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>· {l.days} 天</span>
                            </div>
                            <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.6 }}>{l.reason}</p>
                            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: 4 }}>送出時間：{l.submittedAt}</p>
                            {l.approverNote && (
                              <p className="mt-2 px-2.5 py-1.5 rounded-md" style={{ fontSize: "12px", color: "#374151", background: "#FAFAFA", borderLeftWidth: "2px", borderLeftStyle: "solid", borderLeftColor: statusCfg.dot }}>
                                <span style={{ fontWeight: 600, color: "#6B7280" }}>審核註記：</span>{l.approverNote}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md"
                              style={{ fontSize: "11px", fontWeight: 600, background: statusCfg.bg, color: statusCfg.color }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.dot }} />
                              {statusCfg.label}
                            </span>
                            {canCancel && (
                              <button onClick={() => cancelLeave(l.id)}
                                className="px-2.5 py-1 rounded-md"
                                style={{ fontSize: "11px", fontWeight: 500, color: "#DC2626", background: "#FEF2F2", borderWidth: "1px", borderStyle: "solid", borderColor: "#FECACA", cursor: "pointer", fontFamily: "inherit" }}>
                                撤回申請
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Mini progress for active applications */}
                        {l.status !== "approved" && l.status !== "rejected" && (
                          <div className="flex items-center gap-1 mt-3">
                            {[1, 2, 3, 4].map(s => (
                              <div key={s} className="flex-1 rounded-full" style={{ height: 3, background: s <= statusCfg.step ? statusCfg.dot : "#F3F4F6" }} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

      </div>

      {/* ── Leave Application Modal ──────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center max-md:items-end p-4 max-md:p-0"
          onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setCcDropdownOpen(false); } }}
          style={{ background: "rgba(17,24,39,0.35)", backdropFilter: "blur(2px)" }}>
          <div className="max-md:w-full max-md:rounded-b-none max-md:rounded-t-2xl"
            style={{
              width: 560, maxWidth: "100%", maxHeight: "90vh",
              background: "#FFF", borderRadius: 16, overflow: "hidden",
              boxShadow: "0 24px 80px rgba(17,24,39,0.2), 0 0 0 1px rgba(17,24,39,0.05)",
              display: "flex", flexDirection: "column",
            }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#111827" }}>
                  <CalendarDays className="w-4 h-4" style={{ color: "#FFF" }} />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>新增請假申請</p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.3, fontFamily: "'Noto Serif JP', serif", letterSpacing: "0.08em" }}>LEAVE REQUEST</p>
                </div>
              </div>
              <button onClick={() => { setShowForm(false); setCcDropdownOpen(false); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ color: "#9CA3AF", background: "transparent", borderWidth: 0, cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; (e.currentTarget as HTMLElement).style.color = "#374151"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#9CA3AF"; }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="overflow-y-auto px-5 py-5" style={{ flex: 1 }}>
              {/* Leave type chips */}
              <div className="mb-4">
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", marginBottom: 8 }}>假別</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(LEAVE_TYPE_CFG) as LeaveType[]).map(t => {
                    const cfg = LEAVE_TYPE_CFG[t];
                    const active = leaveForm.type === t;
                    return (
                      <button key={t} onClick={() => setLeaveForm(p => ({ ...p, type: t }))}
                        className="px-3 py-1.5 rounded-full transition-all"
                        style={{
                          fontSize: "12px", fontWeight: 600,
                          background: active ? "#111827" : cfg.bg,
                          color: active ? "#FFF" : cfg.color,
                          borderWidth: "1px", borderStyle: "solid",
                          borderColor: active ? "#111827" : "transparent",
                          cursor: "pointer",
                        }}>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>開始日期</p>
                  <input type="date" value={leaveForm.startDate}
                    onChange={e => setLeaveForm(p => ({ ...p, startDate: e.target.value, endDate: p.endDate && p.endDate < e.target.value ? e.target.value : p.endDate }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", background: "#F9FAFB", fontSize: "13px", color: "#111827", outline: "none", fontFamily: "inherit" }} />
                </div>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>結束日期</p>
                  <input type="date" value={leaveForm.endDate} min={leaveForm.startDate || undefined}
                    onChange={e => setLeaveForm(p => ({ ...p, endDate: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", background: "#F9FAFB", fontSize: "13px", color: "#111827", outline: "none", fontFamily: "inherit" }} />
                </div>
              </div>

              {/* Days display + half-day toggle */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg mb-4"
                style={{ background: "#FAFBFC", borderWidth: "1px", borderStyle: "solid", borderColor: "#F3F4F6" }}>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>請假天數</span>
                  <span className="tabular-nums" style={{ fontSize: "18px", fontWeight: 700, color: computedDays > 0 ? "#111827" : "#D1D5DB", letterSpacing: "0.02em" }}>
                    {computedDays > 0 ? computedDays : "—"}
                  </span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>天</span>
                </div>
                {/* Half-day toggle (only when single day) */}
                {calcDaysBetween(leaveForm.startDate, leaveForm.endDate) === 1 && (
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={leaveForm.halfDay}
                      onChange={e => setLeaveForm(p => ({ ...p, halfDay: e.target.checked }))}
                      style={{ accentColor: "#111827", cursor: "pointer" }} />
                    <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>半天假</span>
                  </label>
                )}
              </div>

              {/* CC supervisor dropdown */}
              <div className="mb-4 relative">
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>副本通知（CC）直屬主管</p>
                <button onClick={() => setCcDropdownOpen(o => !o)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors"
                  style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: ccDropdownOpen ? "#111827" : "#E5E7EB", cursor: "pointer", fontFamily: "inherit" }}>
                  {(() => {
                    const sup = SUPERVISORS.find(s => s.id === leaveForm.ccId);
                    return sup ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#111827", color: "#FFF", fontSize: "11px", fontWeight: 700 }}>
                          {sup.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>{sup.name}</p>
                          <p style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.3 }}>{sup.title}</p>
                        </div>
                      </div>
                    ) : <span style={{ fontSize: "13px", color: "#9CA3AF" }}>選擇主管</span>;
                  })()}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: ccDropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.15s" }}>
                    <path d="M6 9l6 6 6-6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {ccDropdownOpen && (
                  <div className="absolute left-0 right-0 z-10 mt-1 overflow-hidden"
                    style={{ background: "#FFF", borderRadius: 10, boxShadow: "0 8px 32px rgba(17,24,39,0.14), 0 0 0 1px rgba(17,24,39,0.06)", maxHeight: 240, overflowY: "auto" }}>
                    {SUPERVISORS.map(sup => {
                      const active = leaveForm.ccId === sup.id;
                      return (
                        <button key={sup.id}
                          onClick={() => { setLeaveForm(p => ({ ...p, ccId: sup.id })); setCcDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                          style={{ borderWidth: 0, background: active ? "#F9FAFB" : "transparent", cursor: "pointer", fontFamily: "inherit" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = active ? "#F9FAFB" : "transparent"; }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: active ? "#111827" : "#F3F4F6", color: active ? "#FFF" : "#6B7280", fontSize: "11px", fontWeight: 700 }}>
                            {sup.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>{sup.name}</p>
                            <p style={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.3 }}>{sup.title} · {sup.email}</p>
                          </div>
                          {active && <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#111827" }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reason */}
              <div>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>請假事由</p>
                <textarea value={leaveForm.reason}
                  onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))}
                  placeholder="請簡述請假原因…"
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", background: "#F9FAFB", fontSize: "13px", color: "#111827", outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.6 }} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 flex-shrink-0"
              style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB", background: "#FAFBFC" }}>
              <button onClick={() => { setShowForm(false); setCcDropdownOpen(false); }}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ fontSize: "13px", fontWeight: 500, color: "#6B7280", background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", cursor: "pointer", fontFamily: "inherit" }}>
                取消
              </button>
              <button onClick={submitLeave}
                className="px-5 py-2 rounded-lg flex items-center gap-1.5"
                style={{ fontSize: "13px", fontWeight: 600, color: "#FFF", background: "#111827", borderWidth: "1px", borderStyle: "solid", borderColor: "#111827", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}>
                <Check className="w-3.5 h-3.5" />
                送出申請
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}