
import { themes, ThemeName } from "@/lib/constants/colors";

export function applyTheme(theme: ThemeName) {
  const root = document.documentElement;
  const t = themes[theme];

  root.style.setProperty("--primary", t.primary);
  root.style.setProperty("--background", t.background);
  root.style.setProperty("--foreground", t.foreground);
  root.style.setProperty("--muted", t.muted);
  root.dataset.theme = theme;
}
