import { useState, useMemo } from "react";
import {
  Plus, Search, Download, Package, Monitor, Printer, Smartphone,
  Laptop, Database, Camera, Truck, Box, Pencil, Trash2, X, Check,
  AlertTriangle, ChevronRight, LayoutGrid, List as ListIcon,
  ArrowRightLeft, Wrench, FileText, QrCode, TrendingDown,
  AlertCircle, BarChart2, CheckCircle2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Cell,
} from "recharts";
import { SubNav } from "../components/SubNav";
import { Pagination } from "../components/Pagination";
import { DraggableScroll } from "../components/DraggableScroll";
import { StyledSelect } from "../components/StyledSelect";
import { DatePicker } from "../components/DatePicker";
import { exportCSV } from "../components/ExportCSV";

const PAGE_SIZE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────
type AssetStatus    = "inUse" | "available" | "maintenance" | "retired";
type AssetType      = "laptop" | "monitor" | "printer" | "phone" | "tablet" | "server" | "camera" | "furniture" | "vehicle" | "other";
type AssetCondition = "new" | "good" | "fair" | "poor";

interface MaintenanceLog { id: number; date: string; type: string; desc: string; cost: number; tech: string }
interface TransferLog    { id: number; date: string; from: string; to: string; dept: string; operator: string }

interface Asset {
  id: number; name: string; type: AssetType; model: string; serial: string;
  status: AssetStatus; condition: AssetCondition;
  assignee: string; dept: string; location: string;
  purchaseDate: string; purchasePrice: number; warrantyEnd: string;
  notes: string;
  maintenance: MaintenanceLog[];
  transfers: TransferLog[];
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<AssetStatus, { label: string; bg: string; color: string; dot: string }> = {
  inUse:       { label: "使用中", bg: "#F0FDF4", color: "#15803D", dot: "#16A34A" },
  available:   { label: "可用",   bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
  maintenance: { label: "維修中", bg: "#FEF9C3", color: "#A16207", dot: "#CA8A04" },
  retired:     { label: "已報廢", bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
};
const TYPE_CFG: Record<AssetType, { label: string; life: number }> = {
  laptop:    { label: "筆電",   life: 5 },
  monitor:   { label: "螢幕",   life: 5 },
  printer:   { label: "印表機", life: 5 },
  phone:     { label: "手機",   life: 3 },
  tablet:    { label: "平板",   life: 4 },
  server:    { label: "伺服器", life: 6 },
  camera:    { label: "攝影機", life: 5 },
  furniture: { label: "家具",   life: 10 },
  vehicle:   { label: "車輛",   life: 8 },
  other:     { label: "其他",   life: 5 },
};
const COND_CFG: Record<AssetCondition, { label: string; color: string }> = {
  new:  { label: "全新", color: "#15803D" },
  good: { label: "良好", color: "#2563EB" },
  fair: { label: "普通", color: "#A16207" },
  poor: { label: "待修", color: "#DC2626" },
};
const DEPTS = ["技術部", "行銷部", "財務部", "人資部", "營運部", "業務部", "行政部", "設計部"];
const CHART_COLORS = ["#111827", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#E5E7EB", "#F3F4F6", "#4B5563", "#1F2937", "#9CA3AF"];

// ─── Icon helper ──────────────────────────────────────────────────────────────
const TypeIcon = ({ type, size = 16, color = "#374151" }: { type: AssetType; size?: number; color?: string }) => {
  const props = { style: { width: size, height: size, color, flexShrink: 0 as const } };
  switch (type) {
    case "laptop":    return <Laptop {...props} />;
    case "monitor":   return <Monitor {...props} />;
    case "printer":   return <Printer {...props} />;
    case "phone":     return <Smartphone {...props} />;
    case "tablet":    return <Smartphone {...props} />;
    case "server":    return <Database {...props} />;
    case "camera":    return <Camera {...props} />;
    case "furniture": return <Box {...props} />;
    case "vehicle":   return <Truck {...props} />;
    default:          return <Package {...props} />;
  }
};

// ─── Depreciation ─────────────────────────────────────────────────────────────
const calcDepreciation = (asset: Asset) => {
  const purchaseYear = new Date(asset.purchaseDate).getFullYear();
  const currentYear  = 2026;
  const yearsUsed    = currentYear - purchaseYear;
  const life         = TYPE_CFG[asset.type].life;
  const residual     = asset.purchasePrice * 0.1;
  const annualDep    = (asset.purchasePrice - residual) / life;
  const bookValue    = Math.max(residual, asset.purchasePrice - annualDep * yearsUsed);
  const depRate      = Math.round(((asset.purchasePrice - bookValue) / asset.purchasePrice) * 100);
  return { bookValue: Math.round(bookValue), depRate, yearsUsed };
};

// ─── Initial Data ────────────────────────────────────────────────────────────
const INIT: Asset[] = [
  {
    id: 1, name: "ThinkPad X1 Carbon", type: "laptop", model: "Gen 9 (i7/16GB/512GB)", serial: "PC-2023-001",
    status: "inUse", condition: "good", assignee: "張三", dept: "技術部", location: "3F 技術部辦公室",
    purchaseDate: "2023-05-15", purchasePrice: 42000, warrantyEnd: "2026-05-15", notes: "",
    maintenance: [
      { id: 1, date: "2024-08-10", type: "預防保養", desc: "清潔散熱系統、更換散熱膏", cost: 0,    tech: "IT 部門" },
    ],
    transfers: [
      { id: 1, date: "2023-05-20", from: "資產室", to: "張三", dept: "技術部", operator: "趙六" },
    ],
  },
  {
    id: 2, name: "MacBook Pro 14\"", type: "laptop", model: "M2 Pro / 16GB / 512GB", serial: "PC-2023-002",
    status: "inUse", condition: "good", assignee: "李四", dept: "設計部", location: "2F 設計部",
    purchaseDate: "2023-06-20", purchasePrice: 58000, warrantyEnd: "2026-06-20", notes: "附 Apple Care+",
    maintenance: [],
    transfers: [
      { id: 1, date: "2023-06-25", from: "資產室", to: "李四", dept: "��計部", operator: "趙六" },
    ],
  },
  {
    id: 3, name: "Dell UltraSharp 27\"", type: "monitor", model: "U2723DE 4K USB-C", serial: "MON-2023-001",
    status: "inUse", condition: "good", assignee: "王五", dept: "技術部", location: "3F 技術部辦公室",
    purchaseDate: "2023-07-10", purchasePrice: 14500, warrantyEnd: "2026-07-10", notes: "",
    maintenance: [],
    transfers: [
      { id: 1, date: "2023-07-15", from: "資產室", to: "王五", dept: "技術部", operator: "趙六" },
    ],
  },
  {
    id: 4, name: "HP LaserJet Pro", type: "printer", model: "M404dn", serial: "PRT-2023-001",
    status: "inUse", condition: "fair", assignee: "行政部", dept: "行政部", location: "1F 前台",
    purchaseDate: "2023-03-12", purchasePrice: 8800, warrantyEnd: "2025-03-12", notes: "保固已到期",
    maintenance: [
      { id: 1, date: "2025-01-15", type: "故障維修", desc: "更換定著器組件", cost: 1200, tech: "HP 原廠" },
    ],
    transfers: [
      { id: 1, date: "2023-03-15", from: "資產室", to: "行政部", dept: "行政部", operator: "趙六" },
    ],
  },
  {
    id: 5, name: "iPhone 15 Pro", type: "phone", model: "256GB 黑色鈦金屬", serial: "PH-2024-001",
    status: "inUse", condition: "new", assignee: "趙六", dept: "業務部", location: "隨身",
    purchaseDate: "2024-01-10", purchasePrice: 36900, warrantyEnd: "2025-01-10", notes: "業務用手機",
    maintenance: [],
    transfers: [
      { id: 1, date: "2024-01-12", from: "資產室", to: "趙六", dept: "業務部", operator: "人資部" },
    ],
  },
  {
    id: 6, name: "ThinkPad T14s", type: "laptop", model: "Gen 4 (AMD)", serial: "PC-2023-003",
    status: "available", condition: "good", assignee: "—", dept: "—", location: "資產室 A01",
    purchaseDate: "2023-04-08", purchasePrice: 32000, warrantyEnd: "2026-04-08", notes: "備用機，等待分配",
    maintenance: [],
    transfers: [
      { id: 1, date: "2023-04-10", from: "供應商", to: "資產室", dept: "—", operator: "人資部" },
      { id: 2, date: "2024-03-01", from: "周九", to: "資產室", dept: "技術部", operator: "人資部" },
    ],
  },
  {
    id: 7, name: "iPad Air", type: "tablet", model: "M1 / 256GB / Wi-Fi", serial: "TB-2023-001",
    status: "inUse", condition: "good", assignee: "錢七", dept: "營運部", location: "4F 會議室",
    purchaseDate: "2023-08-15", purchasePrice: 18900, warrantyEnd: "2025-08-15", notes: "",
    maintenance: [],
    transfers: [
      { id: 1, date: "2023-08-20", from: "資產室", to: "錢七", dept: "營運部", operator: "人資部" },
    ],
  },
  {
    id: 8, name: "Canon imageRUNNER", type: "printer", model: "ADVANCE DX C5860i", serial: "PRT-2022-001",
    status: "maintenance", condition: "poor", assignee: "—", dept: "—", location: "2F 列印室",
    purchaseDate: "2022-11-20", purchasePrice: 22000, warrantyEnd: "2024-11-20", notes: "卡紙問題頻繁發生",
    maintenance: [
      { id: 1, date: "2024-12-10", type: "故障維修", desc: "進紙滾輪更換",     cost: 3500, tech: "Canon 原廠" },
      { id: 2, date: "2025-02-15", type: "故障維修", desc: "送廠維修，進行中", cost: 0,    tech: "Canon 原廠" },
    ],
    transfers: [
      { id: 1, date: "2022-11-25", from: "供應商", to: "2F 列印室", dept: "行政部", operator: "趙六" },
    ],
  },
  {
    id: 9, name: "Dell PowerEdge R740", type: "server", model: "Xeon / 128GB / 10TB", serial: "SRV-2022-001",
    status: "inUse", condition: "good", assignee: "IT 部門", dept: "技術部", location: "B1 機房",
    purchaseDate: "2022-06-01", purchasePrice: 180000, warrantyEnd: "2025-06-01", notes: "主要應用伺服器",
    maintenance: [
      { id: 1, date: "2023-06-01", type: "預防保養", desc: "年度硬體健診、清潔",      cost: 0,    tech: "IT 部門" },
      { id: 2, date: "2024-06-01", type: "預防保養", desc: "更換 UPS 電池組",        cost: 8000, tech: "IT 部門" },
    ],
    transfers: [
      { id: 1, date: "2022-06-05", from: "供應商", to: "B1 機房", dept: "技術部", operator: "張三" },
    ],
  },
  {
    id: 10, name: "Sony FX3 攝影機", type: "camera", model: "Full-Frame Cinema", serial: "CAM-2023-001",
    status: "inUse", condition: "good", assignee: "行銷部", dept: "行銷部", location: "2F 行銷部",
    purchaseDate: "2023-10-05", purchasePrice: 65000, warrantyEnd: "2025-10-05", notes: "含鏡頭套組",
    maintenance: [],
    transfers: [
      { id: 1, date: "2023-10-08", from: "資產室", to: "行銷部", dept: "行銷部", operator: "人資部" },
    ],
  },
  {
    id: 11, name: "人體工學辦公椅 A", type: "furniture", model: "Herman Miller Aeron", serial: "FUR-2022-001",
    status: "inUse", condition: "good", assignee: "張三", dept: "技術部", location: "3F 技術部辦公室",
    purchaseDate: "2022-03-10", purchasePrice: 28000, warrantyEnd: "2034-03-10", notes: "12 年保固",
    maintenance: [],
    transfers: [
      { id: 1, date: "2022-03-15", from: "資產室", to: "張三", dept: "技術部", operator: "人資部" },
    ],
  },
  {
    id: 12, name: "公務車 Toyota Camry", type: "vehicle", model: "2.5 豪華版 白色", serial: "VEH-2021-001",
    status: "inUse", condition: "fair", assignee: "業務部", dept: "業務部", location: "B1 停車場",
    purchaseDate: "2021-08-20", purchasePrice: 880000, warrantyEnd: "2024-08-20", notes: "里程數 85,000km",
    maintenance: [
      { id: 1, date: "2023-08-20", type: "例行保養", desc: "換機油、機濾、檢查煞車", cost: 3200, tech: "Toyota 保養廠" },
      { id: 2, date: "2024-08-20", type: "例行保養", desc: "換機油、輪胎旋轉",       cost: 2800, tech: "Toyota 保養廠" },
      { id: 3, date: "2025-02-10", type: "故障維修", desc: "冷氣冷媒補充",           cost: 1500, tech: "Toyota 保養廠" },
    ],
    transfers: [
      { id: 1, date: "2021-08-25", from: "經銷商", to: "業務部", dept: "業務部", operator: "趙六" },
    ],
  },
  {
    id: 13, name: "MacBook Air 13\"", type: "laptop", model: "M2 / 8GB / 256GB", serial: "PC-2024-001",
    status: "inUse", condition: "new", assignee: "吳十", dept: "行銷部", location: "2F 行銷部",
    purchaseDate: "2024-03-01", purchasePrice: 35900, warrantyEnd: "2027-03-01", notes: "",
    maintenance: [],
    transfers: [
      { id: 1, date: "2024-03-05", from: "資產室", to: "吳十", dept: "行銷部", operator: "人資部" },
    ],
  },
  {
    id: 14, name: "LG 34\" 曲面螢幕", type: "monitor", model: "34WP88C UltraWide", serial: "MON-2024-001",
    status: "inUse", condition: "new", assignee: "李四", dept: "設計部", location: "2F 設計部",
    purchaseDate: "2024-02-15", purchasePrice: 18500, warrantyEnd: "2027-02-15", notes: "",
    maintenance: [],
    transfers: [
      { id: 1, date: "2024-02-18", from: "資產室", to: "李四", dept: "設計部", operator: "人資部" },
    ],
  },
  {
    id: 15, name: "Cisco 交換器", type: "server", model: "Catalyst 9200 24-Port", serial: "NET-2023-001",
    status: "inUse", condition: "good", assignee: "IT 部門", dept: "技術部", location: "B1 機房",
    purchaseDate: "2023-01-10", purchasePrice: 45000, warrantyEnd: "2026-01-10", notes: "核心網路設備",
    maintenance: [],
    transfers: [
      { id: 1, date: "2023-01-12", from: "供應商", to: "B1 機房", dept: "技術部", operator: "張三" },
    ],
  },
  {
    id: 16, name: "Samsung Galaxy S24", type: "phone", model: "256GB 幻岩黑", serial: "PH-2024-002",
    status: "retired", condition: "poor", assignee: "—", dept: "—", location: "資產室（待報廢）",
    purchaseDate: "2021-05-10", purchasePrice: 28000, warrantyEnd: "2022-05-10", notes: "螢幕破裂，已超過維修價值",
    maintenance: [
      { id: 1, date: "2023-06-10", type: "故障維修", desc: "電池更換",       cost: 1500, tech: "三星維修中心" },
      { id: 2, date: "2024-09-01", type: "故障維修", desc: "螢幕破裂，放棄", cost: 0,    tech: "—" },
    ],
    transfers: [
      { id: 1, date: "2021-05-15", from: "資產室", to: "馮十二", dept: "業務部", operator: "人資部" },
      { id: 2, date: "2024-09-05", from: "馮十二", to: "資產室（待報廢）", dept: "—", operator: "人資部" },
    ],
  },
];

const nextId = (arr: { id: number }[]) => Math.max(...arr.map(x => x.id), 0) + 1;

// ─── Helpers ────����────────────────────────────────────────────────────────────
const fmtNT = (n: number) => `NT$${n.toLocaleString()}`;

// ─── Sub-components ─────────────────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={className} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: AssetStatus }) => {
  const c = STATUS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded" style={{ fontSize: "12px", fontWeight: 500, background: c.bg, color: c.color, whiteSpace: "nowrap" }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />{c.label}
    </span>
  );
};

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111827", borderRadius: "8px", padding: "10px 14px", color: "#FFF", fontSize: "13px", lineHeight: 1.8, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
      <p style={{ fontWeight: 600, marginBottom: "4px" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey}><span style={{ color: p.fill || p.stroke, marginRight: 6 }}>●</span>{p.name}：{typeof p.value === "number" && p.value > 1000 ? fmtNT(p.value) : p.value}{p.name === "數量" ? " 件" : ""}</p>
      ))}
    </div>
  );
};

type DetailTab = "info" | "maintenance" | "transfers";

const emptyForm = () => ({
  name: "", type: "laptop" as AssetType, model: "", serial: "",
  status: "available" as AssetStatus, condition: "new" as AssetCondition,
  assignee: "", dept: "", location: "",
  purchaseDate: "", purchasePrice: 0, warrantyEnd: "", notes: "",
});

// ─── Main ────────────────────────────────────────────────────────────────────
export function Assets() {
  const [assets, setAssets]               = useState<Asset[]>(INIT);
  const [subTab, setSubTab]               = useState<"overview" | "list">("overview");
  const [searchTerm, setSearchTerm]       = useState("");
  const [filterType, setFilterType]       = useState<"all" | AssetType>("all");
  const [filterStatus, setFilterStatus]   = useState<"all" | AssetStatus>("all");
  const [filterDept, setFilterDept]       = useState("all");
  const [viewMode, setViewMode]           = useState<"table" | "card">("table");
  const [listPage, setListPage]           = useState(1);

  // Detail
  const [selectedId, setSelectedId]       = useState<number | null>(null);
  const [detailTab, setDetailTab]         = useState<DetailTab>("info");
  const [newMaintenance, setNewMaintenance] = useState({ desc: "", type: "預防保養", cost: 0, tech: "" });
  const [newTransfer, setNewTransfer]     = useState({ to: "", dept: "", operator: "" });

  // Form
  const [isFormOpen, setIsFormOpen]       = useState(false);
  const [editingId, setEditingId]         = useState<number | null>(null);
  const [form, setForm]                   = useState(emptyForm());
  const [formErrors, setFormErrors]       = useState<Record<string, string>>({});

  // Delete
  const [deleteId, setDeleteId]           = useState<number | null>(null);

  // Toast
  const [toast, setToast]                 = useState<{ msg: string; ok: boolean } | null>(null);

  // ─── Derived ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => assets.filter(a => {
    const s = searchTerm.toLowerCase();
    const matchS = a.name.toLowerCase().includes(s) || a.serial.toLowerCase().includes(s) || a.assignee.includes(s) || a.model.toLowerCase().includes(s);
    const matchT = filterType === "all" || a.type === filterType;
    const matchSt = filterStatus === "all" || a.status === filterStatus;
    const matchD = filterDept === "all" || a.dept === filterDept;
    return matchS && matchT && matchSt && matchD;
  }), [assets, searchTerm, filterType, filterStatus, filterDept]);

  const selected    = useMemo(() => assets.find(a => a.id === selectedId) ?? null, [assets, selectedId]);
  const pagedAssets = useMemo(() => filtered.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE), [filtered, listPage]);

  const stats = useMemo(() => ({
    total:       assets.length,
    inUse:       assets.filter(a => a.status === "inUse").length,
    available:   assets.filter(a => a.status === "available").length,
    maintenance: assets.filter(a => a.status === "maintenance").length,
    retired:     assets.filter(a => a.status === "retired").length,
    totalValue:  assets.reduce((s, a) => s + a.purchasePrice, 0),
    bookValue:   assets.reduce((s, a) => s + calcDepreciation(a).bookValue, 0),
  }), [assets]);

  // Chart data: count by type
  const typeChartData = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach(a => { map[TYPE_CFG[a.type].label] = (map[TYPE_CFG[a.type].label] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [assets]);

  // Chart data: total value by dept
  const deptChartData = useMemo(() => {
    const map: Record<string, number> = {};
    assets.filter(a => a.dept !== "—").forEach(a => { map[a.dept] = (map[a.dept] || 0) + a.purchasePrice; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [assets]);

  // ─── Actions ─────────────────────────────────────────────────────────────
  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2800); };

  const openAdd = () => { setEditingId(null); setForm(emptyForm()); setFormErrors({}); setIsFormOpen(true); };
  const openEdit = (a: Asset) => {
    setEditingId(a.id);
    setForm({ name: a.name, type: a.type, model: a.model, serial: a.serial, status: a.status, condition: a.condition, assignee: a.assignee, dept: a.dept, location: a.location, purchaseDate: a.purchaseDate, purchasePrice: a.purchasePrice, warrantyEnd: a.warrantyEnd, notes: a.notes });
    setFormErrors({}); setIsFormOpen(true);
  };
  const setF = <K extends keyof ReturnType<typeof emptyForm>>(k: K, v: any) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setFormErrors(e => { const { [k]: _, ...r } = e; return r; });
  };
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim())    errs.name    = "請輸入資產名稱";
    if (!form.model.trim())   errs.model   = "請輸入型號";
    if (!form.serial.trim())  errs.serial  = "請輸入序號";
    if (!form.purchaseDate)   errs.purchaseDate = "請選擇購入日期";
    if (!form.purchasePrice || form.purchasePrice <= 0) errs.purchasePrice = "請輸入有效金額";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const submitForm = () => {
    if (!validate()) return;
    if (editingId != null) {
      setAssets(prev => prev.map(a => a.id === editingId ? { ...a, ...form } : a));
      showToast("資產資料已更新");
    } else {
      const na: Asset = { id: nextId(assets), ...form, maintenance: [], transfers: [{ id: 1, date: "2026-03-10", from: "採購入庫", to: form.assignee || "資產室", dept: form.dept || "—", operator: "人資部" }] };
      setAssets(prev => [na, ...prev]);
      showToast("資產已新增");
    }
    setIsFormOpen(false);
  };
  const confirmDelete = () => {
    if (deleteId == null) return;
    setAssets(prev => prev.filter(a => a.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null); showToast("資產已刪除", false);
  };
  const addMaintenance = () => {
    if (!selectedId || !newMaintenance.desc.trim()) return;
    setAssets(prev => prev.map(a => a.id === selectedId ? { ...a, maintenance: [...a.maintenance, { id: nextId(a.maintenance), date: "2026-03-10", ...newMaintenance }] } : a));
    setNewMaintenance({ desc: "", type: "預防保養", cost: 0, tech: "" });
    showToast("維修記錄已新增");
  };
  const addTransfer = () => {
    if (!selectedId || !newTransfer.to.trim()) return;
    const cur = assets.find(a => a.id === selectedId)!;
    setAssets(prev => prev.map(a => a.id === selectedId ? {
      ...a,
      assignee: newTransfer.to, dept: newTransfer.dept,
      transfers: [...a.transfers, { id: nextId(a.transfers), date: "2026-03-10", from: cur.assignee || "資產室", ...newTransfer }],
    } : a));
    setNewTransfer({ to: "", dept: "", operator: "" });
    showToast("資產已移交");
  };

  // Input/label style
  const iStyle = (err?: string): React.CSSProperties => ({
    width: "100%", padding: "10px 12px", fontSize: "15px", background: "#F9FAFB",
    borderWidth: "1px", borderStyle: "solid", borderColor: err ? "#DC2626" : "#E5E7EB",
    borderRadius: "8px", color: "#111827", outline: "none", fontFamily: "inherit",
    minHeight: "44px",
  });
  const lStyle: React.CSSProperties = { display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={subTab === "overview" ? "h-full max-md:h-auto flex flex-col gap-6" : "space-y-6"}>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: toast.ok ? "#111827" : "#DC2626", color: "#FFF", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontSize: "14px", fontWeight: 500 }}>
          {toast.ok ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{toast.msg}
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-shrink-0 gap-3 max-md:flex-col max-md:items-stretch">
        <div>
          <h1 style={{ color: "#111827" }}>資產管理</h1>
          <p className="max-md:hidden" style={{ fontSize: "15px", color: "#9CA3AF", marginTop: 2 }}>管理公司所有設備、財產與折舊狀況</p>
        </div>
        <div className="flex gap-2 max-md:w-full">
          {subTab === "list" && (
            <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:flex-1"
              style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "13px", color: "#374151" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
              onClick={() => exportCSV("資產清單.csv", [
                { header: "資產名稱", accessor: (a: any) => a.name },
                { header: "類型", accessor: (a: any) => TYPE_CFG[a.type as AssetType].label },
                { header: "型號", accessor: (a: any) => a.model },
                { header: "序號", accessor: (a: any) => a.serial },
                { header: "狀態", accessor: (a: any) => STATUS_CFG[a.status as AssetStatus].label },
                { header: "使用者", accessor: (a: any) => a.assignee },
                { header: "部門", accessor: (a: any) => a.dept },
                { header: "位置", accessor: (a: any) => a.location },
                { header: "購入日期", accessor: (a: any) => a.purchaseDate },
                { header: "購入價格", accessor: (a: any) => a.purchasePrice },
                { header: "保固到期", accessor: (a: any) => a.warrantyEnd },
                { header: "備註", accessor: (a: any) => a.notes },
              ], filtered)}>
              <Download className="w-3.5 h-3.5" />匯出清單
            </button>
          )}
          <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:flex-1"
            style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 500 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}
            onClick={openAdd}>
            <Plus className="w-3.5 h-3.5" />新增資產
          </button>
        </div>
      </div>

      {/* ── Sub Navigation ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0">
        <SubNav
          tabs={[
            { key: "overview", label: "資產總覽" },
            { key: "list",     label: "資產清單", count: assets.length },
          ]}
          active={subTab}
          onChange={(k) => setSubTab(k as any)}
        />
      </div>

      {/* ── Tab: 資產總覽 ──────────────────────────────────────────────── */}
      {subTab === "overview" && (() => {
        const TODAY     = "2026-03-11";
        const WARN_DATE = "2026-06-09";
        const depRate   = stats.totalValue > 0 ? Math.round((stats.totalValue - stats.bookValue) / stats.totalValue * 100) : 0;
        const totalDep  = stats.totalValue - stats.bookValue;

        const warrantyExpiringSoon = assets.filter(a =>
          a.warrantyEnd >= TODAY && a.warrantyEnd <= WARN_DATE && a.status !== "retired"
        );
        const warrantyExpired = assets.filter(a =>
          a.warrantyEnd < TODAY && (a.status === "inUse" || a.status === "available")
        );
        const inMaintenance = assets.filter(a => a.status === "maintenance");

        const statusBreakdown = [
          { key: "inUse",       label: "使用中", count: stats.inUse,       color: "#16A34A", bg: "#F0FDF4", pct: Math.round(stats.inUse / stats.total * 100) },
          { key: "available",   label: "可用中", count: stats.available,   color: "#2563EB", bg: "#EFF6FF", pct: Math.round(stats.available / stats.total * 100) },
          { key: "maintenance", label: "維修中", count: stats.maintenance, color: "#CA8A04", bg: "#FEF9C3", pct: Math.round(stats.maintenance / stats.total * 100) },
          { key: "retired",     label: "已報廢", count: stats.retired,     color: "#9CA3AF", bg: "#F3F4F6", pct: Math.round(stats.retired / stats.total * 100) },
        ];

        const deptRows = [...deptChartData].sort((a, b) => b.value - a.value);
        const deptMax  = deptRows[0]?.value ?? 1;

        type AlertItem = { id: number; name: string; type: AssetType; level: "critical" | "warn" | "info"; tag: string; sub: string };
        const alertItems: AlertItem[] = [
          ...inMaintenance.map(a => ({
            id: a.id, name: a.name, type: a.type, level: "critical" as const,
            tag: "維修中", sub: a.notes || "設備送修，待修復中",
          })),
          ...warrantyExpiringSoon.map(a => {
            const days = Math.round((new Date(a.warrantyEnd).getTime() - new Date(TODAY).getTime()) / 86400000);
            return { id: a.id, name: a.name, type: a.type, level: "warn" as const, tag: `${days}天後到期`, sub: `保固至 ${a.warrantyEnd}` };
          }),
        ];

        const ALERT_COLOR: Record<string, { bg: string; color: string }> = {
          critical: { bg: "#FEF2F2", color: "#DC2626" },
          warn:     { bg: "#FEF9C3", color: "#A16207" },
          info:     { bg: "#F3F4F6", color: "#6B7280" },
        };

        return (
          <div className="flex-1 min-h-0 flex flex-col gap-4 max-md:overflow-y-auto">

            {/* ── KPI 卡片列 ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 flex-shrink-0">

              {/* 資產總數 */}
              <Card className="p-5 max-md:p-4">
                <div className="flex items-start justify-between mb-4 max-md:mb-3">
                  <p style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.06em" }}>資產總覽</p>
                  <div className="w-9 h-9 max-md:w-8 max-md:h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                    <Package className="w-4.5 h-4.5 max-md:w-4 max-md:h-4" style={{ color: "#374151" }} />
                  </div>
                </div>
                <p className="tabular-nums max-md:hidden" style={{ fontSize: "34px", fontWeight: 800, color: "#111827", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {stats.total}<span style={{ fontSize: "14px", fontWeight: 500, color: "#9CA3AF", marginLeft: "4px" }}>件</span>
                </p>
                <p className="tabular-nums md:hidden" style={{ fontSize: "26px", fontWeight: 800, color: "#111827", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {stats.total}<span style={{ fontSize: "13px", fontWeight: 500, color: "#9CA3AF", marginLeft: "4px" }}>件</span>
                </p>
                
              </Card>

              {/* 頁面總價值 */}
              <Card className="p-5 max-md:p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.06em" }}>BOOK VALUE</p>
                    <p className="tabular-nums mt-1.5 max-md:hidden" style={{ fontSize: "24px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                      NT${(stats.bookValue / 1000000).toFixed(2)}M
                    </p>
                    <p className="tabular-nums mt-1.5 md:hidden" style={{ fontSize: "19px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                      NT${(stats.bookValue / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div className="w-10 h-10 max-md:w-8 max-md:h-8 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF", borderWidth: "1px", borderStyle: "solid", borderColor: "#DBEAFE" }}>
                    <TrendingDown className="w-5 h-5 max-md:w-4 max-md:h-4" style={{ color: "#2563EB" }} />
                  </div>
                </div>
                <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "6px" }}>依折舊後帳面計算</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: "4px", background: "#F3F4F6" }}>
                    <div className="h-full rounded-full" style={{ width: `${100 - depRate}%`, background: "#2563EB" }} />
                  </div>
                  <span className="tabular-nums" style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB" }}>殘值 {100 - depRate}%</span>
                </div>
              </Card>

              {/* 累計折舊 */}
              <Card className="p-5 max-md:p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.06em" }}>DEPRECIATION</p>
                    <p className="tabular-nums mt-1.5 max-md:hidden" style={{ fontSize: "24px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                      NT${(totalDep / 1000).toFixed(0)}K
                    </p>
                    <p className="tabular-nums mt-1.5 md:hidden" style={{ fontSize: "19px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                      NT${(totalDep / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="w-10 h-10 max-md:w-8 max-md:h-8 rounded-xl flex items-center justify-center" style={{ background: "#FEF9C3", borderWidth: "1px", borderStyle: "solid", borderColor: "#FDE68A" }}>
                    <BarChart2 className="w-5 h-5 max-md:w-4 max-md:h-4" style={{ color: "#CA8A04" }} />
                  </div>
                </div>
                <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "6px" }}>原始成本 NT${(stats.totalValue / 1000000).toFixed(2)}M</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: "4px", background: "#F3F4F6" }}>
                    <div className="h-full rounded-full" style={{ width: `${depRate}%`, background: "#CA8A04" }} />
                  </div>
                  <span className="tabular-nums" style={{ fontSize: "11px", fontWeight: 700, color: "#CA8A04" }}>折舊 {depRate}%</span>
                </div>
              </Card>

              {/* ��固警示 */}
              <Card className="p-5 max-md:p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.06em" }}>WARRANTY ALERT</p>
                    <p className="tabular-nums mt-1.5 max-md:hidden" style={{ fontSize: "30px", fontWeight: 700, color: inMaintenance.length + warrantyExpiringSoon.length > 0 ? "#DC2626" : "#111827", lineHeight: 1 }}>
                      {inMaintenance.length + warrantyExpiringSoon.length}
                      <span style={{ fontSize: "15px", fontWeight: 500, color: "#6B7280", marginLeft: "4px" }}>需注意</span>
                    </p>
                    <p className="tabular-nums mt-1.5 md:hidden" style={{ fontSize: "24px", fontWeight: 700, color: inMaintenance.length + warrantyExpiringSoon.length > 0 ? "#DC2626" : "#111827", lineHeight: 1 }}>
                      {inMaintenance.length + warrantyExpiringSoon.length}
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#6B7280", marginLeft: "4px" }}>需注意</span>
                    </p>
                  </div>
                  <div className="w-10 h-10 max-md:w-8 max-md:h-8 rounded-xl flex items-center justify-center"
                    style={{ background: inMaintenance.length + warrantyExpiringSoon.length > 0 ? "#FEF2F2" : "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                    <AlertCircle className="w-5 h-5 max-md:w-4 max-md:h-4" style={{ color: inMaintenance.length + warrantyExpiringSoon.length > 0 ? "#DC2626" : "#9CA3AF" }} />
                  </div>
                </div>
                <div className="space-y-1">
                  {[
                    { label: "維修中",    count: inMaintenance.length,       color: inMaintenance.length > 0 ? "#DC2626" : "#9CA3AF" },
                    { label: "90天內到期", count: warrantyExpiringSoon.length, color: warrantyExpiringSoon.length > 0 ? "#CA8A04" : "#9CA3AF" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{row.label}</span>
                      <span className="tabular-nums" style={{ fontSize: "11px", fontWeight: 700, color: row.color }}>{row.count} 件</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* ── 主體三欄（flex-1 置底填滿）────────────────────────────── */}
            <div className="flex gap-4 flex-1 min-h-0 max-md:flex-col max-md:min-h-fit max-md:gap-3">

              {/* 類型分佈 */}
              <Card className="flex-1 min-h-0 max-md:min-h-fit flex flex-col p-5 max-md:p-4">
                <div className="mb-4 max-md:mb-3 flex-shrink-0">
                  <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>資產類型分佈</h3>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>各類設備數量統計</p>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
                  {[...typeChartData].sort((a, b) => b.value - a.value).map((row, i) => {
                    const max = typeChartData[0]?.value ?? 1;
                    const pct = Math.round((row.value / max) * 100);
                    return (
                      <div key={row.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{row.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="tabular-nums" style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>{row.value}</span>
                            <span style={{ fontSize: "11px", color: "#9CA3AF" }}>台</span>
                          </div>
                        </div>
                        <div className="w-full rounded-full overflow-hidden" style={{ height: "7px", background: "#F3F4F6" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length], transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* 部門資產價值 */}
              <Card className="flex-1 min-h-0 max-md:min-h-fit flex flex-col p-5 max-md:p-4">
                <div className="mb-4 max-md:mb-3 flex-shrink-0">
                  <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>各部門資產價值</h3>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>依原始採購金額排名</p>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
                  {deptRows.map((row, i) => {
                    const pct = Math.round((row.value / deptMax) * 100);
                    const grays = ["#111827", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB"];
                    return (
                      <div key={row.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="tabular-nums w-4 text-center flex-shrink-0"
                              style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF" }}>{i + 1}</span>
                            <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{row.name}</span>
                          </div>
                          <span className="tabular-nums" style={{ fontSize: "12px", fontWeight: 700, color: "#111827" }}>
                            NT${(row.value / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <div className="w-full rounded-full overflow-hidden" style={{ height: "7px", background: "#F3F4F6" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: grays[i % grays.length], transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* 警示面板 */}
              <Card className="flex-shrink-0 min-h-0 max-md:min-h-fit flex flex-col p-5 max-md:p-4 w-full md:w-[272px]">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div>
                    <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>需注意資產</h3>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>維修中 / 保固警示</p>
                  </div>
                  {alertItems.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full tabular-nums"
                      style={{ fontSize: "11px", fontWeight: 700, background: "#FEF2F2", color: "#DC2626" }}>
                      {alertItems.length}
                    </span>
                  )}
                </div>

                {/* 三格統計 */}
                <div className="grid grid-cols-3 gap-2 mb-4 flex-shrink-0">
                  {[
                    { label: "維修中",  count: inMaintenance.length,       color: "#DC2626", bg: "#FEF2F2" },
                    { label: "即將到期", count: warrantyExpiringSoon.length, color: "#CA8A04", bg: "#FEF9C3" },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg px-2 py-2.5 text-center" style={{ background: item.bg }}>
                      <p className="tabular-nums" style={{ fontSize: "20px", fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.count}</p>
                      <p style={{ fontSize: "11px", color: item.color, marginTop: "3px", fontWeight: 600 }}>{item.label}</p>
                    </div>
                  ))}
                </div>

                <div style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", marginBottom: "12px", flexShrink: 0 }} />

                {/* 警示清單（可捲動） */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
                  {alertItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <CheckCircle2 className="w-8 h-8" style={{ color: "#16A34A", opacity: 0.4 }} />
                      <p style={{ fontSize: "13px", color: "#9CA3AF" }}>目前無需注意項目</p>
                    </div>
                  ) : alertItems.map((item, idx) => {
                    const ac = ALERT_COLOR[item.level];
                    return (
                      <div key={`${item.id}-${idx}`}
                        className="flex items-start gap-2.5 p-3 rounded-lg cursor-pointer group"
                        style={{ background: ac.bg, borderWidth: "1px", borderStyle: "solid", borderColor: `${ac.color}22` }}
                        onClick={() => { setSelectedId(item.id); setSubTab("list"); }}
                      >
                        <TypeIcon type={item.type} size={14} color={ac.color} />
                        <div className="flex-1 min-w-0">
                          <p className="truncate" style={{ fontSize: "12px", fontWeight: 600, color: "#111827" }}>{item.name}</p>
                          <p style={{ fontSize: "11px", color: ac.color, marginTop: "1px" }}>{item.sub}</p>
                        </div>
                        <span className="flex-shrink-0 px-1.5 py-0.5 rounded"
                          style={{ fontSize: "11px", fontWeight: 700, background: "#FFFFFF", color: ac.color, whiteSpace: "nowrap" }}>
                          {item.tag}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {alertItems.length > 0 && (
                  <button
                    className="flex-shrink-0 mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg"
                    style={{ fontSize: "12px", fontWeight: 600, color: "#374151", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                    onClick={() => setSubTab("list")}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />查看全部資產清單
                  </button>
                )}
              </Card>

            </div>
          </div>
        );
      })()}

      {/* ── Tab: 資產清單 ──────────────────────────────────────────────── */}
      {subTab === "list" && (
      <div className="space-y-4">

      {/* ── Filter bar ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1" style={{ minWidth: 180 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
          <input type="text" placeholder="搜尋名稱、序號、使用者..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded outline-none"
            style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#111827", fontFamily: "inherit", minHeight: "42px" }} />
        </div>
        <div className="flex gap-2 flex-wrap max-md:w-full max-md:flex-col">
          <StyledSelect
            value={filterType}
            onChange={v => setFilterType(v as any)}
            allLabel="全部類型"
            options={(Object.keys(TYPE_CFG) as AssetType[]).map(t => ({ key: t, label: TYPE_CFG[t].label }))}
            className="max-md:w-full"
          />
          <StyledSelect
            value={filterStatus}
            onChange={v => setFilterStatus(v as any)}
            allLabel="全部狀態"
            options={(Object.keys(STATUS_CFG) as AssetStatus[]).map(s => ({ key: s, label: STATUS_CFG[s].label }))}
            className="max-md:w-full"
          />
          <StyledSelect
            value={filterDept}
            onChange={v => setFilterDept(v)}
            allLabel="全部部門"
            options={DEPTS.map(d => ({ key: d, label: d }))}
            className="max-md:w-full"
          />
          {(searchTerm || filterType !== "all" || filterStatus !== "all" || filterDept !== "all") && (
            <button className="flex items-center gap-1 px-3 py-2 rounded"
              style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "13px", color: "#9CA3AF" }}
              onClick={() => { setSearchTerm(""); setFilterType("all"); setFilterStatus("all"); setFilterDept("all"); setListPage(1); }}>
              <X className="w-3.5 h-3.5" />清除
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{filtered.length} 件</span>
          <div className="flex rounded overflow-hidden" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
            {[{ mode: "table", Icon: ListIcon }, { mode: "card", Icon: LayoutGrid }].map(({ mode, Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode as any)}
                className="w-8 h-8 flex items-center justify-center"
                style={{ background: viewMode === mode ? "#111827" : "#FFF", color: viewMode === mode ? "#FFF" : "#9CA3AF" }}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table View ──────────────────────────────────────────────── */}
      {viewMode === "table" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full hidden md:table">
              <thead>
                <tr style={{ background: "#FAFAFA", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                  {["資產名稱", "類型", "序號", "使用者 / 部門", "狀態", "機況", "購入日期", "帳面價值", "操作"].map((h, i) => (
                    <th key={h} className="px-5 py-2.5 text-left" style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="py-12 text-center" style={{ fontSize: "14px", color: "#9CA3AF" }}>找不到符合條件的資產</td></tr>
                ) : pagedAssets.map((a, idx) => {
                  const { bookValue, depRate, yearsUsed } = calcDepreciation(a);
                  const cc = COND_CFG[a.condition];
                  return (
                    <tr key={a.id}
                      style={{ borderBottomWidth: idx < pagedAssets.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F9FAFB" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      {/* Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F3F4F6" }}>
                            <TypeIcon type={a.type} size={16} />
                          </div>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{a.name}</p>
                            <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{a.model}</p>
                          </div>
                        </div>
                      </td>
                      {/* Type */}
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", background: "#F3F4F6", color: "#374151" }}>{TYPE_CFG[a.type].label}</span>
                      </td>
                      {/* Serial */}
                      <td className="px-5 py-3.5 tabular-nums" style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace", whiteSpace: "nowrap" }}>{a.serial}</td>
                      {/* Assignee */}
                      <td className="px-5 py-3.5">
                        <p style={{ fontSize: "13px", color: "#374151" }}>{a.assignee === "—" ? <span style={{ color: "#D1D5DB" }}>未分配</span> : a.assignee}</p>
                        <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{a.dept === "—" ? "" : a.dept}</p>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                      {/* Condition */}
                      <td className="px-5 py-3.5">
                        <span style={{ fontSize: "11px", fontWeight: 600, color: cc.color }}>{cc.label}</span>
                      </td>
                      {/* Purchase date */}
                      <td className="px-5 py-3.5 tabular-nums" style={{ fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>{a.purchaseDate}</td>
                      {/* Book value */}
                      <td className="px-5 py-3.5">
                        <p className="tabular-nums" style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{fmtNT(bookValue)}</p>
                        <p style={{ fontSize: "11px", color: depRate > 80 ? "#DC2626" : "#9CA3AF" }}>已折舊 {depRate}%</p>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button title="詳情" className="w-8 h-8 rounded flex items-center justify-center"
                            style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#111827"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                            onClick={() => { setSelectedId(a.id); setDetailTab("info"); }}>
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          
                          <button title="刪除" className="w-8 h-8 rounded flex items-center justify-center"
                            style={{ color: "#9CA3AF", transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
                            onClick={() => setDeleteId(a.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: "#F9FAFB", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}>
                  <td className="px-4 py-3" colSpan={8} style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>合計 {filtered.length} 件資產</td>
                  <td className="px-4 py-3 tabular-nums" style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                    {fmtNT(filtered.reduce((s, a) => s + calcDepreciation(a).bookValue, 0))}
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden">
              {filtered.length === 0 ? (
                <div className="py-12 text-center" style={{ fontSize: "13px", color: "#9CA3AF" }}>找不到符合條件的資產</div>
              ) : pagedAssets.map((a, idx) => {
                const { bookValue, depRate } = calcDepreciation(a);
                const cc = COND_CFG[a.condition];
                return (
                  <div key={a.id} className="px-4 py-3" style={{ borderBottomWidth: idx < pagedAssets.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F3F4F6" }}>
                        <TypeIcon type={a.type} size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>{a.name}</p>
                            <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{a.model}</p>
                          </div>
                          <StatusBadge status={a.status} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-2 pl-[42px]">
                      <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", background: "#F3F4F6", color: "#374151" }}>{TYPE_CFG[a.type].label}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: cc.color }}>{cc.label}</span>
                      <span style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{a.serial}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-1.5 pl-[42px]">
                      <span style={{ fontSize: "12px", color: "#374151" }}>{a.assignee === "—" ? "未分配" : a.assignee}</span>
                      {a.dept !== "—" && <span style={{ fontSize: "12px", color: "#9CA3AF" }}>· {a.dept}</span>}
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>· {a.location}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pl-[42px]">
                      <div>
                        <span className="tabular-nums" style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{fmtNT(bookValue)}</span>
                        <span style={{ fontSize: "11px", color: depRate > 80 ? "#DC2626" : "#9CA3AF", marginLeft: 4 }}>折舊 {depRate}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button title="詳情" className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#6B7280", background: "#F3F4F6" }}
                          onClick={() => { setSelectedId(a.id); setDetailTab("info"); }}><FileText className="w-4 h-4" /></button>
                        <button title="編輯" className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#6B7280", background: "#F3F4F6" }}
                          onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></button>
                        <button title="刪除" className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "#DC2626", background: "#FEF2F2" }}
                          onClick={() => setDeleteId(a.id)}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Pagination total={filtered.length} page={listPage} pageSize={PAGE_SIZE} onChange={(p) => { setListPage(p); }} />
        </Card>
      )}

      {/* ── Card View ──────────────────────────────────────────────────── */}
      {viewMode === "card" && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pagedAssets.map(a => {
            const { bookValue, depRate } = calcDepreciation(a);
            const cc = COND_CFG[a.condition];
            return (
              <div key={a.id} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                      <TypeIcon type={a.type} size={20} />
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <h3 className="truncate" style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{a.name}</h3>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>{a.model}</p>
                  <p className="tabular-nums mt-0.5" style={{ fontSize: "11px", color: "#D1D5DB", fontFamily: "monospace" }}>{a.serial}</p>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>使用者</span>
                      <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{a.assignee === "—" ? "未分配" : a.assignee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>機況</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: cc.color }}>{cc.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>帳面價值</span>
                      <span className="tabular-nums" style={{ fontSize: "12px", fontWeight: 700, color: depRate > 80 ? "#9CA3AF" : "#111827" }}>{fmtNT(bookValue)}</span>
                    </div>
                  </div>
                  {/* Depreciation bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>折舊進度</span>
                      <span style={{ fontSize: "11px", color: depRate > 80 ? "#DC2626" : "#9CA3AF" }}>{depRate}%</span>
                    </div>
                    <div className="w-full rounded-full overflow-hidden" style={{ height: "3px", background: "#F3F4F6" }}>
                      <div className="h-full rounded-full" style={{ width: `${depRate}%`, background: depRate > 80 ? "#DC2626" : depRate > 50 ? "#CA8A04" : "#6B7280" }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6", background: "#FAFAFA" }}>
                  <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{TYPE_CFG[a.type].label} · {a.dept === "—" ? "未分配" : a.dept}</span>
                  <div className="flex gap-1.5">
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "#6B7280", background: "#F3F4F6" }}
                      onClick={() => { setSelectedId(a.id); setDetailTab("info"); }}>
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "#6B7280", background: "#F3F4F6" }}
                      onClick={() => openEdit(a)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <Pagination total={filtered.length} page={listPage} pageSize={PAGE_SIZE} onChange={(p) => setListPage(p)} />
        </div>
        </>
      )}

      </div>
      )}

      {/* ── Asset Detail Modal ──────────────────────────────────────────── */}
      {selectedId != null && selected && (() => {
        const { bookValue, depRate, yearsUsed } = calcDepreciation(selected);
        const cc = COND_CFG[selected.condition];
        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 max-md:p-0" style={{ background: "rgba(17,24,39,0.45)" }}
            onClick={e => { if (e.target === e.currentTarget) setSelectedId(null); }}>
            <div className="w-full flex flex-col max-md:h-full max-md:rounded-none" style={{ maxWidth: "720px", maxHeight: "90vh", background: "#FFF", borderRadius: "12px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden" }}>
              {/* Header */}
              <div className="px-6 max-md:px-4 py-4 flex-shrink-0" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F3F4F6" }}>
                      <TypeIcon type={selected.type} size={20} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate" style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>{selected.name}</h2>
                      <p className="truncate" style={{ fontSize: "12px", color: "#9CA3AF" }}>{selected.model} · <span style={{ fontFamily: "monospace" }}>{selected.serial}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={selected.status} />
                    <button className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded"
                      style={{ fontSize: "12px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151" }}
                      onClick={() => { setSelectedId(null); openEdit(selected); }}>
                      <Pencil className="w-3.5 h-3.5" />編輯
                    </button>
                    <button className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                      onClick={() => setSelectedId(null)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Tabs */}
                <DraggableScroll className="mt-4 p-1 rounded-xl" style={{ background: "#F3F4F6" }} innerClassName="flex gap-1"
                  mobileDropdown={{
                    options: [
                      { key: "info", label: "基本資料" },
                      { key: "maintenance", label: `維修記錄（${selected.maintenance.length}）` },
                      { key: "transfers", label: `領用記錄（${selected.transfers.length}）` },
                    ],
                    activeKey: detailTab,
                    onSelect: (k) => setDetailTab(k as DetailTab),
                  }}>
                  {([
                    { key: "info",        label: "基本資料", icon: FileText },
                    { key: "maintenance", label: `維修記錄（${selected.maintenance.length}）`, icon: Wrench },
                    { key: "transfers",   label: `領用記錄（${selected.transfers.length}）`, icon: ArrowRightLeft },
                  ] as { key: DetailTab; label: string; icon: any }[]).map(t => {
                    const Icon = t.icon;
                    return (
                      <button key={t.key} onClick={() => setDetailTab(t.key)}
                        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0"
                        style={{ fontSize: "13px", fontWeight: detailTab === t.key ? 600 : 500, background: detailTab === t.key ? "#111827" : "transparent", color: detailTab === t.key ? "#FFF" : "#6B7280", boxShadow: detailTab === t.key ? "0 1px 4px rgba(0,0,0,0.15)" : "none" }}>
                        <Icon className="w-3.5 h-3.5" />{t.label}
                      </button>
                    );
                  })}
                </DraggableScroll>
              </div>

              {/* Tab body */}
              <div className="flex-1 overflow-y-auto px-6 max-md:px-4 py-5 max-md:py-4 space-y-4">

                {/* ─ 基本資料 ─ */}
                {detailTab === "info" && (
                  <>
                    {/* Depreciation highlight */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "帳面現值",   value: fmtNT(bookValue),         color: depRate > 80 ? "#DC2626" : "#111827" },
                        { label: "原始採購",   value: fmtNT(selected.purchasePrice), color: "#374151" },
                        { label: "已折舊",     value: `${depRate}%`,            color: depRate > 80 ? "#DC2626" : "#A16207" },
                        { label: "使用年限",   value: `${yearsUsed} / ${TYPE_CFG[selected.type].life} 年`, color: "#374151" },
                      ].map(item => (
                        <div key={item.label} className="p-3 rounded-lg text-center" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                          <p style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>{item.label}</p>
                          <p className="tabular-nums mt-1" style={{ fontSize: "16px", fontWeight: 700, color: item.color }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Depreciation bar */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>折舊進度</span>
                        <span style={{ fontSize: "11px", color: depRate > 80 ? "#DC2626" : "#9CA3AF" }}>{depRate}% 已折舊</span>
                      </div>
                      <div className="w-full rounded-full overflow-hidden" style={{ height: "6px", background: "#F3F4F6" }}>
                        <div className="h-full rounded-full" style={{ width: `${depRate}%`, background: depRate > 80 ? "#DC2626" : depRate > 50 ? "#CA8A04" : "#111827" }} />
                      </div>
                    </div>
                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "類型",       value: TYPE_CFG[selected.type].label },
                        { label: "機況",       value: cc.label, color: cc.color },
                        { label: "使用者",     value: selected.assignee === "—" ? "未分配" : selected.assignee },
                        { label: "部門",       value: selected.dept === "—" ? "—" : selected.dept },
                        { label: "放置位置",   value: selected.location },
                        { label: "保固到期",   value: selected.warrantyEnd || "—" },
                        { label: "購入日期",   value: selected.purchaseDate },
                        { label: "耐用年限",   value: `${TYPE_CFG[selected.type].life} 年` },
                      ].map(item => (
                        <div key={item.label} className="px-3 py-2.5 rounded" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                          <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{item.label}</p>
                          <p style={{ fontSize: "13px", fontWeight: 500, color: (item as any).color || "#374151", marginTop: "2px" }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {selected.notes && (
                      <div className="p-3 rounded" style={{ background: "#FFFBEB", borderWidth: "1px", borderStyle: "solid", borderColor: "#FDE68A" }}>
                        <p style={{ fontSize: "11px", color: "#92400E", fontWeight: 600, marginBottom: "4px" }}>備註</p>
                        <p style={{ fontSize: "13px", color: "#78350F" }}>{selected.notes}</p>
                      </div>
                    )}
                    {/* Quick status change */}
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "10px" }}>快速更新狀態</p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(STATUS_CFG) as AssetStatus[]).map(s => {
                          const c = STATUS_CFG[s];
                          return (
                            <button key={s} onClick={() => { setAssets(prev => prev.map(a => a.id === selected.id ? { ...a, status: s } : a)); showToast(`狀態已更新：${c.label}`); }}
                              className="px-4 py-2 rounded-lg"
                              style={{ fontSize: "13px", fontWeight: selected.status === s ? 600 : 400, background: selected.status === s ? c.bg : "#F9FAFB", color: selected.status === s ? c.color : "#9CA3AF", borderWidth: "1px", borderStyle: "solid", borderColor: selected.status === s ? c.dot + "40" : "#E5E7EB" }}>
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* ─ 維修記錄 ─ */}
                {detailTab === "maintenance" && (
                  <>
                    <div className="p-4 max-md:p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>新增維修記錄</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label style={lStyle}>維修類型</label>
                          <StyledSelect value={newMaintenance.type} onChange={v => setNewMaintenance(p => ({ ...p, type: v }))}
                            options={["預防保養", "故障維修", "例行保養", "零件更換", "其他"].map(t => ({ key: t, label: t }))} formField />
                        </div>
                        <div>
                          <label style={lStyle}>技術人員 / 廠商</label>
                          <input type="text" placeholder="維修人員或廠商名稱" value={newMaintenance.tech} onChange={e => setNewMaintenance(p => ({ ...p, tech: e.target.value }))} style={iStyle()} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label style={lStyle}>維修說明</label>
                          <input type="text" placeholder="說明維修內容" value={newMaintenance.desc} onChange={e => setNewMaintenance(p => ({ ...p, desc: e.target.value }))} style={iStyle()} />
                        </div>
                        <div>
                          <label style={lStyle}>費用（NT$）</label>
                          <input type="number" min={0} placeholder="0（免費填 0）" value={newMaintenance.cost || ""} onChange={e => setNewMaintenance(p => ({ ...p, cost: Number(e.target.value) }))} style={iStyle()} />
                        </div>
                      </div>
                      <button onClick={addMaintenance} className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded max-md:w-full"
                        style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 600 }}>
                        <Plus className="w-3.5 h-3.5" />新增記錄
                      </button>
                    </div>
                    {selected.maintenance.length === 0 ? (
                      <div className="py-10 text-center" style={{ color: "#9CA3AF", fontSize: "13px" }}>尚無維修記錄</div>
                    ) : (
                      <div className="space-y-2">
                        {[...selected.maintenance].reverse().map(m => (
                          <div key={m.id} className="flex items-start gap-3 p-4 rounded" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F3F4F6" }}>
                              <Wrench className="w-4 h-4" style={{ color: "#374151" }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", background: "#F3F4F6", color: "#374151", fontWeight: 600 }}>{m.type}</span>
                                <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{m.date}</span>
                              </div>
                              <p style={{ fontSize: "13px", color: "#374151" }}>{m.desc}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span style={{ fontSize: "11px", color: "#6B7280" }}>技術人員：{m.tech || "—"}</span>
                                <span className="tabular-nums" style={{ fontSize: "11px", fontWeight: 600, color: m.cost > 0 ? "#DC2626" : "#16A34A" }}>
                                  {m.cost > 0 ? fmtNT(m.cost) : "免費"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-between px-3 py-2 rounded" style={{ background: "#F9FAFB" }}>
                          <span style={{ fontSize: "12px", color: "#6B7280" }}>維修總費用</span>
                          <span className="tabular-nums" style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                            {fmtNT(selected.maintenance.reduce((s, m) => s + m.cost, 0))}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ─ 領用記錄 ─ */}
                {detailTab === "transfers" && (
                  <>
                    <div className="p-4 max-md:p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>資產移交</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label style={lStyle}>移交對象</label>
                          <input type="text" placeholder="姓名或單位" value={newTransfer.to} onChange={e => setNewTransfer(p => ({ ...p, to: e.target.value }))} style={iStyle()} />
                        </div>
                        <div>
                          <label style={lStyle}>部門</label>
                          <StyledSelect value={newTransfer.dept} onChange={v => setNewTransfer(p => ({ ...p, dept: v }))}
                            options={DEPTS.map(d => ({ key: d, label: d }))} placeholder="請選擇" formField />
                        </div>
                        <div>
                          <label style={lStyle}>經辦人</label>
                          <input type="text" placeholder="辦理移交的人員" value={newTransfer.operator} onChange={e => setNewTransfer(p => ({ ...p, operator: e.target.value }))} style={iStyle()} />
                        </div>
                      </div>
                      <button onClick={addTransfer} className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded max-md:w-full"
                        style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 600 }}>
                        <ArrowRightLeft className="w-3.5 h-3.5" />確認移交
                      </button>
                    </div>
                    <div className="space-y-2">
                      {[...selected.transfers].reverse().map(t => (
                        <div key={t.id} className="flex items-center gap-3 p-3 rounded" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#111827" }}>
                            <ArrowRightLeft className="w-3.5 h-3.5" style={{ color: "#FFF" }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>{t.from}</span>
                              <ChevronRight className="w-3 h-3" style={{ color: "#9CA3AF" }} />
                              <span style={{ fontSize: "13px", color: "#111827", fontWeight: 600 }}>{t.to}</span>
                              {t.dept && <span style={{ fontSize: "11px", color: "#9CA3AF" }}>({t.dept})</span>}
                            </div>
                            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px" }}>
                              {t.date} · 經辦：{t.operator}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-6 max-md:px-4 py-3 flex-shrink-0 max-md:flex-col" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}>
                <p className="max-md:text-center" style={{ fontSize: "12px", color: "#9CA3AF" }}>
                  購入 {selected.purchaseDate} · 保固{selected.warrantyEnd ? ` 至 ${selected.warrantyEnd}` : "未設定"}
                </p>
                <div className="flex items-center gap-2 max-md:w-full">
                  <button className="md:hidden flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded"
                    style={{ fontSize: "13px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151" }}
                    onClick={() => { setSelectedId(null); openEdit(selected); }}>
                    <Pencil className="w-3.5 h-3.5" />編輯
                  </button>
                  <button className="px-4 py-2.5 rounded max-md:flex-1" style={{ fontSize: "13px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151" }}
                    onClick={() => setSelectedId(null)}>關閉</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Add / Edit Modal ────────────────────────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-md:p-0" style={{ background: "rgba(17,24,39,0.45)" }}
          onClick={e => { if (e.target === e.currentTarget) setIsFormOpen(false); }}>
          <div className="w-full max-w-xl flex flex-col max-md:max-w-none max-md:h-full max-md:rounded-none" style={{ background: "#FFF", borderRadius: "12px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "90vh", overflow: "hidden" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 max-md:px-4 py-4 flex-shrink-0" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 md:hidden" style={{ background: "#F3F4F6" }}>
                  <Package className="w-5 h-5" style={{ color: "#374151" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>{editingId ? "編輯資產" : "新增資產"}</h2>
                  <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "2px" }}>{editingId ? "修改資產資訊" : "填寫以下欄位建立新資產"}</p>
                </div>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 max-md:px-4 max-md:py-4 overflow-y-auto flex-1">
              {/* ── Section: 基本識別 ── */}
              <div className="mb-5 max-md:mb-4">
                <p className="flex items-center gap-2 mb-3" style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                  <span className="w-1 h-4 rounded-full" style={{ background: "#111827" }} />
                  基本識別
                </p>
                <div className="space-y-3">
                  <div>
                    <label style={lStyle}>資產名稱 <span style={{ color: "#DC2626" }}>*</span></label>
                    <input type="text" placeholder="如：MacBook Pro 14" value={form.name} onChange={e => setF("name", e.target.value)} style={iStyle(formErrors.name)} />
                    {formErrors.name && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px" }}>{formErrors.name}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label style={lStyle}>類型 <span style={{ color: "#DC2626" }}>*</span></label>
                      <StyledSelect value={form.type} onChange={v => setF("type", v as AssetType)}
                        options={(Object.keys(TYPE_CFG) as AssetType[]).map(t => ({ key: t, label: TYPE_CFG[t].label }))} formField />
                    </div>
                    <div>
                      <label style={lStyle}>型號 <span style={{ color: "#DC2626" }}>*</span></label>
                      <input type="text" placeholder="詳細規格型號" value={form.model} onChange={e => setF("model", e.target.value)} style={iStyle(formErrors.model)} />
                      {formErrors.model && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px" }}>{formErrors.model}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label style={lStyle}>序號 <span style={{ color: "#DC2626" }}>*</span></label>
                      <input type="text" placeholder="唯一識別序號" value={form.serial} onChange={e => setF("serial", e.target.value)} style={iStyle(formErrors.serial)} />
                      {formErrors.serial && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px" }}>{formErrors.serial}</p>}
                    </div>
                    <div>
                      <label style={lStyle}>機況</label>
                      <StyledSelect value={form.condition} onChange={v => setF("condition", v as AssetCondition)}
                        options={(Object.keys(COND_CFG) as AssetCondition[]).map(c => ({ key: c, label: COND_CFG[c].label }))} formField />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section: 採購資訊 ── */}
              <div className="mb-5 max-md:mb-4 pt-4" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                <p className="flex items-center gap-2 mb-3" style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                  <span className="w-1 h-4 rounded-full" style={{ background: "#2563EB" }} />
                  採購資訊
                </p>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label style={lStyle}>購入日期 <span style={{ color: "#DC2626" }}>*</span></label>
                      <DatePicker value={form.purchaseDate} onChange={v => setF("purchaseDate", v)} placeholder="選擇購入日期" formField />
                      {formErrors.purchaseDate && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px" }}>{formErrors.purchaseDate}</p>}
                    </div>
                    <div>
                      <label style={lStyle}>購入金額（NT$） <span style={{ color: "#DC2626" }}>*</span></label>
                      <input type="number" min={0} placeholder="0" value={form.purchasePrice || ""} onChange={e => setF("purchasePrice", Number(e.target.value))} style={iStyle(formErrors.purchasePrice)} />
                      {formErrors.purchasePrice && <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px" }}>{formErrors.purchasePrice}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label style={lStyle}>保固到期日</label>
                      <DatePicker value={form.warrantyEnd} onChange={v => setF("warrantyEnd", v)} placeholder="選擇保固到期日" formField minDate={form.purchaseDate || undefined} />
                    </div>
                    <div>
                      <label style={lStyle}>狀態</label>
                      <StyledSelect value={form.status} onChange={v => setF("status", v as AssetStatus)}
                        options={(Object.keys(STATUS_CFG) as AssetStatus[]).map(s => ({ key: s, label: STATUS_CFG[s].label }))} formField />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section: 使用與位置 ── */}
              <div className="mb-4 max-md:mb-3 pt-4" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#F3F4F6" }}>
                <p className="flex items-center gap-2 mb-3" style={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                  <span className="w-1 h-4 rounded-full" style={{ background: "#16A34A" }} />
                  使用與位置
                </p>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label style={lStyle}>使用者</label>
                      <input type="text" placeholder="姓名或單位" value={form.assignee} onChange={e => setF("assignee", e.target.value)} style={iStyle()} />
                    </div>
                    <div>
                      <label style={lStyle}>部門</label>
                      <StyledSelect value={form.dept} onChange={v => setF("dept", v)}
                        options={DEPTS.map(d => ({ key: d, label: d }))} placeholder="請選擇" formField />
                    </div>
                  </div>
                  <div>
                    <label style={lStyle}>放置位置</label>
                    <input type="text" placeholder="如：3F 技術部辦公室" value={form.location} onChange={e => setF("location", e.target.value)} style={iStyle()} />
                  </div>
                  <div>
                    <label style={lStyle}>備註</label>
                    <textarea rows={2} placeholder="其他說明..." value={form.notes} onChange={e => setF("notes", e.target.value)} style={{ ...iStyle(), resize: "none", minHeight: "56px" }} />
                  </div>
                </div>
              </div>

              {/* Preview */}
              {form.name && form.purchasePrice > 0 && (
                <div className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: "#F0FDF4", borderWidth: "1px", borderStyle: "solid", borderColor: "#BBF7D0" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FFFFFF" }}>
                      <TypeIcon type={form.type} size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>{form.name}</span>
                      <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{TYPE_CFG[form.type].label}{form.model ? ` · ${form.model}` : ""}</p>
                    </div>
                  </div>
                  <span className="tabular-nums flex-shrink-0" style={{ fontSize: "16px", fontWeight: 700, color: "#15803D" }}>{fmtNT(form.purchasePrice)}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 max-md:px-4 py-4 flex-shrink-0 max-md:flex-col-reverse" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}>
              <button onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 rounded max-md:w-full"
                style={{ fontSize: "14px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", fontFamily: "inherit" }}>
                取消
              </button>
              <button onClick={submitForm} className="px-5 py-2.5 rounded flex items-center justify-center gap-2 max-md:w-full"
                style={{ fontSize: "14px", fontWeight: 600, background: "#111827", color: "#FFF", fontFamily: "inherit" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}>
                <Check className="w-4 h-4" />{editingId ? "儲存變更" : "新增資產"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ──────────────────────────────────────────────── */}
      {deleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(17,24,39,0.45)" }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div className="w-full max-w-sm p-6" style={{ background: "#FFF", borderRadius: "12px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "#FEF2F2" }}>
              <Trash2 className="w-5 h-5" style={{ color: "#DC2626" }} />
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>確認刪除此資產？</h3>
            <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6 }}>
              「{assets.find(a => a.id === deleteId)?.name}」及所有維修與領用記錄將被永久刪除，無法復原。
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded"
                style={{ fontSize: "14px", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", color: "#374151", fontFamily: "inherit" }}>
                取消
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded"
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
