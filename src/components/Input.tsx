"use client"

import type React from "react"
import { TextInput, Text, View } from "react-native"
import { useTheme } from "../contexts/ThemeContext"

interface InputProps {
  label?: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  multiline?: boolean
  numberOfLines?: number
  required?: boolean
  keyboardType?: "default" | "email-address" | "url"
  style?: any
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  required = false,
  keyboardType = "default",
  style,
}) => {
  const { colors } = useTheme()

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 8,
          }}
        >
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}
      <TextInput
        style={[
          {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: colors.text,
            minHeight: multiline ? numberOfLines * 24 + 32 : 52,
            textAlignVertical: multiline ? "top" : "center",
          },
          style,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
      />
    </View>
  )
}
