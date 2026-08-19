import { useEffect, useState } from "react";

import "./ThemeToggle.css";

type Theme = "ocean" | "ember" | "forest";

type ThemeOption = {
  value: Theme;
  label: string;
  icon: string;
};

const THEME_STORAGE_KEY = "job-scout-theme";

const themes: ThemeOption[] = [
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
  {
    value: "forest",
    label: "Forest",
    icon: "🌲",
  },
];

function isTheme(value: string | null): value is Theme {
  return themes.some((theme) => theme.value === value);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    return isTheme(storedTheme) ? storedTheme : "ember";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="theme-picker" aria-label="Color theme">
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
          <span className="theme-icon" aria-hidden="true">
            {option.icon}
          </span>

          <span className="theme-option-label">
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}