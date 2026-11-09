import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
BASE=os.environ.get("DEEPTRACE_BASE_URL","http://127.0.0.1:5173")
with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page()
    errors=[]
    page.on("pageerror",lambda error:errors.append(str(error)))
    routes=["/products","/employees","/lots","/materials","/partners","/locations","/trace-events","/quality","/shipments","/inventory","/incidents"]
    Path('apps/admin/e2e/screenshots').mkdir(exist_ok=True)
    for width in [320,375,768,1024,1280,1440,1920]:
        page.set_viewport_size({"width":width,"height":1000})
        for route in routes:
            page.goto(BASE+route,wait_until="networkidle")
            page.wait_for_function("document.documentElement.scrollWidth <= innerWidth")
            if width==1440:
                for toolbar in page.locator('.admin-filter-toolbar').all():
                    controls=toolbar.locator('[data-slot="input"], [data-slot="select-trigger"], [data-slot="button"]').all()
                    boxes=[control.bounding_box() for control in controls if control.is_visible()]
                    if boxes: assert max(b['y']+b['height'] for b in boxes)-min(b['y']+b['height'] for b in boxes)<2,(route,boxes)
                if route in ['/products','/trace-events']:
                    page.screenshot(path='apps/admin/e2e/screenshots/filter-'+route.strip('/')+'.png',full_page=True)
            for badge in page.locator('.status-badge').all():
                color=badge.evaluate('el=>getComputedStyle(el).backgroundColor')
                assert color not in ['rgba(0, 0, 0, 0)','rgb(255, 255, 255)'],(route,color)
    page.goto(BASE+'/products',wait_until='networkidle')
    expect(page.get_by_role('button',name='Xóa lọc',exact=True)).to_have_count(0)
    expect(page.get_by_role('button',name='Đặt lại bộ lọc',exact=True)).to_have_count(1)
    page.get_by_role('searchbox',name='Tìm kiếm sản phẩm').fill('khong-co-ket-qua')
    page.get_by_role('combobox',name='Lọc theo trạng thái').click()
    page.get_by_role('option',name='Hoạt động',exact=True).click()
    page.get_by_role('button',name='Đặt lại bộ lọc',exact=True).click()
    expect(page.get_by_role('searchbox',name='Tìm kiếm sản phẩm')).to_have_value('')
    expect(page.get_by_role('combobox',name='Lọc theo trạng thái')).to_contain_text('Tất cả trạng thái')
    assert not errors,errors
    browser.close()
    print('PASS: 11 list pages x 7 widths, desktop filter alignment, colored status backgrounds, single reset clears search/status; errors=0')
