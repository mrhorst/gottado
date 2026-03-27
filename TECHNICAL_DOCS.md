# Gottado - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Authentication & Authorization](#authentication--authorization)
6. [Middleware](#middleware)
7. [Validation (Zod Schemas)](#validation-zod-schemas)
8. [Business Logic](#business-logic)
9. [Mobile App Architecture](#mobile-app-architecture)
10. [Data Flow & State Management](#data-flow--state-management)
11. [Styling System](#styling-system)

---

## Architecture Overview

Gottado is a full-stack application with a REST API backend and a cross-platform mobile client.

```
gottado/
├── backend/         # Express API server
│   └── src/
│       ├── controllers/    # Route handlers
│       ├── db/             # Drizzle ORM schema
│       ├── middleware/      # Auth, validation, error handling
│       ├── routes/          # Route definitions
│       ├── types/           # TypeScript types
│       ├── utils/           # Helpers, DB connection, config
│       └── validation/      # Zod schemas
├── mobile/          # Expo/React Native app
│   ├── app/               # File-based routing (Expo Router)
│   ├── components/        # Shared UI components
│   ├── context/           # Auth & Workspace providers
│   ├── hooks/             # React Query hooks
│   ├── services/          # Axios API client functions
│   ├── styles/            # Theme tokens
│   ├── types/             # TypeScript interfaces
│   └── utils/             # Helpers
```

---

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Language**: TypeScript

### Mobile
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based)
- **State Management**: TanStack React Query (server state) + React Context (auth/workspace)
- **HTTP Client**: Axios
- **Icons**: @expo/vector-icons (Ionicons)
- **Language**: TypeScript

---

## Database Schema

### Entity Relationship Diagram

```
users ──┬── organization_members ──── organizations
        │
        ├── section_members ──── sections ──── organizations
        │                            │
        ├── tasks ───────────────────┘
        │     │
        │     └── task_completions
        │
        ├── audit_runs ──── audit_templates ──── organizations
        │     │                    │
        │     │              audit_checkpoints
        │     │
        │     ├── audit_findings ──── audit_checkpoints
        │     │       │
        │     │       └── audit_actions ──── tasks (promoted)
        │     │
        │     └── audit_follow_ups
```

### Tables

#### `users`

| Column | Type | Constraints |
|--------|------|------------|
| id | integer | PK, auto-generated |
| name | varchar(255) | NOT NULL |
| email | varchar(255) | NOT NULL, UNIQUE |
| password_hash | text | NOT NULL |
| created_at | timestamp(tz) | NOT NULL, default now() |
| updated_at | timestamp(tz) | NOT NULL, default now() |
| active | boolean | NOT NULL, default true |
| deactivated_at | timestamp(tz) | nullable |

#### `organizations`

| Column | Type | Constraints |
|--------|------|------------|
| id | integer | PK, auto-generated |
| name | varchar(255) | NOT NULL, UNIQUE |
| created_at | timestamp(tz) | NOT NULL, default now() |
| updated_at | timestamp(tz) | NOT NULL, default now() |
| active | boolean | NOT NULL, default true |
| deactivated_at | timestamp(tz) | nullable |

#### `organization_members`

| Column | Type | Constraints |
|--------|------|------------|
| org_id | integer | PK (composite), FK → organizations ON DELETE CASCADE |
| user_id | integer | PK (composite), FK → users ON DELETE CASCADE |
| role | varchar(20) | NOT NULL, default 'viewer', enum: owner/editor/viewer |
| joined_at | timestamp(tz) | NOT NULL, default now() |

**Constraints**: Unique index ensuring only one owner per org.

#### `sections`

| Column | Type | Constraints |
|--------|------|------------|
| id | integer | PK, auto-generated |
| name | varchar(255) | NOT NULL, UNIQUE, CHECK name <> '' |
| owner_id | integer | NOT NULL, FK → users |
| org_id | integer | NOT NULL, FK → organizations |
| created_at | timestamp(tz) | NOT NULL, default now() |
| updated_at | timestamp(tz) | NOT NULL, default now() |
| active | boolean | NOT NULL, default true |
| deactivated_at | timestamp(tz) | nullable |

#### `section_members`

| Column | Type | Constraints |
|--------|------|------------|
| section_id | integer | PK (composite), FK → sections ON DELETE CASCADE |
| user_id | integer | PK (composite), FK → users ON DELETE CASCADE |
| role | varchar(20) | NOT NULL, default 'viewer', enum: owner/editor/viewer |

**Constraints**: Unique index ensuring only one owner per section.

#### `tasks`

| Column | Type | Constraints |
|--------|------|------------|
| id | integer | PK, auto-generated |
| title | varchar(100) | NOT NULL |
| description | varchar(255) | nullable |
| due_date | date | nullable |
| deadline_time | varchar(5) | nullable, format "HH:MM" |
| complete | boolean | NOT NULL, default false |
| section_id | integer | NOT NULL, FK → sections |
| measurable_criteria | text | nullable |
| relevance_tag | varchar(100) | nullable |
| recurrence | varchar(20) | nullable, enum: daily/weekly/monthly/quarterly/semi_annual/yearly |
| last_completed_at | timestamp(tz) | nullable |

#### `task_completions`

| Column | Type | Constraints |
|--------|------|------------|
| id | integer | PK, auto-generated |
| task_id | integer | NOT NULL, FK → tasks ON DELETE CASCADE |
| completed_by | integer | NOT NULL, FK → users |
| completed_at | timestamp(tz) | NOT NULL, default now() |
| due_date | date | nullable (snapshot at completion time) |
| deadline_time | varchar(5) | nullable (snapshot at completion time) |
| on_time | boolean | nullable (true if completed before deadline) |
| notes | text | nullable |

**Indexes**: task_id, completed_by, completed_at

#### `audit_templates`

| Column | Type | Constraints |
|--------|------|------------|
| id | integer | PK, auto-generated |
| org_id | integer | NOT NULL, FK → organizations |
| name | varchar(255) | NOT NULL |
| description | text | nullable |
| framework_tag | varchar(50) | nullable (e.g., "presto") |
| created_by | integer | NOT NULL, FK → users |
| active | boolean | NOT NULL, default true |
| created_at | timestamp(tz) | NOT NULL, default now() |
| updated_at | timestamp(tz) | NOT NULL, default now() |

#### `audit_checkpoints`

| Column | Type | Constraints |
|--------|------|------------|
| id | integer | PK, auto-generated |
| template_id | integer | NOT NULL, FK → audit_templates ON DELETE CASCADE |
| zone | varchar(100) | NOT NULL |
| label | varchar(255) | NOT NULL |
| description | text | nullable |
| scoring_type | varchar(20) | NOT NULL, default 'score', enum: score/pass_fail |
| sort_order | integer | NOT NULL, default 0 |
| active | boolean | NOT NULL, default true |

**Index**: (template_id, zone, sort_order)

#### `audit_runs`

| Column | Type | Constraints |
|--------|------|------------|
| id | integer | PK, auto-generated |
| template_id | integer | NOT NULL, FK → audit_templates |
| org_id | integer | NOT NULL, FK → organizations |
| conducted_by | integer | NOT NULL, FK → users |
| status | varchar(20) | NOT NULL, default 'in_progress', enum: in_progress/completed/cancelled |
| overall_score | integer | nullable (calculated on completion) |
| total_checkpoints | integer | nullable |
| notes | text | nullable |
| started_at | timestamp(tz) | NOT NULL, default now() |
| completed_at | timestamp(tz) | nullable |

**Indexes**: org_id, template_id, conducted_by

#### `audit_findings`

| Column | Type | Constraints |
|--------|------|------------|
| id | integer | PK, auto-generated |
| run_id | integer | NOT NULL, FK → audit_runs ON DELETE CASCADE |
| checkpoint_id | integer | NOT NULL, FK → audit_checkpoints |
| score | integer | nullable (0-5 for score type) |
| passed | boolean | nullable (for pass_fail type) |
| severity | varchar(20) | nullable, enum: low/medium/high/critical |
| notes | text | nullable |
| flagged | boolean | NOT NULL, default false |
| created_at | timestamp(tz) | NOT NULL, default now() |

**Indexes**: run_id, checkpoint_id

#### `audit_actions`

| Column | Type | Constraints |
|--------|------|------------|
| id | integer | PK, auto-generated |
| finding_id | integer | NOT NULL, FK → audit_findings ON DELETE CASCADE |
| run_id | integer | NOT NULL, FK → audit_runs ON DELETE CASCADE |
| title | varchar(255) | NOT NULL |
| description | text | nullable |
| assigned_to | integer | nullable, FK → users |
| priority | varchar(20) | NOT NULL, default 'medium', enum: low/medium/high/critical |
| recurrence | varchar(20) | nullable, enum: daily/weekly/monthly/quarterly/semi_annual/yearly |
| status | varchar(20) | NOT NULL, default 'proposed', enum: proposed/approved/promoted/dismissed |
| task_id | integer | nullable, FK → tasks (set when promoted) |
| section_id | integer | nullable, FK → sections |
| created_at | timestamp(tz) | NOT NULL, default now() |
| updated_at | timestamp(tz) | NOT NULL, default now() |

**Indexes**: run_id, finding_id, status

#### `audit_follow_ups`

| Column | Type | Constraints |
|--------|------|------------|
| id | integer | PK, auto-generated |
| run_id | integer | NOT NULL, FK → audit_runs ON DELETE CASCADE |
| scheduled_date | date | NOT NULL |
| status | varchar(20) | NOT NULL, default 'scheduled', enum: scheduled/completed/skipped |
| conducted_by | integer | nullable, FK → users |
| notes | text | nullable |
| score | integer | nullable (0-100, follow-up result) |
| completed_at | timestamp(tz) | nullable |
| created_at | timestamp(tz) | NOT NULL, default now() |

**Index**: run_id

---

## API Reference

**Base URL**: `http://<host>:3000/api`

All authenticated endpoints require:
- `Authorization: Bearer <jwt_token>` header
- `x-org-id: <number>` header (for org-scoped endpoints)

### Authentication

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/auth/login` | No | `{ email, password }` | `{ token, user: { id, email, name } }` |
| POST | `/auth/signup` | No | `{ email, name, password }` | `{ id, name, email }` |
| POST | `/auth/logout` | No | — | `"logout"` |

### Users

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| GET | `/users` | Yes | — | `[{ id, name, email, ... }]` |
| GET | `/users/me` | Yes | — | `{ id, name, email, organizations: [...] }` |
| PUT | `/users/me` | Yes | `{ name?, email? }` | Updated user |
| PUT | `/users/:id` | Yes | `{ name?, email? }` | Updated user |
| DELETE | `/users/:id` | Yes | — | 204 |

### Organizations

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| GET | `/orgs` | Yes | — | Org from x-org-id header |
| GET | `/orgs/:id` | Yes | — | `{ id, name, members: [...] }` |
| POST | `/orgs` | Yes | `{ name }` | Created org (creator = owner) |
| PUT | `/orgs/:id` | Yes | `{ name }` | Updated org (owner only) |
| DELETE | `/orgs/:id` | Yes | — | 204 (owner only, soft-delete) |
| POST | `/orgs/:id/members` | Yes | `{ userId, role? }` | 201 (owner/editor) |
| PUT | `/orgs/:id/members` | Yes | `{ userId, role }` | Updated role (owner only) |
| DELETE | `/orgs/:id/members/:userId` | Yes | — | 204 (owner only) |

### Sections

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| GET | `/sections` | Yes | — | `{ active: [...], inactive: [...] }` |
| GET | `/sections/:id` | Yes | — | `{ members: [...], nonMembers: [...] }` |
| POST | `/sections` | Yes | `{ name }` | Created section (creator = owner) |
| PUT | `/sections/:id` | Yes | `{ name?, active? }` | Updated section (owner only) |
| DELETE | `/sections/:id` | Yes | — | 200 (owner only) |
| POST | `/sections/:id/members` | Yes | `{ sectionId, userId }` | 201 (owner only) |
| PUT | `/sections/:id/members` | Yes | `{ sectionId, userId, role }` | Updated role (owner only) |
| DELETE | `/sections/:id/members/:userId` | Yes | — | 204 (owner only) |

### Tasks

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| GET | `/tasks` | Yes | — | `[{ id, title, description, dueDate, complete, sectionName, recurrence, lastCompletedAt, deadlineTime }]` |
| POST | `/tasks` | Yes | `{ title, description?, dueDate?, deadlineTime?, sectionId, recurrence? }` | Created task (owner/editor of section) |
| PUT | `/tasks/:id` | Yes | `{ title?, description?, dueDate?, complete? }` | Updated task |
| DELETE | `/tasks/:id` | Yes | — | 204 (section owner only) |
| GET | `/tasks/:id/history` | Yes | — | `[{ id, taskId, completedBy, completedAt, onTime, ... }]` |
| GET | `/tasks/snapshot?date=YYYY-MM-DD` | Yes | — | `{ date, completions: [...], summary: { total, onTime, late, noDeadline } }` |

### Audit Templates

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| GET | `/audits/templates` | Yes | — | `[{ id, name, description, frameworkTag, ... }]` |
| GET | `/audits/templates/:id` | Yes | — | `{ id, name, checkpoints: { zone: [...] } }` |
| POST | `/audits/templates` | Yes | `{ name, description? }` | Created template |
| PUT | `/audits/templates/:id` | Yes | `{ name?, description? }` | Updated template |
| DELETE | `/audits/templates/:id` | Yes | — | 204 (soft-delete) |
| POST | `/audits/templates/seed-presto` | Yes | — | Seeds PRESTO template (idempotent) |

### Audit Checkpoints

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/audits/templates/:id/checkpoints` | Yes | `{ zone, label, description?, scoringType?, sortOrder? }` | Created checkpoint |
| PUT | `/audits/templates/:tId/checkpoints/:id` | Yes | `{ zone?, label?, description?, scoringType?, sortOrder? }` | Updated checkpoint |
| DELETE | `/audits/templates/:tId/checkpoints/:id` | Yes | — | 204 (soft-delete) |
| PUT | `/audits/templates/:id/checkpoints/reorder` | Yes | `{ items: [{ id, sortOrder }] }` | 200 |

### Audit Runs

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| GET | `/audits/runs` | Yes | — | `[{ id, templateName, status, overallScore, startedAt, completedAt }]` |
| GET | `/audits/runs/:id` | Yes | — | `{ id, findings: [...], actions: [...], followUps: [...], ... }` |
| POST | `/audits/runs` | Yes | `{ templateId }` | `{ id, status, zones: { zoneName: [{ checkpoint, findingId }] } }` |
| POST | `/audits/runs/:id/complete` | Yes | `{ notes? }` | Completed run with calculated score |
| POST | `/audits/runs/:id/cancel` | Yes | — | Cancelled run |

### Audit Findings

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| PUT | `/audits/runs/:runId/findings/:id` | Yes | `{ score?, passed?, severity?, notes?, flagged? }` | Updated finding |
| PUT | `/audits/runs/:runId/findings/batch` | Yes | `{ findings: [{ id, score?, passed?, severity?, notes?, flagged? }] }` | Updated findings array |
| POST | `/audits/runs/:runId/findings` | Yes | `{ label, description?, severity?, notes? }` | Ad-hoc finding (O&U zone) |

### Audit Actions

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| GET | `/audits/runs/:runId/actions` | Yes | — | `[{ id, title, status, priority, recurrence, ... }]` |
| POST | `/audits/runs/:runId/actions` | Yes | `{ findingId, title, description?, assignedTo?, priority?, recurrence? }` | Created action |
| PUT | `/audits/actions/:id` | Yes | `{ title?, description?, assignedTo?, priority?, recurrence?, sectionId? }` | Updated action |
| POST | `/audits/actions/:id/promote` | Yes | `{ sectionId, title?, description?, dueDate?, measurableCriteria? }` | `{ action, task }` |
| PUT | `/audits/actions/:id/dismiss` | Yes | — | Dismissed action |

### Audit Follow-ups

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| GET | `/audits/runs/:runId/follow-ups` | Yes | — | `[{ id, scheduledDate, status, notes, score, ... }]` |
| POST | `/audits/runs/:runId/follow-ups` | Yes | `{ scheduledDate }` | Created follow-up |
| PUT | `/audits/follow-ups/:id` | Yes | `{ notes?, status? }` | Updated follow-up |
| POST | `/audits/follow-ups/:id/complete` | Yes | `{ notes?, score? }` | Completed follow-up |

### Audit Dashboard

| Method | Endpoint | Auth | Query Params | Response |
|--------|----------|------|-------------|----------|
| GET | `/audits/dashboard` | Yes | `?scoreLimit=N` (default 5) | See below |

**Dashboard response:**
```json
{
  "recentRuns": [{ "id", "templateId", "templateName", "overallScore", "completedAt", "conductedBy" }],
  "upcomingFollowUps": [{ "id", "runId", "scheduledDate", "status" }],
  "pendingActionsCount": 3,
  "averageScore": 78,
  "totalCompletedRuns": 12,
  "scoreLimit": 5,
  "zoneScores": { "People": 85, "Routines": 72, ... },
  "previousZoneScores": { "People": 70, "Routines": 68, ... }
}
```

---

## Authentication & Authorization

### JWT Authentication

- **Token generation**: On login, server creates JWT with payload `{ email, sub: userId, name }`
- **Token secret**: Configured via `JWT_SECRET` environment variable
- **Token transmission**: Client sends `Authorization: Bearer <token>` header on every request
- **Token storage**: Mobile app stores in AsyncStorage as `auth_token`

### Organization Scoping

Most endpoints require `x-org-id` header. This is stored in:
- **Server**: AsyncLocalStorage context (per-request)
- **Client**: AsyncStorage as `activeOrgId`, injected by Axios request interceptor

### Role-Based Access Control

**Organization roles** (owner > editor > viewer):
- **Owner**: Full control — manage members, delete org, all editor permissions
- **Editor**: Create sections, manage templates, create tasks
- **Viewer**: Read-only access

**Section roles** (owner > editor > viewer):
- **Owner**: Manage section members, create/delete tasks, archive section
- **Editor**: Create and edit tasks
- **Viewer**: View tasks only

Access checks are performed in controllers using helper functions:
- `getUserOrgRole(userId, orgId)` — returns org-level role
- `getUserSectionRole(userId, sectionId)` — returns section-level role

---

## Middleware

### `protect` (Authentication)

Chain of `tokenExtractor` + `authenticateUser`:
1. Extracts JWT from `Authorization: Bearer <token>` header
2. Verifies token signature with JWT_SECRET
3. Attaches decoded payload to `req.user`
4. Returns 401 if token missing or invalid

### `setOrg` (Organization Context)

Reads `x-org-id` header, stores in AsyncLocalStorage for the request lifecycle. Returns 400 if missing.

### `validate(schema)` (Input Validation)

Accepts a Zod schema. Validates `req.body` against it. Returns 400 with structured error details if validation fails. Passes coerced/validated data to the controller.

### `errorHandler` (Error Handling)

Catches all thrown errors:
- `AppError` instances → uses their `statusCode` and message
- PostgreSQL unique constraint violations (code `23505`) → 409 Conflict
- Everything else → 500 Internal Server Error

Error response format:
```json
{
  "error": "Error message",
  "details": ["field.path: validation message"]
}
```

---

## Validation (Zod Schemas)

All POST/PUT endpoints validate request bodies using Zod schemas defined in `backend/src/validation/schemas.ts`.

### Key Schemas

| Schema | Fields | Used By |
|--------|--------|---------|
| `loginSchema` | email (required), password (required) | POST /auth/login |
| `signupSchema` | email, name (1-255), password (6+) | POST /auth/signup |
| `createOrgSchema` | name (1-255) | POST /orgs |
| `createSectionSchema` | name (1-255) | POST /sections |
| `createTaskSchema` | title (1-100), description? (0-255), dueDate?, sectionId (positive int) | POST /tasks |
| `startRunSchema` | templateId (positive int) | POST /audits/runs |
| `assessFindingSchema` | score? (0-5), passed?, severity?, notes?, flagged? | PUT findings |
| `batchAssessFindingsSchema` | findings: assessFinding[] | PUT findings/batch |
| `createActionSchema` | findingId, title (1-255), description?, priority?, recurrence? | POST actions |
| `promoteActionSchema` | sectionId, title?, description?, dueDate?, measurableCriteria? | POST promote |
| `addAdHocFindingSchema` | label (1-255), description?, severity?, notes? | POST findings (ad-hoc) |

---

## Business Logic

### Task Completion

When a task is marked complete (`PUT /tasks/:id` with `complete: true`):

1. **Check deadline**: If `deadlineTime` is set, compares current time against it → sets `onTime`
2. **Log completion**: Creates a `task_completions` record with snapshot of due date and deadline
3. **Recurring tasks**:
   - Does NOT mark as permanently complete
   - Calculates next due date based on recurrence type
   - Resets `complete: false` with new `dueDate`
   - Sets `lastCompletedAt` to now
4. **Non-recurring tasks**: Marks `complete: true` normally

### Audit Score Calculation

```
calculateOverallScore(findings):
  for each finding:
    if scoring_type == 'pass_fail':
      possible += 1
      earned += (passed ? 1 : 0)
    else (score type):
      possible += 5
      earned += score (0-5)

  overall = round((earned / possible) * 100)
```

Zone scores use the same formula, scoped per zone.

### Dashboard Average Score

- Accepts `?scoreLimit=N` query parameter (default: 5)
- Uses a subquery: selects the N most recent completed run scores, then averages them
- Also returns `totalCompletedRuns` so the client knows the upper bound

### Action Promotion to Task

When `POST /audits/actions/:id/promote` is called:
1. Creates a new task in the specified section
2. Looks up the action's finding → checkpoint → zone
3. Sets `relevanceTag` = zone name on the task
4. Copies `recurrence` from action to task (if set)
5. Updates action status to `promoted` and links `taskId`

### PRESTO Template Seeding

`POST /audits/templates/seed-presto`:
- Checks if org already has a template with `frameworkTag: 'presto'`
- If yes, returns existing template (idempotent)
- If no, creates template + 35 checkpoints across 6 zones (all `pass_fail` type)
- Operations & Upkeep zone starts empty (issues added during audit)

---

## Mobile App Architecture

### Navigation Structure (Expo Router)

```
app/
├── _layout.tsx              # Root: providers + auth routing
├── index.tsx                # Entry redirect
├── select-org.tsx           # Organization selector
├── create-section.tsx       # Create section (modal)
├── (auth)/
│   ├── _layout.tsx          # Auth stack
│   ├── login.tsx
│   └── signup.tsx
└── (tabs)/
    ├── _layout.tsx          # Tab navigator (5 tabs)
    ├── dashboard.tsx
    ├── user.tsx
    ├── tasks/
    │   ├── _layout.tsx      # Tasks stack
    │   ├── index.tsx        # Task list
    │   ├── new.tsx          # Create task
    │   └── snapshot.tsx     # Daily snapshot
    ├── sections/
    │   ├── _layout.tsx      # Sections stack
    │   ├── index.tsx        # Section list
    │   ├── [id].tsx         # Section detail (members)
    │   └── add-member.tsx   # Add member modal
    └── audits/
        ├── _layout.tsx      # Audits stack
        ├── index.tsx        # Audit hub
        ├── templates/
        │   ├── index.tsx    # Template list
        │   ├── create.tsx   # Create template
        │   └── [id].tsx     # Template detail
        ├── runs/
        │   ├── index.tsx    # Run history
        │   ├── [id].tsx     # Run detail
        │   └── conduct/
        │       └── [runId].tsx  # Conduct audit
        ├── actions/
        │   └── [runId].tsx  # Action plan
        └── follow-ups/
            └── [id].tsx     # Follow-up review
```

### Auth Flow

1. Root layout checks `useAuth().status`
2. `unauthenticated` → redirect to `/(auth)/login`
3. `authenticated` + no active org → redirect to `/select-org`
4. `authenticated` + active org → show `/(tabs)` navigator

### Routing Logic

- Auth state managed in `AuthContext` (token + user profile in memory, token persisted in AsyncStorage)
- Workspace state managed in `WorkspaceContext` (active org ID persisted in AsyncStorage)
- Conditional `<Redirect>` components in root layout handle routing

---

## Data Flow & State Management

### Server State (TanStack React Query)

All API data flows through React Query hooks:

```
Service (Axios) → Hook (useQuery/useMutation) → Screen Component
```

**Query Key Patterns:**
| Key | Scope |
|-----|-------|
| `['tasks', userId]` | All tasks for user |
| `['sections', userId]` | All sections |
| `['sectionMembers', sectionId]` | Members of a section |
| `['auditTemplates']` | All templates |
| `['auditTemplate', templateId]` | Single template |
| `['auditRuns']` | All runs |
| `['auditRun', runId]` | Single run |
| `['auditActions', runId]` | Actions for a run |
| `['auditFollowUps', runId]` | Follow-ups for a run |
| `['auditDashboard', userId, scoreLimit]` | Dashboard data |
| `['dailySnapshot', date]` | Task snapshot |

**Invalidation Strategy:**
- Mutations invalidate their related queries on success
- Task toggle uses optimistic updates with rollback on error
- Dashboard re-fetches when `scoreLimit` changes (different query key)

### Client State (React Context)

| Context | State | Persisted |
|---------|-------|-----------|
| `AuthContext` | token, user, status | token in AsyncStorage |
| `WorkspaceContext` | activeOrgId, org | activeOrgId in AsyncStorage |

### Axios Interceptors

**Request interceptor**: Reads `auth_token` and `activeOrgId` from AsyncStorage, adds `Authorization` and `x-org-id` headers to every request.

**Response interceptor**: On 401, clears stored token. Formats error messages from API responses.

---

## Styling System

### Design Tokens (`styles/theme.ts`)

**Colors:**
```typescript
{
  primary: '#007AFF',       // iOS blue
  secondary: 'rgba(88, 86, 214, 1)',
  background: '#fff',
  text: '#000000',
  iOSred: '#FF3B30',
  border: '#C6C6C8'
}
```

**Spacing:**
```typescript
{ sm: 8, md: 16, lg: 24, xl: 32 }
```

**Typography:**
```typescript
{
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 38 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  body1: { fontSize: 16, lineHeight: 24 },
  body2: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16, color: '#666' },
  button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 }
}
```

### Design Conventions

- Page background: `#f2f2f7` (iOS system gray)
- Cards: white background, 14-16px border radius, subtle shadow
- Borders: `#e5e5ea`
- Secondary text: `#8e8e93`
- Labels: 13px, uppercase, `#8e8e93`, letter-spacing 0.5
- All TextInput elements use `fontSize: 16` minimum (prevents iOS auto-zoom)
- Icons: Ionicons throughout
- Score colors: green (`#34C759`) ≥ 80%, orange (`#FF9500`) ≥ 50%, red (`#FF3B30`) < 50%

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (unique constraint violation) |
| 500 | Internal Server Error |
