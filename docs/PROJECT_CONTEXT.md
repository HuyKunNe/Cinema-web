# Cinema Web — AI Context

Version: 0.1  
Last updated: 2026-09-22

This file is the minimum authoritative context for an AI assistant continuing
the Cinema Web frontend without access to earlier conversations.

---

## 1. User and Goal

The user is a Java/Spring Boot engineer with prior Vue experience, including
Vue 2 to Vue 3 migration work. The goal is to build a practical Vue 3 +
TypeScript frontend for the existing `HuyKunNe/cinema-system` backend.

The frontend must be implemented as a production-oriented learning and
portfolio project, not as a disconnected visual mockup.

---

## 2. Source-of-Truth Order

Always resolve conflicts in this order:

```text
current backend code and tests
        ↓
current OpenAPI documents
        ↓
backend docs and accepted decisions
        ↓
cinema-web-project-docs.md
        ↓
old notes or remembered chat content
```

Never invent an endpoint, scope, enum value, payload field or state transition.
Inspect the current implementation/OpenAPI when exactness matters.

---

## 3. Backend Status

```text
Repository: HuyKunNe/cinema-system
Java:       21
Backend:    Spring Boot microservices
R1–R27:     completed
R28:        Notification Service deferred
```

There is post-R27 Inventory lifecycle-release lock hardening. Do not describe
that maintenance as complete until its focused unit, MySQL concurrency,
Inventory and root Maven verification gates pass.

The planning/review work that produced this context treated the backend
repository as read-only. Before editing the backend in a future session,
confirm that the user has changed that authorization.

---

## 4. Backend Topology

```text
Gateway:    http://localhost:8080
Movie:      http://localhost:8081
User/Auth:  http://localhost:8082
Inventory:  http://localhost:8083
Booking:    http://localhost:8084
Payment:    http://localhost:8085
Discovery:  http://localhost:8761
Config:     http://localhost:8888
MySQL:      localhost:3306
Kafka:      localhost:9092
```

Startup order:

```text
Config -> Discovery -> User/Auth -> Movie -> Inventory -> Booking -> Payment -> Gateway
```

The frontend calls Gateway, not individual services.

---

## 5. Service Ownership

```text
Movie Service
  owns movies and genres

Inventory Service
  owns cinemas, rooms, physical seats, showtimes, show_seats,
  Inventory processed_events and Inventory outbox_events

Booking Service
  owns bookings, booking seat snapshots, booking lifecycle and Booking events

Payment Service
  owns payments, provider operations, refunds, reconciliation and financial audit

User Service
  owns users, roles, permissions, OAuth2/OIDC, signing keys and sessions
```

The frontend must never create cross-service ownership assumptions.

---

## 6. Authentication Contract

```text
Issuer:   http://localhost:8082
JWK Set:  http://localhost:8082/oauth2/jwks
Audience: cinema-api
Flow:     Authorization Code with PKCE
```

Use `oidc-client-ts`.

The SPA is a public client:

- no client secret;
- no password grant;
- no token logging;
- no frontend-only authorization;
- backend permissions remain authoritative.

Known scopes:

```text
openid
profile
email
booking:create
booking:read
booking:cancel
movie:manage
showtime:manage
inventory:manage
payment:read
user:manage
```

The current Swagger client does not expose:

```text
inventory:write
payment:refund
payment:reconcile
payment:audit
```

The UI must not call internal seat hold/book/release endpoints. Booking Saga
events coordinate those operations.

---

## 7. Locked Frontend Stack

Use:

```text
Vue 3 + TypeScript + Vite
Vue Router
Pinia
TanStack Vue Query
Axios
Orval
oidc-client-ts
PrimeVue
Tailwind CSS
VeeValidate + Zod
VueUse
Lucide Vue Next
Vitest + Vue Test Utils
MSW
Playwright
ESLint + Prettier
```

State boundary:

```text
TanStack Query = server state
Pinia          = client/application state
```

Do not duplicate query data in Pinia.

Do not add Nuxt, Socket.IO, another component framework, another state library,
a PWA framework or micro-frontends without an implemented requirement.

---

## 8. Frontend Architecture

Use one SPA first, with customer/admin route groups.

```text
src/app
src/modules/auth
src/modules/movies
src/modules/showtimes
src/modules/seats
src/modules/bookings
src/modules/payments
src/modules/admin
src/shared/api
src/shared/components
src/shared/composables
src/shared/utils
```

Dependency direction:

```text
app -> modules -> shared
```

Use `<script setup lang="ts">` and the Composition API.

Generated OpenAPI code belongs under `src/shared/api/generated` and must never
be edited manually.

---

## 9. API Rules

- Generate clients from current OpenAPI using Orval.
- Runtime base URL is Gateway `http://localhost:8080`.
- Attach the OIDC access token through the shared HTTP boundary.
- Preserve a correlation ID for diagnostics.
- Normalize the implemented backend error envelope.
- Never blindly retry non-idempotent mutations.
- Keep one idempotency key for one user intent across safe retries.
- Spring/backend validation is authoritative.

Exact API paths must be verified against current OpenAPI before implementation.

---

## 10. Booking Saga UI

Booking creation may return HTTP `202`.

Expected successful progression:

```text
Booking:   PENDING -> RESERVED -> CONFIRMED
Payment:   processing -> SUCCEEDED
Inventory: AVAILABLE -> HELD -> BOOKED
```

The UI must:

- navigate to a status page after an accepted Booking request;
- poll Booking while non-terminal;
- poll Payment while non-terminal;
- display a countdown derived from server `holdExpiresAt`;
- stop polling for terminal states;
- refresh ShowSeats after rejection, cancellation or expiration;
- preserve the Booking ID across recoverable errors;
- never extend a hold locally;
- never assume displayed seat availability is a reservation.

Do not add WebSocket/Socket.IO until the backend defines a realtime contract.

---

## 11. Time Contract

Backend timestamps use ISO-8601 UTC strings:

```json
"2026-09-22T06:34:30.916751Z"
```

`Z` means UTC. Fractional seconds are valid.

Preserve transport values and convert only for display using browser
internationalization APIs. Do not strip offsets or rewrite authoritative
expiration timestamps.

---

## 12. Local Data State

Local data must be created through Swagger/API, not direct SQL.

Current state:

```text
Physical Seats created through Swagger/API — DONE
Showtime setup                            — NEXT
ShowSeat generation/verification         — NEXT
Open Showtime                            — PENDING
End-to-end Booking Saga                  — PENDING
```

Concepts:

```text
Seat     = physical Room layout
ShowSeat = per-Showtime sellable snapshot
```

Before implementing the UI for ShowSeat generation, confirm whether current
backend code generates ShowSeats automatically with Showtime creation or
requires an explicit Swagger endpoint.

---

## 13. Required Testing

Use:

```text
Vitest          for pure logic and composables
Vue Test Utils  for components
MSW             for API mocks
Playwright      for end-to-end flows
```

Critical tests:

- OIDC callback and logout;
- permission-aware routing;
- movie/showtime browsing;
- seat selection;
- stale-seat conflict recovery;
- accepted Booking plus polling;
- trusted hold countdown;
- Booking confirmation;
- cancellation and expiration;
- payment failure presentation;
- session expiration recovery.

---

## 14. Current Frontend Roadmap

```text
F1 Foundation
F2 Authentication
F3 Generated API foundation
F4 Catalog and Showtime browsing
F5 Seat selection and Booking
F6 Payment and confirmation
F7 Administration
F8 Hardening and deployment
```

Current frontend checkpoint:

> **F1 — Foundation has not started.**

The first implementation task is to scaffold `cinema-web`, install only the
locked baseline dependencies, establish the feature-oriented directory layout,
and make the initial verification commands pass.

---

## 15. First Commands for a New Session

Before changing code:

```text
1. Read this file.
2. Read cinema-web-project-docs.md.
3. Inspect backend OpenAPI and docs.
4. Inspect git status.
5. Identify the latest completed F checkpoint.
6. Run existing frontend verification commands.
7. Continue the smallest incomplete task.
```

For the initial bootstrap:

```bash
npm create vue@latest cinema-web
```

Select TypeScript, Router, Pinia, Vitest, Playwright, ESLint and Prettier.

---

## 16. Prohibited Shortcuts

Do not:

- call internal services from UI to bypass Gateway;
- call `inventory:write` operations directly;
- store a client secret in the SPA;
- implement password grant login;
- treat decoded JWT claims as backend authorization;
- store all remote data in Pinia;
- hand-write types already generated from OpenAPI;
- edit generated Orval files;
- blindly retry Booking, cancellation or payment mutations;
- create local expiration deadlines instead of using server timestamps;
- add Socket.IO without a backend contract;
- mark R28 active while it is deferred;
- declare work verified without running its checks.

---

## 17. Definition of Done for Every Change

A change is complete only when:

```text
TypeScript passes
lint passes
format check passes
relevant Vitest tests pass
applicable Playwright tests pass
loading/error/empty/unauthorized states exist
OpenAPI-generated code is current
no token or secret is committed
documentation is synchronized
this AI context still matches reality
```

At the end of a future work session, update:

```text
current frontend checkpoint
completed capabilities
new locked decisions
known blockers
verification commands and results
next smallest task
last updated date
```

