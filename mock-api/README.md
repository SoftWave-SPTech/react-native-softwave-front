# Mock API (JSON Server)

Use este servidor para testar o app mobile antes do backend real.

## Instalação e execução

```bash
cd mock-api
npm install
npm start
```

O servidor sobe na porta **3000** (ou a variável `PORT`).

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/login` | Body JSON: `{ "email", "senha" }` — mesmos usuários do mock local do app |
| `GET`  | `/usuarios` | Lista usuários (apenas dev) |
| `GET`  | `/transacoes` | Transações |
| `GET`  | `/contratos` | Contratos |
| `GET`  | `/dashboardResumo` | Resumo do dashboard (array com 1 item) |
| `GET`  | `/notificacoesAdvogado` | Notificações do advogado |
| `GET`  | `/notificacoesCliente` | Notificações do cliente |
| `GET`  | `/clienteDashboard` | Dashboard do cliente |

Credenciais de teste (em `db.json`):

- **Advogado:** `advogado@softwave.com` / `123456`
- **Cliente:** `cliente@softwave.com` / `123456`

## URL no app (Expo / React Native)

- **Emulador Android:** `http://10.0.2.2:3000`
- **Simulador iOS:** `http://localhost:3000`
- **Celular físico (mesma Wi‑Fi):** `http://<IP_DA_SUA_MAQUINA>:3000` (ex.: `http://192.168.1.15:3000`)

No projeto `mobile`, crie um arquivo `.env` na raiz do app (veja `.env.example`) com:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.15:3000
```

Reinicie o Metro (`npx expo start -c`) após alterar `.env`.

Se `EXPO_PUBLIC_API_URL` não estiver definida, o login continua **100% mock local** (sem rede).

## Já consumido pelo app (quando a URL está ativa)

- **Login:** `POST /auth/login`
- **Home (advogado):** `GET /dashboardResumo`, `GET /transacoes?_sort=ordem&_order=desc&_limit=4`
- **Transações:** `GET /transacoes?_sort=ordem&_order=desc`
- **Notificações (advogado):** `GET /notificacoesAdvogado`, `PATCH /notificacoesAdvogado/:id` com `{ "lida": true }`
- **Home (cliente):** `GET /clienteDashboard`
- **Notificações (cliente):** `GET /notificacoesCliente`
