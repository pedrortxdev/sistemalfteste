# Sistema LF - Aluguel de Máquinas 🚜

Sistema administrativo robusto para gestão de locação de equipamentos, controle de estoque, fluxo de caixa e auditoria multilocatário (multicidades).

## 🚀 Tecnologias Utilizadas

- **Framework:** Next.js 14/15 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Estilização:** Tailwind CSS v4 + ShadcnUI (Modals/Dialogs)
- **Autenticação:** NextAuth.js v5
- **Armazenamento:** Supabase Storage (Assinaturas e Fotos)
- **Ícones:** Lucide React

## ✨ Funcionalidades Principais

- **Gestão de Estoque:** Cadastro de máquinas com fotos, controle de status (Disponível, Alugada, Manutenção, Estragada).
- **Locação:** Wizard de aluguel multi-etapa com cálculo automático de frete, diárias e **assinatura digital** no celular.
- **Financeiro:** Fluxo de caixa automático (integrado a aluguéis e manutenções) e lançamentos manuais.
- **Relatórios:** Dashboards inteligentes, relatórios de faturamento por filial e exportação para CSV.
- **Segurança:** Log de Auditoria completo para ações críticas e controle de permissões (DONO vs OPERADOR).
- **Logística:** Sistema de solicitação de transferência de máquinas entre filiais com aprovação do dono.

## 🛠️ Configuração do Ambiente

1.  **Clone o repositório:**
    ```bash
    git clone [url-do-repositorio]
    cd paginas
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Variáveis de Ambiente:**
    Crie um arquivo `.env` baseado no `.env.example` e preencha as chaves do Supabase e NextAuth.

4.  **Banco de Dados:**
    ```bash
    npx prisma db push
    npm run prisma:seed
    ```

5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

## 🔐 Credenciais Padrão (Seed)

- **Login:** `admin@lfaluguel.com`
- **Senha:** (Definida no arquivo `prisma/seed.ts`)

## 📱 Mobile-First

O sistema foi desenhado para ser operado no pátio, diretamente do celular dos operadores, com interface otimizada para toque e performance em dispositivos com 1GB de RAM.

## 📄 Licença

Este projeto é de uso restrito da LF Aluguel de Máquinas.
