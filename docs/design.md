# 设计规范 — 超声教学资源管理系统

## 设计方向
专业医疗风 — 蓝色系、干净、冷静、易读。适合医院工作站环境，避免花哨。

## 颜色系统

| 变量 | 色值 | 用途 |
|------|------|------|
| `--color-primary` | `#1976D2` | 主色调、链接、按钮、选中状态 |
| `--color-primary-dark` | `#1565C0` | 主色调深色（hover） |
| `--color-primary-light` | `#E3F2FD` | 主色调浅色（背景高亮） |
| `--bg-main` | `#F5F7FA` | 主背景 |
| `--bg-sidebar` | `#EAEEF3` | 侧边栏背景 |
| `--bg-surface` | `#FFFFFF` | 卡片、面板背景 |
| `--text-primary` | `#212121` | 主文字 |
| `--text-secondary` | `#757575` | 辅助文字 |
| `--border-color` | `#E0E0E0` | 边框 |
| `--color-success` | `#388E3C` | 成功/完成状态 |
| `--color-warning` | `#F57C00` | 警告状态 |
| `--color-danger` | `#D32F2F` | 错误/删除 |

## 字体

| 用途 | 字体 | 大小 |
|------|------|------|
| 应用标题 | Microsoft YaHei / Segoe UI, Bold | 18px |
| 面包屑/工具栏 | Microsoft YaHei / Segoe UI, Regular | 13px |
| 文件名 | Microsoft YaHei / Segoe UI, Medium | 13px |
| 辅助文字 | Microsoft YaHei / Segoe UI, Regular | 11-12px |
| 侧边栏标题 | Microsoft YaHei / Segoe UI, SemiBold | 11px, uppercase |

字体栈：`-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "微软雅黑", sans-serif`

## 间距

| 元素 | 间距 |
|------|------|
| 顶部栏高度 | 48px |
| 状态栏高度 | 28px |
| 侧边栏宽度 | 240px |
| 文件网格间距 | 12px |
| 卡片内边距 | 16px |
| 侧边栏项内边距 | 8px 12px |
| 页面外边距 | 16px |

## 圆角
- 卡片：`8px`
- 按钮：`6px`
- 侧边栏项：`6px`

## 阴影
- 卡片 hover：`0 1px 3px rgba(0,0,0,0.08)`

## 动画
- 过渡时间：`200ms ease`（常规交互）
- 淡入淡出：`300ms`（浮层进出）
- 使用 CSS transition/animation，避免 JS 动画

## 布局
- 顶部栏：48px 固定
- 主体：flex 横向布局（侧边栏 240px + 内容区自适应）
- 状态栏：28px 固定
- 文件网格：CSS Grid，`repeat(auto-fill, minmax(160px, 1fr))`
- 列表视图：单列，文件项横向排列
- 最小窗口：900×600

## 文件类型图标
| 类型 | 图标 |
|------|------|
| 文件夹 | 📁 |
| 视频 | 🎬 |
| 图片 | 🖼️ |
| PDF | 📄 |
| PPT | 📊 |
| Word | 📝 |
| 其他 | 📎 |

## 状态设计
- **空文件夹**：居中显示"此文件夹为空"📭
- **加载中**：spinner 动画（未来实现）
- **错误**：居中显示"无法访问文件夹"⚠️ + 错误详情
