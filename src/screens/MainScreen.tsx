"use client"

import type React from "react"
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions, Animated } from "react-native"
import { useEffect, useRef } from "react"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "../contexts/ThemeContext"
import type { RootStackParamList } from "../types"

type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Main">

interface Props {
  navigation: MainScreenNavigationProp
}

const { width } = Dimensions.get("window")

const MainScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={isDark ? [colors.background, colors.surface] : [colors.background, "#F8FAFC"]}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, padding: 24 }}>
          {/* Header */}
          <Animated.View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 48,
              opacity: fadeAnim,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("History")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="time-outline" size={22} color={colors.text} />
            </TouchableOpacity>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.text,
                  letterSpacing: 0.5,
                }}
              >
                ReKindle
              </Text>
              <View
                style={{
                  width: 30,
                  height: 2,
                  backgroundColor: colors.primary,
                  borderRadius: 1,
                  marginTop: 4,
                }}
              />
            </View>

            <TouchableOpacity
              onPress={toggleTheme}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>

          {/* Welcome Section */}
          <Animated.View
            style={{
              alignItems: "center",
              marginBottom: 60,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Ionicons name="people" size={36} color="#FFFFFF" />
            </View>

            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: colors.text,
                textAlign: "center",
                marginBottom: 12,
                letterSpacing: -0.5,
              }}
            >
              Ready to Network?
            </Text>
            <Text
              style={{
                fontSize: 17,
                color: colors.textSecondary,
                textAlign: "center",
                lineHeight: 24,
                paddingHorizontal: 20,
              }}
            >
              Capture conversations and build meaningful connections
            </Text>
          </Animated.View>

          {/* Primary Action - Scan Business Card */}
          <Animated.View
            style={{
              marginBottom: 24,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <TouchableOpacity onPress={() => navigation.navigate("Camera")} activeOpacity={0.95}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 24,
                  padding: 32,
                  alignItems: "center",
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                  elevation: 12,
                }}
              >
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Ionicons name="scan" size={36} color="#FFFFFF" />
                </View>

                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: "#FFFFFF",
                    marginBottom: 8,
                    letterSpacing: 0.3,
                  }}
                >
                  Scan Business Card
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.9)",
                    textAlign: "center",
                    lineHeight: 22,
                  }}
                >
                  Instantly capture and extract contact details
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 20,
                  }}
                >
                  <Ionicons name="flash" size={16} color="#FFFFFF" />
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#FFFFFF",
                      marginLeft: 6,
                      fontWeight: "600",
                    }}
                  >
                    Recommended
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Manual Entry Option - One Liner */}
          <Animated.View
            style={{
              alignItems: "center",
              marginBottom: 40,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("ContactForm", {})}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 12,
                backgroundColor: colors.surface,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  marginLeft: 8,
                  marginRight: 4,
                }}
              >
                Or enter details manually
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Bottom Tips - Updated Version */}
          <Animated.View
            style={{
              alignItems: "center",
              opacity: fadeAnim,
            }}
          >
            {/* Option 1: More honest about scanning */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: colors.surface,
                borderRadius: 16,
                marginBottom: 16,
              }}
            >
              <Ionicons name="bulb-outline" size={16} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginLeft: 6,
                }}
              >
                Tip: Try scanning first, then edit if needed
              </Text>
            </View>

            {/* Features explanation */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: colors.surface,
                borderRadius: 16,
              }}
            >
              <Ionicons name="sparkles-outline" size={16} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginLeft: 6,
                }}
              >
                Auto-location • Voice notes • Smart follow-ups
              </Text>
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default MainScreen
