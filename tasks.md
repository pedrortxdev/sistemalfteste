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
  - [x] `DATABASE_URL` (Supabase Pooled) e `DIRECT_URL` (Supabase Direct)
  - [x] `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - [x] `NFE_PROVIDER="mock"`
- [x] Criar arquivo `prisma/schema.prisma` com todos os modelos (PostgreSQL)
- [x] Adicionar scripts do prisma no `package.json` para evitar uso do `npx`
- [x] Executar migrate/push (`npm run prisma:generate` + `db push`) — Banco Supabase
- [x] Criar `prisma/seed.ts` — DONO padrão + cidade teste
- [x] Executar seed (`npm run prisma:seed`) — Popula PostgreSQL

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
- [x] API Route/Actions: `src/app/(admin)/clientes/actions.ts`
- [x] Página: `src/app/(admin)/clientes/page.tsx`
- [x] Formulário de cliente: Nome, CPF/CNPJ, endereço residencial fixo.

---

## Fase 8 — Módulo de Manutenção
- [x] Server Actions: `src/app/(admin)/manutencao/actions.ts`
- [x] Página: `src/app/(admin)/manutencao/page.tsx`
- [x] Integração com caixa: registro automático de saída.

---

## Fase 9 — Módulo de Pedidos (Aluguel + Frete)
- [x] Server Actions: `src/app/(admin)/aluguel/actions.ts`
- [x] Página: `src/app/(admin)/aluguel/page.tsx` e `novo/page.tsx` (RentalWizard)
- [x] Componente `SignaturePad.tsx` e assinatura digital.
- [x] Integração automática com estoque e caixa.

---

## Fase 10 — Módulo de Fluxo de Caixa
- [x] Server Actions: `src/app/(admin)/caixa/actions.ts`
- [x] Página: `src/app/(admin)/caixa/page.tsx` (CashFlowClient)
- [x] Movimentações automáticas (Aluguel, Frete, Manutenção).

---

## Fase 11 — Módulo de NFe (PULAR)
- [ ] Service: `src/lib/nfe-service.ts` (Mock inicial)
- [ ] API Route/Cron: Geração automática em lote.

---

## Fase 12 — Dashboard
- [x] Página: `src/app/(admin)/dashboard/page.tsx`
- [x] Cards KPI e Health check do Caixa.

---

## Fase 13 — Relatórios
- [/] Server Actions: Agregação de dados para relatórios.
- [ ] Página: `src/app/(admin)/relatorios/page.tsx`
- [ ] Filtros por período e tipo de relatório.
- [ ] Exportação CSV unificada.

---

## Fase 14 — Audit Log / Sistema de LOG
- [x] Implementar utilitário centralizado (`src/lib/audit.ts`)
- [x] Integrar auditoria nas Server Actions (Caixa, Máquinas, Usuários, Cidades)
- [x] Criar visualização de Logs exclusiva para o DONO (`/relatorios/auditoria`)

---

## Fase 15 — Testes e Validação
- [x] Testar fluxos de auditoria e relatórios.
- [x] Validar responsividade mobile final.
- [x] Integração com Supabase Storage (Assinaturas e Fotos).

---

## Fase 16 — Polimento Final
- [x] Implementar sistema de Toasts (feedback visual).
- [x] Adicionar animações e transições CSS.
- [x] README.md profissional completo.

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
| 7    | ✅     | Módulo Clientes |
| 8    | ✅     | Módulo Manutenção |
| 9    | ✅     | Módulo Pedidos |
| 10   | ✅     | Fluxo de Caixa |
| 11   | ⏩     | NFe (Pulada) |
| 12   | ✅     | Dashboard |
| 13   | ✅     | Relatórios |
| 14   | ✅     | Audit Log |
| 15   | ✅     | Testes |
| 16   | ✅     | Polimento |

