# AGENTS.md

## 1. Purpose

File này định nghĩa các quy tắc bắt buộc khi AI hoặc developer làm việc trong repository `cinema-web`.

Mục tiêu là xây dựng frontend Vue 3 production-oriented cho hệ thống Cinema Booking hiện có.

Không coi project này là một visual mockup độc lập. Mọi implementation phải phù hợp với backend, OpenAPI và luồng Booking Saga thực tế.

---

## 2. Required reading

Trước khi thay đổi code:

1. Đọc file này.
2. Đọc `docs/CURRENT_STATUS.md`.
3. Đọc `docs/architecture.md`.
4. Đọc `docs/ui-design-spec.md`.
5. Đọc `package.json`.
6. Kiểm tra Git status.
7. Kiểm tra các commit gần nhất.
8. Kiểm tra source hiện có.
9. Chạy verification phù hợp.

Commands:

```bash
git status --short
git branch --show-current
git log --oneline -10
npm run type-check
npm run test:unit:run
npm run build
```

Không thay đổi code trước khi hiểu trạng thái hiện tại.

---

## 3. Source-of-truth order

Khi thông tin mâu thuẫn, sử dụng thứ tự:

```text
Current backend code and tests
        ↓
Current OpenAPI documents
        ↓
Accepted backend architecture decisions
        ↓
Current frontend code and tests
        ↓
docs/architecture.md
        ↓
docs/ui-design-spec.md
        ↓
docs/CURRENT_STATUS.md
        ↓
Old notes or chat history
```

Không sử dụng mockup làm API contract.

Không phát minh:

- Endpoint.
- Request payload.
- Response payload.
- Enum.
- Scope.
- Permission.
- State transition.
- Error code.

---

## 4. Technology constraints

Sử dụng stack đã chọn:

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
@lucide/vue
Vitest
Vue Test Utils
MSW
Playwright
ESLint
Prettier
```

Không thêm các công nghệ sau khi chưa có requirement được chấp thuận:

- Nuxt.
- Một state management library khác.
- Một UI component framework khác.
- Socket.IO.
- PWA framework.
- Micro-frontend framework.
- GraphQL client.
- Một HTTP client khác ngoài Axios.

---

## 5. Architecture rules

Dependency direction:

```text
app → modules → shared
```

Rules:

- `app` có thể import `modules` và `shared`.
- `modules` có thể import `shared`.
- `shared` không được import từ `modules`.
- Một module không import trực tiếp internals của module khác.
- Cross-module flow phải đi qua public API, router hoặc orchestration layer.
- Page component chỉ orchestration.
- Business logic đặt trong composable, query/mutation hoặc domain utility.
- Không đặt business logic phức tạp trực tiếp trong template.

---

## 6. Vue conventions

- Sử dụng `<script setup lang="ts">`.
- Sử dụng Composition API.
- Props và emits phải typed.
- Không dùng `any` nếu không có lý do được ghi rõ.
- Không mutate props.
- Không dùng global event bus.
- Không đặt API call trực tiếp trong presentational component.
- Route-level component phải được lazy-load khi phù hợp.
- Shared component không chứa knowledge của một domain cụ thể.

Naming:

```text
Vue component:       PascalCase.vue
Composable:          useSomething.ts
Pinia store:         something.store.ts
Query definitions:   something.queries.ts
Mutation definitions:something.mutations.ts
Types:               something.types.ts
Utility:             kebab-case.ts
Test:                *.spec.ts
```

---

## 7. State management rules

### TanStack Query

Dùng cho:

- Movies.
- Cinemas.
- Rooms.
- Showtimes.
- ShowSeats.
- Bookings.
- Payments.
- Users.
- Server-derived dashboard data.

### Pinia

Dùng cho:

- Authentication presentation state nếu cần.
- User preferences.
- Temporary client-only selection.
- Navigation state.
- Drawer state.
- Theme state.

Không copy query result vào Pinia.

### VeeValidate

Dùng cho form state và client-side validation.

Backend validation vẫn là nguồn có thẩm quyền.

### Router state

Filter có thể bookmark/share phải nằm trong URL:

- Search query.
- Selected date.
- Cinema filter.
- Page number.
- Sort order.

---

## 8. API rules

- Frontend chỉ gọi Gateway.
- Không gọi thẳng Movie, Inventory, Booking hoặc Payment Service.
- Generate API client từ OpenAPI bằng Orval.
- Generated code nằm trong `src/shared/api/generated`.
- Tuyệt đối không sửa generated code bằng tay.
- Custom behavior đặt trong shared HTTP client hoặc wrapper.
- Access token được gắn tại một HTTP boundary duy nhất.
- Correlation ID phải được giữ để hỗ trợ diagnostics.
- Không log token, authorization header hoặc dữ liệu payment nhạy cảm.
- Không retry mù mutation.
- Một user intent phải giữ cùng một idempotency key khi retry an toàn.

Khi backend thay đổi:

1. Cập nhật OpenAPI.
2. Generate lại client.
3. Review diff.
4. Sửa wrapper/query/mutation.
5. Chạy type-check và tests.

---

## 9. Authentication rules

Sử dụng:

```text
Authorization Code with PKCE
oidc-client-ts
```

SPA là public client:

- Không có client secret.
- Không dùng password grant.
- Không lưu token vào log.
- Không đưa token vào URL tùy ý.
- Không coi decoded JWT là authorization cuối cùng.
- Backend vẫn phải kiểm tra permission.

Route guard dùng để cải thiện UX, không thay thế backend security.

Khi session hết hạn:

- Dừng protected queries.
- Không tiếp tục mutation.
- Giữ return URL an toàn.
- Điều hướng qua OIDC flow.
- Không tạo redirect loop.

---

## 10. Booking Saga rules

Booking có thể trả về HTTP `202 Accepted`.

Luồng tham chiếu:

```text
Booking:   PENDING → RESERVED → CONFIRMED
Payment:   PROCESSING → SUCCEEDED
Inventory: AVAILABLE → HELD → BOOKED
```

UI phải:

- Giữ `bookingId`.
- Điều hướng đến booking status khi request được accepted.
- Poll booking khi trạng thái chưa terminal.
- Poll payment khi cần.
- Dừng polling khi terminal.
- Hiển thị trạng thái processing rõ ràng.
- Không hiển thị QR trước khi booking được xác nhận.
- Xử lý cancellation, rejection và expiration.
- Refresh ShowSeats sau seat conflict.
- Giữ lại context qua lỗi có thể phục hồi.

UI không được:

- Gọi trực tiếp hold/book/release của Inventory.
- Tự coi displayed seat availability là reservation.
- Tự chuyển booking thành confirmed.
- Tự kéo dài hold.
- Tự reset countdown.
- Retry booking/payment mutation không kiểm soát.

---

## 11. Time handling rules

Backend timestamp sử dụng ISO-8601 UTC.

Ví dụ:

```text
2026-09-22T06:34:30.916751Z
```

Rules:

- Giữ nguyên transport value.
- Parse tại presentation boundary.
- Format bằng `Intl.DateTimeFormat`.
- Không xóa timezone offset.
- Không sửa `holdExpiresAt`.
- Countdown phải dựa trên server deadline.
- Không dùng thời gian client làm nguồn authoritative.

---

## 12. UI implementation rules

Nguồn thiết kế:

- `docs/ui-design-spec.md`.
- Figma Cinema Web UI.
- Mockup source nếu được lưu trong repository.

Rules:

- Sử dụng design token.
- Không hardcode màu lặp lại trong component.
- Mỗi page phải có loading, empty và error states.
- Interactive control phải có hover, active, focus-visible, disabled và loading states.
- Trạng thái không chỉ truyền đạt bằng màu.
- Mobile không chỉ là desktop bị thu nhỏ.
- Sticky action không được che nội dung.
- Admin action phải phụ thuộc permission.
- Poster hoặc artwork không được dùng thay cho accessible text.

### Design token rules

- Màu sắc phải sử dụng semantic tokens từ
  `src/assets/styles/tokens.css`.
- Không dùng raw hex color trong Vue component.
- Sử dụng các semantic utilities như:

```text
bg-primary
hover:bg-primary-hover
text-secondary
bg-surface
text-content
text-content-muted
border-outline
```

- Khi cần thêm màu mới, cập nhật design tokens trước khi sử dụng trong component.
- Không tạo màu mới trực tiếp bằng arbitrary Tailwind values.

---

## 13. Accessibility rules

Mục tiêu: WCAG 2.2 AA cho customer flow chính.

Yêu cầu:

- Keyboard navigation.
- Focus-visible rõ ràng.
- Semantic landmarks.
- Form label thật.
- Error liên kết với field.
- Seat có accessible name đầy đủ.
- Countdown không announce mỗi giây.
- Chart có textual alternative.
- Không truyền đạt trạng thái chỉ bằng màu.
- Tôn trọng `prefers-reduced-motion`.
- Hỗ trợ zoom trình duyệt 200%.

---

## 14. Testing rules

Sử dụng:

```text
Vitest          → pure logic and composables
Vue Test Utils  → Vue components
MSW             → API integration mocks
Playwright      → end-to-end flows
```

Critical tests:

- OIDC callback.
- Logout.
- Session expiration.
- Permission-aware routing.
- Movie browsing.
- Showtime browsing.
- Seat selection.
- Seat conflict recovery.
- Booking accepted and polling.
- Hold countdown.
- Booking confirmation.
- Booking expiration.
- Payment failure.
- QR visibility.
- Duplicate mutation prevention.

Bug fix phải có regression test nếu có thể tái hiện tự động.

---

## 15. Verification requirements

Trước khi báo task hoàn thành:

```bash
npm run format
npm run lint
npm run type-check
npm run test:unit:run
npm run build
```

Nếu task ảnh hưởng user flow:

```bash
npx playwright test
```

Không tuyên bố verification thành công nếu chưa chạy.

Nếu một command không tồn tại hoặc không chạy được:

- Báo rõ command.
- Báo lỗi thực tế.
- Không thay thế bằng giả định.
- Ghi blocker vào `docs/CURRENT_STATUS.md`.

---

## 16. Git rules

- Kiểm tra `git status` trước khi sửa.
- Không ghi đè thay đổi không liên quan.
- Không dùng `git reset --hard`.
- Không dùng `git checkout --` để xóa thay đổi nếu chưa được yêu cầu.
- Commit chỉ chứa thay đổi liên quan.
- Commit message phải mô tả đúng scope.

Ví dụ:

```text
chore(web): establish application layouts
feat(auth): add OIDC login callback
feat(movies): implement movie catalog page
feat(booking): add seat selection flow
test(booking): cover stale seat conflict
docs(web): update frontend handoff status
```

---

## 17. Documentation rules

Sau mỗi task hoàn chỉnh:

1. Cập nhật `docs/CURRENT_STATUS.md`.
2. Cập nhật completed capabilities.
3. Cập nhật verification results.
4. Cập nhật blockers.
5. Ghi task tiếp theo nhỏ nhất.
6. Cập nhật architecture nếu có quyết định mới.
7. Đồng bộ UI docs nếu behavior thay đổi.

Không để documentation tuyên bố điều chưa được code hoặc test xác nhận.

---

## 18. Definition of done

Một thay đổi chỉ hoàn thành khi:

- Requirement được đáp ứng.
- TypeScript pass.
- ESLint pass.
- Format pass.
- Relevant unit tests pass.
- Applicable E2E tests pass.
- Loading state tồn tại.
- Empty state tồn tại nếu phù hợp.
- Error state tồn tại.
- Unauthorized/forbidden state tồn tại nếu phù hợp.
- Accessibility được kiểm tra.
- OpenAPI-generated code hiện hành.
- Không commit secret/token.
- Documentation được đồng bộ.
- `docs/CURRENT_STATUS.md` được cập nhật.
