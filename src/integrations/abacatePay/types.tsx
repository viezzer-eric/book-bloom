// Base response da AbacatePay (quase sempre { data, error })
export interface AbacatePayResponse<T> {
  data: T | null;
  error: any; // pode ser string, objeto, null...
}

// Customer
export interface Customer {
  id: string;
  name?: string;
  email?: string;
  cellphone?: string;
  taxId?: string; // CPF/CNPJ
  createdAt?: string;
}

// Billing / Cobrança
export interface BillingCreateInput {
  frequency: 'ONE_TIME' | 'MONTHLY' | 'YEARLY';
  methods: Array<'PIX' | 'CARD'>;
  products: Array<{
    externalId?: string;
    name: string;
    description?: string;
    quantity: number;
    price: number; // em centavos
  }>;
  returnUrl?: string;
  completionUrl?: string;
  customerId?: string;
  customer?: Partial<Customer>; // se não passar customerId
}

export interface Billing {
  id: string;
  url: string;           // link de pagamento hospedado
  status: string;
  devMode: boolean;
  amount?: number;
  methods: string[];
  // ... outros campos que vierem
}

// Pix QR Code
export interface PixQrCodeCreateInput {
  amount: number; // centavos
  description?: string;
  customer?: Partial<Customer>;
  externalId?: string;
}

export interface PixQrCode {
  id: string;
  amount: number;
  status: string;
  devMode: boolean;
  brCode: string;
  brCodeBase64: string; // base64 da imagem do QR
  expiresAt: string;
  // ... outros campos
}