/**
 * 图片压缩核心模块
 * 使用 Canvas API 在浏览器本地完成压缩，无需后端
 */

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function getFileExtension(name) {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
}

function resolveImageType(file) {
  if (file.type && ALLOWED_TYPES.includes(file.type)) {
    return file.type;
  }
  const ext = getFileExtension(file.name);
  const extMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return extMap[ext] || '';
}

/**
 * 校验上传文件
 */
function validateFile(file) {
  if (!file) {
    return { ok: false, error: '请选择一张图片' };
  }
  const resolvedType = resolveImageType(file);
  if (!resolvedType) {
    return { ok: false, error: '仅支持 JPG、PNG、WebP、GIF 格式' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: '文件过大，请选择 50MB 以内的图片' };
  }
  return { ok: true, type: resolvedType };
}

/**
 * 根据最大宽度等比缩放尺寸
 */
function calcDimensions(srcWidth, srcHeight, maxWidth) {
  if (srcWidth <= maxWidth) {
    return { width: srcWidth, height: srcHeight };
  }
  const ratio = maxWidth / srcWidth;
  return {
    width: Math.round(maxWidth),
    height: Math.round(srcHeight * ratio),
  };
}

/**
 * 加载图片为 HTMLImageElement
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败，请换一张试试'));
    };
    img.src = url;
  });
}

/**
 * Canvas 绘制并导出 Blob
 */
function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('压缩失败，请调整参数后重试'));
      },
      mimeType,
      quality
    );
  });
}

/**
 * 压缩图片
 * @param {File} file - 原始文件
 * @param {Object} options
 * @param {number} options.quality - 0~1
 * @param {number} options.maxWidth - 最大宽度 px
 * @param {string} options.format - MIME 类型
 * @returns {Promise<{ blob: Blob, width: number, height: number }>}
 */
async function compressImage(file, { quality, maxWidth, format }) {
  const img = await loadImage(file);
  const { width, height } = calcDimensions(img.naturalWidth, img.naturalHeight, maxWidth);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  // PNG 不支持 quality 参数，WebP/JPEG 支持
  const exportQuality = format === 'image/png' ? undefined : quality;
  const blob = await canvasToBlob(canvas, format, exportQuality);

  return { blob, width, height };
}

/**
 * 格式化文件大小为人类可读字符串
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * 计算节省百分比
 */
function calcSavedPercent(original, compressed) {
  if (original === 0) return 0;
  const saved = ((original - compressed) / original) * 100;
  return Math.max(0, Math.round(saved));
}

/**
 * 根据格式生成下载文件名
 */
function buildDownloadName(originalName, format) {
  const base = originalName.replace(/\.[^.]+$/, '');
  const extMap = {
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/png': 'png',
  };
  return `${base}-compressed.${extMap[format] || 'jpg'}`;
}

window.PixelShrink = {
  resolveImageType,
  validateFile,
  calcDimensions,
  compressImage,
  formatFileSize,
  calcSavedPercent,
  buildDownloadName,
};
