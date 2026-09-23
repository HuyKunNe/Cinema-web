# Cinema Web UI Design Specification

**Phiên bản:** 1.0  
**Cập nhật:** 2026-09-23  
**Trạng thái:** Handoff cho triển khai frontend  
**Figma:** [Cinema Web UI](https://www.figma.com/design/u8UwhKxDdk5qvK4WezjJnQ)

---

## 1. Mục tiêu tài liệu

Tài liệu này là đặc tả thiết kế cho `cinema-web`, frontend Vue 3 của hệ thống đặt vé xem phim. Tài liệu dùng để:

- Đồng bộ giữa thiết kế, frontend, backend và QA.
- Chuyển mockup/Figma thành component và page có thể triển khai.
- Xác định rõ các trạng thái loading, empty, error, unauthorized và bất đồng bộ.
- Bảo vệ các quy tắc nghiệp vụ của Booking Saga, Payment và Inventory trong UI.
- Làm checklist review responsive, accessibility và acceptance testing.

Thứ tự ưu tiên khi có mâu thuẫn:

1. Backend code và test hiện tại.
2. OpenAPI hiện tại.
3. Quy tắc nghiệp vụ đã được chấp thuận.
4. Tài liệu này.
5. Dữ liệu minh họa trong mockup.

Tên phim, ngày giờ, giá, địa chỉ, số ghế và chỉ số dashboard trong mockup chỉ là dữ liệu minh họa; không phải API contract.

---

## 2. Phạm vi thiết kế

### 2.1. Màn hình đã thiết kế

| Nhóm | Màn hình | Desktop | Mobile | Trạng thái |
| --- | --- | --- | --- | --- |
| Customer | Trang chủ / Khám phá phim | Có | Có | Đã thiết kế |
| Customer | Chi tiết phim và lịch chiếu | Có | Có | Đã thiết kế |
| Customer | Chọn ghế | Có | Có | Đã thiết kế |
| Customer | Checkout / Thanh toán | Có | Chưa có frame riêng | Đã thiết kế desktop |
| Customer | Vé của tôi / Chi tiết vé | Có | Có | Đã thiết kế |
| Admin | Dashboard tổng quan | Có | Không áp dụng cho MVP | Đã thiết kế |

### 2.2. Màn hình dự kiến mở rộng

Các màn hình dưới đây thuộc backlog, chưa được coi là thiết kế hoàn tất:

- Customer: danh sách phim, lịch chiếu toàn hệ thống, danh sách rạp, khuyến mãi, đăng nhập OIDC, hồ sơ, booking status riêng, kết quả thanh toán.
- Admin: quản lý phim, rạp/phòng, sơ đồ ghế, suất chiếu, booking, payment, người dùng, khuyến mãi và cấu hình.

### 2.3. Cấu trúc file Figma

Do giới hạn của Figma Starter, nội dung được tổ chức trong ba page:

```text
00 Design System & References
├── Design tokens
├── Typography
├── Core components
├── Seat states
├── Navigation
└── Source mockups

01 Customer Experience
├── Customer Desktop
└── Customer Mobile

02 Admin Dashboard
└── Admin Overview
```

---

## 3. Định hướng trải nghiệm

### 3.1. Phong cách

Thiết kế theo phong cách **cinematic dark**: nền đen than, bề mặt tối có phân lớp, đỏ rượu vang cho hành động chính và vàng ấm cho giá trị nổi bật. Giao diện cần mang cảm giác điện ảnh nhưng vẫn ưu tiên tốc độ đặt vé và khả năng đọc.

### 3.2. Nguyên tắc

1. **Tập trung vào hành động chính:** mỗi màn hình chỉ có một CTA primary nổi bật.
2. **Trạng thái luôn minh bạch:** người dùng phải biết ghế còn trống, đang giữ, đã bán hay đang chọn.
3. **Không giả định xử lý tức thời:** booking và payment có thể xử lý bất đồng bộ.
4. **Thời gian do server quyết định:** countdown dùng `holdExpiresAt`, không tự gia hạn hoặc tạo deadline ở client.
5. **Giảm mất ngữ cảnh:** phim, rạp, suất chiếu, ghế và tổng tiền luôn hiện trong các bước đặt vé.
6. **Mobile là luồng riêng:** dùng bottom navigation, sticky action và vùng chọn ghế hỗ trợ zoom/pan.
7. **Phân quyền rõ:** admin chỉ thấy thao tác phù hợp scope; frontend không thay thế backend authorization.

---

## 4. Design tokens

### 4.1. Màu sắc

| Token đề xuất | Giá trị | Mục đích |
| --- | --- | --- |
| `--color-bg` | `#090A0D` | Nền ứng dụng |
| `--color-surface` | `#15171C` | Card, panel, sidebar |
| `--color-surface-raised` | `#1D2027` | Input, control, trạng thái hover |
| `--color-primary` | `#B91C35` | CTA và selected state |
| `--color-primary-bright` | `#E11D48` | Emphasis, active line, focus accent |
| `--color-accent` | `#F4B942` | Giá, VIP, điểm nhấn premium |
| `--color-text` | `#F5F2ED` | Text chính |
| `--color-text-muted` | `#9CA3AF` | Metadata, helper text |
| `--color-border` | `#343944` | Divider và border |
| `--color-success` | `#22C55E` | Thành công, confirmed, healthy |
| `--color-warning` | `#F59E0B` | Đang xử lý, ghế đang giữ |
| `--color-danger` | `#EF4444` | Lỗi, expired, cancelled |

Quy tắc sử dụng:

- Không dùng đỏ primary cho text dài.
- Vàng accent dùng có chọn lọc cho giá, VIP hoặc điểm nhấn thương hiệu.
- Trạng thái không chỉ truyền đạt bằng màu; luôn đi kèm label, icon hoặc pattern.
- Text trên primary phải đạt tương phản đọc được ở kích thước thực tế.

### 4.2. Typography

Figma editable hiện dùng **Inter** cho toàn bộ UI. Đây là font chuẩn cho triển khai MVP.

| Style | Cỡ tham chiếu | Weight | Sử dụng |
| --- | ---: | ---: | --- |
| Display | 44–54 px | 700 | Hero title desktop |
| H1 | 34–40 px | 700 | Tiêu đề page |
| H2 | 23–28 px | 700 | Tiêu đề section/card |
| H3 | 17–20 px | 600–700 | Card heading |
| Body | 14–16 px | 400 | Nội dung chính |
| Label | 12–14 px | 500–600 | Form, tab, metadata |
| Caption | 11–12 px | 400–500 | Helper text, timestamp |

Poster và artwork có thể chứa typography điện ảnh riêng; không coi chữ nằm trong ảnh là UI text. Nếu bổ sung font display serif cho UI, cần chốt riêng và kiểm tra tiếng Việt trước khi triển khai.

### 4.3. Spacing

Sử dụng thang 4 px:

```text
4, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

- Khoảng cách nội bộ control: 8–16 px.
- Padding card: 20–32 px desktop; 16–20 px mobile.
- Khoảng cách section: 40–64 px desktop; 28–40 px mobile.
- Khoảng cách tối thiểu giữa các vùng chạm mobile: 8 px.

### 4.4. Radius, border và elevation

| Token | Giá trị | Sử dụng |
| --- | --- | --- |
| `--radius-sm` | `6px` | Seat, badge nhỏ |
| `--radius-md` | `10px` | Button, input |
| `--radius-lg` | `14px` | Card, panel |
| `--radius-xl` | `18px` | Frame lớn |
| `--border-default` | `1px solid #343944` | Bề mặt trung tính |

Ưu tiên border và thay đổi màu surface hơn shadow mạnh trên dark UI. Glow đỏ/vàng chỉ dùng cho hero hoặc trạng thái trọng tâm, không dùng cho mọi card.

### 4.5. Breakpoints

| Tên | Kích thước | Hành vi chính |
| --- | --- | --- |
| Mobile | `< 768px` | Bottom navigation, sticky CTA, một cột |
| Tablet | `768–1023px` | Grid linh hoạt, sidebar chuyển drawer |
| Desktop | `1024–1439px` | Header đầy đủ, 12-column grid |
| Large desktop | `>= 1440px` | Giới hạn content width, tăng gutter |

Content container đề xuất: `max-width: 1280px–1320px`, căn giữa, gutter 16–24 px mobile và 32–48 px desktop.

---

## 5. Navigation và information architecture

### 5.1. Customer navigation

Desktop header:

```text
Logo | Phim | Lịch chiếu | Rạp | Khuyến mãi | Tìm kiếm | Đăng nhập/Tài khoản
```

Mobile bottom navigation:

```text
Trang chủ | Lịch chiếu | Vé của tôi | Tài khoản
```

### 5.2. Admin navigation

```text
Tổng quan
Phim
Rạp & phòng
Sơ đồ ghế
Suất chiếu
Đặt vé
Thanh toán
Người dùng
Khuyến mãi
Cấu hình
```

### 5.3. Route map đề xuất

Đường dẫn chính xác phải được chốt trong router khi triển khai; bảng này mô tả cấu trúc UX:

| Route đề xuất | Màn hình | Quyền |
| --- | --- | --- |
| `/` | Trang chủ | Public |
| `/movies` | Danh sách phim | Public |
| `/movies/:movieId` | Chi tiết phim | Public |
| `/showtimes` | Lịch chiếu | Public |
| `/showtimes/:showtimeId/seats` | Chọn ghế | Auth + `booking:create` khi tạo booking |
| `/checkout/:bookingId` | Checkout | Auth + chủ booking |
| `/bookings` | Vé của tôi | Auth + `booking:read` |
| `/bookings/:bookingId` | Chi tiết/trạng thái booking | Auth + chủ booking |
| `/admin` | Dashboard admin | Scope phù hợp |

Không dùng route guard phía frontend như lớp bảo mật duy nhất. Backend vẫn là nguồn phân quyền có thẩm quyền.

---

## 6. Component inventory

### 6.1. Global components

- `AppHeader`
- `MobileBottomNav`
- `AdminSidebar`
- `PageContainer`
- `SectionHeading`
- `PrimaryButton`, `SecondaryButton`, `IconButton`
- `FormField`, `SelectField`, `SearchField`
- `StatusBadge`
- `LoadingSkeleton`
- `EmptyState`
- `ErrorState`
- `ConfirmDialog`
- `ToastRegion`

### 6.2. Domain components

- `MovieCard`, `MoviePoster`, `MovieHero`
- `CinemaSelector`, `DateSelector`, `ShowtimeChip`
- `BookingStepper`
- `SeatMap`, `SeatButton`, `SeatLegend`, `SeatZoomControls`
- `HoldCountdown`
- `BookingSummary`, `PriceBreakdown`
- `PaymentMethodCard`
- `BookingTimeline`, `TicketCard`, `TicketQr`
- `KpiCard`, `RevenueChart`, `BookingStatusChart`
- `ServiceHealthList`, `DataTable`, `QuickActions`

### 6.3. Button states

Mọi button phải có:

```text
default → hover → active → focus-visible → disabled → loading
```

- Loading giữ nguyên chiều rộng để tránh layout shift.
- Disabled cần có lý do gần control khi người dùng không biết điều kiện còn thiếu.
- CTA mutation không được bấm lặp khi request cùng intent đang chạy.

### 6.4. Seat states

| Trạng thái UI | Ý nghĩa | Có thể chọn |
| --- | --- | --- |
| `available` | Có thể chọn theo snapshot hiện tại | Có |
| `vip` | Có thể chọn, giá/loại ghế khác | Có |
| `selected` | Được chọn trong phiên UI hiện tại | Có thể bỏ chọn |
| `sold` / `booked` | Đã bán | Không |
| `held` | Đang được giữ bởi booking khác hoặc không khả dụng | Không |
| `accessible` | Ghế/vị trí hỗ trợ tiếp cận | Theo rule backend |

Seat label phải có accessible name, ví dụ: `Ghế H7, ghế thường, còn trống`. Không đọc chỉ mỗi số ghế.

---

## 7. Đặc tả màn hình Customer

### 7.1. Trang chủ

**Mục tiêu:** giúp người dùng tìm phim hoặc suất chiếu nhanh và đi vào flow đặt vé.

**Cấu trúc:**

1. Global header.
2. Hero phim nổi bật với trailer và CTA đặt vé.
3. Quick booking: phim → rạp → ngày → tìm suất chiếu.
4. Phim đang chiếu.
5. Phim sắp chiếu.
6. Lợi ích hệ thống/rạp.
7. Khuyến mãi nổi bật.
8. Footer.

**Hành vi:**

- CTA hero mở chi tiết phim hoặc lịch chiếu của phim.
- Quick booking chỉ enable tìm kiếm khi dữ liệu tối thiểu hợp lệ.
- Movie card có poster, nhãn độ tuổi/trạng thái, rating nếu backend cung cấp, tên, thể loại và thời lượng.
- Carousel phải có thao tác keyboard và không auto-scroll gây mất kiểm soát.

**Trạng thái cần có:** skeleton hero/card, không có phim, lỗi tải catalog, ảnh poster lỗi.

### 7.2. Chi tiết phim và lịch chiếu

**Mục tiêu:** cung cấp đủ thông tin để chọn ngày, rạp và suất chiếu mà không cần mở nhiều modal.

**Cấu trúc:** poster, tên phim, độ tuổi, thời lượng, thể loại, mô tả, trailer, date selector, danh sách rạp và showtime chips.

**Hành vi:**

- Khi đổi ngày, query suất chiếu theo ngày và phim.
- Showtime đã qua hoặc đóng bán phải disabled và có giải thích.
- Chọn suất chiếu điều hướng đến Seat Selection với `showtimeId` rõ ràng.
- Không suy luận timezone bằng cách cắt chuỗi; format ISO-8601 bằng browser `Intl`.

**Trạng thái cần có:** không có suất chiếu trong ngày, rạp không có suất, lỗi tải, phim không tồn tại.

### 7.3. Chọn ghế

**Mục tiêu:** chọn ghế chính xác, hiểu trạng thái ghế và kiểm tra lại đơn trước checkout.

**Cấu trúc:**

1. Booking stepper.
2. Hướng màn hình và lối đi.
3. Seat map có label hàng/cột.
4. Legend trạng thái.
5. Zoom controls trên desktop; zoom/pan trên mobile.
6. Booking summary: phim, rạp, phòng, giờ, ghế, phí và tổng tiền.
7. Hold countdown và CTA tiếp tục.

**Quy tắc nghiệp vụ:**

- Seat availability khi hiển thị chỉ là snapshot, chưa phải reservation.
- UI không gọi trực tiếp endpoint nội bộ hold/book/release của Inventory.
- Khi submit, backend Booking/Saga quyết định kết quả cuối.
- Nếu xảy ra stale-seat conflict, hiển thị thông báo rõ, refresh ShowSeats và giữ lại các lựa chọn còn hợp lệ nếu có thể.
- Giá hiển thị phải đến từ dữ liệu backend; không tự tính bằng hằng số trong component.

**Countdown:**

- Lấy deadline từ `holdExpiresAt` của server.
- Dùng chênh lệch `holdExpiresAt - current time` để hiển thị.
- Khi bằng 0: khóa CTA, dừng thao tác thanh toán, cập nhật booking và refresh ghế.
- Không reset countdown khi reload nếu server không cấp hold mới.

### 7.4. Checkout và thanh toán

**Mục tiêu:** thu thập thông tin nhận vé, chọn phương thức thanh toán và trình bày đơn hàng rõ ràng.

**Cấu trúc:** thông tin người nhận, phương thức thanh toán, mã khuyến mãi, điều khoản, order summary, countdown và CTA thanh toán.

**Hành vi:**

- Validate form bằng VeeValidate + Zod trước submit; backend validation vẫn là nguồn chính.
- Một user intent dùng một idempotency key xuyên suốt retry an toàn.
- Không tự động retry mutation thanh toán không idempotent.
- Sau phản hồi accepted/processing, điều hướng đến booking status thay vì hiển thị thành công ngay.
- Giữ `bookingId` qua lỗi có thể phục hồi.

**Payment UI states:**

```text
idle → submitting → processing → succeeded
                           └──→ failed
                           └──→ expired/cancelled
```

### 7.5. Vé của tôi

**Mục tiêu:** theo dõi booking, hiểu tiến trình xử lý và sử dụng vé sau khi xác nhận.

**Cấu trúc:** account navigation, filter, booking list, booking detail, status badge, timeline, giá, mã booking, QR và actions.

**Quy tắc:**

- QR chỉ xuất hiện khi booking ở trạng thái được backend xác nhận cho phép vào rạp.
- Với booking non-terminal, polling theo chu kỳ hợp lý; dừng khi terminal hoặc page không active.
- Payment và Booking có thể có trạng thái khác nhau; không gộp thành một boolean `success`.
- Booking thất bại/hết hạn phải có hướng dẫn tiếp theo: chọn ghế lại, thử thanh toán lại nếu hợp lệ hoặc liên hệ hỗ trợ.
- Mã QR là dữ liệu nhạy cảm ở mức vé; không log hoặc đặt trong analytics payload.

---

## 8. Đặc tả Admin Dashboard

### 8.1. Mục tiêu

Cung cấp tổng quan vận hành, điều hướng nhanh đến CRUD nghiệp vụ và quan sát trạng thái hệ thống. Dashboard không phải công cụ gọi endpoint nội bộ của Inventory.

### 8.2. Cấu trúc

1. Sidebar navigation.
2. Topbar tìm kiếm, notification và account menu.
3. Date range selector.
4. KPI: doanh thu, vé bán, tỷ lệ lấp đầy, booking đang xử lý.
5. Biểu đồ doanh thu và lượt đặt vé.
6. Phân bố trạng thái booking.
7. Service health.
8. Suất chiếu sắp tới.
9. Booking gần đây.
10. Quick actions.

### 8.3. Quy tắc

- KPI và biểu đồ phải ghi rõ khoảng thời gian và đơn vị.
- Table hỗ trợ loading, empty, error, pagination và sorting.
- Quick action chỉ hiển thị khi user có scope phù hợp.
- Service health là read-only monitoring.
- Không đưa các thao tác `inventory:write`, hold, book hoặc release nội bộ ra UI.
- Trạng thái màu phải có text label và icon.

---

## 9. Booking Saga và trạng thái UI

### 9.1. Luồng thành công tham chiếu

```text
Booking:   PENDING → RESERVED → CONFIRMED
Payment:   processing → SUCCEEDED
Inventory: AVAILABLE → HELD → BOOKED
```

### 9.2. Nguyên tắc hiển thị

| Trường hợp | UI |
| --- | --- |
| API trả `202 Accepted` | Hiển thị “Đang xử lý”, lưu booking ID, bắt đầu polling |
| Booking non-terminal | Stepper/timeline + nội dung chờ, không hiển thị QR |
| Payment processing | Khóa submit trùng, cho phép rời page an toàn |
| Confirmed | Hiển thị vé và QR |
| Payment failed | Thông báo nguyên nhân an toàn và action phù hợp |
| Booking expired | Khóa thanh toán, refresh ghế, cho phép bắt đầu lại |
| Seat conflict | Nêu ghế không còn khả dụng, reload seat map |
| Mất mạng tạm thời | Giữ booking ID, cho retry truy vấn trạng thái |

Polling phải dừng khi:

- Booking/Payment đạt terminal state.
- Component unmount hoặc tab/page không còn cần cập nhật.
- User logout/session hết hạn.
- Đạt policy timeout và chuyển sang trạng thái “chưa thể xác nhận”, không tự coi là thất bại.

---

## 10. Responsive behavior

### 10.1. Mobile

- Header desktop chuyển thành top app bar tối giản.
- Bottom navigation luôn hiển thị ở các page customer chính.
- Seat map nằm trong viewport pan/zoom; không thu nhỏ ghế đến mức khó chạm.
- Summary và countdown chuyển thành sticky bottom action.
- Checkout xếp một cột; order summary nằm trước CTA final.
- Dialog ưu tiên full-screen sheet khi nội dung dài.
- Target chạm tối thiểu 44 × 44 px, trừ seat map có cơ chế zoom rõ ràng.

### 10.2. Tablet

- Customer page có thể dùng grid 8 cột.
- Booking summary chuyển xuống dưới seat map nếu chiều ngang không đủ.
- Admin sidebar chuyển thành collapsible rail hoặc drawer.

### 10.3. Desktop

- Customer page dùng grid 12 cột.
- Seat map và booking summary hiển thị song song.
- Admin ưu tiên mật độ thông tin nhưng không giảm body text dưới 12 px.

---

## 11. Accessibility

Mức mục tiêu: WCAG 2.2 AA cho luồng customer chính.

Checklist:

- Tất cả chức năng dùng được bằng keyboard.
- Focus order theo thứ tự trực quan; có `focus-visible` rõ.
- Skip link đến nội dung chính.
- Header, nav, main, aside và footer dùng semantic landmarks.
- Form field có label thật, error liên kết bằng `aria-describedby`.
- Error summary đưa focus đến lỗi đầu tiên khi submit thất bại.
- Seat map hỗ trợ keyboard navigation theo hàng/cột và accessible name đầy đủ.
- Countdown không announce mỗi giây; chỉ announce ở các mốc quan trọng.
- Processing status dùng vùng thông báo phù hợp, tránh lặp liên tục.
- Poster có alt mô tả ngắn; artwork trang trí dùng alt rỗng.
- Chart admin có bảng/số liệu hoặc textual summary tương đương.
- Không dùng màu làm tín hiệu duy nhất.
- Tôn trọng `prefers-reduced-motion`.

---

## 12. Loading, empty, error và session states

Mọi page lấy dữ liệu phải có đủ:

| State | Yêu cầu |
| --- | --- |
| Initial loading | Skeleton gần với layout thật; tránh spinner toàn page nếu có thể |
| Background refresh | Giữ dữ liệu cũ, hiển thị indicator nhẹ |
| Empty | Giải thích vì sao trống và CTA phù hợp |
| Recoverable error | Thông báo ngắn, retry query và giữ ngữ cảnh |
| Validation error | Hiển thị tại field và summary nếu cần |
| Unauthorized `401` | Khởi động lại login/session flow an toàn |
| Forbidden `403` | Trang không đủ quyền, không chỉ redirect im lặng |
| Not found `404` | Nội dung không tồn tại hoặc không còn khả dụng |
| Conflict `409` | Giải thích xung đột và refresh dữ liệu |
| Server error `5xx` | Correlation ID cho support, không lộ stack trace |

---

## 13. Data và API boundaries

- Frontend gọi Gateway tại runtime, không gọi trực tiếp từng service.
- OIDC dùng Authorization Code + PKCE qua `oidc-client-ts`.
- SPA không chứa client secret, không dùng password grant và không log token.
- TanStack Query quản lý server state; Pinia chỉ quản lý client/application state.
- Client và types sinh từ OpenAPI bằng Orval; không sửa file generated.
- Axios shared boundary gắn access token và correlation ID.
- Không retry mù mutation booking, cancellation hoặc payment.
- Timestamp giữ dạng ISO-8601 UTC trong transport; chỉ format tại presentation layer.
- Không phát minh enum hoặc state transition từ mockup.

---

## 14. Mapping sang Vue 3

### 14.1. Cấu trúc module

```text
src/
├── app/
├── modules/
│   ├── auth/
│   ├── movies/
│   ├── showtimes/
│   ├── seats/
│   ├── bookings/
│   ├── payments/
│   └── admin/
└── shared/
    ├── api/
    │   └── generated/
    ├── components/
    ├── composables/
    └── utils/
```

Dependency direction:

```text
app → modules → shared
```

### 14.2. Phân chia state

| Dữ liệu | Công cụ |
| --- | --- |
| Movie, showtime, seat snapshot, booking, payment | TanStack Query |
| User preference, temporary UI selection, drawer state | Pinia hoặc local state |
| Form state | VeeValidate |
| URL filter/date/page | Vue Router query params |
| Hold deadline | Server field trong booking/query state |

Không copy toàn bộ query result vào Pinia.

### 14.3. Component conventions

- Sử dụng `<script setup lang="ts">` và Composition API.
- Component page chỉ orchestration; logic dùng composable/domain service.
- Status mapping tập trung ở một domain utility, không rải string magic trong template.
- Monetary values format bằng `Intl.NumberFormat`.
- Date/time format bằng `Intl.DateTimeFormat` với timezone được quyết định rõ.

---

## 15. Analytics và privacy

Có thể theo dõi các event UX không nhạy cảm:

```text
home_movie_opened
showtime_selected
seat_selection_started
booking_submitted
booking_processing_viewed
payment_method_selected
booking_confirmed_viewed
```

Không gửi vào analytics:

- Access/refresh token.
- QR ticket payload.
- Dữ liệu payment nhạy cảm.
- Full email, số điện thoại hoặc thông tin cá nhân không cần thiết.
- Stack trace/backend response chứa dữ liệu nội bộ.

---

## 16. QA acceptance checklist

### Visual

- Màu, spacing, radius và typography dùng token thống nhất.
- Không có text bị cắt ở tiếng Việt hoặc zoom 200%.
- Layout ổn ở mobile, tablet, desktop và large desktop.
- Sticky CTA không che nội dung hoặc bottom navigation.

### Functional

- Chọn ngày/rạp/suất chiếu đúng query state.
- Seat disabled không thể chọn bằng pointer hoặc keyboard.
- Stale-seat conflict refresh seat map đúng cách.
- Countdown lấy từ server và hết hạn đúng hành vi.
- Booking `202` đi đến trạng thái processing.
- Polling dừng ở terminal states.
- QR không xuất hiện trước confirmed.
- Mutation không bị submit trùng.
- Logout/session expiry không làm mất an toàn dữ liệu.

### Accessibility

- Keyboard-only hoàn tất được luồng chính.
- Focus visible ở mọi interactive control.
- Screen reader đọc đúng seat label và booking status.
- Tương phản màu đạt yêu cầu.
- Reduced motion được tôn trọng.

### Verification kỹ thuật

```text
npm run format
npm run lint
npm run type-check
npm run test:unit:run
npm run build
npx playwright test
```

---

## 17. Handoff và nguồn tham chiếu

### Figma

[Mở Cinema Web UI trong Figma](https://www.figma.com/design/u8UwhKxDdk5qvK4WezjJnQ)

### Mockup nguồn

```text
ui-mockups/01-home-desktop.png
ui-mockups/02-movie-detail-desktop.png
ui-mockups/03-seat-selection-desktop.png
ui-mockups/04-checkout-desktop.png
ui-mockups/05-my-tickets-desktop.png
ui-mockups/06-admin-dashboard-desktop.png
ui-mockups/07-customer-mobile-board.png
```

Các ảnh mockup là visual reference. Layer Figma editable và tài liệu này quyết định cấu trúc component; OpenAPI/backend quyết định dữ liệu và nghiệp vụ.

---

## 18. Backlog thiết kế ưu tiên

1. Booking Processing / Result page riêng.
2. Login, OIDC callback, session expired và forbidden states.
3. Checkout mobile.
4. Movie listing/filter/search.
5. Cinema và all-showtimes browsing.
6. Admin Movies và Movie Editor.
7. Admin Cinemas/Rooms và Seat Layout Editor.
8. Admin Showtimes.
9. Admin Bookings/Payments.
10. Admin Users, Promotions và Settings.

Mỗi màn hình mới phải bổ sung:

- Desktop/mobile behavior.
- Loading/empty/error/permission states.
- Component reuse mapping.
- API/OpenAPI dependency.
- Accessibility notes.
- Acceptance criteria.

---

## 19. Changelog

### 1.0 — 2026-09-23

- Chuẩn hóa design tokens và component inventory.
- Đặc tả sáu màn hình customer/admin hiện có và mobile behavior.
- Thêm Booking Saga, payment, countdown và seat-state rules.
- Thêm accessibility, error states, Vue mapping và QA checklist.
- Tách rõ màn hình đã thiết kế và backlog mở rộng.
