import fastify from 'fastify';
import { prisma } from './lib/prisma';
import { CommissionService } from './services/commission.service';

const app = fastify();
const commissionService = new CommissionService();

// =============================================================
// ROTA 1: Listar todos os prestadores
// =============================================================
app.get('/providers', async () => {
  const providers = await prisma.provider.findMany();
  return providers;
});

// =============================================================
// ROTA 2: Criar uma nova transação (O coração do sistema)
// =============================================================
app.post('/transactions', async (request, reply) => {
  const { providerId, amount, category, city } = request.body as {
    providerId: string;
    amount: number;
    category: string;
    city: string;
  };

  const provider = await prisma.provider.findUnique({
    where: { id: providerId }
  });

  if (!provider) {
    return reply.status(404).send({ error: "Prestador não encontrado" });
  }

  const split = commissionService.calculateSplit(amount, category, city);

  const transaction = await prisma.transaction.create({
    data: {
      amount: split.total,
      marketplaceFee: split.marketplace_amount,
      providerAmount: split.provider_amount,
      status: 'PENDING',
      providerId: provider.id,
      externalId: `API_INV_${Date.now()}`
    }
  });

  // Devolvemos a resposta (AQUI FECHA A ROTA 2)
  return reply.status(201).send({
    message: "Transação criada com sucesso!",
    transactionId: transaction.id,
    externalId: transaction.externalId,
    split_details: split
  });
});

// =============================================================
// ROTA 3: Webhook (Onde a Iugu avisa que o dinheiro caiu)
// =============================================================
app.post('/webhooks/iugu', async (request, reply) => {
  console.log("🔔 Webhook recebido!");

  const { event, data } = request.body as {
    event: string;
    data: { id: string; status: string };
  };

  if (event === 'invoice.status_changed' && data.status === 'paid') {
    const invoiceId = data.id;
    console.log(`💰 Pagamento confirmado para a fatura: ${invoiceId}`);

    try {
        await prisma.transaction.updateMany({
            where: { externalId: invoiceId },
            data: { status: 'PAID' }
        });
        console.log("✅ Banco de dados atualizado para PAID.");
    } catch (error) {
        console.error("Erro ao atualizar transação:", error);
        return reply.status(500).send();
    }
  }

  return reply.status(200).send();
});
// =============================================================
// ROTA 4: Ver Saldo (O Extrato Financeiro)
// =============================================================
app.get('/providers/:providerId/balance', async (request, reply) => {
  // 1. Pegamos o ID que veio na URL (ex: /providers/123/balance)
  const { providerId } = request.params as { providerId: string };

  // 2. Calculamos o SALDO DISPONÍVEL (Soma das transações PAID)
  // O Prisma tem uma função mágica chamada "aggregate" para somar coisas
  const available = await prisma.transaction.aggregate({
    _sum: {
      providerAmount: true // Quero somar a coluna providerAmount
    },
    where: {
      providerId: providerId,
      status: 'PAID'
    }
  });

  // 3. Calculamos o SALDO A RECEBER (Soma das transações PENDING)
  const pending = await prisma.transaction.aggregate({
    _sum: {
      providerAmount: true
    },
    where: {
      providerId: providerId,
      status: 'PENDING'
    }
  });

  // 4. Devolvemos os números bonitinhos (tratando nulos como zero)
  return {
    providerId,
    available_balance: available._sum.providerAmount || 0, // Se for null, devolve 0
    pending_balance: pending._sum.providerAmount || 0
  };
});

// =============================================================
// Inicialização do Servidor
// =============================================================
app.listen({ port: 3333 }).then(() => {
  console.log('🚀 Servidor HTTP rodando em http://localhost:3333');
});