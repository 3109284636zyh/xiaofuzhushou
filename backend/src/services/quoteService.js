function toBudgetNumber(value) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

const QUOTE_RULES = [
  {
    match: /小程序/,
    productType: '微信小程序',
    baseMin: 5000,
    baseMax: 15000,
    durationDays: 18,
    features: ['首页设计', '核心页面开发', '在线咨询表单', '后台录入支持']
  },
  {
    match: /官网|企业/,
    productType: '企业官网',
    baseMin: 3000,
    baseMax: 8000,
    durationDays: 10,
    features: ['首页设计', '产品展示', '案例展示', '联系表单']
  },
  {
    match: /外贸|多语言/,
    productType: '外贸独立站',
    baseMin: 6000,
    baseMax: 18000,
    durationDays: 20,
    features: ['首页设计', '产品目录', '多语言支持', '询盘表单']
  },
  {
    match: /商城|下单|支付/,
    productType: '商城系统',
    baseMin: 8000,
    baseMax: 30000,
    durationDays: 30,
    features: ['首页设计', '商品管理', '订单流程', '营销活动模块']
  }
];

function resolveRule(input) {
  const demand = `${input?.productType || ''} ${input?.demand || ''}`;
  return QUOTE_RULES.find((rule) => rule.match.test(demand)) || QUOTE_RULES[1];
}

export function generateQuote(input = {}) {
  const rule = resolveRule(input);
  const budget = toBudgetNumber(input.budget);
  const priceMin = budget > 0 ? Math.min(rule.baseMin, budget) : rule.baseMin;
  const priceMax = budget > 0 ? Math.max(rule.baseMax, budget) : rule.baseMax;
  const featureSet = [...new Set([...rule.features, '平台内沟通交付说明'])];
  const summary = `${rule.productType}建议按需求分阶段推进，当前报价预计在￥${priceMin}-￥${priceMax}，开发周期约${rule.durationDays}天。`;

  return {
    productType: rule.productType,
    priceRange: `￥${priceMin}-￥${priceMax}`,
    durationDays: rule.durationDays,
    features: featureSet,
    summary,
    orderDraft: {
      status: '待沟通',
      productType: rule.productType,
      budget,
      demand: input.demand || '',
      deadline: input.deadline || ''
    }
  };
}
