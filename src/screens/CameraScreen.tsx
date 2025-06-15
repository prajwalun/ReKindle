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

declare const __DEV__: boolean

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
    try {
      setIsRequestingPermission(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const result = await requestPermission()

      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Camera access is needed to scan business cards. Please enable it in your device settings.",
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
      // Silent logging - no console.error to prevent red banner
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

  const processImageWithOpenAI = async (imageUri: string): Promise<ContactData | null> => {
    try {
      setProcessingStep("Analyzing image...")

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      setProcessingStep("Processing business card...")

      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        // Silent development logging
        __DEV__ && console.log("No OpenAI API key found, returning mock data")
        await new Promise((resolve) => setTimeout(resolve, 2000))

        return {
          name: "John Smith",
          title: "Senior Software Engineer",
          company: "Tech Solutions Inc.",
          email: "john.smith@techsolutions.com",
          linkedinUrl: "https://linkedin.com/in/johnsmith",
        }
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Please analyze this image and determine if it's a business card. If it is a business card, extract all contact information and return it as a JSON object with the following structure:
{
  "isBusinessCard": true,
  "name": "Full name of the person",
  "title": "Job title/position",
  "company": "Company name",
  "email": "Email address",
  "phone": "Phone number",
  "website": "Website URL",
  "linkedin": "LinkedIn profile URL",
  "address": "Physical address if present"
}

If this is NOT a business card (e.g., it's a photo of a person, landscape, object, etc.), return:
{
  "isBusinessCard": false,
  "error": "This image does not appear to be a business card"
}

Only include fields that are clearly visible. If a field is not present or unclear, omit it from the response. Return only the JSON object, no additional text.`,
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
        // Silent logging for development
        __DEV__ && console.log("OpenAI API Error Response:", errorText)
        throw new Error(`API_ERROR_${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error("NO_CONTENT_RECEIVED")
      }

      setProcessingStep("Parsing information...")

      let extractedData: any
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        const jsonString = jsonMatch ? jsonMatch[0] : content
        extractedData = JSON.parse(jsonString)
      } catch (parseError) {
        // Silent logging for development
        __DEV__ && console.log("Failed to parse OpenAI response:", content)
        throw new Error("PARSE_ERROR")
      }

      // Check if it's actually a business card
      if (!extractedData.isBusinessCard) {
        throw new Error("NOT_BUSINESS_CARD")
      }

      const contactData: ContactData = {
        name: extractedData.name || "",
        title: extractedData.title || "",
        company: extractedData.company || "",
        email: extractedData.email || "",
        linkedinUrl: extractedData.linkedin || extractedData.website || "",
      }

      return contactData
    } catch (error) {
      // Silent logging for development only
      __DEV__ && console.log("OpenAI Vision processing error:", error)

      if (error instanceof Error && error.message === "NOT_BUSINESS_CARD") {
        throw error // Re-throw this specific error to handle it in the calling function
      }

      // For all other errors, throw a generic processing error
      throw new Error("PROCESSING_ERROR")
    }
  }

  const showBusinessCardError = () => {
    Alert.alert(
      "Not a Business Card",
      "We couldn't detect a business card in this image. Please make sure you're scanning a clear business card with visible text.",
      [
        {
          text: "Try Again",
          style: "default",
          onPress: () => {
            // Reset state for retry
            setCapturedImage(null)
            setProcessingStep("")
          },
        },
        {
          text: "Enter Manually",
          style: "cancel",
          onPress: () => {
            navigation.replace("ContactForm", {})
          },
        },
      ],
    )
  }

  const showProcessingError = () => {
    Alert.alert(
      "Processing Error",
      "We're having trouble reading this image. This could be due to poor image quality, lighting, or network issues.",
      [
        {
          text: "Try Again",
          style: "default",
          onPress: () => {
            setCapturedImage(null)
            setProcessingStep("")
          },
        },
        {
          text: "Enter Manually",
          style: "cancel",
          onPress: () => {
            navigation.replace("ContactForm", {})
          },
        },
      ],
    )
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

        try {
          const extractedData = await processImageWithOpenAI(photo.uri)

          if (extractedData) {
            setIsProcessing(false)
            navigation.replace("ContactForm", { contactData: extractedData })
          }
        } catch (processingError) {
          setIsProcessing(false)
          setCapturedImage(null)
          setProcessingStep("")

          if (processingError instanceof Error && processingError.message === "NOT_BUSINESS_CARD") {
            showBusinessCardError()
          } else {
            showProcessingError()
          }
        }
      }
    } catch (error) {
      // Silent logging for development
      __DEV__ && console.log("Camera capture error:", error)
      setIsProcessing(false)
      setCapturedImage(null)
      setProcessingStep("")

      Alert.alert("Camera Error", "We couldn't take a photo. Please try again or check your camera permissions.", [
        { text: "OK", style: "default" },
      ])
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

        try {
          const extractedData = await processImageWithOpenAI(result.assets[0].uri)

          if (extractedData) {
            setIsProcessing(false)
            navigation.replace("ContactForm", { contactData: extractedData })
          }
        } catch (processingError) {
          setIsProcessing(false)
          setCapturedImage(null)
          setProcessingStep("")

          if (processingError instanceof Error && processingError.message === "NOT_BUSINESS_CARD") {
            Alert.alert(
              "Not a Business Card",
              "The selected image doesn't appear to be a business card. Please choose an image of a business card with clear, readable text.",
              [
                {
                  text: "Choose Another",
                  style: "default",
                  onPress: () => pickImageFromGallery(),
                },
                {
                  text: "Enter Manually",
                  style: "cancel",
                  onPress: () => {
                    navigation.replace("ContactForm", {})
                  },
                },
              ],
            )
          } else {
            Alert.alert(
              "Image Processing Error",
              "We couldn't process the selected image. Please try choosing a different image or enter the contact details manually.",
              [
                {
                  text: "Try Another Image",
                  style: "default",
                  onPress: () => pickImageFromGallery(),
                },
                {
                  text: "Enter Manually",
                  style: "cancel",
                  onPress: () => {
                    navigation.replace("ContactForm", {})
                  },
                },
              ],
            )
          }
        }
      }
    } catch (error) {
      // Silent logging for development
      __DEV__ && console.log("Image picker error:", error)
      Alert.alert(
        "Gallery Error",
        "We couldn't access your photo gallery. Please check your permissions and try again.",
        [{ text: "OK", style: "default" }],
      )
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

            <TouchableOpacity onPress={() => navigation.navigate("Main")} style={{ padding: 12 }}>
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

  if (isProcessing && capturedImage) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 20,
              paddingTop: 60,
              backgroundColor: colors.background,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <TouchableOpacity onPress={retryCapture}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "600", color: colors.text, marginLeft: 16 }}>
              Processing Business Card
            </Text>
          </View>

          {/* Main Content */}
          <View style={{ flex: 1, padding: 20 }}>
            {/* Card Preview */}
            <Card style={{ marginBottom: 30, padding: 0, overflow: "hidden" }}>
              <Image
                source={{ uri: capturedImage }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 16,
                }}
                resizeMode="cover"
              />

              {/* Overlay with AI badge */}
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontSize: 12, marginLeft: 6, fontWeight: "600" }}>AI Processing</Text>
              </View>
            </Card>

            {/* Processing Status */}
            <Card style={{ alignItems: "center", paddingVertical: 40 }}>
              {/* Animated Processing Indicator */}
              <View style={{ position: "relative", marginBottom: 24 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: colors.primary + "15",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>

                {/* Pulsing ring */}
                <View
                  style={{
                    position: "absolute",
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    borderWidth: 2,
                    borderColor: colors.primary + "30",
                    top: -10,
                    left: -10,
                  }}
                />
              </View>

              {/* Status Text */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: colors.text,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Analyzing Business Card
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginBottom: 20,
                  lineHeight: 22,
                }}
              >
                {processingStep || "Our AI is extracting contact information..."}
              </Text>

              {/* Processing Steps */}
              <View style={{ width: "100%", maxWidth: 280 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: colors.success,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={{ fontSize: 14, color: colors.text, flex: 1 }}>Image captured</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: processingStep?.includes("Analyzing") ? colors.primary : colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {processingStep?.includes("Analyzing") ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="eye-outline" size={12} color={colors.textSecondary} />
                    )}
                  </View>
                  <Text style={{ fontSize: 14, color: colors.text, flex: 1 }}>Analyzing with AI Vision</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: processingStep?.includes("Processing") ? colors.primary : colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {processingStep?.includes("Processing") ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="document-text-outline" size={12} color={colors.textSecondary} />
                    )}
                  </View>
                  <Text style={{ fontSize: 14, color: colors.text, flex: 1 }}>Extracting contact details</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: processingStep?.includes("Parsing") ? colors.primary : colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {processingStep?.includes("Parsing") ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="person-add-outline" size={12} color={colors.textSecondary} />
                    )}
                  </View>
                  <Text style={{ fontSize: 14, color: colors.text, flex: 1 }}>Preparing contact form</Text>
                </View>
              </View>
            </Card>

            {/* Tips Card */}
            <Card style={{ marginTop: 20, backgroundColor: colors.primary + "10" }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="bulb-outline" size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 4 }}>Pro Tip</Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>
                    While we process this card, you can prepare to add conversation context about your meeting.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
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
            paddingTop: 60,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 1,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#FFFFFF", marginLeft: 16 }}>Scan Business Card</Text>
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

        {/* Controls */}
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
