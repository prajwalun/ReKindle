import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export interface ReminderData {
  contactId: string
  contactName: string
  company?: string
  reminderDate: Date
  notificationId?: string
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      return false
    }

    // Configure notification channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("follow-up-reminders", {
        name: "Follow-up Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#007AFF",
        sound: "default",
      })
    }

    return true
  } catch (error) {
    console.error("Error requesting notification permissions:", error)
    return false
  }
}

export const scheduleFollowUpReminder = async (
  contactId: string,
  contactName: string,
  company: string | undefined,
  daysFromNow: number,
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions()
    if (!hasPermission) {
      throw new Error("Notification permissions not granted")
    }

    const reminderDate = new Date()
    reminderDate.setDate(reminderDate.getDate() + daysFromNow)
    reminderDate.setHours(10, 0, 0, 0) // Set to 10 AM

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Follow-up Reminder",
        body: `Time to follow up with ${contactName}${company ? ` from ${company}` : ""}`,
        data: {
          contactId,
          contactName,
          company,
          type: "follow-up-reminder",
        },
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: reminderDate,
        channelId: "follow-up-reminders",
      },
    })

    return notificationId
  } catch (error) {
    console.error("Error scheduling reminder:", error)
    return null
  }
}

export const cancelReminder = async (notificationId: string): Promise<boolean> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId)
    return true
  } catch (error) {
    console.error("Error canceling reminder:", error)
    return false
  }
}

export const getAllScheduledReminders = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync()
    return scheduledNotifications.filter(
      (notification: Notifications.NotificationRequest) => notification.content.data?.type === "follow-up-reminder",
    )
  } catch (error) {
    console.error("Error getting scheduled reminders:", error)
    return []
  }
}

export const formatReminderDate = (date: Date): string => {
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays <= 7) return `In ${diffDays} days`

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}
