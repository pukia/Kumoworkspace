// Shared Sprint configuration — single source of truth for Tasks & Projects
import type { SharedTask } from "./tasks-shared";

export interface SprintInfo {
  num: number;
  start: string; // YYYY-MM-DD
  end: string;
  status: "active" | "planned" | "idle";
  capacity: number; // team target points per sprint
}

// Current sprint config (mirrors Tasks.tsx defaults)
export const CURRENT_SPRINT: SprintInfo = {
  num: 7,
  start: "2026-03-01",
  end: "2026-03-14",
  status: "active",
  capacity: 40,
};

// Default sprint assignments for tasks (mirrors what Tasks.tsx would assign at runtime)
// key = task id, value = sprint number
export const DEFAULT_SPRINT_ASSIGNMENTS: Record<string, number | null> = {
  "TASK-001": 7, "TASK-002": 7, "TASK-003": 7, "TASK-006": 7, "TASK-008": 7,
  "TASK-010": 7, "TASK-011": 7, "TASK-013": 7, "TASK-014": 7,
  "TASK-004": 8, "TASK-005": 8, "TASK-012": 8,
  "TASK-007": 8, "TASK-009": 9, "TASK-015": 9,
};

/** Generate sprint list: current + next 2 planned */
export function buildSprintOptions(tasks: SharedTask[], currentSprint: SprintInfo = CURRENT_SPRINT) {
  const fmtDate = (d: string) => d.replace(/-/g, "/");
  const spDays = Math.max(1, Math.ceil(
    (new Date(currentSprint.end).getTime() - new Date(currentSprint.start).getTime()) / 86400000
  ));

  const computePoints = (sprintNum: number | null) => {
    const matched = tasks.filter(t => {
      const assigned = t.sprintNum !== undefined ? t.sprintNum : (DEFAULT_SPRINT_ASSIGNMENTS[t.id] ?? null);
      if (sprintNum === null) return assigned === null;
      return assigned === sprintNum;
    });
    const allocated = matched.reduce((s, t) => s + t.storyPoints, 0);
    const done = matched.filter(t => t.status === "done").reduce((s, t) => s + t.storyPoints, 0);
    const taskCount = matched.length;
    return { allocated, done, taskCount };
  };

  const results: {
    key: string;
    label: string;
    sub: string;
    status: "active" | "planned";
    allocated: number;
    done: number;
    taskCount: number;
    capacity: number;
  }[] = [];

  // Current sprint
  const cur = computePoints(currentSprint.num);
  results.push({
    key: `sprint-${currentSprint.num}`,
    label: `Sprint ${currentSprint.num}（進行中）`,
    sub: `${fmtDate(currentSprint.start)} – ${fmtDate(currentSprint.end)}`,
    status: "active",
    ...cur,
    capacity: currentSprint.capacity,
  });

  // Next 2 planned sprints
  for (let i = 1; i <= 2; i++) {
    const nextNum = currentSprint.num + i;
    const prevEnd = new Date(currentSprint.end);
    const nextStart = new Date(prevEnd.getTime() + i * spDays * 86400000 - (i - 1) * spDays * 86400000 + 86400000);
    // Simpler: each sprint starts the day after previous ends
    const startMs = new Date(currentSprint.end).getTime() + 86400000 + (i - 1) * (spDays + 1) * 86400000;
    const endMs = startMs + (spDays - 1) * 86400000;
    const startD = new Date(startMs);
    const endD = new Date(endMs);
    const fmt = (d: Date) =>
      `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
    const pts = computePoints(nextNum);
    results.push({
      key: `sprint-${nextNum}`,
      label: `Sprint ${nextNum}（已規劃）`,
      sub: `${fmt(startD)} – ${fmt(endD)}`,
      status: "planned",
      ...pts,
      capacity: currentSprint.capacity,
    });
  }

  return results;
}