import type { QrStyleState } from '../types/qr';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export type ReadabilityStatus = 'excellent' | 'good' | 'warning' | 'danger';

export interface ContrastAnalysis {
  ratio: number;
  status: ReadabilityStatus;
  isInverted: boolean;
  isLowMargin: boolean;
  headline: string;
  details: string;
}

/**
 * Parses a 3-digit or 6-digit hex color string into RGB channels (0-255).
 */
export function hexToRgb(hex: string): RgbColor | null {
  const cleaned = hex.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return { r, g, b };
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

/**
 * Computes WCAG 2.1 relative luminance (0.0 for pure black to 1.0 for pure white).
 */
export function getRelativeLuminance(rgb: RgbColor): number {
  const transform = (channel: number): number => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(rgb.r) + 0.7152 * transform(rgb.g) + 0.0722 * transform(rgb.b);
}

/**
 * Computes WCAG contrast ratio between two hex colors (1.0 to 21.0).
 */
export function getContrastRatio(hexA: string, hexB: string): number {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return 1;

  const lumA = getRelativeLuminance(rgbA);
  const lumB = getRelativeLuminance(rgbB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);

  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Evaluates QR code camera scan readability based on dot colors, gradient worst-case stop,
 * background color / transparency, and quiet zone margin.
 */
export function analyzeQrReadability(style: QrStyleState): ContrastAnalysis {
  const isLowMargin = style.margin < 8;
  const fgColors =
    style.colorMode === 'gradient'
      ? [style.gradientColor1, style.gradientColor2]
      : [style.dotsColor];

  // If background is transparent, evaluate against standard white paper/screen background
  const effectiveBg = style.transparentBackground ? '#FFFFFF' : style.backgroundColor;
  const bgRgb = hexToRgb(effectiveBg) ?? { r: 255, g: 255, b: 255 };
  const bgLum = getRelativeLuminance(bgRgb);

  let worstRatio = 21;
  let hasInvertedColor = false;

  for (const fg of fgColors) {
    const ratio = getContrastRatio(fg, effectiveBg);
    if (ratio < worstRatio) {
      worstRatio = ratio;
    }
    const fgRgb = hexToRgb(fg);
    if (fgRgb) {
      const fgLum = getRelativeLuminance(fgRgb);
      if (fgLum > bgLum + 0.05) {
        hasInvertedColor = true;
      }
    }
  }

  if (style.transparentBackground) {
    if (worstRatio < 3.0) {
      return {
        ratio: worstRatio,
        status: 'danger',
        isInverted: false,
        isLowMargin,
        headline: 'Pontos muito claros para fundo transparente',
        details:
          'Se aplicado sobre fundos claros ou papel branco, a câmera terá dificuldade para ler este QR Code. Prefira pontos escuros ou aplique sobre uma superfície escura de alto contraste.',
      };
    }
    return {
      ratio: worstRatio,
      status: isLowMargin ? 'warning' : 'good',
      isInverted: false,
      isLowMargin,
      headline: isLowMargin
        ? 'Zona de silêncio reduzida com fundo transparente'
        : 'Fundo transparente pronto para aplicação',
      details: isLowMargin
        ? 'Aumente a margem para pelo menos 12 px e certifique-se de aplicar o QR Code sobre um fundo de alto contraste.'
        : 'Certifique-se de posicionar o QR Code exportado sobre uma superfície clara e uniforme para leitura imediata.',
    };
  }

  if (worstRatio < 3.0) {
    return {
      ratio: worstRatio,
      status: 'danger',
      isInverted: hasInvertedColor,
      isLowMargin,
      headline: `Contraste muito baixo (${worstRatio.toFixed(1)}:1)`,
      details:
        'A combinação atual de cores pode impedir a leitura pela câmera do celular. Recomendamos contraste mínimo de 4.5:1 com pontos escuros em fundo claro.',
    };
  }

  if (hasInvertedColor) {
    return {
      ratio: worstRatio,
      status: 'warning',
      isInverted: true,
      isLowMargin,
      headline: `QR Code invertido (${worstRatio.toFixed(1)}:1)`,
      details:
        'Pontos claros sobre fundo escuro podem falhar em leitores mais antigos ou sob pouca luz. Para máxima compatibilidade, use pontos escuros em fundo claro.',
    };
  }

  if (worstRatio < 4.5) {
    return {
      ratio: worstRatio,
      status: 'warning',
      isInverted: false,
      isLowMargin,
      headline: `Contraste moderado (${worstRatio.toFixed(1)}:1)`,
      details:
        'A leitura funciona na maioria das câmeras, mas escurecer um pouco os pontos ou clarear o fundo garante leitura mais rápida em impressão.',
    };
  }

  if (isLowMargin) {
    return {
      ratio: worstRatio,
      status: 'warning',
      isInverted: false,
      isLowMargin: true,
      headline: `Margem muito estreita (${style.margin} px)`,
      details:
        'A zona de silêncio ao redor do código ajuda a câmera a detectar as bordas. Recomendamos pelo menos 12 px de margem.',
    };
  }

  return {
    ratio: worstRatio,
    status: 'excellent',
    isInverted: false,
    isLowMargin: false,
    headline: `Excelente legibilidade (${worstRatio.toFixed(1)}:1)`,
    details: 'Alto contraste e zona de silêncio adequada para leitura rápida em telas e impressos.',
  };
}
