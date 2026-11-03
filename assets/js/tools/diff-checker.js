// ToolForge - Text & Code Diff Checker Logic
document.addEventListener('DOMContentLoaded', () => {
  const origInput = document.getElementById('orig-input');
  const modInput = document.getElementById('mod-input');
  const diffOutput = document.getElementById('diff-output');
  const loadSampleBtn = document.getElementById('load-sample-btn');
  const swapBtn = document.getElementById('swap-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyDiffBtn = document.getElementById('copy-diff-btn');
  const addedCountEl = document.getElementById('added-count');
  const removedCountEl = document.getElementById('removed-count');

  const sampleOrig = `// Configuration baseline
const config = {
  appName: "ToolForge",
  version: "1.0.0",
  privacy: "in-browser",
  telemetry: true,
  maxTools: 24
};

function init() {
  console.log("Starting legacy suite");
}`;

  const sampleMod = `// Configuration baseline
const config = {
  appName: "ToolForge Modern",
  version: "2.0.0",
  privacy: "100% in-browser",
  telemetry: false,
  maxTools: 28,
  offlineSupport: true
};

function init() {
  console.log("Starting modernized utility suite");
}`;

  function computeDiff(orig, mod) {
    const origLines = orig.split('\n');
    const modLines = mod.split('\n');
    const result = [];

    let i = 0;
    let j = 0;
    let leftNum = 1;
    let rightNum = 1;
    let added = 0;
    let removed = 0;

    while (i < origLines.length || j < modLines.length) {
      if (i < origLines.length && j < modLines.length && origLines[i] === modLines[j]) {
        result.push({
          type: 'unchanged',
          content: origLines[i],
          left: leftNum++,
          right: rightNum++
        });
        i++;
        j++;
      } else if (j < modLines.length && (i >= origLines.length || !origLines.slice(i, i + 8).includes(modLines[j]))) {
        result.push({
          type: 'added',
          content: modLines[j],
          left: '',
          right: rightNum++
        });
        added++;
        j++;
      } else if (i < origLines.length) {
        result.push({
          type: 'removed',
          content: origLines[i],
          left: leftNum++,
          right: ''
        });
        removed++;
        i++;
      }
    }

    return { result, added, removed };
  }

  function update() {
    const orig = origInput.value;
    const mod = modInput.value;

    if (!orig && !mod) {
      diffOutput.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted);">Paste text or code into both panes above to inspect changes.</div>';
      addedCountEl.textContent = '+0 added';
      removedCountEl.textContent = '-0 removed';
      return;
    }

    const { result, added, removed } = computeDiff(orig, mod);
    addedCountEl.textContent = `+${added} added`;
    removedCountEl.textContent = `-${removed} removed`;

    diffOutput.innerHTML = result.map(line => {
      const lineClass = line.type === 'added' ? 'tf-diff-added' : line.type === 'removed' ? 'tf-diff-removed' : 'tf-diff-unchanged';
      const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';
      const lineNum = (line.left || line.right) ? `${line.left || ' '}:${line.right || ' '}` : ' ';
      return `
        <div class="tf-diff-line ${lineClass}">
          <span class="tf-diff-line-number">${lineNum}</span>
          <span style="font-weight: 600; margin-right: 6px; user-select: none;">${prefix}</span>
          <span style="white-space: pre-wrap; word-break: break-all;">${escapeHtml(line.content)}</span>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  origInput.addEventListener('input', update);
  modInput.addEventListener('input', update);

  loadSampleBtn.addEventListener('click', () => {
    origInput.value = sampleOrig;
    modInput.value = sampleMod;
    update();
    window.showToast('Sample diff loaded', 'info');
  });

  swapBtn.addEventListener('click', () => {
    const tmp = origInput.value;
    origInput.value = modInput.value;
    modInput.value = tmp;
    update();
    window.showToast('Panes swapped', 'info');
  });

  clearBtn.addEventListener('click', () => {
    origInput.value = '';
    modInput.value = '';
    update();
    window.showToast('Cleared inputs', 'info');
  });

  copyDiffBtn.addEventListener('click', () => {
    const { result } = computeDiff(origInput.value, modInput.value);
    const textToCopy = result.map(l => {
      const p = l.type === 'added' ? '+ ' : l.type === 'removed' ? '- ' : '  ';
      return p + l.content;
    }).join('\n');
    window.copyToClipboard(textToCopy);
  });

  // Initial load
  origInput.value = sampleOrig;
  modInput.value = sampleMod;
  update();
});
