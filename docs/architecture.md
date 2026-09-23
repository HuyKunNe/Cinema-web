# Cinema Web Architecture

**Version:** 1.0
**Last updated:** 2026-09-23

---

## 1. Overview

`cinema-web` là Vue 3 Single Page Application cho hệ thống Cinema Booking sử dụng Spring Boot microservices.

Ứng dụng bao gồm:

- Customer experience.
- Authentication flow.
- Seat selection.
- Booking and payment flow.
- Ticket management.
- Administration experience.

Frontend không sở hữu business state cuối cùng. Backend services vẫn là nguồn dữ liệu và nghiệp vụ có thẩm quyền.

---

## 2. System context

```text
Browser
   │
   │ HTTPS / REST
   ▼
API Gateway
   │
   ├── User/Auth Service
   ├── Movie Service
   ├── Inventory Service
   ├── Booking Service
   └── Payment Service
```

Frontend chỉ gọi API Gateway.

Frontend không gọi trực tiếp microservice để bypass Gateway hoặc permission model.

---

## 3. Backend topology

Local development topology:

| Service           | URL                     |
| ----------------- | ----------------------- |
| Gateway           | `http://localhost:8080` |
| Movie Service     | `http://localhost:8081` |
| User/Auth Service | `http://localhost:8082` |
| Inventory Service | `http://localhost:8083` |
| Booking Service   | `http://localhost:8084` |
| Payment Service   | `http://localhost:8085` |
| Discovery         | `http://localhost:8761` |
| Config Server     | `http://localhost:8888` |

Infrastructure:

| Component | Address          |
| --------- | ---------------- |
| MySQL     | `localhost:3306` |
| Kafka     | `localhost:9092` |

Frontend runtime API base URL:

```text
http://localhost:8080
```

---

## 4. Service ownership

### Movie Service

Sở hữu:

- Movies.
- Genres.
- Movie metadata.

### Inventory Service

Sở hữu:

- Cinemas.
- Rooms.
- Physical seats.
- Showtimes.
- ShowSeats.
- Seat availability lifecycle.

### Booking Service

Sở hữu:

- Bookings.
- Booking seat snapshots.
- Booking lifecycle.
- Booking events.

### Payment Service

Sở hữu:

- Payments.
- Provider operations.
- Refunds.
- Reconciliation.
- Financial audit.

### User/Auth Service

Sở hữu:

- Users.
- Roles.
- Permissions.
- OAuth2/OIDC.
- Signing keys.
- Sessions.

Frontend không tạo quan hệ sở hữu chéo giữa các service.

---

## 5. Frontend technology stack

```text
Vue 3
TypeScript
Vite
Vue Router
Pinia
TanStack Vue Query
Axios
Orval
oidc-client-ts
PrimeVue
Tailwind CSS
VeeValidate
Zod
VueUse
Lucide Vue Next
Vitest
Vue Test Utils
MSW
Playwright
ESLint
Prettier
```

---

## 6. High-level frontend architecture

```text
src/
├── app/
├── modules/
├── shared/
├── assets/
├── mocks/
└── test/
```

Dependency direction:

```text
app → modules → shared
```

### `app`

Chịu trách nhiệm:

- Application bootstrap.
- Root router.
- Route guards.
- Global layouts.
- Global providers.
- Global error boundaries.
- Global styles.

### `modules`

Chứa code theo domain:

- Auth.
- Movies.
- Showtimes.
- Seats.
- Bookings.
- Payments.
- Admin.

### `shared`

Chứa:

- Generated API clients.
- HTTP client.
- Shared components.
- Generic composables.
- Formatting utilities.
- Common types.
- Design-system primitives.

`shared` không được phụ thuộc `modules`.

---

## 7. Recommended directory structure

```text
src/
├── app/
│   ├── layouts/
│   ├── providers/
│   ├── router/
│   ├── App.vue
│   └── bootstrap.ts
│
├── modules/
│   ├── auth/
│   ├── movies/
│   ├── showtimes/
│   ├── seats/
│   ├── bookings/
│   ├── payments/
│   └── admin/
│
├── shared/
│   ├── api/
│   │   ├── generated/
│   │   ├── http-client.ts
│   │   ├── query-client.ts
│   │   ├── api-error.ts
│   │   └── correlation-id.ts
│   ├── components/
│   ├── composables/
│   ├── constants/
│   ├── types/
│   └── utils/
│
├── assets/
│   └── styles/
├── mocks/
├── test/
├── env.d.ts
└── main.ts
```

Standard module structure:

```text
modules/<feature>/
├── api/
├── components/
├── composables/
├── pages/
├── stores/
├── types/
├── utils/
└── routes.ts
```

Không bắt buộc tạo thư mục rỗng. Chỉ tạo khi feature thực sự cần.

---

## 8. Application layers

### Presentation layer

Bao gồm:

- Vue pages.
- Vue components.
- Layouts.
- Form presentation.
- Loading/error/empty states.

Presentation layer không gọi Axios trực tiếp.

### Application layer

Bao gồm:

- Composables.
- Query definitions.
- Mutation definitions.
- Flow orchestration.
- Route guards.

### Infrastructure layer

Bao gồm:

- Generated API client.
- Axios instance.
- OIDC client.
- Query client.
- Browser storage adapters.
- Analytics adapters.

### Domain mapping layer

Bao gồm:

- Status mapping.
- Terminal state detection.
- View models.
- UI-safe error mapping.
- Price/date formatting boundaries.

---

## 9. State management

### Server state

TanStack Query quản lý:

- Fetching.
- Caching.
- Refetching.
- Polling.
- Loading/error states.
- Cache invalidation.
- Mutation lifecycle.

Examples:

```text
movies
movie details
showtimes
show seats
booking status
payment status
admin dashboard data
```

### Client state

Pinia hoặc component state quản lý:

- Selected UI preferences.
- Sidebar state.
- Temporary seat selection trước mutation.
- Theme.
- Client-only filters không cần share URL.

### URL state

Vue Router quản lý:

- Search.
- Selected date.
- Cinema ID.
- Page.
- Sort.
- Return URL.

### Form state

VeeValidate quản lý:

- Values.
- Touched state.
- Client validation.
- Submit state.
- Field errors.

---

## 10. API architecture

```text
Page
  ↓
Feature composable
  ↓
TanStack Query definition
  ↓
Feature API wrapper
  ↓
Generated Orval client
  ↓
Shared Axios client
  ↓
API Gateway
```

Generated code:

```text
src/shared/api/generated/
```

Rules:

- Không sửa generated code.
- API paths và DTO đến từ OpenAPI.
- Custom headers đặt trong shared Axios client.
- Error normalization đặt tại shared boundary.
- Domain-specific error presentation đặt trong feature module.

---

## 11. HTTP client responsibilities

Shared HTTP client chịu trách nhiệm:

- Base URL.
- Authorization header.
- Correlation ID.
- Request timeout.
- Standard response/error normalization.
- Session expiration signaling.

Không chịu trách nhiệm:

- Tự động retry mutation không idempotent.
- Chuyển mọi `401` thành redirect loop.
- Biến backend error thành generic success.
- Ghi token vào log.

---

## 12. Authentication architecture

OIDC configuration:

```text
Issuer:   http://localhost:8082
JWK Set:  http://localhost:8082/oauth2/jwks
Audience: cinema-api
Flow:     Authorization Code with PKCE
```

Flow:

```text
Protected route
    ↓
Route guard checks session
    ↓
Redirect to authorization endpoint
    ↓
User authenticates
    ↓
OIDC callback
    ↓
Validate callback state
    ↓
Store managed OIDC session
    ↓
Return to requested route
```

Frontend route guard cải thiện UX nhưng không thay thế backend authorization.

---

## 13. Known scopes

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

Các scope sau không được giả định là public frontend capability:

```text
inventory:write
payment:refund
payment:reconcile
payment:audit
```

Admin navigation và actions phải dựa trên permission hiện tại.

---

## 14. Booking flow

Luồng customer:

```text
Browse movie
    ↓
Select showtime
    ↓
Load ShowSeats
    ↓
Select seats locally
    ↓
Submit booking intent
    ↓
Backend may return 202 Accepted
    ↓
Navigate to Booking Status
    ↓
Poll Booking and Payment
    ↓
CONFIRMED
    ↓
Display ticket QR
```

Seat selection trên client chưa phải reservation.

---

## 15. Booking Saga states

Successful progression:

```text
Booking:   PENDING → RESERVED → CONFIRMED
Payment:   PROCESSING → SUCCEEDED
Inventory: AVAILABLE → HELD → BOOKED
```

Potential failure outcomes:

- Seat conflict.
- Hold rejected.
- Hold expired.
- Payment failed.
- Payment timeout.
- Booking cancelled.
- Saga compensation.
- Unknown processing result.

Frontend không được gộp toàn bộ trạng thái thành một boolean `success`.

---

## 16. Polling architecture

Polling được dùng khi backend chưa có realtime contract.

Rules:

- Poll khi state non-terminal.
- Stop khi state terminal.
- Stop khi component unmount.
- Pause khi tab hidden nếu phù hợp.
- Resume bằng status query.
- Không tạo booking mới khi chỉ cần kiểm tra booking cũ.
- Giữ `bookingId` qua recoverable error.
- Sau timeout của UI, hiển thị trạng thái chưa xác định thay vì tự kết luận thất bại.

Không thêm WebSocket hoặc Socket.IO khi backend chưa có contract.

---

## 17. Hold countdown

Nguồn dữ liệu:

```text
holdExpiresAt
```

Calculation:

```text
remaining = holdExpiresAt - currentBrowserTime
```

Rules:

- Deadline đến từ server.
- Không tạo deadline bằng `Date.now() + duration`.
- Không reset khi reload.
- Không extend từ UI.
- Khi hết hạn:

  - Disable payment action.
  - Refresh booking.
  - Refresh ShowSeats.
  - Hiển thị action bắt đầu lại.

Countdown không được announce mỗi giây cho screen reader.

---

## 18. Error architecture

Shared error model cần phân biệt:

| HTTP status | UI behavior                          |
| ----------- | ------------------------------------ |
| `400`       | Validation hoặc bad request          |
| `401`       | Session/login recovery               |
| `403`       | Forbidden page/state                 |
| `404`       | Resource unavailable                 |
| `409`       | Conflict, thường cần refresh         |
| `422`       | Business validation nếu backend dùng |
| `429`       | Rate-limit feedback                  |
| `5xx`       | Recoverable server error             |

UI error không hiển thị:

- Stack trace.
- SQL information.
- Internal class name.
- Token.
- Sensitive payment data.

Correlation ID có thể hiển thị để hỗ trợ troubleshooting.

---

## 19. Routing architecture

Proposed customer routes:

```text
/
├── /movies
├── /movies/:movieId
├── /showtimes
├── /showtimes/:showtimeId/seats
├── /checkout/:bookingId
├── /bookings
└── /bookings/:bookingId
```

Proposed auth routes:

```text
/auth/login
/auth/callback
/auth/session-expired
/forbidden
```

Proposed admin routes:

```text
/admin
├── /admin/movies
├── /admin/cinemas
├── /admin/rooms
├── /admin/seat-layouts
├── /admin/showtimes
├── /admin/bookings
├── /admin/payments
├── /admin/users
├── /admin/promotions
└── /admin/settings
```

Exact paths có thể thay đổi trong implementation nhưng phải được giữ nhất quán.

---

## 20. Layout architecture

### Customer layout

Chứa:

- Desktop header.
- Mobile top bar.
- Main content.
- Mobile bottom navigation.
- Footer khi phù hợp.

### Admin layout

Chứa:

- Admin sidebar.
- Admin top bar.
- Main content.
- Notification area.

### Auth layout

Chứa:

- Authentication content.
- Brand section.
- Minimal navigation.

### Blank layout

Dùng cho:

- OIDC callback.
- Loading bridge.
- Error bridge.
- Minimal system pages.

---

## Styling architecture

Project sử dụng Tailwind CSS 4 với CSS-first configuration.

Global entry:

```text
src/assets/main.css
```

Design tokens:

```text
src/assets/styles/tokens.css
```

PrimeVue configuration:

```text
src/app/providers/primevue.ts
```

Semantic colors:

```text
primary
primary-hover
primary-subtle
secondary
secondary-hover
background
surface
surface-raised
surface-header
content
content-muted
outline
success
warning
danger
```

Tailwind utilities được sinh từ `@theme`:

```text
bg-primary
hover:bg-primary-hover
text-secondary
bg-background
bg-surface
bg-surface-raised
bg-surface-header
text-content
text-content-muted
border-outline
text-success
text-warning
text-danger
```

Rules:

- Component phải sử dụng semantic utilities.
- Không sử dụng raw hex color trong Vue template.
- Raw color values chỉ tồn tại trong `tokens.css`.
- Tailwind được sử dụng cho layout và utilities.
- PrimeVue được sử dụng cho accessible complex controls.
- Không thêm component framework khác.
- PrimeVue theme phải giữ cùng primary palette với design tokens.

---

## 22. Testing architecture

### Unit tests

Dùng cho:

- Formatter.
- Status mapping.
- Terminal-state detection.
- Countdown calculation.
- Idempotency-key lifecycle.
- Permission helpers.

### Component tests

Dùng cho:

- Seat button.
- Seat map interaction.
- Booking stepper.
- Payment method.
- Error and empty states.
- Navigation active states.

### MSW integration tests

Dùng cho:

- Movie list query.
- ShowSeats query.
- Booking accepted response.
- Booking polling.
- Payment failure.
- Seat conflict.

### Playwright tests

Critical flows:

```text
Login
Browse movie
Select showtime
Select seats
Create booking
Process payment
View confirmed ticket
Handle seat conflict
Handle payment failure
Handle session expiration
```

---

## 23. Security considerations

- Không commit secret.
- Không log access token.
- Không lưu client secret.
- Không dùng frontend permission làm security boundary.
- Không nhúng sensitive payment data vào analytics.
- Không đưa QR payload vào log.
- Không render backend HTML không tin cậy.
- Sanitize user-provided rich text nếu feature tương lai hỗ trợ.
- Dùng HTTPS ngoài local development.

---

## 24. Deployment configuration

Runtime-specific configuration phải đến từ environment:

```text
VITE_API_BASE_URL
VITE_OIDC_AUTHORITY
VITE_OIDC_CLIENT_ID
VITE_OIDC_REDIRECT_URI
VITE_OIDC_POST_LOGOUT_REDIRECT_URI
VITE_OIDC_AUDIENCE
```

Không commit giá trị secret.

Public OIDC client ID không phải secret nhưng vẫn nên được cấu hình qua environment.

---

## 25. Architecture decision summary

Locked decisions:

- Một Vue SPA cho customer và admin.
- Feature-oriented module architecture.
- TanStack Query cho server state.
- Pinia cho client state.
- Orval cho API generation.
- Gateway là API boundary.
- OIDC Authorization Code + PKCE.
- Polling cho Saga status cho đến khi có realtime contract.
- Server `holdExpiresAt` là deadline authoritative.
- UI không gọi Inventory internal operations.
- Generated API files không được sửa thủ công.
