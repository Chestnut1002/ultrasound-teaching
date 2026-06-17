// preload.js — 安全桥接层
// 通过 contextBridge 将主进程的有限 API 暴露给渲染进程
// 渲染进程只能使用这里暴露的方法，无法直接访问 Node.js/fs

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 读取目录内容
  readDir: (dirPath) => ipcRenderer.invoke('read-dir', dirPath),
  // 检查路径是否存在
  pathExists: (p) => ipcRenderer.invoke('path-exists', p),
  // 获取 Windows 盘符列表
  getDrives: () => ipcRenderer.invoke('get-drives'),
  // 用系统默认程序打开文件（PPT/Word 等）
  openExternal: (filePath) => ipcRenderer.invoke('open-external', filePath),
});
