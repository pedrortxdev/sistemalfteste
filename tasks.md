# Tasks — Sistema LF de Aluguel de Máquinas

> Legenda: `[ ]` pendente · `[/]` em andamento · `[x]` concluído

---

## Fase 0 — Planejamento
- [x] Levantar requisitos completos → `requirements.md`
- [x] Definir arquitetura e design técnico → `design.md`
- [x] Criar lista de tarefas detalhada → `tasks.md`
- [x] Revisão 1: SQLite, 2 papéis, login automático por cidade, frete
- [x] Revisão 2: Operador cria/edita clientes, endereço casa vs. obra, solicitação de envio de máquinas
- [x] Aprovação final para iniciar implementação

---

## Fase 1 — Setup do Projeto
- [x] Inicializar projeto Next.js 14 com TypeScript
  - [x] `npm create next-app@latest` com App Router (Sem Tailwind, com src/ directory)
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
- [x] Adicionar scripts do prisma no `package.json` para evitar uso do `npx`
- [x] Executar migrate (`npm run prisma:migrate`) — criar banco SQLite
- [x] Criar `prisma/seed.ts` — DONO padrão + cidade teste
- [x] Executar seed (`npm run prisma:seed`)

---

## Fase 2 — Autenticação e Autorização
- [x] Configurar NextAuth v5
  - [x] Criar `src/lib/auth.ts` (credentials provider, callbacks JWT)
  - [x] Criar `src/app/api/auth/[...nextauth]/route.ts`
  - [x] JWT com: role, cityId, cityName (cidade fixa do cadastro)
- [x] Criar middleware de proteção (`src/middleware.ts`)
  - [x] Redirecionar não-autenticados para `/login`
  - [x] Redirecionar autenticados de `/login` para `/dashboard`
- [x] Criar sistema de permissões (`src/lib/permissions.ts`)
  - [x] Dois papéis: DONO (tudo) e OPERADOR (operacional)
  - [x] Permissões: clients:write, machines:write, transfers:request, orders, maintenance, cashflow, nfe:view, reports, csv
  - [x] DONO-only: cities:manage, users:manage, machines:transfer, transfers:approve, nfe:config
- [x] Criar página de login (`src/app/login/page.tsx`)
  - [x] Formulário: apenas email + senha (sem seletor de cidade)
  - [x] Feedback de erro
  - [x] Responsivo mobile

---

## Fase 3 — Layout e Componentes Base
- [x] Criar sistema de estilos
  - [x] `src/styles/globals.css` — Tailwind directives, variáveis base CSS, tipografia
  - [x] Configurar `tailwind.config.ts` e `postcss.config.js`
- [x] Criar componentes UI base
  - [x] `Button.tsx` — variantes: primary, secondary, danger, ghost
  - [x] `Input.tsx` — label integrado, estado de erro
  - [x] `Select.tsx` — nativo `<select>` com estilo custom
  - [x] `Badge.tsx` — status com cores via Tailwind
  - [x] `Card.tsx` — container com borda, header, content
- [x] Criar layout admin (`src/app/(admin)/layout.tsx`)
  - [x] `Sidebar.tsx` — desktop flex sidebar com navegação via Lucide
  - [x] `Header.tsx` — navbar do topo informando a cidade atual e usuário
  - [x] `MobileNav.tsx` — bottom navigation com UX Native-like
- [x] Verificar responsividade e UX de "simulação de app" nativa (ocultação de scrollbars, flex grids p/ mobile)

---

## Fase 4 — Módulo Cidades (CRUD DONO)
- [x] Criar validação de schema (`src/lib/validations/city.ts`) com `zod`
- [x] Criar server actions (`src/app/(admin)/cidades/actions.ts`)
  - [x] Verificar `isDono()` nas actions
  - [x] `createCity`, `updateCity`, `toggleCityActive`
- [x] Criar interface
  - [x] `page.tsx` — Listagem com os cards (Server Component) restrita `isDono()`
  - [x] `CityCard.tsx` — Componente interativo com soft-delete visual.
  - [x] `NewCityModal.tsx` e `CityForm.tsx` — Modal client side com actions.ge.tsx`
- [ ] Página: `src/app/(admin)/cidades/page.tsx`
  - [ ] Tabela com nome, CNPJ, status
  - [ ] Formulário de criação/edição (modal ou inline)
  - [ ] Proteção de permissão (apenas DONO)

---

## Fase 5 — Módulo de Usuários do Sistema (DONO only)
- [x] API Route/Actions: `src/app/(admin)/usuarios/actions.ts`
  - [x] Criar validação de schema Zod (`userSchema`)
  - [x] POST — criar usuário (hash de senha, vincular a cidade)
  - [x] PUT — editar usuário
  - [x] PATCH — ativar/desativar
- [x] Página: `src/app/(admin)/usuarios/page.tsx`
  - [x] Tabela com nome, email, papel (DONO/OPERADOR), cidade, status
  - [x] Formulário de criação com seleção de papel e cidade (`UserForm.tsx` em modal)
  - [x] Proteção de permissão verificando `isDono()`

---

## Fase 6 — Módulo de Máquinas (Estoque e Transferências)
- [x] Validação de schema Zod: `src/lib/validations/machine.ts`
- [x] Server Actions: `src/app/(admin)/maquinas/actions.ts`
  - [x] `createMachine` (vincula automaticamente à cidade do usuário, se operador)
  - [x] `updateMachine`
  - [x] `updateMachineStatus` (registra no MachineStatusHistory)
  - [x] `requestTransfer` (OPERADOR pede máquina de outra unidade)
  - [x] `approveTransfer` (DONO aprova)
- [x] Página de Listagem: `src/app/(admin)/maquinas/page.tsx`
  - [x] Tabela/Cards filtrando apenas máquinas da cidade (se Operador)
  - [x] Formulário modal de Criação com upload de imagem e resize client-side
- [x] Página Detalhes da Máquina: `src/app/(admin)/maquinas/[id]/page.tsx`
  - [x] Dados completos da máquina e seu status atual
  - [x] Histórico de Mudanças de Status
- [x] Painel de Solicitações: `src/app/(admin)/transferencias/page.tsx`
  - [x] Lista de transferências separadas por aprovar/rejeitar (DONO vs OPERADOR)

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

## Fase 11 — Módulo de NFe (PULAR)
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

## Fase 14 — Audit Log / Sistema de LOG
- [ ] Implementar middleware ou action base para logging (`src/lib/audit.ts`)
- [ ] Conectar os botões do formulário às tabelas para gravar o `{userId}` de quem operou
- [ ] Salvar dados de IP caso necessário, e salvar Action Executada.
- [ ] API Route ou Action: `src/app/api/audit/route.ts` ou Sever Component
- [ ] View: Listar Logs (`/relatorios/auditoria`) — (DONO only, filtro por usuário / ação)

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
| 1    | ✅     | Setup do Projeto |
| 2    | ✅     | Autenticação |
| 3    | ✅     | Layout e Componentes |
| 4    | ✅     | Módulo Cidades |
| 5    | ✅     | Módulo Usuários |
| 6    | ✅     | Módulo Máquinas + Solicitações de Envio |
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
