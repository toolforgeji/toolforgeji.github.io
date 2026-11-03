/**
 * ToolForge Word Counter & Text Statistics
 */

(function () {
  'use strict';

  const textInput = document.getElementById('wc-text-input');
  const statWords = document.getElementById('stat-words');
  const statChars = document.getElementById('stat-chars');
  const statSentences = document.getElementById('stat-sentences');
  const statParagraphs = document.getElementById('stat-paragraphs');
  const statReading = document.getElementById('stat-reading');
  const statSpeaking = document.getElementById('stat-speaking');
  const statCharsNoSpace = document.getElementById('stat-chars-nospace');
  const statAvgWordLen = document.getElementById('stat-avg-word-len');
  const statFleschScore = document.getElementById('stat-flesch-score');
  const statFleschBadge = document.getElementById('stat-flesch-badge');
  const topWordsWrap = document.getElementById('stat-top-words-wrap');
  const copyBtn = document.getElementById('wc-copy-btn');
  const clearBtn = document.getElementById('wc-clear-btn');

  const stopWords = new Set([
    'the','and','to','of','a','in','is','it','that','you','for','on','with','as','this',
    'by','at','be','are','from','or','an','was','we','will','my','all','your','can','if'
  ]);

  const analyze = () => {
    const text = textInput.value;

    if (!text.trim()) {
      statWords.textContent = '0';
      statChars.textContent = '0';
      statSentences.textContent = '0';
      statParagraphs.textContent = '0';
      statReading.textContent = '0m';
      statSpeaking.textContent = '0m';
      statCharsNoSpace.textContent = '0';
      statAvgWordLen.textContent = '0.0 chars';
      statFleschScore.textContent = '100';
      statFleschBadge.textContent = 'Standard / Easy';
      topWordsWrap.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8125rem;">Type text above to see recurring keyword density.</div>';
      return;
    }

    const chars = text.length;
    const charsNoSpace = text.replace(/\s+/g, '').length;

    const wordsArr = text.trim().match(/\b[a-zA-Z0-9'-]+\b/g) || [];
    const words = wordsArr.length;

    const sentences = (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (words > 0 ? 1 : 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (words > 0 ? 1 : 0);

    const readingMinutes = (words / 200).toFixed(1);
    const speakingMinutes = (words / 130).toFixed(1);

    const avgWordLen = words > 0 ? (charsNoSpace / words).toFixed(1) : '0.0';

    // Flesch Reading Ease
    let syllables = 0;
    wordsArr.forEach(raw => {
      const w = raw.toLowerCase();
      if (w.length <= 3) {
        syllables += 1;
      } else {
        const clean = w.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
        const matches = clean.match(/[aeiouy]{1,2}/g);
        syllables += matches ? matches.length : 1;
      }
    });

    let flesch = 100;
    if (words > 0 && sentences > 0) {
      flesch = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
      flesch = Math.max(0, Math.min(100, Math.round(flesch)));
    }

    let fleschDesc = 'Very Easy';
    if (flesch < 30) fleschDesc = 'Very Difficult (College Graduate)';
    else if (flesch < 50) fleschDesc = 'Difficult (College Level)';
    else if (flesch < 60) fleschDesc = 'Fairly Difficult (High School)';
    else if (flesch < 70) fleschDesc = 'Standard / Plain English';
    else if (flesch < 80) fleschDesc = 'Fairly Easy (7th Grade)';
    else if (flesch < 90) fleschDesc = 'Easy (6th Grade)';

    // Update stats DOM
    statWords.textContent = words.toLocaleString();
    statChars.textContent = chars.toLocaleString();
    statSentences.textContent = sentences.toLocaleString();
    statParagraphs.textContent = paragraphs.toLocaleString();
    statReading.textContent = `${readingMinutes}m`;
    statSpeaking.textContent = `${speakingMinutes}m`;
    statCharsNoSpace.textContent = charsNoSpace.toLocaleString();
    statAvgWordLen.textContent = `${avgWordLen} chars`;
    statFleschScore.textContent = flesch;
    statFleschBadge.textContent = fleschDesc;

    // Word frequencies
    const freqMap = {};
    wordsArr.forEach(w => {
      const lower = w.toLowerCase();
      if (!stopWords.has(lower) && lower.length > 2) {
        freqMap[lower] = (freqMap[lower] || 0) + 1;
      }
    });

    const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (sorted.length === 0) {
      topWordsWrap.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8125rem;">Type more words to populate frequency list.</div>';
    } else {
      topWordsWrap.innerHTML = sorted.map(([w, count]) => {
        const pct = ((count / words) * 100).toFixed(1);
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8125rem; padding: 4px 0;">
            <span style="font-weight: 600; color: var(--text-main); font-family: var(--font-mono);">${w}</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--text-muted);">${count}x</span>
              <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: var(--bg-subtle); color: var(--accent); font-weight: 600;">${pct}%</span>
            </div>
          </div>
        `;
      }).join('');
    }
  };

  textInput.addEventListener('input', analyze);

  copyBtn.addEventListener('click', () => {
    window.copyToClipboard(textInput.value, 'Text copied to clipboard!');
  });

  clearBtn.addEventListener('click', () => {
    textInput.value = '';
    analyze();
  });

  // Init sample
  textInput.value = 'ToolForge is a privacy-first suite of free, client-side utility tools. Every algorithm executes entirely in your browser using modern WebAssembly and native Web APIs. There are no backend tracking servers, no subscriptions, and your sensitive documents never leave your machine.';
  analyze();

})();
