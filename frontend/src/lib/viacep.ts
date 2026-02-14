import type { QuoteDimensions } from './interfaces';

export interface CepData {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function fetchCep(cep: string): Promise<CepData> {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) throw new Error('CEP deve ter 8 dígitos');
  const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
  if (!res.ok) throw new Error('Erro ao consultar CEP');
  const data: CepData = await res.json();
  if (data.erro) throw new Error('CEP não encontrado');
  return data;
}

function calcDimensionMultiplier(dims?: QuoteDimensions): number {
  if (!dims) return 1;

  let multiplier = 1;

  if (dims.weight && dims.weight > 1) {
    multiplier += (dims.weight - 1) * 0.03;
  }

  const w = dims.width ?? 0;
  const h = dims.height ?? 0;
  const d = dims.depth ?? 0;
  if (w > 0 && h > 0 && d > 0) {
    const volume = w * h * d;
    if (volume > 5000) {
      multiplier += ((volume - 5000) / 1000) * 0.01;
    }
  }

  return Math.min(multiplier, 3);
}

export function calculateFreight(origin: CepData, dest: CepData, dims?: QuoteDimensions): number {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  let base: number;
  if (origin.localidade === dest.localidade && origin.uf === dest.uf) {
    base = rand(8, 15);
  } else if (origin.uf === dest.uf) {
    base = rand(16, 45);
  } else {
    base = rand(45, 100);
  }

  const total = base * calcDimensionMultiplier(dims);
  return Math.round(total * 100) / 100;
}
