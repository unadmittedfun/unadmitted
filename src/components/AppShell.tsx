import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Home, Flame, MessageSquare, Megaphone, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "New", icon: Home },
  { to: "/trending", label: "Trending", icon: Flame },
  { to: "/dms", label: "DMs", icon: MessageSquare },
  { to: "/marketing", label: "Promote", icon: Megaphone },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>ACG Unadmitted</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {profile?.handle}
            </span>
            <Button variant="ghost" size="icon" onClick={async () => { await signOut(); nav("/auth"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="max-w-3xl mx-auto px-2 flex">
          {tabs.map((t) => {
            const active = loc.pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
};
