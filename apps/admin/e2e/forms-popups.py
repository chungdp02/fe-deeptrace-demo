import os, re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
BASE=os.environ.get("DEEPTRACE_BASE_URL","http://127.0.0.1:5173")
creates=[('/products','Thêm sản phẩm'),('/categories','Thêm danh mục'),('/employees','Thêm nhân viên'),('/lots','Tạo lô sản xuất'),('/materials','Tạo lô nguyên liệu'),('/partners','Thêm đối tác'),('/locations','Thêm địa điểm'),('/trace-events','Ghi nhận sự kiện'),('/quality','Ghi nhận kiểm định'),('/shipments','Tạo phiếu giao nhận'),('/incidents','Ghi nhận sự cố')]
with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page()
    errors=[];checked=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('console',lambda message:errors.append(message.text) if message.type=='error' else None)
    Path('apps/admin/e2e/screenshots').mkdir(exist_ok=True)
    def nav(route):
        page.goto(BASE+route,wait_until='domcontentloaded')
        expect(page.locator('main h1')).to_be_visible()
    nav('/')
    page.wait_for_function("localStorage.getItem('deeptrace.admin.traceability.v1') !== null")
    page.evaluate("""() => {
      const key='deeptrace.admin.traceability.v1';const s=JSON.parse(localStorage.getItem(key));
      s.events[0].description='Nội dung chứng từ dài để kiểm tra khả năng xuống dòng. '.repeat(20);
      const draft={...s.handovers[0],id:'QA-DRAFT',status:'draft',dispatchedAt:null,receivedAt:null};
      s.handovers.unshift(draft);localStorage.setItem(key,JSON.stringify(s));
    }""")
    def check(label):
        dialog=page.locator('[data-slot="dialog-content"], [data-slot="alert-dialog-content"]').filter(visible=True)
        expect(dialog).to_have_count(1)
        b=dialog.bounding_box();v=page.viewport_size
        assert b['x']>=-1 and b['y']>=-1 and b['x']+b['width']<=v['width']+1 and b['y']+b['height']<=v['height']+1,(label,b,v)
        assert dialog.evaluate('el=>el.scrollWidth<=el.clientWidth+1'),label
        controls=dialog.locator('[data-slot="input"], [data-slot="select-trigger"]')
        heights=[c.bounding_box()['height'] for c in controls.all() if c.is_visible()]
        if heights: assert max(heights)-min(heights)<2,(label,heights)
        for button in dialog.locator('[data-slot="dialog-footer"] button, [data-slot="alert-dialog-footer"] button').all():
            button.scroll_into_view_if_needed();expect(button).to_be_in_viewport()
            assert button.bounding_box()['height'] >= (44 if v['width']<640 else 40)
        selects=dialog.get_by_role('combobox')
        if selects.count():
            selects.first.scroll_into_view_if_needed();selects.first.click()
            popup=page.locator('[data-slot="select-content"][data-open]')
            expect(popup).to_be_visible();b=popup.bounding_box()
            assert b['x']>=-1 and b['y']>=-1 and b['x']+b['width']<=v['width']+1 and b['y']+b['height']<=v['height']+1,(label,b)
            page.keyboard.press('Escape');expect(popup).not_to_be_visible()
        calendar=dialog.get_by_role('button',name=re.compile('^Chọn ngày:'))
        if calendar.count():
            calendar.first.scroll_into_view_if_needed();calendar.first.click()
            popup=page.locator('[data-slot="popover-content"][data-open]')
            expect(popup).to_be_visible();b=popup.bounding_box()
            assert b['x']>=-1 and b['y']>=-1 and b['x']+b['width']<=v['width']+1 and b['y']+b['height']<=v['height']+1,(label,b)
            page.keyboard.press('Escape');expect(page.locator('[data-slot="popover-content"]')).to_have_count(0)
            expect(calendar.first).to_be_focused()
        checked.append(label)
        page.keyboard.press('Escape');expect(dialog).not_to_be_visible()
    for width,height in [(1440,900),(768,800),(375,812),(320,480)]:
        page.set_viewport_size({'width':width,'height':height})
        for route,label in creates:
            nav(route);trigger=page.get_by_role('button',name=label,exact=True);trigger.click();check(label)
            expect(trigger).to_be_focused()
            nav(route)
            actions=page.locator('main table tbody tr button').first
            if actions.count():
                actions.click()
                names=[item.inner_text().strip() for item in page.get_by_role('menuitem').all() if item.is_enabled()]
                page.keyboard.press('Escape')
                for name in names:
                    nav(route);page.locator('main table tbody tr button').first.click()
                    item=page.get_by_role('menuitem',name=name,exact=True)
                    if not item.is_enabled(): continue
                    item.click()
                    opened=page.locator('[data-slot="dialog-content"][data-open], [data-slot="alert-dialog-content"][data-open]')
                    if opened.count(): check(route+' '+name)
        nav('/lots/LOT-RICE')
        for label in ['Chỉnh sửa','Ghi nhận sự kiện','Liên kết đầu vào','Kiểm định lô']:
            page.get_by_role('button',name=label,exact=True).click();check(label)
        print('PASS popup viewport',width,height,flush=True)
    assert not errors,errors
    browser.close()
    print('PASS:',len(checked),'add/edit/details/confirmation dialogs; bounds/control heights/footer/select/calendar/Escape/focus; errors=0')
