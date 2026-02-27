// src/pages/CheckoutPage.tsx
import { createBilling } from '@/integrations/abacatePay/abacatePayService';
import { BillingCreateInput } from '@/integrations/abacatePay/types';
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom'; // ou useHistory se for v5

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    taxId: '',           // CPF ou CNPJ
    cellphone: '',
    // Você pode vir de um carrinho real ou props
    product: {
      externalId: 'curso-premium-2025',
      name: 'Curso Avançado React & TypeScript 2025',
      description: 'Acesso vitalício + atualizações + grupo VIP',
      quantity: 1,
      price: 99700, // R$ 997,00 → centavos
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: BillingCreateInput = {
        frequency: 'ONE_TIME',
        methods: ['PIX', 'CARD'], // ou ['PIX'] se quiser só Pix
        products: [formData.product],
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          taxId: formData.taxId.replace(/\D/g, ''), // limpa CPF
          cellphone: formData.cellphone.replace(/\D/g, ''),
        },
        returnUrl: window.location.origin + '/checkout/return',
        completionUrl: window.location.origin + '/checkout/success',
        // externalId: "seu-pedido-abc123", // opcional – recomendado
        // allowCoupons: true,
        // metadata: { source: "site-v2" },
      };

      const response = await createBilling(payload);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.url) {
        // Redireciona para o checkout hospedado da AbacatePay
        window.location.href = response.data.url;
      } else {
        throw new Error('Não foi possível obter o link de pagamento');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar cobrança. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header simples */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Finalizar Compra</h1>
          <div className="text-sm text-gray-500">Seguro via AbacatePay</div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Coluna 1 - Resumo do pedido */}
          <div className="bg-white rounded-xl shadow p-6 order-2 md:order-1">
            <h2 className="text-xl font-semibold mb-6">Resumo do Pedido</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{formData.product.name}</p>
                  <p className="text-sm text-gray-600">{formData.product.description}</p>
                </div>
                <p className="font-medium whitespace-nowrap">
                  {(formData.product.price / 100).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {(formData.product.price / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-sm text-gray-500 space-y-2">
              <p>✓ Pagamento seguro</p>
              <p>✓ PIX ou Cartão de Crédito</p>
              <p>✓ Confirmação instantânea (PIX)</p>
            </div>
          </div>

          {/* Coluna 2 - Formulário */}
          <div className="bg-white rounded-xl shadow p-6 order-1 md:order-2">
            <h2 className="text-xl font-semibold mb-6">Seus Dados</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="seuemail@exemplo.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF *
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    required
                    maxLength={14}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Celular (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    name="cellphone"
                    value={formData.cellphone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="(11) 98765-4321"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full py-4 px-6 text-lg font-semibold rounded-xl text-white
                  ${loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 transition-colors'}
                `}
              >
                {loading ? 'Processando...' : 'Ir para o Pagamento'}
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                Ao continuar, você será redirecionado para a página segura da AbacatePay
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}