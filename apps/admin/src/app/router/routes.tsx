import { lazy, Suspense } from "react";
import { Link, Navigate, Route, Routes } from "react-router";
import { buttonVariants } from "@workspace/ui/components/button";
import { DashboardLayout } from "../../components/layout/dashboard-layout";

const OverviewPage = lazy(() => import("../../pages/overview/page").then(module => ({ default: module.OverviewPage })));
const ProductsPage = lazy(() => import("../../pages/products/page").then(module => ({ default: module.ProductsPage })));
const CategoriesPage = lazy(() => import("../../pages/categories/page").then(module => ({ default: module.CategoriesPage })));
const CompanyPage = lazy(() => import("../../pages/company/page").then(module => ({ default: module.CompanyPage })));
const EmployeesPage = lazy(() => import("../../pages/employees/page").then(module => ({ default: module.EmployeesPage })));
const SettingsPage = lazy(() => import("../../pages/settings/page").then(module => ({ default: module.SettingsPage })));
const LotsPage = lazy(() => import("../../pages/traceability/catalog-pages").then(module => ({ default: module.LotsPage })));
const MaterialsPage = lazy(() => import("../../pages/traceability/catalog-pages").then(module => ({ default: module.MaterialsPage })));
const PartnersPage = lazy(() => import("../../pages/traceability/catalog-pages").then(module => ({ default: module.PartnersPage })));
const LocationsPage = lazy(() => import("../../pages/traceability/catalog-pages").then(module => ({ default: module.LocationsPage })));
const LotDetailPage = lazy(() => import("../../pages/traceability/lot-detail").then(module => ({ default: module.LotDetailPage })));
const TraceEventsPage = lazy(() => import("../../pages/traceability/event-pages").then(module => ({ default: module.TraceEventsPage })));
const QualityPage = lazy(() => import("../../pages/traceability/event-pages").then(module => ({ default: module.QualityPage })));
const ShipmentsPage = lazy(() => import("../../pages/traceability/workflow-pages").then(module => ({ default: module.ShipmentsPage })));
const InventoryPage = lazy(() => import("../../pages/traceability/workflow-pages").then(module => ({ default: module.InventoryPage })));
const IncidentsPage = lazy(() => import("../../pages/traceability/workflow-pages").then(module => ({ default: module.IncidentsPage })));
const LookupPage = lazy(() => import("../../pages/traceability/lookup-page").then(module => ({ default: module.LookupPage })));
export function AppRoutes() {
  return <Suspense fallback={<p role="status" className="p-6">Đang tải trang…</p>}><Routes><Route element={<DashboardLayout />}>
    <Route index element={<OverviewPage />} />
    <Route path="products" element={<ProductsPage />} /><Route path="categories" element={<CategoriesPage />} />
    <Route path="materials" element={<MaterialsPage />} /><Route path="lots" element={<LotsPage />} /><Route path="lots/:lotId" element={<LotDetailPage />} />
    <Route path="partners" element={<PartnersPage />} /><Route path="locations" element={<LocationsPage />} />
    <Route path="trace-events" element={<TraceEventsPage />} /><Route path="quality" element={<QualityPage />} />
    <Route path="shipments" element={<ShipmentsPage />} /><Route path="inventory" element={<InventoryPage />} />
    <Route path="incidents" element={<IncidentsPage />} /><Route path="traceability/lookup" element={<LookupPage />} />
    <Route path="employees" element={<EmployeesPage />} /><Route path="company" element={<CompanyPage />} /><Route path="settings" element={<SettingsPage />} />
    <Route path="orders" element={<Navigate to="/shipments" replace />} /><Route path="stores" element={<Navigate to="/locations" replace />} /><Route path="support" element={<Navigate to="/incidents" replace />} />
    <Route path="*" element={<section className="space-y-4"><h1 className="text-2xl font-bold">Không tìm thấy trang</h1><p>Đường dẫn không tồn tại trong DeepTrace Admin.</p><Link className={buttonVariants()} to="/">Về tổng quan</Link></section>} />
  </Route></Routes></Suspense>;
}
