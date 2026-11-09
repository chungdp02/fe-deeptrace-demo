import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
BASE = os.environ.get("DEEPTRACE_BASE_URL", "http://127.0.0.1:5173")
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.goto(BASE, wait_until="networkidle")
    Path("apps/admin/e2e/screenshots").mkdir(exist_ok=True)
    for width in [320,375,390,768,1024,1280,1440,1920]:
        page.set_viewport_size({"width":width,"height":1000})
        expect(page.get_by_role("heading",name="Tổng quan",exact=True)).to_be_visible()
        page.wait_for_function("document.documentElement.scrollWidth <= innerWidth")
        expect(page.locator('[data-chart]')).to_have_count(3)
        if width == 1440:
            page.screenshot(path="apps/admin/e2e/screenshots/overview-refined-desktop.png",full_page=True)
        if width == 375:
            page.screenshot(path="apps/admin/e2e/screenshots/overview-refined-mobile.png",full_page=True)
    page.get_by_role("button",name="14 ngày",exact=True).click()
    expect(page.get_by_role("button",name="14 ngày",exact=True)).to_have_attribute("aria-pressed","true")
    expect(page.get_by_text("sự kiện ghi nhận trong 14 ngày",exact=False)).to_be_visible()
    page.get_by_role("link",name="Quản lý kiểm định",exact=True).click()
    expect(page.get_by_role("heading",name="Kiểm định chất lượng",exact=True)).to_be_visible()
    page.go_back(wait_until="networkidle")
    page.evaluate("""() => {
        const key='deeptrace.admin.traceability.v1';
        const data=JSON.parse(localStorage.getItem(key));
        for (const name of Object.keys(data)) if(Array.isArray(data[name])) data[name]=[];
        localStorage.setItem(key,JSON.stringify(data));
    }""")
    page.reload(wait_until="networkidle")
    expect(page.get_by_text("Chưa có dữ liệu để thống kê.",exact=True)).to_have_count(3)
    expect(page.get_by_text("Không có lô cần xử lý theo cấu hình hiện tại.",exact=True)).to_be_visible()
    assert not errors,errors
    browser.close()
    print("PASS: overview 8 widths, three chart types, 7/14-day range, navigation, empty state; errors=0")
