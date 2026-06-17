# 超声教学资源管理系统 — 项目开发指引

## 项目简介
超声教学资源管理系统 🔬 是一个基于 Electron 的桌面应用，内置于彩超工作站中，用于浏览和播放超声诊断教学课件、视频、PDF 等教学资源。基于原生 HTML/CSS/JS + Electron，单文件 `index.html` 承载全部 UI，主进程 `main.js` 处理文件系统操作。

## 标准文件路径

| 文档 | 路径 | 说明 |
|------|------|------|
| 需求文档 | [docs/requirements.md](docs/requirements.md) | 功能需求和非功能需求 |
| 技术规范 | [docs/tech.md](docs/tech.md) | 技术栈、架构、数据模型 |
| 设计规范 | [docs/design.md](docs/design.md) | 颜色、字体、间距、动画、布局 |
| 执行步骤 | [docs/steps.md](docs/steps.md) | 开发步骤和进度追踪（checkbox） |
| 开发日志 | [devlog/](devlog/) | 每日开发记录 |

## 核心文件

| 文件 | 说明 |
|------|------|
| `main.js` | Electron 主进程：窗口创建、IPC 通信、自定义协议 |
| `preload.js` | 安全桥接层：通过 contextBridge 暴露有限 API |
| `index.html` | 全部 UI（HTML + CSS + JS），单文件 |

## 工作说明

### 开发原则
1. **分步推进**：严格按照 `docs/steps.md` 中的步骤顺序开发，每一步完成并验证后再进入下一步
2. **先读规范**：修改任何代码前，先阅读对应的规范文档
3. **保持同步**：代码变更后同步更新 `docs/steps.md` 中的勾选状态
4. **每日日志**：每次开发会话结束后，在 `devlog/` 中更新日志文件（文件命名：`YYYY-MM-DD.md`）

### 开发流程
1. 阅读 `docs/requirements.md` 了解需求
2. 查阅 `docs/tech.md` 确认技术方案
3. 参考 `docs/design.md` 确保设计一致
4. 按 `docs/steps.md` 顺序执行
5. 完成后更新日志到 `devlog/YYYY-MM-DD.md`

### 代码风格
- 使用对象字面量组织模块（`const App = { ... }`）
- 数据操作统一通过 `Store` 对象，key 前缀为 `ultrasound_`
- CSS 使用 `--变量` 定义在 `:root` 中
- 动画使用 CSS transition/animation，避免 JS 动画
- 中文注释优先，清晰易懂
- 主进程和渲染进程通过 IPC 通信，渲染进程不能直接访问 Node.js

### 安全原则
- `contextIsolation: true` — 渲染进程隔离
- `nodeIntegration: false` — 禁止渲染进程使用 Node.js
- `contextBridge` — 只暴露必要的方法
- 不使用任何 C++ 原生模块（避免编译问题）

### 验证方式
- `npm start` 启动 Electron 窗口
- 检查控制台无报错（主进程终端 + 渲染进程 DevTools）
- 确认 UI 与 `docs/design.md` 设计规范一致
- 验证功能与 `docs/steps.md` 步骤描述一致
