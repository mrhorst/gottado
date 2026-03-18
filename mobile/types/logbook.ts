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
  body: string
  entryDate: string
  createdAt: string
  updatedAt: string
  authorName: string
  isEditable: boolean
}

export interface LogbookEntryEdit {
  id: number
  previousBody: string
  editorName: string
  createdAt: string
}

export interface LogbookDayResponse {
  template: LogbookTemplateDetail
  entry: LogbookEntry | null
}

export interface LogbookHistoryResponse {
  edits: LogbookEntryEdit[]
}

export interface LogbookEntryDatesResponse {
  dates: string[]
}
