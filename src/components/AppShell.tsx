import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Home, Flame, MessageSquare, Megaphone, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { StatsPanel } from "@/components/StatsPanel";
import { ProfileSettings } from "@/components/ProfileSettings";
import { ThemeToggle } from "@/components/ThemeToggle";

const tabs = [
  { to: "/", label: "New", icon: Home },
  { to: "/trending", label: "Trending", icon: Flame },
  { to: "/dms", label: "DMs", icon: MessageSquare },
  { to: "/marketing", label: "Promote", icon: Megaphone },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { profile, community, signOut } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const brand = community?.name ?? "Unadmitted";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-background/75 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="h-7 w-7 rounded-lg bg-gradient-hero grid place-items-center shadow-card transition-transform group-hover:rotate-[-6deg]">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>{brand}</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-secondary transition-colors"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-[10px] font-mono">
                  {profile?.handle.slice(5, 7).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-mono hidden sm:inline">{profile?.handle}</span>
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <Button variant="ghost" size="icon" onClick={async () => { await signOut(); nav("/auth"); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-2 flex">
          {tabs.map((t) => {
            const active = loc.pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex-1 sm:flex-none sm:px-6 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 transition-colors",
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
      <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_280px] gap-6">
        <main className="min-w-0">{children}</main>
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <StatsPanel />
          </div>
        </div>
      </div>
      <footer className="max-w-6xl mx-auto px-4 py-6 border-t border-border mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>🔒 We never read, store, or use your data.</p>
          <p className="hidden md:block">
            Not affiliated with {community?.name?.replace(" Unadmitted", "") ?? "the school"}.{" "}
            <span className="font-semibold">{community?.hashtag ?? "#unadmitted"}</span>
          </p>
          <Link to="/privacy" className="hover:text-foreground underline-offset-4 hover:underline">Privacy promise</Link>
        </div>
      </footer>
      <ProfileSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};
