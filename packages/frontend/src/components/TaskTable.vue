<template>
  <!-- 
            {
            "id": 12,
            "name": "megaphone",
            "schedule": "* * * * *",
            "taskType": "TRANSLATE",
            "rssItemTag": "[\"description\",\"content:encoded\",\"title\"]",
            "functionName": "genericLlm",
            "taskData": "{\"model\":\"OpenAI\",\"originLang\":\"英文\",\"targetLang\":\"简体中文\",\"customPrompt\":\"\"}",
            "createdAt": "2024-06-27T05:42:05.218Z",
            "updatedAt": "2024-06-27T05:42:05.218Z",
            "immediate": true,
            "status": "PENDING",
            "rssSourceId": 15,
            "rssSourceUrl": "https://feeds.megaphone.fm/newheights"
        }
             -->
  <el-table :data="taskSource" style="width: 100%">
    <el-table-column prop="id" label="ID" width="150" />
    <el-table-column prop="name" label="任务名称" width="150" />
    <el-table-column prop="schedule" label="定时任务" width="150" />
    <el-table-column prop="taskType" label="任务类型" width="150" />
    <el-table-column prop="rssItemTag" label="需要处理的tag" width="150" />
    <el-table-column prop="taskData" label="任务数据" width="150" />
    <el-table-column prop="createdAt" label="创建时间" width="150" />
    <el-table-column prop="updatedAt" label="更新时间" width="150" />
    <el-table-column prop="immediate" label="是否立即执行" width="150" />
    <el-table-column prop="status" label="任务状态" width="150" />

    <el-table-column label="操作">
      <template #default="scope">
        <el-button size="small" disabled> Edit</el-button>
        <el-button
          size="small"
          type="danger"
          @click="handleTaskSourceDelete(scope.$index, scope.row)"
        >
          Delete
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-button @click="fetchTaskSource"> 刷新列表 </el-button>
</template>

<script setup>
import { taskController } from '@/services/api';

const props = defineProps({
  taskSource: {
    type: Array,
    required: true,
  },
  fetchTaskSource: {
    type: Function,
    required: true,
  },
});

const handleTaskSourceDelete = (index, row) => {
  console.log(row.id);
  taskController.deleteTask([row.id]);
};
</script>
