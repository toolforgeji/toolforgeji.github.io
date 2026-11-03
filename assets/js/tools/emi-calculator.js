/**
 * ToolForge Loan EMI Calculator & Amortization Engine
 */

(function () {
  'use strict';

  const amountInput = document.getElementById('emi-amount');
  const amountSlider = document.getElementById('emi-amount-slider');
  const rateInput = document.getElementById('emi-rate');
  const rateSlider = document.getElementById('emi-rate-slider');
  const tenureInput = document.getElementById('emi-tenure');
  const tenureSlider = document.getElementById('emi-tenure-slider');

  // Outputs
  const monthlyAmtEl = document.getElementById('emi-monthly-amt');
  const dispPrincipal = document.getElementById('emi-disp-principal');
  const dispInterest = document.getElementById('emi-disp-interest');
  const dispTotal = document.getElementById('emi-disp-total');
  const pctPrincipal = document.getElementById('emi-pct-principal');
  const pctInterest = document.getElementById('emi-pct-interest');
  const barPrincipal = document.getElementById('emi-bar-principal');
  const barInterest = document.getElementById('emi-bar-interest');
  const scheduleTbody = document.getElementById('emi-schedule-tbody');

  const formatCurrency = (num) => {
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculate = () => {
    const P = parseFloat(amountInput.value) || 0;
    const annualRate = parseFloat(rateInput.value) || 0;
    const years = parseFloat(tenureInput.value) || 0;
    const N = years * 12;

    if (P <= 0 || N <= 0) return;

    let emi = 0;
    let totalPayment = 0;
    let totalInterest = 0;

    if (annualRate <= 0) {
      emi = P / N;
      totalPayment = P;
      totalInterest = 0;
    } else {
      const r = annualRate / (12 * 100);
      const factor = Math.pow(1 + r, N);
      emi = (P * r * factor) / (factor - 1);
      totalPayment = emi * N;
      totalInterest = totalPayment - P;
    }

    monthlyAmtEl.textContent = formatCurrency(emi);
    dispPrincipal.textContent = formatCurrency(P);
    dispInterest.textContent = formatCurrency(totalInterest);
    dispTotal.textContent = formatCurrency(totalPayment);

    const princPct = totalPayment > 0 ? (P / totalPayment) * 100 : 100;
    const intPct = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

    pctPrincipal.textContent = `${princPct.toFixed(1)}%`;
    pctInterest.textContent = `${intPct.toFixed(1)}%`;
    barPrincipal.style.width = `${princPct.toFixed(1)}%`;
    barInterest.style.width = `${intPct.toFixed(1)}%`;

    // Generate first 12 months amortization schedule
    const r = annualRate / (12 * 100);
    let balance = P;
    const rows = [];
    const previewMonths = Math.min(12, N);

    for (let m = 1; m <= previewMonths; m++) {
      const interestPart = annualRate > 0 ? balance * r : 0;
      const principalPart = emi - interestPart;
      balance = Math.max(0, balance - principalPart);

      rows.push(`
        <tr style="border-bottom: 1px solid var(--border-subtle);">
          <td style="padding: 8px; color: var(--accent); font-weight: 700;">Month ${m}</td>
          <td style="padding: 8px; text-align: right; color: var(--text-main);">${formatCurrency(principalPart)}</td>
          <td style="padding: 8px; text-align: right; color: var(--warning);">${formatCurrency(interestPart)}</td>
          <td style="padding: 8px; text-align: right; font-weight: 600; color: var(--text-main);">${formatCurrency(balance)}</td>
        </tr>
      `);
    }

    scheduleTbody.innerHTML = rows.join('');
  };

  // Sync sliders and number inputs
  const bindPair = (numberInput, slider) => {
    numberInput.addEventListener('input', () => {
      slider.value = numberInput.value;
      calculate();
    });
    slider.addEventListener('input', () => {
      numberInput.value = slider.value;
      calculate();
    });
  };

  bindPair(amountInput, amountSlider);
  bindPair(rateInput, rateSlider);
  bindPair(tenureInput, tenureSlider);

  // Init
  calculate();

})();
