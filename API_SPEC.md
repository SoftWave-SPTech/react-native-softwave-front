# API Specification — Softwave

> Documento de referência para o backend. Todos os endpoints, modelos de dados e exemplos de retorno necessários para integrar o aplicativo mobile.

---

## Sumário

1. [Autenticação](#1-autenticação)
2. [Dashboard — Advogado](#2-dashboard--advogado)
3. [Transações](#3-transações)
4. [Contratos / Honorários](#4-contratos--honorários)
5. [Pagamentos a Conferir](#5-pagamentos-a-conferir)
6. [Relatórios](#6-relatórios)
7. [Notificações — Advogado](#7-notificações--advogado)
8. [Assistente IA](#8-assistente-ia)
9. [Importação & Exportação](#9-importação--exportação)
10. [Perfil do Escritório](#10-perfil-do-escritório)
11. [Clientes](#11-clientes)
12. [Dashboard — Cliente](#12-dashboard--cliente)
13. [Cobranças — Cliente](#13-cobranças--cliente)
14. [Notificações — Cliente](#14-notificações--cliente)
15. [Perfil — Cliente](#15-perfil--cliente)
16. [Modelos de Dados Completos](#16-modelos-de-dados-completos)

---

## Convenções

- **Base URL:** `https://api.softwave.com.br/v1`
- **Autenticação:** `Bearer <token>` no header `Authorization`
- **IDs externos (string):** `txn_`, `pag_`, `ntf_`, `cob_`, `cli_`, `ctr_`, `proc_`
- **Status financeiros oficiais:** `pendente`, `atrasado`, `pago`, `cancelado`
- **Datas:** formato ISO 8601 — `YYYY-MM-DD` ou `YYYY-MM-DDTHH:mm:ssZ`
- **Valores monetários:** `number` em centavos (ex: `600000` = R$ 6.000,00) **ou** `string` formatada (definir padrão no backend)
- **Status HTTP:** `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `422 Unprocessable Entity`, `500 Internal Server Error`

---

## 1. Autenticação

### `POST /auth/login`
Login do usuário (advogado ou cliente).

**Request Body:**
```json
{
  "email": "contato@silvaassociados.com.br",
  "senha": "minhasenha123"
}
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expiresIn": 86400,
  "usuario": {
    "id": "usr_123",
    "nome": "Silva & Associados",
    "email": "contato@silvaassociados.com.br",
    "tipo": "advogado",
    "fotoPerfil": "https://storage.softwave.com.br/fotos/usr_123.jpg"
  }
}
```

> `tipo` pode ser `"advogado"` ou `"cliente"`. O app usa esse campo para redirecionar para o fluxo correto.

---

### `POST /auth/esqueci-senha`
Envia código de recuperação por e-mail.

**Request Body:**
```json
{ "email": "contato@silvaassociados.com.br" }
```

**Response `200`:**
```json
{ "mensagem": "Código enviado para o e-mail informado." }
```

---

### `POST /auth/validar-token`
Valida o código OTP de 6 dígitos.

**Request Body:**
```json
{
  "email": "contato@silvaassociados.com.br",
  "token": "482910"
}
```

**Response `200`:**
```json
{ "valido": true, "resetToken": "reset_abc123xyz" }
```

---

### `POST /auth/redefinir-senha`
Redefine a senha usando o `resetToken` retornado acima.

**Request Body:**
```json
{
  "resetToken": "reset_abc123xyz",
  "novaSenha": "novaSenha456"
}
```

**Response `200`:**
```json
{ "mensagem": "Senha redefinida com sucesso." }
```

---

### `POST /auth/logout`
Invalida o token atual.

**Response `200`:**
```json
{ "mensagem": "Logout realizado com sucesso." }
```

---

## 2. Dashboard — Advogado

### `GET /dashboard/resumo`
Retorna os KPIs exibidos na Home do advogado.

**Query params:** `?periodo=mes` _(opcional — `semana | mes | ano`, padrão: `mes`)_

**Response `200`:**
```json
{
  "valorDisponivel": 14528000,
  "lucroLiquidoMes": 4250000,
  "receitaMensal": 8540000,
  "despesaMensal": 4290000,
  "pendentes": 2830000,
  "variacaoReceita": "+12%",
  "variacaoDespesa": "-5%",
  "variacaoLucro": "+8%",
  "pagamentosParaConferir": 3
}
```

---

### `GET /dashboard/transacoes-recentes`
Retorna as últimas transações para exibir na Home.

**Query params:** `?limit=3`

**Response `200`:**
```json
{
  "transacoes": [
    {
      "id": "txn_001",
      "titulo": "Honorários - Processo 1234",
      "subtitulo": "João Silva",
      "valor": 500000,
      "tipo": "receita",
      "status": "pago",
      "categoria": "honorarios",
      "data": "2026-03-10"
    }
  ]
}
```

---

### `GET /dashboard/insights`
Retorna insights gerados pela IA para a Home.

**Response `200`:**
```json
{
  "insights": [
    "Receita cresceu 12% em relação ao mês anterior.",
    "3 clientes com pagamentos atrasados há mais de 15 dias.",
    "Margem de lucro melhorou para 49.8% — acima da meta."
  ]
}
```

---

## 3. Transações

### `GET /transacoes`
Lista todas as transações com filtros.

**Query params:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `tipo` | `receita \| despesa` | Filtro por tipo |
| `status` | `pago \| pendente \| atrasado \| cancelado` | Filtro por status |
| `busca` | `string` | Busca por título ou cliente |
| `dataInicio` | `YYYY-MM-DD` | Filtro de data inicial |
| `dataFim` | `YYYY-MM-DD` | Filtro de data final |
| `page` | `number` | Paginação (padrão: 1) |
| `limit` | `number` | Itens por página (padrão: 20) |

**Response `200` (consumido pelo mobile):**
```json
[
  {
    "id": "txn_001",
    "titulo": "Honorários - Processo 1234",
    "subtitulo": "João Silva",
    "valor": 500000,
    "tipo": "receita",
    "status": "pago",
    "categoria": "honorarios",
    "clienteId": "cli_001",
    "processoId": "proc_001",
    "data": "2026-03-10",
    "vencimento": "2026-03-15",
    "icone": "cash"
  }
]
```

---

### `GET /transacoes/:id`
Retorna os detalhes completos de uma transação.

**Response `200`:**
```json
{
  "id": "txn_001",
  "tipo": "receita",
  "titulo": "Honorários - Processo 1234",
  "valor": 500000,
  "status": "pago",
  "categoria": "honorarios",
  "cliente": "João Silva",
  "clienteId": "cli_001",
  "processo": "Proc. 1234/2025",
  "processoId": "proc_001",
  "data": "2026-03-10",
  "vencimento": "2026-03-15",
  "dataPagamento": "2026-03-12",
  "metodoPagamento": "PIX",
  "descricao": "Honorários referentes ao mês de março.",
  "observacoes": "Pagamento confirmado via sistema.",
  "comprovante": true,
  "comprovanteUrl": "https://storage.softwave.com.br/comprovantes/txn_001.jpg",
  "criadoEm": "2026-03-01T10:00:00Z",
  "atualizadoEm": "2026-03-12T14:30:00Z"
}
```

---

### `POST /transacoes`
Cria uma nova transação.

**Request Body:**
```json
{
  "tipo": "receita",
  "valor": 500000,
  "categoria": "honorarios",
  "descricao": "Honorários referentes ao mês de março.",
  "clienteId": "cli_001",
  "processoId": "proc_001",
  "data": "2026-03-10",
  "vencimento": "2026-03-15",
  "status": "pendente",
  "recorrencia": "sem",
  "duracaoMeses": null
}
```

**Response `201`:**
```json
{ "id": "txn_novo", "mensagem": "Transação criada com sucesso." }
```

---

### `PATCH /transacoes/:id`
Edita uma transação existente (atualização parcial).

**Request Body:** campos parciais do formato do `POST /transacoes`

**Response `200`:**
```json
{ "mensagem": "Transação atualizada com sucesso." }
```

---

### `PUT /transacoes/:id/status`
Altera apenas o status da transação.

**Request Body:**
```json
{ "status": "pago" }
```

**Response `200`:**
```json
{ "mensagem": "Status atualizado.", "novoStatus": "pago" }
```

---

### `DELETE /transacoes/:id`
Exclui uma transação.

**Response `200`:**
```json
{ "mensagem": "Transação excluída com sucesso." }
```

---

### `POST /transacoes/:id/comprovante`
Upload do comprovante de uma transação.

**Request:** `multipart/form-data`
| Campo | Tipo |
|---|---|
| `arquivo` | `File` (jpg, png, pdf) |

**Response `200`:**
```json
{
  "mensagem": "Comprovante enviado com sucesso.",
  "comprovanteUrl": "https://storage.softwave.com.br/comprovantes/txn_001.jpg"
}
```

---

## 4. Contratos / Honorários

### `GET /contratos`
Lista os contratos com filtros.

**Query params:**
| Parâmetro | Tipo | Descrição |
|---|---|---|
| `status` | `ativo \| encerrado` | Filtro por situação |
| `clienteId` | `string` | Filtro por cliente |

**Response `200`:**
```json
{
  "resumo": {
    "totalRecebido": 3000000,
    "aReceber": 2500000
  },
  "contratos": [
    {
      "id": "ctr_001",
      "clienteId": "cli_001",
      "cliente": "João Silva",
      "processo": "Proc. 1234/2025",
      "tipoContrato": "Êxito",
      "status": "pendente",
      "progresso": 60,
      "vencimento": "2026-03-15",
      "total": 2500000,
      "pago": 1500000,
      "encerrado": false,
      "reprovado": false
    }
  ]
}
```

---

### `GET /contratos/:id`
Detalhes completos de um contrato.

**Response `200`:**
```json
{
  "id": "ctr_001",
  "clienteId": "cli_001",
  "cliente": "João Silva",
  "processo": "Proc. 1234/2025",
  "tipoContrato": "Êxito",
  "status": "pendente",
  "progresso": 60,
  "total": 2500000,
  "pago": 1500000,
  "vencimento": "2026-03-15",
  "encerrado": false,
  "reprovado": false,
  "descricao": "Contrato de honorários por êxito na ação cível.",
  "criadoEm": "2025-02-01T09:00:00Z"
}
```

---

### `GET /contratos/:id/parcelas`
Lista as parcelas de um contrato.

**Response `200`:**
```json
{
  "parcelas": [
    {
      "id": "par_001",
      "numero": 1,
      "valor": 500000,
      "vencimento": "2026-01-15",
      "status": "pago"
    },
    {
      "id": "par_002",
      "numero": 2,
      "valor": 500000,
      "vencimento": "2026-02-15",
      "status": "pago"
    },
    {
      "id": "par_003",
      "numero": 3,
      "valor": 500000,
      "vencimento": "2026-03-15",
      "status": "pendente"
    }
  ]
}
```

---

### `PATCH /parcelas/:id`
Atualiza status de uma parcela.

**Request Body:**
```json
{ "status": "pago" }
```

**Response `200`:**
```json
{ "mensagem": "Parcela atualizada com sucesso." }
```

---

### `POST /parcelas/:id/gerar-cobranca`
Dispara uma cobrança ao cliente referente a uma parcela.

**Response `200`:**
```json
{
  "mensagem": "Cobrança gerada e enviada ao cliente.",
  "cobrancaId": "cob_001"
}
```

---

## 5. Pagamentos a Conferir

### `GET /pagamentos/pendentes`
Lista os pagamentos submetidos pelos clientes aguardando aprovação.

**Response `200`:**
```json
{
  "total": 3,
  "pagamentos": [
    {
      "id": "pag_001",
      "clienteId": "cli_001",
      "cliente": "João Silva",
      "processo": "Proc. 1234/2025",
      "valor": 600000,
      "data": "2026-03-08",
      "comprovanteUrl": "https://storage.softwave.com.br/comprovantes/pag_001.jpg"
    }
  ]
}
```

---

### `PUT /pagamentos/:id/aprovar`
Aprova um pagamento submetido pelo cliente.

**Response `200`:**
```json
{ "mensagem": "Pagamento aprovado com sucesso." }
```

---

### `PUT /pagamentos/:id/reprovar`
Reprova um pagamento com motivo.

**Request Body:**
```json
{ "motivo": "Comprovante ilegível. Solicite o envio novamente." }
```

**Response `200`:**
```json
{ "mensagem": "Pagamento reprovado. Cliente será notificado." }
```

---

## 6. Relatórios

### `GET /relatorios/receita-despesa`
Dados para o gráfico de linha Receita vs Despesa.

**Query params:** `?periodo=mes` _(semana | mes | ano)_

**Response `200`:**
```json
{
  "labels": ["Jan", "Fev", "Mar"],
  "receita": [6500000, 7200000, 8500000],
  "despesa": [3800000, 4200000, 3500000]
}
```

---

### `GET /relatorios/receita-categoria`
Dados para o gráfico de pizza por categoria.

**Query params:** `?periodo=mes`

**Response `200`:**
```json
{
  "categorias": [
    { "nome": "Honorários", "valor": 6500000, "percentual": 65 },
    { "nome": "Consultoria", "valor": 2000000, "percentual": 20 },
    { "nome": "Outros", "valor": 1500000, "percentual": 15 }
  ]
}
```

---

### `GET /relatorios/despesas-mes`
Dados para o gráfico de barras de despesas mensais.

**Query params:** `?periodo=mes`

**Response `200`:**
```json
{
  "labels": ["Jan", "Fev", "Mar"],
  "despesas": [1580000, 1850000, 1220000]
}
```

---

### `GET /relatorios/kpis`
KPIs calculados para o painel de relatórios.

**Query params:** `?periodo=mes`

**Response `200`:**
```json
{
  "margemLucro": { "valor": "49.8%", "variacao": "+2.3%", "tipo": "positivo" },
  "ticketMedio": { "valor": 854000, "variacao": "+5%", "tipo": "positivo" },
  "inadimplencia": { "valor": "12%", "variacao": "-3%", "tipo": "positivo" },
  "crescimento": { "valor": "15%", "variacao": "+8%", "tipo": "positivo" }
}
```

---

### `GET /relatorios/ranking-clientes`
Ranking dos maiores clientes por receita gerada.

**Query params:** `?periodo=mes&limit=5`

**Response `200`:**
```json
{
  "clientes": [
    { "id": "cli_001", "nome": "João Silva", "valor": 2500000 },
    { "id": "cli_002", "nome": "Maria Santos", "valor": 1800000 },
    { "id": "cli_003", "nome": "Carlos Oliveira", "valor": 1200000 }
  ]
}
```

---

### `GET /relatorios/insights`
Insights gerados pela IA para cada gráfico.

**Query params:** `?periodo=mes`

**Response `200`:**
```json
{
  "linha": [
    "Receita cresceu 30% em 3 meses — ritmo acima da média do setor.",
    "Despesas caíram 8% de Fev para Mar, indicando controle de custos.",
    "Margem líquida melhorou de 41% para 59% no período analisado."
  ],
  "pizza": [
    "Honorários representam 65% da receita total — alta dependência.",
    "Consultoria tem margem maior que honorários — potencial de crescimento."
  ],
  "barra": [
    "Janeiro foi o mês mais caro em despesas.",
    "Redução de 34% nas despesas de Fev para Mar — tendência positiva."
  ]
}
```

---

## 7. Notificações — Advogado

### `GET /notificacoes`
Lista as notificações do advogado.

**Query params:** `?page=1&limit=20`

**Response `200`:**
```json
{
  "total": 7,
  "naoLidas": 3,
  "notificacoes": [
    {
      "id": "ntf_001",
      "tipo": "pagamento",
      "titulo": "Pagamento Recebido",
      "mensagem": "João Silva realizou o pagamento da parcela 3.",
      "data": "2026-03-10T14:30:00Z",
      "lida": false
    },
    {
      "id": "ntf_002",
      "tipo": "alerta",
      "titulo": "Vencimento Próximo",
      "mensagem": "Parcela de Maria Santos vence em 2 dias.",
      "data": "2026-03-09T09:00:00Z",
      "lida": false
    }
  ]
}
```

> `tipo` aceita: `pagamento | alerta | sucesso | lembrete | insight`

---

### `PUT /notificacoes/:id/lida`
Marca uma notificação específica como lida.

**Response `200`:**
```json
{ "mensagem": "Notificação marcada como lida." }
```

---

### `PUT /notificacoes/marcar-todas-lidas`
Marca todas as notificações como lidas.

**Response `200`:**
```json
{ "mensagem": "Todas as notificações foram marcadas como lidas." }
```

---

## 8. Assistente IA

### `POST /ia/analise`
Solicita uma análise da IA com base no tipo e período informados.

**Request Body:**
```json
{
  "tipoAnalise": "receita-despesa",
  "dataInicio": "2026-01-01",
  "dataFim": "2026-03-31"
}
```

> `tipoAnalise` aceita: `receita-despesa | receita-categoria | despesa-categoria | maiores-clientes | margem-lucro | inadimplencia`

**Response `200`:**
```json
{
  "id": "ia_001",
  "tipoAnalise": "receita-despesa",
  "periodo": "Jan/2026 – Mar/2026",
  "resposta": "No período analisado, sua receita cresceu 30% enquanto as despesas caíram 8%. A margem líquida evoluiu de 41% para 59%, indicando excelente controle financeiro. Recomendo manter o padrão de captação de novos clientes para sustentar o crescimento.",
  "geradoEm": "2026-03-10T15:00:00Z"
}
```

---

### `GET /ia/historico`
Retorna o histórico de análises geradas.

**Query params:** `?tipo=&page=1&limit=20`

**Response `200`:**
```json
{
  "total": 12,
  "historico": [
    {
      "id": "ia_001",
      "tipoAnalise": "receita-despesa",
      "periodo": "Jan/2026 – Mar/2026",
      "resposta": "No período analisado...",
      "geradoEm": "2026-03-10T15:00:00Z"
    }
  ]
}
```

---

## 9. Importação & Exportação

### `POST /importacao/upload`
Envia referência de arquivo para importação de extrato bancário (fluxo atual da UI).

**Request:** `application/json`
| Campo | Tipo | Descrição |
|---|---|---|
| `tipo` | `extrato_c6 \| extrato_bradesco \| extrato_itau` | Banco/layout do extrato |
| `arquivoNome` | `string` | Nome do arquivo selecionado |

> Regras de formato no UI:
> - `extrato_c6`: somente **CSV**
> - `extrato_bradesco`: somente **CSV**
> - `extrato_itau`: somente **PDF**

**Response `200`:**
```json
{
  "id": "imp_001",
  "mensagem": "Arquivo recebido. Processamento iniciado.",
  "status": "processando"
}
```

---

### `GET /importacao/historico`
Lista o histórico de importações realizadas.

**Response `200`:**
```json
{
  "importacoes": [
    {
      "id": "imp_001",
      "tipo": "extrato_bradesco",
      "arquivo": "extrato_bradesco_fev2026.csv",
      "data": "2026-03-01T10:00:00Z",
      "status": "concluido",
      "registros": 45,
      "novos": 38,
      "atualizados": 5,
      "erros": 2
    }
  ]
}
```

> `status` aceita: `pendente | processando | concluido | erro`

---

### `GET /exportacao/transacoes`
Download das transações.

**Query params (consumido pelo mobile):** `?formato=csv`

**Response `200`:** arquivo binário com header `Content-Disposition: attachment; filename="transacoes.csv"`

---

### `GET /exportacao/honorarios`
Download dos honorários/contratos.

**Response `200`:** arquivo binário (CSV ou XLSX).

---

### `GET /exportacao/clientes`
Download da lista de clientes.

**Response `200`:** arquivo binário (CSV ou XLSX).

---

### `GET /exportacao/backup-completo`
Download do backup completo do sistema.

**Response `200`:** arquivo `.zip` com todos os dados.

---

## 10. Perfil do Escritório

### `GET /perfil`
Retorna os dados do escritório/advogado autenticado.

**Response `200`:**
```json
{
  "id": "usr_123",
  "nome": "Silva & Associados",
  "email": "contato@silvaassociados.com.br",
  "telefone": "(11) 3456-7890",
  "oab": "OAB/SP 123.456",
  "endereco": "Av. Paulista, 1000 - São Paulo/SP",
  "fotoPerfil": "https://storage.softwave.com.br/fotos/usr_123.jpg",
  "dadosBancarios": {
    "banco": "Banco do Brasil",
    "agencia": "1234-5",
    "conta": "67890-1",
    "favorecido": "Silva & Associados",
    "cnpj": "12.345.678/0001-90"
  }
}
```

---

### `PUT /perfil`
Atualiza os dados do escritório.

**Request Body:**
```json
{
  "nome": "Silva & Associados",
  "email": "contato@silvaassociados.com.br",
  "telefone": "(11) 3456-7890",
  "oab": "OAB/SP 123.456",
  "endereco": "Av. Paulista, 1000 - São Paulo/SP"
}
```

**Response `200`:**
```json
{ "mensagem": "Perfil atualizado com sucesso." }
```

---

### `POST /perfil/foto`
Upload da foto de perfil do escritório.

**Request:** `multipart/form-data`
| Campo | Tipo |
|---|---|
| `foto` | `File` (jpg, png) |

**Response `200`:**
```json
{
  "mensagem": "Foto atualizada com sucesso.",
  "fotoUrl": "https://storage.softwave.com.br/fotos/usr_123_novo.jpg"
}
```

---

## 11. Clientes

### `GET /clientes`
Lista todos os clientes do escritório (usado em filtros e selects).

**Query params:** `?busca=&page=1&limit=50`

**Response `200`:**
```json
{
  "total": 12,
  "clientes": [
    {
      "id": "cli_001",
      "nome": "João Silva",
      "email": "joao.silva@email.com",
      "telefone": "(11) 98765-4321",
      "cpf": "123.456.789-00",
      "clienteDesde": "2024-02-01"
    }
  ]
}
```

---

## 12. Dashboard — Cliente

### `GET /cliente/dashboard`
Retorna os dados da Home do cliente.

**Response `200`:**
```json
{
  "nome": "João Silva",
  "totalPago": 1500000,
  "totalPendente": 1000000,
  "totalContrato": 2500000,
  "percentualPago": 60,
  "parcelasRestantes": 3,
  "notificacoesNaoLidas": 2,
  "ultimaCobranca": {
    "id": "cob_003",
    "descricao": "Parcela 3/4",
    "vencimento": "2026-03-15",
    "valor": 600000,
    "status": "pendente"
  }
}
```

---

## 13. Cobranças — Cliente

### `GET /cliente/cobrancas`
Lista as cobranças do cliente logado.

**Query params:** `?status=pendente|pago`

**Response `200`:**
```json
{
  "cobrancas": [
    {
      "id": "cob_001",
      "processo": "Processo 1234/2025",
      "valor": 600000,
      "vencimento": "2026-01-15",
      "status": "pago",
      "parcela": 1,
      "totalParcelas": 4,
      "percentualPago": 25
    },
    {
      "id": "cob_003",
      "processo": "Processo 1234/2025",
      "valor": 600000,
      "vencimento": "2026-03-15",
      "status": "pendente",
      "parcela": 3,
      "totalParcelas": 4,
      "percentualPago": 50
    }
  ]
}
```

---

### `GET /cobrancas/:id`
Detalhes completos de uma cobrança (usado na tela de pagamento).

**Response `200`:**
```json
{
  "id": "cob_003",
  "processo": "Processo 1234/2025",
  "descricao": "Honorários advocatícios — Parcela 3/4",
  "valor": 600000,
  "vencimento": "2026-03-15",
  "status": "pendente",
  "parcela": 3,
  "totalParcelas": 4
}
```

---

### `GET /cobrancas/:id/pix`
Retorna o código PIX dinâmico gerado para a cobrança.

**Response `200`:**
```json
{
  "pixCopiaCola": "00020126580014BR.GOV.BCB.PIX0136a1b2c3d4...",
  "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "expiresAt": "2026-03-16T23:59:59Z"
}
```

---

### `GET /escritorio/dados-bancarios`
Retorna os dados bancários do escritório para exibição na tela de pagamento do cliente.

**Response `200`:**
```json
{
  "banco": "Banco do Brasil",
  "agencia": "1234-5",
  "conta": "67890-1",
  "favorecido": "Silva & Associados",
  "cnpj": "12.345.678/0001-90"
}
```

---

### `POST /cobrancas/:id/comprovante`
Cliente envia o comprovante de pagamento.

**Request:** `multipart/form-data`
| Campo | Tipo |
|---|---|
| `arquivo` | `File` (jpg, png, pdf) |

**Response `200`:**
```json
{
  "mensagem": "Comprovante enviado. Aguardando confirmação do escritório.",
  "comprovanteUrl": "https://storage.softwave.com.br/comprovantes/cob_003.jpg"
}
```

---

## 14. Notificações — Cliente

### `GET /cliente/notificacoes`
Lista as notificações do cliente logado.

**Response `200`:**
```json
{
  "total": 4,
  "naoLidas": 1,
  "notificacoes": [
    {
      "id": "ntfc_001",
      "tipo": "pagamento",
      "titulo": "Pagamento Confirmado",
      "mensagem": "Seu pagamento da parcela 2 foi confirmado pelo escritório.",
      "data": "2026-03-01T10:00:00Z",
      "lida": true
    },
    {
      "id": "ntfc_002",
      "tipo": "vencimento",
      "titulo": "Vencimento Próximo",
      "mensagem": "A parcela 3 vence em 5 dias (15/03/2026).",
      "data": "2026-03-10T08:00:00Z",
      "lida": false
    }
  ]
}
```

> `tipo` aceita: `pagamento | cobranca | vencimento | processo`

---

### `PUT /cliente/notificacoes/:id/lida`
Marca uma notificação do cliente como lida.

**Response `200`:**
```json
{ "mensagem": "Notificação marcada como lida." }
```

---

## 15. Perfil — Cliente

### `GET /cliente/perfil`
Retorna os dados do perfil do cliente logado.

**Response `200`:**
```json
{
  "id": "cli_001",
  "nome": "João Silva",
  "email": "joao.silva@email.com",
  "telefone": "(11) 98765-4321",
  "endereco": "São Paulo, SP",
  "cpf": "123.456.789-00",
  "clienteDesde": "2024-02-01",
  "fotoPerfil": "https://storage.softwave.com.br/fotos/cli_001.jpg",
  "processoAtivo": {
    "id": "proc_001",
    "titulo": "Processo 1234/2025",
    "subtitulo": "Advocacia Cível - Honorários",
    "progressoPago": 60,
    "valorPago": 1500000,
    "valorTotal": 2500000
  },
  "preferencias": {
    "notificacoesAtivas": true
  }
}
```

---

### `PUT /cliente/preferencias`
Atualiza as preferências do cliente.

**Request Body:**
```json
{ "notificacoesAtivas": true }
```

**Response `200`:**
```json
{ "mensagem": "Preferências atualizadas." }
```

---

### `POST /cliente/perfil/foto`
Upload da foto de perfil do cliente.

**Request:** `multipart/form-data` com campo `foto`.

**Response `200`:**
```json
{
  "mensagem": "Foto atualizada com sucesso.",
  "fotoUrl": "https://storage.softwave.com.br/fotos/cli_001_novo.jpg"
}
```

---

## 16. Modelos de Dados Completos

### Transacao
```typescript
type Transacao = {
  id: string;
  tipo: 'receita' | 'despesa';
  titulo: string;
  subtitulo?: string;           // nome do cliente
  valor: number;                // em centavos
  status: 'pago' | 'pendente' | 'atrasado' | 'cancelado';
  categoria: 'honorarios' | 'custas' | 'consultoria' | 'aluguel' | 'outros';
  clienteId?: string;
  cliente?: string;
  processoId?: string;
  processo?: string;
  data: string;                 // ISO date
  vencimento: string;           // ISO date
  dataPagamento?: string;       // ISO date
  metodoPagamento?: string;
  descricao?: string;
  observacoes?: string;
  comprovante: boolean;
  comprovanteUrl?: string;
  recorrencia?: 'sem' | 'semanal' | 'mensal' | 'anual';
  duracaoMeses?: number;
  criadoEm: string;             // ISO datetime
  atualizadoEm: string;
};
```

### Contrato
```typescript
type Contrato = {
  id: string;
  clienteId: string;
  cliente: string;
  processo: string;
  tipoContrato: 'Êxito' | 'Parcelas' | 'Fixo Mensal';
  status: 'pendente' | 'atrasado' | 'pago' | 'cancelado' | 'encerrado';
  progresso: number;            // 0-100
  total: number;                // em centavos
  pago: number;                 // em centavos
  vencimento: string;
  encerrado: boolean;
  reprovado: boolean;
  descricao?: string;
  criadoEm: string;
};
```

### Parcela
```typescript
type Parcela = {
  id: string;
  contratoId: string;
  numero: number;
  valor: number;                // em centavos
  vencimento: string;
  status: 'pago' | 'pendente';
};
```

### Cobranca (cliente)
```typescript
type Cobranca = {
  id: string;
  processo: string;
  descricao?: string;
  valor: number;
  vencimento: string;
  status: 'pago' | 'pendente';
  parcela: number;
  totalParcelas: number;
  percentualPago: number;
};
```

### Pagamento (a conferir)
```typescript
type PagamentoPendente = {
  id: string;
  clienteId: string;
  cliente: string;
  processo: string;
  valor: number;
  data: string;
  comprovanteUrl: string;
};
```

### Notificacao
```typescript
type Notificacao = {
  id: string;
  tipo: 'pagamento' | 'alerta' | 'sucesso' | 'lembrete' | 'insight'
       | 'cobranca' | 'vencimento' | 'processo';
  titulo: string;
  mensagem: string;
  data: string;                 // ISO datetime
  lida: boolean;
};
```

### Cliente
```typescript
type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco?: string;
  clienteDesde: string;
  fotoPerfil?: string;
};
```

### Importacao
```typescript
type Importacao = {
  id: string;
  tipo: 'extrato_c6' | 'extrato_bradesco' | 'extrato_itau' | string;
  arquivo: string;
  data: string;
  status: 'pendente' | 'processando' | 'concluido' | 'erro';
  registros: number;
  novos: number;
  atualizados: number;
  erros: number;
};
```

---

## Erros Padrão

Todos os endpoints retornam erros no seguinte formato:

```json
{
  "erro": true,
  "codigo": "TOKEN_INVALIDO",
  "mensagem": "Token de autenticação inválido ou expirado."
}
```

| Código | Status HTTP | Descrição |
|---|---|---|
| `TOKEN_INVALIDO` | 401 | Token JWT ausente ou expirado |
| `ACESSO_NEGADO` | 403 | Usuário sem permissão para o recurso |
| `NAO_ENCONTRADO` | 404 | Recurso não encontrado |
| `CAMPOS_INVALIDOS` | 422 | Campos obrigatórios ausentes ou inválidos |
| `ERRO_INTERNO` | 500 | Erro interno do servidor |

---

*Documento gerado em 10/03/2026 — Softwave*
