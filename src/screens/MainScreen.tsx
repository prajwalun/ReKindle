"use client"

import type React from "react"
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import type { RootStackParamList } from "../types"

type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">

interface Props {
  navigation: MainScreenNavigationProp
}

const MainScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 24 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 48,
          }}
        >
          <TouchableOpacity onPress={() => navigation.navigate("History")}>
            <Ionicons name="time-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleTheme}>
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Welcome Message */}
        <View style={{ alignItems: "center", marginBottom: 56 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "600",
              color: colors.text,
              textAlign: "center",
              marginBottom: 12,
              letterSpacing: -0.5,
            }}
          >
            Welcome to ReKindle
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: "center",
              lineHeight: 22,
              fontWeight: "400",
            }}
          >
            Capture and nurture professional connections
          </Text>
        </View>

        {/* Main Action Cards - Two Primary Options */}
        <View style={{ flex: 1, justifyContent: "center" }}>
          {/* Primary Scanning Options */}
          <View style={{ gap: 16, marginBottom: 40 }}>
            {/* Business Card Scanning */}
            <TouchableOpacity onPress={() => navigation.navigate("Camera")} activeOpacity={0.7}>
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 40,
                  paddingHorizontal: 24,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="card-outline" size={28} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 6,
                    letterSpacing: -0.3,
                  }}
                >
                  Scan Business Card
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  AI-powered contact extraction
                </Text>
              </View>
            </TouchableOpacity>

            {/* LinkedIn QR Code Scanning */}
            <TouchableOpacity onPress={() => navigation.navigate("LinkedInQR")} activeOpacity={0.7}>
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 40,
                  paddingHorizontal: 24,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "#0077B5",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="qr-code-outline" size={28} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 6,
                    letterSpacing: -0.3,
                  }}
                >
                  Scan LinkedIn QR
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  Extract profile information
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Simple Manual Entry Link */}
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ContactForm", {})}
              activeOpacity={0.7}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: colors.primary,
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                Enter contact details manually
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default MainScreen
