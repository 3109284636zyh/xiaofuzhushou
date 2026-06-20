import { generateSitePlan } from '../services/planService.js';
import { generateQuote } from '../services/quoteService.js';
import { generateAiReply } from '../services/aiService.js';
import { analyzeCustomer } from '../services/customerService.js';
import { success } from '../utils/response.js';

export async function chat(req, res) {
  const data = await generateAiReply(req.body || {});
  return success(res, data);
}

export async function generateQuoteController(req, res) {
  return success(res, generateQuote(req.body || {}));
}

export async function generatePlanController(req, res) {
  return success(res, generateSitePlan(req.body || {}));
}

export async function analyzeCustomerController(req, res) {
  return success(res, analyzeCustomer(req.body || {}));
}

export default {
  chat,
  generateQuoteController,
  generatePlanController,
  analyzeCustomerController
};
