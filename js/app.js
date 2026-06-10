/**
 * PixelShrink 主应用
 * 负责 UI 交互、参数调节、对比滑块
 */

(function initApp() {
  if (!window.PixelShrink) {
    showFatalError('脚本加载失败：请确认 js 文件夹与 index.html 在同一目录，然后用 Chrome / Edge 打开。');
    return;
  }

  const {
    validateFile,
    compressImage,
    formatFileSize,
    calcSavedPercent,
    buildDownloadName,
  } = window.PixelShrink;

  // DOM 元素
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const workspace = document.getElementById('workspace');
  const beforeImage = document.getElementById('beforeImage');
  const afterImage = document.getElementById('afterImage');
  const compareBefore = document.getElementById('compareBefore');
  const compareSlider = document.getElementById('compareSlider');
  const originalSizeEl = document.getElementById('originalSize');
  const compressedSizeEl = document.getElementById('compressedSize');
  const savedPercentEl = document.getElementById('savedPercent');
  const qualitySlider = document.getElementById('qualitySlider');
  const qualityValue = document.getElementById('qualityValue');
  const maxWidthSlider = document.getElementById('maxWidthSlider');
  const maxWidthValue = document.getElementById('maxWidthValue');
  const formatBtns = document.querySelectorAll('.format-btn');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const toast = document.getElementById('toast');

  if (!uploadZone || !fileInput) {
    showFatalError('页面元素加载异常，请刷新后重试。');
    return;
  }

  // 应用状态
  let currentFile = null;
  let compressedBlob = null;
  let outputFormat = 'image/jpeg';
  let debounceTimer = null;

  // ── 上传交互 ──

  uploadZone.addEventListener('dragover', onDragOver);
  uploadZone.addEventListener('dragleave', onDragLeave);
  uploadZone.addEventListener('drop', onDrop);
  fileInput.addEventListener('dragover', onDragOver);
  fileInput.addEventListener('dragleave', onDragLeave);
  fileInput.addEventListener('drop', onDrop);

  function onDragOver(e) {
    e.preventDefault();
    uploadZone.classList.add('upload-zone--dragover');
  }

  function onDragLeave() {
    uploadZone.classList.remove('upload-zone--dragover');
  }

  function onDrop(e) {
    e.preventDefault();
    uploadZone.classList.remove('upload-zone--dragover');
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
    // 允许重复选择同一张图
    e.target.value = '';
  });

  async function handleFile(file) {
    const result = validateFile(file);
    if (!result.ok) {
      showToast(result.error);
      return;
    }

    currentFile = file;
    beforeImage.src = URL.createObjectURL(file);
    uploadZone.classList.add('hidden');
    workspace.classList.remove('hidden');

    await runCompress();
  }

  // ── 压缩逻辑 ──

  async function runCompress() {
    if (!currentFile) return;

    downloadBtn.disabled = true;
    downloadBtn.textContent = '压缩中…';

    try {
      const quality = Number(qualitySlider.value) / 100;
      const maxWidth = Number(maxWidthSlider.value);

      const { blob } = await compressImage(currentFile, {
        quality,
        maxWidth,
        format: outputFormat,
      });

      compressedBlob = blob;

      afterImage.src = URL.createObjectURL(blob);

      originalSizeEl.textContent = formatFileSize(currentFile.size);
      compressedSizeEl.textContent = formatFileSize(blob.size);
      const saved = calcSavedPercent(currentFile.size, blob.size);
      savedPercentEl.textContent = saved > 0 ? `-${saved}%` : '0%';

      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 2v8M8 10l3-3M8 10L5 7M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        下载压缩图
      `;
    } catch (err) {
      showToast(err.message || '压缩失败');
      downloadBtn.disabled = false;
      downloadBtn.textContent = '下载压缩图';
    }
  }

  function debouncedCompress() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runCompress, 300);
  }

  // ── 参数调节 ──

  qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = qualitySlider.value;
    debouncedCompress();
  });

  maxWidthSlider.addEventListener('input', () => {
    maxWidthValue.textContent = `${maxWidthSlider.value} px`;
    debouncedCompress();
  });

  formatBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      formatBtns.forEach((b) => b.classList.remove('format-btn--active'));
      btn.classList.add('format-btn--active');
      outputFormat = btn.dataset.format;
      debouncedCompress();
    });
  });

  // ── 下载 & 重置 ──

  downloadBtn.addEventListener('click', () => {
    if (!compressedBlob || !currentFile) return;

    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildDownloadName(currentFile.name, outputFormat);
    a.click();
    URL.revokeObjectURL(url);
    showToast('下载已开始');
  });

  resetBtn.addEventListener('click', () => {
    currentFile = null;
    compressedBlob = null;
    fileInput.value = '';
    workspace.classList.add('hidden');
    uploadZone.classList.remove('hidden');
  });

  // ── 对比滑块 ──

  const compareContainer = document.getElementById('compareContainer');
  let isDragging = false;

  function syncBeforeImageWidth() {
    const w = compareContainer.offsetWidth;
    beforeImage.style.width = `${w}px`;
    beforeImage.style.maxWidth = 'none';
  }

  function setComparePosition(x) {
    const rect = compareContainer.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
    compareBefore.style.width = `${percent}%`;
    compareSlider.style.left = `${percent}%`;
  }

  beforeImage.addEventListener('load', syncBeforeImageWidth);
  afterImage.addEventListener('load', syncBeforeImageWidth);
  window.addEventListener('resize', syncBeforeImageWidth);

  compareSlider.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    setComparePosition(e.clientX);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  compareSlider.addEventListener('touchstart', () => {
    isDragging = true;
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    setComparePosition(e.touches[0].clientX);
  });

  document.addEventListener('touchend', () => {
    isDragging = false;
  });

  // ── Toast ──

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.add('hidden'), 2800);
  }
})();

function showFatalError(message) {
  const box = document.createElement('div');
  box.textContent = message;
  box.style.cssText = [
    'position:fixed',
    'top:16px',
    'left:50%',
    'transform:translateX(-50%)',
    'z-index:10001',
    'max-width:90vw',
    'padding:12px 16px',
    'border-radius:8px',
    'background:#3f1010',
    'color:#fecaca',
    'border:1px solid #ef4444',
    'font:14px/1.5 sans-serif',
  ].join(';');
  document.body.appendChild(box);
}
