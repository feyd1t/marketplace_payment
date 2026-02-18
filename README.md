# API de Pagamentos - Módulo Core

Este projeto contém o backend responsável pela gestão financeira, cálculo de splits e conciliação de pagamentos do Marketplace.

## 🚀 Tecnologias Utilizadas
- **Runtime:** Node.js
- **Framework:** Fastify
- **Linguagem:** TypeScript
- **Banco de Dados:** SQLite (Ambiente de Dev) / Prisma ORM

## 📋 Funcionalidades Implementadas (Fase 1)

### 1. Gestão de Prestadores
- Listagem de prestadores ativos.
- Estrutura pronta para validação de dados bancários.

### 2. Motor de Transações (Split de Pagamentos)
- Cálculo automático da comissão do Marketplace.
- Regra de negócio dinâmica:
  - Padrão: 10% de taxa.
  - Exceção (Pintura/SP): 8% de taxa.
- Taxas fixas aplicadas automaticamente (R$ 0,50 por transação).

### 3. Automação de Status (Webhooks)
- Endpoint `/webhooks/iugu` configurado para receber notificações de gateways de pagamento.
- Atualização automática de status no banco de dados (`PENDING` -> `PAID`) baseada no `external_id` da fatura.

### 4. Gestão de Saldo (Extrato)
- Cálculo em tempo real do saldo do prestador.
- Segregação de valores:
  - **Saldo Disponível:** Valores de transações já liquidadas.
  - **Saldo a Receber:** Valores previstos (serviços agendados/pendentes).

## 🛠 Como Rodar o Projeto

1. Instale as dependências:
   `npm install`

2. Prepare o Banco de Dados:
   `npx prisma migrate dev`

3. Inicie o Servidor:
   `npm run dev` (ou `npx tsx src/server.ts`)

4. Testes de Integração:
   Utilize o arquivo `api.http` incluído na raiz para testar os fluxos de criação de transação, simulação de webhook e consulta de saldo.