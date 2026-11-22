import { useRef, useState } from 'react';
import {
  ChevronDown,
  ImagePlus,
  Palette,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Shapes,
  Trash2,
} from 'lucide-react';
import type {
  CornerStyleType,
  DotStyleType,
  ErrorCorrectionLevel,
  GradientType,
  QrStyleState,
} from '../types/qr';

interface StyleCustomizerProps {
  style: QrStyleState;
  onChange: (updater: (prev: QrStyleState) => QrStyleState) => void;
  onReset: () => void;
  onLogoUploaded: (fileName: string) => void;
  onLogoError: (message: string) => void;
}

type AccordionKey = 'colors' | 'shapes' | 'logo' | 'spacing';

interface ColorPreset {
  name: string;
  colorMode: 'solid' | 'gradient';
  dotsColor: string;
  gradientColor1: string;
  gradientColor2: string;
  backgroundColor: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  {
    name: 'Grafite Clássico',
    colorMode: 'solid',
    dotsColor: '#111827',
    gradientColor1: '#111827',
    gradientColor2: '#374151',
    backgroundColor: '#FFFFFF',
  },
  {
    name: 'Azul Cobalto',
    colorMode: 'solid',
    dotsColor: '#1D4ED8',
    gradientColor1: '#1D4ED8',
    gradientColor2: '#1E3A8A',
    backgroundColor: '#FFFFFF',
  },
  {
    name: 'Esmeralda',
    colorMode: 'solid',
    dotsColor: '#065F46',
    gradientColor1: '#065F46',
    gradientColor2: '#047857',
    backgroundColor: '#FFFFFF',
  },
  {
    name: 'Vinho Editorial',
    colorMode: 'solid',
    dotsColor: '#881337',
    gradientColor1: '#881337',
    gradientColor2: '#4C0519',
    backgroundColor: '#FFFFFF',
  },
  {
    name: 'Gradiente Oceano',
    colorMode: 'gradient',
    dotsColor: '#1D4ED8',
    gradientColor1: '#1D4ED8',
    gradientColor2: '#0F766E',
    backgroundColor: '#FFFFFF',
  },
  {
    name: 'Gradiente Obsidiana',
    colorMode: 'gradient',
    dotsColor: '#0F172A',
    gradientColor1: '#0F172A',
    gradientColor2: '#1D4ED8',
    backgroundColor: '#FFFFFF',
  },
];

const DOT_OPTIONS: Array<{ id: DotStyleType; label: string }> = [
  { id: 'square', label: 'Quadrado clássico' },
  { id: 'rounded', label: 'Arredondado' },
  { id: 'dots', label: 'Pontos' },
  { id: 'classy-rounded', label: 'Elegante' },
];

const CORNER_OPTIONS: Array<{ id: CornerStyleType; label: string }> = [
  { id: 'square', label: 'Quadrado' },
  { id: 'extra-rounded', label: 'Arredondado extra' },
  { id: 'dot', label: 'Ponto' },
];

const ECC_OPTIONS: Array<{ id: ErrorCorrectionLevel; label: string; pct: string }> = [
  { id: 'L', label: 'Baixo (L)', pct: '7%' },
  { id: 'M', label: 'Médio (M)', pct: '15%' },
  { id: 'Q', label: 'Alto (Q)', pct: '25%' },
  { id: 'H', label: 'Máximo (H)', pct: '30%' },
];

function DotPreviewSvg({ type }: { type: DotStyleType }) {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden="true">
      {type === 'square' && (
        <g fill="currentColor">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="12.5" y="3" width="7" height="7" />
          <rect x="22" y="3" width="7" height="7" />
          <rect x="3" y="12.5" width="7" height="7" />
          <rect x="22" y="12.5" width="7" height="7" />
          <rect x="12.5" y="22" width="7" height="7" />
          <rect x="22" y="22" width="7" height="7" />
        </g>
      )}
      {type === 'rounded' && (
        <g fill="currentColor">
          <rect x="3" y="3" width="16.5" height="7" rx="3.5" />
          <rect x="22" y="3" width="7" height="7" rx="3.5" />
          <rect x="3" y="12.5" width="7" height="16.5" rx="3.5" />
          <rect x="12.5" y="12.5" width="7" height="7" rx="3.5" />
          <rect x="22" y="12.5" width="7" height="16.5" rx="3.5" />
        </g>
      )}
      {type === 'dots' && (
        <g fill="currentColor">
          <circle cx="6.5" cy="6.5" r="3.6" />
          <circle cx="16" cy="6.5" r="3.6" />
          <circle cx="25.5" cy="6.5" r="3.6" />
          <circle cx="6.5" cy="16" r="3.6" />
          <circle cx="16" cy="16" r="3.6" />
          <circle cx="16" cy="25.5" r="3.6" />
          <circle cx="25.5" cy="25.5" r="3.6" />
        </g>
      )}
      {type === 'classy-rounded' && (
        <g fill="currentColor">
          <path d="M3 6.5A3.5 3.5 0 0 1 6.5 3H19.5V10H3V6.5Z" />
          <path d="M22 3H29V6.5A3.5 3.5 0 0 1 25.5 10H22V3Z" />
          <path d="M3 12.5H10V29H6.5A3.5 3.5 0 0 1 3 25.5V12.5Z" />
          <path d="M12.5 16A3.5 3.5 0 0 1 16 12.5H29V19.5H12.5V16Z" />
          <rect x="22" y="22" width="7" height="7" rx="2" />
        </g>
      )}
    </svg>
  );
}

function CornerPreviewSvg({ type }: { type: CornerStyleType }) {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden="true">
      {type === 'square' && (
        <g fill="none" stroke="currentColor" strokeWidth="3.2">
          <rect x="4" y="4" width="24" height="24" />
          <rect x="11.5" y="11.5" width="9" height="9" fill="currentColor" stroke="none" />
        </g>
      )}
      {type === 'extra-rounded' && (
        <g fill="none" stroke="currentColor" strokeWidth="3.2">
          <rect x="4" y="4" width="24" height="24" rx="7" />
          <circle cx="16" cy="16" r="4.8" fill="currentColor" stroke="none" />
        </g>
      )}
      {type === 'dot' && (
        <g fill="none" stroke="currentColor" strokeWidth="3.2">
          <circle cx="16" cy="16" r="12" />
          <circle cx="16" cy="16" r="4.8" fill="currentColor" stroke="none" />
        </g>
      )}
    </svg>
  );
}

function ColorInputField({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (hex: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5"
      >
        {label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 dark:border-slate-700 dark:bg-[#0B0F17] ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <input
          id={id}
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#111827'}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          type="text"
          aria-label={`Código hexadecimal para ${label}`}
          value={value}
          disabled={disabled}
          maxLength={7}
          onChange={(e) => {
            const next = e.target.value.toUpperCase();
            onChange(next.startsWith('#') ? next : `#${next}`);
          }}
          className="w-full bg-transparent font-mono text-xs font-medium text-slate-800 focus:outline-none dark:text-slate-100"
        />
      </div>
    </div>
  );
}

export function StyleCustomizer({
  style,
  onChange,
  onReset,
  onLogoUploaded,
  onLogoError,
}: StyleCustomizerProps) {
  const [openSections, setOpenSections] = useState<Record<AccordionKey, boolean>>({
    colors: true,
    shapes: true,
    logo: false,
    spacing: false,
  });
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleSection = (key: AccordionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowed.includes(file.type)) {
      onLogoError('Formato não suportado. Envie uma imagem PNG, JPG, SVG ou WEBP.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      onLogoError('A imagem deve ter no máximo 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange((prev) => ({
          ...prev,
          logoDataUrl: reader.result as string,
          logoFileName: file.name,
        }));
        onLogoUploaded(file.name);
      }
    };
    reader.onerror = () => {
      onLogoError('Não foi possível ler o arquivo selecionado.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <section
      id="personalizacao"
      aria-labelledby="personalizacao-heading"
      className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#121826]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2
            id="personalizacao-heading"
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50"
          >
            2. Personalização Visual
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Ajuste cores, geometria dos módulos, logo central e zona de silêncio.
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-[#0B0F17] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Redefinir estilo</span>
        </button>
      </div>

      {/* Accordion 1: Cores e Fundo */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection('colors')}
          aria-expanded={openSections.colors}
          aria-controls="accordion-colors"
          className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-6 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
        >
          <div className="flex items-center gap-3">
            <Palette className="h-4.5 w-4.5 text-blue-700 dark:text-blue-400" aria-hidden="true" />
            <div>
              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                Cores e Fundo
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                {style.colorMode === 'gradient' ? 'Gradiente de 2 cores' : `Cor sólida ${style.dotsColor}`}{' '}
                · {style.transparentBackground ? 'Fundo transparente' : `Fundo ${style.backgroundColor}`}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              openSections.colors ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {openSections.colors && (
          <div id="accordion-colors" className="px-5 pb-6 pt-1 sm:px-6 space-y-5">
            {/* Quick High-Contrast Presets */}
            <div>
              <span className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Paletas rápidas de alto contraste
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        colorMode: preset.colorMode,
                        dotsColor: preset.dotsColor,
                        gradientColor1: preset.gradientColor1,
                        gradientColor2: preset.gradientColor2,
                        backgroundColor: preset.backgroundColor,
                        transparentBackground: false,
                      }))
                    }
                    className="inline-flex h-8.5 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0B0F17] dark:text-slate-200 dark:hover:border-slate-600 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 rounded-sm border border-black/10"
                      style={{
                        background:
                          preset.colorMode === 'gradient'
                            ? `linear-gradient(135deg, ${preset.gradientColor1}, ${preset.gradientColor2})`
                            : preset.dotsColor,
                      }}
                    />
                    <span className="truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Solid vs Gradient toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Preenchimento dos pontos
              </span>
              <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-[#0B0F17]">
                <button
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, colorMode: 'solid' }))}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    style.colorMode === 'solid'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-[#1B2438] dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Cor sólida
                </button>
                <button
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, colorMode: 'gradient' }))}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    style.colorMode === 'gradient'
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-[#1B2438] dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Gradiente (2 cores)
                </button>
              </div>
            </div>

            {/* Foreground color controls */}
            {style.colorMode === 'solid' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ColorInputField
                  id="color-dots-solid"
                  label="Cor dos pontos e cantos"
                  value={style.dotsColor}
                  onChange={(hex) => onChange((prev) => ({ ...prev, dotsColor: hex }))}
                />
                <ColorInputField
                  id="color-bg"
                  label="Cor do fundo"
                  value={style.backgroundColor}
                  disabled={style.transparentBackground}
                  onChange={(hex) => onChange((prev) => ({ ...prev, backgroundColor: hex }))}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <ColorInputField
                    id="color-grad-1"
                    label="Cor inicial do gradiente"
                    value={style.gradientColor1}
                    onChange={(hex) => onChange((prev) => ({ ...prev, gradientColor1: hex }))}
                  />
                  <ColorInputField
                    id="color-grad-2"
                    label="Cor final do gradiente"
                    value={style.gradientColor2}
                    onChange={(hex) => onChange((prev) => ({ ...prev, gradientColor2: hex }))}
                  />
                  <ColorInputField
                    id="color-bg-grad"
                    label="Cor do fundo"
                    value={style.backgroundColor}
                    disabled={style.transparentBackground}
                    onChange={(hex) => onChange((prev) => ({ ...prev, backgroundColor: hex }))}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center">
                  <div>
                    <span className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                      Tipo de gradiente
                    </span>
                    <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-[#0B0F17]">
                      {(
                        [
                          { id: 'linear', label: 'Linear' },
                          { id: 'radial', label: 'Radial' },
                        ] as Array<{ id: GradientType; label: string }>
                      ).map((gt) => (
                        <button
                          key={gt.id}
                          type="button"
                          onClick={() => onChange((prev) => ({ ...prev, gradientType: gt.id }))}
                          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            style.gradientType === gt.id
                              ? 'bg-white text-slate-900 shadow-xs dark:bg-[#1B2438] dark:text-white'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {gt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {style.gradientType === 'linear' && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <label
                          htmlFor="gradient-angle"
                          className="font-medium text-slate-600 dark:text-slate-300"
                        >
                          Ângulo do gradiente
                        </label>
                        <span className="font-mono text-slate-700 dark:text-slate-200">
                          {style.gradientRotation}°
                        </span>
                      </div>
                      <input
                        id="gradient-angle"
                        type="range"
                        min={0}
                        max={360}
                        step={15}
                        value={style.gradientRotation}
                        onChange={(e) =>
                          onChange((prev) => ({
                            ...prev,
                            gradientRotation: Number(e.target.value),
                          }))
                        }
                        className="studio-range w-full bg-slate-200 dark:bg-slate-700"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transparent background checkbox */}
            <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={style.transparentBackground}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    transparentBackground: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 dark:border-slate-600 dark:bg-[#0B0F17]"
              />
              <span>Usar fundo transparente (ideal para aplicar sobre layouts e artes gráficas)</span>
            </label>
          </div>
        )}
      </div>

      {/* Accordion 2: Estilo dos Pontos e Cantos */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection('shapes')}
          aria-expanded={openSections.shapes}
          aria-controls="accordion-shapes"
          className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-6 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
        >
          <div className="flex items-center gap-3">
            <Shapes className="h-4.5 w-4.5 text-blue-700 dark:text-blue-400" aria-hidden="true" />
            <div>
              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                Estilo dos Pontos e Cantos
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Pontos: {DOT_OPTIONS.find((d) => d.id === style.dotStyle)?.label} · Cantos:{' '}
                {CORNER_OPTIONS.find((c) => c.id === style.cornerStyle)?.label}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              openSections.shapes ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {openSections.shapes && (
          <div id="accordion-shapes" className="px-5 pb-6 pt-1 sm:px-6 space-y-5">
            {/* Dot styles */}
            <div>
              <span className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2.5">
                Estilo dos pontos (módulos)
              </span>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {DOT_OPTIONS.map((opt) => {
                  const active = style.dotStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChange((prev) => ({ ...prev, dotStyle: opt.id }))}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        active
                          ? 'border-blue-600 bg-blue-50/70 text-blue-800 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0B0F17] dark:text-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <DotPreviewSvg type={opt.id} />
                      <span className="whitespace-nowrap">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Corner (Eyes) styles */}
            <div>
              <span className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2.5">
                Estilo dos cantos (olhos do QR Code)
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {CORNER_OPTIONS.map((opt) => {
                  const active = style.cornerStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChange((prev) => ({ ...prev, cornerStyle: opt.id }))}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        active
                          ? 'border-blue-600 bg-blue-50/70 text-blue-800 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0B0F17] dark:text-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <CornerPreviewSvg type={opt.id} />
                      <span className="whitespace-nowrap">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 3: Logo Central */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => toggleSection('logo')}
          aria-expanded={openSections.logo}
          aria-controls="accordion-logo"
          className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-6 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
        >
          <div className="flex items-center gap-3">
            <ImagePlus className="h-4.5 w-4.5 text-blue-700 dark:text-blue-400" aria-hidden="true" />
            <div>
              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                Logo Central
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                {style.logoFileName
                  ? `Anexada: ${style.logoFileName} · Correção H ativada`
                  : 'Adicione sua marca no centro (PNG, JPG ou SVG)'}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              openSections.logo ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {openSections.logo && (
          <div id="accordion-logo" className="px-5 pb-6 pt-1 sm:px-6 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="sr-only"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />

            {!style.logoDataUrl ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(true);
                }}
                onDragLeave={() => setIsDraggingLogo(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors ${
                  isDraggingLogo
                    ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30'
                    : 'border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-[#0B0F17]/60'
                }`}
              >
                <ImagePlus className="h-7 w-7 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Arraste sua logo aqui ou selecione do computador
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  PNG, JPG, SVG ou WEBP (máx. 4 MB) · Processamento 100% local
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3.5 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-[#121826] dark:text-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Escolher arquivo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-[#0B0F17]">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={style.logoDataUrl}
                      alt="Prévia da logo central"
                      className="h-12 w-12 rounded-lg border border-slate-200 bg-white object-contain p-1 dark:border-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {style.logoFileName ?? 'Logo carregada'}
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>Correção de erro ajustada para Máxima (H - 30%)</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#121826] dark:text-slate-200 cursor-pointer"
                    >
                      Trocar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          logoDataUrl: null,
                          logoFileName: null,
                        }))
                      }
                      aria-label="Remover logo central"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:bg-[#121826] dark:text-red-400 dark:hover:bg-red-950/40 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label
                      htmlFor="logo-size-slider"
                      className="font-medium text-slate-600 dark:text-slate-300"
                    >
                      Proporção da logo no centro
                    </label>
                    <span className="font-mono text-slate-700 dark:text-slate-200">
                      {Math.round(style.logoSize * 100)}%
                    </span>
                  </div>
                  <input
                    id="logo-size-slider"
                    type="range"
                    min={0.2}
                    max={0.42}
                    step={0.02}
                    value={style.logoSize}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        logoSize: Number(e.target.value),
                      }))
                    }
                    className="studio-range w-full bg-slate-200 dark:bg-slate-700"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accordion 4: Margem / Zona de Silêncio e Correção */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection('spacing')}
          aria-expanded={openSections.spacing}
          aria-controls="accordion-spacing"
          className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-6 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
        >
          <div className="flex items-center gap-3">
            <SlidersHorizontal
              className="h-4.5 w-4.5 text-blue-700 dark:text-blue-400"
              aria-hidden="true"
            />
            <div>
              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                Margem (Zona de Silêncio) e Redundância
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Margem: {style.margin} px · Nível de correção:{' '}
                {style.logoDataUrl ? 'H (Automático)' : style.errorCorrection}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              openSections.spacing ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {openSections.spacing && (
          <div id="accordion-spacing" className="px-5 pb-6 pt-1 sm:px-6 space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label
                  htmlFor="margin-slider"
                  className="font-medium text-slate-600 dark:text-slate-300"
                >
                  Espaçamento interno (Zona de silêncio)
                </label>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-100">
                  {style.margin} px
                </span>
              </div>
              <input
                id="margin-slider"
                type="range"
                min={0}
                max={48}
                step={2}
                value={style.margin}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    margin: Number(e.target.value),
                  }))
                }
                className="studio-range w-full bg-slate-200 dark:bg-slate-700"
              />
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Recomendado: entre <span className="font-mono">12 px</span> e{' '}
                <span className="font-mono">24 px</span> para facilitar o foco da câmera em superfícies impressas.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Nível de correção de erro (ECC)
                </span>
                {style.logoDataUrl && (
                  <span className="text-xs text-blue-700 dark:text-blue-400">
                    Travado em H devido à logo central
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ECC_OPTIONS.map((opt) => {
                  const effective = style.logoDataUrl ? 'H' : style.errorCorrection;
                  const active = effective === opt.id;
                  const disabled = Boolean(style.logoDataUrl) && opt.id !== 'H';
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => onChange((prev) => ({ ...prev, errorCorrection: opt.id }))}
                      className={`rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 ${
                        active
                          ? 'border-blue-600 bg-blue-50/70 text-blue-800 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0B0F17] dark:text-slate-300'
                      }`}
                    >
                      <span className="block text-xs font-semibold">{opt.label}</span>
                      <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        Recupera {opt.pct}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
