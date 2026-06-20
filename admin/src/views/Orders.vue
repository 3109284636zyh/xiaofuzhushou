<template>
  <section class="page-card">
    <div class="page-header"><div><h2>订单管理中心</h2><p>跟踪待沟通、已报价、待付款、开发中和已完成订单。</p></div><el-button type="primary" @click="openCreate">新增订单</el-button></div>
    <el-table v-loading="loading" :data="items" empty-text="暂无订单">
      <el-table-column prop="customerName" label="客户" width="120" />
      <el-table-column prop="productType" label="类型" width="130" />
      <el-table-column prop="demandSummary" label="需求" min-width="220" show-overflow-tooltip />
      <el-table-column label="报价" width="160"><template #default="{ row }">￥{{ row.quotedPriceMin }} - ￥{{ row.quotedPriceMax }}</template></el-table-column>
      <el-table-column prop="status" label="状态" width="110" />
      <el-table-column label="操作" width="170"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑订单' : '新增订单'" width="720px">
      <el-form label-position="top"><div class="form-grid">
        <el-form-item label="客户称呼"><el-input v-model="form.customerName" /></el-form-item>
        <el-form-item label="平台内联系标记"><el-input v-model="form.customerContactMask" /></el-form-item>
        <el-form-item label="产品类型"><el-input v-model="form.productType" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="form.status"><el-option v-for="s in statuses" :key="s" :label="s" :value="s" /></el-select></el-form-item>
        <el-form-item label="最低报价"><el-input-number v-model="form.quotedPriceMin" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="最高报价"><el-input-number v-model="form.quotedPriceMax" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="开发周期/天"><el-input-number v-model="form.durationDays" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="来源"><el-select v-model="form.source"><el-option label="manual" value="manual" /><el-option label="quote" value="quote" /></el-select></el-form-item>
        <el-form-item class="wide" label="需求摘要"><el-input v-model="form.demandSummary" type="textarea" :rows="3" /></el-form-item>
        <el-form-item class="wide" label="备注"><el-input v-model="form.note" type="textarea" :rows="2" /></el-form-item>
      </div></el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存订单</el-button></template>
    </el-dialog>
  </section>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ordersApi } from '../api/modules.js';
const statuses=['待沟通','已报价','待付款','开发中','已完成'];
const items=ref([]), loading=ref(false), saving=ref(false), dialogVisible=ref(false);
const blank=()=>({id:null,customerName:'',customerContactMask:'平台内咨询',productType:'website',demandSummary:'',quotedPriceMin:0,quotedPriceMax:0,durationDays:7,status:'待沟通',source:'manual',note:''}); const form=reactive(blank());
function assignForm(data){Object.assign(form, blank(), data);} async function load(){loading.value=true;try{items.value=await ordersApi.list();}catch(e){ElMessage.error(e.message);}finally{loading.value=false;}}
function openCreate(){assignForm(blank());dialogVisible.value=true;} function openEdit(row){assignForm(row);dialogVisible.value=true;}
async function save(){saving.value=true;try{form.id?await ordersApi.update(form.id,form):await ordersApi.create(form);ElMessage.success('订单已保存');dialogVisible.value=false;await load();}catch(e){ElMessage.error(e.message);}finally{saving.value=false;}}
async function remove(row){await ElMessageBox.confirm(`删除「${row.customerName}」的订单？`,'删除确认',{type:'warning'});try{await ordersApi.remove(row.id);ElMessage.success('订单已删除');await load();}catch(e){ElMessage.error(e.message);}}
onMounted(load);
</script>
