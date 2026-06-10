import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Trending from "./pages/Trending.tsx";
import PostDetail from "./pages/PostDetail.tsx";
import DMs from "./pages/DMs.tsx";
import Marketing from "./pages/Marketing.tsx";
import Auth from "./pages/Auth.tsx";
import Amendments from "./pages/Amendments.tsx";
import Welcome from "./pages/Welcome.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import NotFound from "./pages/NotFound.tsx";
import Landing from "./pages/Landing.tsx";
import About from "./pages/About.tsx";
import { useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const RootGate = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">…</div>;
  if (!user) return <Landing />;
  return <ProtectedRoute><Index /></ProtectedRoute>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/amendments" element={<ProtectedRoute><Amendments /></ProtectedRoute>} />
            <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
            <Route path="/" element={<RootGate />} />
            <Route path="/about" element={<About />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/trending" element={<ProtectedRoute><Trending /></ProtectedRoute>} />
            <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
            <Route path="/dms" element={<ProtectedRoute><DMs /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
