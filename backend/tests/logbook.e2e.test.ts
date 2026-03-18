import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import jwt from 'jsonwebtoken'
import { Client } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '../src/db/schema.ts'
import { cleanDatabase, resetTestDatabase, setupTestDb } from './test-db.ts'
import bcrypt from 'bcrypt'

const TEST_DB_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/gottado_test'

describe('Logbook API E2E', () => {
  let app: Express
  let client: Client
  let db: ReturnType<typeof drizzle>
  let token: string
  let orgId: number
  let userId: number

  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'x-org-id': String(orgId),
  })

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DB_URL
    await resetTestDatabase()
    await setupTestDb()
    app = (await import('../src/app.ts')).default
    client = new Client({ connectionString: TEST_DB_URL })
    await client.connect()
    db = drizzle(client, { schema })
  })

  beforeEach(async () => {
    await cleanDatabase()

    const passwordHash = await bcrypt.hash('password123', 10)
    const [user] = await db
      .insert(schema.user)
      .values({
        name: 'Logbook User',
        email: `logbook-${Date.now()}@example.com`,
        passwordHash,
      })
      .returning()
    userId = user.id

    const [org] = await db
      .insert(schema.organization)
      .values({ name: `Logbook Org ${Date.now()}` })
      .returning()
    orgId = org.id

    await db.insert(schema.orgMember).values({ orgId, userId, role: 'owner' })

    token = jwt.sign(
      { sub: String(userId), email: user.email, name: user.name },
      'secret'
    )
  })

  afterAll(async () => {
    await client.end()
  })

  it('lists the default general log and allows creating custom logs and entries', async () => {
    const listRes = await request(app)
      .get('/api/logbook/templates')
      .set(authHeaders())

    expect(listRes.status).toBe(200)
    expect(listRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'General Log',
          isSystem: true,
        }),
      ])
    )

    const createTemplateRes = await request(app)
      .post('/api/logbook/templates')
      .set(authHeaders())
      .send({
        title: 'Dining Room Reports',
        description: 'Front-of-house manager notes',
      })

    expect(createTemplateRes.status).toBe(201)
    expect(createTemplateRes.body.title).toBe('Dining Room Reports')
    const templateId = createTemplateRes.body.id as number

    const createEntryRes = await request(app)
      .post(`/api/logbook/templates/${templateId}/entries`)
      .set(authHeaders())
      .send({
        title: 'Lunch Rush',
        body: 'Strong lunch sales and two guest recovery issues handled.',
      })

    expect(createEntryRes.status).toBe(201)
    expect(createEntryRes.body.body).toContain('Strong lunch sales')

    const entriesRes = await request(app)
      .get(`/api/logbook/templates/${templateId}/entries`)
      .set(authHeaders())

    expect(entriesRes.status).toBe(200)
    expect(entriesRes.body.template.title).toBe('Dining Room Reports')
    expect(entriesRes.body.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Lunch Rush',
          body: 'Strong lunch sales and two guest recovery issues handled.',
          authorName: 'Logbook User',
        }),
      ])
    )
  })
})
