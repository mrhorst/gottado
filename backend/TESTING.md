# Testing Guide

## Test Database Setup

The integration tests require a PostgreSQL test database. Here's how to set it up:

### Prerequisites

- PostgreSQL installed locally or accessible
- Node.js and npm installed

### Quick Setup

```bash
# 1. Set up the test database (creates DB + runs migrations)
npm run test:setup

# 2. Run all tests
npm test

# 3. Run only integration tests
npm run test:integration
```

### Manual Database Management

```bash
# Create test database (if it doesn't exist)
npm run test:db:create

# Reset database (drops and recreates with migrations)
npm run test:db:reset

# Run migrations only
npm run test:db:migrate

# Clean all data (for test isolation)
npm run test:db:clean
```

### Environment Configuration

Edit `.env.test` to configure your test database:

```env
TEST_DATABASE_URL=postgresql://username:password@localhost:5432/gottado_test
ADMIN_DATABASE_URL=postgresql://username:password@localhost:5432/postgres
```

The `ADMIN_DATABASE_URL` is used to create/drop the test database (connects to default `postgres` database).

## Test Types

### Contract Tests
Located in `tests/*.test.ts` - Verify API structure and exports without hitting the database.

```bash
npm test
```

### Integration Tests
Located in `tests/*.integration.test.ts` - Full database-backed tests.

```bash
# Must have test DB set up first
npm run test:setup
npm run test:integration
```

### Test Factories

Use `TestFactories` class to create test data:

```typescript
import { TestFactories } from './factories'

const factories = new TestFactories()
await factories.connect()

// Create entities
const org = await factories.createOrganization()
const user = await factories.createUser(org.id)
const template = await factories.createAuditTemplate(org.id)
const checkpoints = await factories.createCheckpoints(template.id, [
  { question: 'Checkpoint 1' },
  { question: 'Checkpoint 2' },
])

await factories.disconnect()
```

Available factory methods:
- `createOrganization()`
- `createUser(orgId, overrides?)`
- `createAuditTemplate(orgId, overrides?)`
- `createCheckpoints(templateId, checkpoints)`
- `createAuditRun(templateId, orgId, overrides?)`
- `createFindings(runId, checkpointIds, assessments)`
- `createTask(orgId, overrides?)`
- `completeTask(taskId, userId, overrides?)`
- `createActionItem(findingId, orgId, overrides?)`

## Writing Integration Tests

```typescript
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import { createServer } from '../src/server'
import { resetTestDatabase, setupTestDb, cleanDatabase } from './test-db'
import { TestFactories } from './factories'

describe('Feature Integration Tests', () => {
  const app = createServer()
  let factories: TestFactories

  beforeAll(async () => {
    await resetTestDatabase()
    await setupTestDb()
    factories = new TestFactories()
    await factories.connect()
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await factories.disconnect()
  })

  it('should do something', async () => {
    const org = await factories.createOrganization()
    const response = await request(app)
      .get('/api/something')
      .set('Authorization', `Bearer ${token}`)
    
    expect(response.status).toBe(200)
  })
})
```

## CI/CD Considerations

For CI environments, you can use GitHub Actions with a PostgreSQL service:

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_DB: gottado_test
      POSTGRES_PASSWORD: postgres
    ports:
      - 5432:5432
```

## Troubleshooting

### "database does not exist"
Run `npm run test:db:create` or `npm run test:setup`

### "permission denied to create database"
Ensure your PostgreSQL user has CREATE DATABASE privilege, or create the test database manually.

### "connection refused"
Check that PostgreSQL is running and the connection URL in `.env.test` is correct.

### Migration errors
If migrations fail, reset the database:
```bash
npm run test:db:reset
```