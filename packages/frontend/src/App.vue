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

  <el-divider />

  <TaskTable :taskSource="taskSource" :fetchTaskSource="fetchTaskSource" />
</template>

/** * The main component of the application. * This component sets up the
necessary imports and initializes the reactive variables. * It also fetches the
RSS source options on component mount. */
<script setup>
import { ref, onMounted, reactive } from 'vue';
import { rssController, taskController } from './services/api';
import AddRssSource from './components/AddRssSource.vue';
import RssSourceTable from './components/RssSourceTable.vue';
import AddTask from './components/AddTask.vue';
import TaskTable from './components/TaskTable.vue';

// Define a reactive variable to store the RSS source URLs
const rssSourceUrl = ref([]);

// Define a reactive variable to store the RSS source URL options
let rssSourceUrlOptions = reactive([]);

// Define a reactive variable to store the task source data
const taskSource = reactive([]);

/**
 * Fetches the RSS source options from the API and updates the reactive variables.
 * This function is called on component mount.
 */
const fetchRssSourceOptions = async () => {
  const response = await rssController.findAllRss();
  rssSourceUrl.value = response;
  rssSourceUrlOptions = response.map((item) => ({
    label: `${item.sourceUrl} / ${item.customName}`,
    value: item.sourceUrl,
    key: item.id,
    sourceUrl: item.sourceUrl,
    rssSourceId: item.id,
    rssItemTag: JSON.parse(item.rssItemTag),
  }));
};

const fetchTaskSource = async () => {
  const response = await taskController.getAllTask();
  Object.assign(taskSource, response);
};

// Call the fetchRssSourceOptions function on component mount
onMounted(async () => {
  await fetchRssSourceOptions();
  await fetchTaskSource();
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
