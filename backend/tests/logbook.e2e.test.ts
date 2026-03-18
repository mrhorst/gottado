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

  const todayStr = () => new Date().toISOString().slice(0, 10)

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

  it('lists the default general log and allows creating custom logs', async () => {
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
  })

  it('upserts today entry and tracks edit history', async () => {
    const createTemplateRes = await request(app)
      .post('/api/logbook/templates')
      .set(authHeaders())
      .send({ title: 'Test Log', description: 'For testing' })

    const templateId = createTemplateRes.body.id as number

    // Create today's entry
    const createRes = await request(app)
      .put(`/api/logbook/templates/${templateId}/entries/today`)
      .set(authHeaders())
      .send({ body: 'First version of the entry.' })

    expect(createRes.status).toBe(201)
    expect(createRes.body.body).toBe('First version of the entry.')

    // Edit today's entry
    const editRes = await request(app)
      .put(`/api/logbook/templates/${templateId}/entries/today`)
      .set(authHeaders())
      .send({ body: 'Updated version of the entry.' })

    expect(editRes.status).toBe(200)
    expect(editRes.body.body).toBe('Updated version of the entry.')

    // Fetch entry by date
    const dayRes = await request(app)
      .get(`/api/logbook/templates/${templateId}/entries/${todayStr()}`)
      .set(authHeaders())

    expect(dayRes.status).toBe(200)
    expect(dayRes.body.entry).toEqual(
      expect.objectContaining({
        body: 'Updated version of the entry.',
        isEditable: true,
        authorName: 'Logbook User',
      })
    )

    // Check edit history
    const historyRes = await request(app)
      .get(`/api/logbook/templates/${templateId}/entries/${todayStr()}/history`)
      .set(authHeaders())

    expect(historyRes.status).toBe(200)
    expect(historyRes.body.edits).toHaveLength(1)
    expect(historyRes.body.edits[0]).toEqual(
      expect.objectContaining({
        previousBody: 'First version of the entry.',
        editorName: 'Logbook User',
      })
    )
  })

  it('returns entry dates in descending order', async () => {
    const createTemplateRes = await request(app)
      .post('/api/logbook/templates')
      .set(authHeaders())
      .send({ title: 'Dates Log' })

    const templateId = createTemplateRes.body.id as number

    // Create today's entry
    await request(app)
      .put(`/api/logbook/templates/${templateId}/entries/today`)
      .set(authHeaders())
      .send({ body: 'Today entry' })

    const datesRes = await request(app)
      .get(`/api/logbook/templates/${templateId}/entry-dates`)
      .set(authHeaders())

    expect(datesRes.status).toBe(200)
    expect(datesRes.body.dates).toContain(todayStr())
  })

  it('returns null entry for a date with no entry', async () => {
    const createTemplateRes = await request(app)
      .post('/api/logbook/templates')
      .set(authHeaders())
      .send({ title: 'Empty Log' })

    const templateId = createTemplateRes.body.id as number

    const dayRes = await request(app)
      .get(`/api/logbook/templates/${templateId}/entries/2020-01-01`)
      .set(authHeaders())

    expect(dayRes.status).toBe(200)
    expect(dayRes.body.entry).toBeNull()
  })
})
