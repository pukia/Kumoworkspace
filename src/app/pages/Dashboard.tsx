import {
  Receipt,
  Users,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
  { name: "本月收入", value: "NT$128,500", change: "+12.5%", icon: TrendingUp, positive: true, sub: "較上月", bg: "#F0FDF4", c: "#16A34A" },
  { name: "本月支出", value: "NT$45,200", change: "+5.2%", icon: Receipt, positive: false, sub: "較上月", bg: "#FEF2F2", c: "#DC2626" },
  { name: "在職員工", value: "48", change: "+2", icon: Users, positive: true, sub: "新增人員", bg: "#EFF6FF", c: "#2563EB" },
  { name: "待處理任務", value: "12", change: "-3", icon: AlertCircle, positive: true, sub: "較昨日", bg: "#FEF9C3", c: "#CA8A04" },
];

const monthlyData = [
  { id: "m1", month: "1月", income: 95000, expense: 42000 },
  { id: "m2", month: "2月", income: 105000, expense: 38000 },
  { id: "m3", month: "3月", income: 118000, expense: 45000 },
  { id: "m4", month: "4月", income: 125000, expense: 43000 },
  { id: "m5", month: "5月", income: 132000, expense: 47000 },
  { id: "m6", month: "6月", income: 128500, expense: 45200 },
];

const attendanceData = [
  { id: "d1", day: "週一", rate: 95 },
  { id: "d2", day: "週二", rate: 98 },
  { id: "d3", day: "週三", rate: 92 },
  { id: "d4", day: "週四", rate: 96 },
  { id: "d5", day: "週五", rate: 94 },
];

const recentActivities = [
  { id: 1, type: "finance", title: "新增收入記錄", desc: "客戶付款 NT$25,000", time: "2 小時前" },
  { id: 2, type: "attendance", title: "打卡異常", desc: "張三 遲到 15 分鐘", time: "3 小時前" },
  { id: 3, type: "task", title: "任務完成", desc: "Q2 財務報表已送出", time: "5 小時前" },
  { id: 4, type: "announcement", title: "新公告", desc: "下週一員工旅遊通知", time: "1 天前" },
];

const projectSummary = [
  { name: "電商平台改版", progress: 65, status: "進行中", deadline: "2026-04-30" },
  { name: "企業內部 ERP", progress: 40, status: "進行中", deadline: "2026-06-30" },
  { name: "智慧倉儲系統", progress: 75, status: "進行中", deadline: "2026-04-15" },
];

// ─── Shared chart tooltip (matches site-wide spec) ────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111827", borderRadius: "8px", padding: "10px 14px", color: "#FFF", fontSize: "13px", lineHeight: 1.8, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey}>
          <span style={{ color: p.fill || p.stroke, marginRight: 6 }}>●</span>
          {p.name}：{typeof p.value === "number"
            ? (p.name === "出勤率" ? `${p.value}%` : `NT$${p.value.toLocaleString()}`)
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Card wrapper (split border for Tailwind v4) ─────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={className} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
    {children}
  </div>
);

// ─── Admin-only full dashboard ───────────────────────────────────────────────
export function Dashboard() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 max-md:flex-col max-md:items-stretch">
        <div>
          <h1 style={{ color: "#111827" }}>總覽</h1>
          <p style={{ fontSize: "15px", color: "#9CA3AF", marginTop: 2 }}>
            2026年3月13日（金）· 本日資料已更新
          </p>
        </div>
        <div className="px-3 py-1.5 rounded max-md:ml-auto text-right" style={{ background: "#F3F4F6", fontSize: "15px", color: "#6B7280" }}>最後更新：09:42</div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.04em" }}>{stat.name}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: stat.c }} />
                </div>
              </div>
              <p className="tabular-nums" style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>{stat.value}</p>
              <div className="flex items-center gap-1 mt-2">
                {stat.positive ? <ArrowUpRight className="w-3 h-3" style={{ color: "#16A34A" }} /> : <ArrowDownRight className="w-3 h-3" style={{ color: "#DC2626" }} />}
                <span className="tabular-nums" style={{ fontSize: "12px", color: stat.positive ? "#16A34A" : "#DC2626" }}>{stat.change}</span>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{stat.sub}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: "#111827" }}>收支趨勢</h3>
              <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "2px" }}>近六個月</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#111827" }} /><span style={{ fontSize: "14px", color: "#6B7280" }}>收入</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#D1D5DB" }} /><span style={{ fontSize: "14px", color: "#6B7280" }}>支出</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barGap={4} barCategoryGap="25%">
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis key="x" dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="y" stroke="#9CA3AF" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={42} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip key="tt" content={<ChartTooltip />} cursor={{ fill: "#F9FAFB" }} />
              <Bar key="b1" dataKey="income" fill="#111827" name="收入" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar key="b2" dataKey="expense" fill="#D1D5DB" name="支出" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: "#111827" }}>本週出勤率</h3>
              <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "2px" }}>2026年第11週</p>
            </div>
            <div className="px-2.5 py-1 rounded" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "15px", color: "#374151", fontWeight: 500 }}>平均 95%</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={attendanceData}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis key="x" dataKey="day" stroke="#9CA3AF" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="y" stroke="#9CA3AF" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[85, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip key="tt" content={<ChartTooltip />} cursor={{ fill: "#F9FAFB" }} />
              <Line key="l" type="monotone" dataKey="rate" stroke="#111827" strokeWidth={2} dot={{ fill: "#111827", r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5.5, fill: "#111827" }} name="出勤率" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ color: "#111827" }}>最近活動</h3>
            <button style={{ fontSize: "14px", color: "#6B7280" }} className="hover:underline">查看全部</button>
          </div>
          <div className="space-y-0">
            {recentActivities.map((activity, idx) => (
              <div key={activity.id} className="flex items-start gap-3 py-3" style={{ borderBottomWidth: idx < recentActivities.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#F3F4F6" }}>
                  {activity.type === "finance" && <Receipt className="w-3.5 h-3.5" style={{ color: "#374151" }} />}
                  {activity.type === "attendance" && <Clock className="w-3.5 h-3.5" style={{ color: "#374151" }} />}
                  {activity.type === "task" && <CheckCircle className="w-3.5 h-3.5" style={{ color: "#374151" }} />}
                  {activity.type === "announcement" && <AlertCircle className="w-3.5 h-3.5" style={{ color: "#374151" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "15px", fontWeight: 500, color: "#111827" }}>{activity.title}</p>
                  <p style={{ fontSize: "15px", color: "#6B7280", marginTop: "1px" }}>{activity.desc}</p>
                </div>
                <span style={{ fontSize: "14px", color: "#9CA3AF", flexShrink: 0 }}>{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ color: "#111827" }}>進行中專案</h3>
            <span className="px-2 py-0.5 rounded" style={{ background: "#F3F4F6", fontSize: "13px", color: "#6B7280" }}>{projectSummary.length} 件</span>
          </div>
          <div className="space-y-4">
            {projectSummary.map((project) => (
              <div key={project.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{project.name}</p>
                  <span className="tabular-nums" style={{ fontSize: "14px", fontWeight: 700, color: "#374151" }}>{project.progress}%</span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: "4px", background: "#F3F4F6" }}>
                  <div className="h-full rounded-full" style={{ width: `${project.progress}%`, background: "#111827" }} />
                </div>
                <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px" }}>截止 {project.deadline}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}