import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme based on localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "true" || (savedTheme === null && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle theme
  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);

    if (newValue) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      title={isDarkMode ? t('lightMode') : t('darkMode')}
      aria-label={isDarkMode ? t('lightMode') : t('darkMode')}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};

export default ThemeToggle;
