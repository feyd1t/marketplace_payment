import axios from 'axios';

export class IuguService {
  // URL de testes da Iugu (Sandbox) ou Produção
  private apiUrl = 'https://api.iugu.com/v1';
  // Token (No futuro virá do .env)
  private apiToken = 'SEU_TOKEN_DE_TESTE_AQUI'; 

  async createCharge(amountInCents: number, description: string) {
    try {
      // 1. Converter centavos para reais (ex: 1000 -> 10.00) porque APIs variam
      // Mas a Iugu gosta de centavos em alguns endpoints, vamos assumir o padrão invoice.
      
      console.log(`📡 Conectando na Iugu para gerar cobrança de ${(amountInCents/100)} reais...`);

      // === MODO SIMULAÇÃO (Para não travar sem Token Real) ===
      // Como provavelmente não temos uma conta Iugu ativa agora, 
      // vamos simular que o banco respondeu com sucesso.
      
      // Se tivessemos o token real, o código seria:
      /*
      const response = await axios.post(`${this.apiUrl}/invoices`, {
        ensure_workday_due_date: false,
        items: [{ description: description, quantity: 1, price_cents: amountInCents }],
        payable_with: 'pix',
      }, {
        headers: { Authorization: `Basic ${Buffer.from(this.apiToken + ':').toString('base64')}` }
      });
      return response.data;
      */

      // Retorno Falso (Mock) para o sistema continuar funcionando
      return {
        id: `FATURA_REAL_${Date.now()}`, // Gera um ID único fake
        secure_url: 'https://faturas.iugu.com/teste123', // Link da fatura
        pix: {
          qrcode: '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000', // QR Code Fake
          qrcode_text: 'Copie e Cola do Pix Aqui'
        },
        status: 'pending'
      };
      
    } catch (error) {
      console.error('Erro ao criar cobrança na Iugu:', error);
      throw new Error('Falha na comunicação com Gateway de Pagamento');
    }
  }
}