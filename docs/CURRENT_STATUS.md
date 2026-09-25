# Cinema Web — Current Status

**Last updated:** 2026-09-25  
**Current phase:** F3 — Generated API foundation  
**Status:** F2 completed

---

## 1. Current objective

F2 OIDC Authentication đã hoàn thành về implementation.

Đã triển khai:

- OIDC Authorization Code với PKCE.
- Public SPA client `cinema-web`.
- Login, callback và logout.
- Direct login redirect, không có frontend confirmation page.
- Không yêu cầu authorization consent cho first-party `cinema-web`.
- Session expiration handling.
- Protected-route guard.
- Guest-only routes.
- Access-token roles và permissions.
- Permission-aware admin routes.
- Permission-aware admin navigation.
- Forbidden route.
- Authentication regression tests.

Bước hiện tại là chạy full verification và chốt F2 trước khi chuyển sang F3.

Luồng customer mục tiêu:

    Trang chủ
    → Chi tiết phim
    → Chọn suất chiếu
    → Chọn ghế
    → Tạo booking
    → Thanh toán
    → Theo dõi trạng thái
    → Nhận vé

---

## 2. Completed

### F1 — Frontend foundation

Application shell và frontend foundation đã hoàn thành:

- Vue 3 + TypeScript + Vite.
- Vue Router.
- Pinia.
- TanStack Vue Query.
- Axios + Orval.
- oidc-client-ts.
- PrimeVue.
- Tailwind CSS 4.
- VeeValidate + Zod.
- VueUse.
- Lucide.
- Vitest + Vue Test Utils.
- ESLint + Oxlint + Prettier.

Node:

    ^22.18.0 || >=24.12.0

### F2.1 — Environment and OIDC configuration

Đã triển khai:

- Typed `VITE_OIDC_*` configuration.
- Public client ID `cinema-web`.
- Authority `http://localhost:8082`.
- Callback `/auth/callback`.
- Post-logout redirect `/`.
- Scope validation.
- `openid` bắt buộc.
- Không có SPA client secret.

Local scope contract:

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

### F2.2 — OIDC UserManager

Đã triển khai:

- Lazy `UserManager`.
- Authorization Code + PKCE.
- `sessionStorage`.
- Runtime OIDC discovery.
- Không dùng password grant.
- Không dùng refresh token hoặc `offline_access`.
- `automaticSilentRenew = false`.
- `monitorSession = false`.
- `revokeTokensOnSignout = false`.

### F2.3 — Authentication state

Auth store hỗ trợ:

    idle
    loading
    anonymous
    authenticated
    expired
    error

Pinia giữ:

- Presentation identity.
- Roles.
- Permissions.
- Authentication status.

Pinia không giữ:

- Access token.
- ID token.
- Refresh token.

OIDC managed user vẫn thuộc `oidc-client-ts`.

### F2.4 — Login, callback and logout

Đã triển khai:

- Direct OIDC login redirect.
- Không còn frontend confirmation step.
- Safe return URL trong OIDC state.
- Callback processing.
- RP-Initiated Logout.
- External return URL bị từ chối.
- Auth-loop return URL bị từ chối.
- Raw provider error/token không được render ra UI.

`/auth/login` vẫn tồn tại như technical bridge route nhưng tự động bắt đầu OIDC login.

### F2.5 — Session expiration

Đã triển khai:

- Subscribe `UserManager.events.addAccessTokenExpired`.
- Auth state chuyển sang `expired`.
- Identity, roles và permissions được clear khi token hết hạn.
- Protected context được chuyển tới `/auth/session-expired`.
- Safe return URL được giữ để login lại.

Không bật silent token renewal.

### F2.6 — Route guards

Đã triển khai:

- Public routes.
- `requiresAuth`.
- `guestOnly`.
- Initial session restore.
- Anonymous protected-route redirect.
- Expired-session redirect.
- Authenticated guest-only redirect.
- Safe return URL.

`/auth/callback` không phải guest-only route.

### F2.7 — Roles, permissions and admin authorization

Access token được decode để lấy:

    roles
    permissions

Frontend chỉ dùng claim này cho UX/navigation.

Backend Resource Server vẫn là authorization security boundary.

Admin area yêu cầu:

    STAFF OR ADMIN

Permission mapping:

| Route                 | Requirement                      |
| --------------------- | -------------------------------- |
| `/admin`              | STAFF hoặc ADMIN                 |
| `/admin/movies`       | STAFF/ADMIN + `movie:manage`     |
| `/admin/cinemas`      | STAFF/ADMIN + `inventory:manage` |
| `/admin/rooms`        | STAFF/ADMIN + `inventory:manage` |
| `/admin/seat-layouts` | STAFF/ADMIN + `inventory:manage` |
| `/admin/showtimes`    | STAFF/ADMIN + `showtime:manage`  |
| `/admin/bookings`     | STAFF/ADMIN + `booking:read`     |
| `/admin/payments`     | STAFF/ADMIN + `payment:read`     |
| `/admin/users`        | STAFF/ADMIN + `user:manage`      |
| `/admin/promotions`   | ADMIN                            |
| `/admin/settings`     | ADMIN                            |

`USER` không được truy cập admin area ngay cả khi có `booking:read`.

`AdminSidebar` filter item theo cùng role/permission contract.

### F2.8 — Authentication regression tests

Đã bổ sung test cho:

- OIDC configuration.
- Access-token roles/permissions parsing.
- Invalid/malformed JWT handling.
- Safe return URL normalization.
- Open-redirect prevention.
- Auth redirect-loop prevention.
- Auth store lifecycle.
- Expired-token cleanup.
- Anonymous-session restore.
- Auth restore failure.
- Route guard authentication.
- Route guard authorization.
- USER / STAFF / ADMIN cases.
- Permission-aware sidebar.
- Authorization route metadata.
- `/forbidden`.
- Authentication protocol routes.

---

### F3 contract findings

Generated OpenAPI contracts hiện có cho:

- Movie Service.
- User Service.
- Inventory Service.
- Booking Service.
- Payment Service.

Public frontend API boundary không expose Inventory `hold`, `book` hoặc `release`
operations vì các endpoint này yêu cầu internal `inventory:write` capability và
Booking Saga là owner của seat reservation flow.

Payment OpenAPI hiện chưa có frontend query endpoint tương ứng với
`payment:read`. Generated Payment operations hiện thuộc refund, reconciliation,
audit và provider webhook capabilities. Không expose các operation này qua
Cinema Web public API barrel cho tới khi backend có frontend-compatible payment
read contract.

## 3. Current routes

### Customer

| Path         | Authentication |
| ------------ | -------------- |
| `/`          | Public         |
| `/movies`    | Public         |
| `/showtimes` | Public         |
| `/bookings`  | Authenticated  |

### Authentication

| Path                    | Purpose                  |
| ----------------------- | ------------------------ |
| `/auth/login`           | OIDC login bridge        |
| `/auth/callback`        | OIDC callback            |
| `/auth/session-expired` | Expired-session recovery |

### System

| Path         | Purpose                        |
| ------------ | ------------------------------ |
| `/forbidden` | Authenticated but unauthorized |
| `/*`         | Not Found                      |

### Administration

    /admin
    ├── movies
    ├── cinemas
    ├── rooms
    ├── seat-layouts
    ├── showtimes
    ├── bookings
    ├── payments
    ├── users
    ├── promotions
    └── settings

Admin navigation và router đều permission-aware.

---

## 4. Authentication contract

    Client:     cinema-web
    Type:       Public SPA
    Flow:       Authorization Code + PKCE
    Issuer:     http://localhost:8082
    Audience:   cinema-api
    Callback:   http://localhost:5173/auth/callback
    Logout:     http://localhost:5173/
    Secret:     none
    Consent:    disabled for cinema-web

`cinema-web` là first-party SPA.

Browser không giữ client secret.

Roles và effective permissions được Authorization Server phát trong access token.

Permissions là intersection giữa user authorities và authorized scopes.

---

## 5. Security decisions

- Không dùng frontend authorization làm security boundary.
- API/resource server phải enforce permission.
- Không lưu token vào Pinia.
- Không lưu OIDC user vào `localStorage`.
- Không log token.
- Không render raw OAuth/OIDC error.
- Không cho arbitrary external return URL.
- Không bật refresh token hoặc `offline_access`.
- Không bypass Gateway.
- Không phát minh permission frontend không tồn tại ở backend.

---

## 6. Verification

Full verification bắt buộc trước khi chốt F2:

    npm run format
    npm run lint
    npm run type-check
    npm run test:unit:run
    npm run build

Current checkpoint:

| Command                 | Status |
| ----------------------- | ------ |
| `npm run format`        | PASS   |
| `npm run lint`          | PASS   |
| `npm run type-check`    | PASS   |
| `npm run test:unit:run` | PASS   |
| `npm run build`         | PASS   |

Không đổi thành `PASS` cho tới khi command thực tế chạy thành công.

---

## 7. Backend integration state

Backend hiện đã hỗ trợ:

- Public PKCE client `cinema-web`.
- `http://localhost:5173/auth/callback`.
- `http://localhost:5173/` post logout.
- CORS cho local frontend.
- Cinema Web OAuth scopes.
- Roles claim.
- Permissions claim.
- Consent disabled riêng cho `cinema-web`.

Login end-to-end đã được xác nhận thủ công.

---

## 8. Remaining backend/API contracts

Các contract cần đọc/xác nhận trong các phase tiếp theo:

- Gateway OpenAPI.
- Movie endpoints.
- Showtime endpoints.
- ShowSeat lifecycle.
- Booking request/response.
- Booking status.
- Payment status.
- Error envelope.
- Correlation ID.

Không phát minh DTO hoặc endpoint từ UI mockup.

---

## 9. Next task

Sau khi full verification F2 pass:

> F3 — Generated API foundation.

F3 phải bắt đầu từ backend/Gateway API contract thật.

Không viết handwritten DTO song song với generated API contract nếu backend đã cung cấp OpenAPI.

---

## 10. Roadmap

| Round                                     | Status    |
| ----------------------------------------- | --------- |
| F1.1 Application Shell                    | COMPLETED |
| F2.1 OIDC Configuration                   | COMPLETED |
| F2.2 OIDC UserManager                     | COMPLETED |
| F2.3 Authentication Store                 | COMPLETED |
| F2.4 Login / Callback / Logout            | COMPLETED |
| F2.5 Session Expiration                   | COMPLETED |
| F2.6 Route Guards                         | COMPLETED |
| F2.7 Permission-aware Administration      | COMPLETED |
| F2.8 Authentication Tests / Documentation | COMPLETED |
| F2 OIDC Authentication                    | COMPLETED |
| F3 Generated API Foundation               | NEXT      |
| F4 Movie and Showtime Browsing            | PENDING   |
| F5 Seat Selection and Booking Saga        | PENDING   |
| F6 Payment and Ticket Confirmation        | PENDING   |
| F7 Administration                         | PENDING   |
| F8 Hardening and Deployment               | PENDING   |

---

## 11. Session checkpoint — 2026-09-25

F2 implementation hiện hoàn tất.

Các behavior đã xác nhận thủ công:

    anonymous protected route
    → login

    authenticated protected route
    → allow

    expired protected route
    → session-expired

    login with returnUrl
    → return to requested route

    USER → /admin
    → forbidden

    STAFF
    → permission-aware admin access

    ADMIN
    → full configured admin access

Authentication regression tests đã được bổ sung trong F2.8.

Checkpoint chỉ được chuyển thành `COMPLETED` sau khi full verification pass.

---

## 12. Handoff instructions

Khi tiếp tục dự án:

1. Đọc `AGENTS.md`.
2. Đọc `docs/CURRENT_STATUS.md`.
3. Đọc `docs/architecture.md`.
4. Đọc `README.md`.
5. Kiểm tra source hiện tại.
6. Kiểm tra git status/history.
7. Xác nhận verification gần nhất.
8. Tiếp tục task trong `Next task`.

Repository là source of truth.
