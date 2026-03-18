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

describe('Labor API E2E', () => {
  let app: Express
  let client: Client
  let db: ReturnType<typeof drizzle>
  let token: string
  let orgId: number
  let ownerId: number
  let areaId: number
  let teamId: number
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

    const passwordHash = await bcrypt.hash('password123', 10)
    const [owner] = await db
      .insert(schema.user)
      .values({
        name: 'Labor Owner',
        email: `labor-owner-${Date.now()}@example.com`,
        passwordHash,
      })
      .returning()
    ownerId = owner.id

    const [teammate] = await db
      .insert(schema.user)
      .values({
        name: 'Jordan Lead',
        email: `labor-member-${Date.now()}@example.com`,
        passwordHash,
      })
      .returning()
    teammateId = teammate.id

    const [org] = await db
      .insert(schema.organization)
      .values({ name: `Labor Org ${Date.now()}` })
      .returning()
    orgId = org.id

    await db.insert(schema.orgMember).values([
      { orgId, userId: ownerId, role: 'owner' },
      { orgId, userId: teammateId, role: 'editor' },
    ])

    const [team] = await db
      .insert(schema.team)
      .values({
        orgId,
        name: `AM Kitchen Team ${Date.now()}`,
        description: 'Morning kitchen coverage',
      })
      .returning()
    teamId = team.id

    await db.insert(schema.teamMember).values({
      teamId,
      userId: teammateId,
      role: 'lead',
    })

    const [section] = await db
      .insert(schema.section)
      .values({
        name: `Kitchen Ops ${Date.now()}`,
        orgId,
        ownerId,
        teamId,
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

  it('lists labor references and allows a manager to create and fetch daily shifts', async () => {
    const referencesRes = await request(app)
      .get('/api/labor/references')
      .set(authHeaders())

    expect(referencesRes.status).toBe(200)
    expect(referencesRes.body.areas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: areaId,
          name: expect.stringContaining('Kitchen Ops'),
          teamId,
        }),
      ])
    )
    expect(referencesRes.body.teams).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: teamId,
          name: expect.stringContaining('AM Kitchen Team'),
        }),
      ])
    )
    expect(referencesRes.body.members).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: teammateId,
          name: 'Jordan Lead',
          role: 'editor',
        }),
      ])
    )

    const createRes = await request(app)
      .post('/api/labor/shifts')
      .set(authHeaders())
      .send({
        title: 'Open kitchen line',
        shiftDate: '2026-03-18',
        startTime: '08:00',
        endTime: '16:00',
        areaId,
        assignedTeamId: teamId,
        assignedUserId: teammateId,
        notes: 'Prep all stations before 8:30.',
      })

    expect(createRes.status).toBe(201)
    expect(createRes.body.title).toBe('Open kitchen line')
    expect(createRes.body.areaId).toBe(areaId)
    expect(createRes.body.assignedTeamId).toBe(teamId)
    expect(createRes.body.assignedUserId).toBe(teammateId)

    const listRes = await request(app)
      .get('/api/labor/shifts')
      .query({ date: '2026-03-18' })
      .set(authHeaders())

    expect(listRes.status).toBe(200)
    expect(listRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Open kitchen line',
          areaName: expect.stringContaining('Kitchen Ops'),
          assignedTeamName: expect.stringContaining('AM Kitchen Team'),
          assignedUserName: 'Jordan Lead',
        }),
      ])
    )
  })
})
