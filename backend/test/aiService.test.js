import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAiReply } from '../src/services/aiService.js';

test('generateAiReply returns fallback when api key is missing', async () => {
  const result = await generateAiReply({
    prompt: '客户问：企业官网大概多少钱？',
    scene: 'assistant'
  }, {
    apiKey: '',
    fetchImpl: async () => {
      throw new Error('fetch should not be called without api key');
    }
  });

  assert.equal(typeof result.text, 'string');
  assert.equal(result.provider, 'deepseek');
  assert.equal(result.fallback, true);
  assert.equal(result.blocked, false);
  assert.deepEqual(result.usage, {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0
  });
});

test('generateAiReply blocks unsafe output and falls back safely', async () => {
  const result = await generateAiReply({
    prompt: '客户想了解建站流程',
    scene: 'assistant'
  }, {
    apiKey: 'test-key',
    timeoutMs: 5000,
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '可以加我微信详细聊，我给你方案。'
            }
          }
        ],
        usage: {
          prompt_tokens: 12,
          completion_tokens: 8,
          total_tokens: 20
        }
      })
    })
  });

  assert.equal(result.provider, 'deepseek');
  assert.equal(result.fallback, true);
  assert.equal(result.blocked, true);
  assert.equal(typeof result.text, 'string');
  assert.equal(result.text.includes('微信'), false);
  assert.deepEqual(result.usage, {
    promptTokens: 12,
    completionTokens: 8,
    totalTokens: 20
  });
});

test('generateAiReply uses runtime config for key model timeout risk prompt forbidden words and fallback', async () => {
  let requestBody;
  const result = await generateAiReply({
    prompt: '客户想看案例',
    scene: 'assistant'
  }, {
    configProvider: async () => ({
      apiKey: 'configured-key',
      model: 'configured-model',
      timeoutMs: 1234,
      riskSystemPrompt: '配置里的平台内提示词',
      forbiddenWords: ['案例站'],
      fallbackText: '配置里的安全兜底'
    }),
    fetchImpl: async (url, options) => {
      requestBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '请看案例站' } }],
          usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 }
        })
      };
    },
    logUsage: async () => {}
  });

  assert.equal(requestBody.model, 'configured-model');
  assert.equal(requestBody.messages[0].content, '配置里的平台内提示词');
  assert.equal(result.text, '配置里的安全兜底');
  assert.equal(result.fallback, true);
  assert.equal(result.blocked, true);
});

test('generateAiReply writes usage log with fallback and failure reason', async () => {
  let logPayload;
  const result = await generateAiReply({
    prompt: '客户问报价',
    scene: 'assistant'
  }, {
    apiKey: '',
    configProvider: async () => ({ apiKey: '' }),
    fetchImpl: async () => {
      throw new Error('fetch should not be called without key');
    },
    logUsage: async (payload) => {
      logPayload = payload;
    }
  });

  assert.equal(result.fallback, true);
  assert.equal(logPayload.scene, 'assistant');
  assert.equal(logPayload.provider, 'deepseek');
  assert.equal(logPayload.fallbackUsed, true);
  assert.equal(logPayload.status, 'failed');
  assert.equal(logPayload.errorCode, '50002');
});
