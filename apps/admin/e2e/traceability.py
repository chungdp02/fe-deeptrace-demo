import re
import os
TEST_BASE = os.environ.get("DEEPTRACE_BASE_URL", "http://127.0.0.1:5173")
"""Workflow truy xuất thực tế trên browser context riêng; không tác động browser người dùng."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE=TEST_BASE
KEY="deeptrace.admin.traceability.v1"
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1440,"height":1000})
    page.set_default_timeout(12000)
    errors=[]
    page.on("pageerror",lambda error:errors.append(str(error)))
    page.on("console",lambda msg:errors.append(msg.text) if msg.type=="error" else None)
    page.goto(BASE,wait_until="networkidle")
    page.evaluate("""() => {
        localStorage.setItem('deeptrace.admin.operations.v1','legacy-sales-must-remain');
        const current=JSON.parse(localStorage.getItem('deeptrace.admin.trace-organization.v1'));
        current.company.name='Doanh nghiệp kế thừa E2E';
        localStorage.setItem('deeptrace.admin.organization.v1',JSON.stringify(current));
        localStorage.removeItem('deeptrace.admin.trace-organization.v1');
        localStorage.removeItem('deeptrace.admin.traceability.v1');
    }""")
    page.reload(wait_until="networkidle")
    before_org=page.evaluate("localStorage.getItem('deeptrace.admin.organization.v1')")
    initial=json.loads(page.evaluate("localStorage.getItem('"+KEY+"')"))
    def nav(route,title=None):
        page.goto(BASE+route,wait_until="networkidle")
        if title: expect(page.get_by_role("heading",name=title,exact=True)).to_be_visible()
    def choose(label,value):
        page.get_by_role("combobox",name=label,exact=True).click()
        try:
            page.locator('[data-slot="select-content"][data-open]').get_by_role("option",name=value,exact=True).click()
        except Exception:
            page.screenshot(path="apps/admin/e2e/screenshots/traceability-select-failure.png",full_page=True)
            raise
    def fill(label,value): page.get_by_role("dialog").get_by_label(label,exact=False).fill(value)
    def save():
        page.get_by_role("dialog").get_by_role("button",name=re.compile(r"^Lưu (thông tin|thay đổi)$")).click()
    def closed(): expect(page.get_by_role("dialog")).not_to_be_visible()
    def action(id,label):
        page.get_by_role("button",name="Thao tác "+id,exact=True).click()
        page.get_by_role("menuitem",name=label,exact=True).click()
    def create_lot(raw,code,quantity):
        nav("/materials" if raw else "/lots")
        page.get_by_role("button",name="Tạo lô nguyên liệu" if raw else "Tạo lô sản xuất",exact=True).click()
        fill("Mã lô",code)
        if raw: choose("Nguyên liệu hiện có","Lúa nguyên liệu")
        else: choose("Sản phẩm","P002 · Gạo ST25")
        fill("Số lượng ban đầu",str(quantity))
        choose("Địa điểm nguồn","Kho đầu vào An Phú")
        choose("Đơn vị phụ trách","Hợp tác xã Nguồn Việt" if raw else "Cơ sở chế biến An Phú")
        if raw: fill("Nguồn đầu vào","Phiếu thu mua nội bộ E2E")
        save();closed()
        link=page.get_by_role("link",name=code,exact=True)
        expect(link).to_be_visible()
        return link.get_attribute("href")
    raw_path=create_lot(True,"NL-E2E",100)
    out_path=create_lot(False,"TP-E2E",30)
    page.get_by_role("button",name="Tạo lô sản xuất",exact=True).click()
    fill("Mã lô","TP-E2E");choose("Sản phẩm","P002 · Gạo ST25");fill("Số lượng ban đầu","1");choose("Địa điểm nguồn","Kho đầu vào An Phú");choose("Đơn vị phụ trách","Cơ sở chế biến An Phú")
    save();expect(page.get_by_role("dialog").get_by_role("alert")).to_contain_text("Mã lô")
    page.get_by_role("dialog").get_by_role("button",name="Hủy",exact=True).click()
    nav(out_path,"TP-E2E")
    page.get_by_role("button",name="Liên kết đầu vào",exact=True).click()
    choose("Lô đầu vào","NL-E2E");choose("Địa điểm lấy nguyên liệu","Kho đầu vào An Phú");fill("Số lượng sử dụng","50");save();closed()
    expect(page.get_by_role("link",name="NL-E2E",exact=True).first).to_be_visible()
    nav(raw_path,"NL-E2E")
    expect(page.get_by_role("link",name="TP-E2E",exact=True).first).to_be_visible()
    page.get_by_role("button",name="Liên kết đầu vào",exact=True).click()
    choose("Lô đầu vào","TP-E2E");choose("Địa điểm lấy nguyên liệu","Kho đầu vào An Phú");fill("Số lượng sử dụng","1");save()
    expect(page.get_by_role("dialog").get_by_role("alert")).to_contain_text("chu trình")
    page.get_by_role("dialog").get_by_role("button",name="Hủy",exact=True).click()
    def event(route,type,description):
        nav(route)
        page.get_by_role("button",name="Ghi nhận sự kiện",exact=True).click()
        choose("Loại sự kiện",type);choose("Địa điểm sự kiện","Kho đầu vào An Phú")
        choose("Nhân sự ghi nhận","Nguyễn Minh Anh")
        fill("Mô tả sự kiện",description);save();closed()
        expect(page.get_by_text(description,exact=True)).to_be_visible()
    event(raw_path,"Thu hoạch / thu mua","Thu mua E2E theo hồ sơ nguồn")
    event(out_path,"Chế biến","Chế biến E2E")
    event(out_path,"Đóng gói","Đóng gói E2E")
    page.get_by_role("button",name="Kiểm định lô",exact=True).click()
    choose("Địa điểm kiểm định","Kho đầu vào An Phú");fill("Nội dung kiểm tra","Hồ sơ E2E");choose("Kết quả","Đạt nội bộ");fill("Người kiểm tra","Người kiểm tra E2E");fill("Nhận xét","Đối chiếu đủ chứng từ");save();closed()
    expect(page.get_by_text("Đủ dữ liệu theo cấu hình lô (tự khai)",exact=True)).to_be_visible()
    nav("/shipments")
    page.get_by_role("button",name="Tạo phiếu giao nhận",exact=True).click()
    choose("Lô bàn giao","TP-E2E");choose("Địa điểm xuất","Kho đầu vào An Phú");choose("Địa điểm nhận","Kho phân phối Bình Tân");fill("Số lượng bàn giao","5");fill("Nội dung bàn giao","Giao nhận E2E");save();closed()
    page.get_by_role("searchbox").fill("Giao nhận E2E")
    row=page.get_by_role("row").filter(has_text="TP-E2E")
    transfer_id=row.locator("td").nth(1).inner_text()
    action(transfer_id,"Xác nhận xuất hàng");save();closed()
    expect(row).to_contain_text("Đang giao")
    action(transfer_id,"Xác nhận đã nhận");save();closed()
    expect(row).to_contain_text("Đã nhận")
    nav(out_path)
    expect(page.get_by_text("Kho đầu vào An Phú:",exact=False).first).to_be_visible()
    expect(page.get_by_text("25 kg",exact=True)).to_be_visible()
    expect(page.get_by_text("5 kg",exact=True).first).to_be_visible()
    expect(page.get_by_role("heading",name="Xuất giao",exact=True)).to_be_visible()
    expect(page.get_by_role("heading",name="Nhận bàn giao",exact=True)).to_be_visible()
    page.reload(wait_until="networkidle")
    expect(page.get_by_text("Chế biến E2E",exact=True)).to_be_visible()
    nav("/traceability/lookup")
    page.get_by_role("searchbox").fill("TP-E2E");page.get_by_role("button",name="Tra cứu",exact=True).click()
    page.get_by_role("button",name="Xem hành trình",exact=True).click()
    expect(page.get_by_role("link",name="NL-E2E",exact=True).first).to_be_visible()
    page.go_back();page.go_forward()
    expect(page.get_by_role("heading",name="TP-E2E",exact=True)).to_be_visible()
    nav("/employees")
    page.get_by_role("searchbox").fill("NV001")
    page.get_by_role("button",name="Thao tác nhân viên NV001",exact=True).click();page.get_by_role("menuitem",name="Xóa nhân viên",exact=True).click()
    page.get_by_role("alertdialog").get_by_role("button",name="Xác nhận xóa",exact=True).click()
    expect(page.get_by_role("alertdialog").get_by_role("alert")).to_contain_text("sự kiện")
    page.get_by_role("alertdialog").get_by_role("button",name="Hủy",exact=True).click()
    nav("/incidents")
    page.get_by_role("button",name="Ghi nhận sự cố",exact=True).click()
    fill("Tiêu đề sự cố","Hồ sơ E2E cần rà soát")
    page.get_by_role("dialog").get_by_role("checkbox",name="NL-E2E",exact=True).check()
    fill("Mô tả vấn đề","Cần rà soát ảnh hưởng từ nguồn nguyên liệu");save();closed()
    row=page.get_by_role("row").filter(has_text="Hồ sơ E2E cần rà soát")
    row.get_by_role("button").click();page.get_by_role("menuitem",name="Xem ảnh hưởng",exact=True).click()
    expect(page.get_by_role("dialog").get_by_role("link",name="TP-E2E",exact=True)).to_be_visible()
    page.keyboard.press("Escape");closed()
    nav("/")
    expect(page.get_by_text("Lô được quản lý",exact=True).locator("..")).to_contain_text(str(len(initial["lots"])+2))
    assert page.evaluate("localStorage.getItem('deeptrace.admin.operations.v1')")=="legacy-sales-must-remain"
    assert page.evaluate("localStorage.getItem('deeptrace.admin.organization.v1')")==before_org
    nav(out_path)
    page.keyboard.press("Tab")
    page.evaluate("localStorage.setItem('"+KEY+"','broken-trace-e2e')")
    page.reload(wait_until="networkidle")
    expect(page.get_by_role("alert")).to_contain_text("Dữ liệu truy xuất đã lưu")
    assert page.evaluate("localStorage.getItem('"+KEY+"')")=="broken-trace-e2e"
    nav("/partners")
    page.get_by_role("button",name="Thêm đối tác",exact=True).click()
    fill("Tên đối tác","Đối tác sau fallback");fill("Liên hệ","0900000099");fill("Địa chỉ","Cần Thơ");save();closed()
    backups=page.evaluate("Object.keys(localStorage).filter(key=>key.startsWith('"+KEY+".backup.')).map(key=>localStorage.getItem(key))")
    assert "broken-trace-e2e" in backups
    assert not errors,errors
    Path("apps/admin/e2e/screenshots").mkdir(exist_ok=True)
    nav("/");page.screenshot(path="apps/admin/e2e/screenshots/traceability-overview.png",full_page=True)
    print("PASS: lot/material creation, duplicate validation, lineage/cycle, events, QC, dispatch/receipt/stock, actor guard, lookup/history, incidents/impact, KPIs, persistence, legacy preservation, corruption backup; errors=0",flush=True)
    browser.close()
