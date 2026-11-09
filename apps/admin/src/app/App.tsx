import { PreferencesProvider } from "./providers/preferences-provider";
import { OrganizationProvider } from "./providers/organization-provider";
import { Toaster } from "sonner";
import { AppRoutes } from "./router/routes";

import { ProductProvider } from "./providers/product-provider";
import { TraceabilityProvider } from "./providers/traceability-provider";

export default function App() {
  return (
    <ProductProvider>
      <OrganizationProvider traceabilityMode>
        <TraceabilityProvider>
          <PreferencesProvider><AppRoutes /></PreferencesProvider>
        </TraceabilityProvider>
      </OrganizationProvider>
      <Toaster richColors position="top-right" closeButton />
    </ProductProvider>
  );
}
