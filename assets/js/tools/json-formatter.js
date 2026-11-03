/**
 * ToolForge JSON Formatter, Validator & Tree Inspector
 */

(function () {
  'use strict';

  const inputEl = document.getElementById('jf-input');
  const outputEl = document.getElementById('jf-output');
  const treeWrapEl = document.getElementById('jf-tree-wrap');
  const inputStatsEl = document.getElementById('jf-input-stats');
  const outputStatsEl = document.getElementById('jf-output-stats');
  const statusBanner = document.getElementById('jf-status-banner');

  const btnFormat2 = document.getElementById('jf-format-2');
  const btnFormat4 = document.getElementById('jf-format-4');
  const btnMinify = document.getElementById('jf-minify');
  const btnSort = document.getElementById('jf-sort');
  const btnRepair = document.getElementById('jf-repair');
  const btnSample = document.getElementById('jf-sample');
  const btnCopy = document.getElementById('jf-copy');
  const btnDownload = document.getElementById('jf-download');
  const btnClear = document.getElementById('jf-clear');

  const btnViewCode = document.getElementById('jf-view-code');
  const btnViewTree = document.getElementById('jf-view-tree');

  let currentParsedObj = null;

  const showStatus = (msg, isError = false) => {
    statusBanner.style.display = 'block';
    if (isError) {
      statusBanner.style.background = 'rgba(239, 68, 68, 0.15)';
      statusBanner.style.border = '1px solid var(--danger)';
      statusBanner.style.color = 'var(--danger)';
    } else {
      statusBanner.style.background = 'rgba(16, 185, 129, 0.15)';
      statusBanner.style.border = '1px solid var(--success)';
      statusBanner.style.color = 'var(--success)';
    }
    statusBanner.innerHTML = msg;
  };

  const hideStatus = () => {
    statusBanner.style.display = 'none';
  };

  const updateStats = () => {
    inputStatsEl.textContent = `${inputEl.value.length} characters`;
    outputStatsEl.textContent = `${outputEl.value.length} characters`;
  };

  const parseJson = (text) => {
    try {
      const obj = JSON.parse(text);
      hideStatus();
      return { success: true, obj };
    } catch (err) {
      showStatus(`Syntax Error: ${err.message}`, true);
      return { success: false, error: err.message };
    }
  };

  const format = (space = 2) => {
    const raw = inputEl.value.trim();
    if (!raw) {
      outputEl.value = '';
      treeWrapEl.innerHTML = '';
      hideStatus();
      updateStats();
      return;
    }

    const res = parseJson(raw);
    if (res.success) {
      currentParsedObj = res.obj;
      outputEl.value = JSON.stringify(res.obj, null, space);
      renderTree(res.obj);
      showStatus('Valid JSON formatted successfully!', false);
    }
    updateStats();
  };

  const minify = () => {
    const raw = inputEl.value.trim();
    if (!raw) return;

    const res = parseJson(raw);
    if (res.success) {
      currentParsedObj = res.obj;
      outputEl.value = JSON.stringify(res.obj);
      renderTree(res.obj);
      showStatus('JSON minified into single line.', false);
    }
    updateStats();
  };

  const sortKeysRecursively = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sortKeysRecursively);
    } else if (obj !== null && typeof obj === 'object') {
      const sortedKeys = Object.keys(obj).sort();
      const result = {};
      for (const k of sortedKeys) {
        result[k] = sortKeysRecursively(obj[k]);
      }
      return result;
    }
    return obj;
  };

  const sortKeys = () => {
    const raw = inputEl.value.trim();
    if (!raw) return;

    const res = parseJson(raw);
    if (res.success) {
      const sorted = sortKeysRecursively(res.obj);
      currentParsedObj = sorted;
      outputEl.value = JSON.stringify(sorted, null, 2);
      renderTree(sorted);
      showStatus('Object keys sorted alphabetically.', false);
    }
    updateStats();
  };

  const repairJson = () => {
    let str = inputEl.value;
    if (!str.trim()) return;

    // 1. Replace single quotes with double quotes
    str = str.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
    // 2. Remove trailing commas before } or ]
    str = str.replace(/,\s*([}\]])/g, '$1');

    inputEl.value = str;
    format(2);
    window.showToast('Repaired common syntax issues (quotes & trailing commas)', 'success');
  };

  // Build Interactive Tree View
  const renderTree = (obj) => {
    treeWrapEl.innerHTML = '';
    const node = createTreeNode(obj, 'root');
    treeWrapEl.appendChild(node);
  };

  const createTreeNode = (val, keyName) => {
    const wrap = document.createElement('div');
    wrap.style.marginLeft = '16px';
    wrap.style.lineHeight = '1.6';

    if (val === null) {
      wrap.innerHTML = `<span style="color: var(--accent); font-weight: 600;">${keyName}:</span> <span style="color: var(--danger);">null</span>`;
    } else if (typeof val === 'boolean') {
      wrap.innerHTML = `<span style="color: var(--accent); font-weight: 600;">${keyName}:</span> <span style="color: var(--warning);">${val}</span>`;
    } else if (typeof val === 'number') {
      wrap.innerHTML = `<span style="color: var(--accent); font-weight: 600;">${keyName}:</span> <span style="color: #3b82f6;">${val}</span>`;
    } else if (typeof val === 'string') {
      wrap.innerHTML = `<span style="color: var(--accent); font-weight: 600;">${keyName}:</span> <span style="color: var(--success);">"${escapeHtml(val)}"</span>`;
    } else if (Array.isArray(val)) {
      const details = document.createElement('details');
      details.open = true;
      details.innerHTML = `<summary style="cursor: pointer; color: var(--text-main); font-weight: 600;"><span style="color: var(--accent);">${keyName}:</span> [${val.length} items]</summary>`;
      val.forEach((item, idx) => {
        details.appendChild(createTreeNode(item, `[${idx}]`));
      });
      wrap.appendChild(details);
    } else if (typeof val === 'object') {
      const keys = Object.keys(val);
      const details = document.createElement('details');
      details.open = true;
      details.innerHTML = `<summary style="cursor: pointer; color: var(--text-main); font-weight: 600;"><span style="color: var(--accent);">${keyName}:</span> {${keys.length} keys}</summary>`;
      keys.forEach((k) => {
        details.appendChild(createTreeNode(val[k], k));
      });
      wrap.appendChild(details);
    }

    return wrap;
  };

  const escapeHtml = (str) => {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  // View switchers
  btnViewCode.addEventListener('click', () => {
    outputEl.style.display = 'block';
    treeWrapEl.style.display = 'none';
    btnViewCode.style.background = 'var(--bg-surface)';
    btnViewCode.style.color = 'var(--text-main)';
    btnViewTree.style.background = 'transparent';
    btnViewTree.style.color = 'var(--text-muted)';
  });

  btnViewTree.addEventListener('click', () => {
    outputEl.style.display = 'none';
    treeWrapEl.style.display = 'block';
    btnViewTree.style.background = 'var(--bg-surface)';
    btnViewTree.style.color = 'var(--text-main)';
    btnViewCode.style.background = 'transparent';
    btnViewCode.style.color = 'var(--text-muted)';
  });

  // Action listeners
  btnFormat2.addEventListener('click', () => format(2));
  btnFormat4.addEventListener('click', () => format(4));
  btnMinify.addEventListener('click', minify);
  btnSort.addEventListener('click', sortKeys);
  btnRepair.addEventListener('click', repairJson);

  btnSample.addEventListener('click', () => {
    inputEl.value = JSON.stringify({
      product: "ToolForge Suite",
      version: 2.5,
      privacy: {
        inBrowser: true,
        zeroUploads: true,
        telemetry: null
      },
      tags: ["tools", "privacy", "client-side", "developer"],
      metrics: {
        activeTools: 24,
        responseTimeMs: 0
      }
    }, null, 2);
    format(2);
  });

  btnClear.addEventListener('click', () => {
    inputEl.value = '';
    outputEl.value = '';
    treeWrapEl.innerHTML = '';
    hideStatus();
    updateStats();
  });

  btnCopy.addEventListener('click', () => {
    window.copyToClipboard(outputEl.value, 'Formatted JSON copied!');
  });

  btnDownload.addEventListener('click', () => {
    const text = outputEl.value || inputEl.value;
    if (!text) return;
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolforge_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showToast('Downloaded JSON file!', 'success');
  });

  inputEl.addEventListener('input', () => {
    updateStats();
    format(2);
  });

})();
