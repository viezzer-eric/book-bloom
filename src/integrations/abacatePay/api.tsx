import { AbacatePayResponse } from "./types";

const BASE_URL = 'https://api.abacatepay.com/v1';

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function abacateFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<AbacatePayResponse<T>> {
  const { token, ...fetchOptions } = options;

  const apiToken = token || import.meta.env.VITE_ABACATEPAY_API_KEY;

  if (!apiToken) {
    throw new Error('Chave API AbacatePay não configurada');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiToken}`,
    ...fetchOptions.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  let json;
  try {
    json = await response.json();
  } catch {
    json = { error: 'Resposta inválida (não é JSON)' };
  }

  if (!response.ok) {
    return { data: null, error: json?.error || json || 'Erro desconhecido' };
  }

  return { data: json?.data ?? json, error: null };
}