/**
 * ToolForge QR Code Generator using qrcode.js
 */

(function () {
  'use strict';

  let currentType = 'url';

  const canvas = document.getElementById('qr-canvas');
  const typeBtns = document.querySelectorAll('.qr-type-btn');
  const colorDark = document.getElementById('qr-color-dark');
  const colorLight = document.getElementById('qr-color-light');
  const colorDarkHex = document.getElementById('qr-color-dark-hex');
  const colorLightHex = document.getElementById('qr-color-light-hex');
  const eccSelect = document.getElementById('qr-ecc');
  const sizeSelect = document.getElementById('qr-size');
  const dlPngBtn = document.getElementById('qr-dl-png');
  const copyBtn = document.getElementById('qr-copy-btn');

  // Input Fields
  const inputUrl = document.getElementById('qr-url-val');
  const inputText = document.getElementById('qr-text-val');
  const inputWifiSsid = document.getElementById('qr-wifi-ssid');
  const inputWifiPass = document.getElementById('qr-wifi-pass');
  const inputWifiType = document.getElementById('qr-wifi-type');
  const inputCardName = document.getElementById('qr-card-name');
  const inputCardPhone = document.getElementById('qr-card-phone');
  const inputCardEmail = document.getElementById('qr-card-email');
  const inputEmailAddr = document.getElementById('qr-email-addr');
  const inputEmailSubj = document.getElementById('qr-email-subj');

  // Switch type forms
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.getAttribute('data-type');

      document.querySelectorAll('.qr-form-section').forEach(sec => sec.style.display = 'none');
      const targetSec = document.getElementById(`qr-form-${currentType}`);
      if (targetSec) targetSec.style.display = 'block';

      renderQR();
    });
  });

  const getPayload = () => {
    switch (currentType) {
      case 'url':
        return inputUrl.value.trim() || 'https://toolforgeji.github.io';
      case 'text':
        return inputText.value.trim() || 'ToolForge Privacy First';
      case 'wifi': {
        const ssid = inputWifiSsid.value.trim();
        const pass = inputWifiPass.value.trim();
        const type = inputWifiType.value;
        return `WIFI:S:${ssid};T:${type};P:${pass};;`;
      }
      case 'vcard': {
        const name = inputCardName.value.trim();
        const phone = inputCardPhone.value.trim();
        const email = inputCardEmail.value.trim();
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
      }
      case 'email': {
        const addr = inputEmailAddr.value.trim();
        const subj = encodeURIComponent(inputEmailSubj.value.trim());
        return `mailto:${addr}?subject=${subj}`;
      }
      default:
        return 'https://toolforgeji.github.io';
    }
  };

  const renderQR = () => {
    if (typeof QRCode === 'undefined') return;

    const payload = getPayload();
    const dark = colorDark.value;
    const light = colorLight.value;
    const ecc = eccSelect.value;
    const size = parseInt(sizeSelect.value, 10) || 300;

    colorDarkHex.textContent = dark;
    colorLightHex.textContent = light;

    QRCode.toCanvas(canvas, payload, {
      width: size,
      margin: 2,
      color: {
        dark: dark,
        light: light
      },
      errorCorrectionLevel: ecc
    }, (err) => {
      if (err) {
        console.error(err);
      }
    });
  };

  // Listeners
  [colorDark, colorLight, eccSelect, sizeSelect].forEach(el => {
    el.addEventListener('input', renderQR);
    el.addEventListener('change', renderQR);
  });

  [inputUrl, inputText, inputWifiSsid, inputWifiPass, inputWifiType, inputCardName, inputCardPhone, inputCardEmail, inputEmailAddr, inputEmailSubj].forEach(el => {
    if (el) el.addEventListener('input', renderQR);
  });

  dlPngBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `qrcode_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    window.showToast('Downloaded QR Code PNG!', 'success');
  });

  copyBtn.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    window.copyToClipboard(dataUrl, 'QR Code Data URL copied!');
  });

  // Init
  setTimeout(renderQR, 100);

})();
