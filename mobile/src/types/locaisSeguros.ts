export type LocalSeguro = {
  id: string;
  nome: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cidade: string;
  uf: string;
  /** Texto exibido na lista (endereco_exibicao). */
  endereco: string;
  latitude: number;
  longitude: number;
  raio: number;
  ativo: boolean;
};

export type LocalSeguroPayload = {
  nome: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  cidade: string;
  uf: string;
  endereco?: string;
  latitude: number;
  longitude: number;
  raio: number;
};

export type LocaisSegurosApiResponse = {
  enabled: boolean;
  locais: LocalSeguro[];
};
