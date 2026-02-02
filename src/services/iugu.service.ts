import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const IUGU_URL = process.env.IUGU_API_URL;
const IUGU_TOKEN = process.env.IUGU_API_TOKEN;

// Configuração base do Axios com autenticação Basic Auth (Padrão Iugu)
const api = axios.create({
    baseURL: IUGU_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    auth: {
        username: IUGU_TOKEN || '',
        password: '' // Iugu usa o token como username e senha vazia
    }
});

interface CreateAccountDTO {
    name: string;
    commission_percent?: number; // Se quiséssemos fixar na conta, mas faremos por transação
}

export class IuguService {
    async createMarketplaceSubAccount(name: string, email: string) {
        // Se não tiver token no .env, entra no modo SIMULAÇÃO
        if (!process.env.IUGU_API_TOKEN || process.env.IUGU_API_TOKEN === "seu_token_aqui") {
            console.log("⚠️ MODO SIMULAÇÃO: Criando conta fictícia (sem Iugu real)");
            
            // Simulando o atraso de uma rede real
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                account_id: `MOCK_ID_${Math.random().toString(36).substr(2, 9)}`,
                live_api_token: `mock_token_${Date.now()}`,
                user_token: `mock_user_${Date.now()}`
            };
        }

        // Se tiver token, tentaria a lógica real (necessita conta Master)
        throw new Error("Módulo Iugu real necessita de conta Master ativada. Use o modo Simulação.");
    }

    async createSplitInvoice(
        email: string, 
        amountCents: number, 
        providerId: string, 
        commissionCents: number
    ) {
        if (!process.env.IUGU_API_TOKEN || process.env.IUGU_API_TOKEN === "seu_token_aqui") {
            console.log(`⚠️ MODO SIMULAÇÃO: Criando fatura de R$ ${amountCents/100}`);
            return {
                invoice_id: `INV_${Math.random().toString(36).substr(2, 9)}`,
                url: "https://iugu.com/f/mock",
                status: "pending"
            };
        }

        // Lógica real da Iugu usando o endpoint de split
        // (Página 18 do manual da Iugu)
        throw new Error("Implementar chamada real ao endpoint de split da Iugu.");
    }
}
