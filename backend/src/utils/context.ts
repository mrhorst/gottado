import { AsyncLocalStorage } from 'async_hooks'

export interface GottadoContext {
  orgId: number
}

const als = new AsyncLocalStorage<GottadoContext>()

export default als
