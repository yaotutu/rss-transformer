<template>
  <div class="wrap">
    <AddRssSource @rssAdded="fetchRssSourceOptions" />
    <el-divider />
    <RssSourceTable
      :rssSources="rssSourceUrl"
      @rssDeleted="fetchRssSourceOptions"
    />
    <el-divider />
    <AddTask
      :rssSourceUrlOptions="rssSourceUrlOptions"
      @taskAdded="fetchRssSourceOptions"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { rssController } from './services/api';
import AddRssSource from './components/AddRssSource.vue';
import RssSourceTable from './components/RssSourceTable.vue';
import AddTask from './components/AddTask.vue';

const rssSourceUrl = ref([]);
const rssSourceUrlOptions = ref([]);

const fetchRssSourceOptions = async () => {
  const response = await rssController.findAllRss();
  rssSourceUrl.value = response;
  rssSourceUrlOptions.value = response.map((item) => ({
    label: `${item.sourceUrl} / ${item.customName}`,
    value: item.sourceUrl,
    key: item.id,
    sourceUrl: item.sourceUrl,
    rssSourceId: item.id,
  }));
};

onMounted(async () => {
  await fetchRssSourceOptions();
});
</script>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
}
</style>
