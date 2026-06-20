<template>
  <section class="page-card">
    <div class="page-header">
      <div>
        <h2>今日接单雷达</h2>
        <p>把 AI 回复、报价、订单状态和热卖产品放在同一张工作台。</p>
      </div>
      <el-button :loading="loading" @click="loadData">刷新数据</el-button>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">今日 AI 调用</div>
        <div class="stat-value">{{ stats.todayAiCalls }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">今日报价</div>
        <div class="stat-value">{{ stats.todayQuoteCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">AI 失败</div>
        <div class="stat-value">{{ stats.aiFailureCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">订单状态</div>
        <div class="stat-value">{{ stats.orderStatus.length }}</div>
      </div>
    </div>

    <el-row :gutter="18" style="margin-top: 18px">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>订单状态</template>
          <el-table :data="stats.orderStatus" empty-text="暂无订单">
            <el-table-column prop="status" label="状态" />
            <el-table-column prop="count" label="数量" width="120" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>热卖产品排行</template>
          <el-table :data="stats.hotProducts" empty-text="暂无产品">
            <el-table-column prop="name" label="产品" />
            <el-table-column prop="clicks" label="点击" width="120" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { dashboardApi } from '../api/modules.js';

const loading = ref(false);
const stats = reactive({
  todayAiCalls: 0,
  todayQuoteCount: 0,
  aiFailureCount: 0,
  orderStatus: [],
  hotProducts: []
});

async function loadData() {
  loading.value = true;
  try {
    const data = await dashboardApi.get();
    Object.assign(stats, data);
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>
