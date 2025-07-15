export type PropertyStatus = 'Disponível' | 'Em Negociação' | 'Vendido' | 'Alugado' | 'Inativo';

export interface Address {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Features {
  quartos: number;
  suites: number;
  banheiros: number;
  salas: number;
  vagas: number;
}

export interface PaymentConditions {
  aceita_financiamento: boolean;
  aceita_permuta: boolean;
  valor_condominio?: number;
  valor_iptu?: number;
}

export interface Imovel {
  id: string;
  user_id?: string; // Opcional no frontend
  created_at?: string; // Opcional no frontend
  title: string;
  description?: string;
  address: Address;
  price: number;
  property_type: string;
  status: PropertyStatus;
  features: Features;
  differentials: string[];
  payment_conditions?: PaymentConditions;
  observations?: string;
  cover_photo_url?: string;
}
