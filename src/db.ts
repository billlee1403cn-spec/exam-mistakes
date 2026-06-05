import Dexie, { type Table } from 'dexie'
import type { Mistake } from './types'

class MistakeDatabase extends Dexie {
  mistakes!: Table<Mistake, string>

  constructor() {
    super('MistakeDatabase')
    this.version(1).stores({
      mistakes: 'id, subject, createdAt, mastered, *knowledgePoints',
    })
  }
}

export const db = new MistakeDatabase()
