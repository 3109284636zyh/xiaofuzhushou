import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import env from '../src/config/env.js';

async function startTestServer() {
  const app = createApp();
  const server = http.createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    })
  };
}

test('GET /api/health returns ok payload', async () => {
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      code: 0,
      message: 'success',
      data: {
        status: 'ok'
      }
    });
  } finally {
    await server.close();
  }
});

test('POST /api/auth/login returns jwt for fixed password', async () => {
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        password: 'zyh123456'
      })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.code, 0);
    assert.equal(body.data.expiresIn, 1800);
    assert.equal(body.data.adminName, 'AI小福管理员');
    assert.equal(typeof body.data.token, 'string');

    const decoded = jwt.verify(body.data.token, env.jwtSecret);
    assert.equal(decoded.role, 'admin');
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
        password: 'bad-password'
      })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      code: 40301,
      message: '密码错误',
      data: null
    });
  } finally {
    await server.close();
  }
});

test('GET /api/admin/dashboard requires bearer token', async () => {
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/admin/dashboard`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.deepEqual(body, {
      code: 40101,
      message: '后台登录失效',
      data: null
    });
  } finally {
    await server.close();
  }
});

test('public knowledge endpoints hide unpublished admin articles', async () => {
  const server = await startTestServer();

  try {
    const loginResponse = await fetch(`${server.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        password: 'zyh123456'
      })
    });
    const loginBody = await loginResponse.json();
    const token = loginBody.data.token;

    const createResponse = await fetch(`${server.baseUrl}/api/admin/knowledge/articles`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        categoryId: 1,
        title: '内部草稿文章',
        summary: '这篇文章不应该展示给小程序端',
        content: '草稿内容',
        tags: '草稿',
        sortOrder: 99,
        status: 'draft'
      })
    });
    const createBody = await createResponse.json();
    assert.equal(createBody.code, 0);

    const listResponse = await fetch(`${server.baseUrl}/api/knowledge/articles`);
    const listBody = await listResponse.json();
    assert.equal(listBody.code, 0);
    assert.equal(listBody.data.some((article) => article.title === '内部草稿文章'), false);

    const detailResponse = await fetch(`${server.baseUrl}/api/knowledge/articles/${createBody.data.id}`);
    const detailBody = await detailResponse.json();
    assert.equal(detailBody.code, 40401);
  } finally {
    await server.close();
  }
});
