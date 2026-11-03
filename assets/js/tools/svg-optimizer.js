// ToolForge - SVG Cleaner & Optimizer Logic
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('svg-input');
  const preview = document.getElementById('svg-preview');
  const sampleBtn = document.getElementById('sample-svg-btn');
  const fileUpload = document.getElementById('file-upload');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-svg-btn');
  const downloadBtn = document.getElementById('download-svg-btn');
  const origSizeEl = document.getElementById('orig-size');
  const optSizeEl = document.getElementById('opt-size');
  const savingsBadge = document.getElementById('savings-badge');

  const stripCommentsCheck = document.getElementById('strip-comments');
  const stripMetadataCheck = document.getElementById('strip-metadata');
  const collapseWhitespaceCheck = document.getElementById('collapse-whitespace');

  const sampleSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="120" height="120" viewBox="0 0 120 120">
  <metadata id="metadata5">
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <cc:Work xmlns:cc="http://creativecommons.org/ns#">
        <dc:format xmlns:dc="http://purl.org/dc/elements/1.1/">image/svg+xml</dc:format>
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <!-- Generator comments -->
  <g inkscape:groupmode="layer" id="layer1">
    <circle cx="60" cy="60" r="50" fill="#4F46E5" />
    <path d="M 40 60 L 55 75 L 85 45" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </g>
</svg>`;

  function optimizeSvg(raw) {
    if (!raw || !raw.trim()) return '';

    let res = raw;

    // 1. Strip XML declaration & DOCTYPE
    res = res.replace(/<\?xml[\s\S]*?\?>/gi, '');
    res = res.replace(/<!DOCTYPE[\s\S]*?>/gi, '');

    // 2. Strip Comments
    if (stripCommentsCheck.checked) {
      res = res.replace(/<!--[\s\S]*?-->/g, '');
    }

    // 3. Strip Metadata & Editor Namespaces
    if (stripMetadataCheck.checked) {
      res = res.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
      res = res.replace(/xmlns:(inkscape|sodipodi|sketch|illustrator)="[^"]*"/gi, '');
      res = res.replace(/(inkscape|sodipodi|sketch):[a-z0-9_-]+="[^"]*"/gi, '');
    }

    // 4. Collapse Whitespace
    if (collapseWhitespaceCheck.checked) {
      res = res.replace(/\s+/g, ' ');
      res = res.replace(/>\s+</g, '><');
    }

    return res.trim();
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(1) + ' KB';
  }

  function update() {
    const raw = input.value;
    if (!raw.trim()) {
      preview.innerHTML = '<span style="color: var(--text-faint); font-size: 0.875rem;">SVG Preview Area</span>';
      origSizeEl.textContent = '0 B';
      optSizeEl.textContent = '0 B';
      savingsBadge.style.display = 'none';
      return;
    }

    const cleaned = optimizeSvg(raw);
    const origBytes = new Blob([raw]).size;
    const optBytes = new Blob([cleaned]).size;

    origSizeEl.textContent = formatBytes(origBytes);
    optSizeEl.textContent = formatBytes(optBytes);

    if (origBytes > 0) {
      const saved = Math.max(0, Math.round(((origBytes - optBytes) / origBytes) * 100));
      savingsBadge.textContent = `${saved}% Saved`;
      savingsBadge.style.display = 'inline-flex';
    }

    // Visual Preview safely
    if (cleaned.includes('<svg')) {
      preview.innerHTML = cleaned;
      const svgEl = preview.querySelector('svg');
      if (svgEl) {
        svgEl.style.maxWidth = '100%';
        svgEl.style.maxHeight = '240px';
      }
    } else {
      preview.innerHTML = '<span style="color: var(--danger); font-size: 0.875rem;">Invalid SVG markup</span>';
    }
  }

  [input, stripCommentsCheck, stripMetadataCheck, collapseWhitespaceCheck].forEach(el => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  sampleBtn.addEventListener('click', () => {
    input.value = sampleSvg;
    update();
    window.showToast('Sample SVG loaded', 'info');
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    update();
    window.showToast('Cleared SVG input', 'info');
  });

  fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      input.value = evt.target.result;
      update();
      window.showToast(`Loaded ${file.name}`, 'success');
    };
    reader.readAsText(file);
  });

  copyBtn.addEventListener('click', () => {
    const cleaned = optimizeSvg(input.value);
    if (!cleaned) {
      window.showToast('Please enter an SVG first', 'error');
      return;
    }
    window.copyToClipboard(cleaned);
  });

  downloadBtn.addEventListener('click', () => {
    const cleaned = optimizeSvg(input.value);
    if (!cleaned) {
      window.showToast('Please enter an SVG first', 'error');
      return;
    }
    const blob = new Blob([cleaned], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('Downloaded optimized.svg', 'success');
  });

  // Initial load
  input.value = sampleSvg;
  update();
});
