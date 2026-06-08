# 语音笔记

一款基于浏览器的语音转文字应用。点击录音，通过智谱 AI 将语音识别为文字，支持编辑、复制和历史记录管理。

## 功能特性

- **浏览器录音** — 使用 MediaRecorder API 录制音频，支持麦克风权限请求
- **语音识别** — 调用智谱 AI `glm-asr-2512` 模型，自动将录音转为中文文字
- **结果编辑** — 识别完成后可在线编辑文本，并一键复制
- **历史记录** — 识别结果自动保存到 LocalStorage，支持查看详情和删除
- **简洁界面** — 单页面设计，中央大圆形录音按钮，录音时红色脉冲动画

## 技术栈

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vite.dev/) — 构建与开发服务器
- [智谱 AI GLM-ASR-2512](https://docs.bigmodel.cn/cn/guide/models/sound-and-video/glm-asr-2512) — 语音识别
- LocalStorage — 历史记录持久化

## 环境要求

- Node.js 18+
- 现代浏览器（Chrome、Edge、Safari 等，需支持 MediaRecorder API）
- 智谱 AI API Key

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

复制环境变量模板并填入你的智谱 AI API Key：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```
ZHIPU_API_KEY=你的API密钥
```

API Key 可在 [智谱开放平台](https://bigmodel.cn/usercenter/proj-mgmt/apikeys) 获取。

### 3. 启动开发服务器

```bash
npm run dev
```

浏览器访问 `http://localhost:5173`，允许麦克风权限后即可使用。

### 4. 构建生产版本

```bash
npm run build
npm run preview
```

## 使用说明

1. **录音** — 点击中央圆形按钮开始录音，按钮变红并显示脉冲动画；再次点击停止
2. **识别** — 录音完成后点击「开始识别」，等待 AI 处理（单次录音不超过 30 秒）
3. **编辑** — 识别结果展示在文本框中，可直接修改内容
4. **复制** — 点击「复制」按钮将识别文本复制到剪贴板
5. **历史记录** — 页面底部查看历史列表，点击可查看详情，支持删除

## 注意事项

- 录音需要浏览器麦克风权限，请确保已授权
- 智谱 API 限制：音频格式为 wav/mp3，文件大小 ≤ 25 MB，时长 ≤ 30 秒
- API Key 通过 Vite 开发服务器代理转发，不会暴露到前端代码中
- 历史记录保存在浏览器 LocalStorage，清除浏览器数据会丢失记录

## 项目结构

```
voice-note/
├── src/
│   ├── components/       # UI 组件
│   │   ├── RecordButton.tsx      # 录音按钮
│   │   ├── TranscriptionPanel.tsx # 识别结果面板
│   │   ├── LoadingOverlay.tsx    # 加载动画
│   │   ├── HistoryList.tsx       # 历史记录列表
│   │   └── HistoryDetail.tsx     # 历史详情弹窗
│   ├── hooks/            # React Hooks
│   │   ├── useRecorder.ts      # 录音逻辑
│   │   ├── useTranscription.ts   # 语音识别
│   │   └── useHistory.ts         # 历史记录
│   ├── services/         # 服务层
│   │   ├── transcribe.ts         # 识别 API 调用
│   │   └── historyStorage.ts     # LocalStorage 读写
│   └── utils/            # 工具函数
│       ├── blobToWav.ts          # 音频格式转换
│       └── formatTime.ts         # 时间格式化
├── vite.config.ts        # Vite 配置（含 API 代理）
├── .env.example          # 环境变量模板
└── PRD.md                # 产品需求文档
```

## 许可证

私有项目，仅供个人使用。
