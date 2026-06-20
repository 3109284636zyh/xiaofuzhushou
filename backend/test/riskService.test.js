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

test('guardOutput blocks email addresses and external links', () => {
  const emailResult = guardOutput('方案可以发到 test@example.com，我整理给你。', undefined, fallback);
  assert.equal(emailResult.blocked, true);
  assert.equal(emailResult.text, fallback);
  assert.ok(emailResult.hits.includes('邮箱地址'));

  const linkResult = guardOutput('你访问 https://example.com 看一下案例。', undefined, fallback);
  assert.equal(linkResult.blocked, true);
  assert.equal(linkResult.text, fallback);
  assert.ok(linkResult.hits.includes('外部链接'));
});
