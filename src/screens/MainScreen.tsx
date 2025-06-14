"use client"

import type React from "react"
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { Card } from "../components/Card"
import type { RootStackParamList } from "../types"

type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">

interface Props {
  navigation: MainScreenNavigationProp
}

const MainScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 40,
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
        <View style={{ alignItems: "center", marginBottom: 60 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: colors.text,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Welcome Back! 👋
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: colors.textSecondary,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            Log a new networking conversation
          </Text>
        </View>

        {/* Action Cards */}
        <View style={{ flex: 1, justifyContent: "center", gap: 20 }}>
          <TouchableOpacity onPress={() => navigation.navigate("ContactForm", {})} activeOpacity={0.8}>
            <Card style={{ alignItems: "center", paddingVertical: 40 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Ionicons name="person-add-outline" size={36} color="#FFFFFF" />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Enter Contact Info
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Manually add contact details
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Camera")} activeOpacity={0.8}>
            <Card style={{ alignItems: "center", paddingVertical: 40 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.secondary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Ionicons name="camera-outline" size={36} color="#FFFFFF" />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Scan Business Card
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Capture and extract contact info
              </Text>
            </Card>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default MainScreen
