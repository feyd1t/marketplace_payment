📑 Documentação Técnica: Sistema de Checkout e Split de Pagamentos
Projeto: Marketplace Payment Core

Desenvolvedor: Guilherme Muniz

Status: Versão 1.0 - Homologada e Testada

1. Visão Geral do Projeto
Este projeto consiste em um core de pagamentos para um marketplace de serviços. O objetivo principal é automatizar a criação de cobranças (via Pix/Iugu) e realizar o split de valores (divisão de comissão) entre a plataforma e os prestadores de serviço, seguindo regras dinâmicas de impostos e taxas.

2. Stack Tecnológica
Runtime: Node.js com TypeScript

Framework: Fastify (escolhido pela alta performance e baixo overhead)

ORM: Prisma (garantia de integridade e tipagem no banco de dados)

Banco de Dados: PostgreSQL via Docker

Validação: Zod (validação rigorosa de contratos de API)

Gateway de Pagamento: Iugu (Integração via API REST)

3. O Mapa do Fluxo Financeiro
O fluxo foi desenhado para garantir que a plataforma nunca perca sua margem e o prestador receba o valor líquido correto.

Regras de Negócio aplicadas:
Taxa de Intermediação: A plataforma retém uma porcentagem fixa sobre o valor bruto.

Impostos (ISS): Calculados dinamicamente com base no state (Estado) onde o serviço foi prestado.

Cálculo de Split: * Plataforma = (Valor Bruto * Taxa) + Imposto

Prestador = Valor Bruto - Plataforma

4. Linha do Tempo de Desenvolvimento
Fase 1: Infraestrutura e Modelagem (Dia 1)
Configuração do ambiente Docker com PostgreSQL.

Modelagem do banco de dados utilizando Prisma:

Provider: Dados do prestador e credenciais.

Transaction: Registro de cada venda, armazenando marketplaceFee e providerAmount de forma segregada.

Fase 2: Regras de Negócio e Gateway (Dia 2)
Implementação do CommissionService: Lógica pura para cálculo de taxas e tributos.

Implementação do IuguService: Comunicação externa para geração de faturas reais com QR Code Pix.

Fase 3: Integração e Refatoração (Final)
Criação das rotas de API.

Ajuste de Tipagem: Refatoração do mapeamento entre o código e o banco (correção do campo marketplaceFee).

Homologação: Testes de ponta a ponta (End-to-End) garantindo o status 201 Created.

5. Documentação da API
Criar Prestador
POST /providers

JSON
{
  "name": "Nome do Prestador",
  "email": "email@teste.com",
  "password": "hash"
}
Criar Transação (Checkout)
POST /transactions

Ação: Calcula o split, gera a fatura na Iugu e salva no banco local.

JSON
{
  "amount": 5000,
  "providerId": "UUID-DO-PRESTADOR",
  "description": "Serviço de Pintura",
  "category": "PINTURA",
  "state": "SP"
}
Consulta de Saldo
GET /providers/:id/balance

Retorna os valores disponíveis (pagos) e pendentes (aguardando pagamento).

6. Desafios Técnicos e Soluções 
Durante o desenvolvimento, enfrentamos desafios comuns em sistemas de missão crítica:

Sincronização de Schema: Ajustamos a discrepância entre os nomes de variáveis do código (platformAmount) e os nomes de colunas do banco de dados (marketplaceFee), garantindo que o Prisma pudesse persistir os dados sem falhas.

Integração Externa: Tratamos a resposta assíncrona do Gateway para capturar o externalId, permitindo a conciliação futura via Webhooks.

7. Como Rodar o Projeto
Subir o banco de dados: docker-compose up -d

Instalar dependências: npm install

Sincronizar banco: npx prisma db push

Rodar servidor: npx tsx src/server.ts

Conclusão: O sistema encontra-se estável, com validação de dados em todas as camadas e pronto para processar transações financeiras com separação de responsabilidades.