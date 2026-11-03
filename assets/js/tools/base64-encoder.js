/**
 * ToolForge Base64 Encoder & Decoder (Unicode UTF-8 safe)
 */

(function () {
  'use strict';

  // Mode Tabs
  const modeTextBtn = document.getElementById('b64-mode-text');
  const modeFileBtn = document.getElementById('b64-mode-file');
  const textPanel = document.getElementById('b64-text-panel');
  const filePanel = document.getElementById('b64-file-panel');

  // Text Mode Elements
  const inputText = document.getElementById('b64-input-text');
  const outputText = document.getElementById('b64-output-text');
  const btnEncode = document.getElementById('b64-btn-encode');
  const btnDecode = document.getElementById('b64-btn-decode');
  const btnCopy = document.getElementById('b64-copy-btn');
  const btnClear = document.getElementById('b64-clear-btn');

  // File Mode Elements
  const fileDropzone = document.getElementById('b64-file-dropzone');
  const fileInput = document.getElementById('b64-file-input');
  const fileResultWrap = document.getElementById('b64-file-result-wrap');
  const fileMetaName = document.getElementById('b64-file-meta-name');
  const fileMetaSize = document.getElementById('b64-file-meta-size');
  const fileImgPreviewBox = document.getElementById('b64-file-img-preview-box');
  const fileImgPreview = document.getElementById('b64-file-img-preview');
  const fileUriOutput = document.getElementById('b64-file-uri-output');
  const btnCopyUri = document.getElementById('b64-file-copy-uri');
  const btnCopyRaw = document.getElementById('b64-file-copy-raw');
  const btnFileReset = document.getElementById('b64-file-reset');

  let currentRawBase64 = '';

  // Mode Switch
  modeTextBtn.addEventListener('click', () => {
    modeTextBtn.classList.add('active');
    modeFileBtn.classList.remove('active');
    textPanel.style.display = 'block';
    filePanel.style.display = 'none';
  });

  modeFileBtn.addEventListener('click', () => {
    modeFileBtn.classList.add('active');
    modeTextBtn.classList.remove('active');
    filePanel.style.display = 'block';
    textPanel.style.display = 'none';
  });

  // UTF-8 Safe Base64 Encoding
  const utf8ToBase64 = (str) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // UTF-8 Safe Base64 Decoding
  const base64ToUtf8 = (b64) => {
    const cleanB64 = b64.trim().replace(/\s+/g, '');
    const binary = window.atob(cleanB64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  };

  btnEncode.addEventListener('click', () => {
    const text = inputText.value;
    if (!text) return;
    try {
      const b64 = utf8ToBase64(text);
      outputText.value = b64;
      window.showToast('Encoded to Base64', 'success');
    } catch (err) {
      window.showToast('Encoding error: ' + err.message, 'error');
    }
  });

  btnDecode.addEventListener('click', () => {
    const text = inputText.value.trim();
    if (!text) return;
    try {
      const decoded = base64ToUtf8(text);
      outputText.value = decoded;
      window.showToast('Decoded from Base64', 'success');
    } catch (err) {
      window.showToast('Invalid Base64 string: ' + err.message, 'error');
    }
  });

  btnCopy.addEventListener('click', () => {
    window.copyToClipboard(outputText.value, 'Result copied to clipboard!');
  });

  btnClear.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
  });

  // --- FILE MODE ---
  const handleFile = (file) => {
    if (!file) return;

    fileMetaName.textContent = file.name;
    fileMetaSize.textContent = `Size: ${(file.size / 1024).toFixed(1)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result;
      fileUriOutput.value = dataUri;
      currentRawBase64 = dataUri.split(',')[1] || '';

      if (file.type.startsWith('image/')) {
        fileImgPreview.src = dataUri;
        fileImgPreviewBox.style.display = 'block';
      } else {
        fileImgPreviewBox.style.display = 'none';
      }

      fileDropzone.style.display = 'none';
      fileResultWrap.style.display = 'block';
      window.showToast('File converted to Base64!', 'success');
    };
    reader.readAsDataURL(file);
  };

  fileDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropzone.classList.add('dragover');
  });

  fileDropzone.addEventListener('dragleave', () => {
    fileDropzone.classList.remove('dragover');
  });

  fileDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  btnFileReset.addEventListener('click', () => {
    fileInput.value = '';
    fileDropzone.style.display = 'flex';
    fileResultWrap.style.display = 'none';
  });

  btnCopyUri.addEventListener('click', () => {
    window.copyToClipboard(fileUriOutput.value, 'Data URI copied!');
  });

  btnCopyRaw.addEventListener('click', () => {
    window.copyToClipboard(currentRawBase64, 'Raw Base64 string copied!');
  });

})();
