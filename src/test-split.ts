import { prisma } from './lib/prisma.js';
import { CommissionService } from './services/commission.service'; // SEM extensão
const commissionService = new CommissionService();

async function testDay2() {
    console.log("💰 Iniciando Motor de Comissões...");

    // 1. Busca o prestador criado no Dia 1
    const provider = await prisma.provider.findFirst();

    if (!provider) {
        console.error("❌ ERRO: Nenhum prestador encontrado. Rode o script do Dia 1 primeiro!");
        return;
    }

    console.log(`👷 Prestador encontrado: ${provider.name}`);

    // 2. Simula uma obra de R$ 2.500,00
    const valorObra = 250000; // em centavos
    
    // 3. Calcula quem ganha quanto
    const split = commissionService.calculateSplit(valorObra, 'CONSTRUCAO', 'RIO_DE_JANEIRO');

    console.log("📊 Divisão calculada:");
    console.table({
        TOTAL_OBRA: `R$ ${(split.total / 100).toFixed(2)}`,
        NOSSA_COMISSAO: `R$ ${(split.marketplace_amount / 100).toFixed(2)}`,
        PRESTADOR_RECEBE: `R$ ${(split.provider_amount / 100).toFixed(2)}`
    });

    // 4. Salva essa transação no banco
    const transaction = await prisma.transaction.create({
        data: {
            amount: split.total,
            marketplaceFee: split.marketplace_amount,
            providerAmount: split.provider_amount,
            status: 'PENDING', // Começa pendente até a Iugu confirmar pagamento
            providerId: provider.id,
            externalId: `MOCK_INV_${Date.now()}`
        }
    });

    console.log(`✅ Transação salva no banco! ID: ${transaction.id}`);
}

testDay2()
    .catch(console.error)
    .finally(() => prisma.$disconnect());