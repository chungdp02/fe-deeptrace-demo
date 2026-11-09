import os
from playwright.sync_api import sync_playwright, expect
BASE=os.environ.get("DEEPTRACE_BASE_URL","http://127.0.0.1:5173")
with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page()
    errors=[]
    page.on("pageerror",lambda error:errors.append(str(error)))
    page.goto(BASE,wait_until="networkidle")
    page.evaluate("localStorage.setItem('deeptrace.admin.preferences.v1','3')")
    for width in [320,375,768,1440]:
        page.set_viewport_size({"width":width,"height":1000})
        for route in ["/products","/trace-events","/inventory"]:
            page.goto(BASE+route,wait_until="networkidle")
            nav=page.get_by_role("navigation",name="Phân trang",exact=True)
            expect(nav.get_by_role("button",name="Trước",exact=True)).to_be_disabled()
            expect(nav.get_by_role("button",name="Trang 1",exact=True)).to_have_count(0)
            nav.get_by_role("button",name="Sau",exact=True).click()
            expect(nav.get_by_role("button",name="Trước",exact=True)).to_be_enabled()
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
            if width==1440:
                footer=nav.locator("..").bounding_box()
                counter=nav.locator("..").locator("p").bounding_box()
                buttons=nav.bounding_box()
                assert counter["x"] < buttons["x"] and abs(footer["x"]+footer["width"]-buttons["x"]-buttons["width"])<2
    page.evaluate("""() => {
        const key='deeptrace.admin.catalog.v2';
        const data=JSON.parse(localStorage.getItem(key));
        const sample=data.products[0];
        for(let i=0;i<60;i++) data.products.push({...sample,id:'QA-'+i,name:'Sản phẩm QA '+i});
        localStorage.setItem(key,JSON.stringify(data));
    }""")
    for width in [320,1440]:
        page.set_viewport_size({"width":width,"height":1000})
        page.goto(BASE+'/products',wait_until='networkidle')
        nav=page.get_by_role('navigation',name='Phân trang',exact=True)
        nav.get_by_role('button',name='Trang 3',exact=True).click()
        expect(nav.get_by_role('button',name='Trang 3',exact=True)).to_have_attribute('aria-current','page')
        nav.get_by_role('button',name='Trang 23',exact=True).click()
        expect(nav.get_by_role('button',name='Sau',exact=True)).to_be_disabled()
        expect(nav.get_by_role('button')).to_have_count(6)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors,errors
    browser.close()
    print('PASS: unified footer, previous/next, desktop alignment, 23-page shortcuts/ellipsis/boundaries, mobile overflow; errors=0')
