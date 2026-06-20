<template>
  <section class="page-card">
    <div class="page-header">
      <div><h2>热卖产品库</h2><p>维护小程序首页和报价系统使用的建站产品。</p></div>
      <el-button type="primary" @click="openCreate">新增产品</el-button>
    </div>
    <el-table v-loading="loading" :data="items" empty-text="暂无产品">
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="type" label="类型" width="130" />
      <el-table-column label="价格区间" width="160"><template #default="{ row }">￥{{ row.priceMin }} - ￥{{ row.priceMax }}</template></el-table-column>
      <el-table-column prop="durationDays" label="周期/天" width="90" />
      <el-table-column prop="isHot" label="热卖" width="90"><template #default="{ row }"><el-tag :type="row.isHot ? 'success' : 'info'">{{ row.isHot ? '是' : '否' }}</el-tag></template></el-table-column>
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column label="操作" width="170" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑产品' : '新增产品'" width="620px">
      <el-form label-position="top">
        <div class="form-grid">
          <el-form-item label="产品名称"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="类型"><el-input v-model="form.type" /></el-form-item>
          <el-form-item label="最低价"><el-input-number v-model="form.priceMin" :min="0" style="width:100%" /></el-form-item>
          <el-form-item label="最高价"><el-input-number v-model="form.priceMax" :min="0" style="width:100%" /></el-form-item>
          <el-form-item label="开发周期/天"><el-input-number v-model="form.durationDays" :min="0" style="width:100%" /></el-form-item>
          <el-form-item label="排序"><el-input-number v-model="form.sortOrder" style="width:100%" /></el-form-item>
          <el-form-item label="状态"><el-select v-model="form.status"><el-option label="active" value="active" /><el-option label="disabled" value="disabled" /></el-select></el-form-item>
          <el-form-item label="是否热卖"><el-switch v-model="form.isHot" /></el-form-item>
          <el-form-item class="wide" label="推荐描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        </div>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存产品</el-button></template>
    </el-dialog>
  </section>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { productsApi } from '../api/modules.js';
const items = ref([]); const loading = ref(false); const saving = ref(false); const dialogVisible = ref(false);
const blank = () => ({ id:null, name:'', type:'website', priceMin:0, priceMax:0, durationDays:7, description:'', isHot:true, sortOrder:0, status:'active' });
const form = reactive(blank());
function assignForm(data){ Object.assign(form, blank(), data); }
async function load(){ loading.value=true; try{ items.value=await productsApi.list(); }catch(e){ ElMessage.error(e.message); }finally{ loading.value=false; }}
function openCreate(){ assignForm(blank()); dialogVisible.value=true; }
function openEdit(row){ assignForm(row); dialogVisible.value=true; }
async function save(){ saving.value=true; try{ if(form.id) await productsApi.update(form.id, form); else await productsApi.create(form); ElMessage.success('产品已保存'); dialogVisible.value=false; await load(); }catch(e){ ElMessage.error(e.message); }finally{ saving.value=false; }}
async function remove(row){ await ElMessageBox.confirm(`删除「${row.name}」？`, '删除确认', { type:'warning' }); try{ await productsApi.remove(row.id); ElMessage.success('产品已删除'); await load(); }catch(e){ ElMessage.error(e.message); }}
onMounted(load);
</script>
