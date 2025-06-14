"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import { Card } from "../components/Card"
import type { RootStackParamList, ContactData } from "../types"

type HistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "History">

interface Props {
  navigation: HistoryScreenNavigationProp
}

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme()

  // Mock data for demonstration
  const [contacts] = useState<ContactData[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      title: "Product Manager",
      company: "TechCorp",
      email: "sarah@techcorp.com",
      timestamp: "2024-06-14T10:30:00Z",
    },
    {
      id: "2",
      name: "Mike Chen",
      title: "Software Engineer",
      company: "StartupXYZ",
      email: "mike@startupxyz.com",
      timestamp: "2024-06-13T15:45:00Z",
    },
    {
      id: "3",
      name: "Emily Davis",
      title: "Marketing Director",
      company: "BigBrand Inc",
      email: "emily@bigbrand.com",
      timestamp: "2024-06-12T09:15:00Z",
    },
  ])

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }

  const renderContactItem = ({ item }: { item: ContactData }) => (
    <TouchableOpacity onPress={() => navigation.navigate("ContactForm", { contactData: item })} activeOpacity={0.8}>
      <Card style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
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
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 4,
              }}
            >
              {item.name}
            </Text>

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

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                {formatDate(item.timestamp)}
              </Text>
            </View>
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
            }}
          >
            Contact History
          </Text>
        </View>

        {/* Contact List */}
        {contacts.length > 0 ? (
          <FlatList
            data={contacts}
            renderItem={renderContactItem}
            keyExtractor={(item) => item.id || Math.random().toString()}
            contentContainerStyle={{ padding: 20 }}
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
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text
              style={{
                fontSize: 18,
                color: colors.text,
                textAlign: "center",
                marginTop: 16,
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
              }}
            >
              Start networking and your contacts will appear here
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default HistoryScreen
