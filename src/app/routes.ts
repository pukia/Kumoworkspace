import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Dashboard } from "./pages/Dashboard";
import { Finance } from "./pages/Finance";
import { Attendance } from "./pages/Attendance";
import { Punch } from "./pages/Punch";
import { Projects } from "./pages/Projects";
import { Announcements } from "./pages/Announcements";
import { Tasks } from "./pages/Tasks";
import { Assets } from "./pages/Assets";
import { Settings } from "./pages/Settings";
import { Notifications } from "./pages/Notifications";
import { Employees } from "./pages/Employees";
import { Permissions } from "./pages/Permissions";
import { DesignSystem } from "./pages/DesignSystem";
import { DesignSystem2 } from "./pages/DesignSystem2";
import { Spec } from "./pages/Spec";
import { Login } from "./pages/Login";
import { AccessDenied } from "./pages/AccessDenied";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "punch", Component: Punch },
      { path: "finance", Component: Finance },
      { path: "attendance", Component: Attendance },
      { path: "projects", Component: Projects },
      { path: "announcements", Component: Announcements },
      { path: "tasks", Component: Tasks },
      { path: "assets", Component: Assets },
      { path: "settings", Component: Settings },
      { path: "notifications", Component: Notifications },
      { path: "employees", Component: Employees },
      { path: "permissions", Component: Permissions },
      { path: "design-system", Component: DesignSystem },
      { path: "design-system-2", Component: DesignSystem2 },
      { path: "spec", Component: Spec },
      { path: "access-denied", Component: AccessDenied },
      { path: "*", Component: AccessDenied },
    ],
  },
]);