# 🔳 QR Code Studio Pro

Gerador profissional de QR Codes **100% gratuito e client-side** (todo o processamento ocorre localmente no navegador, sem envio de dados para servidores externos). Desenvolvido com foco em personalização visual avançada, validação automática de legibilidade e exportação pronta para uso digital ou impressão gráfica.

🔗 **Acesse o projeto online:** [guihcavalcante.github.io/qrcode-studio](https://guihcavalcante.github.io/qrcode-studio/)

---

## ✨ Funcionalidades

### 📋 Múltiplos Tipos de Conteúdo
- **Link / URL:** Validação automática com adição inteligente de protocolo (`https://`) quando omitido.
- **Texto Livre:** Suporte a mensagens, cupons e códigos com contador de caracteres em tempo real.
- **WhatsApp:** Geração automática de links `wa.me` com seleção de DDI, número com DDD e mensagem pré-definida codificada.
- **Wi-Fi:** Criação de credenciais padrão (`WIFI:T:WPA;...`) com suporte a redes WPA/WPA2/WPA3, WEP, abertas e redes ocultas (SSID).
- **PIX (Padrão Banco Central):**
  - *Por Chave PIX:* Gera o **BR Code EMV (QRCPS-MPM)** completo com cálculo automático de checksum **CRC-16/CCITT-FALSE**, valor opcional, recebedor, cidade e TxID.
  - *Copia e Cola:* Conversão direta de códigos PIX já gerados pelo banco.
- **vCard 3.0:** Cartão de visitas digital compatível com câmeras Android e iOS (nome, telefone, e-mail, empresa, cargo e site).

### 🎨 Personalização Visual Avançada
- **Cores e Gradientes:** Preenchimento em cor sólida ou gradiente (linear com controle de ângulo ou radial), além de paletas rápidas de alto contraste e opção de **fundo transparente**.
- **Geometria Customizável:** Escolha entre diferentes estilos de módulos/pontos (*Quadrado, Arredondado, Pontos, Elegante*) e cantos/olhos (*Quadrado, Arredondado extra, Ponto*).
- **Logo Central:** Upload via drag-and-drop ou seletor de arquivos (`PNG`, `JPG`, `SVG`, `WEBP`) com ajuste de proporção e elevação automática do nível de correção de erro (ECC) para **Máximo (H - 30%)**.
- **Zona de Silêncio (Margem):** Controle preciso do espaçamento interno ao redor do código.

### 🔍 Análise de Legibilidade e Exportação
- **Monitor de Contraste em Tempo Real:** Calcula a taxa de contraste (padrão WCAG) entre pontos e fundo, alertando sobre combinações de baixa leitura, QR Codes invertidos ou margens estreitas — com botão de correção automática em um clique.
- **Alta Resolução:** Exportação instantânea em **PNG**, **WEBP** (500×500px, 1000×1000px ou 2000×2000px) e **SVG** (vetorial infinito para gráficas).
- **Cópia Rápida:** Botão para copiar a imagem PNG diretamente para a área de transferência (`Ctrl+V`).
- **Tema Adaptável:** Alternância fluida entre **Modo Claro** e **Modo Escuro** com persistência local.

---

## 🛠️ Tecnologias Utilizadas

- **[React 19](https://react.dev)** + **[TypeScript](https://typescriptlang.org)**
- **[Vite](https://vite.dev)** (Build tool e servidor de desenvolvimento)
- **[Tailwind CSS v4](https://tailwindcss.com)** (Estilização responsiva e Dark Mode)
- **[qr-code-styling](https://github.com)** (Renderização SVG/Canvas customizada)
- **[Lucide React](https://lucide.dev)** (Iconografia)
- **GitHub Actions** (CI/CD com deploy automático no GitHub Pages)

---

## 🚀 Como rodar localmente

Caso queira clonar e executar o projeto na sua máquina:

```bash
# 1. Clone este repositório
git clone https://github.com

# 2. Acesse a pasta do projeto
cd qrcode-studio

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`.

### Scripts Disponíveis
- `npm run dev` — Inicia o ambiente de desenvolvimento.
- `npm run build` — Gera a versão otimizada para produção na pasta `dist/`.
- `npm run preview` — Visualiza localmente o build de produção.
- `npm run lint` — Executa a verificação de tipos com TypeScript.

---

## 👨‍💻 Autor

Desenvolvido por **Guilherme Hernandes Cavalcante**  
*Estudante do curso Técnico em Desenvolvimento de Sistemas — IFS Campus Tobias Barreto*

[![GitHub](https://shields.io)](https://github.com)
