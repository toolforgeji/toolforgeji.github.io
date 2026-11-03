import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEMI,
  calculateGST,
  analyzeText,
  convertCase,
  convertUnits,
  buildUtmUrl,
  parseCronExplanation,
  parseHexColor,
  rgbToHsl,
  calculateContrastRatio,
  computeLineDiff
} from './tools-logic';

test('calculateEMI computes correct monthly EMI and total interest', () => {
  // $100,000 loan at 10% annual interest for 12 months
  const res = calculateEMI(100000, 10, 12);
  assert.ok(res.monthlyEmi > 8700 && res.monthlyEmi < 8850);
  assert.equal(res.schedule.length, 12);
  assert.ok(res.totalInterest > 5000 && res.totalInterest < 6000);
});

test('calculateEMI handles 0% interest', () => {
  const res = calculateEMI(12000, 0, 12);
  assert.equal(res.monthlyEmi, 1000);
  assert.equal(res.totalInterest, 0);
  assert.equal(res.totalPayment, 12000);
});

test('calculateGST computes accurate exclusive and inclusive amounts', () => {
  // Exclusive 18% on 1000
  const excl = calculateGST(1000, 18, false);
  assert.equal(excl.netAmount, 1000);
  assert.equal(excl.gstAmount, 180);
  assert.equal(excl.totalAmount, 1180);
  assert.equal(excl.cgst, 90);
  assert.equal(excl.sgst, 90);

  // Inclusive 18% on 1180
  const incl = calculateGST(1180, 18, true);
  assert.equal(incl.netAmount, 1000);
  assert.equal(incl.gstAmount, 180);
  assert.equal(incl.totalAmount, 1180);
});

test('analyzeText calculates words, reading time and readability correctly', () => {
  const text = 'ToolForge is a privacy-first suite of tools. Everything runs locally inside your browser!';
  const stats = analyzeText(text);
  assert.equal(stats.words, 13);
  assert.ok(stats.sentences >= 2);
  assert.ok(stats.readingTimeMinutes > 0);
  assert.ok(stats.fleschReadingEase > 0);
});

test('convertCase transforms text across conventions', () => {
  const text = 'hello world from toolforge';
  assert.equal(convertCase(text, 'upper'), 'HELLO WORLD FROM TOOLFORGE');
  assert.equal(convertCase(text, 'title'), 'Hello World From Toolforge');
  assert.equal(convertCase(text, 'camel'), 'helloWorldFromToolforge');
  assert.equal(convertCase(text, 'snake'), 'hello_world_from_toolforge');
  assert.equal(convertCase(text, 'kebab'), 'hello-world-from-toolforge');
  assert.equal(convertCase(text, 'slug'), 'hello-world-from-toolforge');
});

test('convertUnits converts temperature and length accurately', () => {
  const cToF = convertUnits(100, 'celsius', 'fahrenheit', 'temperature');
  assert.equal(cToF, 212);

  const kmToM = convertUnits(5, 'kilometer', 'meter', 'length');
  assert.equal(kmToM, 5000);
});

test('buildUtmUrl properly formats query parameters', () => {
  const url = buildUtmUrl('example.com/blog', {
    source: 'newsletter',
    medium: 'email',
    campaign: 'launch'
  });
  assert.ok(url.startsWith('https://example.com/blog'));
  assert.ok(url.includes('utm_source=newsletter'));
  assert.ok(url.includes('utm_medium=email'));
  assert.ok(url.includes('utm_campaign=launch'));
});

test('parseCronExplanation produces human description', () => {
  assert.equal(parseCronExplanation('* * * * *'), 'Every minute');
  assert.equal(parseCronExplanation('0 0 * * *'), 'Every day at midnight (00:00)');
});

test('parseHexColor and rgbToHsl convert colors accurately', () => {
  const rgb = parseHexColor('#4f46e5');
  assert.ok(rgb);
  assert.equal(rgb.r, 79);
  assert.equal(rgb.g, 70);
  assert.equal(rgb.b, 229);

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  assert.equal(hsl.h, 243);
  assert.equal(hsl.s, 75);
  assert.equal(hsl.l, 59);
});

test('calculateContrastRatio computes WCAG contrast ratios', () => {
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 255, g: 255, b: 255 };
  const ratio = calculateContrastRatio(black, white);
  assert.equal(ratio, 21); // Maximum contrast ratio
});

test('computeLineDiff flags added, removed, and unchanged lines', () => {
  const orig = 'line1\nline2\nline3';
  const mod = 'line1\nline2 modified\nline3\nline4';
  const diff = computeLineDiff(orig, mod);
  assert.ok(diff.some(d => d.type === 'unchanged' && d.content === 'line1'));
  assert.ok(diff.some(d => d.type === 'added' && d.content === 'line4'));
});

