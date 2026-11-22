import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPixPayload,
  buildTextPayload,
  buildUrlPayload,
  buildVCardPayload,
  buildWhatsAppPayload,
  buildWifiPayload,
  computeCrc16Ccitt,
  escapeWifiField,
} from './qrPayload';

test('buildUrlPayload automatically adds https:// when missing protocol', () => {
  const res = buildUrlPayload({ url: 'exemplo.com.br/contato' });
  assert.equal(res.isValid, true);
  assert.equal(res.data, 'https://exemplo.com.br/contato');
  assert.ok(res.warning?.includes('Protocolo adicionado'));
});

test('buildUrlPayload preserves valid http and https URLs without warnings', () => {
  const res = buildUrlPayload({ url: 'https://studio.design/qr?ref=1' });
  assert.equal(res.isValid, true);
  assert.equal(res.data, 'https://studio.design/qr?ref=1');
  assert.equal(res.warning, undefined);
});

test('buildUrlPayload rejects empty or malformed domains', () => {
  assert.equal(buildUrlPayload({ url: '   ' }).isValid, false);
  assert.equal(buildUrlPayload({ url: 'palavra-sem-dominio' }).isValid, false);
  assert.equal(buildUrlPayload({ url: 'ftp://arquivo.com' }).isValid, false);
});

test('buildTextPayload validates non-empty text and warns on very long content', () => {
  assert.equal(buildTextPayload({ text: '' }).isValid, false);
  const shortRes = buildTextPayload({ text: 'Cupom STUDIO20' });
  assert.equal(shortRes.isValid, true);
  assert.equal(shortRes.warning, undefined);

  const longRes = buildTextPayload({ text: 'a'.repeat(550) });
  assert.equal(longRes.isValid, true);
  assert.ok(longRes.warning);
});

test('buildWhatsAppPayload formats wa.me link with country code and encoded message', () => {
  const res = buildWhatsAppPayload({
    countryCode: '55',
    phone: '(11) 98765-4321',
    message: 'Olá, quero um orçamento!',
  });
  assert.equal(res.isValid, true);
  assert.equal(
    res.data,
    'https://wa.me/5511987654321?text=Ol%C3%A1%2C%20quero%20um%20or%C3%A7amento!'
  );
});

test('buildWhatsAppPayload avoids duplicating country code if already present', () => {
  const res = buildWhatsAppPayload({
    countryCode: '55',
    phone: '+55 21 99999-0000',
    message: '',
  });
  assert.equal(res.isValid, true);
  assert.equal(res.data, 'https://wa.me/5521999990000');
});

test('buildWifiPayload escapes special characters and handles open networks', () => {
  assert.equal(escapeWifiField('Cafe;Wi:Fi\\1'), 'Cafe\\;Wi\\:Fi\\\\1');

  const wpaRes = buildWifiPayload({
    ssid: 'Cafe;WiFi',
    password: 'pass:123',
    encryption: 'WPA',
    hidden: true,
  });
  assert.equal(wpaRes.isValid, true);
  assert.equal(wpaRes.data, 'WIFI:T:WPA;S:Cafe\\;WiFi;P:pass\\:123;H:true;;');

  const openRes = buildWifiPayload({
    ssid: 'Visitantes',
    password: '',
    encryption: 'nopass',
    hidden: false,
  });
  assert.equal(openRes.isValid, true);
  assert.equal(openRes.data, 'WIFI:T:nopass;S:Visitantes;P:;H:false;;');

  const missingPass = buildWifiPayload({
    ssid: 'Escritorio',
    password: '',
    encryption: 'WPA',
    hidden: false,
  });
  assert.equal(missingPass.isValid, false);
});

test('computeCrc16Ccitt matches standard CCITT-FALSE check value for "123456789"', () => {
  assert.equal(computeCrc16Ccitt('123456789'), '29B1');
});

test('buildPixPayload generates valid EMV BR Code with CRC16 and supports Copia e Cola', () => {
  const emv = buildPixPayload({
    mode: 'key',
    copyPasteCode: '',
    pixKey: 'pagamentos@estudio.com.br',
    merchantName: 'Estúdio São Paulo',
    merchantCity: 'São Paulo',
    amount: '125,50',
    txId: 'PEDIDO01',
  });
  assert.equal(emv.isValid, true);
  assert.ok(emv.data.startsWith('000201'));
  assert.ok(emv.data.includes('BR.GOV.BCB.PIX'));
  assert.ok(emv.data.includes('5406125.50'));
  assert.ok(emv.data.includes('5917Estudio Sao Paulo'));
  assert.ok(emv.data.includes('6009Sao Paulo'));
  // Verify CRC matches last 4 chars
  const bodyWithoutCrc = emv.data.slice(0, -4);
  const crc = emv.data.slice(-4);
  assert.equal(computeCrc16Ccitt(bodyWithoutCrc), crc);

  const copyPaste = buildPixPayload({
    mode: 'copypaste',
    copyPasteCode: emv.data,
    pixKey: '',
    merchantName: '',
    merchantCity: '',
    amount: '',
    txId: '',
  });
  assert.equal(copyPaste.isValid, true);
  assert.equal(copyPaste.warning, undefined);
  assert.equal(copyPaste.data, emv.data);
});

test('buildVCardPayload produces standard vCard 3.0 block', () => {
  const res = buildVCardPayload({
    firstName: 'Marina',
    lastName: 'Costa',
    phone: '+55 11 91234-5678',
    email: 'marina@design.com',
    company: 'Ateliê Gráfico',
    title: 'Diretora de Arte',
    website: 'ateliegrafico.com.br',
  });
  assert.equal(res.isValid, true);
  assert.ok(res.data.includes('BEGIN:VCARD'));
  assert.ok(res.data.includes('VERSION:3.0'));
  assert.ok(res.data.includes('N:Costa;Marina;;;'));
  assert.ok(res.data.includes('FN:Marina Costa'));
  assert.ok(res.data.includes('ORG:Ateliê Gráfico'));
  assert.ok(res.data.includes('URL:https://ateliegrafico.com.br'));
  assert.ok(res.data.includes('END:VCARD'));
});
