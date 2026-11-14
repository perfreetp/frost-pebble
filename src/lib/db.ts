import Dexie, { type Table } from 'dexie'
import type { PVModule, Roof, Scheme } from '../types'

class PvDb extends Dexie {
  roofs!: Table<Roof, string>
  schemes!: Table<Scheme, string>
  modules!: Table<PVModule, string>

  constructor() {
    super('pv-roof-layout')
    this.version(1).stores({
      roofs: 'id, name, updatedAt',
      schemes: 'id, roofId, name, updatedAt',
      modules: 'id, model',
    })
  }
}

export const db = new PvDb()
