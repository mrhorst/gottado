export interface LogbookTemplateSummary {
  id: number
  title: string
  description?: string | null
  isSystem: boolean
  active: boolean
  entryCount: number
  lastEntryAt?: string | null
  lastEntryPreview?: string | null
  lastAuthorName?: string | null
}

export interface LogbookTemplateDetail {
  id: number
  title: string
  description?: string | null
  isSystem?: boolean
}

export interface LogbookEntry {
  id: number
  title?: string | null
  body: string
  entryDate: string
  createdAt: string
  authorName: string
}

export interface LogbookEntriesResponse {
  template: LogbookTemplateDetail
  entries: LogbookEntry[]
}
