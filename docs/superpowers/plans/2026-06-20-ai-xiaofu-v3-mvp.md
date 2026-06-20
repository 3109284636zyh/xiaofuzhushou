# AI小福智能建站助手 V3.0 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable full-stack MVP for AI小福智能建站助手 V3.0 with a WeChat mini program, Vue3 admin console, Node.js/Express API, MySQL schema, DeepSeek AI integration, risk controls, and runnable documentation.

**Architecture:** Create a three-part project from scratch: `backend/` owns all API, DeepSeek, risk, database, and business logic; `admin/` is a Vue3 + Element Plus management SPA; `miniprogram/` is a native WeChat mini program that consumes the same API. The backend exposes stable JSON endpoints so the mini program and admin can evolve independently.

**Tech Stack:** Native WeChat Mini Program, Vue3, Vite, Element Plus, Node.js 18+, Express, MySQL 8, mysql2, DeepSeek OpenAI-compatible chat API, node:test for backend service tests.

## Global Constraints

- Project is built from scratch in the current workspace.
- First delivery is a runnable full-stack MVP.
- Development route is modular full-stack MVP: mini program, admin, backend, and database are created together and core loops must run.
- AI service uses DeepSeek API.
- Public deployment domain remains `wfr.ccvo.top`.
- Mini program must not add user registration, user login, or payment features.
- Admin login password remains fixed as `zyh123456`.
- DeepSeek API Key is stored only in backend `.env` or backend system configuration; the mini program never exposes the full key.
- DeepSeek timeout is 5 seconds.
- AI replies must be safe for Xianyu/Taobao/Pinduoduo in-platform communication and must not guide users to WeChat, QQ, phone, email, or external links.
- Whois, ICP filing lookup, site speed test, SSL check, SEO check, and website analysis are MVP extension endpoints that return safe demo results or a clear “即将接入” message.
- Current workspace is not a git repository; do not run `git commit` unless the user explicitly asks to initialize git and commit.

---

## File Structure Map

### Root files

- Create `README.md`: local setup, environment, run commands, verification checklist.
- Create `package.json`: root helper scripts for backend and admin.
- Create `database.sql`: MySQL schema and initial seed data.
- Create `docs/api.md`: API endpoint reference.
- Create `docs/deployment.md`: deployment notes for `wfr.ccvo.top`.

### Backend files

- Create `backend/package.json`: backend dependencies and test scripts.
- Create `backend/.env.example`: safe environment template.
- Create `backend/src/server.js`: HTTP server entry.
- Create `backend/src/app.js`: Express app factory and route mounting.
- Create `backend/src/config/env.js`: environment parsing with defaults.
- Create `backend/src/config/constants.js`: password, risk prompt, forbidden words, fallback text, error codes.
- Create `backend/src/db/pool.js`: mysql2 connection pool.
- Create `backend/src/db/query.js`: small query wrapper.
- Create `backend/src/utils/response.js`: `success`, `failure`, `asyncHandler` helpers.
- Create `backend/src/middleware/auth.js`: JWT auth for admin routes.
- Create `backend/src/middleware/errorHandler.js`: unified error response.
- Create `backend/src/services/riskService.js`: forbidden-word sanitization and output guard.
- Create `backend/src/services/aiService.js`: DeepSeek request with 5s timeout and fallback.
- Create `backend/src/services/quoteService.js`: deterministic quote generation plus optional AI wording.
- Create `backend/src/services/planService.js`: deterministic site plan generation plus optional AI wording.
- Create `backend/src/services/customerService.js`: A/B/C customer intent analysis.
- Create `backend/src/services/toolService.js`: toolbox demo/extensible results.
- Create `backend/src/services/searchService.js`: unified search across products/articles/tutorials/history.
- Create `backend/src/services/statsService.js`: dashboard/home summary aggregation.
- Create `backend/src/controllers/*.js`: thin request handlers that call services or SQL queries.
- Create `backend/src/routes/*.js`: Express routers grouped by domain.
- Create `backend/test/riskService.test.js`: verifies sanitization and guard behavior.
- Create `backend/test/quotePlanServices.test.js`: verifies quote and plan output contracts.
- Create `backend/test/toolCustomerServices.test.js`: verifies toolbox and customer analysis contracts.

### Admin files

- Create `admin/package.json`: Vite, Vue, Element Plus dependencies.
- Create `admin/index.html`: Vite mount page.
- Create `admin/vite.config.js`: dev server and build config.
- Create `admin/src/main.js`: Vue app bootstrap.
- Create `admin/src/App.vue`: layout shell with login-aware rendering.
- Create `admin/src/router/index.js`: routes and auth guard.
- Create `admin/src/api/client.js`: fetch wrapper with JWT and response normalization.
- Create `admin/src/api/modules.js`: admin API functions.
- Create `admin/src/styles.css`: modern AI assistant dashboard styling.
- Create `admin/src/views/Login.vue`: fixed-password login form.
- Create `admin/src/views/Dashboard.vue`: stats cards and order status.
- Create `admin/src/views/Products.vue`: product CRUD UI.
- Create `admin/src/views/Knowledge.vue`: category/article management UI.
- Create `admin/src/views/Tutorials.vue`: tutorial management UI.
- Create `admin/src/views/Scripts.vue`: sales script management UI.
- Create `admin/src/views/Orders.vue`: order management UI.
- Create `admin/src/views/AiConfig.vue`: DeepSeek and risk config UI.

### Mini program files

- Create `miniprogram/project.config.json`: WeChat DevTools project config.
- Create `miniprogram/app.json`: pages, tabBar, window config.
- Create `miniprogram/app.js`: global bootstrapping and API base URL.
- Create `miniprogram/app.wxss`: global visual system.
- Create `miniprogram/sitemap.json`: default sitemap.
- Create `miniprogram/utils/request.js`: `request`, `get`, `post` wrappers.
- Create `miniprogram/config/index.js`: API base URL and feature labels.
- Create `miniprogram/pages/home/*`: home dashboard.
- Create `miniprogram/pages/assistant/*`: knowledge and AI reply page.
- Create `miniprogram/pages/toolbox/*`: toolbox, quote, plan generation.
- Create `miniprogram/pages/search/*`: global search.
- Create `miniprogram/pages/mine/*`: favorites/history/config status.
- Create `miniprogram/pages/article-detail/*`: knowledge article detail.
- Create `miniprogram/pages/quote/*`: smart quote form and result.
- Create `miniprogram/pages/plan/*`: site plan form and result.
- Create `miniprogram/pages/ai-chat/*`: focused AI reply generator.

---

### Task 1: Root Project, Database Schema, and Documentation Skeleton

**Files:**
- Create: `package.json`
- Create: `README.md`
- Create: `database.sql`
- Create: `docs/api.md`
- Create: `docs/deployment.md`

**Interfaces:**
- Produces: root scripts `backend:dev`, `backend:test`, `admin:dev`, `admin:build`.
- Produces: MySQL tables `admin_users`, `products`, `knowledge_categories`, `knowledge_articles`, `tutorials`, `sales_scripts`, `orders`, `ai_usage_logs`, `system_configs`, `favorites`, `history_records`.
- Produces: seed data for products, knowledge categories, articles, tutorials, scripts, and system configs.

- [ ] **Step 1: Create root package metadata and helper scripts**

Create `package.json` with:

```json
{
  "name": "ai-xiaofu-v3-mvp",
  "version": "3.0.0",
  "private": true,
  "description": "AI小福智能建站助手 V3.0 full-stack MVP",
  "scripts": {
    "backend:install": "npm --prefix backend install",
    "backend:dev": "npm --prefix backend run dev",
    "backend:start": "npm --prefix backend start",
    "backend:test": "npm --prefix backend test",
    "admin:install": "npm --prefix admin install",
    "admin:dev": "npm --prefix admin run dev",
    "admin:build": "npm --prefix admin run build"
  }
}
```

- [ ] **Step 2: Create MySQL schema and seed data**

Create `database.sql` containing explicit `CREATE TABLE IF NOT EXISTS` statements for all tables listed above. Use `utf8mb4`, `InnoDB`, timestamp columns, `status` columns where needed, and seed rows for:

```sql
INSERT INTO products (name, type, price_min, price_max, duration_days, description, is_hot, sort_order, status) VALUES
('企业官网', 'website', 3000, 8000, 10, '适合企业展示、品牌介绍、新闻动态和表单咨询。', 1, 10, 'active'),
('WordPress建站', 'wordpress', 2500, 7000, 7, '适合快速上线官网、博客、外贸展示和内容型网站。', 1, 20, 'active'),
('外贸独立站', 'foreign_trade', 6000, 18000, 20, '适合外贸获客、多语言展示、SEO和询盘转化。', 1, 30, 'active'),
('微信小程序', 'miniprogram', 5000, 15000, 18, '适合预约、展示、商城、服务工具等微信生态场景。', 1, 40, 'active'),
('AI工具网站', 'ai_tool', 8000, 25000, 25, '适合AI问答、内容生成、工具聚合和会员化扩展。', 1, 50, 'active'),
('商城系统', 'mall', 8000, 30000, 30, '适合商品、订单、支付、营销和后台管理。', 1, 60, 'active'),
('SEO优化', 'seo', 1500, 6000, 15, '适合关键词布局、站内优化、收录基础和内容建议。', 1, 70, 'active'),
('网站维护', 'maintenance', 800, 3000, 30, '适合日常更新、安全检查、备份和小功能调整。', 1, 80, 'active');
```

- [ ] **Step 3: Create README runbook**

Create `README.md` with exact commands:

```bash
npm run backend:install
cp backend/.env.example backend/.env
npm run backend:dev
npm run admin:install
npm run admin:dev
```

Document that MySQL is initialized with:

```bash
mysql -u root -p < database.sql
```

Document mini program opening path: `miniprogram/` in WeChat DevTools.

- [ ] **Step 4: Create API and deployment docs skeleton with real endpoint list**

Create `docs/api.md` listing all MVP endpoints and their request/response contracts. Create `docs/deployment.md` with `wfr.ccvo.top`, backend port `3000`, admin build directory `admin/dist`, and the note that WeChat request domain must include `https://wfr.ccvo.top`.

- [ ] **Step 5: Verify root files exist**

Run:

```bash
node -e "const fs=require('fs'); ['package.json','README.md','database.sql','docs/api.md','docs/deployment.md'].forEach(f=>{if(!fs.existsSync(f)) throw new Error(f+' missing')}); console.log('root skeleton ok')"
```

Expected output:

```text
root skeleton ok
```

---

### Task 2: Backend Foundation and Pure Business Services

**Files:**
- Create: `backend/package.json`
- Create: `backend/.env.example`
- Create: `backend/src/config/env.js`
- Create: `backend/src/config/constants.js`
- Create: `backend/src/utils/response.js`
- Create: `backend/src/services/riskService.js`
- Create: `backend/src/services/quoteService.js`
- Create: `backend/src/services/planService.js`
- Create: `backend/src/services/customerService.js`
- Create: `backend/src/services/toolService.js`
- Create: `backend/test/riskService.test.js`
- Create: `backend/test/quotePlanServices.test.js`
- Create: `backend/test/toolCustomerServices.test.js`

**Interfaces:**
- Produces: `sanitizeInput(text, forbiddenWords?) -> { text: string, hits: string[] }`.
- Produces: `guardOutput(text, forbiddenWords?, fallbackText?) -> { text: string, blocked: boolean, hits: string[] }`.
- Produces: `generateQuote(input) -> { productType, priceRange, durationDays, features, summary, orderDraft }`.
- Produces: `generateSitePlan(input) -> { siteType, pages, features, durationDays, priceRange, proposal }`.
- Produces: `analyzeCustomer(input) -> { level: 'A'|'B'|'C', label, reasons, nextAction }`.
- Produces: `runTool(toolKey, payload) -> { toolKey, status, title, summary, items }`.

- [ ] **Step 1: Write risk service tests first**

Create `backend/test/riskService.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeInput, guardOutput } from '../src/services/riskService.js';

const fallback = '平台内继续沟通，我先帮你整理方案和报价范围。';

test('sanitizeInput replaces forbidden contact words', () => {
  const result = sanitizeInput('客户说加微信和QQ聊');
  assert.equal(result.text.includes('微信'), false);
  assert.equal(result.text.includes('QQ'), false);
  assert.deepEqual(result.hits, ['微信', 'QQ']);
});

test('guardOutput blocks unsafe output and returns fallback', () => {
  const result = guardOutput('可以加我微信详聊', undefined, fallback);
  assert.equal(result.blocked, true);
  assert.equal(result.text, fallback);
  assert.deepEqual(result.hits, ['微信', '加我']);
});

test('guardOutput allows safe in-platform response', () => {
  const result = guardOutput('可以的，你在平台里补充行业和页面数量，我帮你整理报价。', undefined, fallback);
  assert.equal(result.blocked, false);
  assert.equal(result.text.includes('平台'), true);
});
```

- [ ] **Step 2: Write quote, plan, customer, and tool service tests first**

Create `backend/test/quotePlanServices.test.js` and `backend/test/toolCustomerServices.test.js` with assertions that returned objects include exact keys used by API and frontends:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateQuote } from '../src/services/quoteService.js';
import { generateSitePlan } from '../src/services/planService.js';

test('generateQuote returns price, duration, features, and draft order', () => {
  const result = generateQuote({ demand: '我要做企业官网，包含首页、产品、案例、联系表单', budget: '5000' });
  assert.equal(result.productType, '企业官网');
  assert.match(result.priceRange, /￥/);
  assert.ok(result.durationDays >= 7);
  assert.ok(result.features.includes('首页设计'));
  assert.equal(result.orderDraft.status, '待沟通');
});

test('generateSitePlan returns pages, features, duration, price, and proposal', () => {
  const result = generateSitePlan({ industry: '机械设备', budget: '8000', requirements: '展示产品和案例，方便客户咨询' });
  assert.ok(result.pages.includes('首页'));
  assert.ok(result.features.includes('在线咨询表单'));
  assert.match(result.priceRange, /￥/);
  assert.match(result.proposal, /机械设备/);
});
```

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCustomer } from '../src/services/customerService.js';
import { runTool } from '../src/services/toolService.js';

test('analyzeCustomer identifies high-intent customer', () => {
  const result = analyzeCustomer({ message: '我预算一万，本周要做小程序，能多久交付？' });
  assert.equal(result.level, 'A');
  assert.equal(result.label, '高意向客户');
  assert.ok(result.reasons.length > 0);
});

test('runTool returns safe extension response for whois', () => {
  const result = runTool('whois', { domain: 'example.com' });
  assert.equal(result.toolKey, 'whois');
  assert.equal(result.status, 'reserved');
  assert.match(result.summary, /即将接入|预留/);
});
```

- [ ] **Step 3: Run tests to verify they fail before implementation**

Run:

```bash
npm --prefix backend test
```

Expected: FAIL because service files do not exist yet.

- [ ] **Step 4: Create backend package and configuration**

Create `backend/package.json` with Express runtime dependencies and node:test script. Create `.env.example` with `PORT=3000`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=ai_xiaofu_v3`, `JWT_SECRET`, `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL=deepseek-chat`, `DEEPSEEK_TIMEOUT_MS=5000`, and `CORS_ORIGIN=https://wfr.ccvo.top,http://localhost:5173`.

- [ ] **Step 5: Implement constants and service functions**

Implement the exact interfaces above. Use default forbidden words:

```js
['微信', 'wx', 'WX', 'VX', 'vx', 'QQ', '手机号', '电话', '加我', '私聊', '站外', '线下交易', '绕过平台', '规避监管']
```

Use fallback text:

```text
这个需求可以的，我先根据你描述的功能帮你整理一版建站方案和报价范围，你可以继续在平台里补充行业、页面数量和功能要求，我会帮你细化。
```

- [ ] **Step 6: Run backend service tests**

Run:

```bash
npm --prefix backend test
```

Expected: PASS for risk, quote, plan, customer, and tool service tests.

---

### Task 3: Backend Express App, Database Access, Routes, and DeepSeek Adapter

**Files:**
- Create: `backend/src/app.js`
- Create: `backend/src/server.js`
- Create: `backend/src/db/pool.js`
- Create: `backend/src/db/query.js`
- Create: `backend/src/middleware/auth.js`
- Create: `backend/src/middleware/errorHandler.js`
- Create: `backend/src/services/aiService.js`
- Create: `backend/src/services/searchService.js`
- Create: `backend/src/services/statsService.js`
- Create: `backend/src/controllers/authController.js`
- Create: `backend/src/controllers/appController.js`
- Create: `backend/src/controllers/aiController.js`
- Create: `backend/src/controllers/productController.js`
- Create: `backend/src/controllers/knowledgeController.js`
- Create: `backend/src/controllers/tutorialController.js`
- Create: `backend/src/controllers/scriptController.js`
- Create: `backend/src/controllers/orderController.js`
- Create: `backend/src/controllers/toolController.js`
- Create: `backend/src/controllers/searchController.js`
- Create: `backend/src/controllers/configController.js`
- Create: `backend/src/routes/index.js`
- Create: `backend/src/routes/authRoutes.js`
- Create: `backend/src/routes/appRoutes.js`
- Create: `backend/src/routes/aiRoutes.js`
- Create: `backend/src/routes/productRoutes.js`
- Create: `backend/src/routes/knowledgeRoutes.js`
- Create: `backend/src/routes/tutorialRoutes.js`
- Create: `backend/src/routes/scriptRoutes.js`
- Create: `backend/src/routes/orderRoutes.js`
- Create: `backend/src/routes/toolRoutes.js`
- Create: `backend/src/routes/searchRoutes.js`
- Create: `backend/src/routes/configRoutes.js`

**Interfaces:**
- Consumes: pure services from Task 2.
- Produces: Express app mounted at `/api`.
- Produces: `POST /api/auth/login` returning `{ token, expiresIn, adminName }`.
- Produces: public app endpoints for mini program.
- Produces: admin-protected CRUD endpoints under `/api/admin/*`.
- Produces: DeepSeek adapter `generateAiReply({ prompt, scene }) -> { text, provider, fallback, blocked, usage }`.

- [ ] **Step 1: Create response and async error helpers**

Implement `success(res, data, message = 'success')`, `failure(res, code, message, httpStatus = 200, data = null)`, and `asyncHandler(fn)` in `backend/src/utils/response.js`. Controllers must use these helpers so all responses match the spec.

- [ ] **Step 2: Implement MySQL query wrapper**

`backend/src/db/query.js` must export:

```js
export async function query(sql, params = [])
export async function queryOne(sql, params = [])
export async function insertAndFetch(table, payload)
```

`queryOne` returns the first row or `null`. `insertAndFetch` inserts `payload` and returns the inserted row by `insertId`.

- [ ] **Step 3: Implement auth login and middleware**

`POST /api/auth/login` accepts `{ password }`. If password equals `zyh123456`, return JWT signed with `JWT_SECRET` and 30-minute expiry. Otherwise return code `40301` with message `密码错误`.

`authRequired(req, res, next)` reads `Authorization: Bearer <token>`, validates JWT, and sets `req.admin`.

- [ ] **Step 4: Implement DeepSeek adapter with timeout and risk guard**

`generateAiReply` must:

1. Sanitize user input with `sanitizeInput`.
2. Prepend the platform-safe system prompt.
3. Call `https://api.deepseek.com/chat/completions` with model from env.
4. Abort after `DEEPSEEK_TIMEOUT_MS`.
5. If API key is missing, API fails, timeout happens, or output is blocked, return fallback text with `fallback: true`.
6. Never log the full API key.

- [ ] **Step 5: Implement content and admin CRUD controllers**

Create thin controllers for products, categories/articles, tutorials, scripts, orders, and configs. Each controller must expose list/create/update/delete methods with explicit SQL and use `success`/`failure`.

Required admin routes:

```text
GET    /api/admin/dashboard
GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
GET    /api/admin/knowledge/categories
POST   /api/admin/knowledge/categories
PUT    /api/admin/knowledge/categories/:id
DELETE /api/admin/knowledge/categories/:id
GET    /api/admin/knowledge/articles
POST   /api/admin/knowledge/articles
PUT    /api/admin/knowledge/articles/:id
DELETE /api/admin/knowledge/articles/:id
GET    /api/admin/tutorials
POST   /api/admin/tutorials
PUT    /api/admin/tutorials/:id
DELETE /api/admin/tutorials/:id
GET    /api/admin/scripts
POST   /api/admin/scripts
PUT    /api/admin/scripts/:id
DELETE /api/admin/scripts/:id
GET    /api/admin/orders
POST   /api/admin/orders
PUT    /api/admin/orders/:id
DELETE /api/admin/orders/:id
GET    /api/admin/configs
PUT    /api/admin/configs/:configKey
```

Required mini program routes:

```text
GET  /api/app/home/summary
GET  /api/products/hot
GET  /api/tutorials/latest
GET  /api/usage/recent
GET  /api/knowledge/categories
GET  /api/knowledge/articles
GET  /api/knowledge/articles/:id
POST /api/ai/chat
POST /api/quote/generate
POST /api/plan/generate
POST /api/customer/analyze
POST /api/scripts/recommend
POST /api/tools/:toolKey/check
GET  /api/search
POST /api/favorites
GET  /api/favorites
POST /api/history
GET  /api/history
```

- [ ] **Step 6: Wire app and server**

`backend/src/app.js` creates Express app with JSON body parsing, CORS, `/api/health`, `/api` routes, and error handler. `backend/src/server.js` starts on port `3000` by default.

- [ ] **Step 7: Verify backend service tests and syntax**

Run:

```bash
npm --prefix backend test
node --check backend/src/server.js
```

Expected: all tests PASS and `node --check` has no output.

- [ ] **Step 8: Start backend smoke check**

Run:

```bash
npm --prefix backend start
```

Expected log:

```text
AI小福 backend listening on port 3000
```

Stop the process after confirming the log.

---

### Task 4: Vue3 Admin Shell, API Client, Auth, and Management Pages

**Files:**
- Create: `admin/package.json`
- Create: `admin/index.html`
- Create: `admin/vite.config.js`
- Create: `admin/src/main.js`
- Create: `admin/src/App.vue`
- Create: `admin/src/router/index.js`
- Create: `admin/src/api/client.js`
- Create: `admin/src/api/modules.js`
- Create: `admin/src/styles.css`
- Create: `admin/src/views/Login.vue`
- Create: `admin/src/views/Dashboard.vue`
- Create: `admin/src/views/Products.vue`
- Create: `admin/src/views/Knowledge.vue`
- Create: `admin/src/views/Tutorials.vue`
- Create: `admin/src/views/Scripts.vue`
- Create: `admin/src/views/Orders.vue`
- Create: `admin/src/views/AiConfig.vue`

**Interfaces:**
- Consumes: backend endpoints from Task 3.
- Produces: admin route paths `/login`, `/`, `/products`, `/knowledge`, `/tutorials`, `/scripts`, `/orders`, `/ai-config`.
- Produces: `apiGet`, `apiPost`, `apiPut`, `apiDelete` functions that unwrap `{ code, data, message }`.

- [ ] **Step 1: Create admin package and Vite entry files**

Create `admin/package.json` with scripts:

```json
{
  "name": "ai-xiaofu-admin",
  "version": "3.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 5173",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 4173"
  },
  "dependencies": {
    "@vitejs/plugin-vue": "latest",
    "vite": "latest",
    "vue": "latest",
    "vue-router": "latest",
    "element-plus": "latest",
    "@element-plus/icons-vue": "latest"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: Implement API client**

`admin/src/api/client.js` must read token from `localStorage`, attach `Authorization`, parse JSON, throw `Error(message)` when `code !== 0`, and redirect to `/login` if code is `40101`.

- [ ] **Step 3: Implement router and layout**

`admin/src/router/index.js` must guard all routes except `/login`. `App.vue` must show a sidebar only when logged in, with menu items for dashboard, products, knowledge, tutorials, scripts, orders, and AI config.

- [ ] **Step 4: Implement login page**

`Login.vue` must post `{ password }` to `/api/auth/login`, store token, and route to `/`. UI copy must state `后台固定密码登录` without showing the password in the interface.

- [ ] **Step 5: Implement dashboard page**

`Dashboard.vue` must request `/api/admin/dashboard` and show today AI calls, quote count, AI failures, order status, and hot product ranking using Element Plus cards.

- [ ] **Step 6: Implement CRUD pages**

Products, Tutorials, Scripts, Orders, and AI Config pages must include:

- list loading on mount;
- `ElTable` display;
- `ElDialog` form for create/edit where needed;
- delete confirmation with `ElMessageBox.confirm`;
- success and failure feedback with `ElMessage`;
- no loss of current form values when a save fails.

- [ ] **Step 7: Implement knowledge page with two panels**

`Knowledge.vue` must manage categories and articles on the same page: left side category list, right side article table/form. Article form uses selected category.

- [ ] **Step 8: Build admin**

Run:

```bash
npm --prefix admin install
npm --prefix admin run build
```

Expected: build completes and creates `admin/dist/index.html`.

---

### Task 5: Native WeChat Mini Program Shell, Request Client, and Tab Pages

**Files:**
- Create: `miniprogram/project.config.json`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.js`
- Create: `miniprogram/app.wxss`
- Create: `miniprogram/sitemap.json`
- Create: `miniprogram/config/index.js`
- Create: `miniprogram/utils/request.js`
- Create: `miniprogram/pages/home/home.{json,wxml,wxss,js}`
- Create: `miniprogram/pages/assistant/assistant.{json,wxml,wxss,js}`
- Create: `miniprogram/pages/toolbox/toolbox.{json,wxml,wxss,js}`
- Create: `miniprogram/pages/search/search.{json,wxml,wxss,js}`
- Create: `miniprogram/pages/mine/mine.{json,wxml,wxss,js}`

**Interfaces:**
- Consumes: public mini program endpoints from Task 3.
- Produces: `request(options)`, `get(url, data)`, `post(url, data)` wrappers.
- Produces: five tab pages with paths `pages/home/home`, `pages/assistant/assistant`, `pages/toolbox/toolbox`, `pages/search/search`, `pages/mine/mine`.

- [ ] **Step 1: Create mini program app config**

`app.json` must define the five tab pages, subpages from Task 6, blue selected tab color `#1677FF`, and window navigation title `AI小福`.

- [ ] **Step 2: Implement request wrapper**

`utils/request.js` must call `wx.request`, use `API_BASE_URL` from `config/index.js`, unwrap `{ code, data, message }`, show `wx.showToast` for failures, and reject with `Error(message)`.

- [ ] **Step 3: Implement global styles**

`app.wxss` must define card, glass, section-title, primary-gradient, pill, empty-state, and button classes with the approved colors and 20px card radius.

- [ ] **Step 4: Implement home tab**

Home page must load `/api/app/home/summary`, `/api/products/hot`, `/api/tutorials/latest`, and `/api/usage/recent`. It must render welcome card, search bar, four quick actions, stats, hot products, tutorials, and recent records.

- [ ] **Step 5: Implement assistant tab**

Assistant page must load categories and articles, allow category switching, render article cards, and include an input area for customer question. Submitting calls `/api/ai/chat`; the result can be copied via `wx.setClipboardData`.

- [ ] **Step 6: Implement toolbox tab**

Toolbox page must render nine tools. Smart quote navigates to `pages/quote/quote`; AI plan navigates to `pages/plan/plan`; customer analysis and script recommendation call APIs directly; extension tools call `/api/tools/:toolKey/check` and show the safe response.

- [ ] **Step 7: Implement search and mine tabs**

Search page calls `/api/search?q=<keyword>&type=all` and renders grouped results. Mine page loads favorites and history, renders API status as `后端安全托管`, and shows update log/contact service entries without login or payment.

- [ ] **Step 8: Static mini program config verification**

Run:

```bash
node -e "const fs=require('fs'); const app=JSON.parse(fs.readFileSync('miniprogram/app.json','utf8')); if(app.tabBar.list.length!==5) throw new Error('tabBar must have 5 items'); console.log('miniprogram tabs ok')"
```

Expected output:

```text
miniprogram tabs ok
```

---

### Task 6: Mini Program Detail and Workflow Pages

**Files:**
- Create: `miniprogram/pages/article-detail/article-detail.{json,wxml,wxss,js}`
- Create: `miniprogram/pages/quote/quote.{json,wxml,wxss,js}`
- Create: `miniprogram/pages/plan/plan.{json,wxml,wxss,js}`
- Create: `miniprogram/pages/ai-chat/ai-chat.{json,wxml,wxss,js}`

**Interfaces:**
- Consumes: `get` and `post` request functions from Task 5.
- Produces: article detail page that reads `id` from route query.
- Produces: quote page that returns `{ priceRange, durationDays, features, summary }`.
- Produces: plan page that returns `{ pages, features, durationDays, priceRange, proposal }`.
- Produces: AI chat page that returns `{ text }` and copy action.

- [ ] **Step 1: Implement article detail page**

Read `options.id`, call `/api/knowledge/articles/:id`, render title, summary, tags, content, and a collect button that posts to `/api/favorites`.

- [ ] **Step 2: Implement quote page**

Create form fields: demand, budget, deadline, productType. Submit to `/api/quote/generate`. Render price range, duration, feature list, summary, and a button to copy the full quote.

- [ ] **Step 3: Implement plan page**

Create form fields: industry, budget, requirements. Submit to `/api/plan/generate`. Render pages, features, duration, price range, and proposal text with copy button.

- [ ] **Step 4: Implement AI chat page**

Create focused customer question form. Submit to `/api/ai/chat`. Render safe reply, risk/fallback hint when backend marks fallback, and copy button.

- [ ] **Step 5: Verify subpage registration**

Run:

```bash
node -e "const fs=require('fs'); const app=JSON.parse(fs.readFileSync('miniprogram/app.json','utf8')); ['pages/article-detail/article-detail','pages/quote/quote','pages/plan/plan','pages/ai-chat/ai-chat'].forEach(p=>{if(!app.pages.includes(p)) throw new Error(p+' missing')}); console.log('subpages ok')"
```

Expected output:

```text
subpages ok
```

---

### Task 7: Final Documentation, Cross-App Configuration, and Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/api.md`
- Modify: `docs/deployment.md`
- Modify: `backend/.env.example`
- Modify: `miniprogram/config/index.js`

**Interfaces:**
- Consumes: complete backend, admin, and mini program from Tasks 1-6.
- Produces: end-to-end run instructions and verification checklist.

- [ ] **Step 1: Update README with final commands**

README must include:

```bash
mysql -u root -p < database.sql
npm run backend:install
cp backend/.env.example backend/.env
npm run backend:dev
npm run admin:install
npm run admin:dev
npm run backend:test
npm run admin:build
```

Include WeChat DevTools instruction: import `miniprogram/`, configure request domain to `https://wfr.ccvo.top`, or use local development mode for `http://localhost:3000`.

- [ ] **Step 2: Update API docs with exact public and admin endpoints**

For each endpoint, document method, path, purpose, required body/query, and success response shape. Include the unified error shape and error codes `40001`, `40101`, `40301`, `40401`, `42901`, `50001`, `50002`, `50003`, `50004`.

- [ ] **Step 3: Update deployment docs**

Document:

- backend listens on port `3000`;
- admin builds to `admin/dist`;
- nginx routes `/api` to backend and `/admin` to admin static files;
- domain is `wfr.ccvo.top`;
- DeepSeek key is configured only on backend;
- mini program request legal domain must include `https://wfr.ccvo.top`.

- [ ] **Step 4: Run backend tests**

Run:

```bash
npm run backend:test
```

Expected: all node:test suites pass.

- [ ] **Step 5: Run admin build**

Run:

```bash
npm run admin:build
```

Expected: Vite build succeeds and `admin/dist/index.html` exists.

- [ ] **Step 6: Run static project checks**

Run:

```bash
node -e "const fs=require('fs'); const required=['backend/src/app.js','admin/src/App.vue','miniprogram/app.json','database.sql','README.md']; required.forEach(f=>{if(!fs.existsSync(f)) throw new Error(f+' missing')}); console.log('AI小福 V3.0 MVP files ready')"
```

Expected output:

```text
AI小福 V3.0 MVP files ready
```

---

## Self-Review

### Spec coverage

- Full-stack project structure is covered by Tasks 1, 2, 3, 4, 5, and 6.
- DeepSeek API and 5-second timeout are covered by Task 3.
- Risk prompt, forbidden words, input/output guard, and fallback text are covered by Task 2 and Task 3.
- Mini program five tabs are covered by Task 5.
- Mini program quote, plan, article detail, and AI chat workflows are covered by Task 6.
- Admin login, dashboard, CRUD, orders, and AI config are covered by Task 4.
- Database schema and initial demo data are covered by Task 1.
- Unified responses, error codes, docs, and deployment are covered by Tasks 1, 3, and 7.
- Extension tools that do not call third-party services in MVP are covered by Task 2 and Task 5.

### Placeholder scan

The plan contains no unresolved `TBD`, `TODO`, or undefined file names. MVP extension endpoints are intentionally scoped to safe demo responses as required by the spec.

### Type and interface consistency

The service function names defined in Task 2 are consumed by Task 3 with matching names. The backend endpoint names listed in Task 3 are consumed by the admin and mini program tasks. Response shapes use the unified `{ code, message, data }` wrapper throughout.
