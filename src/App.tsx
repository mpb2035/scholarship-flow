import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import Directory from "./pages/Directory";
import Playground from "./pages/Playground";
import GTCIUpload from "./pages/GTCIUpload";
import ProjectWorkflow from "./pages/ProjectWorkflow";
import PendingResponse from "./pages/PendingResponse";
import GTCIDashboard from "./pages/GTCIDashboard";
import TriathleteGoal from "./pages/TriathleteGoal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  // Auth page without sidebar
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
      </Routes>
    );
  }

  // All other pages with sidebar
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/gtci-upload" element={<GTCIUpload />} />
        <Route path="/project-workflow" element={<ProjectWorkflow />} />
        <Route path="/pending-response" element={<PendingResponse />} />
        <Route path="/gtci" element={<GTCIDashboard />} />
        <Route path="/triathlete-goal" element={<TriathleteGoal />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
