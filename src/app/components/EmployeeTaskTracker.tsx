import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  Search, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  Flame, Target, CalendarDays, TrendingUp, BarChart3, ExternalLink,
  CircleDot, GanttChart, ArrowLeftRight, LineChart as LineChartIcon,
  List, GripVertical, User, Check,
} from "lucide-react";
import { INIT_TASKS, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_TYPE_LABELS } from "../data/tasks-shared";
import type { SharedTask, TaskStatus } from "../data/tasks-shared";
import { SHARED_PROJECTS } from "../data/projects-shared";
import { type Employee, DEPT_BG, DEPT_COLOR } from "../data/employees";
import { StyledSelect } from "./StyledSelect";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend, LineChart, Line, Area, AreaChart,
} from "recharts";

// ── Employee → Task assignee name mapping (demo) ──
const EMP_TASK_MAP: Record<string, string> = {
  "EMP-001": "王五",
  "EMP-002": "林一",
  "EMP-003": "張三",
  "EMP-005": "吳十",
  "EMP-006": "李四",
  "EMP-007": "趙六",
  "EMP-008": "錢七",
  "EMP-009": "孫八",
  "EMP-010": "周九",
  "EMP-012": "陳二",
  "EMP-013": "何家豪",
};

// Reverse map: assigneeName → empNo
const REVERSE_MAP: Record<string, string> = {};
Object.entries(EMP_TASK_MAP).forEach(([k, v]) => { REVERSE_MAP[v] = k; });

const TODAY = "2026-03-18";

function daysDiff(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function getDueInfo(dueDate: string, status: TaskStatus): { label: string; color: string; bg: string; urgent: boolean } {
  if (status === "done") return { label: "已完成", color: "#15803D", bg: "#F0FDF4", urgent: false };
  const diff = daysDiff(TODAY, dueDate);
  if (diff < 0) return { label: `逾期 ${Math.abs(diff)} 天`, color: "#DC2626", bg: "#FEF2F2", urgent: true };
  if (diff === 0) return { label: "今天到期", color: "#EA580C", bg: "#FFF7ED", urgent: true };
  if (diff <= 3) return { label: `${diff} 天後到期`, color: "#CA8A04", bg: "#FEF9C3", urgent: true };
  if (diff <= 7) return { label: `${diff} 天後到期`, color: "#2563EB", bg: "#EFF6FF", urgent: false };
  return { label: `${diff} 天後到期`, color: "#6B7280", bg: "#F9FAFB", urgent: false };
}

interface EmployeeWorkload {
  employee: Employee;
  assigneeName: string;
  tasks: SharedTask[];
  totalPoints: number;
  donePoints: number;
  activeTasks: number;
  overdueTasks: number;
  avgCompletion: number;
  nearestDue: string | null;
}

// ── Shared sub-components ──
const Av = ({ name, dept, size = 36 }: { name: string; dept?: string; size?: number }) => (
  <div className="rounded-full flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size, background: dept ? DEPT_BG[dept] || "#F3F4F6" : "#F3F4F6" }}>
    <span style={{ fontSize: size * 0.38, fontWeight: 700, color: dept ? DEPT_COLOR[dept] || "#374151" : "#374151" }}>
      {name.charAt(0)}
    </span>
  </div>
);

const CardBox = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={className} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
    {children}
  </div>
);

const ProgressBar = ({ pct, color = "#111827", h = 6 }: { pct: number; color?: string; h?: number }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ height: h, background: "#F3F4F6" }}>
    <div className="rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: color }} />
  </div>
);

// ── Mock monthly workload data for trend chart ──
function generateMonthlyData(workloads: EmployeeWorkload[]) {
  const monthLabels = ["10月", "11月", "12月", "1月", "2月", "3月"];
  // Seed-based pseudo-random for consistency
  const seed = (name: string, m: number) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
    return Math.abs((h * (m + 1) * 7) % 100);
  };

  return monthLabels.map((label, mi) => {
    const row: any = { month: label };
    let totalPts = 0, totalCompleted = 0, totalTasks = 0;
    workloads.filter(w => w.tasks.length > 0).forEach(w => {
      const s = seed(w.employee.name, mi);
      const pts = Math.max(3, Math.round(w.totalPoints * (0.5 + (s % 60) / 100)));
      const completed = Math.round(pts * (0.3 + (s % 50) / 100));
      const tasks = Math.max(1, Math.round(w.tasks.length * (0.5 + (s % 40) / 100)));
      totalPts += pts;
      totalCompleted += completed;
      totalTasks += tasks;
    });
    row.totalPoints = totalPts;
    row.completedPoints = Math.min(totalCompleted, totalPts);
    row.totalTasks = totalTasks;
    row.completedTasks = Math.round(totalTasks * (0.4 + mi * 0.08));
    row.avgCompletion = totalPts > 0 ? Math.round((Math.min(totalCompleted, totalPts) / totalPts) * 100) : 0;
    return row;
  });
}

function generatePerEmployeeMonthly(workloads: EmployeeWorkload[]) {
  const months = ["10月", "11月", "12月", "1月", "2月", "3月"];
  const seed = (name: string, m: number) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
    return Math.abs((h * (m + 1) * 7) % 100);
  };
  const active = workloads.filter(w => w.tasks.length > 0);
  return months.map((label, mi) => {
    const row: any = { month: label };
    active.forEach(w => {
      const s = seed(w.employee.name, mi);
      row[w.employee.name] = Math.max(3, Math.round(w.totalPoints * (0.5 + (s % 60) / 100)));
    });
    return row;
  });
}

const CHART_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444", "#0EA5E9", "#6366F1", "#D946EF", "#84CC16"];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
type SubTab = "list" | "gantt" | "reassign" | "trend";

export function EmployeeTaskTracker({ employees }: { employees: Employee[] }) {
  const [subTab, setSubTab] = useState<SubTab>("list");
  const [search, setSearch] = useState("");
  const [filterWorkload, setFilterWorkload] = useState<"all" | "overloaded" | "normal" | "idle">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"overdue" | "points" | "tasks" | "name">("overdue");
  const [taskAssignments, setTaskAssignments] = useState<Record<string, string>>(() => {
    // taskId → assigneeName
    const m: Record<string, string> = {};
    INIT_TASKS.forEach(t => { m[t.id] = t.assignee; });
    return m;
  });
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  const workloads = useMemo<EmployeeWorkload[]>(() => {
    return employees
      .filter(e => e.status === "active" || e.status === "probation")
      .map(emp => {
        const assigneeName = EMP_TASK_MAP[emp.employeeNo] || "";
        const tasks = assigneeName ? INIT_TASKS.filter(t => taskAssignments[t.id] === assigneeName) : [];
        const activeTasks = tasks.filter(t => t.status !== "done").length;
        const overdueTasks = tasks.filter(t => t.status !== "done" && daysDiff(TODAY, t.dueDate) < 0).length;
        const totalPoints = tasks.reduce((s, t) => s + t.storyPoints, 0);
        const donePoints = tasks.filter(t => t.status === "done").reduce((s, t) => s + t.storyPoints, 0);
        const avgCompletion = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
        const pendingTasks = tasks.filter(t => t.status !== "done").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        const nearestDue = pendingTasks.length > 0 ? pendingTasks[0].dueDate : null;
        return { employee: emp, assigneeName, tasks, totalPoints, donePoints, activeTasks, overdueTasks, avgCompletion, nearestDue };
      });
  }, [employees, taskAssignments]);

  const filtered = useMemo(() => {
    let list = workloads;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(w => w.employee.name.toLowerCase().includes(q) || w.employee.employeeNo.toLowerCase().includes(q) || w.employee.dept.includes(q));
    }
    if (filterWorkload === "overloaded") list = list.filter(w => w.activeTasks >= 4 || w.overdueTasks > 0);
    else if (filterWorkload === "normal") list = list.filter(w => w.activeTasks >= 1 && w.activeTasks < 4 && w.overdueTasks === 0);
    else if (filterWorkload === "idle") list = list.filter(w => w.activeTasks === 0);
    list = [...list].sort((a, b) => {
      if (sortBy === "overdue") return b.overdueTasks - a.overdueTasks || b.activeTasks - a.activeTasks;
      if (sortBy === "points") return b.totalPoints - a.totalPoints;
      if (sortBy === "tasks") return b.activeTasks - a.activeTasks;
      return a.employee.name.localeCompare(b.employee.name);
    });
    return list;
  }, [workloads, search, filterWorkload, sortBy]);

  const summary = useMemo(() => ({
    totalActive: workloads.length,
    withTasks: workloads.filter(w => w.tasks.length > 0).length,
    overloaded: workloads.filter(w => w.activeTasks >= 4 || w.overdueTasks > 0).length,
    idle: workloads.filter(w => w.activeTasks === 0).length,
    totalOverdue: workloads.reduce((s, w) => s + w.overdueTasks, 0),
    totalStoryPts: workloads.reduce((s, w) => s + w.totalPoints, 0),
  }), [workloads]);

  const reassignTask = useCallback((taskId: string, newAssigneeName: string, oldAssigneeName: string) => {
    setTaskAssignments(prev => ({ ...prev, [taskId]: newAssigneeName }));
    const task = INIT_TASKS.find(t => t.id === taskId);
    const newEmpNo = REVERSE_MAP[newAssigneeName];
    const newEmp = employees.find(e => e.employeeNo === newEmpNo);
    showToast(`已將「${task?.title}」指派給 ${newEmp?.name || newAssigneeName}`);
  }, [employees]);

  const toggle = (id: number) => setExpandedId(prev => prev === id ? null : id);

  const SUB_TABS: { key: SubTab; label: string; icon: any }[] = [
    { key: "list", label: "工作負載", icon: List },
    { key: "gantt", label: "時間軸", icon: GanttChart },
    { key: "reassign", label: "任務指派", icon: ArrowLeftRight },
    { key: "trend", label: "趨勢分析", icon: LineChartIcon },
  ];

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="fixed top-6 right-6 z-[100] px-5 py-3 rounded-lg flex items-center gap-2"
          style={{ background: toast.ok ? "#111827" : "#DC2626", color: "#FFF", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", fontSize: "15px", fontWeight: 500 }}>
          {toast.ok ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{toast.msg}
        </div>
      )}

      {/* Summary KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "在職員工", value: summary.totalActive, unit: "人", icon: Target, c: "#374151", bg: "#F9FAFB" },
          { label: "有任務指派", value: summary.withTasks, unit: "人", icon: BarChart3, c: "#2563EB", bg: "#EFF6FF" },
          { label: "需關注", value: summary.overloaded, unit: "人", icon: Flame, c: "#DC2626", bg: "#FEF2F2" },
          { label: "逾期任務", value: summary.totalOverdue, unit: "項", icon: AlertTriangle, c: "#EA580C", bg: "#FFF7ED" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <CardBox key={item.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.04em" }}>{item.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: item.c }} />
                </div>
              </div>
              <p className="tabular-nums" style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                {item.value}
                <span style={{ fontSize: "14px", fontWeight: 500, color: "#9CA3AF", marginLeft: 2 }}>{item.unit}</span>
              </p>
            </CardBox>
          );
        })}
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: "#F3F4F6" }}>
        {SUB_TABS.map(t => {
          const active = subTab === t.key;
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setSubTab(t.key)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
              style={{ fontSize: "13px", fontWeight: active ? 600 : 500, background: active ? "#111827" : "transparent", color: active ? "#FFF" : "#6B7280", boxShadow: active ? "0 1px 4px rgba(0,0,0,0.15)" : "none" }}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {subTab === "list" && (
        <WorkloadList
          filtered={filtered} expandedId={expandedId} toggle={toggle}
          search={search} setSearch={setSearch}
          filterWorkload={filterWorkload} setFilterWorkload={setFilterWorkload}
          sortBy={sortBy} setSortBy={setSortBy}
        />
      )}
      {subTab === "gantt" && <GanttTimeline workloads={workloads.filter(w => w.tasks.length > 0)} />}
      {subTab === "reassign" && (
        <ReassignBoard workloads={workloads.filter(w => w.assigneeName)} reassignTask={reassignTask} taskAssignments={taskAssignments} />
      )}
      {subTab === "trend" && <TrendCharts workloads={workloads} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: WORKLOAD LIST (existing)
// ═══════════════════════════════════════════════════════════════════════════════
function WorkloadList({
  filtered, expandedId, toggle, search, setSearch, filterWorkload, setFilterWorkload, sortBy, setSortBy,
}: {
  filtered: EmployeeWorkload[];
  expandedId: number | null;
  toggle: (id: number) => void;
  search: string; setSearch: (s: string) => void;
  filterWorkload: string; setFilterWorkload: (s: any) => void;
  sortBy: string; setSortBy: (s: any) => void;
}) {
  return (
    <CardBox>
      <div className="flex flex-wrap gap-3 p-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
        <div className="relative flex-1" style={{ minWidth: 140 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
          <input type="text" placeholder="搜尋姓名、員編、部門..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded outline-none"
            style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#111827", fontFamily: "inherit" }} />
        </div>
        <div className="flex gap-2 flex-wrap max-md:w-full max-md:flex-col">
          <StyledSelect value={filterWorkload} onChange={v => setFilterWorkload(v)} allLabel="全部狀態"
            options={[
              { key: "overloaded", label: "需關注（過載/逾期）" },
              { key: "normal", label: "正常" },
              { key: "idle", label: "無任務" },
            ]} className="max-md:w-full" />
          <StyledSelect value={sortBy} onChange={v => setSortBy(v)}
            options={[
              { key: "overdue", label: "依逾期排序" },
              { key: "points", label: "依點數排序" },
              { key: "tasks", label: "依任務數排序" },
              { key: "name", label: "依姓名排序" },
            ]} className="max-md:w-full" />
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span style={{ fontSize: "13px", color: "#9CA3AF" }}>共 {filtered.length} 人</span>
        </div>
      </div>

      <div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center" style={{ color: "#9CA3AF", fontSize: "14px" }}>找不到符合條件的員工</div>
        ) : filtered.map((w, idx) => {
          const emp = w.employee;
          const isExpanded = expandedId === emp.id;
          const workloadLevel = w.overdueTasks > 0 ? "overdue" : w.activeTasks >= 4 ? "heavy" : w.activeTasks >= 1 ? "normal" : "idle";
          const WL_CFG_MAP = {
            overdue: { label: "有逾期", color: "#DC2626", bg: "#FEF2F2" },
            heavy:   { label: "高負載", color: "#EA580C", bg: "#FFF7ED" },
            normal:  { label: "正常",   color: "#15803D", bg: "#F0FDF4" },
            idle:    { label: "無任務", color: "#9CA3AF", bg: "#F9FAFB" },
          } as const;
          const wlCfg = WL_CFG_MAP[workloadLevel];

          return (
            <div key={emp.id} style={{ borderBottomWidth: idx < filtered.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
              <div className="flex items-center gap-4 px-5 py-3.5 cursor-pointer max-md:px-4 max-md:flex-wrap max-md:gap-3"
                style={{ transition: "background 0.1s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                onClick={() => toggle(emp.id)}>
                <div className="flex items-center gap-3 min-w-0" style={{ flex: "1.5 1 0" }}>
                  <Av name={emp.name} dept={emp.dept} size={36} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate" style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{emp.name}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: DEPT_BG[emp.dept] || "#F3F4F6", color: DEPT_COLOR[emp.dept] || "#374151" }}>{emp.dept}</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 1 }}>{emp.role}</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center" style={{ flex: "0.6 1 0" }}>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
                    style={{ fontSize: "12px", fontWeight: 600, background: wlCfg.bg, color: wlCfg.color, whiteSpace: "nowrap" }}>
                    {workloadLevel === "overdue" && <AlertTriangle className="w-3 h-3" />}
                    {wlCfg.label}
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-6" style={{ flex: "2 1 0" }}>
                  <div className="flex items-center gap-1.5">
                    <CircleDot className="w-3.5 h-3.5" style={{ color: "#2563EB" }} />
                    <span className="tabular-nums" style={{ fontSize: "13px", color: "#374151" }}>{w.activeTasks}</span>
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>進行中</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#15803D" }} />
                    <span className="tabular-nums" style={{ fontSize: "13px", color: "#374151" }}>{w.tasks.filter(t => t.status === "done").length}</span>
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>已完成</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: "#7C3AED" }} />
                    <span className="tabular-nums" style={{ fontSize: "13px", color: "#374151" }}>{w.totalPoints}</span>
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>點數</span>
                  </div>
                  {w.overdueTasks > 0 && (
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#DC2626" }} />
                      <span className="tabular-nums" style={{ fontSize: "13px", color: "#DC2626", fontWeight: 600 }}>{w.overdueTasks}</span>
                      <span style={{ fontSize: "12px", color: "#DC2626" }}>逾期</span>
                    </div>
                  )}
                </div>
                <div className="hidden md:block" style={{ flex: "1 1 0" }}>
                  {w.tasks.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <ProgressBar pct={w.avgCompletion} color={w.avgCompletion >= 70 ? "#15803D" : w.avgCompletion >= 40 ? "#CA8A04" : "#374151"} />
                      <span className="tabular-nums" style={{ fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>{w.avgCompletion}%</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#D1D5DB" }}>—</span>
                  )}
                </div>
                <div className="flex md:hidden items-center gap-3 w-full pl-[48px]">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
                    style={{ fontSize: "11px", fontWeight: 600, background: wlCfg.bg, color: wlCfg.color }}>
                    {wlCfg.label}
                  </span>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>{w.activeTasks} 進行中 · {w.totalPoints} 點</span>
                  {w.overdueTasks > 0 && <span style={{ fontSize: "12px", color: "#DC2626", fontWeight: 600 }}>{w.overdueTasks} 逾期</span>}
                </div>
                <div className="flex-shrink-0" style={{ position: "relative" }}>
                  {isExpanded ? <ChevronUp className="w-4 h-4" style={{ color: "#9CA3AF" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#9CA3AF" }} />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-4 max-md:px-4">
                  {w.tasks.length === 0 ? (
                    <div className="py-6 text-center rounded-lg" style={{ background: "#FAFAFA", fontSize: "13px", color: "#9CA3AF" }}>
                      此員工目前無指派任務
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-lg mb-3" style={{ background: "#FAFAFA" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>總點數</span>
                          <p className="tabular-nums" style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                            {w.donePoints}<span style={{ color: "#9CA3AF", fontWeight: 500 }}>/{w.totalPoints}</span>
                          </p>
                        </div>
                        <div style={{ width: 1, height: 28, background: "#E5E7EB" }} />
                        <div>
                          <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>完成率</span>
                          <p className="tabular-nums" style={{ fontSize: "18px", fontWeight: 700, color: w.avgCompletion >= 70 ? "#15803D" : "#111827" }}>{w.avgCompletion}%</p>
                        </div>
                        <div style={{ width: 1, height: 28, background: "#E5E7EB" }} />
                        <div>
                          <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>任務分佈</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {(["todo", "inProgress", "review", "done"] as TaskStatus[]).map(s => {
                              const cnt = w.tasks.filter(t => t.status === s).length;
                              if (cnt === 0) return null;
                              const cfg = TASK_STATUS_LABELS[s];
                              return (
                                <span key={s} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
                                  style={{ fontSize: "11px", fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                                  {cfg.label} {cnt}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        {w.nearestDue && (
                          <>
                            <div style={{ width: 1, height: 28, background: "#E5E7EB" }} />
                            <div>
                              <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>最近期限</span>
                              <p className="tabular-nums" style={{ fontSize: "14px", fontWeight: 600, color: daysDiff(TODAY, w.nearestDue) < 0 ? "#DC2626" : "#374151" }}>
                                {w.nearestDue}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {[...w.tasks].sort((a, b) => {
                        const aOver = a.status !== "done" && daysDiff(TODAY, a.dueDate) < 0 ? 0 : 1;
                        const bOver = b.status !== "done" && daysDiff(TODAY, b.dueDate) < 0 ? 0 : 1;
                        if (aOver !== bOver) return aOver - bOver;
                        return a.dueDate.localeCompare(b.dueDate);
                      }).map(task => {
                        const stCfg = TASK_STATUS_LABELS[task.status];
                        const prCfg = TASK_PRIORITY_LABELS[task.priority];
                        const tyCfg = TASK_TYPE_LABELS[task.type];
                        const due = getDueInfo(task.dueDate, task.status);
                        const project = task.projectId ? SHARED_PROJECTS.find(p => p.id === task.projectId) : null;
                        return (
                          <div key={task.id} className="flex items-start gap-3 px-4 py-3 rounded-lg max-md:flex-col max-md:gap-2"
                            style={{
                              borderWidth: "1px", borderStyle: "solid",
                              borderColor: due.urgent && task.status !== "done" ? "#FCA5A5" : "#F3F4F6",
                              background: due.urgent && task.status !== "done" ? "#FFFBFB" : "#FFF",
                            }}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>{task.id}</span>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: tyCfg.bg, color: tyCfg.color }}>{tyCfg.label}</span>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, background: prCfg.bg, color: prCfg.color }}>{prCfg.label}</span>
                              </div>
                              <p className="mt-1" style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{task.title}</p>
                              <p className="mt-0.5" style={{ fontSize: "12px", color: "#9CA3AF", lineHeight: 1.5 }}>{task.desc}</p>
                              <div className="flex items-center gap-2 flex-wrap mt-2">
                                {project && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
                                    style={{ fontSize: "11px", fontWeight: 600, background: `${project.color}12`, color: project.color }}>
                                    <ExternalLink className="w-3 h-3" />{project.name}
                                  </span>
                                )}
                                {task.labels.map(l => (
                                  <span key={l} className="px-1.5 py-0.5 rounded" style={{ fontSize: "11px", background: "#F3F4F6", color: "#6B7280" }}>{l}</span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 max-md:w-full max-md:justify-between">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md" style={{ fontSize: "12px", fontWeight: 600, background: stCfg.bg, color: stCfg.color, whiteSpace: "nowrap" }}>{stCfg.label}</span>
                              <div className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" style={{ color: due.color }} />
                                <span className="tabular-nums" style={{ fontSize: "12px", fontWeight: 600, color: due.color, whiteSpace: "nowrap" }}>{due.label}</span>
                              </div>
                              <span className="tabular-nums px-2 py-0.5 rounded" style={{ fontSize: "12px", fontWeight: 700, background: "#F5F3FF", color: "#7C3AED" }}>
                                {task.storyPoints} pts
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CardBox>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: GANTT TIMELINE
// ═══════════════════════════════════════════════════════════════════════════════
function GanttTimeline({ workloads }: { workloads: EmployeeWorkload[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipTask, setTooltipTask] = useState<SharedTask | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Compute timeline range
  const { minDate, maxDate, totalDays, dates } = useMemo(() => {
    const allTasks = workloads.flatMap(w => w.tasks);
    if (allTasks.length === 0) return { minDate: TODAY, maxDate: TODAY, totalDays: 1, dates: [TODAY] };
    const allDates = allTasks.flatMap(t => [t.createdDate, t.dueDate]);
    const min = allDates.reduce((a, b) => a < b ? a : b);
    const max = allDates.reduce((a, b) => a > b ? a : b);
    // Add padding
    const padMin = new Date(min); padMin.setDate(padMin.getDate() - 2);
    const padMax = new Date(max); padMax.setDate(padMax.getDate() + 5);
    const days = daysDiff(padMin.toISOString().slice(0, 10), padMax.toISOString().slice(0, 10));
    const dArr: string[] = [];
    for (let i = 0; i <= days; i++) {
      const d = new Date(padMin); d.setDate(d.getDate() + i);
      dArr.push(d.toISOString().slice(0, 10));
    }
    return { minDate: dArr[0], maxDate: dArr[dArr.length - 1], totalDays: Math.max(days, 1), dates: dArr };
  }, [workloads]);

  const DAY_W = 18;
  const ROW_H = 24;
  const LABEL_W = 130;
  const HEADER_H = 36;

  const todayOffset = daysDiff(minDate, TODAY);

  // Generate week markers
  const weekMarkers = useMemo(() => {
    const markers: { date: string; offset: number; label: string }[] = [];
    dates.forEach((d, i) => {
      const dow = new Date(d).getDay();
      if (dow === 1 || i === 0) { // Monday or first
        markers.push({ date: d, offset: i, label: `${new Date(d).getMonth() + 1}/${new Date(d).getDate()}` });
      }
    });
    return markers;
  }, [dates]);

  const STATUS_COLORS: Record<TaskStatus, string> = {
    todo: "#374151",
    inProgress: "#3B82F6",
    review: "#7C3AED",
    done: "#15803D",
  };

  return (
    <CardBox>
      <div className="p-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>任務時間軸</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>依員工分組顯示任務的起迄時間分佈，橫軸為日期，點擊色條可查看任務詳情</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {(["inProgress", "todo", "review", "done"] as TaskStatus[]).map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: STATUS_COLORS[s] }} />
                <span style={{ fontSize: "11px", color: "#6B7280" }}>{TASK_STATUS_LABELS[s].label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto" ref={containerRef} style={{ position: "relative" }}>
        <div style={{ minWidth: LABEL_W + totalDays * DAY_W + 40, position: "relative" }}>
          {/* Header - dates */}
          <div className="flex" style={{ height: HEADER_H, borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
            <div className="flex-shrink-0 flex items-end px-4 pb-2" style={{ width: LABEL_W, background: "#FAFAFA" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF" }}>員工</span>
            </div>
            <div className="relative flex-1" style={{ background: "#FAFAFA" }}>
              {weekMarkers.map((m, i) => (
                <div key={i} className="absolute flex flex-col items-start" style={{ left: m.offset * DAY_W, bottom: 8 }}>
                  <span className="tabular-nums" style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", whiteSpace: "nowrap" }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today marker */}
          {todayOffset >= 0 && todayOffset <= totalDays && (
            <div className="absolute z-10" style={{
              left: LABEL_W + todayOffset * DAY_W,
              top: HEADER_H,
              bottom: 0,
              width: 2,
              background: "#DC2626",
              opacity: 0.6,
            }}>
              <div className="absolute -top-5 -left-[14px] px-1.5 py-0.5 rounded" style={{ background: "#DC2626", fontSize: "10px", color: "#FFF", fontWeight: 700, whiteSpace: "nowrap" }}>
                今天
              </div>
            </div>
          )}

          {/* Rows */}
          {workloads.map((w, ri) => (
            <div key={w.employee.id} className="flex" style={{
              minHeight: Math.max(ROW_H, w.tasks.length * 24 + 12),
              borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6",
            }}>
              {/* Label */}
              <div className="flex-shrink-0 flex items-center gap-2 px-4" style={{ width: LABEL_W, background: ri % 2 === 0 ? "transparent" : "#FAFAFA" }}>
                <Av name={w.employee.name} dept={w.employee.dept} size={22} />
                <div className="min-w-0">
                  <p className="truncate" style={{ fontSize: "11px", fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>{w.employee.name}</p>
                  <p className="truncate" style={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.2 }}>{w.tasks.length} 項 · {w.totalPoints}pts</p>
                </div>
              </div>

              {/* Timeline bars */}
              <div className="relative flex-1 py-1" style={{ background: ri % 2 === 0 ? "transparent" : "#FAFAFA" }}>
                {/* Grid lines for weeks */}
                {weekMarkers.map((m, i) => (
                  <div key={i} className="absolute top-0 bottom-0" style={{ left: m.offset * DAY_W, width: 1, background: "#F3F4F6" }} />
                ))}
                {w.tasks.map((task, ti) => {
                  const startOff = daysDiff(minDate, task.createdDate);
                  const endOff = daysDiff(minDate, task.dueDate);
                  const barLeft = Math.max(0, startOff) * DAY_W;
                  const barWidth = Math.max(DAY_W, (endOff - Math.max(0, startOff) + 1) * DAY_W);
                  const isOverdue = task.status !== "done" && daysDiff(TODAY, task.dueDate) < 0;
                  return (
                    <div key={task.id} className="absolute flex items-center cursor-pointer group"
                      style={{ left: barLeft, top: ti * 24 + 3, height: 22, width: barWidth, zIndex: 2 }}
                      onMouseEnter={(e) => {
                        setTooltipTask(task);
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) setTooltipPos({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top - HEADER_H + 12 });
                      }}
                      onMouseLeave={() => setTooltipTask(null)}>
                      <div className="h-full w-full rounded-md transition-all group-hover:ring-2 group-hover:ring-offset-1"
                        style={{
                          background: isOverdue ? `repeating-linear-gradient(135deg, ${STATUS_COLORS[task.status]}, ${STATUS_COLORS[task.status]} 4px, #FCA5A5 4px, #FCA5A5 8px)` : STATUS_COLORS[task.status],
                          opacity: task.status === "done" ? 0.5 : 0.85,
                          ringColor: STATUS_COLORS[task.status],
                        }}>
                        {barWidth > 50 && (
                          <span className="px-2 truncate block leading-[22px]" style={{ fontSize: "11px", fontWeight: 600, color: "#FFF" }}>
                            {task.title}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {tooltipTask && (
          <div className="absolute z-50 p-3 rounded-lg" style={{
            left: tooltipPos.x, top: tooltipPos.y + HEADER_H,
            background: "#111827", color: "#FFF", fontSize: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)", maxWidth: 280,
            pointerEvents: "none",
          }}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: "#9CA3AF" }}>{tooltipTask.id}</span>
              <span className="px-1.5 py-0.5 rounded" style={{ background: TASK_STATUS_LABELS[tooltipTask.status].bg, color: TASK_STATUS_LABELS[tooltipTask.status].color, fontSize: "10px", fontWeight: 600 }}>
                {TASK_STATUS_LABELS[tooltipTask.status].label}
              </span>
            </div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>{tooltipTask.title}</p>
            <div className="flex items-center gap-3" style={{ color: "#9CA3AF" }}>
              <span>{tooltipTask.createdDate} → {tooltipTask.dueDate}</span>
              <span>{tooltipTask.storyPoints} pts</span>
            </div>
          </div>
        )}
      </div>
    </CardBox>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: DRAG & DROP REASSIGNMENT BOARD
// ═══════════════════════════════════════════════════════════════════════════════
// ── Native HTML5 Drag & Drop for task reassignment ──
function DraggableTaskCard({ task, assigneeName, onDragStart }: { task: SharedTask; assigneeName: string; onDragStart: (taskId: string, fromAssignee: string) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const prCfg = TASK_PRIORITY_LABELS[task.priority];
  const stCfg = TASK_STATUS_LABELS[task.status];
  const due = getDueInfo(task.dueDate, task.status);

  return (
    <div draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ taskId: task.id, fromAssignee: assigneeName }));
        e.dataTransfer.effectAllowed = "move";
        onDragStart(task.id, assigneeName);
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      className="px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing transition-all"
      style={{
        background: isDragging ? "#F3F4F6" : "#FFF",
        borderWidth: "1px", borderStyle: "solid",
        borderColor: isDragging ? "#3B82F6" : due.urgent && task.status !== "done" ? "#FCA5A5" : "#E5E7EB",
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.12)" : "0 1px 2px rgba(0,0,0,0.04)",
      }}>
      <div className="flex items-center gap-2 mb-1.5">
        <GripVertical className="w-3 h-3 flex-shrink-0" style={{ color: "#D1D5DB" }} />
        <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>{task.id}</span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, background: prCfg.bg, color: prCfg.color }}>{prCfg.label}</span>
        <span className="ml-auto tabular-nums" style={{ fontSize: "10px", fontWeight: 700, color: "#7C3AED" }}>{task.storyPoints}pts</span>
      </div>
      <p className="mb-1" style={{ fontSize: "13px", fontWeight: 500, color: "#111827", lineHeight: 1.4 }}>{task.title}</p>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, background: stCfg.bg, color: stCfg.color }}>{stCfg.label}</span>
        <div className="flex items-center gap-1 ml-auto">
          <CalendarDays className="w-3 h-3" style={{ color: due.color }} />
          <span className="tabular-nums" style={{ fontSize: "10px", fontWeight: 600, color: due.color }}>{due.label}</span>
        </div>
      </div>
    </div>
  );
}

function DropColumn({ workload, reassignTask, taskAssignments, onDragStart }: {
  workload: EmployeeWorkload;
  reassignTask: (taskId: string, newAssignee: string, oldAssignee: string) => void;
  taskAssignments: Record<string, string>;
  onDragStart: (taskId: string, fromAssignee: string) => void;
}) {
  const [isOver, setIsOver] = useState(false);
  const dragCounterRef = useRef(0);

  const emp = workload.employee;
  const tasks = INIT_TASKS.filter(t => taskAssignments[t.id] === workload.assigneeName);
  const totalPts = tasks.reduce((s, t) => s + t.storyPoints, 0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.fromAssignee !== workload.assigneeName) {
        reassignTask(data.taskId, workload.assigneeName, data.fromAssignee);
      }
    } catch { /* ignore */ }
  }, [workload.assigneeName, reassignTask]);

  return (
    <div className="flex-shrink-0 flex flex-col rounded-lg overflow-hidden transition-all"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: 280,
        background: isOver ? "#EFF6FF" : "#FAFAFA",
        borderWidth: "2px", borderStyle: "solid",
        borderColor: isOver ? "#3B82F6" : "#E5E7EB",
        minHeight: 300,
      }}>
      {/* Column header */}
      <div className="p-3 flex items-center gap-2" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB", background: "#FFF" }}>
        <Av name={emp.name} dept={emp.dept} size={32} />
        <div className="min-w-0 flex-1">
          <p className="truncate" style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{emp.name}</p>
          <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{emp.dept} · {emp.role}</p>
        </div>
        <div className="text-right">
          <p className="tabular-nums" style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>{tasks.length}</p>
          <p className="tabular-nums" style={{ fontSize: "10px", color: "#9CA3AF" }}>{totalPts} pts</p>
        </div>
      </div>

      {/* Task cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 500 }}>
        {tasks.length === 0 ? (
          <div className="py-8 text-center rounded-lg" style={{
            borderWidth: "2px", borderStyle: "dashed", borderColor: isOver ? "#3B82F6" : "#E5E7EB",
            background: isOver ? "#DBEAFE" : "transparent",
          }}>
            <User className="w-5 h-5 mx-auto mb-2" style={{ color: "#D1D5DB" }} />
            <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
              {isOver ? "放開以指派" : "拖曳任務至此處"}
            </p>
          </div>
        ) : tasks.map(task => (
          <DraggableTaskCard key={task.id} task={task} assigneeName={workload.assigneeName} onDragStart={onDragStart} />
        ))}
        {tasks.length > 0 && isOver && (
          <div className="py-4 text-center rounded-lg" style={{ borderWidth: "2px", borderStyle: "dashed", borderColor: "#3B82F6", background: "#DBEAFE" }}>
            <p style={{ fontSize: "12px", color: "#2563EB", fontWeight: 600 }}>放開以指派至 {emp.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReassignBoard({ workloads, reassignTask, taskAssignments }: { workloads: EmployeeWorkload[]; reassignTask: (taskId: string, newAssignee: string, oldAssignee: string) => void; taskAssignments: Record<string, string> }) {
  const handleDragStart = useCallback((_taskId: string, _fromAssignee: string) => {
    // Could track globally if needed
  }, []);

  return (
    <CardBox>
      <div className="p-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>跨員工任務指派</p>
        <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>拖曳任務卡片到其他員工欄位，即可重新指派任務負責人</p>
      </div>
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-3" style={{ minWidth: "max-content" }}>
          {workloads
            .filter(w => w.assigneeName && (INIT_TASKS.some(t => taskAssignments[t.id] === w.assigneeName) || w.tasks.length === 0))
            .filter(w => INIT_TASKS.some(t => taskAssignments[t.id] === w.assigneeName) || w.employee.status === "active")
            .sort((a, b) => {
              const aTasks = INIT_TASKS.filter(t => taskAssignments[t.id] === a.assigneeName).length;
              const bTasks = INIT_TASKS.filter(t => taskAssignments[t.id] === b.assigneeName).length;
              return bTasks - aTasks;
            })
            .map(w => (
              <DropColumn key={w.employee.id} workload={w} reassignTask={reassignTask} taskAssignments={taskAssignments} onDragStart={handleDragStart} />
            ))}
        </div>
      </div>
    </CardBox>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: TREND CHARTS
// ═══════════════════════════════════════════════════════════════════════════════
function TrendCharts({ workloads }: { workloads: EmployeeWorkload[] }) {
  const [chartType, setChartType] = useState<"overview" | "perEmployee">("overview");

  const monthlyData = useMemo(() => generateMonthlyData(workloads), [workloads]);
  const perEmpData = useMemo(() => generatePerEmployeeMonthly(workloads), [workloads]);
  const activeNames = useMemo(() => workloads.filter(w => w.tasks.length > 0).map(w => w.employee.name), [workloads]);

  const customTooltipStyle: React.CSSProperties = {
    background: "#111827", color: "#FFF", borderRadius: 8, padding: "10px 14px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)", fontSize: "12px", borderWidth: 0,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Chart type switch */}
      <div className="flex items-center gap-1 p-1 rounded-lg self-start" style={{ background: "#F3F4F6" }}>
        {([
          { key: "overview" as const, label: "整體趨勢" },
          { key: "perEmployee" as const, label: "員工對比" },
        ]).map(t => {
          const active = chartType === t.key;
          return (
            <button key={t.key} onClick={() => setChartType(t.key)}
              className="px-3 py-1.5 rounded-md transition-all"
              style={{ fontSize: "13px", fontWeight: active ? 600 : 500, background: active ? "#FFF" : "transparent", color: active ? "#111827" : "#6B7280", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {chartType === "overview" && (
        <>
          {/* Points Chart */}
          <CardBox className="p-5">
            <div className="mb-4">
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>Story Points 月度趨勢</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>追蹤團隊每月 Story Points 總量與完成量的變化</p>
            </div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                  <RTooltip contentStyle={customTooltipStyle} cursor={{ fill: "#F9FAFB" }}
                    formatter={(value: number, name: string) => [value, name === "totalPoints" ? "總點數" : "已完成"]}
                    labelFormatter={(l) => `${l}份`} />
                  <Legend formatter={(v) => v === "totalPoints" ? "總點數" : "已完成點數"} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="totalPoints" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completedPoints" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBox>

          {/* Completion Rate Chart */}
          <CardBox className="p-5">
            <div className="mb-4">
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>完成率月度趨勢</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>追蹤團隊每月任務完成率的走勢</p>
            </div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false}
                    tickFormatter={v => `${v}%`} />
                  <RTooltip contentStyle={customTooltipStyle} formatter={(value: number) => [`${value}%`, "完成率"]} labelFormatter={(l) => `${l}份`} />
                  <Area type="monotone" dataKey="avgCompletion" stroke="#7C3AED" strokeWidth={2.5} fill="url(#completionGrad)"
                    dot={{ fill: "#7C3AED", r: 4, strokeWidth: 2, stroke: "#FFF" }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "#FFF" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBox>

          {/* Tasks Count Chart */}
          <CardBox className="p-5">
            <div className="mb-4">
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>任務量月度趨勢</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>追蹤團隊每月任務總數與已完成數量的變化</p>
            </div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                  <RTooltip contentStyle={customTooltipStyle}
                    formatter={(value: number, name: string) => [value, name === "totalTasks" ? "任務總數" : "已完成"]}
                    labelFormatter={(l) => `${l}份`} />
                  <Legend formatter={(v) => v === "totalTasks" ? "任務總數" : "已完成"} wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="totalTasks" stroke="#3B82F6" strokeWidth={2.5}
                    dot={{ fill: "#3B82F6", r: 4, strokeWidth: 2, stroke: "#FFF" }} />
                  <Line type="monotone" dataKey="completedTasks" stroke="#10B981" strokeWidth={2.5}
                    dot={{ fill: "#10B981", r: 4, strokeWidth: 2, stroke: "#FFF" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBox>
        </>
      )}

      {chartType === "perEmployee" && (
        <>
          {/* Per employee stacked bar */}
          <CardBox className="p-5">
            <div className="mb-4">
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>員工 Story Points 月度對比</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>堆疊柱狀圖顯示各員工每月工作量分佈，方便比較工作量是否均衡</p>
            </div>
            <div style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perEmpData} barCategoryGap="15%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                  <RTooltip contentStyle={customTooltipStyle} labelFormatter={(l) => `${l}份`}
                    formatter={(value: number, name: string) => [`${value} pts`, name]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {activeNames.map((name, i) => (
                    <Bar key={name} dataKey={name} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]}
                      radius={i === activeNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBox>

          {/* Per employee line chart */}
          <CardBox className="p-5">
            <div className="mb-4">
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>員工工作量趨勢線</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>折線圖追蹤各員工每月 Story Points 變化趨勢</p>
            </div>
            <div style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={perEmpData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
                  <RTooltip contentStyle={customTooltipStyle} labelFormatter={(l) => `${l}份`}
                    formatter={(value: number, name: string) => [`${value} pts`, name]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {activeNames.map((name, i) => (
                    <Line key={name} type="monotone" dataKey={name} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2}
                      dot={{ fill: CHART_COLORS[i % CHART_COLORS.length], r: 3, strokeWidth: 2, stroke: "#FFF" }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBox>

          {/* Current snapshot table */}
          <CardBox>
            <div className="p-4" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>即時工作量快照</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>目前各員工的任務數、點數及完成率一覽</p>
            </div>
            <div className="overflow-x-auto">
              <div className="hidden md:grid px-5 py-2.5" style={{ gridTemplateColumns: "1.5fr 0.6fr 0.6fr 0.6fr 0.6fr 1fr", background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                {["員工", "任務數", "進行中", "總點數", "完成率", "負載狀態"].map(h => (
                  <span key={h} style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em" }}>{h}</span>
                ))}
              </div>
              {workloads.filter(w => w.tasks.length > 0).sort((a, b) => b.totalPoints - a.totalPoints).map((w, idx, arr) => {
                const wlLevel = w.overdueTasks > 0 ? "overdue" : w.activeTasks >= 4 ? "heavy" : w.activeTasks >= 1 ? "normal" : "idle";
                const WL_MAP = {
                  overdue: { label: "有逾期", color: "#DC2626", bg: "#FEF2F2" },
                  heavy:   { label: "高負載", color: "#EA580C", bg: "#FFF7ED" },
                  normal:  { label: "正常",   color: "#15803D", bg: "#F0FDF4" },
                  idle:    { label: "無任務", color: "#9CA3AF", bg: "#F9FAFB" },
                } as const;
                const wlCfg = WL_MAP[wlLevel];

                return (
                  <div key={w.employee.id}>
                    {/* Desktop */}
                    <div className="hidden md:grid items-center px-5 py-3.5" style={{
                      gridTemplateColumns: "1.5fr 0.6fr 0.6fr 0.6fr 0.6fr 1fr",
                      borderBottomWidth: idx < arr.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6",
                    }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                        <Av name={w.employee.name} dept={w.employee.dept} size={28} />
                        <div className="min-w-0">
                          <p className="truncate" style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{w.employee.name}</p>
                          <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{w.employee.dept}</p>
                        </div>
                      </div>
                      <span className="tabular-nums" style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{w.tasks.length}</span>
                      <span className="tabular-nums" style={{ fontSize: "14px", fontWeight: 600, color: "#2563EB" }}>{w.activeTasks}</span>
                      <span className="tabular-nums" style={{ fontSize: "14px", fontWeight: 600, color: "#7C3AED" }}>{w.totalPoints}</span>
                      <div className="flex items-center gap-2">
                        <ProgressBar pct={w.avgCompletion} color={w.avgCompletion >= 70 ? "#15803D" : w.avgCompletion >= 40 ? "#CA8A04" : "#374151"} h={5} />
                        <span className="tabular-nums" style={{ fontSize: "12px", color: "#6B7280" }}>{w.avgCompletion}%</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md w-fit"
                        style={{ fontSize: "12px", fontWeight: 600, background: wlCfg.bg, color: wlCfg.color }}>
                        {wlLevel === "overdue" && <AlertTriangle className="w-3 h-3" />}
                        {wlCfg.label}
                      </span>
                    </div>
                    {/* Mobile */}
                    <div className="md:hidden px-4 py-3" style={{
                      borderBottomWidth: idx < arr.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6",
                    }}>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                        <Av name={w.employee.name} dept={w.employee.dept} size={28} />
                        <div className="flex-1 min-w-0">
                          <p className="truncate" style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{w.employee.name}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
                          style={{ fontSize: "11px", fontWeight: 600, background: wlCfg.bg, color: wlCfg.color }}>
                          {wlCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 pl-[44px]">
                        <span style={{ fontSize: "12px", color: "#6B7280" }}>{w.tasks.length} 任務</span>
                        <span style={{ fontSize: "12px", color: "#6B7280" }}>{w.totalPoints} pts</span>
                        <span style={{ fontSize: "12px", color: "#6B7280" }}>{w.avgCompletion}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBox>
        </>
      )}
    </div>
  );
}
