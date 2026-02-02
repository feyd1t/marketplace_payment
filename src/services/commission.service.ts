export class CommissionService {
    // Configurações baseadas no escopo: 
    // 10% de taxa + 50 centavos fixos por transação
    private readonly DEFAULT_PERCENTAGE = 10; 
    private readonly FIXED_FEE_CENTS = 50;   

    calculateSplit(totalAmountCents: number, category: string, city: string) {
        let percentage = this.DEFAULT_PERCENTAGE;

        // Exemplo de Regra de Negócio: 
        // Se for "Pintura" em "SP", a taxa cai para 8% (incentivo)
        if (category === 'PINTURA' && city === 'SAO_PAULO') {
            percentage = 8; 
        }

        // Cálculo: (Valor * %) + Taxa Fixa
        // Math.floor garante que o número seja inteiro (sem vírgula), pois trabalhamos com centavos
        const marketplaceValue = Math.floor((totalAmountCents * (percentage / 100)) + this.FIXED_FEE_CENTS);
        
        // O Prestador recebe o valor total MENOS a nossa parte
        const providerValue = totalAmountCents - marketplaceValue;

        return {
            total: totalAmountCents,
            marketplace_amount: marketplaceValue,
            provider_amount: providerValue,
            percentage_applied: percentage
        };
    }
}