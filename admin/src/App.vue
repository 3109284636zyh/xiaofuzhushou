<template>
  <router-view v-if="isLoginPage" />
  <div v-else class="admin-shell">
    <aside class="sidebar glass-panel">
      <div class="brand-block">
        <div class="brand-orb">福</div>
        <div>
          <div class="brand-title">AI小福</div>
          <div class="brand-subtitle">建站接单中控台</div>
        </div>
      </div>

      <nav class="nav-list">
        <router-link v-for="item in menu" :key="item.path" :to="item.path" class="nav-item">
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="safe-badge">平台内风控已启用</div>
        <button class="logout-button" @click="logout">退出后台</button>
      </div>
    </aside>

    <main class="main-stage">
      <header class="topbar glass-panel">
        <div>
          <p class="eyebrow">wfr.ccvo.top</p>
          <h1>{{ currentTitle }}</h1>
        </div>
        <div class="signal-card">
          <span class="signal-dot"></span>
          DeepSeek 托管在后端
        </div>
      </header>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clearToken } from './api/client.js';

const route = useRoute();
const router = useRouter();

const menu = [
  { path: '/', label: '仪表盘', icon: '◇' },
  { path: '/products', label: '热卖产品', icon: '◆' },
  { path: '/knowledge', label: '知识库', icon: '▣' },
  { path: '/tutorials', label: '教程', icon: '▤' },
  { path: '/scripts', label: '销售话术', icon: '✦' },
  { path: '/orders', label: '订单', icon: '●' }
];

const hiddenTitles = {
  '/ai-config': 'AI 配置'
};

const isLoginPage = computed(() => route.path === '/login');
const currentTitle = computed(() => menu.find((item) => item.path === route.path)?.label || hiddenTitles[route.path] || 'AI小福管理后台');

function logout() {
  clearToken();
  router.replace('/login');
}
</script>
