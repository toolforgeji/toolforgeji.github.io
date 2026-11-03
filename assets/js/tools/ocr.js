/**
 * ToolForge Image OCR Handler using Tesseract.js (Client-side WebAssembly)
 */

(function () {
  'use strict';

  let currentFile = null;

  const dropzone = document.getElementById('ocr-dropzone');
  const fileInput = document.getElementById('ocr-file-input');
  const workspace = document.getElementById('ocr-workspace');
  const imgPreview = document.getElementById('ocr-img-preview');
  const langSelect = document.getElementById('ocr-lang');
  const resetBtn = document.getElementById('ocr-reset-btn');
  const startBtn = document.getElementById('start-ocr-btn');
  const progressWrap = document.getElementById('ocr-progress-wrap');
  const progressBar = document.getElementById('ocr-progress-bar');
  const statusText = document.getElementById('ocr-status-text');
  const percentText = document.getElementById('ocr-percent-text');
  const outputText = document.getElementById('ocr-output-text');
  const copyBtn = document.getElementById('ocr-copy-btn');
  const downloadBtn = document.getElementById('ocr-download-btn');

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      window.showToast('Please select a valid image file.', 'error');
      return;
    }
    currentFile = file;
    imgPreview.src = URL.createObjectURL(file);
    dropzone.style.display = 'none';
    workspace.style.display = 'block';
    outputText.value = '';
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
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
    fileInput.value = '';
    dropzone.style.display = 'flex';
    workspace.style.display = 'none';
  });

  startBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    if (typeof Tesseract === 'undefined') {
      window.showToast('Tesseract OCR library is loading. Please wait a few seconds.', 'error');
      return;
    }

    startBtn.disabled = true;
    progressWrap.style.display = 'block';
    outputText.value = 'Initializing OCR worker...';

    const selectedLang = langSelect.value;

    try {
      const worker = await Tesseract.createWorker(selectedLang, 1, {
        logger: (m) => {
          if (m.status) {
            statusText.textContent = m.status.replace(/_/g, ' ') + '...';
            if (m.progress) {
              const pct = Math.round(m.progress * 100);
              progressBar.style.width = pct + '%';
              percentText.textContent = pct + '%';
            }
          }
        }
      });

      statusText.textContent = 'Recognizing text glyphs...';
      const ret = await worker.recognize(currentFile);
      const text = ret.data.text.trim();

      await worker.terminate();

      if (!text) {
        outputText.value = '[No text recognized. Try an image with higher contrast or larger font.]';
      } else {
        outputText.value = text;
        copyBtn.disabled = false;
        downloadBtn.disabled = false;
        window.showToast('OCR extraction completed!', 'success');
      }

      progressBar.style.width = '100%';
      percentText.textContent = '100%';
      statusText.textContent = 'Done!';
    } catch (err) {
      console.error(err);
      window.showToast('OCR failed: ' + (err.message || 'Worker error'), 'error');
      outputText.value = 'Error recognizing text: ' + err.message;
    } finally {
      startBtn.disabled = false;
    }
  });

  copyBtn.addEventListener('click', () => {
    window.copyToClipboard(outputText.value, 'OCR text copied to clipboard!');
  });

  downloadBtn.addEventListener('click', () => {
    const text = outputText.value;
    if (!text) return;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_extracted_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showToast('Downloaded text file!', 'success');
  });

})();
