/** * Component for adding an RSS source. */
<template>
  <div class="rss-wrap">
    <!-- Input for RSS URL -->
    <el-input
      v-model="addRssUrl"
      style="width: 240px"
      placeholder="请输入rss地址"
    />

    <!-- Input for custom name -->
    <el-input
      v-model="addRssCustomName"
      style="width: 240px"
      placeholder="请输入自定义名称"
    />

    <!-- Button to add RSS source -->
    <el-button type="primary" @click="handleClick">添加rss源</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { rssController } from '../services/api';

const addRssUrl = ref('');
const addRssCustomName = ref('');

/**
 * Handles the click event when adding an RSS source.
 * Calls the API to create the RSS source with the provided URL and custom name.
 * Emits an event to notify that an RSS source has been added.
 */
const handleClick = async () => {
  await rssController.createRss({
    sourceUrl: addRssUrl.value,
    customName: addRssCustomName.value,
  });

  // Clear input values
  addRssUrl.value = '';
  addRssCustomName.value = '';

  // Emit event
  emit('rssAdded');
};
</script>
