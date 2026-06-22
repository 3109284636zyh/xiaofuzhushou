<template>
  <div class="login-page">
    <section class="login-card">
      <div class="login-mark">福</div>
      <h1>AI小福管理后台</h1>
      <p>使用后台账号密码登录。AI 能力由后端托管，不需要在登录时填写 API。</p>
      <el-form @submit.prevent="handleLogin">
        <el-form-item label="后台账号">
          <el-input v-model="username" placeholder="请输入账号" autocomplete="username" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item label="登录密码">
          <el-input v-model="password" type="password" placeholder="请输入后台密码" autocomplete="current-password" show-password @keyup.enter="handleLogin" />
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
const username = ref('admin');
const password = ref('');
const loading = ref(false);

async function handleLogin() {
  const normalizedUsername = username.value.trim();

  if (!normalizedUsername) {
    ElMessage.warning('请输入后台账号');
    return;
  }

  if (!password.value) {
    ElMessage.warning('请输入后台密码');
    return;
  }

  loading.value = true;
  try {
    await login(normalizedUsername, password.value);
    ElMessage.success('登录成功');
    router.replace('/');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
}
</script>
