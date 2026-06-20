import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '../api/client.js';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Products from '../views/Products.vue';
import Knowledge from '../views/Knowledge.vue';
import Tutorials from '../views/Tutorials.vue';
import Scripts from '../views/Scripts.vue';
import Orders from '../views/Orders.vue';
import AiConfig from '../views/AiConfig.vue';

const routes = [
  { path: '/login', component: Login, meta: { public: true } },
  { path: '/', component: Dashboard },
  { path: '/products', component: Products },
  { path: '/knowledge', component: Knowledge },
  { path: '/tutorials', component: Tutorials },
  { path: '/scripts', component: Scripts },
  { path: '/orders', component: Orders },
  { path: '/ai-config', component: AiConfig }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to) => {
  if (!to.meta.public && !getToken()) {
    return '/login';
  }
  if (to.path === '/login' && getToken()) {
    return '/';
  }
  return true;
});

export default router;
