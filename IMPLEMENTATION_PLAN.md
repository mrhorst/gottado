# Gottado Technical Implementation Plan
## Cafe Takeover Roadmap (Target: April 1, 2026)

**Created:** March 16, 2026  
**Context:** Family acquiring bagel cafe, 4 partners, transitioning from GM role at current restaurant  
**Goal:** Production-ready operational excellence platform for takeover day

---

## Executive Summary

This plan prioritizes features that deliver immediate value during the cafe takeover while establishing the foundation for long-term operational excellence. Items are organized by business impact and technical complexity.

**Phase 1 (Critical):** Items needed before April 1st for basic operations  
**Phase 2 (High Value):** Items that significantly improve efficiency within first month  
**Phase 3 (Strategic):** Long-term competitive advantages

---

## Phase 1: Critical Pre-Takeover (Complete by March 30)

### 1.1 Photo Attachments for Audit Findings
**Priority:** Critical  
**Business Value:** Visual documentation for maintenance issues, partner updates, contractor quotes  
**Complexity:** Medium  
**Estimated Effort:** 4-6 hours

#### Technical Implementation

**Backend Changes:**
```
New Table: audit_photos
- id: integer PK
- finding_id: integer FK → audit_findings
- storage_path: text (relative path, e.g., "uploads/audits/{orgId}/{runId}/{filename}")
- original_filename: varchar(255)
- mime_type: varchar(50)
- file_size: integer (bytes)
- created_at: timestamp
- created_by: integer FK → users

New Endpoints:
POST /audits/runs/:runId/findings/:findingId/photos
  - multipart/form-data upload
  - Max file size: 5MB
  - Accept: jpg, png, webp
  - Store to filesystem (not DB BLOB)
  - Return: { id, url, thumbnailUrl }

GET /audits/photos/:id
  - Stream file from storage
  - 304 caching support

DELETE /audits/photos/:id
  - Soft delete (flag only)
  - Cleanup job runs separately
```

**Mobile Changes:**
- Add `expo-image-picker` dependency
- Photo capture/gallery selection in finding detail screen
- Lazy-loaded thumbnail grid in finding view
- Full-screen photo viewer with pinch-zoom

**Storage Strategy:**
```
Local filesystem structure:
/home/mhorst/.openclaw/workspace/.spec/projects/gottado/backend/uploads/
├── audits/
│   ├── {orgId}/
│   │   ├── {runId}/
│   │   │   ├── original/
│   │   │   └── thumbnails/ (300x300, webp)
```

**Security:**
- Validate org ownership on all photo access
- Sanitize filenames (uuidv4 + original extension)
- Scan file headers (not just extension)
- Rate limiting: 10 uploads per minute per user

---

### 1.2 Offline-First Sync for Critical Operations
**Priority:** Critical  
**Business Value:** Restaurant WiFi is unreliable; audits must work offline  
**Complexity:** High  
**Estimated Effort:** 12-16 hours

#### Technical Implementation

**Architecture Overview:**
```
Mobile Layer:
┌─────────────────────────────────────────┐
│  UI (Screens)                           │
├─────────────────────────────────────────┤
│  React Query + Optimistic Updates       │
├─────────────────────────────────────────┤
│  Sync Engine (new)                      │
│  - Queue pending operations             │
│  - Conflict resolution                  │
│  - Background sync                      │
├─────────────────────────────────────────┤
│  Local SQLite (expo-sqlite)             │
│  - Mirrors server schema                │
│  - Full offline capability              │
├─────────────────────────────────────────┤
│  Network Monitor (NetInfo)              │
└─────────────────────────────────────────┘
```

**Database Schema (Local SQLite):**
```sql
-- Mirrors server tables with sync metadata
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY,
  table_name TEXT NOT NULL,  -- 'tasks', 'audit_findings', etc.
  operation TEXT NOT NULL,   -- 'CREATE', 'UPDATE', 'DELETE'
  payload TEXT NOT NULL,     -- JSON
  server_id INTEGER,         -- null if not yet synced
  local_id TEXT NOT NULL,    -- client-generated UUID
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE sync_metadata (
  table_name TEXT PRIMARY KEY,
  last_sync_at INTEGER       -- Unix timestamp
);
```

**Sync Engine Logic:**
```typescript
// Pseudo-code for sync flow
class SyncEngine {
  async sync() {
    if (!isOnline) return;
    
    // 1. Push pending operations
    const pending = await db.getPendingOperations();
    for (const op of pending) {
      try {
        const result = await this.pushToServer(op);
        await db.markSynced(op.id, result.serverId);
      } catch (error) {
        await db.incrementRetry(op.id, error.message);
      }
    }
    
    // 2. Pull server changes
    const tables = ['tasks', 'audit_runs', 'audit_findings'];
    for (const table of tables) {
      const lastSync = await db.getLastSync(table);
      const changes = await api.getChanges(table, lastSync);
      await db.applyChanges(table, changes);
    }
  }
  
  // Conflict resolution: server wins, but log conflict
  resolveConflict(local, server) {
    return {
      ...server,
      _conflictFlag: true,
      _localVersion: local
    };
  }
}
```

**UI Feedback:**
- Sync status indicator in header (synced/pending/conflict)
- Offline badge when no connectivity
- Retry button for failed operations
- Conflict resolution UI (rare, but needed)

**Initial Scope (MVP):**
- Offline: Task completion toggles
- Offline: Audit finding updates
- Offline: Photo capture (queue for upload)
- Online required: New audit runs, template changes

---

### 1.3 Quick-Entry Audit Mode
**Priority:** High  
**Business Value:** Daily walkthroughs in <5 minutes vs current thorough audit  
**Complexity:** Low  
**Estimated Effort:** 3-4 hours

#### Technical Implementation

**New Template Type:**
```typescript
// Add to audit_templates table
interface QuickAuditConfig {
  type: 'full' | 'quick';
  maxCheckpoints: number;  // e.g., 10 for quick mode
  requiredZones: string[]; // subset of PRESTO zones
}
```

**New Endpoint:**
```
POST /audits/runs/quick
Body: { templateId, zones?: string[] }
Response: { id, status, prioritizedCheckpoints: [...] }

Logic:
- If zones provided, filter checkpoints
- Otherwise, pick top N by:
  1. Lowest historical score
  2. Most overdue follow-ups
  3. Random rotation (avoid checklist fatigue)
```

**Mobile UI:**
- "Start Quick Audit" button on audit hub
- Swipeable cards (like Tinder) for rapid scoring
- One-tap: Pass / Fail / Flag for later
- 30-second per checkpoint target

**Scoring Simplification:**
- Quick mode: Pass/Fail only (no 0-5 scale)
- Auto-calculate overall score
- Option to convert to full audit if issues found

---

### 1.4 Partner Reporting Dashboard
**Priority:** High  
**Business Value:** Transparency for 4-way partnership  
**Complexity:** Medium  
**Estimated Effort:** 6-8 hours

#### Technical Implementation

**New Endpoint:**
```
GET /reports/partner-summary
Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
Response: {
  period: { start, end },
  summary: {
    totalAudits: number,
    averageScore: number,
    trending: 'up' | 'down' | 'stable',
    criticalFindings: number,
    openActions: number
  },
  zoneBreakdown: {
    People: { score, previousScore, topIssues: [...] },
    Routines: { ... },
    // ... all PRESTO zones
  },
  actionItems: {
    total: number,
    byStatus: { proposed: N, approved: N, promoted: N },
    byPriority: { critical: N, high: N, medium: N, low: N },
    highImpact: [...]  // top 5 by priority
  },
  completedTasks: {
    total: number,
    onTime: number,
    late: number
  }
}
```

**Export Formats:**
```
GET /reports/partner-summary.pdf
- Server-side PDF generation (puppeteer or pdfmake)
- Executive summary first page
- Zone breakdown with sparkline charts
- Appendix: Full action item list

GET /reports/partner-summary.csv
- Flattened data for Excel analysis
- One row per action item
- Columns: date, zone, issue, severity, assignee, status
```

**Mobile UI:**
- "Generate Report" button on dashboard
- Date range picker (presets: This Week, Last Week, This Month)
- Preview before export
- Share via system share sheet (email to partners)

---

## Phase 2: High Value First Month (April 1-30)

### 2.1 Shift Handoff Logging
**Priority:** High  
**Business Value:** Digital replacement for paper shift logs  
**Complexity:** Low  
**Estimated Effort:** 4-5 hours

#### Technical Implementation

**New Entity:**
```
Table: shift_notes
- id: integer PK
- org_id: integer FK
- section_id: integer FK (nullable - could be general)
- shift_date: date
- shift_type: varchar(20)  -- 'opening', 'closing', 'mid'
- notes: text
- created_by: integer FK
- created_at: timestamp

Categories (stored as tags):
- 86_list (comma-separated items)
- equipment_issues
- vip_customers
- staff_notes
- weather_impact
- special_events
```

**Endpoints:**
```
GET /shifts/notes?date=YYYY-MM-DD&sectionId=N
POST /shifts/notes
PUT /shifts/notes/:id
```

**Mobile UI:**
- Quick-entry form with category chips
- "Carry forward" 86 list from previous shift
- Photo attachments for equipment issues
- @mentions for staff notifications

---

### 2.2 Prep List Templates
**Priority:** Medium  
**Business Value:** Standardized daily prep, reduces waste  
**Complexity:** Low  
**Estimated Effort:** 3-4 hours

#### Technical Implementation

**Extend Tasks:**
```typescript
// Add to tasks table
type TaskTemplate = 'custom' | 'prep' | 'cleaning' | 'maintenance';
type PrepCategory = 
  | 'bagels' 
  | 'spreads' 
  | 'proteins' 
  | 'soups' 
  | 'pastries'
  | 'beverages'
  | 'supplies';

// New fields:
- template_type: TaskTemplate (default: 'custom')
- prep_category: PrepCategory (nullable)
- par_level: integer (nullable, target quantity)
- unit: varchar(20) (e.g., 'dozen', 'lbs', 'gallons')
```

**Template System:**
```
POST /tasks/templates/seed-prep
// Idempotent - creates standard prep tasks for cafe

Default Prep Tasks:
- Bagels: Check par level, order if below
- Cream Cheese: Check flavors, restock
- Coffee: Grind beans, check supplies
- Soup: Prepare daily soup
- Pastries: Arrange display case
```

**Mobile Enhancements:**
- Filter tasks by template_type
- "Start Prep Mode" - shows only prep tasks
- Quantity input with unit display
- Check-off with timestamp

---

### 2.3 Enhanced Notification System
**Priority:** Medium  
**Business Value:** Keep partners informed without app usage  
**Complexity:** Medium  
**Estimated Effort:** 6-8 hours

#### Technical Implementation

**Notification Triggers:**
```typescript
// Events that generate notifications
const NOTIFICATION_EVENTS = {
  AUDIT_COMPLETED: 'audit.completed',
  CRITICAL_FINDING: 'finding.critical',
  ACTION_OVERDUE: 'action.overdue',
  TASK_MISSED: 'task.missed',
  SCORE_THRESHOLD: 'score.below_threshold'  // < 70%
};
```

**Channels:**
- In-app (already supported via React Query)
- Email (nodemailer)
- Telegram bot (existing OpenClaw infra)

**User Preferences:**
```
Table: notification_preferences
- user_id: integer PK FK
- email_enabled: boolean
- telegram_chat_id: varchar(100)
- score_threshold: integer (default: 70)
- notify_on: jsonb  -- array of event types
```

**Email Templates:**
- Weekly summary (every Monday 8am)
- Critical finding alert (immediate)
- Score drop alert (when audit < threshold)

---

## Phase 3: Strategic Enhancements (May+)

### 3.1 Cost Impact Tracking
**Priority:** Medium  
**Business Value:** ROI visibility for operational improvements  
**Complexity:** Medium  
**Estimated Effort:** 8-10 hours

#### Technical Implementation

**Extend Actions:**
```typescript
// Add to audit_actions
- estimated_cost: decimal(10,2)  // Cost of problem (monthly)
- estimated_savings: decimal(10,2)  // Savings if fixed
- actual_savings: decimal(10,2)  // Tracked after completion
- roi_months: integer  // Break-even timeline
```

**Dashboard Widget:**
```
Financial Impact Card:
- Potential savings from open actions: $X/month
- Realized savings from completed actions: $Y/month
- ROI timeline: Z months to break-even
```

**Calculation Logic:**
```typescript
// Example: Walk-in cooler door seal
estimated_cost = 150;  // $150/month in extra electricity
estimated_savings = 150;  // Full savings once fixed
roi_months = 1;  // $150 repair cost / $150 savings = 1 month

// Track actual via:
// - Manual entry after fix
// - Integration with POS for waste tracking
```

---

### 3.2 Multi-Location Support
**Priority:** Low (future-proofing)  
**Business Value:** Foundation for expansion  
**Complexity:** High  
**Estimated Effort:** 20-30 hours

**Note:** Data model already supports this. Main work is UI/UX for location switching and cross-location reporting.

---

## Implementation Order

### Week of March 17 (This Week)
1. Photo attachments (1.1) - Critical for documentation
2. Quick-entry mode (1.3) - Enables rapid daily audits

### Week of March 24
3. Offline sync MVP (1.2) - Core infrastructure
4. Partner reports (1.4) - Transparency for partners

### Week of March 31
5. Bug fixes, polish, testing
6. Deploy to production

### April (Post-Takeover)
7. Shift handoff logs (2.1) - Based on actual needs
8. Prep list templates (2.2) - After observing workflows
9. Notifications (2.3) - Once usage patterns clear

---

## Technical Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Offline sync conflicts | High | Server-wins strategy + conflict logging |
| Photo storage growth | Medium | 90-day auto-cleanup of old audit photos |
| Performance with large audits | Medium | Pagination on checkpoint lists |
| Partner resistance to app | High | PDF exports for non-app users |
| 4G data usage | Low | Image compression, lazy loading |

---

## Success Metrics

**April 1 (Launch Day):**
- [ ] First audit completed in < 10 minutes
- [ ] Photo captured of at least 1 maintenance issue
- [ ] Partner report generated and shared

**End of April:**
- [ ] 90% of daily tasks completed on-time
- [ ] Average PRESTO score > 75%
- [ ] < 5 open critical findings
- [ ] All 4 partners have viewed at least 1 report

---

## Notes for Implementation

1. **Branch Strategy:** Use `feat/phase1-{feature}` branches, merge to main when stable
2. **Testing:** Test offline mode with phone in airplane mode
3. **Backup:** Implement before cafe takeover - you'll be too busy after
4. **Training:** Schedule 30-min walkthrough with partners before April 1

---

*Plan created by Clawdio based on codebase review and cafe operational requirements*
