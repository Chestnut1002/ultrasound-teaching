// main.js — Electron 主进程
// 负责：创建窗口、IPC 通信、自定义协议、文件系统访问

const { app, BrowserWindow, ipcMain, protocol, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

// ==================== 课件根目录 ====================
// 开发模式：项目根目录下的 courseware/；打包模式：.exe 同级目录下的 courseware/
let coursewarePath;
function getCoursewarePath() {
  if (!coursewarePath) {
    coursewarePath = path.join(
      app.isPackaged ? path.dirname(process.execPath) : __dirname,
      'courseware'
    );
    fs.mkdirSync(coursewarePath, { recursive: true });
  }
  return coursewarePath;
}

// ==================== 安全校验 ====================
// 确保操作目标在 courseware 目录内，防止越权访问系统文件
function isPathWithinCourseware(targetPath) {
  const normalized = path.resolve(targetPath);
  const cw = path.resolve(getCoursewarePath());
  return normalized.startsWith(cw) && normalized !== cw;
}

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

// 递归复制目录
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 递归统计文件数量
function countFiles(dirPath) {
  let count = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dirPath, entry.name));
    } else {
      count++;
    }
  }
  return count;
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

  ipcMain.handle('open-external', async (_event, filePath) => {
    try {
      shell.openPath(filePath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ==================== 课件管理 API ====================
  // 获取 courseware 路径
  ipcMain.handle('get-courseware-path', async () => {
    try {
      const cwPath = getCoursewarePath();
      return { success: true, path: cwPath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 在 courseware 内创建目录
  ipcMain.handle('ensure-dir', async (_event, dirPath) => {
    try {
      if (!isPathWithinCourseware(dirPath) && path.resolve(dirPath) !== path.resolve(getCoursewarePath())) {
        // 允许在 courseware 根目录内创建子目录
        const cw = path.resolve(getCoursewarePath());
        if (!path.resolve(dirPath).startsWith(cw + path.sep)) {
          return { success: false, error: '路径不在课件目录内' };
        }
      }
      fs.mkdirSync(dirPath, { recursive: true });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 删除 courseware 内的文件/文件夹
  ipcMain.handle('delete-item', async (_event, itemPath) => {
    try {
      if (!isPathWithinCourseware(itemPath)) {
        return { success: false, error: '路径不在课件目录内' };
      }
      fs.rmSync(itemPath, { recursive: true, force: true });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 导入文件/文件夹到 courseware
  ipcMain.handle('import-files', async (_event, { sources, destDir, preserveStructure }) => {
    try {
      const cw = path.resolve(getCoursewarePath());
      const normalizedDest = path.resolve(destDir);
      if (!normalizedDest.startsWith(cw)) {
        return { success: false, error: '目标路径不在课件目录内' };
      }

      let copied = 0;
      const errors = [];

      for (const src of sources) {
        try {
          const stat = fs.statSync(src);
          const baseName = path.basename(src);
          if (stat.isDirectory()) {
            // 复制整个文件夹
            const targetDir = preserveStructure
              ? path.join(normalizedDest, baseName)
              : normalizedDest;
            copyDirSync(src, targetDir);
            copied += countFiles(src);
          } else {
            // 复制单个文件
            const targetPath = path.join(normalizedDest, baseName);
            fs.copyFileSync(src, targetPath);
            copied++;
          }
        } catch (err) {
          errors.push(path.basename(src) + ': ' + err.message);
        }
      }

      return { success: true, copied, errors: errors.length > 0 ? errors : undefined };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 打开系统文件选择对话框
  ipcMain.handle('show-open-dialog', async (_event, { type, multi }) => {
    try {
      const properties = type === 'folder'
        ? ['openDirectory']
        : ['openFile', ...(multi ? ['multiSelections'] : [])];
      const result = await dialog.showOpenDialog(mainWindow, { properties });
      if (result.canceled) {
        return { success: false, canceled: true };
      }
      return { success: true, filePaths: result.filePaths };
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
