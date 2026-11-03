/**
 * ToolForge PDF Compressor - Client-Side PDF Optimization using pdf-lib
 */

(function () {
  'use strict';

  let currentFile = null;
  let compressedPdfBytes = null;

  const dropzone = document.getElementById('pdf-dropzone');
  const fileInput = document.getElementById('pdf-file-input');
  const optionsPanel = document.getElementById('pdf-options-panel');
  const fileNameEl = document.getElementById('pdf-file-name');
  const originalSizeEl = document.getElementById('pdf-file-original-size');
  const resetBtn = document.getElementById('pdf-reset-btn');
  const startBtn = document.getElementById('pdf-start-compress');
  const progressWrap = document.getElementById('pdf-progress-wrap');
  const progressBar = document.getElementById('pdf-progress-bar');
  const progressText = document.getElementById('pdf-progress-text');
  const progressPercent = document.getElementById('pdf-progress-percent');
  const resultPanel = document.getElementById('pdf-result-panel');
  const newSizeEl = document.getElementById('pdf-new-size');
  const savingsBadge = document.getElementById('pdf-savings-badge');
  const downloadBtn = document.getElementById('pdf-download-btn');

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileSelect = (file) => {
    if (!file || file.type !== 'application/pdf') {
      window.showToast('Please select a valid PDF file (.pdf)', 'error');
      return;
    }

    currentFile = file;
    fileNameEl.textContent = file.name;
    originalSizeEl.textContent = `Original size: ${formatSize(file.size)}`;

    dropzone.style.display = 'none';
    optionsPanel.style.display = 'block';
    resultPanel.style.display = 'none';
    progressWrap.style.display = 'none';
  };

  // Dropzone drag/drop
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  });

  resetBtn.addEventListener('click', () => {
    currentFile = null;
    compressedPdfBytes = null;
    fileInput.value = '';
    dropzone.style.display = 'flex';
    optionsPanel.style.display = 'none';
    resultPanel.style.display = 'none';
  });

  startBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    if (typeof PDFLib === 'undefined') {
      window.showToast('PDF library is loading. Please wait 2 seconds...', 'error');
      return;
    }

    startBtn.disabled = true;
    progressWrap.style.display = 'block';
    resultPanel.style.display = 'none';

    try {
      progressText.textContent = 'Reading PDF buffer...';
      progressBar.style.width = '25%';
      progressPercent.textContent = '25%';

      const arrayBuffer = await currentFile.arrayBuffer();
      
      progressText.textContent = 'Parsing document structures & xref tables...';
      progressBar.style.width = '55%';
      progressPercent.textContent = '55%';

      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
        updateMetadata: false
      });

      const stripMetadata = document.getElementById('strip-metadata').checked;
      if (stripMetadata) {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
      }

      progressText.textContent = 'Optimizing and rebuilding streams...';
      progressBar.style.width = '85%';
      progressPercent.textContent = '85%';

      // Save with object stream compression
      compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false
      });

      progressBar.style.width = '100%';
      progressPercent.textContent = '100%';
      progressText.textContent = 'Done!';

      const newSize = compressedPdfBytes.byteLength;
      newSizeEl.textContent = formatSize(newSize);

      const savings = Math.max(0, Math.round(((currentFile.size - newSize) / currentFile.size) * 100));
      savingsBadge.textContent = savings > 0 ? `-${savings}%` : 'Optimized';

      resultPanel.style.display = 'block';
      window.showToast('PDF compression finished successfully!', 'success');
    } catch (err) {
      console.error(err);
      window.showToast('Could not compress PDF: ' + (err.message || 'Corrupt or password-protected PDF'), 'error');
    } finally {
      startBtn.disabled = false;
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!compressedPdfBytes) return;

    const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = currentFile.name.replace(/\.pdf$/i, '');
    a.download = `${baseName}_compressed.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showToast('Downloading compressed PDF...', 'success');
  });

})();
