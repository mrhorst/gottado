import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import jwt from 'jsonwebtoken'
import { Client } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'
import * as schema from '../src/db/schema.ts'
import { cleanDatabase, resetTestDatabase, setupTestDb } from './test-db.ts'
import bcrypt from 'bcrypt'

const TEST_DB_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/gottado_test'

describe('Tasks API E2E', () => {
  let app: Express
  let client: Client
  let db: ReturnType<typeof drizzle>
  let token: string
  let orgId: number
  let sectionId: number
  let listId: number
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

    const [org] = await db
      .insert(schema.organization)
      .values({ name: `Org ${Date.now()}` })
      .returning()
    orgId = org.id

    const passwordHash = await bcrypt.hash('password123', 10)
    const [user] = await db
      .insert(schema.user)
      .values({
        name: 'E2E User',
        email: `e2e-${Date.now()}@example.com`,
        passwordHash,
      })
      .returning()
    userId = user.id

    await db
      .insert(schema.orgMember)
      .values({ orgId, userId, role: 'owner' })
      .returning()

    const [section] = await db
      .insert(schema.section)
      .values({ name: `Ops ${Date.now()}`, orgId, ownerId: userId })
      .returning()
    sectionId = section.id

    await db
      .insert(schema.sectionMember)
      .values({ sectionId, userId, role: 'owner' })
      .returning()

    const listResult = await db.execute(sql`
      insert into task_lists (section_id, name, sort_order)
      values (${sectionId}, ${'Daily Checks'}, 0)
      returning id
    `)
    listId = Number(listResult.rows[0].id)

    token = jwt.sign(
      { sub: String(userId), email: user.email, name: user.name },
      'secret'
    )
  })

  afterAll(async () => {
    await client.end()
  })

  it('creates, lists, updates and completes a task with priority', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set(authHeaders())
      .send({
        title: 'Close kitchen',
        description: 'Deep clean and lock up',
        sectionId,
        listId,
        dueDate: '2026-03-16',
        deadlineTime: '22:00',
        priority: 'high',
      })

    expect(createRes.status).toBe(201)
    expect(createRes.body.priority).toBe('high')
    expect(createRes.body.listId).toBe(listId)
    const taskId = createRes.body.id as number

    const listRes = await request(app).get('/api/tasks').set(authHeaders())
    expect(listRes.status).toBe(200)
    expect(
      listRes.body.some(
        (t: { id: number; priority: string; listId: number; listName: string }) =>
          t.id === taskId &&
          t.priority === 'high' &&
          t.listId === listId &&
          t.listName === 'Daily Checks'
      )
    ).toBe(true)

    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set(authHeaders())
      .send({ priority: 'low' })

    expect(updateRes.status).toBe(200)
    expect(updateRes.body.priority).toBe('low')

    const completeRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set(authHeaders())
      .send({ complete: true })

    expect(completeRes.status).toBe(200)
    expect(completeRes.body.complete).toBe(true)

    const historyRes = await request(app)
      .get(`/api/tasks/${taskId}/history`)
      .set(authHeaders())
    expect(historyRes.status).toBe(200)
    expect(historyRes.body.length).toBeGreaterThan(0)
  })

  it('defaults task ownership from the area team and allows overriding it later', async () => {
    const [primaryTeam] = await db
      .insert(schema.team)
      .values({
        orgId,
        name: `Kitchen Team ${Date.now()}`,
        description: 'Primary kitchen ownership',
      })
      .returning()

    const [secondaryTeam] = await db
      .insert(schema.team)
      .values({
        orgId,
        name: `Closing Team ${Date.now()}`,
        description: 'Secondary ownership',
      })
      .returning()

    await db
      .update(schema.section)
      .set({ teamId: primaryTeam.id })
      .where(sql`${schema.section.id} = ${sectionId}`)

    const createRes = await request(app)
      .post('/api/tasks')
      .set(authHeaders())
      .send({
        title: 'Reset line',
        sectionId,
        listId,
        priority: 'medium',
      })

    expect(createRes.status).toBe(201)
    expect(createRes.body.assignedTeamId).toBe(primaryTeam.id)
    const taskId = createRes.body.id as number

    const listRes = await request(app).get('/api/tasks').set(authHeaders())
    expect(listRes.status).toBe(200)
    expect(
      listRes.body.some(
        (t: {
          id: number
          assignedTeamId: number | null
          assignedTeamName: string | null
        }) =>
          t.id === taskId &&
          t.assignedTeamId === primaryTeam.id &&
          t.assignedTeamName === primaryTeam.name
      )
    ).toBe(true)

    const overrideRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set(authHeaders())
      .send({ assignedTeamId: secondaryTeam.id })

    expect(overrideRes.status).toBe(200)
    expect(overrideRes.body.assignedTeamId).toBe(secondaryTeam.id)
  })

  it('enforces photo-required completion', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set(authHeaders())
      .send({
        title: 'Verify stock room',
        sectionId,
        listId,
        requiresPicture: true,
        priority: 'medium',
      })

    expect(createRes.status).toBe(201)
    const taskId = createRes.body.id as number

    const rejectRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set(authHeaders())
      .send({ complete: true })

    expect(rejectRes.status).toBe(400)

    const acceptRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set(authHeaders())
      .send({ complete: true, pictureUrl: '/uploads/e2e.jpg' })

    expect(acceptRes.status).toBe(200)
    expect(acceptRes.body.complete).toBe(true)
  })

  it('returns completion audit details in the daily snapshot', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set(authHeaders())
      .send({
        title: 'Clean fryers',
        sectionId,
        listId,
        requiresPicture: true,
        priority: 'high',
      })

    expect(createRes.status).toBe(201)
    const taskId = createRes.body.id as number

    const completeRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set(authHeaders())
      .send({ complete: true, pictureUrl: '/uploads/fryers-clean.jpg' })

    expect(completeRes.status).toBe(200)

    const today = new Date().toISOString().split('T')[0]
    const snapshotRes = await request(app)
      .get(`/api/tasks/snapshot?date=${today}`)
      .set(authHeaders())

    expect(snapshotRes.status).toBe(200)
    expect(snapshotRes.body.completions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          taskId,
          taskTitle: 'Clean fryers',
          completedBy: userId,
          completedByName: 'E2E User',
          requiresPicture: true,
          pictureUrl: '/uploads/fryers-clean.jpg',
        }),
      ])
    )
  })

  it('lists task lists within a section with progress summary', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set(authHeaders())
      .send({
        title: 'Prep station check',
        sectionId,
        listId,
        priority: 'medium',
      })

    expect(createRes.status).toBe(201)

    const listsRes = await request(app)
      .get(`/api/sections/${sectionId}/task-lists`)
      .set(authHeaders())

    expect(listsRes.status).toBe(200)
    expect(listsRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: listId,
          name: 'Daily Checks',
          totalTasks: 1,
          completedTasks: 0,
        }),
      ])
    )
  })

  it('creates a task list inside a section', async () => {
    const createListRes = await request(app)
      .post(`/api/sections/${sectionId}/task-lists`)
      .set(authHeaders())
      .send({
        name: 'Closing',
        description: 'End-of-day shutdown checklist',
      })

    expect(createListRes.status).toBe(201)
    expect(createListRes.body.name).toBe('Closing')
    expect(createListRes.body.sectionId).toBe(sectionId)

    const listsRes = await request(app)
      .get(`/api/sections/${sectionId}/task-lists`)
      .set(authHeaders())

    expect(listsRes.status).toBe(200)
    expect(listsRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createListRes.body.id,
          name: 'Closing',
          totalTasks: 0,
          completedTasks: 0,
        }),
      ])
    )
  })
})
