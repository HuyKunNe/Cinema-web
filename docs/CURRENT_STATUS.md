# Cinema Web — Current Status

**Last updated:** 2026-09-24  
**Current phase:** F2.4 — Login, callback and logout  
**Status:** Implemented — verification not run

---

## 1. Current objective

F2.1–F2.3 đã thiết lập OIDC foundation và F2.4 đã kết nối login redirect,
callback processing cùng RP-Initiated Logout. Verification của các bước này
chưa được chạy theo yêu cầu hiện tại. Mục tiêu phát triển tiếp theo là F2.5 —
xử lý access-token expiration và session recovery.

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

### F2.1 — Environment and OIDC configuration

Đã triển khai:

- Khai báo các biến `VITE_OIDC_*` trong `env.d.ts`.
- Cung cấp `.env.example` cho local OIDC configuration.
- Đọc và validate authority, public client ID, callback URI, post-logout URI và scope.
- Yêu cầu callback `/auth/callback` cùng origin với SPA.
- Yêu cầu scope `openid`.
- Không khai báo client secret, password grant, refresh token hoặc silent renewal.
- Có source unit test cho configuration resolver; test chưa được chạy trong vòng làm việc này.

Các giá trị runtime vẫn phụ thuộc public PKCE client được đăng ký chính xác trong
User Service.

### F2.2 — OIDC UserManager service

Đã triển khai:

- Factory `createOidcUserManager(...)` nhận typed OIDC configuration.
- Lazy singleton `getOidcUserManager()` không làm application bootstrap phụ thuộc cấu hình OIDC hợp lệ.
- Authorization Code flow với PKCE; không có client secret.
- Runtime discovery từ authority thay vì hardcode protocol endpoint.
- Tách prefix lưu authorization state và managed user.
- Chỉ lưu state và user trong `sessionStorage`; không dùng `localStorage`.
- Tắt automatic silent renewal, session monitoring, UserInfo loading và client-side token revocation.

Service được auth store sử dụng để khôi phục managed user. Việc gọi trực tiếp
các protocol method được giới hạn trong auth composable.

### F2.3 — Authentication store and composable

Đã triển khai:

- Typed authentication status: idle, loading, anonymous, authenticated, expired và error.
- Pinia store khôi phục managed user qua OIDC service và chống initialization trùng.
- Identity trình bày chỉ gồm subject, display name và email.
- Access token, ID token và refresh token không được copy vào Pinia.
- User đã hết hạn được biểu diễn bằng trạng thái `expired` thay vì authenticated.
- Lỗi khôi phục session dùng thông báo an toàn, không lưu raw OIDC error hoặc token.
- `useAuth` cung cấp reactive state và action facade cho các bước UI tiếp theo.

Store/composable hiện được login/callback page và customer header sử dụng; chưa
được khởi tạo ở application bootstrap hoặc route guard.

### F2.4 — Login, callback and logout

Đã triển khai:

- Login page khôi phục managed session và bắt đầu Authorization Code + PKCE redirect.
- OIDC state giữ internal return URL đã được normalize.
- External, protocol-relative và auth-loop return URL được thay bằng `/`.
- Callback page xử lý authorization response, cập nhật auth store và điều hướng an toàn.
- Callback/loading/error states không hiển thị authorization code, token hoặc raw provider error.
- Logout dùng discovered RP-Initiated Logout endpoint qua `oidc-client-ts`.
- Customer header khôi phục managed session khi mount và hiển thị login hoặc
  logout theo presentation state.
- Auth layout đã được trả về cấu trúc tối giản, không còn dùng admin navigation.

Login end-to-end vẫn phụ thuộc backend client registration và CORS trong mục blockers.

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

Kết quả F2.1–F2.4 trong vòng làm việc hiện tại:

| Command                 | Status                          |
| ----------------------- | ------------------------------- |
| `npm run format`        | NOT RUN — theo yêu cầu hiện tại |
| `npm run lint`          | NOT RUN — theo yêu cầu hiện tại |
| `npm run type-check`    | NOT RUN — theo yêu cầu hiện tại |
| `npm run test:unit:run` | NOT RUN — theo yêu cầu hiện tại |
| `npm run build`         | NOT RUN — theo yêu cầu hiện tại |

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

Các prerequisite còn thiếu để chạy OIDC end-to-end:

- Backend chưa đăng ký public PKCE client riêng cho `cinema-web`.
- Backend local bootstrap hiện chỉ tạo `cinema-swagger`; không được tái sử dụng client này cho SPA.
- User Service CORS chưa cho phép origin `http://localhost:5173`.
- Client ID, redirect URI, post-logout URI và scope cuối cùng phải khớp chính xác với backend registration.

Các contract khác cần xác nhận trước hoặc trong quá trình tích hợp API:

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

> F2.5 — Session expiration.

Thứ tự còn lại:

1. F2.5 — Session expiration.
2. F2.6 — Route guards.
3. F2.7 — Permission-aware admin navigation.
4. F2.8 — Authentication tests và documentation.

Không thêm client secret vào SPA.

---

## 9. Remaining roadmap

```text
F1.1   Application Shell                     COMPLETED
F2.1   Environment and OIDC configuration    IMPLEMENTED — VERIFICATION NOT RUN
F2.2   OIDC UserManager service              IMPLEMENTED — VERIFICATION NOT RUN
F2.3   Authentication store and composable   IMPLEMENTED — VERIFICATION NOT RUN
F2.4   Login, callback and logout             IMPLEMENTED — VERIFICATION NOT RUN
F2.5   Session expiration                     NEXT
F2     OIDC Authentication                   IN PROGRESS
F3     Generated API foundation
F4     Movie and Showtime browsing
F5     Seat selection and Booking Saga
F6     Payment and ticket confirmation
F7     Administration
F8     Hardening and deployment
```

---

## 10. Session checkpoint — 2026-09-24

Task vừa thực hiện:

> F2.4 — Login, callback and logout.

Phần đã hoàn thành:

- Hoàn thiện OIDC environment contract, lazy `UserManager`, auth store và
  composable từ F2.1–F2.3.
- Kết nối login redirect, callback processing và RP-Initiated Logout.
- Normalize return URL và chỉ cho phép same-origin application path.
- Khôi phục managed session tại login page và customer header.
- Không copy token vào Pinia, không log raw OIDC error và không thêm client secret.
- Đồng bộ README, architecture và current-status documentation.

Phần chưa hoàn thành:

- F2.5 chưa xử lý runtime access-token expiration hoặc điều hướng tới
  `/auth/session-expired`.
- F2.6 chưa có authentication/permission route guards.
- F2.7 chưa có permission-aware admin navigation.
- F2.8 chưa bổ sung đầy đủ authentication regression tests.
- Chưa xác nhận login end-to-end với backend thật.

Runtime blocker còn lại:

- Chưa có public PKCE client dành riêng cho `cinema-web` trong User Service.
- User Service chưa cho phép CORS từ `http://localhost:5173`.
- `VITE_OIDC_CLIENT_ID` vẫn phải để trống cho đến khi backend registration được
  xác nhận. Với cấu hình này, login page có thể lần lượt hiển thị lỗi khôi phục
  session rồi lỗi bắt đầu đăng nhập; đây là configuration failure dự kiến.

Verification của checkpoint này:

```text
npm run format         NOT RUN — theo yêu cầu
npm run lint           NOT RUN — theo yêu cầu
npm run type-check     NOT RUN — theo yêu cầu
npm run test:unit:run  NOT RUN — theo yêu cầu
npm run build          NOT RUN — theo yêu cầu
```

Bước chính xác tiếp theo:

1. Bắt đầu F2.5 bằng cách đăng ký lifecycle-safe listener cho OIDC access-token
   expiration từ `UserManager.events`.
2. Thêm action chuyển auth store sang `expired` mà không giữ token hoặc raw error.
3. Điều hướng người dùng từ protected context tới `/auth/session-expired`, giữ
   internal return URL an toàn và tránh redirect loop.
4. Không bật refresh token, silent renewal hoặc `offline_access` khi backend
   registration chưa xác nhận hỗ trợ.

---

## 11. Handoff instructions

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
