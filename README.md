# Cinema Web

Frontend Vue 3 + TypeScript cho hệ thống Cinema Booking.

Ứng dụng hướng tới các luồng:

- Khám phá phim.
- Xem lịch chiếu.
- Chọn ghế.
- Đặt vé.
- Thanh toán.
- Theo dõi Booking Saga.
- Quản lý vé.
- Quản trị phim, rạp, phòng, suất chiếu và booking.

## Current status

```text
F1.1 Application Shell  COMPLETED
F2.1 OIDC Configuration IMPLEMENTED — VERIFICATION NOT RUN
F2.2 OIDC UserManager    IMPLEMENTED — VERIFICATION NOT RUN
F2.3 Auth Store          IMPLEMENTED — VERIFICATION NOT RUN
F2.4 Login and Callback  IMPLEMENTED — VERIFICATION NOT RUN
F2.5 Session Expiration  NEXT
```

Chi tiết tiến độ:

```text
docs/CURRENT_STATUS.md
```

---

## 1. Technology stack

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
Tailwind CSS 4
VeeValidate
Zod
VueUse
@lucide/vue
Vitest
Vue Test Utils
MSW
ESLint
Oxlint
Prettier
```

Playwright end-to-end testing sẽ được cấu hình trong phase hardening hoặc khi customer flow đầu tiên hoàn thành.

---

## 2. Requirements

Node engine:

```text
^22.18.0 || >=24.12.0
```

Kiểm tra môi trường:

```bash
node -v
npm -v
```

---

## 3. Installation

Clone repository:

```bash
git clone https://github.com/HuyKunNe/Cinema-web.git
cd Cinema-web
```

Cài dependencies từ lock file:

```bash
npm ci
```

Khởi động development server:

```bash
npm run dev
```

Vite mặc định chạy tại:

```text
http://localhost:5173
```

---

## 4. Available commands

Development:

```bash
npm run dev
```

Format:

```bash
npm run format
```

Lint:

```bash
npm run lint
```

Type checking:

```bash
npm run type-check
```

Unit tests watch mode:

```bash
npm run test:unit
```

Unit tests chạy một lần:

```bash
npm run test:unit:run
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## 5. Verification

Trước khi commit:

```bash
npm run format
npm run lint
npm run type-check
npm run test:unit:run
npm run build
```

Kiểm tra source:

```bash
find src -type f -empty
rg '#[0-9a-fA-F]{3,8}' src -g '*.vue'
git diff --check
```

Không coi task hoàn thành nếu verification bắt buộc chưa chạy thành công.

---

## 6. Project structure

```text
cinema-web/
├── public/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── navigation/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── providers/
│   │   └── router/
│   ├── modules/
│   │   ├── admin/
│   │   ├── auth/
│   │   └── movies/
│   ├── assets/
│   │   └── styles/
│   ├── test/
│   └── main.ts
├── docs/
├── AGENTS.md
├── package.json
├── vite.config.ts
└── vitest.config.ts
```

Dependency direction:

```text
app → modules → shared
```

Rules:

- `app` có thể import `modules` và `shared`.
- `modules` có thể import `shared`.
- `shared` không được import `modules`.
- Page component chỉ orchestration.
- Business logic thuộc composable, query, mutation hoặc domain utility.
- Route-level component được lazy-load khi phù hợp.

---

## 7. Application shell

### Customer

```text
/
├── /movies
├── /showtimes
└── /bookings
```

Customer shell bao gồm:

- Desktop header.
- Mobile top bar.
- Mobile bottom navigation.
- Active navigation state.
- Footer.
- Skip link.
- Responsive safe-area spacing.

### Admin

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

Admin shell bao gồm:

- Desktop sidebar.
- Mobile navigation drawer.
- Active navigation state.
- Keyboard focus management.
- Escape-to-close.
- Body scroll locking.
- Skip link.

Admin routes chưa được bảo vệ. Authentication và permissions được triển khai trong F2.

---

## 8. Testing

Application shell tests bao phủ:

- Route resolution.
- Browser page title.
- Not Found route.
- Customer navigation.
- Mobile navigation.
- Exact active state của home route.
- Admin active navigation.
- Admin drawer accessibility semantics.
- Admin drawer initial focus.
- Placeholder content.
- Accessible heading relationship.

Chạy toàn bộ unit tests:

```bash
npm run test:unit:run
```

Chạy một test file:

```bash
npm run test:unit:run -- src/app/router/router.spec.ts
```

Test sử dụng memory router và không phụ thuộc browser URL thật.

---

## 9. Styling

Tailwind CSS 4 sử dụng CSS-first configuration.

Global stylesheet:

```text
src/assets/main.css
```

Design tokens:

```text
src/assets/styles/tokens.css
```

Component phải sử dụng semantic utilities như:

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

Không dùng raw hex color trong Vue component.

---

## 10. API and state rules

Frontend chỉ gọi API Gateway.

```text
TanStack Query = server state
Pinia          = client/application state
VeeValidate    = form state
Vue Router     = navigation and URL filter state
```

API client sẽ được generate từ OpenAPI bằng Orval.

Không được:

- Gọi trực tiếp internal microservice.
- Sửa generated API code bằng tay.
- Phát minh endpoint hoặc DTO.
- Retry mù mutation.
- Log access token hoặc payment data nhạy cảm.

---

## 11. Authentication direction

Authentication sử dụng:

```text
Authorization Code with PKCE
oidc-client-ts
```

SPA là public client:

- Không có client secret.
- Không dùng password grant.
- Không xem frontend route guard là lớp bảo mật cuối cùng.
- Backend luôn là nguồn authorization có thẩm quyền.

Tạo cấu hình local từ file mẫu:

```bash
cp .env.example .env.local
```

Trước khi điền `VITE_OIDC_CLIENT_ID`, User Service phải đăng ký một public PKCE
client riêng với callback `http://localhost:5173/auth/callback`, post-logout URI
`http://localhost:5173/` và các scope đã được phê duyệt. Không tái sử dụng
`cinema-swagger`.

F2.1 thiết lập và validate environment contract. Login, callback, logout và
route guard thuộc các bước F2 tiếp theo.

F2.2 cung cấp lazy `UserManager` dùng `sessionStorage`, Authorization Code +
PKCE và runtime discovery; đây là protocol foundation được auth
store/composable và F2.4 sử dụng.

F2.3 cung cấp Pinia authentication presentation state và `useAuth`. Store chỉ
giữ subject, display name, email và trạng thái phiên; token tiếp tục do
`oidc-client-ts` quản lý.

F2.4 kết nối login redirect, callback processing và RP-Initiated Logout. Return
URL chỉ chấp nhận internal path an toàn; lỗi giao thức được chuyển thành thông
báo UI không chứa token, authorization code hoặc raw provider response.

---

## 12. Project documentation

```text
AGENTS.md
docs/CURRENT_STATUS.md
docs/architecture.md
docs/cinema-web-ui-design-spec.md
docs/PROJECT_CONTEXT.md
```

Khi tiếp tục dự án trong chat mới, bắt đầu bằng `AGENTS.md` và `docs/CURRENT_STATUS.md`.
