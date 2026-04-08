# Mock API (JSON Server)

Use este servidor para testar o app mobile antes do backend real. Parte das rotas segue o **`API_SPEC.md`** na raiz do repositório.

## Instalação e execução

```bash
cd mock-api
npm install
npm start
```

O servidor sobe na porta **3000** (ou a variável `PORT`).

## Prioridade (telas × especificação)

| Prioridade | Telas no mobile | Rotas do `API_SPEC` cobertas no mock |
|------------|-----------------|--------------------------------------|
| **P1** | Detalhe do contrato, parcelas | `GET /contratos/:id`, `GET /contratos/:id/parcelas`, `PATCH /parcelas/:id`, `POST /parcelas/:id/gerar-cobranca` |
| **P1** | Cobranças cliente, Pagamento (PIX/dados bancários) | `GET /cliente/cobrancas`, `GET /cobrancas/:id`, `GET /cobrancas/:id/pix`, `GET /escritorio/dados-bancarios` |
| **P2** | Perfil cliente, Perfil escritório | `GET /cliente/perfil`, `GET /perfil` |
| **P2** | Esqueci senha (e-mail) | `POST /auth/esqueci-senha` |
| **P3** | Relatórios | `GET /relatorios/*` (seed em `relatoriosCache`) |
| **P3** | Assistente IA | `POST /ia/analise`, `GET /ia/historico` (`iaHistorico`) |
| **P3** | Importação / exportação | `POST /importacao/upload`, `GET /importacao/historico`, `GET /exportacao/transacoes` |

> Paridade documentada em `MOCK_PARITY.md` na raiz do repositório.

## Endpoints principais

### Já existentes (json-server REST)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/login` | Body: `{ "email", "senha" }` |
| `GET` | `/transacoes`, `/contratos`, `/parcelas`, `/cobrancas`, … | CRUD parcial conforme `db.json` |
| `GET` | `/dashboardResumo`, `/notificacoesAdvogado`, `/notificacoesCliente`, `/clienteDashboard`, … | |

### Customizados no `server.cjs` (alinhados ao API_SPEC)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/esqueci-senha` | Body: `{ "email" }` — resposta mock de sucesso |
| `GET` | `/contratos/:id/parcelas` | Retorno `{ "parcelas": [...] }` |
| `POST` | `/parcelas/:id/gerar-cobranca` | Stub de cobrança |
| `GET` | `/cliente/cobrancas` | Query opcional `?status=pendente\|pago` — **Bearer cliente** |
| `GET` | `/cobrancas/:id` | Detalhe da cobrança |
| `GET` | `/cobrancas/:id/pix` | PIX copia-e-cola mock |
| `GET` | `/escritorio/dados-bancarios` | Dados para transferência |
| `GET` | `/cliente/perfil` | **Bearer cliente** |
| `GET` | `/perfil` | **Bearer advogado** |
| `GET` | `/relatorios/receita-despesa`, `receita-categoria`, `despesas-mes`, `kpis`, `ranking-clientes`, `insights` | **Bearer advogado** |
| `POST` | `/ia/analise` | **Bearer advogado** |
| `GET` | `/ia/historico` | **Bearer advogado** |
| `GET` | `/importacao/historico` | **Bearer advogado** |
| `POST` | `/importacao/upload` | **Bearer advogado** (JSON com `tipo`, `arquivoNome`) |
| `GET` | `/exportacao/transacoes?formato=csv` | **Bearer advogado** (resposta CSV) |
| `GET` | `/pagamentos/pendentes` | **Bearer advogado** |
| `PUT` | `/pagamentos/:id/aprovar`, `/pagamentos/:id/reprovar` | **Bearer advogado** |
| `GET` | `/notificacoes` | **Bearer advogado** |
| `PUT` | `/notificacoes/:id/lida`, `/notificacoes/marcar-todas-lidas` | **Bearer advogado** |
| `GET` | `/cliente/dashboard` | **Bearer cliente** |
| `PUT` | `/cliente/notificacoes/:id/lida` | **Bearer cliente** |

## Credenciais (`db.json`)

- **Advogado:** `advogado@softwave.com` / `123456`
- **Cliente:** `cliente@softwave.com` / `123456`

## URL no app (Expo)

- **Emulador Android:** `http://10.0.2.2:3000`
- **Simulador iOS:** `http://localhost:3000`
- **Celular (mesma Wi‑Fi):** `http://<IP_DA_MAQUINA>:3000`

No `mobile`, use `.env` com `EXPO_PUBLIC_API_URL` e reinicie o Metro (`npx expo start -c`).

## Parcelas e persistência

As parcelas estão em `parcelas` no `db.json`. O app pode usar **`PATCH /parcelas/:id`** (json-server) com body `{ "status": "pago" }` para atualizar; reiniciar o mock recarrega o arquivo original.
