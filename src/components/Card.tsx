"use client"

import type React from "react"
import { View } from "react-native"
import { useTheme } from "../contexts/ThemeContext"

interface CardProps {
  children: React.ReactNode
  style?: any
  padding?: number
}

export const Card: React.FC<CardProps> = ({ children, style, padding = 16 }) => {
  const { colors } = useTheme()

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}
