/**
 * ToolForge Regex Tester - Live ECMAScript RegExp playground & group inspector
 */

(function () {
  'use strict';

  const patternInput = document.getElementById('rgx-pattern');
  const testTextInput = document.getElementById('rgx-test-text');
  const highlightView = document.getElementById('rgx-highlight-view');
  const matchesList = document.getElementById('rgx-matches-list');
  const matchCountEl = document.getElementById('rgx-match-count');
  const errorEl = document.getElementById('rgx-error');
  const replacePatternInput = document.getElementById('rgx-replace-pattern');
  const replaceResultEl = document.getElementById('rgx-replace-result');

  const flagG = document.getElementById('flag-g');
  const flagI = document.getElementById('flag-i');
  const flagM = document.getElementById('flag-m');
  const flagS = document.getElementById('flag-s');

  const getFlags = () => {
    let f = '';
    if (flagG.checked) f += 'g';
    if (flagI.checked) f += 'i';
    if (flagM.checked) f += 'm';
    if (flagS.checked) f += 's';
    return f;
  };

  const escapeHtml = (str) => {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  const runRegex = () => {
    const rawPattern = patternInput.value;
    const testText = testTextInput.value;
    const flags = getFlags();

    errorEl.style.display = 'none';

    if (!rawPattern) {
      matchCountEl.textContent = '0 matches';
      highlightView.innerHTML = escapeHtml(testText);
      matchesList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8125rem; text-align: center; padding: 20px;">Enter a regular expression pattern above.</div>';
      replaceResultEl.textContent = testText;
      return;
    }

    let regex;
    try {
      regex = new RegExp(rawPattern, flags);
    } catch (err) {
      errorEl.style.display = 'block';
      errorEl.textContent = 'Invalid RegExp: ' + err.message;
      matchCountEl.textContent = 'Syntax error';
      highlightView.innerHTML = escapeHtml(testText);
      matchesList.innerHTML = '<div style="color: var(--danger); font-size: 0.8125rem; padding: 12px;">Invalid pattern syntax.</div>';
      return;
    }

    // Execute matches
    const matches = [];
    if (flags.includes('g')) {
      let m;
      let safetyCounter = 0;
      while ((m = regex.exec(testText)) !== null && safetyCounter < 1000) {
        matches.push(m);
        safetyCounter++;
        if (m.index === regex.lastIndex) {
          regex.lastIndex++; // Avoid infinite loop on zero-width match
        }
      }
    } else {
      const m = regex.exec(testText);
      if (m) matches.push(m);
    }

    matchCountEl.textContent = `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}`;

    // 1. Render Highlighted Text
    let highlightedHtml = '';
    let lastIndex = 0;

    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const start = m.index;
      const end = start + m[0].length;

      highlightedHtml += escapeHtml(testText.substring(lastIndex, start));
      highlightedHtml += `<span class="regex-highlight">${escapeHtml(m[0])}</span>`;
      lastIndex = end;
    }
    highlightedHtml += escapeHtml(testText.substring(lastIndex));
    highlightView.innerHTML = highlightedHtml || '<span style="color: var(--text-faint);">(Empty string)</span>';

    // 2. Render Match Cards & Capture Groups
    if (matches.length === 0) {
      matchesList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8125rem; text-align: center; padding: 20px;">No matches found.</div>';
    } else {
      matchesList.innerHTML = matches.map((m, idx) => {
        let groupsHtml = '';
        if (m.length > 1) {
          for (let g = 1; g < m.length; g++) {
            groupsHtml += `
              <div style="display: flex; gap: 8px; font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                <span style="color: var(--accent); font-weight: 600;">Group ${g}:</span>
                <span style="font-family: var(--font-mono); color: var(--text-main);">${escapeHtml(m[g] !== undefined ? m[g] : 'undefined')}</span>
              </div>
            `;
          }
        }

        return `
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 8px 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-faint); margin-bottom: 4px;">
              <span style="font-weight: 700; color: var(--accent);">Match #${idx + 1}</span>
              <span>index ${m.index}..${m.index + m[0].length}</span>
            </div>
            <div style="font-family: var(--font-mono); font-weight: 600; font-size: 0.875rem; color: var(--text-main); word-break: break-all;">
              "${escapeHtml(m[0])}"
            </div>
            ${groupsHtml}
          </div>
        `;
      }).join('');
    }

    // 3. Substitution
    const replacePattern = replacePatternInput.value;
    try {
      const subRegex = new RegExp(rawPattern, flags);
      const replaced = testText.replace(subRegex, replacePattern);
      replaceResultEl.textContent = replaced;
    } catch {
      replaceResultEl.textContent = testText;
    }
  };

  // Listeners
  [patternInput, testTextInput, replacePatternInput, flagG, flagI, flagM, flagS].forEach(el => {
    el.addEventListener('input', runRegex);
    el.addEventListener('change', runRegex);
  });

  // Presets
  document.querySelectorAll('.regex-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      patternInput.value = btn.getAttribute('data-pattern');
      testTextInput.value = btn.getAttribute('data-sample');
      const flags = btn.getAttribute('data-flags') || 'g';
      flagG.checked = flags.includes('g');
      flagI.checked = flags.includes('i');
      flagM.checked = flags.includes('m');
      flagS.checked = flags.includes('s');
      runRegex();
      window.showToast(`Loaded ${btn.textContent} preset`, 'info');
    });
  });

  // Initial trigger
  runRegex();

})();
