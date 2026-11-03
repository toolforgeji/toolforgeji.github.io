/**
 * ToolForge Meta Tag & OpenGraph Generator
 */

(function () {
  'use strict';

  const inputTitle = document.getElementById('meta-title');
  const inputDesc = document.getElementById('meta-desc');
  const inputUrl = document.getElementById('meta-url');
  const inputImg = document.getElementById('meta-img');
  const inputSiteName = document.getElementById('meta-site-name');
  const inputTwitter = document.getElementById('meta-twitter-handle');

  const titleCount = document.getElementById('meta-title-count');
  const descCount = document.getElementById('meta-desc-count');

  // Previews
  const prevSearchUrl = document.getElementById('prev-search-url');
  const prevSearchTitle = document.getElementById('prev-search-title');
  const prevSearchDesc = document.getElementById('prev-search-desc');

  const prevSocialImg = document.getElementById('prev-social-img');
  const prevSocialDomain = document.getElementById('prev-social-domain');
  const prevSocialTitle = document.getElementById('prev-social-title');
  const prevSocialDesc = document.getElementById('prev-social-desc');

  const codeOutput = document.getElementById('meta-code-output');
  const copyBtn = document.getElementById('meta-copy-btn');

  const update = () => {
    const title = inputTitle.value.trim() || 'My Website Title';
    const desc = inputDesc.value.trim() || 'A brief summary of my page content.';
    const url = inputUrl.value.trim() || 'https://example.com';
    const img = inputImg.value.trim() || 'https://example.com/og-image.jpg';
    const siteName = inputSiteName.value.trim() || 'My Website';
    const twitter = inputTwitter.value.trim() || '@handle';

    titleCount.textContent = `${title.length} / 60 chars`;
    descCount.textContent = `${desc.length} / 160 chars`;

    // Extract domain
    let domain = 'example.com';
    try {
      domain = new URL(url).hostname;
    } catch {
      domain = url;
    }

    // Google Preview
    prevSearchUrl.textContent = url;
    prevSearchTitle.textContent = title;
    prevSearchDesc.textContent = desc;

    // Social Preview
    prevSocialDomain.textContent = domain.toUpperCase();
    prevSocialTitle.textContent = title;
    prevSocialDesc.textContent = desc;
    prevSocialImg.src = img;

    // HTML Code tags
    const tags = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${siteName}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${img}">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${url}">
<meta name="twitter:site" content="${twitter}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${img}">`;

    codeOutput.value = tags;
  };

  [inputTitle, inputDesc, inputUrl, inputImg, inputSiteName, inputTwitter].forEach(el => {
    el.addEventListener('input', update);
  });

  copyBtn.addEventListener('click', () => {
    window.copyToClipboard(codeOutput.value, 'Meta tags copied to clipboard!');
  });

  // Init
  update();

})();
