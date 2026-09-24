# Cinema Web — Current Status

**Last updated:** 2026-09-24  
**Current phase:** F1.1 — Application Shell  
**Status:** Completed

---

## 1. Current objective

Application shell Vue 3 đã hoàn thành. Mục tiêu tiếp theo là tích hợp OIDC Authorization Code với PKCE trước khi kết nối backend API.

Luồng customer mục tiêu:

```text
Trang chủ
→ Chi tiết phim
→ Chọn suất chiếu
→ Chọn ghế
→ Tạo booking
→ Thanh toán
→ Theo dõi trạng thái
→ Nhận vé
```

---

## 2. Completed

### F1 — Frontend foundation

- Vue 3 stable `3.5.43`.
- TypeScript và Vite.
- Vue Router.
- Pinia.
- TanStack Vue Query.
- Axios và Orval.
- oidc-client-ts.
- PrimeVue.
- Tailwind CSS 4.
- VeeValidate và Zod.
- VueUse.
- `@lucide/vue`.
- Vitest và Vue Test Utils.
- ESLint, Oxlint và Prettier.

Node engine:

```text
^22.18.0 || >=24.12.0
```

### F1.1A — Bootstrap and providers

Application initialization đã được tách thành:

```text
src/app/bootstrap.ts
src/app/providers/pinia.ts
src/app/providers/primevue.ts
src/app/providers/vue-query.ts
```

TanStack Query defaults:

```text
queries.staleTime             = 30 seconds
queries.retry                 = 1
queries.refetchOnWindowFocus  = true
mutations.retry               = false
```

### F1.1B — Router and layouts

Đã triển khai:

```text
CustomerLayout
AdminLayout
AuthLayout
BlankLayout
```

Router hỗ trợ:

- Nested layouts.
- Lazy-loaded route components.
- Memory-history factory để test.
- Browser page title.
- Scroll restoration.
- Not Found route.

Authentication và permission guard chưa được triển khai. Guard thật thuộc F2.

### F1.1C — Navigation and feature placeholders

Đã triển khai:

- `CustomerHeader`.
- `MobileBottomNav`.
- `AdminSidebar`.
- `PlaceholderPage`.
- Customer navigation active states.
- Admin navigation active states.
- Mobile admin drawer.
- Mobile safe-area spacing.
- Responsive customer và admin layouts.
- Skip links.
- Semantic landmarks.
- Keyboard focus indicators.
- Focus management cho admin drawer.
- Escape-to-close.
- Body scroll locking.
- Reduced-motion support.

Không còn:

- Empty placeholder source file.
- Raw hex color trong Vue component.
- Navigation link trỏ tới customer/admin route không tồn tại.

### F1.1D — Application shell tests

Đã bổ sung test cho:

- Customer routes.
- Admin routes.
- Authentication shell routes.
- Not Found route.
- Browser document title.
- Router scroll behavior configuration.
- Customer desktop navigation.
- Mobile bottom navigation.
- Exact home active state.
- Admin navigation active state.
- Admin drawer semantics.
- Admin drawer initial focus.
- Placeholder content và return destination.
- `aria-labelledby` của placeholder page.

Test dùng memory router, không phụ thuộc browser URL thật.

---

## 3. Current routes

### Customer

| Path         | Page            | Authentication |
| ------------ | --------------- | -------------- |
| `/`          | HomePage        | Public         |
| `/movies`    | PlaceholderPage | Public         |
| `/showtimes` | PlaceholderPage | Public         |
| `/bookings`  | PlaceholderPage | Chưa bảo vệ    |

### Admin

| Path                  | Page               | Authentication |
| --------------------- | ------------------ | -------------- |
| `/admin`              | AdminDashboardPage | Chưa bảo vệ    |
| `/admin/movies`       | Admin placeholder  | Chưa bảo vệ    |
| `/admin/cinemas`      | Admin placeholder  | Chưa bảo vệ    |
| `/admin/rooms`        | Admin placeholder  | Chưa bảo vệ    |
| `/admin/seat-layouts` | Admin placeholder  | Chưa bảo vệ    |
| `/admin/showtimes`    | Admin placeholder  | Chưa bảo vệ    |
| `/admin/bookings`     | Admin placeholder  | Chưa bảo vệ    |
| `/admin/payments`     | Admin placeholder  | Chưa bảo vệ    |
| `/admin/users`        | Admin placeholder  | Chưa bảo vệ    |
| `/admin/promotions`   | Admin placeholder  | Chưa bảo vệ    |
| `/admin/settings`     | Admin placeholder  | Chưa bảo vệ    |

### Authentication and system

| Path                    | Page               |
| ----------------------- | ------------------ |
| `/auth/login`           | LoginPage          |
| `/auth/callback`        | OidcCallbackPage   |
| `/auth/session-expired` | SessionExpiredPage |
| `/*`                    | NotFoundPage       |

Admin routes hiện chỉ là application shell. Permission guard sẽ được triển khai trong F2.

---

## 4. Design tokens

Tailwind CSS 4 theme:

```text
src/assets/styles/tokens.css
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

Vue component phải dùng semantic utilities:

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
```

Raw color values chỉ được khai báo trong `tokens.css`.

---

## 5. Verification

Các lệnh bắt buộc:

```bash
npm run format
npm run lint
npm run type-check
npm run test:unit:run
npm run build
```

Kết quả F1.1:

| Command                 | Status |
| ----------------------- | ------ |
| `npm run format`        | PASS   |
| `npm run lint`          | PASS   |
| `npm run type-check`    | PASS   |
| `npm run test:unit:run` | PASS   |
| `npm run build`         | PASS   |

Không giữ trạng thái `PASS` nếu verification thực tế chưa chạy thành công.

---

## 6. Locked technical decisions

### Dependency direction

```text
app → modules → shared
```

- `app` có thể import `modules` và `shared`.
- `modules` có thể import `shared`.
- `shared` không được import `modules`.
- Module không import trực tiếp internal implementation của module khác.

### State ownership

```text
TanStack Query = server state
Pinia          = client/application state
VeeValidate    = form state
Vue Router     = navigation and URL filter state
```

Không copy query response vào Pinia.

### API boundary

- Frontend chỉ gọi API Gateway.
- API client được generate bằng Orval.
- Không sửa generated files bằng tay.
- Không retry mù mutation.
- Một user intent giữ cùng một idempotency key khi retry an toàn.
- Không phát minh endpoint, DTO, enum hoặc error code.

### Authentication

```text
Flow:     Authorization Code with PKCE
Library:  oidc-client-ts
Issuer:   http://localhost:8082
JWK Set:  http://localhost:8082/oauth2/jwks
Audience: cinema-api
```

SPA không có client secret.

### Booking

- UI không gọi trực tiếp hold/book/release của Inventory.
- Seat availability trên UI chỉ là snapshot.
- Booking có thể trả về HTTP `202 Accepted`.
- Countdown dùng `holdExpiresAt` từ server.
- Client không tự tạo hoặc gia hạn deadline.

---

## 7. Current blockers

Không có blocker cho application shell.

Các contract cần xác nhận trước hoặc trong quá trình tích hợp:

- OIDC client ID.
- OIDC redirect URI.
- Gateway OpenAPI.
- Movie endpoints.
- Showtime endpoints.
- ShowSeat lifecycle.
- Booking request/response.
- Booking status enum.
- Payment status enum.
- Error response envelope.
- Correlation ID contract.

Không phát minh contract từ mockup.

---

## 8. Next task

Task tiếp theo:

> F2 — OIDC Authentication.

Thứ tự đề xuất:

1. F2.1 — Environment và OIDC configuration.
2. F2.2 — OIDC user manager service.
3. F2.3 — Authentication store và composable.
4. F2.4 — Login, callback và logout.
5. F2.5 — Session expiration.
6. F2.6 — Route guards.
7. F2.7 — Permission-aware admin navigation.
8. F2.8 — Authentication tests và documentation.

Không thêm client secret vào SPA.

---

## 9. Remaining roadmap

```text
F1.1   Application Shell                     COMPLETED
F2     OIDC Authentication                   NEXT
F3     Generated API foundation
F4     Movie and Showtime browsing
F5     Seat selection and Booking Saga
F6     Payment and ticket confirmation
F7     Administration
F8     Hardening and deployment
```

---

## 10. Handoff instructions

Khi mở chat mới:

1. Đọc `AGENTS.md`.
2. Đọc `docs/CURRENT_STATUS.md`.
3. Đọc `docs/architecture.md`.
4. Đọc `docs/cinema-web-ui-design-spec.md`.
5. Đọc `README.md`.
6. Kiểm tra Git status.
7. Kiểm tra commit history.
8. Kiểm tra source hiện tại.
9. Chạy verification.
10. Tiếp tục task trong mục `Next task`.

Repository là source of truth. Không dùng chat history thay cho code và tài liệu hiện tại.
