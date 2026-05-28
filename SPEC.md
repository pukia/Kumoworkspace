# KUMO WORKSPACE · 產品規格書

> 雲端企業協作管理平台 · Internal Workspace Platform
> 版本：v2.0 · 日期：2026-05-06

---

## 1. 產品概述

**KUMO WORKSPACE（雲のワークスペース）** 是一套公司內部使用的協作管理後台，將打卡、出缺勤、公告、專案、任務、資產、財務、員工、權限與訊息等模組整合於同一介面，採日系管理後台美學設計。

### 1.1 目標使用者
| 角色 | 主要職責 | 預設首頁 |
|---|---|---|
| `admin` 系統管理者 | 全模組管理、設計系統檢視 | `/`（總覽） |
| `finance_manager` 財務主管 | 財務、薪資、報表 | `/`（總覽） |
| `hr_manager` 人資主管 | 員工、出缺勤、資產、公告 | `/`（總覽） |
| `pm` 專案經理 | 專案、任務、Sprint | `/`（總覽） |
| `product_manager` 產品經理 | 產品、任務、公告 | `/`（總覽） |
| `staff` 一般員工 | 打卡、任務、訊息、公告 | `/punch` |

### 1.2 設計理念
- **結構優先**：資訊架構先於視覺
- **克制留白**：日系後台美學，避免裝飾
- **可預測**：互動結果一致，元件跨頁行為相同
- **權限可見**：依角色顯示功能，不出現禁用按鈕

---

## 2. 技術規格

| 項目 | 規格 |
|---|---|
| 前端框架 | React 18 + TypeScript |
| 樣式 | Tailwind CSS v4（無 `tailwind.config.js`） |
| 路由 | `react-router`（**非** `react-router-dom`） |
| 圖示 | `lucide-react` |
| 字型 | Noto Sans JP（主）+ Noto Serif JP（點綴） |
| 狀態管理 | React Context（`AuthContext`） |
| 入口 | `src/app/App.tsx` |

### 2.1 環境特性
- Tailwind v4 inline style 中 `border` 簡寫須拆為 `borderWidth` / `borderStyle` / `borderColor`
- 字型匯入只在 `/src/styles/fonts.css` 頂部
- 不使用 `text-2xl`、`font-bold`、`leading-none` 等預設 Tailwind 字級／字重類別

---

## 3. 資訊架構（IA）

### 3.1 站台地圖
```
KUMO WORKSPACE
├─ /              總覽
├─ /punch         打卡
├─ /announcements 最新公告
├─ /attendance    出缺勤
├─ /projects      專案管理
├─ /tasks         工作事項
│  ├─ Sprint 看板（拖曳 + 結算點數）
│  ├─ Sprint 報表
│  └─ 任務追蹤
├─ /assets        資產管理
├─ /finance       財務管理
├─ /permissions   權限管理
├─ /employees     員工管理
├─ /notifications 訊息中心（含內部信件回覆）
├─ /settings      系統設定
├─ /design-system Design System
└─ /design-system-2 Design System 2.0（admin only）
```

### 3.2 角色 × 模組存取矩陣
| 模組 | admin | finance | hr | pm | product | staff |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| 總覽 | ✓ | ✓ | ✓ | ✓ | ✓ | – |
| 打卡 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 公告 | ✓ | – | ✓ | ✓ | ✓ | ✓ |
| 出缺勤 | ✓ | – | ✓ | – | – | – |
| 專案 | ✓ | – | – | ✓ | ✓ | – |
| 任務 | ✓ | – | – | ✓ | ✓ | ✓ |
| 資產 | ✓ | – | ✓ | – | – | – |
| 財務 | ✓ | ✓ | – | – | – | – |
| 權限 | ✓ | – | – | – | – | – |
| 員工 | ✓ | – | ✓ | – | – | – |
| 訊息 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 設定 | ✓ | – | – | – | – | – |
| Design System | ✓ | – | – | – | – | – |
| Design System 2.0 | ✓ | – | – | – | – | – |

### 3.3 響應式導覽
- **桌面**：240px 永久側欄、主內容 padding 30px
- **平板**：側欄 200px、主內容 padding 24px
- **手機**：側欄抽屜化、Tab 改為 `StyledSelect` 下拉

---

## 4. 模組規格

### 4.1 打卡 `/punch`
- 上下班打卡、位置紀錄
- 全員可見、staff 預設首頁

### 4.2 出缺勤 `/attendance`
- 出勤紀錄列表、請假審核流程
- HR / Admin 專用

### 4.3 專案管理 `/projects`
- 專案總覽卡片、里程碑、團隊成員
- PM / Product / Admin 可見

### 4.4 工作事項 `/tasks`（Jira 風格）
- **Sprint 生命週期**：規劃 → 進行 → 結算 → 報表
- **看板**：欄位拖曳卡片、即時點數結算
- **任務卡片**：標題、描述、負責人、優先級、外部文件連結（Figma、Google Docs）
- **報表**：速率、燃盡圖
- **任務追蹤**：員工任務追蹤面板

### 4.5 資產管理 `/assets`
- 設備盤點、領用紀錄

### 4.6 財務管理 `/finance`
- 費用申請、薪資、財報
- 幣值統一 `NT$ X,XXX` 格式

### 4.7 權限管理 `/permissions`
- 六角色權限矩陣
- 由 `AuthContext.tsx` 集中定義

### 4.8 員工管理 `/employees`
- 員工資料、組織架構樹

### 4.9 訊息中心 `/notifications`
- 系統通知、內部信件回覆

### 4.10 系統設定 `/settings`
- 個人偏好、系統參數

### 4.11 Design System / 2.0
- 設計語言文件
- 2.0 額外含資訊架構、完整元件示範、動效規範
- 僅 admin 可見

---

## 5. 設計系統

### 5.1 色彩 Token
```css
--ink-900: #111827;        /* 主文字 */
--bg-main: #F5F6F9;        /* 主背景 */
--white:   #FFFFFF;        /* 卡片 */
--accent-blue: #60A5FA;    /* 強調 */
--gradient-deep: #1E3A5F;  /* 漸層深端 */
--brand:   #2563EB;

--success: #16A34A / bg #F0FDF4
--warning: #CA8A04 / bg #FEF9C3
--danger:  #DC2626 / bg #FEF2F2
--info:    #2563EB / bg #EFF6FF
--purple:  #7C3AED / bg #F5F3FF

/* 中性色 50–900：#F9FAFB → #111827 */
```

### 5.2 角色色
| 角色 | 主色 | 背景 |
|---|---|---|
| admin | `#DC2626` | `#FEF2F2` |
| finance_manager | `#059669` | `#ECFDF5` |
| hr_manager | `#7C3AED` | `#F5F3FF` |
| pm | `#2563EB` | `#EFF6FF` |
| product_manager | `#CA8A04` | `#FFFBEB` |
| staff | `#374151` | `#F3F4F6` |

### 5.3 字級
| 名稱 | size | weight | 用途 |
|---|---|---|---|
| Display | 32 | 800 | 登入 Hero |
| H1 | 22 | 700 | 頁面主標題 |
| H2 | 17 | 700 | 卡片區塊 |
| H3 | 14 | 700 | 子區塊 |
| Body | 14 | 450 | 內文 |
| Small | 12 | 450 | 說明 |
| Tiny | 10 | 600 | 標籤、徽章（最小尺寸） |

### 5.4 間距（4px 基數）
`xs 4 · sm 8 · md 12 · lg 16 · xl 24 · 2xl 30 · 3xl 48`

### 5.5 圓角／陰影
- 圓角：4 / 6 / 8 / 10 / 14 / full
- 陰影層級：none → subtle → card → pop → modal → floating

### 5.6 動效
- `fast 120ms`（hover）／`base 200ms`（切換）／`slow 400ms`（頁面）
- Easing：`ease-out` / `ease-in-out` / `spring`

### 5.7 元件規範
- **標題列**：右側按鈕統一縮小版（`text-12 / px-3 py-1.5`）
- **Tab**：灰底 `#F3F4F6` 圓角容器 + 深色膠囊 `#111827`
- **統計卡片**：`p-4`、標籤 11px、數值 20px / 800
- **列表列項**：`px-5 py-3`、底線 `#F3F4F6`
- **Modal**：圓角 12、陰影 floating、底部動作列灰底

---

## 6. 認證與授權

### 6.1 帳號
- 系統管理者：`lys / 123456`（預設帳號）
- 其他角色：快速登入卡片（縮小版位於正式登入下方）

### 6.2 登入流程
1. `/login` → 帳密 / SSO Tab
2. SSO 三按鈕（Google / Microsoft / SAML）目前皆走 `handleDemoLogin("staff")`
3. 成功 → admin 跳 `/`、其他跳 `/punch`

### 6.3 權限守衛
- `Root.tsx` `isRouteAllowed` 對每個路徑檢查
- 不通過 → 渲染 `AccessDenied`
- `hasAccess(path)` 由 `AuthContext` 提供，用於側邊欄過濾

---

## 7. 檔案結構

```
src/app/
├── App.tsx                預設導出
├── routes.ts              react-router 設定
├── context/
│   └── AuthContext.tsx    角色、權限、登入登出
├── components/
│   ├── Root.tsx           側欄 + Top bar + Outlet
│   ├── StyledSelect.tsx   自製下拉
│   ├── DraggableScroll.tsx
│   ├── DatePicker.tsx
│   ├── EmployeeTaskTracker.tsx
│   ├── HierarchySection.tsx
│   ├── NotificationBell.tsx
│   ├── Pagination.tsx
│   ├── ReadOnlyBanner.tsx
│   ├── SubNav.tsx
│   ├── ExportCSV.tsx
│   └── figma/, ui/
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Punch.tsx
│   ├── Announcements.tsx
│   ├── Attendance.tsx
│   ├── Projects.tsx
│   ├── Tasks.tsx
│   ├── Assets.tsx
│   ├── Finance.tsx
│   ├── Permissions.tsx
│   ├── Employees.tsx
│   ├── Notifications.tsx
│   ├── Settings.tsx
│   ├── DesignSystem.tsx
│   ├── DesignSystem2.tsx
│   └── AccessDenied.tsx
└── data/
```

---

## 8. 版本紀錄

| 版本 | 日期 | 重點 |
|---|---|---|
| 2.0.0 | 2026-05-06 | 重構 IA、Design System 2.0 |
| 1.4.0 | 2026-04-18 | Sprint 看板色票、任務膠囊 |
| 1.3.0 | 2026-03-22 | 標題右側按鈕縮小版 |
| 1.0.0 | 2026-01-10 | DS 1.0 初版 |

---

## 9. 待辦／未來規劃

- [ ] SSO 真實串接（目前為 demo）
- [ ] Tokens 抽至 `theme.css` 變數
- [ ] Sprint 報表自動週期匯出
- [ ] 訊息中心推播整合
- [ ] 國際化（多語系）
- [ ] 桌面 / 行動原生 App 評估
