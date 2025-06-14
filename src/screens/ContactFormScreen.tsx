"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RouteProp } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { Button } from "../components/Button"
import { Card } from "../components/Card"
import { Input } from "../components/Input"
import type { RootStackParamList, ContactData, GeneratedMessage } from "../types"

type ContactFormScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "ContactForm">
type ContactFormScreenRouteProp = RouteProp<RootStackParamList, "ContactForm">

interface Props {
  navigation: ContactFormScreenNavigationProp
  route: ContactFormScreenRouteProp
}

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
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null)

  const toggleRecording = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false)
        setFormData((prev) => ({
          ...prev,
          conversationContext: prev.conversationContext + " [Voice note recorded]",
        }))
      }, 3000)
    }
  }

  const generateFollowUp = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Name is required")
      return
    }

    setIsGenerating(true)

    // Simulate API call
    setTimeout(() => {
      const simulatedMessage = `Hi ${formData.name},\n\nIt was great meeting you${formData.company ? ` at ${formData.company}` : ""}! ${formData.conversationContext ? `I enjoyed our conversation about ${formData.conversationContext.slice(0, 50)}...` : ""}\n\nLet's stay in touch!\n\nBest regards`

      setGeneratedMessage({
        message: simulatedMessage,
        timestamp: new Date().toISOString(),
      })
      setIsGenerating(false)
    }, 2000)
  }

  const copyToClipboard = () => {
    Alert.alert("Copied", "Message copied to clipboard")
  }

  const regenerateMessage = () => {
    setGeneratedMessage(null)
    generateFollowUp()
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
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
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: isRecording ? colors.error : colors.primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={isRecording ? "stop" : "mic"} size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Input
            value={formData.conversationContext || ""}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, conversationContext: text }))}
            placeholder="What did you talk about?"
            multiline
            numberOfLines={4}
          />

          {isRecording && (
            <Text
              style={{
                fontSize: 14,
                color: colors.error,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              🔴 Recording... Tap microphone to stop
            </Text>
          )}
        </Card>

        {/* Generate Follow-Up Button */}
        <Button title="Generate Follow-Up" onPress={generateFollowUp} loading={isGenerating} size="large" />

        {/* Generated Message */}
        {generatedMessage && (
          <Card style={{ marginTop: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Generated Follow-Up Message
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: colors.text,
                lineHeight: 24,
                marginBottom: 16,
              }}
            >
              {generatedMessage.message}
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Button
                title="Copy to Clipboard"
                onPress={copyToClipboard}
                variant="outline"
                size="small"
                icon={<Ionicons name="copy-outline" size={16} color={colors.primary} />}
              />
              <Button
                title="Regenerate"
                onPress={regenerateMessage}
                variant="secondary"
                size="small"
                icon={<Ionicons name="refresh-outline" size={16} color="#FFFFFF" />}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ContactFormScreen
