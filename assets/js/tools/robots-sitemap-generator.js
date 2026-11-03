/**
 * ToolForge Robots.txt & XML Sitemap Builder
 */

(function () {
  'use strict';

  // Tabs
  const tabRobots = document.getElementById('rs-tab-robots');
  const tabSitemap = document.getElementById('rs-tab-sitemap');
  const panelRobots = document.getElementById('rs-panel-robots');
  const panelSitemap = document.getElementById('rs-panel-sitemap');

  // Robots Elements
  const rbUserAgent = document.getElementById('rb-user-agent');
  const rbSitemapUrl = document.getElementById('rb-sitemap-url');
  const rbDisallow = document.getElementById('rb-disallow');
  const rbAllow = document.getElementById('rb-allow');
  const rbOutput = document.getElementById('rb-output');
  const rbCopyBtn = document.getElementById('rb-copy-btn');
  const rbDownloadBtn = document.getElementById('rb-download-btn');

  // Sitemap Elements
  const smBaseUrl = document.getElementById('sm-base-url');
  const smUrls = document.getElementById('sm-urls');
  const smChangefreq = document.getElementById('sm-changefreq');
  const smPriority = document.getElementById('sm-priority');
  const smOutput = document.getElementById('sm-output');
  const smCopyBtn = document.getElementById('sm-copy-btn');
  const smDownloadBtn = document.getElementById('sm-download-btn');

  // Switch tabs
  tabRobots.addEventListener('click', () => {
    tabRobots.classList.add('active');
    tabSitemap.classList.remove('active');
    panelRobots.style.display = 'block';
    panelSitemap.style.display = 'none';
  });

  tabSitemap.addEventListener('click', () => {
    tabSitemap.classList.add('active');
    tabRobots.classList.remove('active');
    panelSitemap.style.display = 'block';
    panelRobots.style.display = 'none';
    generateSitemap();
  });

  // Robots logic
  const generateRobots = () => {
    const ua = rbUserAgent.value;
    const sitemap = rbSitemapUrl.value.trim();
    const disallows = rbDisallow.value.split('\n').map(p => p.trim()).filter(Boolean);
    const allows = rbAllow.value.split('\n').map(p => p.trim()).filter(Boolean);

    let text = `User-agent: ${ua}\n`;

    allows.forEach(p => {
      text += `Allow: ${p}\n`;
    });

    disallows.forEach(p => {
      text += `Disallow: ${p}\n`;
    });

    if (sitemap) {
      text += `\nSitemap: ${sitemap}\n`;
    }

    rbOutput.value = text;
  };

  [rbUserAgent, rbSitemapUrl, rbDisallow, rbAllow].forEach(el => {
    el.addEventListener('input', generateRobots);
  });

  rbCopyBtn.addEventListener('click', () => {
    window.copyToClipboard(rbOutput.value, 'robots.txt copied to clipboard!');
  });

  rbDownloadBtn.addEventListener('click', () => {
    const blob = new Blob([rbOutput.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showToast('Downloaded robots.txt!', 'success');
  });

  // Sitemap logic
  const generateSitemap = () => {
    let domain = smBaseUrl.value.trim().replace(/\/+$/, '');
    if (!domain) domain = 'https://example.com';

    const paths = smUrls.value.split('\n').map(p => p.trim()).filter(Boolean);
    const freq = smChangefreq.value;
    const prio = smPriority.value;
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    paths.forEach(p => {
      let cleanPath = p;
      if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
      const fullUrl = domain + cleanPath;
      xml += `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${prio}</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    smOutput.value = xml;
  };

  [smBaseUrl, smUrls, smChangefreq, smPriority].forEach(el => {
    el.addEventListener('input', generateSitemap);
  });

  smCopyBtn.addEventListener('click', () => {
    window.copyToClipboard(smOutput.value, 'sitemap.xml copied to clipboard!');
  });

  smDownloadBtn.addEventListener('click', () => {
    const blob = new Blob([smOutput.value], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showToast('Downloaded sitemap.xml!', 'success');
  });

  // Init
  generateRobots();

})();
