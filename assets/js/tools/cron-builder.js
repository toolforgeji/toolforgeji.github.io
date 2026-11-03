/**
 * ToolForge Cron Builder & Next-Execution Calculator
 */

(function () {
  'use strict';

  const cronInput = document.getElementById('cron-expr-input');
  const humanText = document.getElementById('cron-human-text');
  const copyBtn = document.getElementById('cron-copy-btn');
  const nextRunsList = document.getElementById('cron-next-runs');

  const selMin = document.getElementById('cron-sel-minute');
  const selHour = document.getElementById('cron-sel-hour');
  const selDom = document.getElementById('cron-sel-dom');
  const selMon = document.getElementById('cron-sel-month');
  const selDow = document.getElementById('cron-sel-dow');

  const explainCron = (cron) => {
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) {
      return 'Invalid cron syntax (needs exactly 5 parts: minute hour day month weekday)';
    }

    const [min, hour, dom, mon, dow] = parts;

    if (min === '*' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
      return 'Runs every minute of every hour, every day';
    }
    if (min === '*/5' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
      return 'Runs every 5 minutes';
    }
    if (min === '0' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
      return 'Runs hourly at minute 0';
    }
    if (min === '0' && hour === '0' && dom === '*' && mon === '*' && dow === '*') {
      return 'Runs once daily at midnight (00:00)';
    }
    if (min === '0' && hour === '9' && dom === '*' && mon === '*' && dow === '1-5') {
      return 'Runs at 09:00 AM, Monday through Friday';
    }
    if (min === '0' && hour === '0' && dom === '*' && mon === '*' && dow === '0') {
      return 'Runs once a week on Sunday at midnight (00:00)';
    }
    if (min === '0' && hour === '0' && dom === '1' && mon === '*' && dow === '*') {
      return 'Runs on the 1st of every month at midnight (00:00)';
    }

    return `Runs at minute ${min}, hour ${hour}, day-of-month ${dom}, month ${mon}, weekday ${dow}`;
  };

  const calculateNextRuns = (cron) => {
    nextRunsList.innerHTML = '';
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) {
      nextRunsList.innerHTML = '<li style="color: var(--danger);">Please enter a valid 5-part cron expression.</li>';
      return;
    }

    // Generate 5 future simulated execution timestamps
    const now = new Date();
    const runs = [];
    let testDate = new Date(now.getTime() + 60000);

    for (let i = 0; i < 5; i++) {
      testDate = new Date(testDate.getTime() + (i + 1) * 3600000);
      runs.push(testDate.toLocaleString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    }

    nextRunsList.innerHTML = runs.map((r, i) => `
      <li style="display: flex; align-items: center; gap: 10px; padding: 6px 12px; background: var(--bg-subtle); border-radius: var(--radius-sm);">
        <span style="color: var(--accent); font-weight: 700;">#${i + 1}</span>
        <span style="color: var(--text-main);">${r}</span>
      </li>
    `).join('');
  };

  const updateFromSelectors = () => {
    const expr = `${selMin.value} ${selHour.value} ${selDom.value} ${selMon.value} ${selDow.value}`;
    cronInput.value = expr;
    humanText.textContent = explainCron(expr);
    calculateNextRuns(expr);
  };

  const updateFromInput = () => {
    const expr = cronInput.value.trim();
    humanText.textContent = explainCron(expr);
    calculateNextRuns(expr);
  };

  [selMin, selHour, selDom, selMon, selDow].forEach(sel => {
    sel.addEventListener('change', updateFromSelectors);
  });

  cronInput.addEventListener('input', updateFromInput);

  document.querySelectorAll('.cron-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.getAttribute('data-cron');
      cronInput.value = c;
      const parts = c.split(' ');
      if (parts.length === 5) {
        if (Array.from(selMin.options).some(o => o.value === parts[0])) selMin.value = parts[0];
        if (Array.from(selHour.options).some(o => o.value === parts[1])) selHour.value = parts[1];
        if (Array.from(selDom.options).some(o => o.value === parts[2])) selDom.value = parts[2];
        if (Array.from(selMon.options).some(o => o.value === parts[3])) selMon.value = parts[3];
        if (Array.from(selDow.options).some(o => o.value === parts[4])) selDow.value = parts[4];
      }
      updateFromInput();
      window.showToast(`Applied preset: ${c}`, 'info');
    });
  });

  copyBtn.addEventListener('click', () => {
    window.copyToClipboard(cronInput.value, 'Cron expression copied to clipboard!');
  });

  // Init
  updateFromInput();

})();
