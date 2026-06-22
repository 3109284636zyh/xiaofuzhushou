# Admin Account Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the admin web backend so administrators log in with fixed account `admin` and password `aw3109284636`, while the DeepSeek API configuration remains backend-managed and is no longer emphasized as a primary admin action.

**Architecture:** Keep the existing lightweight MVP authentication model: fixed credentials live in backend constants, `/api/auth/login` validates them, and successful login returns the existing JWT used by all `/api/admin/*` routes. The Vue admin SPA adds a username field, sends `{ username, password }`, stores the returned token through the existing API client, and removes the AI configuration page from the main sidebar while keeping its route and files available for future maintenance.

**Tech Stack:** Node.js 18+ `node:test`, Express, `jsonwebtoken`, Vue 3 Composition API, Vue Router, Element Plus, Vite.

## Global Constraints

- Fixed admin account must be exactly `admin`.
- Fixed admin password must be exactly `aw3109284636`.
- Do not add registration, user management, multi-role permissions, password reset, captcha, or SMS login.
- DeepSeek API Key must remain backend-only through `.env` or backend system configuration; the mini program must not expose the full key.
- Do not delete the existing `AiConfig.vue` page or `/ai-config` route in this change; only remove it from the main sidebar navigation.
- Preserve existing JWT flow and 30-minute expiry.
- Preserve existing response shape `{ code, message, data }`.
- Commit steps are documented for handoff, but in an interactive Claude Code session do not run `git commit` unless the user explicitly authorizes committing.

---

## File Structure Map

### Backend

- Modify `backend/src/config/constants.js`: add `ADMIN_USERNAME` and change `ADMIN_PASSWORD` to `aw3109284636`.
- Modify `backend/src/controllers/authController.js`: accept `username` and `password`, validate both, include `username` in the JWT payload and response data.
- Modify `backend/test/appRoutes.test.js`: update successful login calls to include username/password, add wrong username coverage, and update wrong password expectations.

### Admin SPA

- Modify `admin/src/api/modules.js`: change `login(password)` to `login(username, password)` and send both fields to `/auth/login`.
- Modify `admin/src/views/Login.vue`: add username input with default `admin`, validate username and password separately, update copy to say account/password login and backend-hosted AI.
- Modify `admin/src/App.vue`: remove the `AI 配置` item from the sidebar menu while keeping the topbar text that says DeepSeek is backend-hosted.

### Documentation

- Modify `README.md`: update admin credential and wording so it says account `admin`, password `aw3109284636`, and AI config remains backend-hosted.
- Modify `docs/api.md`: update `POST /auth/login` request example and description.
- Modify `docs/deployment.md`: update production safety note with the new admin credentials.

---

### Task 1: Backend Credential Contract

**Files:**
- Modify: `backend/src/config/constants.js`
- Modify: `backend/src/controllers/authController.js`
- Test: `backend/test/appRoutes.test.js`

**Interfaces:**
- Consumes: existing Express route `POST /api/auth/login` mounted from `backend/src/routes/authRoutes.js`.
- Produces: `ADMIN_USERNAME: string`, `ADMIN_PASSWORD: string`, and `login(req, res): Promise<Response>` accepting body `{ username: string, password: string }` and returning data `{ token: string, expiresIn: 1800, adminName: 'AI小福管理员', username: 'admin' }`.

- [ ] **Step 1: Update backend login tests first**

Replace the login-related tests in `backend/test/appRoutes.test.js` with the following exact tests. Keep the health test and admin route tests that are not shown here unchanged.

```js
test('POST /api/auth/login returns jwt for fixed admin account and password', async () => {
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/auth/login`, {
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

    assert.equal(response.status, 200);
    assert.equal(body.code, 0);
    assert.equal(body.data.expiresIn, 1800);
    assert.equal(body.data.adminName, 'AI小福管理员');
    assert.equal(body.data.username, 'admin');
    assert.equal(typeof body.data.token, 'string');

    const decoded = jwt.verify(body.data.token, env.jwtSecret);
    assert.equal(decoded.role, 'admin');
    assert.equal(decoded.username, 'admin');
    assert.equal(decoded.adminName, 'AI小福管理员');
  } finally {
    await server.close();
  }
});

test('POST /api/auth/login rejects wrong username', async () => {
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        username: 'other-admin',
        password: 'aw3109284636'
      })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      code: 40301,
      message: '账号或密码错误',
      data: null
    });
  } finally {
    await server.close();
  }
});

test('POST /api/auth/login rejects wrong password', async () => {
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'bad-password'
      })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      code: 40301,
      message: '账号或密码错误',
      data: null
    });
  } finally {
    await server.close();
  }
});
```

Also update the login request inside `public knowledge endpoints hide unpublished admin articles` so the body is:

```js
body: JSON.stringify({
  username: 'admin',
  password: 'aw3109284636'
})
```

- [ ] **Step 2: Run backend tests and verify the new tests fail**

Run:

```bash
npm run backend:test
```

Expected at this point: at least the updated login success test fails because `body.data.username` is missing, `decoded.username` is missing, or the new password is not accepted yet. The wrong-username test may also fail because the backend does not validate `username` yet.

- [ ] **Step 3: Update fixed admin constants**

Replace the first line of `backend/src/config/constants.js` with:

```js
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'aw3109284636';
```

Leave `JWT_EXPIRES_IN`, `RISK_SYSTEM_PROMPT`, `DEFAULT_FORBIDDEN_WORDS`, `DEFAULT_FALLBACK_TEXT`, and `ERROR_CODES` unchanged.

- [ ] **Step 4: Update the auth controller implementation**

Replace the contents of `backend/src/controllers/authController.js` with:

```js
import jwt from 'jsonwebtoken';
import { ADMIN_PASSWORD, ADMIN_USERNAME, ERROR_CODES, JWT_EXPIRES_IN } from '../config/constants.js';
import env from '../config/env.js';
import { failure, success } from '../utils/response.js';

const ADMIN_NAME = 'AI小福管理员';

export async function login(req, res) {
  const { username = '', password = '' } = req.body || {};

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return failure(res, ERROR_CODES.FORBIDDEN, '账号或密码错误');
  }

  const token = jwt.sign({ role: 'admin', adminName: ADMIN_NAME, username: ADMIN_USERNAME }, env.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN
  });

  return success(res, {
    token,
    expiresIn: 1800,
    adminName: ADMIN_NAME,
    username: ADMIN_USERNAME
  });
}

export default { login };
```

- [ ] **Step 5: Run backend tests and verify they pass**

Run:

```bash
npm run backend:test
```

Expected output includes all backend tests passing. The exact number can vary as the suite grows, but there must be no `fail` lines and the command must exit with status 0.

- [ ] **Step 6: Commit backend credential changes if commits are authorized**

Only run this step if the user has explicitly approved commits in the current session.

```bash
git add backend/src/config/constants.js backend/src/controllers/authController.js backend/test/appRoutes.test.js
git commit -m "feat: require admin account login"
```

---

### Task 2: Admin Login Form and API Request

**Files:**
- Modify: `admin/src/api/modules.js`
- Modify: `admin/src/views/Login.vue`

**Interfaces:**
- Consumes: backend `POST /api/auth/login` body `{ username: string, password: string }` from Task 1.
- Produces: admin API function `login(username: string, password: string): Promise<{ token: string, expiresIn: number, adminName: string, username: string }>` and a login page that validates both fields before calling it.

- [ ] **Step 1: Update the admin login API function**

In `admin/src/api/modules.js`, replace the existing `login` function:

```js
export async function login(password) {
  const data = await apiPost('/auth/login', { password });
  setToken(data.token);
  return data;
}
```

with:

```js
export async function login(username, password) {
  const data = await apiPost('/auth/login', { username, password });
  setToken(data.token);
  return data;
}
```

- [ ] **Step 2: Update `Login.vue` template**

Replace the full contents of `admin/src/views/Login.vue` with:

```vue
<template>
  <div class="login-page">
    <section class="login-card">
      <div class="login-mark">福</div>
      <h1>AI小福管理后台</h1>
      <p>使用后台账号密码登录。AI 能力由后端托管，不需要在登录时填写 API。</p>
      <el-form @submit.prevent="handleLogin">
        <el-form-item label="后台账号">
          <el-input v-model="username" placeholder="请输入账号" autocomplete="username" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item label="登录密码">
          <el-input v-model="password" type="password" placeholder="请输入后台密码" autocomplete="current-password" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-button type="primary" size="large" :loading="loading" style="width: 100%" @click="handleLogin">进入中控台</el-button>
      </el-form>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { login } from '../api/modules.js';

const router = useRouter();
const username = ref('admin');
const password = ref('');
const loading = ref(false);

async function handleLogin() {
  const normalizedUsername = username.value.trim();

  if (!normalizedUsername) {
    ElMessage.warning('请输入后台账号');
    return;
  }

  if (!password.value) {
    ElMessage.warning('请输入后台密码');
    return;
  }

  loading.value = true;
  try {
    await login(normalizedUsername, password.value);
    ElMessage.success('登录成功');
    router.replace('/');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>
```

- [ ] **Step 3: Build the admin app**

Run:

```bash
npm run admin:build
```

Expected output: Vite build completes successfully and creates `admin/dist/index.html`.

- [ ] **Step 4: Commit admin login form changes if commits are authorized**

Only run this step if the user has explicitly approved commits in the current session.

```bash
git add admin/src/api/modules.js admin/src/views/Login.vue
git commit -m "feat: add admin username login form"
```

---

### Task 3: Weaken AI Config Prominence in the Admin Shell

**Files:**
- Modify: `admin/src/App.vue`
- Test: `admin/src/router/index.js` remains unchanged; this task verifies `/ai-config` route still exists by inspection and build.

**Interfaces:**
- Consumes: existing Vue Router route `{ path: '/ai-config', component: AiConfig }` in `admin/src/router/index.js`.
- Produces: sidebar menu array without the `{ path: '/ai-config', label: 'AI 配置', icon: '✧' }` item, while the route remains reachable if directly entered.

- [ ] **Step 1: Remove AI Config from the sidebar menu**

In `admin/src/App.vue`, replace the `menu` array with:

```js
const menu = [
  { path: '/', label: '仪表盘', icon: '◇' },
  { path: '/products', label: '热卖产品', icon: '◆' },
  { path: '/knowledge', label: '知识库', icon: '▣' },
  { path: '/tutorials', label: '教程', icon: '▤' },
  { path: '/scripts', label: '销售话术', icon: '✦' },
  { path: '/orders', label: '订单', icon: '●' }
];
```

Do not change the topbar `signal-card`; it should continue to display:

```vue
<div class="signal-card">
  <span class="signal-dot"></span>
  DeepSeek 托管在后端
</div>
```

- [ ] **Step 2: Confirm the AI config route is still registered**

Open `admin/src/router/index.js` and confirm these lines still exist:

```js
import AiConfig from '../views/AiConfig.vue';
```

and:

```js
{ path: '/ai-config', component: AiConfig }
```

No code change is required in `admin/src/router/index.js` for this task.

- [ ] **Step 3: Build the admin app**

Run:

```bash
npm run admin:build
```

Expected output: Vite build completes successfully. The sidebar should no longer include `AI 配置`, and `/admin/ai-config` should still build because the route remains registered.

- [ ] **Step 4: Commit navigation weakener if commits are authorized**

Only run this step if the user has explicitly approved commits in the current session.

```bash
git add admin/src/App.vue
git commit -m "chore: de-emphasize admin ai config entry"
```

---

### Task 4: Documentation Updates

**Files:**
- Modify: `README.md`
- Modify: `docs/api.md`
- Modify: `docs/deployment.md`

**Interfaces:**
- Consumes: credential and login contract from Tasks 1-3.
- Produces: documentation that matches the implemented account/password login flow and explains that API configuration is backend-hosted.

- [ ] **Step 1: Update README environment notes**

In `README.md`, replace:

```md
- 后台固定密码为 `zyh123456`。
```

with:

```md
- 后台固定账号为 `admin`，固定密码为 `aw3109284636`。
```

Also replace:

```md
- 管理后台：产品、知识库、教程、销售话术、订单、AI 配置和仪表盘。
```

with:

```md
- 管理后台：账号密码登录后管理产品、知识库、教程、销售话术、订单和仪表盘；DeepSeek API 配置由后端托管。
```

- [ ] **Step 2: Update API auth documentation**

In `docs/api.md`, replace the `POST /auth/login` description and request body section:

```md
后台固定密码登录。

请求体：

```json
{
  "password": "zyh123456"
}
```
```

with:

````md
后台固定账号密码登录。

请求体：

```json
{
  "username": "admin",
  "password": "aw3109284636"
}
```
````

In the same success response example, add `username` after `adminName`:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "<jwt>",
    "expiresIn": 1800,
    "adminName": "AI小福管理员",
    "username": "admin"
  }
}
```

- [ ] **Step 3: Update deployment safety note**

In `docs/deployment.md`, replace:

```md
- 后台固定密码保持 `zyh123456`，不要在小程序端添加登录/注册/支付能力。
```

with:

```md
- 后台固定账号保持 `admin`，固定密码保持 `aw3109284636`，不要在小程序端添加登录/注册/支付能力。
```

- [ ] **Step 4: Verify no old password references remain in active files**

Run:

```bash
git grep -n "zyh123456" -- . ':!docs/superpowers/plans/2026-06-20-ai-xiaofu-v3-mvp.md' ':!docs/superpowers/specs/2026-06-20-ai-xiaofu-v3-mvp-design.md'
```

Expected output: no matches. If matches remain in active code or current docs, update them to `admin` / `aw3109284636` as appropriate. Historical design/plan files from 2026-06-20 can remain unchanged because they describe the previous MVP decision.

- [ ] **Step 5: Commit docs changes if commits are authorized**

Only run this step if the user has explicitly approved commits in the current session.

```bash
git add README.md docs/api.md docs/deployment.md
git commit -m "docs: update admin login credentials"
```

---

### Task 5: Final Verification

**Files:**
- Verify: `backend/src/config/constants.js`
- Verify: `backend/src/controllers/authController.js`
- Verify: `backend/test/appRoutes.test.js`
- Verify: `admin/src/api/modules.js`
- Verify: `admin/src/views/Login.vue`
- Verify: `admin/src/App.vue`
- Verify: `README.md`
- Verify: `docs/api.md`
- Verify: `docs/deployment.md`

**Interfaces:**
- Consumes: all outputs from Tasks 1-4.
- Produces: verified admin login behavior and build/test evidence.

- [ ] **Step 1: Run the backend test suite**

Run:

```bash
npm run backend:test
```

Expected output: all tests pass with exit status 0.

- [ ] **Step 2: Run the admin production build**

Run:

```bash
npm run admin:build
```

Expected output: Vite build completes successfully and `admin/dist/index.html` exists.

- [ ] **Step 3: Verify old password does not remain in active files**

Run:

```bash
git grep -n "zyh123456" -- . ':!docs/superpowers/plans/2026-06-20-ai-xiaofu-v3-mvp.md' ':!docs/superpowers/specs/2026-06-20-ai-xiaofu-v3-mvp-design.md'
```

Expected output: no matches.

- [ ] **Step 4: Verify the new backend login contract manually**

Start the backend in one terminal:

```bash
npm run backend:start
```

In another terminal, run:

```bash
node -e "fetch('http://127.0.0.1:3000/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:'admin',password:'aw3109284636'})}).then(r=>r.json()).then(j=>{if(j.code!==0||!j.data?.token||j.data.username!=='admin') throw new Error(JSON.stringify(j)); console.log('admin login ok')})"
```

Expected output:

```text
admin login ok
```

Stop the backend after the check.

- [ ] **Step 5: Review git diff**

Run:

```bash
git diff -- backend/src/config/constants.js backend/src/controllers/authController.js backend/test/appRoutes.test.js admin/src/api/modules.js admin/src/views/Login.vue admin/src/App.vue README.md docs/api.md docs/deployment.md
```

Expected diff summary:

- `ADMIN_USERNAME` exists and `ADMIN_PASSWORD` is `aw3109284636`.
- `login` validates both `username` and `password`.
- Login success response includes `username: 'admin'`.
- Admin login form has both `username` and `password` fields.
- Sidebar menu no longer contains `AI 配置`.
- Docs show account `admin` and password `aw3109284636`.

- [ ] **Step 6: Final commit if commits are authorized and earlier commit steps were skipped**

Only run this step if the user has explicitly approved commits in the current session.

```bash
git add backend/src/config/constants.js backend/src/controllers/authController.js backend/test/appRoutes.test.js admin/src/api/modules.js admin/src/views/Login.vue admin/src/App.vue README.md docs/api.md docs/deployment.md
git commit -m "feat: switch admin to account password login"
```

---

## Self-Review

- Spec coverage: Task 1 implements fixed backend account `admin` and password `aw3109284636`; Task 2 implements the account/password login form; Task 3 weakens the AI config sidebar entry without deleting the route; Task 4 updates public docs; Task 5 verifies tests, build, old credential cleanup, manual login, and diff.
- Placeholder scan: no `TBD`, `TODO`, vague “handle errors” steps, or “similar to” instructions remain. Each code-changing step includes exact code or exact replacement text.
- Type consistency: the plan consistently uses `username` and `password` request fields, `login(username, password)` in the admin API module, JWT payload fields `{ role, adminName, username }`, and response data `{ token, expiresIn, adminName, username }`.
