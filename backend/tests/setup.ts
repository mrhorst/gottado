import { vi } from 'vitest'

// Mock database
vi.mock('@/utils/db.ts', () => ({
  default: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: vi.fn(),
  },
}))

// Mock environment variables
process.env.JWT_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Global test utilities
global.mockAuthUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
}