# Product Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing product library into a backend-editable product showcase with external image/video URLs, customer-ready copy, mini program list/detail pages, copy actions, and sharing.

**Architecture:** Extend the existing `products` data model instead of creating a second product system. Keep backend product mapping and public product endpoints in `productController.js`, keep the Vue admin editor as a single product management screen, and add two focused mini program pages for product list and product detail. Use external URLs only; no upload pipeline or rich-text editor is introduced.

**Tech Stack:** Express 4, Node.js built-in test runner, MySQL via `mysql2`, Vue 3 + Element Plus + Vite, WeChat Mini Program native pages, existing local PNG icon assets.

## Global Constraints

- Use the existing `products` table and product admin CRUD; do not create an independent product showcase table.
- Media is edited as external URL text fields only; do not add backend local upload or third-party object storage integration.
- Use structured fields and plain textarea inputs; do not add a rich-text editor.
- Do not add third-party UI libraries or new npm dependencies.
- Existing products with empty showcase fields must still display and edit safely.
- Public mini program endpoints must only expose products with `status = 'active'`.
- JSON-like product fields must be returned to the frontend as arrays: `galleryUrls`, `highlights`, `scenarios`, `deliverables`, `faqs`.
- If `shareScript` is empty, the backend must return a generated customer-ready script.
- Preserve the existing quote system behavior; product showcase changes must not alter quote generation logic.
- Mini program visual style must follow the existing blue/purple gradient, glass cards, rounded cards, and local image icon system.
- Before executing any task, check `git status` and do not commit unrelated pre-existing changes. Each task's commit command stages only files named in that task.

---

## File Structure

### Backend

- `database.sql` — Extend the `products` schema with nullable showcase fields and seed product showcase sample values.
- `backend/src/controllers/productController.js` — Own all product mapping, JSON field parsing/serialization, admin product CRUD, public product list/detail, and hot product list.
- `backend/src/routes/productRoutes.js` — Export separate admin and public product routers.
- `backend/src/routes/appRoutes.js` — Keep app home summary/tutorial/recent routes; remove the hot-product route from this file.
- `backend/src/routes/index.js` — Mount public product routes under `/api` and admin product routes under `/api/admin`.
- `backend/test/appRoutes.test.js` — Add route tests for showcase fields, public product visibility, public detail, disabled-product hiding, and default share script generation.

### Admin

- `admin/src/views/Products.vue` — Upgrade the product CRUD screen into a product showcase editor with sections for base info, media URLs, structured content, FAQs, and customer copy.
- `admin/src/api/modules.js` — No code change expected; the existing `productsApi = crud('/admin/products')` already supports the expanded payload.

### Mini Program

- `miniprogram/app.json` — Register `pages/products/products` and `pages/product-detail/product-detail`.
- `miniprogram/pages/products/products.js` — Load `/products`, normalize display text, and navigate to details.
- `miniprogram/pages/products/products.wxml` — Render the showcase list, loading state, error state, empty state, and product cards.
- `miniprogram/pages/products/products.wxss` — Style the showcase list using existing app visual language.
- `miniprogram/pages/products/products.json` — Page config for the product list page.
- `miniprogram/pages/product-detail/product-detail.js` — Load `/products/:id`, normalize sections, copy share script/summary, preview images, and define share metadata.
- `miniprogram/pages/product-detail/product-detail.wxml` — Render product detail media, content sections, FAQ, and bottom actions.
- `miniprogram/pages/product-detail/product-detail.wxss` — Style the product detail page and fixed action bar.
- `miniprogram/pages/product-detail/product-detail.json` — Page config for the product detail page.
- `miniprogram/pages/home/home.js` — Change product quick action to navigate to the product list and add product-card detail navigation.
- `miniprogram/pages/home/home.wxml` — Bind hot product cards to product detail navigation.

### Docs

- `docs/api.md` — Document `GET /products`, `GET /products/:id`, extended `GET /products/hot`, and extended admin product payload fields.
- `docs/deployment.md` — Add the production `ALTER TABLE products ...` migration for existing databases.

---

### Task 1: Backend Product Showcase Data Model and Public APIs

**Files:**
- Modify: `database.sql`
- Modify: `backend/src/controllers/productController.js`
- Modify: `backend/src/routes/productRoutes.js`
- Modify: `backend/src/routes/appRoutes.js`
- Modify: `backend/src/routes/index.js`
- Modify: `backend/test/appRoutes.test.js`

**Interfaces:**
- Consumes: existing `insertAndFetch(table, payload)`, `query(sql, params)`, `queryOne(sql, params)`, `success(res, data)`, `failure(res, code, message, httpStatus)`.
- Produces:
  - `mapProduct(row) -> ProductShowcase`
  - `listProducts(req, res)` for `GET /api/admin/products`
  - `createProduct(req, res)` for `POST /api/admin/products`
  - `updateProduct(req, res)` for `PUT /api/admin/products/:id`
  - `deleteProduct(req, res)` for `DELETE /api/admin/products/:id`
  - `listPublicProducts(req, res)` for `GET /api/products`
  - `getProductDetail(req, res)` for `GET /api/products/:id`
  - `listHotProducts(req, res)` for `GET /api/products/hot`
  - `ProductShowcase` response shape:
    ```js
    {
      id: number,
      name: string,
      type: string,
      priceMin: number,
      priceMax: number,
      durationDays: number,
      description: string,
      isHot: boolean,
      sortOrder: number,
      status: string,
      coverUrl: string,
      videoUrl: string,
      galleryUrls: string[],
      highlights: string[],
      scenarios: string[],
      deliverables: string[],
      faqs: Array<{ question: string, answer: string }>,
      shareScript: string,
      detailContent: string
    }
    ```

- [ ] **Step 1: Add failing backend route tests**

Append this helper and tests to `backend/test/appRoutes.test.js` after the existing `GET /api/admin/dashboard requires bearer token` test and before the existing public knowledge test:

```js
async function loginAsAdmin(baseUrl) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'aw3109284636'
    })
  });
  const body = await response.json();
  assert.equal(body.code, 0);
  return body.data.token;
}

test('product showcase fields are saved through admin API and exposed through public APIs', async () => {
  const server = await startTestServer();

  try {
    const token = await loginAsAdmin(server.baseUrl);
    const createResponse = await fetch(`${server.baseUrl}/api/admin/products`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        name: '企业官网增强展示',
        type: 'website_showcase_test',
        priceMin: 6800,
        priceMax: 12800,
        durationDays: 15,
        description: '用于测试图文视频展示的产品。',
        isHot: true,
        sortOrder: 999,
        status: 'active',
        coverUrl: 'https://example.com/company-cover.jpg',
        videoUrl: 'https://example.com/company-video.mp4',
        galleryUrls: ['https://example.com/company-1.jpg', 'https://example.com/company-2.jpg'],
        highlights: ['品牌首屏设计', '移动端适配', 'SEO基础结构'],
        scenarios: ['企业展示', '获客转化'],
        deliverables: ['首页设计', '产品页', '联系表单'],
        faqs: [{ question: '多久上线？', answer: '资料齐全后通常 15 天左右。' }],
        shareScript: '',
        detailContent: '包含首页、产品服务、案例展示、关于我们和联系表单。'
      })
    });
    const createBody = await createResponse.json();

    assert.equal(createResponse.status, 200);
    assert.equal(createBody.code, 0);
    assert.equal(createBody.data.coverUrl, 'https://example.com/company-cover.jpg');
    assert.deepEqual(createBody.data.galleryUrls, ['https://example.com/company-1.jpg', 'https://example.com/company-2.jpg']);
    assert.deepEqual(createBody.data.highlights, ['品牌首屏设计', '移动端适配', 'SEO基础结构']);
    assert.deepEqual(createBody.data.faqs, [{ question: '多久上线？', answer: '资料齐全后通常 15 天左右。' }]);
    assert.match(createBody.data.shareScript, /企业官网增强展示/);
    assert.match(createBody.data.shareScript, /平台/);

    const listResponse = await fetch(`${server.baseUrl}/api/products`);
    const listBody = await listResponse.json();
    assert.equal(listBody.code, 0);
    const listed = listBody.data.find((item) => item.id === createBody.data.id);
    assert.ok(listed);
    assert.equal(listed.name, '企业官网增强展示');
    assert.equal(listed.coverUrl, 'https://example.com/company-cover.jpg');

    const hotResponse = await fetch(`${server.baseUrl}/api/products/hot`);
    const hotBody = await hotResponse.json();
    assert.equal(hotBody.code, 0);
    assert.equal(hotBody.data.some((item) => item.id === createBody.data.id), true);

    const detailResponse = await fetch(`${server.baseUrl}/api/products/${createBody.data.id}`);
    const detailBody = await detailResponse.json();
    assert.equal(detailBody.code, 0);
    assert.equal(detailBody.data.videoUrl, 'https://example.com/company-video.mp4');
    assert.deepEqual(detailBody.data.scenarios, ['企业展示', '获客转化']);
    assert.deepEqual(detailBody.data.deliverables, ['首页设计', '产品页', '联系表单']);
    assert.equal(detailBody.data.detailContent, '包含首页、产品服务、案例展示、关于我们和联系表单。');
  } finally {
    await server.close();
  }
});

test('public product APIs hide disabled products', async () => {
  const server = await startTestServer();

  try {
    const token = await loginAsAdmin(server.baseUrl);
    const createResponse = await fetch(`${server.baseUrl}/api/admin/products`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        name: '禁用产品展示测试',
        type: 'disabled_showcase_test',
        priceMin: 1000,
        priceMax: 2000,
        durationDays: 3,
        description: '禁用产品不应该公开展示。',
        isHot: true,
        sortOrder: 1000,
        status: 'disabled'
      })
    });
    const createBody = await createResponse.json();
    assert.equal(createBody.code, 0);

    const listResponse = await fetch(`${server.baseUrl}/api/products`);
    const listBody = await listResponse.json();
    assert.equal(listBody.code, 0);
    assert.equal(listBody.data.some((item) => item.id === createBody.data.id), false);

    const detailResponse = await fetch(`${server.baseUrl}/api/products/${createBody.data.id}`);
    const detailBody = await detailResponse.json();
    assert.equal(detailResponse.status, 404);
    assert.equal(detailBody.code, 40401);
    assert.equal(detailBody.message, '产品暂不可查看');
  } finally {
    await server.close();
  }
});
```

- [ ] **Step 2: Run backend tests to verify the new tests fail**

Run:

```bash
npm --prefix backend test
```

Expected: FAIL. The new tests should fail because `coverUrl`, `galleryUrls`, `GET /api/products`, and `GET /api/products/:id` are not implemented yet.

- [ ] **Step 3: Extend the SQL schema**

In `database.sql`, replace the `products` table definition with this block:

```sql
CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `price_min` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `price_max` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `duration_days` INT NOT NULL DEFAULT 0,
  `description` TEXT NULL,
  `is_hot` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `cover_url` VARCHAR(500) NULL,
  `video_url` VARCHAR(500) NULL,
  `gallery_urls` MEDIUMTEXT NULL,
  `highlights` MEDIUMTEXT NULL,
  `scenarios` MEDIUMTEXT NULL,
  `deliverables` MEDIUMTEXT NULL,
  `faqs` MEDIUMTEXT NULL,
  `share_script` MEDIUMTEXT NULL,
  `detail_content` MEDIUMTEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_type` (`type`),
  KEY `idx_products_status_hot_sort` (`status`, `is_hot`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Replace the existing product seed insert with this block:

```sql
INSERT INTO `products` (`name`, `type`, `price_min`, `price_max`, `duration_days`, `description`, `is_hot`, `sort_order`, `status`, `cover_url`, `video_url`, `gallery_urls`, `highlights`, `scenarios`, `deliverables`, `faqs`, `share_script`, `detail_content`) VALUES
('企业官网', 'website', 3000, 8000, 10, '适合企业展示、品牌介绍、新闻动态和表单咨询。', 1, 10, 'active', '', '', '["https://example.com/products/company-site-1.jpg"]', '["品牌首页设计","移动端适配","基础SEO结构"]', '["企业展示","品牌背书","表单获客"]', '["首页设计","产品服务页","案例展示","关于我们","联系表单"]', '[{"question":"企业官网多久上线？","answer":"资料齐全后通常 7-10 天可完成首版上线。"}]', '这个企业官网适合企业展示、品牌介绍和客户咨询。价格一般在 ￥3000-￥8000，周期约 10 天。你可以继续在平台里补充行业、栏目和参考风格，我帮你细化方案。', '企业官网适合需要品牌展示、服务介绍、案例背书和线索收集的客户。'),
('WordPress建站', 'wordpress', 2500, 7000, 7, '适合快速上线官网、博客、外贸展示和内容型网站。', 1, 20, 'active', '', '', '[]', '["上线快","内容管理方便","插件生态丰富"]', '["内容站","博客","外贸展示"]', '["WordPress安装","主题配置","基础插件","内容栏目"]', '[{"question":"后期能自己改内容吗？","answer":"可以，WordPress 后台适合日常文章和页面内容维护。"}]', 'WordPress 建站适合快速上线官网、博客或内容站。价格一般在 ￥2500-￥7000，周期约 7 天。你可以继续在平台里发需求，我帮你判断适合模板搭建还是定制。', 'WordPress 适合内容维护频率较高、预算中等、希望快速上线的项目。'),
('外贸独立站', 'foreign_trade', 6000, 18000, 20, '适合外贸获客、多语言展示、SEO和询盘转化。', 1, 30, 'active', '', '', '[]', '["多语言结构","询盘表单","外贸SEO基础"]', '["外贸获客","产品展示","海外品牌展示"]', '["多语言页面","产品展示结构","询盘表单","基础SEO设置"]', '[]', '', '外贸独立站重点服务海外访问、产品展示和询盘转化。'),
('微信小程序', 'miniprogram', 5000, 15000, 18, '适合预约、展示、商城、服务工具等微信生态场景。', 1, 40, 'active', '', '', '[]', '["微信生态触达","轻量服务流程","无需下载安装"]', '["预约服务","内容展示","轻商城"]', '["小程序页面","接口对接","后台基础管理","发布协助"]', '[]', '', '微信小程序适合依赖微信生态触达客户的轻量服务场景。'),
('AI工具网站', 'ai_tool', 8000, 25000, 25, '适合AI问答、内容生成、工具聚合和会员化扩展。', 1, 50, 'active', '', '', '[]', '["AI能力接入","工具工作流","后续可扩展会员"]', '["AI问答","内容生成","行业助手"]', '["前端页面","后端接口","AI接口接入","基础后台"]', '[]', '', 'AI 工具网站适合把固定业务流程做成可在线使用的 AI 工具。'),
('商城系统', 'mall', 8000, 30000, 30, '适合商品、订单、支付、营销和后台管理。', 1, 60, 'active', '', '', '[]', '["商品管理","订单流程","营销扩展"]', '["商品销售","线上下单","会员运营"]', '["商品模块","订单模块","后台管理","基础营销配置"]', '[]', '', '商城系统适合需要商品展示、下单和订单管理的业务。'),
('SEO优化', 'seo', 1500, 6000, 15, '适合关键词布局、站内优化、收录基础和内容建议。', 1, 70, 'active', '', '', '[]', '["关键词布局","站内结构优化","收录基础"]', '["官网优化","内容站优化","搜索获客"]', '["关键词建议","页面标题描述","站内结构建议","基础检查"]', '[]', '', 'SEO 优化适合希望通过搜索渠道提升曝光和自然咨询的客户。'),
('网站维护', 'maintenance', 800, 3000, 30, '适合日常更新、安全检查、备份和小功能调整。', 1, 80, 'active', '', '', '[]', '["日常更新","安全检查","备份维护"]', '["老站维护","内容更新","小功能调整"]', '["内容更新","备份检查","安全巡检","小问题处理"]', '[]', '', '网站维护适合已有网站但需要持续更新和安全检查的客户。');
```

- [ ] **Step 4: Replace `backend/src/controllers/productController.js`**

Use this complete file content:

```js
import { insertAndFetch, query, queryOne } from '../db/query.js';
import { ERROR_CODES } from '../config/constants.js';
import { failure, success } from '../utils/response.js';

const fallbackProducts = [
  {
    id: 1,
    name: '企业官网',
    type: 'website',
    priceMin: 3000,
    priceMax: 8000,
    durationDays: 10,
    description: '适合企业展示、品牌介绍、新闻动态和表单咨询。',
    isHot: true,
    sortOrder: 10,
    status: 'active',
    coverUrl: '',
    videoUrl: '',
    galleryUrls: ['https://example.com/products/company-site-1.jpg'],
    highlights: ['品牌首页设计', '移动端适配', '基础SEO结构'],
    scenarios: ['企业展示', '品牌背书', '表单获客'],
    deliverables: ['首页设计', '产品服务页', '案例展示', '关于我们', '联系表单'],
    faqs: [{ question: '企业官网多久上线？', answer: '资料齐全后通常 7-10 天可完成首版上线。' }],
    shareScript: '这个企业官网适合企业展示、品牌介绍和客户咨询。价格一般在 ￥3000-￥8000，周期约 10 天。你可以继续在平台里补充行业、栏目和参考风格，我帮你细化方案。',
    detailContent: '企业官网适合需要品牌展示、服务介绍、案例背书和线索收集的客户。'
  },
  {
    id: 2,
    name: 'WordPress建站',
    type: 'wordpress',
    priceMin: 2500,
    priceMax: 7000,
    durationDays: 7,
    description: '适合快速上线官网、博客、外贸展示和内容型网站。',
    isHot: true,
    sortOrder: 20,
    status: 'active',
    coverUrl: '',
    videoUrl: '',
    galleryUrls: [],
    highlights: ['上线快', '内容管理方便', '插件生态丰富'],
    scenarios: ['内容站', '博客', '外贸展示'],
    deliverables: ['WordPress安装', '主题配置', '基础插件', '内容栏目'],
    faqs: [{ question: '后期能自己改内容吗？', answer: '可以，WordPress 后台适合日常文章和页面内容维护。' }],
    shareScript: 'WordPress 建站适合快速上线官网、博客或内容站。价格一般在 ￥2500-￥7000，周期约 7 天。你可以继续在平台里发需求，我帮你判断适合模板搭建还是定制。',
    detailContent: 'WordPress 适合内容维护频率较高、预算中等、希望快速上线的项目。'
  }
];

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function booleanValue(value) {
  return value === true || value === 1 || value === '1';
}

function parseJson(value) {
  if (Array.isArray(value) || (value && typeof value === 'object')) return value;
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseTextArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(String(item))).filter(Boolean);
  }

  const parsed = parseJson(value);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => cleanText(String(item))).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split('\n').map((item) => cleanText(item)).filter(Boolean);
  }

  return [];
}

function parseFaqs(value) {
  const parsed = parseJson(value);
  const source = Array.isArray(parsed) ? parsed : Array.isArray(value) ? value : [];

  return source
    .map((item) => ({
      question: cleanText(item?.question),
      answer: cleanText(item?.answer)
    }))
    .filter((item) => item.question || item.answer);
}

function stringifyTextArray(value) {
  return JSON.stringify(parseTextArray(value));
}

function stringifyFaqs(value) {
  return JSON.stringify(parseFaqs(value));
}

function buildDefaultShareScript(product) {
  const priceText = product.priceMin || product.priceMax
    ? `价格一般在 ￥${product.priceMin}-￥${product.priceMax}`
    : '价格需要根据具体需求评估';
  const durationText = product.durationDays ? `周期约 ${product.durationDays} 天` : '周期会根据需求评估';
  const highlightText = product.highlights.length ? `核心亮点：${product.highlights.slice(0, 3).join('、')}。` : '';
  const descriptionText = product.description ? `${product.description}` : `${product.name}可以根据你的需求细化方案。`;

  return `${product.name}可以做。${descriptionText}\n${priceText}，${durationText}。${highlightText}\n你可以继续在平台里补充行业、页面数量和功能要求，我这边帮你细化方案和报价。`;
}

function mapProduct(row) {
  const product = {
    id: Number(row.id),
    name: row.name || '',
    type: row.type || '',
    priceMin: numberValue(row.price_min ?? row.priceMin),
    priceMax: numberValue(row.price_max ?? row.priceMax),
    durationDays: numberValue(row.duration_days ?? row.durationDays),
    description: row.description || '',
    isHot: booleanValue(row.is_hot ?? row.isHot),
    sortOrder: numberValue(row.sort_order ?? row.sortOrder),
    status: row.status || 'active',
    coverUrl: cleanText(row.cover_url ?? row.coverUrl),
    videoUrl: cleanText(row.video_url ?? row.videoUrl),
    galleryUrls: parseTextArray(row.gallery_urls ?? row.galleryUrls),
    highlights: parseTextArray(row.highlights),
    scenarios: parseTextArray(row.scenarios),
    deliverables: parseTextArray(row.deliverables),
    faqs: parseFaqs(row.faqs),
    shareScript: cleanText(row.share_script ?? row.shareScript),
    detailContent: cleanText(row.detail_content ?? row.detailContent)
  };

  if (!product.shareScript) {
    product.shareScript = buildDefaultShareScript(product);
  }

  return product;
}

function buildPayload(body = {}) {
  return {
    name: body.name,
    type: body.type,
    price_min: numberValue(body.priceMin),
    price_max: numberValue(body.priceMax),
    duration_days: numberValue(body.durationDays),
    description: body.description || null,
    is_hot: body.isHot ? 1 : 0,
    sort_order: numberValue(body.sortOrder),
    status: body.status || 'active',
    cover_url: cleanText(body.coverUrl) || null,
    video_url: cleanText(body.videoUrl) || null,
    gallery_urls: stringifyTextArray(body.galleryUrls),
    highlights: stringifyTextArray(body.highlights),
    scenarios: stringifyTextArray(body.scenarios),
    deliverables: stringifyTextArray(body.deliverables),
    faqs: stringifyFaqs(body.faqs),
    share_script: cleanText(body.shareScript) || null,
    detail_content: cleanText(body.detailContent) || null
  };
}

function payloadToFallbackProduct(id, payload) {
  return mapProduct({ id, ...payload });
}

function publicProducts() {
  return fallbackProducts
    .filter((item) => item.status === 'active')
    .sort((left, right) => right.sortOrder - left.sortOrder || right.id - left.id);
}

export async function listProducts(req, res) {
  try {
    const rows = await query('SELECT * FROM products ORDER BY sort_order DESC, id DESC', []);
    return success(res, rows.map(mapProduct));
  } catch {
    return success(res, fallbackProducts.map(mapProduct));
  }
}

export async function listPublicProducts(req, res) {
  try {
    const rows = await query('SELECT * FROM products WHERE status = ? ORDER BY sort_order DESC, id DESC', ['active']);
    return success(res, rows.map(mapProduct));
  } catch {
    return success(res, publicProducts().map(mapProduct));
  }
}

export async function listHotProducts(req, res) {
  try {
    const rows = await query('SELECT * FROM products WHERE status = ? AND is_hot = 1 ORDER BY sort_order DESC, id DESC LIMIT 8', ['active']);
    return success(res, rows.map(mapProduct));
  } catch {
    return success(res, publicProducts().filter((item) => item.isHot).slice(0, 8).map(mapProduct));
  }
}

export async function getProductDetail(req, res) {
  const id = Number(req.params.id);

  try {
    const row = await queryOne('SELECT * FROM products WHERE id = ? AND status = ?', [id, 'active']);
    if (!row) {
      return failure(res, ERROR_CODES.NOT_FOUND, '产品暂不可查看', 404);
    }
    return success(res, mapProduct(row));
  } catch {
    const item = fallbackProducts.find((product) => product.id === id && product.status === 'active');
    if (!item) {
      return failure(res, ERROR_CODES.NOT_FOUND, '产品暂不可查看', 404);
    }
    return success(res, mapProduct(item));
  }
}

export async function createProduct(req, res) {
  const payload = buildPayload(req.body);

  try {
    const row = await insertAndFetch('products', payload);
    return success(res, mapProduct(row));
  } catch {
    const item = payloadToFallbackProduct(Date.now(), payload);
    fallbackProducts.unshift(item);
    return success(res, item);
  }
}

export async function updateProduct(req, res) {
  const id = Number(req.params.id);
  const payload = buildPayload(req.body);

  try {
    await query(
      'UPDATE products SET name = ?, type = ?, price_min = ?, price_max = ?, duration_days = ?, description = ?, is_hot = ?, sort_order = ?, status = ?, cover_url = ?, video_url = ?, gallery_urls = ?, highlights = ?, scenarios = ?, deliverables = ?, faqs = ?, share_script = ?, detail_content = ? WHERE id = ?',
      [
        payload.name,
        payload.type,
        payload.price_min,
        payload.price_max,
        payload.duration_days,
        payload.description,
        payload.is_hot,
        payload.sort_order,
        payload.status,
        payload.cover_url,
        payload.video_url,
        payload.gallery_urls,
        payload.highlights,
        payload.scenarios,
        payload.deliverables,
        payload.faqs,
        payload.share_script,
        payload.detail_content,
        id
      ]
    );
    const row = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    return success(res, mapProduct(row));
  } catch {
    const updated = payloadToFallbackProduct(id, payload);
    const index = fallbackProducts.findIndex((item) => item.id === id);
    if (index >= 0) fallbackProducts[index] = updated;
    else fallbackProducts.unshift(updated);
    return success(res, updated);
  }
}

export async function deleteProduct(req, res) {
  const id = Number(req.params.id);
  try {
    await query('DELETE FROM products WHERE id = ?', [id]);
  } catch {
    const index = fallbackProducts.findIndex((item) => item.id === id);
    if (index >= 0) fallbackProducts.splice(index, 1);
  }
  return success(res, { id, deleted: true });
}

export default {
  listProducts,
  listPublicProducts,
  listHotProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct
};
```

- [ ] **Step 5: Replace `backend/src/routes/productRoutes.js`**

Use this complete file content:

```js
import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import {
  createProduct,
  deleteProduct,
  getProductDetail,
  listHotProducts,
  listProducts,
  listPublicProducts,
  updateProduct
} from '../controllers/productController.js';

const publicRouter = Router();
publicRouter.get('/products', asyncHandler(listPublicProducts));
publicRouter.get('/products/hot', asyncHandler(listHotProducts));
publicRouter.get('/products/:id', asyncHandler(getProductDetail));

const adminRouter = Router();
adminRouter.get('/products', asyncHandler(listProducts));
adminRouter.post('/products', asyncHandler(createProduct));
adminRouter.put('/products/:id', asyncHandler(updateProduct));
adminRouter.delete('/products/:id', asyncHandler(deleteProduct));

export const productPublicRoutes = publicRouter;
export const productAdminRoutes = adminRouter;
export default adminRouter;
```

- [ ] **Step 6: Replace `backend/src/routes/appRoutes.js`**

Use this complete file content:

```js
import { Router } from 'express';
import { asyncHandler } from '../utils/response.js';
import {
  getHomeSummaryController,
  getLatestTutorials,
  getRecentUsage
} from '../controllers/appController.js';

const router = Router();

router.get('/app/home/summary', asyncHandler(getHomeSummaryController));
router.get('/tutorials/latest', asyncHandler(getLatestTutorials));
router.get('/usage/recent', asyncHandler(getRecentUsage));

export default router;
```

- [ ] **Step 7: Update `backend/src/routes/index.js` product route mounting**

Replace the existing product route import:

```js
import adminProductRoutes from './productRoutes.js';
```

with:

```js
import { productAdminRoutes, productPublicRoutes } from './productRoutes.js';
```

Then add the public product router immediately after `router.use(appRoutes);`:

```js
router.use(appRoutes);
router.use(productPublicRoutes);
```

Then replace the existing admin product router mount:

```js
adminRouter.use(adminProductRoutes);
```

with:

```js
adminRouter.use(productAdminRoutes);
```

The relevant middle of `backend/src/routes/index.js` should read:

```js
router.use('/auth', authRoutes);
router.use(appRoutes);
router.use(productPublicRoutes);
router.use(aiRoutes);
router.use(knowledgePublicRoutes);
router.use(scriptPublicRoutes);
router.use(toolRoutes);
router.use(searchRoutes);
router.use(historyRoutes);
router.use('/admin', adminRouter);
```

- [ ] **Step 8: Run backend tests to verify the product APIs pass**

Run:

```bash
npm --prefix backend test
```

Expected: PASS. The output should include the new product showcase tests and the existing auth, health, dashboard, knowledge, quote, and plan tests.

- [ ] **Step 9: Commit backend changes**

Run:

```bash
git add database.sql backend/src/controllers/productController.js backend/src/routes/productRoutes.js backend/src/routes/appRoutes.js backend/src/routes/index.js backend/test/appRoutes.test.js
git commit -m "feat: add product showcase backend APIs

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Admin Product Showcase Editor

**Files:**
- Modify: `admin/src/views/Products.vue`

**Interfaces:**
- Consumes: `productsApi.list()`, `productsApi.create(payload)`, `productsApi.update(id, payload)`, `productsApi.remove(id)` from `admin/src/api/modules.js`.
- Consumes: backend product payload fields from Task 1.
- Produces: admin payload with `coverUrl`, `videoUrl`, `galleryUrls`, `highlights`, `scenarios`, `deliverables`, `faqs`, `shareScript`, and `detailContent`.

- [ ] **Step 1: Run a static check that fails before the editor exists**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const source = fs.readFileSync('admin/src/views/Products.vue', 'utf8');
for (const text of ['产品展示库', '封面图 URL', '客户话术', '常见问题', 'copyShareScript']) {
  if (!source.includes(text)) throw new Error(`Missing admin showcase editor marker: ${text}`);
}
console.log('admin product showcase editor markers ready');
NODE
```

Expected: FAIL with `Missing admin showcase editor marker`.

- [ ] **Step 2: Replace `admin/src/views/Products.vue`**

Use this complete file content:

```vue
<template>
  <section class="page-card">
    <div class="page-header">
      <div>
        <h2>产品展示库</h2>
        <p>维护小程序产品详情、图文视频外链和可复制客户话术。</p>
      </div>
      <el-button type="primary" @click="openCreate">新增产品</el-button>
    </div>

    <el-table v-loading="loading" :data="items" empty-text="暂无产品">
      <el-table-column label="封面" width="92">
        <template #default="{ row }">
          <img v-if="row.coverUrl" class="product-cover" :src="row.coverUrl" alt="产品封面" />
          <div v-else class="cover-placeholder">产品</div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="type" label="类型" width="130" />
      <el-table-column label="价格区间" width="160">
        <template #default="{ row }">￥{{ row.priceMin }} - ￥{{ row.priceMax }}</template>
      </el-table-column>
      <el-table-column prop="durationDays" label="周期/天" width="90" />
      <el-table-column prop="isHot" label="热卖" width="90">
        <template #default="{ row }">
          <el-tag :type="row.isHot ? 'success' : 'info'">{{ row.isHot ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column label="操作" width="230" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="success" @click="copyShareScript(row)">复制话术</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑产品' : '新增产品'" width="920px" destroy-on-close>
      <el-form label-position="top">
        <el-tabs>
          <el-tab-pane label="基础信息">
            <div class="form-grid">
              <el-form-item label="产品名称"><el-input v-model="form.name" /></el-form-item>
              <el-form-item label="类型"><el-input v-model="form.type" /></el-form-item>
              <el-form-item label="最低价"><el-input-number v-model="form.priceMin" :min="0" style="width:100%" /></el-form-item>
              <el-form-item label="最高价"><el-input-number v-model="form.priceMax" :min="0" style="width:100%" /></el-form-item>
              <el-form-item label="开发周期/天"><el-input-number v-model="form.durationDays" :min="0" style="width:100%" /></el-form-item>
              <el-form-item label="排序"><el-input-number v-model="form.sortOrder" style="width:100%" /></el-form-item>
              <el-form-item label="状态"><el-select v-model="form.status"><el-option label="active" value="active" /><el-option label="disabled" value="disabled" /></el-select></el-form-item>
              <el-form-item label="是否热卖"><el-switch v-model="form.isHot" /></el-form-item>
              <el-form-item class="wide" label="推荐描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
            </div>
          </el-tab-pane>

          <el-tab-pane label="展示素材">
            <div class="form-grid">
              <el-form-item class="wide" label="封面图 URL"><el-input v-model="form.coverUrl" placeholder="https://..." /></el-form-item>
              <el-form-item class="wide" label="视频 URL"><el-input v-model="form.videoUrl" placeholder="https://..." /></el-form-item>
              <el-form-item class="wide" label="详情图 URL 列表（一行一个）"><el-input v-model="form.galleryText" type="textarea" :rows="5" placeholder="https://example.com/detail-1.jpg" /></el-form-item>
            </div>
          </el-tab-pane>

          <el-tab-pane label="产品内容">
            <div class="form-grid">
              <el-form-item class="wide" label="详情说明"><el-input v-model="form.detailContent" type="textarea" :rows="4" /></el-form-item>
              <el-form-item class="wide" label="核心卖点（一行一个）"><el-input v-model="form.highlightsText" type="textarea" :rows="4" placeholder="响应式设计" /></el-form-item>
              <el-form-item class="wide" label="适用场景（一行一个）"><el-input v-model="form.scenariosText" type="textarea" :rows="4" placeholder="企业展示" /></el-form-item>
              <el-form-item class="wide" label="交付内容（一行一个）"><el-input v-model="form.deliverablesText" type="textarea" :rows="4" placeholder="首页设计" /></el-form-item>
            </div>
          </el-tab-pane>

          <el-tab-pane label="客户调取">
            <el-form-item label="客户话术"><el-input v-model="form.shareScript" type="textarea" :rows="7" placeholder="不填写时后端会自动生成一段可复制话术" /></el-form-item>
            <el-alert title="建议话术保持适合平台内沟通，不写微信、手机号、站外链接等信息。" type="info" show-icon :closable="false" />
          </el-tab-pane>

          <el-tab-pane label="常见问题">
            <div class="faq-list">
              <div v-for="(faq, index) in form.faqs" :key="index" class="faq-editor-item">
                <el-form-item :label="`问题 ${index + 1}`"><el-input v-model="faq.question" /></el-form-item>
                <el-form-item label="回答"><el-input v-model="faq.answer" type="textarea" :rows="3" /></el-form-item>
                <el-button type="danger" plain @click="removeFaq(index)">删除这条</el-button>
              </div>
            </div>
            <el-button type="primary" plain @click="addFaq">新增常见问题</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存产品</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { productsApi } from '../api/modules.js';

const items = ref([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);

function blankFaq() {
  return { question: '', answer: '' };
}

const blank = () => ({
  id: null,
  name: '',
  type: 'website',
  priceMin: 0,
  priceMax: 0,
  durationDays: 7,
  description: '',
  isHot: true,
  sortOrder: 0,
  status: 'active',
  coverUrl: '',
  videoUrl: '',
  galleryText: '',
  highlightsText: '',
  scenariosText: '',
  deliverablesText: '',
  detailContent: '',
  shareScript: '',
  faqs: [blankFaq()]
});

const form = reactive(blank());

function arrayToLines(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function linesToArray(value) {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeFaqs(value) {
  const faqs = Array.isArray(value)
    ? value
      .map((item) => ({ question: String(item?.question || '').trim(), answer: String(item?.answer || '').trim() }))
      .filter((item) => item.question || item.answer)
    : [];
  return faqs.length ? faqs : [blankFaq()];
}

function assignForm(data = {}) {
  Object.assign(form, blank(), data, {
    galleryText: arrayToLines(data.galleryUrls),
    highlightsText: arrayToLines(data.highlights),
    scenariosText: arrayToLines(data.scenarios),
    deliverablesText: arrayToLines(data.deliverables),
    faqs: normalizeFaqs(data.faqs)
  });
}

function buildPayload() {
  return {
    id: form.id,
    name: form.name,
    type: form.type,
    priceMin: form.priceMin,
    priceMax: form.priceMax,
    durationDays: form.durationDays,
    description: form.description,
    isHot: form.isHot,
    sortOrder: form.sortOrder,
    status: form.status,
    coverUrl: form.coverUrl,
    videoUrl: form.videoUrl,
    galleryUrls: linesToArray(form.galleryText),
    highlights: linesToArray(form.highlightsText),
    scenarios: linesToArray(form.scenariosText),
    deliverables: linesToArray(form.deliverablesText),
    faqs: normalizeFaqs(form.faqs).filter((item) => item.question || item.answer),
    shareScript: form.shareScript,
    detailContent: form.detailContent
  };
}

function buildDefaultShareText(row) {
  const priceText = row.priceMin || row.priceMax ? `价格一般在 ￥${row.priceMin}-￥${row.priceMax}` : '价格需要根据具体需求评估';
  const durationText = row.durationDays ? `周期约 ${row.durationDays} 天` : '周期会根据需求评估';
  return `${row.name}可以做。${row.description || ''}\n${priceText}，${durationText}。\n你可以继续在平台里补充行业、页面数量和功能要求，我这边帮你细化方案和报价。`;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'readonly');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

async function load() {
  loading.value = true;
  try {
    items.value = await productsApi.list();
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  assignForm(blank());
  dialogVisible.value = true;
}

function openEdit(row) {
  assignForm(row);
  dialogVisible.value = true;
}

function addFaq() {
  form.faqs.push(blankFaq());
}

function removeFaq(index) {
  if (form.faqs.length === 1) {
    form.faqs.splice(0, 1, blankFaq());
    return;
  }
  form.faqs.splice(index, 1);
}

async function copyShareScript(row) {
  try {
    await copyText(row.shareScript || buildDefaultShareText(row));
    ElMessage.success('话术已复制');
  } catch (error) {
    ElMessage.error('复制失败，请手动选择内容');
  }
}

async function save() {
  const payload = buildPayload();
  if (!payload.name.trim()) {
    ElMessage.warning('请输入产品名称');
    return;
  }

  saving.value = true;
  try {
    if (payload.id) await productsApi.update(payload.id, payload);
    else await productsApi.create(payload);
    ElMessage.success('产品已保存');
    dialogVisible.value = false;
    await load();
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    saving.value = false;
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`删除「${row.name}」？`, '删除确认', { type: 'warning' });
  try {
    await productsApi.remove(row.id);
    ElMessage.success('产品已删除');
    await load();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

onMounted(load);
</script>

<style scoped>
.product-cover,
.cover-placeholder {
  width: 58px;
  height: 42px;
  border-radius: 12px;
}

.product-cover {
  display: block;
  object-fit: cover;
  border: 1px solid rgba(22, 119, 255, .14);
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1677FF;
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(22,119,255,.10), rgba(108,99,255,.12));
}

.faq-list {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
}

.faq-editor-item {
  padding: 16px;
  border: 1px solid rgba(22,119,255,.12);
  border-radius: 16px;
  background: rgba(247,250,255,.86);
}
</style>
```

- [ ] **Step 3: Run the admin editor static check again**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const source = fs.readFileSync('admin/src/views/Products.vue', 'utf8');
for (const text of ['产品展示库', '封面图 URL', '客户话术', '常见问题', 'copyShareScript']) {
  if (!source.includes(text)) throw new Error(`Missing admin showcase editor marker: ${text}`);
}
console.log('admin product showcase editor markers ready');
NODE
```

Expected:

```text
admin product showcase editor markers ready
```

- [ ] **Step 4: Build the admin app**

Run:

```bash
npm --prefix admin run build
```

Expected: PASS. Vite should finish without Vue template or script errors.

- [ ] **Step 5: Commit admin editor changes**

Run:

```bash
git add admin/src/views/Products.vue
git commit -m "feat: add admin product showcase editor

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Mini Program Product List and Detail Pages

**Files:**
- Modify: `miniprogram/app.json`
- Create: `miniprogram/pages/products/products.js`
- Create: `miniprogram/pages/products/products.wxml`
- Create: `miniprogram/pages/products/products.wxss`
- Create: `miniprogram/pages/products/products.json`
- Create: `miniprogram/pages/product-detail/product-detail.js`
- Create: `miniprogram/pages/product-detail/product-detail.wxml`
- Create: `miniprogram/pages/product-detail/product-detail.wxss`
- Create: `miniprogram/pages/product-detail/product-detail.json`

**Interfaces:**
- Consumes: `get(url, data)` from `miniprogram/utils/request.js`.
- Consumes: `getApp().getTopSpacerHeight()` from `miniprogram/app.js`.
- Consumes: `GET /api/products` and `GET /api/products/:id` from Task 1.
- Produces: navigable mini program routes `/pages/products/products` and `/pages/product-detail/product-detail?id=<id>`.

- [ ] **Step 1: Run a static check that fails before mini program pages exist**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const required = [
  'miniprogram/pages/products/products.js',
  'miniprogram/pages/products/products.wxml',
  'miniprogram/pages/products/products.wxss',
  'miniprogram/pages/products/products.json',
  'miniprogram/pages/product-detail/product-detail.js',
  'miniprogram/pages/product-detail/product-detail.wxml',
  'miniprogram/pages/product-detail/product-detail.wxss',
  'miniprogram/pages/product-detail/product-detail.json'
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing mini program product page file: ${file}`);
}
const app = JSON.parse(fs.readFileSync('miniprogram/app.json', 'utf8'));
for (const page of ['pages/products/products', 'pages/product-detail/product-detail']) {
  if (!app.pages.includes(page)) throw new Error(`Missing app.json page: ${page}`);
}
console.log('mini program product pages registered');
NODE
```

Expected: FAIL with `Missing mini program product page file`.

- [ ] **Step 2: Register product pages in `miniprogram/app.json`**

In the `pages` array, add the new pages after `pages/ai-chat/ai-chat`. The full `pages` array should be:

```json
"pages": [
  "pages/home/home",
  "pages/assistant/assistant",
  "pages/toolbox/toolbox",
  "pages/search/search",
  "pages/mine/mine",
  "pages/article-detail/article-detail",
  "pages/quote/quote",
  "pages/plan/plan",
  "pages/ai-chat/ai-chat",
  "pages/products/products",
  "pages/product-detail/product-detail"
]
```

- [ ] **Step 3: Create `miniprogram/pages/products/products.js`**

Use this complete file content:

```js
const { get } = require('../../utils/request');
const app = getApp();

function formatPrice(item) {
  const min = Number(item.priceMin || 0);
  const max = Number(item.priceMax || 0);
  if (!min && !max) return '按需求评估';
  return `￥${min}-${max}`;
}

function formatDuration(item) {
  const days = Number(item.durationDays || 0);
  return days ? `${days}天左右` : '周期面议';
}

function normalizeProduct(item) {
  return {
    ...item,
    priceText: formatPrice(item),
    durationText: formatDuration(item),
    highlights: Array.isArray(item.highlights) ? item.highlights.slice(0, 3) : []
  };
}

Page({
  data: {
    topSpacerHeight: 132,
    loading: false,
    error: '',
    products: []
  },

  onLoad() {
    this.setData({ topSpacerHeight: app.getTopSpacerHeight() });
    this.loadProducts();
  },

  onPullDownRefresh() {
    this.loadProducts().finally(() => wx.stopPullDownRefresh());
  },

  async loadProducts() {
    this.setData({ loading: true, error: '' });
    try {
      const products = await get('/products');
      this.setData({ products: (products || []).map(normalizeProduct) });
    } catch (error) {
      this.setData({ error: error.message || '产品加载失败' });
    } finally {
      this.setData({ loading: false });
    }
  },

  retry() {
    this.loadProducts();
  },

  goDetail(event) {
    const id = event.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  }
});
```

- [ ] **Step 4: Create `miniprogram/pages/products/products.wxml`**

Use this complete file content:

```xml
<view class="safe-page container products-page">
  <view class="page-safe-top" style="height: {{topSpacerHeight}}rpx;"></view>

  <view class="showcase-hero primary-gradient">
    <view class="hero-pill title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/product.png" mode="aspectFit" /><text>产品展示库</text></view>
    <view class="hero-title">常用建站服务，随时发给客户看</view>
    <view class="hero-sub">图文视频、交付内容和常见问题统一维护</view>
  </view>

  <view wx:if="{{loading}}" class="card loading-card row-with-icon">
    <image class="ui-icon ui-icon-sm" src="/assets/icons/ui/clock.png" mode="aspectFit" />
    <text>正在加载产品...</text>
  </view>

  <view wx:elif="{{error}}" class="card error-card">
    <view class="row-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/warning.png" mode="aspectFit" /><text>{{error}}</text></view>
    <button class="btn-primary retry-button" bindtap="retry">重新加载</button>
  </view>

  <view wx:elif="{{products.length === 0}}" class="empty-state title-with-icon">
    <image class="ui-icon ui-icon-sm" src="/assets/icons/ui/empty.png" mode="aspectFit" />
    <text>暂无产品展示</text>
  </view>

  <view wx:else class="product-list">
    <view wx:for="{{products}}" wx:key="id" class="product-card card" bindtap="goDetail" data-id="{{item.id}}">
      <image wx:if="{{item.coverUrl}}" class="product-cover" src="{{item.coverUrl}}" mode="aspectFill" />
      <view wx:else class="product-cover fallback-cover"><image class="ui-icon ui-icon-lg" src="/assets/icons/ui/product.png" mode="aspectFit" /></view>
      <view class="product-body">
        <view class="product-title-row">
          <view class="product-title">{{item.name}}</view>
          <view wx:if="{{item.isHot}}" class="hot-tag">热卖</view>
        </view>
        <view class="product-desc">{{item.description}}</view>
        <view wx:if="{{item.highlights.length}}" class="highlight-row">
          <view wx:for="{{item.highlights}}" wx:key="*this" class="highlight-chip">{{item}}</view>
        </view>
        <view class="product-meta">
          <view class="meta-chip title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/price.png" mode="aspectFit" /><text>{{item.priceText}}</text></view>
          <view class="meta-chip title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/clock.png" mode="aspectFit" /><text>{{item.durationText}}</text></view>
        </view>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 5: Create `miniprogram/pages/products/products.wxss`**

Use this complete file content:

```css
.products-page { padding-bottom: calc(72rpx + env(safe-area-inset-bottom)); }
.showcase-hero { position: relative; overflow: hidden; padding: 34rpx; border-radius: 38rpx; box-shadow: 0 24rpx 60rpx rgba(42,91,219,.20); }
.hero-pill { display: inline-flex; padding: 8rpx 18rpx; border-radius: 999rpx; background: rgba(255,255,255,.20); color: rgba(255,255,255,.95); font-size: 24rpx; font-weight: 700; }
.hero-title { margin-top: 24rpx; color: #fff; font-size: 42rpx; line-height: 1.18; font-weight: 900; letter-spacing: -1rpx; }
.hero-sub { margin-top: 16rpx; color: rgba(255,255,255,.82); font-size: 25rpx; line-height: 1.45; }
.loading-card, .error-card { margin-top: 24rpx; }
.retry-button { margin-top: 24rpx; }
.product-list { display: grid; gap: 20rpx; margin-top: 24rpx; }
.product-card { display: flex; gap: 22rpx; padding: 22rpx; }
.product-cover { flex-shrink: 0; width: 168rpx; height: 168rpx; border-radius: 28rpx; background: linear-gradient(135deg, rgba(22,119,255,.14), rgba(108,99,255,.16)); }
.fallback-cover { display: flex; align-items: center; justify-content: center; }
.product-body { flex: 1; min-width: 0; }
.product-title-row { display: flex; align-items: center; gap: 12rpx; }
.product-title { flex: 1; min-width: 0; color: #172033; font-size: 31rpx; line-height: 1.32; font-weight: 900; }
.hot-tag { flex-shrink: 0; padding: 6rpx 12rpx; border-radius: 999rpx; background: rgba(255,107,0,.10); color: #FF6B00; font-size: 21rpx; font-weight: 800; }
.product-desc { margin-top: 10rpx; color: #667085; font-size: 24rpx; line-height: 1.45; display: -webkit-box; overflow: hidden; text-overflow: ellipsis; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.highlight-row { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 14rpx; }
.highlight-chip { padding: 6rpx 12rpx; border-radius: 999rpx; background: rgba(22,119,255,.08); color: #1677FF; font-size: 21rpx; font-weight: 700; }
.product-meta { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 16rpx; }
.meta-chip { padding: 8rpx 12rpx; border-radius: 999rpx; background: rgba(23,32,51,.05); color: #344054; font-size: 22rpx; font-weight: 700; }
.meta-chip .ui-icon { width: 22rpx; height: 22rpx; }
```

- [ ] **Step 6: Create `miniprogram/pages/products/products.json`**

Use this complete file content:

```json
{
  "navigationBarTitleText": "产品展示"
}
```

- [ ] **Step 7: Create `miniprogram/pages/product-detail/product-detail.js`**

Use this complete file content:

```js
const { get } = require('../../utils/request');
const app = getApp();

function textArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function faqArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && (item.question || item.answer))
    : [];
}

function formatPrice(item) {
  const min = Number(item.priceMin || 0);
  const max = Number(item.priceMax || 0);
  if (!min && !max) return '按需求评估';
  return `￥${min}-${max}`;
}

function formatDuration(item) {
  const days = Number(item.durationDays || 0);
  return days ? `${days} 天左右` : '周期面议';
}

function buildSummary(product) {
  const highlights = product.highlights.length ? `\n亮点：${product.highlights.slice(0, 3).join('、')}` : '';
  return `${product.name}\n价格：${product.priceText}\n周期：${product.durationText}${highlights}\n${product.description || ''}`;
}

function normalizeProduct(item) {
  const product = {
    ...item,
    galleryUrls: textArray(item.galleryUrls),
    highlights: textArray(item.highlights),
    scenarios: textArray(item.scenarios),
    deliverables: textArray(item.deliverables),
    faqs: faqArray(item.faqs),
    priceText: formatPrice(item),
    durationText: formatDuration(item)
  };
  product.summaryText = buildSummary(product);
  return product;
}

Page({
  data: {
    topSpacerHeight: 132,
    id: null,
    loading: false,
    error: '',
    product: null,
    coverLoadFailed: false
  },

  onLoad(options) {
    const id = Number(options.id || 0);
    this.setData({ topSpacerHeight: app.getTopSpacerHeight(), id });
    if (!id) {
      this.setData({ error: '产品暂不可查看' });
      return;
    }
    this.loadProduct();
  },

  async loadProduct() {
    this.setData({ loading: true, error: '' });
    try {
      const product = normalizeProduct(await get(`/products/${this.data.id}`));
      this.setData({ product, coverLoadFailed: false });
      if (wx.setNavigationBarTitle) wx.setNavigationBarTitle({ title: product.name });
    } catch (error) {
      this.setData({ error: error.message || '产品暂不可查看' });
    } finally {
      this.setData({ loading: false });
    }
  },

  retry() {
    this.loadProduct();
  },

  goBack() {
    if (getCurrentPages().length > 1) wx.navigateBack();
    else wx.switchTab({ url: '/pages/home/home' });
  },

  onCoverError() {
    this.setData({ coverLoadFailed: true });
  },

  previewImage(event) {
    const current = event.currentTarget.dataset.url;
    const urls = this.data.product?.galleryUrls || [];
    if (!current || !urls.length) return;
    wx.previewImage({ current, urls });
  },

  copyShareScript() {
    const product = this.data.product;
    if (!product) return;
    wx.setClipboardData({
      data: product.shareScript || product.summaryText,
      success() {
        wx.showToast({ title: '已复制，可直接发给客户', icon: 'none' });
      },
      fail() {
        wx.showToast({ title: '复制失败，请手动选择内容', icon: 'none' });
      }
    });
  },

  copySummary() {
    const product = this.data.product;
    if (!product) return;
    wx.setClipboardData({
      data: product.summaryText,
      success() {
        wx.showToast({ title: '摘要已复制', icon: 'none' });
      },
      fail() {
        wx.showToast({ title: '复制失败，请手动选择内容', icon: 'none' });
      }
    });
  },

  onShareAppMessage() {
    const product = this.data.product;
    if (!product) {
      return {
        title: 'AI小福产品展示',
        path: '/pages/products/products'
      };
    }

    return {
      title: product.name,
      path: `/pages/product-detail/product-detail?id=${product.id}`,
      imageUrl: product.coverUrl || undefined
    };
  }
});
```

- [ ] **Step 8: Create `miniprogram/pages/product-detail/product-detail.wxml`**

Use this complete file content:

```xml
<view class="safe-page container product-detail-page">
  <view class="page-safe-top" style="height: {{topSpacerHeight}}rpx;"></view>

  <view wx:if="{{loading}}" class="card loading-card row-with-icon">
    <image class="ui-icon ui-icon-sm" src="/assets/icons/ui/clock.png" mode="aspectFit" />
    <text>正在加载产品详情...</text>
  </view>

  <view wx:elif="{{error}}" class="card error-card">
    <view class="row-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/warning.png" mode="aspectFit" /><text>{{error}}</text></view>
    <view class="error-actions">
      <button class="btn-primary small-button" bindtap="retry">重新加载</button>
      <button class="ghost-button small-button" bindtap="goBack">返回</button>
    </view>
  </view>

  <block wx:elif="{{product}}">
    <view class="detail-hero">
      <image wx:if="{{product.coverUrl && !coverLoadFailed}}" class="detail-cover" src="{{product.coverUrl}}" mode="aspectFill" binderror="onCoverError" />
      <view wx:else class="detail-cover cover-fallback primary-gradient">
        <image class="ui-icon ui-icon-lg" src="/assets/icons/ui/product.png" mode="aspectFit" />
        <text>{{product.name}}</text>
      </view>
    </view>

    <view class="card intro-card">
      <view class="pill title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/product.png" mode="aspectFit" /><text>产品详情</text></view>
      <view class="detail-title">{{product.name}}</view>
      <view class="detail-desc">{{product.description}}</view>
      <view class="meta-row">
        <view class="meta-chip title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/price.png" mode="aspectFit" /><text>{{product.priceText}}</text></view>
        <view class="meta-chip title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/clock.png" mode="aspectFit" /><text>{{product.durationText}}</text></view>
      </view>
      <view wx:if="{{product.detailContent}}" class="detail-content">{{product.detailContent}}</view>
    </view>

    <view wx:if="{{product.videoUrl}}" class="card section-card">
      <view class="section-title title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/play.png" mode="aspectFit" /><text>视频展示</text></view>
      <video class="product-video" src="{{product.videoUrl}}" controls></video>
    </view>

    <view wx:if="{{product.highlights.length}}" class="card section-card">
      <view class="section-title title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/star.png" mode="aspectFit" /><text>核心卖点</text></view>
      <view class="chip-grid">
        <view wx:for="{{product.highlights}}" wx:key="*this" class="feature-chip row-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/check.png" mode="aspectFit" /><text>{{item}}</text></view>
      </view>
    </view>

    <view wx:if="{{product.scenarios.length}}" class="card section-card">
      <view class="section-title title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/customer-service.png" mode="aspectFit" /><text>适用场景</text></view>
      <view wx:for="{{product.scenarios}}" wx:key="*this" class="list-row row-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/check.png" mode="aspectFit" /><text>{{item}}</text></view>
    </view>

    <view wx:if="{{product.deliverables.length}}" class="card section-card">
      <view class="section-title title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/document.png" mode="aspectFit" /><text>交付内容</text></view>
      <view wx:for="{{product.deliverables}}" wx:key="*this" class="list-row row-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/check.png" mode="aspectFit" /><text>{{item}}</text></view>
    </view>

    <view wx:if="{{product.galleryUrls.length}}" class="card section-card">
      <view class="section-title title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/article.png" mode="aspectFit" /><text>详情图</text></view>
      <image wx:for="{{product.galleryUrls}}" wx:key="*this" class="gallery-image" src="{{item}}" data-url="{{item}}" mode="widthFix" bindtap="previewImage" />
    </view>

    <view wx:if="{{product.faqs.length}}" class="card section-card faq-card">
      <view class="section-title title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/message.png" mode="aspectFit" /><text>常见问题</text></view>
      <view wx:for="{{product.faqs}}" wx:key="question" class="faq-item">
        <view class="faq-question">Q：{{item.question}}</view>
        <view class="faq-answer">A：{{item.answer}}</view>
      </view>
    </view>

    <view class="detail-actions">
      <button class="action-button ghost-action" bindtap="copySummary">复制摘要</button>
      <button class="action-button primary-action" bindtap="copyShareScript">复制话术</button>
      <button class="action-button ghost-action" open-type="share">转发</button>
    </view>
  </block>
</view>
```

- [ ] **Step 9: Create `miniprogram/pages/product-detail/product-detail.wxss`**

Use this complete file content:

```css
.product-detail-page { padding-bottom: calc(150rpx + env(safe-area-inset-bottom)); }
.loading-card, .error-card { margin-top: 24rpx; }
.error-actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.small-button { flex: 1; }
.ghost-button { border: 1rpx solid rgba(22,119,255,.18); border-radius: 18rpx; background: #fff; color: #1677FF; font-weight: 800; }
.detail-hero { overflow: hidden; border-radius: 38rpx; box-shadow: 0 22rpx 58rpx rgba(42,91,219,.18); }
.detail-cover { display: block; width: 100%; height: 360rpx; }
.cover-fallback { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18rpx; color: #fff; font-size: 38rpx; font-weight: 900; }
.intro-card { margin-top: 22rpx; }
.detail-title { margin-top: 20rpx; color: #172033; font-size: 44rpx; line-height: 1.18; font-weight: 900; letter-spacing: -1rpx; }
.detail-desc { margin-top: 14rpx; color: #667085; font-size: 27rpx; line-height: 1.55; }
.meta-row { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 22rpx; }
.meta-chip { padding: 10rpx 16rpx; border-radius: 999rpx; background: rgba(22,119,255,.09); color: #1677FF; font-size: 24rpx; font-weight: 800; }
.detail-content { margin-top: 24rpx; padding: 22rpx; border-radius: 22rpx; background: rgba(22,119,255,.06); color: #344054; font-size: 26rpx; line-height: 1.65; }
.section-card { margin-top: 22rpx; }
.product-video { width: 100%; margin-top: 18rpx; border-radius: 22rpx; overflow: hidden; }
.chip-grid { display: grid; gap: 12rpx; }
.feature-chip { padding: 18rpx; border-radius: 20rpx; background: rgba(22,119,255,.07); color: #172033; font-size: 26rpx; font-weight: 700; }
.list-row { padding: 18rpx 0; border-bottom: 1rpx solid rgba(22,119,255,.10); color: #344054; font-size: 26rpx; line-height: 1.5; }
.list-row:last-child { border-bottom: 0; }
.gallery-image { display: block; width: 100%; margin-top: 16rpx; border-radius: 24rpx; background: rgba(22,119,255,.06); }
.faq-item { padding: 20rpx 0; border-bottom: 1rpx solid rgba(22,119,255,.10); }
.faq-item:last-child { border-bottom: 0; }
.faq-question { color: #172033; font-size: 27rpx; line-height: 1.45; font-weight: 800; }
.faq-answer { margin-top: 10rpx; color: #667085; font-size: 25rpx; line-height: 1.6; }
.detail-actions { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; display: flex; gap: 14rpx; padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom)); background: rgba(255,255,255,.94); box-shadow: 0 -12rpx 36rpx rgba(32,63,120,.10); box-sizing: border-box; }
.action-button { flex: 1; height: 78rpx; border-radius: 999rpx; font-size: 25rpx; font-weight: 900; }
.primary-action { border: 0; background: linear-gradient(135deg, #1677FF, #6C63FF); color: #fff; }
.ghost-action { border: 1rpx solid rgba(22,119,255,.18); background: #fff; color: #1677FF; }
```

- [ ] **Step 10: Create `miniprogram/pages/product-detail/product-detail.json`**

Use this complete file content:

```json
{
  "navigationBarTitleText": "产品详情"
}
```

- [ ] **Step 11: Run the mini program page static check again**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const required = [
  'miniprogram/pages/products/products.js',
  'miniprogram/pages/products/products.wxml',
  'miniprogram/pages/products/products.wxss',
  'miniprogram/pages/products/products.json',
  'miniprogram/pages/product-detail/product-detail.js',
  'miniprogram/pages/product-detail/product-detail.wxml',
  'miniprogram/pages/product-detail/product-detail.wxss',
  'miniprogram/pages/product-detail/product-detail.json'
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing mini program product page file: ${file}`);
}
const app = JSON.parse(fs.readFileSync('miniprogram/app.json', 'utf8'));
for (const page of ['pages/products/products', 'pages/product-detail/product-detail']) {
  if (!app.pages.includes(page)) throw new Error(`Missing app.json page: ${page}`);
}
const detailJs = fs.readFileSync('miniprogram/pages/product-detail/product-detail.js', 'utf8');
for (const marker of ['copyShareScript', 'copySummary', 'onShareAppMessage', '/products/${this.data.id}']) {
  if (!detailJs.includes(marker)) throw new Error(`Missing product detail marker: ${marker}`);
}
console.log('mini program product pages registered');
NODE
```

Expected:

```text
mini program product pages registered
```

- [ ] **Step 12: Commit mini program page changes**

Run:

```bash
git add miniprogram/app.json miniprogram/pages/products miniprogram/pages/product-detail
git commit -m "feat: add mini program product showcase pages

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Home Page Product Entry Integration

**Files:**
- Modify: `miniprogram/pages/home/home.js`
- Modify: `miniprogram/pages/home/home.wxml`

**Interfaces:**
- Consumes: `pages/products/products` and `pages/product-detail/product-detail` from Task 3.
- Consumes: `products` returned by `GET /api/products/hot` from Task 1.
- Produces: Home quick action navigates to product list; hot product cards navigate to detail.

- [ ] **Step 1: Run a static check that fails before home navigation is integrated**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const js = fs.readFileSync('miniprogram/pages/home/home.js', 'utf8');
const wxml = fs.readFileSync('miniprogram/pages/home/home.wxml', 'utf8');
for (const marker of ['goProductDetail', '/pages/products/products']) {
  if (!js.includes(marker)) throw new Error(`Missing home JS marker: ${marker}`);
}
for (const marker of ['bindtap="goProductDetail"', 'data-id="{{item.id}}"']) {
  if (!wxml.includes(marker)) throw new Error(`Missing home WXML marker: ${marker}`);
}
console.log('home product navigation ready');
NODE
```

Expected: FAIL with `Missing home JS marker`.

- [ ] **Step 2: Replace `miniprogram/pages/home/home.js`**

Use this complete file content:

```js
const { get } = require('../../utils/request');

Page({
  data: {
    topSpacerHeight: 132,
    summary: { stats: { todayUsage: 0, todayReplies: 0, todayDeals: 0 } },
    products: [],
    tutorials: [],
    recent: [],
    quickActions: [
      { key: 'ai', title: 'AI智能回复', desc: '生成平台内安全话术', iconPath: '/assets/icons/ui/ai.png' },
      { key: 'quote', title: '智能报价', desc: '估算价格和周期', iconPath: '/assets/icons/ui/quote.png' },
      { key: 'knowledge', title: '建站百科', desc: '查建站知识', iconPath: '/assets/icons/ui/knowledge.png' },
      { key: 'product', title: '热卖产品', desc: '查看主推服务', iconPath: '/assets/icons/ui/product.png' }
    ]
  },

  onLoad() {
    this.setLayoutMetrics();
    this.loadHome();
  },

  setLayoutMetrics() {
    try {
      const systemInfo = wx.getSystemInfoSync ? wx.getSystemInfoSync() : {};
      const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
      const statusBarHeight = systemInfo.statusBarHeight || 24;
      const safeTop = menuButton && menuButton.bottom ? menuButton.bottom : statusBarHeight + 44;
      const pxToRpx = 750 / (systemInfo.windowWidth || 375);
      const topSpacerHeight = Math.ceil(safeTop * pxToRpx + 24);

      this.setData({ topSpacerHeight });
    } catch (error) {
      this.setData({ topSpacerHeight: 132 });
    }
  },

  async loadHome() {
    try {
      const [summary, products, tutorials, recent] = await Promise.all([
        get('/app/home/summary'),
        get('/products/hot'),
        get('/tutorials/latest'),
        get('/usage/recent')
      ]);
      this.setData({ summary, products, tutorials, recent });
    } catch (error) {}
  },

  goSearch() { wx.switchTab({ url: '/pages/search/search' }); },

  goProductDetail(event) {
    const id = event.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` });
  },

  handleQuick(event) {
    const key = event.currentTarget.dataset.key;
    if (key === 'ai') wx.navigateTo({ url: '/pages/ai-chat/ai-chat' });
    if (key === 'quote') wx.navigateTo({ url: '/pages/quote/quote' });
    if (key === 'knowledge') wx.switchTab({ url: '/pages/assistant/assistant' });
    if (key === 'product') wx.navigateTo({ url: '/pages/products/products' });
  }
});
```

- [ ] **Step 3: Update the product card block in `miniprogram/pages/home/home.wxml`**

Replace the current one-line hot product card block:

```xml
<view wx:for="{{products}}" wx:key="id" class="list-card product-card"><view class="list-left-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/product.png" mode="aspectFit" /></view><view class="list-main"><view class="list-title">{{item.name}}</view><view class="list-desc">{{item.description}}</view></view><view class="price-chip title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/price.png" mode="aspectFit" /><text>￥{{item.priceMin}}-{{item.priceMax}}</text></view></view>
```

with this multi-line block:

```xml
<view wx:for="{{products}}" wx:key="id" class="list-card product-card" bindtap="goProductDetail" data-id="{{item.id}}">
  <view class="list-left-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/product.png" mode="aspectFit" /></view>
  <view class="list-main">
    <view class="list-title">{{item.name}}</view>
    <view class="list-desc">{{item.description}}</view>
  </view>
  <view class="price-chip title-with-icon"><image class="ui-icon ui-icon-sm" src="/assets/icons/ui/price.png" mode="aspectFit" /><text>￥{{item.priceMin}}-{{item.priceMax}}</text></view>
</view>
```

- [ ] **Step 4: Run the home integration static check again**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const js = fs.readFileSync('miniprogram/pages/home/home.js', 'utf8');
const wxml = fs.readFileSync('miniprogram/pages/home/home.wxml', 'utf8');
for (const marker of ['goProductDetail', '/pages/products/products']) {
  if (!js.includes(marker)) throw new Error(`Missing home JS marker: ${marker}`);
}
for (const marker of ['bindtap="goProductDetail"', 'data-id="{{item.id}}"']) {
  if (!wxml.includes(marker)) throw new Error(`Missing home WXML marker: ${marker}`);
}
console.log('home product navigation ready');
NODE
```

Expected:

```text
home product navigation ready
```

- [ ] **Step 5: Commit home integration changes**

Run:

```bash
git add miniprogram/pages/home/home.js miniprogram/pages/home/home.wxml
git commit -m "feat: link home products to showcase details

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: API and Deployment Documentation, Final Verification

**Files:**
- Modify: `docs/api.md`
- Modify: `docs/deployment.md`

**Interfaces:**
- Consumes: product endpoints and fields from Task 1.
- Produces: documented public/admin API fields and a production database migration for existing deployments.

- [ ] **Step 1: Run a documentation static check that fails before docs are updated**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const api = fs.readFileSync('docs/api.md', 'utf8');
const deploy = fs.readFileSync('docs/deployment.md', 'utf8');
for (const marker of ['GET /products', 'GET /products/:id', 'galleryUrls', 'shareScript']) {
  if (!api.includes(marker)) throw new Error(`Missing API doc marker: ${marker}`);
}
for (const marker of ['ALTER TABLE `products`', 'cover_url', 'share_script']) {
  if (!deploy.includes(marker)) throw new Error(`Missing deployment migration marker: ${marker}`);
}
console.log('product showcase docs ready');
NODE
```

Expected: FAIL with `Missing API doc marker` or `Missing deployment migration marker`.

- [ ] **Step 2: Update `docs/api.md` public product documentation**

In `docs/api.md`, find the existing `### GET /products/hot` section and replace it with this text:

```markdown
### GET /products

获取小程序产品展示列表。只返回 `status = active` 的产品，按排序值和 ID 倒序排列。

响应示例：

```json
[
  {
    "id": 1,
    "name": "企业官网",
    "type": "website",
    "priceMin": 3000,
    "priceMax": 8000,
    "durationDays": 10,
    "description": "适合企业展示、品牌介绍、新闻动态和表单咨询。",
    "isHot": true,
    "sortOrder": 10,
    "status": "active",
    "coverUrl": "https://example.com/company-cover.jpg",
    "videoUrl": "",
    "galleryUrls": [],
    "highlights": ["品牌首页设计", "移动端适配"],
    "scenarios": ["企业展示", "品牌背书"],
    "deliverables": ["首页设计", "产品服务页"],
    "faqs": [],
    "shareScript": "这个企业官网适合企业展示...",
    "detailContent": "企业官网适合需要品牌展示的客户。"
  }
]
```

### GET /products/hot

获取首页热卖产品列表。返回字段与 `GET /products` 一致，但只包含 `isHot = true` 的启用产品，最多 8 条。

### GET /products/:id

获取小程序产品详情。只允许查看 `status = active` 的产品；产品不存在或被禁用时返回 `40401`。

响应字段与 `GET /products` 的单个产品一致。
```

- [ ] **Step 3: Update `docs/api.md` admin product field documentation**

Find the admin product management section near `### 产品管理`. Replace its bullet list with this text:

```markdown
### 产品管理

- `GET /admin/products`：产品列表，返回完整产品展示字段。
- `POST /admin/products`：创建产品。
- `PUT /admin/products/:id`：更新产品。
- `DELETE /admin/products/:id`：删除产品。

后台产品请求体支持字段：

```json
{
  "name": "企业官网",
  "type": "website",
  "priceMin": 3000,
  "priceMax": 8000,
  "durationDays": 10,
  "description": "适合企业展示、品牌介绍、新闻动态和表单咨询。",
  "isHot": true,
  "sortOrder": 10,
  "status": "active",
  "coverUrl": "https://example.com/company-cover.jpg",
  "videoUrl": "https://example.com/company-video.mp4",
  "galleryUrls": ["https://example.com/company-detail-1.jpg"],
  "highlights": ["品牌首页设计", "移动端适配"],
  "scenarios": ["企业展示", "品牌背书"],
  "deliverables": ["首页设计", "产品服务页", "联系表单"],
  "faqs": [{ "question": "多久上线？", "answer": "资料齐全后通常 7-10 天。" }],
  "shareScript": "这个企业官网适合企业展示...",
  "detailContent": "企业官网适合需要品牌展示、服务介绍和线索收集的客户。"
}
```
```

- [ ] **Step 4: Add the existing-database migration to `docs/deployment.md`**

Add this section after the database initialization instructions:

```markdown
### 产品展示库字段迁移

如果服务器已经部署过旧版数据库，需要对现有 `products` 表执行一次字段迁移。新部署直接使用最新 `database.sql` 即可。

```sql
ALTER TABLE `products`
  ADD COLUMN `cover_url` VARCHAR(500) NULL AFTER `status`,
  ADD COLUMN `video_url` VARCHAR(500) NULL AFTER `cover_url`,
  ADD COLUMN `gallery_urls` MEDIUMTEXT NULL AFTER `video_url`,
  ADD COLUMN `highlights` MEDIUMTEXT NULL AFTER `gallery_urls`,
  ADD COLUMN `scenarios` MEDIUMTEXT NULL AFTER `highlights`,
  ADD COLUMN `deliverables` MEDIUMTEXT NULL AFTER `scenarios`,
  ADD COLUMN `faqs` MEDIUMTEXT NULL AFTER `deliverables`,
  ADD COLUMN `share_script` MEDIUMTEXT NULL AFTER `faqs`,
  ADD COLUMN `detail_content` MEDIUMTEXT NULL AFTER `share_script`;
```

字段说明：图片和视频只保存外链 URL；列表字段使用 JSON 字符串保存；旧产品字段为空时小程序会隐藏对应模块。
```

- [ ] **Step 5: Run documentation static check again**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const api = fs.readFileSync('docs/api.md', 'utf8');
const deploy = fs.readFileSync('docs/deployment.md', 'utf8');
for (const marker of ['GET /products', 'GET /products/:id', 'galleryUrls', 'shareScript']) {
  if (!api.includes(marker)) throw new Error(`Missing API doc marker: ${marker}`);
}
for (const marker of ['ALTER TABLE `products`', 'cover_url', 'share_script']) {
  if (!deploy.includes(marker)) throw new Error(`Missing deployment migration marker: ${marker}`);
}
console.log('product showcase docs ready');
NODE
```

Expected:

```text
product showcase docs ready
```

- [ ] **Step 6: Run full backend tests**

Run:

```bash
npm --prefix backend test
```

Expected: PASS.

- [ ] **Step 7: Run admin production build**

Run:

```bash
npm --prefix admin run build
```

Expected: PASS.

- [ ] **Step 8: Run mini program static verification**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const app = JSON.parse(fs.readFileSync('miniprogram/app.json', 'utf8'));
for (const page of ['pages/products/products', 'pages/product-detail/product-detail']) {
  if (!app.pages.includes(page)) throw new Error(`Missing app.json page: ${page}`);
}
const requiredFiles = [
  'miniprogram/pages/products/products.js',
  'miniprogram/pages/products/products.wxml',
  'miniprogram/pages/products/products.wxss',
  'miniprogram/pages/products/products.json',
  'miniprogram/pages/product-detail/product-detail.js',
  'miniprogram/pages/product-detail/product-detail.wxml',
  'miniprogram/pages/product-detail/product-detail.wxss',
  'miniprogram/pages/product-detail/product-detail.json'
];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing file: ${file}`);
}
const homeJs = fs.readFileSync('miniprogram/pages/home/home.js', 'utf8');
const homeWxml = fs.readFileSync('miniprogram/pages/home/home.wxml', 'utf8');
const detailJs = fs.readFileSync('miniprogram/pages/product-detail/product-detail.js', 'utf8');
for (const marker of ['goProductDetail', '/pages/products/products']) {
  if (!homeJs.includes(marker)) throw new Error(`Missing home marker: ${marker}`);
}
for (const marker of ['bindtap="goProductDetail"', 'data-id="{{item.id}}"']) {
  if (!homeWxml.includes(marker)) throw new Error(`Missing home WXML marker: ${marker}`);
}
for (const marker of ['copyShareScript', 'copySummary', 'onShareAppMessage']) {
  if (!detailJs.includes(marker)) throw new Error(`Missing detail marker: ${marker}`);
}
console.log('mini program product showcase static verification passed');
NODE
```

Expected:

```text
mini program product showcase static verification passed
```

- [ ] **Step 9: Commit docs and verification changes**

Run:

```bash
git add docs/api.md docs/deployment.md
git commit -m "docs: document product showcase APIs

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Manual Acceptance Checklist

Use WeChat Developer Tools after the tasks pass automated checks:

- [ ] 首页“热卖产品”快捷入口打开产品列表页。
- [ ] 首页热卖产品卡片打开对应产品详情页。
- [ ] 产品列表显示封面或默认产品图标、名称、描述、价格、周期和热卖标签。
- [ ] 产品详情在有封面、视频、详情图、卖点、场景、交付内容、FAQ 时展示对应模块。
- [ ] 产品详情在缺少视频、详情图、FAQ 时不展示空白模块。
- [ ] “复制话术”把客户话术复制到剪贴板。
- [ ] “复制摘要”把产品名称、价格、周期、亮点和描述复制到剪贴板。
- [ ] “转发”路径包含 `pages/product-detail/product-detail?id=<id>`。
- [ ] 后台产品展示库可以保存外链、结构化内容、FAQ 和客户话术，刷新后仍可见。

## Self-Review

- Spec coverage: backend data fields, admin editing, public list/detail APIs, mini program list/detail pages, home entry navigation, copy actions, sharing, external-URL-only media, no rich text, and existing-product compatibility are covered by Tasks 1-5.
- Placeholder scan: the plan contains concrete file paths, code blocks, commands, expected outcomes, and commit commands for every task.
- Type consistency: backend response fields use camelCase (`coverUrl`, `galleryUrls`, `shareScript`, `detailContent`) and the admin/mini program tasks consume the same names.
