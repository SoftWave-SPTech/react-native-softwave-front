export function montarEnderecoExibicao(parts: {
  logradouro: string;
  numero: string;
  complemento?: string;
  cidade: string;
  uf: string;
}): string {
  const log = parts.logradouro.trim();
  const num = parts.numero.trim();
  const comp = parts.complemento?.trim();
  const cidade = parts.cidade.trim();
  const uf = parts.uf.trim().toUpperCase();
  let base = `${log}, ${num}`;
  if (comp) base += ` - ${comp}`;
  return `${base} - ${cidade}/${uf}`;
}

export function montarLinhaGeocode(parts: {
  logradouro: string;
  numero: string;
  complemento?: string;
  cidade: string;
  uf: string;
  cep?: string;
}): string {
  const cep = parts.cep?.replace(/\D/g, '');
  const endereco = montarEnderecoExibicao(parts);
  return cep ? `${endereco}, CEP ${cep}, Brasil` : `${endereco}, Brasil`;
}
