// src/task-mapping.ts
export const taskMapping = {
  TRANSLATE: {
    functionName: 'translateFunction',
    taskData: {
      model: 'OpenAI',
      originLang: '英文',
      targetLang: '简体中文',
      customPrompt: '',
    },
  },
  UPDATE_RSS_ITEMS: {
    functionName: 'updateRssItemsFunction',
    taskData: {
      updateFrequency: 'daily',
      filterKeywords: [],
    },
  },
  // Add more mappings as needed
};
