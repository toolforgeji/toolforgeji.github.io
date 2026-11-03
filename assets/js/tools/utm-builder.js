// ToolForge - UTM Campaign URL Builder Logic
document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('base-url');
  const sourceInput = document.getElementById('utm-source');
  const mediumInput = document.getElementById('utm-medium');
  const campaignInput = document.getElementById('utm-campaign');
  const termInput = document.getElementById('utm-term');
  const contentInput = document.getElementById('utm-content');
  const resultUrl = document.getElementById('result-url');
  const copyBtn = document.getElementById('copy-url-btn');
  const clearBtn = document.getElementById('clear-btn');
  const queryParamBreakdown = document.getElementById('param-breakdown');
  const presetButtons = document.querySelectorAll('[data-preset]');

  const presets = {
    google: { source: 'google', medium: 'cpc' },
    facebook: { source: 'facebook', medium: 'paid-social' },
    linkedin: { source: 'linkedin', medium: 'sponsored-post' },
    twitter: { source: 'x-twitter', medium: 'social' },
    newsletter: { source: 'newsletter', medium: 'email' },
    affiliate: { source: 'affiliate-partner', medium: 'referral' }
  };

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      if (presets[presetKey]) {
        sourceInput.value = presets[presetKey].source;
        mediumInput.value = presets[presetKey].medium;
        updateUrl();
        window.showToast(`Applied ${btn.textContent.trim()} preset`, 'info');
      }
    });
  });

  function updateUrl() {
    let rawBase = (urlInput.value || '').trim();
    if (!rawBase) {
      resultUrl.value = '';
      if (queryParamBreakdown) queryParamBreakdown.innerHTML = '<span class="text-secondary text-sm">Enter a website URL above to preview generated parameters.</span>';
      return;
    }

    if (!/^https?:\/\//i.test(rawBase)) {
      rawBase = 'https://' + rawBase;
    }

    try {
      const parsed = new URL(rawBase);
      const params = [
        ['utm_source', sourceInput.value.trim()],
        ['utm_medium', mediumInput.value.trim()],
        ['utm_campaign', campaignInput.value.trim()],
        ['utm_term', termInput.value.trim()],
        ['utm_content', contentInput.value.trim()]
      ];

      params.forEach(([key, val]) => {
        if (val) {
          parsed.searchParams.set(key, val);
        } else {
          parsed.searchParams.delete(key);
        }
      });

      resultUrl.value = parsed.toString();

      if (queryParamBreakdown) {
        const activeParams = params.filter(([_, val]) => !!val);
        if (activeParams.length === 0) {
          queryParamBreakdown.innerHTML = '<span class="text-secondary text-sm">No UTM parameters specified yet.</span>';
        } else {
          queryParamBreakdown.innerHTML = activeParams.map(([k, v]) => `
            <div style="display: flex; justify-content: space-between; padding: 6px 12px; background: var(--bg-surface-alt); border-radius: 6px; font-size: 0.85rem; font-family: var(--font-mono);">
              <span style="color: var(--color-primary); font-weight: 600;">${k}</span>
              <span style="color: var(--text-primary);">${v}</span>
            </div>
          `).join('');
        }
      }
    } catch {
      resultUrl.value = rawBase;
    }
  }

  [urlInput, sourceInput, mediumInput, campaignInput, termInput, contentInput].forEach(el => {
    if (el) el.addEventListener('input', updateUrl);
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!resultUrl.value) {
        window.showToast('Please enter a URL first', 'error');
        return;
      }
      window.copyToClipboard(resultUrl.value);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      [urlInput, sourceInput, mediumInput, campaignInput, termInput, contentInput].forEach(el => {
        if (el) el.value = '';
      });
      updateUrl();
      window.showToast('Inputs cleared', 'info');
    });
  }

  // Initial call
  updateUrl();
});
