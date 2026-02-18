import fastify from 'fastify';
import { z } from 'zod'; 
import { prisma } from './lib/prisma';
import { CommissionService } from './services/ComissionService'; 
import { IuguService } from './services/IuguService';

const app = fastify();

// ROTA 1: Listar Prestadores
app.get('/providers', async () => {
  const providers = await prisma.provider.findMany();
  return providers;
});

app.post('/providers', async (request, reply) => {
  // Validação simples
  const createProviderSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  });

  const { name, email, password } = createProviderSchema.parse(request.body);

  // Cria no banco
  const provider = await prisma.provider.create({
    data: {
      name,
      email,
      password,
    },
  });

  return reply.status(201).send(provider);
});

// ROTA 2: Criar Transação
app.post('/transactions', async (request, reply) => {
  const schema = z.object({
    amount: z.number(),
    providerId: z.string().uuid(),
    description: z.string(),
    category: z.string(),
    state: z.string()
  });

  const { amount, providerId, description, category, state } = schema.parse(request.body);

  const commissionService = new CommissionService();
  const iuguService = new IuguService();

  // 1. Calcula o Split
  const split = commissionService.calculateSplit(amount, category, state);
  
  const finalPlatformAmount = (split as any).platformAmount || (split as any).marketplace_amount;
  const finalProviderAmount = (split as any).providerAmount || (split as any).provider_amount;

  // 2. Integração Gateway
  const invoice = await iuguService.createCharge(amount, description);

 // 3. Salva no Banco
  const transaction = await prisma.transaction.create({
    data: {
      amount: Number(amount),
      providerId: providerId,
      externalId: String(invoice.id),
      providerAmount: Number(finalProviderAmount),
      marketplaceFee: Number(finalPlatformAmount), 
      status: 'PENDING'
    }
  });

  return reply.status(201).send({
    transactionId: transaction.id,
    invoiceUrl: invoice.secure_url,
    pixCode: invoice.pix.qrcode_text,
    split: {
      provider: finalProviderAmount,
      platform: finalPlatformAmount
    }
  });
});

// ROTA 3: Webhook
app.post('/webhooks/iugu', async (request, reply) => {
  const body = request.body as any;
  if (body.event === 'invoice.status_changed' && body.data.status === 'paid') {
     await prisma.transaction.updateMany({
       where: { externalId: body.data.id },
       data: { status: 'PAID' }
     });
  }
  return reply.send();
});

// ROTA 4: Extrato
app.get('/providers/:providerId/balance', async (request) => {
    const { providerId } = request.params as { providerId: string };
    
    const available = await prisma.transaction.aggregate({
        _sum: { providerAmount: true },
        where: { providerId, status: 'PAID' }
    });

    const pending = await prisma.transaction.aggregate({
        _sum: { providerAmount: true },
        where: { providerId, status: 'PENDING' }
    });

    return {
        available: available._sum.providerAmount || 0,
        pending: pending._sum.providerAmount || 0
    }
});

app.listen({ port: 3333 }).then(() => {
  console.log('🔥 Server running on http://localhost:3333');
});