



 ## 配置千帆模型
 export QIANFAN_ACCESS_KEY="your_access_key"
 export QIANFAN_SECRET_KEY="your_secret_key"


## 自定义任务配置指南

本指南旨在帮助您配置和使用自定义任务。自定义任务允许您根据特定需求执行预定义的函数，如 `genericLlm`，这是一个通用的大型语言模型函数。

## 快速示例

以下是一个自定义任务的配置示例，展示了如何设置和调用 `genericLlm` 函数。

```javascript
{
  // 函数名称
  functionName: "genericLlm",
  // 函数参数
  taskData: {
    model: "OpenAI",
    originLang: "英文",
    targetLang: "简体中文",
    customPrompt: "", // 当前不支持自定义提示
  },
}
```

## 参数详解

### genericLlm 函数

`genericLlm` 函数支持以下参数：

- **model** (字符串): 使用的模型名称，例如 `"OpenAI"`。
- **originLang** (字符串): 原始语言，例如 `"英文"`。
- **targetLang** (字符串): 目标语言，例如 `"简体中文"`。
- **customPrompt** (字符串): 自定义提示，当前版本暂不支持。

## 使用说明

1. **选择函数**：根据需要执行的任务选择相应的函数名称。
2. **配置参数**：根据函数的要求配置 `taskData` 参数。
3. **执行任务**：使用配置好的任务对象执行任务。

请确保您的项目支持所选函数和参数。更多详细信息和高级配置，请参考相应函数的文档。