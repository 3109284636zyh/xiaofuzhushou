<template>
  <section class="page-card">
    <div class="page-header"><div><h2>AI 配置</h2><p>DeepSeek Key 仅保存在后端；这里显示配置状态和可编辑风控参数。</p></div><el-button :loading="loading" @click="load">刷新</el-button></div>
    <el-table v-loading="loading" :data="items" empty-text="暂无配置">
      <el-table-column prop="configKey" label="配置项" min-width="180" />
      <el-table-column label="配置值" min-width="220"><template #default="{ row }"><span v-if="row.isSensitive">{{ row.configKey === 'api_key_mask' ? row.configValue : '已隐藏' }}</span><span v-else>{{ row.configValue }}</span></template></el-table-column>
      <el-table-column prop="description" label="说明" min-width="220" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column label="操作" width="110"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button></template></el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" title="编辑 AI 配置" width="620px">
      <el-alert v-if="form.isSensitive" title="敏感配置保存后不会在后台明文展示，请确认只粘贴后端需要的值。" type="warning" show-icon :closable="false" style="margin-bottom:14px" />
      <el-form label-position="top"><div class="form-grid">
        <el-form-item label="配置项"><el-input v-model="form.configKey" disabled /></el-form-item>
        <el-form-item label="类型"><el-input v-model="form.configType" /></el-form-item>
        <el-form-item class="wide" label="配置值"><el-input v-model="form.configValue" :type="form.isSensitive ? 'password' : 'textarea'" :rows="form.isSensitive ? 1 : 4" show-password /></el-form-item>
        <el-form-item label="敏感配置"><el-switch v-model="form.isSensitive" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="form.status"><el-option label="active" value="active" /><el-option label="disabled" value="disabled" /></el-select></el-form-item>
        <el-form-item class="wide" label="说明"><el-input v-model="form.description" /></el-form-item>
      </div></el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存配置</el-button></template>
    </el-dialog>
  </section>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { configApi } from '../api/modules.js';
const items=ref([]), loading=ref(false), saving=ref(false), dialogVisible=ref(false);
const blank=()=>({configKey:'',configValue:'',configType:'string',isSensitive:false,description:'',status:'active'}); const form=reactive(blank());
async function load(){loading.value=true;try{items.value=await configApi.list();}catch(e){ElMessage.error(e.message);}finally{loading.value=false;}}
function openEdit(row){Object.assign(form, blank(), row, { configValue: row.isSensitive && row.configKey !== 'api_key_mask' ? '' : row.configValue }); dialogVisible.value=true;}
async function save(){saving.value=true;try{await configApi.update(form.configKey, form);ElMessage.success('配置已保存');dialogVisible.value=false;await load();}catch(e){ElMessage.error(e.message);}finally{saving.value=false;}}
onMounted(load);
</script>
