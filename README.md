# 🔬 超声教学资源管理系统

内置于彩超工作站的医学教学课件浏览与播放应用。

## 项目简介

本应用用于浏览和播放超声诊断教学课件、视频、PDF 等教学资源。基于 Electron 构建，双击 `.exe` 即用，无需安装。

## 功能

- 📁 **文件夹浏览** — 侧边栏目录树 + 文件网格 + 面包屑导航
- 🎬 **视频播放** — 支持 .mp4/.avi/.mov 等格式，自定义控制栏
- 🖼️ **图片查看** — 支持 .jpg/.png/.bmp，前后翻页
- 📄 **PDF 查看** — 内置 pdf.js 渲染，翻页/缩放
- 📊 **PPT/Word** — 调用系统 Office 打开
- ⭐ **收藏夹** — 收藏常用文件夹/文件
- 🕐 **最近打开** — 自动记录历史

## 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动应用
npm start
```

### 打包

```bash
# 生成便携版 .exe
npm run build
```

## 技术栈

- Electron（桌面运行环境）
- 原生 HTML/CSS/JavaScript（零框架）
- localStorage（用户数据存储）
- pdf.js（PDF 渲染）

## 项目结构

```
ultrasound-teaching/
├── main.js          # Electron 主进程
├── preload.js       # 安全桥接层
├── index.html       # 全部 UI（单文件）
├── docs/            # 规范文档
├── devlog/          # 开发日志
└── assets/          # 静态资源
```

## 许可证

MIT
