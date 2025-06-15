"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { Card } from "../components/Card"
import { getStoredContacts, deleteContact } from "../utils/storage"
import type { RootStackParamList } from "../types"
import type { StoredContact } from "../utils/storage"

type HistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "History">

interface Props {
  navigation: HistoryScreenNavigationProp
}

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme()
  const [contacts, setContacts] = useState<StoredContact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadContacts = async () => {
    try {
      const storedContacts = await getStoredContacts()
      setContacts(storedContacts)
    } catch (error) {
      console.error("Error loading contacts:", error)
      Alert.alert("Error", "Failed to load contacts from history")
    } finally {
      setIsLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadContacts()
    setRefreshing(false)
  }

  const handleDeleteContact = async (contactId: string) => {
    Alert.alert("Delete Contact", "Are you sure you want to delete this contact from your history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteContact(contactId)
            await loadContacts()
          } catch (error) {
            Alert.alert("Error", "Failed to delete contact")
          }
        },
      },
    ])
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadContacts()
    })

    return unsubscribe
  }, [navigation])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return "Today"
    } else if (diffDays === 2) {
      return "Yesterday"
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderContactItem = ({ item }: { item: StoredContact }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ContactForm", { contactData: item })}
      activeOpacity={0.8}
      style={{ marginBottom: 12 }}
    >
      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.text,
                  flex: 1,
                }}
              >
                {item.name}
              </Text>
              <TouchableOpacity
                onPress={() => handleDeleteContact(item.id)}
                style={{ padding: 4 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {item.title && (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 2,
                }}
              >
                {item.title}
              </Text>
            )}

            {item.company && (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                {item.company}
              </Text>
            )}

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
              </Text>
            </View>

            {item.location && (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginLeft: 4,
                  }}
                >
                  {item.location}
                </Text>
              </View>
            )}

            {item.followUpMessage && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                <View
                  style={{
                    backgroundColor: colors.success + "20",
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.success,
                      marginLeft: 4,
                      fontWeight: "500",
                    }}
                  >
                    Follow-up generated
                  </Text>
                </View>
              </View>
            )}
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
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
              flex: 1,
            }}
          >
            Contact History
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              fontWeight: "500",
            }}
          >
            {contacts.length} contacts
          </Text>
        </View>

        {/* Contact List */}
        {contacts.length > 0 ? (
          <FlatList
            data={contacts}
            renderItem={renderContactItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 40,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <Ionicons name="people-outline" size={40} color={colors.textSecondary} />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: colors.text,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              No contacts yet
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Start networking and your contacts will appear here with their follow-up messages
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default HistoryScreen
