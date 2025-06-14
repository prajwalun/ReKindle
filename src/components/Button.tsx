"use client"

import type React from "react"
import { TouchableOpacity, Text, ActivityIndicator } from "react-native"
import { useTheme } from "../contexts/ThemeContext"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "outline"
  size?: "small" | "medium" | "large"
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
}) => {
  const { colors } = useTheme()

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 12,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      opacity: disabled ? 0.6 : 1,
    }

    const sizeStyles = {
      small: { paddingHorizontal: 16, paddingVertical: 8 },
      medium: { paddingHorizontal: 24, paddingVertical: 12 },
      large: { paddingHorizontal: 32, paddingVertical: 16 },
    }

    const variantStyles = {
      primary: { backgroundColor: colors.primary },
      secondary: { backgroundColor: colors.secondary },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: colors.primary,
      },
    }

    return [baseStyle, sizeStyles[size], variantStyles[variant]]
  }

  const getTextStyle = () => {
    const baseStyle = {
      fontWeight: "600" as const,
      marginLeft: icon ? 8 : 0,
    }

    const sizeStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    }

    const variantStyles = {
      primary: { color: "#FFFFFF" },
      secondary: { color: "#FFFFFF" },
      outline: { color: colors.primary },
    }

    return [baseStyle, sizeStyles[size], variantStyles[variant]]
  }

  return (
    <TouchableOpacity style={getButtonStyle()} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? colors.primary : "#FFFFFF"} />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}
