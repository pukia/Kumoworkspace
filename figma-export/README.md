# Figma Export · KUMO WORKSPACE DS 2.0

兩階段把 Design System 2.0 轉成可編輯的 Figma 檔案。
時間預估：**10–15 分鐘**。

---

## 階段 1 · Tokens Studio 匯入（建立色彩、字級、間距 Variables）

### 1.1 安裝外掛
1. 開啟 Figma 桌面版（或瀏覽器版）
2. 選單 → `Plugins` → `Browse plugins in Community`
3. 搜尋 **Tokens Studio for Figma** → 點 `Run`（首次會提示安裝，免費）

### 1.2 匯入 tokens.json
1. 在任一 Figma 檔案內執行 Tokens Studio 外掛
2. 首次開啟選 `New empty file`
3. 右上角齒輪 ⚙️ → `Tools` → `Load from file/folder or preset`
4. 選擇本專案的 `figma-export/tokens.json`
5. 進入 `Settings` → 勾選 `Color`、`Spacing`、`Border Radius`、`Typography`、`Box Shadow`
6. 回主畫面 → 右上 `Apply to document`（或 `Export to Variables`）

### 1.3 完成後你會得到
- ✅ Figma Variables：色彩（含中性色階、語義色、角色色）、間距、圓角、Z-Index
- ✅ Text Styles：display / h1 / h2 / h3 / body / small / tiny
- ✅ Effect Styles：subtle / card / pop / modal / floating 五階陰影

> 提示：如果 Tokens Studio 要求選 `Variables` 還是 `Styles`，**色彩選 Variables、字體選 Styles**（Figma 文字樣式不支援 Variables 完整綁定）。

---

## 階段 2 · html.to.design 匯入畫面（建立元件視覺稿）

### 2.1 啟動 Dev Server
本專案的 dev server 已在 sandbox 內執行。若需要本地預覽：

```bash
pnpm dev
```

取得預覽 URL（例如 `http://localhost:5173/design-system-2`）。

> ⚠️ html.to.design 需要**公開可訪問的 URL**。本地 localhost 只在你裝外掛的同一台機器有效；若用 Figma 雲端版需透過 ngrok / Cloudflare Tunnel 暴露。

### 2.2 安裝 html.to.design 外掛
1. Figma → `Plugins` → 搜尋 **html.to.design**
2. 點 `Run`（免費版每月有匯入次數限制，付費 $8/月不限）

### 2.3 匯入頁面
建議分頁面分批匯入，避免單檔過大：

| 頁面 | URL 路徑 | Figma Frame 命名 |
|---|---|---|
| 概覽 | `/design-system-2`（切到「概覽」Tab）| DS2/Overview |
| 資訊架構 | 切到「資訊架構」Tab | DS2/IA |
| 色彩系統 | 「色彩系統」Tab | DS2/Colors |
| 文字排版 | 「文字排版」Tab | DS2/Typography |
| 基礎元件 | 「基礎元件」Tab | DS2/Components |
| 表單元件 | 「表單元件」Tab | DS2/Forms |
| 回饋提示 | 「回饋提示」Tab | DS2/Feedback |
| 版型範例 | 「版型範例」Tab | DS2/Patterns |
| 可訪問性 | 「可訪問性」Tab | DS2/A11y |
| Do & Don't | 「使用守則」Tab | DS2/Guidelines |

操作步驟：
1. 開啟外掛 → 貼上目標 URL
2. 設定 viewport（建議 `1440 × 900` 桌面版、`375 × 812` 手機版）
3. 點 `Import` → 等 5–20 秒
4. Figma canvas 自動產生帶 Auto Layout 的圖層

### 2.4 後置整理
1. 把每個 Frame 命名好（沿用上表）
2. 重複出現的元件（Card、Button、Tag）右鍵 → `Create Component`
3. 把上一階段建立的 Color Variables 套用到 Component 的 fill / stroke
4. 整理至 Pages：`📁 Tokens` / `🧱 Components` / `📐 Patterns` / `📄 Examples`

---

## 階段 3（選用）· 套用至所有頁面

如果要連同打卡、任務、財務等實際業務頁面一起匯入：

```
http://localhost:5173/         # 總覽
http://localhost:5173/punch    # 打卡
http://localhost:5173/tasks    # 工作事項
http://localhost:5173/finance  # 財務
...
```

照同樣步驟匯入並命名為 `App/Dashboard`、`App/Punch` 等。

---

## 驗收清單

- [ ] Tokens Studio 匯入後 Figma 出現 ≥ 50 個 Color Variables
- [ ] Text Styles 共 7 個（display 至 tiny）
- [ ] Effect Styles 共 5 階陰影
- [ ] DS 2.0 至少 5 個區塊已匯入並命名
- [ ] 至少 3 個重複元件已轉為 Component（Card / Button / Tag）
- [ ] Library 已發佈，其他 Figma 檔案可訂閱

---

## 故障排除

**Q: Tokens Studio 顯示「Invalid token format」**
A: 確認你載入的是 `tokens.json` 整檔，不是裡面某個子節點。

**Q: html.to.design 匯入結果文字位移**
A: 字型未授權匯入。確保 Figma 帳號有 Noto Sans JP / Noto Serif JP（社群免費可用）。

**Q: Variables 沒有變更引用，色票還是寫死的**
A: 開啟 Tokens Studio 設定中的 `Output` → 切換為 `Variables` 而非 `Styles`，重新 apply。
