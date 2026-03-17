import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import * as schema from '../src/db/schema.ts'
import bcrypt from 'bcrypt'

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/gottado_test'

/**
 * Test data factories for creating entities in tests
 */
export class TestFactories {
  private client: Client
  private db: ReturnType<typeof drizzle>

  constructor() {
    this.client = new Client({ connectionString: TEST_DB_URL })
    this.db = drizzle(this.client, { schema })
  }

  async connect(): Promise<void> {
    await this.client.connect()
  }

  async disconnect(): Promise<void> {
    await this.client.end()
  }

  /**
   * Create an organization
   */
  async createOrganization(overrides: Partial<typeof schema.organization.$inferInsert> = {}) {
    const [org] = await this.db.insert(schema.organization).values({
      name: 'Test Organization',
      ...overrides,
    }).returning()
    return org
  }

  /**
   * Create a user
   */
  async createUser(overrides: Partial<typeof schema.user.$inferInsert> = {}) {
    const passwordHash = await bcrypt.hash('password123', 10)
    
    const [user] = await this.db.insert(schema.user).values({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      passwordHash,
      ...overrides,
    }).returning()
    
    return user
  }

  /**
   * Add a user to an organization
   */
  async addOrgMember(orgId: number, userId: number, role: 'owner' | 'editor' | 'viewer' = 'viewer') {
    const [member] = await this.db.insert(schema.orgMember).values({
      orgId,
      userId,
      role,
    }).returning()
    return member
  }

  /**
   * Create an audit template with checkpoints
   */
  async createAuditTemplate(orgId: number, createdBy: number, overrides: Partial<typeof schema.auditTemplate.$inferInsert> = {}) {
    const [template] = await this.db.insert(schema.auditTemplate).values({
      name: 'Test Template',
      description: 'A test audit template',
      orgId,
      createdBy,
      ...overrides,
    }).returning()

    return template
  }

  /**
   * Create audit checkpoints for a template
   */
  async createCheckpoints(templateId: number, checkpoints: Array<Partial<typeof schema.auditCheckpoint.$inferInsert>>) {
    const data = checkpoints.map((cp, index) => ({
      templateId,
      zone: cp.zone || 'Routines',
      label: cp.label || `Checkpoint ${index + 1}`,
      description: cp.description || 'Test checkpoint',
      scoringType: cp.scoringType || 'score',
    }))

    return await this.db.insert(schema.auditCheckpoint).values(data).returning()
  }

  /**
   * Create an audit run
   */
  async createAuditRun(templateId: number, orgId: number, conductedBy: number, overrides: Partial<typeof schema.auditRun.$inferInsert> = {}) {
    const [run] = await this.db.insert(schema.auditRun).values({
      templateId,
      orgId,
      conductedBy,
      status: 'in_progress',
      startedAt: new Date(),
      ...overrides,
    }).returning()

    return run
  }

  /**
   * Create audit findings for a run
   */
  async createFindings(runId: number, checkpointIds: number[], assessments: Array<{ score: number; notes?: string }>) {
    const findings = assessments.map((assessment, index) => ({
      runId,
      checkpointId: checkpointIds[index],
      score: assessment.score,
      notes: assessment.notes || null,
      status: assessment.score >= 4 ? 'passed' : 'failed',
    }))

    return await this.db.insert(schema.auditFinding).values(findings).returning()
  }

  /**
   * Create a task
   */
  async createTask(orgId: number, overrides: Partial<typeof schema.task.$inferInsert> = {}) {
    const [task] = await this.db.insert(schema.task).values({
      title: 'Test Task',
      description: 'A test task',
      orgId,
      category: 'Routines',
      frequency: 'daily',
      ...overrides,
    }).returning()

    return task
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: number, userId: number, overrides: Partial<typeof schema.taskCompletion.$inferInsert> = {}) {
    const [completion] = await this.db.insert(schema.taskCompletion).values({
      taskId,
      completedBy: userId,
      completedAt: new Date(),
      ...overrides,
    }).returning()

    return completion
  }

  /**
   * Create an action item from a finding
   */
  async createActionItem(findingId: number, orgId: number, overrides: Partial<typeof schema.auditActions.$inferInsert> = {}) {
    const [action] = await this.db.insert(schema.auditActions).values({
      findingId,
      orgId,
      title: 'Test Action Item',
      description: 'Fix the issue',
      priority: 'high',
      status: 'open',
      ...overrides,
    }).returning()

    return action
  }
}

/**
 * Helper to run operations in a transaction
 */
export async function withTransaction<T>(callback: (factories: TestFactories) => Promise<T>): Promise<T> {
  const factories = new TestFactories()
  await factories.connect()
  
  try {
    const result = await callback(factories)
    return result
  } finally {
    await factories.disconnect()
  }
}