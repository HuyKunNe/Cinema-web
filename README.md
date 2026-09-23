# Cinema Web

Frontend Vue 3 + TypeScript cho hệ thống Cinema Booking.

Ứng dụng hỗ trợ:

- Khám phá phim.
- Xem lịch chiếu.
- Chọn ghế.
- Đặt vé.
- Thanh toán.
- Theo dõi Booking Saga.
- Quản lý vé.
- Quản trị phim, rạp, suất chiếu và booking.

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
Tailwind CSS
VeeValidate + Zod
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

## 2. Requirements

Recommended local environment:

```text
Node.js >= 22.12.0
npm >= 11
```

Current development environment:

```text
Node.js 22.16.0
npm 11.4.2
```

Check versions:

```bash
node -v
npm -v
```

---

## 3. Installation

Clone repository:

```bash
git clone <repository-url>
cd cinema-web
```

Install dependencies:

```bash
npm install
```

---

## 4. Environment configuration

Tạo file `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

Trên PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Example configuration:

```dotenv
VITE_API_BASE_URL=http://localhost:8080

VITE_OIDC_AUTHORITY=http://localhost:8082
VITE_OIDC_CLIENT_ID=cinema-web
VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_OIDC_AUDIENCE=cinema-api
```

Không commit `.env.local`.

SPA không được có client secret.

---

## 5. Start development server

```bash
npm run dev
```

Default Vite URL:

```text
http://localhost:5173
```

Frontend gọi backend qua Gateway:

```text
http://localhost:8080
```

---

## 6. Available commands

### Development

```bash
npm run dev
```

### Type checking

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

### Unit tests in watch mode

```bash
npm run test:unit
```

### Unit tests once

```bash
npm run test:unit:run
```

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### End-to-end tests

```bash
npx playwright test
```

### Open Playwright report

```bash
npx playwright show-report
```

---

## 7. Verification

Trước khi commit:

```bash
npm run format
npm run lint
npm run type-check
npm run test:unit:run
npm run build
```

Nếu thay đổi customer flow:

```bash
npx playwright test
```

Không coi task hoàn thành nếu các verification bắt buộc chưa chạy thành công.

---

## 8. Project structure

```text
cinema-web/
├── public/
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
│   │   │   └── generated/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── types/
│   │   └── utils/
│   ├── assets/
│   ├── mocks/
│   ├── test/
│   └── main.ts
├── e2e/
├── docs/
├── AGENTS.md
├── orval.config.ts
├── playwright.config.ts
├── vite.config.ts
└── vitest.config.ts
```

Dependency direction:

```text
app → modules → shared
```

---

## 9. Documentation

| Document                 | Purpose                                        |
| ------------------------ | ---------------------------------------------- |
| `AGENTS.md`              | Quy tắc bắt buộc khi làm việc trong repository |
| `docs/CURRENT_STATUS.md` | Tiến độ, blocker và task tiếp theo             |
| `docs/architecture.md`   | Kiến trúc frontend và backend integration      |
| `docs/ui-design-spec.md` | Design system và đặc tả màn hình               |

Khi bắt đầu một phiên làm việc mới, đọc theo thứ tự:

1. `AGENTS.md`.
2. `docs/CURRENT_STATUS.md`.
3. `docs/architecture.md`.
4. `docs/ui-design-spec.md`.

---

## 10. Backend services

Local backend topology:

| Service           | URL                     |
| ----------------- | ----------------------- |
| API Gateway       | `http://localhost:8080` |
| Movie Service     | `http://localhost:8081` |
| User/Auth Service | `http://localhost:8082` |
| Inventory Service | `http://localhost:8083` |
| Booking Service   | `http://localhost:8084` |
| Payment Service   | `http://localhost:8085` |
| Discovery Server  | `http://localhost:8761` |
| Config Server     | `http://localhost:8888` |

Recommended backend startup order:

```text
Config
→ Discovery
→ User/Auth
→ Movie
→ Inventory
→ Booking
→ Payment
→ Gateway
```

Frontend không gọi trực tiếp service URL. Tất cả API request đi qua Gateway.

---

## 11. Authentication

Authentication sử dụng OAuth2/OIDC:

```text
Flow:     Authorization Code with PKCE
Issuer:   http://localhost:8082
JWK Set:  http://localhost:8082/oauth2/jwks
Audience: cinema-api
```

Library:

```text
oidc-client-ts
```

SPA là public client:

- Không dùng client secret.
- Không dùng password grant.
- Không log token.
- Backend vẫn kiểm tra permission.

---

## 12. API client generation

API client được generate từ OpenAPI bằng Orval.

Generated files:

```text
src/shared/api/generated/
```

Không chỉnh sửa generated files bằng tay.

Generate client:

```bash
npx orval
```

Hoặc sử dụng script nếu đã khai báo:

```bash
npm run api:generate
```

Sau khi generate:

```bash
npm run type-check
npm run test:unit:run
npm run build
```

OpenAPI URL và output path phải được cấu hình trong `orval.config.ts`.

---

## 13. State management

### TanStack Vue Query

Quản lý server state:

- Movies.
- Showtimes.
- ShowSeats.
- Bookings.
- Payments.
- Admin data.

### Pinia

Quản lý client state:

- UI preferences.
- Navigation state.
- Temporary client selection.
- Drawer state.

Không copy server query result vào Pinia.

### VeeValidate and Zod

Quản lý form state và client validation.

Backend validation vẫn là authoritative.

Compatible baseline:

```text
vee-validate@4.15.1
@vee-validate/zod@4.15.1
zod@3.25.76
```

---

## 14. Booking flow

Luồng chính:

```text
Movie
→ Showtime
→ ShowSeats
→ Seat selection
→ Booking request
→ Booking processing
→ Payment processing
→ Booking confirmed
→ Ticket QR
```

Booking request có thể trả về:

```text
HTTP 202 Accepted
```

Frontend phải điều hướng đến status page và poll trạng thái thay vì hiển thị thành công ngay.

---

## 15. Seat and hold rules

```text
Seat     = physical room seat
ShowSeat = sellable seat snapshot for one showtime
```

Seat availability hiển thị trên UI chưa phải reservation.

Frontend không gọi trực tiếp các thao tác Inventory nội bộ:

- Hold.
- Book.
- Release.

Countdown dùng:

```text
holdExpiresAt
```

Frontend không tự tạo, reset hoặc gia hạn deadline.

---

## 16. UI design

Design direction:

```text
Cinematic Dark
```

Core tokens:

```css
--color-bg: #090a0d;
--color-surface: #15171c;
--color-surface-raised: #1d2027;
--color-primary: #b91c35;
--color-primary-bright: #e11d48;
--color-accent: #f4b942;
--color-text: #f5f2ed;
--color-text-muted: #9ca3af;
--color-border: #343944;
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-danger: #ef4444;
```

Figma:

[Cinema Web UI](https://www.figma.com/design/u8UwhKxDdk5qvK4WezjJnQ)

Chi tiết xem:

```text
docs/ui-design-spec.md
```

---

## 17. Testing

### Unit tests

Vitest:

```bash
npm run test:unit:run
```

### Component tests

Vue Test Utils được sử dụng cho Vue components.

### API mocks

MSW được sử dụng để mock API ở integration test.

### End-to-end tests

Playwright:

```bash
npx playwright test
```

Critical test flows:

- OIDC callback.
- Permission routing.
- Movie/showtime browsing.
- Seat selection.
- Seat conflict.
- Booking polling.
- Hold expiration.
- Payment failure.
- Booking confirmation.
- QR visibility.

---

## 18. Git workflow

Check repository state:

```bash
git status --short
git branch --show-current
git log --oneline -10
```

Suggested commit messages:

```text
chore(web): establish frontend foundation
chore(web): add application layouts
feat(auth): implement OIDC login flow
feat(movies): implement movie catalog
feat(booking): implement seat selection
feat(payment): add checkout flow
test(booking): cover stale seat conflict
docs(web): update current project status
```

Không commit:

- `.env.local`.
- Token.
- Secret.
- Generated runtime credentials.
- Build output nếu repository không yêu cầu.

---

## 19. Continue in a new chat

Khi mở chat mới, sử dụng prompt:

```text
Tôi muốn tiếp tục phát triển dự án cinema-web.

Trước khi thay đổi code:

1. Đọc AGENTS.md.
2. Đọc docs/CURRENT_STATUS.md.
3. Đọc docs/architecture.md.
4. Đọc docs/ui-design-spec.md.
5. Kiểm tra package.json.
6. Kiểm tra git status, branch và 10 commit gần nhất.
7. Kiểm tra source hiện tại.
8. Chạy verification hiện có.
9. Báo cáo trạng thái trước khi sửa code.
10. Tiếp tục task trong mục Next task của CURRENT_STATUS.md.

Không phát minh endpoint hoặc enum. OpenAPI và backend hiện tại là
nguồn có thẩm quyền.
```

---

## 20. Current progress

Tiến độ và task tiếp theo được quản lý tại:

```text
docs/CURRENT_STATUS.md
```

Cập nhật file đó sau mỗi task hoàn chỉnh.
