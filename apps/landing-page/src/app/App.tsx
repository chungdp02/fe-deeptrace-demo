import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BackToTop } from "@/components/layout/back-to-top";
import { ScrollReveal } from "@/components/layout/scroll-reveal";
import HomePage from "@/pages/home/page";
import AboutPage from "@/pages/about/page";
import IndustriesPage from "@/pages/industries/page";
import ContactPage from "@/pages/contact/page";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { lazy, Suspense, useEffect } from "react";

const LoginPage = lazy(() => import("@/pages/login/page"));

function ScrollToTopOnRouteChange() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.key]);

  return null;
}

function PublicLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div key={location.pathname} className="page-enter flex flex-1 flex-col"><Outlet /></div>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTopOnRouteChange />
      <ScrollReveal />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="industries" element={<IndustriesPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>
        <Route
          path="/login"
          element={
            <Suspense fallback={<main role="status" className="flex min-h-svh items-center justify-center">DeepTrace</main>}>
              <div className="page-enter"><LoginPage /></div>
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
