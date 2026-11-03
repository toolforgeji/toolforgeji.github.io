/**
 * ToolForge Invoice Generator - Live Paper Preview & Print Export
 */

(function () {
  'use strict';

  let items = [
    { desc: 'Web Application Design & Architecture', qty: 1, rate: 2400 },
    { desc: 'Client-side Performance Optimization', qty: 10, rate: 120 }
  ];

  // DOM Form elements
  const invNumber = document.getElementById('inv-number');
  const invCurrency = document.getElementById('inv-currency');
  const invDate = document.getElementById('inv-date');
  const invDueDate = document.getElementById('inv-due-date');
  const invFrom = document.getElementById('inv-from');
  const invTo = document.getElementById('inv-to');
  const invTaxRate = document.getElementById('inv-tax-rate');
  const invDiscountRate = document.getElementById('inv-discount-rate');
  const invNotes = document.getElementById('inv-notes');
  const itemsContainer = document.getElementById('inv-items-form-container');
  const addItemBtn = document.getElementById('inv-add-item-btn');
  const printBtn = document.getElementById('inv-print-btn');

  // Preview elements
  const prevBizName = document.getElementById('prev-biz-name');
  const prevBizDetails = document.getElementById('prev-biz-details');
  const prevInvNum = document.getElementById('prev-inv-num');
  const prevClientDetails = document.getElementById('prev-client-details');
  const prevDate = document.getElementById('prev-date');
  const prevDueDate = document.getElementById('prev-due-date');
  const prevItemsTbody = document.getElementById('prev-items-tbody');
  const prevSubtotal = document.getElementById('prev-subtotal');
  const prevTaxPct = document.getElementById('prev-tax-pct');
  const prevTaxAmt = document.getElementById('prev-tax-amt');
  const prevDiscountRow = document.getElementById('prev-discount-row');
  const prevDiscountAmt = document.getElementById('prev-discount-amt');
  const prevGrandTotal = document.getElementById('prev-grand-total');
  const prevNotes = document.getElementById('prev-notes');

  // Set default dates
  const today = new Date();
  const due = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  invDate.value = today.toISOString().split('T')[0];
  invDueDate.value = due.toISOString().split('T')[0];

  const escapeHtml = (str) => {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  const renderFormItems = () => {
    itemsContainer.innerHTML = items.map((item, idx) => `
      <div style="display: flex; gap: 8px; align-items: center;">
        <input type="text" class="tf-input item-desc" data-idx="${idx}" placeholder="Item description..." value="${escapeHtml(item.desc)}" style="flex: 2; padding: 6px 10px; font-size: 0.8125rem;" />
        <input type="number" class="tf-input item-qty" data-idx="${idx}" min="1" value="${item.qty}" style="width: 60px; padding: 6px 8px; font-size: 0.8125rem; text-align: center;" />
        <input type="number" class="tf-input item-rate" data-idx="${idx}" min="0" step="0.01" value="${item.rate}" style="width: 85px; padding: 6px 8px; font-size: 0.8125rem; text-align: right;" />
        <button class="tf-btn-icon item-remove" data-idx="${idx}" style="padding: 6px; color: var(--danger);" title="Remove">✕</button>
      </div>
    `).join('');

    itemsContainer.querySelectorAll('.item-desc').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = parseInt(e.target.getAttribute('data-idx'), 10);
        items[i].desc = e.target.value;
        updatePreview();
      });
    });

    itemsContainer.querySelectorAll('.item-qty').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = parseInt(e.target.getAttribute('data-idx'), 10);
        items[i].qty = parseFloat(e.target.value) || 0;
        updatePreview();
      });
    });

    itemsContainer.querySelectorAll('.item-rate').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = parseInt(e.target.getAttribute('data-idx'), 10);
        items[i].rate = parseFloat(e.target.value) || 0;
        updatePreview();
      });
    });

    itemsContainer.querySelectorAll('.item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(btn.getAttribute('data-idx'), 10);
        items.splice(i, 1);
        renderFormItems();
        updatePreview();
      });
    });
  };

  const updatePreview = () => {
    const cur = invCurrency.value;
    const lines = invFrom.value.split('\n');
    prevBizName.textContent = lines[0] || 'My Business';
    prevBizDetails.textContent = lines.slice(1).join('\n') || '';

    prevInvNum.textContent = invNumber.value || 'INV-001';
    prevClientDetails.textContent = invTo.value || '';
    prevDate.textContent = invDate.value || '';
    prevDueDate.textContent = invDueDate.value || '';

    let subtotal = 0;
    prevItemsTbody.innerHTML = items.map(it => {
      const rowAmt = it.qty * it.rate;
      subtotal += rowAmt;
      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 4px; color: #0f172a; font-weight: 500;">${escapeHtml(it.desc)}</td>
          <td style="padding: 8px 4px; text-align: center; color: #64748b;">${it.qty}</td>
          <td style="padding: 8px 4px; text-align: right; color: #64748b;">${cur}${it.rate.toFixed(2)}</td>
          <td style="padding: 8px 4px; text-align: right; color: #0f172a; font-weight: 600;">${cur}${rowAmt.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const taxPct = parseFloat(invTaxRate.value) || 0;
    const discountPct = parseFloat(invDiscountRate.value) || 0;

    const discountAmt = (subtotal * discountPct) / 100;
    const taxableSubtotal = Math.max(0, subtotal - discountAmt);
    const taxAmt = (taxableSubtotal * taxPct) / 100;
    const grandTotal = taxableSubtotal + taxAmt;

    prevSubtotal.textContent = `${cur}${subtotal.toFixed(2)}`;
    prevTaxPct.textContent = taxPct;
    prevTaxAmt.textContent = `${cur}${taxAmt.toFixed(2)}`;

    if (discountPct > 0) {
      prevDiscountRow.style.display = 'flex';
      prevDiscountAmt.textContent = `-${cur}${discountAmt.toFixed(2)}`;
    } else {
      prevDiscountRow.style.display = 'none';
    }

    prevGrandTotal.textContent = `${cur}${grandTotal.toFixed(2)}`;
    prevNotes.textContent = invNotes.value || '';
  };

  addItemBtn.addEventListener('click', () => {
    items.push({ desc: 'New Deliverable / Service', qty: 1, rate: 100 });
    renderFormItems();
    updatePreview();
  });

  [invNumber, invCurrency, invDate, invDueDate, invFrom, invTo, invTaxRate, invDiscountRate, invNotes].forEach(el => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Init
  renderFormItems();
  updatePreview();

})();
