// ─── Shared Task Data ──────────────────────────────────────────────────────────
// Single source of truth for task types & initial data.
// Imported by Tasks.tsx (kanban) and Projects.tsx (project detail).

export type TaskStatus   = "todo" | "inProgress" | "review" | "done";
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskType     = "task" | "story" | "bug" | "improvement";

export interface SharedTask {
  id: string;
  title: string;
  desc: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
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

export const INIT_TASKS: SharedTask[] = [
  { id: "TASK-001", title: "完成第一季財務報表",       desc: "整理 1-3 月財務資料，產生季度報表並提交董事會",           status: "done",       priority: "high",     type: "task",        assignee: "張三", assigneeColor: "#3B82F6", dept: "財務部", dueDate: "2026-03-07", storyPoints: 5,  labels: ["財務", "報表"],   createdDate: "2026-03-01", projectId: null },
  { id: "TASK-002", title: "更新公司網站內容",          desc: "新增最新產品介紹與案例展示頁面，更新首頁Banner",          status: "inProgress", priority: "medium",   type: "story",       assignee: "李四", assigneeColor: "#8B5CF6", dept: "行銷部", dueDate: "2026-03-10", storyPoints: 3,  labels: ["網站", "行銷"],   createdDate: "2026-03-05", projectId: 1 },
  { id: "TASK-003", title: "客戶需求討論會議",          desc: "與 A 客戶溝通專案需求，確認技術可行性與開發方案",        status: "inProgress", priority: "high",     type: "task",        assignee: "王五", assigneeColor: "#EC4899", dept: "技術部", dueDate: "2026-03-08", storyPoints: 2,  labels: ["客戶", "會議"],   createdDate: "2026-03-06", projectId: 3 },
  { id: "TASK-004", title: "招募資深後端工程師",        desc: "發布徵才訊息，篩選履歷，安排技術面試與 HR 關卡",         status: "todo",       priority: "medium",   type: "task",        assignee: "趙六", assigneeColor: "#F59E0B", dept: "人資部", dueDate: "2026-03-15", storyPoints: 3,  labels: ["招募", "HR"],     createdDate: "2026-03-04", projectId: null },
  { id: "TASK-005", title: "採購辦公設備",              desc: "採購 10 台辦公電腦、顯示器與相關週邊配件",               status: "todo",       priority: "low",      type: "task",        assignee: "錢七", assigneeColor: "#10B981", dept: "總務部", dueDate: "2026-03-12", storyPoints: 1,  labels: ["採購"],           createdDate: "2026-03-03", projectId: null },
  { id: "TASK-006", title: "修復登入頁面白屏問題",      desc: "iOS Safari 15 以下版本登入後出現白屏，需緊急修復",       status: "inProgress", priority: "critical", type: "bug",         assignee: "孫八", assigneeColor: "#EF4444", dept: "技術部", dueDate: "2026-03-09", storyPoints: 3,  labels: ["Bug", "緊急"],   createdDate: "2026-03-07", projectId: 1 },
  { id: "TASK-007", title: "客戶滿意度問卷設計",        desc: "設計問卷題目、建立線上表單並規劃推廣策略",               status: "todo",       priority: "low",      type: "improvement", assignee: "周九", assigneeColor: "#6366F1", dept: "行銷部", dueDate: "2026-03-20", storyPoints: 2,  labels: ["問卷", "行銷"],   createdDate: "2026-03-06", projectId: null },
  { id: "TASK-008", title: "優化資料庫查詢效能",        desc: "分析慢查詢日誌，加入索引並重構 ORM 查詢邏輯",           status: "review",     priority: "high",     type: "improvement", assignee: "吳十", assigneeColor: "#0EA5E9", dept: "技術部", dueDate: "2026-03-11", storyPoints: 8,  labels: ["效能", "DB"],    createdDate: "2026-03-02", projectId: 2 },
  { id: "TASK-009", title: "Q2 行銷預算規劃",           desc: "整合各部門預算需求，撰寫 Q2 行銷計畫書送主管審核",       status: "todo",       priority: "medium",   type: "story",       assignee: "林一", assigneeColor: "#D946EF", dept: "行銷部", dueDate: "2026-03-25", storyPoints: 5,  labels: ["預算", "規劃"],   createdDate: "2026-03-08", projectId: null },
  { id: "TASK-010", title: "API 文件更新",              desc: "依照最新版本更新 Swagger 文件，補齊缺失的 endpoint 說明", status: "done",      priority: "low",      type: "task",        assignee: "陳二", assigneeColor: "#84CC16", dept: "技術部", dueDate: "2026-03-06", storyPoints: 2,  labels: ["文件", "API"],   createdDate: "2026-03-01", projectId: 2 },
  { id: "TASK-011", title: "導入 CI/CD 流程",          desc: "建立 GitHub Actions workflow，自動化測試與部署到 staging", status: "inProgress", priority: "high",   type: "improvement", assignee: "孫八", assigneeColor: "#EF4444", dept: "技術部", dueDate: "2026-03-14", storyPoints: 13, labels: ["DevOps", "自動化"], createdDate: "2026-03-03", projectId: 2 },
  { id: "TASK-012", title: "員工教育訓練計畫",          desc: "規劃 Q2 技能培訓課程，協調外部講師與場地安排",           status: "todo",       priority: "medium",   type: "story",       assignee: "趙六", assigneeColor: "#F59E0B", dept: "人資部", dueDate: "2026-03-18", storyPoints: 3,  labels: ["培訓", "HR"],     createdDate: "2026-03-05", projectId: null },
  { id: "TASK-013", title: "報表匯出 PDF 錯誤",         desc: "財務報表匯出 PDF 時中文字型亂碼，影響所有使用者",        status: "review",     priority: "critical", type: "bug",         assignee: "張三", assigneeColor: "#3B82F6", dept: "技術部", dueDate: "2026-03-09", storyPoints: 5,  labels: ["Bug", "財務"],   createdDate: "2026-03-07", projectId: 1 },
  { id: "TASK-014", title: "社群媒體內容排程",          desc: "規劃 3 月份 IG/FB 貼文內容，安排發文時程與互動策略",    status: "done",       priority: "low",      type: "task",        assignee: "李四", assigneeColor: "#8B5CF6", dept: "行銷部", dueDate: "2026-03-05", storyPoints: 2,  labels: ["社群", "內容"],   createdDate: "2026-03-01", projectId: null },
  { id: "TASK-015", title: "伺服器安全性稽核",          desc: "執行季度安全掃描，修補高風險漏洞並輸出報告",             status: "todo",       priority: "high",     type: "task",        assignee: "吳十", assigneeColor: "#0EA5E9", dept: "技術部", dueDate: "2026-03-28", storyPoints: 8,  labels: ["安全", "稽核"],   createdDate: "2026-03-08", projectId: 5 },
  // ── Additional project-linked tasks for richer demo ──
  { id: "TASK-016", title: "購物車 API 開發",           desc: "開發購物車新增、移除、數量調整等 RESTful API",           status: "inProgress", priority: "high",     type: "task",        assignee: "王五", assigneeColor: "#EC4899", dept: "技術部", dueDate: "2026-03-18", storyPoints: 8,  labels: ["API", "電商"],   createdDate: "2026-03-08", projectId: 1 },
  { id: "TASK-017", title: "會員積點系統設計",          desc: "設計積點規則引擎、兌換流程與後台管理介面原型",           status: "todo",       priority: "medium",   type: "story",       assignee: "錢七", assigneeColor: "#10B981", dept: "技術部", dueDate: "2026-03-22", storyPoints: 5,  labels: ["設計", "會員"],   createdDate: "2026-03-09", projectId: 1 },
  { id: "TASK-018", title: "ERP 庫存模組 API 設計",     desc: "定義庫存進出庫、盤點、調撥等 API 規格",                  status: "todo",       priority: "high",     type: "task",        assignee: "吳十", assigneeColor: "#0EA5E9", dept: "技術部", dueDate: "2026-03-20", storyPoints: 5,  labels: ["API", "ERP"],    createdDate: "2026-03-07", projectId: 2 },
  { id: "TASK-019", title: "ERP 報表引擎整合",          desc: "整合 Crystal Reports 引擎至 ERP 系統，支援自訂報表",     status: "todo",       priority: "medium",   type: "improvement", assignee: "張三", assigneeColor: "#3B82F6", dept: "技術部", dueDate: "2026-03-30", storyPoints: 8,  labels: ["報表", "ERP"],   createdDate: "2026-03-08", projectId: 2 },
  { id: "TASK-020", title: "App 原型設計 (Phase 1)",    desc: "完成首頁、菜單瀏覽、購物車的高保真原型",                 status: "inProgress", priority: "high",     type: "story",       assignee: "錢七", assigneeColor: "#10B981", dept: "設計部", dueDate: "2026-03-25", storyPoints: 5,  labels: ["設計", "App"],   createdDate: "2026-03-10", projectId: 3 },
  { id: "TASK-021", title: "App 後端架構規劃",          desc: "選型 Node.js/Go 技術棧，設計微服務架構與 API Gateway",   status: "todo",       priority: "high",     type: "task",        assignee: "吳十", assigneeColor: "#0EA5E9", dept: "技術部", dueDate: "2026-03-28", storyPoints: 5,  labels: ["架構", "App"],   createdDate: "2026-03-10", projectId: 3 },
  { id: "TASK-022", title: "倉儲 WMS 設備對接",         desc: "完成 RFID 讀取器與 PLC 控制器的通訊協議整合",            status: "inProgress", priority: "critical", type: "task",        assignee: "王五", assigneeColor: "#EC4899", dept: "技術部", dueDate: "2026-03-15", storyPoints: 8,  labels: ["硬體", "WMS"],   createdDate: "2026-03-05", projectId: 5 },
  { id: "TASK-023", title: "倉儲即時儀表板",            desc: "開發即時庫存量、進出貨統計的 Dashboard 頁面",             status: "todo",       priority: "medium",   type: "story",       assignee: "孫八", assigneeColor: "#EF4444", dept: "技術部", dueDate: "2026-03-20", storyPoints: 5,  labels: ["前端", "WMS"],   createdDate: "2026-03-08", projectId: 5 },
  { id: "TASK-024", title: "品牌官網視覺設計稿",        desc: "完成首頁、關於我們、作品集三個頁面的視覺設計",           status: "todo",       priority: "medium",   type: "story",       assignee: "周九", assigneeColor: "#6366F1", dept: "設計部", dueDate: "2026-04-10", storyPoints: 5,  labels: ["設計", "品牌"],   createdDate: "2026-03-10", projectId: 6 },
  // ── Project 4 (SEO) completed tasks ──
  { id: "TASK-025", title: "網站技術 SEO 稽核",         desc: "使用 Screaming Frog 爬取全站，分析結構化資料與 meta 標籤缺失",  status: "done", priority: "high",   type: "task",        assignee: "趙六", assigneeColor: "#F59E0B", dept: "行銷部", dueDate: "2025-11-30", storyPoints: 5, labels: ["SEO", "稽核"],   createdDate: "2025-11-05", projectId: 4 },
  { id: "TASK-026", title: "核心頁面 Meta 標籤優化",    desc: "重寫首頁、產品頁、服務頁的 title/description/OG 標籤",         status: "done", priority: "high",   type: "improvement", assignee: "李四", assigneeColor: "#8B5CF6", dept: "行銷部", dueDate: "2025-12-15", storyPoints: 3, labels: ["SEO", "內容"],   createdDate: "2025-11-15", projectId: 4 },
  { id: "TASK-027", title: "網站速度優化",              desc: "壓縮圖片、啟用 lazy loading、優化 CSS/JS bundle size",         status: "done", priority: "critical", type: "improvement", assignee: "陳二", assigneeColor: "#84CC16", dept: "技術部", dueDate: "2026-01-10", storyPoints: 8, labels: ["效能", "SEO"],   createdDate: "2025-12-01", projectId: 4 },
  { id: "TASK-028", title: "Sitemap 與 robots.txt 更新", desc: "產生動態 sitemap 並提交 Google Search Console",                status: "done", priority: "medium",  type: "task",        assignee: "趙六", assigneeColor: "#F59E0B", dept: "行銷部", dueDate: "2026-01-20", storyPoints: 2, labels: ["SEO", "技術"],   createdDate: "2025-12-10", projectId: 4 },
  { id: "TASK-029", title: "內容行銷策略執行",          desc: "撰寫 10 篇 SEO 目標關鍵字文章並發佈至官網部落格",              status: "done", priority: "medium",  type: "story",       assignee: "林一", assigneeColor: "#D946EF", dept: "行銷部", dueDate: "2026-02-10", storyPoints: 5, labels: ["內容", "SEO"],   createdDate: "2026-01-05", projectId: 4 },
  { id: "TASK-030", title: "結構化資料標記實作",        desc: "為產品頁加入 JSON-LD 結構化資料，支援 Rich Snippets",          status: "done", priority: "high",   type: "task",        assignee: "陳二", assigneeColor: "#84CC16", dept: "技術部", dueDate: "2026-02-20", storyPoints: 3, labels: ["SEO", "技術"],   createdDate: "2026-01-15", projectId: 4 },
  { id: "TASK-031", title: "SEO 成效驗收報告",          desc: "匯整排名變化、流量成長數據，產出最終驗收報告",                  status: "done", priority: "high",   type: "task",        assignee: "趙六", assigneeColor: "#F59E0B", dept: "行銷部", dueDate: "2026-02-28", storyPoints: 3, labels: ["報表", "SEO"],   createdDate: "2026-02-15", projectId: 4 },
];
// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Get all tasks linked to a specific project */
export function getTasksByProject(projectId: number, tasks: SharedTask[] = INIT_TASKS): SharedTask[] {
  return tasks.filter(t => t.projectId === projectId);
}

/** Compute project stats from its linked tasks */
export function getProjectTaskStats(projectId: number, tasks: SharedTask[] = INIT_TASKS) {
  const pts = tasks.filter(t => t.projectId === projectId);
  const total = pts.length;
  const done = pts.filter(t => t.status === "done").length;
  const inProgress = pts.filter(t => t.status === "inProgress").length;
  const review = pts.filter(t => t.status === "review").length;
  const totalPoints = pts.reduce((s, t) => s + t.storyPoints, 0);
  const donePoints = pts.filter(t => t.status === "done").reduce((s, t) => s + t.storyPoints, 0);
  const progressPct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
  return { total, done, inProgress, review, totalPoints, donePoints, progressPct };
}

export const TASK_STATUS_LABELS: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo:       { label: "待辦",   color: "#374151", bg: "#F9FAFB" },
  inProgress: { label: "進行中", color: "#2563EB", bg: "#EFF6FF" },
  review:     { label: "審核中", color: "#7C3AED", bg: "#F5F3FF" },
  done:       { label: "已完成", color: "#15803D", bg: "#F0FDF4" },
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  critical: { label: "緊急", color: "#DC2626", bg: "#FEF2F2" },
  high:     { label: "高",   color: "#EA580C", bg: "#FFF7ED" },
  medium:   { label: "中",   color: "#CA8A04", bg: "#FEFCE8" },
  low:      { label: "低",   color: "#6B7280", bg: "#F9FAFB" },
};

export const TASK_TYPE_LABELS: Record<TaskType, { label: string; color: string; bg: string }> = {
  task:        { label: "任務", color: "#2563EB", bg: "#DBEAFE" },
  story:       { label: "需求", color: "#7C3AED", bg: "#EDE9FE" },
  bug:         { label: "缺陷", color: "#DC2626", bg: "#FEE2E2" },
  improvement: { label: "優化", color: "#15803D", bg: "#DCFCE7" },
};