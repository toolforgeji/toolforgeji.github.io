/**
 * ToolForge PDF Merge & Split - Multi-file combining and page slicing
 */

(function () {
  'use strict';

  // State
  let mergeFiles = [];
  let splitFile = null;
  let splitPdfDoc = null;

  // DOM elements - Mode Tabs
  const modeMergeBtn = document.getElementById('mode-merge-btn');
  const modeSplitBtn = document.getElementById('mode-split-btn');
  const panelMerge = document.getElementById('panel-merge');
  const panelSplit = document.getElementById('panel-split');

  // DOM elements - Merge
  const mergeDropzone = document.getElementById('merge-dropzone');
  const mergeFileInput = document.getElementById('merge-file-input');
  const mergeListWrap = document.getElementById('merge-files-list-wrap');
  const mergeFilesContainer = document.getElementById('merge-files-container');
  const mergeCountEl = document.getElementById('merge-count');
  const startMergeBtn = document.getElementById('start-merge-btn');
  const clearMergeBtn = document.getElementById('clear-merge-btn');

  // DOM elements - Split
  const splitDropzone = document.getElementById('split-dropzone');
  const splitFileInput = document.getElementById('split-file-input');
  const splitOptionsWrap = document.getElementById('split-options-wrap');
  const splitDocName = document.getElementById('split-doc-name');
  const splitDocMeta = document.getElementById('split-doc-meta');
  const splitResetBtn = document.getElementById('split-reset-btn');
  const splitRangeInput = document.getElementById('split-range-input');
  const startSplitBtn = document.getElementById('start-split-btn');

  // Mode Switch
  modeMergeBtn.addEventListener('click', () => {
    modeMergeBtn.classList.add('active');
    modeSplitBtn.classList.remove('active');
    panelMerge.style.display = 'block';
    panelSplit.style.display = 'none';
  });

  modeSplitBtn.addEventListener('click', () => {
    modeSplitBtn.classList.add('active');
    modeMergeBtn.classList.remove('active');
    panelSplit.style.display = 'block';
    panelMerge.style.display = 'none';
  });

  // --- MERGE LOGIC ---
  const handleMergeFiles = (files) => {
    for (const f of files) {
      if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
        mergeFiles.push(f);
      }
    }
    renderMergeList();
  };

  const renderMergeList = () => {
    mergeCountEl.textContent = mergeFiles.length;
    if (mergeFiles.length === 0) {
      mergeDropzone.style.display = 'flex';
      mergeListWrap.style.display = 'none';
      return;
    }

    mergeDropzone.style.display = 'none';
    mergeListWrap.style.display = 'block';

    mergeFilesContainer.innerHTML = mergeFiles.map((file, idx) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <span style="font-family: var(--font-mono); font-size: 0.8125rem; color: var(--accent); font-weight: 700;">#${idx + 1}</span>
          <span style="font-size: 0.875rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 380px;">${file.name}</span>
          <span style="font-size: 0.75rem; color: var(--text-faint);">(${(file.size / 1024).toFixed(1)} KB)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button class="tf-btn-icon move-up" data-idx="${idx}" title="Move up" style="padding: 4px;" ${idx === 0 ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button class="tf-btn-icon move-down" data-idx="${idx}" title="Move down" style="padding: 4px;" ${idx === mergeFiles.length - 1 ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button class="tf-btn-icon remove-file" data-idx="${idx}" title="Remove" style="padding: 4px; color: var(--danger);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
    `).join('');

    // Reorder & remove handlers
    mergeFilesContainer.querySelectorAll('.move-up').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(btn.getAttribute('data-idx'), 10);
        if (i > 0) {
          const temp = mergeFiles[i];
          mergeFiles[i] = mergeFiles[i - 1];
          mergeFiles[i - 1] = temp;
          renderMergeList();
        }
      });
    });

    mergeFilesContainer.querySelectorAll('.move-down').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(btn.getAttribute('data-idx'), 10);
        if (i < mergeFiles.length - 1) {
          const temp = mergeFiles[i];
          mergeFiles[i] = mergeFiles[i + 1];
          mergeFiles[i + 1] = temp;
          renderMergeList();
        }
      });
    });

    mergeFilesContainer.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(btn.getAttribute('data-idx'), 10);
        mergeFiles.splice(i, 1);
        renderMergeList();
      });
    });
  };

  mergeDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    mergeDropzone.classList.add('dragover');
  });

  mergeDropzone.addEventListener('dragleave', () => {
    mergeDropzone.classList.remove('dragover');
  });

  mergeDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    mergeDropzone.classList.remove('dragover');
    if (e.dataTransfer.files) {
      handleMergeFiles(e.dataTransfer.files);
    }
  });

  mergeFileInput.addEventListener('change', (e) => {
    if (e.target.files) {
      handleMergeFiles(e.target.files);
    }
  });

  clearMergeBtn.addEventListener('click', () => {
    mergeFiles = [];
    renderMergeList();
  });

  startMergeBtn.addEventListener('click', async () => {
    if (mergeFiles.length < 2) {
      window.showToast('Please add at least 2 PDF files to merge.', 'error');
      return;
    }

    startMergeBtn.disabled = true;
    window.showToast('Merging PDFs in local memory...', 'info');

    try {
      const mergedPdf = await PDFLib.PDFDocument.create();

      for (let i = 0; i < mergeFiles.length; i++) {
        const file = mergeFiles[i];
        const bytes = await file.arrayBuffer();
        const donorPdf = await PDFLib.PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolforge_merged_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.showToast('Merged PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      window.showToast('Merge error: ' + (err.message || 'Check if file is password protected'), 'error');
    } finally {
      startMergeBtn.disabled = false;
    }
  });

  // --- SPLIT LOGIC ---
  const handleSplitFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      window.showToast('Please select a valid PDF file.', 'error');
      return;
    }

    splitFile = file;
    try {
      const bytes = await file.arrayBuffer();
      splitPdfDoc = await PDFLib.PDFDocument.load(bytes);
      const pageCount = splitPdfDoc.getPageCount();

      splitDocName.textContent = file.name;
      splitDocMeta.textContent = `Total pages: ${pageCount} | Size: ${(file.size / 1024).toFixed(1)} KB`;
      splitRangeInput.placeholder = `e.g. 1-${Math.min(pageCount, 3)}, ${pageCount}`;

      splitDropzone.style.display = 'none';
      splitOptionsWrap.style.display = 'block';
    } catch (err) {
      console.error(err);
      window.showToast('Failed to load PDF for splitting: ' + err.message, 'error');
    }
  };

  splitDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    splitDropzone.classList.add('dragover');
  });

  splitDropzone.addEventListener('dragleave', () => {
    splitDropzone.classList.remove('dragover');
  });

  splitDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    splitDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSplitFile(e.dataTransfer.files[0]);
    }
  });

  splitFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSplitFile(e.target.files[0]);
    }
  });

  splitResetBtn.addEventListener('click', () => {
    splitFile = null;
    splitPdfDoc = null;
    splitDropzone.style.display = 'flex';
    splitOptionsWrap.style.display = 'none';
  });

  startSplitBtn.addEventListener('click', async () => {
    if (!splitPdfDoc) return;

    const rangeStr = splitRangeInput.value.trim();
    if (!rangeStr) {
      window.showToast('Please enter the page numbers or ranges to extract (e.g. 1-2, 4)', 'error');
      return;
    }

    const totalPages = splitPdfDoc.getPageCount();
    const pageIndicesToExtract = new Set();

    const parts = rangeStr.split(',');
    for (const part of parts) {
      const clean = part.trim();
      if (clean.includes('-')) {
        const [startStr, endStr] = clean.split('-');
        const s = parseInt(startStr, 10);
        const e = parseInt(endStr, 10);
        if (!isNaN(s) && !isNaN(e) && s <= e) {
          for (let p = s; p <= e; p++) {
            if (p >= 1 && p <= totalPages) pageIndicesToExtract.add(p - 1);
          }
        }
      } else {
        const p = parseInt(clean, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          pageIndicesToExtract.add(p - 1);
        }
      }
    }

    const indices = Array.from(pageIndicesToExtract).sort((a, b) => a - b);
    if (indices.length === 0) {
      window.showToast(`No valid pages selected. Document has ${totalPages} pages.`, 'error');
      return;
    }

    startSplitBtn.disabled = true;
    try {
      const newPdf = await PDFLib.PDFDocument.create();
      const copiedPages = await newPdf.copyPages(splitPdfDoc, indices);
      copiedPages.forEach(p => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${splitFile.name.replace(/\.pdf$/i, '')}_extracted.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.showToast(`Extracted ${indices.length} pages successfully!`, 'success');
    } catch (err) {
      console.error(err);
      window.showToast('Split failed: ' + err.message, 'error');
    } finally {
      startSplitBtn.disabled = false;
    }
  });

})();
