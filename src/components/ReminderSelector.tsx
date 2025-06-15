"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { Card } from "./Card"
import { scheduleFollowUpReminder, formatReminderDate } from "../utils/notifications"

interface ReminderSelectorProps {
  contactId: string
  contactName: string
  company?: string
  onReminderSet: (notificationId: string, days: number) => void
  currentReminder?: {
    notificationId: string
    days: number
    date: string
  }
}

const REMINDER_OPTIONS = [
  { days: 1, label: "Tomorrow", icon: "today-outline" },
  { days: 3, label: "In 3 days", icon: "calendar-outline" },
  { days: 7, label: "In 1 week", icon: "time-outline" },
  { days: 14, label: "In 2 weeks", icon: "calendar-number-outline" },
  { days: 30, label: "In 1 month", icon: "calendar-clear-outline" },
]

export const ReminderSelector: React.FC<ReminderSelectorProps> = ({
  contactId,
  contactName,
  company,
  onReminderSet,
  currentReminder,
}) => {
  const { colors } = useTheme()
  const [isSettingReminder, setIsSettingReminder] = useState(false)

  const handleSetReminder = async (days: number, label: string) => {
    if (isSettingReminder) return

    setIsSettingReminder(true)

    try {
      const notificationId = await scheduleFollowUpReminder(contactId, contactName, company, days)

      if (notificationId) {
        onReminderSet(notificationId, days)
        Alert.alert("Reminder Set! ⏰", `You'll be reminded to follow up with ${contactName} ${label.toLowerCase()}.`, [
          { text: "Got it!", style: "default" },
        ])
      } else {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to set follow-up reminders.",
          [{ text: "OK", style: "default" }],
        )
      }
    } catch (error) {
      Alert.alert("Error", "Failed to set reminder. Please try again.")
    } finally {
      setIsSettingReminder(false)
    }
  }

  const getCurrentReminderText = () => {
    if (!currentReminder) return null

    const reminderDate = new Date(currentReminder.date)
    const formattedDate = formatReminderDate(reminderDate)

    return `Reminder set for ${formattedDate}`
  }

  return (
    <Card style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.secondary,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="alarm-outline" size={16} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>Follow-up Reminder</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>Get notified to send your message</Text>
        </View>
      </View>

      {currentReminder ? (
        <View
          style={{
            backgroundColor: colors.success + "15",
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text
            style={{
              fontSize: 14,
              color: colors.success,
              fontWeight: "500",
              marginLeft: 8,
              flex: 1,
            }}
          >
            {getCurrentReminderText()}
          </Text>
        </View>
      ) : (
        <View>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 16,
              lineHeight: 20,
            }}
          >
            Choose when you'd like to be reminded to follow up with {contactName}:
          </Text>

          <View style={{ gap: 8 }}>
            {REMINDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.days}
                onPress={() => handleSetReminder(option.days, option.label)}
                disabled={isSettingReminder}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: isSettingReminder ? 0.6 : 1,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name={option.icon as any} size={18} color={colors.primary} />
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text,
                    fontWeight: "500",
                    marginLeft: 12,
                    flex: 1,
                  }}
                >
                  {option.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 16,
              padding: 12,
              backgroundColor: colors.primary + "10",
              borderRadius: 8,
            }}
          >
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text
              style={{
                fontSize: 12,
                color: colors.primary,
                marginLeft: 8,
                flex: 1,
                lineHeight: 16,
              }}
            >
              Reminders will be sent at 10 AM on the selected day
            </Text>
          </View>
        </View>
      )}
    </Card>
  )
}
