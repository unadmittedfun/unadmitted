import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isOnboarded } from "@/pages/Welcome";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, profile, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.accepted_amendments && loc.pathname !== "/amendments") {
    return <Navigate to="/amendments" replace />;
  }
  if (
    profile?.accepted_amendments &&
    !isOnboarded(user.id) &&
    loc.pathname !== "/welcome" &&
    loc.pathname !== "/amendments"
  ) {
    return <Navigate to="/welcome" replace />;
  }
  return <>{children}</>;
};

