export type RootStackParamList = {
  Main: undefined
  ContactForm: { contactData?: ContactData }
  Camera: undefined
  LinkedInQR: undefined
  History: undefined
}

export interface ContactData {
  id?: string
  name: string
  title?: string
  company?: string
  email?: string
  linkedinUrl?: string
  conversationContext?: string
  timestamp?: string
}

export interface GeneratedMessage {
  message: string
  timestamp: string
}
