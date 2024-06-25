<template>
  <div class="rss-wrap">
    <el-input
      v-model="addRssUrl"
      style="width: 240px"
      placeholder="请输入rss地址"
    />
    <el-input
      v-model="addRssCustomName"
      style="width: 240px"
      placeholder="请输入自定义名称"
    />
    <el-button type="primary" @click="handleClick">添加rss源</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { rssController } from '../services/api';

const addRssUrl = ref('');
const addRssCustomName = ref('');

const handleClick = async () => {
  await rssController.createRss({
    sourceUrl: addRssUrl.value,
    customName: addRssCustomName.value,
  });
  addRssUrl.value = '';
  addRssCustomName.value = '';
  emit('rssAdded');
};
</script>
