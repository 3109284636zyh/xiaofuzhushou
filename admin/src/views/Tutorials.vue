<template>
  <section class="page-card">
    <div class="page-header"><div><h2>教程管理</h2><p>维护域名、服务器、WordPress、小程序备案和 SEO 教程。</p></div><el-button type="primary" @click="openCreate">新增教程</el-button></div>
    <el-table v-loading="loading" :data="items" empty-text="暂无教程">
      <el-table-column prop="title" label="标题" min-width="180" />
      <el-table-column prop="summary" label="摘要" min-width="240" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="110" />
      <el-table-column prop="sortOrder" label="排序" width="90" />
      <el-table-column label="操作" width="170"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑教程' : '新增教程'" width="720px">
      <el-form label-position="top"><div class="form-grid">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="form.status"><el-option label="published" value="published" /><el-option label="draft" value="draft" /></el-select></el-form-item>
        <el-form-item class="wide" label="摘要"><el-input v-model="form.summary" /></el-form-item>
        <el-form-item class="wide" label="正文"><el-input v-model="form.content" type="textarea" :rows="6" /></el-form-item>
        <el-form-item label="封面 URL"><el-input v-model="form.coverUrl" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" style="width:100%" /></el-form-item>
      </div></el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存教程</el-button></template>
    </el-dialog>
  </section>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { tutorialsApi } from '../api/modules.js';
const items=ref([]), loading=ref(false), saving=ref(false), dialogVisible=ref(false);
const blank=()=>({id:null,title:'',summary:'',content:'',coverUrl:'',sortOrder:0,status:'published'}); const form=reactive(blank());
function assignForm(data){Object.assign(form, blank(), data);} async function load(){loading.value=true;try{items.value=await tutorialsApi.list();}catch(e){ElMessage.error(e.message);}finally{loading.value=false;}}
function openCreate(){assignForm(blank());dialogVisible.value=true;} function openEdit(row){assignForm(row);dialogVisible.value=true;}
async function save(){saving.value=true;try{form.id?await tutorialsApi.update(form.id,form):await tutorialsApi.create(form);ElMessage.success('教程已保存');dialogVisible.value=false;await load();}catch(e){ElMessage.error(e.message);}finally{saving.value=false;}}
async function remove(row){await ElMessageBox.confirm(`删除「${row.title}」？`,'删除确认',{type:'warning'});try{await tutorialsApi.remove(row.id);ElMessage.success('教程已删除');await load();}catch(e){ElMessage.error(e.message);}}
onMounted(load);
</script>
