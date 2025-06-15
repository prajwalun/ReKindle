"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { Ionicons } from "@expo/vector-icons"
import { Audio } from "expo-av"
import * as FileSystem from "expo-file-system"
import { useTheme } from "../contexts/ThemeContext"
import { Card } from "../components/Card"
import { Input } from "../components/Input"
import { copyToClipboard } from "../utils/clipboard"
import type { RootStackParamList, ContactData, GeneratedMessage } from "../types"

type ContactFormScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "ContactForm">
type ContactFormScreenRouteProp = RouteProp<RootStackParamList, "ContactForm">

interface Props {
  navigation: ContactFormScreenNavigationProp
  route: ContactFormScreenRouteProp
}

const { height: screenHeight } = Dimensions.get("window")

const ContactFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme()
  const { contactData } = route.params || {}

  const [formData, setFormData] = useState<ContactData>({
    name: "",
    title: "",
    company: "",
    email: "",
    linkedinUrl: "",
    conversationContext: "",
    ...contactData,
  })

  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null)
  const [generationStep, setGenerationStep] = useState("")
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const scrollViewRef = useRef<KeyboardAwareScrollView>(null)
  const recordingInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      console.log("Requesting permissions...")
      const permissionResponse = await Audio.requestPermissionsAsync()
      if (permissionResponse.status !== "granted") {
        Alert.alert("Permission Required", "Please grant microphone permission to record voice notes.")
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      console.log("Starting recording...")
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)

      setRecording(recording)
      setIsRecording(true)
      setRecordingDuration(0)

      // Start duration counter
      recordingInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)

      console.log("Recording started")
    } catch (err) {
      console.error("Failed to start recording", err)
      Alert.alert("Recording Error", "Failed to start recording. Please check microphone permissions.")
    }
  }

  const stopRecording = async () => {
    console.log("Stopping recording...")
    setIsRecording(false)

    if (recordingInterval.current) {
      clearInterval(recordingInterval.current)
      recordingInterval.current = null
    }

    try {
      await recording?.stopAndUnloadAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      })
      const uri = recording?.getURI()
      setRecording(null)

      if (uri) {
        setIsTranscribing(true)
        await transcribeAudio(uri)
      } else {
        Alert.alert("Recording Error", "No recording URI found.")
      }
    } catch (error) {
      console.error("Error stopping and unloading recording", error)
      Alert.alert("Recording Error", "Failed to stop recording.")
    }
  }

  const transcribeAudio = async (audioUri: string) => {
    try {
      console.log("Starting transcription...")

      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        throw new Error("OpenAI API key not found")
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(audioUri)
      console.log("Audio file info:", fileInfo)

      if (!fileInfo.exists) {
        throw new Error("Audio file does not exist")
      }

      // Create proper FormData
      const formData = new FormData()

      // Add the audio file - the preset will determine the format
      formData.append("file", {
        uri: audioUri,
        type: "audio/m4a",
        name: "audio.m4a",
      } as any)

      formData.append("model", "whisper-1")
      formData.append("language", "en")

      console.log("Sending to OpenAI Whisper API...")

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Whisper API Error:", errorText)

        // Try to parse error details
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(`Transcription failed: ${errorJson.error?.message || response.status}`)
        } catch {
          throw new Error(`Transcription failed: ${response.status} - ${errorText}`)
        }
      }

      // Parse JSON response (default format)
      const result = await response.json()
      const transcribedText = result.text

      console.log("Transcription result:", transcribedText)

      if (transcribedText && transcribedText.trim()) {
        // Add the transcribed text to conversation context
        setFormData((prev) => ({
          ...prev,
          conversationContext: prev.conversationContext
            ? `${prev.conversationContext} ${transcribedText.trim()}`
            : transcribedText.trim(),
        }))

        Alert.alert("✅ Transcription Complete", `Added: "${transcribedText.trim()}"`)
      } else {
        Alert.alert("No Speech Detected", "Please try recording again with clearer speech.")
      }
    } catch (error) {
      console.error("Transcription error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      Alert.alert("Transcription Failed", `Unable to transcribe: ${errorMessage}\n\nPlease try again or type manually.`)
    } finally {
      setIsTranscribing(false)
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording()
    } else {
      await startRecording()
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const generateFollowUpWithOpenAI = async (): Promise<string> => {
    try {
      setGenerationStep("Connecting to OpenAI...")

      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        console.log("No OpenAI API key found, using fallback")
        setGenerationStep("Using fallback message...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return `Hi ${formData.name},\n\nIt was great meeting you${formData.company ? ` at ${formData.company}` : ""}! ${formData.conversationContext ? `I enjoyed our conversation about ${formData.conversationContext.slice(0, 100)}${formData.conversationContext.length > 100 ? "..." : ""}` : "I hope we can continue our conversation soon."}\n\nI'd love to stay connected and explore potential collaboration opportunities.\n\nBest regards!`
      }

      setGenerationStep("Preparing your message...")

      const prompt = `You are a professional assistant helping generate personalized networking follow-up messages.

The user recently met a contact at an event, and wants to send them a polite, friendly, and professional follow-up message.

Here is the contact's information:

- Name: ${formData.name}
- Title: ${formData.title || "Not specified"}
- Company: ${formData.company || "Not specified"}
- Email: ${formData.email || "Not specified"}
- LinkedIn URL: ${formData.linkedinUrl || "Not specified"}

Here is a brief summary of the conversation they had:

"${formData.conversationContext || "General networking conversation"}"

Your task:

- Write a short, professional LinkedIn message (3 to 5 sentences).
- Start with a brief friendly opener referencing that they met.
- Acknowledge something relevant from the conversation context.
- Express interest in staying connected or following up.
- Maintain a natural tone suitable for LinkedIn or professional email.
- Do not include email addresses or phone numbers.
- Do not make up information not provided.

Now generate the message.`

      setGenerationStep("AI is analyzing your conversation...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      try {
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
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("OpenAI API Error Response:", errorText)
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
        }

        setGenerationStep("Finalizing your message...")

        const data = await response.json()
        const content = data.choices[0]?.message?.content

        if (!content) {
          throw new Error("No content received from OpenAI API")
        }

        return content.trim()
      } catch (fetchError) {
        clearTimeout(timeoutId)
        throw fetchError
      }
    } catch (error) {
      console.error("OpenAI API Error:", error)
      throw error
    }
  }

  const generateFollowUp = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Missing Information", "Please enter the contact's name to generate a follow-up message.")
      return
    }

    setIsGenerating(true)
    setGeneratedMessage(null)
    setGenerationStep("Starting generation...")

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd(true);
    }, 300)

    try {
      const message = await generateFollowUpWithOpenAI()

      setGeneratedMessage({
        message,
        timestamp: new Date().toISOString(),
      })

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd(true);
      }, 100)
    } catch (error) {
      console.error("Error generating follow-up message:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      Alert.alert(
        "Generation Failed",
        `We couldn't generate your follow-up message right now.\n\nError: ${errorMessage}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Use Template",
            style: "default",
            onPress: () => {
              const fallbackMessage = `Hi ${formData.name},\n\nIt was wonderful meeting you${formData.company ? ` at ${formData.company}` : ""}! ${formData.conversationContext ? `I really enjoyed our conversation about ${formData.conversationContext.slice(0, 100)}${formData.conversationContext.length > 100 ? "..." : ""}` : "I hope we can continue our conversation soon."}\n\nI'd love to stay connected and explore potential collaboration opportunities.\n\nBest regards!`

              setGeneratedMessage({
                message: fallbackMessage,
                timestamp: new Date().toISOString(),
              })

              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd(true);
              }, 100)
            },
          },
        ],
      )
    } finally {
      setIsGenerating(false)
      setGenerationStep("")
    }
  }

  const handleCopyToClipboard = async () => {
    if (generatedMessage) {
      try {
        const success = await copyToClipboard(generatedMessage.message)
        if (success) {
          Alert.alert("✅ Copied!", "Message copied to clipboard successfully")
        } else {
          Alert.alert("❌ Copy Failed", "Unable to copy message to clipboard")
        }
      } catch (error) {
        console.error("Copy error:", error)
        Alert.alert("❌ Copy Failed", "Unable to copy message to clipboard")
      }
    }
  }

  const regenerateMessage = () => {
    setGeneratedMessage(null)
    generateFollowUp()
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === "ios"}
        extraHeight={120}
        extraScrollHeight={120}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 30,
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
            Contact Information
          </Text>
        </View>

        {/* Contact Form */}
        <Card style={{ marginBottom: 20 }}>
          <Input
            label="Name"
            value={formData.name}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
            placeholder="Enter full name"
            required
          />

          <Input
            label="Title"
            value={formData.title || ""}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
            placeholder="Job title"
          />

          <Input
            label="Company"
            value={formData.company || ""}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, company: text }))}
            placeholder="Company name"
          />

          <Input
            label="Email"
            value={formData.email || ""}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
            placeholder="email@example.com"
            keyboardType="email-address"
          />

          <Input
            label="LinkedIn URL"
            value={formData.linkedinUrl || ""}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, linkedinUrl: text }))}
            placeholder="https://linkedin.com/in/username"
            keyboardType="url"
          />
        </Card>

        {/* Conversation Context */}
        <Card style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                flex: 1,
              }}
            >
              Conversation Context
            </Text>
            <TouchableOpacity
              onPress={toggleRecording}
              disabled={isTranscribing}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: isRecording ? colors.error : isTranscribing ? colors.border : colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isTranscribing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name={isRecording ? "stop" : "mic"} size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <Input
            value={formData.conversationContext || ""}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, conversationContext: text }))}
            placeholder="What did you talk about? Include specific topics, interests, or projects discussed. You can also use the microphone to record your thoughts."
            multiline
            numberOfLines={4}
          />

          {isRecording && (
            <View
              style={{
                backgroundColor: colors.error + "20",
                borderRadius: 8,
                padding: 12,
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.error,
                  marginRight: 8,
                }}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.error,
                  fontWeight: "600",
                }}
              >
                Recording... {formatRecordingTime(recordingDuration)}
              </Text>
            </View>
          )}

          {isTranscribing && (
            <View
              style={{
                backgroundColor: colors.primary + "20",
                borderRadius: 8,
                padding: 12,
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.primary,
                  fontWeight: "600",
                }}
              >
                Transcribing your voice note...
              </Text>
            </View>
          )}
        </Card>

        {/* AI Generation Info */}
        <Card style={{ marginBottom: 20, backgroundColor: colors.surface }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>AI-Powered Follow-Up</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Powered by OpenAI GPT-4o & Whisper</Text>
            </View>
          </View>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
            Use voice recording or type to describe your conversation. Our AI will generate a personalized, professional
            follow-up message that references your specific discussion points.
          </Text>
        </Card>

        {/* Generate Follow-Up Button */}
        <TouchableOpacity
          onPress={generateFollowUp}
          disabled={isGenerating}
          style={{
            backgroundColor: isGenerating ? colors.border : colors.primary,
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            opacity: isGenerating ? 0.8 : 1,
          }}
          activeOpacity={0.8}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>Generating...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>Generate Follow-Up</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Loading State */}
        {isGenerating && (
          <Card
            style={{
              marginBottom: 20,
              alignItems: "center",
              paddingVertical: 32,
              backgroundColor: colors.surface,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              Generating Your Message
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              {generationStep || "Please wait..."}
            </Text>
          </Card>
        )}

        {/* Generated Message */}
        {generatedMessage && !isGenerating && (
          <Card style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.success,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                }}
              >
                Your Follow-Up Message
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.text,
                  lineHeight: 24,
                }}
              >
                {generatedMessage.message}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
              {/* Copy Button */}
              <TouchableOpacity
                onPress={handleCopyToClipboard}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF", marginLeft: 6 }}>Copy</Text>
              </TouchableOpacity>

              {/* Regenerate Button */}
              <TouchableOpacity
                onPress={regenerateMessage}
                style={{
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Ionicons name="refresh-outline" size={16} color={colors.text} />
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text, marginLeft: 6 }}>Regenerate</Text>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                textAlign: "center",
                marginTop: 12,
              }}
            >
              Generated {new Date(generatedMessage.timestamp).toLocaleString()}
            </Text>
          </Card>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default ContactFormScreen
