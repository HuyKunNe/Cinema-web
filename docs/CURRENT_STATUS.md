# Cinema Web — Current Status

**Last updated:** 2026-09-23
**Current phase:** F1 — Frontend Foundation
**Status:** In progress

---

## 1. Repository state

Trước khi tiếp tục, lấy thông tin Git hiện tại:

```bash
git branch --show-current
git rev-parse HEAD
git log -1 --oneline
git status --short
```

Không ghi cứng commit hash trong tài liệu nếu chưa chạy các lệnh trên.

---

## 2. Current objective

Xây dựng frontend Vue 3 + TypeScript cho hệ thống Cinema Booking, dựa trên backend Spring Boot microservices hiện có.

Frontend phải hỗ trợ hai khu vực:

- Customer application.
- Administration application.

Luồng customer chính:

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

## 3. Completed

### Project foundation

- Vue 3 project đã được khởi tạo.
- TypeScript được bật.
- Vite được sử dụng làm build tool.
- Vue Router đã được cài đặt.
- Pinia đã được cài đặt.
- ESLint và Prettier đã được cấu hình.
- Project đã được commit vào Git.

### Dependencies

Các thư viện nền tảng đã được lựa chọn:

- Vue Router.
- Pinia.
- TanStack Vue Query.
- Axios.
- PrimeVue.
- PrimeIcons.
- Tailwind CSS.
- VeeValidate.
- Zod.
- VueUse.
- Lucide Vue Next.
- `oidc-client-ts`.
- Vitest.
- Vue Test Utils.
- MSW.
- Orval.
- Playwright.

VeeValidate và Zod phải sử dụng các version tương thích. Baseline đã chọn:

```text
vee-validate@4.15.1
@vee-validate/zod@4.15.1
zod@3.25.76
```

Không nâng Zod lên version 4 khi chưa kiểm tra compatibility.

### UI and documentation

- Bộ mockup cinematic dark đã được tạo.
- Thiết kế đã được chuyển sang Figma.
- Design system cơ bản đã được xác định.
- Các màn hình chính đã có thiết kế:

  - Home.
  - Movie Detail.
  - Seat Selection.
  - Checkout.
  - My Tickets.
  - Admin Dashboard.
  - Customer Mobile.

- UI design specification đã được tạo.
- Cấu trúc thư mục frontend đã được xác định.

---

## 4. Current verification state

Các lệnh verification cần chạy:

```bash
npm run format
npm run lint
npm run type-check
npm run test:unit:run
npm run build
```

Trạng thái verification mới nhất:

| Command                 | Status        |
| ----------------------- | ------------- |
| `npm run format`        | Chưa cập nhật |
| `npm run lint`          | Chưa cập nhật |
| `npm run type-check`    | Chưa cập nhật |
| `npm run test:unit:run` | Chưa cập nhật |
| `npm run build`         | Chưa cập nhật |

Sau khi chạy, thay `Chưa cập nhật` bằng `PASS` hoặc mô tả lỗi thực tế.

Không ghi `PASS` nếu chưa chạy lệnh.

---

## 5. Current blockers

Không có blocker nghiệp vụ đã được xác nhận.

Các điểm cần kiểm tra trước khi triển khai API:

- OpenAPI hiện tại của Gateway và từng service.
- Endpoint tạo booking thực tế.
- Endpoint truy vấn booking status.
- Cách ShowSeats được tạo.
- Enum booking hiện tại.
- Enum payment hiện tại.
- Error response envelope hiện tại.
- OIDC client configuration hiện tại.

Không phát minh endpoint hoặc enum từ UI mockup.

---

## 6. Locked technical decisions

### Frontend stack

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

### State ownership

```text
TanStack Query = server state
Pinia          = client/application state
VeeValidate    = form state
Vue Router     = URL navigation/filter state
```

Không lưu bản sao của query response trong Pinia.

### API boundary

- Frontend gọi Gateway.
- Frontend không gọi trực tiếp từng microservice.
- API client được generate từ OpenAPI bằng Orval.
- Không sửa file trong `src/shared/api/generated`.
- Access token được gắn tại shared HTTP client.
- Correlation ID được giữ cho diagnostics.
- Không retry mù các mutation không idempotent.

### Authentication

```text
Flow:     Authorization Code with PKCE
Library:  oidc-client-ts
Issuer:   http://localhost:8082
JWK Set:  http://localhost:8082/oauth2/jwks
Audience: cinema-api
```

SPA là public client:

- Không có client secret.
- Không dùng password grant.
- Không log token.
- Không coi frontend route guard là lớp bảo mật cuối cùng.

### Booking and Inventory

- UI không gọi trực tiếp endpoint hold/book/release nội bộ.
- Booking Saga điều phối Inventory và Payment.
- Seat availability trên màn hình chỉ là snapshot.
- Backend quyết định việc giữ ghế thành công hay thất bại.
- Countdown lấy từ `holdExpiresAt` của server.
- Client không tự gia hạn hoặc reset thời gian giữ ghế.

---

## 7. Current design scope

### Completed designs

| Screen          | Desktop | Mobile                |
| --------------- | ------- | --------------------- |
| Home            | Có      | Có                    |
| Movie Detail    | Có      | Có                    |
| Seat Selection  | Có      | Có                    |
| Checkout        | Có      | Chưa có frame riêng   |
| My Tickets      | Có      | Có                    |
| Admin Dashboard | Có      | Không áp dụng cho MVP |

### Planned designs

Customer:

- Movie listing.
- Showtime listing.
- Cinema listing.
- Promotions.
- Login.
- OIDC callback.
- Profile.
- Booking Processing.
- Payment Result.
- Session Expired.
- Forbidden.

Admin:

- Movies.
- Cinemas.
- Rooms.
- Seat Layout.
- Showtimes.
- Bookings.
- Payments.
- Users.
- Promotions.
- Settings.

---

## 8. Next task

Task tiếp theo:

> Thiết lập application shell và layouts.

Thứ tự thực hiện:

1. Tạo `CustomerLayout.vue`.
2. Tạo `AdminLayout.vue`.
3. Tạo `AuthLayout.vue`.
4. Tạo `BlankLayout.vue`.
5. Tạo customer header.
6. Tạo mobile bottom navigation.
7. Tạo admin sidebar.
8. Thiết lập route groups.
9. Thêm placeholder pages.
10. Viết test render và navigation cơ bản.

Không tích hợp API thật trong task này.

---

## 9. Definition of done for next task

Task application shell hoàn thành khi:

- Customer routes dùng `CustomerLayout`.
- Admin routes dùng `AdminLayout`.
- Auth routes dùng `AuthLayout`.
- Callback/error routes dùng `BlankLayout`.
- Desktop navigation hiển thị đúng.
- Mobile bottom navigation hiển thị đúng.
- Admin sidebar có active state.
- Route lazy loading hoạt động.
- Unknown route hiển thị Not Found.
- TypeScript không có lỗi.
- ESLint không có lỗi.
- Unit tests liên quan chạy thành công.
- Production build thành công.

Verification:

```bash
npm run format
npm run lint
npm run type-check
npm run test:unit:run
npm run build
```

---

## 10. Handoff instructions

Khi mở một chat mới, yêu cầu AI:

1. Đọc `AGENTS.md`.
2. Đọc `docs/PROJECT_CONTEXT.md` nếu tồn tại.
3. Đọc `docs/CURRENT_STATUS.md`.
4. Đọc `docs/architecture.md`.
5. Đọc `docs/ui-design-spec.md`.
6. Kiểm tra Git status và commit history.
7. Kiểm tra source hiện tại.
8. Chạy verification trước khi thay đổi code.
9. Tiếp tục task trong mục `Next task`.

Sau mỗi task:

- Cập nhật mục `Completed`.
- Cập nhật verification result.
- Cập nhật blocker.
- Ghi task tiếp theo nhỏ nhất.
- Cập nhật ngày.
- Commit tài liệu cùng code liên quan.
