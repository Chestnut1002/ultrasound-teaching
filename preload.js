// preload.js — 安全桥接层
// 通过 contextBridge 将主进程的有限 API 暴露给渲染进程
// 渲染进程只能使用这里暴露的方法，无法直接访问 Node.js/fs

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 读取目录内容
  readDir: (dirPath) => ipcRenderer.invoke('read-dir', dirPath),
  // 检查路径是否存在
  pathExists: (p) => ipcRenderer.invoke('path-exists', p),
  // 用系统默认程序打开文件（PPT/Word 等）
  openExternal: (filePath) => ipcRenderer.invoke('open-external', filePath),

  // ==================== 课件管理 API ====================
  // 获取 courseware 目录路径
  getCoursewarePath: () => ipcRenderer.invoke('get-courseware-path'),
  // 在 courseware 内创建目录
  ensureDir: (dirPath) => ipcRenderer.invoke('ensure-dir', dirPath),
  // 删除 courseware 内的文件/文件夹
  deleteItem: (itemPath) => ipcRenderer.invoke('delete-item', itemPath),
  // 导入文件到 courseware
  importFiles: (sources, destDir, preserveStructure) =>
    ipcRenderer.invoke('import-files', { sources, destDir, preserveStructure }),
  // 打开系统文件/文件夹选择对话框
  showOpenDialog: (type, multi) =>
    ipcRenderer.invoke('show-open-dialog', { type, multi }),
});
