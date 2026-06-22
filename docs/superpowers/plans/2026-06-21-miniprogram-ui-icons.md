# 小程序全局 UI 小图标 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为微信小程序全局页面和原生 tabBar 补齐本地图片小图标，提升入口识别度和产品完成度。

**Architecture:** 新增一个无第三方依赖的图标生成脚本，产出 `miniprogram/assets/icons/tab/*.png` 和 `miniprogram/assets/icons/ui/*.png`。原生 tabBar 通过 `app.json` 的 `iconPath` / `selectedIconPath` 使用本地 PNG；页面内图标通过统一的全局 WXSS 类和各页面 WXML/JS 展示字段接入。所有业务接口、点击事件和页面跳转语义保持不变。

**Tech Stack:** 微信原生小程序、Skyline 渲染、WXML、WXSS、JavaScript、Node.js 标准库 PNG 生成脚本、Node.js 语法/JSON 校验。

## Global Constraints

- 不新增业务功能。
- 不改登录、权限、支付、接口或数据库。
- 不引入第三方 UI 组件库或图标库。
- 不把 tabBar 改成 custom tabBar。
- 不做整站视觉重构，只在现有页面结构上补图标和必要排版。
- 不修改小程序导航模式；继续保留现有 `navigationStyle: "custom"`。
- tabBar 使用本地 PNG 图标，并配置未选中 / 选中两套状态。
- 页面内图标使用本地图片资源，通过统一 WXML 结构和 WXSS 类接入。
- 原有事件处理函数、接口请求、复制、收藏和页面跳转语义保持不变。
- 不要提交 git，除非用户明确授权提交。

---

## File Structure Map

- Create: `scripts/generate_miniprogram_icons.js`
  - 负责用 Node.js 标准库生成透明 PNG 线性图标。
  - 输出 tabBar 图标和页面内 UI 图标。
- Create: `miniprogram/assets/icons/tab/*.png`
  - 原生 tabBar 未选中 / 选中图标。
- Create: `miniprogram/assets/icons/ui/*.png`
  - 页面内按钮、标题、列表、状态和入口图标。
- Modify: `miniprogram/app.json`
  - 为 5 个 tabBar 项添加 `iconPath` 和 `selectedIconPath`。
- Modify: `miniprogram/app.wxss`
  - 增加全局 `.ui-icon*`、`.title-with-icon`、`.row-with-icon`、`.button-content` 样式。
- Modify: `miniprogram/pages/home/home.js`, `home.wxml`, `home.wxss`
  - 将首页快捷入口、搜索、统计、标题和列表卡片接入图片图标。
- Modify: `miniprogram/pages/toolbox/toolbox.js`, `toolbox.wxml`, `toolbox.wxss`
  - 将九宫格和智能接单动作接入图片图标。
- Modify: `miniprogram/pages/search/search.js`, `search.wxml`, `search.wxss`
  - 增加结果类型图标映射，搜索标题、输入框、按钮、结果卡片和空状态接入图片图标。
- Modify: `miniprogram/pages/mine/mine.js`, `mine.wxml`, `mine.wxss`
  - 增加配置状态和菜单展示数组，配置状态、常用入口和记录卡片接入图片图标。
- Modify: `miniprogram/pages/assistant/assistant.wxml`, `assistant.wxss`
  - 建站助手 hero、按钮、回复、分类和文章卡片接入图片图标。
- Modify: `miniprogram/pages/ai-chat/ai-chat.wxml`, `ai-chat.wxss`
  - AI 聊天 hero、输入、按钮、回复和兜底提示接入图片图标。
- Modify: `miniprogram/pages/quote/quote.wxml`, `quote.wxss`
  - 报价表单、按钮和结果区域接入图片图标。
- Modify: `miniprogram/pages/plan/plan.wxml`, `plan.wxss`
  - 方案表单、按钮和结果区域接入图片图标。
- Modify: `miniprogram/pages/article-detail/article-detail.wxml`, `article-detail.wxss`
  - 文章标签、标题、正文、收藏按钮和空状态接入图片图标。

---

### Task 1: Generate Local PNG Icon Assets

**Files:**
- Create: `scripts/generate_miniprogram_icons.js`
- Create: `miniprogram/assets/icons/tab/*.png`
- Create: `miniprogram/assets/icons/ui/*.png`

**Interfaces:**
- Consumes: repository root as current working directory and Node.js runtime.
- Produces: `miniprogram/assets/icons/tab/{home,home-active,assistant,assistant-active,toolbox,toolbox-active,search,search-active,mine,mine-active}.png`.
- Produces: `miniprogram/assets/icons/ui/*.png` paths used by later WXML and JS tasks.

- [x] **Step 1: Create output directories**

Run:

```bash
mkdir -p scripts miniprogram/assets/icons/tab miniprogram/assets/icons/ui
```

Expected: command exits successfully with no output.

- [x] **Step 2: Create the icon generator script**

Create `scripts/generate_miniprogram_icons.js` using Node.js built-in `fs`, `path`, and `zlib` only. The script defines a small canvas, draws simple line icons, writes valid PNG chunks with CRC32, and generates 10 tab icons plus 44 UI icons.

Implementation file: `scripts/generate_miniprogram_icons.js`.

- [x] **Step 3: Run the generator**

Run:

```bash
node --check scripts/generate_miniprogram_icons.js && node scripts/generate_miniprogram_icons.js
```

Expected output:

```text
Generated 10 tab icons and 44 UI icons
```

- [x] **Step 4: Verify key icon files exist**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const required = [
  'miniprogram/assets/icons/tab/home.png',
  'miniprogram/assets/icons/tab/home-active.png',
  'miniprogram/assets/icons/tab/assistant.png',
  'miniprogram/assets/icons/tab/assistant-active.png',
  'miniprogram/assets/icons/tab/toolbox.png',
  'miniprogram/assets/icons/tab/toolbox-active.png',
  'miniprogram/assets/icons/tab/search.png',
  'miniprogram/assets/icons/tab/search-active.png',
  'miniprogram/assets/icons/tab/mine.png',
  'miniprogram/assets/icons/tab/mine-active.png',
  'miniprogram/assets/icons/ui/ai.png',
  'miniprogram/assets/icons/ui/search.png',
  'miniprogram/assets/icons/ui/quote.png',
  'miniprogram/assets/icons/ui/plan.png',
  'miniprogram/assets/icons/ui/copy.png',
  'miniprogram/assets/icons/ui/shield.png',
];
const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) throw new Error(`Missing icon files: ${missing.join(', ')}`);
console.log('icon assets ok');
NODE
```

Expected output:

```text
icon assets ok
```

---

### Task 2: Wire TabBar Icons and Global Icon Styles

**Files:**
- Modify: `miniprogram/app.json`
- Modify: `miniprogram/app.wxss`

**Interfaces:**
- Consumes: tab icons from Task 1 at `assets/icons/tab/*.png`.
- Produces: global CSS classes `.ui-icon`, `.ui-icon-sm`, `.ui-icon-md`, `.ui-icon-lg`, `.ui-icon-badge`, `.ui-icon-badge-white`, `.title-with-icon`, `.row-with-icon`, `.button-content`, used by every page task.

- [x] Add `iconPath` and `selectedIconPath` to the 5 native tabBar items in `miniprogram/app.json`.
- [x] Append the global icon utility classes to `miniprogram/app.wxss`.
- [x] Validate `app.json` and tab icon paths with Node.js.

---

### Task 3: Add Icons to Home and Toolbox

**Files:**
- Modify: `miniprogram/pages/home/home.js`
- Modify: `miniprogram/pages/home/home.wxml`
- Modify: `miniprogram/pages/home/home.wxss`
- Modify: `miniprogram/pages/toolbox/toolbox.js`
- Modify: `miniprogram/pages/toolbox/toolbox.wxml`
- Modify: `miniprogram/pages/toolbox/toolbox.wxss`

**Interfaces:**
- Consumes: global icon classes from Task 2.
- Consumes: UI icons from Task 1 under `/assets/icons/ui/*.png`.
- Produces: `quickActions[].iconPath`, `tools[].iconPath`, `smartActions[].iconPath` for WXML binding.

- [x] Replace homepage text icon fields with local `iconPath` fields.
- [x] Add image icons to homepage hero, search, quick actions, stats, section headings, list cards, prices, and empty state.
- [x] Replace toolbox text icon fields with local `iconPath` fields.
- [x] Add image icons to toolbox hero, tool grid, smart actions, result title, and result rows.
- [x] Run `node --check miniprogram/pages/home/home.js` and `node --check miniprogram/pages/toolbox/toolbox.js`.

---

### Task 4: Add Icons to Search and Mine

**Files:**
- Modify: `miniprogram/pages/search/search.js`
- Modify: `miniprogram/pages/search/search.wxml`
- Modify: `miniprogram/pages/search/search.wxss`
- Modify: `miniprogram/pages/mine/mine.js`
- Modify: `miniprogram/pages/mine/mine.wxml`
- Modify: `miniprogram/pages/mine/mine.wxss`

**Interfaces:**
- Consumes: global icon classes from Task 2.
- Produces: `results[].iconPath` for search result cards.
- Produces: `statusRows[]` and `menuItems[]` for mine page rendering.

- [x] Add `resultIconMap` and attach `iconPath` to search results.
- [x] Add image icons to search hero, input, button, empty state, and result cards.
- [x] Add `statusRows[]` and `menuItems[]` to the mine page.
- [x] Add image icons to mine profile, config status rows, menu rows, and records.
- [x] Run `node --check miniprogram/pages/search/search.js` and `node --check miniprogram/pages/mine/mine.js`.

---

### Task 5: Add Icons to Assistant and AI Chat

**Files:**
- Modify: `miniprogram/pages/assistant/assistant.wxml`
- Modify: `miniprogram/pages/assistant/assistant.wxss`
- Modify: `miniprogram/pages/ai-chat/ai-chat.wxml`
- Modify: `miniprogram/pages/ai-chat/ai-chat.wxss`

**Interfaces:**
- Consumes: global icon classes from Task 2.
- Consumes: existing `question`, `reply`, `replyLoading`, `categories`, `filteredArticles`, `prompt`, `loading` page data.
- Produces: icon-enhanced markup with unchanged event handlers.

- [x] Add image icons to assistant hero, input, generate button, reply card, category chips, article list, and empty state.
- [x] Add image icons to AI chat hero, input, generate button, reply card, copy button, and fallback warning.
- [x] Confirm `generateReply`, `copyReply`, `selectCategory`, `openArticle`, `onPromptInput`, and `submit` handler references remain present.

---

### Task 6: Add Icons to Quote, Plan, and Article Detail

**Files:**
- Modify: `miniprogram/pages/quote/quote.wxml`
- Modify: `miniprogram/pages/quote/quote.wxss`
- Modify: `miniprogram/pages/plan/plan.wxml`
- Modify: `miniprogram/pages/plan/plan.wxss`
- Modify: `miniprogram/pages/article-detail/article-detail.wxml`
- Modify: `miniprogram/pages/article-detail/article-detail.wxss`

**Interfaces:**
- Consumes: global icon classes from Task 2.
- Consumes: existing form/result data and handlers in quote, plan, and article detail pages.
- Produces: icon-enhanced WXML with unchanged submit/copy/collect events.

- [x] Add image icons to quote form fields, generate button, result price, metadata, feature rows, summary, and copy button.
- [x] Add image icons to plan form fields, generate button, result title, metadata, page planning, feature rows, proposal, and copy button.
- [x] Add image icons to article detail tag, title, summary, content, collect button, and loading empty state.
- [x] Confirm `onInput`, `submit`, `copyQuote`, `copyPlan`, and `collectArticle` handler references remain present.

---

### Task 7: Final Verification and Cleanup

**Files:**
- Verify: `miniprogram/app.json`
- Verify: `miniprogram/**/*.js`
- Verify: `miniprogram/**/*.wxml`
- Verify: `miniprogram/assets/icons/**/*.png`

**Interfaces:**
- Consumes: all changes from Tasks 1-6.
- Produces: verified working tree with icon paths present and JavaScript parse checks passing.

- [x] Run all modified JavaScript syntax checks.
- [x] Verify every referenced icon file exists.
- [x] Verify `app.json` parses and tabBar has icons.
- [x] Verify generated PNG files are non-empty.
- [x] Check diff summary and git status.
- [ ] Manual preview in WeChat Developer Tools: verify no broken image placeholders, no cramped text, and original taps still work.
