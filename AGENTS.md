# AGENTS.md - Gottado Engineering Rules

## Development Workflow (Mandatory)

* **Behavior-First TDD:** Follow TDD for every feature, fix, and refactor.
1. **RED:** Write a test describing the *expected outcome* (e.g., "The list should display exactly 5 items").
2. **GREEN:** Implement the smallest change to satisfy that specific outcome.
3. **REFACTOR:** Clean the code while ensuring the semantic outcome remains unchanged.


* No feature is considered complete without automated test coverage for the **critical path**.

## Testing & Semantic Correctness

* **State-to-UI Mapping:** Tests must verify that the UI state is a direct reflection of the data.
* *Example:* if the database/store contains 3 projects, the test must assert that 3 project components are rendered.


* **Assertion Quality:** Avoid "shallow" tests. Do not just test that a component "exists"; test that it contains the correct data, labels, and accessibility roles.
* **Regressions:** Every bug fix must include a test case that reproduces the specific failure before the fix is applied.

## Testing Standards

* **Backend:** Behavior changes require API/integration tests in `backend/tests`. Ensure status codes and payload structures match the business logic.
* **Mobile UI:** - Use `data-testid` or accessibility labels for reliable element selection.
* Verify semantic correctness: if a task is marked "High Priority," the UI must reflect the "High Priority" style/token.
* **Frontend Actionability Check:** Every new user-facing feature must include verification that the flow is actually performable from the frontend, not just reachable in backend tests or service-layer tests.
* For any feature that adds a new creation, edit, assignment, completion, or navigation flow, tests must cover the UI entry point and the happy-path interaction that a user would take to complete it.
* Prefer browser-level acceptance coverage for multi-screen web flows. If Playwright is available, add or update a Playwright test for the critical path. If it is not yet available, add the strongest feasible frontend test now and note the Playwright gap explicitly.
* A feature is not done if the backend supports it but the frontend does not expose a usable path to perform it.


* **Pre-flight Check:** Before merge, run:
* `backend`: `npm run test:e2e`
* `mobile`: `npm run test` (Unit/Integration) + Lint



## Design System Policy

* **Token Consistency:** Reuse shared tokens from `mobile/styles/theme.ts`.
* **Component Primitives:** Use `mobile/components/ui/*` before creating ad-hoc styles.
* **Visual Logic:** Status colors and priority badges must be driven by the design system's semantic mapping (e.g., `theme.colors.danger` for overdue tasks).

## Commit & Quality Policy

* **Branch-First Workflow:** Never work directly on `main`. Start every feature, fix, or refactor on a dedicated branch.
* **Merge Discipline:** After verification passes, merge the feature branch back into `main`. This is mandatory because multiple AI agents may be working in the repository concurrently.
* **Branch Scope:** Use one focused branch per workstream so parallel agents do not step on each other.
* **Atomic Commits:** Commit each feature, refactor, or bug fix separately.
* **Descriptive Scoping:** Commit messages should describe *what* changed and *why* (e.g., `feat(mobile): ensure project count in dashboard matches store state`).
