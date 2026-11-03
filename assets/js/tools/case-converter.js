/**
 * ToolForge Case Converter Script
 */

(function () {
  'use strict';

  const inputEl = document.getElementById('cc-input');
  const charCountEl = document.getElementById('cc-char-count');
  const wordCountEl = document.getElementById('cc-word-count');
  const copyBtn = document.getElementById('cc-copy-btn');
  const clearBtn = document.getElementById('cc-clear-btn');
  const caseBtns = document.querySelectorAll('.case-btn');

  const updateStats = () => {
    const text = inputEl.value;
    charCountEl.textContent = text.length;
    const words = (text.trim().match(/\b\S+\b/g) || []).length;
    wordCountEl.textContent = words;
  };

  const convert = (targetCase) => {
    const text = inputEl.value;
    if (!text) return;

    const words = text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim()
      .split(/\s+/);

    let res = text;
    switch (targetCase) {
      case 'upper':
        res = text.toUpperCase();
        break;
      case 'lower':
        res = text.toLowerCase();
        break;
      case 'title':
        res = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
        break;
      case 'sentence':
        res = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case 'camel':
        res = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        break;
      case 'pascal':
        res = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        break;
      case 'snake':
        res = words.map((w) => w.toLowerCase()).join('_');
        break;
      case 'kebab':
        res = words.map((w) => w.toLowerCase()).join('-');
        break;
      case 'constant':
        res = words.map((w) => w.toUpperCase()).join('_');
        break;
      case 'slug':
        res = text
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
        break;
      case 'alternating':
        res = text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
        break;
      case 'reverse':
        res = text.split('').reverse().join('');
        break;
      default:
        break;
    }

    inputEl.value = res;
    updateStats();
    window.showToast(`Converted to ${targetCase}`, 'success');
  };

  caseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      caseBtns.forEach(b => {
        b.classList.remove('tf-btn-primary');
        b.classList.add('tf-btn-secondary');
      });
      btn.classList.add('tf-btn-primary');
      btn.classList.remove('tf-btn-secondary');

      const target = btn.getAttribute('data-case');
      convert(target);
    });
  });

  inputEl.addEventListener('input', updateStats);

  copyBtn.addEventListener('click', () => {
    window.copyToClipboard(inputEl.value, 'Text copied to clipboard!');
  });

  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    updateStats();
  });

  // Init with sample
  inputEl.value = 'toolforge is a collection of high-performance utility tools.';
  updateStats();

})();
