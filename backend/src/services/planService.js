function toBudgetNumber(value) {
  const digits = String(value || '').replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

function resolveSiteType(input) {
  const text = `${input?.industry || ''} ${input?.requirements || ''}`;

  if (/小程序/.test(text)) {
    return '微信小程序';
  }

  if (/商城|下单|支付/.test(text)) {
    return '营销型商城站';
  }

  if (/外贸|多语言/.test(text)) {
    return '外贸展示站';
  }

  return '企业展示站';
}

export function generateSitePlan(input = {}) {
  const siteType = resolveSiteType(input);
  const budget = toBudgetNumber(input.budget);
  const pages = ['首页', '产品中心', '案例展示', '关于我们', '联系我们'];
  const features = ['响应式展示', '产品分类管理', '在线咨询表单', 'SEO基础设置'];
  const durationDays = siteType === '微信小程序' ? 18 : 12;
  const minPrice = budget > 0 ? Math.min(4000, budget) : 4000;
  const maxPrice = budget > 0 ? Math.max(9000, budget) : 9000;
  const industry = input.industry || '当前行业';
  const proposal = `${industry}项目建议采用${siteType}方案，优先突出核心产品、案例背书和平台内咨询转化，首期先完成基础展示与咨询闭环。`;

  return {
    siteType,
    pages,
    features,
    durationDays,
    priceRange: `￥${minPrice}-￥${maxPrice}`,
    proposal
  };
}
