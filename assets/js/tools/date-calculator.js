/**
 * ToolForge Date & Time Calculator (Differences, Duration Math & Countdown)
 */

(function () {
  'use strict';

  // Tabs
  const tabDiff = document.getElementById('dc-tab-diff');
  const tabAdd = document.getElementById('dc-tab-add');
  const tabCount = document.getElementById('dc-tab-count');
  const panelDiff = document.getElementById('dc-panel-diff');
  const panelAdd = document.getElementById('dc-panel-add');
  const panelCount = document.getElementById('dc-panel-count');

  // Diff Elements
  const diffStart = document.getElementById('dc-diff-start');
  const diffEnd = document.getElementById('dc-diff-end');
  const diffIncludeEnd = document.getElementById('dc-diff-include-end');
  const diffTotalDays = document.getElementById('dc-diff-total-days');
  const diffBizDays = document.getElementById('dc-diff-biz-days');
  const diffWeeks = document.getElementById('dc-diff-weeks');
  const diffHours = document.getElementById('dc-diff-hours');

  // Add Elements
  const addStart = document.getElementById('dc-add-start');
  const addOp = document.getElementById('dc-add-operation');
  const addAmount = document.getElementById('dc-add-amount');
  const addUnit = document.getElementById('dc-add-unit');
  const addResultDate = document.getElementById('dc-add-result-date');
  const addResultDay = document.getElementById('dc-add-result-day');

  // Countdown Elements
  const countTarget = document.getElementById('dc-count-target');
  const countDays = document.getElementById('dc-count-days');
  const countHours = document.getElementById('dc-count-hours');
  const countMins = document.getElementById('dc-count-mins');
  const countSecs = document.getElementById('dc-count-secs');
  const countStatus = document.getElementById('dc-count-status');

  // Set default initial dates
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextMonthStr = nextMonth.toISOString().split('T')[0];

  diffStart.value = todayStr;
  diffEnd.value = nextMonthStr;
  addStart.value = todayStr;

  // Next New Year for default countdown
  const nextYear = today.getFullYear() + 1;
  countTarget.value = `${nextYear}-01-01T00:00`;

  // Tab switching
  tabDiff.addEventListener('click', () => {
    tabDiff.classList.add('active');
    tabAdd.classList.remove('active');
    tabCount.classList.remove('active');
    panelDiff.style.display = 'block';
    panelAdd.style.display = 'none';
    panelCount.style.display = 'none';
  });

  tabAdd.addEventListener('click', () => {
    tabAdd.classList.add('active');
    tabDiff.classList.remove('active');
    tabCount.classList.remove('active');
    panelAdd.style.display = 'block';
    panelDiff.style.display = 'none';
    panelCount.style.display = 'none';
    calcAdd();
  });

  tabCount.addEventListener('click', () => {
    tabCount.classList.add('active');
    tabDiff.classList.remove('active');
    tabAdd.classList.remove('active');
    panelCount.style.display = 'block';
    panelDiff.style.display = 'none';
    panelAdd.style.display = 'none';
  });

  // Calculate Difference
  const calcDiff = () => {
    if (!diffStart.value || !diffEnd.value) return;

    const d1 = new Date(diffStart.value + 'T00:00:00');
    const d2 = new Date(diffEnd.value + 'T00:00:00');

    let diffMs = d2.getTime() - d1.getTime();
    const isNegative = diffMs < 0;
    diffMs = Math.abs(diffMs);

    let totalDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
    if (diffIncludeEnd.checked) totalDays += 1;

    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;
    const hours = totalDays * 24;

    // Calculate business days
    let bizDays = 0;
    const cur = new Date(Math.min(d1.getTime(), d2.getTime()));
    const end = new Date(Math.max(d1.getTime(), d2.getTime()));

    while (cur < end || (diffIncludeEnd.checked && cur.getTime() === end.getTime())) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        bizDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    diffTotalDays.textContent = `${isNegative ? '-' : ''}${totalDays} Days`;
    diffBizDays.textContent = `${bizDays} days`;
    diffWeeks.textContent = `${weeks}w ${remDays}d`;
    diffHours.textContent = `${hours.toLocaleString()} hrs`;
  };

  [diffStart, diffEnd, diffIncludeEnd].forEach(el => {
    el.addEventListener('change', calcDiff);
    el.addEventListener('input', calcDiff);
  });

  // Calculate Add/Subtract
  const calcAdd = () => {
    if (!addStart.value) return;

    const d = new Date(addStart.value + 'T00:00:00');
    const op = addOp.value;
    const amount = (parseInt(addAmount.value, 10) || 0) * (op === 'sub' ? -1 : 1);
    const unit = addUnit.value;

    if (unit === 'days') {
      d.setDate(d.getDate() + amount);
    } else if (unit === 'weeks') {
      d.setDate(d.getDate() + amount * 7);
    } else if (unit === 'months') {
      d.setMonth(d.getMonth() + amount);
    } else if (unit === 'years') {
      d.setFullYear(d.getFullYear() + amount);
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    addResultDate.textContent = d.toISOString().split('T')[0];
    addResultDay.textContent = d.toLocaleDateString('en-US', options);
  };

  [addStart, addOp, addAmount, addUnit].forEach(el => {
    el.addEventListener('change', calcAdd);
    el.addEventListener('input', calcAdd);
  });

  // Countdown timer loop
  let countdownTimer = null;
  const updateCountdown = () => {
    if (!countTarget.value) return;

    const target = new Date(countTarget.value).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      countDays.textContent = '0';
      countHours.textContent = '0';
      countMins.textContent = '0';
      countSecs.textContent = '0';
      countStatus.textContent = 'Target milestone reached!';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    countDays.textContent = days;
    countHours.textContent = hours;
    countMins.textContent = mins;
    countSecs.textContent = secs;
    countStatus.textContent = 'Counting down in real-time...';
  };

  countTarget.addEventListener('input', updateCountdown);
  countdownTimer = setInterval(updateCountdown, 1000);

  // Init
  calcDiff();
  updateCountdown();

})();
