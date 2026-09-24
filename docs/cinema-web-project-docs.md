# Cinema Web — Project Documentation

Version: 0.1  
Last updated: 2026-09-22  
Target frontend: Vue 3 + TypeScript  
Backend repository: `HuyKunNe/cinema-system`

---

## 1. Purpose

Cinema Web is the browser application for the existing Cinema Booking System.
It provides customer and administrative workflows over the backend's REST,
OAuth2/OIDC and asynchronous Booking–Inventory–Payment Saga contracts.

The first delivery should be one Vue SPA with route groups and layouts for:

- Public browsing;
- authenticated customer booking;
- authenticated customer booking/payment status;
- administrative catalog and inventory management.

Do not split customer and administration into separate deployables until the
single application demonstrates a real deployment, security or release-cycle
problem that requires the split.

---

## 2. Current Project State

Backend status:

| Scope                                 | Status                                      |
| ------------------------------------- | ------------------------------------------- |
| R1–R27                                | Completed                                   |
| Payment Service                       | Completed in R27                            |
| Inventory lifecycle-release hardening | In progress until final verification passes |
| R28 Notification Service              | Deferred                                    |
| Vue frontend                          | Not bootstrapped yet                        |

Known local data progress:

- Physical `Seat` rows have been created through Swagger/API.
- Local data must continue to be created through supported APIs rather than
  direct SQL inserts.
- The next local acceptance step is to create a Showtime, generate or verify
  its ShowSeats through the current Swagger contract, open the Showtime, and
  execute the Booking Saga.

`Seat` and `ShowSeat` are different concepts:

```text
Seat     = physical seat in a Room
ShowSeat = sellable seat snapshot for one Showtime
```

Creating physical Seats does not by itself make those seats bookable for a
Showtime.

---

## 3. Backend Topology

Local services:

| Component         | Port | Responsibility                                 |
| ----------------- | ---: | ---------------------------------------------- |
| Config Server     | 8888 | Central configuration                          |
| Discovery/Eureka  | 8761 | Service discovery                              |
| API Gateway       | 8080 | Frontend entry point                           |
| Movie Service     | 8081 | Movies and genres                              |
| User/Auth Service | 8082 | Users, OAuth2 and OIDC                         |
| Inventory Service | 8083 | Cinemas, rooms, seats, showtimes and ShowSeats |
| Booking Service   | 8084 | Booking aggregate and lifecycle                |
| Payment Service   | 8085 | Payment processing and reconciliation          |
| MySQL             | 3306 | Service-owned databases                        |
| Kafka             | 9092 | Integration events                             |

Recommended startup order:

```text
Config
  -> Discovery
  -> User/Auth and JWK endpoint
  -> Movie
  -> Inventory
  -> Booking
  -> Payment
  -> Gateway
  -> Cinema Web
```

The browser application calls the API Gateway:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Do not call business services directly from application code merely because
their local ports are reachable.

---

## 4. Locked Frontend Technology Stack

### Core

```text
Vue 3
TypeScript
Vite
Vue Router
Pinia
```

### Data and APIs

```text
Axios
TanStack Vue Query
Orval
```

### Authentication

```text
oidc-client-ts
Authorization Code with PKCE
```

### UI and Forms

```text
PrimeVue
Tailwind CSS
Lucide Vue Next
VeeValidate
Zod
VueUse
Vue I18n when a second language is implemented
```

### Verification

```text
Vitest
Vue Test Utils
MSW
Playwright
ESLint
eslint-plugin-vue
Prettier
```

Do not install another router, global state library, component framework or
form library alongside this baseline without documenting the missing capability.

Deferred until a real requirement exists:

```text
Nuxt
Socket.IO
PWA support
Micro-frontends
Storybook
Charting libraries
Animation frameworks
```

---

## 5. Project Bootstrap

Create the application:

```bash
npm create vue@latest cinema-web
```

Select:

```text
TypeScript: Yes
JSX: No
Vue Router: Yes
Pinia: Yes
Vitest: Yes
E2E Testing: Playwright
ESLint: Yes
Prettier: Yes
```

Runtime dependencies:

```bash
npm install \
  axios \
  @tanstack/vue-query \
  oidc-client-ts \
  primevue \
  primeicons \
  tailwindcss \
  vee-validate \
  zod \
  @vee-validate/zod \
  @vueuse/core \
  lucide-vue-next \
  vue-i18n
```

Development dependencies:

```bash
npm install -D \
  orval \
  msw \
  @vue/test-utils
```

Pin library versions in the lock file. Do not copy version numbers from old
chat messages; confirm compatibility at installation time.

---

## 6. Source Architecture

Use feature-oriented modules:

```text
cinema-web/
├── src/
│   ├── app/
│   │   ├── layouts/
│   │   ├── providers/
│   │   └── router/
│   ├── modules/
│   │   ├── auth/
│   │   ├── movies/
│   │   ├── showtimes/
│   │   ├── seats/
│   │   ├── bookings/
│   │   ├── payments/
│   │   └── admin/
│   ├── shared/
│   │   ├── api/
│   │   │   ├── generated/
│   │   │   ├── api-error.ts
│   │   │   └── http-client.ts
│   │   ├── components/
│   │   ├── composables/
│   │   ├── constants/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── utils/
│   ├── App.vue
│   └── main.ts
├── e2e/
├── orval.config.ts
├── vite.config.ts
└── package.json
```

Feature module example:

```text
modules/bookings/
├── api/
├── components/
├── composables/
├── pages/
├── schemas/
├── stores/
└── types/
```

Dependency direction:

```text
app -> modules -> shared
```

`shared` must not import from a business feature. One feature should not reach
into another feature's internal files; expose a small public entry point when
cross-feature reuse is justified.

---

## 7. State Ownership

TanStack Vue Query owns server state:

```text
movies
genres
cinemas
rooms
showtimes
showSeats
bookings
payments
profiles
```

Pinia owns client/application state:

```text
authenticated-user presentation state
selected-seat draft
checkout draft
navigation state
UI preferences
```

Do not copy query results into Pinia as a second cache.

Query-key examples:

```ts
export const movieKeys = {
  all: ['movies'] as const,
  list: (filters: MovieFilters) => ['movies', 'list', filters] as const,
  detail: (movieId: string) => ['movies', 'detail', movieId] as const,
}

export const bookingKeys = {
  detail: (bookingId: string) => ['bookings', bookingId] as const,
}
```

After a successful mutation, invalidate only the affected query families.

---

## 8. OpenAPI and HTTP Integration

OpenAPI is the source of truth for frontend request and response types.

Use Orval to generate clients into:

```text
src/shared/api/generated/
├── movie/
├── inventory/
├── booking/
├── payment/
└── user/
```

Rules:

- Never hand-edit generated files.
- Regenerate after a backend contract change.
- Wrap only cross-cutting concerns such as base URL, authorization,
  correlation IDs and normalized error handling.
- Use the Gateway as the runtime base URL even if OpenAPI specifications are
  collected from individual services.
- Do not invent an endpoint that is absent from the current OpenAPI document.
- Treat Spring validation and domain validation as authoritative.

HTTP client responsibilities:

```text
attach the current access token
attach or preserve a correlation ID
normalize the common API error envelope
reject unauthorized requests consistently
never retry a non-idempotent mutation blindly
```

For a client-initiated idempotent operation, create one idempotency key for the
user intent and preserve it across safe retries:

```ts
const idempotencyKey = crypto.randomUUID()
```

Do not generate a new key for every retry of the same user action.

---

## 9. Authentication and Authorization

Backend identity contract:

```text
Issuer:   http://localhost:8082
JWK Set:  http://localhost:8082/oauth2/jwks
Audience: cinema-api
Flow:     Authorization Code with PKCE
```

The SPA is a public OAuth client:

- It must not contain a client secret.
- It must not implement the password grant.
- It must not decode a JWT and treat that result as authorization proof.
- Backend services remain responsible for authorization.
- Route metadata may hide inaccessible UI, but it does not secure an API.

Known scopes include:

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

The current Swagger client does not include these internal/financial scopes:

```text
inventory:write
payment:refund
payment:reconcile
payment:audit
```

Do not call internal seat hold/book/release APIs from the browser. The Saga
performs those transitions.

Recommended OIDC configuration:

```ts
import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

export const userManager = new UserManager({
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: `${window.location.origin}/auth/callback`,
  post_logout_redirect_uri: window.location.origin,
  response_type: 'code',
  scope: import.meta.env.VITE_OIDC_SCOPE,
  userStore: new WebStorageStateStore({
    store: window.sessionStorage,
  }),
})
```

Required routes:

```text
/auth/callback
/auth/silent-callback, only if silent renewal is enabled
/forbidden
```

Never log access tokens, refresh tokens, authorization codes or ID tokens.

---

## 10. Booking–Inventory–Payment UI Contract

The backend workflow is asynchronous. Booking creation may return HTTP `202`
before the Saga reaches its final state.

Expected progression:

```text
Booking:   PENDING -> RESERVED -> CONFIRMED
Payment:   processing states -> SUCCEEDED
Inventory: AVAILABLE -> HELD -> BOOKED
```

Possible terminal alternatives include rejection, cancellation, expiration and
payment failure. The exact enum values must come from OpenAPI/current backend
code rather than this summary.

UI behavior:

| Backend state               | UI action                                           |
| --------------------------- | --------------------------------------------------- |
| Booking accepted with `202` | Navigate to status page                             |
| `PENDING`                   | Poll Booking                                        |
| `RESERVED`                  | Show trusted hold countdown and payment step        |
| Payment processing          | Poll Payment                                        |
| `CONFIRMED`                 | Stop polling and display confirmation               |
| Rejected                    | Refresh ShowSeats and explain the stable error code |
| Cancelled/expired           | Stop polling, clear the draft and refresh ShowSeats |
| Server/API error            | Preserve the booking ID and allow safe recovery     |

Polling example:

```ts
const bookingQuery = useQuery({
  queryKey: computed(() => bookingKeys.detail(bookingId.value)),
  queryFn: () => bookingApi.getBooking(bookingId.value),
  refetchInterval: (query) => {
    const status = query.state.data?.status

    return status === 'PENDING' || status === 'RESERVED' ? 2_000 : false
  },
})
```

Refine the status list after generating the actual client.

Countdown rules:

- Use the server-provided `holdExpiresAt`.
- Never extend a hold locally.
- Recompute remaining time against the current clock.
- Refetch when the tab becomes visible again.
- Treat server state as authoritative when the local countdown reaches zero.

Do not introduce WebSocket or Socket.IO until the backend exposes an approved
realtime contract.

---

## 11. Time and Money

Backend timestamps are ISO-8601 UTC strings:

```json
{
  "createdAt": "2026-09-22T06:34:30.916751Z"
}
```

`Z` means UTC. The fractional portion is valid microsecond precision.

Frontend rules:

- Preserve the raw timestamp in API models.
- Convert only for presentation.
- Use `Intl.DateTimeFormat` before adding another date library.
- Never remove timezone information from a value sent back to the backend.
- Use `Intl.NumberFormat` for VND presentation.
- Do not perform authoritative payment arithmetic using floating-point UI
  values; render backend monetary values according to the API contract.

---

## 12. UI Strategy

Use PrimeVue for behavior-heavy components:

```text
DataTable
Dialog
Drawer
Select
DatePicker
Paginator
Toast
ConfirmDialog
```

Use Tailwind CSS for application composition:

```text
page layouts
movie cards
responsive grids
seat map
checkout layout
status pages
```

Initial recommendation: use PrimeVue styled mode for speed. Do not adopt Volt
or a custom unstyled design system until visual requirements justify the added
maintenance.

Seat map requirements:

- Accessible keyboard selection;
- a visible legend for seat states;
- disabled interaction for unavailable seats;
- stable seat identity independent of visual position;
- selection count and price summary;
- refresh behavior when the server rejects stale availability;
- no assumption that displayed availability reserves a seat.

---

## 13. Initial Screens

### Public/customer

```text
Movie list
Movie detail
Showtime selection
ShowSeat selection
Booking review
Booking status
Payment status
Booking confirmation
My bookings
Profile
```

### Administration

```text
Movie and Genre management
Cinema management
Room management
Physical Seat range management
Showtime management
ShowSeat inspection
Payment read-only inspection where authorized
User management where authorized
```

Do not expose a UI control when the corresponding endpoint or scope is not
available to the SPA client.

---

## 14. Local Data Acceptance Flow

Use Swagger/API for local data:

```text
Genre
  -> Movie
  -> Cinema
  -> Room
  -> Physical Seat range
  -> Showtime
  -> Generate or verify ShowSeats
  -> Open Showtime
  -> Create Booking
  -> Observe Inventory reservation
  -> Observe Payment
  -> Observe final Booking and ShowSeat states
```

Current checkpoint:

```text
Physical Seats created through Swagger/API — DONE
Showtime and ShowSeat setup                — NEXT
End-to-end Booking Saga                    — PENDING
```

Confirm the current OpenAPI contract before deciding whether ShowSeats are
generated automatically with Showtime creation or by a dedicated generation
endpoint.

---

## 15. Testing Strategy

### Unit tests

Use Vitest for:

- query-key factories;
- status predicates;
- countdown calculations;
- API error normalization;
- permission-to-navigation mapping;
- money and time presentation helpers.

### Component tests

Use Vue Test Utils with MSW for:

- seat selection;
- stale-seat rejection;
- route guards;
- form validation;
- Booking status changes;
- Payment status changes;
- forbidden actions.

### End-to-end tests

Use Playwright for:

```text
OIDC login callback
public movie browsing
showtime and seat selection
successful Booking Saga
seat conflict recovery
booking cancellation
booking expiration
payment failure presentation
route access by permission
session expiration recovery
```

Do not mock the backend in the end-to-end acceptance suite that is intended to
prove frontend/backend integration.

---

## 16. Error Handling

Normalize server errors into one frontend shape:

```ts
export interface ApiProblem {
  status: number
  code?: string
  message: string
  fieldErrors?: Record<string, string[]>
  correlationId?: string
}
```

The generated backend type remains authoritative. Adapt this interface after
examining the actual common API response.

Rules:

- Display stable business error codes with user-friendly copy.
- Preserve correlation IDs for support/debugging.
- Do not display exception classes or stack traces.
- Handle `401` by starting a controlled authentication recovery.
- Handle `403` as authenticated but unauthorized.
- Handle `409` as a domain conflict, especially for stale seats.
- Do not blindly retry create/cancel/payment mutations.

---

## 17. Environment Contract

Suggested `.env.example`:

```env
VITE_OIDC_AUTHORITY=http://localhost:8082
VITE_OIDC_CLIENT_ID=
VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173/
VITE_OIDC_SCOPE=openid profile email
```

The client ID is intentionally blank until a dedicated public PKCE client is
registered in User Service. The redirect URIs and every requested application
permission must match that registration. Do not reuse `cinema-swagger`, a
confidential client or embed a client secret. Additional API configuration and
application permissions belong to their respective implementation phases.

---

## 18. Coding Conventions

- Use `<script setup lang="ts">`.
- Prefer Composition API.
- Use explicit feature boundaries.
- Keep components focused on rendering and interaction.
- Put remote-data orchestration in query composables.
- Put pure calculations in testable utility functions.
- Do not use `any` to bypass generated contract errors.
- Do not duplicate backend enums manually when generated types exist.
- Never mutate generated OpenAPI files.
- Use accessible labels and semantic elements.
- Use UTC at the transport boundary.
- Avoid business decisions based only on route state or local storage.

---

## 19. Delivery Roadmap

### F1 — Foundation

- Bootstrap Vue/Vite/TypeScript.
- Configure Router, Pinia and Vue Query.
- Configure PrimeVue, Tailwind, linting and tests.
- Add environment validation and application layouts.

### F2 — Authentication

- Register the SPA client in User Service.
- Implement OIDC login, callback and logout.
- Implement route guards and permission-aware navigation.
- Verify token expiration and session recovery.

### F3 — Generated API Foundation

- Obtain current OpenAPI documents.
- Configure Orval.
- Generate service clients and MSW handlers.
- Implement the shared HTTP/auth/error boundary.

### F4 — Catalog and Showtime Browsing

- Movie list and detail.
- Showtime discovery.
- Loading, empty and error states.

### F5 — Seat Selection and Booking

- ShowSeat map.
- Booking creation with a stable idempotency key.
- `202` handling and Booking polling.
- Conflict recovery and trusted expiration countdown.

### F6 — Payment and Confirmation

- Payment status UI.
- Booking confirmation.
- Cancellation and expiration flows.
- Saga terminal-state recovery.

### F7 — Administration

- Movie/Genre management.
- Cinema/Room/Seat Range management.
- Showtime management.
- Permission-bound actions and tables.

### F8 — Hardening

- Component and E2E coverage.
- Accessibility review.
- Bundle inspection.
- Error monitoring decision.
- Deployment documentation.

R28 Notification Service remains outside this frontend bootstrap roadmap while
the backend round is deferred.

---

## 20. Definition of Done

A frontend checkpoint is complete only when:

- TypeScript compilation passes;
- lint and format checks pass;
- relevant Vitest tests pass;
- generated API clients match current OpenAPI;
- loading, empty, error and unauthorized states are implemented;
- no client secret or token is committed;
- accessibility is verified for the changed interaction;
- documentation and AI context are synchronized;
- applicable Playwright acceptance tests pass.

---

## 21. Sources of Truth

Use this priority order:

1. Current backend implementation and tests;
2. Current OpenAPI documents;
3. Backend `docs/` and accepted architecture decisions;
4. This frontend documentation;
5. Old chat messages or historical notes.

When sources disagree, do not silently choose one. Record the mismatch and
update this document after verifying the implemented contract.

Official frontend references:

- Vue: <https://vuejs.org/>
- Vue Router: <https://router.vuejs.org/>
- Pinia: <https://pinia.vuejs.org/>
- TanStack Query: <https://tanstack.com/query/latest/docs/framework/vue/overview>
- Orval: <https://orval.dev/>
- oidc-client-ts: <https://authts.github.io/oidc-client-ts/>
- PrimeVue: <https://primevue.org/>
- VeeValidate: <https://vee-validate.logaretm.com/>
- VueUse: <https://vueuse.org/>
- Vitest: <https://vitest.dev/>
- Playwright: <https://playwright.dev/>

---

## 22. Restart Checklist

When returning to this project after losing chat history:

1. Read `cinema-web-ai-context.md`.
2. Read this document.
3. Inspect current backend docs and OpenAPI.
4. Check `git status` in every working repository.
5. Confirm the last completed frontend roadmap checkpoint.
6. Run existing verification commands before editing.
7. Continue the smallest incomplete checkpoint.
8. Update both documents before ending the work session.
