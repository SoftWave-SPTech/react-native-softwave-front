/**
 * Mock API com json-server + rota customizada POST /auth/login
 * Escuta em 0.0.0.0 para o celular na mesma rede conseguir acessar pelo IP da máquina.
 */
const path = require('path');
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const PORT = Number(process.env.PORT) || 3000;

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

server.use(router);

server.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`\n  Mock API (json-server) → http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`  Login: POST http://<SEU_IP_LAN>:${PORT}/auth/login`);
  // eslint-disable-next-line no-console
  console.log(`  Recursos: GET /transacoes, /contratos, /notificacoesAdvogado, …\n`);
});
