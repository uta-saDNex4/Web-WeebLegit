"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mặc định luôn là 'light' (Giao diện Sáng)
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Khi tải xong phía Client, đọc localStorage (nếu người dùng đã từng chọn)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as ThemeMode | null;
      if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
        setThemeState(saved);
      } else {
        // Mặc định ban đầu tuyệt đối là 'light'
        setThemeState("light");
      }
    } catch {
      // Bỏ qua lỗi truy cập storage
    }
    setMounted(true);
  }, []);

  // Áp dụng class dark lên document.documentElement và lắng nghe thay đổi hệ thống
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let activeTheme: "light" | "dark" = "light";
      if (theme === "dark") {
        activeTheme = "dark";
      } else if (theme === "light") {
        activeTheme = "light";
      } else if (theme === "system") {
        activeTheme = mediaQuery.matches ? "dark" : "light";
      }

      setResolvedTheme(activeTheme);
      if (activeTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
    };

    applyTheme();

    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Bỏ qua
    }

    const handleMediaChange = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
