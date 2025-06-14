"use client"

import type React from "react"
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { Button } from "../components/Button"
import type { RootStackParamList, ContactData } from "../types"

type CameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Camera">

interface Props {
  navigation: CameraScreenNavigationProp
}

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme()

  const simulateCapture = () => {
    // Mock extracted data from business card
    const extractedData: ContactData = {
      name: "John Smith",
      title: "Senior Developer",
      company: "Tech Solutions Inc.",
      email: "john.smith@techsolutions.com",
      linkedinUrl: "https://linkedin.com/in/johnsmith",
    }

    navigation.navigate("ContactForm", { contactData: extractedData })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: colors.text,
              marginLeft: 16,
            }}
          >
            Scan Business Card
          </Text>
        </View>

        {/* Camera Placeholder */}
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            margin: 20,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="camera-outline" size={80} color={colors.textSecondary} />
          <Text
            style={{
              fontSize: 18,
              color: colors.text,
              marginTop: 20,
              marginBottom: 8,
            }}
          >
            Camera Preview
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: "center",
              paddingHorizontal: 40,
            }}
          >
            Position the business card within the frame and tap capture
          </Text>

          {/* Card Frame */}
          <View
            style={{
              width: 280,
              height: 160,
              borderWidth: 2,
              borderColor: colors.primary,
              borderRadius: 12,
              marginTop: 40,
              backgroundColor: "transparent",
            }}
          />
        </View>

        {/* Controls */}
        <View
          style={{
            padding: 20,
            alignItems: "center",
          }}
        >
          <Button
            title="Capture Business Card"
            onPress={simulateCapture}
            size="large"
            icon={<Ionicons name="camera" size={20} color="#FFFFFF" />}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default CameraScreen
