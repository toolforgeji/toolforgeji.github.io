/**
 * ToolForge SEO Keyword Density Analyzer (N-grams & Over-optimization)
 */

(function () {
  'use strict';

  let currentNgram = 1;

  const textInput = document.getElementById('kd-text-input');
  const stopWordsToggle = document.getElementById('kd-filter-stopwords');
  const totalWordsEl = document.getElementById('kd-total-words');
  const tableTbody = document.getElementById('kd-table-tbody');

  const tab1 = document.getElementById('kd-tab-1');
  const tab2 = document.getElementById('kd-tab-2');
  const tab3 = document.getElementById('kd-tab-3');

  const stopWords = new Set([
    'the','and','to','of','a','in','is','it','that','you','for','on','with','as','this',
    'by','at','be','are','from','or','an','was','we','will','my','all','your','can','if',
    'but','not','what','so','up','out','then','them','their','they','about','into','over'
  ]);

  const switchTab = (n, btn) => {
    currentNgram = n;
    [tab1, tab2, tab3].forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    analyze();
  };

  tab1.addEventListener('click', () => switchTab(1, tab1));
  tab2.addEventListener('click', () => switchTab(2, tab2));
  tab3.addEventListener('click', () => switchTab(3, tab3));

  const escapeHtml = (str) => {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  const analyze = () => {
    const raw = textInput.value;
    if (!raw.trim()) {
      totalWordsEl.textContent = '0';
      tableTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">Paste content above to inspect keyword density.</td></tr>';
      return;
    }

    const filterStop = stopWordsToggle.checked;
    const rawWords = raw.trim().match(/\b[a-zA-Z0-9'-]+\b/g) || [];
    const totalWords = rawWords.length;
    totalWordsEl.textContent = totalWords.toLocaleString();

    if (totalWords === 0) return;

    const tokens = rawWords.map(w => w.toLowerCase());
    const freqMap = {};

    if (currentNgram === 1) {
      tokens.forEach(w => {
        if (filterStop && (stopWords.has(w) || w.length < 3)) return;
        freqMap[w] = (freqMap[w] || 0) + 1;
      });
    } else if (currentNgram === 2) {
      for (let i = 0; i < tokens.length - 1; i++) {
        const w1 = tokens[i];
        const w2 = tokens[i + 1];
        if (filterStop && (stopWords.has(w1) && stopWords.has(w2))) continue;
        const phrase = `${w1} ${w2}`;
        freqMap[phrase] = (freqMap[phrase] || 0) + 1;
      }
    } else if (currentNgram === 3) {
      for (let i = 0; i < tokens.length - 2; i++) {
        const w1 = tokens[i];
        const w2 = tokens[i + 1];
        const w3 = tokens[i + 2];
        if (filterStop && (stopWords.has(w1) && stopWords.has(w2) && stopWords.has(w3))) continue;
        const phrase = `${w1} ${w2} ${w3}`;
        freqMap[phrase] = (freqMap[phrase] || 0) + 1;
      }
    }

    const sorted = Object.entries(freqMap)
      .filter(([_, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    if (sorted.length === 0) {
      tableTbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">No recurring phrases match the current filter.</td></tr>';
      return;
    }

    tableTbody.innerHTML = sorted.map(([phrase, count]) => {
      const pct = (count / totalWords) * 100;
      const pctFormatted = pct.toFixed(2) + '%';

      let statusBadge = `<span style="color: var(--success); font-weight: 600; font-size: 0.75rem;">Optimal (1-2.5%)</span>`;
      if (pct > 3.0) {
        statusBadge = `<span style="color: var(--danger); font-weight: 700; font-size: 0.75rem; background: rgba(239, 68, 68, 0.15); padding: 2px 6px; border-radius: 4px;">Warning: >3% High Density</span>`;
      } else if (pct < 1.0) {
        statusBadge = `<span style="color: var(--text-faint); font-size: 0.75rem;">Low Frequency</span>`;
      }

      return `
        <tr style="border-bottom: 1px solid var(--border-subtle);">
          <td style="padding: 10px 8px; font-weight: 600; color: var(--text-main); font-family: var(--font-mono);">${escapeHtml(phrase)}</td>
          <td style="padding: 10px 8px; text-align: center; color: var(--text-muted);">${count}</td>
          <td style="padding: 10px 8px; text-align: center; font-weight: 700; color: var(--accent);">${pctFormatted}</td>
          <td style="padding: 10px 8px;">${statusBadge}</td>
        </tr>
      `;
    }).join('');
  };

  textInput.addEventListener('input', analyze);
  stopWordsToggle.addEventListener('change', analyze);

  // Sample data
  textInput.value = 'Client-side tools provide total data privacy. With client-side tools, files never leave your browser. Modern web applications run fast client-side tools using WebAssembly, ensuring your private data remains completely confidential. When you use in-browser tools, you enjoy zero cloud transmission.';
  analyze();

})();
