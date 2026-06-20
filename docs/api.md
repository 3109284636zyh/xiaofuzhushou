# AI小福智能建站助手 V3.0 MVP API 文档

本文档定义小程序端与管理后台共用的 MVP 接口骨架、统一响应格式与主要请求/响应约定。

## 基础约定

- Base URL：`https://wfr.ccvo.top/api`
- Content-Type：`application/json`
- 管理后台需要 `Authorization: Bearer <token>`
- 所有成功响应统一为：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

- 所有失败响应统一为：

```json
{
  "code": 40001,
  "message": "参数错误",
  "data": null
}
```

## 错误码

| code | 含义 |
| --- | --- |
| 40001 | 参数错误 |
| 40101 | 后台登录失效 |
| 40301 | 密码错误或无权限 |
| 40401 | 数据不存在 |
| 42901 | 请求过于频繁 |
| 50001 | 服务内部错误 |
| 50002 | AI 服务异常 |
| 50003 | AI 响应超时 |
| 50004 | 内容触发风控 |

## 健康检查

### GET /health

用于部署后的基础存活检查。

成功响应：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "ok"
  }
}
```

## 认证接口

### POST /auth/login

后台固定密码登录。

请求体：

```json
{
  "password": "zyh123456"
}
```

成功响应：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "<jwt>",
    "expiresIn": 1800,
    "adminName": "AI小福管理员"
  }
}
```

失败响应：

```json
{
  "code": 40301,
  "message": "密码错误",
  "data": null
}
```

## 小程序公共接口

### GET /app/home/summary

首页工作台摘要数据。

返回字段：

```json
{
  "stats": {
    "todayUsage": 0,
    "todayReplies": 0,
    "todayDeals": 0
  },
  "quickActions": [
    { "key": "ai-chat", "title": "AI智能回复" }
  ],
  "notice": "欢迎使用 AI小福"
}
```

### GET /products/hot

获取热卖产品列表。

成功响应 `data`：

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
    "isHot": true
  }
]
```

### GET /tutorials/latest

获取最新教程列表。

成功响应 `data`：

```json
[
  {
    "id": 1,
    "title": "域名购买与解析入门",
    "summary": "从购买到解析生效，帮助客户理解建站前置准备。",
    "publishedAt": "2026-06-20 10:00:00"
  }
]
```

### GET /usage/recent

获取最近使用记录。

成功响应 `data`：

```json
[
  {
    "id": 1,
    "recordType": "ai-chat",
    "title": "企业官网报价咨询",
    "createdAt": "2026-06-20 10:00:00"
  }
]
```

### GET /knowledge/categories

获取知识分类。

成功响应 `data`：

```json
[
  {
    "id": 1,
    "name": "建站基础",
    "slug": "website-basics",
    "description": "适合快速了解企业官网与展示站的核心组成。"
  }
]
```

### GET /knowledge/articles

获取知识文章列表。

查询参数：

- `categoryId`：可选，按分类过滤
- `keyword`：可选，按标题/标签搜索

成功响应 `data`：

```json
[
  {
    "id": 1,
    "categoryId": 1,
    "title": "企业官网标准页面怎么规划",
    "summary": "帮助客户快速理解首页、产品、案例、关于我们和联系页的作用。",
    "tags": "企业官网,页面规划,建站基础"
  }
]
```

### GET /knowledge/articles/:id

获取单篇知识文章详情。

成功响应 `data`：

```json
{
  "id": 1,
  "categoryId": 1,
  "title": "企业官网标准页面怎么规划",
  "summary": "帮助客户快速理解首页、产品、案例、关于我们和联系页的作用。",
  "content": "...",
  "tags": "企业官网,页面规划,建站基础"
}
```

### POST /ai/chat

生成平台内安全客服回复。

请求体：

```json
{
  "prompt": "客户问：做企业官网大概多少钱？",
  "scene": "assistant"
}
```

成功响应 `data`：

```json
{
  "text": "可以的，你可以先在平台里补充一下页面数量和功能要求，我帮你整理报价范围。",
  "provider": "deepseek",
  "fallback": false,
  "blocked": false,
  "usage": {
    "promptTokens": 0,
    "completionTokens": 0,
    "totalTokens": 0
  }
}
```

### POST /quote/generate

生成智能报价结果。

请求体：

```json
{
  "demand": "我要做企业官网，包含首页、产品、案例、联系表单",
  "budget": "5000",
  "deadline": "15天内",
  "productType": "website"
}
```

成功响应 `data`：

```json
{
  "productType": "企业官网",
  "priceRange": "￥3000 - ￥8000",
  "durationDays": 10,
  "features": ["首页设计", "产品展示", "案例模块", "联系表单"],
  "summary": "适合先做标准企业展示站。",
  "orderDraft": {
    "status": "待沟通"
  }
}
```

### POST /plan/generate

生成建站方案。

请求体：

```json
{
  "industry": "机械设备",
  "budget": "8000",
  "requirements": "展示产品和案例，方便客户咨询"
}
```

成功响应 `data`：

```json
{
  "siteType": "企业官网",
  "pages": ["首页", "产品中心", "案例展示", "关于我们", "联系我们"],
  "features": ["在线咨询表单", "案例展示", "SEO基础设置"],
  "durationDays": 12,
  "priceRange": "￥6000 - ￥9000",
  "proposal": "适合机械设备行业的展示型官网方案。"
}
```

### POST /customer/analyze

分析客户意向等级。

请求体：

```json
{
  "message": "我预算一万，本周要做小程序，能多久交付？"
}
```

成功响应 `data`：

```json
{
  "level": "A",
  "label": "高意向客户",
  "reasons": ["预算明确", "时间紧迫"],
  "nextAction": "优先给出可执行方案和排期建议"
}
```

### POST /scripts/recommend

推荐销售话术。

请求体：

```json
{
  "scene": "price_objection",
  "message": "客户觉得报价高"
}
```

成功响应 `data`：

```json
{
  "title": "价格异议处理：先解释价值再给范围",
  "scriptType": "price_objection",
  "content": "这个预算我理解的。建站价格主要和页面数量、功能复杂度、设计要求有关。"
}
```

### POST /tools/:toolKey/check

工具箱统一入口。

适用 `toolKey`：`domain`、`whois`、`speed`、`ssl`、`icp`、`seo`、`analysis` 等。

请求体示例：

```json
{
  "domain": "example.com"
}
```

成功响应 `data`：

```json
{
  "toolKey": "whois",
  "status": "reserved",
  "title": "Whois 查询",
  "summary": "功能已预留，即将接入",
  "items": []
}
```

### GET /search

统一搜索产品、知识库、教程和历史。

查询参数：

- `q`：关键词
- `type`：`all | product | article | tutorial | history`

成功响应 `data`：

```json
[
  {
    "type": "product",
    "title": "企业官网",
    "summary": "适合企业展示、品牌介绍、新闻动态和表单咨询。",
    "targetId": 1
  }
]
```

### POST /favorites

新增收藏。

请求体：

```json
{
  "recordType": "article",
  "recordId": 1,
  "titleSnapshot": "企业官网标准页面怎么规划"
}
```

成功响应 `data`：

```json
{
  "id": 1,
  "recordType": "article",
  "recordId": 1,
  "status": "active"
}
```

### GET /favorites

获取收藏列表。

成功响应 `data`：

```json
[
  {
    "id": 1,
    "recordType": "article",
    "recordId": 1,
    "titleSnapshot": "企业官网标准页面怎么规划"
  }
]
```

### POST /history

写入历史记录。

请求体：

```json
{
  "recordType": "quote",
  "keyword": "企业官网 5000 预算",
  "titleSnapshot": "企业官网报价记录",
  "contentSnapshot": "报价范围：￥3000 - ￥8000"
}
```

成功响应 `data`：

```json
{
  "id": 1,
  "recordType": "quote",
  "status": "active"
}
```

### GET /history

获取历史记录列表。

成功响应 `data`：

```json
[
  {
    "id": 1,
    "recordType": "quote",
    "titleSnapshot": "企业官网报价记录",
    "createdAt": "2026-06-20 10:00:00"
  }
]
```

## 后台管理接口

以下接口默认要求 `Authorization: Bearer <token>`。

### GET /admin/dashboard

返回仪表盘摘要。

成功响应 `data`：

```json
{
  "todayAiCalls": 0,
  "todayQuoteCount": 0,
  "aiFailureCount": 0,
  "orderStatus": [
    { "status": "待沟通", "count": 0 }
  ],
  "hotProducts": [
    { "id": 1, "name": "企业官网", "clicks": 0 }
  ]
}
```

### 产品管理

- `GET /admin/products`：产品列表
- `POST /admin/products`：创建产品
- `PUT /admin/products/:id`：更新产品
- `DELETE /admin/products/:id`：删除产品

创建/更新请求体示例：

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
  "status": "active"
}
```

### 知识库分类管理

- `GET /admin/knowledge/categories`
- `POST /admin/knowledge/categories`
- `PUT /admin/knowledge/categories/:id`
- `DELETE /admin/knowledge/categories/:id`

请求体示例：

```json
{
  "name": "建站基础",
  "slug": "website-basics",
  "description": "适合快速了解企业官网与展示站的核心组成。",
  "sortOrder": 10,
  "status": "active"
}
```

### 知识文章管理

- `GET /admin/knowledge/articles`
- `POST /admin/knowledge/articles`
- `PUT /admin/knowledge/articles/:id`
- `DELETE /admin/knowledge/articles/:id`

请求体示例：

```json
{
  "categoryId": 1,
  "title": "企业官网标准页面怎么规划",
  "summary": "帮助客户快速理解首页、产品、案例、关于我们和联系页的作用。",
  "content": "...",
  "tags": "企业官网,页面规划,建站基础",
  "sortOrder": 10,
  "status": "published"
}
```

### 教程管理

- `GET /admin/tutorials`
- `POST /admin/tutorials`
- `PUT /admin/tutorials/:id`
- `DELETE /admin/tutorials/:id`

请求体示例：

```json
{
  "title": "域名购买与解析入门",
  "summary": "从购买到解析生效，帮助客户理解建站前置准备。",
  "content": "...",
  "sortOrder": 10,
  "status": "published"
}
```

### 话术管理

- `GET /admin/scripts`
- `POST /admin/scripts`
- `PUT /admin/scripts/:id`
- `DELETE /admin/scripts/:id`

请求体示例：

```json
{
  "title": "价格异议处理：先解释价值再给范围",
  "scriptType": "price_objection",
  "scene": "客户觉得报价偏高",
  "content": "...",
  "sortOrder": 10,
  "status": "active"
}
```

### 订单管理

- `GET /admin/orders`
- `POST /admin/orders`
- `PUT /admin/orders/:id`
- `DELETE /admin/orders/:id`

请求体示例：

```json
{
  "customerName": "张先生",
  "customerContactMask": "平台内咨询",
  "productType": "website",
  "demandSummary": "企业官网，5 个页面",
  "quotedPriceMin": 3000,
  "quotedPriceMax": 8000,
  "durationDays": 10,
  "status": "待沟通",
  "source": "quote"
}
```

### 系统配置管理

- `GET /admin/configs`
- `PUT /admin/configs/:configKey`

常用配置项：

- `deepseek_api_key`：DeepSeek API Key，敏感配置，后台保存后不明文展示。
- `deepseek_model`：默认 `deepseek-chat`。
- `deepseek_timeout_ms`：默认 `5000`。
- `risk_system_prompt`：平台内沟通风控系统提示词。
- `risk_forbidden_words`：JSON 数组格式违禁词。
- `risk_fallback_text`：AI 失败或触发风控时返回的兜底话术。

更新请求体示例：

```json
{
  "configValue": "deepseek-chat",
  "configType": "string",
  "isSensitive": false,
  "description": "DeepSeek 默认模型",
  "status": "active"
}
```

DeepSeek Key 更新示例：

```json
{
  "configValue": "sk-xxxxxxxx",
  "configType": "string",
  "isSensitive": true,
  "description": "DeepSeek API Key（后台保存后不明文展示）",
  "status": "active"
}
```

## MVP 约束说明

- 小程序端不提供注册、登录、支付能力。
- AI 返回内容必须适合闲鱼、淘宝、拼多多等平台内沟通。
- 不允许返回引导添加微信、QQ、手机号、邮箱或站外链接。
- `whois`、`icp`、`speed`、`ssl`、`seo`、`analysis` 等扩展工具在 MVP 阶段返回安全演示结果或“功能已预留，即将接入”。
