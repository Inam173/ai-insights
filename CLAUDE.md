# AI技术洞察平台

🌐 **线上地址**：https://inam173.github.io/ai-insights

## 项目定位
面向技术同学的AI大模型前沿动态追踪网页，聚焦国内外主流大模型厂商的最新技术突破、应用案例与产业合作，服务技术路标制定。

## 模块化结构
```
ai-insights/
├── src/
│   ├── style.css       ← 所有CSS样式
│   ├── template.html   ← HTML骨架（body部分）
│   └── app.js          ← JS逻辑（按功能区注释分隔）
├── data.json           ← 所有数据（资讯、厂商、天梯图、案例）
├── build.js            ← node build.js 一键构建
└── index.html          ← 最终产物（勿手动改）
```

## 四个功能模块
1. **资讯流** — 按类别（模型突破/应用案例/政企合作/进阶用法/生态布局/资本动向）和厂商筛选
2. **厂商卡片** — 国内+海外厂商，展示月活用户、日均Token、近期动态
3. **天梯图** — 4个评测源（Chatbot Arena / Artificial Analysis / LiveBench / SWE-bench）
4. **友商案例** — 按手机品牌优先的厂商案例库，每家厂商可有多条案例

## 数据格式（data.json）
```json
{
  "lastUpdated": "ISO时间戳",
  "platform": { "name", "subtitle", "description" },
  "categories": [{ "id", "name", "icon", "color" }],
  "news": [{ "id", "title", "summary", "category", "companies", "date", "source", "url", "tags" }],
  "companies": {
    "domestic": [{ "id", "name", "logo", "mau", "dailyTokens", "highlights" }],
    "international": [{ ... }]
  },
  "ranking": {
    "arena": [{ "rank", "model", "company", "score", "date" }],
    "artificial": [...],
    "livebench": [...],
    "swebench": [...]
  },
  "cases": [{ "id", "company", "title", "desc", "category", "date" }]
}
```

## 开发流程
1. **修改源码**：只改 `src/` 下的文件和 `data.json`
2. **构建**：`node build.js` → 验证语法 → 生成 `index.html`
3. **本地预览**：直接在浏览器打开 `index.html`（纯静态，无依赖）
4. **发布**：`git add . && git commit -m "..." && git push origin master`（需要开梯子）

## 定时刷新
- 工作日 8:57 通过 Claude Code cron 自动更新资讯内容
- 更新 data.json → 构建 → git push

## 技术特点
- 纯静态页面，零依赖，单文件即完整站点
- 数据通过 `window.__EMBEDDED_DATA__` 内嵌到 HTML
- 响应式设计，手机端友好
- 暗色主题，科技感视觉风格
