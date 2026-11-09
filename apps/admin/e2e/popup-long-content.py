import os
from playwright.sync_api import sync_playwright, expect
BASE=os.environ.get("DEEPTRACE_BASE_URL","http://127.0.0.1:5173")
with sync_playwright() as p:
    browser=p.chromium.launch();page=browser.new_page()
    page.goto(BASE,wait_until='networkidle')
    page.evaluate("""() => {
      const key='deeptrace.admin.traceability.v1';const s=JSON.parse(localStorage.getItem(key));
      s.events[0].description='ChứngTừDài'.repeat(100);localStorage.setItem(key,JSON.stringify(s));
      const ckey='deeptrace.admin.catalog.v2';const c=JSON.parse(localStorage.getItem(ckey));c.products[0].name='TenSanPham'.repeat(15);localStorage.setItem(ckey,JSON.stringify(c));
    }""")
    def bounds(dialog):
        expect(dialog).to_be_visible();b=dialog.bounding_box();v=page.viewport_size
        assert b['x']>=0 and b['y']>=0 and b['x']+b['width']<=v['width']+1 and b['y']+b['height']<=v['height']+1
        assert dialog.evaluate('el=>el.scrollWidth<=el.clientWidth+1')
    for width,height in [(1440,900),(320,480)]:
        page.set_viewport_size({'width':width,'height':height})
        page.goto(BASE+'/trace-events',wait_until='networkidle')
        page.get_by_role('searchbox').fill('ChứngTừDài')
        page.locator('main table tbody tr button').first.click();page.get_by_role('menuitem',name='Chi tiết sự kiện',exact=True).click()
        dialog=page.locator('[data-slot="dialog-content"]');bounds(dialog)
        dialog.get_by_role('button',name='Đóng',exact=True).click();expect(dialog).not_to_be_visible()
        page.goto(BASE+'/products',wait_until='networkidle')
        page.get_by_role('searchbox').fill('TenSanPham')
        page.locator('main table tbody tr button').first.click();page.get_by_role('menuitem',name='Xóa sản phẩm',exact=True).click()
        dialog=page.get_by_role('alertdialog');bounds(dialog)
        page.keyboard.press('Escape');expect(dialog).not_to_be_visible()
    browser.close();print('PASS: long unbroken details/confirmation content, Close button, desktop/320x480 bounds and no horizontal overflow')
