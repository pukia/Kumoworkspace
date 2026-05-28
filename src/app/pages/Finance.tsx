import { useState, useMemo } from "react";
import {
  Plus, Search, Download, TrendingUp, TrendingDown, Receipt,
  ArrowUpRight, ArrowDownRight, Pencil, Trash2, X,
  ChevronLeft, ChevronRight as ChevronRightIcon, FileText,
  AlertTriangle, Check,
} from "lucide-react";
import { StyledSelect } from "../components/StyledSelect";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip,
} from "recharts";

import { SubNav } from "../components/SubNav";
import { DatePicker } from "../components/DatePicker";
import { exportCSV, ntd } from "../components/ExportCSV";

// ─── Types ─────────────────────────────────────────────────────────────────
type TxType = "income" | "expense";

interface Transaction {
  id: number;
  date: string;
  type: TxType;
  category: string;
  amount: number;
  account: string;
  desc: string;
  invoice: string;
  note: string;
}

// ─── Static Data ────────────────────────────────────────────────────────────
const INCOME_CATEGORIES = ["客戶付款", "服務收入", "顧問費", "授權金", "其他收入"];
const EXPENSE_CATEGORIES = ["辦公用品", "員工薪資", "租金水電", "交通費用", "業務費用", "軟體訂閱", "其他支出"];
const ACCOUNTS = ["公司帳戶", "薪資帳戶", "備用金", "信用卡"];

const initialTransactions: Transaction[] = [
  { id: 1,  date: "2026-03-07", type: "income",  category: "客戶付款", amount: 25000, account: "公司帳戶", desc: "專案 A 尾款",    invoice: "INV-2026-001", note: "" },
  { id: 2,  date: "2026-03-06", type: "expense", category: "辦公用品", amount: 3500,  account: "公司帳戶", desc: "採購辦公設備",  invoice: "INV-2026-002", note: "含發票" },
  { id: 3,  date: "2026-03-05", type: "income",  category: "服務收入", amount: 18000, account: "公司帳戶", desc: "顧問服務費",    invoice: "INV-2026-003", note: "" },
  { id: 4,  date: "2026-03-04", type: "expense", category: "員工薪資", amount: 85000, account: "薪資帳戶", desc: "2月薪資發放",  invoice: "INV-2026-004", note: "含勞健保" },
  { id: 5,  date: "2026-03-03", type: "expense", category: "租金水電", amount: 12000, account: "公司帳戶", desc: "辦公室租金",    invoice: "INV-2026-005", note: "" },
  { id: 6,  date: "2026-03-02", type: "income",  category: "客戶付款", amount: 32000, account: "公司帳戶", desc: "專案 B 訂金",   invoice: "INV-2026-006", note: "" },
  { id: 7,  date: "2026-03-01", type: "expense", category: "交通費用", amount: 4500,  account: "公司帳戶", desc: "出差報帳",      invoice: "INV-2026-007", note: "含收據" },
  { id: 8,  date: "2026-02-28", type: "income",  category: "授權金",   amount: 15000, account: "公司帳戶", desc: "軟體授權費",   invoice: "INV-2026-008", note: "" },
  { id: 9,  date: "2026-02-25", type: "expense", category: "軟體訂閱", amount: 2800,  account: "公司帳戶", desc: "SaaS 月費",    invoice: "INV-2026-009", note: "" },
  { id: 10, date: "2026-02-20", type: "income",  category: "服務收入", amount: 42000, account: "公司帳戶", desc: "系統整合費",   invoice: "INV-2026-010", note: "" },
  { id: 11, date: "2026-02-18", type: "expense", category: "業務費用", amount: 6200,  account: "公司帳戶", desc: "客戶招待費",   invoice: "INV-2026-011", note: "" },
  { id: 12, date: "2026-02-15", type: "income",  category: "顧問費",   amount: 28000, account: "公司帳戶", desc: "季度顧問合約",  invoice: "INV-2026-012", note: "" },
  { id: 13, date: "2026-02-10", type: "expense", category: "辦公用品", amount: 1800,  account: "備用金",   desc: "文具耗材",    invoice: "INV-2026-013", note: "" },
  { id: 14, date: "2026-02-05", type: "income",  category: "客戶付款", amount: 55000, account: "公司帳戶", desc: "年度維護合約",  invoice: "INV-2026-014", note: "" },
  { id: 15, date: "2026-01-31", type: "expense", category: "員工薪資", amount: 85000, account: "薪資帳戶", desc: "1月薪資發放",  invoice: "INV-2026-015", note: "" },
  { id: 16, date: "2026-01-25", type: "income",  category: "服務收入", amount: 19500, account: "公司帳戶", desc: "技術支援費",   invoice: "INV-2026-016", note: "" },
  { id: 17, date: "2026-01-20", type: "expense", category: "租金水電", amount: 12000, account: "公司帳戶", desc: "辦公室租金",    invoice: "INV-2026-017", note: "" },
  { id: 18, date: "2026-01-15", type: "income",  category: "客戶付款", amount: 38000, account: "公司帳戶", desc: "專案 C 尾款",   invoice: "INV-2026-018", note: "" },
];

const monthlyChartData = [
  { month: "10月", income: 168000, expense: 112000 },
  { month: "11月", income: 195000, expense: 128000 },
  { month: "12月", income: 142000, expense: 135000 },
  { month: "1月",  income: 215000, expense: 145000 },
  { month: "2月",  income: 188000, expense: 132000 },
  { month: "3月",  income: 128500, expense: 105000 },
];

const categoryChartData = [
  { name: "客戶付款", value: 75000 },
  { name: "服務收入", value: 42000 },
  { name: "薪",    value: 85000 },
  { name: "顧問費",  value: 28000 },
  { name: "租金",    value: 12000 },
  { name: "其他",    value: 20500 },
];

const PAGE_SIZE = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => `NT$${n.toLocaleString()}`;
const nextId = (txs: Transaction[]) => Math.max(...txs.map((t) => t.id), 0) + 1;

// ─── Sub-components ──────────────────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={className}
    style={{
      background: "#FFFFFF",
      borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}
  >
    {children}
  </div>
);

const Badge = ({ type }: { type: TxType }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded"
    style={{
      fontSize: "13px",
      fontWeight: 500,
      background: type === "income" ? "#F0FDF4" : "#FEF2F2",
      color: type === "income" ? "#15803D" : "#DC2626",
    }}
  >
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{ background: type === "income" ? "#16A34A" : "#DC2626" }}
    />
    {type === "income" ? "收入" : "支出"}
  </span>
);

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111827", borderRadius: "8px", padding: "10px 14px", color: "#FFF", fontSize: "13px", lineHeight: 1.8, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
      <p style={{ fontWeight: 600, marginBottom: "4px" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey}>
          <span style={{ color: p.fill || p.stroke, marginRight: 6 }}>●</span>
          {p.name}：NT${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

// ─── Form Initial State ────────────────────────────────────────────────────
const emptyForm = (): Omit<Transaction, "id"> => ({
  date: new Date().toISOString().slice(0, 10),
  type: "income",
  category: "客戶付款",
  amount: 0,
  account: "公司帳戶",
  desc: "",
  invoice: "",
  note: "",
});

// ─── Main Component ──────────────────────────────────────────────────────────
export function Finance() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [subTab, setSubTab]               = useState<"overview" | "records">("overview");
  const [searchTerm, setSearchTerm]       = useState("");
  const [filterType, setFilterType]       = useState<"all" | TxType>("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage]     = useState(1);

  // Modal state
  const [isFormOpen, setIsFormOpen]       = useState(false);
  const [editingTx, setEditingTx]         = useState<Transaction | null>(null);
  const [form, setForm]                   = useState<Omit<Transaction, "id">>(emptyForm());
  const [formErrors, setFormErrors]       = useState<Record<string, string>>({});

  // Delete confirm
  const [deleteId, setDeleteId]           = useState<number | null>(null);

  // Toast
  const [toast, setToast]                 = useState<{ msg: string; ok: boolean } | null>(null);

  // ─── Derived ──────────────────────────────────────────────────────────────
  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return ["all", ...Array.from(cats)];
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = [t.desc, t.category, t.invoice, t.account]
        .join(" ").toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === "all" || t.type === filterType;
      const matchCat  = filterCategory === "all" || t.category === filterCategory;
      return matchSearch && matchType && matchCat;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, searchTerm, filterType, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalIncome  = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance      = totalIncome - totalExpense;

  const thisMonth = transactions.filter((t) => t.date.startsWith("2026-03"));
  const monthIncome  = thisMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthExpense = thisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // ─── Toast helper ────────────────────────────────────────────────────────
  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  // ─── Pagination helper ───────────────────────────────────────────────────
  const goPage = (p: number) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  // ─── Open form ───────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingTx(null);
    setForm(emptyForm());
    setFormErrors({});
    setIsFormOpen(true);
  };
  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    const { id, ...rest } = tx;
    setForm(rest);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // ─── Validate ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.date) errs.date = "請選擇日期";
    if (!form.desc.trim()) errs.desc = "請輸入說明";
    if (!form.amount || form.amount <= 0) errs.amount = "請輸入有效金額";
    if (!form.invoice.trim()) errs.invoice = "請輸入發票號碼";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) return;
    if (editingTx) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingTx.id ? { ...form, id: editingTx.id } : t))
      );
      showToast("交易記錄已更新");
    } else {
      const newTx: Transaction = { ...form, id: nextId(transactions) };
      setTransactions((prev) => [newTx, ...prev]);
      showToast("新增記錄成功");
    }
    setIsFormOpen(false);
    setCurrentPage(1);
  };

  // ─── Delete ──────────────────────────────────────────────────────────
  const confirmDelete = () => {
    if (deleteId == null) return;
    setTransactions((prev) => prev.filter((t) => t.id !== deleteId));
    setDeleteId(null);
    showToast("記錄已刪除", false);
  };

  // ─── Form field change ──────────────────────────────────────────────────
  const setField = <K extends keyof Omit<Transaction, "id">>(k: K, v: Omit<Transaction, "id">[K]) => {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "type") {
        next.category = v === "income" ? "客戶付款" : "辦公用品";
      }
      return next;
    });
    setFormErrors((e) => { const { [k]: _, ...rest } = e; return rest; });
  };

  // ─── Input styles ─────────────────────────────────────────────────────────
  const inputStyle = (err?: string): React.CSSProperties => ({
    width: "100%",
    padding: "8px 12px",
    fontSize: "15px",
    background: "#F9FAFB",
    borderWidth: "1px", borderStyle: "solid", borderColor: err ? "#DC2626" : "#E5E7EB",
    borderRadius: "6px",
    color: "#111827",
    outline: "none",
    fontFamily: "inherit",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "5px",
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{
            background: toast.ok ? "#111827" : "#DC2626",
            color: "#FFFFFF",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          {toast.ok
            ? <Check className="w-4 h-4" />
            : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 max-md:flex-col max-md:items-stretch max-md:gap-3">
        <div>
          <h1 style={{ color: "#111827" }}>財務管理</h1>
          <p style={{ fontSize: "15px", color: "#9CA3AF", marginTop: 2 }}>
            管理公司收支記錄與財務報表
          </p>
        </div>
        <div className="flex gap-2 max-md:w-full">
          <button
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors max-md:flex-1"
            style={{
              background: "#F9FAFB",
              borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
              fontSize: "13px",
              color: "#374151",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
            onClick={() => exportCSV("財務報表_全部交易.csv", [
              { header: "日期", accessor: t => t.date },
              { header: "類型", accessor: t => t.type === "income" ? "收入" : "支出" },
              { header: "類別", accessor: t => t.category },
              { header: "說明", accessor: t => t.desc },
              { header: "帳戶", accessor: t => t.account },
              { header: "發票號碼", accessor: t => t.invoice },
              { header: "金額", accessor: t => t.amount },
              { header: "備註", accessor: t => t.note },
            ], transactions)}
          >
            <Download className="w-3.5 h-3.5" />
            匯出報表
          </button>
          {subTab === "records" && (
            <button
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors max-md:flex-1"
              style={{ background: "#111827", color: "#FFFFFF", fontSize: "13px", fontWeight: 500 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}
              onClick={openAdd}
            >
              <Plus className="w-3.5 h-3.5" />
              新增記錄
            </button>
          )}
        </div>
      </div>

      {/* ── Sub Navigation ───────────────────────────────────────────── */}
      <SubNav
        tabs={[
          { key: "overview", label: "財務總覽" },
          { key: "records",  label: "收支明細", count: transactions.length },
        ]}
        active={subTab}
        onChange={(k) => setSubTab(k as any)}
      />

      {/* ── Tab: 財務總覽 ─────────────────────────────────────────────── */}
      {subTab === "overview" && (
        <div className="space-y-6">
          {/* ── Summary Cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "本月收入",  value: fmt(monthIncome),  change: "+12.5%", positive: true,  icon: TrendingUp,   bg: "#F0FDF4", c: "#16A34A" },
              { label: "本月支出",  value: fmt(monthExpense), change: "+5.2%",  positive: false, icon: TrendingDown, bg: "#FEF2F2", c: "#DC2626" },
              { label: "累計淨收益", value: fmt(balance),      change: "+8.1%",  positive: true,  icon: Receipt,      bg: "#EFF6FF", c: "#2563EB" },
              { label: "交易筆數",  value: `${transactions.length} 筆`, change: `+${transactions.filter(t=>t.date.startsWith("2026-03")).length}`, positive: true, icon: FileText, bg: "#F9FAFB", c: "#374151" },
            ].map((item) => {
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
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {item.positive
                      ? <ArrowUpRight className="w-3 h-3" style={{ color: "#16A34A" }} />
                      : <ArrowDownRight className="w-3 h-3" style={{ color: "#DC2626" }} />}
                    <span className="tabular-nums" style={{ fontSize: "12px", color: item.positive ? "#16A34A" : "#DC2626" }}>
                      {item.change}
                    </span>
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>vs 上月</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* ── Charts ────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Monthly trend - takes 2 cols */}
            <Card className="lg:col-span-2 p-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between p-5 pb-0">
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>收支趨勢</h3>
                  <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "2px" }}>近六個月月度收支對比</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5" style={{ fontSize: "13px", color: "#6B7280" }}>
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#111827" }} />
                    收入
                  </span>
                  <span className="flex items-center gap-1.5" style={{ fontSize: "13px", color: "#6B7280" }}>
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#D1D5DB" }} />
                    支出
                  </span>
                </div>
              </div>

              {/* Summary row */}
              <div className="flex gap-6 px-5 pt-4 pb-2 max-md:gap-4 max-md:flex-col max-md:overflow-x-visible">
                {(() => {
                  const totalIn = monthlyChartData.reduce((s, d) => s + d.income, 0);
                  const totalOut = monthlyChartData.reduce((s, d) => s + d.expense, 0);
                  const avgIn = Math.round(totalIn / monthlyChartData.length);
                  const avgOut = Math.round(totalOut / monthlyChartData.length);
                  return (
                    <>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.04em", fontWeight: 500, whiteSpace: "nowrap" }}>六個月累計收入</p>
                        <p className="tabular-nums" style={{ fontSize: "20px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                          NT${totalIn.toLocaleString()}
                        </p>
                        <p className="tabular-nums" style={{ fontSize: "12px", color: "#6B7280", marginTop: "1px" }}>
                          月均 NT${avgIn.toLocaleString()}
                        </p>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.04em", fontWeight: 500, whiteSpace: "nowrap" }}>六個月累計支出</p>
                        <p className="tabular-nums" style={{ fontSize: "20px", fontWeight: 700, color: "#6B7280", lineHeight: 1.3 }}>
                          NT${totalOut.toLocaleString()}
                        </p>
                        <p className="tabular-nums" style={{ fontSize: "12px", color: "#6B7280", marginTop: "1px" }}>
                          月均 NT${avgOut.toLocaleString()}
                        </p>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "11px", color: "#9CA3AF", letterSpacing: "0.04em", fontWeight: 500, whiteSpace: "nowrap" }}>累計淨額</p>
                        <p className="tabular-nums" style={{ fontSize: "20px", fontWeight: 700, color: totalIn - totalOut >= 0 ? "#15803D" : "#DC2626", lineHeight: 1.3 }}>
                          {totalIn - totalOut >= 0 ? "+" : ""}NT${(totalIn - totalOut).toLocaleString()}
                        </p>
                        <p className="tabular-nums" style={{ fontSize: "12px", color: "#6B7280", marginTop: "1px" }}>
                          收支比 {((totalIn / totalOut) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Chart */}
              <div className="px-2 pb-1 pt-1">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyChartData} barGap={4} barCategoryGap="25%">
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis key="xaxis" dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis key="yaxis" stroke="#9CA3AF" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={42} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip key="tooltip" content={<ChartTooltip />} cursor={{ fill: "#F9FAFB" }} />
                    <Bar key="bar-income" dataKey="income" name="收入" fill="#111827" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    <Bar key="bar-expense" dataKey="expense" name="支出" fill="#D1D5DB" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom month-by-month net row */}
              <div
                className="flex overflow-x-auto px-5 py-3 gap-0"
                style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}
              >
                {monthlyChartData.map((d, i) => {
                  const net = d.income - d.expense;
                  return (
                    <div
                      key={d.month}
                      className="flex-1 text-center"
                      style={{
                        minWidth: 0,
                        borderRightWidth: i < monthlyChartData.length - 1 ? "1px" : 0,
                        borderRightStyle: "solid",
                        borderRightColor: "#F3F4F6",
                      }}
                    >
                      <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{d.month}淨額</p>
                      <p
                        className="tabular-nums"
                        style={{ fontSize: "13px", fontWeight: 600, color: net >= 0 ? "#15803D" : "#DC2626", marginTop: "1px" }}
                      >
                        {net >= 0 ? "+" : ""}{(net / 1000).toFixed(0)}K
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Category summary - 1 col */}
            <Card className="p-5">
              <div className="mb-5">
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>類別分佈</h3>
                <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "2px" }}>本月主要項目</p>
              </div>
              <div className="space-y-3">
                {categoryChartData.map((item, i) => {
                  const max = Math.max(...categoryChartData.map((d) => d.value));
                  const pct = Math.round((item.value / max) * 100);
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>{item.name}</span>
                        <span className="tabular-nums" style={{ fontSize: "14px", color: "#111827", fontWeight: 600 }}>
                          NT${item.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full rounded-full overflow-hidden" style={{ height: "5px", background: "#F3F4F6" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: i % 2 === 0 ? "#111827" : "#9CA3AF",
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className="mt-4 pt-4 flex items-center justify-between"
                style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}
              >
                <span style={{ fontSize: "14px", color: "#9CA3AF" }}>本月合計支出</span>
                <span className="tabular-nums" style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                  {fmt(monthExpense)}
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Tab: 收支明細 ────────────────────────────────────────────── */}
      {subTab === "records" && (
        <Card>
          {/* Filters */}
          <div
            className="flex flex-wrap gap-3 p-4"
            style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}
          >
            {/* Search */}
            <div className="relative flex-1" style={{ minWidth: 180 }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
              <input
                type="text"
                placeholder="搜尋說明、類別、發票號碼..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 rounded outline-none"
                style={{
                  background: "#F9FAFB",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "#E5E7EB",
                  fontSize: "13px",
                  color: "#111827",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div className="flex gap-2 flex-wrap max-md:w-full max-md:flex-col">
              {/* Type filter */}
              <StyledSelect
                value={filterType}
                onChange={(v) => { setFilterType(v as any); setCurrentPage(1); }}
                allLabel="全部類型"
                options={[{ key: "income", label: "收入" }, { key: "expense", label: "支出" }]}
                className="max-md:w-full"
              />

              {/* Category filter */}
              <StyledSelect
                value={filterCategory}
                onChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}
                allLabel="全部類別"
                options={allCategories.filter(c => c !== "all").map(c => ({ key: c, label: c }))}
                className="max-md:w-full"
              />

              <button
                className="flex items-center gap-2 px-3 py-2 rounded"
                style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#374151" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                onClick={() => exportCSV("收支明細_篩選結果.csv", [
                  { header: "日期", accessor: t => t.date },
                  { header: "類型", accessor: t => t.type === "income" ? "收入" : "支出" },
                  { header: "類別", accessor: t => t.category },
                  { header: "說明", accessor: t => t.desc },
                  { header: "帳戶", accessor: t => t.account },
                  { header: "發票號碼", accessor: t => t.invoice },
                  { header: "金額", accessor: t => t.amount },
                  { header: "備註", accessor: t => t.note },
                ], filtered)}
              >
                <Download className="w-3.5 h-3.5" />
                匯出
              </button>
            </div>
          </div>

          {/* Filter result summary */}
          {(searchTerm || filterType !== "all" || filterCategory !== "all") && (
            <div
              className="flex items-center gap-2 px-4 py-2.5"
              style={{ background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}
            >
              <span style={{ fontSize: "13px", color: "#6B7280" }}>
                篩選結果：共 <strong style={{ color: "#111827" }}>{filtered.length}</strong> 筆記錄
              </span>
              <button
                className="flex items-center gap-1 px-2 py-0.5 rounded"
                style={{ fontSize: "12px", color: "#9CA3AF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", background: "#FFFFFF" }}
                onClick={() => { setSearchTerm(""); setFilterType("all"); setFilterCategory("all"); setCurrentPage(1); }}
              >
                <X className="w-3 h-3" /> 清除篩選
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full hidden md:table">
              <thead>
                <tr style={{ background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                  {["日期", "類型", "類別", "說明", "帳戶", "發票號碼", "金額", "操作"].map((h, i) => (
                    <th
                      key={h}
                      className="px-5 py-2.5"
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#9CA3AF",
                        textAlign: i === 6 ? "right" : "left",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center" style={{ fontSize: "14px", color: "#9CA3AF" }}>
                      找不到符合條件的交易記錄
                    </td>
                  </tr>
                ) : (
                  paginated.map((t, idx) => (
                    <tr
                      key={t.id}
                      style={{
                        borderBottomWidth: idx < paginated.length - 1 ? "1px" : 0, borderBottomStyle: "solid", borderBottomColor: "#F9FAFB",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {/* Date */}
                      <td className="px-5 py-3.5 tabular-nums" style={{ fontSize: "13px", color: "#6B7280", whiteSpace: "nowrap" }}>
                        {t.date}
                      </td>
                      {/* Type badge */}
                      <td className="px-5 py-3.5">
                        <Badge type={t.type} />
                      </td>
                      {/* Category */}
                      <td className="px-5 py-3.5" style={{ fontSize: "14px", color: "#374151" }}>
                        {t.category}
                      </td>
                      {/* Desc */}
                      <td className="px-5 py-3.5">
                        <p style={{ fontSize: "14px", color: "#111827", fontWeight: 500 }}>{t.desc}</p>
                        {t.note && (
                          <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "1px" }}>{t.note}</p>
                        )}
                      </td>
                      {/* Account */}
                      <td className="px-5 py-3.5" style={{ fontSize: "13px", color: "#6B7280", whiteSpace: "nowrap" }}>
                        {t.account}
                      </td>
                      {/* Invoice */}
                      <td className="px-5 py-3.5 tabular-nums" style={{ fontSize: "12px", color: "#9CA3AF", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                        {t.invoice}
                      </td>
                      {/* Amount */}
                      <td className="px-5 py-3.5 tabular-nums" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: t.type === "income" ? "#15803D" : "#374151",
                          }}
                        >
                          {t.type === "income" ? "+" : "−"}NT${t.amount.toLocaleString()}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            title="編輯"
                            className="w-8 h-8 rounded flex items-center justify-center"
                            style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                            onClick={() => openEdit(t)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="刪除"
                            className="w-8 h-8 rounded flex items-center justify-center"
                            style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                            onClick={() => setDeleteId(t.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden">
              {paginated.length === 0 ? (
                <div className="py-12 text-center" style={{ fontSize: "14px", color: "#9CA3AF" }}>
                  找不到符合條件的交易記錄
                </div>
              ) : (
                paginated.map((t, idx) => (
                  <div key={t.id} className="px-4 py-3" style={{ borderBottomWidth: idx < paginated.length - 1 ? "1px" : 0, borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge type={t.type} />
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{t.desc}</span>
                      </div>
                      <span
                        className="tabular-nums"
                        style={{ fontSize: "14px", fontWeight: 600, color: t.type === "income" ? "#15803D" : "#374151", whiteSpace: "nowrap" }}
                      >
                        {t.type === "income" ? "+" : "−"}NT${t.amount.toLocaleString()}
                      </span>
                    </div>
                    {t.note && <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: 2 }}>{t.note}</p>}
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>{t.date}</span>
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>·</span>
                      <span style={{ fontSize: "12px", color: "#374151" }}>{t.category}</span>
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>·</span>
                      <span style={{ fontSize: "12px", color: "#6B7280" }}>{t.account}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="tabular-nums" style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{t.invoice}</span>
                      <div className="flex items-center gap-1.5">
                        <button title="編輯" className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "#6B7280" }} onClick={() => openEdit(t)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button title="刪除" className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "#DC2626" }} onClick={() => setDeleteId(t.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}
          >
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
              顯示第 {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} 筆，共 {filtered.length} 筆
            </p>
            <div className="flex items-center gap-1">
              <button
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{
                  fontSize: "12px",
                  borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
                  color: currentPage === 1 ? "#D1D5DB" : "#374151",
                  background: "transparent",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
                onClick={() => goPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} style={{ fontSize: "13px", color: "#9CA3AF", padding: "0 4px" }}>…</span>
                  ) : (
                    <button
                      key={p}
                      className="w-7 h-7 rounded flex items-center justify-center"
                      style={{
                        fontSize: "12px",
                        background: p === currentPage ? "#111827" : "transparent",
                        color: p === currentPage ? "#FFFFFF" : "#6B7280",
                        border: p === currentPage ? "none" : "1px solid #E5E7EB",
                        cursor: "pointer",
                      }}
                      onClick={() => goPage(p as number)}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{
                  fontSize: "12px",
                  borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB",
                  color: currentPage === totalPages ? "#D1D5DB" : "#374151",
                  background: "transparent",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                }}
                onClick={() => goPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Add / Edit Modal ──────────────────────────────────────────── */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 max-md:p-0"
          style={{ background: "rgba(17,24,39,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsFormOpen(false); }}
        >
          <div
            className="w-full max-w-xl flex flex-col max-md:max-w-none max-md:h-full max-md:rounded-none"
            style={{
              background: "#FFFFFF",
              borderRadius: "12px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              maxHeight: "90vh",
              overflow: "hidden",
            }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}
            >
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                  {editingTx ? "編輯交易記錄" : "新增交易記錄"}
                </h2>
                <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "2px" }}>
                  {editingTx ? `正在編輯：${editingTx.invoice}` : "填寫以下欄位新增一筆交易"}
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 max-md:px-4 max-md:py-4 overflow-y-auto flex-1 space-y-4">
              {/* Row 1: type + date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>類型 <span style={{ color: "#DC2626" }}>*</span></label>
                  <div className="flex gap-2">
                    {(["income", "expense"] as TxType[]).map((tp) => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setField("type", tp)}
                        className="flex-1 py-2 rounded flex items-center justify-center gap-2 transition-all"
                        style={{
                          fontSize: "13px",
                          fontWeight: form.type === tp ? 600 : 400,
                          background: form.type === tp
                            ? (tp === "income" ? "#F0FDF4" : "#FEF2F2")
                            : "#F9FAFB",
                          border: form.type === tp
                            ? `1.5px solid ${tp === "income" ? "#16A34A" : "#DC2626"}`
                            : "1px solid #E5E7EB",
                          color: form.type === tp
                            ? (tp === "income" ? "#15803D" : "#DC2626")
                            : "#6B7280",
                          fontFamily: "inherit",
                        }}
                      >
                        {tp === "income" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {tp === "income" ? "收入" : "支出"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>日期 <span style={{ color: "#DC2626" }}>*</span></label>
                  <DatePicker value={form.date} onChange={(v) => setField("date", v)} placeholder="選擇日期" formField />
                  {formErrors.date && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "3px" }}>{formErrors.date}</p>}
                </div>
              </div>

              {/* Row 2: category + account */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="f-cat" style={labelStyle}>類別 <span style={{ color: "#DC2626" }}>*</span></label>
                  <StyledSelect
                    value={form.category}
                    onChange={(v) => setField("category", v)}
                    options={(form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => ({ key: c, label: c }))}
                    formField
                  />
                </div>
                <div>
                  <label htmlFor="f-acc" style={labelStyle}>帳戶 <span style={{ color: "#DC2626" }}>*</span></label>
                  <StyledSelect
                    value={form.account}
                    onChange={(v) => setField("account", v)}
                    options={ACCOUNTS.map(a => ({ key: a, label: a }))}
                    formField
                  />
                </div>
              </div>

              {/* Row 3: amount + invoice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="f-amt" style={labelStyle}>金額（NT$） <span style={{ color: "#DC2626" }}>*</span></label>
                  <input
                    id="f-amt" type="number" min={1} placeholder="0"
                    value={form.amount || ""}
                    onChange={(e) => setField("amount", Number(e.target.value))}
                    style={inputStyle(formErrors.amount)}
                  />
                  {formErrors.amount && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "3px" }}>{formErrors.amount}</p>}
                </div>
                <div>
                  <label htmlFor="f-inv" style={labelStyle}>發票號碼 <span style={{ color: "#DC2626" }}>*</span></label>
                  <input
                    id="f-inv" type="text" placeholder="INV-2026-XXX"
                    value={form.invoice}
                    onChange={(e) => setField("invoice", e.target.value)}
                    style={inputStyle(formErrors.invoice)}
                  />
                  {formErrors.invoice && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "3px" }}>{formErrors.invoice}</p>}
                </div>
              </div>

              {/* Row 4: desc */}
              <div>
                <label htmlFor="f-desc" style={labelStyle}>說明 <span style={{ color: "#DC2626" }}>*</span></label>
                <input
                  id="f-desc" type="text" placeholder="請輸入交易說明"
                  value={form.desc}
                  onChange={(e) => setField("desc", e.target.value)}
                  style={inputStyle(formErrors.desc)}
                />
                {formErrors.desc && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "3px" }}>{formErrors.desc}</p>}
              </div>

              {/* Row 5: note */}
              <div>
                <label htmlFor="f-note" style={labelStyle}>備註</label>
                <textarea
                  id="f-note" rows={2} placeholder="選填：補充說明或備註"
                  value={form.note}
                  onChange={(e) => setField("note", e.target.value)}
                  style={{ ...inputStyle(), resize: "none" }}
                />
              </div>

              {/* Preview total */}
              {form.amount > 0 && (
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-lg"
                  style={{
                    background: form.type === "income" ? "#F0FDF4" : "#FEF2F2",
                    borderWidth: "1px", borderStyle: "solid", borderColor: form.type === "income" ? "#BBF7D0" : "#FECACA",
                  }}
                >
                  <span style={{ fontSize: "14px", color: form.type === "income" ? "#15803D" : "#DC2626" }}>
                    本次 {form.type === "income" ? "收入" : "支出"} 金額
                  </span>
                  <span className="tabular-nums" style={{ fontSize: "20px", fontWeight: 700, color: form.type === "income" ? "#15803D" : "#DC2626" }}>
                    {form.type === "income" ? "+" : "−"}NT${(form.amount || 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0"
              style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}
            >
              <button
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2 rounded"
                style={{ fontSize: "14px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", fontFamily: "inherit" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 rounded flex items-center gap-2"
                style={{ fontSize: "14px", fontWeight: 600, background: "#111827", color: "#FFFFFF", fontFamily: "inherit" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}
              >
                <Check className="w-4 h-4" />
                {editingTx ? "儲存變更" : "新增記錄"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────── */}
      {deleteId != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(17,24,39,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteId(null); }}
        >
          <div
            className="w-full max-w-sm p-6"
            style={{
              background: "#FFFFFF",
              borderRadius: "12px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{ background: "#FEF2F2" }}
            >
              <Trash2 className="w-5 h-5" style={{ color: "#DC2626" }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
              確認刪除？
            </h3>
            <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.6 }}>
              此操作將永久刪除該筆交易記錄，無法復原。請確認後再繼續。
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded"
                style={{ fontSize: "14px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", fontFamily: "inherit" }}
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded"
                style={{ fontSize: "14px", fontWeight: 600, background: "#DC2626", color: "#FFFFFF", fontFamily: "inherit" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#B91C1C"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#DC2626"; }}
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}