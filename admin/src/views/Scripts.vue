<template>
  <section class="page-card">
    <div class="page-header"><div><h2>销售话术库</h2><p>沉淀价格异议、催单、售后和成交话术。</p></div><el-button type="primary" @click="openCreate">新增话术</el-button></div>
    <el-table v-loading="loading" :data="items" empty-text="暂无话术">
      <el-table-column prop="title" label="标题" min-width="180" />
      <el-table-column prop="scriptType" label="类型" width="150" />
      <el-table-column prop="scene" label="场景" min-width="160" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column label="操作" width="170"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑话术' : '新增话术'" width="700px">
      <el-form label-position="top"><div class="form-grid">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="类型"><el-select v-model="form.scriptType"><el-option label="价格异议" value="price_objection" /><el-option label="催单" value="follow_up" /><el-option label="售后" value="after_sales" /><el-option label="成交" value="closing" /></el-select></el-form-item>
        <el-form-item label="场景"><el-input v-model="form.scene" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="form.status"><el-option label="active" value="active" /><el-option label="disabled" value="disabled" /></el-select></el-form-item>
        <el-form-item class="wide" label="话术内容"><el-input v-model="form.content" type="textarea" :rows="6" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" style="width:100%" /></el-form-item>
      </div></el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存话术</el-button></template>
    </el-dialog>
  </section>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { scriptsApi } from '../api/modules.js';
const items=ref([]), loading=ref(false), saving=ref(false), dialogVisible=ref(false);
const blank=()=>({id:null,title:'',scriptType:'price_objection',scene:'',content:'',sortOrder:0,status:'active'}); const form=reactive(blank());
function assignForm(data){Object.assign(form, blank(), data);} async function load(){loading.value=true;try{items.value=await scriptsApi.list();}catch(e){ElMessage.error(e.message);}finally{loading.value=false;}}
function openCreate(){assignForm(blank());dialogVisible.value=true;} function openEdit(row){assignForm(row);dialogVisible.value=true;}
async function save(){saving.value=true;try{form.id?await scriptsApi.update(form.id,form):await scriptsApi.create(form);ElMessage.success('话术已保存');dialogVisible.value=false;await load();}catch(e){ElMessage.error(e.message);}finally{saving.value=false;}}
async function remove(row){await ElMessageBox.confirm(`删除「${row.title}」？`,'删除确认',{type:'warning'});try{await scriptsApi.remove(row.id);ElMessage.success('话术已删除');await load();}catch(e){ElMessage.error(e.message);}}
onMounted(load);
</script>
