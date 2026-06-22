# 小程序全局 UI 小图标设计

## 背景

当前小程序已经完成首页首屏布局优化，整体视觉基调是蓝紫渐变、玻璃卡片和圆角卡片。现状中只有首页快捷入口、搜索符号和工具箱九宫格有少量文字/符号图标，其他页面的标题、表单、按钮、列表、状态和菜单大多是纯文字。原生 tabBar 也只有文字，没有 `iconPath` / `selectedIconPath`。

本设计目标是把全小程序的 UI 小图标补齐，提升入口识别度和产品完成度，同时不改变业务逻辑、不引入第三方 UI 库、不重构页面架构。

## 已确认方案

采用 **图片资源图标方案**：新增本地图片图标资源，为 tabBar 和页面内关键 UI 统一补图标。

- tabBar 使用本地 PNG 图标，并配置未选中 / 选中两套状态。
- 页面内图标使用本地图片资源，通过统一 WXML 结构和 WXSS 类接入。
- 页面内图标优先使用轻量 PNG；如果后续微信开发者工具验证 SVG 在当前基础库和 Skyline 下稳定，也可以把部分页面内图标替换成 SVG，但本次实施默认以 PNG 为准。
- 不使用 iconfont、Vant、TDesign 或其他第三方 UI 库。

## 目标

- 为小程序主要 UI 层补齐统一的小图标：tabBar、首页、建站助手、工具箱、搜索、我的、报价、方案、AI 聊天、文章详情。
- 保持当前蓝紫科技感视觉系统，图标作为辅助信息，不喧宾夺主。
- 用本地图片资产替换现有“单字 / 符号图标”，例如 `书`、`火`、`域`、`锁`、`⌕`。
- 对还没有图标的按钮、列表项、状态行和结果区域补小图标。
- 保留原生 tabBar 体验，使用 `iconPath` 和 `selectedIconPath`。
- 不改后端接口、不改数据字段含义、不改现有点击事件语义。

## 非目标

- 不新增业务功能。
- 不改登录、权限、支付、接口或数据库。
- 不引入第三方 UI 组件库或图标库。
- 不把 tabBar 改成 custom tabBar。
- 不做整站视觉重构，只在现有页面结构上补图标和必要排版。
- 不修改小程序导航模式；继续保留现有 `navigationStyle: "custom"`。

## 图标资产目录

新增目录：

```text
miniprogram/assets/icons/
  tab/
    home.png
    home-active.png
    assistant.png
    assistant-active.png
    toolbox.png
    toolbox-active.png
    search.png
    search-active.png
    mine.png
    mine-active.png
  ui/
    ai.png
    api.png
    arrow-right.png
    article.png
    bookmark.png
    budget.png
    calculator.png
    category.png
    chat.png
    check.png
    clock.png
    copy.png
    customer-service.png
    domain.png
    document.png
    empty.png
    feature.png
    globe.png
    history.png
    home-service.png
    knowledge.png
    lightning.png
    lock.png
    log.png
    menu.png
    message.png
    plan.png
    price.png
    product.png
    profile.png
    quote.png
    reply.png
    search.png
    seo.png
    send.png
    shield.png
    speed.png
    star.png
    stats.png
    toolbox.png
    trend.png
    user.png
    warning.png
    whois.png
```

如果实施时发现某些图标可复用，允许减少文件数量，但每个 UI 场景必须能显示语义清晰的小图标。

## 图标风格规范

- 主色：沿用 `#1677FF` 和 `#6C63FF`。
- 未选中 tabBar：灰蓝色，接近 `#667085`。
- 选中 tabBar：蓝紫主色，接近 `#1677FF`。
- 页面内图标：以蓝色线性小图标为主，部分深色背景使用白色图标版本或浅色底承载。
- 形状：线性、圆角、简洁，不使用复杂插画。
- 尺寸层级：
  - tabBar 源图：建议 48px × 48px，透明背景。
  - 主入口图标：首页快捷入口、工具箱卡片约 52-64rpx。
  - 标题 / 菜单 / 状态图标约 30-40rpx。
  - 按钮内图标约 26-30rpx。
- 图标文件要控制体积，单个 tabBar 图标尽量小于 40KB。
- 图标语气更像产品 UI，不使用 emoji 风格。

## 全局页面内图标体系

在 `miniprogram/app.wxss` 增加可复用小图标类：

- `.ui-icon`：基础图片图标，固定宽高，`display: block`。
- `.ui-icon-sm`：按钮、标签、正文辅助图标。
- `.ui-icon-md`：标题、菜单、状态行图标。
- `.ui-icon-lg`：首页快捷入口、工具箱入口图标。
- `.ui-icon-badge`：带浅蓝 / 浅紫圆角底的图标容器。
- `.ui-icon-badge-white`：渐变深色卡片上使用的白色半透明底。
- `.title-with-icon`：标题和图标横向排列。
- `.row-with-icon`：菜单行、状态行和结果行横向排列。
- `.button-content`：按钮内图标和文字排列。

这些类只补充样式，不破坏现有 `.card`、`.pill`、`.btn-primary`、`.section-title` 等全局类。

## 页面覆盖范围

### tabBar

更新 `miniprogram/app.json` 的 5 个 tabBar 项：

- 首页：`assets/icons/tab/home.png` / `assets/icons/tab/home-active.png`
- 建站助手：`assets/icons/tab/assistant.png` / `assets/icons/tab/assistant-active.png`
- 工具箱：`assets/icons/tab/toolbox.png` / `assets/icons/tab/toolbox-active.png`
- 搜索：`assets/icons/tab/search.png` / `assets/icons/tab/search-active.png`
- 我的：`assets/icons/tab/mine.png` / `assets/icons/tab/mine-active.png`

保持原生 tabBar，不改 `pagePath`、`text`、`color`、`selectedColor`。

### 首页

页面已有较完整的新结构，重点是把现有文字图标替换成本地图片，并补齐列表 / 数据区图标：

- 搜索入口：用 `ui/search.png` 替换 `⌕`。
- 快捷入口：`AI智能回复`、`智能报价`、`建站百科`、`热卖产品` 分别使用 `ai.png`、`quote.png`、`knowledge.png`、`product.png`。
- 今日数据：使用次数、回复生成、成交客户补 `stats.png`、`reply.png`、`trend.png`。
- 热卖产品、最新教程、最近使用标题补 `product.png`、`article.png`、`history.png`。
- 产品价格、教程条目、最近记录可在卡片左侧加小型辅助图标。

### 建站助手

- hero 区补 `ai.png` 或 `knowledge.png`。
- 输入框区域补 `message.png`。
- 生成按钮补 `lightning.png` 或 `send.png`。
- AI 回复标题补 `reply.png`，复制按钮补 `copy.png`。
- 知识分类标题补 `category.png`。
- 文章卡片左侧补 `article.png`，标签保留现有文案。

### 工具箱

- 九宫格工具替换当前“域 / W / 速 / 锁 / 备 / ￥ / 搜 / 析 / 案”等文字为图片图标：
  - 域名查询：`domain.png`
  - Whois 查询：`whois.png`
  - 网站测速：`speed.png`
  - SSL 检测：`lock.png`
  - 备案查询：`document.png` 或 `check.png`
  - 智能报价：`quote.png`
  - SEO 检测：`seo.png`
  - 网站分析：`stats.png` 或 `trend.png`
  - AI 方案生成：`plan.png`
- 智能接单卡片补客户分析和销售话术图标，可用 `user.png`、`chat.png`。
- 结果面板标题补 `document.png`，每行结果可用 `check.png` 或 `feature.png`。

### 搜索

- hero 标题补 `search.png`。
- 输入框补 `search.png`。
- 搜索按钮补 `arrow-right.png` 或 `search.png`。
- 结果卡片根据 `item.type` 显示统一小图标；如果类型未识别，使用 `document.png`。
- 空状态补 `empty.png`。

### 我的

- 头像区域保留“福”作为品牌识别，可在外层补 `profile.png` 或保持字标。
- 配置状态每一行补图标：API 用 `api.png`，风控用 `shield.png`，请求域名用 `globe.png`。
- 常用入口每一行补图标：收藏 `bookmark.png`、历史 `history.png`、AI 配置 `ai.png`、API 管理 `api.png`、更新日志 `log.png`、联系客服 `customer-service.png`。
- 记录卡片补 `history.png` 或 `document.png`。

### 报价

- hero / form 标题补 `quote.png` 或 `calculator.png`。
- 需求、预算、周期、类型输入项补 `message.png`、`budget.png`、`clock.png`、`product.png`。
- 生成按钮补 `calculator.png` 或 `lightning.png`。
- 结果价格补 `price.png`，功能清单补 `feature.png`，摘要补 `document.png`，复制按钮补 `copy.png`。

### 方案

- form 标题补 `plan.png`。
- 行业、预算、需求输入项补 `globe.png`、`budget.png`、`message.png`。
- 生成按钮补 `lightning.png`。
- 结果页的网站类型、页面规划、功能清单、方案文案、复制按钮补 `home-service.png`、`plan.png`、`feature.png`、`document.png`、`copy.png`。

### AI 聊天

- hero 区补 `shield.png` 或 `chat.png`。
- 输入框补 `message.png`。
- 生成按钮补 `send.png` 或 `lightning.png`。
- 回复区补 `reply.png`，复制按钮补 `copy.png`。
- 兜底提示补 `warning.png` 或 `shield.png`。

### 文章详情

- 标签补 `category.png`。
- 标题 / 摘要 / 正文区域补 `article.png`、`document.png`。
- 收藏按钮补 `bookmark.png` 或 `star.png`。
- 加载空状态补 `empty.png` 或 `document.png`。

## 数据与接口影响

- 不新增接口。
- 不改变现有接口返回字段。
- 可以在页面本地 `data` 中补充纯展示字段，例如首页 `quickActions[].iconPath`、工具箱 `tools[].iconPath`、我的菜单列表 `iconPath`。
- 搜索结果按现有 `item.type` 做本地展示映射，不要求后端新增字段。
- 原有事件处理函数、接口请求、复制、收藏和页面跳转语义保持不变。

## 文件影响

预计修改：

- `miniprogram/app.json`：为 tabBar 添加 `iconPath` 和 `selectedIconPath`。
- `miniprogram/app.wxss`：新增通用图标样式。
- `miniprogram/pages/home/home.js`、`home.wxml`、`home.wxss`：补图标字段、图片结构和样式。
- `miniprogram/pages/assistant/assistant.wxml`、`assistant.wxss`：补按钮、标题、文章图标。
- `miniprogram/pages/toolbox/toolbox.js`、`toolbox.wxml`、`toolbox.wxss`：替换九宫格文字图标，补智能接单和结果图标。
- `miniprogram/pages/search/search.js`、`search.wxml`、`search.wxss`：补搜索输入、按钮、结果类型、空状态图标。
- `miniprogram/pages/mine/mine.js`、`mine.wxml`、`mine.wxss`：补配置状态、常用入口和记录图标。
- `miniprogram/pages/quote/quote.wxml`、`quote.wxss`：补表单、按钮和结果图标。
- `miniprogram/pages/plan/plan.wxml`、`plan.wxss`：补表单、按钮和结果图标。
- `miniprogram/pages/ai-chat/ai-chat.wxml`、`ai-chat.wxss`：补输入、按钮、回复和兜底图标。
- `miniprogram/pages/article-detail/article-detail.wxml`、`article-detail.wxss`：补标签、正文、收藏和空状态图标。
- 新增 `miniprogram/assets/icons/tab/*.png` 和 `miniprogram/assets/icons/ui/*.png`。

## 测试与验证

- 检查 `app.json` JSON 格式有效。
- 检查 tabBar 的每个 `iconPath` 和 `selectedIconPath` 文件存在。
- 检查页面 WXML 引用的每个图片路径都存在。
- 对被修改的 `.js` 文件执行 `node --check`。
- 在微信开发者工具中预览：首页、建站助手、工具箱、搜索、我的 5 个 tab 能正常显示图标；二级页面报价、方案、AI 聊天、文章详情的图标不挤压内容。
- 确认原有按钮点击、页面跳转、接口请求、复制 / 收藏动作未改语义。

## 风险与处理

- 原生 tabBar 图标文件缺失会导致底部栏显示异常：实现时必须先创建图标资产，再改 `app.json`。
- 页面内图标过多可能显得拥挤：只在标题、入口、状态和关键动作补图标，正文列表以小尺寸辅助图标为主。
- 小程序对图片尺寸和路径较敏感：统一使用根路径 `/assets/icons/...` 或 app.json 兼容的相对路径，实施时逐一校验。
- Skyline 渲染对部分 CSS 支持可能与 Web 不完全一致：图标样式使用基础 flex、border-radius、background、font-size，避免复杂伪元素。
- 小程序包体增加：图标使用简洁透明 PNG，控制文件大小；复用语义相近图标，避免无意义重复。

## 交付标准

- 全小程序主要页面都能看到统一风格的小图标。
- tabBar 有未选中 / 选中图片图标。
- 当前文字 / 符号伪图标被本地图片图标替换。
- 图标不破坏现有布局，不造成文本换行明显恶化。
- 不引入第三方依赖。
- 现有业务逻辑和接口调用保持不变。
