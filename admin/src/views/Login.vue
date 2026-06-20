<template>
  <div class="login-page">
    <section class="login-card">
      <div class="login-mark">福</div>
      <h1>AI小福管理后台</h1>
      <p>后台固定密码登录。DeepSeek 密钥由后端安全托管，小程序端不会暴露。</p>
      <el-form @submit.prevent="handleLogin">
        <el-form-item label="登录密码">
          <el-input v-model="password" type="password" placeholder="请输入后台密码" show-password @keyup.enter="handleLogin" />
        </el-form-item>
        <el-button type="primary" size="large" :loading="loading" style="width: 100%" @click="handleLogin">进入中控台</el-button>
      </el-form>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { login } from '../api/modules.js';

const router = useRouter();
const password = ref('');
const loading = ref(false);

async function handleLogin() {
  if (!password.value) {
    ElMessage.warning('请输入后台密码');
    return;
  }
  loading.value = true;
  try {
    await login(password.value);
    ElMessage.success('登录成功');
    router.replace('/');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>
