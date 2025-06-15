# 🤝 Networking Assistant

An AI-powered mobile app that transforms your networking conversations into actionable follow-ups. Scan business cards, record voice notes, and generate personalized messages with the power of OpenAI.

## ✨ Features

### 📱 Core Functionality

- **Business Card Scanning** - AI-powered OCR using OpenAI GPT-4o Vision
- **Voice Recording & Transcription** - Hands-free conversation logging with Whisper AI
- **Smart Follow-up Generation** - Personalized messages based on conversation context
- **Contact History** - Searchable database of all networking contacts
- **Location Tagging** - Automatic location capture for context

### 🔍 Advanced Features

- **Intelligent Search** - Find contacts by name, company, title, location, or conversation topics
- **Dark/Light Mode** - Automatic theme switching based on system preferences
- **Offline Capability** - Works without internet (with limited AI features)
- **Privacy-First** - All data stored locally on your device

### 🤖 AI-Powered

- **GPT-4o Vision** for business card text extraction
- **GPT-4o** for intelligent follow-up message generation
- **Whisper** for accurate voice-to-text transcription
- **Context-aware messaging** that references specific conversation details

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Expo CLI** (\`npm install -g expo-cli\`)
- **iOS Simulator** or **Android Emulator** (or physical device)
- **OpenAI API Key** (required for AI features)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd networking-assistant
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`

   Edit \`.env\` and add your OpenAI API key:
   \`\`\`
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your_openai_api_key_here
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm start
   \`\`\`

5. **Run on your device**
   - **iOS**: Press \`i\` or scan QR code with Camera app
   - **Android**: Press \`a\` or scan QR code with Expo Go app

## 🔧 Configuration

### Required Environment Variables

| Variable                       | Description                    | Required |
| ------------------------------ | ------------------------------ | -------- |
| \`EXPO_PUBLIC_OPENAI_API_KEY\` | OpenAI API key for AI features | Yes      |

### Optional Environment Variables

| Variable                    | Description                      | Default  |
| --------------------------- | -------------------------------- | -------- |
| \`GOOGLE_CLOUD_KEY_FILE\`   | Google Cloud Vision API key file | Not used |
| \`GOOGLE_CLOUD_PROJECT_ID\` | Google Cloud project ID          | Not used |

### Getting Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key and add it to your \`.env\` file
5. Ensure you have credits in your OpenAI account

## 📱 How to Use

### 1. **Scan a Business Card**

- Tap "Scan Business Card" on the main screen
- Position the card within the camera frame
- AI automatically extracts contact information
- Review and edit the extracted details

### 2. **Manual Contact Entry**

- Tap "Enter Contact Info" on the main screen
- Fill in the contact details manually
- Add conversation context via text or voice

### 3. **Record Voice Notes**

- Use the microphone button in the contact form
- Speak about your conversation details
- AI transcribes and adds to conversation context

### 4. **Generate Follow-up Messages**

- Complete the contact information
- Tap "Generate Follow-Up"
- AI creates a personalized message based on your conversation
- Copy the message to send via LinkedIn, email, or text

### 5. **Search Your Contacts**

- Go to Contact History (clock icon)
- Use the search bar to find contacts by:
  - Name
  - Company
  - Job title
  - Location
  - Conversation topics
  - Email address

## 🏗️ Architecture

### Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for screen navigation
- **AsyncStorage** for local data persistence
- **Expo Camera** for business card scanning
- **Expo Audio** for voice recording
- **Expo Location** for automatic location tagging

### Project Structure

\`\`\`
src/
├── components/ # Reusable UI components
│ ├── Button.tsx
│ ├── Card.tsx
│ ├── Input.tsx
│ └── ErrorBoundary.tsx
├── contexts/ # React contexts
│ ├── ThemeContext.tsx
│ └── LocationContext.tsx
├── screens/ # App screens
│ ├── MainScreen.tsx
│ ├── ContactFormScreen.tsx
│ ├── CameraScreen.tsx
│ └── HistoryScreen.tsx
├── utils/ # Utility functions
│ ├── storage.ts
│ └── clipboard.ts
└── types/ # TypeScript type definitions
└── index.ts
\`\`\`

## 🔒 Privacy & Security

- **Local Storage**: All contact data is stored locally on your device
- **No Cloud Sync**: Your contacts never leave your device (except for AI processing)
- **API Security**: OpenAI API calls are made directly from your device
- **Permissions**: Only requests necessary permissions (camera, microphone, location)

## 🛠️ Development

### Available Scripts

- \`npm start\` - Start Expo development server
- \`npm run android\` - Run on Android emulator
- \`npm run ios\` - Run on iOS simulator
- \`npm run web\` - Run in web browser (limited functionality)

### Building for Production

1. **Configure app.json** with your app details
2. **Build for iOS**:
   \`\`\`bash
   expo build:ios
   \`\`\`
3. **Build for Android**:
   \`\`\`bash
   expo build:android
   \`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check that your OpenAI API key is correctly configured
2. Ensure you have sufficient credits in your OpenAI account
3. Verify camera and microphone permissions are granted
4. Check the console for any error messages

For additional support, please open an issue on GitHub.

## 🚀 Future Enhancements

- **CRM Integration** (Salesforce, HubSpot, Pipedrive)
- **Calendar Integration** for follow-up scheduling
- **Team Collaboration** features
- **Analytics Dashboard** for networking insights
- **Multi-language Support**

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o and Whisper APIs
- **Expo** for the amazing development platform
- **React Native** community for excellent libraries

---

**Made with ❤️ for better networking**
\`\`\`
