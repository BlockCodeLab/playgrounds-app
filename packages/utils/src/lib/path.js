export function pathResolve(basePath, relativePath, platform) {
  // 检测操作系统类型
  const isWin =
    platform === 'win32' || (platform === undefined && (isWindowsPath(basePath) || isWindowsPath(relativePath)));

  // 统一为正斜杠
  const toSlash = (s) => (s ? s.replace(/\\/g, '/') : '');
  basePath = toSlash(basePath);
  relativePath = toSlash(relativePath);

  // 如果 relativePath 是绝对路径，直接使用它；否则拼接
  let fullPath;
  if (isAbsolute(relativePath, isWin)) {
    fullPath = relativePath;
  } else {
    fullPath = basePath ? basePath + '/' + relativePath : relativePath;
  }

  // 标准化（处理 . 和 ..）
  fullPath = normalizePath(fullPath, isWin);

  // 生成 file:// URI
  if (isWin) {
    return 'file://' + fullPath; // Windows: file://C:/A/B/c.png
  } else {
    if (!fullPath.startsWith('/')) {
      fullPath = '/' + fullPath;
    }
    return 'file://' + fullPath; // POSIX:  file:///A/B/c.png
  }
}

/** 检测路径是否属于 Windows 格式（盘符或反斜杠） */
function isWindowsPath(p) {
  if (!p) return false;
  return /^[a-zA-Z]:[\\/]/.test(p) || p.includes('\\');
}

/** 判断路径是否为绝对路径（考虑平台） */
function isAbsolute(p, isWin) {
  if (!p) return false;
  if (isWin) {
    return /^[a-zA-Z]:[\\/]/.test(p) || /^[\\/]/.test(p);
  }
  return p.startsWith('/');
}

/** 标准化路径：解析 . 和 ..，并保留 Windows 盘符 */
function normalizePath(p, isWin) {
  // 提取 Windows 盘符（如 "C:"）
  let drive = '';
  if (isWin) {
    const match = p.match(/^([a-zA-Z]:)\/(.*)/);
    if (match) {
      drive = match[1];
      p = match[2] || '';
    }
  }

  // 分割路径，处理根标记
  let parts = p.split('/');
  let hasRoot = false;
  if (isWin) {
    hasRoot = drive !== '' || (p.length > 0 && p[0] === '/');
    if (hasRoot && parts[0] === '') parts.shift(); // 去掉空首元素
  } else {
    hasRoot = p.startsWith('/');
    if (hasRoot) parts.shift();
  }

  // 使用栈处理 . 和 ..
  const stack = [];
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      if (stack.length === 0) {
        if (!hasRoot) stack.push('..'); // 相对路径可超出
        // 绝对路径则忽略（不能超出根）
      } else if (stack[stack.length - 1] !== '..') {
        stack.pop();
      } else {
        stack.push('..');
      }
    } else {
      stack.push(part);
    }
  }

  // 重组路径
  if (isWin) {
    if (drive) {
      return drive + '/' + stack.join('/');
    } else {
      return (hasRoot ? '/' : '') + stack.join('/');
    }
  } else {
    return (hasRoot ? '/' : '') + stack.join('/');
  }
}
