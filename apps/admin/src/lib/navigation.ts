import { LayoutDashboard, Package, Tags, Sprout, Boxes, ClipboardList, Truck, Search, Building2, MapPin, ShieldCheck, AlertTriangle, Warehouse, Users, Settings, type LucideIcon } from "lucide-react";
export type AdminPage = "overview" | "products" | "categories" | "materials" | "lots" | "events" | "shipments" | "lookup" | "partners" | "locations" | "quality" | "incidents" | "inventory" | "employees" | "company" | "settings";
export interface AdminNavigationItem { id: AdminPage; path: string; label: string; icon: LucideIcon; group: "Tổng quan" | "Dữ liệu nguồn gốc" | "Theo dõi" | "Quản lý" }
export const adminNavigation: AdminNavigationItem[] = [
  { id: "overview", path: "/", label: "Tổng quan", icon: LayoutDashboard, group: "Tổng quan" },
  { id: "products", path: "/products", label: "Sản phẩm", icon: Package, group: "Dữ liệu nguồn gốc" },
  { id: "categories", path: "/categories", label: "Danh mục", icon: Tags, group: "Dữ liệu nguồn gốc" },
  { id: "materials", path: "/materials", label: "Nguyên liệu", icon: Sprout, group: "Dữ liệu nguồn gốc" },
  { id: "lots", path: "/lots", label: "Lô sản xuất", icon: Boxes, group: "Dữ liệu nguồn gốc" },
  { id: "events", path: "/trace-events", label: "Nhật ký truy xuất", icon: ClipboardList, group: "Theo dõi" },
  { id: "shipments", path: "/shipments", label: "Giao nhận", icon: Truck, group: "Theo dõi" },
  { id: "lookup", path: "/traceability/lookup", label: "Tra cứu nguồn gốc", icon: Search, group: "Theo dõi" },
  { id: "inventory", path: "/inventory", label: "Tồn kho theo lô", icon: Warehouse, group: "Theo dõi" },
  { id: "partners", path: "/partners", label: "Đối tác", icon: Building2, group: "Quản lý" },
  { id: "locations", path: "/locations", label: "Cơ sở & địa điểm", icon: MapPin, group: "Quản lý" },
  { id: "quality", path: "/quality", label: "Kiểm định", icon: ShieldCheck, group: "Quản lý" },
  { id: "incidents", path: "/incidents", label: "Sự cố", icon: AlertTriangle, group: "Quản lý" },
  { id: "employees", path: "/employees", label: "Nhân sự vận hành", icon: Users, group: "Quản lý" },
  { id: "company", path: "/company", label: "Doanh nghiệp", icon: Building2, group: "Quản lý" },
  { id: "settings", path: "/settings", label: "Cài đặt hiển thị", icon: Settings, group: "Quản lý" },
];
