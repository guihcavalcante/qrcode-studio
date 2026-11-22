export type ContentTabId = 'url' | 'text' | 'whatsapp' | 'wifi' | 'pix' | 'vcard';

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export type PixMode = 'key' | 'copypaste';

export interface UrlFormData {
  url: string;
}

export interface TextFormData {
  text: string;
}

export interface WhatsAppFormData {
  countryCode: string;
  phone: string;
  message: string;
}

export interface WifiFormData {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

export interface PixFormData {
  mode: PixMode;
  copyPasteCode: string;
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: string;
  txId: string;
}

export interface VCardFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  title: string;
  website: string;
}

export interface QrContentState {
  activeTab: ContentTabId;
  url: UrlFormData;
  text: TextFormData;
  whatsapp: WhatsAppFormData;
  wifi: WifiFormData;
  pix: PixFormData;
  vcard: VCardFormData;
}

export type DotStyleType = 'square' | 'rounded' | 'dots' | 'classy-rounded';

export type CornerStyleType = 'square' | 'extra-rounded' | 'dot';

export type ColorMode = 'solid' | 'gradient';

export type GradientType = 'linear' | 'radial';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type ExportResolution = 500 | 1000 | 2000;

export type ExportFormat = 'png' | 'svg' | 'webp';

export interface QrStyleState {
  colorMode: ColorMode;
  dotsColor: string;
  gradientType: GradientType;
  gradientColor1: string;
  gradientColor2: string;
  gradientRotation: number;
  backgroundColor: string;
  transparentBackground: boolean;
  dotStyle: DotStyleType;
  cornerStyle: CornerStyleType;
  margin: number;
  errorCorrection: ErrorCorrectionLevel;
  logoDataUrl: string | null;
  logoFileName: string | null;
  logoSize: number; // 0.2 to 0.45
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

export interface PayloadResult {
  data: string;
  isValid: boolean;
  warning?: string;
  error?: string;
  normalizedPreview?: string;
}
