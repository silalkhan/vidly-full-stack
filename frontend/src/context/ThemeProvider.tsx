import { useCallback, useEffect, useState, type ReactNode } from "react";
import ThemeContext, { type Theme } from "./themeContext";

type ThemeProviderProps = {
  children: ReactNode;
};

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem("vidly-theme");
  return savedTheme === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // A document-level attribute lets the global stylesheet theme the whole
    // application without duplicating theme state in every page.
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("vidly-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
