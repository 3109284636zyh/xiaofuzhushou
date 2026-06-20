# AI小福智能建站助手 V3.0 MVP

AI小福 V3.0 是一个从零搭建的全栈 MVP，面向闲鱼/淘宝/拼多多等电商平台内的建站接单场景，包含微信小程序、Vue3 管理后台、Node.js 后端、MySQL 数据库和 DeepSeek AI 风控调用。

## 项目结构

```text
WANGFURONG/
├─ backend/            Node.js + Express API
├─ admin/              Vue3 + Element Plus 管理后台
├─ miniprogram/        微信原生小程序
├─ database.sql        MySQL 建表与初始化数据
├─ docs/api.md         接口说明
├─ docs/deployment.md  部署说明
└─ README.md           本地运行说明
```

## 环境要求

- Node.js 18+
- npm 9+
- MySQL 8.x
- 微信开发者工具（用于打开 `miniprogram/`）

## 本地运行

按下面顺序执行：

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

Windows Git Bash 下 `cp backend/.env.example backend/.env` 可直接执行；如果使用 PowerShell，可改为：

```powershell
Copy-Item backend/.env.example backend/.env
```

## 后端配置

复制 `.env` 后至少检查这些配置：

```env
PORT=3000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=ai_xiaofu_v3
JWT_SECRET=replace-with-a-long-random-string
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TIMEOUT_MS=5000
CORS_ORIGIN=https://wfr.ccvo.top,http://localhost:5173
```

说明：

- 不配置 `DEEPSEEK_API_KEY` 时，AI 接口会返回安全兜底话术，方便本地先跑通。
- DeepSeek Key 只允许配置在后端 `.env` 或后端系统配置中，小程序端不会暴露完整 Key。
- 后台固定密码为 `zyh123456`。

## 小程序打开方式

在微信开发者工具中导入：

```text
miniprogram/
```

联调方式：

- 正式/预发布：小程序合法 request 域名配置为 `https://wfr.ccvo.top`。
- 本地开发：可在微信开发者工具中临时关闭域名校验，并将 `miniprogram/config/index.js` 的 `API_BASE_URL` 改为本机后端地址，例如 `http://localhost:3000/api`。

## 核心功能

- 小程序 5 个底部导航：首页、建站助手、工具箱、搜索、我的。
- AI 智能回复：DeepSeek 后端调用 + 平台内风控提示词 + 违禁词过滤 + 5 秒超时兜底。
- 智能报价：根据需求返回报价区间、开发周期、功能清单和订单草稿。
- 建站方案生成：返回页面规划、功能清单、周期和报价说明。
- 管理后台：产品、知识库、教程、销售话术、订单、AI 配置和仪表盘。
- 工具箱扩展入口：Whois、备案查询、测速、SSL、SEO 等 MVP 阶段返回安全演示结果或“即将接入”。

## 验证命令

```bash
npm run backend:test
npm run admin:build
node -e "const fs=require('fs'); const required=['backend/src/app.js','admin/src/App.vue','miniprogram/app.json','database.sql','README.md']; required.forEach(f=>{if(!fs.existsSync(f)) throw new Error(f+' missing')}); console.log('AI小福 V3.0 MVP files ready')"
```

## 部署入口

- 后端默认端口：`3000`
- 后台构建产物：`admin/dist`
- 正式域名：`wfr.ccvo.top`
- API Base URL：`https://wfr.ccvo.top/api`

详细部署见 [docs/deployment.md](docs/deployment.md)。接口说明见 [docs/api.md](docs/api.md)。
