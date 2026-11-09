import os
TEST_BASE = os.environ.get("DEEPTRACE_BASE_URL", "http://127.0.0.1:5173")
from playwright.sync_api import sync_playwright, expect
from pathlib import Path

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.goto(TEST_BASE+"/", wait_until="networkidle")
    expect(page).to_have_title("DeepTrace Admin | DeepPro")
    header = page.locator('[data-slot="sidebar-header"]')
    logo = header.locator('img[src$="logo-dark.png"]')
    expect(logo).to_be_visible()
    assert logo.evaluate("img => img.complete && img.naturalWidth > 0")
    page.get_by_role("button", name="Mở hoặc đóng menu", exact=True).click()
    symbol = header.locator('img[src$="symbol-dark.png"]')
    expect(symbol).to_be_visible()
    expect(logo).not_to_be_visible()
    assert symbol.evaluate("img => img.complete && img.naturalWidth > 0")
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    for scheme, asset in [("light", "deeppro-symbol-light.png"), ("dark", "deeppro-symbol-dark.png")]:
        assert page.request.get(TEST_BASE+"/brand/" + asset).status == 200
    page.get_by_role("button", name="Mở hoặc đóng menu", exact=True).click()
    page.locator("html").evaluate("el => el.classList.add('dark')")
    expect(header.locator('img[src$="logo-dark.png"]')).to_be_visible()
    page.locator("html").evaluate("el => el.classList.remove('dark')")
    Path("apps/admin/e2e/screenshots").mkdir(exist_ok=True)
    page.screenshot(path="apps/admin/e2e/screenshots/branding-desktop.png")
    page.set_viewport_size({"width":375,"height":812})
    page.get_by_role("button", name="Mở hoặc đóng menu", exact=True).click()
    expect(page.get_by_role("dialog").locator('img[src$="logo-dark.png"]')).to_be_visible()
    page.get_by_role("link", name="DeepPro — Tổng quan DeepTrace", exact=True).click()
    expect(page.get_by_role("dialog")).not_to_be_visible()
    print("PASS: official logo loaded, collapsed symbol, dark variant, favicon HTTP, mobile brand navigation")
    browser.close()
