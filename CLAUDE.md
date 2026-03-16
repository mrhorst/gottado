# Claude Code Instructions

## Git Workflow
- **Frequent, descriptive commits are MANDATORY** — commit per functionality, not per plan
- Work on feature branches, merge to main when the feature is complete and stable
- Branch naming: `feat/<short-description>`, `fix/<short-description>`
- Never batch multiple unrelated features into a single commit

## Project Structure
- `backend/` — Express.js + Drizzle ORM + PostgreSQL
- `mobile/` — React Native (Expo) with Expo Router, TanStack React Query
- Zod validation middleware strips unknown fields (`req.body = result.data`) — always add new fields to validation schemas

## Key Patterns
- Backend: controllers export handler functions, routes wire them up with validation middleware
- Mobile: services (API calls) -> hooks (React Query) -> screens (UI)
- Optimistic UI updates in mutation hooks where appropriate
