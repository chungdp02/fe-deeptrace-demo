import os
TEST_BASE = os.environ.get("DEEPTRACE_BASE_URL", "http://127.0.0.1:5173")
from playwright.sync_api import sync_playwright, expect
from pathlib import Path

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width":1440,"height":1000})
    page.goto(TEST_BASE+"/",wait_until="networkidle")
    expect(page.locator(".admin-topbar")).to_have_count(0)
    brand = page.locator(".admin-sidebar-header")
    inner = page.locator('[data-slot="sidebar-inner"]')
    assert brand.evaluate("el=>getComputedStyle(el).backgroundColor") == inner.evaluate("el=>getComputedStyle(el).backgroundColor")
    assert brand.evaluate("el=>getComputedStyle(el).backgroundColor") != page.locator("main").evaluate("el=>getComputedStyle(el).backgroundColor")
    toggle = page.get_by_role("button",name="Mở hoặc đóng menu",exact=True)
    expect(toggle).to_be_visible()
    assert toggle.bounding_box()["y"] < 120
    assert not toggle.inner_text().strip()
    page.screenshot(path="apps/admin/e2e/screenshots/sidebar-expanded.png")
    toggle.click()
    sidebar = page.locator('[data-slot="sidebar"][data-state]')
    expect(sidebar).to_have_attribute("data-state","collapsed")
    page.wait_for_function("document.querySelector('[data-slot=sidebar-container]').getBoundingClientRect().width === 72")
    rail = page.locator('[data-slot="sidebar-container"]').bounding_box()
    for link in page.locator('[data-slot="sidebar-menu-button"]').all():
        link.scroll_into_view_if_needed()
        box = link.bounding_box()
        assert abs((box["x"] + box["width"]/2) - (rail["x"] + rail["width"]/2)) < 1, box
        assert box["width"] == box["height"] == 40, box
    page.locator('[data-slot="sidebar-menu-button"]').first.hover()
    expect(page.locator('[data-slot="tooltip-content"]')).to_contain_text("Tổng quan")
    page.screenshot(path="apps/admin/e2e/screenshots/sidebar-collapsed.png")
    toggle.click()
    expect(sidebar).to_have_attribute("data-state","expanded")
    for width in [320,375,768,1024]:
        page.set_viewport_size({"width":width,"height":812})
        page.wait_for_function("document.documentElement.scrollWidth <= innerWidth")
        if width < 768:
            page.get_by_role("button",name="Mở hoặc đóng menu",exact=True).click()
            page.get_by_role("link",name="Nhật ký truy xuất",exact=True).click()
            expect(page.locator("h1")).to_have_text("Nhật ký truy xuất")
            expect(page.get_by_role("dialog")).not_to_be_visible()
    print("PASS: navy sidebar/no title header/icon-only top toggle, centered 72px icon rail/40px targets, tooltip, top toggle, mobile navigation/overflow")
    browser.close()
