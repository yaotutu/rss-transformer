// src/task-mapping.ts
export const taskMapping = {
  TRANSLATE: {
    functionName: 'translateTask',
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
  SUMMRIZE: {
    functionName: 'summarizeTask',
    taskData: {
      model: 'OpenAI',
    },
  },
  // Add more mappings as needed
};
