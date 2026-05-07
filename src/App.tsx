import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { EncryptionProvider } from "@/contexts/EncryptionContext";
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
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <EncryptionProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/amendments" element={<ProtectedRoute><Amendments /></ProtectedRoute>} />
              <Route path="/welcome" element={<ProtectedRoute><Welcome /></Protecte
