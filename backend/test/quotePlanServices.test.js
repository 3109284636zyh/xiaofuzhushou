import test from 'node:test';
import assert from 'node:assert/strict';
import { generateQuote } from '../src/services/quoteService.js';
import { generateSitePlan } from '../src/services/planService.js';

test('generateQuote returns price, duration, features, and draft order', () => {
  const result = generateQuote({ demand: '我要做企业官网，包含首页、产品、案例、联系表单', budget: '5000' });
  assert.equal(result.productType, '企业官网');
  assert.match(result.priceRange, /￥/);
  assert.ok(result.durationDays >= 7);
  assert.ok(result.features.includes('首页设计'));
  assert.equal(result.orderDraft.status, '待沟通');
});

test('generateSitePlan returns pages, features, duration, price, and proposal', () => {
  const result = generateSitePlan({ industry: '机械设备', budget: '8000', requirements: '展示产品和案例，方便客户咨询' });
  assert.ok(result.pages.includes('首页'));
  assert.ok(result.features.includes('在线咨询表单'));
  assert.match(result.priceRange, /￥/);
  assert.match(result.proposal, /机械设备/);
});
