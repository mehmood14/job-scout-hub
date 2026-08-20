import { useEffect, useState } from "react";

import "./ThemeToggle.css";

type Theme = "ocean" | "ember" | "light" | "dark" | "black";

type ThemeOption = {
  value: Theme;
  label: string;
  icon: string;
};

type ThemeToggleProps = {
  variant?: "workspace" | "gateway";
};

const THEME_STORAGE_KEY = "job-scout-theme";

const themes: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    icon: "☀️",
  },
  {
    value: "dark",
    label: "Dark",
    icon: "🌙",
  },
  {
    value: "black",
    label: "Black",
    icon: "●",
  },
  {
    value: "ocean",
    label: "Ocean",
    icon: "🌊",
  },
  {
    value: "ember",
    label: "Ember",
    icon: "🔥",
  },
];

function isTheme(value: string | null): value is Theme {
  return themes.some((theme) => theme.value === value);
}

export function ThemeToggle({ variant = "workspace" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    return isTheme(storedTheme) ? storedTheme : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className={`theme-picker ${variant === "gateway" ? "gateway-theme-picker" : ""}`} aria-label="Color theme">
      <span className="theme-picker-label">Appearance</span>
      <div className="theme-options" role="group" aria-label="Choose a color theme">
        {themes.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`theme-option ${
              theme === option.value ? "active" : ""
            }`}
            onClick={() => setTheme(option.value)}
            aria-label={`Use ${option.label} theme`}
            aria-pressed={theme === option.value}
            title={option.label}
          >
            <span className={`theme-icon theme-icon-${option.value}`} aria-hidden="true">{option.icon}</span>
            <span className="theme-option-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
