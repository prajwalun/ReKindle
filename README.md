# ReKindle

📋 **Quick Setup Requirements**

### Prerequisites

# 1. Install Node.js (v18 or later)

# Download from: https://nodejs.org/

# Verify installation:

node --version
npm --version

# 2. Install Expo CLI

npm install -g @expo/cli

### Project Setup

# 1. Navigate to your project folder

cd networking-assistant

# 2. Install all dependencies

npm install

# 3. Install additional required packages

npm install @expo/vector-icons@^14.0.0
npm install @react-navigation/native@^6.1.9
npm install @react-navigation/native-stack@^6.9.17
npm install @react-native-async-storage/async-storage@1.21.0
npm install expo-av@~13.10.4
npm install expo-camera@~14.1.3
npm install expo-location@~16.5.5
npm install react-native-safe-area-context@4.8.2
npm install react-native-screens@~3.29.0

# 4. Install TypeScript dev dependencies

npm install -D @types/react@~18.2.45 typescript@^5.1.3

### Start the App

# Start development server

npx expo start

# Or with cache clearing (if issues)

npx expo start --clear

### Testing Options

# Physical Device (Recommended):

# 1. Install "Expo Go" app from App Store/Google Play

# 2. Scan QR code from terminal

# iOS Simulator (Mac only):

# Press 'i' in terminal or click iOS option in browser

# Android Emulator:

# Press 'a' in terminal or click Android option in browser
