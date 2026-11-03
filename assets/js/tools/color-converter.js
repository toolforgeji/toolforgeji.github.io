// ToolForge - Color Converter & WCAG Studio Logic
document.addEventListener('DOMContentLoaded', () => {
  const hexInput = document.getElementById('hex-input');
  const nativePicker = document.getElementById('native-color-picker');
  const preview = document.getElementById('color-preview');
  const previewText = document.getElementById('preview-text');
  const rgbOutput = document.getElementById('rgb-output');
  const hslOutput = document.getElementById('hsl-output');
  const cmykOutput = document.getElementById('cmyk-output');
  const cssOutput = document.getElementById('css-output');
  const whiteRatioEl = document.getElementById('white-ratio');
  const whiteBadgeEl = document.getElementById('white-wcag-badge');
  const blackRatioEl = document.getElementById('black-ratio');
  const blackBadgeEl = document.getElementById('black-wcag-badge');
  const paletteStrip = document.getElementById('palette-strip');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const copyButtons = document.querySelectorAll('.copy-btn');

  function parseHex(hexStr) {
    let clean = hexStr.trim().replace(/^#/, '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      hex: '#' + clean.toUpperCase()
    };
  }

  function rgbToHsl(r, g, b) {
    const rN = r / 255, gN = g / 255, bN = b / 255;
    const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rN: h = (gN - bN) / d + (gN < bN ? 6 : 0); break;
        case gN: h = (bN - rN) / d + 2; break;
        case bN: h = (rN - gN) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function rgbToCmyk(r, g, b) {
    const rN = r / 255, gN = g / 255, bN = b / 255;
    const k = 1 - Math.max(rN, gN, bN);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = Math.round(((1 - rN - k) / (1 - k)) * 100);
    const m = Math.round(((1 - gN - k) / (1 - k)) * 100);
    const y = Math.round(((1 - bN - k) / (1 - k)) * 100);
    return { c, m, y, k: Math.round(k * 100) };
  }

  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function contrast(lum1, lum2) {
    const brighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (brighter + 0.05) / (darker + 0.05);
  }

  function updateColor(rgbObj) {
    if (!rgbObj) return;
    const { r, g, b, hex } = rgbObj;
    hexInput.value = hex;
    nativePicker.value = hex.toLowerCase();

    // Update Swatch
    preview.style.backgroundColor = hex;
    previewText.textContent = hex;

    // Converted formats
    rgbOutput.value = `rgb(${r}, ${g}, ${b})`;
    const hsl = rgbToHsl(r, g, b);
    hslOutput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    const cmyk = rgbToCmyk(r, g, b);
    cmykOutput.value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    cssOutput.value = `--color-primary: ${hex};`;

    // Contrast calculations
    const lum = getLuminance(r, g, b);
    const whiteRatio = Math.round(contrast(lum, 1.0) * 100) / 100;
    const blackRatio = Math.round(contrast(lum, 0.0) * 100) / 100;

    whiteRatioEl.textContent = `${whiteRatio}:1`;
    blackRatioEl.textContent = `${blackRatio}:1`;

    // White text badge
    if (whiteRatio >= 7) {
      whiteBadgeEl.className = 'tf-contrast-badge tf-contrast-pass';
      whiteBadgeEl.textContent = 'WCAG AAA Pass';
    } else if (whiteRatio >= 4.5) {
      whiteBadgeEl.className = 'tf-contrast-badge tf-contrast-pass';
      whiteBadgeEl.textContent = 'WCAG AA Pass';
    } else {
      whiteBadgeEl.className = 'tf-contrast-badge tf-contrast-fail';
      whiteBadgeEl.textContent = 'WCAG Fail (<4.5)';
    }

    // Black text badge
    if (blackRatio >= 7) {
      blackBadgeEl.className = 'tf-contrast-badge tf-contrast-pass';
      blackBadgeEl.textContent = 'WCAG AAA Pass';
    } else if (blackRatio >= 4.5) {
      blackBadgeEl.className = 'tf-contrast-badge tf-contrast-pass';
      blackBadgeEl.textContent = 'WCAG AA Pass';
    } else {
      blackBadgeEl.className = 'tf-contrast-badge tf-contrast-fail';
      blackBadgeEl.textContent = 'WCAG Fail (<4.5)';
    }

    // Adapt text color on main preview swatch
    previewText.style.color = whiteRatio >= blackRatio ? '#ffffff' : '#0f172a';

    // Generate Tint & Shade Palette
    paletteStrip.innerHTML = '';
    const lightSteps = [90, 80, 70, 60, 50, 40, 30, 20, 10];
    lightSteps.forEach(step => {
      const swatchHsl = `hsl(${hsl.h}, ${hsl.s}%, ${step}%)`;
      const cell = document.createElement('div');
      cell.style.backgroundColor = swatchHsl;
      cell.style.borderRadius = '6px';
      cell.style.cursor = 'pointer';
      cell.title = `Click to copy ${swatchHsl}`;
      cell.addEventListener('click', () => {
        window.copyToClipboard(swatchHsl);
      });
      paletteStrip.appendChild(cell);
    });
  }

  hexInput.addEventListener('input', (e) => {
    const parsed = parseHex(e.target.value);
    if (parsed) updateColor(parsed);
  });

  nativePicker.addEventListener('input', (e) => {
    const parsed = parseHex(e.target.value);
    if (parsed) updateColor(parsed);
  });

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const parsed = parseHex(btn.dataset.color);
      if (parsed) updateColor(parsed);
    });
  });

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetInput = document.getElementById(btn.dataset.target);
      if (targetInput && targetInput.value) {
        window.copyToClipboard(targetInput.value);
      }
    });
  });

  // Initial update
  updateColor(parseHex('#4F46E5'));
});
