<script setup>
import { reactive, ref } from 'vue';
import { rssController } from './services/api';

// 使用 ref 创建响应式变量来存储输入框的值
const addRssUrl = ref('');
const addRssCustomName = ref('');
// form表单数据
const taskForm = reactive({
  rssSourceUrl: '',
  rssSourceId: '',
  name: '',
  schedule: '',
  taskType: '',
  functionName: '',
  taskData: '',
  immediate: '',
});
// rss源下拉列表数据
const rssSourceUrlOptions = ref([{ label: 'label', value: 'value' }]);
let rssSourceUrl = ref([]);

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

// 初始化获取数据
const fetchRssSourceOptions = async () => {
  const response = await rssController.findAllRss();
  rssSourceUrl.value = response;
  rssSourceUrlOptions.value = response.map((item) => {
    return {
      label: `${item.sourceUrl} / ${item.customName}`,
      value: item.sourceUrl,
      key: item.id,
    };
  });
};

const onSubmit = () => {
  console.log('submit!');
};

// 处理按钮点击事件，获取输入框的数据并打印到控制台
const handleClick = async () => {
  const res = await rssController.createRss({
    sourceUrl: addRssUrl.value,
    customName: addRssCustomName.value,
  });
  console.log(addRssInput.value);
};

const handleRefresh = async () => {
  // log('refresh');
  await fetchRssSourceOptions();
};
</script>

<template>
  <div class="wrap">
    <div>添加rss源</div>
    <el-divider />
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
      <!-- 绑定按钮的点击事件 -->
      <el-button type="primary" @click="handleClick">添加rss源</el-button>
    </div>
    <el-divider />

    <el-table :data="rssSourceUrl" style="width: 100%">
      <el-table-column prop="customName" label="自定义别名" width="150" />
      <el-table-column prop="sourceUrl" label="url地址" width="280" />
      <el-table-column prop="createdAt" label="创建时间" />
    </el-table>
    <el-divider />
    <el-divider />

    <div class="task-wrap">
      <div class="header">
        <div>
          添加任务(任务的添加是基于rss源的，添加任务之前需要先添加rss源)
        </div>
        <el-button type="primary" @click="handleRefresh">刷新rss源</el-button>
      </div>

      <el-divider />

      <div>
        <el-form :inline="true" :model="taskForm" class="">
          <el-form-item>
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

          <el-form-item>
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
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;

  .task-wrap {
    display: flex;
    flex-direction: column;

    .header {
      display: flex;
      flex-direction: row;
    }
  }
}
</style>
