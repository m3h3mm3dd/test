
export const themes = {
  blue: {
    name: "blue",
    primary: "#3B82F6",
    background: "#F9FAFB",
    foreground: "#111827",
    muted: "#E5E7EB",
  },
  dark: {
    name: "dark",
    primary: "#3B82F6",
    background: "#0F172A",
    foreground: "#F8FAFC",
    muted: "#1E293B",
  },
  green: {
    name: "green",
    primary: "#10B981",
    background: "#F0FDF4",
    foreground: "#052E16",
    muted: "#D1FAE5",
  },
  red: {
    name: "red",
    primary: "#EF4444",
    background: "#FEF2F2",
    foreground: "#7F1D1D",
    muted: "#FCA5A5",
  },
  rose: {
    name: "rose",
    primary: "#FB7185",
    background: "#FFF1F2",
    foreground: "#881337",
    muted: "#FBCFE8",
  },
} as const;

export type ThemeName = keyof typeof themes;
