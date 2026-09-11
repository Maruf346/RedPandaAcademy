# Backend Context

## Current state

The backend is now in a more complete player-first state than the initial reset. The current codebase includes:

- custom player/admin user model
- email/password auth and OTP flows
- JWT auth and protected API endpoints
- Google and Apple OAuth entry points
- notification APIs and WebSocket support for players
- progression tracking for ranks, cards, drills, KPI stats, and scenario stats
- protocol endpoints for recall tracking, anchor reps, weekly sessions, and phase progression
- grade APIs for quiz attempts and call grading

This is no longer just a basic auth scaffold; it now reflects the real product structure needed to support the Red Panda Academy player experience.

## Product shape

This project is a player-first training platform for Red Panda Academy. The product is centered on a learning and coaching loop for reps and closers, but the backend is intentionally limited to the platform needs required for the player app.

Key assumptions:

- super admin uses Django admin only
- no separate admin frontend is planned for now
- normal app users are players unless they are Django superusers
- notifications are targeted to players, not admins
- the backend is for the app API layer, not for a separate admin product

## Frontend-driven requirements

The frontend app is organized around these flows:

- Home dashboard
- Learn section
- Drill section
- Quiz and rank-up flow
- Panda Bot / AI coaching entry
- Grade Call flow

Current frontend state is stored in localStorage, but the backend now exposes matching API concepts for eventual sync and persistence:

- rank and best score state
- assignments
- flashcard mastery
- drill completion
- KPI and scenario stats
- protocol state
- quiz attempts and call grades

The backend should continue to support these concepts without forcing the frontend away from its local-first flow.

## Role model

The backend follows a strict role split:

- admin: Django superuser only
- player: all normal users

This remains the canonical model and is reflected in the custom user model.

## Application structure

Current backend apps:

- `apps.users` — users, auth, signup, reset flows, profiles, OAuth
- `apps.notifications` — player notifications and WebSocket delivery
- `apps.progression` — player progress snapshot, assignments, cards, drills, KPI/scenario state
- `apps.protocol` — protocol tracking, recall logging, weekly sessions, phase progression
- `apps.grades` — quiz attempts and call-grade tracking
- `apps.api` — API routing, schema, and documentation

This is now a realistic backend structure aligned to the product, rather than stale copied code from a different project.

## Auth and identity

The backend currently supports:

- email/password signup and login
- registration OTP flow
- password reset OTP flow
- JWT auth via DRF Simple JWT
- Google login flow
- Apple login flow

These remain the core player-facing auth flows.

## Notification model

Notifications are player-only and should stay focused on:

- welcome messaging
- password changes and password resets
- training progress reminders
- platform updates relevant to players
- future educational or engagement-style events

No admin notification flow should be introduced unless explicitly requested later.

## API direction

The API is designed for the player app and frontend integration rather than for admin-specific tooling.

Primary API groups in the current project:

1. Authentication
   - register/initiate
   - register/verify
   - login
   - logout
   - password reset and change flows

2. Progression
   - progress snapshot
   - rank and best score state
   - assignments
   - cards and drills
   - KPI and scenario stats

3. Protocol
   - current protocol state
   - recall logging
   - anchor rep tracking
   - weekly session logging
   - phase progression

4. Grades
   - quiz attempts
   - call-grades
   - KPI scoring

5. Notifications
   - list notifications
   - unread count
   - mark read and bulk actions

## Integration expectation with frontend

The frontend remains local-first today, but the backend is now structured to match the real product flow and can support eventual sync.

Recommended approach:

- keep player-facing APIs predictable and thin
- keep admin-only tooling out of scope unless requested
- map frontend progress concepts to backend models deliberately
- keep notifications and auth aimed at players
- treat the frontend as the product reference for user flow

## Current implementation guardrails

- no separate admin API product unless explicitly requested
- keep notifications player-focused
- maintain Red Panda Academy branding across email and notification content
- preserve Django admin for superuser-only infrastructure
- keep the schema/docs endpoint available via DRF Spectacular
- favor a simple, modular, player-backed architecture over a heavier multi-role design

## What is still left to finish

The work left is now mostly integration and product polish, not core architecture repair:

- validate frontend-to-backend auth contract
- verify profile and notification endpoints against the UI flow
- confirm assignment/progression payloads match the frontend progress model
- finalize protocol and grade payload contracts for the app
- add any missing player-only API polish or validation
- keep the architecture strictly player-focused until admin features are explicitly requested
