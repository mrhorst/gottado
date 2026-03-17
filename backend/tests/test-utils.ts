import { vi } from 'vitest'

/**
 * Creates a properly chained mock for Drizzle ORM queries
 * Usage: const mockDb = createMockDb()
 * mockDb.select.mockReturnValue({ from: () => ({ where: () => ({ limit: () => Promise.resolve([data]) }) }) })
 */
export function createMockDb() {
  const createChainable = (finalReturn: any = []) => {
    const chain: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(finalReturn),
      returning: vi.fn().mockResolvedValue(finalReturn),
    }
    return chain
  }

  return {
    select: vi.fn().mockImplementation(() => createChainable()),
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    })),
    update: vi.fn().mockImplementation(() => ({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    })),
    delete: vi.fn().mockImplementation(() => ({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    })),
  }
}

/**
 * Sets up a mock return value for a select query chain
 */
export function mockSelectChain(db: any, returnValue: any) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(returnValue),
  }
  db.select.mockReturnValue(chain)
  return chain
}

/**
 * Sets up a mock return value for an insert query
 */
export function mockInsert(db: any, returnValue: any) {
  db.insert.mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(returnValue),
    }),
  })
}

/**
 * Sets up a mock return value for an update query
 */
export function mockUpdate(db: any, returnValue: any) {
  db.update.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(returnValue),
      }),
    }),
  })
}