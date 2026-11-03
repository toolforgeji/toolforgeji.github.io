/**
 * ToolForge Background Remover - Client-side chroma & edge alpha segmentation
 */

(function () {
  'use strict';

  let originalImg = null;
  let imgFileName = 'cutout';

  const dropzone = document.getElementById('bg-dropzone');
  const fileInput = document.getElementById('bg-file-input');
  const workspace = document.getElementById('bg-workspace');
  const origPreview = document.getElementById('bg-orig-preview');
  const canvas = document.getElementById('bg-output-canvas');
  const ctx = canvas.getContext('2d');
  const threshSlider = document.getElementById('bg-threshold');
  const threshValEl = document.getElementById('bg-thresh-val');
  const bgModeSelect = document.getElementById('bg-mode-select');
  const customColorInput = document.getElementById('bg-custom-color');
  const resetBtn = document.getElementById('bg-reset-btn');
  const downloadBtn = document.getElementById('bg-download-btn');
  const canvasContainer = document.getElementById('canvas-container');

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      window.showToast('Please select a valid image file.', 'error');
      return;
    }

    imgFileName = file.name.replace(/\.[^/.]+$/, '');
    const url = URL.createObjectURL(file);
    originalImg = new Image();
    originalImg.onload = () => {
      origPreview.src = url;
      dropzone.style.display = 'none';
      workspace.style.display = 'block';
      processImage();
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
    originalImg = null;
    fileInput.value = '';
    dropzone.style.display = 'flex';
    workspace.style.display = 'none';
  });

  threshSlider.addEventListener('input', () => {
    threshValEl.textContent = threshSlider.value;
    processImage();
  });

  bgModeSelect.addEventListener('change', () => {
    if (bgModeSelect.value === 'custom') {
      customColorInput.style.display = 'inline-block';
    } else {
      customColorInput.style.display = 'none';
    }
    updatePreviewBackground();
    processImage();
  });

  customColorInput.addEventListener('input', () => {
    updatePreviewBackground();
    processImage();
  });

  const updatePreviewBackground = () => {
    const val = bgModeSelect.value;
    if (val === 'transparent') {
      canvasContainer.className = 'checkerboard-bg';
      canvasContainer.style.backgroundColor = '';
    } else if (val === 'custom') {
      canvasContainer.className = '';
      canvasContainer.style.backgroundColor = customColorInput.value;
    } else {
      canvasContainer.className = '';
      canvasContainer.style.backgroundColor = val;
    }
  };

  const processImage = () => {
    if (!originalImg) return;

    // Constrain maximum processing dimension for responsive speed while preserving aspect ratio
    const maxDim = 1200;
    let w = originalImg.naturalWidth;
    let h = originalImg.naturalHeight;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    canvas.width = w;
    canvas.height = h;

    // Draw original onto offscreen temp canvas to read pixels
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(originalImg, 0, 0, w, h);

    const imgData = tempCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Sample 4 corners for background color estimation
    const corners = [
      0, // top-left
      (w - 1) * 4, // top-right
      ((h - 1) * w) * 4, // bottom-left
      ((h - 1) * w + (w - 1)) * 4 // bottom-right
    ];

    let bgR = 0, bgG = 0, bgB = 0;
    corners.forEach(idx => {
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
    });
    bgR /= corners.length;
    bgG /= corners.length;
    bgB /= corners.length;

    const tolerance = parseInt(threshSlider.value, 10);
    const maxDist = (tolerance / 100) * 441.67; // max distance sqrt(255^2 * 3) = 441.67
    const feather = maxDist * 0.35;

    // Check replacement mode
    const bgMode = bgModeSelect.value;
    let repColor = null;
    if (bgMode !== 'transparent') {
      const hex = bgMode === 'custom' ? customColorInput.value : bgMode;
      const parsedR = parseInt(hex.slice(1, 3), 16);
      const parsedG = parseInt(hex.slice(3, 5), 16);
      const parsedB = parseInt(hex.slice(5, 7), 16);
      repColor = [parsedR, parsedG, parsedB];
    }

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) continue;

      // Euclidean distance in RGB color space
      const dist = Math.sqrt(
        (r - bgR) * (r - bgR) +
        (g - bgG) * (g - bgG) +
        (b - bgB) * (b - bgB)
      );

      if (dist < maxDist - feather) {
        // Completely background
        if (repColor) {
          data[i] = repColor[0];
          data[i + 1] = repColor[1];
          data[i + 2] = repColor[2];
          data[i + 3] = 255;
        } else {
          data[i + 3] = 0;
        }
      } else if (dist < maxDist) {
        // Feathered edge
        const factor = (dist - (maxDist - feather)) / feather;
        if (repColor) {
          data[i] = Math.round(r * factor + repColor[0] * (1 - factor));
          data[i + 1] = Math.round(g * factor + repColor[1] * (1 - factor));
          data[i + 2] = Math.round(b * factor + repColor[2] * (1 - factor));
          data[i + 3] = 255;
        } else {
          data[i + 3] = Math.round(factor * 255);
        }
      }
    }

    ctx.clearRect(0, 0, w, h);
    ctx.putImageData(imgData, 0, 0);
  };

  downloadBtn.addEventListener('click', () => {
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${imgFileName}_cutout.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      window.showToast('Downloaded cutout image!', 'success');
    }, 'image/png');
  });

})();
