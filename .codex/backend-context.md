# Backend Context

## Product shape

This project is a player-first training platform for Red Panda Academy. The app is built around a structured learning journey for sales reps and closers, but the backend is intentionally limited to the platform needs that support the player experience.

Key product assumptions:

- The super admin uses the Django admin dashboard only.
- There is no separate admin frontend planned for now.
- All application users are players unless they are Django superusers.
- All notifications are targeted to players/normal users.
- The backend is for the app API layer, not for a separate admin API product.

## Current frontend-driven requirements

The React frontend currently models a training app with the following flows:

- Home dashboard
- Learn section
- Drill section
- Quiz / rank-up flow
- Panda Bot / AI coaching entry
- Grade Call flow

The frontend stores progression in local storage and is organized around:

- rank unlocks
- drill progress
- flashcard mastery
- KPI and scenario stats
- protocol stages
- quiz scores and assignments

This means the backend must support the eventual player account, authentication, and data persistence layer that complements the frontend, while preserving the frontend’s progress model and likely mapping future APIs to those concepts.

## Role model

The backend should follow a strict role split:

- `admin`: Django superuser only
- `player`: every normal user account

This is already reflected in the custom user model and should remain the canonical model for future work.

## Application structure

Current backend apps:

- `apps.users` — user accounts, auth, onboarding, profiles, OAuth
- `apps.notifications` — player notifications and delivery
- `apps.api` — API routing and schema exposure

Planned future modules may include:

- learning content / lesson management
- quiz and assessment modules
- drill / exercise tracking
- user progress sync and analytics
- admin-only moderation or reporting as needed later

## Auth and identity

The backend currently supports:

- email/password signup/login
- registration OTP flows
- password reset OTP flows
- Google OAuth login
- Apple OAuth login
- JWT auth via DRF Simple JWT

This should remain the primary auth layer for players.

## Notification model

Notifications are player-only and should be used for:

- welcome messaging
- password changes and resets
- platform updates relevant to players
- training progress reminders
- future learning-related alerts

No super-admin notification sending should be introduced unless a later requirement explicitly demands it.

## API design direction

The API should be designed for the player app and future frontend integration, not admin-only tooling.

Primary API groups:

1. Authentication
   - register/initiate
   - register/verify
   - login
   - logout
   - password reset flows
   - password change

2. Player profile
   - profile retrieval
   - profile update
   - avatar upload
   - phone/birth-date updates

3. Notifications
   - list notifications
   - unread count
   - mark read
   - mark all read
   - clear read

4. Future learning APIs
   - progress sync
   - course/lesson data
   - quiz submissions
   - drill completion
   - rank and assignment data

## Integration expectation with frontend

The frontend currently uses local state and localStorage for progress. The backend should be designed to eventually support state sync without breaking the frontend’s current model.

Recommended backend approach:

- keep player-facing APIs thin and predictable
- avoid building custom admin workflows until needed
- map frontend concepts to backend models explicitly
- protect player-only routes and notifications
- treat the current frontend as the product reference for UX and user flow

## Implementation guardrails

- Do not add separate admin APIs unless explicitly requested.
- Keep user and notification logic player-focused.
- Use Red Panda Academy naming consistently in email and notification text.
- Preserve Django admin for superuser-only infrastructure.
- Keep API docs and schema generation available via DRF Spectacular.
- Favor a simple, modular, player-based architecture over a complex multi-role platform until requirements expand.
