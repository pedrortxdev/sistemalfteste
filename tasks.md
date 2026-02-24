# Tasks — Sistema LF de Aluguel de Máquinas

> Legenda: `[ ]` pendente · `[/]` em andamento · `[x]` concluído

---

## Fase 0 — Planejamento
- [x] Levantar requisitos completos → `requirements.md`
- [x] Definir arquitetura e design técnico → `design.md`
- [x] Criar lista de tarefas detalhada → `tasks.md`
- [ ] Aprovação do planejamento pelo responsável

---

## Fase 1 — Setup do Projeto
- [ ] Inicializar projeto Next.js 14 com TypeScript
  - [ ] `npx create-next-app@latest` com App Router
  - [ ] Configurar `tsconfig.json` (path aliases `@/`)
  - [ ] Configurar `next.config.js` (imagens, headers)
- [ ] Configurar Docker Compose para PostgreSQL local
  - [ ] Criar `docker-compose.yml`
  - [ ] Verificar conexão com banco
- [ ] Instalar dependências
  - [ ] `prisma`, `@prisma/client`
  - [ ] `next-auth@beta` (v5)
  - [ ] `bcryptjs`
  - [ ] `zod`
  - [ ] `signature_pad`
- [ ] Criar `.env` e `.env.example`
- [ ] Criar arquivo `prisma/schema.prisma` com todos os modelos
- [ ] Executar `prisma migrate dev` — criar tabelas
- [ ] Criar `prisma/seed.ts` — admin padrão + cidade teste
- [ ] Executar seed

---

## Fase 2 — Autenticação e Autorização
- [ ] Configurar NextAuth v5
  - [ ] Criar `src/lib/auth.ts` (providers, callbacks)
  - [ ] Criar `src/app/api/auth/[...nextauth]/route.ts`
  - [ ] Configurar JWT com role e cityId
- [ ] Criar middleware de proteção (`src/middleware.ts`)
  - [ ] Redirecionar não-autenticados para `/login`
  - [ ] Redirecionar autenticados de `/login` para `/dashboard`
- [ ] Criar sistema de permissões (`src/lib/permissions.ts`)
  - [ ] Mapear permissões por papel (ADMIN, GERENTE, OPERADOR)
  - [ ] Função `hasPermission(role, permission)`
- [ ] Criar página de login (`src/app/login/page.tsx`)
  - [ ] Formulário email/senha
  - [ ] Seletor de cidade (para ADMIN)
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
  - [ ] `Header.tsx` — nome da cidade, nome do usuário, logout
  - [ ] `MobileNav.tsx` — bottom navigation, 5 ícones
  - [ ] `CitySelector.tsx` — para ADMIN trocar de cidade ativa
- [ ] Verificar responsividade em 360px, 768px, 1024px

---

## Fase 4 — Módulo de Cidades (Admin)
- [ ] API Route: `src/app/api/cities/route.ts`
  - [ ] GET — listar cidades (admin only)
  - [ ] POST — criar cidade
  - [ ] PUT — editar cidade
  - [ ] DELETE — desativar cidade (soft delete)
- [ ] Página: `src/app/(admin)/cidades/page.tsx`
  - [ ] Tabela com nome, CNPJ, status
  - [ ] Formulário de criação/edição (modal ou inline)
  - [ ] Proteção de permissão (apenas ADMIN)

---

## Fase 5 — Módulo de Usuários (Admin)
- [ ] API Route: `src/app/api/users/route.ts`
  - [ ] GET — listar usuários (admin only)
  - [ ] POST — criar usuário (hash de senha)
  - [ ] PUT — editar usuário
  - [ ] PATCH — ativar/desativar
- [ ] Página: `src/app/(admin)/usuarios/page.tsx`
  - [ ] Tabela com nome, email, papel, cidade, status
  - [ ] Formulário de criação com seleção de papel e cidade
  - [ ] Proteção de permissão (apenas ADMIN)

---

## Fase 6 — Módulo de Máquinas (Estoque)
- [ ] API Routes: `src/app/api/machines/route.ts` e `[id]/route.ts`
  - [ ] GET — listar com filtros (status, categoria, cidade)
  - [ ] GET /:id — detalhes com histórico
  - [ ] POST — criar máquina
  - [ ] PUT — editar máquina
  - [ ] PATCH — alterar status (com registro em MachineStatusHistory)
  - [ ] POST /transfer — transferir para outra cidade
- [ ] Página: `src/app/(admin)/maquinas/page.tsx`
  - [ ] Tabela com nome, modelo, status (badge), preço, total de aluguéis
  - [ ] Filtros: status, categoria
  - [ ] Botões: nova máquina, ver detalhes, alterar status
- [ ] Página: `src/app/(admin)/maquinas/[id]/page.tsx`
  - [ ] Dados completos da máquina
  - [ ] Histórico de status
  - [ ] Histórico de aluguéis
  - [ ] Histórico de manutenções
- [ ] Página: `src/app/(admin)/maquinas/nova/page.tsx`
  - [ ] Formulário com upload de foto (opcional)
- [ ] Upload de foto comprimida (< 200 KB no client)

---

## Fase 7 — Módulo de Clientes
- [ ] API Route: `src/app/api/clients/route.ts`
  - [ ] GET — listar/buscar por nome ou CPF
  - [ ] POST — criar cliente
  - [ ] PUT — editar cliente
- [ ] Página: `src/app/(admin)/clientes/page.tsx`
  - [ ] Tabela com nome, CPF/CNPJ, telefone
  - [ ] Busca rápida
- [ ] Página: `src/app/(admin)/clientes/[id]/page.tsx`
  - [ ] Dados do cliente
  - [ ] Histórico de aluguéis

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

## Fase 9 — Módulo de Pedidos (Aluguel)
- [ ] API Routes: `src/app/api/orders/route.ts` e `[id]/route.ts`
  - [ ] GET — listar pedidos (filtro por status, cidade, cliente)
  - [ ] GET /:id — detalhes com itens
  - [ ] POST — criar pedido (com itens, cálculo automático)
  - [ ] PATCH — alterar status (ativar, finalizar, cancelar)
  - [ ] POST /signature — upload de assinatura
- [ ] Página: `src/app/(admin)/pedidos/page.tsx`
  - [ ] Tabela: cliente, máquinas, valor, status (badge), datas
  - [ ] Filtro por status
- [ ] Página: `src/app/(admin)/pedidos/novo/page.tsx`
  - [ ] Formulário multi-step:
    1. Selecionar/cadastrar cliente
    2. Selecionar máquina(s) disponíveis
    3. Definir datas e calcular valor
    4. Gerar contrato + colher assinatura digital
  - [ ] Auto-seleção de máquinas disponíveis apenas
  - [ ] Cálculo em tempo real (dias × preço)
- [ ] Página: `src/app/(admin)/pedidos/[id]/page.tsx`
  - [ ] Detalhes completos do pedido
  - [ ] Visualizar assinatura
  - [ ] Ações: ativar, finalizar, cancelar
- [ ] Componente `SignaturePad.tsx`
  - [ ] Canvas responsivo
  - [ ] Funcionar por toque em celular
  - [ ] Exportar PNG base64
  - [ ] Botões: limpar, confirmar
- [ ] Integração automática:
  - [ ] Ao ativar: máquina(s) → `ALUGADA`, entrada no caixa
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
  - [ ] Criar ENTRADA ao ativar pedido
  - [ ] Criar SAIDA ao registrar manutenção
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
  - [ ] GET — dados consolidados da cidade (ou todas para ADMIN)
- [ ] Página: `src/app/(admin)/dashboard/page.tsx`
  - [ ] Cards KPI:
    - [ ] Máquinas disponíveis / alugadas / manutenção / estragadas
    - [ ] Faturamento do dia / semana / mês
    - [ ] Custo de manutenção no período
    - [ ] NFes pendentes
  - [ ] Top 5 máquinas mais alugadas (barra CSS)
  - [ ] Pedidos ativos (lista simples)
  - [ ] Para ADMIN: seletor de cidade ou visão consolidada

---

## Fase 13 — Relatórios
- [ ] API Route: `src/app/api/reports/route.ts`
  - [ ] GET /machines — relatório de máquinas (mais alugadas, custos)
  - [ ] GET /maintenance — relatório de manutenção por período
  - [ ] GET /revenue — faturamento por cidade/período
- [ ] Página: `src/app/(admin)/relatorios/page.tsx`
  - [ ] Seletor: tipo de relatório, cidade, período
  - [ ] Tabela com dados
  - [ ] Botão: exportar CSV

---

## Fase 14 — Audit Log
- [ ] Implementar middleware de logging (`src/lib/audit.ts`)
  - [ ] Registrar ações: login, CRUD máquinas, pedidos, caixa, NFe
  - [ ] Capturar: userId, action, entity, entityId, IP, timestamp
- [ ] API Route: `src/app/api/audit/route.ts`
  - [ ] GET — listar logs (admin only, filtro por entidade/período)
- [ ] Acessível em painel admin (opcional como subpágina de relatórios)

---

## Fase 15 — Testes e Validação
- [ ] Testar fluxo completo de login (3 papéis)
- [ ] Testar CRUD de todos os módulos
- [ ] Testar fluxo de aluguel completo (criar → assinar → ativar → finalizar)
- [ ] Testar assinatura digital em celular (toque)
- [ ] Testar fluxo de manutenção (estragada → consertada → impacto no caixa)
- [ ] Testar geração de NFe (mock)
- [ ] Testar permissões (operador não acessa rotas de admin)
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
| 6    | ⬜     | Módulo Máquinas |
| 7    | ⬜     | Módulo Clientes |
| 8    | ⬜     | Módulo Manutenção |
| 9    | ⬜     | Módulo Pedidos |
| 10   | ⬜     | Fluxo de Caixa |
| 11   | ⬜     | NFe |
| 12   | ⬜     | Dashboard |
| 13   | ⬜     | Relatórios |
| 14   | ⬜     | Audit Log |
| 15   | ⬜     | Testes |
| 16   | ⬜     | Polimento |
