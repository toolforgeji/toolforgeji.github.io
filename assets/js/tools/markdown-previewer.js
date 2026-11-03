// ToolForge - Markdown Live Editor & Synchronized Preview Logic
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('md-input');
  const preview = document.getElementById('md-preview');
  const sampleBtn = document.getElementById('sample-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyHtmlBtn = document.getElementById('copy-html-btn');
  const downloadBtn = document.getElementById('download-md-btn');
  const wordCountEl = document.getElementById('word-count');
  const charCountEl = document.getElementById('char-count');

  const sampleMarkdown = `# Welcome to ToolForge Markdown Editor

A modern, fast, in-browser Markdown editor with **instant live preview**.

## Key Features
- **Zero Uploads**: Everything is processed in your browser memory.
- **GFM Syntax**: Tables, task lists, code blocks, and blockquotes.
- **Export Options**: Copy raw HTML or download the \`.md\` file directly.

### Task List
- [x] Create project architecture
- [x] Build 24 initial utilities
- [ ] Add modern split-pane tools
- [ ] Deploy to GitHub Pages

### Code Example
\`\`\`javascript
function calculatePrivacy() {
  return "100% Client-Side";
}
\`\`\`

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

### Feature Comparison
| Feature | ToolForge | Cloud Converters |
| :--- | :--- | :--- |
| Privacy | 100% In-Browser | Server Uploaded |
| Pricing | Free Forever | Subscriptions |
| Tracking | Zero Trackers | Ad Trackers |

---
*Created with ToolForge — The privacy-first utility suite.*
`;

  function parseMarkdown(md) {
    if (!md) return '<p style="color: var(--text-muted); font-style: italic;">Preview will appear here in real time...</p>';

    // Escape HTML first to prevent XSS
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Fenced Code Blocks: ```code```
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre style="background: var(--bg-subtle); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); overflow-x: auto; margin: 16px 0; font-family: var(--font-mono); font-size: 0.85rem;"><code class="language-${lang}">${code.trim()}</code></pre>`;
    });

    // Inline Code: `code`
    html = html.replace(/`([^`]+)`/g, '<code style="background: var(--bg-subtle); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em; border: 1px solid var(--border-subtle);">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25rem; margin: 20px 0 10px 0; font-weight: 700;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5rem; margin: 24px 0 12px 0; font-weight: 700; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 1.85rem; margin: 28px 0 16px 0; font-weight: 800;">$1</h1>');

    // Blockquotes
    html = html.replace(/^\&gt;\s?(.*$)/gim, '<blockquote style="border-left: 3px solid var(--accent); padding-left: 14px; margin: 16px 0; color: var(--text-muted); font-style: italic;">$1</blockquote>');

    // Horizontal Rule
    html = html.replace(/^---$/gim, '<hr style="border: none; border-top: 1px solid var(--border-subtle); margin: 24px 0;" />');

    // Task Lists: - [x] or - [ ]
    html = html.replace(/^-\s*\[x\]\s*(.*$)/gim, '<div style="display: flex; align-items: center; gap: 8px; margin: 6px 0;"><input type="checkbox" checked disabled /> <span style="text-decoration: line-through; color: var(--text-muted);">$1</span></div>');
    html = html.replace(/^-\s*\[\s*\]\s*(.*$)/gim, '<div style="display: flex; align-items: center; gap: 8px; margin: 6px 0;"><input type="checkbox" disabled /> <span>$1</span></div>');

    // Bold & Italics
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="color: var(--text-main); font-weight: 700;">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em style="color: var(--text-main);">$1</em>');

    // Links: [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color: var(--accent); text-decoration: underline;">$1</a>');

    // Simple Tables
    html = html.replace(/(\|.+\|\n)+/g, (tableBlock) => {
      const rows = tableBlock.trim().split('\n');
      if (rows.length < 2) return tableBlock;
      let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.875rem;">';
      rows.forEach((row, idx) => {
        if (row.includes('---')) return; // separator
        const cells = row.split('|').filter(c => c.trim() !== '');
        tableHtml += '<tr>';
        cells.forEach(c => {
          const tag = idx === 0 ? 'th' : 'td';
          const style = idx === 0 
            ? 'background: var(--bg-subtle); font-weight: 700; text-align: left; padding: 8px 12px; border: 1px solid var(--border-subtle);' 
            : 'padding: 8px 12px; border: 1px solid var(--border-subtle);';
          tableHtml += `<${tag} style="${style}">${c.trim()}</${tag}>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</table>';
      return tableHtml;
    });

    // Unordered Lists
    html = html.replace(/^\*\s(.*$)/gim, '<li style="margin-left: 20px; margin-bottom: 4px;">$1</li>');
    html = html.replace(/^-\s(.*$)/gim, '<li style="margin-left: 20px; margin-bottom: 4px;">$1</li>');

    // Paragraphs (lines separated by double newlines)
    const blocks = html.split(/\n\s*\n/);
    return blocks.map(b => {
      b = b.trim();
      if (!b) return '';
      if (/^<(h[1-6]|pre|blockquote|hr|div|table|li)/i.test(b)) return b;
      return `<p style="margin-bottom: 14px; line-height: 1.6;">${b.replace(/\n/g, '<br/>')}</p>`;
    }).join('\n');
  }

  function update() {
    const val = input.value;
    const rendered = parseMarkdown(val);
    preview.innerHTML = rendered;

    // Word and character count
    const words = (val.trim().match(/\S+/g) || []).length;
    const chars = val.length;
    wordCountEl.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
    charCountEl.textContent = `${chars} chars`;
  }

  input.addEventListener('input', update);

  sampleBtn.addEventListener('click', () => {
    input.value = sampleMarkdown;
    update();
    window.showToast('Sample markdown loaded', 'info');
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    update();
    window.showToast('Editor cleared', 'info');
  });

  copyHtmlBtn.addEventListener('click', () => {
    if (!input.value.trim()) {
      window.showToast('No content to copy', 'error');
      return;
    }
    const htmlToCopy = preview.innerHTML;
    window.copyToClipboard(htmlToCopy);
  });

  downloadBtn.addEventListener('click', () => {
    if (!input.value.trim()) {
      window.showToast('Enter some markdown first', 'error');
      return;
    }
    const blob = new Blob([input.value], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('Downloaded document.md', 'success');
  });

  // Load sample initially
  input.value = sampleMarkdown;
  update();
});
