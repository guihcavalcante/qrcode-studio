import type {
  PayloadResult,
  PixFormData,
  QrContentState,
  TextFormData,
  UrlFormData,
  VCardFormData,
  WhatsAppFormData,
  WifiFormData,
} from '../types/qr';

/**
 * Normalizes and validates a URL input.
 * Automatically prepends https:// when protocol is omitted (e.g., "exemplo.com.br").
 */
export function buildUrlPayload(form: UrlFormData): PayloadResult {
  const raw = form.url.trim();
  if (!raw) {
    return {
      data: '',
      isValid: false,
      error: 'Informe um endereço URL para gerar o QR Code.',
    };
  }

  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw);
  const candidate = hasProtocol ? raw : `https://${raw}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        data: '',
        isValid: false,
        error: 'Use um link com protocolo http:// ou https://.',
      };
    }

    // Basic domain check: must have at least one dot or be localhost
    const host = parsed.hostname;
    if (host !== 'localhost' && !host.includes('.')) {
      return {
        data: '',
        isValid: false,
        error: 'Digite um domínio válido (ex: seusite.com.br).',
      };
    }

    return {
      data: parsed.toString(),
      isValid: true,
      warning: !hasProtocol ? `Protocolo adicionado automaticamente: ${parsed.toString()}` : undefined,
      normalizedPreview: parsed.toString(),
    };
  } catch {
    return {
      data: '',
      isValid: false,
      error: 'Endereço URL inválido. Verifique espaços ou caracteres especiais.',
    };
  }
}

/**
 * Builds a plain text payload.
 */
export function buildTextPayload(form: TextFormData): PayloadResult {
  const raw = form.text.trim();
  if (!raw) {
    return {
      data: '',
      isValid: false,
      error: 'Digite algum texto para codificar no QR Code.',
    };
  }

  const warning =
    raw.length > 500
      ? 'Textos muito longos aumentam a densidade do QR Code e exigem maior tamanho de impressão.'
      : undefined;

  return {
    data: raw,
    isValid: true,
    warning,
  };
}

/**
 * Builds a wa.me WhatsApp deep link from country code, phone with DDD, and optional message.
 */
export function buildWhatsAppPayload(form: WhatsAppFormData): PayloadResult {
  const digits = form.phone.replace(/\D/g, '');
  const countryDigits = form.countryCode.replace(/\D/g, '') || '55';

  if (!digits) {
    return {
      data: '',
      isValid: false,
      error: 'Informe o número do WhatsApp com DDD.',
    };
  }

  if (digits.length < 8) {
    return {
      data: '',
      isValid: false,
      error: 'Número muito curto. Inclua o DDD + número (ex: 11 99999-9999).',
    };
  }

  // Avoid duplicating country code if user pasted full international number (e.g., 5511999999999)
  const fullNumber =
    digits.startsWith(countryDigits) && digits.length >= countryDigits.length + 10
      ? digits
      : `${countryDigits}${digits}`;

  const trimmedMsg = form.message.trim();
  const baseUrl = `https://wa.me/${fullNumber}`;
  const fullUrl = trimmedMsg ? `${baseUrl}?text=${encodeURIComponent(trimmedMsg)}` : baseUrl;

  return {
    data: fullUrl,
    isValid: true,
    normalizedPreview: fullUrl,
  };
}

/**
 * Escapes special characters required by the Wi-Fi QR specification (ZXing standard).
 */
export function escapeWifiField(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

/**
 * Builds a standard Wi-Fi QR Code string: WIFI:T:WPA;S:SSID;P:PASS;H:false;;
 */
export function buildWifiPayload(form: WifiFormData): PayloadResult {
  const ssid = form.ssid.trim();
  if (!ssid) {
    return {
      data: '',
      isValid: false,
      error: 'Informe o nome da rede Wi-Fi (SSID).',
    };
  }

  if (form.encryption !== 'nopass' && !form.password) {
    return {
      data: '',
      isValid: false,
      error: 'Informe a senha da rede ou selecione "Sem senha".',
    };
  }

  const escapedSsid = escapeWifiField(ssid);
  const escapedPass = form.encryption === 'nopass' ? '' : escapeWifiField(form.password);
  const hiddenFlag = form.hidden ? 'true' : 'false';

  const payload = `WIFI:T:${form.encryption};S:${escapedSsid};P:${escapedPass};H:${hiddenFlag};;`;

  return {
    data: payload,
    isValid: true,
    normalizedPreview: `Rede: ${ssid} (${form.encryption === 'nopass' ? 'Aberta' : form.encryption})`,
  };
}

/**
 * Computes CRC-16/CCITT-FALSE (polynomial 0x1021, initial value 0xFFFF)
 * required by Banco Central do Brasil PIX EMV QRCPS-MPM specification.
 */
export function computeCrc16Ccitt(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatEmvField(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

/**
 * Removes diacritics and non-ASCII characters for safe EMV PIX compatibility across bank apps.
 */
export function sanitizeEmvText(text: string, maxLength: number): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 .\-/]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Builds either a passthrough PIX Copia e Cola payload or a standard static PIX EMV BR Code.
 */
export function buildPixPayload(form: PixFormData): PayloadResult {
  if (form.mode === 'copypaste') {
    const code = form.copyPasteCode.trim();
    if (!code) {
      return {
        data: '',
        isValid: false,
        error: 'Cole o código PIX Copia e Cola gerado pelo seu banco.',
      };
    }

    const looksLikeEmv = code.startsWith('000201') && code.includes('BR.GOV.BCB.PIX');
    return {
      data: code,
      isValid: true,
      warning: !looksLikeEmv
        ? 'Este código não segue o início padrão EMV (000201...BR.GOV.BCB.PIX). Verifique se foi copiado por completo.'
        : undefined,
      normalizedPreview: code,
    };
  }

  const rawKey = form.pixKey.trim();
  if (!rawKey) {
    return {
      data: '',
      isValid: false,
      error: 'Informe a chave PIX (CPF, CNPJ, e-mail, telefone ou chave aleatória).',
    };
  }

  const merchantName = sanitizeEmvText(form.merchantName || 'RECEBEDOR', 25) || 'RECEBEDOR';
  const merchantCity = sanitizeEmvText(form.merchantCity || 'BRASIL', 15) || 'BRASIL';
  const txIdClean =
    form.txId
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 25) || '***';

  // Parse optional BRL amount (accepts "49,90" or "49.90")
  let formattedAmount = '';
  const rawAmount = form.amount.trim().replace(',', '.');
  if (rawAmount) {
    const num = Number(rawAmount);
    if (!Number.isFinite(num) || num <= 0) {
      return {
        data: '',
        isValid: false,
        error: 'Informe um valor numérico válido maior que zero (ex: 49,90).',
      };
    }
    formattedAmount = num.toFixed(2);
  }

  // Merchant Account Information (ID 26)
  const gui = formatEmvField('00', 'BR.GOV.BCB.PIX');
  const keyField = formatEmvField('01', rawKey);
  const merchantAccountInfo = formatEmvField('26', `${gui}${keyField}`);

  // Additional Data Field Template (ID 62)
  const additionalData = formatEmvField('62', formatEmvField('05', txIdClean));

  const segments = [
    formatEmvField('00', '01'), // Payload Format Indicator
    merchantAccountInfo,
    formatEmvField('52', '0000'), // Merchant Category Code
    formatEmvField('53', '986'), // Currency (BRL)
    ...(formattedAmount ? [formatEmvField('54', formattedAmount)] : []),
    formatEmvField('58', 'BR'), // Country Code
    formatEmvField('59', merchantName),
    formatEmvField('60', merchantCity),
    additionalData,
    '6304', // CRC16 header
  ];

  const payloadWithoutCrc = segments.join('');
  const crc = computeCrc16Ccitt(payloadWithoutCrc);
  const fullEmv = `${payloadWithoutCrc}${crc}`;

  return {
    data: fullEmv,
    isValid: true,
    normalizedPreview: fullEmv,
  };
}

/**
 * Escapes characters for vCard 3.0 properties.
 */
function escapeVCardValue(val: string): string {
  return val.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

/**
 * Builds a vCard 3.0 contact payload compatible with iOS and Android cameras.
 */
export function buildVCardPayload(form: VCardFormData): PayloadResult {
  const first = form.firstName.trim();
  const last = form.lastName.trim();
  const fullName = [first, last].filter(Boolean).join(' ');

  if (!fullName) {
    return {
      data: '',
      isValid: false,
      error: 'Informe pelo menos o nome do contato.',
    };
  }

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCardValue(last)};${escapeVCardValue(first)};;;`,
    `FN:${escapeVCardValue(fullName)}`,
  ];

  if (form.company.trim()) {
    lines.push(`ORG:${escapeVCardValue(form.company.trim())}`);
  }
  if (form.title.trim()) {
    lines.push(`TITLE:${escapeVCardValue(form.title.trim())}`);
  }
  if (form.phone.trim()) {
    lines.push(`TEL;TYPE=CELL:${form.phone.trim()}`);
  }
  if (form.email.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET:${form.email.trim()}`);
  }
  if (form.website.trim()) {
    const rawSite = form.website.trim();
    const site = /^[a-zA-Z]+:\/\//.test(rawSite) ? rawSite : `https://${rawSite}`;
    lines.push(`URL:${site}`);
  }

  lines.push('END:VCARD');

  return {
    data: lines.join('\n'),
    isValid: true,
    normalizedPreview: `${fullName}${form.company.trim() ? ` · ${form.company.trim()}` : ''}`,
  };
}

/**
 * Master dispatcher that generates the active QR payload from form state.
 */
export function buildActivePayload(state: QrContentState): PayloadResult {
  switch (state.activeTab) {
    case 'url':
      return buildUrlPayload(state.url);
    case 'text':
      return buildTextPayload(state.text);
    case 'whatsapp':
      return buildWhatsAppPayload(state.whatsapp);
    case 'wifi':
      return buildWifiPayload(state.wifi);
    case 'pix':
      return buildPixPayload(state.pix);
    case 'vcard':
      return buildVCardPayload(state.vcard);
  }
}
