import os
from playwright.sync_api import sync_playwright, expect
BASE=os.environ.get("DEEPTRACE_BASE_URL","http://127.0.0.1:5173")
with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page(viewport={"width":1440,"height":1000})
    errors=[]
    page.on("pageerror",lambda error:errors.append(str(error)))
    page.goto(BASE,wait_until="networkidle")
    for label in ["Tổng sản phẩm","Lô được quản lý","Lô đủ dữ liệu","Lô thiếu thông tin","Lô chờ kiểm định","Lô có vấn đề"]:
        assert page.get_by_text(label,exact=True).evaluate("el => el.closest('a') === null")
    activity=page.get_by_text("Hoạt động truy xuất",exact=True).locator('xpath=ancestor::*[@data-slot="card"]')
    assert activity.locator('.recharts-bar-rectangle').count()>0
    assert activity.locator('.recharts-area').count()==0
    page.get_by_role("button",name="14 ngày",exact=True).click()
    expect(page.get_by_role("button",name="14 ngày",exact=True)).to_have_attribute("aria-pressed","true")
    group=page.get_by_role("button",name="Dữ liệu nguồn gốc",exact=True)
    group.click()
    expect(group).to_have_attribute("aria-expanded","false")
    expect(page.get_by_role("link",name="Sản phẩm",exact=True)).not_to_be_visible()
    group.focus();page.keyboard.press("Enter")
    expect(page.get_by_role("link",name="Sản phẩm",exact=True)).to_be_visible()
    page.keyboard.press("Space")
    page.get_by_role("button",name="Mở hoặc đóng menu",exact=True).click()
    expect(page.get_by_role("link",name="Sản phẩm",exact=True)).to_be_visible()
    page.get_by_role("button",name="Mở hoặc đóng menu",exact=True).click()
    expect(page.get_by_role("link",name="Sản phẩm",exact=True)).not_to_be_visible()
    group.click()
    page.set_viewport_size({"width":375,"height":812})
    page.get_by_role("button",name="Mở hoặc đóng menu",exact=True).click()
    mobile=page.get_by_role("dialog")
    group=mobile.get_by_role("button",name="Theo dõi",exact=True)
    group.click()
    expect(mobile.get_by_role("link",name="Nhật ký truy xuất",exact=True)).not_to_be_visible()
    group.click()
    mobile.get_by_role("link",name="Nhật ký truy xuất",exact=True).click()
    expect(page.get_by_role("heading",name="Nhật ký truy xuất",exact=True)).to_be_visible()
    expect(mobile).not_to_be_visible()
    for width in [320,375,390,768,1024,1280,1440,1920]:
        page.set_viewport_size({"width":width,"height":1000})
        page.goto(BASE,wait_until="networkidle")
        page.wait_for_function("document.documentElement.scrollWidth <= innerWidth")
    assert not errors,errors
    browser.close()
    print("PASS: informational KPIs, activity bars, 7/14 days, two-level groups/mouse/keyboard/icon rail/mobile navigation, 8 widths; errors=0")
