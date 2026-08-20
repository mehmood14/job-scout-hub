import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";

import App from "../src/app/App.tsx";
import { ErrorBoundary } from "../src/app/ErrorBoundary.tsx";
import { CaseStudyPage } from "../src/components/CaseStudyPage.tsx";

const queryClient = new QueryClient();
const isCaseStudyRoute = window.location.pathname.replace(/\/+$/, "") === "/case-study";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {isCaseStudyRoute ? <CaseStudyPage /> : <App />}
      </ErrorBoundary>
      <Analytics />
    </QueryClientProvider>
  </StrictMode>,
);
