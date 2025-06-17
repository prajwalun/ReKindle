"use client"

import type React from "react"
import { useState, useRef } from "react"
import { View, Text, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { CameraView, type CameraType, useCameraPermissions } from "expo-camera"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import type { RootStackParamList, ContactData } from "../types"

declare const __DEV__: boolean

type LinkedInQRScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "LinkedInQR">

interface Props {
  navigation: LinkedInQRScreenNavigationProp
}

const LinkedInQRScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme()
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<CameraType>("back")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  const handleRequestPermission = async () => {
    try {
      setIsRequestingPermission(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const result = await requestPermission()

      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Camera access is needed to scan LinkedIn QR codes. Please enable it in your device settings.",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => navigation.navigate("Main"),
            },
            {
              text: "Try Again",
              onPress: () => setIsRequestingPermission(false),
            },
          ],
        )
      }
    } catch (error) {
      __DEV__ && console.log("Camera permission error:", error)
      Alert.alert("Permission Error", "There was an error requesting camera permission. Please try again.", [
        {
          text: "OK",
          onPress: () => setIsRequestingPermission(false),
        },
      ])
    } finally {
      setIsRequestingPermission(false)
    }
  }

  const extractLinkedInProfileData = async (linkedinUrl: string): Promise<ContactData | null> => {
    try {
      // Parse LinkedIn URL to extract username/profile info
      const urlPattern = /linkedin\.com\/in\/([^/?]+)/i
      const match = linkedinUrl.match(urlPattern)

      if (!match) {
        throw new Error("Invalid LinkedIn URL format")
      }

      const username = match[1]

      // Since we can't access LinkedIn's API without authentication,
      // we'll extract what we can from the URL structure and make educated guesses

      // Convert LinkedIn username to a more readable name format
      const nameFromUsername = username
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
        .replace(/\d+$/, "") // Remove trailing numbers
        .trim()

      const contactData: ContactData = {
        name: nameFromUsername || "LinkedIn Contact",
        title: "", // We can't extract this from QR code alone
        company: "", // We can't extract this from QR code alone
        email: "", // LinkedIn QR codes don't include email
        linkedinUrl: linkedinUrl,
      }

      return contactData
    } catch (error) {
      __DEV__ && console.log("LinkedIn profile extraction error:", error)
      throw new Error("EXTRACTION_ERROR")
    }
  }

  const processLinkedInQR = async (qrData: string): Promise<ContactData | null> => {
    try {
      setIsProcessing(true)

      __DEV__ && console.log("LinkedIn QR Data:", qrData)

      // Simulate processing delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Extract profile data from the LinkedIn URL
      const extractedData = await extractLinkedInProfileData(qrData)

      return extractedData
    } catch (error) {
      __DEV__ && console.log("LinkedIn QR processing error:", error)
      throw new Error("PROCESSING_ERROR")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQRCodeScanned = async ({ data }: { data: string }) => {
    if (isProcessing) return

    // Check if it's a LinkedIn QR code
    if (!data.includes("linkedin.com")) {
      Alert.alert(
        "Not a LinkedIn QR Code",
        "Please scan a LinkedIn QR code. You can find this in the LinkedIn app under your profile.",
        [{ text: "OK", style: "default" }],
      )
      return
    }

    try {
      const extractedData = await processLinkedInQR(data)

      if (extractedData) {
        navigation.replace("ContactForm", { contactData: extractedData })
      }
    } catch (error) {
      Alert.alert(
        "Processing Error",
        "We couldn't extract profile information from this LinkedIn QR code. The contact form will open with the LinkedIn URL populated.",
        [
          {
            text: "Continue",
            style: "default",
            onPress: () => {
              // Still navigate with at least the LinkedIn URL
              navigation.replace("ContactForm", {
                contactData: {
                  name: "",
                  linkedinUrl: data.includes("linkedin.com") ? data : "",
                },
              })
            },
          },
          {
            text: "Try Again",
            style: "cancel",
          },
        ],
      )
    }
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"))
  }

  // Show loading while permission is being checked
  if (permission === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ fontSize: 16, color: colors.text, marginTop: 16 }}>Checking camera permissions...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Show permission request screen
  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 40 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "600", color: colors.text, marginLeft: 16 }}>Camera Access</Text>
          </View>

          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 30,
              }}
            >
              <Ionicons name="qr-code-outline" size={64} color="#0077B5" />
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "600",
                color: colors.text,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Camera Access Required
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                textAlign: "center",
                lineHeight: 24,
                marginBottom: 40,
                paddingHorizontal: 20,
              }}
            >
              We need access to your camera to scan LinkedIn QR codes and extract profile information automatically.
            </Text>

            <TouchableOpacity
              onPress={handleRequestPermission}
              disabled={isRequestingPermission}
              style={{
                backgroundColor: isRequestingPermission ? colors.border : "#0077B5",
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 200,
                marginBottom: 20,
              }}
              activeOpacity={0.8}
            >
              {isRequestingPermission ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>Requesting...</Text>
                </>
              ) : (
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>Grant Camera Access</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Main")} style={{ padding: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#0077B5",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Camera */}
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} onBarcodeScanned={handleQRCodeScanned} />

        {/* Header - Positioned absolutely over camera */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
            paddingTop: 60,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 1,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#FFFFFF", marginLeft: 16 }}>Scan LinkedIn QR</Text>
        </View>

        {/* Camera Overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 0,
          }}
        >
          {/* QR Frame */}
          <View
            style={{
              width: 250,
              height: 250,
              borderWidth: 3,
              borderColor: "#FFFFFF",
              borderRadius: 16,
              backgroundColor: "transparent",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
            }}
          />

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              textAlign: "center",
              marginTop: 20,
              paddingHorizontal: 40,
              textShadowColor: "rgba(0,0,0,0.8)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
          >
            Position the LinkedIn QR code within the frame
          </Text>

          {/* LinkedIn Badge */}
          <View
            style={{
              position: "absolute",
              top: 120,
              backgroundColor: "rgba(0,0,0,0.8)",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="logo-linkedin" size={16} color="#0077B5" />
            <Text style={{ color: "#FFFFFF", fontSize: 12, marginLeft: 8, fontWeight: "600" }}>
              LinkedIn Profile Scanner
            </Text>
          </View>

          {/* Instructions */}
          <View
            style={{
              position: "absolute",
              bottom: 200,
              left: 20,
              right: 20,
              backgroundColor: "rgba(0,0,0,0.6)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 14, textAlign: "center", marginBottom: 8 }}>
              How to find LinkedIn QR:
            </Text>
            <Text style={{ color: "#FFFFFF", fontSize: 12, textAlign: "center" }}>
              LinkedIn App → Your Profile → QR Code icon (top right)
            </Text>
          </View>

          {/* Processing Overlay */}
          {isProcessing && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.7)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                Extracting LinkedIn Profile...
              </Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
            zIndex: 1,
          }}
        >
          {/* Flip Camera Button */}
          <TouchableOpacity
            onPress={toggleCameraFacing}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "rgba(255,255,255,0.3)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default LinkedInQRScreen
