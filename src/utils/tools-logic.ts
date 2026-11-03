/**
 * ToolForge Core Business Logic & Algorithms
 * Pure functions for deterministic calculation, formatting, and unit testing.
 */

export interface EmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: Array<{
    month: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }>;
}

export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): EmiResult {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyEmi: 0, totalInterest: 0, totalPayment: 0, schedule: [] };
  }

  if (annualRate <= 0) {
    const monthlyEmi = principal / tenureMonths;
    const schedule = [];
    let balance = principal;
    for (let m = 1; m <= tenureMonths; m++) {
      balance = Math.max(0, balance - monthlyEmi);
      schedule.push({
        month: m,
        principalPaid: monthlyEmi,
        interestPaid: 0,
        remainingBalance: balance
      });
    }
    return {
      monthlyEmi: Math.round(monthlyEmi * 100) / 100,
      totalInterest: 0,
      totalPayment: principal,
      schedule
    };
  }

  const monthlyRate = annualRate / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
  const totalPayment = monthlyEmi * tenureMonths;
  const totalInterest = totalPayment - principal;

  const schedule = [];
  let balance = principal;
  for (let m = 1; m <= tenureMonths; m++) {
    const interest = balance * monthlyRate;
    const principalPaid = monthlyEmi - interest;
    balance = Math.max(0, balance - principalPaid);
    schedule.push({
      month: m,
      principalPaid: Math.round(principalPaid * 100) / 100,
      interestPaid: Math.round(interest * 100) / 100,
      remainingBalance: Math.round(balance * 100) / 100
    });
  }

  return {
    monthlyEmi: Math.round(monthlyEmi * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    schedule
  };
}

export interface GstResult {
  netAmount: number;
  gstAmount: number;
  totalAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export function calculateGST(amount: number, rate: number, isInclusive: boolean): GstResult {
  if (amount <= 0 || rate < 0) {
    return { netAmount: 0, gstAmount: 0, totalAmount: 0, cgst: 0, sgst: 0, igst: 0 };
  }

  let netAmount = 0;
  let gstAmount = 0;
  let totalAmount = 0;

  if (isInclusive) {
    totalAmount = amount;
    netAmount = (amount * 100) / (100 + rate);
    gstAmount = totalAmount - netAmount;
  } else {
    netAmount = amount;
    gstAmount = (amount * rate) / 100;
    totalAmount = netAmount + gstAmount;
  }

  const halfGst = gstAmount / 2;

  return {
    netAmount: Math.round(netAmount * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    cgst: Math.round(halfGst * 100) / 100,
    sgst: Math.round(halfGst * 100) / 100,
    igst: Math.round(gstAmount * 100) / 100
  };
}

export interface TextAnalysis {
  words: number;
  charsWithSpaces: number;
  charsWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  fleschReadingEase: number;
  topWords: Array<{ word: string; count: number; percentage: number }>;
}

export function analyzeText(text: string): TextAnalysis {
  if (!text || text.trim().length === 0) {
    return {
      words: 0,
      charsWithSpaces: 0,
      charsWithoutSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
      fleschReadingEase: 100,
      topWords: []
    };
  }

  const charsWithSpaces = text.length;
  const charsWithoutSpaces = text.replace(/\s+/g, '').length;
  
  const wordsArray = text.trim().match(/\b[a-zA-Z0-9'-]+\b/g) || [];
  const words = wordsArray.length;

  const sentences = (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (words > 0 ? 1 : 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (words > 0 ? 1 : 0);

  const readingTimeMinutes = Math.ceil(words / 200 * 10) / 10;
  const speakingTimeMinutes = Math.ceil(words / 130 * 10) / 10;

  // Syllables estimation for Flesch Reading Ease
  let syllables = 0;
  for (const rawWord of wordsArray) {
    const word = rawWord.toLowerCase();
    if (word.length <= 3) {
      syllables += 1;
      continue;
    }
    const cleanWord = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
    const matches = cleanWord.match(/[aeiouy]{1,2}/g);
    syllables += matches ? matches.length : 1;
  }

  let flesch = 100;
  if (words > 0 && sentences > 0) {
    flesch = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    flesch = Math.max(0, Math.min(100, Math.round(flesch * 10) / 10));
  }

  // Word frequency
  const stopWords = new Set(['the','and','to','of','a','in','is','it','that','you','for','on','with','as','this','by','at','be','are','from','or','an','was']);
  const freqMap: Record<string, number> = {};
  for (const rawWord of wordsArray) {
    const w = rawWord.toLowerCase();
    if (!stopWords.has(w) && w.length > 2) {
      freqMap[w] = (freqMap[w] || 0) + 1;
    }
  }

  const topWords = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({
      word,
      count,
      percentage: Math.round((count / Math.max(1, words)) * 1000) / 10
    }));

  return {
    words,
    charsWithSpaces,
    charsWithoutSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
    speakingTimeMinutes,
    fleschReadingEase: flesch,
    topWords
  };
}

export function convertCase(text: string, targetCase: string): string {
  if (!text) return '';

  const words = text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/);

  switch (targetCase) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    case 'sentence':
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    case 'camel':
      return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'pascal':
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'snake':
      return words.map((w) => w.toLowerCase()).join('_');
    case 'kebab':
      return words.map((w) => w.toLowerCase()).join('-');
    case 'constant':
      return words.map((w) => w.toUpperCase()).join('_');
    case 'slug':
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    case 'alternating':
      return text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
    default:
      return text;
  }
}

export function convertUnits(val: number, from: string, to: string, category: string): number {
  if (isNaN(val)) return 0;
  if (from === to) return val;

  // Temperature
  if (category === 'temperature') {
    let kelvin = 0;
    if (from === 'celsius') kelvin = val + 273.15;
    else if (from === 'fahrenheit') kelvin = (val - 32) * (5 / 9) + 273.15;
    else kelvin = val; // kelvin

    if (to === 'celsius') return Math.round((kelvin - 273.15) * 1000) / 1000;
    if (to === 'fahrenheit') return Math.round(((kelvin - 273.15) * 9 / 5 + 32) * 1000) / 1000;
    return Math.round(kelvin * 1000) / 1000;
  }

  // Length (base: meter)
  const lengthRatios: Record<string, number> = {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    mile: 1609.344,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254
  };

  // Mass (base: kilogram)
  const massRatios: Record<string, number> = {
    kilogram: 1,
    gram: 0.001,
    milligram: 0.000001,
    pound: 0.45359237,
    ounce: 0.028349523,
    metric_ton: 1000
  };

  // Digital (base: bytes)
  const digitalRatios: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
    tb: 1024 * 1024 * 1024 * 1024
  };

  let ratios = lengthRatios;
  if (category === 'mass') ratios = massRatios;
  else if (category === 'digital') ratios = digitalRatios;

  if (ratios[from] && ratios[to]) {
    const baseValue = val * ratios[from];
    const converted = baseValue / ratios[to];
    return Math.round(converted * 100000) / 100000;
  }

  return val;
}

export function buildUtmUrl(baseUrl: string, params: {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}): string {
  if (!baseUrl) return '';
  let urlStr = baseUrl.trim();
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = 'https://' + urlStr;
  }

  try {
    const url = new URL(urlStr);
    if (params.source) url.searchParams.set('utm_source', params.source.trim());
    if (params.medium) url.searchParams.set('utm_medium', params.medium.trim());
    if (params.campaign) url.searchParams.set('utm_campaign', params.campaign.trim());
    if (params.term) url.searchParams.set('utm_term', params.term.trim());
    if (params.content) url.searchParams.set('utm_content', params.content.trim());
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function parseCronExplanation(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) {
    return 'Invalid cron format (must have exactly 5 parts: minute hour day-of-month month day-of-week)';
  }

  const [min, hour, dom, mon, dow] = parts;

  if (min === '*' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    return 'Every minute';
  }
  if (min === '*/5' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    return 'Every 5 minutes';
  }
  if (min === '0' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    return 'Every hour, at minute 0';
  }
  if (min === '0' && hour === '0' && dom === '*' && mon === '*' && dow === '*') {
    return 'Every day at midnight (00:00)';
  }
  if (min === '0' && hour === '9' && dom === '*' && mon === '*' && dow === '1-5') {
    return 'At 09:00 AM, Monday through Friday';
  }

  return `Runs at minute ${min}, hour ${hour}, day of month ${dom}, month ${mon}, day of week ${dow}`;
}

export interface ColorConversionResult {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

export function parseHexColor(hexInput: string): { r: number; g: number; b: number } | null {
  let hex = hexInput.trim().replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return null;
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function calculateContrastRatio(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const a = [rgb.r, rgb.g, rgb.b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (brighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  content: string;
  leftLine?: number;
  rightLine?: number;
}

export function computeLineDiff(originalText: string, modifiedText: string): DiffLine[] {
  const origLines = originalText.split('\n');
  const modLines = modifiedText.split('\n');
  const result: DiffLine[] = [];

  let i = 0;
  let j = 0;
  let leftNum = 1;
  let rightNum = 1;

  while (i < origLines.length || j < modLines.length) {
    if (i < origLines.length && j < modLines.length && origLines[i] === modLines[j]) {
      result.push({
        type: 'unchanged',
        content: origLines[i],
        leftLine: leftNum++,
        rightLine: rightNum++
      });
      i++;
      j++;
    } else if (j < modLines.length && (i >= origLines.length || !origLines.slice(i).includes(modLines[j]))) {
      result.push({
        type: 'added',
        content: modLines[j],
        rightLine: rightNum++
      });
      j++;
    } else if (i < origLines.length) {
      result.push({
        type: 'removed',
        content: origLines[i],
        leftLine: leftNum++
      });
      i++;
    }
  }

  return result;
}

