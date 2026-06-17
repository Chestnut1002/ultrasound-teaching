# 开发执行步骤

---

## ✅ 步骤 1：项目初始化
- [x] 创建项目目录结构
- [x] npm init + 安装 Electron 33.2.1（使用 npmmirror 国内镜像）
- [x] 创建 main.js（Electron 主进程：窗口、IPC、自定义协议）
- [x] 创建 preload.js（安全桥接层：contextBridge）
- [x] 创建 index.html（基础布局框架：顶部栏 + 侧边栏 + 内容区 + 状态栏）
- [x] 创建 docs/requirements.md（需求文档）
- [x] 创建 docs/tech.md（技术规范）
- [x] 创建 docs/design.md（设计规范）
- [x] 创建 docs/steps.md（本文件）
- [x] 创建 CLAUDE.md（AI 助手指引：标准文件路径 + 工作说明）
- [x] 创建 devlog/ 文件夹 + 首日日志
- [x] 创建 .gitignore
- [x] 创建 README.md（项目说明）
- [x] 创建 assets/ 文件夹
- [x] 创建 start.sh 启动脚本（解决 ELECTRON_RUN_AS_NODE 问题）
- [x] 验证：npm start → Electron 窗口弹出，显示标题和基础布局，控制台无报错 ✅

## ✅ 步骤 2：文件系统浏览 — IPC 通信
- [x] main.js 添加 IPC handler：read-dir（接收路径，返回文件列表 JSON）
- [x] main.js 添加 IPC handler：path-exists（检查路径是否存在）
- [x] main.js 添加 IPC handler：get-drives（返回 Windows 盘符列表）
- [x] main.js 添加 IPC handler：open-external（调用系统默认程序打开文件）
- [x] preload.js 用 contextBridge 暴露全部 electronAPI 方法
- [x] 验证：前端能通过 IPC 拿到文件列表数据 ✅

## ✅ 步骤 3：文件浏览器 — 界面
- [x] FileBrowser 模块：侧边栏盘符列表 + 当前目录子文件夹
- [x] FileBrowser：主区域文件网格（卡片含图标 + 文件名 + 大小）
- [x] FileBrowser：面包屑导航（显示当前路径，点击跳转）
- [x] FileBrowser：点击文件夹进入、双击文件打开
- [x] 文件类型检测 + emoji 图标（🎬视频 🖼图片 📄PDF 📊PPT 📁文件夹）
- [x] CSS：侧边栏样式、文件卡片样式、hover 动效
- [x] 加载状态："正在加载..." 提示
- [x] 空状态："此文件夹为空" 提示
- [x] 错误状态："无法访问文件夹" + 错误详情
- [x] 验证：可自由浏览本地文件夹 ✅

## ✅ 步骤 4：视频播放器
- [x] main.js 注册自定义 media:// 协议（支持 Windows 路径映射）
- [x] VideoPlayer 模块：浮层 + <video> 元素
- [x] VideoPlayer：自定义控制栏（播放/暂停、进度条、时间、音量、全屏）
- [x] VideoPlayer：快进/快退按钮（±10秒）
- [x] VideoPlayer：键盘快捷键（空格=暂停，←→=快进10s，F=全屏，Esc=关闭）
- [x] CSS：浮层动画、控制栏 3 秒自动隐藏
- [x] Windows 路径兼容（反斜杠 → 正斜杠）
- [x] 控制台调试日志（方便排查问题）
- [x] 验证：npm start 启动成功 ✅

## ✅ 步骤 5：图片查看器
- [x] ImageViewer 模块：浮层 + <img> 元素
- [x] ImageViewer：前后翻页（同一文件夹内的图片）
- [x] ImageViewer：图片计数器（"3 / 12"）
- [x] ImageViewer：键盘快捷键（←→=翻页，Esc=关闭）
- [x] CSS：深色背景浮层、导航箭头
- [x] Windows 路径兼容修复

## ✅ 步骤 6：文档查看器（PDF 应用内 + PPT 外部）
- [x] PDF 改为应用内 <iframe> 渲染（Chromium 内置 PDF 引擎，零依赖）
- [x] DocViewer 模块：浮层 + 工具栏 + iframe
- [x] DocViewer：关闭按钮 + Esc 快捷键
- [x] PPT/Word 仍用 shell.openPath 外部打开
- [x] 验证：PDF 在应用内渲染，不跳出应用 ✅

## ✅ 步骤 7：用户数据功能
- [x] Store 模块：收藏夹（添加/移除/列表/状态判断）
- [x] Store 模块：最近打开（自动记录，最多50条）
- [x] Store 模块：用户设置（视图模式、排序、默认路径）
- [x] 搜索功能：文件名过滤（300ms 防抖）
- [x] UI：侧边栏收藏夹/最近打开入口
- [x] 自动恢复上次浏览路径
- [x] 验证：收藏/最近/搜索功能正常 ✅

## ✅ 步骤 8：体验打磨
- [x] 空文件夹状态："此文件夹为空" 提示
- [x] 加载状态："正在加载..." 提示
- [x] 错误状态："无法访问文件夹" + 错误详情
- [x] 网格 ↔ 列表视图切换（按钮 + CSS 切换）
- [x] 过渡动画：文件卡片 hover、视图切换
- [x] 自定义滚动条样式
- [x] 面包屑导航
- [x] 状态栏（文件计数 + 当前路径）
- [x] 验证：所有状态 UI 正常，动画流畅 ✅

## 步骤 9：打包 + GitHub（待网络条件允许时处理）
- [ ] 安装 electron-builder，配置 build 字段
- [ ] 打包为 Windows 便携版 .exe
- [ ] 准备应用图标（assets/icon.ico）
- [ ] 在无 Node.js 的电脑上测试 .exe 运行
- [ ] git init + GitHub 仓库创建 + 首次推送
- [ ] README 完善（中英双语、截图、使用说明）
- [ ] 验证：.exe 双击即运行，无需安装/管理员权限；GitHub 仓库完整
