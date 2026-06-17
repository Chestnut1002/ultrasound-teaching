// main.js — Electron 主进程
// 负责：创建窗口、IPC 通信、自定义协议、文件系统访问

const { app, BrowserWindow, ipcMain, protocol, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

let mainWindow;

// ==================== 创建主窗口 ====================
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: '超声教学资源管理系统',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
}

// ==================== 工具函数 ====================
function detectType(ext) {
  const map = {
    '.mp4': 'video', '.avi': 'video', '.mov': 'video', '.mkv': 'video',
    '.webm': 'video', '.wmv': 'video', '.flv': 'video',
    '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.bmp': 'image',
    '.gif': 'image', '.webp': 'image', '.tiff': 'image',
    '.pdf': 'pdf',
    '.ppt': 'ppt', '.pptx': 'ppt',
    '.doc': 'doc', '.docx': 'doc',
  };
  return map[ext.toLowerCase()] || 'other';
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

// ==================== 注册 IPC 处理器 ====================
function registerIpcHandlers() {
  ipcMain.handle('read-dir', async (_event, dirPath) => {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      const result = entries.map(entry => {
        const fullPath = path.join(dirPath, entry.name);
        const ext = path.extname(entry.name).toLowerCase();
        let stat = null;
        try { stat = fs.statSync(fullPath); } catch (e) { /* 跳过无权限 */ }
        return {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          ext: ext,
          size: stat ? stat.size : 0,
          sizeFormatted: stat ? formatSize(stat.size) : '未知',
          mtime: stat ? stat.mtime.toISOString() : null,
          type: entry.isDirectory() ? 'folder' : detectType(ext),
        };
      });
      result.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name, 'zh-CN');
      });
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('path-exists', async (_event, p) => fs.existsSync(p));

  ipcMain.handle('get-drives', async () => {
    try {
      const drives = [];
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (const letter of letters) {
        const p = letter + ':\\';
        if (fs.existsSync(p)) drives.push({ name: letter + ' 盘', path: p });
      }
      return { success: true, data: drives };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('open-external', async (_event, filePath) => {
    try {
      shell.openPath(filePath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

// ==================== MIME 类型映射 ====================
const MIME_TYPES = {
  '.mp4': 'video/mp4', '.avi': 'video/x-msvideo', '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska', '.webm': 'video/webm', '.wmv': 'video/x-ms-wmv',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.bmp': 'image/bmp', '.gif': 'image/gif', '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

// ==================== 注册自定义协议 ====================
// media:// 协议 → 流式读取本地文件，支持 Range 请求（视频拖拽进度条）
function registerProtocol() {
  protocol.handle('media', async (request) => {
    try {
      // 解析实际文件路径（media://D:/folder/file.mp4 → D:/folder/file.mp4）
      let filePath = decodeURIComponent(request.url.replace('media://', ''));
      filePath = filePath.replace(/^\/+/, '');  // 去掉前导斜杠
      filePath = filePath.replace(/\//g, path.sep);  // 正斜杠 → 系统路径分隔符

      if (!fs.existsSync(filePath)) {
        console.error('[media协议] 文件不存在:', filePath);
        return new Response('文件不存在', { status: 404 });
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const mimeType = getMimeType(filePath);
      const rangeHeader = request.headers.get('range');

      console.log('[media协议]', path.basename(filePath),
        rangeHeader ? '(Range: ' + rangeHeader + ')' : '(完整文件)');

      // --- 处理 Range 请求（视频拖拽进度条必需） ---
      if (rangeHeader) {
        const parts = rangeHeader.replace('bytes=', '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        const nodeStream = fs.createReadStream(filePath, { start, end });
        const webStream = Readable.toWeb(nodeStream);
        return new Response(webStream, {
          status: 206,
          headers: {
            'Content-Type': mimeType,
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Content-Length': String(chunkSize),
            'Accept-Ranges': 'bytes',
          },
        });
      }

      // --- 完整文件响应 ---
      const nodeStream = fs.createReadStream(filePath);
      const webStream = Readable.toWeb(nodeStream);
      return new Response(webStream, {
        headers: {
          'Content-Type': mimeType,
          'Content-Length': String(fileSize),
          'Accept-Ranges': 'bytes',
        },
      });
    } catch (err) {
      console.error('[media协议] 错误:', err.message);
      return new Response('服务器错误: ' + err.message, { status: 500 });
    }
  });
}

// ==================== 应用启动 ====================
app.whenReady().then(() => {
  registerProtocol();
  registerIpcHandlers();
  createWindow();
  console.log('✅ 应用启动成功');
});

app.on('window-all-closed', () => {
  app.quit();
});
