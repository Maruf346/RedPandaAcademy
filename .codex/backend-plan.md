# Backend Implementation Plan

## Goal

Build the backend as the API foundation for the Red Panda Academy player experience, aligned to the React frontend and the current platform assumptions:

- players are the main users
- super admin stays in Django admin only
- no separate admin API product yet
- notifications are player-focused

## Phase 1: Harden the foundation

### Tasks

1. Finalize environment and Django settings
2. Confirm app wiring and custom user model
3. Validate admin-player role split
4. Confirm database and Redis configuration
5. Ensure startup, migrations, and checks pass

### Deliverables

- stable Django project config
- clean `.env` and `.env.example`
- validated migrations and system checks

## Phase 2: Authentication and player onboarding

### Tasks

1. Clean up and validate registration flow
2. Confirm OTP generation + expiry rules
3. Verify email sending and console backend behavior
4. Validate login/logout and JWT behavior
5. Ensure Google and Apple OAuth flows are player-only and safe

### Deliverables

- registered players can sign up and verify identity
- secure token issuance and refresh flow
- player profile creation and activation

## Phase 3: Player profile and account management

### Tasks

1. Create and verify profile retrieval/update endpoints
2. Support avatar upload handling
3. Add phone and personal info fields where needed
4. Validate password change and reset flows
5. Define profile permissions for authenticated players only

### Deliverables

- authenticated profile API
- password management API
- clean profile schema aligned to future frontend usage

## Phase 4: Notifications and player engagement

### Tasks

1. Validate notification model and WebSocket delivery
2. Maintain player-only notification sending
3. Add templates for welcome, password reset, and progress updates
4. Add unread, read, and bulk actions endpoints
5. Ensure notification payloads are frontend-friendly

### Deliverables

- stable notification API
- real-time WebSocket support for players
- notification templates for platform events

## Phase 5: Learning and progression data model

### Tasks

1. Define domain models for learning progression
2. Model quiz attempts, drill completion, and assignments
3. Add links between user progress and training content
4. Decide whether rank progression is backend-driven or frontend-driven
5. Define API contracts for the frontend sync model

### Deliverables

- learning data models for players
- structured completion and progression tracking
- API contract that supports frontend dashboard and rank logic

## Phase 6: Frontend integration

### Tasks

1. Connect frontend auth flow to backend endpoints
2. Integrate profile endpoints
3. Integrate notification endpoints
4. Add API error handling and loader states in React
5. Validate player app flows end-to-end

### Deliverables

- working frontend-backend integration
- production-safe player auth and profile flow
- functioning notification UX for players

## Phase 7: Optional expansion

Only after the core platform is stable:

- lessons and content management
- quiz analytics
- advanced learning recommendations
- AI coaching and grading features
- deeper user progress reporting

## Architecture principles

- Keep the app player-focused
- Keep admin as Django admin only
- Prefer simple, explicit module boundaries
- Model data around real user learning behavior
- Make API contracts clear before feature expansion
- Always integrate with the frontend’s current UX and data expectations

## Recommended next implementation order

1. complete auth and player onboarding
2. complete profile + password management
3. complete notifications
4. define learning progression models
5. add frontend API integration
6. expand into advanced content and coaching features

This plan keeps the backend intentionally grounded in the real project scope while preserving a clear path to eventual feature growth.
