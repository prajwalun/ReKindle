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
  Animated,
} from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { Ionicons } from "@expo/vector-icons"
import { Audio } from "expo-av"
import { useTheme } from "../contexts/ThemeContext"
import { useLocation } from "../contexts/LocationContext"
import { Card } from "../components/Card"
import { Input } from "../components/Input"
import { copyToClipboard } from "../utils/clipboard"
import { saveContact } from "../utils/storage"
import type { RootStackParamList, ContactData, GeneratedMessage } from "../types"
import type { StoredContact } from "../utils/storage"

declare const __DEV__: boolean

type ContactFormScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "ContactForm">
type ContactFormScreenRouteProp = RouteProp<RootStackParamList, "ContactForm">

interface Props {
  navigation: ContactFormScreenNavigationProp
  route: ContactFormScreenRouteProp
}

const { height: screenHeight } = Dimensions.get("window")

const ContactFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme()
  const { getCurrentLocation } = useLocation()
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
  const [isSaving, setIsSaving] = useState(false)

  const scrollViewRef = useRef<KeyboardAwareScrollView>(null)
  const recordingStartTime = useRef<number>(0)
  const recordingTimeout = useRef<NodeJS.Timeout | null>(null)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const waveAnim1 = useRef(new Animated.Value(0)).current
  const waveAnim2 = useRef(new Animated.Value(0)).current
  const waveAnim3 = useRef(new Animated.Value(0)).current

const updateRecordingDuration = () => {
  const elapsed = Math.floor((Date.now() - recordingStartTime.current) / 1000);
  setRecordingDuration(elapsed);
  recordingTimeout.current = setTimeout(updateRecordingDuration, 1000);
};

useEffect(() => {
  return () => {
    if (recordingTimeout.current) {
      clearTimeout(recordingTimeout.current);
      recordingTimeout.current = null;
    }

    if (recording) {
      recording.stopAndUnloadAsync().catch(() => {});
    }
  };
}, []);



  const startPulseAnimation = () => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    )

    const waveAnimation = Animated.loop(
      Animated.stagger(300, [
        Animated.sequence([
          Animated.timing(waveAnim1, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim1, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(waveAnim2, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim2, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(waveAnim3, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim3, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    )

    pulseAnimation.start()
    waveAnimation.start()
  }

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation()
    waveAnim1.stopAnimation()
    waveAnim2.stopAnimation()
    waveAnim3.stopAnimation()

    pulseAnim.setValue(1)
    waveAnim1.setValue(0)
    waveAnim2.setValue(0)
    waveAnim3.setValue(0)
  }

  const transcribeAudio = async (audioUri: string): Promise<string> => {
    try {
      if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
        return ""
      }

      const formData = new FormData()
      formData.append("file", {
        uri: audioUri,
        type: "audio/m4a",
        name: "audio.m4a",
      } as any)

      formData.append("model", "whisper-1")
      formData.append("language", "en")

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: formData,
      })

      if (!response.ok) {
        // Silent logging for development
        if (__DEV__) console.log("Whisper API Error:", await response.text())
        return ""
      }

      const result = await response.json()
      return result.text || ""
    } catch (error) {
      // Silent logging for development
      __DEV__ && console.log("Transcription error:", error)
      return ""
    }
  }

const startRecording = async () => {
  try {
    const permissionResponse = await Audio.requestPermissionsAsync();
    if (permissionResponse.status !== "granted") {
      Alert.alert("Permission Required", "Please grant microphone permission to record voice notes.");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

    setRecording(recording);
    setIsRecording(true);

    // Start timer after slight delay (fixes zero-stuck issue)
    recordingStartTime.current = Date.now();
    setRecordingDuration(0);
    setTimeout(updateRecordingDuration, 500); // 👈 KEY LINE

    startPulseAnimation();
  } catch (err) {
    __DEV__ && console.log("Failed to start recording", err);
    Alert.alert(
      "Recording Error",
      "We couldn't start recording. Please check your microphone permissions and try again.",
      [{ text: "OK", style: "default" }]
    );
  }
};



  const stopRecording = async () => {
    setIsRecording(false)
    stopPulseAnimation()

    // Clear the timer
    if (recordingTimeout.current) {
      clearTimeout(recordingTimeout.current)
      recordingTimeout.current = null
    }

    try {
      if (recording) {
        await recording.stopAndUnloadAsync()
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        })

        const uri = recording.getURI()
        setRecording(null)

        if (uri) {
          setIsTranscribing(true)
          const transcribedText = await transcribeAudio(uri)

          if (transcribedText.trim()) {
            setFormData((prev) => ({
              ...prev,
              conversationContext: prev.conversationContext
                ? `${prev.conversationContext} ${transcribedText.trim()}`
                : transcribedText.trim(),
            }))

            Alert.alert(
              "Recording Complete",
              "Your voice note has been transcribed and added to the conversation context.",
              [{ text: "Continue", style: "default" }],
            )
          } else {
            Alert.alert(
              "No Speech Detected",
              "We couldn't detect any speech in your recording. Please try again and speak clearly into the microphone.",
              [{ text: "Try Again", style: "default" }],
            )
          }

          setIsTranscribing(false)
        }
      }
    } catch (error) {
      // Silent logging for development
      __DEV__ && console.log("Error stopping recording", error)
      Alert.alert("Recording Error", "There was an issue processing your recording. Please try recording again.", [
        { text: "OK", style: "default" },
      ])
      setIsTranscribing(false)
    } finally {
      // Reset duration after processing
      setRecordingDuration(0)
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
        setGenerationStep("Using template message...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return `Hi ${formData.name},\n\nIt was great meeting you${formData.company ? ` at ${formData.company}` : ""}! ${formData.conversationContext ? `I enjoyed our conversation about ${formData.conversationContext.slice(0, 100)}${formData.conversationContext.length > 100 ? "..." : ""}` : "I hope we can continue our conversation soon."}\n\nI'd love to stay connected and explore potential collaboration opportunities.\n\nBest regards!`
      }

      setGenerationStep("Analyzing conversation context...")

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

      setGenerationStep("Crafting your personalized message...")

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
          // Silent logging for development
          __DEV__ && console.log("OpenAI API Error Response:", errorText)
          throw new Error(`API_ERROR_${response.status}`)
        }

        setGenerationStep("Finalizing your message...")

        const data = await response.json()
        const content = data.choices[0]?.message?.content

        if (!content) {
          throw new Error("NO_CONTENT_RECEIVED")
        }

        return content.trim()
      } catch (fetchError) {
        clearTimeout(timeoutId)
        throw fetchError
      }
    } catch (error) {
      // Silent logging for development
      __DEV__ && console.log("OpenAI API Error:", error)
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
      // Silent logging for development
      __DEV__ && console.log("Error generating follow-up message:", error)

      const errorTitle = "Generation Failed"
      let errorMessage = "We couldn't generate your follow-up message right now."

      if (error instanceof Error) {
        if (error.message.includes("API_ERROR")) {
          errorMessage = "There's an issue with the AI service right now. Please try using a template message instead."
        } else if (error.message.includes("NO_CONTENT")) {
          errorMessage = "The AI service didn't return a response. Please try again or use a template message."
        } else {
          errorMessage = "Please check your internet connection and try again."
        }
      }

      Alert.alert(errorTitle, errorMessage, [
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
      ])
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
          Alert.alert("Copied", "Message copied to clipboard successfully")
        } else {
          Alert.alert("Copy Failed", "Unable to copy message to clipboard")
        }
      } catch (error) {
        // Silent logging for development
        __DEV__ && console.log("Copy error:", error)
        Alert.alert("Copy Failed", "Unable to copy message to clipboard")
      }
    }
  }

  const saveContactToHistory = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Missing Information", "Please enter the contact's name before saving.")
      return
    }

    setIsSaving(true)

    try {
      const location = await getCurrentLocation()
      const contactId = Date.now().toString()

      const storedContact: StoredContact = {
        ...formData,
        id: contactId,
        timestamp: new Date().toISOString(),
        location: location || undefined,
        followUpMessage: generatedMessage?.message,
        generatedAt: generatedMessage?.timestamp,
      }

      await saveContact(storedContact)

      Alert.alert("Contact Saved", "Contact has been successfully saved to your history.", [
        {
          text: "View History",
          onPress: () => {
            navigation.reset({
              index: 1,
              routes: [{ name: "Main" }, { name: "History" }],
            })
          },
        },
        {
          text: "Done",
          style: "default",
          onPress: () => navigation.navigate("Main"),
        },
      ])
    } catch (error) {
      // Silent logging for development
      __DEV__ && console.log("Error saving contact:", error)
      Alert.alert("Save Failed", "Unable to save contact. Please try again.")
    } finally {
      setIsSaving(false)
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

        {/* Voice Recording Section */}
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
              Voice Recording
            </Text>
          </View>

          {/* Enhanced Recording UI */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
              {/* Animated waves */}
              {isRecording && (
                <>
                  <Animated.View
                    style={{
                      position: "absolute",
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      backgroundColor: colors.primary + "15",
                      opacity: waveAnim1,
                      transform: [{ scale: waveAnim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }],
                    }}
                  />
                  <Animated.View
                    style={{
                      position: "absolute",
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      backgroundColor: colors.primary + "25",
                      opacity: waveAnim2,
                      transform: [{ scale: waveAnim2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }],
                    }}
                  />
                  <Animated.View
                    style={{
                      position: "absolute",
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: colors.primary + "35",
                      opacity: waveAnim3,
                      transform: [{ scale: waveAnim3.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }],
                    }}
                  />
                </>
              )}

              {/* Main recording button */}
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <TouchableOpacity
                  onPress={toggleRecording}
                  disabled={isTranscribing}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: isRecording ? colors.error : isTranscribing ? colors.border : colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  {isTranscribing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name={isRecording ? "stop" : "mic"} size={28} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Recording status */}
            {isRecording && (
              <View style={{ alignItems: "center", marginTop: 16 }}>
                <View
                  style={{
                    backgroundColor: colors.error + "15",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: colors.error,
                      marginRight: 8,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.error,
                      fontWeight: "500",
                    }}
                  >
                    Recording {formatRecordingTime(recordingDuration)}
                  </Text>
                </View>
              </View>
            )}

            {isTranscribing && (
              <View style={{ alignItems: "center", marginTop: 16 }}>
                <View
                  style={{
                    backgroundColor: colors.primary + "15",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.primary,
                      fontWeight: "500",
                    }}
                  >
                    Transcribing audio...
                  </Text>
                </View>
              </View>
            )}

            {/* Instructions */}
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: "center",
                marginTop: 12,
                lineHeight: 20,
              }}
            >
              {isRecording
                ? "Speak clearly about your conversation details"
                : "Tap to record conversation notes with your voice"}
            </Text>
          </View>
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
          </View>

          <Input
            value={formData.conversationContext || ""}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, conversationContext: text }))}
            placeholder="What did you talk about? Include specific topics, interests, or projects discussed. Use voice recording above for hands-free input!"
            multiline
            numberOfLines={4}
          />
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
            Use voice recording for hands-free input or type to describe your conversation. Our AI will generate a
            personalized, professional follow-up message that references your specific discussion points.
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

            <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
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

            {/* Save to History Button */}
            <TouchableOpacity
              onPress={saveContactToHistory}
              disabled={isSaving}
              style={{
                backgroundColor: colors.success,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              ) : (
                <Ionicons name="bookmark-outline" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              )}
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}>
                {isSaving ? "Saving..." : "Save to History"}
              </Text>
            </TouchableOpacity>

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
