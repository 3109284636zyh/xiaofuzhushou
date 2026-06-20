function scoreMessage(message) {
  const text = String(message || '');
  let score = 0;
  const reasons = [];

  if (/预算|一万|万元|5000|8000|10000|预算/.test(text)) {
    score += 2;
    reasons.push('主动提到预算，需求明确度较高');
  }

  if (/本周|尽快|多久|交付|周期|上线/.test(text)) {
    score += 2;
    reasons.push('主动询问周期或交付时间');
  }

  if (/小程序|官网|商城|网站|功能/.test(text)) {
    score += 1;
    reasons.push('已经描述具体建站类型或功能');
  }

  if (/先看看|了解下|有空再说|考虑一下/.test(text)) {
    score -= 2;
    reasons.push('存在明显观望表达');
  }

  return { score, reasons };
}

export function analyzeCustomer(input = {}) {
  const message = input.message || '';
  const { score, reasons } = scoreMessage(message);

  if (score >= 4) {
    return {
      level: 'A',
      label: '高意向客户',
      reasons,
      nextAction: '优先给出报价范围、排期建议，并引导对方继续补充页面和功能细节。'
    };
  }

  if (score >= 2) {
    return {
      level: 'B',
      label: '中意向客户',
      reasons: reasons.length ? reasons : ['已有初步需求，但信息还不够完整'],
      nextAction: '继续追问行业、预算和功能重点，推动需求具体化。'
    };
  }

  return {
    level: 'C',
    label: '低意向客户',
    reasons: reasons.length ? reasons : ['当前需求表达较弱，仍处于了解阶段'],
    nextAction: '先提供简短案例和常见方案，降低沟通门槛。'
  };
}
