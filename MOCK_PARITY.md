# Paridade: API_SPEC × mock-api × mobile

Referência principal: `API_SPEC.md`. O mock (`mock-api/server.cjs` + `db.json`) implementa um subconjunto alinhado ao contrato; o app (`mobile`) usa `EXPO_PUBLIC_API_URL` quando configurado.

O `db.json` inclui seed para **cobranças do cliente**, **dados bancários do escritório**, **perfis** (cliente/advogado), **histórico de IA** e **histórico de importação**, além de contratos com parcelas e `relatoriosCache`, para evitar respostas vazias ou 404 durante o desenvolvimento.

| Rota (API_SPEC) | Mock (`server.cjs`) | Mobile (`resources.ts` / tela) |
|-----------------|---------------------|--------------------------------|
| `GET /relatorios/receita-despesa` | Sim, lê `relatoriosCache` | `fetchRelatorioReceitaDespesa` → `RelatoriosScreen` |
| `GET /relatorios/receita-categoria` | Sim | `fetchRelatorioReceitaCategoria` → `RelatoriosScreen` |
| `GET /relatorios/despesas-mes` | Sim | `fetchRelatorioDespesasMes` → `RelatoriosScreen` |
| `GET /relatorios/kpis` | Sim | `fetchRelatorioKpis` → `RelatoriosScreen` |
| `GET /relatorios/ranking-clientes` | Sim (`limit` opcional) | `fetchRelatorioRankingClientes` → `RelatoriosScreen` |
| `GET /relatorios/insights` | Sim (incl. `maioresClientes` extra no JSON) | `fetchRelatorioInsights` → `RelatoriosScreen` |
| `POST /ia/analise` | Sim, persiste em `iaHistorico` | `postIaAnalise` → `AssistenteIAScreen` |
| `GET /ia/historico` | Sim | `fetchIaHistorico` → `AssistenteIAScreen` |
| `GET /importacao/historico` | Sim (`importacaoHistorico`) | `fetchImportacaoHistorico` → `ImportacaoExportacaoScreen` |
| `POST /importacao/upload` | Sim (JSON stub `tipo`, `arquivoNome`) | `postImportacaoUpload` → `ImportacaoExportacaoScreen` |
| `GET /exportacao/transacoes` | Sim (CSV curto, `text/csv`) | `fetchExportacaoTransacoesCsv` → `ImportacaoExportacaoScreen` |
| `GET /pagamentos/pendentes` | Sim (`pagamentosParaConferir` filtrado) | `fetchPagamentosPendentes` → `PagamentosConferirScreen` |
| `PUT /pagamentos/:id/aprovar` | Sim | `updatePagamentoConferir` (status aprovado) |
| `PUT /pagamentos/:id/reprovar` | Sim (body `motivo`) | `updatePagamentoConferir` (status reprovado) |
| `GET /notificacoes` | Sim (envelope `total`, `naoLidas`, `notificacoes`) | `fetchNotificacoesAdvogado` → `NotificacoesScreen` |
| `PUT /notificacoes/:id/lida` | Sim | `putNotificacaoAdvLida` → `NotificacoesScreen` |
| `PUT /notificacoes/marcar-todas-lidas` | Sim | *(não usado no app; disponível no mock)* |
| `GET /cliente/dashboard` | Sim (objeto único §12; normaliza `ultimaCobranca`) | `fetchClienteDashboard` → `ClienteHomeScreen` |
| `PUT /cliente/notificacoes/:id/lida` | Sim | `putClienteNotificacaoLida` → `ClienteNotificacoesScreen` |

## Rotas ainda expostas só pelo json-server (REST)

Úteis para desenvolvimento; nem todas têm contrato formal no spec na mesma forma: `GET /dashboardResumo`, `PATCH /dashboardResumo/1`, `GET|PATCH /pagamentosParaConferir`, `GET /notificacoesAdvogado`, `GET /clienteDashboard`, `GET /notificacoesCliente`, etc. O app prefere as rotas da coluna esquerda quando o mock customizado está ativo.

## Checklist manual (rápido)

1. Subir mock: `cd mock-api && npm start`. No mobile, definir `EXPO_PUBLIC_API_URL` (ex.: `http://10.0.2.2:3000` no Android emulator).
2. **Advogado** (`advogado@softwave.com` / `123456`): login → Relatórios (gráficos/KPIs), Assistente IA (gerar + histórico), Importação/Exportação (lista + upload + export transações), Pagamentos a conferir (aprovar/reprovar), Notificações (marcar lida).
3. **Cliente** (`cliente@softwave.com` / `123456`): Home (dashboard §12), Notificações (toque marcar lida).
4. Reiniciar o mock recarrega `db.json` (estado volátil das escritas em disco depende do uso do json-server).
