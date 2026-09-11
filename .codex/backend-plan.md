# Backend Implementation Plan

## Current status

The project has moved beyond the initial reset. The backend is now functionally aligned with the player-first product model and includes the major required areas:

- user auth and onboarding
- JWT authentication
- player profile logic
- notifications and WebSocket delivery
- progression tracking
- protocol set tracking
- grades and quiz attempts
- API routing and schema layer

The remaining work is now mostly about validation, contract alignment, and frontend integration rather than reworking the architecture.

## Goal

Keep building the backend as the API foundation for the Red Panda Academy player experience, while preserving the strict architecture:

- players are the main users
- super admin stays in Django admin only
- no separate admin API product yet
- notifications are player-focused

## Phase 1: Foundation and stability (completed)

### Completed tasks

1. final environment and Django settings cleanup
2. app wiring and custom user model confirmed
3. admin-player role split validated
4. database and Redis config stabilized
5. startup checks pass

### Result

- Django system check passes
- the backend loads without startup issues with the current environment configuration

## Phase 2: Authentication and onboarding (mostly complete)

### Completed tasks

1. registration flow and OTP handling
2. password reset flows
3. login/logout
4. JWT issuance and refresh behavior
5. Google and Apple OAuth entrypoints

### Remaining work

- verify actual frontend payload contracts for auth calls
- confirm token handling and error payloads match the React app expectations
- test sign-up/login flows end-to-end with seeded users

## Phase 3: Player profile and account management (in progress)

### Tasks

1. verify profile retrieval/update endpoints
2. validate avatar upload handling
3. confirm phone and personal detail support
4. validate password change and reset flows
5. ensure player-only access rights are enforced consistently

### Remaining work

- align profile payload structure with the frontend UI state
- confirm whether the frontend needs a dedicated profile fetch/update flow or just a minimal self-service account view

## Phase 4: Notifications and engagement (mostly complete)

### Completed tasks

1. notification model and WebSocket delivery
2. player-only notification sending
3. welcome and password-related templates
4. unread/read and bulk notification actions

### Remaining work

- ensure notification payloads match the frontend expectations exactly
- add any product-specific learning notifications needed by the app flow
- validate notify-on-event behavior for real app interactions

## Phase 5: Progression and user learning state (implemented, needs integration validation)

### Completed tasks

1. rank and best score tracking
2. assignment management
3. card mastery tracking
4. drill progression tracking
5. KPI and scenario stats

### Remaining work

- validate payloads against the frontend’s local progress structure
- decide which values are persisted on backend vs frontend-only
- finalize the contract between frontend local progress and API-backed sync

## Phase 6: Protocol and grade tracking (implemented, needs contract checks)

### Completed tasks

1. training protocol state API
2. recall logging
3. anchor rep tracking
4. weekly sessions
5. phase progression
6. quiz attempts and call grade APIs

### Remaining work

- confirm all protocol responses match frontend assumptions
- check whether protocol values are meant to be a backend source of truth or a syncable snapshot
- ensure grade and quiz fields match the expected business flow

## Phase 7: Frontend integration and end-to-end testing

### Tasks

1. connect auth to frontend login/signup UX
2. integrate profile retrieval and update
3. connect notification feed to UI
4. sync progression payloads with frontend progress state
5. validate protocol and grade flows end-to-end
6. confirm backend routes work with current frontend URLs

### Deliverables

- working frontend-backend integration for players
- stable auth flow and player API contract
- working notification UX for the player app

## Phase 8: Optional expansion

Only after the core product flow is stable:

- course and lesson management
- deeper recommendation logic
- AI coach integration
- richer reporting and analytics
- admin-only support tooling if requirements emerge later

## Architecture principles

- keep the app player-focused
- keep admin as Django admin only
- keep the backend aligned to actual frontend behavior
- favor explicit API contracts over hidden assumptions
- do not expand to admin APIs without a clear requirement
- keep the project grounded in Red Panda Academy product needs

## Recommended next implementation order

1. verify auth contract against frontend
2. validate profile + notifications with the UI
3. verify progression payload schema with frontend state
4. confirm protocol and grades payloads match app flows
5. finalize backend API integration and polish
6. expand only after the player flow is stable

This plan reflects the current project reality: the architecture is mostly fixed, and the remaining work is integration alignment and product-level validation.
