# AutoTrace Mobile

Aplicativo mobile (Expo + React Native) para consumir a API AutoTrace. Ele oferece autenticação com JWT, gerenciamento de veículos, histórico de manutenções, geração/validação de certificados em PDF e resumo geral via dashboard.

## 🌱 Pré-requisitos

- Node.js 18+
- Expo CLI (`npx expo --version`)
- Backend AutoTrace em execução (ou URL acessível)

## ⚙️ Configuração

1. Copie o arquivo `.env.example` (se existir) ou crie um `.env` na raiz do app mobile definindo a variável abaixo. Para ambientes Expo, utilize o prefixo `EXPO_PUBLIC_`:

   ```bash
   echo "EXPO_PUBLIC_API_URL=http://localhost:3333" > .env
   ```

   > Em emuladores/dispositivos físicos substitua `localhost` pelo IP da máquina que executa a API.

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o app:

   ```bash
   npx expo start
   ```

   Use as teclas exibidas no terminal para abrir no Android, iOS ou web.

## 🧭 Fluxos implementados

- **Autenticação:** telas de login e cadastro; sessão persistida via `expo-secure-store`. Interceptação automática de respostas `401` encerra a sessão.
- **Dashboard:** resumo por veículo com total de manutenções, próxima revisão e status de atraso.
- **Veículos:** listagem, cadastro, detalhes com sugestões preventivas, upload de foto e histórico de manutenções.
- **Manutenções:** formulário com upload opcional de documento (PDF/imagem) usando `expo-document-picker`.
- **Certificados:** geração de PDF (com download + compartilhamento via `expo-file-system` / `expo-sharing`) e validação pública pelo ID.
- **Perfil:** exibe dados do usuário e permite encerrar a sessão.

## 📁 Estrutura principal

- `app/` – rotas file-based com Expo Router (segmentos `/(auth)` e `/(app)`).
- `contexts/auth-context.tsx` – provider de autenticação.
- `lib/api/*` – clientes Axios organizados por domínio (auth, veículos, dashboard, certificados).
- `lib/query-keys.ts` – chaves centralizadas para React Query.
- `providers/` – provedores globais (React Query + Auth).
- `constants/config.ts` – configuração de base (URL e chave de armazenamento do token).

## 🔌 Comunicação com a API

- Axios configurado em `lib/api/client.ts`, anexando token JWT automaticamente.
- React Query (`@tanstack/react-query`) para cache e revalidação.
- Uploads (foto/documento) enviados como `multipart/form-data`.
- Downloads de certificados salvos em cache local (`FileSystem.cacheDirectory`) e compartilháveis.

## ✅ Scripts úteis

- `npm run lint` – analisa o código com o ESLint da Expo.
- `npm run reset-project` – restaura o template base (não necessário após estrutura pronta).

## 📝 Observações

- Ajuste o valor de `EXPO_PUBLIC_API_URL` conforme o ambiente (dev, staging, produção).
- Para rodar em dispositivo físico, verifique se a API está acessível pela rede local e habilite HTTPS quando publicar.
- A camada visual usa estilos básicos; personalize conforme seu design system.

---

Qualquer dúvida ou melhoria, siga editando as rotas em `app/` e os serviços em `lib/api/`. Boas contribuições! 💜
