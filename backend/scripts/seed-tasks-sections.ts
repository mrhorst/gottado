import { sql } from 'drizzle-orm'
import db from '../src/utils/db.ts'
import { orgMember, section, sectionMember, task, user } from '../src/db/schema.ts'

type TaskSeed = {
  title: string
  description?: string
  dueDate?: string
  deadlineTime?: string
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'yearly'
  requiresPicture?: boolean
}

const isoDateOffset = (daysFromToday: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString().split('T')[0]
}

const sectionTaskMap: Record<string, TaskSeed[]> = {
  'Kitchen Operations': [
    {
      title: 'Clean fryer station',
      description: 'Drain oil safely, scrub baskets, and log completion in sanitation board.',
      dueDate: isoDateOffset(0),
      deadlineTime: '14:00',
      requiresPicture: true,
    },
    {
      title: 'Check walk-in thermometer',
      dueDate: isoDateOffset(1),
      deadlineTime: '09:00',
      requiresPicture: false,
    },
    {
      title: 'Weekly deep clean checklist',
      description: 'Follow SOP-KITCH-07 from top to bottom and mark each sub-item.',
      recurrence: 'weekly',
      deadlineTime: '16:30',
      requiresPicture: true,
    },
    {
      title: 'Inventory spot count',
      recurrence: 'daily',
      deadlineTime: '11:30',
      requiresPicture: false,
    },
  ],
  'Front of House': [
    {
      title: 'Set opening floor plan',
      description: 'Place tables/chairs according to layout v3 before first reservation.',
      dueDate: isoDateOffset(0),
      deadlineTime: '10:30',
      requiresPicture: true,
    },
    {
      title: 'Refill host stand supplies',
      dueDate: isoDateOffset(2),
      requiresPicture: false,
    },
    {
      title: 'Service quality pulse check',
      recurrence: 'daily',
      deadlineTime: '18:00',
      requiresPicture: false,
    },
    {
      title: 'Monthly menu knowledge quiz',
      description: 'Run through specials, allergens, and pairings with the team.',
      recurrence: 'monthly',
      deadlineTime: '15:00',
      requiresPicture: false,
    },
  ],
  'Management & Admin': [
    {
      title: 'Post daily labor summary',
      description: 'Export labor report and add note for any variance above 3%.',
      dueDate: isoDateOffset(-1),
      deadlineTime: '22:00',
      requiresPicture: false,
    },
    {
      title: 'Upload invoice packet',
      dueDate: isoDateOffset(3),
      deadlineTime: '17:00',
      requiresPicture: true,
    },
    {
      title: 'Quarterly safety review',
      description: 'Review incident log trends and assign follow-ups.',
      recurrence: 'quarterly',
      deadlineTime: '13:00',
      requiresPicture: false,
    },
    {
      title: 'Team recognition board update',
      recurrence: 'weekly',
      requiresPicture: true,
    },
  ],
}

const run = async () => {
  const [owner] = await db
    .select({
      orgId: orgMember.orgId,
      userId: orgMember.userId,
      userName: user.name,
    })
    .from(orgMember)
    .innerJoin(user, sql`${orgMember.userId} = ${user.id}`)
    .where(sql`${orgMember.role} = 'owner'`)
    .limit(1)

  if (!owner) {
    throw new Error('No org owner found. Cannot seed sections/tasks.')
  }

  const result = await db.transaction(async (tx) => {
    // Keep audit history intact while allowing task/section reset.
    await tx.execute(sql`update audit_actions set task_id = null, section_id = null`)
    await tx.execute(sql`delete from task_activities`)
    await tx.execute(sql`delete from task_completions`)
    await tx.execute(sql`delete from tasks`)
    await tx.execute(sql`delete from section_members`)
    await tx.execute(sql`delete from sections`)

    const insertedSections = await tx
      .insert(section)
      .values(
        Object.keys(sectionTaskMap).map((name) => ({
          name,
          ownerId: owner.userId,
          orgId: owner.orgId,
        }))
      )
      .returning({
        id: section.id,
        name: section.name,
      })

    await tx.insert(sectionMember).values(
      insertedSections.map((s) => ({
        sectionId: s.id,
        userId: owner.userId,
        role: 'owner',
      }))
    )

    let insertedTaskCount = 0
    for (const seededSection of insertedSections) {
      const taskSeeds = sectionTaskMap[seededSection.name] || []
      if (taskSeeds.length === 0) continue
      await tx.insert(task).values(
        taskSeeds.map((item) => ({
          title: item.title,
          description: item.description ?? null,
          sectionId: seededSection.id,
          dueDate: item.dueDate ?? null,
          deadlineTime: item.deadlineTime ?? null,
          recurrence: item.recurrence ?? null,
          requiresPicture: item.requiresPicture ?? false,
        }))
      )
      insertedTaskCount += taskSeeds.length
    }

    const [sectionCount] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(section)
    const [taskCount] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(task)

    return {
      owner,
      insertedSections: insertedSections.length,
      insertedTasks: insertedTaskCount,
      totalSections: sectionCount.count,
      totalTasks: taskCount.count,
    }
  })

  console.log('Seed complete')
  console.log(`Owner: ${result.owner.userName} (user ${result.owner.userId}) in org ${result.owner.orgId}`)
  console.log(`Inserted: ${result.insertedSections} sections, ${result.insertedTasks} tasks`)
  console.log(`Totals now: ${result.totalSections} sections, ${result.totalTasks} tasks`)
}

run()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(() => process.exit(0))
