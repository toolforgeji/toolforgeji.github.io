/**
 * ToolForge Schema.org JSON-LD Generator
 */

(function () {
  'use strict';

  let currentType = 'Organization';

  const typeBtns = document.querySelectorAll('.sc-type-btn');
  const codeOutput = document.getElementById('sc-output');
  const copyBtn = document.getElementById('sc-copy-btn');

  // Form sections
  const secOrg = document.getElementById('sc-form-Organization');
  const secArt = document.getElementById('sc-form-Article');
  const secProd = document.getElementById('sc-form-Product');
  const secBiz = document.getElementById('sc-form-LocalBusiness');
  const secFaq = document.getElementById('sc-form-FAQPage');

  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.getAttribute('data-type');

      document.querySelectorAll('.sc-form-sec').forEach(s => s.style.display = 'none');
      const targetSec = document.getElementById(`sc-form-${currentType}`);
      if (targetSec) targetSec.style.display = 'block';

      generateSchema();
    });
  });

  const generateSchema = () => {
    let schemaObj = {};

    if (currentType === 'Organization') {
      const name = document.getElementById('org-name').value.trim();
      const url = document.getElementById('org-url').value.trim();
      const logo = document.getElementById('org-logo').value.trim();
      const sameAs = document.getElementById('org-sameas').value.split(',').map(s => s.trim()).filter(Boolean);

      schemaObj = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": name,
        "url": url,
        "logo": logo,
        "sameAs": sameAs
      };
    } else if (currentType === 'Article') {
      const headline = document.getElementById('art-headline').value.trim();
      const author = document.getElementById('art-author').value.trim();
      const img = document.getElementById('art-img').value.trim();
      const date = document.getElementById('art-date').value;

      schemaObj = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": headline,
        "image": img,
        "author": {
          "@type": "Person",
          "name": author
        },
        "datePublished": date
      };
    } else if (currentType === 'Product') {
      const name = document.getElementById('prod-name').value.trim();
      const desc = document.getElementById('prod-desc').value.trim();
      const price = document.getElementById('prod-price').value.trim();
      const cur = document.getElementById('prod-currency').value;

      schemaObj = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": name,
        "description": desc,
        "offers": {
          "@type": "Offer",
          "price": price,
          "priceCurrency": cur,
          "availability": "https://schema.org/InStock"
        }
      };
    } else if (currentType === 'LocalBusiness') {
      const name = document.getElementById('biz-name').value.trim();
      const phone = document.getElementById('biz-phone').value.trim();
      const street = document.getElementById('biz-street').value.trim();
      const city = document.getElementById('biz-city').value.trim();
      const postal = document.getElementById('biz-postal').value.trim();

      schemaObj = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": name,
        "telephone": phone,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": street,
          "addressLocality": city,
          "postalCode": postal
        }
      };
    } else if (currentType === 'FAQPage') {
      const q1 = document.getElementById('faq-q1').value.trim();
      const a1 = document.getElementById('faq-a1').value.trim();
      const q2 = document.getElementById('faq-q2').value.trim();
      const a2 = document.getElementById('faq-a2').value.trim();

      schemaObj = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": q1,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": a1
            }
          },
          {
            "@type": "Question",
            "name": q2,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": a2
            }
          }
        ]
      };
    }

    const jsonString = JSON.stringify(schemaObj, null, 2);
    const scriptBlock = `<script type="application/ld+json">\n${jsonString}\n<\/script>`;
    codeOutput.value = scriptBlock;
  };

  document.querySelectorAll('.sc-form-sec input, .sc-form-sec textarea, .sc-form-sec select').forEach(el => {
    el.addEventListener('input', generateSchema);
  });

  copyBtn.addEventListener('click', () => {
    window.copyToClipboard(codeOutput.value, 'JSON-LD snippet copied!');
  });

  // Init
  generateSchema();

})();
