import { useCallback, useEffect, useMemo, useState } from 'react';
import { ContentForm } from './components/ContentForm';
import { Header } from './components/Header';
import { PreviewPanel, ReadingTipsSection } from './components/PreviewPanel';
import { StyleCustomizer } from './components/StyleCustomizer';
import { ToastContainer } from './components/ToastContainer';
import type {
  ExportResolution,
  QrContentState,
  QrStyleState,
  ToastItem,
} from './types/qr';
import { buildActivePayload } from './utils/qrPayload';

const INITIAL_CONTENT: QrContentState = {
  activeTab: 'url',
  url: {
    url: 'https://qrcodestudiopro.app',
  },
  text: {
    text: 'Bem-vindo ao QR Code Studio Pro!',
  },
  whatsapp: {
    countryCode: '55',
    phone: '',
    message: 'Olá! Gostaria de mais informações.',
  },
  wifi: {
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false,
  },
  pix: {
    mode: 'key',
    copyPasteCode: '',
    pixKey: '',
    merchantName: '',
    merchantCity: 'Sao Paulo',
    amount: '',
    txId: '',
  },
  vcard: {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    title: '',
    website: '',
  },
};

const DEFAULT_STYLE: QrStyleState = {
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

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = window.localStorage.getItem('qr-studio-theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
  } catch {
    // Ignore storage access errors in restricted iframes
  }
  return false;
}

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);
  const [content, setContent] = useState<QrContentState>(INITIAL_CONTENT);
  const [style, setStyle] = useState<QrStyleState>(DEFAULT_STYLE);
  const [resolution, setResolution] = useState<ExportResolution>(1000);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      window.localStorage.setItem('qr-studio-theme', isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastItem['type'], title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-2), { id, type, title, description }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const payload = useMemo(() => buildActivePayload(content), [content]);

  const handleResetStyle = useCallback(() => {
    setStyle(DEFAULT_STYLE);
    addToast('info', 'Estilo restaurado', 'Cores, formas e margem voltaram ao padrão de alto contraste.');
  }, [addToast]);

  const handleFixContrast = useCallback(() => {
    setStyle((prev) => ({
      ...prev,
      colorMode: 'solid',
      dotsColor: '#111827',
      backgroundColor: '#FFFFFF',
      transparentBackground: false,
      margin: Math.max(prev.margin, 16),
    }));
    addToast(
      'success',
      'Contraste otimizado',
      'Aplicamos grafite escuro (#111827) sobre branco (#FFFFFF) com zona de silêncio segura.'
    );
  }, [addToast]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] transition-colors duration-150 dark:bg-[#0B0F17] dark:text-[#F3F4F6]">
      <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />

      <main className="mx-auto max-w-[1360px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        {/* Compact Editorial Intro */}
        <div className="mb-5 flex flex-col gap-1 lg:flex-row lg:items-baseline lg:justify-between lg:gap-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px] dark:text-white [text-wrap:balance]">
            Crie QR Codes personalizados em alta resolução
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            100% no navegador, sem cadastro · Exporte pronto para tela ou gráfica.
          </p>
        </div>

        {/* Two-Column Studio Workspace */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left Column: Content + Visual Customization */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-7">
            <ContentForm content={content} payload={payload} onChange={setContent} />
            <StyleCustomizer
              style={style}
              onChange={setStyle}
              onReset={handleResetStyle}
              onLogoUploaded={(fileName) =>
                addToast(
                  'success',
                  'Logo aplicada no centro',
                  `${fileName} adicionada com correção de erro Máxima (H).`
                )
              }
              onLogoError={(msg) => addToast('error', 'Erro ao carregar logo', msg)}
            />
          </div>

          {/* Right Column: Sticky Preview & Export */}
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-20">
            <PreviewPanel
              payload={payload}
              style={style}
              resolution={resolution}
              onResolutionChange={setResolution}
              onFixContrast={handleFixContrast}
              onNotify={addToast}
            />
          </div>
        </div>

        <ReadingTipsSection />
      </main>

      <footer className="mt-10 border-t border-slate-200/80 py-6 dark:border-slate-800/80">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:px-6 lg:px-8 dark:text-slate-400">
          <p>QR Code Studio Pro · Processamento local no navegador, nenhum dado é enviado a servidores externos.</p>
          <p className="font-mono">PNG · SVG · WEBP</p>
        </div>
      </footer>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
