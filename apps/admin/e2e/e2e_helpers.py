"""Tiện ích E2E: chỉ thao tác dữ liệu trong browser context riêng của từng suite."""
from playwright.sync_api import expect

def row_action(page, trigger, item):
    page.get_by_role("button", name=trigger, exact=True).click()
    try:
        page.get_by_role("menuitem", name=item, exact=True).click(timeout=5000)
    except Exception:
        page.screenshot(path="apps/admin/e2e/menu-failure.png")
        print("MENU FAILURE", trigger, item, page.locator("body").inner_text(), flush=True)
        raise

def seed_catalog(page, empty=False):
    # Seed snapshot hợp lệ để kiểm tra trạng thái rỗng, không cần reset UI.
    if empty:
        page.evaluate("""() => {
            const catalog = JSON.parse(localStorage.getItem('deeptrace.admin.catalog.v2'));
            catalog.products = [];
            localStorage.setItem('deeptrace.admin.catalog.v2', JSON.stringify(catalog));
            localStorage.removeItem('deeptrace.admin.operations.v1');
            localStorage.removeItem('deeptrace.admin.traceability.v1');
        }""")
    else:
        page.evaluate("""() => {
            for (const key of ['deeptrace.admin.catalog.v2', 'deeptrace.admin.products.v1', 'deeptrace.admin.operations.v1', 'deeptrace.admin.traceability.v1'])
                localStorage.removeItem(key);
        }""")
    page.reload(wait_until="networkidle")
