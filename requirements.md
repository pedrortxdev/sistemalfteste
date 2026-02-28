# Requirements — Sistema de Aluguel de Máquinas (LF)

## 1. Visão Geral

Sistema administrativo web para empresa de aluguel de máquinas, operando em múltiplas cidades. O sistema gerencia estoque de máquinas, fluxo de caixa, emissão de NFe, manutenção, frete e pedidos de aluguel com assinatura digital. Não há área pública — apenas painel admin.

---

## 2. Stack Tecnológica

| Camada        | Tecnologia                                  |
| ------------- | ------------------------------------------- |
| Frontend      | Next.js 14 (App Router, RSC)                |
| Backend / API | Next.js API Routes (Route Handlers)         |
| Banco de Dados| **PostgreSQL** via Supabase (Prisma ORM)    |
| Auth          | NextAuth.js v5 (credentials provider)       |
| UI            | Tailwind CSS v4 + ShadcnUI/Radix    |
| Assinatura    | Canvas HTML5 (signature_pad)                |
| NFe           | Integração com API SEFAZ (ou lib nfe.io)    |
| Deploy        | Vercel-compatible / bare-metal              |

> **Nota sobre performance**: O sistema deve rodar em celulares com 1 GB RAM (Samsung J5). Isso implica: uso tático de Server Components na maioria absoluta da navegação, e uso de modals Radix pra interatividade isolada. O JavaScript bruto e CSS são minificados no build.

> **Nota sobre Banco de Dados**: Escolhido Supabase PostgreSQL por escalabilidade, persistência gerenciada e facilidade de deploy. O Prisma abstrai a diferença.

---

## 3. Requisitos Funcionais

### 3.1. Autenticação e Autorização

| ID     | Requisito                                                                 |
| ------ | ------------------------------------------------------------------------- |
| AUTH-1 | Login por email/senha — sem seleção de cidade (automático)                |
| AUTH-2 | **Dois níveis de permissão**: `DONO` (acesso total a tudo em todas as cidades) e `OPERADOR` (acessa apenas a cidade vinculada, com amplas permissões operacionais) |
| AUTH-3 | Usuário é cadastrado vinculado a **uma cidade fixa** — ao logar, acessa apenas dados daquela cidade automaticamente |
| AUTH-4 | DONO acessa todas as cidades (dashboard consolidado + pode navegar entre cidades) |
| AUTH-5 | Proteção de rotas (middleware Next.js) — redireciona para login se não autenticado |
| AUTH-6 | Sessão com JWT, expiração de 8h, refresh automático                       |
| AUTH-7 | DONO pode criar/editar/desativar usuários em **qualquer** cidade          |
| AUTH-8 | **OPERADOR pode criar/editar clientes na sua própria cidade**             |
| AUTH-9 | Log de login (IP, horário, cidade)                                        |

### 3.2. Gestão de Cidades

| ID     | Requisito                                                    |
| ------ | ------------------------------------------------------------ |
| CID-1  | CRUD de cidades (nome, endereço, CNPJ, inscrição estadual) — **apenas DONO** |
| CID-2  | Cada cidade opera de forma independente (estoque, caixa, NFe) |
| CID-3  | DONO pode visualizar dashboard consolidado de todas as cidades |

### 3.3. Controle de Estoque (Máquinas)

| ID     | Requisito                                                                     |
| ------ | ----------------------------------------------------------------------------- |
| EST-1  | CRUD de máquinas (nome, modelo, número de série, categoria, preço diário de aluguel) |
| EST-2  | Status da máquina: `DISPONIVEL`, `ALUGADA`, `MANUTENCAO`, `ESTRAGADA`, `INATIVA` |
| EST-3  | Histórico de status (mudanças de status com data e responsável)               |
| EST-4  | Vincular máquina a uma cidade                                                  |
| EST-5  | **Transferência direta** entre cidades — **DONO apenas**                       |
| EST-6  | **Solicitação de envio**: OPERADOR pode solicitar máquinas de outras cidades → DONO aprova/rejeita |
| EST-7  | Contagem de aluguéis por máquina (ranking de mais alugadas)                    |
| EST-8  | Filtros: por status, cidade, categoria, ordenação por aluguéis                 |
| EST-9  | Foto da máquina (upload opcional, comprimida no client < 200 KB)               |

### 3.4. Manutenção

| ID     | Requisito                                                              |
| ------ | ---------------------------------------------------------------------- |
| MAN-1  | Registrar manutenção de máquina (descrição, custo, data, tipo: preventiva/corretiva) |
| MAN-2  | Marcar máquina como `ESTRAGADA` → registro automático de manutenção pendente |
| MAN-3  | Marcar máquina como consertada → volta para `DISPONIVEL` com registro   |
| MAN-4  | Relatório de custo de manutenção por máquina, cidade e período          |
| MAN-5  | Dashboard com total de máquinas estragadas vs. consertadas por cidade   |

### 3.5. Clientes

| ID     | Requisito                                                                       |
| ------ | ------------------------------------------------------------------------------- |
| CLI-1  | CRUD de clientes (OPERADOR e DONO podem criar/editar)                           |
| CLI-2  | Dados do cliente: nome, CPF/CNPJ, telefone, email, **endereço residencial (casa)** |
| CLI-3  | O endereço residencial é **fixo no cadastro** — é onde o cliente mora           |
| CLI-4  | Cada pedido tem um **endereço da obra** separado — a obra não é necessariamente onde o cliente mora |
| CLI-5  | Histórico de aluguéis por cliente                                               |

### 3.6. Pedido de Aluguel

| ID     | Requisito                                                                       |
| ------ | ------------------------------------------------------------------------------- |
| PED-1  | Criar pedido: selecionar máquina(s), cliente, datas, **endereço da obra**, frete |
| PED-2  | Calcular valor total automaticamente (dias × preço diário da máquina + frete)   |
| PED-3  | Status do pedido: `RASCUNHO`, `AGUARDANDO_ASSINATURA`, `ATIVO`, `FINALIZADO`, `CANCELADO` |
| PED-4  | Gerar contrato simplificado em tela para assinatura digital                     |
| PED-5  | Assinatura digital via toque na tela (Canvas) — funcionar em celular            |
| PED-6  | Salvar assinatura como imagem PNG vinculada ao pedido                            |
| PED-7  | Ao ativar pedido, máquina muda para status `ALUGADA` automaticamente            |
| PED-8  | Ao finalizar pedido, máquina volta para `DISPONIVEL`                            |
| PED-9  | Histórico de aluguéis por cliente                                               |
| PED-10 | Histórico de aluguéis por máquina                                               |
| PED-11 | **Frete**: valor do frete incluso no pedido, somado ao total                    |
| PED-12 | **Endereço da obra**: definido por pedido (diferente do endereço residencial do cliente) |

### 3.7. Fluxo de Caixa

| ID     | Requisito                                                                     |
| ------ | ----------------------------------------------------------------------------- |
| CX-1   | Registrar entrada (aluguel, frete, outros) e saída (manutenção, despesa operacional) |
| CX-2   | Vincular movimentação a um pedido ou manutenção automaticamente               |
| CX-3   | Fluxo de caixa diário, semanal e mensal por cidade                            |
| CX-4   | Saldo atual por cidade                                                         |
| CX-5   | DONO vê consolidado de todas as cidades                                        |
| CX-6   | Categorias de movimentação configuráveis                                       |
| CX-7   | Relatório exportável (CSV)                                                     |

### 3.8. NFe — Nota Fiscal Eletrônica

| ID     | Requisito                                                                         |
| ------ | --------------------------------------------------------------------------------- |
| NFE-1  | Geração automática de NFe ao final do dia (CRON/scheduled) por cidade             |
| NFE-2  | Agrupar todos os pedidos do dia em lote para emissão                              |
| NFE-3  | Integração com API de NFe (nfe.io, Focus NFe ou similar) — abstração via Service  |
| NFE-4  | Status da NFe: `PENDENTE`, `EMITIDA`, `ERRO`, `CANCELADA`                        |
| NFE-5  | Retentar emissão em caso de erro                                                  |
| NFE-6  | Log de emissão com XML da NFe armazenado                                          |
| NFE-7  | Dashboard de NFes emitidas por cidade e período                                   |

### 3.9. Dashboard Principal

| ID     | Requisito                                                                 |
| ------ | ------------------------------------------------------------------------- |
| DSH-1  | Resumo da cidade: máquinas disponíveis, alugadas, em manutenção, estragadas |
| DSH-2  | Faturamento do dia/semana/mês                                             |
| DSH-3  | Top 5 máquinas mais alugadas                                               |
| DSH-4  | Custo total de manutenção no período                                       |
| DSH-5  | NFes pendentes/emitidas do dia                                             |
| DSH-6  | Pedidos ativos                                                             |
| DSH-7  | Solicitações de envio pendentes (para DONO)                                |

---

## 4. Requisitos Não-Funcionais

| ID      | Requisito                                                                                   |
| ------- | ------------------------------------------------------------------------------------------- |
| NF-1    | **Performance**: Tempo de carregamento < 2s em 3G. First Contentful Paint < 1.5s            |
| NF-2    | **Mobile-first**: Layout funcional em telas de 5.5" com 1 GB RAM                            |
| NF-3    | **Bundle**: JS no client < 100 KB gzipped por rota                                          |
| NF-4    | **Responsividade**: Desktop (1024px+), Tablet (768px), Mobile (360px)                       |
| NF-5    | **Segurança**: CSRF, rate limiting, senhas hasheadas (bcrypt), validação server-side         |
| NF-6    | **Banco de dados**: PostgreSQL (Supabase) — persistência gerenciada, Prisma ORM                 |
| NF-7    | **SSR**: Máximo uso de Server Components para reduzir JS no client                          |
| NF-8    | **Acessibilidade**: Labels, contraste mínimo WCAG AA, navegação por teclado                 |
| NF-9    | **Internacionalização**: Apenas pt-BR                                                        |
| NF-10   | **Logs**: Logging estruturado de ações críticas                                              |

---

## 5. Modelos de Dados (Resumo)

### Entidades Principais

```
User              → id, name, email, passwordHash, role (DONO|OPERADOR), cityId, active
City              → id, name, address, cnpj, inscricaoEstadual, active
Machine           → id, name, model, serialNumber, category, dailyPrice, status, cityId, photoUrl?, totalRentals
MachineStatusHist → id, machineId, oldStatus, newStatus, changedBy, changedAt, notes
MaintenanceLog    → id, machineId, type, description, cost, date, resolvedAt?, resolvedBy?
Client            → id, name, cpfCnpj, phone, email?, homeAddress (endereço residencial fixo)
RentalOrder       → id, clientId, cityId, createdBy, status, totalValue, startDate, endDate, signatureUrl?, freightValue, jobSiteAddress (endereço da obra), notes
RentalItem        → id, orderId, machineId, dailyPrice, days, subtotal
TransferRequest   → id, machineId, fromCityId, toCityId, requestedById, status (PENDENTE|APROVADA|REJEITADA), approvedById?, notes, createdAt
CashFlow          → id, cityId, type(ENTRADA/SAIDA), category, amount, description, orderId?, maintenanceId?, date
NFe               → id, cityId, date, status, xmlUrl?, errorMessage?, retryCount
NFeItem           → id, nfeId, orderId, amount
AuditLog          → id, userId, action, entity, entityId, details, timestamp
```

---

## 6. Permissões por Papel

| Funcionalidade              | DONO  | OPERADOR |
| --------------------------- | ----- | -------- |
| Gerenciar cidades           | ✅    | ❌       |
| Gerenciar usuários (sistema)| ✅    | ❌       |
| Dashboard consolidado       | ✅    | ❌       |
| Dashboard da cidade         | ✅    | ✅       |
| CRUD máquinas               | ✅    | ✅       |
| Transferir máquinas direto  | ✅    | ❌       |
| **Solicitar envio de máquinas** | ✅ | ✅       |
| Aprovar solicitações envio  | ✅    | ❌       |
| **Criar/editar clientes**   | ✅    | ✅       |
| Criar pedido                | ✅    | ✅       |
| Assinar pedido              | ✅    | ✅       |
| Cancelar pedido             | ✅    | ✅       |
| Registrar manutenção        | ✅    | ✅       |
| Fluxo de caixa (ver)        | ✅    | ✅       |
| Fluxo de caixa (editar)     | ✅    | ✅       |
| NFe (ver)                   | ✅    | ✅       |
| NFe (configurar)            | ✅    | ❌       |
| Relatórios                  | ✅    | ✅       |
| Exportar CSV                | ✅    | ✅       |

---

## 7. Fluxos Críticos

### 7.1. Fluxo de Aluguel
```
Operador cria pedido → Seleciona cliente (ou cadastra novo)
→ Define endereço da obra (diferente do endereço de casa do cliente)
→ Seleciona máquina(s) → Define frete (valor) → Sistema calcula total
→ Gera contrato na tela → Cliente assina no celular → Pedido ativado
→ Máquina(s) ALUGADA → Entrada no caixa (aluguel + frete)
→ No encerramento: máquina DISPONIVEL → NFe gerada ao fim do dia
```

### 7.2. Fluxo de Solicitação de Envio
```
Operador solicita máquina de outra cidade → Status PENDENTE
→ DONO visualiza solicitações no dashboard → Aprova ou rejeita
→ Se aprovada: máquina transferida automaticamente para a cidade do operador
```

### 7.3. Fluxo de Manutenção
```
Operador marca máquina como ESTRAGADA → Registro de manutenção criado
→ Custo registrado → Saída no caixa → Máquina consertada → Status DISPONIVEL
```

### 7.4. Fluxo de NFe Diária
```
CRON às 23:59 por cidade → Coleta pedidos finalizados do dia
→ Agrupa itens → Envia para API NFe → Salva XML → Status EMITIDA
→ Se erro: marca ERRO, retry no próximo ciclo
```
