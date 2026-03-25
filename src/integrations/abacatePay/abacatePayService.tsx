import { abacateFetch } from './api';
import type {
  AbacatePayResponse,
  Customer,
  BillingCreateInput,
  Billing,
  PixQrCodeCreateInput,
  PixQrCode,
} from './types';

// -----------------------
// Customer
// -----------------------
export const createCustomer = async (
  data: Partial<Customer>
): Promise<AbacatePayResponse<Customer>> => {
  return abacateFetch<Customer>('/customer/create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const listCustomers = async (): Promise<AbacatePayResponse<Customer[]>> => {
  return abacateFetch<Customer[]>('/customer/list', { method: 'GET' });
};

// -----------------------
// Billing / Cobranças
// -----------------------
export const createBilling = async (
  data: BillingCreateInput
): Promise<AbacatePayResponse<Billing>> => {
  return abacateFetch<Billing>('/billing/create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const listBillings = async (): Promise<AbacatePayResponse<Billing[]>> => {
  return abacateFetch<Billing[]>('/billing/list', { method: 'GET' });
};

// -----------------------
// Pix QR Code
// -----------------------
export const createPixQrCode = async (
  data: PixQrCodeCreateInput
): Promise<AbacatePayResponse<PixQrCode>> => {
  return abacateFetch<PixQrCode>('/pixQrCode/create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const checkPixStatus = async (
  id: string
): Promise<AbacatePayResponse<{ status: string }>> => {
  return abacateFetch(`/pixQrCode/check?id=${id}`, { method: 'GET' });
};

export const simulatePixPayment = async (
  id: string
): Promise<AbacatePayResponse<null>> => {
  return abacateFetch(`/pixQrCode/simulate-payment?id=${id}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
};