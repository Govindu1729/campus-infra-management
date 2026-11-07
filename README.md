# Campus Infra Management

A unified platform for managing campus infrastructure operations at IIT Gandhinagar. Built as a modular Next.js 14 monorepo with role-based access control, audit logging, and data localization on the campus data center.

---

## Repository Structure

```
campus-infra-management/
├── .github/                      # GitHub workflows & issue templates
├── apps/
│   └── global-calendar/          # Core: Unified event hub (active development)
├── docs/
│   └── api-contracts/
│       └── global-calendar-api.md # Module integration specifications
├── packages/                     # Shared packages (future use)
├── backups/                      # Local DB backups (gitignored)
├── docker-compose.yml            # Multi-container orchestration
├── Dockerfile                    # Multi-stage build (deps → prisma → builder → runner)
├── package.json                  # Workspace root (npm workspaces)
├── tsconfig.json                 # TypeScript config (project references)
└── README.md
```

### `apps/global-calendar/` — Core Module

```
apps/global-calendar/
├── prisma/
│   ├── schema.prisma             # Database schema (13 models)
│   ├── seed.ts                   # Dev data seeding
│   ├── fic-seed.ts               # FIC directory seeding
│   ├── fic-seed-data.ts          # FIC directory data
│   ├── dev-service-keys.ts       # Dev service-key seed (MISSION-003)
│   ├── rooms-iitgn.ts            # IITGN room catalog import
│   └── migrations/               # Prisma migration history (5 migrations)
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx                    # Calendar view
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── directory/                  # FIC directory (RBAC-gated)
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── loading.tsx
│   │   │   └── admin/                      # Admin panel (system admins only)
│   │   │       ├── analytics/page.tsx
│   │   │       ├── audit-logs/page.tsx
│   │   │       ├── permissions/page.tsx
│   │   │       └── service-keys/page.tsx
│   │   ├── api/
│   │   │   ├── v1/calendar/events/         # SuperApp v1 contract
│   │   │   │   ├── route.ts                # GET (list) / POST (create)
│   │   │   │   └── [id]/route.ts           # GET/PATCH/DELETE (soft-cancel)
│   │   │   ├── events/                     # Legacy/internal event CRUD
│   │   │   │   ├── route.ts
│   │   │   │   ├── [id]/route.ts
│   │   │   │   ├── [id]/participants/route.ts
│   │   │   │   └── [id]/rsvp/route.ts
│   │   │   ├── rooms/
│   │   │   │   ├── route.ts
│   │   │   │   └── availability/route.ts
│   │   │   ├── tasks/
│   │   │   │   └── route.ts
│   │   │   ├── directory/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── users/
│   │   │   │   ├── route.ts
│   │   │   │   └── search/route.ts
│   │   │   ├── permissions/route.ts
│   │   │   ├── audit-log/route.ts
│   │   │   ├── reminders/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   ├── cron/process-reminders/route.ts
│   │   │   ├── internal/events/route.ts    # Service-to-service (Bearer token)
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── session/route.ts
│   │   │   ├── admin/
│   │   │   │   ├── service-keys/route.ts
│   │   │   │   └── service-keys/[id]/route.ts
│   │   │   ├── analytics/route.ts
│   │   │   └── health/route.ts             # Public health probe
│   │   ├── health/route.ts                 # Public health probe (Docker HEALTHCHECK)
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                             # shadcn/ui primitives
│   │   │   ├── avatar.tsx, badge.tsx, button.tsx, card.tsx
│   │   │   ├── command.tsx, dialog.tsx, dropdown-menu.tsx
│   │   │   ├── input.tsx, label.tsx, select.tsx, separator.tsx
│   │   │   ├── sheet.tsx, table.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx                 # Navigation + task list
│   │   │   └── topbar.tsx                  # Header + notification bell
│   │   ├── CalendarView.tsx                # FullCalendar wrapper
│   │   ├── DayPanel.tsx                    # Day detail view
│   │   ├── EventFormModal.tsx              # Create/edit event
│   │   ├── EventSidebar.tsx                # Event detail drawer
│   │   ├── ConflictModal.tsx               # Room conflict resolution
│   │   ├── RoomSelector.tsx                # Room picker with live availability
│   │   ├── NotificationBell.tsx            # Polls /api/notifications every 30s
│   │   ├── TaskList.tsx                    # Sidebar task panel
│   │   ├── UserCombobox.tsx                # User picker (for participants)
│   │   ├── command-menu.tsx                # Cmd+K command palette
│   │   ├── Header.tsx
│   │   ├── LiveClock.tsx
│   │   └── UserCombobox.tsx
│   ├── lib/
│   │   ├── v1/                             # SuperApp v1 contract
│   │   │   ├── auth.ts                     # Module auth (service_keys table)
│   │   │   ├── serialize.ts                # DB to v1 JSON transform
│   │   │   └── validators.ts               # Zod schemas
│   │   ├── auth.ts                         # Human auth (cookie + Prisma)
│   │   ├── conflicts.ts                    # Room conflict detection
│   │   ├── fic-features.ts                 # FIC directory utilities
│   │   ├── modules.ts                      # Module key to sourceModule map
│   │   ├── notifications.ts                # Email + in-app notifications
│   │   ├── password.ts                     # scrypt hash + timing-safe verify
│   │   ├── prisma.ts                       # PrismaClient singleton
│   │   ├── serialize.ts                    # JSON serialization helpers
│   │   ├── service-keys.ts                 # ServiceKey CRUD + timing-safe verify
│   │   ├── session.ts                      # JWT sign/verify (jose)
│   │   ├── utils.ts                        # Classnames + formatters
│   │   ├── validators.ts                   # Shared Zod schemas
│   │   └── serialize.ts
│   ├── middleware.ts                       # Auth guard (public paths: /login, /api/v1, /health)
│   ├── types/index.ts                      # Shared TypeScript types
│   └── app/
├── public/                                 # Static assets
├── .env.example                            # Environment template
├── package.json
├── tsconfig.json
├── next.config.js
├── components.json                         # shadcn/ui config
└── README.md
```

---

## Mission & Design Principles

**Hub-and-spoke architecture** — Each module owns its database schema; integration happens through REST APIs.

**"Mind Your Own Business" RBAC** — Users see only events from modules they're authorized to access.

**Position-based accounts** — Emails like `se@iitgn.ac.in` outlive individual staff (stakeholder requirement).

**Complete audit trail** — Every write operation is logged with user ID, IP, and before/after state.

**Reminder-first design** — Alerts and reminders take precedence over events (Prof. Sushobhan's directive).

**Data localization** — All data stays on the IITGN campus data center (no cloud databases).

---

## Modules & Features

### Global Calendar (Active Development) — `apps/global-calendar/`

**Core Capabilities**

Interactive FullCalendar with month/week/day views and color-coded events by module. Recurring events via iCal RRULE (rrule plugin). Room conflict detection with live availability checking through the RoomSelector component. Command palette (Cmd+K) for instant search, navigation, and actions. Notification bell polls `/api/notifications` every 30 seconds with in-app and email delivery. Sidebar task panel with deadline tracking. FIC directory with RBAC-gated access for HOD, FIC, Dean, and Admin roles. Admin panel covering analytics, audit logs, permission matrix, and service-key management.

**SuperApp v1 Contract** (`/api/v1/calendar/events`)

Module-to-module authentication via `X-Module-Key` + `X-Module-Token` backed by the `service_keys` table. Timing-safe token verification, fail-closed, per-module keys. Per-module event ownership; cross-module writes return 403. Soft-delete (status → `CANCELLED`) with audit trail retained.

**Room Management**

Room catalog with building, room number, label, capacity, and purpose. Live availability API (`/api/rooms/availability`) with conflict preview. Room booking via event metadata (`metadata.room`, `metadata.rooms[]`).

**FIC Directory**

100+ seeded contacts across four categories: Academic, Student Welfare, Infrastructure, Research Advancement. Hierarchical structure via `parentContactId` → `childrenContacts`. Role-based access: HOD, FIC, Dean, Committee Chair, Co-Coordinator, Super/Dean Admin.

**Reminder & Notification System**

Reminder types: `BEFORE_EVENT`, `DEADLINE_APPROACHING`, `TASK_OVERDUE`, `CUSTOM`. Channels: `IN_APP`, `EMAIL`, `BOTH` (Resend integration ready). Cron job endpoint at `/api/cron/process-reminders`.

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | 14.2.x |
| Language | TypeScript | 5.3.x |
| Database | MySQL 8.0 + Prisma ORM | 5.22.x |
| Auth (Human) | JWT (jose) + httpOnly cookie | 6.2.x |
| Auth (Module) | ServiceKey table + timing-safe verify | Custom |
| UI | Tailwind CSS + shadcn/ui | 3.4.x / latest |
| Calendar | FullCalendar v5 + RRule | 5.11.x / 5.11.x |
| Forms/Validation | Zod + React Hook Form | 3.22.x |
| Containerization | Docker (multi-stage) | 20-alpine |
| Deployment Target | AV5 Data Center (IITGN) | On-prem |

---

## Authentication & Authorization

### Human Users (Cookie-based)

```
POST /api/auth/login    → { email, password } → sets gc_session httpOnly cookie
GET  /api/auth/session  → { user, permissions[] }
POST /api/auth/logout   → clears cookie
```

JWT (HS256, 8h expiry, signed with `JWT_SECRET`). Middleware protects all routes except `/login`, `/api/auth/*`, `/health`, `/api/v1`.

### Module-to-Module (Service Keys)

```
Headers: X-Module-Key: <module-key> (e.g., global-calendar, room-info, rnd)
         X-Module-Token: <service-key> (from service_keys table)
```

Keys stored as scrypt hashes in `service_keys` table. Timing-safe verification (`crypto.timingSafeEqual` + scrypt). Per-module keys, revocable (`isActive`), `lastUsed` tracking. **Fail-closed**: missing/inactive/mismatched → 401.

### Role-Based Access Control

| Role | Directory | Admin Panel | Module Permissions |
|------|-----------|-------------|-------------------|
| SUPER_ADMIN | Yes | Yes | All modules |
| DEAN_ADMIN | Yes | No | Assigned category |
| ASSOCIATE_DEAN | Yes | No | Assigned category |
| HOD | Yes | No | Academic only |
| FIC_COORDINATOR | Yes | No | Assigned category |
| COMMITTEE_CHAIR | Yes | No | Assigned category |
| CO_COORDINATOR | Yes | No | Assigned category |
| Regular User | No (403) | No | None |

---

## Database Schema (13 Models)

| Model | Purpose | Key Fields |
|-------|---------|------------|
| User | Human accounts | email (unique), isSystemAdmin, positionTitle |
| CalendarEvent | Core event entity | sourceModule, eventType, visibility, status, recurrenceRule |
| EventParticipant | RSVPs | role, rsvpStatus |
| UserModulePermission | RBAC matrix | moduleName, canView, canEdit |
| AuditLog | Immutable trail | action, eventId, userId, ipAddress, details |
| Room | Room catalog | label (unique), building, purpose, capacity |
| ServiceKey | Module auth | moduleName, keyHash (unique), isActive, lastUsed |
| Reminder | Alert scheduling | reminderType, minutesBefore, channel, scheduledAt |
| Notification | In-app + email | type, title, message, readAt |
| Task | Deadline tracking | sourceModule, deadline, priority, status |
| TaskAssignee | Task assignments | taskId, userId |
| FunctionalCategory | FIC grouping | name (unique) |
| FicContact | Directory entries | primaryEmail (unique), systemRole, parentContactId |

---

## Development Setup

### Prerequisites

- Node.js ≥ 18.17 (`.nvmrc` pins version)
- Docker + Docker Compose
- MySQL 8.0 (via Docker)

### Quick Start (Docker)

```bash
# 1. Clone & install
git clone git@github.com:Janil-ship-it/campus-infra-management.git
cd campus-infra-management
npm install

# 2. Start database
docker compose up -d db

# 3. Run migrations & seed
docker compose run --rm migrate npx prisma migrate deploy
docker compose run --rm migrate npm run seed:service-keys

# 4. Start app
docker compose up -d app

# 5. Verify
curl http://localhost:3000/health
# {"status":"ok","service":"global-calendar-v1","db":"ok","latencyMs":<n>}
```

### Local Development (Hot Reload)

```bash
cd apps/global-calendar
cp .env.example .env   # Fill DATABASE_URL, JWT_SECRET, NEXTAUTH_SECRET
npm install
npx prisma migrate dev
npm run seed:all       # seed + fic-seed
npm run dev            # http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | `mysql://user:***@host:3306/db` |
| JWT_SECRET | Yes | HS256 signing key (≥32 chars) |
| NEXTAUTH_SECRET | Yes | NextAuth compatibility |
| NEXTAUTH_URL | Yes | `http://localhost:3000` |
| SUPERAPP_MODULE_TOKEN | Dev only | Dev fallback (prod uses ServiceKey table) |
| RESEND_API_KEY | No | Email notifications (optional) |
| CRON_SECRET | No | Cron job authentication |

---

## Docker & Deployment

### Multi-stage Dockerfile

```
deps → prisma → builder → runner (standalone output)
Non-root user (nextjs:1001)
HEALTHCHECK → curl -fsS http://localhost:3000/health
```

### Docker Compose Services

| Service | Image | Ports | Healthcheck |
|---------|-------|-------|-------------|
| db | mysql:8.0 | 3307:3306 | mysqladmin ping |
| migrate | built (prisma stage) | — | Runs `prisma migrate deploy` + `seed:service-keys` |
| app | built (runner stage) | 3000:3000 | curl /health (20s start-period) |

### Production Notes (AV5 Data Center)

- **Data localization**: All containers on campus network, no external DB
- **Secrets**: Injected via Docker secrets / env files (never in image)
- **Volume**: `mysql_data` persisted for DB durability
- **Network**: Internal `campus-net` bridge; no public ports except app:3000

---

## Testing & Quality

### TypeScript

```bash
cd apps/global-calendar && npx tsc --noEmit   # 0 errors required
```

### API Contract Tests

```bash
# Health
curl -s http://localhost:3000/health

# Auth
curl -X POST http://localhost:3000/api/auth/login \
  -d '{"email":"dean.campus@iitgn.ac.in","password":"Iitgn@deancampus"}'

# SuperApp v1 (module auth)
curl -X POST http://localhost:3000/api/v1/calendar/events \
  -H "X-Module-Key: global-calendar" \
  -H "X-Module-Token: dev-module-token-change-in-prod" \
  -d '{"title":"Test","startAt":"2026-12-01T09:00:00+05:30","endAt":"2026-12-01T10:00:00+05:30"}'
```

### Database Seeds

```bash
# Human users + FIC directory
npm run seed:all        # seed.ts + fic-seed.ts

# Service keys (dev only)
npm run seed:service-keys
```

---

## Git Workflow & Branching

| Branch | Purpose |
|--------|---------|
| main | Production-ready (protected) |
| feat/GC-global-calendar-core | Current feature baseline |
| feat/GC-v1-auth-hardening | Security fix (MISSION-002) + drift reconciliation (MISSION-003) |

**Remotes**

- `origin` → `Govindu1729/campus-infra-management` (portfolio fork)
- `upstream` → `Janil-ship-it/campus-infra-management` (team canonical)

**Commit Convention**

```
fix(security): v1 module auth uses ServiceKey table, fails closed
fix(types): reconcile 22 pre-existing TS errors across directory/events/rooms/users/lib
fix(db): reconcile schema↔DB drift for MISSION-003
```

---

## Mission Log

| Mission | Status | Description |
|---------|--------|-------------|
| MISSION-001 | Done | Comprehensive E2E testing (22/22 API + 10/10 security) |
| MISSION-002 | Done | P1 Security fix: static token → ServiceKey table, timing-safe, fail-closed |
| MISSION-003 | Done | Drift reconciliation: schema↔DB↔migrations sync, correct migration-5 via shadow DB |

**Current Branch:** `feat/GC-v1-auth-hardening` (3 commits ahead of `feat/GC-global-calendar-core`)

---

## Related Documentation

| Document | Location |
|----------|----------|
| Project Charter | `~/Documents/Obsidian Vault/Projects/Campus Infra Management/00 - Project Charter.md` |
| Test Users & Scenarios | `~/Documents/Obsidian Vault/Projects/Campus Infra Management/08 - Test Users & Scenarios.md` |
| API Contract (v1) | `docs/api-contracts/global-calendar-api.md` |
| Test Results (2026-11-02) | `~/Documents/Obsidian Vault/Projects/Campus Infra Management/09 - Test Results - 2026-11-02.md` |

---

## Team & Ownership

| Role | Person | Contact |
|------|--------|---------|
| Project Mentor | Prof. Sushobhan Sen | — |
| Brain (Architecture) | Qwen | — |
| Executor (Implementation) | OpenClaw `repo-campus-infra` | — |
| Repository Owner | Govindu Srimaan | `Govindu1729` |

---

## License

Proprietary — IIT Gandhinagar internal use only. Not for public distribution.

---

*Last updated: 2026-11-07 | Branch: feat/GC-v1-auth-hardening | Commit: 57005f0*