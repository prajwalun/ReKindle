"use client"

import type React from "react"
import { TouchableOpacity, Text, ActivityIndicator, Animated } from "react-native"
import { useRef } from "react"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "../contexts/ThemeContext"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "small" | "medium" | "large"
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}) => {
  const { colors } = useTheme()
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 16,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      opacity: disabled ? 0.6 : 1,
      ...(fullWidth && { width: "100%" as const }),
    }

    const sizeStyles = {
      small: { paddingHorizontal: 20, paddingVertical: 10 },
      medium: { paddingHorizontal: 28, paddingVertical: 14 },
      large: { paddingHorizontal: 36, paddingVertical: 18 },
    }

    return { ...baseStyle, ...sizeStyles[size] }
  }

  const getTextStyle = () => {
    const baseStyle = {
      fontWeight: "600" as const,
      marginLeft: icon ? 8 : 0,
      letterSpacing: 0.3,
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
      ghost: { color: colors.text },
    }

    return [baseStyle, sizeStyles[size], variantStyles[variant]]
  }

  const renderButton = () => {
    const buttonStyle = getButtonStyle()

    if (variant === "primary") {
      return (
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={buttonStyle}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              {icon}
              <Text style={getTextStyle()}>{title}</Text>
            </>
          )}
        </LinearGradient>
      )
    }

    const variantStyles = {
      secondary: {
        backgroundColor: colors.secondary,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: colors.primary,
      },
      ghost: {
        backgroundColor: colors.surface,
      },
    }

    return (
      <TouchableOpacity
        style={[buttonStyle, variantStyles[variant]]}
        onPress={onPress}
        disabled={disabled || loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
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

  return <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>{renderButton()}</Animated.View>
}
