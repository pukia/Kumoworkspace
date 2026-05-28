// ─── Shared Project Data ────────────────────────────────────────────────────
// This file is imported by both Projects.tsx and Tasks.tsx to link tasks → projects.

export interface SharedProject {
  id: number;
  name: string;
  client: string;
  status: "planning" | "inProgress" | "onHold" | "completed" | "cancelled";
  progress: number;
  startDate: string;
  endDate: string;
  manager: string;
  /** Total story points budgeted for the entire project */
  totalPoints: number;
  /** Story points already completed across all sprints */
  completedPoints: number;
  color: string;
}

export const SHARED_PROJECTS: SharedProject[] = [
  {
    id: 1,
    name: "電商平台改版專案",
    client: "ABC 電商公司",
    status: "inProgress",
    progress: 65,
    startDate: "2026-01-15",
    endDate: "2026-04-30",
    manager: "張三",
    totalPoints: 120,
    completedPoints: 78,
    color: "#3B82F6",
  },
  {
    id: 2,
    name: "企業內部 ERP 系統",
    client: "XYZ 製造公司",
    status: "inProgress",
    progress: 40,
    startDate: "2026-02-01",
    endDate: "2026-06-30",
    manager: "李四",
    totalPoints: 200,
    completedPoints: 80,
    color: "#8B5CF6",
  },
  {
    id: 3,
    name: "行動 App 開發",
    client: "DEF 連鎖餐飲",
    status: "planning",
    progress: 15,
    startDate: "2026-03-01",
    endDate: "2026-07-31",
    manager: "王五",
    totalPoints: 160,
    completedPoints: 24,
    color: "#EC4899",
  },
  {
    id: 4,
    name: "官網 SEO 優化專案",
    client: "GHI 科技公司",
    status: "completed",
    progress: 100,
    startDate: "2025-11-01",
    endDate: "2026-02-28",
    manager: "趙六",
    totalPoints: 55,
    completedPoints: 55,
    color: "#6B7280",
  },
  {
    id: 5,
    name: "智慧倉儲管理系統",
    client: "JKL 物流公司",
    status: "inProgress",
    progress: 75,
    startDate: "2025-12-15",
    endDate: "2026-04-15",
    manager: "孫八",
    totalPoints: 150,
    completedPoints: 112,
    color: "#F59E0B",
  },
  {
    id: 6,
    name: "品牌形象網站建置",
    client: "MNO 設計公司",
    status: "onHold",
    progress: 30,
    startDate: "2026-02-15",
    endDate: "2026-05-31",
    manager: "錢七",
    totalPoints: 60,
    completedPoints: 18,
    color: "#10B981",
  },
];

export const PROJECT_STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  planning: { label: "規劃中", bg: "#EFF6FF", color: "#2563EB" },
  inProgress: { label: "進行中", bg: "#F0FDF4", color: "#15803D" },
  onHold: { label: "暫停", bg: "#FEF9C3", color: "#A16207" },
  completed: { label: "已完成", bg: "#F3F4F6", color: "#374151" },
  cancelled: { label: "已取消", bg: "#FEF2F2", color: "#DC2626" },
};
