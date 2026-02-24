# Requirements — Sistema de Aluguel de Máquinas (LF)

## 1. Visão Geral

Sistema administrativo web para empresa de aluguel de máquinas, operando em múltiplas cidades. O sistema gerencia estoque de máquinas, fluxo de caixa, emissão de NFe, manutenção e pedidos de aluguel com assinatura digital. Não há área pública — apenas painel admin.

---

## 2. Stack Tecnológica

| Camada        | Tecnologia                                  |
| ------------- | ------------------------------------------- |
| Frontend      | Next.js 14 (App Router, RSC)                |
| Backend / API | Next.js API Routes (Route Handlers)         |
| Banco de Dados| PostgreSQL via Prisma ORM                   |
| Auth          | NextAuth.js v5 (credentials provider)       |
| UI            | CSS Modules (mínimo, sem frameworks pesados)|
| Assinatura    | Canvas HTML5 (signature_pad)                |
| NFe           | Integração com API SEFAZ (ou lib nfe.io)    |
| Deploy        | Docker-ready / Vercel-compatible             |

> **Nota sobre performance**: O sistema deve rodar em celulares com 1 GB RAM (Samsung J5). Isso implica: zero JavaScript desnecessário no client, SSR máximo, sem animações pesadas, imagens otimizadas, bundle < 100 KB gzipped por página.

---

## 3. Requisitos Funcionais

### 3.1. Autenticação e Autorização

| ID     | Requisito                                                                 |
| ------ | ------------------------------------------------------------------------- |
| AUTH-1 | Login por email/senha com seleção de cidade                               |
| AUTH-2 | Três níveis de permissão: `ADMIN` (dono), `GERENTE` (por cidade), `OPERADOR` (funcionário) |
| AUTH-3 | Admin acessa todas as cidades; Gerente acessa apenas a sua cidade; Operador acessa apenas funcionalidades permitidas |
| AUTH-4 | Proteção de rotas (middleware Next.js) — redireciona para login se não autenticado |
| AUTH-5 | Sessão com JWT, expiração de 8h, refresh automático                       |
| AUTH-6 | Admin pode criar/editar/desativar usuários e atribuir permissões          |
| AUTH-7 | Log de login (IP, horário, cidade)                                        |

### 3.2. Gestão de Cidades

| ID     | Requisito                                                    |
| ------ | ------------------------------------------------------------ |
| CID-1  | CRUD de cidades (nome, endereço, CNPJ, inscrição estadual)  |
| CID-2  | Cada cidade opera de forma independente (estoque, caixa, NFe) |
| CID-3  | Admin pode visualizar dashboard consolidado de todas as cidades |

### 3.3. Controle de Estoque (Máquinas)

| ID     | Requisito                                                                     |
| ------ | ----------------------------------------------------------------------------- |
| EST-1  | CRUD de máquinas (nome, modelo, número de série, categoria, preço diário de aluguel) |
| EST-2  | Status da máquina: `DISPONIVEL`, `ALUGADA`, `MANUTENCAO`, `ESTRAGADA`, `INATIVA` |
| EST-3  | Histórico de status (mudanças de status com data e responsável)               |
| EST-4  | Vincular máquina a uma cidade                                                  |
| EST-5  | Transferir máquina entre cidades (com log)                                     |
| EST-6  | Contagem de aluguéis por máquina (ranking de mais alugadas)                    |
| EST-7  | Filtros: por status, cidade, categoria, ordenação por aluguéis                 |
| EST-8  | Foto da máquina (upload opcional, comprimida no client < 200 KB)               |

### 3.4. Manutenção

| ID     | Requisito                                                              |
| ------ | ---------------------------------------------------------------------- |
| MAN-1  | Registrar manutenção de máquina (descrição, custo, data, tipo: preventiva/corretiva) |
| MAN-2  | Marcar máquina como `ESTRAGADA` → registro automático de manutenção pendente |
| MAN-3  | Marcar máquina como consertada → volta para `DISPONIVEL` com registro   |
| MAN-4  | Relatório de custo de manutenção por máquina, cidade e período          |
| MAN-5  | Dashboard com total de máquinas estragadas vs. consertadas por cidade   |

### 3.5. Pedido de Aluguel

| ID     | Requisito                                                                       |
| ------ | ------------------------------------------------------------------------------- |
| PED-1  | Criar pedido: selecionar máquina(s), cliente (nome, CPF/CNPJ, telefone, endereço), datas |
| PED-2  | Calcular valor total automaticamente (dias × preço diário da máquina)           |
| PED-3  | Status do pedido: `RASCUNHO`, `AGUARDANDO_ASSINATURA`, `ATIVO`, `FINALIZADO`, `CANCELADO` |
| PED-4  | Gerar contrato simplificado em tela para assinatura digital                     |
| PED-5  | Assinatura digital via toque na tela (Canvas) — funcionar em celular            |
| PED-6  | Salvar assinatura como imagem PNG vinculada ao pedido                            |
| PED-7  | Ao ativar pedido, máquina muda para status `ALUGADA` automaticamente            |
| PED-8  | Ao finalizar pedido, máquina volta para `DISPONIVEL`                            |
| PED-9  | Histórico de aluguéis por cliente                                               |
| PED-10 | Histórico de aluguéis por máquina                                               |

### 3.6. Fluxo de Caixa

| ID     | Requisito                                                                     |
| ------ | ----------------------------------------------------------------------------- |
| CX-1   | Registrar entrada (aluguel, outros) e saída (manutenção, despesa operacional) |
| CX-2   | Vincular movimentação a um pedido ou manutenção automaticamente               |
| CX-3   | Fluxo de caixa diário, semanal e mensal por cidade                            |
| CX-4   | Saldo atual por cidade                                                         |
| CX-5   | Admin vê consolidado de todas as cidades                                       |
| CX-6   | Categorias de movimentação configuráveis                                       |
| CX-7   | Relatório exportável (CSV)                                                     |

### 3.7. NFe — Nota Fiscal Eletrônica

| ID     | Requisito                                                                         |
| ------ | --------------------------------------------------------------------------------- |
| NFE-1  | Geração automática de NFe ao final do dia (CRON/scheduled) por cidade             |
| NFE-2  | Agrupar todos os pedidos do dia em lote para emissão                              |
| NFE-3  | Integração com API de NFe (nfe.io, Focus NFe ou similar) — abstração via Service  |
| NFE-4  | Status da NFe: `PENDENTE`, `EMITIDA`, `ERRO`, `CANCELADA`                        |
| NFE-5  | Retentar emissão em caso de erro                                                  |
| NFE-6  | Log de emissão com XML da NFe armazenado                                          |
| NFE-7  | Dashboard de NFes emitidas por cidade e período                                   |

### 3.8. Dashboard Principal

| ID     | Requisito                                                                 |
| ------ | ------------------------------------------------------------------------- |
| DSH-1  | Resumo da cidade: máquinas disponíveis, alugadas, em manutenção, estragadas |
| DSH-2  | Faturamento do dia/semana/mês                                             |
| DSH-3  | Top 5 máquinas mais alugadas                                               |
| DSH-4  | Custo total de manutenção no período                                       |
| DSH-5  | NFes pendentes/emitidas do dia                                             |
| DSH-6  | Pedidos ativos                                                             |

---

## 4. Requisitos Não-Funcionais

| ID      | Requisito                                                                                   |
| ------- | ------------------------------------------------------------------------------------------- |
| NF-1    | **Performance**: Tempo de carregamento < 2s em 3G. First Contentful Paint < 1.5s            |
| NF-2    | **Mobile-first**: Layout funcional em telas de 5.5" com 1 GB RAM                            |
| NF-3    | **Bundle**: JS no client < 100 KB gzipped por rota                                          |
| NF-4    | **Responsividade**: Desktop (1024px+), Tablet (768px), Mobile (360px)                       |
| NF-5    | **Segurança**: CSRF, rate limiting, senhas hasheadas (bcrypt), validação server-side         |
| NF-6    | **Banco de dados**: PostgreSQL com índices otimizados para consultas por cidade + status     |
| NF-7    | **SSR**: Máximo uso de Server Components para reduzir JS no client                          |
| NF-8    | **Acessibilidade**: Labels, contraste mínimo WCAG AA, navegação por teclado                 |
| NF-9    | **Internacionalização**: Apenas pt-BR                                                        |
| NF-10   | **Logs**: Logging estruturado de ações críticas                                              |

---

## 5. Modelos de Dados (Resumo)

### Entidades Principais

```
User           → id, name, email, passwordHash, role, cityId?, active
City           → id, name, address, cnpj, inscricaoEstadual, active
Machine        → id, name, model, serialNumber, category, dailyPrice, status, cityId, photoUrl?, totalRentals
MaintenanceLog → id, machineId, type, description, cost, date, resolvedAt?, resolvedBy?
Client         → id, name, cpfCnpj, phone, address, email?
RentalOrder    → id, clientId, cityId, createdBy, status, totalValue, startDate, endDate, signatureUrl?
RentalItem     → id, orderId, machineId, dailyPrice, days, subtotal
CashFlow       → id, cityId, type(ENTRADA/SAIDA), category, amount, description, orderId?, maintenanceId?, date
NFe            → id, cityId, date, status, xmlUrl?, errorMessage?, retryCount
NFeItem        → id, nfeId, orderId, amount
AuditLog       → id, userId, action, entity, entityId, details, timestamp
```

---

## 6. Permissões por Papel

| Funcionalidade         | ADMIN | GERENTE | OPERADOR |
| ---------------------- | ----- | ------- | -------- |
| Gerenciar cidades      | ✅    | ❌      | ❌       |
| Gerenciar usuários     | ✅    | ❌      | ❌       |
| Dashboard consolidado  | ✅    | ❌      | ❌       |
| Dashboard da cidade    | ✅    | ✅      | ✅       |
| CRUD máquinas          | ✅    | ✅      | ❌       |
| Transferir máquinas    | ✅    | ✅      | ❌       |
| Criar pedido           | ✅    | ✅      | ✅       |
| Assinar pedido         | ✅    | ✅      | ✅       |
| Cancelar pedido        | ✅    | ✅      | ❌       |
| Registrar manutenção   | ✅    | ✅      | ✅       |
| Fluxo de caixa (ver)   | ✅    | ✅      | ✅       |
| Fluxo de caixa (editar)| ✅    | ✅      | ❌       |
| NFe (ver)              | ✅    | ✅      | ❌       |
| NFe (configurar)       | ✅    | ❌      | ❌       |
| Relatórios             | ✅    | ✅      | ❌       |
| Exportar CSV           | ✅    | ✅      | ❌       |

---

## 7. Fluxos Críticos

### 7.1. Fluxo de Aluguel
```
Operador cria pedido → Seleciona máquina(s) e cliente → Sistema calcula valor
→ Gera contrato na tela → Cliente assina no celular → Pedido ativado
→ Máquina(s) marcada(s) como ALUGADA → Entrada no caixa
→ No encerramento: máquina volta a DISPONIVEL → NFe gerada ao fim do dia
```

### 7.2. Fluxo de Manutenção
```
Operador marca máquina como ESTRAGADA → Registro de manutenção criado
→ Gerente aprova custo → Saída no caixa → Máquina consertada → Status DISPONIVEL
```

### 7.3. Fluxo de NFe Diária
```
CRON às 23:59 por cidade → Coleta pedidos finalizados do dia
→ Agrupa itens → Envia para API NFe → Salva XML → Status EMITIDA
→ Se erro: marca ERRO, retry no próximo ciclo
```
