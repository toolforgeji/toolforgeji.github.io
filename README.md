# ToolForge — Free In-Browser Privacy-First Utility Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Privacy: 100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20In--Browser-brightgreen.svg)](#privacy-guarantee)
[![Deploy to GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-black.svg)](#deploy-to-github-pages)

**ToolForge** is a collection of 28 free, fast, browser-based utility tools for developers, designers, students, and businesses. Built with vanilla HTML, modern CSS, and JavaScript.

**Every single tool runs 100% locally in your web browser.** Your files, images, PDFs, numbers, and personal texts never touch an external server or API.

---

## 🛠️ Complete Tool Catalog (28 Tools)

### 📄 PDF & Document Tools
- **PDF Compressor** (`/tools/pdf-compressor.html`): Re-encodes and scales PDF canvases client-side to minimize document file sizes.
- **PDF Merge & Split** (`/tools/pdf-merge-split.html`): Combine multiple PDFs into one unified document or extract specific page ranges using `pdf-lib`.
- **Image to PDF** (`/tools/image-to-pdf.html`): Convert JPG, PNG, and WebP images into formatted, printable PDF documents with orientation controls.
- **Client-Side OCR** (`/tools/ocr.html`): Extract text from images using in-browser Tesseract.js WebAssembly without sending documents to cloud providers.

### 🖼️ Image & Media Tools
- **Background Remover** (`/tools/background-remover.html`): Automatically remove backgrounds from portraits and product shots using smart client-side edge contrast detection.
- **Image Compressor** (`/tools/image-compressor.html`): Lossy or lossless compression with instant side-by-side visual quality and file size comparison.
- **HEIC to JPG Converter** (`/tools/heic-to-jpg.html`): Convert Apple iPhone HEIC/HEIF photos directly to standard high-res JPEG and PNG files using `heic2any`.
- **QR Code Generator** (`/tools/qr-generator.html`): Generate scannable QR codes for URLs, Wi-Fi passwords, contact cards, and text with custom colors, margins, and PNG/SVG download.

### 💻 Developer & Code Tools
- **Markdown Live Editor** (`/tools/markdown-previewer.html`): Real-time split-pane Markdown editor with synchronized live preview, GFM tables, task lists, and HTML export.
- **Color Converter & WCAG Studio** (`/tools/color-converter.html`): Convert HEX, RGB, HSL, CMYK, inspect WCAG 2.1 AA/AAA contrast ratios, and generate tint & shade palettes.
- **Text & Code Diff Checker** (`/tools/diff-checker.html`): Compare code and text files side-by-side with line additions, deletions, and synchronized line numbers.
- **SVG Cleaner & Optimizer** (`/tools/svg-optimizer.html`): Minify SVG vector assets, strip editor metadata and namespaces, and preview byte reduction live.
- **JSON Formatter & Validator** (`/tools/json-formatter.html`): Prettify, minify, validate, and inspect JSON with syntax highlighting and syntax error line pointers.
- **Regex Tester** (`/tools/regex-tester.html`): Test regular expressions with instant real-time match highlighting, capture group breakdown, and common cheat-sheet presets.
- **Base64 Encoder / Decoder** (`/tools/base64-encoder.html`): Encode and decode plain text, UTF-8 strings, and binary files to Base64 format with one click.
- **Cron Expression Builder** (`/tools/cron-builder.html`): Build, test, and humanize 5-field cron schedules with next 5 run-time projections.

### 💼 Financial & Business Calculators
- **Invoice Generator** (`/tools/invoice-generator.html`): Create professional client invoices with itemized line items, tax, discounts, and clean PDF/print styling.
- **GST / Sales Tax Calculator** (`/tools/gst-calculator.html`): Calculate inclusive vs exclusive goods and services tax with multi-tier rate support.
- **EMI / Loan Calculator** (`/tools/emi-calculator.html`): Loan amortization calculations with principal vs interest sliders, breakdown graphs, and monthly payment schedules.

### ✍️ Text & Content Tools
- **Word & Character Counter** (`/tools/word-counter.html`): Real-time word, character, sentence, paragraph, reading time, and speaking time analyzer.
- **Case Converter** (`/tools/case-converter.html`): Convert between camelCase, PascalCase, snake_case, kebab-case, Title Case, UPPERCASE, and lowercase.
- **Keyword Density Analyzer** (`/tools/keyword-density.html`): Analyze unigram and bigram frequency, stopword filtering, and SEO keyword density percentages.

### ⚙️ Everyday Utilities
- **Unit Converter** (`/tools/unit-converter.html`): Convert between metric and imperial units across length, mass, temperature, digital storage, volume, and speed.
- **Date & Age Calculator** (`/tools/date-calculator.html`): Calculate exact day differences, business days, age down to days/months, and date offsets.

### 🔍 SEO & Webmaster Tools
- **Meta Tag Generator** (`/tools/meta-generator.html`): Generate SEO title, description, Open Graph, and Twitter Card tags with live Google and social card previews.
- **Robots.txt & Sitemap Generator** (`/tools/robots-sitemap-generator.html`): Generate crawler directives, user-agent rules, and XML sitemaps.
- **Schema.org Generator** (`/tools/schema-generator.html`): Generate valid JSON-LD structured data for Organization, LocalBusiness, Article, FAQPage, Product, and Event.
- **UTM Campaign Builder** (`/tools/utm-builder.html`): Build Google Analytics UTM campaign tracking URLs with standard channel presets.

---

## 🔒 Privacy Guarantee

1. **Zero Uploads**: No files leave your device. All image canvas operations, PDF manipulation, and parsing happen inside your browser thread or Web Worker.
2. **Zero Trackers**: No intrusive surveillance ads or user profiling.
3. **Works Offline / PWA-Ready**: Cache assets and execute calculations even when disconnected from the internet.

---

## 🚀 Live Demo & Local Development

### Option A: Open directly in your browser
Because ToolForge is built using standard static files, you can simply serve the project folder using any local HTTP server:

```bash
# Using Python 3:
python3 -m http.server 3000

# Using Node npx:
npx serve .
```

Navigate to `http://localhost:3000` in your web browser.

### Option B: Using the Vite development server

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```

---

## 📦 How to Deploy to GitHub Pages

Deploying ToolForge to GitHub Pages takes less than 60 seconds with **zero build steps**:

1. **Push this repository** to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of ToolForge"
   git branch -M main
   git remote add origin https://github.com/<your-username>/toolforge.git
   git push -u origin main
   ```
2. In your GitHub repository, click on **Settings**.
3. Under the **Code and automation** section in the left sidebar, click on **Pages**.
4. Under **Build and deployment**:
   - **Source**: Select **Deploy from a branch**.
   - **Branch**: Select `main` (or `master`) and set folder to `/ (root)`.
5. Click **Save**.
6. Wait 1-2 minutes. GitHub will provide your live URL: `https://<your-username>.github.io/toolforge/`.

---

## ➕ How to Add a New Tool

ToolForge is designed to make adding new utilities seamless:

1. **Choose an ID and Category**: Pick a unique kebab-case ID (e.g. `hash-generator`) and category (`developer`, `pdf`, `image`, `calc`, `text`, `seo`, or `util`).
2. **Add tool metadata to `tools.json`**:
   ```json
   {
     "id": "hash-generator",
     "name": "Hash Generator",
     "category": "developer",
     "description": "Generate MD5, SHA-1, SHA-256, and SHA-512 cryptographic hashes client-side.",
     "url": "/tools/hash-generator.html",
     "icon": "ShieldCheck",
     "tags": ["hash", "sha256", "crypto", "security"],
     "featured": false
   }
   ```
3. **Create the HTML page** at `/tools/<id>.html`:
   - Duplicate any existing tool (e.g. `base64-encoder.html`).
   - Update `<title>`, canonical link, breadcrumbs, H1, and the tool input/output container.
   - Reference `/assets/js/tools/<id>.js`.
4. **Create the JavaScript logic** at `/assets/js/tools/<id>.js`:
   - Implement event listeners and computation.
   - Use `window.showToast(message, type)` for feedback and `window.copyToClipboard(text)` for outputs.
5. **Add the URL to `sitemap.xml`**:
   - Add `<url><loc>https://toolforgeji.github.io/tools/<id>.html</loc><priority>0.8</priority></url>`.
6. Done! The tool is immediately searchable across the entire site via the global command palette (⌘K) and home page category tabs.

---

## 🎨 Design System

- **Fonts**: Inter (`ui-sans-serif`) for typography, JetBrains Mono for code editors and monospace output. Loaded with `font-display: swap`.
- **Colors**: Electric Indigo accent (`#6366f1` / `#4f46e5`) with neutral slate grays.
- **Dark/Light Mode**: Full CSS variable system (`assets/css/design-system.css`) respecting `prefers-color-scheme` with persistence in `localStorage`.
- **Keyboard Shortcuts**: Press `Cmd+K`, `Ctrl+K`, or `/` anywhere to launch the command palette search.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use for personal and commercial projects.
