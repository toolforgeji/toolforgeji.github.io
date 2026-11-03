/**
 * ToolForge GST & VAT Calculator
 */

(function () {
  'use strict';

  let isInclusive = false;

  const amountInput = document.getElementById('gst-amount');
  const customRateInput = document.getElementById('gst-custom-rate');
  const modeExclBtn = document.getElementById('gst-mode-excl');
  const modeInclBtn = document.getElementById('gst-mode-incl');
  const rateBtns = document.querySelectorAll('.gst-rate-btn');
  const copyBtn = document.getElementById('gst-copy-btn');

  // Outputs
  const netAmtEl = document.getElementById('gst-net-amt');
  const taxAmtEl = document.getElementById('gst-tax-amt');
  const totalAmtEl = document.getElementById('gst-total-amt');
  const rateLabel = document.getElementById('gst-rate-label');
  const cgstAmtEl = document.getElementById('gst-cgst-amt');
  const sgstAmtEl = document.getElementById('gst-sgst-amt');
  const igstAmtEl = document.getElementById('gst-igst-amt');
  const netPctEl = document.getElementById('gst-net-pct');
  const taxPctEl = document.getElementById('gst-tax-pct');
  const barNet = document.getElementById('gst-bar-net');
  const barTax = document.getElementById('gst-bar-tax');

  const formatCurrency = (num) => {
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculate = () => {
    const amount = parseFloat(amountInput.value) || 0;
    const rate = parseFloat(customRateInput.value) || 0;

    rateLabel.textContent = rate;

    let net = 0;
    let tax = 0;
    let total = 0;

    if (isInclusive) {
      total = amount;
      net = (amount * 100) / (100 + rate);
      tax = total - net;
    } else {
      net = amount;
      tax = (amount * rate) / 100;
      total = net + tax;
    }

    const halfTax = tax / 2;

    netAmtEl.textContent = formatCurrency(net);
    taxAmtEl.textContent = formatCurrency(tax);
    totalAmtEl.textContent = formatCurrency(total);
    cgstAmtEl.textContent = formatCurrency(halfTax);
    sgstAmtEl.textContent = formatCurrency(halfTax);
    igstAmtEl.textContent = formatCurrency(tax);

    const netPct = total > 0 ? (net / total) * 100 : 100;
    const taxPct = total > 0 ? (tax / total) * 100 : 0;

    netPctEl.textContent = `${netPct.toFixed(1)}%`;
    taxPctEl.textContent = `${taxPct.toFixed(1)}%`;
    barNet.style.width = `${netPct.toFixed(1)}%`;
    barTax.style.width = `${taxPct.toFixed(1)}%`;
  };

  modeExclBtn.addEventListener('click', () => {
    isInclusive = false;
    modeExclBtn.classList.add('active');
    modeInclBtn.classList.remove('active');
    calculate();
  });

  modeInclBtn.addEventListener('click', () => {
    isInclusive = true;
    modeInclBtn.classList.add('active');
    modeExclBtn.classList.remove('active');
    calculate();
  });

  rateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rateBtns.forEach(b => {
        b.classList.remove('tf-btn-primary');
        b.classList.add('tf-btn-secondary');
      });
      btn.classList.add('tf-btn-primary');
      btn.classList.remove('tf-btn-secondary');
      customRateInput.value = btn.getAttribute('data-rate');
      calculate();
    });
  });

  amountInput.addEventListener('input', calculate);
  customRateInput.addEventListener('input', () => {
    rateBtns.forEach(b => {
      b.classList.remove('tf-btn-primary');
      b.classList.add('tf-btn-secondary');
    });
    calculate();
  });

  copyBtn.addEventListener('click', () => {
    const summary = `GST Breakdown:\nNet: ${netAmtEl.textContent}\nTax (${customRateInput.value}%): ${taxAmtEl.textContent}\nTotal: ${totalAmtEl.textContent}\nCGST: ${cgstAmtEl.textContent} | SGST: ${sgstAmtEl.textContent}`;
    window.copyToClipboard(summary, 'Tax breakdown copied!');
  });

  // Init
  calculate();

})();
