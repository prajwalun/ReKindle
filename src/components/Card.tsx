"use client"

import type React from "react"
import { View } from "react-native"
import { useTheme } from "../contexts/ThemeContext"

interface CardProps {
  children: React.ReactNode
  style?: any
  padding?: number
  variant?: "default" | "elevated" | "outlined"
}

export const Card: React.FC<CardProps> = ({ children, style, padding = 16, variant = "default" }) => {
  const { colors, isDark } = useTheme()

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: 20,
      padding,
    }

    const variants = {
      default: {
        backgroundColor: colors.surface,
        shadowColor: isDark ? "#000" : "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 12,
        elevation: 6,
      },
      elevated: {
        backgroundColor: colors.surface,
        shadowColor: isDark ? "#000" : "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.4 : 0.15,
        shadowRadius: 20,
        elevation: 12,
      },
      outlined: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: isDark ? "#000" : "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 8,
        elevation: 3,
      },
    }

    return [baseStyle, variants[variant]]
  }

  return <View style={[getCardStyle(), style]}>{children}</View>
}
