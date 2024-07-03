<template>
  <el-table :data="rssSources" style="width: 100%">
    <el-table-column prop="customName" label="自定义别名" width="150" />
    <el-table-column prop="sourceUrl" label="url地址" width="280" />
    <el-table-column prop="createdAt" label="创建时间" />
    <el-table-column label="操作">
      <template #default="scope">
        <el-button size="small" disabled> Edit</el-button>
        <el-button
          size="small"
          type="danger"
          @click="handleRssSourceDelete(scope.$index, scope.row)"
        >
          Delete
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { rssController } from './../services/api';
const props = defineProps({
  rssSources: Array,
});
const emit = defineEmits(['rssDeleted']);

const handleRssSourceDelete = async (index, row) => {
  await rssController.deleteRss([row.id]);
  props.rssSources.splice(index, 1);
  emit('rssDeleted');
};
</script>
