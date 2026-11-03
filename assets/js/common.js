/**
 * ToolForge Shared Scripts - Theme, Command Palette, Toast, Privacy, Mobile Nav
 */

(function () {
  'use strict';

  // 1. Theme Initialization & Toggle
  const initTheme = () => {
    const saved = localStorage.getItem('tf-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcons(theme);
  };

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tf-theme', next);
    updateThemeIcons(next);
    window.showToast(`Switched to ${next} mode`, 'info');
  };

  const updateThemeIcons = (theme) => {
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      btn.innerHTML = theme === 'dark' 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    });
  };

  // 2. Toast System
  window.showToast = (message, type = 'info') => {
    let container = document.getElementById('tf-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tf-toast-container';
      container.className = 'tf-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'tf-toast';
    
    let icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    if (type === 'success') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    }

    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 150ms ease';
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  };

  // 3. Copy to Clipboard
  window.copyToClipboard = (text, successMsg = 'Copied to clipboard!') => {
    if (!text) {
      window.showToast('Nothing to copy', 'error');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      window.showToast(successMsg, 'success');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      window.showToast(successMsg, 'success');
    });
  };

  // 4. Command Palette (Search)
  let toolsCache = null;
  let selectedIdx = 0;

  const loadTools = async () => {
    if (toolsCache) return toolsCache;
    try {
      const res = await fetch('/tools.json');
      toolsCache = await res.json();
      return toolsCache;
    } catch (e) {
      console.warn('Failed to load tools.json:', e);
      return [];
    }
  };

  const createPaletteDOM = () => {
    if (document.getElementById('tf-palette-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'tf-palette-modal';
    modal.className = 'tf-modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Search tools command palette');

    modal.innerHTML = `
      <div class="tf-command-palette">
        <div class="tf-search-input-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="tf-palette-input" class="tf-search-input" placeholder="Search 24+ free client-side tools..." autocomplete="off" spellcheck="false" />
          <button id="tf-palette-close" class="tf-btn-icon" aria-label="Close search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div id="tf-palette-results" class="tf-search-results">
          <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.875rem;">Type to search tools by name, keyword, or category...</div>
        </div>
        <div class="tf-search-footer">
          <div><span class="tf-key-badge">↑</span> <span class="tf-key-badge">↓</span> navigate <span class="tf-key-badge">↵</span> select</div>
          <div><span class="tf-key-badge">ESC</span> to close</div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const input = document.getElementById('tf-palette-input');
    const closeBtn = document.getElementById('tf-palette-close');
    const resultsContainer = document.getElementById('tf-palette-results');

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePalette();
    });

    closeBtn.addEventListener('click', closePalette);

    input.addEventListener('input', async () => {
      const q = input.value.trim().toLowerCase();
      const tools = await loadTools();
      renderPaletteResults(tools, q);
    });

    input.addEventListener('keydown', (e) => {
      const items = resultsContainer.querySelectorAll('.tf-search-item');
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIdx = (selectedIdx + 1) % items.length;
        updateSelectedResult(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIdx = (selectedIdx - 1 + items.length) % items.length;
        updateSelectedResult(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const active = items[selectedIdx];
        if (active) {
          window.location.href = active.getAttribute('data-url');
        }
      } else if (e.key === 'Escape') {
        closePalette();
      }
    });
  };

  const renderPaletteResults = (tools, query) => {
    const container = document.getElementById('tf-palette-results');
    selectedIdx = 0;

    let filtered = tools;
    if (query) {
      filtered = tools.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div style="padding: 32px 16px; text-align: center; color: var(--text-muted); font-size: 0.9375rem;">No tools found matching "<strong>${escapeHtml(query)}</strong>".</div>`;
      return;
    }

    container.innerHTML = filtered.map((t, idx) => `
      <div class="tf-search-item ${idx === 0 ? 'selected' : ''}" data-url="${t.url}" role="button" tabindex="0">
        <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; color: var(--accent);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </div>
        <div class="tf-search-item-info">
          <div class="tf-search-item-title">${escapeHtml(t.name)}</div>
          <div class="tf-search-item-desc">${escapeHtml(t.description)}</div>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-faint); text-transform: uppercase;">${escapeHtml(t.category)}</div>
      </div>
    `).join('');

    const items = container.querySelectorAll('.tf-search-item');
    items.forEach((item, idx) => {
      item.addEventListener('mouseenter', () => {
        selectedIdx = idx;
        updateSelectedResult(items);
      });
      item.addEventListener('click', () => {
        window.location.href = item.getAttribute('data-url');
      });
    });
  };

  const updateSelectedResult = (items) => {
    items.forEach((it, i) => {
      it.classList.toggle('selected', i === selectedIdx);
      if (i === selectedIdx) {
        it.scrollIntoView({ block: 'nearest' });
      }
    });
  };

  const openPalette = async () => {
    createPaletteDOM();
    const modal = document.getElementById('tf-palette-modal');
    const input = document.getElementById('tf-palette-input');
    modal.classList.add('open');
    input.value = '';
    const tools = await loadTools();
    renderPaletteResults(tools, '');
    setTimeout(() => input.focus(), 50);
  };

  const closePalette = () => {
    const modal = document.getElementById('tf-palette-modal');
    if (modal) modal.classList.remove('open');
  };

  window.openCommandPalette = openPalette;

  // 5. Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const modal = document.getElementById('tf-palette-modal');
      if (modal && modal.classList.contains('open')) {
        closePalette();
      } else {
        openPalette();
      }
    } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openPalette();
    } else if (e.key === 'Escape') {
      closePalette();
    }
  });

  // 6. Privacy Notice Banner
  const initPrivacyBanner = () => {
    if (localStorage.getItem('tf-privacy-dismissed') === 'true') return;
    const banner = document.createElement('div');
    banner.className = 'tf-privacy-banner';
    banner.id = 'tf-privacy-banner';
    banner.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent); flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
      <div>
        <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">100% In-Browser Privacy</strong>
        Files and text never leave your device. Zero cloud uploads.
      </div>
      <button id="tf-privacy-dismiss" class="tf-btn-sm tf-btn-secondary" style="margin-left: auto;">Got it</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('tf-privacy-dismiss').addEventListener('click', () => {
      localStorage.setItem('tf-privacy-dismissed', 'true');
      banner.classList.add('hidden');
    });
  };

  // 7. Back to Top Button
  const initBackToTop = () => {
    const btn = document.createElement('button');
    btn.className = 'tf-back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // 8. Mobile Navigation Drawer
  const initMobileNav = () => {
    const toggle = document.getElementById('tf-mobile-toggle');
    const drawer = document.getElementById('tf-mobile-drawer');
    const closeBtn = document.getElementById('tf-mobile-close');
    if (!toggle || !drawer) return;

    const closeDrawer = () => {
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }

    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  // DOMContentLoaded setup
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initPrivacyBanner();
    initBackToTop();
    initMobileNav();

    // Bind theme buttons
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    // Bind search triggers
    document.querySelectorAll('.search-trigger-btn').forEach(btn => {
      btn.addEventListener('click', openPalette);
    });
  });

})();
