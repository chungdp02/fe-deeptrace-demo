import os,re
from playwright.sync_api import sync_playwright,expect
BASE=os.environ.get("DEEPTRACE_BASE_URL","http://127.0.0.1:5173")
routes=['/','/products','/categories','/materials','/lots','/lots/LOT-RICE','/partners','/locations','/trace-events','/quality','/shipments','/inventory','/incidents','/traceability/lookup','/employees','/company','/settings']
with sync_playwright() as p:
    browser=p.chromium.launch();page=browser.new_page();errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    def nav(route):
        page.goto(BASE+route,wait_until='domcontentloaded');expect(page.locator('main h1')).to_be_visible()
    for width in [1440,375]:
        page.set_viewport_size({'width':width,'height':1000})
        for route in routes:
            nav(route)
            text=page.locator('main').inner_text()
            assert not re.search(r'metadata|snapshot|localStorage|audit\b',text,re.I),(route,text)
            page.wait_for_function('document.documentElement.scrollWidth <= innerWidth')
            if route in ['/products','/categories','/lots','/materials','/partners','/locations','/employees','/incidents']:
                page.locator('main table tbody tr button').first.click()
                expect(page.get_by_role('menuitem',name='Chỉnh sửa',exact=True)).to_be_visible()
                page.get_by_role('menuitem',name='Chỉnh sửa',exact=True).click()
                dialog=page.locator('[data-slot="dialog-content"]')
                expect(dialog.get_by_role('heading',name=re.compile('^Chỉnh sửa'))).to_be_visible()
                expect(dialog.get_by_role('button',name='Lưu thay đổi',exact=True)).to_be_visible()
                box=dialog.bounding_box();viewport=page.viewport_size
                assert box['x']>=0 and box['y']>=0 and box['x']+box['width']<=viewport['width']+1 and box['y']+box['height']<=viewport['height']+1
                assert dialog.evaluate('el=>el.scrollWidth<=el.clientWidth+1')
                page.keyboard.press('Escape');expect(dialog).not_to_be_visible()
    nav('/lots/LOT-RICE')
    page.get_by_role('button',name='Chỉnh sửa',exact=True).click()
    dialog=page.locator('[data-slot="dialog-content"]')
    dialog.get_by_label('Nguồn đầu vào / lý do không dùng lô đầu vào',exact=False).fill('Thông tin nguồn đã chỉnh sửa')
    dialog.get_by_role('button',name='Lưu thay đổi',exact=True).click()
    expect(dialog).not_to_be_visible()
    summary=page.locator('summary').filter(has_text='Chỉnh sửa thông tin lô').last
    summary.click()
    expect(page.get_by_text('Thông tin nguồn đã chỉnh sửa',exact=True).last).to_be_visible()
    assert 'sourceNote' not in page.locator('main').inner_text()
    assert not errors,errors
    browser.close();print('PASS: copy review 17 routes desktop/mobile, edit menu/dialog/save labels, readable audit history, no technical UI labels/overflow; errors=0')
