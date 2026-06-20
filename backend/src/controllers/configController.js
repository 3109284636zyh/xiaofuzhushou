import { query, queryOne } from '../db/query.js';
import { success } from '../utils/response.js';

const fallbackConfigs = [
  { configKey: 'deepseek_api_key', configValue: '', configType: 'string', isSensitive: true, description: 'DeepSeek API Key（后台保存后不明文展示）', status: 'active' },
  { configKey: 'deepseek_model', configValue: 'deepseek-chat', configType: 'string', isSensitive: false, description: 'DeepSeek 默认模型', status: 'active' },
  { configKey: 'deepseek_timeout_ms', configValue: '5000', configType: 'number', isSensitive: false, description: 'DeepSeek 请求超时时间（毫秒）', status: 'active' },
  { configKey: 'api_key_mask', configValue: '未配置', configType: 'string', isSensitive: true, description: '后台展示时用于标识 DeepSeek Key 状态', status: 'active' }
];

function mapConfig(row) {
  const key = row.config_key ?? row.configKey;
  const sensitive = Boolean(row.is_sensitive ?? row.isSensitive);
  let value = row.config_value ?? row.configValue;

  if (sensitive && key !== 'api_key_mask') {
    value = value ? '已配置' : '未配置';
  }

  return {
    configKey: key,
    configValue: value,
    configType: row.config_type ?? row.configType,
    isSensitive: sensitive,
    description: row.description,
    status: row.status
  };
}

export async function listConfigs(req, res) {
  try {
    const rows = await query('SELECT config_key, config_value, config_type, is_sensitive, description, status FROM system_configs ORDER BY config_key ASC', []);
    return success(res, rows.map(mapConfig));
  } catch {
    return success(res, fallbackConfigs);
  }
}

export async function updateConfig(req, res) {
  const configKey = req.params.configKey;
  const payload = {
    configValue: req.body?.configValue ?? '',
    configType: req.body?.configType || 'string',
    isSensitive: req.body?.isSensitive ? 1 : 0,
    description: req.body?.description || null,
    status: req.body?.status || 'active'
  };

  try {
    await query(
      'UPDATE system_configs SET config_value = ?, config_type = ?, is_sensitive = ?, description = ?, status = ? WHERE config_key = ?',
      [payload.configValue, payload.configType, payload.isSensitive, payload.description, payload.status, configKey]
    );

    let row = await queryOne('SELECT config_key, config_value, config_type, is_sensitive, description, status FROM system_configs WHERE config_key = ?', [configKey]);

    if (!row) {
      await query(
        'INSERT INTO system_configs (config_key, config_value, config_type, is_sensitive, description, status) VALUES (?, ?, ?, ?, ?, ?)',
        [configKey, payload.configValue, payload.configType, payload.isSensitive, payload.description, payload.status]
      );
      row = await queryOne('SELECT config_key, config_value, config_type, is_sensitive, description, status FROM system_configs WHERE config_key = ?', [configKey]);
    }

    return success(res, mapConfig(row));
  } catch {
    const index = fallbackConfigs.findIndex((item) => item.configKey === configKey);
    const updated = mapConfig({
      config_key: configKey,
      config_value: payload.configValue,
      config_type: payload.configType,
      is_sensitive: payload.isSensitive,
      description: payload.description,
      status: payload.status
    });
    if (index >= 0) {
      fallbackConfigs[index] = updated;
    } else {
      fallbackConfigs.push(updated);
    }
    return success(res, updated);
  }
}

export default {
  listConfigs,
  updateConfig
};
