# Gottado Test Suite

Comprehensive test coverage for the Gottado cafe operations platform.

## Backend Tests (Vitest)

### Test Files

| File | Coverage | Tests |
|------|----------|-------|
| `auditPhotos.test.ts` | Photo attachments | Upload validation, file types, size limits, retrieval, deletion |
| `auditReports.test.ts` | Partner reporting | Summary generation, trend calculation, CSV export, zone breakdown |
| `auditRuns.test.ts` | Audit lifecycle | Start, complete, cancel runs, score calculation, duplicate prevention |
| `auditFindings.test.ts` | Finding assessment | Pass/fail, scoring (0-5), batch updates, validation |
| `integration.test.ts` | Full workflows | End-to-end audit flows, error handling |

### Running Backend Tests

```bash
cd backend

# Install dependencies (includes vitest)
npm install

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Coverage Goals

- **Controllers**: 90%+
- **Routes**: 80%+
- **Database queries**: 85%+

---

## Mobile Tests (Jest + React Native Testing Library)

### Test Files

| File | Coverage | Tests |
|------|----------|-------|
| `QuickAuditIndex.test.tsx` | Quick audit flow | Template listing, selection, navigation, empty states |
| `PartnerReport.test.tsx` | Partner dashboard | Data display, period selection, sharing, statistics |
| `auditService.test.tsx` | API integration | Data fetching, error handling, CSV download |

### Running Mobile Tests

```bash
cd mobile

# Install dependencies (includes jest, testing-library)
npm install

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Coverage Goals

- **Components**: 75%+
- **Hooks**: 80%+
- **Services**: 90%+

---

## Manual E2E Test Scenarios

### 1. Photo Attachment Flow
```
1. Start an audit
2. Navigate to a finding
3. Tap "Add Photo"
4. Select from gallery or take photo
5. Verify thumbnail appears
6. Tap thumbnail to view full image
7. Complete audit
8. Verify photo persisted in report
```

### 2. Quick Audit Flow
```
1. Tap "⚡ Quick Audit (5 min)"
2. Select template from list
3. See simplified conduct screen
4. Tap PASS/FAIL for each item
5. Watch progress bar fill
6. Complete audit
7. Verify score calculated correctly
```

### 3. Partner Report Flow
```
1. Tap "📊 Partner Report"
2. Verify all PRESTO zones display
3. Check summary statistics
4. Tap different period buttons
5. Verify data updates
6. Tap "Export CSV"
7. Verify file downloads
8. Open CSV, verify format
```

### 4. Offline Sync (Future)
```
1. Start audit with WiFi
2. Turn off WiFi mid-audit
3. Continue assessing findings
4. Turn WiFi back on
5. Verify sync completes
6. Check server has all data
```

---

## Test Data Requirements

### Seed Data for Testing

```sql
-- Test Organization
INSERT INTO orgs (id, name) VALUES (1, 'Test Cafe');

-- Test Users
INSERT INTO users (id, email, name, org_id) 
VALUES (1, 'manager@test.com', 'Test Manager', 1);

-- Test Template
INSERT INTO audit_templates (id, org_id, name, description, active)
VALUES (1, 1, 'Daily Opening', 'Morning checklist', true);

-- Test Checkpoints
INSERT INTO audit_checkpoints (template_id, zone, label, scoring_type, sort_order)
VALUES 
  (1, 'People', 'Staff present', 'pass_fail', 1),
  (1, 'Routines', 'Prep started', 'pass_fail', 2),
  (1, 'Execution', 'Food quality', 'score', 3);
```

---

## Continuous Integration

### Recommended CI Steps

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm ci
      - run: cd backend && npm run test:coverage
      
  mobile-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd mobile && npm ci
      - run: cd mobile && npm test
```

---

## Known Test Limitations

1. **Photo upload tests** mock file system - real uploads need device/emulator
2. **Share functionality** uses mocks - actual share sheet requires iOS/Android
3. **Camera functionality** not tested - requires physical device
4. **Push notifications** not tested - requires notification permissions

---

## Adding New Tests

### Backend Pattern
```typescript
import { describe, it, expect, vi } from 'vitest'
import { myController } from '@/controllers/myController.ts'

describe('My Feature', () => {
  it('should do something', async () => {
    // Arrange
    const mockReq = { ... }
    const mockRes = { ... }
    
    // Act
    await myController(mockReq, mockRes, vi.fn())
    
    // Assert
    expect(mockRes.send).toHaveBeenCalledWith(expected)
  })
})
```

### Mobile Pattern
```typescript
import { render, screen, fireEvent } from '@testing-library/react-native'
import MyComponent from '@/app/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeTruthy()
  })
})
```

---

## Test Maintenance

- Update tests when API contracts change
- Add tests for bug fixes (regression prevention)
- Keep test data in sync with schema migrations
- Review coverage reports monthly
- Refactor tests as code evolves (avoid brittle tests)