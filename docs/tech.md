# 技术规范 — 超声教学资源管理系统

## 技术栈

| 层面 | 技术 | 说明 |
|------|------|------|
| 运行时 | Electron 42+ | 桌面应用框架，提供窗口 + 文件系统访问 |
| 渲染进程 | 原生 HTML/CSS/JavaScript (ES6+) | 零框架，单文件 `index.html` |
| 主进程 | Node.js (Electron 内置) | 文件扫描、IPC 通信、自定义协议 |
| 进程通信 | IPC (ipcMain + ipcRenderer + contextBridge) | 安全的主进程↔渲染进程通信 |
| 本地存储 | localStorage | 用户数据（收藏、最近打开、设置） |
| PDF 渲染 | Chromium 内置 PDF 引擎（<iframe>） | 零依赖，应用内直接渲染 PDF |
| 打包 | electron-builder | 生成 Windows 便携版 .exe |

## 架构

### 双进程模型
```
主进程 (Main)         渲染进程 (Renderer)
Node.js 环境      ←→  Chromium 浏览器环境
- fs 文件操作           - HTML/CSS 界面
- IPC 处理器            - JS 模块（对象字面量）
- 自定义协议            - localStorage
- 窗口生命周期          - DOM 事件处理
```

### 安全模型
- `contextIsolation: true` — 渲染进程无法直接访问 Node.js
- `nodeIntegration: false` — 渲染进程无法使用 require()
- `contextBridge` — 只暴露有限、明确的方法给渲染进程

### 代码组织
单文件 `index.html` 内嵌 `<style>` 和 `<script>`，使用对象字面量组织模块：
```js
const U = { ... };           // 工具函数
const Store = { ... };       // localStorage 操作
const FileBrowser = { ... }; // 文件浏览逻辑
const VideoPlayer = { ... }; // 视频播放器
const ImageViewer = { ... }; // 图片查看器
const DocViewer = { ... };   // 文档查看器
const App = { ... };         // 主控制器
```

## 数据模型

### localStorage Key
| Key | 结构 | 说明 |
|-----|------|------|
| `ultrasound_favorites` | `[{ path, name, addedAt }]` | 收藏夹 |
| `ultrasound_recent` | `[{ path, name, openedAt }]` | 最近打开（最多50条） |
| `ultrasound_settings` | `{ viewMode, sortBy, defaultPath }` | 用户设置 |
| `ultrasound_progress` | `{ [filePath]: { position, completed, updatedAt } }` | 播放进度（未来） |

### IPC 文件数据结构
```js
{
  name: '文件名', path: '完整路径', isDirectory: false,
  ext: '.mp4', size: 157286400, sizeFormatted: '150 MB',
  mtime: 'ISO时间戳', type: 'video'|'image'|'pdf'|'ppt'|'folder'|'other'
}
```

## 依赖项
- `electron` (devDependency) — 应用运行时
- `electron-builder` (devDependency) — 打包工具
- `pdf.js` (静态文件，放入 assets/) — PDF 渲染

## 文件结构
```
ultrasound-teaching/
├── package.json
├── main.js              # Electron 主进程
├── preload.js           # 安全桥接层
├── index.html           # 全部 UI（单文件）
├── assets/              # 静态资源
├── docs/                # 项目文档
└── devlog/              # 开发日志
```
