import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus, Pin, PinOff, Calendar, User, Eye, Search, X, Check,
  AlertTriangle, Edit3, Trash2, Megaphone, Bell, FileText,
  Printer, Link2, BarChart2, ArrowLeft,
} from "lucide-react";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { StyledSelect } from "../components/StyledSelect";
import { DatePicker } from "../components/DatePicker";

const PAGE_SIZE = 10;
const TODAY     = "2026-03-11";

type ATag = "活動" | "系統" | "會議" | "人事" | "公告" | "表揚";

interface Ann {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  pinned: boolean;
  views: number;
  tag: ATag;
}

const INIT: Ann[] = [
  { id: 1,  title: "下週一員工旅遊通知",        content: "各位同仁請注意，公司將於下週一（3月10日）舉辦員工旅遊活動，地點為市郊休閒農場，請大家準時參加。當天不用到公司打卡，但需要在活動現場簽到。活動備有豐富餐點與交流活動，請輕便著裝並攜帶防曬用品。",                                                    author: "人資部",     date: "2026-03-06", pinned: true,  views: 156, tag: "活動" },
  { id: 2,  title: "系統升級維護通知",           content: "為了提升系統效能與使用者體驗，本系統將於本週六（3月8日）晚上 22:00 至隔日 6:00 進行升級維護，期間無法使用，請大家提前做好工作安排，造成不便敬請見諒。升級完成後將新增多項功能，詳情請見後續公告。",                                                      author: "資訊部",     date: "2026-03-05", pinned: true,  views: 203, tag: "系統" },
  { id: 3,  title: "第一季度總結會議安排",       content: "第一季即將結束，公司將於 3 月 15 日下午 2 點在 3F 大會議室召開季度總結會議。各部門主管請準備好本季度工作總結與下季度工作計畫，報告時間每部門約 10 分鐘。請務必準時出席。",                                                                        author: "經營管理部", date: "2026-03-04", pinned: false, views: 142, tag: "會議" },
  { id: 4,  title: "歡迎新進同仁",                 content: "熱烈歡迎李明、王芳兩位新同仁加入我們的團隊！李明將加入技術部擔任後端工程師，王芳將加入行銷部擔任行銷專員。希望大家多多關照，一起共同成長！歡迎在走廊上或午餐時間與他們打個招呼。",                                                                  author: "人資部",     date: "2026-03-03", pinned: false, views: 189, tag: "人事" },
  { id: 5,  title: "辦公室停電通知",             content: "因大樓進行電力檢修，辦公大樓將於明天（3月3日）上午 9:00–11:00 停電。請大家提前儲存好工作檔案，筆記型電腦請充飽電，並避免使用影印機等大型耗電設備。",                                                                                        author: "總務部",     date: "2026-03-02", pinned: false, views: 167, tag: "公告" },
  { id: 6,  title: "2月份優秀員工表揚",          content: "恭喜張三、李四、王五三位同仁獲得 2 月份優秀員工榮譽！他們在工作中表現優異，為公司發展做出重要貢獻。公司將頒發每人 NT$1,000 元獎金與獎狀，並於下週例會上正式表揚，請大家一同給予掌聲鼓勵。",                                          author: "人資部",     date: "2026-03-01", pinned: false, views: 234, tag: "表揚" },
  { id: 7,  title: "2026年度員工健檢通知",       content: "公司今年度員工健康檢查將於 3 月 25 日至 4 月 5 日陸續進行，請各部門同仁依照排程前往指定醫療機構。費用由公司全額負擔，項目包含一般內外科、血液常規、胸部 X 光及腸胃鏡（40 歲以上）。",                                              author: "人資部",     date: "2026-02-28", pinned: false, views: 198, tag: "人事" },
  { id: 8,  title: "Q2 目標設定說明會",          content: "Q2 目標設定說明會於 3 月 20 日下午 3 點召開，請各部門主管攜帶本部門 Q1 成果報告與 Q2 初步規劃。會議預計進行約 2 小時，屆時將進行目標對齊與資源分配討論。",                                                                        author: "經營管理部", date: "2026-02-25", pinned: false, views: 127, tag: "會議" },
  { id: 9,  title: "辦公室冷氣保養公告",         content: "總務部將於本月底安排辦公室冷氣系統年度保養，保養期間可能造成局部冷氣停用，各樓層同仁請提前知悉。如有任何不便請聯絡總務部分機 206。",                                                                                                    author: "總務部",     date: "2026-02-22", pinned: false, views: 89,  tag: "公告" },
  { id: 10, title: "資安培訓課程報名開始",       content: "公司將於 4 月舉辦資訊安全培訓，課程涵蓋社交工程防範、密碼管理、資料保護等主題。全員必須於 4 月底前完成線上課程（約 2 小時），實體研討課程有限名額（30 人），請於 3 月 15 日前至內部系統完成報名。",                                         author: "資訊部",     date: "2026-02-20", pinned: false, views: 155, tag: "系統" },
  { id: 11, title: "春節假期補班說明",           content: "依照國定假日規定，春節連假補班安排如下：2 月 8 日（週六）須正常上班，補 1 月 27 日（除夕）。請各部門主管提前通知同仁安排出勤，如有特殊情況請洽人資部。",                                                                              author: "人資部",     date: "2026-02-15", pinned: false, views: 312, tag: "人事" },
  { id: 12, title: "停車場使用規則更新",         content: "為改善地下停車場使用效率，即日起調整車位分配方式。各部門固定車位調整詳見 B1 佈告欄，臨時訪客車位移至北側入口。違規停放將依規定拍照記錄並通知部門主管。",                                                                              author: "總務部",     date: "2026-02-10", pinned: false, views: 104, tag: "公告" },
  { id: 13, title: "員工推薦獎金方案上線",       content: "為鼓勵同仁協助招募優質人才，即日起推出員工推薦獎金方案：成功推薦並通過試用期後，推薦人可獲得 NT$5,000 獎金，推薦高階職缺另有加碼。詳情請洽人資部或查閱內部規章 HR-2026-003。",                                              author: "人資部",     date: "2026-02-05", pinned: false, views: 267, tag: "人事" },
];

// ── Config ──────────────────────────────────────────────────
const TAG_CFG: Record<string, { bg: string; color: string; dot: string }> = {
  活動: { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
  系統: { bg: "#FEF9C3", color: "#A16207", dot: "#EAB308" },
  會議: { bg: "#F0FDF4", color: "#15803D", dot: "#22C55E" },
  人事: { bg: "#F5F3FF", color: "#7C3AED", dot: "#A78BFA" },
  公告: { bg: "#F3F4F6", color: "#374151", dot: "#9CA3AF" },
  表揚: { bg: "#FFF7ED", color: "#C2410C", dot: "#F97316" },
};
const ALL_TAGS: ATag[] = ["活動", "系統", "會議", "人事", "公告", "表揚"];
const AUDIENCES = ["全體員工", "技術部", "行銷部", "業務部", "設計部", "管理層"];

const emptyForm = (): {
  title: string; tag: ATag; content: string;
  pinned: boolean; date: string; author: string; audience: string;
} => ({
  title: "", tag: "公告", content: "",
  pinned: false, date: TODAY, author: "系統管理者", audience: "全體員工",
});

// ─── Sub-components ─────────────────────────────────────────────────────────
const Card = ({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={className} style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", ...style }}>
    {children}
  </div>
);

const TagBadge = ({ tag, size = "sm" }: { tag: string; size?: "xs" | "sm" }) => {
  const c = TAG_CFG[tag] || TAG_CFG["公告"];
  return (
    <span className="inline-flex items-center gap-1 rounded"
      style={{
        fontSize: size === "xs" ? "12px" : "13px",
        fontWeight: 600,
        padding: size === "xs" ? "1px 6px" : "2px 8px",
        background: c.bg, color: c.color,
      }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {tag}
    </span>
  );
};

const iStyle = (err?: string): React.CSSProperties => ({
  width: "100%", padding: "8px 12px", fontSize: "15px",
  background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid",
  borderColor: err ? "#DC2626" : "#E5E7EB", borderRadius: "6px",
  color: "#111827", outline: "none", fontFamily: "inherit",
});
const lStyle: React.CSSProperties = {
  display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "5px",
};

// ─── Main ────────────────────────────────────────────────────────────────────
export function Announcements() {
  const { permissions } = useAuth();
  const canPublish = permissions.canPublishAnnouncement;
  const [list,        setList]       = useState<Ann[]>(INIT);
  const [selectedId,  setSelectedId] = useState<number | null>(INIT[0]?.id ?? null);
  const [search,      setSearch]     = useState("");
  const [filterTag,   setFilterTag]  = useState<ATag | "all">("all");
  const [sortBy,      setSortBy]     = useState<"date" | "views">("date");
  const [listPage,    setListPage]   = useState(1);
  const [tagOpen,     setTagOpen]    = useState(false);

  // Mobile detail view state
  const [mobileDetail, setMobileDetail] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab,    setModalTab]    = useState<"write" | "preview">("write");
  const [form,        setForm]        = useState(emptyForm());
  const [formErrors,  setFormErrors]  = useState<Record<string, string>>({});
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const setF = <K extends keyof ReturnType<typeof emptyForm>>(k: K, v: any) => {
    setForm(p => ({ ...p, [k]: v }));
    setFormErrors(e => { const { [k]: _, ...r } = e; return r; });
  };

  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2800); };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    let items = list.filter(a => {
      const matchS = !s || a.title.includes(s) || a.content.includes(s) || a.author.includes(s);
      const matchT = filterTag === "all" || a.tag === filterTag;
      return matchS && matchT;
    });
    items = [...items].sort((a, b) =>
      sortBy === "date" ? b.date.localeCompare(a.date) : b.views - a.views
    );
    return items;
  }, [list, search, filterTag, sortBy]);

  const pinned      = filtered.filter(a => a.pinned);
  const regular     = filtered.filter(a => !a.pinned);
  const pagedReg    = regular.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE);
  const selected    = list.find(a => a.id === selectedId) ?? null;

  const stats = useMemo(() => ({
    total:      list.length,
    thisWeek:   list.filter(a => a.date >= "2026-03-05").length,
    pinnedCount: list.filter(a => a.pinned).length,
    totalViews: list.reduce((s, a) => s + a.views, 0),
  }), [list]);

  const tagCounts = useMemo(() => {
    const m: Record<string, number> = {};
    list.forEach(a => { m[a.tag] = (m[a.tag] || 0) + 1; });
    return m;
  }, [list]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditingId(null); setForm(emptyForm()); setFormErrors({});
    setModalTab("write"); setIsModalOpen(true);
  };
  const openEdit = (a: Ann) => {
    setEditingId(a.id);
    setForm({ title: a.title, tag: a.tag, content: a.content, pinned: a.pinned, date: a.date, author: a.author, audience: "全體員工" });
    setFormErrors({}); setModalTab("write"); setIsModalOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim())   errs.title   = "請輸入公告標題";
    if (!form.content.trim()) errs.content = "請輸入公告內容";
    setFormErrors(errs);
    return !Object.keys(errs).length;
  };

  const publish = () => {
    if (!validate()) return;
    if (editingId != null) {
      setList(p => p.map(a => a.id === editingId ? { ...a, ...form } : a));
      showToast("公告已更新");
    } else {
      const na: Ann = { id: Math.max(...list.map(a => a.id), 0) + 1, ...form, views: 0 };
      setList(p => [na, ...p]);
      setSelectedId(na.id);
      showToast("公告已發布");
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId == null) return;
    const nextId = list.find(a => a.id !== deleteId)?.id ?? null;
    setList(p => p.filter(a => a.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(nextId);
    setDeleteId(null);
    showToast("公告已刪除", false);
  };

  const togglePin = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const was = list.find(a => a.id === id)?.pinned;
    setList(p => p.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
    showToast(was ? "已取消置頂" : "已設為置頂");
  };

  const selectAnn = (id: number) => {
    setSelectedId(id);
    setMobileDetail(true);
    setList(p => p.map(a => a.id === id ? { ...a, views: a.views + 1 } : a));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
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

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={`flex items-center justify-between flex-shrink-0 max-md:flex-col max-md:items-stretch max-md:gap-3 ${mobileDetail ? "max-lg:hidden" : ""}`}>
        <div>
          <h1 style={{ color: "#111827" }}>最新公告</h1>
          <p style={{ fontSize: "15px", color: "#9CA3AF", marginTop: "2px" }}>發布與查看公司重要訊息</p>
        </div>
        {canPublish && (
          <button
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg max-md:w-full"
            style={{ background: "#111827", color: "#FFF", fontSize: "13px", fontWeight: 500 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}
            onClick={openNew}
          >
            <Plus className="w-3.5 h-3.5" />發布公告
          </button>
        )}
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0 ${mobileDetail ? "max-lg:hidden" : ""}`}>
        {[
          { label: "全部公告",  value: stats.total,           unit: "則",  icon: FileText,  bg: "#F9FAFB", ic: "#374151" },
          { label: "本週新增",  value: stats.thisWeek,        unit: "則",  icon: Bell,      bg: "#EFF6FF", ic: "#2563EB" },
          { label: "置頂公告",  value: stats.pinnedCount,     unit: "則",  icon: Pin,       bg: "#FEF9C3", ic: "#CA8A04" },
          { label: "累計瀏覽",  value: stats.totalViews,      unit: "次",  icon: BarChart2, bg: "#F0FDF4", ic: "#16A34A" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.04em" }}>{item.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: item.ic }} />
                </div>
              </div>
              <p className="tabular-nums" style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                {item.value.toLocaleString()}
                <span style={{ fontSize: "14px", fontWeight: 500, color: "#9CA3AF", marginLeft: 2 }}>{item.unit}</span>
              </p>
            </Card>
          );
        })}
      </div>

      {/* ── Main Area ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">

        {/* ── Left: List Panel (hidden on mobile when viewing detail) ──── */}
        <div className={`${mobileDetail ? "hidden lg:flex" : "flex"} w-full lg:w-[400px] flex-shrink-0 flex-col min-h-0 gap-3`}>

          {/* Search + Sort */}
          <div className="flex gap-2 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
              <input type="text" placeholder="搜尋公告標題、內容…" value={search}
                onChange={e => { setSearch(e.target.value); setListPage(1); }}
                className="w-full pl-9 pr-3 py-2 rounded outline-none"
                style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "14px", color: "#111827", fontFamily: "inherit" }}
              />
            </div>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded flex-shrink-0"
              style={{ background: "#FFF", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB", fontSize: "12px", color: "#374151" }}
              onClick={() => setSortBy(s => s === "date" ? "views" : "date")}
              title="切換排序"
            >
              {sortBy === "date" ? <Calendar className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {sortBy === "date" ? "最新" : "熱門"}
            </button>
          </div>

          {/* Tag filter chips */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <StyledSelect
                value={filterTag}
                onChange={v => { setFilterTag(v as ATag | "all"); setListPage(1); }}
                options={[
                  { key: "all", label: `全部 (${list.length})` },
                  ...ALL_TAGS.map(t => ({ key: t, label: `${t} (${tagCounts[t] || 0})` })),
                ]}
                formField
              />
            </div>
          </div>

          {/* List Body */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">

            {/* Pinned */}
            {pinned.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-1.5 px-1 mb-2">
                  <Pin className="w-3 h-3" style={{ color: "#D97706" }} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", letterSpacing: "0.04em" }}>置頂公告</span>
                </div>
                {pinned.map(a => (
                  <div key={a.id} className="mb-2 last:mb-0">
                    <ListItem a={a} selectedId={selectedId} onSelect={selectAnn} onTogglePin={togglePin} />
                  </div>
                ))}
                <div className="mt-2 mb-1" style={{ borderTopWidth: "1px", borderTopStyle: "dashed", borderTopColor: "#E5E7EB" }} />
              </div>
            )}

            {/* Regular */}
            {pagedReg.length > 0
              ? pagedReg.map(a => (
                  <ListItem key={a.id} a={a} selectedId={selectedId} onSelect={selectAnn} onTogglePin={togglePin} />
                ))
              : pinned.length === 0 && <div className="py-10 text-center" style={{ color: "#9CA3AF", fontSize: "14px" }}>找不到相關公告</div>
            }
          </div>

          {/* Pagination */}
          {regular.length > PAGE_SIZE && (
            <div className="flex-shrink-0">
              <Pagination total={regular.length} page={listPage} pageSize={PAGE_SIZE} onChange={setListPage} />
            </div>
          )}
        </div>

        {/* ── Right: Detail Panel (hidden on mobile when viewing list) ── */}
        <div className={`${mobileDetail ? "flex" : "hidden lg:flex"} flex-1 min-h-0 flex-col overflow-y-auto`}>
          {selected ? (
            <Card className="h-full flex flex-col">
              {/* Mobile back button */}
              <div className="lg:hidden flex-shrink-0 px-4 pt-4">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded"
                  style={{ fontSize: "13px", fontWeight: 500, color: "#6B7280", background: "#F3F4F6" }}
                  onClick={() => setMobileDetail(false)}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />返回列表
                </button>
              </div>
              {/* Article Header */}
              <div className="flex-shrink-0 px-4 sm:px-8 pt-5 sm:pt-8 pb-4 sm:pb-6" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <TagBadge tag={selected.tag} />
                    {selected.pinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
                        style={{ fontSize: "11px", fontWeight: 600, background: "#FFFBEB", color: "#92400E" }}>
                        <Pin className="w-3 h-3" />置頂中
                      </span>
                    )}
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    {canPublish && (
                      <>
                        <ActionBtn icon={selected.pinned ? PinOff : Pin} label={selected.pinned ? "取消置頂" : "設為置頂"}
                          onClick={() => togglePin(selected.id)} />
                        <span className="hidden sm:inline-flex"><ActionBtn icon={Edit3} label="編輯" onClick={() => openEdit(selected)} /></span>
                        <span className="hidden sm:inline-flex"><ActionBtn icon={Trash2} label="刪除" danger onClick={() => setDeleteId(selected.id)} /></span>
                      </>
                    )}
                  </div>
                </div>

                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", lineHeight: 1.4, marginBottom: "12px" }}>
                  {selected.title}
                </h2>

                <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
                  {[
                    { icon: User,     text: selected.author },
                    { icon: Calendar, text: selected.date },
                    { icon: Eye,      text: `${selected.views.toLocaleString()} 次瀏覽` },
                  ].map(m => (
                    <div key={m.text} className="flex items-center gap-1.5">
                      <m.icon className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                      <span style={{ fontSize: "14px", color: "#6B7280" }}>{m.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Article Body */}
              <div className="flex-1 px-4 sm:px-8 py-5 sm:py-7 overflow-y-auto">
                <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
                  {selected.content}
                </p>
              </div>

              {/* Mobile action bar */}
              {canPublish && (
                <div className="lg:hidden flex-shrink-0 px-4 py-3 flex items-center gap-2" style={{ borderColor: "transparent", borderTopColor: "#F3F4F6", borderTopWidth: "1px", borderTopStyle: "solid" }}>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded"
                    style={{ fontSize: "13px", fontWeight: 500, color: "#374151", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                    onClick={() => openEdit(selected)}>
                    <Edit3 className="w-3.5 h-3.5" />編輯
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded"
                    style={{ fontSize: "13px", fontWeight: 500, color: "#DC2626", borderWidth: "1px", borderStyle: "solid", borderColor: "#FEE2E2" }}
                    onClick={() => setDeleteId(selected.id)}>
                    <Trash2 className="w-3.5 h-3.5" />刪除
                  </button>
                </div>
              )}

              {/* Article Footer */}
              <div className="flex-shrink-0 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between" style={{ borderColor: "transparent", borderTopColor: "#F3F4F6", borderTopWidth: "1px", borderTopStyle: "solid" }}>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                  最後更新：{selected.date}
                </span>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded"
                    style={{ fontSize: "12px", color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <Link2 className="w-3.5 h-3.5" />複製連結
                  </button>
                  <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded"
                    style={{ fontSize: "12px", color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <Printer className="w-3.5 h-3.5" />列印
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3" style={{ color: "#D1D5DB" }}>
              <Megaphone className="w-14 h-14" strokeWidth={1} />
              <p style={{ fontSize: "16px", color: "#9CA3AF" }}>點選左側公告以查看完內容</p>
              {canPublish && (
                <button
                  className="mt-2 flex items-center gap-2 px-4 py-2 rounded"
                  style={{ fontSize: "13px", color: "#374151", background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                  onClick={openNew}
                >
                  <Plus className="w-4 h-4" />發布第一則公告
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Publish / Edit Modal ─────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-md:p-0"
          style={{ background: "rgba(17,24,39,0.45)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="flex flex-col w-full max-w-2xl rounded-xl overflow-hidden max-md:max-w-none max-md:h-full max-md:rounded-none"
            style={{ background: "#FFF", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "90vh" }}>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#E5E7EB" }}>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>
                  {editingId != null ? "編輯公告" : "發布新公告"}
                </h2>
                <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "1px" }}>
                  {editingId != null ? "修改現有公告的內容與設定" : "填寫資訊後即可發布至全站"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Write / Preview tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#F3F4F6" }}>
                  {(["write", "preview"] as const).map(t => {
                    const active = modalTab === t;
                    return (
                      <button key={t}
                        className="px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          fontSize: "13px", fontWeight: active ? 600 : 500,
                          background: active ? "#111827" : "transparent",
                          color: active ? "#FFF" : "#6B7280",
                          boxShadow: active ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                        }}
                        onClick={() => setModalTab(t)}
                      >
                        {t === "write" ? "撰寫" : "預覽"}
                      </button>
                    );
                  })}
                </div>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ color: "#9CA3AF" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  onClick={() => setIsModalOpen(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto">

              {modalTab === "write" ? (
                <div className="p-6 max-md:p-4 space-y-5">

                  {/* 標題 */}
                  <div>
                    <label style={lStyle}>公告標題 <span style={{ color: "#DC2626" }}>*</span></label>
                    <input type="text" placeholder="輸入公告標題…" value={form.title}
                      onChange={e => setF("title", e.target.value)}
                      style={iStyle(formErrors.title)} />
                    <div className="flex justify-between mt-1">
                      {formErrors.title
                        ? <span style={{ fontSize: "12px", color: "#DC2626" }}>{formErrors.title}</span>
                        : <span />}
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{form.title.length} 字</span>
                    </div>
                  </div>

                  {/* 類別 + 置頂 + 日期 + 對象 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label style={lStyle}>類別</label>
                      <StyledSelect
                        value={form.tag}
                        onChange={v => setF("tag", v as ATag)}
                        options={ALL_TAGS.map(t => ({ key: t, label: t }))}
                        formField
                      />
                    </div>
                    <div>
                      <label style={lStyle}>發布對象</label>
                      <StyledSelect
                        value={form.audience}
                        onChange={v => setF("audience", v)}
                        options={AUDIENCES.map(a => ({ key: a, label: a }))}
                        formField
                      />
                    </div>
                    <div>
                      <label style={lStyle}>發布日期</label>
                      <DatePicker value={form.date} onChange={v => setF("date", v)} placeholder="選擇發布日期" formField />
                    </div>
                    <div>
                      <label style={lStyle}>發布人</label>
                      <input type="text" value={form.author} onChange={e => setF("author", e.target.value)}
                        style={iStyle()} />
                    </div>
                  </div>

                  {/* 置頂 Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: "#F9FAFB", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                    <div>
                      <p style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>設為置頂公告</p>
                      <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "1px" }}>置頂公告將優先顯示在清單頂部</p>
                    </div>
                    <button
                      className="relative w-11 h-6 rounded-full transition-all duration-200"
                      style={{ background: form.pinned ? "#111827" : "#D1D5DB" }}
                      onClick={() => setF("pinned", !form.pinned)}
                    >
                      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                        style={{ left: form.pinned ? "calc(100% - 22px)" : "2px" }} />
                    </button>
                  </div>

                  {/* 內容 */}
                  <div>
                    <label style={lStyle}>公告內容 <span style={{ color: "#DC2626" }}>*</span></label>
                    <textarea
                      rows={7}
                      placeholder="請輸入公告內容，支援換行排版…"
                      value={form.content}
                      onChange={e => setF("content", e.target.value)}
                      style={{ ...iStyle(formErrors.content), resize: "vertical", lineHeight: 1.7 }}
                    />
                    <div className="flex justify-between mt-1">
                      {formErrors.content
                        ? <span style={{ fontSize: "12px", color: "#DC2626" }}>{formErrors.content}</span>
                        : <span />}
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{form.content.length} 字</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Preview */
                <div className="p-6 max-md:p-4">
                  <div className="rounded-xl overflow-hidden" style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}>
                    <div className="px-8 max-md:px-4 pt-7 max-md:pt-5 pb-5 max-md:pb-3" style={{ borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "#F3F4F6" }}>
                      <div className="flex items-center gap-2 mb-4">
                        <TagBadge tag={form.tag} />
                        {form.pinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
                            style={{ fontSize: "11px", fontWeight: 600, background: "#FFFBEB", color: "#92400E" }}>
                            <Pin className="w-3 h-3" />置頂中
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontSize: "20px", fontWeight: 700, color: form.title ? "#111827" : "#D1D5DB", lineHeight: 1.4, marginBottom: "14px" }}>
                        {form.title || "（未輸入標題）"}
                      </h2>
                      <div className="flex items-center gap-5">
                        {[
                          { icon: User,     text: form.author || "填寫" },
                          { icon: Calendar, text: form.date },
                          { icon: Eye,      text: "0 次瀏覽" },
                        ].map(m => (
                          <div key={m.text} className="flex items-center gap-1.5">
                            <m.icon className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
                            <span style={{ fontSize: "13px", color: "#6B7280" }}>{m.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="px-8 max-md:px-4 py-6 max-md:py-4">
                      <p style={{ fontSize: "14px", color: form.content ? "#374151" : "#D1D5DB", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
                        {form.content || "（未輸入內容）"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E5E7EB" }}>
              <button className="px-4 py-2 rounded"
                style={{ fontSize: "14px", color: "#6B7280", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                onClick={() => setIsModalOpen(false)}>
                取消
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2 rounded"
                style={{ background: "#111827", color: "#FFF", fontSize: "14px", fontWeight: 600 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1F2937"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#111827"; }}
                onClick={publish}
              >
                <Megaphone className="w-4 h-4" />
                {editingId != null ? "儲存變更" : "立即發布"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Dialog ────────────────────────────────────────── */}
      {deleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(17,24,39,0.45)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-xl overflow-hidden"
            style={{ background: "#FFF", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            <div className="p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "#FEF2F2" }}>
                <Trash2 className="w-5 h-5" style={{ color: "#DC2626" }} />
              </div>
              <h3 className="text-center" style={{ fontSize: "19px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>確認刪除公告？</h3>
              <p className="text-center" style={{ fontSize: "15px", color: "#6B7280" }}>
                「{list.find(a => a.id === deleteId)?.title}」<br />
                刪除後無法復原，請確認是否繼續。
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button className="flex-1 py-2 rounded"
                style={{ fontSize: "13px", color: "#374151", borderWidth: "1px", borderStyle: "solid", borderColor: "#E5E7EB" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                onClick={() => setDeleteId(null)}>
                取消
              </button>
              <button className="flex-1 py-2 rounded"
                style={{ fontSize: "15px", fontWeight: 600, background: "#DC2626", color: "#FFF" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#B91C1C"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#DC2626"; }}
                onClick={confirmDelete}>
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── List Item Sub-component ────────────────────────────────────────────────
function ListItem({
  a, selectedId, onSelect, onTogglePin,
}: {
  a: Ann;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onTogglePin: (id: number, e?: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedId === a.id;
  const c = TAG_CFG[a.tag] || TAG_CFG["公告"];

  return (
    <div
      className="p-3.5 rounded-lg cursor-pointer relative group"
      style={{
        background: isSelected ? "#F9FAFB" : hovered ? "#FAFAFA" : "#FFF",
        borderWidth: "1px", borderStyle: "solid", borderColor: isSelected ? "#111827" : "#E5E7EB",
        borderLeftWidth: isSelected ? "3px" : a.pinned ? "3px" : "1px", borderLeftStyle: "solid", borderLeftColor: isSelected ? "#111827" : a.pinned ? c.dot : "#E5E7EB",
        transition: "all 0.12s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(a.id)}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <TagBadge tag={a.tag} size="xs" />
          {a.pinned && <Pin className="w-3 h-3 flex-shrink-0" style={{ color: "#D97706" }} />}
        </div>
        {/* Pin toggle (visible on hover) */}
        <button
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "#9CA3AF" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F3F4F6"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          onClick={e => onTogglePin(a.id, e)}
          title={a.pinned ? "取消置頂" : "設為置頂"}
        >
          {a.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
        </button>
      </div>
      <p className="mb-1.5" style={{ fontSize: "15px", fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
        {a.title}
      </p>
      <p style={{ fontSize: "13px", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {a.content}
      </p>
      <div className="flex items-center gap-2.5 mt-2">
        <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{a.author}</span>
        <span style={{ fontSize: "13px", color: "#D1D5DB" }}>·</span>
        <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{a.date}</span>
        <span style={{ fontSize: "13px", color: "#D1D5DB" }}>·</span>
        <span className="flex items-center gap-0.5" style={{ fontSize: "13px", color: "#9CA3AF" }}>
          <Eye className="w-3 h-3" />{a.views}
        </span>
      </div>
    </div>
  );
}

// ─── Action Button ─────────────────────────────────────────────────────────
function ActionBtn({
  icon: Icon, label, onClick, danger = false,
}: {
  icon: React.ElementType; label: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      title={label}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all"
      style={{ fontSize: "13px", color: danger ? "#DC2626" : "#6B7280" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = danger ? "#FEF2F2" : "#F3F4F6"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      onClick={onClick}
    >
      <Icon className="w-3.5 h-3.5" />{label}
    </button>
  );
}