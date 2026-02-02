import { prisma } from './lib/prisma.js'; // Importando a conexão isolada
import { IuguService } from './services/iugu.service.js';

const iuguService = new IuguService();

async function main() {
    console.log("🚀 Iniciando Teste de Integração - Dia 1");

    const uniqueEmail = `prestador.${Date.now()}@teste.com`;

    try {
        console.log("⏳ 1/2: Criando subconta na Iugu...");
        const iuguAccount = await iuguService.createMarketplaceSubAccount(
            "Mestre de Obras Silva", 
            uniqueEmail
        );

        console.log("⏳ 2/2: Salvando no banco de dados local...");
        const savedProvider = await prisma.provider.create({
            data: {
                name: "Mestre de Obras Silva",
                email: uniqueEmail,
                cpfCnpj: "123.456.789-00",
                iuguAccountId: iuguAccount.account_id,
                liveApiToken: iuguAccount.live_api_token,
                userToken: iuguAccount.user_token
            }
        });

        console.log("✅ SUCESSO! Entrega do Dia 1 concluída.");
        console.table({
            ID_LOCAL: savedProvider.id,
            IUGU_ID: savedProvider.iuguAccountId,
            EMAIL: savedProvider.email
        });

    } catch (error: any) {
        console.error("❌ Erro durante a execução:");
        console.error(error.message || error);
    }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    if (prisma) {
        await prisma.$disconnect();
    }
  });