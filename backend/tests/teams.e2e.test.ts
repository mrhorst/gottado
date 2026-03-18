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

describe('Teams API E2E', () => {
  let app: Express
  let client: Client
  let db: ReturnType<typeof drizzle>
  let token: string
  let orgId: number
  let areaId: number
  let ownerId: number
  let teammateId: number

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

    const [org] = await db
      .insert(schema.organization)
      .values({ name: `Org ${Date.now()}` })
      .returning()
    orgId = org.id

    const passwordHash = await bcrypt.hash('password123', 10)

    const [owner] = await db
      .insert(schema.user)
      .values({
        name: 'Owner User',
        email: `owner-${Date.now()}@example.com`,
        passwordHash,
      })
      .returning()
    ownerId = owner.id

    const [teammate] = await db
      .insert(schema.user)
      .values({
        name: 'Teammate User',
        email: `teammate-${Date.now()}@example.com`,
        passwordHash,
      })
      .returning()
    teammateId = teammate.id

    await db.insert(schema.orgMember).values([
      { orgId, userId: ownerId, role: 'owner' },
      { orgId, userId: teammateId, role: 'editor' },
    ])

    const [area] = await db
      .insert(schema.section)
      .values({ name: `Kitchen Ops ${Date.now()}`, orgId, ownerId })
      .returning()
    areaId = area.id

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

  it('creates teams, manages members, and links an area to a primary team', async () => {
    const createRes = await request(app)
      .post('/api/teams')
      .set(authHeaders())
      .send({
        name: 'AM Kitchen Team',
        description: 'Opening shift kitchen crew',
      })

    expect(createRes.status).toBe(201)
    expect(createRes.body.name).toBe('AM Kitchen Team')
    const teamId = createRes.body.id as number

    const listRes = await request(app).get('/api/teams').set(authHeaders())
    expect(listRes.status).toBe(200)
    expect(listRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: teamId,
          name: 'AM Kitchen Team',
          memberCount: 0,
        }),
      ])
    )

    const addMemberRes = await request(app)
      .post(`/api/teams/${teamId}/members`)
      .set(authHeaders())
      .send({ userId: teammateId, role: 'lead' })

    expect(addMemberRes.status).toBe(201)

    const detailRes = await request(app)
      .get(`/api/teams/${teamId}`)
      .set(authHeaders())

    expect(detailRes.status).toBe(200)
    expect(detailRes.body.team).toEqual(
      expect.objectContaining({
        id: teamId,
        name: 'AM Kitchen Team',
      })
    )
    expect(detailRes.body.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: teammateId,
          role: 'lead',
          name: 'Teammate User',
        }),
      ])
    )

    const linkAreaRes = await request(app)
      .put(`/api/sections/${areaId}`)
      .set(authHeaders())
      .send({ teamId })

    expect(linkAreaRes.status).toBe(200)

    const areasRes = await request(app).get('/api/sections').set(authHeaders())

    expect(areasRes.status).toBe(200)
    expect(areasRes.body.active).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: areaId,
          teamId,
          teamName: 'AM Kitchen Team',
        }),
      ])
    )
  })
})
