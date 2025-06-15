"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, RefreshControl, TextInput } from "react-native"
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
  const [filteredContacts, setFilteredContacts] = useState<StoredContact[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadContacts = async () => {
    try {
      const storedContacts = await getStoredContacts()
      setContacts(storedContacts)
      setFilteredContacts(storedContacts)
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

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setFilteredContacts(contacts)
      return
    }

    const lowercaseQuery = query.toLowerCase()
    const filtered = contacts.filter((contact) => {
      // Search in name (primary)
      if (contact.name.toLowerCase().includes(lowercaseQuery)) return true

      // Search in company
      if (contact.company?.toLowerCase().includes(lowercaseQuery)) return true

      // Search in title
      if (contact.title?.toLowerCase().includes(lowercaseQuery)) return true

      // Search in location
      if (contact.location?.toLowerCase().includes(lowercaseQuery)) return true

      // Search in conversation context
      if (contact.conversationContext?.toLowerCase().includes(lowercaseQuery)) return true

      // Search in email
      if (contact.email?.toLowerCase().includes(lowercaseQuery)) return true

      return false
    })

    setFilteredContacts(filtered)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setFilteredContacts(contacts)
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

  // Update filtered contacts when contacts change
  useEffect(() => {
    handleSearch(searchQuery)
  }, [contacts])

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

  const getSearchResultsText = () => {
    if (!searchQuery.trim()) return `${contacts.length} contacts`

    const count = filteredContacts.length
    if (count === 0) return "No matches found"
    if (count === 1) return "1 match found"
    return `${count} matches found`
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

  const renderEmptyState = () => {
    if (searchQuery.trim() && filteredContacts.length === 0) {
      // No search results
      return (
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
            <Ionicons name="search-outline" size={40} color={colors.textSecondary} />
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
            No matches found
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 20,
            }}
          >
            Try searching for a different name, company, or location
          </Text>
          <TouchableOpacity
            onPress={clearSearch}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      )
    }

    // No contacts at all
    return (
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
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
            paddingBottom: 10,
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
        </View>

        {/* Search Bar - Using native TextInput for better visibility */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />

            <TextInput
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search by name, company, location..."
              placeholderTextColor={colors.textSecondary}
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.text,
                paddingVertical: 4,
              }}
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={{ marginLeft: 12 }}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Results Counter */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                fontWeight: "500",
              }}
            >
              {getSearchResultsText()}
            </Text>
            {searchQuery.trim() && (
              <View
                style={{
                  backgroundColor: colors.primary + "15",
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginLeft: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.primary,
                    fontWeight: "500",
                  }}
                >
                  Searching: "{searchQuery}"
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact List */}
        {filteredContacts.length > 0 ? (
          <FlatList
            data={filteredContacts}
            renderItem={renderContactItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingTop: 0 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </SafeAreaView>
  )
}

export default HistoryScreen
