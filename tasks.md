# Tasks — Sistema LF de Aluguel de Máquinas

> Legenda: `[ ]` pendente · `[/]` em andamento · `[x]` concluído

---

## Fase 0 — Planejamento
- [x] Levantar requisitos completos → `requirements.md`
- [x] Definir arquitetura e design técnico → `design.md`
- [x] Criar lista de tarefas detalhada → `tasks.md`
- [x] Revisão 1: SQLite, 2 papéis, login automático por cidade, frete
- [x] Revisão 2: Operador cria/edita clientes, endereço casa vs. obra, solicitação de envio de máquinas
- [ ] Aprovação final para iniciar implementação

---

## Fase 1 — Setup do Projeto
- [x] Inicializar projeto Next.js 14 com TypeScript
  - [x] `npx create-next-app@latest` com App Router
  - [x] Configurar `tsconfig.json` (path aliases `@/`)
  - [x] Configurar `next.config.js` (imagens, headers)
- [x] Instalar dependências
  - [x] `prisma`, `@prisma/client`
  - [x] `next-auth@beta` (v5)
  - [x] `bcryptjs`, `@types/bcryptjs`
  - [x] `zod`
  - [x] `signature_pad`
- [x] Criar `.env` e `.env.example`
  - [x] `DATABASE_URL="file:./dev.db"`
  - [x] `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - [x] `NFE_PROVIDER="mock"`
- [x] Criar arquivo `prisma/schema.prisma` com todos os modelos (SQLite, Strings no lugar de enums)
- [x] Executar `npx prisma migrate dev` — criar banco SQLite
- [x] Criar `prisma/seed.ts` — DONO padrão + cidade teste
- [x] Executar seed (`npx prisma db seed`)

---

## Fase 2 — Autenticação e Autorização
- [ ] Configurar NextAuth v5
  - [ ] Criar `src/lib/auth.ts` (credentials provider, callbacks JWT)
  - [ ] Criar `src/app/api/auth/[...nextauth]/route.ts`
  - [ ] JWT com: role, cityId, cityName (cidade fixa do cadastro)
- [ ] Criar middleware de proteção (`src/middleware.ts`)
  - [ ] Redirecionar não-autenticados para `/login`
  - [ ] Redirecionar autenticados de `/login` para `/dashboard`
- [ ] Criar sistema de permissões (`src/lib/permissions.ts`)
  - [ ] Dois papéis: DONO (tudo) e OPERADOR (operacional)
  - [ ] Permissões: clients:write, machines:write, transfers:request, orders, maintenance, cashflow, nfe:view, reports, csv
  - [ ] DONO-only: cities:manage, users:manage, machines:transfer, transfers:approve, nfe:config
- [ ] Criar página de login (`src/app/login/page.tsx`)
  - [ ] Formulário: apenas email + senha (sem seletor de cidade)
  - [ ] Feedback de erro
  - [ ] Responsivo mobile

---

## Fase 3 — Layout e Componentes Base
- [ ] Criar sistema de estilos
  - [ ] `src/styles/globals.css` — Reset, variáveis CSS, tipografia
  - [ ] `src/styles/layout.module.css` — Sidebar, header, grid
  - [ ] `src/styles/components.module.css` — Botões, inputs, badges, cards
- [ ] Criar componentes UI base
  - [ ] `Button.tsx` — variantes: primary, secondary, danger, ghost
  - [ ] `Input.tsx` — label integrado, estado de erro
  - [ ] `Select.tsx` — nativo `<select>` estilizado
  - [ ] `Table.tsx` — responsiva (scroll horizontal em mobile)
  - [ ] `Modal.tsx` — client component, confirmação
  - [ ] `Badge.tsx` — status com cores
  - [ ] `Card.tsx` — container com borda
  - [ ] `Pagination.tsx` — via query params, SSR
- [ ] Criar layout admin (`src/app/(admin)/layout.tsx`)
  - [ ] `Sidebar.tsx` — desktop, links de navegação com ícones SVG
  - [ ] `Header.tsx` — nome da cidade (automático), nome do usuário, logout
  - [ ] `MobileNav.tsx` — bottom navigation, 5 ícones
  - [ ] Para DONO: seletor de cidade no header para navegar entre cidades
- [ ] Verificar responsividade em 360px, 768px, 1024px

---

## Fase 4 — Módulo de Cidades (DONO only)
- [ ] API Route: `src/app/api/cities/route.ts`
  - [ ] GET — listar cidades (DONO only)
  - [ ] POST — criar cidade
  - [ ] PUT — editar cidade
  - [ ] DELETE — desativar cidade (soft delete)
- [ ] Página: `src/app/(admin)/cidades/page.tsx`
  - [ ] Tabela com nome, CNPJ, status
  - [ ] Formulário de criação/edição (modal ou inline)
  - [ ] Proteção de permissão (apenas DONO)

---

## Fase 5 — Módulo de Usuários do Sistema (DONO only)
- [ ] API Route: `src/app/api/users/route.ts`
  - [ ] GET — listar usuários (DONO only)
  - [ ] POST — criar usuário (hash de senha, vincular a cidade fixa)
  - [ ] PUT — editar usuário
  - [ ] PATCH — ativar/desativar
- [ ] Página: `src/app/(admin)/usuarios/page.tsx`
  - [ ] Tabela com nome, email, papel (DONO/OPERADOR), cidade, status
  - [ ] Formulário de criação com seleção de papel e cidade
  - [ ] Proteção de permissão (apenas DONO)

---

## Fase 6 — Módulo de Máquinas (Estoque)
- [ ] API Routes: `src/app/api/machines/route.ts` e `[id]/route.ts`
  - [ ] GET — listar com filtros (status, categoria) — filtra por cidade do usuário
  - [ ] GET /:id — detalhes com histórico
  - [ ] POST — criar máquina (na cidade do usuário)
  - [ ] PUT — editar máquina
  - [ ] PATCH — alterar status (com registro em MachineStatusHistory)
  - [ ] POST /transfer — transferir para outra cidade (DONO only)
- [ ] API Routes: `src/app/api/transfers/route.ts`
  - [ ] GET — listar solicitações (OPERADOR: as suas; DONO: todas pendentes)
  - [ ] POST — criar solicitação de envio (OPERADOR solicita máquina para sua cidade)
  - [ ] PATCH — aprovar/rejeitar solicitação (DONO only) → se aprovada, transfere máquina
- [ ] Página: `src/app/(admin)/maquinas/page.tsx`
  - [ ] Tabela com nome, modelo, status (badge), preço, total de aluguéis
  - [ ] Filtros: status, categoria
  - [ ] Botões: nova máquina, ver detalhes, alterar status
  - [ ] Botão: "Solicitar envio" (OPERADOR pode pedir máquina de outra cidade)
- [ ] Página: `src/app/(admin)/maquinas/[id]/page.tsx`
  - [ ] Dados completos da máquina
  - [ ] Histórico de status
  - [ ] Histórico de aluguéis
  - [ ] Histórico de manutenções
- [ ] Página: `src/app/(admin)/maquinas/nova/page.tsx`
  - [ ] Formulário com upload de foto (opcional)
- [ ] Upload de foto comprimida (< 200 KB no client)
- [ ] Seção de solicitações de envio (para DONO: aprovar/rejeitar pendentes)

---

## Fase 7 — Módulo de Clientes
- [ ] API Route: `src/app/api/clients/route.ts`
  - [ ] GET — listar/buscar por nome ou CPF
  - [ ] POST — criar cliente (OPERADOR e DONO)
  - [ ] PUT — editar cliente (OPERADOR e DONO)
- [ ] Página: `src/app/(admin)/clientes/page.tsx`
  - [ ] Tabela com nome, CPF/CNPJ, telefone, endereço de casa
  - [ ] Busca rápida
- [ ] Página: `src/app/(admin)/clientes/[id]/page.tsx`
  - [ ] Dados do cliente (incluindo endereço residencial)
  - [ ] Histórico de aluguéis (com endereço da obra de cada pedido)
- [ ] Formulário de cliente:
  - [ ] Nome, CPF/CNPJ, telefone, email
  - [ ] **Endereço residencial (casa)** — campo fixo no cadastro

---

## Fase 8 — Módulo de Manutenção
- [ ] API Route: `src/app/api/maintenance/route.ts`
  - [ ] GET — listar manutenções (filtro por máquina, cidade, status)
  - [ ] POST — registrar manutenção (muda status da máquina)
  - [ ] PATCH — marcar como resolvida (muda status da máquina para DISPONIVEL)
- [ ] Página: `src/app/(admin)/manutencao/page.tsx`
  - [ ] Tabela: máquina, tipo, custo, data, status
  - [ ] Dashboard: total estragadas vs. consertadas
  - [ ] Filtro por período
- [ ] Página: `src/app/(admin)/manutencao/[id]/page.tsx`
  - [ ] Detalhes da manutenção
  - [ ] Ação: marcar como resolvida
- [ ] Integração com caixa: registrar saída automática ao criar manutenção

---

## Fase 9 — Módulo de Pedidos (Aluguel + Frete)
- [ ] API Routes: `src/app/api/orders/route.ts` e `[id]/route.ts`
  - [ ] GET — listar pedidos (filtro por status, cidade, cliente)
  - [ ] GET /:id — detalhes com itens, frete e endereço da obra
  - [ ] POST — criar pedido (com itens + frete + endereço da obra, cálculo automático)
  - [ ] PATCH — alterar status (ativar, finalizar, cancelar)
  - [ ] POST /signature — upload de assinatura
- [ ] Página: `src/app/(admin)/pedidos/page.tsx`
  - [ ] Tabela: cliente, máquinas, valor total (aluguel + frete), status (badge), datas
  - [ ] Filtro por status
- [ ] Página: `src/app/(admin)/pedidos/novo/page.tsx`
  - [ ] Formulário multi-step:
    1. Selecionar/cadastrar cliente
    2. Selecionar máquina(s) disponíveis
    3. Definir datas e calcular valor de aluguel
    4. **Endereço da obra** (pré-preenche com endereço do cliente, mas editável)
    5. **Frete**: valor do frete
    6. Resumo (aluguel + frete = total)
    7. Gerar contrato + colher assinatura digital
  - [ ] Auto-seleção de máquinas disponíveis apenas
  - [ ] Cálculo em tempo real (dias × preço + frete)
- [ ] Página: `src/app/(admin)/pedidos/[id]/page.tsx`
  - [ ] Detalhes completos (incluindo endereço da obra e frete)
  - [ ] Visualizar assinatura
  - [ ] Ações: ativar, finalizar, cancelar
- [ ] Componente `SignaturePad.tsx`
  - [ ] Canvas responsivo
  - [ ] Funcionar por toque em celular
  - [ ] Exportar PNG base64
  - [ ] Botões: limpar, confirmar
- [ ] Integração automática:
  - [ ] Ao ativar: máquina(s) → `ALUGADA`, entrada no caixa (aluguel + frete separados)
  - [ ] Ao finalizar: máquina(s) → `DISPONIVEL`
  - [ ] Ao cancelar: reverter status das máquinas

---

## Fase 10 — Módulo de Fluxo de Caixa
- [ ] API Route: `src/app/api/cashflow/route.ts`
  - [ ] GET — listar movimentações (filtro por cidade, tipo, período)
  - [ ] POST — criar movimentação manual
  - [ ] GET /summary — saldo e totais por período
- [ ] Página: `src/app/(admin)/caixa/page.tsx`
  - [ ] Saldo atual da cidade
  - [ ] Tabela: data, tipo, categoria, valor, descrição, pedido/manutenção vinculado
  - [ ] Filtro: período (dia/semana/mês), tipo (entrada/saída)
  - [ ] Resumo: total entradas, total saídas, saldo
  - [ ] Botão: exportar CSV
  - [ ] Botão: nova movimentação manual
- [ ] Movimentações automáticas:
  - [ ] Criar ENTRADA (categoria "ALUGUEL") ao ativar pedido
  - [ ] Criar ENTRADA (categoria "FRETE") ao ativar pedido com frete > 0
  - [ ] Criar SAIDA (categoria "MANUTENCAO") ao registrar manutenção
- [ ] Exportação CSV

---

## Fase 11 — Módulo de NFe
- [ ] Service: `src/lib/nfe-service.ts`
  - [ ] Interface `NFeProvider` (emit, cancel, getXml)
  - [ ] `MockNFeProvider` — simula emissão (para dev)
  - [ ] Preparar estrutura para `FocusNFeProvider` (integração real futura)
- [ ] API Route: `src/app/api/nfe/route.ts`
  - [ ] GET — listar NFes (filtro por cidade, data, status)
- [ ] API Route: `src/app/api/nfe/cron/route.ts`
  - [ ] POST — endpoint de CRON (protegido por secret header)
  - [ ] Lógica: buscar pedidos do dia → agrupar → emitir → salvar
- [ ] Página: `src/app/(admin)/nfe/page.tsx`
  - [ ] Tabela: data, cidade, status (badge), qtd pedidos
  - [ ] Ação: retentar emissão em caso de erro
  - [ ] Visualizar XML (link/download)
- [ ] Configurar CRON schedule
  - [ ] Para dev: botão manual "Gerar NFes do dia"
  - [ ] Para prod: Vercel Cron ou `node-cron`

---

## Fase 12 — Dashboard
- [ ] API Route: `src/app/api/dashboard/route.ts`
  - [ ] GET — dados consolidados da cidade (ou todas para DONO)
- [ ] Página: `src/app/(admin)/dashboard/page.tsx`
  - [ ] Cards KPI:
    - [ ] Máquinas disponíveis / alugadas / manutenção / estragadas
    - [ ] Faturamento do dia / semana / mês (inclui frete)
    - [ ] Custo de manutenção no período
    - [ ] NFes pendentes
  - [ ] Top 5 máquinas mais alugadas (barra CSS)
  - [ ] Pedidos ativos (lista simples)
  - [ ] Para DONO: visão consolidada + solicitações de envio pendentes

---

## Fase 13 — Relatórios
- [ ] API Route: `src/app/api/reports/route.ts`
  - [ ] GET /machines — relatório de máquinas (mais alugadas, custos)
  - [ ] GET /maintenance — relatório de manutenção por período
  - [ ] GET /revenue — faturamento por cidade/período (aluguel + frete)
- [ ] Página: `src/app/(admin)/relatorios/page.tsx`
  - [ ] Seletor: tipo de relatório, período
  - [ ] Tabela com dados
  - [ ] Botão: exportar CSV

---

## Fase 14 — Audit Log
- [ ] Implementar middleware de logging (`src/lib/audit.ts`)
  - [ ] Registrar ações: login, CRUD máquinas, pedidos, caixa, NFe, transferências
  - [ ] Capturar: userId, action, entity, entityId, IP, timestamp
- [ ] API Route: `src/app/api/audit/route.ts`
  - [ ] GET — listar logs (DONO only, filtro por entidade/período)
- [ ] Acessível em painel admin (opcional como subpágina de relatórios)

---

## Fase 15 — Testes e Validação
- [ ] Testar fluxo completo de login (2 papéis: DONO e OPERADOR)
- [ ] Verificar que operador vê apenas dados da sua cidade
- [ ] Testar CRUD de clientes (operador cria/edita, endereço de casa)
- [ ] Testar CRUD de todos os módulos
- [ ] Testar fluxo de aluguel completo (criar → endereço obra → frete → assinar → ativar → finalizar)
- [ ] Testar solicitação de envio de máquina (operador solicita → DONO aprova)
- [ ] Testar assinatura digital em celular (toque)
- [ ] Testar fluxo de manutenção (estragada → consertada → impacto no caixa)
- [ ] Testar geração de NFe (mock)
- [ ] Testar permissões (operador não acessa cidades/usuários)
- [ ] Testar responsividade (360px, 768px, 1024px)
- [ ] Testar performance (Lighthouse mobile)
- [ ] Validar bundle size por rota (< 100 KB)

---

## Fase 16 — Polimento Final
- [ ] Revisar toda a UI em mobile
- [ ] Garantir feedback de loading em todas as ações
- [ ] Mensagens de erro e sucesso consistentes
- [ ] Tratamento de estados vazios (tabelas sem dados)
- [ ] Revisar segurança (CSRF, rate limiting, XSS)
- [ ] Documentação de deploy
- [ ] `.env.example` completo
- [ ] README.md com instruções de setup

---

## Resumo de Progresso

| Fase | Status | Descrição |
|------|--------|-----------|
| 0    | ✅     | Planejamento |
| 1    | ⬜     | Setup do Projeto |
| 2    | ⬜     | Autenticação |
| 3    | ⬜     | Layout e Componentes |
| 4    | ⬜     | Módulo Cidades |
| 5    | ⬜     | Módulo Usuários |
| 6    | ⬜     | Módulo Máquinas + Solicitações de Envio |
| 7    | ⬜     | Módulo Clientes (endereço casa/obra) |
| 8    | ⬜     | Módulo Manutenção |
| 9    | ⬜     | Módulo Pedidos + Frete + Endereço Obra |
| 10   | ⬜     | Fluxo de Caixa |
| 11   | ⬜     | NFe |
| 12   | ⬜     | Dashboard |
| 13   | ⬜     | Relatórios |
| 14   | ⬜     | Audit Log |
| 15   | ⬜     | Testes |
| 16   | ⬜     | Polimento |
