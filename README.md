# DeepTrace Frontend

Monorepo dùng pnpm, Turborepo, React, TypeScript và Vite. Admin dùng Tailwind CSS v4 và shared package `@workspace/ui` cho shadcn/ui components.

## Yêu cầu

- Node.js 24.x (tối thiểu `22.13.0`).
- pnpm `11.25.0`, được ghim bằng trường `packageManager` trong root `package.json`.

## Cài dependencies

```powershell
pnpm install
```

## Chạy ứng dụng

Từ thư mục gốc:

```powershell
pnpm dev
```

Lệnh trên dùng Turborepo để chạy cả hai app song song. Admin dùng `http://127.0.0.1:5173`; Landing Page dùng `http://127.0.0.1:5174`. Cả hai Vite server dùng `--strictPort`, nên sẽ báo lỗi nếu cổng tương ứng đang bận.

Chạy riêng từng app:

```powershell
pnpm dev:admin
pnpm dev:landing
```

`pnpm dev:landing-page` vẫn được giữ làm alias tương thích.

## Build và kiểm tra kiểu

```powershell
pnpm build
pnpm typecheck
```

ESLint được cấu hình riêng cho Admin: `pnpm --filter ./apps/admin lint`.

## Thêm shadcn/ui component

Khi gọi CLI từ root, chỉ định workspace có `components.json`. Để thêm component qua cấu hình Admin (CLI sẽ dùng aliases tới shared UI package):

```powershell
pnpm dlx shadcn@latest add badge -c apps/admin
```

Để thao tác trực tiếp trong shared UI package:

```powershell
pnpm dlx shadcn@latest add badge -c packages/ui
```

Admin import shared component từ `@workspace/ui/components/<component>`. Landing Page chưa có `components.json`; cần cấu hình workspace đó trước khi chạy shadcn CLI với `-c apps/landing-page`.

Chi tiết ranh giới kiến trúc và sở hữu thư mục nằm trong `docs/ARCHITECTURE.md` và `docs/OWNERSHIP.md`.

## DeepTrace Traceability Frontend

Admin tập trung Product → Material → Lot → Events → Quality → Handover → Lookup. Có truy ngược/truy xuôi nhiều cấp, tồn theo lô/địa điểm và sự cố ảnh hưởng. Dữ liệu tự khai báo lưu trong trình duyệt, chưa được xác thực độc lập; không có backend, QR, blockchain hoặc đăng nhập thật.

Các trang hiện tại và quy tắc: [kiến trúc truy xuất](docs/TRACEABILITY_ARCHITECTURE.md). Tài liệu bàn giao: [hướng dẫn intern](docs/TRACEABILITY_INTERN_GUIDE.md). Kết quả cuối: [báo cáo hoàn thiện](docs/TRACEABILITY_COMPLETION.md). Các báo cáo PROJECT_REPORT/PROJECT_COMPLETION/FULL_DASHBOARD cũ là lịch sử, không mô tả phạm vi hiện tại.

### Dữ liệu và tương thích

- Catalog Product/Category: `deeptrace.admin.catalog.v2`, giữ ID cũ.
- Trace: `deeptrace.admin.traceability.v1`; snapshot sai được cảnh báo và backup trước khi thay bằng mutation hợp lệ.
- Company/Employees: `deeptrace.admin.trace-organization.v1`, lấy dữ liệu hợp lệ từ organization v1 khi chưa có key mới; không ghi đè organization legacy.
- Preferences: `deeptrace.admin.preferences.v1`, số dòng 3/5/10/20.
- SalesOps cũ không được suy diễn thành sự kiện sản xuất. Xem [audit/migration](docs/TRACEABILITY_AUDIT.md).

Orders/Stores/Support redirect sang Shipments/Locations/Incidents. Promotions/Discounts/Reviews không còn trong app. Source/E2E SalesOps đã được xóa sau khi xác nhận không còn caller trong app. Xem [báo cáo dọn dẹp](docs/CLEANUP_REPORT.md). Không còn nút reset demo trong UI.

### Kiểm tra kỹ thuật

```powershell
Set-Location E:\Intern\DeepPro\fe-deeptrace-demo
pnpm typecheck
pnpm --filter @deeptrace/admin lint
pnpm --filter @deeptrace/admin test
pnpm build
```

### Kiểm thử trình duyệt

Python và Playwright Chromium phải có sẵn trong môi trường kiểm thử (`python -m pip install playwright`, `python -m playwright install chromium` nếu chưa có). Đây là công cụ QA, không thêm dependency runtime Node.

Mở terminal thứ nhất:

```powershell
pnpm --filter @deeptrace/admin exec vite preview --host 127.0.0.1 --port 5183 --strictPort
```

Terminal thứ hai:

```powershell
$env:DEEPTRACE_BASE_URL = 'http://127.0.0.1:5183'
python -X utf8 apps/admin/e2e/dashboard.py
python -X utf8 apps/admin/e2e/traceability.py
python -X utf8 apps/admin/e2e/traceability-organization.py
python -X utf8 apps/admin/e2e/traceability-layout.py
python -X utf8 apps/admin/e2e/branding.py
python -X utf8 apps/admin/e2e/sidebar-layout.py
```

Mặc định scripts dùng cổng 5173 nếu không đặt DEEPTRACE_BASE_URL. Mỗi script dùng browser context riêng, không đụng dữ liệu browser cá nhân. Dừng preview/dev do bạn mở bằng Ctrl+C. Layout suite kiểm tra 17 route ở 8 kích thước, dialog ở 320×480, focus/Escape/keyboard/mobile Sidebar.

### Kiểm tra form và popup

Sau khi chạy production preview hoặc dev server, dùng các browser context riêng:

```powershell
python -X utf8 apps/admin/e2e/forms-popups.py
python -X utf8 apps/admin/e2e/popup-long-content.py
```

`forms-popups.py` kiểm tra thêm/sửa/chi tiết/xác nhận ở desktop, tablet, mobile và 320×480; kiểm tra chiều cao control/nút, vùng cuộn, Select/Calendar, Escape/focus. `popup-long-content.py` kiểm tra chuỗi dài trong chi tiết/xác nhận và nút Đóng. Các script hỗ trợ `DEEPTRACE_BASE_URL` như suite khác.
