import { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  Image as ImageIcon,
  Info,
  Sparkles,
} from 'lucide-react';
import type {
  ExportFormat,
  ExportResolution,
  PayloadResult,
  QrStyleState,
} from '../types/qr';
import { analyzeQrReadability } from '../utils/contrast';
import {
  buildQrStylingOptions,
  getEffectiveErrorCorrection,
  PREVIEW_BASE_SIZE,
} from '../utils/qrOptions';

interface PreviewPanelProps {
  payload: PayloadResult;
  style: QrStyleState;
  resolution: ExportResolution;
  onResolutionChange: (res: ExportResolution) => void;
  onFixContrast: () => void;
  onNotify: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

const RESOLUTIONS: Array<{ value: ExportResolution; label: string; hint: string }> = [
  { value: 500, label: '500×500', hint: 'Web / Redes' },
  { value: 1000, label: '1000×1000', hint: 'Padrão HD' },
  { value: 2000, label: '2000×2000', hint: 'Impressão' },
];

export function PreviewPanel({
  payload,
  style,
  resolution,
  onResolutionChange,
  onFixContrast,
  onNotify,
}: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [justCopied, setJustCopied] = useState(false);

  const analysis = analyzeQrReadability(style);
  const effectiveEcc = getEffectiveErrorCorrection(style);
  const effectiveData = payload.isValid && payload.data ? payload.data : 'https://qrcodestudiopro.app';

  // Mount QRCodeStyling instance once and update live on every state change
  useEffect(() => {
    const options = buildQrStylingOptions(effectiveData, style, PREVIEW_BASE_SIZE, 'svg');

    if (!qrInstanceRef.current) {
      qrInstanceRef.current = new QRCodeStyling(options);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        qrInstanceRef.current.append(containerRef.current);
      }
    } else {
      qrInstanceRef.current.update(options);
    }
  }, [effectiveData, style]);

  // Cleanup container on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      qrInstanceRef.current = null;
    };
  }, []);

  const handleDownload = async (format: ExportFormat) => {
    if (!payload.isValid) {
      onNotify(
        'error',
        'Preencha os dados obrigatórios',
        payload.error ?? 'Corrija o formulário antes de exportar.'
      );
      return;
    }

    setBusyAction(format);
    try {
      const renderType = format === 'svg' ? 'svg' : 'canvas';
      const exportQr = new QRCodeStyling(
        buildQrStylingOptions(payload.data, style, resolution, renderType)
      );

      const fileName = `qrcode-studio-${resolution}px`;
      await exportQr.download({ name: fileName, extension: format });

      onNotify(
        'success',
        `Download ${format.toUpperCase()} concluído`,
        `Arquivo ${fileName}.${format} salvo (${resolution}×${resolution} px).`
      );
    } catch {
      onNotify(
        'error',
        `Falha ao exportar ${format.toUpperCase()}`,
        'Tente novamente ou verifique a imagem da logo anexada.'
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleCopyImage = async () => {
    if (!payload.isValid) {
      onNotify(
        'error',
        'Preencha os dados obrigatórios',
        payload.error ?? 'Corrija o formulário antes de copiar.'
      );
      return;
    }

    setBusyAction('copy');
    try {
      const exportQr = new QRCodeStyling(
        buildQrStylingOptions(payload.data, style, resolution, 'canvas')
      );
      const rawData = await exportQr.getRawData('png');
      if (!rawData) {
        throw new Error('Falha ao gerar PNG');
      }

      const blob =
        rawData instanceof Blob ? rawData : new Blob([new Uint8Array(rawData)], { type: 'image/png' });

      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof window.ClipboardItem !== 'undefined'
      ) {
        await navigator.clipboard.write([new window.ClipboardItem({ 'image/png': blob })]);
        setJustCopied(true);
        window.setTimeout(() => setJustCopied(false), 2200);
        onNotify(
          'success',
          'Imagem copiada para a área de transferência',
          `Pronta para colar com Ctrl+V (${resolution}×${resolution} px em PNG).`
        );
      } else {
        onNotify(
          'info',
          'Cópia direta indisponível neste navegador',
          'Use o botão "Baixar PNG" para salvar a imagem em alta resolução.'
        );
      }
    } catch {
      onNotify(
        'error',
        'Não foi possível copiar a imagem',
        'Seu navegador pode bloquear acesso à área de transferência. Use o download em PNG.'
      );
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <aside aria-label="Pré-visualização e exportação" className="lg:sticky lg:top-20">
      {/* Main Preview + Export Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#121826]">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Pré-visualização
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Tempo real · ECC {effectiveEcc}
          </span>
        </div>

        {/* Live QR Code Stage */}
        <div className="mt-4 flex flex-col items-center">
          <div
            data-testid="qr-preview-stage"
            data-transparent={style.transparentBackground ? 'true' : 'false'}
            data-contrast-status={analysis.status}
            className={`relative flex items-center justify-center rounded-xl border border-slate-200 p-3 transition-colors dark:border-slate-700 ${
              style.transparentBackground
                ? 'qr-checkerboard'
                : 'bg-slate-50 dark:bg-[#0B0F17]'
            }`}
          >
            <div
              ref={containerRef}
              data-testid="qr-canvas-mount"
              aria-label="Prévia do QR Code gerado"
              className={`flex h-[240px] w-[240px] items-center justify-center overflow-hidden rounded-lg transition-opacity duration-150 ${
                payload.isValid ? 'opacity-100' : 'opacity-35'
              }`}
            />

            {!payload.isValid && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/75 p-4 text-center backdrop-blur-[2px] dark:bg-[#0B0F17]/80">
                <p className="max-w-[200px] text-xs font-medium text-slate-700 dark:text-slate-200">
                  {payload.error ?? 'Preencha os campos à esquerda para gerar o QR Code.'}
                </p>
              </div>
            )}
          </div>

          {/* Quiet Unboxed Technical Metadata */}
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Contraste {analysis.ratio.toFixed(1)}:1</span>
            <span aria-hidden="true">·</span>
            <span>Margem {style.margin} px</span>
            <span aria-hidden="true">·</span>
            <span>{resolution}×{resolution} px</span>
          </div>
        </div>

        {/* Dynamic Contrast / Readability Alert */}
        <div
          role={analysis.status === 'danger' ? 'alert' : 'status'}
          data-testid="readability-banner"
          className={`mt-4 rounded-xl border px-3.5 py-2.5 text-xs ${
            analysis.status === 'danger'
              ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200'
              : analysis.status === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-200'
                : 'border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {analysis.status === 'danger' || analysis.status === 'warning' ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{analysis.headline}</p>
              <p className="mt-0.5 opacity-90 leading-snug">{analysis.details}</p>
              {(analysis.status === 'danger' || analysis.status === 'warning') && (
                <button
                  type="button"
                  onClick={onFixContrast}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-xs transition-colors hover:bg-white dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  <span>Corrigir contraste automaticamente</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Export Resolution Selector */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Resolução de exportação
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {RESOLUTIONS.find((r) => r.value === resolution)?.hint}
            </span>
          </div>
          <div
            role="group"
            aria-label="Resolução de download"
            className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-[#0B0F17]"
          >
            {RESOLUTIONS.map((item) => {
              const active = resolution === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onResolutionChange(item.value)}
                  className={`h-8.5 rounded-lg font-mono text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? 'bg-white text-blue-700 shadow-xs dark:bg-[#1B2438] dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action / Download Buttons */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            disabled={busyAction !== null || !payload.isValid}
            onClick={() => handleDownload('png')}
            className="flex h-10.5 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus-visible:ring-offset-[#121826] whitespace-nowrap cursor-pointer"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{busyAction === 'png' ? 'Gerando PNG...' : `Baixar PNG (${resolution}px)`}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busyAction !== null || !payload.isValid}
              onClick={() => handleDownload('svg')}
              className="flex h-9.5 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#0B0F17] dark:text-slate-100 dark:hover:bg-slate-800 whitespace-nowrap cursor-pointer"
            >
              <FileCode2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{busyAction === 'svg' ? 'Gerando...' : 'Baixar SVG'}</span>
            </button>

            <button
              type="button"
              disabled={busyAction !== null || !payload.isValid}
              onClick={() => handleDownload('webp')}
              className="flex h-9.5 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-[#0B0F17] dark:text-slate-100 dark:hover:bg-slate-800 whitespace-nowrap cursor-pointer"
            >
              <ImageIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{busyAction === 'webp' ? 'Gerando...' : 'Baixar WEBP'}</span>
            </button>
          </div>

          <button
            type="button"
            disabled={busyAction !== null || !payload.isValid}
            onClick={handleCopyImage}
            className="flex h-9.5 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white whitespace-nowrap cursor-pointer"
          >
            {justCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>Imagem copiada!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Copiar imagem (Ctrl+V)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

export function ReadingTipsSection() {
  return (
    <section
      id="dicas-leitura"
      aria-labelledby="dicas-heading"
      className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#121826]"
    >
      <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 pb-4 border-b border-slate-100 dark:border-slate-800">
        <Info className="h-4.5 w-4.5 text-blue-700 dark:text-blue-400 shrink-0" aria-hidden="true" />
        <h2 id="dicas-heading" className="font-display text-base font-bold">
          Dicas de Boa Leitura
        </h2>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
            01. Alto contraste sempre
          </h3>
          <p>
            Mantenha pontos escuros sobre fundo claro (contraste mínimo de 4.5:1). Evite amarelo claro ou tons pastel sobre fundo branco, que impedem o foco da câmera.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
            02. Preserve a zona de silêncio
          </h3>
          <p>
            Uma margem limpa de pelo menos <span className="font-mono">12 px</span> ao redor do QR Code impede que bordas, molduras ou textos vizinhos interfiram na detecção dos cantos.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
            03. Vetor e teste em gráfica
          </h3>
          <p>
            Para cartões, embalagens e banners, exporte em <span className="font-mono">SVG</span> ou <span className="font-mono">PNG 2000×2000 px</span>. Sempre teste o código com a câmera do celular antes de rodar a impressão final.
          </p>
        </div>
      </div>
    </section>
  );
}
