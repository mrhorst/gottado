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

describe('Costs API E2E', () => {
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
        name: 'Cost Owner',
        email: `cost-owner-${Date.now()}@example.com`,
        passwordHash,
      })
      .returning()
    ownerId = owner.id

    const [org] = await db
      .insert(schema.organization)
      .values({ name: `Cost Org ${Date.now()}` })
      .returning()
    orgId = org.id

    await db.insert(schema.orgMember).values({ orgId, userId: ownerId, role: 'owner' })

    const [section] = await db
      .insert(schema.section)
      .values({
        name: `Kitchen Ops ${Date.now()}`,
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

  it('lists cost references and allows managers to create and fetch daily cost records', async () => {
    const referencesRes = await request(app)
      .get('/api/costs/references')
      .set(authHeaders())

    expect(referencesRes.status).toBe(200)
    expect(referencesRes.body.areas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: areaId,
          name: expect.stringContaining('Kitchen Ops'),
        }),
      ])
    )

    const createRes = await request(app)
      .post('/api/costs/records')
      .set(authHeaders())
      .send({
        kind: 'waste',
        title: 'Spoiled produce',
        entryDate: '2026-03-18',
        amount: '86.50',
        areaId,
        vendorName: 'Fresh Greens Co.',
        quantityLabel: '12 lbs romaine',
        notes: 'Walk-in cooler issue overnight.',
      })

    expect(createRes.status).toBe(201)
    expect(createRes.body.kind).toBe('waste')
    expect(createRes.body.title).toBe('Spoiled produce')
    expect(createRes.body.amount).toBe('86.50')
    expect(createRes.body.areaId).toBe(areaId)

    const listRes = await request(app)
      .get('/api/costs/records')
      .query({ date: '2026-03-18' })
      .set(authHeaders())

    expect(listRes.status).toBe(200)
    expect(listRes.body.summary.totalAmount).toBe('86.50')
    expect(listRes.body.summary.wasteCount).toBe(1)
    expect(listRes.body.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'waste',
          title: 'Spoiled produce',
          areaName: expect.stringContaining('Kitchen Ops'),
          vendorName: 'Fresh Greens Co.',
        }),
      ])
    )

    const createPurchaseRes = await request(app)
      .post('/api/costs/records')
      .set(authHeaders())
      .send({
        kind: 'purchase',
        title: 'Emergency dairy order',
        entryDate: '2026-03-17',
        amount: '45.00',
        areaId,
        vendorName: 'City Dairy',
        notes: 'Same-day make-good order.',
      })

    expect(createPurchaseRes.status).toBe(201)

    const filteredRes = await request(app)
      .get('/api/costs/records')
      .query({ date: '2026-03-18', kind: 'waste' })
      .set(authHeaders())

    expect(filteredRes.status).toBe(200)
    expect(filteredRes.body.records).toHaveLength(1)
    expect(filteredRes.body.records[0].kind).toBe('waste')

    const exportRes = await request(app)
      .get('/api/costs/records/export')
      .query({ from: '2026-03-17', to: '2026-03-18', kind: 'all' })
      .set(authHeaders())

    expect(exportRes.status).toBe(200)
    expect(exportRes.headers['content-type']).toContain('text/csv')
    expect(exportRes.text).toContain('entryDate,kind,title,amount,areaName,vendorName,quantityLabel,notes')
    expect(exportRes.text).toContain('Spoiled produce')
    expect(exportRes.text).toContain('Emergency dairy order')
  })
})
