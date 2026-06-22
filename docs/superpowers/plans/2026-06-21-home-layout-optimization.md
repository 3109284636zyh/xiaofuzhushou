# 首页布局优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化微信小程序首页首屏布局，解决内容顶到状态栏/刘海区域、视觉拥挤、卡片层级松散的问题。

**Architecture:** 只修改首页局部文件。`home.js` 负责计算顶部安全区并保持数据加载逻辑；`home.wxml` 负责新版结构；`home.wxss` 负责首页视觉系统和响应式间距。全局样式不做破坏性改动，避免影响其他 tab 页面。

**Tech Stack:** 微信原生小程序、Skyline 渲染、WXML、WXSS、JavaScript、现有 `wx` API。

## Global Constraints

- 保留 `navigationStyle: custom`，不新增自定义导航栏组件。
- 首页内容必须避开状态栏、刘海和右上角胶囊按钮。
- 不改后端接口、不改 tabBar 结构、不新增业务功能。
- 不引入第三方 UI 库。
- DeepSeek、后台、数据库和其他页面逻辑不在本次范围内。
- 如果需要提交 git，必须先获得用户明确授权；本计划默认只修改文件和验证，不自动提交。

---

## File Structure Map

- Modify: `miniprogram/pages/home/home.js`
  - 增加 `topSpacerHeight` 数据字段。
  - 新增 `setLayoutMetrics()`，读取系统信息和胶囊按钮位置，计算首页顶部安全区。
  - `onLoad()` 先设置布局指标，再加载首页数据。
- Modify: `miniprogram/pages/home/home.wxml`
  - 增加顶部安全区占位。
  - 重排 hero、搜索入口、快捷入口、今日数据和列表区结构。
  - 不改变现有数据字段和点击事件语义。
- Modify: `miniprogram/pages/home/home.wxss`
  - 重写首页局部样式：安全区、hero、搜索、快捷卡片、数据面板、列表卡片、底部 padding。
- Optional Modify: `miniprogram/app.wxss`
  - 仅当 `.container` 全局 padding 与新版首页冲突时才调整；优先不修改。

---

### Task 1: Add Home Safe-Area Metrics

**Files:**
- Modify: `miniprogram/pages/home/home.js`

**Interfaces:**
- Consumes: WeChat APIs `wx.getMenuButtonBoundingClientRect()`, `wx.getSystemInfoSync()`.
- Produces: `data.topSpacerHeight: number` in rpx, used by `home.wxml` as `style="height: {{topSpacerHeight}}rpx"`.
- Produces: `setLayoutMetrics(): void` called from `onLoad()`.

- [ ] **Step 1: Replace `home.js` with safe-area aware implementation**

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
      { key: 'ai', title: 'AI智能回复', desc: '生成平台内安全话术', icon: '✦' },
      { key: 'quote', title: '智能报价', desc: '估算价格和周期', icon: '￥' },
      { key: 'knowledge', title: '建站百科', desc: '查建站知识', icon: '书' },
      { key: 'product', title: '热卖产品', desc: '查看主推服务', icon: '火' }
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
      const topSpacerHeight = Math.ceil(safeTop * 2 + 24);

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

  handleQuick(event) {
    const key = event.currentTarget.dataset.key;
    if (key === 'ai') wx.navigateTo({ url: '/pages/ai-chat/ai-chat' });
    if (key === 'quote') wx.navigateTo({ url: '/pages/quote/quote' });
    if (key === 'knowledge') wx.switchTab({ url: '/pages/assistant/assistant' });
    if (key === 'product') wx.switchTab({ url: '/pages/home/home' });
  }
});
```

- [ ] **Step 2: Verify JavaScript syntax by running a parse check**

Run:

```bash
node --check miniprogram/pages/home/home.js
```

Expected: command exits successfully with no syntax errors.

---

### Task 2: Rebuild Home WXML Structure

**Files:**
- Modify: `miniprogram/pages/home/home.wxml`

**Interfaces:**
- Consumes: `topSpacerHeight`, `quickActions`, `summary.stats`, `products`, `tutorials`, `recent` from `home.js`.
- Consumes events: `bindtap="goSearch"`, `bindtap="handleQuick"`.
- Produces: Stable semantic class names used by `home.wxss`.

- [ ] **Step 1: Replace `home.wxml` with the redesigned structure**

Use this complete file content:

```xml
<view class="home-page">
  <view class="home-safe-top" style="height: {{topSpacerHeight}}rpx;"></view>

  <view class="home-content">
    <view class="hero-card">
      <view class="hero-orb hero-orb-large"></view>
      <view class="hero-orb hero-orb-small"></view>
      <view class="hero-copy">
        <view class="hero-pill">平台内接单助手</view>
        <view class="hero-title">今天帮你快速生成报价和方案</view>
        <view class="hero-sub">DeepSeek 后端托管 · 平台沟通风控已启用</view>
      </view>
    </view>

    <view class="search-entry" bindtap="goSearch">
      <view class="search-icon">⌕</view>
      <view class="search-placeholder">搜索产品、教程、客户问题</view>
    </view>

    <view class="quick-grid">
      <view wx:for="{{quickActions}}" wx:key="key" class="quick-card" bindtap="handleQuick" data-key="{{item.key}}">
        <view class="quick-icon-wrap"><text class="quick-icon">{{item.icon}}</text></view>
        <view class="quick-text">
          <view class="quick-title">{{item.title}}</view>
          <view class="quick-desc">{{item.desc}}</view>
        </view>
      </view>
    </view>

    <view class="section-heading">今日数据</view>
    <view class="stats-panel">
      <view class="stat-item">
        <text class="stat-number">{{summary.stats.todayUsage}}</text>
        <view class="stat-label">使用次数</view>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-number">{{summary.stats.todayReplies}}</text>
        <view class="stat-label">回复生成</view>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-number">{{summary.stats.todayDeals}}</text>
        <view class="stat-label">成交客户</view>
      </view>
    </view>

    <view class="section-heading">热卖产品</view>
    <view wx:for="{{products}}" wx:key="id" class="list-card product-card">
      <view class="list-main">
        <view class="list-title">{{item.name}}</view>
        <view class="list-desc">{{item.description}}</view>
      </view>
      <view class="price-chip">￥{{item.priceMin}}-{{item.priceMax}}</view>
    </view>

    <view class="section-heading">最新教程</view>
    <view wx:for="{{tutorials}}" wx:key="id" class="list-card">
      <view class="list-main">
        <view class="list-title">{{item.title}}</view>
        <view class="list-desc">{{item.summary}}</view>
      </view>
    </view>

    <view class="section-heading">最近使用</view>
    <view wx:if="{{recent.length === 0}}" class="empty-card">暂无记录，先生成一条 AI 回复吧</view>
    <view wx:for="{{recent}}" wx:key="id" class="list-card recent-card">
      <view class="list-main">
        <view class="list-title">{{item.titleSnapshot || item.title}}</view>
        <view class="list-desc">{{item.recordType}}</view>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 2: Confirm no removed event handler or data binding**

Check these strings exist in `home.wxml`:

```text
bindtap="goSearch"
bindtap="handleQuick"
topSpacerHeight
quickActions
summary.stats.todayUsage
summary.stats.todayReplies
summary.stats.todayDeals
products
tutorials
recent
```

Expected: every string appears at least once.

---

### Task 3: Restyle Home Page Visual System

**Files:**
- Modify: `miniprogram/pages/home/home.wxss`

**Interfaces:**
- Consumes class names produced in Task 2.
- Produces: Homepage-specific layout and visual styling. No global selectors except the page-level root classes used here.

- [ ] **Step 1: Replace `home.wxss` with the redesigned styles**

Use this complete file content:

```css
.home-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 16% 4%, rgba(22, 119, 255, .14), transparent 34%),
    linear-gradient(180deg, #F6FAFF 0%, #EEF4FF 46%, #F7F4FF 100%);
  overflow-x: hidden;
}

.home-safe-top {
  width: 100%;
  flex-shrink: 0;
}

.home-content {
  padding: 0 28rpx 176rpx;
}

.hero-card {
  position: relative;
  overflow: hidden;
  min-height: 264rpx;
  padding: 34rpx 34rpx 32rpx;
  border-radius: 40rpx;
  color: #FFFFFF;
  background: linear-gradient(135deg, #1677FF 0%, #4B7CFF 48%, #6C63FF 100%);
  box-shadow: 0 24rpx 60rpx rgba(42, 91, 219, .22);
}

.hero-copy {
  position: relative;
  z-index: 2;
  max-width: 560rpx;
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  height: 48rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, .20);
  color: rgba(255, 255, 255, .94);
  font-size: 23rpx;
  font-weight: 600;
}

.hero-title {
  margin-top: 24rpx;
  font-size: 42rpx;
  line-height: 1.18;
  font-weight: 900;
  letter-spacing: -1.4rpx;
}

.hero-sub {
  margin-top: 18rpx;
  color: rgba(255, 255, 255, .82);
  font-size: 25rpx;
  line-height: 1.45;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, .18);
  pointer-events: none;
}

.hero-orb-large {
  right: -80rpx;
  top: -86rpx;
  width: 260rpx;
  height: 260rpx;
}

.hero-orb-small {
  right: 72rpx;
  bottom: -70rpx;
  width: 170rpx;
  height: 170rpx;
  background: rgba(255, 255, 255, .12);
}

.search-entry {
  display: flex;
  align-items: center;
  gap: 16rpx;
  height: 92rpx;
  margin: 24rpx 0 22rpx;
  padding: 0 28rpx;
  border: 1rpx solid rgba(22, 119, 255, .10);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, .92);
  box-shadow: 0 16rpx 44rpx rgba(26, 56, 108, .08);
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: rgba(22, 119, 255, .10);
  color: #1677FF;
  font-size: 28rpx;
  font-weight: 800;
}

.search-placeholder {
  color: #7A8497;
  font-size: 29rpx;
  font-weight: 500;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-height: 138rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, .86);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, .88);
  box-shadow: 0 16rpx 42rpx rgba(32, 63, 120, .08);
}

.quick-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 58rpx;
  height: 58rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, rgba(22, 119, 255, .13), rgba(108, 99, 255, .13));
  color: #24324B;
}

.quick-icon {
  font-size: 30rpx;
  font-weight: 800;
}

.quick-text {
  min-width: 0;
}

.quick-title {
  color: #1D2738;
  font-size: 29rpx;
  font-weight: 800;
  line-height: 1.25;
}

.quick-desc {
  margin-top: 8rpx;
  color: #7A8497;
  font-size: 23rpx;
  line-height: 1.35;
}

.section-heading {
  margin: 34rpx 2rpx 16rpx;
  color: #182235;
  font-size: 31rpx;
  font-weight: 900;
  letter-spacing: -.6rpx;
}

.stats-panel {
  display: flex;
  align-items: center;
  min-height: 144rpx;
  padding: 18rpx 10rpx;
  border: 1rpx solid rgba(255, 255, 255, .88);
  border-radius: 32rpx;
  background: rgba(255, 255, 255, .90);
  box-shadow: 0 16rpx 42rpx rgba(32, 63, 120, .08);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-number {
  display: block;
  color: #1677FF;
  font-size: 42rpx;
  line-height: 1;
  font-weight: 900;
}

.stat-label {
  margin-top: 12rpx;
  color: #7A8497;
  font-size: 23rpx;
}

.stat-divider {
  width: 1rpx;
  height: 54rpx;
  background: rgba(126, 142, 171, .18);
}

.list-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 14rpx;
  padding: 24rpx 26rpx;
  border: 1rpx solid rgba(255, 255, 255, .88);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, .88);
  box-shadow: 0 12rpx 34rpx rgba(32, 63, 120, .06);
}

.list-main {
  min-width: 0;
  flex: 1;
}

.list-title {
  color: #1D2738;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 1.35;
}

.list-desc {
  margin-top: 8rpx;
  color: #7A8497;
  font-size: 23rpx;
  line-height: 1.45;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.price-chip {
  flex-shrink: 0;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(22, 119, 255, .10);
  color: #1677FF;
  font-size: 23rpx;
  font-weight: 800;
  white-space: nowrap;
}

.empty-card {
  padding: 42rpx 24rpx;
  border: 1rpx dashed rgba(126, 142, 171, .32);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, .58);
  color: #98A2B3;
  font-size: 25rpx;
  text-align: center;
}
```

- [ ] **Step 2: Confirm style selectors match WXML class names**

Check the WXML classes are all styled by `home.wxss`:

```text
home-page
home-safe-top
home-content
hero-card
hero-pill
hero-title
hero-sub
search-entry
quick-grid
quick-card
stats-panel
list-card
empty-card
```

Expected: each class exists in both `home.wxml` and `home.wxss`.

---

### Task 4: Verify and Review the Home Layout Change

**Files:**
- Verify: `miniprogram/pages/home/home.js`
- Verify: `miniprogram/pages/home/home.wxml`
- Verify: `miniprogram/pages/home/home.wxss`
- Optional verify: `miniprogram/app.wxss`

**Interfaces:**
- Consumes: Completed Tasks 1-3.
- Produces: Verified working tree diff and manual preview checklist.

- [ ] **Step 1: Run syntax check for JavaScript**

Run:

```bash
node --check miniprogram/pages/home/home.js
```

Expected: command exits successfully with no output.

- [ ] **Step 2: Inspect changed files**

Run:

```bash
git diff -- miniprogram/pages/home/home.js miniprogram/pages/home/home.wxml miniprogram/pages/home/home.wxss
```

Expected: diff only changes homepage layout, safe-area calculation, and homepage-specific styles.

- [ ] **Step 3: Manual preview in WeChat DevTools or current preview environment**

Open the mini program home page and verify:

```text
[ ] Hero card starts below the status bar / notch / capsule area.
[ ] Right-side capsule button does not overlap the hero title.
[ ] Search entry appears as a compact pill below the hero.
[ ] Four quick action cards are evenly spaced in two columns.
[ ] Today stats appear in one horizontal panel with three values.
[ ] Product/tutorial/recent list cards are thinner than before.
[ ] Bottom content has enough breathing room above the tabBar.
[ ] AI reply, quote, assistant, and search navigation still work.
```

- [ ] **Step 4: If manual preview shows top spacing too tall or too short, adjust only the final constant**

In `home.js`, adjust this line only:

```js
const topSpacerHeight = Math.ceil(safeTop * 2 + 24);
```

Allowed alternatives:

```js
const topSpacerHeight = Math.ceil(safeTop * 2 + 12);
```

or

```js
const topSpacerHeight = Math.ceil(safeTop * 2 + 32);
```

Choose the smallest value that keeps hero clear of the capsule/status area.

- [ ] **Step 5: Do not commit unless explicitly authorized**

If the user asks to commit after verification, use:

```bash
git add miniprogram/pages/home/home.js miniprogram/pages/home/home.wxml miniprogram/pages/home/home.wxss docs/superpowers/specs/2026-06-21-home-layout-optimization-design.md docs/superpowers/plans/2026-06-21-home-layout-optimization.md
git commit -m "style: optimize mini program home layout"
```

Commit message body must end with:

```text
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

## Self-Review

- Spec coverage: Task 1 covers top safe-area; Task 2 covers structure; Task 3 covers hero/search/cards/stats/list/bottom spacing; Task 4 covers syntax, diff, and manual preview verification.
- Placeholder scan: no TBD/TODO/fill-in-later language is used. All code-changing steps include complete code blocks.
- Type consistency: `topSpacerHeight` is produced by `home.js` and consumed by `home.wxml`; class names in Task 2 match selectors in Task 3; existing click handlers and data fields remain unchanged.
