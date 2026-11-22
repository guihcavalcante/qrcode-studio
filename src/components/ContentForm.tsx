import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Contact,
  Eye,
  EyeOff,
  FileText,
  Info,
  Link2,
  MessageCircle,
  QrCode,
  Wifi,
} from 'lucide-react';
import type {
  ContentTabId,
  PayloadResult,
  PixMode,
  QrContentState,
  WifiEncryption,
} from '../types/qr';

interface ContentFormProps {
  content: QrContentState;
  payload: PayloadResult;
  onChange: (updater: (prev: QrContentState) => QrContentState) => void;
}

const CONTENT_TABS: Array<{
  id: ContentTabId;
  label: string;
  icon: typeof Link2;
}> = [
  { id: 'url', label: 'Link / URL', icon: Link2 },
  { id: 'text', label: 'Texto', icon: FileText },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'pix', label: 'PIX', icon: QrCode },
  { id: 'vcard', label: 'vCard', icon: Contact },
];

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-[#0B0F17] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20';

const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5';

export function ContentForm({ content, payload, onChange }: ContentFormProps) {
  const [showWifiPassword, setShowWifiPassword] = useState(false);

  const setActiveTab = (tab: ContentTabId) => {
    onChange((prev) => ({ ...prev, activeTab: tab }));
  };

  return (
    <section
      id="conteudo"
      aria-labelledby="conteudo-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-[#121826]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2
            id="conteudo-heading"
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50"
          >
            1. Conteúdo do QR Code
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Escolha o tipo de dado e preencha os campos para atualizar em tempo real.
          </p>
        </div>
      </div>

      {/* Content Type Tabs */}
      <div
        role="tablist"
        aria-label="Tipo de conteúdo do QR Code"
        className="mt-5 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1.5 sm:grid-cols-3 lg:grid-cols-6 dark:bg-[#0B0F17]"
      >
        {CONTENT_TABS.map(({ id, label, icon: Icon }) => {
          const isActive = content.activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={isActive}
              aria-controls={`panel-${id}`}
              onClick={() => setActiveTab(id)}
              className={`flex h-10 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xs dark:bg-[#1B2438] dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div
        role="tabpanel"
        id={`panel-${content.activeTab}`}
        aria-labelledby={`tab-${content.activeTab}`}
        className="mt-5"
      >
        {content.activeTab === 'url' && (
          <div className="space-y-3">
            <div>
              <label htmlFor="qr-url-input" className={labelClass}>
                Endereço do site (URL)
              </label>
              <input
                id="qr-url-input"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://seusite.com.br"
                value={content.url.url}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, url: { url: e.target.value } }))
                }
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Validação automática: se você omitir <span className="font-mono">https://</span>, o protocolo será adicionado automaticamente.
              </p>
            </div>
          </div>
        )}

        {content.activeTab === 'text' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="qr-text-input" className={labelClass}>
                Texto livre ou mensagem
              </label>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {content.text.text.length} caracteres
              </span>
            </div>
            <textarea
              id="qr-text-input"
              rows={4}
              placeholder="Digite um texto, cupom promocional, código de acesso ou recado..."
              value={content.text.text}
              onChange={(e) =>
                onChange((prev) => ({ ...prev, text: { text: e.target.value } }))
              }
              className={`${inputClass} resize-y min-h-[104px]`}
            />
          </div>
        )}

        {content.activeTab === 'whatsapp' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="sm:col-span-3">
                <label htmlFor="wa-country" className={labelClass}>
                  DDI (País)
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-slate-400"
                  >
                    +
                  </span>
                  <input
                    id="wa-country"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="55"
                    value={content.whatsapp.countryCode}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        whatsapp: {
                          ...prev.whatsapp,
                          countryCode: e.target.value.replace(/\D/g, ''),
                        },
                      }))
                    }
                    className={`${inputClass} pl-7 font-mono`}
                  />
                </div>
              </div>
              <div className="sm:col-span-9">
                <label htmlFor="wa-phone" className={labelClass}>
                  Número com DDD
                </label>
                <input
                  id="wa-phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="(11) 99999-9999"
                  value={content.whatsapp.phone}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      whatsapp: { ...prev.whatsapp, phone: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="wa-message" className={labelClass}>
                Mensagem pré-definida <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <textarea
                id="wa-message"
                rows={3}
                placeholder="Olá! Vi o seu QR Code e gostaria de mais informações."
                value={content.whatsapp.message}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    whatsapp: { ...prev.whatsapp, message: e.target.value },
                  }))
                }
                className={`${inputClass} resize-y`}
              />
            </div>

            {payload.isValid && payload.normalizedPreview && (
              <div className="rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600 dark:bg-[#0B0F17] dark:text-slate-300">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Link gerado:{' '}
                </span>
                <span className="font-mono break-all text-blue-700 dark:text-blue-400">
                  {payload.normalizedPreview}
                </span>
              </div>
            )}
          </div>
        )}

        {content.activeTab === 'wifi' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="wifi-ssid" className={labelClass}>
                  Nome da rede (SSID)
                </label>
                <input
                  id="wifi-ssid"
                  type="text"
                  placeholder="Ex: Escritorio_5G"
                  value={content.wifi.ssid}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      wifi: { ...prev.wifi, ssid: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="wifi-encryption" className={labelClass}>
                  Tipo de segurança
                </label>
                <select
                  id="wifi-encryption"
                  value={content.wifi.encryption}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      wifi: {
                        ...prev.wifi,
                        encryption: e.target.value as WifiEncryption,
                      },
                    }))
                  }
                  className={inputClass}
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP (Legado)</option>
                  <option value="nopass">Sem senha (Rede aberta)</option>
                </select>
              </div>
            </div>

            {content.wifi.encryption !== 'nopass' && (
              <div>
                <label htmlFor="wifi-password" className={labelClass}>
                  Senha do Wi-Fi
                </label>
                <div className="relative">
                  <input
                    id="wifi-password"
                    type={showWifiPassword ? 'text' : 'password'}
                    placeholder="Digite a senha da rede"
                    value={content.wifi.password}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        wifi: { ...prev.wifi, password: e.target.value },
                      }))
                    }
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowWifiPassword((prev) => !prev)}
                    aria-label={showWifiPassword ? 'Ocultar senha' : 'Exibir senha'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 cursor-pointer"
                  >
                    {showWifiPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={content.wifi.hidden}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    wifi: { ...prev.wifi, hidden: e.target.checked },
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 dark:border-slate-600 dark:bg-[#0B0F17]"
              />
              <span>Esta é uma rede oculta (SSID não visível)</span>
            </label>
          </div>
        )}

        {content.activeTab === 'pix' && (
          <div className="space-y-4">
            {/* PIX Submode Selector */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-[#0B0F17]">
              {(
                [
                  { id: 'key', label: 'Gerar por Chave PIX' },
                  { id: 'copypaste', label: 'Código Copia e Cola' },
                ] as Array<{ id: PixMode; label: string }>
              ).map((option) => {
                const active = content.pix.mode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        pix: { ...prev.pix, mode: option.id },
                      }))
                    }
                    className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-[#1B2438] dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {content.pix.mode === 'copypaste' ? (
              <div>
                <label htmlFor="pix-copypaste" className={labelClass}>
                  Código PIX Copia e Cola (BR Code)
                </label>
                <textarea
                  id="pix-copypaste"
                  rows={4}
                  placeholder="00020126580014BR.GOV.BCB.PIX0136..."
                  value={content.pix.copyPasteCode}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      pix: { ...prev.pix, copyPasteCode: e.target.value },
                    }))
                  }
                  className={`${inputClass} font-mono text-xs resize-y`}
                />
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  Cole exatamente o código gerado pelo aplicativo do seu banco.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="pix-key" className={labelClass}>
                    Chave PIX (CPF, CNPJ, E-mail, Telefone +55... ou Aleatória)
                  </label>
                  <input
                    id="pix-key"
                    type="text"
                    placeholder="Ex: pagamentos@suaempresa.com.br"
                    value={content.pix.pixKey}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        pix: { ...prev.pix, pixKey: e.target.value },
                      }))
                    }
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pix-merchant" className={labelClass}>
                      Nome do recebedor
                    </label>
                    <input
                      id="pix-merchant"
                      type="text"
                      maxLength={25}
                      placeholder="Ex: Joao Silva"
                      value={content.pix.merchantName}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          pix: { ...prev.pix, merchantName: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="pix-city" className={labelClass}>
                      Cidade
                    </label>
                    <input
                      id="pix-city"
                      type="text"
                      maxLength={15}
                      placeholder="Ex: Sao Paulo"
                      value={content.pix.merchantCity}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          pix: { ...prev.pix, merchantCity: e.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pix-amount" className={labelClass}>
                      Valor em R$ <span className="font-normal text-slate-400">(opcional)</span>
                    </label>
                    <input
                      id="pix-amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex: 49,90"
                      value={content.pix.amount}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          pix: { ...prev.pix, amount: e.target.value },
                        }))
                      }
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                  <div>
                    <label htmlFor="pix-txid" className={labelClass}>
                      Identificador / TxID{' '}
                      <span className="font-normal text-slate-400">(opcional)</span>
                    </label>
                    <input
                      id="pix-txid"
                      type="text"
                      maxLength={25}
                      placeholder="Ex: PEDIDO102"
                      value={content.pix.txId}
                      onChange={(e) =>
                        onChange((prev) => ({
                          ...prev,
                          pix: { ...prev.pix, txId: e.target.value },
                        }))
                      }
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gera automaticamente um BR Code padrão Banco Central (EMV QRCPS-MPM com CRC-16). Para telefones, inclua o formato <span className="font-mono">+5511999999999</span>.
                </p>

                {payload.isValid && payload.normalizedPreview && (
                  <div className="rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600 dark:bg-[#0B0F17] dark:text-slate-300">
                    <span className="block font-medium text-slate-700 dark:text-slate-200 mb-1">
                      BR Code EMV gerado (Copia e Cola):
                    </span>
                    <span className="font-mono text-[11px] break-all text-blue-700 dark:text-blue-400">
                      {payload.normalizedPreview}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {content.activeTab === 'vcard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vcard-first" className={labelClass}>
                  Nome
                </label>
                <input
                  id="vcard-first"
                  type="text"
                  placeholder="Ex: Mariana"
                  value={content.vcard.firstName}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vcard: { ...prev.vcard, firstName: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="vcard-last" className={labelClass}>
                  Sobrenome
                </label>
                <input
                  id="vcard-last"
                  type="text"
                  placeholder="Ex: Costa"
                  value={content.vcard.lastName}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vcard: { ...prev.vcard, lastName: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vcard-phone" className={labelClass}>
                  Telefone / Celular
                </label>
                <input
                  id="vcard-phone"
                  type="tel"
                  placeholder="+55 11 98765-4321"
                  value={content.vcard.phone}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vcard: { ...prev.vcard, phone: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="vcard-email" className={labelClass}>
                  E-mail
                </label>
                <input
                  id="vcard-email"
                  type="email"
                  placeholder="contato@empresa.com.br"
                  value={content.vcard.email}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vcard: { ...prev.vcard, email: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vcard-company" className={labelClass}>
                  Empresa / Organização
                </label>
                <input
                  id="vcard-company"
                  type="text"
                  placeholder="Ex: Studio Design Ltda"
                  value={content.vcard.company}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vcard: { ...prev.vcard, company: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="vcard-title" className={labelClass}>
                  Cargo <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <input
                  id="vcard-title"
                  type="text"
                  placeholder="Ex: Diretora de Criação"
                  value={content.vcard.title}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      vcard: { ...prev.vcard, title: e.target.value },
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="vcard-website" className={labelClass}>
                Site / Portfólio <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <input
                id="vcard-website"
                type="url"
                placeholder="https://seusite.com.br"
                value={content.vcard.website}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    vcard: { ...prev.vcard, website: e.target.value },
                  }))
                }
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Inline Validation / Info feedback */}
        {payload.error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{payload.error}</span>
          </div>
        )}

        {!payload.error && payload.warning && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{payload.warning}</span>
          </div>
        )}

        {!payload.error && !payload.warning && payload.isValid && content.activeTab === 'url' && (
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>URL válida e pronta para leitura imediata.</span>
          </div>
        )}
      </div>
    </section>
  );
}
