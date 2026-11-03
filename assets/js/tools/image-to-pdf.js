/**
 * ToolForge Image to PDF Converter using pdf-lib
 */

(function () {
  'use strict';

  let imageItems = []; // { file, url, imgObj }

  const dropzone = document.getElementById('img-dropzone');
  const fileInput = document.getElementById('img-file-input');
  const controlsWrap = document.getElementById('img-controls-wrap');
  const previewsContainer = document.getElementById('image-previews-container');
  const countEl = document.getElementById('img-count');
  const convertBtn = document.getElementById('convert-pdf-btn');
  const clearBtn = document.getElementById('clear-images-btn');
  const pageSizeSelect = document.getElementById('page-size');
  const pageOrientSelect = document.getElementById('page-orientation');
  const pageMarginSelect = document.getElementById('page-margin');

  const handleFiles = (files) => {
    for (const f of files) {
      if (f.type.startsWith('image/')) {
        const url = URL.createObjectURL(f);
        imageItems.push({ file: f, url });
      }
    }
    renderPreviews();
  };

  const renderPreviews = () => {
    countEl.textContent = imageItems.length;
    if (imageItems.length === 0) {
      dropzone.style.display = 'flex';
      controlsWrap.style.display = 'none';
      return;
    }

    dropzone.style.display = 'none';
    controlsWrap.style.display = 'block';

    previewsContainer.innerHTML = imageItems.map((item, idx) => `
      <div style="position: relative; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border-subtle); background: var(--bg-subtle);">
        <img src="${item.url}" alt="Preview" style="width: 100%; height: 110px; object-fit: cover; display: block;" />
        <div style="padding: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; background: var(--bg-surface);">
          <span style="font-weight: 700; color: var(--accent);">#${idx + 1}</span>
          <button class="remove-img-btn tf-btn-icon" data-idx="${idx}" style="padding: 2px 4px; color: var(--danger);" title="Remove">✕</button>
        </div>
      </div>
    `).join('');

    previewsContainer.querySelectorAll('.remove-img-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(btn.getAttribute('data-idx'), 10);
        URL.revokeObjectURL(imageItems[i].url);
        imageItems.splice(i, 1);
        renderPreviews();
      });
    });
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
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  });

  clearBtn.addEventListener('click', () => {
    imageItems.forEach(it => URL.revokeObjectURL(it.url));
    imageItems = [];
    renderPreviews();
  });

  // Helper to convert Image to PNG ArrayBuffer via canvas
  const imageToPngBytes = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          blob.arrayBuffer().then(resolve).catch(reject);
        }, 'image/png');
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  convertBtn.addEventListener('click', async () => {
    if (imageItems.length === 0) return;
    convertBtn.disabled = true;
    window.showToast('Compiling high-res PDF pages...', 'info');

    try {
      const pdfDoc = await PDFLib.PDFDocument.create();
      const pageSize = pageSizeSelect.value;
      const orient = pageOrientSelect.value;
      const marginType = pageMarginSelect.value;

      const margin = marginType === 'none' ? 0 : marginType === 'large' ? 40 : 20;

      for (let i = 0; i < imageItems.length; i++) {
        const item = imageItems[i];
        const bytes = await item.file.arrayBuffer();

        let embeddedImage = null;
        if (item.file.type === 'image/jpeg' || item.file.type === 'image/jpg') {
          embeddedImage = await pdfDoc.embedJpg(bytes);
        } else if (item.file.type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(bytes);
        } else {
          // WebP or others: convert to PNG via canvas
          const pngBytes = await imageToPngBytes(item.file);
          embeddedImage = await pdfDoc.embedPng(pngBytes);
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth = 595.28; // A4 pt
        let pageHeight = 841.89;

        if (pageSize === 'letter') {
          pageWidth = 612.0;
          pageHeight = 792.0;
        } else if (pageSize === 'fit') {
          pageWidth = imgWidth + margin * 2;
          pageHeight = imgHeight + margin * 2;
        }

        // Auto orientation
        if (pageSize !== 'fit') {
          const isImgLandscape = imgWidth > imgHeight;
          if (orient === 'landscape' || (orient === 'auto' && isImgLandscape)) {
            const temp = pageWidth;
            pageWidth = pageHeight;
            pageHeight = temp;
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate fitted image dimensions within printable area
        const availWidth = pageWidth - margin * 2;
        const availHeight = pageHeight - margin * 2;

        const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight);
        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;

        const x = margin + (availWidth - drawWidth) / 2;
        const y = margin + (availHeight - drawHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `images_converted_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      window.showToast('Images successfully converted to PDF!', 'success');
    } catch (err) {
      console.error(err);
      window.showToast('Conversion failed: ' + err.message, 'error');
    } finally {
      convertBtn.disabled = false;
    }
  });

})();
