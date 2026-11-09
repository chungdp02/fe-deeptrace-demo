import { expect, test } from "@playwright/test";

test("home presents the solution and stays usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: /Minh bạch nguồn gốc.*Vững niềm tin/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Thông tin rõ ràng tạo nên sự tin cậy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Một nền tảng, nhiều ngành hàng" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Trao đổi cùng DeepTrace" })).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Tìm hiểu giải pháp" })).toHaveAttribute("href", "/about");
  const heroImage = page.getByRole("img", { name: "Sản phẩm kết nối với các mốc dữ liệu trong chuỗi cung ứng" });
  await expect.poll(() => heroImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".home-hero-visual")).toHaveCSS("animation-name", "none");
});

test("navigation opens separate pages and keeps the active item", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("navigation", { name: "Điều hướng chính" });

  await expect(header.getByRole("link", { name: "Trang chủ" })).toHaveAttribute("aria-current", "page");
  await header.getByRole("link", { name: "Ngành hàng" }).click();
  await expect(page).toHaveURL(/\/industries$/);
  await expect(page.getByRole("heading", { name: "Y tế & Dược phẩm" })).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(4);
  await expect(page.getByRole("img", { name: "Nhân viên kiểm tra thông tin sản phẩm trên máy tính bảng tại cơ sở đóng gói" })).toBeVisible();
  await page.getByText("Tìm hiểu thêm", { exact: true }).first().click();
  await expect(page.getByText("Lô sản xuất và hạn sử dụng")).toBeVisible();
  await expect(page.getByText("DEMO-YT-001")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Một hành trình thông tin rõ ràng cho sản phẩm" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Ngành hàng" })).toHaveAttribute("aria-current", "page");

  await page.getByRole("combobox", { name: "Ngôn ngữ" }).click();
  await page.getByRole("option", { name: "English" }).click();
  await expect(header.getByRole("link", { name: "Industries" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Healthcare & Pharmaceuticals" })).toBeVisible();
  await expect(page.getByText("Production batch and expiry")).toBeVisible();
  await expect(page.getByText("Sample medicine package")).toBeVisible();

  await header.getByRole("link", { name: "Contact" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(header.getByRole("link", { name: "Contact" })).toHaveAttribute("aria-current", "page");
  await page.getByRole("link", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Language" })).toBeVisible();
});

test("public page banners are centered and contact has no brand eyebrow", async ({ page }) => {
  for (const [path, title] of [["/about", "Giới thiệu"], ["/industries", "Ngành hàng"], ["/contact", "Liên hệ"]]) {
    await page.goto(path);
    const banner = page.locator("main > section").first();
    await expect(banner.getByRole("heading", { name: title, level: 1 })).toHaveCSS("text-align", "center");
    if (path === "/contact") await expect(banner.getByText("DeepTrace", { exact: true })).toHaveCount(0);
  }
});

test("about page shows its content and links on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");

  await expect(page.getByRole("heading", { name: "Minh bạch hành trình, nâng tầm giá trị sản phẩm" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ba nền tảng cho thông tin đáng tin cậy" })).toBeVisible();
  const image = page.getByRole("img", { name: "Kiện hàng trên dây chuyền với các lớp dữ liệu truy xuất nguồn gốc" });
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  await expect(page.getByRole("link", { name: "Khám phá ngành hàng" })).toHaveAttribute("href", "/industries");
  await expect(page.getByRole("link", { name: "Liên hệ DeepTrace" })).toHaveAttribute("href", "/contact");
});

test("scroll effects reveal content and respect reduced motion", async ({ page }) => {
  await page.goto("/about");
  const valueCard = page.locator("main [data-reveal]").filter({ hasText: "Định danh rõ ràng" });
  await valueCard.scrollIntoViewIfNeeded();
  await expect(valueCard).toHaveAttribute("data-reveal-state", "visible");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".page-enter")).toHaveCSS("animation-name", "none");
  await expect(page.locator("main [data-reveal-state='pending']")).toHaveCount(0);
});

test("industry images load as they enter the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/industries");

  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
});

test("contact validation and login route", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("link", { name: "Xem trên Google Maps" })).toHaveAttribute("href", /google\.com\/maps\/search\/\?api=1&query=/);
  await expect(page.getByRole("link", { name: "+84 926 422 522" }).first()).toHaveAttribute("href", "tel:+84926422522");
  await page.getByRole("button", { name: "Gửi liên hệ" }).click();
  await expect(page.getByText("Vui lòng nhập ít nhất 2 ký tự.")).toBeVisible();

  await page.getByRole("textbox", { name: "Họ và tên" }).fill("Nguyễn An");
  await page.getByRole("textbox", { name: "Email" }).fill("an@example.com");
  await page.getByRole("textbox", { name: "Số điện thoại" }).fill("123");
  await page.getByRole("textbox", { name: "Nội dung" }).fill("Tôi muốn tìm hiểu thêm về DeepTrace.");
  await page.getByRole("button", { name: "Gửi liên hệ" }).click();
  await expect(page.getByText("Vui lòng nhập số điện thoại hợp lệ.")).toBeVisible();
  await page.getByRole("textbox", { name: "Số điện thoại" }).fill("0926422522");
  await page.getByRole("button", { name: "Gửi liên hệ" }).click();
  await expect(page.getByRole("status")).toContainText("chưa được kết nối");

  await page.getByRole("link", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Chào mừng trở lại" })).toBeVisible();
  await page.getByRole("button", { name: "Hiện mật khẩu" }).click();
  await expect(page.getByRole("button", { name: "Ẩn mật khẩu" })).toBeVisible();
});

test("login keeps the form visible when the window narrows", async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 900 });
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Chào mừng trở lại" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  await expect(page.locator("main > section").last().getByRole("link", { name: "DeepTrace - Trang chủ" })).toBeVisible();
  await expect(page.getByText("Nền tảng DeepTrace")).toBeHidden();

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByText("Nền tảng DeepTrace")).toBeVisible();
});

test("mobile language menu uses the same selection", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở menu" }).click();

  const menu = page.getByRole("dialog");
  await menu.getByRole("combobox", { name: "Ngôn ngữ" }).click();
  await page.getByRole("option", { name: "English" }).click();
  await expect(menu.getByRole("link", { name: "About" })).toBeVisible();
  await expect(page.locator("main h1")).toContainText("Stronger trust.");
  await menu.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("header").getByRole("button", { name: "Open menu" })).toBeVisible();
});

test("footer contact and back-to-top button", async ({ page }) => {
  await page.goto("/");

  const footer = page.locator("footer");
  await expect(footer.getByRole("link", { name: "+84 926 422 522" })).toHaveAttribute("href", "tel:+84926422522");
  await expect(page.getByText("Dữ liệu mẫu")).toHaveCount(0);

  const backToTop = page.getByRole("button", { name: "Về đầu trang" });
  await expect(backToTop).toHaveCount(0);
  await page.evaluate(() => {
    document.body.style.minHeight = "2000px";
    window.scrollTo({ top: 1000, behavior: "instant" });
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(320);
  await expect(backToTop).toBeVisible();

  await backToTop.click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(20);
});
