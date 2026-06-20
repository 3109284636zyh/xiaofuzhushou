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

test('runTool maps mini program domain and analysis keys to clear titles', () => {
  const domain = runTool('domain', { domain: 'example.com' });
  assert.equal(domain.toolKey, 'domain');
  assert.equal(domain.title, '域名查询');

  const analysis = runTool('analysis', { domain: 'example.com' });
  assert.equal(analysis.toolKey, 'analysis');
  assert.equal(analysis.title, '网站分析');
});
