"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useColorScheme } from "react-native"

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    success: string
    error: string
  }
}

const lightColors = {
  primary: "#007AFF",
  secondary: "#5856D6",
  background: "#FFFFFF",
  surface: "#F2F2F7",
  text: "#000000",
  textSecondary: "#8E8E93",
  border: "#C6C6C8",
  success: "#34C759",
  error: "#FF3B30",
}

const darkColors = {
  primary: "#0A84FF",
  secondary: "#5E5CE6",
  background: "#000000",
  surface: "#1C1C1E",
  text: "#FFFFFF",
  textSecondary: "#8E8E93",
  border: "#38383A",
  success: "#30D158",
  error: "#FF453A",
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [isDark, setIsDark] = useState(systemColorScheme === "dark")

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const colors = isDark ? darkColors : lightColors

  return <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
