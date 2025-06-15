import AsyncStorage from "@react-native-async-storage/async-storage"
import type { ContactData } from "../types"

const CONTACTS_STORAGE_KEY = "@networking_assistant_contacts"

export interface StoredContact extends ContactData {
  id: string
  timestamp: string
  location?: string
  followUpMessage?: string
  generatedAt?: string
}

export const saveContact = async (contact: StoredContact): Promise<void> => {
  try {
    const existingContacts = await getStoredContacts()
    const updatedContacts = [contact, ...existingContacts]
    await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts))
  } catch (error) {
    console.error("Error saving contact:", error)
    throw new Error("Failed to save contact")
  }
}

export const getStoredContacts = async (): Promise<StoredContact[]> => {
  try {
    const contactsJson = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY)
    return contactsJson ? JSON.parse(contactsJson) : []
  } catch (error) {
    console.error("Error loading contacts:", error)
    return []
  }
}

export const updateContact = async (contactId: string, updates: Partial<StoredContact>): Promise<void> => {
  try {
    const contacts = await getStoredContacts()
    const updatedContacts = contacts.map((contact) => (contact.id === contactId ? { ...contact, ...updates } : contact))
    await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts))
  } catch (error) {
    console.error("Error updating contact:", error)
    throw new Error("Failed to update contact")
  }
}

export const deleteContact = async (contactId: string): Promise<void> => {
  try {
    const contacts = await getStoredContacts()
    const filteredContacts = contacts.filter((contact) => contact.id !== contactId)
    await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(filteredContacts))
  } catch (error) {
    console.error("Error deleting contact:", error)
    throw new Error("Failed to delete contact")
  }
}
