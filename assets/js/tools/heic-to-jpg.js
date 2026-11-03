/**
 * ToolForge HEIC to JPG Converter using heic2any
 */

(function () {
  'use strict';

  let currentFile = null;
  let convertedBlob = null;
  let convertedUrl = null;

  const dropzone = document.getElementById('heic-dropzone');
  const fileInput = document.getElementById('heic-file-input');
  const workspace = document.getElementById('heic-workspace');
  const fileNameEl = document.getElementById('heic-file-name');
  const fileSizeEl = document.getElementById('heic-file-size');
  const formatSelect = document.getElementById('heic-target-format');
  const qualitySlider = document.getElementById('heic-quality');
  const qualValEl = document.getElementById('heic-qual-val');
  const progressWrap = document.getElementById('heic-progress-wrap');
  const resultWrap = document.getElementById('heic-result-wrap');
  const convertedImg = document.getElementById('heic-converted-img');
  const convertBtn = document.getElementById('heic-convert-btn');
  const downloadBtn = document.getElementById('heic-download-btn');
  const resetBtn = document.getElementById('heic-reset-btn');

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFile = (file) => {
    if (!file) return;
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type.includes('heic') || file.type.includes('heif');
    if (!isHeic) {
      window.showToast('Please select a .heic or .heif file.', 'error');
      return;
    }

    currentFile = file;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = `Size: ${formatSize(file.size)}`;

    dropzone.style.display = 'none';
    workspace.style.display = 'block';
    resultWrap.style.display = 'none';
    downloadBtn.style.display = 'none';
    progressWrap.style.display = 'none';
  };

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  resetBtn.addEventListener('click', () => {
    currentFile = null;
    convertedBlob = null;
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    fileInput.value = '';
    dropzone.style.display = 'flex';
    workspace.style.display = 'none';
  });

  qualitySlider.addEventListener('input', () => {
    qualValEl.textContent = qualitySlider.value;
  });

  convertBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    if (typeof heic2any === 'undefined') {
      window.showToast('HEIC decoder is initializing. Please wait a moment...', 'error');
      return;
    }

    convertBtn.disabled = true;
    progressWrap.style.display = 'block';
    resultWrap.style.display = 'none';
    downloadBtn.style.display = 'none';

    const quality = parseInt(qualitySlider.value, 10) / 100;
    const toType = formatSelect.value;

    try {
      const conversionResult = await heic2any({
        blob: currentFile,
        toType: toType,
        quality: quality
      });

      convertedBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
      convertedUrl = URL.createObjectURL(convertedBlob);

      convertedImg.src = convertedUrl;
      resultWrap.style.display = 'block';
      downloadBtn.style.display = 'inline-flex';
      window.showToast('Conversion completed successfully!', 'success');
    } catch (err) {
      console.error(err);
      window.showToast('Could not convert HEIC: ' + (err.message || 'File may be corrupt or encrypted'), 'error');
    } finally {
      progressWrap.style.display = 'none';
      convertBtn.disabled = false;
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!convertedBlob) return;

    const ext = formatSelect.value === 'image/png' ? 'png' : 'jpg';
    const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = `${baseName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.showToast('Downloaded converted image!', 'success');
  });

})();
