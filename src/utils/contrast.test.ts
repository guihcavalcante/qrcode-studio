import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeQrReadability, getContrastRatio } from './contrast';
import { getEffectiveErrorCorrection } from './qrOptions';
import type { QrStyleState } from '../types/qr';

const baseStyle: QrStyleState = {
  colorMode: 'solid',
  dotsColor: '#111827',
  gradientType: 'linear',
  gradientColor1: '#1D4ED8',
  gradientColor2: '#0F172A',
  gradientRotation: 45,
  backgroundColor: '#FFFFFF',
  transparentBackground: false,
  dotStyle: 'rounded',
  cornerStyle: 'extra-rounded',
  margin: 16,
  errorCorrection: 'M',
  logoDataUrl: null,
  logoFileName: null,
  logoSize: 0.3,
};

test('getContrastRatio calculates 21:1 for black on white and ~1:1 for identical colors', () => {
  assert.equal(getContrastRatio('#000000', '#FFFFFF'), 21);
  assert.equal(getContrastRatio('#FFFFFF', '#FFFFFF'), 1);
});

test('analyzeQrReadability flags yellow dots on white background as danger', () => {
  const analysis = analyzeQrReadability({
    ...baseStyle,
    dotsColor: '#FEF08A',
    backgroundColor: '#FFFFFF',
  });
  assert.equal(analysis.status, 'danger');
  assert.ok(analysis.ratio < 3);
});

test('analyzeQrReadability uses worst-case color stop in gradient mode', () => {
  const analysis = analyzeQrReadability({
    ...baseStyle,
    colorMode: 'gradient',
    gradientColor1: '#0F172A',
    gradientColor2: '#FDE047', // light yellow stop
    backgroundColor: '#FFFFFF',
  });
  assert.equal(analysis.status, 'danger');
  assert.ok(analysis.ratio < 3);
});

test('analyzeQrReadability detects inverted light-on-dark QR codes', () => {
  const analysis = analyzeQrReadability({
    ...baseStyle,
    dotsColor: '#FFFFFF',
    backgroundColor: '#111827',
  });
  assert.equal(analysis.status, 'warning');
  assert.equal(analysis.isInverted, true);
});

test('analyzeQrReadability warns on narrow quiet-zone margin even with high contrast', () => {
  const analysis = analyzeQrReadability({
    ...baseStyle,
    margin: 2,
  });
  assert.equal(analysis.status, 'warning');
  assert.equal(analysis.isLowMargin, true);
});

test('getEffectiveErrorCorrection upgrades to H automatically when a logo is uploaded', () => {
  assert.equal(getEffectiveErrorCorrection(baseStyle), 'M');
  assert.equal(
    getEffectiveErrorCorrection({
      ...baseStyle,
      logoDataUrl: 'data:image/png;base64,abc',
      errorCorrection: 'L',
    }),
    'H'
  );
});
