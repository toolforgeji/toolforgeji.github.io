/**
 * ToolForge Image Compressor - Client-side image re-sampling and quality optimization
 */

(function () {
  'use strict';

  let currentFile = null;
  let originalImg = null;
  let compressedBlob = null;
  let compressedUrl = null;

  const dropzone = document.getElementById('ic-dropzone');
  const fileInput = document.getElementById('ic-file-input');
  const workspace = document.getElementById('ic-workspace');
  const origImgEl = document.getElementById('ic-orig-img');
  const compImgEl = document.getElementById('ic-comp-img');
  const origSizeEl = document.getElementById('ic-orig-size');
  const compSizeEl = document.getElementById('ic-comp-size');
  const qualitySlider = document.getElementById('ic-quality');
  const qualityVal = document.getElementById('ic-quality-val');
  const formatSelect = document.getElementById('ic-format');
  const maxDimSelect = document.getElementById('ic-max-width');
  const downloadBtn = document.getElementById('ic-download-btn');
  const resetBtn = document.getElementById('ic-reset-btn');

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      window.showToast('Please select a valid image file.', 'error');
      return;
    }

    currentFile = file;
    origSizeEl.textContent = formatSize(file.size);
    const url = URL.createObjectURL(file);
    originalImg = new Image();
    originalImg.onload = () => {
      origImgEl.src = url;
      dropzone.style.display = 'none';
      workspace.style.display = 'block';
      compressImage();
    };
    originalImg.src = url;
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
    originalImg = null;
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    fileInput.value = '';
    dropzone.style.display = 'flex';
    workspace.style.display = 'none';
  });

  qualitySlider.addEventListener('input', () => {
    qualityVal.textContent = qualitySlider.value;
    compressImage();
  });

  formatSelect.addEventListener('change', compressImage);
  maxDimSelect.addEventListener('change', compressImage);

  const compressImage = () => {
    if (!originalImg) return;

    const quality = parseInt(qualitySlider.value, 10) / 100;
    let mimeType = formatSelect.value;
    if (mimeType === 'original') {
      mimeType = currentFile.type || 'image/jpeg';
    }

    let w = originalImg.naturalWidth;
    let h = originalImg.naturalHeight;

    const maxDimStr = maxDimSelect.value;
    if (maxDimStr !== 'original') {
      const maxDim = parseInt(maxDimStr, 10);
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImg, 0, 0, w, h);

    canvas.toBlob((blob) => {
      if (!blob) return;
      compressedBlob = blob;
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      compressedUrl = URL.createObjectURL(blob);
      compImgEl.src = compressedUrl;

      const newSize = blob.size;
      const savings = Math.round(((currentFile.size - newSize) / currentFile.size) * 100);
      const savingsText = savings > 0 ? `(-${savings}%)` : `(+${Math.abs(savings)}%)`;
      compSizeEl.textContent = `${formatSize(newSize)} ${savingsText}`;
    }, mimeType, quality);
  };

  downloadBtn.addEventListener('click', () => {
    if (!compressedBlob) return;

    let ext = 'jpg';
    let mimeType = formatSelect.value;
    if (mimeType === 'original') mimeType = currentFile.type;
    if (mimeType === 'image/png') ext = 'png';
    else if (mimeType === 'image/webp') ext = 'webp';

    const baseName = currentFile.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = compressedUrl;
    a.download = `${baseName}_optimized.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.showToast('Downloaded compressed image!', 'success');
  });

})();
