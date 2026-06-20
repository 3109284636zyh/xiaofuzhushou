<template>
  <div class="knowledge-grid">
    <section class="page-card">
      <div class="page-header">
        <div>
          <h2>知识分类</h2>
          <p>控制小程序建站助手的栏目。</p>
        </div>
        <el-button type="primary" @click="openCategoryCreate">新增</el-button>
      </div>
      <div class="category-list" v-loading="loadingCategories">
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          :class="{ active: selectedCategoryId === category.id }"
          @click="selectCategory(category.id)"
        >
          <strong>{{ category.name }}</strong>
          <span>{{ category.description }}</span>
        </button>
      </div>
      <div class="table-toolbar" style="justify-content: space-between; margin-top: 18px">
        <el-button :disabled="!selectedCategory" @click="openCategoryEdit">编辑当前分类</el-button>
        <el-button type="danger" plain :disabled="!selectedCategory" @click="deleteCategory">删除分类</el-button>
      </div>
    </section>

    <section class="page-card">
      <div class="page-header">
        <div>
          <h2>知识文章</h2>
          <p>文章会按发布状态展示到小程序，草稿仅后台可见。</p>
        </div>
        <el-button type="primary" :disabled="!selectedCategoryId" @click="openArticleCreate">新增文章</el-button>
      </div>
      <el-table v-loading="loadingArticles" :data="filteredArticles" empty-text="当前分类暂无文章">
        <el-table-column prop="title" label="标题" min-width="190" />
        <el-table-column prop="summary" label="摘要" min-width="240" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="操作" width="170">
          <template #default="{ row }">
            <el-button link type="primary" @click="openArticleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="deleteArticle(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="categoryDialog" :title="categoryForm.id ? '编辑分类' : '新增分类'" width="520px">
      <el-form label-position="top">
        <el-form-item label="分类名称"><el-input v-model="categoryForm.name" /></el-form-item>
        <el-form-item label="唯一标识"><el-input v-model="categoryForm.slug" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="categoryForm.description" /></el-form-item>
        <div class="form-grid">
          <el-form-item label="排序"><el-input-number v-model="categoryForm.sortOrder" style="width:100%" /></el-form-item>
          <el-form-item label="状态"><el-select v-model="categoryForm.status"><el-option label="active" value="active" /><el-option label="disabled" value="disabled" /></el-select></el-form-item>
        </div>
      </el-form>
      <template #footer><el-button @click="categoryDialog=false">取消</el-button><el-button type="primary" :loading="savingCategory" @click="saveCategory">保存分类</el-button></template>
    </el-dialog>

    <el-dialog v-model="articleDialog" :title="articleForm.id ? '编辑文章' : '新增文章'" width="760px">
      <el-form label-position="top">
        <div class="form-grid">
          <el-form-item label="标题"><el-input v-model="articleForm.title" /></el-form-item>
          <el-form-item label="分类"><el-select v-model="articleForm.categoryId"><el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" /></el-select></el-form-item>
          <el-form-item class="wide" label="摘要"><el-input v-model="articleForm.summary" /></el-form-item>
          <el-form-item class="wide" label="正文"><el-input v-model="articleForm.content" type="textarea" :rows="7" /></el-form-item>
          <el-form-item label="标签"><el-input v-model="articleForm.tags" /></el-form-item>
          <el-form-item label="状态"><el-select v-model="articleForm.status"><el-option label="published" value="published" /><el-option label="draft" value="draft" /></el-select></el-form-item>
          <el-form-item label="排序"><el-input-number v-model="articleForm.sortOrder" style="width:100%" /></el-form-item>
        </div>
      </el-form>
      <template #footer><el-button @click="articleDialog=false">取消</el-button><el-button type="primary" :loading="savingArticle" @click="saveArticle">保存文章</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { knowledgeApi } from '../api/modules.js';

const categories = ref([]);
const articles = ref([]);
const selectedCategoryId = ref(null);
const loadingCategories = ref(false);
const loadingArticles = ref(false);
const savingCategory = ref(false);
const savingArticle = ref(false);
const categoryDialog = ref(false);
const articleDialog = ref(false);

const blankCategory = () => ({ id: null, name: '', slug: '', description: '', sortOrder: 0, status: 'active' });
const blankArticle = () => ({ id: null, categoryId: selectedCategoryId.value, title: '', summary: '', content: '', tags: '', sortOrder: 0, status: 'published' });
const categoryForm = reactive(blankCategory());
const articleForm = reactive(blankArticle());

const selectedCategory = computed(() => categories.value.find((item) => item.id === selectedCategoryId.value));
const filteredArticles = computed(() => articles.value.filter((item) => item.categoryId === selectedCategoryId.value));

function assignCategory(data) { Object.assign(categoryForm, blankCategory(), data); }
function assignArticle(data) { Object.assign(articleForm, blankArticle(), data); }
function selectCategory(id) { selectedCategoryId.value = id; }

async function loadCategories() {
  loadingCategories.value = true;
  try {
    categories.value = await knowledgeApi.listCategories();
    if (!selectedCategoryId.value && categories.value.length) selectedCategoryId.value = categories.value[0].id;
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loadingCategories.value = false;
  }
}

async function loadArticles() {
  loadingArticles.value = true;
  try {
    articles.value = await knowledgeApi.listArticles();
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loadingArticles.value = false;
  }
}

function openCategoryCreate() { assignCategory(blankCategory()); categoryDialog.value = true; }
function openCategoryEdit() { if (selectedCategory.value) { assignCategory(selectedCategory.value); categoryDialog.value = true; } }
function openArticleCreate() { assignArticle(blankArticle()); articleDialog.value = true; }
function openArticleEdit(row) { assignArticle(row); articleDialog.value = true; }

async function saveCategory() {
  savingCategory.value = true;
  try {
    categoryForm.id ? await knowledgeApi.updateCategory(categoryForm.id, categoryForm) : await knowledgeApi.createCategory(categoryForm);
    ElMessage.success('分类已保存');
    categoryDialog.value = false;
    await loadCategories();
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    savingCategory.value = false;
  }
}

async function saveArticle() {
  savingArticle.value = true;
  try {
    articleForm.id ? await knowledgeApi.updateArticle(articleForm.id, articleForm) : await knowledgeApi.createArticle(articleForm);
    ElMessage.success('文章已保存');
    articleDialog.value = false;
    await loadArticles();
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    savingArticle.value = false;
  }
}

async function deleteCategory() {
  if (!selectedCategory.value) return;
  await ElMessageBox.confirm(`删除分类「${selectedCategory.value.name}」？`, '删除确认', { type: 'warning' });
  try {
    await knowledgeApi.deleteCategory(selectedCategory.value.id);
    ElMessage.success('分类已删除');
    selectedCategoryId.value = null;
    await loadCategories();
    await loadArticles();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

async function deleteArticle(row) {
  await ElMessageBox.confirm(`删除文章「${row.title}」？`, '删除确认', { type: 'warning' });
  try {
    await knowledgeApi.deleteArticle(row.id);
    ElMessage.success('文章已删除');
    await loadArticles();
  } catch (error) {
    ElMessage.error(error.message);
  }
}

onMounted(async () => {
  await loadCategories();
  await loadArticles();
});
</script>
