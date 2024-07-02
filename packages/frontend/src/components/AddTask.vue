<template>
  <div class="task-wrap">
    <div class="header">
      <div>添加任务(任务的添加是基于rss源的，添加任务之前需要先添加rss源)</div>
      <el-button type="primary" @click="$emit('taskAdded')"
        >刷新rss源</el-button
      >
    </div>

    <el-divider />

    <el-form :inline="true" :model="taskForm" class="" label-position="top">
      <el-form-item label="任务名称">
        <el-input
          v-model="taskForm.name"
          placeholder="可以用于获取最后生成的rss"
        />
      </el-form-item>
      <el-form-item label="rss源">
        <el-select
          v-model="taskForm.rssSourceUrl"
          placeholder="请选择rss源"
          style="width: 150px"
        >
          <el-option
            v-for="item in rssSourceUrlOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="tag">
        <el-select
          v-model="taskForm.rssItemTag"
          placeholder="选择要处理的rss tag"
          style="width: 180px"
          multiple
          collapse-tags
          clearable
        >
          <el-option
            v-for="(option, index) in rssItemTagOptions"
            :key="index"
            :label="option"
            :value="option"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="任务间隔">
        <el-select
          v-model="taskForm.schedule"
          placeholder="选择任务执行周期"
          style="width: 180px"
        >
          <el-option
            v-for="option in taskCornOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="任务类型">
        <el-select
          v-model="taskForm.taskType"
          placeholder="选择任务类型"
          style="width: 180px"
        >
          <el-option
            key="TRANSLATE"
            label="翻译任务"
            value="TRANSLATE"
          ></el-option>
          <el-option key="CUSTOM" label="自定义任务" value="CUSTOM"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="立即执行">
        <el-select
          v-model="taskForm.immediate"
          placeholder="是否立即执行"
          style="width: 180px"
        >
          <el-option key="1" label="是" :value="true"></el-option>
          <el-option key="0" label="否" :value="false"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="任务数据">
        <el-input
          v-model="taskForm.taskData"
          placeholder="接受一个json字符串"
        />
      </el-form-item>
      <!-- <el-form-item label="id"> -->
      <!--   <el-input v-model="taskForm.id" placeholder="从任务列表中获取" /> -->
      <!-- </el-form-item> -->
    </el-form>
    <el-button @click="handleTaskSubmit('add')">添加任务</el-button>
    <!-- <el-button @click="handleTaskSubmit('edit')">修改任务</el-button> -->
  </div>
</template>

<script setup>
import { taskController } from '@/services/api';
import { reactive, computed } from 'vue';
const props = defineProps({
  rssSourceUrlOptions: Array,
});

const rssItemTagOptions = computed(() => {
  if (taskForm.rssSourceUrl) {
    return props.rssSourceUrlOptions.find(
      (item) => item.value === taskForm.rssSourceUrl,
    ).rssItemTag;
  }
});

const taskCornOptions = [
  { label: '每15分钟', value: '*/15 * * * *' },
  { label: '每30分钟', value: '*/30 * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每3小时', value: '0 */3 * * *' },
  { label: '每6小时', value: '0 */6 * * *' },
  { label: '每12小时', value: '0 */12 * * *' },
  { label: '每天', value: '0 0 * * *' },
  { label: '每两天', value: '0 0 */2 * *' },
  { label: '每三天', value: '0 0 */3 * *' },
  { label: '每五天', value: '0 0 */5 * *' },
  { label: '每周', value: '0 0 * * 0' },
];

const emit = defineEmits(['taskAdded']);

const taskForm = reactive({
  id: '',
  rssSourceUrl: '',
  rssSourceId: '',
  name: '',
  schedule: '',
  taskType: '',
  functionName: '',
  taskData: '',
  immediate: undefined,
  rssItemTag: [],
});

const handleTaskSubmit = (action) => {
  let {
    rssSourceUrl,
    name,
    schedule,
    taskType,
    functionName,
    immediate,
    rssItemTag,
  } = taskForm;

  const rssSourceId = props.rssSourceUrlOptions.find(
    (item) => item.value === rssSourceUrl,
  ).key;
  if (action === 'add') {
    taskController.updateTask({
      rssSourceUrl,
      rssSourceId,
      name,
      schedule,
      taskType,
      functionName,
      immediate,
      rssItemTag,
    });
    return;
  } else {
    taskController.updateTask(taskForm.id, {
      rssSourceUrl,
      rssSourceId,
      name,
      schedule,
      taskType,
      functionName,
      immediate,
      rssItemTag,
    });
  }
  emit('taskAdded');
};
console.log('app task is loaded');
</script>

<style scoped>
.task-wrap {
  display: flex;
  flex-direction: column;

  .header {
    display: flex;
    flex-direction: row;
  }
}
</style>
