# AGENTS.md - Gottado Engineering Rules

## Development Workflow (Mandatory)
- Follow TDD for every feature, fix, and refactor:
- 1. Write or update failing tests first (RED).
- 2. Implement the smallest change to pass tests (GREEN).
- 3. Refactor while keeping tests green (REFACTOR).
- No feature is considered complete without automated test coverage for the critical path.

## Testing Standards
- Backend behavior changes require API/integration or E2E tests in `backend/tests`.
- Mobile UI behavior changes require at least one automated test path (unit/integration/E2E where feasible).
- Regressions must be covered by a test that would have failed before the fix.
- Before merge/ship, run:
- `backend`: `npm run test:e2e` (and relevant unit/integration suites)
- `mobile`: lint + relevant UI tests

## Design System Policy
- Reuse shared tokens from `mobile/styles/theme.ts`.
- Reuse shared primitives from `mobile/components/ui/*` before creating ad-hoc styles.
- Keep visual patterns consistent:
- cards, spacing, typography scale, button sizes, and status/priority badges should come from shared styles/components.

## Commit Policy
- Commit each feature/refactor/bug fix separately.
- Keep commit messages scoped and explicit.
