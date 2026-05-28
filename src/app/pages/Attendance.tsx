import React, { useState, useMemo } from "react";
import {
  Clock, Search, AlertCircle, CheckCircle,
  Plus, X, Check, AlertTriangle, Users,
  LogIn, LogOut, ChevronDown, FileText, Activity,
  UserCheck, ClipboardList, CalendarDays,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine,
} from "recharts";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { DraggableScroll } from "../components/DraggableScroll";
import { StyledSelect } from "../components/StyledSelect";
import { DatePicker } from "../components/DatePicker";

const PAGE_SIZE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────
type AttendStatus = "normal" | "late" | "early" | "absent" | "leave";
type LeaveStatus  = "pending" | "approved" | "rejected";
type LeaveType    = "特休" | "病假" | "事假" | "婚假" | "喪假" | "公假" | "補休";

interface AttendRecord {
  id: number; name: string; dept: string; role: string;
  checkIn: string | null; checkOut: string | null;
  status: AttendStatus; hours: number | null;
}
interface LeaveRequest {
  id: number; name: string; dept: string; type: LeaveType;
  start: string; end: string; days: number; reason: string;
  status: LeaveStatus; appliedAt: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const AS: Record<AttendStatus, { label: string; bg: string; color: string; dot: string; bar: string }> = {
  normal: { label: "正常",  bg: "#F0FDF4", color: "#15803D", dot: "#16A34A", bar: "#16A34A" },
  late:   { label: "遲到",  bg: "#FEF9C3", color: "#A16207", dot: "#CA8A04", bar: "#CA8A04" },
  early:  { label: "早退",  bg: "#FFF7ED", color: "#C2410C", dot: "#EA580C", bar: "#EA580C" },
  absent: { label: "缺勤",  bg: "#FEF2F2", color: "#DC2626", dot: "#DC2626", bar: "#DC2626" },
  leave:  { label: "請假",  bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", bar: "#3B82F6" },
};
const LS: Record<LeaveStatus, { label: string; bg: string; color: string; dot: string }> = {
  pending:  { label: "待審核", bg: "#FEF9C3", color: "#A16207", dot: "#CA8A04" },
  approved: { label: "已批准", bg: "#F0FDF4", color: "#15803D", dot: "#16A34A" },
  rejected: { label: "已拒絕", bg: "#FEF2F2", color: "#DC2626", dot: "#DC2626" },
};
const DEPT_BG: Record<string, string> = {
  技術部: "#DBEAFE", 行銷部: "#EDE9FE", 財務部: "#D1FAE5",
  人資部: "#FEF3C7", 營運部: "#FCE7F3", 業務部: "#FFE4E6",
};
const DEPT_COLOR: Record<string, string> = {
  技術部: "#1D4ED8", 行銷部: "#7C3AED", 財務部: "#065F46",
  人資部: "#92400E", 營運部: "#9D174D", 業務部: "#991B1B",
};
const LEAVE_TYPES: LeaveType[] = ["特休", "病假", "事假", "婚假", "喪假", "公假", "補休"];
const DEPTS = ["技術部", "行銷部", "財務部", "人資部", "營運部", "業務部"];

// ─── Data ─────────────────────────────────────────────────────────────────────
const initialAttendance: AttendRecord[] = [
  { id: 1,  name: "張三",   dept: "技術部", role: "前端工程師",   checkIn: "08:55", checkOut: "18:10", status: "normal", hours: 9.25 },
  { id: 2,  name: "李四",   dept: "行銷部", role: "行銷專員",     checkIn: "09:18", checkOut: null,    status: "late",   hours: null },
  { id: 3,  name: "王五",   dept: "財務部", role: "財務分析師",   checkIn: "08:50", checkOut: "18:05", status: "normal", hours: 9.25 },
  { id: 4,  name: "趙六",   dept: "人資部", role: "人資主任",     checkIn: "08:58", checkOut: "18:00", status: "normal", hours: 9.03 },
  { id: 5,  name: "錢七",   dept: "技術部", role: "後端工程師",   checkIn: null,    checkOut: null,    status: "absent", hours: null },
  { id: 6,  name: "孫八",   dept: "營運部", role: "營運主管",     checkIn: "09:00", checkOut: "17:45", status: "early",  hours: 8.75 },
  { id: 7,  name: "周九",   dept: "技術部", role: "DevOps工程師", checkIn: null,    checkOut: null,    status: "leave",  hours: null },
  { id: 8,  name: "吳十",   dept: "行銷部", role: "社群經理",     checkIn: "08:45", checkOut: "18:20", status: "normal", hours: 9.58 },
  { id: 9,  name: "鄭十一", dept: "財務部", role: "會計師",       checkIn: "09:05", checkOut: "18:05", status: "normal", hours: 9.00 },
  { id: 10, name: "馮十二", dept: "業務部", role: "業務經理",     checkIn: "09:22", checkOut: null,    status: "late",   hours: null },
  { id: 11, name: "陳十三", dept: "技術部", role: "UI 設計師",    checkIn: "08:52", checkOut: "18:10", status: "normal", hours: 9.30 },
  { id: 12, name: "楊十四", dept: "營運部", role: "客服主任",     checkIn: "08:59", checkOut: "17:58", status: "normal", hours: 8.98 },
];

const initialLeaveRequests: LeaveRequest[] = [
  { id: 1,  name: "周九",   dept: "技術部", type: "病假", start: "2026-03-10", end: "2026-03-11", days: 2, reason: "感冒發燒需休養",   status: "approved", appliedAt: "2026-03-09" },
  { id: 2,  name: "吳十",   dept: "行銷部", type: "特休", start: "2026-03-18", end: "2026-03-20", days: 3, reason: "家庭旅遊",         status: "approved", appliedAt: "2026-03-05" },
  { id: 3,  name: "鄭十一", dept: "財務部", type: "事假", start: "2026-03-12", end: "2026-03-12", days: 1, reason: "個人事務處理",     status: "pending",  appliedAt: "2026-03-09" },
  { id: 4,  name: "李四",   dept: "行銷部", type: "補休", start: "2026-03-16", end: "2026-03-17", days: 2, reason: "上月加班補休",     status: "pending",  appliedAt: "2026-03-10" },
  { id: 5,  name: "錢七",   dept: "技術部", type: "病假", start: "2026-03-10", end: "2026-03-13", days: 4, reason: "腸胃炎就醫",       status: "approved", appliedAt: "2026-03-08" },
  { id: 6,  name: "馮十二", dept: "業務部", type: "公假", start: "2026-03-14", end: "2026-03-14", days: 1, reason: "參加政府研習課程", status: "pending",  appliedAt: "2026-03-10" },
  { id: 7,  name: "張三",   dept: "技術部", type: "特休", start: "2026-03-25", end: "2026-03-27", days: 3, reason: "年假",             status: "pending",  appliedAt: "2026-03-08" },
  { id: 8,  name: "趙六",   dept: "人資部", type: "事假", start: "2026-03-06", end: "2026-03-06", days: 1, reason: "辦理私人文件",     status: "rejected", appliedAt: "2026-03-05" },
  { id: 9,  name: "孫八",   dept: "營運部", type: "婚假", start: "2026-04-01", end: "2026-04-08", days: 8, reason: "結婚典禮",         status: "approved", appliedAt: "2026-03-01" },
  { id: 10, name: "陳十三", dept: "技術部", type: "補休", start: "2026-03-20", end: "2026-03-20", days: 1, reason: "三月加班補休",     status: "pending",  appliedAt: "2026-03-10" },
];

const weeklyHoursData = [
  { day: "週一 3/4",  avg: 9.1 }, { day: "週二 3/5",  avg: 8.8 },
  { day: "週三 3/6",  avg: 9.3 }, { day: "週四 3/7",  avg: 8.6 },
  { day: "週五 3/10", avg: 9.0 },
];
const monthlyTrendData = [
  { date: "3/2", rate: 95 }, { date: "3/3", rate: 92 }, { date: "3/4", rate: 97 },
  { date: "3/5", rate: 90 }, { date: "3/6", rate: 93 }, { date: "3/9", rate: 96 },
  { date: "3/10", rate: 83 },
];

// March 1, 2026 = Sunday → offset 0
const MARCH_STATUS: Record<number, "normal" | "issue" | "today" | "future" | "weekend"> = {
  1: "weekend", 2: "normal", 3: "normal", 4: "normal", 5: "issue", 6: "normal",
  7: "weekend", 8: "weekend", 9: "normal", 10: "today",
};
for (let d = 11; d <= 31; d++) MARCH_STATUS[d] = "future";

// Calendar events: company activities & meetings
const CALENDAR_EVENTS: Record<number, { label: string; color: string; time?: string }[]> = {
  2:  [{ label: "部門週會", color: "#3B82F6", time: "10:00" }],
  3:  [{ label: "客戶拜訪", color: "#7C3AED" }],
  5:  [{ label: "Q1 財報", color: "#DC2626", time: "14:00" }],
  6:  [{ label: "產品發布", color: "#16A34A", time: "15:00" }],
  9:  [{ label: "全員大會", color: "#3B82F6", time: "14:00" }, { label: "部門週會", color: "#6B7280", time: "10:00" }],
  10: [{ label: "站會", color: "#3B82F6", time: "09:30" }],
  12: [{ label: "教育訓練", color: "#CA8A04", time: "13:30" }],
  16: [{ label: "月度考核", color: "#DC2626" }, { label: "週會", color: "#6B7280", time: "10:00" }],
  18: [{ label: "公司春酒", color: "#EC4899", time: "18:00" }],
  20: [{ label: "專案檢討", color: "#7C3AED", time: "11:00" }],
  23: [{ label: "技術分享", color: "#16A34A", time: "15:30" }, { label: "週會", color: "#6B7280", time: "10:00" }],
  25: [{ label: "季度規劃", color: "#3B82F6", time: "09:00" }],
  27: [{ label: "部門聚餐", color: "#EC4899", time: "18:30" }],
  30: [{ label: "月底結算", color: "#DC2626" }, { label: "週會", color: "#6B7280", time: "10:00" }],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtHours = (h: number | null) =>
  h == null ? "—" : `${Math.floor(h)}h ${Math.round((h % 1) * 60).toString().padStart(2, "0")}m`;

const emptyLeaveForm = () => ({
  name: "", dept: "技術部" as string, type: "特休" as LeaveType,
  start: "2026-03-", end: "2026-03-", days: 1, reason: "",
});

// ─── Sub-components ───────────────────────────────────────────────────────────
const Card = ({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={className} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", ...style }}>
    {children}
  </div>
);

const Av = ({ name, dept, size = 34 }: { name: string; dept?: string; size?: number }) => (
  <div className="rounded-full flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, background: dept ? DEPT_BG[dept] || "#F3F4F6" : "#F3F4F6" }}>
    <span style={{ fontSize: size * 0.38, fontWeight: 700, color: dept ? DEPT_COLOR[dept] || "#374151" : "#374151" }}>
      {name.charAt(0)}
    </span>
  </div>
);

const SBadge = ({ s }: { s: AttendStatus }) => {
  const c = AS[s];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
      style={{ fontSize: "13px", fontWeight: 600, background: c.bg, color: c.color, whiteSpace: "nowrap" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />{c.label}
    </span>
  );
};

const LBadge = ({ s }: { s: LeaveStatus }) => {
  const c = LS[s];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
      style={{ fontSize: "13px", fontWeight: 600, background: c.bg, color: c.color, whiteSpace: "nowrap" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />{c.label}
    </span>
  );
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111827", borderRadius: "8px", padding: "10px 14px", color: "#FFF", fontSize: "13px", lineHeight: 1.8, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey}><span style={{ color: p.fill || p.stroke, marginRight: 6 }}>●</span>{p.name}：{p.value}{p.name === "出勤率" ? "%" : "h"}</p>
      ))}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Attendance() {
  const { user, permissions } = useAuth();
  const canViewAll = permissions.canViewAllAttendance;
  const [attendance]                       = useState<AttendRecord[]>(initialAttendance);
  const [leaveRequests, setLeaveRequests]  = useState<LeaveRequest[]>(initialLeaveRequests);
  const [activeTab, setActiveTab]          = useState<"overview" | "today" | "leave" | "calendar">("overview");

  const [searchTerm,        setSearchTerm]        = useState("");
  const [filterStatus,      setFilterStatus]      = useState<"all" | AttendStatus>("all");
  const [filterDept,        setFilterDept]        = useState("all");
  const [leaveSearch,       setLeaveSearch]       = useState("");
  const [leaveFilterStatus, setLeaveFilterStatus] = useState<"all" | LeaveStatus>("all");
  const [todayPage,         setTodayPage]         = useState(1);
  const [leavePage,         setLeavePage]         = useState(1);

  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [leaveForm,   setLeaveForm]   = useState(emptyLeaveForm());
  const [leaveErrors, setLeaveErrors] = useState<Record<string, string>>({});
  const [toast,       setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const present = attendance.filter(r => ["normal", "late", "early"].includes(r.status)).length;
    return {
      total:   attendance.length,
      normal:  attendance.filter(r => r.status === "normal").length,
      late:    attendance.filter(r => r.status === "late").length,
      early:   attendance.filter(r => r.status === "early").length,
      absent:  attendance.filter(r => r.status === "absent").length,
      leave:   attendance.filter(r => r.status === "leave").length,
      pending: leaveRequests.filter(l => l.status === "pending").length,
      rate:    Math.round(present / attendance.length * 100),
    };
  }, [attendance, leaveRequests]);

  const filteredAttendance = useMemo(() =>
    attendance.filter(r => {
      const s = searchTerm;
      return (r.name.includes(s) || r.dept.includes(s) || r.role.includes(s))
        && (filterStatus === "all" || r.status === filterStatus)
        && (filterDept === "all" || r.dept === filterDept);
    }), [attendance, searchTerm, filterStatus, filterDept]);

  const filteredLeave = useMemo(() =>
    leaveRequests.filter(l => {
      return (l.name.includes(leaveSearch) || l.dept.includes(leaveSearch) || l.reason.includes(leaveSearch))
        && (leaveFilterStatus === "all" || l.status === leaveFilterStatus);
    }).sort((a, b) => {
      const o: Record<LeaveStatus, number> = { pending: 0, approved: 1, rejected: 2 };
      return o[a.status] - o[b.status];
    }), [leaveRequests, leaveSearch, leaveFilterStatus]);

  const pagedAttendance = filteredAttendance.slice((todayPage - 1) * PAGE_SIZE, todayPage * PAGE_SIZE);
  const pagedLeave      = filteredLeave.slice((leavePage - 1) * PAGE_SIZE, leavePage * PAGE_SIZE);

  const deptStats = useMemo(() =>
    DEPTS.map(dept => {
      const m = attendance.filter(r => r.dept === dept);
      if (!m.length) return null;
      const ok     = m.filter(r => ["normal", "early"].includes(r.status)).length;
      const late   = m.filter(r => r.status === "late").length;
      const absent = m.filter(r => r.status === "absent").length;
      const leave  = m.filter(r => r.status === "leave").length;
      return { dept, total: m.length, ok, late, absent, leave, rate: Math.round((ok + late) / m.length * 100) };
    }).filter(Boolean) as { dept: string; total: number; ok: number; late: number; absent: number; leave: number; rate: number }[],
    [attendance]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2800); };

  const handleLeave = (id: number, action: "approved" | "rejected") => {
    setLeaveRequests(p => p.map(l => l.id === id ? { ...l, status: action } : l));
    showToast(action === "approved" ? "已批准請假申請" : "已拒絕請假申請", action === "approved");
  };

  const validateLeave = () => {
    const e: Record<string, string> = {};
    if (!leaveForm.name.trim()) e.name = "請輸入姓名";
    if (!leaveForm.start.match(/^\d{4}-\d{2}-\d{2}$/)) e.start = "請輸入正確日期格式";
    if (!leaveForm.end.match(/^\d{4}-\d{2}-\d{2}$/))   e.end   = "請輸入正確日期格式";
    if (!leaveForm.reason.trim()) e.reason = "請填寫請假事由";
    setLeaveErrors(e);
    return !Object.keys(e).length;
  };

  const submitLeave = () => {
    if (!validateLeave()) return;
    const newReq: LeaveRequest = {
      id: Math.max(...leaveRequests.map(l => l.id), 0) + 1,
      ...leaveForm, status: "pending", appliedAt: "2026-03-11",
    };
    setLeaveRequests(p => [newReq, ...p]);
    setIsLeaveOpen(false);
    setLeaveForm(emptyLeaveForm());
    showToast("請假申請已送出，等待審核");
    setActiveTab("leave");
  };

  const setLF = <K extends keyof ReturnType<typeof emptyLeaveForm>>(k: K, v: any) => {
    setLeaveForm(p => ({ ...p, [k]: v }));
    setLeaveErrors(e => { const { [k]: _, ...r } = e; return r; });
  };

  // ── Calendar ────────────────────────────────────────────────────────────
  const calendarCells: (number | null)[] = [
    ...Array(0).fill(null),
    ...Array.from({ length: 31 }, (_, i) => i + 1),
  ];
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const dayCfg = (day: number | null) => {
    if (!day) return null;
    const s = MARCH_STATUS[day] ?? "weekend";
    if (s === "today")  return { bg: "#111827", text: "#FFF",     borderW: "0px", borderC: "transparent" };
    if (s === "normal") return { bg: "#F0FDF4", text: "#15803D",  borderW: "1px", borderC: "#BBF7D0" };
    if (s === "issue")  return { bg: "#FEF9C3", text: "#A16207",  borderW: "1px", borderC: "#FDE68A" };
    if (s === "future") return { bg: "transparent", text: "#9CA3AF", borderW: "0px", borderC: "transparent" };
    return { bg: "transparent", text: "#D1D5DB", borderW: "0px", borderC: "transparent" }; // weekend
  };

  // Input helpers
  const iStyle = (err?: string): React.CSSProperties => ({
    width: "100%", padding: "8px 12px", fontSize: "14px",
    background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid",
    borderColor: err ? "#DC2626" : "#E5E7EB", borderRadius: "6px",
    color: "#111827", outline: "none", fontFamily: "inherit",
  });
  const lStyle: React.CSSProperties = { display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: 5 };

  const TABS = [
    { key: "overview",  label: "考勤總覽",   icon: Activity,      count: 0 },
    { key: "today",     label: "今日出勤",   icon: UserCheck,     count: attendance.length },
    { key: "leave",     label: "請假管理",   icon: ClipboardList, count: stats.pending },
    { key: "calendar",  label: "月度行事曆", icon: CalendarDays,  count: 0 },
  ] as const;

  const pendingLeaves = leaveRequests.filter(l => l.status === "pending");

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col gap-5">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: toast.ok ? "#111827" : "#DC2626", color: "#FFF", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", fontSize: "14px", fontWeight: 500 }}>
          {toast.ok ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-shrink-0 max-md:flex-col max-md:items-stretch max-md:gap-3">
        <div>
          <h1 style={{ color: "#111827" }}>出缺勤管理</h1>
          <p style={{ fontSize: "15px", color: "#9CA3AF", marginTop: 2 }}>
            {canViewAll ? "管理員工出勤記錄、打卡狀態與請假申請" : `${user?.name ?? ""} 的個人出勤記錄與請假申請`}
          </p>
        </div>
        <div className="flex gap-2 max-md:w-full">
          <button
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:flex-1"
            style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 500 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}
            onClick={() => setIsLeaveOpen(true)}>
            <Plus className="w-3.5 h-3.5" />申請請假
          </button>
        </div>
      </div>

      {!canViewAll && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg flex-shrink-0"
          style={{ background: "#EFF6FF", borderWidth: "1px", borderStyle: "solid", borderColor: "#BFDBFE" }}>
          <Users className="w-4 h-4 flex-shrink-0" style={{ color: "#2563EB" }} />
          <span style={{ fontSize: "14px", color: "#1E40AF", fontWeight: 500 }}>
            您目前僅能查看個人出缺勤紀錄，全公司資料僅限人資主管與系統管理者檢視
          </span>
        </div>
      )}

      {/* ── Tab Bar ──────────────────────────────────────────────────── */}
      <DraggableScroll className="flex-shrink-0 p-1 rounded-xl" style={{ background: "#F3F4F6", maxWidth: "100%" }} innerClassName="flex items-center gap-1"
        mobileDropdown={{
          options: TABS.map(t => ({ key: t.key, label: t.label + (t.count > 0 ? `（${t.count}）` : "") })),
          activeKey: activeTab,
          onSelect: (k) => setActiveTab(k as any),
        }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button key={t.key}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
              style={{
                fontSize: "13px", fontWeight: active ? 600 : 500,
                background: active ? "#111827" : "transparent",
                color: active ? "#FFF" : "#6B7280",
                boxShadow: active ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
              }}
              onClick={() => setActiveTab(t.key as any)}>
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.label.slice(0, 2)}</span>
              {t.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full tabular-nums"
                  style={{ fontSize: "11px", fontWeight: 700, background: active ? "rgba(255,255,255,0.2)" : "#E5E7EB", color: active ? "#FFF" : "#374151", lineHeight: 1 }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </DraggableScroll>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* ══ 考勤總覽 ══════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-4">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                { label: "總人數",   value: stats.total,  unit: "人", icon: Users,        c: "#374151", bg: "#F9FAFB" },
                { label: "正常出勤", value: stats.normal, unit: "人", icon: CheckCircle,  c: "#16A34A", bg: "#F0FDF4" },
                { label: "遲到",     value: stats.late,   unit: "人", icon: Clock,        c: "#CA8A04", bg: "#FEF9C3" },
                { label: "缺勤",     value: stats.absent, unit: "人", icon: AlertCircle,  c: "#DC2626", bg: "#FEF2F2" },
                { label: "請假中",   value: stats.leave,  unit: "人", icon: FileText,     c: "#3B82F6", bg: "#EFF6FF" },
                { label: "今日出勤率", value: stats.rate, unit: "%",  icon: Activity,     c: "#7C3AED", bg: "#F5F3FF" },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <Card key={item.label} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.04em" }}>
                        {item.label}
                      </p>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: item.c }} />
                      </div>
                    </div>
                    <p className="tabular-nums" style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                      {item.value}
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#9CA3AF", marginLeft: 2 }}>{item.unit}</span>
                    </p>
                  </Card>
                );
              })}
            </div>

            {/* Middle Row — 二欄 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Weekly Hours */}
              <Card className="p-5 max-md:p-4 flex flex-col">
                <div className="mb-4">
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>本週平均工時</h3>
                  <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: 2 }}>本週各工作日全員平均在班時數</p>
                </div>
                <ResponsiveContainer width="100%" height={195} className="mt-auto">
                  <BarChart data={weeklyHoursData} barCategoryGap="25%">
                    <CartesianGrid key="wk-grid" strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis key="wk-x" dataKey="day" stroke="#9CA3AF" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis key="wk-y" domain={[6, 10]} stroke="#9CA3AF" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={42} tickFormatter={v => `${v}h`} />
                    <Tooltip key="wk-tip" content={<ChartTooltip />} cursor={{ fill: "#F9FAFB" }} />
                    <ReferenceLine key="wk-ref" y={8} stroke="#E5E7EB" strokeDasharray="4 4" label={{ value: "標準 8h", position: "insideTopRight", fontSize: 11, fill: "#9CA3AF" }} />
                    <Bar key="wk-bar" dataKey="avg" name="平均工時" fill="#111827" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Dept Attendance Breakdown */}
              <Card className="p-5">
                <div className="mb-4">
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>部門出勤分布</h3>
                  <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: 2 }}>各部門今日出勤狀態分布</p>
                </div>
                <div className="space-y-3">
                  {deptStats.map(d => (
                    <div key={d.dept}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: DEPT_COLOR[d.dept] || "#9CA3AF" }} />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{d.dept}</span>
                        </span>
                        <span className="tabular-nums" style={{ fontSize: "13px", color: "#6B7280" }}>
                          {d.ok + d.late}/{d.total}人
                        </span>
                      </div>
                      {/* Stacked bar */}
                      <div className="flex h-2 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                        {d.ok     > 0 && <div style={{ width: `${d.ok / d.total * 100}%`, background: "#16A34A" }} />}
                        {d.late   > 0 && <div style={{ width: `${d.late / d.total * 100}%`, background: "#CA8A04" }} />}
                        {d.absent > 0 && <div style={{ width: `${d.absent / d.total * 100}%`, background: "#DC2626" }} />}
                        {d.leave  > 0 && <div style={{ width: `${d.leave / d.total * 100}%`, background: "#3B82F6" }} />}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-3 flex-wrap mt-4 pt-3" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                  {[["#16A34A", "正常"], ["#CA8A04", "遲到"], ["#DC2626", "缺勤"], ["#3B82F6", "請假"]].map(([c, l]) => (
                    <span key={l} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{l}</span>
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Monthly Trend */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>本月出勤率趨勢</h3>
                  <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: 2 }}>3月各工作日全員出勤率</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums px-3 py-1 rounded"
                    style={{ fontSize: "14px", fontWeight: 700, background: "#F0FDF4", color: "#15803D" }}>
                    月均值 92%
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid key="mt-grid" strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis key="mt-x" dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis key="mt-y" domain={[75, 100]} stroke="#9CA3AF" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip key="mt-tip" content={<ChartTooltip />} />
                  <ReferenceLine key="mt-ref" y={90} stroke="#E5E7EB" strokeDasharray="4 4" label={{ value: "目標 90%", position: "insideTopRight", fontSize: 11, fill: "#9CA3AF" }} />
                  <Line key="mt-line" dataKey="rate" name="出勤率" stroke="#111827" strokeWidth={2} dot={{ r: 3.5, fill: "#111827", strokeWidth: 0 }} activeDot={{ r: 5.5 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

          </div>
        )}

        {/* ══ 今日出勤 ══════════════════════════════════════════════════ */}
        {activeTab === "today" && (
          <Card>
            {/* Filter bar */}
            <div className="flex flex-wrap gap-3 p-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
              <div className="relative flex-1" style={{ minWidth: 140 }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                <input type="text" placeholder="搜尋姓名、部門或職稱…"
                  value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setTodayPage(1); }}
                  className="w-full pl-9 pr-3 py-2 rounded outline-none"
                  style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#111827", fontFamily: "inherit" }} />
              </div>
              <div className="flex gap-2 flex-wrap max-md:w-full max-md:flex-col">
                <StyledSelect
                  value={filterStatus}
                  onChange={v => { setFilterStatus(v as any); setTodayPage(1); }}
                  allLabel="全部狀態"
                  options={Object.entries(AS).map(([k, v]) => ({ key: k, label: v.label }))}
                  className="max-md:w-full"
                />
                <StyledSelect
                  value={filterDept}
                  onChange={v => { setFilterDept(v); setTodayPage(1); }}
                  allLabel="全部部門"
                  options={DEPTS.map(d => ({ key: d, label: d }))}
                  className="max-md:w-full"
                />
                {(searchTerm || filterStatus !== "all" || filterDept !== "all") && (
                  <button className="px-3 py-2 rounded flex items-center gap-1.5"
                    style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#9CA3AF" }}
                    onClick={() => { setSearchTerm(""); setFilterStatus("all"); setFilterDept("all"); }}>
                    <X className="w-3.5 h-3.5" />清除篩選
                  </button>
                )}
              </div>
              <div style={{ marginLeft: "auto" }}>
                <span style={{ fontSize: "13px", color: "#9CA3AF" }}>共 {filteredAttendance.length} 筆</span>
              </div>
            </div>

            {/* Table */}
            <div>
              {/* Header */}
              <div className="hidden md:grid px-5 py-2.5" style={{
                gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr",
                borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA",
              }}>
                {["姓名 / 部門", "打卡上班", "打卡下班", "工作時數", "狀態"].map(h => (
                  <span key={h} style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em" }}>{h}</span>
                ))}
              </div>

              {pagedAttendance.length === 0
                ? <div className="py-12 text-center" style={{ color: "#9CA3AF", fontSize: "14px" }}>找不到符合條件的記錄</div>
                : pagedAttendance.map((r, idx) => {
                    const border = AS[r.status].bar;
                    return (
                      <div key={r.id}>
                        {/* Desktop row */}
                        <div
                          className="hidden md:grid items-center px-5 py-3.5 group"
                          style={{
                            gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr",
                            borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: border,
                            borderBottomWidth: idx < pagedAttendance.length - 1 ? "1px" : "0px", borderBottomStyle: "solid", borderBottomColor: idx < pagedAttendance.length - 1 ? "#F9FAFB" : "transparent",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          {/* Name + dept */}
                          <div className="flex items-center gap-3">
                            <Av name={r.name} dept={r.dept} size={34} />
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{r.name}</p>
                              <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: 1 }}>{r.dept} · {r.role}</p>
                            </div>
                          </div>
                          {/* Check-in */}
                          <span className="tabular-nums"
                            style={{ fontSize: "13px", fontWeight: 600, color: r.checkIn ? (r.status === "late" ? "#CA8A04" : "#111827") : "#D1D5DB" }}>
                            {r.checkIn ?? "—"}
                          </span>
                          {/* Check-out */}
                          <span className="tabular-nums"
                            style={{ fontSize: "13px", color: r.checkOut ? "#111827" : "#D1D5DB" }}>
                            {r.checkOut ?? "—"}
                          </span>
                          {/* Hours */}
                          <div>
                            <span className="tabular-nums" style={{ fontSize: "13px", fontWeight: 600, color: r.hours ? "#111827" : "#D1D5DB" }}>
                              {fmtHours(r.hours)}
                            </span>
                            {r.hours && (
                              <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: "#F3F4F6", maxWidth: 80 }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.min(r.hours / 10 * 100, 100)}%`, background: border }} />
                              </div>
                            )}
                          </div>
                          {/* Status */}
                          <SBadge s={r.status} />
                        </div>

                        {/* Mobile card */}
                        <div className="md:hidden px-4 py-3"
                          style={{ borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: border, borderBottomWidth: idx < pagedAttendance.length - 1 ? "1px" : "0px", borderBottomStyle: "solid", borderBottomColor: idx < pagedAttendance.length - 1 ? "#F9FAFB" : "transparent" }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <Av name={r.name} dept={r.dept} size={32} />
                              <div>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{r.name}</p>
                                <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{r.dept} · {r.role}</p>
                              </div>
                            </div>
                            <SBadge s={r.status} />
                          </div>
                          <div className="flex items-center gap-4 mt-2 pl-[42px]">
                            <div>
                              <p style={{ fontSize: "11px", color: "#9CA3AF" }}>上班</p>
                              <span className="tabular-nums" style={{ fontSize: "13px", fontWeight: 600, color: r.checkIn ? (r.status === "late" ? "#CA8A04" : "#111827") : "#D1D5DB" }}>
                                {r.checkIn ?? "—"}
                              </span>
                            </div>
                            <div>
                              <p style={{ fontSize: "11px", color: "#9CA3AF" }}>下班</p>
                              <span className="tabular-nums" style={{ fontSize: "13px", color: r.checkOut ? "#111827" : "#D1D5DB" }}>
                                {r.checkOut ?? "—"}
                              </span>
                            </div>
                            <div>
                              <p style={{ fontSize: "11px", color: "#9CA3AF" }}>時數</p>
                              <span className="tabular-nums" style={{ fontSize: "13px", fontWeight: 600, color: r.hours ? "#111827" : "#D1D5DB" }}>
                                {fmtHours(r.hours)}
                              </span>
                            </div>
                          </div>
                          {r.hours && (
                            <div className="mt-1.5 pl-[42px]">
                              <div className="h-1 rounded-full overflow-hidden" style={{ background: "#F3F4F6", maxWidth: 160 }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.min(r.hours / 10 * 100, 100)}%`, background: border }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
              }
            </div>
            <Pagination total={filteredAttendance.length} page={todayPage} pageSize={PAGE_SIZE} onChange={setTodayPage} />
          </Card>
        )}

        {/* ══ 請假管理 ══════════════════════════════════════════════════ */}
        {activeTab === "leave" && (
          <div className="space-y-4">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "待審核", value: leaveRequests.filter(l => l.status === "pending").length,  ...LS.pending  },
                { label: "已批准", value: leaveRequests.filter(l => l.status === "approved").length, ...LS.approved },
                { label: "已拒絕", value: leaveRequests.filter(l => l.status === "rejected").length, ...LS.rejected },
              ].map(s => (
                <Card key={s.label} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.04em" }}>{s.label}</p>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.dot }} />
                    </div>
                  </div>
                  <p className="tabular-nums" style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                    {s.value}
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#9CA3AF", marginLeft: 2 }}>筆</span>
                  </p>
                </Card>
              ))}
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status chips */}
              <div className="flex items-center gap-1.5">
                {(["all", "pending", "approved", "rejected"] as const).map(s => {
                  const active = leaveFilterStatus === s;
                  const cfg = s === "all" ? null : LS[s];
                  return (
                    <button key={s}
                      className="px-3 py-1.5 rounded-lg"
                      style={{
                        fontSize: "12px", fontWeight: 600,
                        background: active ? (cfg ? cfg.bg : "#111827") : "#F3F4F6",
                        color: active ? (cfg ? cfg.color : "#FFF") : "#6B7280",
                        border: `1px solid ${active && cfg ? cfg.dot + "44" : "transparent"}`,
                      }}
                      onClick={() => { setLeaveFilterStatus(s); setLeavePage(1); }}>
                      {s === "all" ? "全部" : LS[s].label}
                    </button>
                  );
                })}
              </div>
              <div className="relative flex-1" style={{ marginLeft: "auto", minWidth: 140 }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                <input type="text" placeholder="搜尋姓名或事由…" value={leaveSearch}
                  onChange={e => { setLeaveSearch(e.target.value); setLeavePage(1); }}
                  className="w-full pl-9 pr-3 py-2 rounded outline-none"
                  style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "13px", color: "#111827", fontFamily: "inherit", maxWidth: 220 }} />
              </div>
            </div>

            {/* Pending cards */}
            {pendingLeaves.length > 0 && leaveFilterStatus !== "approved" && leaveFilterStatus !== "rejected" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#CA8A04" }} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", letterSpacing: "0.04em" }}>
                    待審核申請 ({pendingLeaves.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {pendingLeaves.map(l => (
                    <Card key={l.id} className="p-4" style={{ borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#CA8A04" }}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <Av name={l.name} dept={l.dept} size={36} />
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{l.name}</p>
                            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: 1 }}>{l.dept} · 申請於 {l.appliedAt}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-lg flex-shrink-0"
                          style={{ fontSize: "12px", fontWeight: 700, background: "#FEF9C3", color: "#A16207" }}>
                          {l.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center gap-1.5" style={{ fontSize: "12px", color: "#6B7280" }}>
                          <span style={{ color: "#9CA3AF" }}>📅</span>
                          {l.start} ～ {l.end}
                        </span>
                        <span className="px-2 py-0.5 rounded tabular-nums"
                          style={{ fontSize: "11px", fontWeight: 600, background: "#F3F4F6", color: "#374151" }}>
                          {l.days} 天
                        </span>
                      </div>
                      <p className="mb-3" style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>事由：{l.reason}</p>
                      <div className="flex gap-2 justify-end">
                        <button
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg"
                          style={{ fontSize: "12px", fontWeight: 600, background: "#FEF2F2", color: "#DC2626", borderWidth: "1px", borderStyle: "solid", borderColor: "#FECACA" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEE2E2"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
                          onClick={() => handleLeave(l.id, "rejected")}>
                          <X className="w-3.5 h-3.5" />拒絕
                        </button>
                        <button
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg"
                          style={{ fontSize: "12px", fontWeight: 600, background: "#F0FDF4", color: "#15803D", borderWidth: "1px", borderStyle: "solid", borderColor: "#BBF7D0" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#DCFCE7"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#F0FDF4"; }}
                          onClick={() => handleLeave(l.id, "approved")}>
                          <Check className="w-3.5 h-3.5" />批准
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All requests table */}
            <Card>
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em" }}>全部申請記錄</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>共 {filteredLeave.length} 筆</span>
              </div>
              {/* Table header */}
              <div className="hidden md:grid px-5 py-2.5" style={{ gridTemplateColumns: "1.5fr 1.5fr 0.8fr 1.2fr 1.5fr 0.8fr 1fr", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6", background: "#FAFAFA" }}>
                {["申請人", "部門", "假別", "日期區間", "事由", "天數", "狀態"].map(h => (
                  <span key={h} style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em" }}>{h}</span>
                ))}
              </div>
              {pagedLeave.length === 0
                ? <div className="py-12 text-center" style={{ color: "#9CA3AF", fontSize: "14px" }}>無符合條件的請假記錄</div>
                : pagedLeave.map((l, idx) => (
                    <div key={l.id}>
                      {/* Desktop row */}
                      <div
                        className="hidden md:grid items-center px-5 py-3.5"
                        style={{
                          gridTemplateColumns: "1.5fr 1.5fr 0.8fr 1.2fr 1.5fr 0.8fr 1fr",
                          borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: LS[l.status].dot,
                          borderBottomWidth: idx < pagedLeave.length - 1 ? "1px" : "0px", borderBottomStyle: "solid", borderBottomColor: idx < pagedLeave.length - 1 ? "#F9FAFB" : "transparent",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <div className="flex items-center gap-2">
                          <Av name={l.name} dept={l.dept} size={28} />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{l.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: DEPT_BG[l.dept] || "#F3F4F6", color: DEPT_COLOR[l.dept] || "#374151" }}>{l.dept}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: "#F3F4F6", color: "#374151", width: "fit-content" }}>{l.type}</span>
                        <span className="tabular-nums" style={{ fontSize: "12px", color: "#6B7280" }}>{l.start}<br />{l.end !== l.start ? `～ ${l.end}` : ""}</span>
                        <span style={{ fontSize: "12px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.reason}</span>
                        <span className="tabular-nums" style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{l.days} 天</span>
                        <LBadge s={l.status} />
                      </div>

                      {/* Mobile card */}
                      <div className="md:hidden px-4 py-3"
                        style={{ borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: LS[l.status].dot, borderBottomWidth: idx < pagedLeave.length - 1 ? "1px" : "0px", borderBottomStyle: "solid", borderBottomColor: idx < pagedLeave.length - 1 ? "#F9FAFB" : "transparent" }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Av name={l.name} dept={l.dept} size={28} />
                            <div>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{l.name}</span>
                              <span className="px-1.5 py-0.5 rounded ml-2" style={{ fontSize: "11px", fontWeight: 600, background: DEPT_BG[l.dept] || "#F3F4F6", color: DEPT_COLOR[l.dept] || "#374151" }}>{l.dept}</span>
                            </div>
                          </div>
                          <LBadge s={l.status} />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-2 pl-[36px]">
                          <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: "#F3F4F6", color: "#374151" }}>{l.type}</span>
                          <span className="tabular-nums" style={{ fontSize: "12px", color: "#6B7280" }}>{l.start}{l.end !== l.start ? ` ～ ${l.end}` : ""}</span>
                          <span className="tabular-nums" style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{l.days} 天</span>
                        </div>
                        <p className="mt-1 pl-[36px]" style={{ fontSize: "12px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.reason}</p>
                      </div>
                    </div>
                  ))
              }
              <Pagination total={filteredLeave.length} page={leavePage} pageSize={PAGE_SIZE} onChange={setLeavePage} />
            </Card>
          </div>
        )}

        {/* ══ 月度行事曆 ════════════════════════════════════════════════ */}
        {activeTab === "calendar" && (
          <div className="flex gap-4 max-md:flex-col">

            {/* Calendar */}
            <Card className="flex-1 p-6 max-md:p-4">
              <div className="flex items-center justify-between mb-5 max-md:flex-col max-md:items-start max-md:gap-3">
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>2026年 3月</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  {[["#111827", "今日"], ["#16A34A", "正常"], ["#CA8A04", "異常"], ["#F3F4F6", "休假 / 未來"]].map(([c, l]) => (
                    <span key={l} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c, borderWidth: c === "#F3F4F6" ? "1px" : "0px", borderStyle: "solid", borderColor: c === "#F3F4F6" ? "#E5E7EB" : "transparent" }} />
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{l}</span>
                    </span>
                  ))}
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#3B82F6" }} />
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>活動 / 會議</span>
                  </span>
                </div>
              </div>

              {/* Day of week headers */}
              <div className="grid grid-cols-7 mb-2">
                {["日", "一", "二", "三", "四", "五", "六"].map((d, i) => (
                  <div key={d} className="text-center py-2" style={{ fontSize: "13px", fontWeight: 700, color: i === 0 || i === 6 ? "#D1D5DB" : "#9CA3AF" }}>{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarCells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} className="min-h-[72px]" />;
                  const cfg = dayCfg(day);
                  if (!cfg) return <div key={day} className="min-h-[72px]" />;
                  const s = MARCH_STATUS[day];
                  const events = CALENDAR_EVENTS[day] || [];
                  return (
                    <div key={day}
                      className="flex flex-col items-start rounded-lg cursor-default min-h-[72px] p-1.5"
                      style={{ background: cfg.bg, borderWidth: cfg.borderW, borderStyle: "solid", borderColor: cfg.borderC, transition: "transform 0.1s" }}
                      onMouseEnter={e => { if (s !== "weekend") (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                    >
                      <div className="flex items-center justify-between w-full mb-0.5">
                        <span style={{ fontSize: "15px", fontWeight: s === "today" ? 700 : 600, color: cfg.text }}>{day}</span>
                        {s === "normal" && <span style={{ fontSize: "11px", color: "#16A34A", fontWeight: 600 }}>正常</span>}
                        {s === "issue"  && <span style={{ fontSize: "11px", color: "#CA8A04", fontWeight: 600 }}>異常</span>}
                        {s === "today"  && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>今日</span>}
                      </div>
                      {events.length > 0 && (
                        <div className="flex flex-col gap-0.5 w-full mt-auto">
                          {events.slice(0, 2).map((ev, i) => (
                            <div key={i} className="flex items-center gap-0.5 rounded overflow-hidden px-1 py-px"
                              style={{ background: `${ev.color}18`, maxWidth: "100%" }}>
                              <span className="w-1 h-1 rounded-full shrink-0" style={{ background: ev.color }} />
                              <span className="truncate" style={{ fontSize: "11px", fontWeight: 600, color: s === "today" ? "#FFF" : ev.color, lineHeight: 1.4 }}>
                                {ev.time ? `${ev.time} ` : ""}{ev.label}
                              </span>
                            </div>
                          ))}
                          {events.length > 2 && (
                            <span style={{ fontSize: "9px", color: s === "today" ? "rgba(255,255,255,0.6)" : "#9CA3AF", paddingLeft: 2 }}>+{events.length - 2} 更多</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Stats Panel */}
            <div className="flex flex-col gap-4 max-md:w-full" style={{ width: 260 }}>

              <Card className="p-5">
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: 14 }}>本月出勤摘要</h4>
                <div className="space-y-3">
                  {[
                    { label: "已統計工作日", value: "10", unit: "天" },
                    { label: "正常出勤日",   value: "8",  unit: "天" },
                    { label: "異常日 (3/5)", value: "1",  unit: "天" },
                    { label: "平均出勤率",   value: "92", unit: "%" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>{row.label}</span>
                      <span className="tabular-nums" style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                        {row.value}<span style={{ fontSize: "11px", fontWeight: 400, color: "#9CA3AF", marginLeft: 1 }}>{row.unit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: 14 }}>本月假別分布</h4>
                <div className="space-y-2.5">
                  {[
                    { type: "病假", count: 3, color: "#3B82F6" },
                    { type: "特休", count: 2, color: "#16A34A" },
                    { type: "事假", count: 2, color: "#CA8A04" },
                    { type: "公假", count: 1, color: "#7C3AED" },
                    { type: "補休", count: 2, color: "#374151" },
                    { type: "婚假", count: 1, color: "#EC4899" },
                  ].map(item => {
                    const max = 4;
                    return (
                      <div key={item.type}>
                        <div className="flex items-center justify-between mb-1">
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151" }}>{item.type}</span>
                          <span className="tabular-nums" style={{ fontSize: "12px", color: "#6B7280" }}>{item.count} 人次</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${item.count / max * 100}%`, background: item.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-5">
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: 14 }}>本月請假統計</h4>
                <div className="space-y-2">
                  {[
                    { label: "申請總件數", value: leaveRequests.length },
                    { label: "已核准",     value: leaveRequests.filter(l => l.status === "approved").length },
                    { label: "待審核",     value: leaveRequests.filter(l => l.status === "pending").length },
                    { label: "已拒絕",     value: leaveRequests.filter(l => l.status === "rejected").length },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>{row.label}</span>
                      <span className="tabular-nums" style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* ── Leave Application Modal ─────────────────────────────────── */}
      {isLeaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-md:p-0"
          style={{ background: "rgba(17,24,39,0.45)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setIsLeaveOpen(false); }}>
          <div className="flex flex-col w-full max-w-lg rounded-xl overflow-hidden max-md:max-w-none max-md:h-full max-md:rounded-none"
            style={{ background: "#FFF", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "90vh" }}>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>申請請假</h2>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 1 }}>填寫資訊後送出申請，等待主管審核</p>
              </div>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#9CA3AF" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                onClick={() => setIsLeaveOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 max-md:p-4 space-y-4">

              {/* Name + Dept */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={lStyle}>申請人姓名 <span style={{ color: "#DC2626" }}>*</span></label>
                  <input type="text" value={leaveForm.name} placeholder="請輸入姓名"
                    onChange={e => setLF("name", e.target.value)} style={iStyle(leaveErrors.name)} />
                  {leaveErrors.name && <p style={{ fontSize: "11px", color: "#DC2626", marginTop: 3 }}>{leaveErrors.name}</p>}
                </div>
                <div>
                  <label style={lStyle}>所屬部門</label>
                  <StyledSelect
                    value={leaveForm.dept}
                    onChange={v => setLF("dept", v)}
                    options={DEPTS.map(d => ({ key: d, label: d }))}
                    formField
                  />
                </div>
              </div>

              {/* Type + Days */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={lStyle}>假別</label>
                  <StyledSelect
                    value={leaveForm.type}
                    onChange={v => setLF("type", v as LeaveType)}
                    options={LEAVE_TYPES.map(t => ({ key: t, label: t }))}
                    formField
                  />
                </div>
                <div>
                  <label style={lStyle}>請假天數</label>
                  <input type="number" min={0.5} step={0.5} value={leaveForm.days}
                    onChange={e => setLF("days", parseFloat(e.target.value))} style={iStyle()} />
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={lStyle}>開始日期 <span style={{ color: "#DC2626" }}>*</span></label>
                  <DatePicker value={leaveForm.start} onChange={v => setLF("start", v)} placeholder="選擇開始日期" formField />
                  {leaveErrors.start && <p style={{ fontSize: "11px", color: "#DC2626", marginTop: 3 }}>{leaveErrors.start}</p>}
                </div>
                <div>
                  <label style={lStyle}>結束日期 <span style={{ color: "#DC2626" }}>*</span></label>
                  <DatePicker value={leaveForm.end} onChange={v => setLF("end", v)} placeholder="選擇結束日期" formField minDate={leaveForm.start || undefined} />
                  {leaveErrors.end && <p style={{ fontSize: "11px", color: "#DC2626", marginTop: 3 }}>{leaveErrors.end}</p>}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label style={lStyle}>請假事由 <span style={{ color: "#DC2626" }}>*</span></label>
                <textarea rows={4} value={leaveForm.reason} placeholder="請說明請假原因…"
                  onChange={e => setLF("reason", e.target.value)}
                  style={{ ...iStyle(leaveErrors.reason), resize: "vertical", lineHeight: 1.7 }} />
                {leaveErrors.reason && <p style={{ fontSize: "11px", color: "#DC2626", marginTop: 3 }}>{leaveErrors.reason}</p>}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}>
              <button className="px-4 py-2 rounded"
                style={{ fontSize: "13px", color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                onClick={() => setIsLeaveOpen(false)}>
                取消
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2 rounded"
                style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 600 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}
                onClick={submitLeave}>
                <ClipboardList className="w-4 h-4" />送出申請
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
