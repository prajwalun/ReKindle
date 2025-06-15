"use client"

import type React from "react"
import { useState, useRef } from "react"
import { View, Text, SafeAreaView, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { CameraView, type CameraType, useCameraPermissions } from "expo-camera"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { Card } from "../components/Card"
import type { RootStackParamList, ContactData } from "../types"

type CameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Camera">

interface Props {
  navigation: CameraScreenNavigationProp
}

interface OpenAIResponse {
  name?: string
  title?: string
  company?: string
  email?: string
  phone?: string
  website?: string
  linkedin?: string
  address?: string
}

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme()
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<CameraType>("back")
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState("")
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  const handleRequestPermission = async () => {
    console.log("Permission request started...")

    try {
      setIsRequestingPermission(true)

      // Add a small delay to show the loading state
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log("Calling requestPermission...")
      const result = await requestPermission()
      console.log("Permission result:", result)

      if (!result.granted) {
        console.log("Permission denied")
        Alert.alert(
          "Camera Permission Required",
          "Camera access is needed to scan business cards. Please enable it in your device settings.",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
            {
              text: "Try Again",
              onPress: () => {
                // Reset and try again
                setIsRequestingPermission(false)
              },
            },
          ],
        )
      } else {
        console.log("Permission granted!")
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error)
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
          {/* Header with back button */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 40 }}>
            <TouchableOpacity
              onPress={() => {
                console.log("Back button pressed")
                navigation.goBack()
              }}
              style={{
                padding: 8, // Add padding for better touch target
              }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "600", color: colors.text, marginLeft: 16 }}>Camera Access</Text>
          </View>

          {/* Permission content */}
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
              <Ionicons name="camera-outline" size={64} color={colors.primary} />
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
              We need access to your camera to scan business cards and extract contact information automatically.
            </Text>

            {/* Grant Permission Button */}
            <TouchableOpacity
              onPress={handleRequestPermission}
              disabled={isRequestingPermission}
              style={{
                backgroundColor: isRequestingPermission ? colors.border : colors.primary,
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

            {/* Alternative back button */}
            <TouchableOpacity
              onPress={() => {
                console.log("Go back text pressed")
                navigation.goBack()
              }}
              style={{ padding: 12 }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.primary,
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

  const processImageWithOpenAI = async (imageUri: string): Promise<ContactData | null> => {
    try {
      setProcessingStep("Converting image...")

      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      setProcessingStep("Analyzing business card...")

      // For demo purposes, let's return mock data if no API key is set
      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        console.log("No OpenAI API key found, returning mock data")
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate processing time

        return {
          name: "John Smith",
          title: "Senior Software Engineer",
          company: "Tech Solutions Inc.",
          email: "john.smith@techsolutions.com",
          linkedinUrl: "https://linkedin.com/in/johnsmith",
        }
      }

      // Call OpenAI Vision API with correct model name
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o", // Updated to use the correct model name
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Please extract all contact information from this business card image and return it as a JSON object with the following structure:
{
  "name": "Full name of the person",
  "title": "Job title/position",
  "company": "Company name",
  "email": "Email address",
  "phone": "Phone number",
  "website": "Website URL",
  "linkedin": "LinkedIn profile URL",
  "address": "Physical address if present"
}

Only include fields that are clearly visible on the business card. If a field is not present or unclear, omit it from the response. Return only the JSON object, no additional text.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64}`,
                    detail: "high",
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0.1,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("OpenAI API Error Response:", errorText)
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error("No content received from OpenAI")
      }

      setProcessingStep("Parsing information...")

      // Parse the JSON response
      let extractedData: OpenAIResponse
      try {
        // Clean the response in case there's extra text
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        const jsonString = jsonMatch ? jsonMatch[0] : content
        extractedData = JSON.parse(jsonString)
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", content)
        throw new Error("Failed to parse extracted information")
      }

      // Convert to ContactData format
      const contactData: ContactData = {
        name: extractedData.name || "",
        title: extractedData.title || "",
        company: extractedData.company || "",
        email: extractedData.email || "",
        linkedinUrl: extractedData.linkedin || extractedData.website || "",
      }

      return contactData
    } catch (error) {
      console.error("OpenAI Vision Error:", error)
      throw error
    }
  }

  const takePicture = async () => {
    if (!cameraRef.current) return

    setIsProcessing(true)
    setProcessingStep("Capturing image...")

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      })

      if (photo?.uri) {
        setCapturedImage(photo.uri)

        // Process the image with OpenAI Vision
        const extractedData = await processImageWithOpenAI(photo.uri)

        if (extractedData) {
          setIsProcessing(false)
          navigation.navigate("ContactForm", { contactData: extractedData })
        } else {
          throw new Error("No data could be extracted from the business card")
        }
      }
    } catch (error) {
      console.error("Error processing business card:", error)
      Alert.alert(
        "Processing Error",
        "Failed to extract information from the business card. Please try again or enter details manually.",
        [
          { text: "Try Again", style: "default" },
          {
            text: "Enter Manually",
            onPress: () => navigation.navigate("ContactForm", {}),
          },
        ],
      )
      setIsProcessing(false)
      setCapturedImage(null)
      setProcessingStep("")
    }
  }

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true)
        setProcessingStep("Loading image...")
        setCapturedImage(result.assets[0].uri)

        const extractedData = await processImageWithOpenAI(result.assets[0].uri)

        if (extractedData) {
          setIsProcessing(false)
          navigation.navigate("ContactForm", { contactData: extractedData })
        }
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to process the selected image")
      setIsProcessing(false)
      setCapturedImage(null)
      setProcessingStep("")
    }
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"))
  }

  const retryCapture = () => {
    setCapturedImage(null)
    setIsProcessing(false)
    setProcessingStep("")
  }

  if (isProcessing && capturedImage) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
            <TouchableOpacity onPress={retryCapture}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "600", color: colors.text, marginLeft: 16 }}>
              Processing Business Card
            </Text>
          </View>

          {/* Processing View */}
          <Card style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Image
              source={{ uri: capturedImage }}
              style={{ width: 300, height: 180, borderRadius: 12, marginBottom: 30 }}
              resizeMode="contain"
            />

            <View style={{ alignItems: "center" }}>
              <Ionicons name="sparkles" size={48} color={colors.primary} />
              <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text, marginTop: 16 }}>
                AI Processing...
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center", marginTop: 8 }}>
                {processingStep || "Analyzing your business card with AI"}
              </Text>

              {/* Animated dots */}
              <View style={{ flexDirection: "row", marginTop: 16 }}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.primary,
                      marginHorizontal: 4,
                      opacity: 0.3,
                    }}
                  />
                ))}
              </View>
            </View>
          </Card>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Camera */}
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />

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
            paddingTop: 60, // Account for status bar
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 1,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#FFFFFF", marginLeft: 16 }}>Scan Business Card</Text>
        </View>

        {/* Camera Overlay - Positioned absolutely over camera */}
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
          {/* Card Frame */}
          <View
            style={{
              width: 320,
              height: 200,
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
            Position the business card within the frame
          </Text>

          {/* AI Badge */}
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
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontSize: 12, marginLeft: 8, fontWeight: "600" }}>
              Powered by OpenAI Vision
            </Text>
          </View>

          {/* Tips */}
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
              💡 Tips for better results:
            </Text>
            <Text style={{ color: "#FFFFFF", fontSize: 12, textAlign: "center" }}>
              • Ensure good lighting • Keep card flat • Avoid shadows • Fill the frame
            </Text>
          </View>
        </View>

        {/* Controls - Positioned absolutely over camera */}
        <View
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            paddingHorizontal: 40,
            zIndex: 1,
          }}
        >
          {/* Gallery Button */}
          <TouchableOpacity
            onPress={pickImageFromGallery}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "rgba(255,255,255,0.3)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="images-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            onPress={takePicture}
            disabled={isProcessing}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isProcessing ? "rgba(255,255,255,0.5)" : "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 4,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Ionicons name="camera" size={32} color={colors.primary} />
          </TouchableOpacity>

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

export default CameraScreen
