# Công nghệ thử nghiệm cho landing page

Landing page hiện là bản thử nghiệm. Dữ liệu ngành hàng và phản hồi của form là dữ liệu mẫu; chưa có API thật hoặc dịch vụ xác thực.

| Nhu cầu | Lựa chọn hiện tại | Lý do | Phương án khác |
| --- | --- | --- | --- |
| Gọi dữ liệu | `fetch` | Có sẵn trong trình duyệt, đủ cho một file JSON mẫu | Axios khi cần interceptor và nhiều API |
| Quản lý form | React Hook Form | Quản lý giá trị và lỗi mà không cần state riêng cho từng ô | React controlled inputs cho form nhỏ |
| Kiểm tra dữ liệu | Zod | Kiểm tra cả form và JSON tải về khi chạy | Yup, Valibot hoặc tự kiểm tra |
| Đa ngôn ngữ | i18next + react-i18next | Gom bản dịch Việt/Anh và dùng `useTranslation` | Context tự viết khi chỉ có vài chuỗi tĩnh |
| Unit test | Vitest | Dùng cùng hệ Vite, kiểm tra schema và lỗi request | Jest |
| Kiểm thử trình duyệt | Playwright | Kiểm tra menu, ngôn ngữ, form và route trong Chromium | Cypress |
| Điều hướng trang | React Router | Dự án đã có trang `/login` | TanStack Router nếu cần cách khai báo route khác |
| Giao diện | shadcn/ui | Mã component nằm trong `src/components/ui` và dùng theme thương hiệu | Thư viện UI khác hoặc component tự viết |

## Vị trí ví dụ

- `apps/landing-page/public/data/categories.json`: dữ liệu ngành hàng mẫu.
- `apps/landing-page/src/features/categories`: `fetch`, kiểm tra dữ liệu và thẻ Card.
- `apps/landing-page/src/features/contact`: React Hook Form, Zod và các ô nhập shadcn.
- `apps/landing-page/src/i18n`: bản dịch Việt/Anh.
- `apps/landing-page/src/components/layout/language-select.tsx`: ô chọn ngôn ngữ bằng shadcn Select, dùng lại ở header, menu điện thoại và trang đăng nhập. Có thể dùng DropdownMenu nếu sau này menu ngôn ngữ cần thêm hành động hoặc mô tả.
- `apps/landing-page/src/app/App.tsx`: các route React Router và bố cục dùng chung cho các trang công khai.
- `apps/landing-page/src/pages/home/page.tsx`: trang chủ với phần giới thiệu chính.
- `apps/landing-page/src/pages/about/page.tsx`: trang Giới thiệu tại `/about`.
- `apps/landing-page/src/pages/industries/page.tsx`: trang Ngành hàng tại `/industries`.
- `apps/landing-page/src/pages/contact/page.tsx`: trang Liên hệ tại `/contact`.
- `apps/landing-page/src/components/layout/site-header.tsx`: menu dùng `Link` và đánh dấu trang hiện tại theo URL.
- `apps/landing-page/src/components/layout/scroll-reveal.tsx`: dùng `IntersectionObserver` để đánh dấu các khối `data-reveal` khi chúng vào vùng nhìn thấy; bỏ qua hiệu ứng nếu hệ điều hành yêu cầu giảm chuyển động.
- `apps/landing-page/src/index.css`: chứa hiệu ứng mở trang và chuyển động xuất hiện khi cuộn. CSS chỉ làm mờ và dịch nhẹ nội dung, không đổi vị trí bố cục; `prefers-reduced-motion` tắt các hiệu ứng này.

## Trang chủ

- `src/pages/home/page.tsx` gồm slogan và hai nút hành động, ba giá trị cốt lõi bằng shadcn Card, phần giải thích hành trình sản phẩm, ba ngành hàng và lời mời liên hệ. Các nút dẫn đến `/about`, `/industries` hoặc `/contact`.
- `src/assets/images/home/deeptrace-hero.jpg` là ảnh AI tạo riêng cho khu vực mở đầu. Ảnh này và các ảnh ngành hàng chỉ phục vụ thiết kế, không thể hiện dữ liệu hay dự án triển khai thực tế.
- Nội dung Việt/Anh ở khóa `home` trong `src/i18n/index.ts`; các ý về hộ chiếu số và truy xuất nhiều tầng tham khảo website chính thức của DeepTrace và DeepPro. Phần hero có chuyển động nhẹ trong `src/index.css` và tắt theo `prefers-reduced-motion`.
- `apps/landing-page/src/features/**/*.test.ts`: bài kiểm tra Vitest.
- `apps/landing-page/e2e`: bài kiểm tra Playwright.

## Trang Ngành hàng

- `public/data/categories.json` chứa ba kịch bản ngành hàng minh họa với tiêu đề, mô tả, ý chi tiết và hồ sơ sản phẩm có mã lô `DEMO-*` bằng tiếng Việt/Anh. Nội dung chưa được xác nhận là dự án DeepTrace đã triển khai; cần đối chiếu lại khi có yêu cầu chức năng chính thức.
- `src/features/categories/categories-api.ts` dùng `fetch` để tải JSON; `categories-schema.ts` dùng Zod kiểm tra dữ liệu trước khi hiển thị.
- `src/features/categories/categories-list.tsx` ghép từng `id` ngành hàng với ảnh trong `src/assets/images/industries`, dựng thẻ shadcn Card và phần mở rộng “Tìm hiểu thêm”. Ảnh chỉ là minh họa được tạo cho dự án.
- `src/pages/industries/page.tsx` dựng tiêu đề, danh sách thẻ, ảnh quy trình cạnh ba bước truy xuất và nút dẫn tới trang Liên hệ.
- Màu của khu vực Ngành hàng và banner dùng các mã trong `[DEEPPRO] BRAND GUIDELINE.pdf`: `#005aab`, `#0c263d`, `#add8ff`, `#edeff4`, `#d8e0e8`, `#8ea9c1`. Font giữ theo yêu cầu riêng đã áp dụng cho landing page.
- Phần giới thiệu ba ngành hàng và khái niệm hộ chiếu số, truy xuất đa tầng tham khảo [DeepTrace](https://deeptrace.deepprotech.com/) và [DeepProTech](https://deepprotech.com/). Các bản ghi `DEMO-*` trong JSON là dữ liệu giả; cần thay hoặc xác nhận theo tài liệu yêu cầu chức năng khi được cung cấp.

## Trang Giới thiệu

- `src/pages/about/page.tsx` dựng phần giới thiệu DeepTrace bằng ảnh hai cột, ba thẻ shadcn Card trên nền xanh đậm và các nút shadcn Button dẫn tới Ngành hàng, Liên hệ.
- `src/assets/images/about/deeptrace-future.jpg` là ảnh AI được tạo cho giao diện, thể hiện kiện hàng và các lớp dữ liệu truy xuất theo phong cách công nghệ tương lai; đây không phải ảnh triển khai thực tế của DeepTrace.
- Nội dung tiếng Việt/Anh nằm ở khóa `about` trong `src/i18n/index.ts`; ý về hộ chiếu số, truy xuất đa tầng và DeepTrace trong hệ sinh thái DeepPro được đối chiếu từ hai website chính thức nêu trên.

## Trang Liên hệ

- `src/pages/contact/page.tsx` dựng banner, ba thẻ thông tin và khu vực form. Nút bản đồ mở Google Maps tìm kiếm theo địa chỉ hiện có; trang chưa nhúng bản đồ hoặc dùng API key.
- `src/lib/contact-info.ts` giữ số điện thoại dùng chung cho trang Liên hệ và footer. Địa chỉ Việt/Anh vẫn lấy từ `src/i18n/index.ts` qua khóa `footer.address`.
- `src/features/contact/contact-form.tsx` dùng React Hook Form và các ô shadcn. Họ tên, email, nội dung là bắt buộc; doanh nghiệp và số điện thoại là tùy chọn.
- `src/features/contact/contact-schema.ts` dùng Zod kiểm tra dữ liệu, gồm số điện thoại nếu người dùng nhập. Form hiện chỉ hiển thị thông báo thử nghiệm sau khi dữ liệu hợp lệ; chưa gửi request tới backend.

## Footer và nút về đầu trang

- `src/components/layout/site-footer.tsx` dựng bốn cột: thương hiệu, liên kết nhanh, hỗ trợ và liên hệ. Các liên kết mở trang tương ứng; số điện thoại dùng `tel:`. Nội dung Việt/Anh nằm trong `src/i18n/index.ts`.
- `src/components/layout/back-to-top.tsx` lắng nghe sự kiện cuộn, chỉ hiện sau 320 px, rồi dùng shadcn Button cuộn lên đầu trang hiện tại.
- `src/app/App.tsx` đặt header, footer và nút quay lại trong bố cục chung của các route `/`, `/about`, `/industries`, `/contact`; khi đổi route sẽ cuộn lên đầu trang.
- `src/index.css` bật cuộn mượt và tắt hiệu ứng này khi người dùng chọn giảm chuyển động trong hệ điều hành.

## Lệnh chạy từ thư mục gốc

```powershell
pnpm dev:landing
pnpm build:landing
pnpm test:landing
pnpm test:e2e:landing
```

Playwright cần cài trình duyệt một lần trên mỗi máy:

```powershell
pnpm --filter @workspace/landing-page exec playwright install chromium
```

Khi có backend, đổi URL trong `categories-api.ts`, thêm request gửi liên hệ sau khi Zod kiểm tra, rồi nối `/login` với dịch vụ xác thực. Thông báo của form demo hiện không có nghĩa là dữ liệu đã được gửi.
