import { useState, useEffect, useCallback } from "react"

type Theme = "dark" | "light"

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark"
    const stored = localStorage.getItem("oma-theme") as Theme | null
    return stored ?? "dark"
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("dark", "light")
    root.classList.add(theme)
    localStorage.setItem("oma-theme", theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
  }, [])

  return { theme, toggleTheme, setTheme }
}
