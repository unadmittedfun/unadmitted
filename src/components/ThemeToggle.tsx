import { useEffect, useState } from "react";
import { Moon, Sun, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Mode = "light" | "dark";

const STORAGE_MODE = "ua_theme_mode";
const STORAGE_HUE = "ua_theme_hue";
const STORAGE_SAT = "ua_theme_sat";
const STORAGE_LIGHT = "ua_theme_light";

const DEFAULTS = { hue: 252, sat: 88, light: 60 };

export const applyStoredTheme = () => {
  if (typeof document === "undefined") return;
  const mode = (localStorage.getItem(STORAGE_MODE) as Mode | null) ?? "light";
  document.documentElement.classList.toggle("dark", mode === "dark");

  const hue = Number(localStorage.getItem(STORAGE_HUE) ?? DEFAULTS.hue);
  const sat = Number(localStorage.getItem(STORAGE_SAT) ?? DEFAULTS.sat);
  const light = Number(localStorage.getItem(STORAGE_LIGHT) ?? DEFAULTS.light);
  const root = document.documentElement;
  root.style.setProperty("--primary", `${hue} ${sat}% ${light}%`);
  root.style.setProperty("--ring", `${hue} ${sat}% ${light}%`);
  root.style.setProperty("--primary-glow", `${hue} 100% ${Math.min(light + 12, 85)}%`);
  root.style.setProperty("--accent", `${(hue + 16) % 360} ${Math.min(sat + 2, 100)}% ${Math.min(light + 6, 80)}%`);
  root.style.setProperty("--upvote", `${hue} ${sat}% ${light}%`);
};

export const ThemeToggle = () => {
  const [mode, setMode] = useState<Mode>(
    () => (typeof window !== "undefined" && (localStorage.getItem(STORAGE_MODE) as Mode)) || "light"
  );
  const [hue, setHue] = useState<number>(
    () => Number(localStorage.getItem(STORAGE_HUE) ?? DEFAULTS.hue)
  );
  const [sat, setSat] = useState<number>(
    () => Number(localStorage.getItem(STORAGE_SAT) ?? DEFAULTS.sat)
  );
  const [light, setLight] = useState<number>(
    () => Number(localStorage.getItem(STORAGE_LIGHT) ?? DEFAULTS.light)
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_MODE, mode);
    localStorage.setItem(STORAGE_HUE, String(hue));
    localStorage.setItem(STORAGE_SAT, String(sat));
    localStorage.setItem(STORAGE_LIGHT, String(light));
    applyStoredTheme();
  }, [mode, hue, sat, light]);

  const presets = [
    { label: "Violet", h: 252, s: 88, l: 60 },
    { label: "Blue", h: 212, s: 92, l: 55 },
    { label: "Emerald", h: 158, s: 75, l: 42 },
    { label: "Rose", h: 340, s: 82, l: 58 },
    { label: "Cyan", h: 190, s: 85, l: 48 },
    { label: "Slate", h: 220, s: 15, l: 35 },
  ];

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setMode(mode === "dark" ? "light" : "dark")}
        aria-label="Toggle dark mode"
        className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
      >
        {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Customize theme"
            className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
          >
            <Palette className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Presets
            </p>
            <div className="grid grid-cols-6 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setHue(p.h); setSat(p.s); setLight(p.l); }}
                  title={p.label}
                  className="h-7 w-7 rounded-full border border-border ring-offset-2 hover:ring-2 ring-foreground/30 transition"
                  style={{ background: `hsl(${p.h} ${p.s}% ${p.l}%)` }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Hue</span>
              <span className="font-mono">{hue}°</span>
            </label>
            <input
              type="range" min={0} max={360} value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="w-full"
              style={{
                background: "linear-gradient(to right, hsl(0 90% 55%), hsl(60 90% 55%), hsl(120 90% 55%), hsl(180 90% 55%), hsl(240 90% 55%), hsl(300 90% 55%), hsl(360 90% 55%))",
                WebkitAppearance: "none",
                height: 8,
                borderRadius: 4,
              }}
            />
          </div>
          <div className="flex items-center justify-end pt-2 border-t border-border">
            <button
              onClick={() => { setHue(DEFAULTS.hue); setSat(DEFAULTS.sat); setLight(DEFAULTS.light); }}
              className="text-xs text-primary hover:underline"
            >
              Reset
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
