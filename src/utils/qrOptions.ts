import type { Options } from 'qr-code-styling';
import type { ErrorCorrectionLevel, QrStyleState } from '../types/qr';

export const PREVIEW_BASE_SIZE = 240;

/**
 * Returns the effective error correction level.
 * Automatically upgrades to 'H' (30% recovery) whenever a center logo is attached.
 */
export function getEffectiveErrorCorrection(style: QrStyleState): ErrorCorrectionLevel {
  return style.logoDataUrl ? 'H' : style.errorCorrection;
}

/**
 * Maps corner style selection into qr-code-styling square & inner dot shapes.
 */
function getCornerShapes(cornerStyle: QrStyleState['cornerStyle']): {
  squareType: 'square' | 'extra-rounded' | 'dot';
  dotType: 'square' | 'dot';
} {
  switch (cornerStyle) {
    case 'square':
      return { squareType: 'square', dotType: 'square' };
    case 'extra-rounded':
      return { squareType: 'extra-rounded', dotType: 'dot' };
    case 'dot':
      return { squareType: 'dot', dotType: 'dot' };
  }
}

/**
 * Builds the qr-code-styling Options object for either live preview or high-res export.
 * Scales quiet-zone margin proportionally to target pixel dimensions so exports match the preview.
 */
export function buildQrStylingOptions(
  data: string,
  style: QrStyleState,
  size: number = PREVIEW_BASE_SIZE,
  renderType: 'svg' | 'canvas' = 'svg'
): Options {
  const effectiveEcc = getEffectiveErrorCorrection(style);
  const scaleFactor = size / PREVIEW_BASE_SIZE;
  const scaledMargin = Math.round(style.margin * scaleFactor);
  const { squareType, dotType } = getCornerShapes(style.cornerStyle);

  const gradientConfig =
    style.colorMode === 'gradient'
      ? {
          type: style.gradientType,
          rotation: (style.gradientRotation * Math.PI) / 180,
          colorStops: [
            { offset: 0, color: style.gradientColor1 },
            { offset: 1, color: style.gradientColor2 },
          ],
        }
      : undefined;

  const solidColor = style.colorMode === 'solid' ? style.dotsColor : undefined;

  return {
    width: size,
    height: size,
    type: renderType,
    data: data || 'https://qrcodestudiopro.app',
    margin: scaledMargin,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: effectiveEcc,
    },
    image: style.logoDataUrl ?? undefined,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: style.logoSize,
      margin: Math.max(4, Math.round(6 * scaleFactor)),
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      type: style.dotStyle,
      color: solidColor,
      gradient: gradientConfig,
    },
    cornersSquareOptions: {
      type: squareType,
      color: solidColor,
      gradient: gradientConfig,
    },
    cornersDotOptions: {
      type: dotType,
      color: solidColor,
      gradient: gradientConfig,
    },
    backgroundOptions: {
      color: style.transparentBackground ? 'transparent' : style.backgroundColor,
    },
  };
}
