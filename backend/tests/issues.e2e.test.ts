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

describe('Issues API E2E', () => {
  let app: Express
  let client: Client
  let db: ReturnType<typeof drizzle>
  let token: string
  let orgId: number
  let ownerId: number
  let areaId: number

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
    const [owner] = await db
      .insert(schema.user)
      .values({
        name: 'Issue Owner',
        email: `issue-owner-${Date.now()}@example.com`,
        passwordHash,
      })
      .returning()
    ownerId = owner.id

    const [org] = await db
      .insert(schema.organization)
      .values({ name: `Issue Org ${Date.now()}` })
      .returning()
    orgId = org.id

    await db.insert(schema.orgMember).values({ orgId, userId: ownerId, role: 'owner' })

    const [section] = await db
      .insert(schema.section)
      .values({
        name: `Dining Room ${Date.now()}`,
        orgId,
        ownerId,
      })
      .returning()
    areaId = section.id

    await db.insert(schema.sectionMember).values({
      sectionId: areaId,
      userId: ownerId,
      role: 'owner',
    })

    token = jwt.sign(
      { sub: String(ownerId), email: owner.email, name: owner.name },
      'secret'
    )
  })

  afterAll(async () => {
    await client.end()
  })

  it('lists issue references and allows managers to create and filter issues', async () => {
    const referencesRes = await request(app)
      .get('/api/issues/references')
      .set(authHeaders())

    expect(referencesRes.status).toBe(200)
    expect(referencesRes.body.areas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: areaId,
          name: expect.stringContaining('Dining Room'),
        }),
      ])
    )

    const createRes = await request(app)
      .post('/api/issues/records')
      .set(authHeaders())
      .send({
        category: 'guest',
        severity: 'high',
        title: 'Guest complaint about cold food',
        entryDate: '2026-03-18',
        areaId,
        followUpRequired: true,
        notes: 'Table 12 received entrees below temp and asked for manager.',
      })

    expect(createRes.status).toBe(201)
    expect(createRes.body.category).toBe('guest')
    expect(createRes.body.severity).toBe('high')
    expect(createRes.body.followUpRequired).toBe(true)

    const listRes = await request(app)
      .get('/api/issues/records')
      .query({ date: '2026-03-18', category: 'guest' })
      .set(authHeaders())

    expect(listRes.status).toBe(200)
    expect(listRes.body.summary.total).toBe(1)
    expect(listRes.body.summary.followUpCount).toBe(1)
    expect(listRes.body.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Guest complaint about cold food',
          areaName: expect.stringContaining('Dining Room'),
        }),
      ])
    )
  })
})
