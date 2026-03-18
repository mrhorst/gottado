export type CostKind = 'waste' | 'purchase' | 'vendor_issue'

export interface CostRecord {
  id: number
  kind: CostKind
  title: string
  entryDate: string
  amount: string
  areaId?: number | null
  areaName?: string | null
  vendorName?: string | null
  quantityLabel?: string | null
  notes?: string | null
  createdAt?: string
}

export interface CostSummary {
  totalAmount: string
  wasteCount: number
  purchaseCount: number
  vendorIssueCount: number
}

export interface CostRecordsResponse {
  summary: CostSummary
  records: CostRecord[]
}

export type CostFilter = CostKind | 'all'

export interface CostReferenceArea {
  id: number
  name: string
}

export interface CostReferencesResponse {
  areas: CostReferenceArea[]
}

export interface CreateCostRecordPayload {
  kind: CostKind
  title: string
  entryDate: string
  amount: string
  areaId?: number | null
  vendorName?: string
  quantityLabel?: string
  notes?: string
}

export interface ExportCostRecordsParams {
  from: string
  to: string
  kind: CostFilter
}
