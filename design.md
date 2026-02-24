# Design Técnico — Sistema LF de Aluguel de Máquinas

## 1. Arquitetura Geral

```
┌─────────────────────────────────────────────────┐
│                   Browser                       │
│  (Mobile 5.5" / Desktop / Tablet)               │
├─────────────────────────────────────────────────┤
│              Next.js App Router                  │
│  ┌───────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Server   │  │  Client    │  │ Middleware  │ │
│  │Components │  │Components  │  │  (Auth)     │ │
│  │  (SSR)    │  │ (mínimo)   │  │             │ │
│  └───────────┘  └────────────┘  └────────────┘ │
├─────────────────────────────────────────────────┤
│           API Routes (Route Handlers)           │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────┐ │
│  │  Auth    │ │  CRUD    │ │  NFe Service    │ │
│  │ Service  │ │ Services │ │  (scheduled)    │ │
│  └──────────┘ └──────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────┤
│               Prisma ORM                        │
├─────────────────────────────────────────────────┤
│              PostgreSQL                         │
└─────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Pastas

```
projeto-lf/
├── prisma/
│   ├── schema.prisma          # Modelos do banco
│   ├── seed.ts                # Dados iniciais (admin, cidades teste)
│   └── migrations/            # Migrações auto-geradas
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout raiz (meta, fontes)
│   │   ├── page.tsx           # Redirect → /login
│   │   ├── login/
│   │   │   └── page.tsx       # Página de login
│   │   ├── (admin)/           # Route group autenticado
│   │   │   ├── layout.tsx     # Sidebar + Header
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── maquinas/
│   │   │   │   ├── page.tsx          # Listagem
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # Detalhes/edição
│   │   │   │   └── nova/
│   │   │   │       └── page.tsx      # Cadastro
│   │   │   ├── pedidos/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── novo/
│   │   │   │       └── page.tsx
│   │   │   ├── manutencao/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── caixa/
│   │   │   │   └── page.tsx
│   │   │   ├── nfe/
│   │   │   │   └── page.tsx
│   │   │   ├── clientes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── cidades/
│   │   │   │   └── page.tsx          # Admin only
│   │   │   ├── usuarios/
│   │   │   │   └── page.tsx          # Admin only
│   │   │   └── relatorios/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       ├── machines/
│   │       │   └── route.ts
│   │       ├── orders/
│   │       │   └── route.ts
│   │       ├── maintenance/
│   │       │   └── route.ts
│   │       ├── cashflow/
│   │       │   └── route.ts
│   │       ├── nfe/
│   │       │   ├── route.ts
│   │       │   └── cron/
│   │       │       └── route.ts   # Endpoint para CRON
│   │       ├── cities/
│   │       │   └── route.ts
│   │       ├── users/
│   │       │   └── route.ts
│   │       ├── clients/
│   │       │   └── route.ts
│   │       └── reports/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/                    # Componentes base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Pagination.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── CitySelector.tsx
│   │   ├── forms/
│   │   │   ├── MachineForm.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   ├── MaintenanceForm.tsx
│   │   │   ├── CashFlowForm.tsx
│   │   │   └── UserForm.tsx
│   │   ├── SignaturePad.tsx       # Assinatura digital (Canvas)
│   │   └── charts/
│   │       └── SimpleBarChart.tsx # Gráfico leve (CSS-only)
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth.ts                # NextAuth config
│   │   ├── permissions.ts         # Verificação de permissões
│   │   ├── nfe-service.ts         # Integração NFe
│   │   ├── validators.ts          # Validação com Zod
│   │   └── utils.ts               # Helpers (formatCurrency, etc.)
│   ├── hooks/
│   │   ├── useCity.ts             # Context da cidade ativa
│   │   └── usePermission.ts       # Hook de permissão
│   ├── types/
│   │   └── index.ts               # Types compartilhados
│   └── styles/
│       ├── globals.css            # Reset + variáveis CSS
│       ├── layout.module.css      # Layout principal
│       └── components.module.css  # Estilos dos componentes
├── public/
│   └── icons/                     # SVG icons inline
├── .env                           # Variáveis de ambiente
├── .env.example
├── next.config.js
├── package.json
├── tsconfig.json
└── docker-compose.yml             # PostgreSQL local
```

---

## 3. Banco de Dados — Schema Prisma Completo

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  GERENTE
  OPERADOR
}

enum MachineStatus {
  DISPONIVEL
  ALUGADA
  MANUTENCAO
  ESTRAGADA
  INATIVA
}

enum OrderStatus {
  RASCUNHO
  AGUARDANDO_ASSINATURA
  ATIVO
  FINALIZADO
  CANCELADO
}

enum MaintenanceType {
  PREVENTIVA
  CORRETIVA
}

enum CashFlowType {
  ENTRADA
  SAIDA
}

enum NFeStatus {
  PENDENTE
  EMITIDA
  ERRO
  CANCELADA
}

model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  passwordHash String
  role         Role      @default(OPERADOR)
  cityId       String?
  city         City?     @relation(fields: [cityId], references: [id])
  active       Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  orders       RentalOrder[]
  auditLogs    AuditLog[]
  maintenanceResolved MaintenanceLog[] @relation("resolvedBy")

  @@index([email])
  @@index([cityId])
}

model City {
  id                String    @id @default(cuid())
  name              String
  address           String?
  cnpj              String    @unique
  inscricaoEstadual String?
  active            Boolean   @default(true)
  createdAt         DateTime  @default(now())

  users        User[]
  machines     Machine[]
  orders       RentalOrder[]
  cashFlows    CashFlow[]
  nfes         NFe[]

  @@index([cnpj])
}

model Machine {
  id           String        @id @default(cuid())
  name         String
  model        String?
  serialNumber String?       @unique
  category     String
  dailyPrice   Float
  status       MachineStatus @default(DISPONIVEL)
  cityId       String
  city         City          @relation(fields: [cityId], references: [id])
  photoUrl     String?
  totalRentals Int           @default(0)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  maintenanceLogs MaintenanceLog[]
  rentalItems     RentalItem[]
  statusHistory   MachineStatusHistory[]

  @@index([cityId, status])
  @@index([category])
  @@index([totalRentals(sort: Desc)])
}

model MachineStatusHistory {
  id        String        @id @default(cuid())
  machineId String
  machine   Machine       @relation(fields: [machineId], references: [id])
  oldStatus MachineStatus
  newStatus MachineStatus
  changedBy String
  changedAt DateTime      @default(now())
  notes     String?

  @@index([machineId])
}

model MaintenanceLog {
  id          String          @id @default(cuid())
  machineId   String
  machine     Machine         @relation(fields: [machineId], references: [id])
  type        MaintenanceType
  description String
  cost        Float
  date        DateTime        @default(now())
  resolvedAt  DateTime?
  resolvedById String?
  resolvedBy  User?           @relation("resolvedBy", fields: [resolvedById], references: [id])

  cashFlow    CashFlow?

  @@index([machineId])
  @@index([date])
}

model Client {
  id       String  @id @default(cuid())
  name     String
  cpfCnpj  String  @unique
  phone    String
  address  String?
  email    String?
  createdAt DateTime @default(now())

  orders   RentalOrder[]

  @@index([cpfCnpj])
}

model RentalOrder {
  id           String      @id @default(cuid())
  clientId     String
  client       Client      @relation(fields: [clientId], references: [id])
  cityId       String
  city         City        @relation(fields: [cityId], references: [id])
  createdById  String
  createdBy    User        @relation(fields: [createdById], references: [id])
  status       OrderStatus @default(RASCUNHO)
  totalValue   Float       @default(0)
  startDate    DateTime
  endDate      DateTime
  signatureUrl String?
  notes        String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  items       RentalItem[]
  cashFlows   CashFlow[]
  nfeItems    NFeItem[]

  @@index([cityId, status])
  @@index([clientId])
  @@index([createdAt])
}

model RentalItem {
  id         String @id @default(cuid())
  orderId    String
  order      RentalOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  machineId  String
  machine    Machine     @relation(fields: [machineId], references: [id])
  dailyPrice Float
  days       Int
  subtotal   Float

  @@index([orderId])
}

model CashFlow {
  id              String       @id @default(cuid())
  cityId          String
  city            City         @relation(fields: [cityId], references: [id])
  type            CashFlowType
  category        String
  amount          Float
  description     String?
  orderId         String?
  order           RentalOrder? @relation(fields: [orderId], references: [id])
  maintenanceId   String?      @unique
  maintenance     MaintenanceLog? @relation(fields: [maintenanceId], references: [id])
  date            DateTime     @default(now())
  createdAt       DateTime     @default(now())

  @@index([cityId, date])
  @@index([type])
}

model NFe {
  id           String    @id @default(cuid())
  cityId       String
  city         City      @relation(fields: [cityId], references: [id])
  date         DateTime
  status       NFeStatus @default(PENDENTE)
  xmlUrl       String?
  errorMessage String?
  retryCount   Int       @default(0)
  createdAt    DateTime  @default(now())

  items        NFeItem[]

  @@index([cityId, date])
  @@index([status])
}

model NFeItem {
  id      String      @id @default(cuid())
  nfeId   String
  nfe     NFe         @relation(fields: [nfeId], references: [id], onDelete: Cascade)
  orderId String
  order   RentalOrder @relation(fields: [orderId], references: [id])
  amount  Float

  @@index([nfeId])
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String
  entity    String
  entityId  String
  details   String?
  ip        String?
  timestamp DateTime @default(now())

  @@index([userId])
  @@index([entity, entityId])
  @@index([timestamp])
}
```

---

## 4. Autenticação e Middleware

### 4.1. NextAuth Config

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        cityId: { label: "Cidade", type: "text" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email, active: true },
          include: { city: true },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        // Admin pode escolher qualquer cidade; outros usam a própria
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cityId: user.role === "ADMIN" ? credentials.cityId : user.cityId,
          cityName: user.city?.name,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8 horas
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.cityId = user.cityId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.user.cityId = token.cityId;
      return session;
    },
  },
});
```

### 4.2. Middleware de Proteção

```typescript
// src/middleware.ts
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    return Response.redirect(new URL("/login", req.url));
  }
  if (isLoggedIn && isLoginPage) {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
```

### 4.3. Sistema de Permissões

```typescript
// src/lib/permissions.ts
type Permission =
  | "cities:manage"
  | "users:manage"
  | "machines:write"
  | "machines:transfer"
  | "orders:create"
  | "orders:cancel"
  | "maintenance:write"
  | "cashflow:write"
  | "nfe:view"
  | "nfe:config"
  | "reports:view"
  | "export:csv";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [/* todas */],
  GERENTE: [
    "machines:write", "machines:transfer",
    "orders:create", "orders:cancel",
    "maintenance:write", "cashflow:write",
    "nfe:view", "reports:view", "export:csv",
  ],
  OPERADOR: [
    "orders:create", "maintenance:write",
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  if (role === "ADMIN") return true;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
```

---

## 5. Design de UI — Princípios

### 5.1. Filosofia

- **Zero firula**: Sem gradientes, sombras pesadas ou animações. Bordas sólidas, cores sólidas.
- **Dados primeiro**: Tabelas limpas, badges de status com cor, números grandes no dashboard.
- **Touch-friendly**: Botões mínimo 44×44px, espaçamento 12px entre elementos interativos.
- **Alto contraste**: Texto preto em fundo branco, badges com cores saturadas.

### 5.2. Paleta

```css
:root {
  --bg: #ffffff;
  --bg-alt: #f5f5f5;
  --text: #111111;
  --text-muted: #666666;
  --border: #dddddd;
  --primary: #0066cc;
  --primary-hover: #0052a3;
  --success: #15803d;
  --warning: #b45309;
  --danger: #dc2626;
  --info: #0284c7;
}
```

### 5.3. Layout Mobile

```
┌─────────────────────┐
│  Header (cidade, ☰) │  ← 48px fixo
├─────────────────────┤
│                     │
│     Conteúdo        │  ← scroll, 100% largura
│     (SSR)           │
│                     │
├─────────────────────┤
│  Nav Bottom (5 itens)│  ← 56px fixo, ícones SVG
└─────────────────────┘
```

### 5.4. Layout Desktop

```
┌──────┬──────────────────────────────┐
│      │  Header (cidade, usuário)    │
│ Side │──────────────────────────────│
│ bar  │                              │
│ 220px│       Conteúdo               │
│      │                              │
│      │                              │
└──────┴──────────────────────────────┘
```

### 5.5. Componentes Críticos

| Componente     | Client JS? | Motivo                                |
| -------------- | ---------- | ------------------------------------- |
| Sidebar        | Não        | SSR, links simples `<a>`              |
| MobileNav      | Mínimo     | Toggle do menu (3 linhas JS)          |
| Tabelas        | Não        | SSR puro, paginação via query params  |
| Formulários    | Mínimo     | Validação HTML5 + submit server action|
| SignaturePad   | Sim        | Canvas obrigatório (~8 KB)            |
| CitySelector   | Sim        | Dropdown interativo (~2 KB)           |
| Modal          | Sim        | Confirmações (~3 KB)                  |
| Filtros        | Não        | Via query params, `<form>` nativo     |

---

## 6. Assinatura Digital

```typescript
// Componente SignaturePad (client component)
// Usa lib "signature_pad" (~10 KB minified)
// 1. Renderiza <canvas> responsivo
// 2. Captura toque/mouse
// 3. Exporta como PNG base64
// 4. Upload via API → salva no disco como /signatures/{orderId}.png
// 5. URL salva no campo signatureUrl do RentalOrder

// Mobile: canvas ocupa 100% largura, forçar landscape via CSS
// Fallback: se canvas não suportar, exibir input de texto (nome completo)
```

---

## 7. NFe — Estratégia de Integração

### 7.1. Arquitetura

```
CRON (Vercel Cron / node-cron local)
  → GET /api/nfe/cron (com secret header)
    → Para cada cidade:
      → Buscar pedidos FINALIZADO do dia sem NFe
      → Agrupar por cidade
      → Chamar NFeService.emit(data)
        → POST para API externa (nfe.io / Focus)
        → Salvar XML retornado
        → Atualizar status NFe
        → Se erro: marcar ERRO, incrementar retryCount
```

### 7.2. Abstração do Serviço

```typescript
// src/lib/nfe-service.ts
interface NFeProvider {
  emit(data: NFeData): Promise<NFeResult>;
  cancel(nfeId: string): Promise<void>;
  getXml(nfeId: string): Promise<string>;
}

// Implementação concreta pode ser trocada sem mudar lógica
class FocusNFeProvider implements NFeProvider { ... }
class MockNFeProvider implements NFeProvider { ... } // Para dev
```

> **Nota**: A integração real com SEFAZ exige certificado digital A1/A3 e credenciamento. No desenvolvimento, usaremos MockNFeProvider que simula a emissão. A integração real será configurada via variáveis de ambiente.

---

## 8. Otimização de Performance

### 8.1. Estratégias para Mobile Leve

| Estratégia                 | Implementação                                           |
| -------------------------- | ------------------------------------------------------- |
| Server Components          | Tudo que não precisa de interação é SSR                 |
| Zero framework CSS         | CSS Modules puro, sem Tailwind/MUI/Chakra               |
| Sem biblioteca de gráficos | Barras de progresso em CSS puro (`<div>` com width %)   |
| Paginação server-side      | `?page=1&limit=20` no URL, sem infinite scroll          |
| Imagens otimizadas         | `next/image` com formato WebP, max 200 KB               |
| Font system                | `font-family: system-ui` (sem Google Fonts)             |
| Ícones inline SVG          | Sem icon library, ~20 SVGs customizados                 |
| Lazy loading               | `dynamic()` para SignaturePad e Modal apenas             |
| Sem state management       | URL como state (query params), sem Redux/Zustand        |

### 8.2. Bundle Budget por Rota

| Rota             | JS Client Máximo |
| ---------------- | ----------------- |
| /login           | 15 KB             |
| /dashboard       | 10 KB             |
| /maquinas        | 5 KB              |
| /pedidos         | 8 KB              |
| /pedidos/novo    | 25 KB (signature) |
| /caixa           | 5 KB              |
| /nfe             | 3 KB              |

---

## 9. Estrutura de API Routes

### Padrão de cada Route Handler

```typescript
// src/app/api/machines/route.ts
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { machineSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cityId = session.user.role === "ADMIN"
    ? searchParams.get("cityId") || session.user.cityId
    : session.user.cityId;

  const machines = await prisma.machine.findMany({
    where: { cityId, status: searchParams.get("status") || undefined },
    orderBy: { totalRentals: "desc" },
    take: 20,
    skip: (Number(searchParams.get("page") || 1) - 1) * 20,
  });

  return Response.json(machines);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !hasPermission(session.user.role, "machines:write")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = machineSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const machine = await prisma.machine.create({ data: parsed.data });
  return Response.json(machine, { status: 201 });
}
```

---

## 10. Docker / Dev Environment

```yaml
# docker-compose.yml
version: "3.8"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: lf
      POSTGRES_PASSWORD: lf_dev_2024
      POSTGRES_DB: lf_rental
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```env
# .env
DATABASE_URL="postgresql://lf:lf_dev_2024@localhost:5432/lf_rental"
NEXTAUTH_SECRET="gerar-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
NFE_PROVIDER="mock"
NFE_API_KEY=""
NFE_API_URL=""
```

---

## 11. Decisões Técnicas Importantes

| Decisão                              | Justificativa                                             |
| ------------------------------------ | --------------------------------------------------------- |
| PostgreSQL ao invés de SQLite        | Multi-usuário simultâneo, índices compostos, JSON support  |
| CSS Modules (sem Tailwind)           | Bundle menor, sem purge, controle total                    |
| NextAuth v5 com JWT                  | Sem sessão no server, escalável, sem Redis                 |
| Zod para validação                   | Type-safe, integra com TypeScript, leve (~10 KB)           |
| system-ui font                       | Zero download de fonte, render instantâneo                 |
| Query params como state              | Sem JS client para filtros, compartilhável, back funciona  |
| Server Actions para forms            | Progressive enhancement, funciona sem JS                   |
| signature_pad (única lib pesada)     | Necessidade legal de assinatura, sem alternativa mais leve |
| Mock NFe inicialmente                | Integração SEFAZ requer certificado — paralelo             |
| CRON via API route + secret          | Funciona em Vercel e bare-metal igual                      |
