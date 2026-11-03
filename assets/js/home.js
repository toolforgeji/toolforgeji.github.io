/**
 * ToolForge Home Page Interactions & Dynamic Tool Filtering
 * Includes Grid/List View switcher, instant search filter, and Recents shelf.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('all-tools-grid');
  const filterBtns = document.querySelectorAll('.tf-filter-btn');
  const viewGridBtn = document.getElementById('view-grid-btn');
  const viewListBtn = document.getElementById('view-list-btn');
  const inlineSearchInput = document.getElementById('inline-search-input');
  const recentsContainer = document.getElementById('recents-shelf');
  const recentsChips = document.getElementById('recents-chips');

  if (!grid) return;

  let tools = [];
  let currentCategory = 'all';
  let currentView = localStorage.getItem('tf_view_mode') || 'grid';
  let searchQuery = '';

  try {
    const res = await fetch('/tools.json');
    tools = await res.json();
  } catch (err) {
    console.error('Failed to fetch tools:', err);
    return;
  }

  const getToolIcon = (iconName) => {
    const icons = {
      'file-down': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line>',
      'combine': '<path d="M10 18H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5"></path><rect x="10" y="10" width="12" height="12" rx="2"></rect>',
      'file-image': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><circle cx="10" cy="12" r="2"></circle><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 21"></path>',
      'scan-text': '<path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="7" y1="16" x2="13" y2="16"></line>',
      'image-minus': '<circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path><path d="M16 5h6"></path><path d="M4 19V5a2 2 0 0 1 2-2h10"></path>',
      'image': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>',
      'refresh-cw': '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',
      'braces': '<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1"></path><path d="M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"></path>',
      'code-2': '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
      'binary': '<rect x="14" y="14" width="4" height="6" rx="2"></rect><rect x="6" y="4" width="4" height="6" rx="2"></rect><path d="M6 20h4"></path><path d="M14 10h4"></path><path d="M6 14h2v6"></path><path d="M14 4h2v6"></path>',
      'clock': '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
      'receipt': '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 17.5v.5"></path><path d="M12 6v.5"></path>',
      'percent': '<line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle>',
      'calculator': '<rect width="16" height="20" x="4" y="2" rx="2"></rect><line x1="8" x2="16" y1="6" y2="6"></line><line x1="16" x2="16" y1="14" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path>',
      'type': '<polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line>',
      'case-sensitive': '<path d="m3 15 4-8 4 8"></path><path d="M4 13h6"></path><circle cx="18" cy="12" r="3"></circle><path d="M21 9v6"></path>',
      'qr-code': '<rect width="5" height="5" x="3" y="3" rx="1"></rect><rect width="5" height="5" x="16" y="3" rx="1"></rect><rect width="5" height="5" x="3" y="16" rx="1"></rect><path d="M21 16h-3a2 2 0 0 0-2 2v3"></path><path d="M21 21v.01"></path><path d="M12 7v3a2 2 0 0 1-2 2H7"></path><path d="M3 12h.01"></path><path d="M12 3h.01"></path><path d="M12 16v.01"></path><path d="M16 12h1"></path><path d="M21 12v.01"></path><path d="M12 21v-1"></path>',
      'scale': '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>',
      'calendar': '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
      'tags': '<path d="m15 5 4 4"></path><path d="M13 3l6 6-9 9H4v-6l9-9z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle>',
      'bot': '<path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M21 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path>',
      'network': '<rect x="16" y="16" width="6" height="6" rx="1"></rect><rect x="2" y="16" width="6" height="6" rx="1"></rect><rect x="9" y="2" width="6" height="6" rx="1"></rect><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path><path d="M12 12V8"></path>',
      'link-2': '<path d="M9 17H7A5 5 0 0 1 7 7h2"></path><path d="M15 7h2a5 5 0 1 1 0 10h-2"></path><line x1="8" y1="12" x2="16" y2="12"></line>',
      'bar-chart-2': '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
      'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',
      'palette': '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>',
      'git-compare': '<circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><path d="M11 18H8a2 2 0 0 1-2-2V9"></path>',
      'maximize-2': '<polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>'
    };
    return icons[iconName] || '<circle cx="12" cy="12" r="10"></circle>';
  };

  // Track recents in localStorage
  const trackRecent = (tool) => {
    try {
      let recents = JSON.parse(localStorage.getItem('tf_recent_tools') || '[]');
      recents = recents.filter(id => id !== tool.id);
      recents.unshift(tool.id);
      if (recents.length > 5) recents.pop();
      localStorage.setItem('tf_recent_tools', JSON.stringify(recents));
      renderRecents();
    } catch {}
  };

  const renderRecents = () => {
    if (!recentsContainer || !recentsChips) return;
    try {
      const recents = JSON.parse(localStorage.getItem('tf_recent_tools') || '[]');
      if (recents.length === 0) {
        recentsContainer.style.display = 'none';
        return;
      }
      recentsContainer.style.display = 'flex';
      const recentTools = recents.map(id => tools.find(t => t.id === id)).filter(Boolean);
      recentsChips.innerHTML = recentTools.map(t => `
        <a href="${t.url}" class="tf-recent-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${getToolIcon(t.icon)}
          </svg>
          <span>${t.name}</span>
        </a>
      `).join('');
    } catch {
      recentsContainer.style.display = 'none';
    }
  };

  const renderTools = () => {
    let filtered = tools;
    if (currentCategory !== 'all') {
      filtered = filtered.filter(t => t.category.toLowerCase().includes(currentCategory.toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) || 
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 48px 20px; text-align: center; background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
          <p style="font-size: 1.125rem; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">No tools found matching "${searchQuery}"</p>
          <p style="font-size: 0.875rem; color: var(--text-muted);">Try a different keyword or select "All Tools".</p>
        </div>
      `;
      return;
    }

    if (currentView === 'list') {
      grid.className = 'tf-tools-list';
      grid.innerHTML = filtered.map(t => `
        <a href="${t.url}" class="tf-tool-row" data-tool-id="${t.id}">
          <div class="tf-tool-row-left">
            <div class="tf-tool-row-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${getToolIcon(t.icon)}
              </svg>
            </div>
            <div class="tf-tool-row-info">
              <div class="tf-tool-row-title">${t.name}</div>
              <div class="tf-tool-row-desc">${t.description}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px; flex-shrink: 0;">
            <span style="font-size: 0.75rem; color: var(--text-faint); font-weight: 600; text-transform: uppercase;">${t.category}</span>
            <span style="color: var(--accent); font-weight: 600; font-size: 0.875rem;">Open →</span>
          </div>
        </a>
      `).join('');
    } else {
      grid.className = 'tf-tools-grid';
      grid.innerHTML = filtered.map(t => `
        <a href="${t.url}" class="tf-card tf-card-interactive" data-tool-id="${t.id}" style="display: flex; flex-direction: column; justify-content: space-between; text-decoration: none;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background: var(--accent-light); color: var(--accent); display: flex; align-items: center; justify-content: center;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  ${getToolIcon(t.icon)}
                </svg>
              </div>
              <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-faint); text-transform: uppercase;">${t.category}</span>
            </div>
            <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">${t.name}</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">${t.description}</p>
          </div>
          <div style="margin-top: 20px; font-size: 0.8125rem; font-weight: 600; color: var(--accent); display: flex; align-items: center; justify-content: space-between;">
            <span>Open Tool</span>
            <span style="transition: transform 150ms ease;">→</span>
          </div>
        </a>
      `).join('');
    }

    // Attach click listeners to track recents
    grid.querySelectorAll('[data-tool-id]').forEach(link => {
      link.addEventListener('click', () => {
        const id = link.getAttribute('data-tool-id');
        const matched = tools.find(t => t.id === id);
        if (matched) trackRecent(matched);
      });
    });
  };

  // View switchers
  if (viewGridBtn && viewListBtn) {
    viewGridBtn.addEventListener('click', () => {
      currentView = 'grid';
      localStorage.setItem('tf_view_mode', 'grid');
      viewGridBtn.classList.add('active');
      viewListBtn.classList.remove('active');
      renderTools();
    });

    viewListBtn.addEventListener('click', () => {
      currentView = 'list';
      localStorage.setItem('tf_view_mode', 'list');
      viewListBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
      renderTools();
    });

    if (currentView === 'list') {
      viewListBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
    } else {
      viewGridBtn.classList.add('active');
      viewListBtn.classList.remove('active');
    }
  }

  // Category filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      renderTools();
    });
  });

  // Inline Quick Search
  if (inlineSearchInput) {
    inlineSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTools();
    });
  }

  // Service Worker Registration
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Initial runs
  renderRecents();
  renderTools();
});
