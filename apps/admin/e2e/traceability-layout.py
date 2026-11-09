import re
import os
TEST_BASE = os.environ.get("DEEPTRACE_BASE_URL", "http://127.0.0.1:5173")
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

routes=[("/", "Tổng quan"),("/products","Sản phẩm"),("/categories","Danh mục"),("/materials","Nguyên liệu"),("/lots","Lô sản xuất"),("/lots/LOT-RICE","TP-GAO-001"),("/trace-events","Nhật ký truy xuất"),("/partners","Đối tác chuỗi cung ứng"),("/locations","Cơ sở & địa điểm"),("/quality","Kiểm định chất lượng"),("/shipments","Giao nhận & bàn giao"),("/inventory","Tồn kho theo lô"),("/incidents","Sự cố nguồn gốc"),("/traceability/lookup","Tra cứu nguồn gốc"),("/employees","Nhân viên"),("/company","Doanh nghiệp"),("/settings","Cài đặt")]
forms=[("/lots","Tạo lô sản xuất"),("/materials","Tạo lô nguyên liệu"),("/partners","Thêm đối tác"),("/locations","Thêm địa điểm"),("/trace-events","Ghi nhận sự kiện"),("/quality","Ghi nhận kiểm định"),("/shipments","Tạo phiếu giao nhận"),("/incidents","Ghi nhận sự cố")]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page()
    errors=[]
    page.on("pageerror",lambda error:errors.append(str(error)))
    page.on("console",lambda msg:errors.append(msg.text) if msg.type=="error" else None)
    for width in [320,375,390,768,1024,1280,1440,1920]:
        page.set_viewport_size({"width":width,"height":1000})
        for route,title in routes:
            page.goto(TEST_BASE+route,wait_until="networkidle")
            expect(page.get_by_role("heading",name=title,exact=True)).to_be_visible()
            page.wait_for_function("document.documentElement.scrollWidth<=innerWidth",timeout=5000)
            assert page.locator("main").count()==1
        print("PASS trace layouts viewport",width,flush=True)
    page.set_viewport_size({"width":320,"height":480})
    for route,label in forms:
        page.goto(TEST_BASE+route,wait_until="networkidle")
        trigger=page.get_by_role("button",name=label,exact=True)
        trigger.click()
        dialog=page.locator('[data-slot="dialog-content"]')
        expect(dialog).to_be_visible()
        box=dialog.bounding_box()
        assert box["x"]>=0 and box["y"]>=0 and box["x"]+box["width"]<=321 and box["y"]+box["height"]<=481,(route,box)
        submit=dialog.get_by_role("button",name="Lưu thông tin",exact=True)
        submit.scroll_into_view_if_needed()
        submit.click()
        assert dialog.get_by_role("alert").count()>0
        for select in dialog.get_by_role("combobox").all()[:1]:
            select.click()
            popup=page.locator('[data-slot="select-content"][data-open]')
            expect(popup).to_be_visible()
            box=popup.bounding_box()
            assert box["x"]>=0 and box["y"]>=0 and box["x"]+box["width"]<=321 and box["y"]+box["height"]<=481,(route,box)
            page.keyboard.press("Escape")
            expect(dialog).to_be_visible()
        calendars = dialog.get_by_role("button", name=re.compile("^Chọn ngày:"))
        if calendars.count():
            calendar_trigger=calendars.first
            calendar_trigger.scroll_into_view_if_needed();calendar_trigger.click()
            popup=page.locator('[data-slot="popover-content"][data-open]')
            expect(popup).to_be_visible()
            expect(popup.get_by_role("button",name="Tháng sau",exact=True)).to_be_visible()
            box=popup.bounding_box()
            assert box["x"]>=0 and box["y"]>=0 and box["x"]+box["width"]<=321 and box["y"]+box["height"]<=481,(route,box)
            page.keyboard.press("Escape");expect(popup).not_to_be_visible();expect(page.locator('[data-slot="popover-content"]')).to_have_count(0);expect(dialog).to_be_visible()
            expect(calendar_trigger).to_be_focused()
        page.keyboard.press("Escape");expect(dialog).not_to_be_visible()
        expect(trigger).to_be_focused()
    page.set_viewport_size({"width":1440,"height":1000})
    page.goto(TEST_BASE + '/lots',wait_until="networkidle")
    page.keyboard.press("Tab");expect(page.get_by_role("link",name="Bỏ qua menu, đến nội dung")).to_be_focused()
    page.keyboard.press("Enter");expect(page.locator("#main-content")).to_be_focused()
    toggle=page.get_by_role("button",name="Mở hoặc đóng menu",exact=True)
    toggle.click();expect(page.locator('[data-slot="sidebar"][data-state]')).to_have_attribute("data-state","collapsed")
    toggle.click()
    page.set_viewport_size({"width":375,"height":812})
    toggle.click();page.get_by_role("link",name="Tra cứu nguồn gốc",exact=True).click()
    expect(page.get_by_role("heading",name="Tra cứu nguồn gốc",exact=True)).to_be_visible()
    expect(page.get_by_role("dialog")).not_to_be_visible()
    Path("apps/admin/e2e/screenshots").mkdir(exist_ok=True)
    page.screenshot(path="apps/admin/e2e/screenshots/traceability-mobile.png",full_page=True)
    assert not errors,errors
    print("PASS: 17 routes x 8 viewports; 8 form validations/short-screen dialogs/selects/Vietnamese calendars/Escape/focus; skip link/sidebar/mobile; errors=0")
    browser.close()
