# AI小福智能建站助手 V3.0 MVP 部署说明

本文档描述 AI小福 V3.0 MVP 在 `wfr.ccvo.top` 下的推荐部署方式。

## 目标域名

- 正式域名：`wfr.ccvo.top`
- API Base URL：`https://wfr.ccvo.top/api`
- 后台访问路径：`https://wfr.ccvo.top/admin`
- 小程序合法 request 域名必须包含：`https://wfr.ccvo.top`

## 服务约定

- 后端监听端口：`3000`
- 后台构建产物目录：`admin/dist`
- 后端框架：Node.js + Express
- 后台框架：Vue3 + Element Plus
- 数据库：MySQL 8，默认库名 `ai_xiaofu_v3`
- DeepSeek Key：只配置在后端 `.env` 或后端系统配置中
- DeepSeek 超时时间：`5000ms`

## 部署目录建议

```text
/var/www/ai-xiaofu/
├─ backend/      Express 后端
├─ admin/dist/   后台静态文件
├─ database.sql  初始化脚本
└─ logs/         运行日志
```

## 数据库初始化

```bash
mysql -u root -p < database.sql
```

导入后会创建 `ai_xiaofu_v3` 数据库、核心业务表和演示数据。

## 后端环境变量

在服务器上创建 `backend/.env`：

```env
PORT=3000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=ai_xiaofu_v3
JWT_SECRET=replace-with-a-long-random-string
DEEPSEEK_API_KEY=your-deepseek-key
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TIMEOUT_MS=5000
CORS_ORIGIN=https://wfr.ccvo.top
```

安全要求：

- 小程序端不得暴露完整 DeepSeek Key。
- 后端日志不得打印完整 API Key。
- 后台编辑敏感配置时默认掩码展示。
- 后台固定密码保持 `zyh123456`，不要在小程序端添加登录/注册/支付能力。

## 构建与启动

```bash
npm run backend:install
npm run admin:install
npm run admin:build
npm --prefix backend start
```

生产环境建议使用 PM2：

```bash
npm install -g pm2
pm2 start backend/src/server.js --name ai-xiaofu-backend
pm2 save
```

## Nginx 路由建议

推荐将 `/api` 反向代理到后端，将 `/admin` 指向后台静态目录。

```nginx
server {
    listen 80;
    server_name wfr.ccvo.top;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name wfr.ccvo.top;

    ssl_certificate     /etc/nginx/ssl/wfr.ccvo.top.pem;
    ssl_certificate_key /etc/nginx/ssl/wfr.ccvo.top.key;

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin/ {
        alias /var/www/ai-xiaofu/admin/dist/;
        try_files $uri $uri/ /admin/index.html;
    }

    location / {
        return 200 'AI小福智能建站助手 V3.0';
        add_header Content-Type text/plain;
    }
}
```

## 小程序配置

1. 微信开发者工具导入 `miniprogram/`。
2. 小程序后台配置 request 合法域名：`https://wfr.ccvo.top`。
3. 确认 `miniprogram/config/index.js`：

```js
const API_BASE_URL = 'https://wfr.ccvo.top/api';
```

本地联调时可以临时改为 `http://localhost:3000/api`，并在微信开发者工具中关闭域名校验。

## 上线检查项

- 域名 `wfr.ccvo.top` 已解析到服务器。
- HTTPS 证书已配置并可访问。
- MySQL 已导入 `database.sql`。
- 后端 `.env` 已配置数据库连接、JWT_SECRET、DeepSeek 参数。
- 后端进程监听 `3000` 端口。
- Nginx 已将 `/api` 转发到后端。
- `admin/dist` 已构建并可访问 `/admin`。
- 微信小程序合法 request 域名包含 `https://wfr.ccvo.top`。
- `npm run backend:test` 通过。
- `npm run admin:build` 通过。
