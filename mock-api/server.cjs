/**
 * Mock API — json-server + rotas alinhadas ao API_SPEC.md (subset).
 * Escuta em 0.0.0.0 para o celular na mesma rede.
 */
const path = require('path');
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const PORT = Number(process.env.PORT) || 3000;
const MOCK_PIX =
  '00020126580014BR.GOV.BCB.PIX0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540525.005802BR5925SILVA E ASSOCIADOS LTDA6014SAO PAULO62070503***6304ABCD';

function usuarioDoToken(req) {
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+mock_jwt_(advogado|cliente)_(.+)$/i.exec(h.trim());
  if (!m) return null;
  return { tipo: m[1].toLowerCase(), id: m[2] };
}

function requireAdvogado(req, res) {
  const u = usuarioDoToken(req);
  if (!u || u.tipo !== 'advogado') {
    res.status(401).json({ erro: true, mensagem: 'Não autorizado.' });
    return null;
  }
  return u;
}

function requireCliente(req, res) {
  const u = usuarioDoToken(req);
  if (!u || u.tipo !== 'cliente') {
    res.status(401).json({ erro: true, mensagem: 'Não autorizado.' });
    return null;
  }
  return u;
}

const IA_RESPOSTA_POR_TIPO = {
  'receita-despesa':
    'No período analisado, sua receita cresceu 30% enquanto as despesas caíram 8%. A margem líquida evoluiu de 41% para 59%, indicando excelente controle financeiro. Recomendo manter o padrão de captação de novos clientes para sustentar o crescimento.',
  'receita-categoria':
    'Os Honorários representam 76% da sua receita total. Consultoria está crescendo 12% ao mês e pode ser uma boa oportunidade de diversificação.',
  'despesa-categoria':
    'O Aluguel representa 35% das suas despesas fixas. Há uma oportunidade de reduzir custos operacionais em aproximadamente 15%.',
  'maiores-clientes':
    'Seus top 2 clientes representam 68% da receita total. João Silva sozinho é responsável por 40% do faturamento.',
  'margem-lucro':
    'Sua margem de lucro atual está em 49.8%, acima da média do mercado jurídico (35-40%). O crescimento de 2.3% nos últimos meses indica tendência positiva.',
  inadimplencia:
    'A taxa de inadimplência está em 12%, dentro da média do setor jurídico (10-15%). A redução de 3% indica melhoria nos processos de cobrança.',
};

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post('/auth/login', (req, res) => {
  const email = (req.body?.email || '').trim().toLowerCase();
  const senha = req.body?.senha || '';

  const usuarios = router.db.get('usuarios').value() || [];
  const usuario = usuarios.find((u) => u.email === email && u.senha === senha);

  if (!usuario) {
    return res.status(401).json({
      erro: true,
      codigo: 'CREDENCIAIS_INVALIDAS',
      mensagem: 'E-mail ou senha incorretos.',
    });
  }

  return res.json({
    token: `mock_jwt_${usuario.tipo}_${usuario.id}`,
    refreshToken: 'mock_refresh',
    expiresIn: 86400,
    usuario: {
      id: String(usuario.id),
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      fotoPerfil: usuario.fotoPerfil ?? null,
    },
  });
});

/** API_SPEC § auth esqueci-senha (mock: sempre sucesso) */
server.post('/auth/esqueci-senha', (req, res) => {
  const email = (req.body?.email || '').trim();
  if (!email) {
    return res.status(400).json({ erro: true, mensagem: 'Informe o e-mail.' });
  }
  return res.json({
    mensagem: 'Se o e-mail existir em nossa base, você receberá instruções em instantes.',
  });
});

/** API_SPEC §4 — parcelas do contrato (envelope { parcelas }) */
server.get('/contratos/:contratoId/parcelas', (req, res) => {
  const contratoId = Number(req.params.contratoId);
  const parcelas = router.db.get('parcelas').value() || [];
  const lista = parcelas.filter((p) => Number(p.contratoId) === contratoId);
  return res.json({ parcelas: lista });
});

/** API_SPEC §4 — gerar cobrança (stub) */
server.post('/parcelas/:id/gerar-cobranca', (req, res) => {
  return res.json({
    mensagem: 'Cobrança gerada e enviada ao cliente.',
    cobrancaId: `cob_${req.params.id}`,
  });
});

/** API_SPEC §13 — lista cobranças do cliente */
server.get('/cliente/cobrancas', (req, res) => {
  const usuario = usuarioDoToken(req);
  if (!usuario || usuario.tipo !== 'cliente') {
    return res.status(401).json({ erro: true, mensagem: 'Não autorizado.' });
  }
  let lista = router.db.get('cobrancas').value() || [];
  const q = (req.query.status || '').toLowerCase();
  if (q === 'pendente') lista = lista.filter((c) => c.status === 'pendente');
  else if (q === 'pago') lista = lista.filter((c) => c.status === 'pago');
  return res.json({ cobrancas: lista });
});

/** API_SPEC §13 — detalhe cobrança */
server.get('/cobrancas/:id', (req, res) => {
  const lista = router.db.get('cobrancas').value() || [];
  const c = lista.find((x) => String(x.id) === String(req.params.id));
  if (!c) return res.status(404).json({ erro: true, mensagem: 'Cobrança não encontrada.' });
  const det = {
    id: c.id,
    processo: c.processo,
    descricao: c.descricao || `Parcela ${c.parcela}/${c.totalParcelas}`,
    valor: c.valor,
    vencimento: c.vencimento,
    status: c.status,
    parcela: c.parcela,
    totalParcelas: c.totalParcelas,
  };
  return res.json(det);
});

/** API_SPEC — PIX mock */
server.get('/cobrancas/:id/pix', (req, res) => {
  const lista = router.db.get('cobrancas').value() || [];
  const c = lista.find((x) => String(x.id) === String(req.params.id));
  if (!c) return res.status(404).json({ erro: true, mensagem: 'Cobrança não encontrada.' });
  return res.json({
    pixCopiaCola: MOCK_PIX,
    qrCodeBase64: null,
    expiresAt: `${c.vencimento}T23:59:59Z`,
  });
});

/** API_SPEC — dados bancários escritório */
server.get('/escritorio/dados-bancarios', (req, res) => {
  const rows = router.db.get('escritorioDadosBancarios').value() || [];
  const b = rows[0];
  if (!b) return res.status(404).json({ erro: true });
  const { id, ...rest } = b;
  void id;
  return res.json(rest);
});

/** API_SPEC §15 */
server.get('/cliente/perfil', (req, res) => {
  const usuario = usuarioDoToken(req);
  if (!usuario || usuario.tipo !== 'cliente') {
    return res.status(401).json({ erro: true, mensagem: 'Não autorizado.' });
  }
  const rows = router.db.get('clientePerfil').value() || [];
  const row = rows.find((r) => r.usuarioId === usuario.id) || rows[0];
  if (!row) return res.status(404).json({ erro: true, mensagem: 'Perfil não encontrado.' });
  const { usuarioId, ...body } = row;
  void usuarioId;
  return res.json(body);
});

/** API_SPEC §10 */
server.get('/perfil', (req, res) => {
  const usuario = usuarioDoToken(req);
  if (!usuario || usuario.tipo !== 'advogado') {
    return res.status(401).json({ erro: true, mensagem: 'Não autorizado.' });
  }
  const rows = router.db.get('perfilEscritorio').value() || [];
  const row = rows.find((r) => r.usuarioId === usuario.id) || rows[0];
  if (!row) return res.status(404).json({ erro: true, mensagem: 'Perfil não encontrado.' });
  const { usuarioId, ...body } = row;
  void usuarioId;
  return res.json(body);
});

/** API_SPEC §6 — relatórios */
server.get('/relatorios/receita-despesa', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const cache = router.db.get('relatoriosCache').value() || {};
  return res.json(cache.receitaDespesa || { labels: [], receita: [], despesa: [] });
});

server.get('/relatorios/receita-categoria', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const cache = router.db.get('relatoriosCache').value() || {};
  return res.json(cache.receitaCategoria || { categorias: [] });
});

server.get('/relatorios/despesas-mes', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const cache = router.db.get('relatoriosCache').value() || {};
  return res.json(cache.despesasMes || { labels: [], despesas: [] });
});

server.get('/relatorios/kpis', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const cache = router.db.get('relatoriosCache').value() || {};
  return res.json(
    cache.kpis || {
      margemLucro: { valor: '0%', variacao: '0%', tipo: 'positivo' },
      ticketMedio: { valor: 0, variacao: '0%', tipo: 'positivo' },
      inadimplencia: { valor: '0%', variacao: '0%', tipo: 'positivo' },
      crescimento: { valor: '0%', variacao: '0%', tipo: 'positivo' },
    },
  );
});

server.get('/relatorios/ranking-clientes', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const cache = router.db.get('relatoriosCache').value() || {};
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const list = (cache.rankingClientes && cache.rankingClientes.clientes) || [];
  return res.json({ clientes: list.slice(0, limit) });
});

server.get('/relatorios/insights', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const cache = router.db.get('relatoriosCache').value() || {};
  return res.json(
    cache.insights || {
      linha: [],
      pizza: [],
      barra: [],
    },
  );
});

/** API_SPEC §8 — IA */
server.post('/ia/analise', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const tipoAnalise = (req.body && req.body.tipoAnalise) || 'receita-despesa';
  const dataInicio = (req.body && req.body.dataInicio) || '2026-01-01';
  const dataFim = (req.body && req.body.dataFim) || '2026-03-31';
  const resposta =
    IA_RESPOSTA_POR_TIPO[tipoAnalise] ||
    'Análise concluída para o período solicitado. Consulte os relatórios para mais detalhes.';
  const periodo = `${dataInicio.slice(0, 7)} – ${dataFim.slice(0, 7)}`;
  const id = `ia_${Date.now()}`;
  const geradoEm = new Date().toISOString();
  const item = { id, tipoAnalise, periodo, resposta, geradoEm };
  router.db.get('iaHistorico').push(item).write();
  return res.json(item);
});

server.get('/ia/historico', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  let list = router.db.get('iaHistorico').value() || [];
  const tipo = (req.query.tipo || '').trim();
  if (tipo) list = list.filter((x) => x.tipoAnalise === tipo);
  list = [...list].sort((a, b) => String(b.geradoEm).localeCompare(String(a.geradoEm)));
  return res.json({ total: list.length, historico: list });
});

/** API_SPEC §9 */
server.get('/importacao/historico', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const importacoes = router.db.get('importacaoHistorico').value() || [];
  return res.json({ importacoes: [...importacoes].reverse() });
});

server.post('/importacao/upload', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const tipo = (req.body && req.body.tipo) || 'extrato';
  const arquivoNome = (req.body && req.body.arquivoNome) || 'upload.csv';
  const id = `imp_${Date.now()}`;
  router.db
    .get('importacaoHistorico')
    .push({
      id,
      tipo,
      arquivo: arquivoNome,
      data: new Date().toISOString(),
      status: 'processando',
      registros: 0,
      novos: 0,
      atualizados: 0,
      erros: 0,
    })
    .write();
  return res.json({
    id,
    mensagem: 'Arquivo recebido. Processamento iniciado.',
    status: 'processando',
  });
});

server.get('/exportacao/transacoes', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const csv = 'id,titulo,valor,tipo\nmock_1,Honorários exemplo,800000,receita\nmock_2,Custas,120000,despesa\n';
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="transacoes.csv"');
  return res.status(200).send(csv);
});

/** API_SPEC §5 — pagamentos pendentes (alias + spec paths) */
server.get('/pagamentos/pendentes', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const all = router.db.get('pagamentosParaConferir').value() || [];
  const pagamentos = all.filter((p) => p.status === 'pendente');
  return res.json({ total: pagamentos.length, pagamentos });
});

function atualizarPagamentoConferir(id, patch) {
  const rows = router.db.get('pagamentosParaConferir').value() || [];
  const idx = rows.findIndex((p) => Number(p.id) === Number(id));
  if (idx < 0) return null;
  const next = { ...rows[idx], ...patch };
  router.db.get('pagamentosParaConferir').find({ id: Number(id) }).assign(patch).write();
  return next;
}

server.put('/pagamentos/:id/aprovar', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const id = req.params.id;
  const cur = atualizarPagamentoConferir(id, { status: 'aprovado' });
  if (!cur) return res.status(404).json({ erro: true, mensagem: 'Pagamento não encontrado.' });
  return res.json({ mensagem: 'Pagamento aprovado. Cliente será notificado.' });
});

server.put('/pagamentos/:id/reprovar', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const id = req.params.id;
  const motivo = (req.body && req.body.motivo) || '';
  if (!String(motivo).trim()) {
    return res.status(400).json({ erro: true, mensagem: 'Informe o motivo da reprovação.' });
  }
  const cur = atualizarPagamentoConferir(id, { status: 'reprovado', motivoRejeicao: String(motivo).trim() });
  if (!cur) return res.status(404).json({ erro: true, mensagem: 'Pagamento não encontrado.' });
  return res.json({ mensagem: 'Pagamento reprovado. Cliente será notificado.' });
});

/** API_SPEC §7 — notificações advogado */
server.get('/notificacoes', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const list = router.db.get('notificacoesAdvogado').value() || [];
  const naoLidas = list.filter((n) => !n.lida).length;
  return res.json({
    total: list.length,
    naoLidas,
    notificacoes: list.map((n) => ({
      id: String(n.id),
      tipo: n.tipo,
      titulo: n.titulo,
      mensagem: n.mensagem,
      data: n.data,
      lida: n.lida,
    })),
  });
});

server.put('/notificacoes/:id/lida', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const rawId = req.params.id;
  const numId = Number(rawId);
  const row = router.db.get('notificacoesAdvogado').find({ id: numId }).value();
  if (!row) return res.status(404).json({ erro: true, mensagem: 'Notificação não encontrada.' });
  router.db.get('notificacoesAdvogado').find({ id: numId }).assign({ lida: true }).write();
  return res.json({ mensagem: 'Notificação marcada como lida.' });
});

server.put('/notificacoes/marcar-todas-lidas', (req, res) => {
  if (!requireAdvogado(req, res)) return;
  const list = router.db.get('notificacoesAdvogado').value() || [];
  list.forEach((n) => {
    router.db.get('notificacoesAdvogado').find({ id: n.id }).assign({ lida: true }).write();
  });
  return res.json({ mensagem: 'Todas as notificações foram marcadas como lidas.' });
});

/** API_SPEC §12 — dashboard cliente (objeto único) */
server.get('/cliente/dashboard', (req, res) => {
  if (!requireCliente(req, res)) return;
  const rows = router.db.get('clienteDashboard').value() || [];
  const row = rows[0];
  if (!row) return res.status(404).json({ erro: true, mensagem: 'Dashboard não encontrado.' });
  const uc = row.ultimaCobranca || {};
  const parcelaLabel = uc.parcelaLabel || uc.descricao || '';
  const vencRaw = uc.vencimento || '';
  let vencIso = vencRaw;
  if (vencRaw && vencRaw.includes('/')) {
    const [d, m, y] = vencRaw.split('/');
    if (y && m && d) vencIso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return res.json({
    nome: row.nome,
    totalPago: row.totalPago,
    totalPendente: row.totalPendente,
    totalContrato: row.totalContrato,
    percentualPago: row.percentualPago,
    parcelasRestantes: row.parcelasRestantes,
    notificacoesNaoLidas: row.notificacoesNaoLidas,
    ultimaCobranca: {
      id: uc.id || 'cob_mock',
      descricao: parcelaLabel,
      vencimento: vencIso,
      valor: uc.valor,
      status: uc.status || 'pendente',
    },
  });
});

/** Cliente — marcar notificação lida */
server.put('/cliente/notificacoes/:id/lida', (req, res) => {
  if (!requireCliente(req, res)) return;
  const numId = Number(req.params.id);
  const row = router.db.get('notificacoesCliente').find({ id: numId }).value();
  if (!row) return res.status(404).json({ erro: true, mensagem: 'Notificação não encontrada.' });
  router.db.get('notificacoesCliente').find({ id: numId }).assign({ lida: true }).write();
  return res.json({ mensagem: 'Notificação marcada como lida.' });
});

server.use(router);

server.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`\n  Mock API (json-server) → http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`  Login: POST /auth/login`);
  // eslint-disable-next-line no-console
  console.log(`  Ver mock-api/README.md para rotas do API_SPEC.\n`);
});
