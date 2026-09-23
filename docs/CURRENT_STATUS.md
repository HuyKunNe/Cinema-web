# Cinema Web — Current Status

**Last updated:** 2026-09-23  
**Current phase:** F1.1 — Application Shell  
**Status:** In progress

---

## 1. Current objective

Xây dựng application shell ổn định cho frontend Vue 3 trước khi tích hợp OIDC và backend API.

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

- Vue 3 + TypeScript + Vite đã được khởi tạo.
- Vue Router đã được cài đặt.
- Pinia đã được cài đặt.
- TanStack Vue Query đã được cài đặt.
- PrimeVue và PrimeIcons đã được cài đặt.
- Tailwind CSS 4 đã được tích hợp bằng Vite plugin.
- Vitest đã được cấu hình.
- ESLint, Oxlint và Prettier đã được cấu hình.
- Vue đã được chuyển từ RC sang stable `3.5.43`.
- `@vue/compiler-sfc` được đồng bộ với Vue `3.5.43`.
- `lucide-vue-next` deprecated đã được thay bằng `@lucide/vue`.
- Node engine đã được cập nhật:

```text
^22.18.0 || >=24.12.0
```

### F1.1A — Bootstrap and providers

Đã tách application initialization thành:

```text
src/app/bootstrap.ts
src/app/providers/pinia.ts
src/app/providers/primevue.ts
src/app/providers/vue-query.ts
```

`src/main.ts` hiện chỉ:

- Import global styles.
- Gọi `bootstrapApplication()`.

TanStack Query defaults:

```text
queries.staleTime             = 30 seconds
queries.retry                 = 1
queries.refetchOnWindowFocus  = true
mutations.retry               = false
```

### F1.1B — Router and layouts

Đã triển khai bốn layout:

```text
CustomerLayout
AdminLayout
AuthLayout
BlankLayout
```

Đã thiết lập các route:

```text
/                       Customer home
/admin                  Admin dashboard
/auth/login             Login
/auth/callback          OIDC callback shell
/auth/session-expired   Session expired
/*                      Not Found
```

Đã hỗ trợ:

- Nested layouts.
- Lazy-loaded route components.
- Browser page title.
- Scroll restoration.
- Not Found page.

Authentication guard chưa được triển khai. Guard thật sẽ được thêm trong F2.

### Design tokens

Đã cấu hình Tailwind CSS 4 theme tại:

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

Component sử dụng semantic utilities:

```text
bg-primary
hover:bg-primary-hover
text-secondary
bg-background
bg-surface
text-content
text-content-muted
border-outline
```

Không sử dụng raw hex color trong Vue component.

---

## 3. Current routes

| Path                    | Layout         | Page               | Authentication  |
| ----------------------- | -------------- | ------------------ | --------------- |
| `/`                     | CustomerLayout | HomePage           | Public          |
| `/admin`                | AdminLayout    | AdminDashboardPage | Chưa bảo vệ     |
| `/auth/login`           | AuthLayout     | LoginPage          | Public          |
| `/auth/callback`        | BlankLayout    | OidcCallbackPage   | Public callback |
| `/auth/session-expired` | AuthLayout     | SessionExpiredPage | Public          |
| `/*`                    | BlankLayout    | NotFoundPage       | Public          |

Admin route hiện chỉ là application shell. Permission guard sẽ được triển khai cùng OIDC.

---

## 4. Verification

Các lệnh bắt buộc:

```bash
npm run format
npm run lint
npm run type-check
npm run test:unit:run
npm run build
```

Kết quả gần nhất:

| Command                 | Status |
| ----------------------- | ------ |
| `npm run format`        | PASS   |
| `npm run lint`          | PASS   |
| `npm run type-check`    | PASS   |
| `npm run test:unit:run` | PASS   |
| `npm run build`         | PASS   |

Không giữ trạng thái `PASS` nếu verification thực tế chưa chạy thành công.

---

## 5. Locked technical decisions

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
- Frontend không gọi trực tiếp từng microservice.
- API client được generate bằng Orval.
- Không sửa generated files bằng tay.
- Không retry mù mutation.
- Một user intent sử dụng cùng một idempotency key khi retry an toàn.

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
- Countdown sử dụng `holdExpiresAt` từ server.
- Client không tự tạo hoặc gia hạn deadline.

---

## 6. Current blockers

Không có blocker frontend foundation.

Các contract cần xác nhận trước khi tích hợp API:

- OIDC client ID và redirect URI.
- Gateway OpenAPI.
- Movie endpoints.
- Showtime endpoints.
- ShowSeat lifecycle.
- Booking request/response.
- Booking status enum.
- Payment status enum.
- Error response envelope.
- Correlation ID contract.

Không phát minh endpoint hoặc enum từ mockup.

---

## 7. Next task

Task tiếp theo:

> F1.1C — Navigation and feature placeholders.

Thứ tự thực hiện:

1. Tạo `CustomerHeader.vue`.
2. Tạo `MobileBottomNav.vue`.
3. Tạo `AdminSidebar.vue`.
4. Tạo `PlaceholderPage.vue`.
5. Thêm customer routes:
   - `/movies`
   - `/showtimes`
   - `/bookings`
6. Thêm admin placeholder routes.
7. Thêm active navigation states.
8. Kiểm tra responsive behavior.
9. Thêm accessibility labels và skip link.

Không tích hợp API hoặc authentication trong F1.1C.

---

## 8. Definition of done for F1.1C

- Customer navigation hoạt động trên desktop.
- Bottom navigation hoạt động trên mobile.
- Admin sidebar có active state.
- Tất cả navigation sử dụng semantic design tokens.
- Unknown route vẫn hiển thị Not Found.
- Không còn empty placeholder file.
- Không còn raw hex trong Vue component.
- Format pass.
- Lint pass.
- Type-check pass.
- Unit tests pass.
- Production build pass.

---

## 9. Remaining roadmap

```text
F1.1C  Navigation and feature placeholders
F1.1D  Application shell tests and documentation
F2     OIDC Authentication
F3     Generated API foundation
F4     Movie and Showtime browsing
F5     Seat selection and Booking Saga
F6     Payment and ticket confirmation
F7     Administration
F8     Hardening and deployment
```

---

## 10. Handoff instructions

Khi mở một chat mới:

1. Đọc `AGENTS.md`.
2. Đọc `docs/CURRENT_STATUS.md`.
3. Đọc `docs/architecture.md`.
4. Đọc `docs/cinema-web-ui-design-spec.md`.
5. Kiểm tra Git status và commit history.
6. Kiểm tra source hiện tại.
7. Chạy verification.
8. Tiếp tục task trong mục `Next task`.
