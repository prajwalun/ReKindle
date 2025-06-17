# ReKindle

A mobile app that helps you turn those awkward networking conversations into meaningful connections. Scan business cards or LinkedIn QR codes, jot down what you talked about, and get help writing follow-up messages that don't sound terrible.

## What it does

**The basics:**

- Scan business cards and extract contact info automatically
- Scan LinkedIn QR codes to grab names and profile links
- Record voice notes about your conversations (because you'll forget otherwise)
- Generate follow-up messages that actually reference what you talked about
- Keep track of everyone you meet with search

**The nice-to-haves:**

- Works in dark mode if that's your thing
- Stores everything locally on your phone
- Smart search through your contacts
- Automatically tags where you met people

**The AI stuff:**

- Uses OpenAI's GPT-4o to read business cards
- Whisper API turns your voice notes into text
- Generates personalized follow-up messages
- Cleans up messy LinkedIn usernames into proper names

## Getting started

You'll need:

- Node.js (version 16 or newer)
- Expo CLI (`npm install -g expo-cli`)
- An iPhone/Android or simulator
- OpenAI API key (this costs a few bucks but it's worth it)

**Setup:**

1. Clone this repo and install stuff:
   \`\`\`bash
   git clone <your-repo-url>
   cd networking-assistant
   npm install
   \`\`\`

2. Copy the example env file and add your OpenAI key:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

   Then edit `.env` and add:
   \`\`\`
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your_actual_key_here
   \`\`\`

3. Start it up:
   \`\`\`bash
   npm start
   \`\`\`

4. Scan the QR code with your phone or press `i` for iOS simulator / `a` for Android

## How to use it

**Scanning business cards:**
Just tap "Scan Business Card" and point your camera at the card. The AI will try to extract the name, company, email, etc. Sometimes it gets things wrong, so double-check before saving.

**LinkedIn QR codes:**
Tap "Scan LinkedIn QR" and scan someone's LinkedIn QR code. You can find these in the LinkedIn app - go to any profile and tap the QR icon in the top right. The app will grab their name and profile URL, then you can fill in the rest manually.

**Voice notes:**
Hit the microphone button and just talk about what you discussed. The app will transcribe it and use that context when generating follow-up messages.

**Follow-up messages:**
Once you've got the contact info and some conversation context, tap "Generate Follow-Up" and the AI will write a personalized message. You can copy it and send via LinkedIn, email, whatever.

**Finding people later:**
All your contacts are saved in the History section. You can search by name, company, location, or even what you talked about.

## Getting your OpenAI key

1. Go to [platform.openai.com](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Add some credits to your account (like $5-10 should last you a while)
5. Paste the key in your `.env` file

The app uses GPT-4o for business cards and message generation, plus Whisper for voice transcription. It's not free but it's pretty cheap for personal use.

## Tech stuff

Built with React Native and Expo because I wanted it to work on both iOS and Android without writing everything twice. Uses TypeScript because debugging JavaScript is painful.

**Main dependencies:**

- React Native + Expo for the app framework
- React Navigation for moving between screens
- AsyncStorage to save contacts locally
- Expo Camera for scanning
- Expo Audio for voice recording
- OpenAI API for the smart features

## Privacy

Everything stays on your phone except when calling OpenAI's API. Your contacts aren't uploaded to any cloud service or shared with anyone. The only data that leaves your device is what gets sent to OpenAI for processing (business card images, voice recordings for transcription, and text for message generation).

## Development

**Running locally:**

- `npm start` - Start the dev server
- `npm run ios` - Open iOS simulator
- `npm run android` - Open Android emulator

**Building for production:**
You'll need to configure `app.json` with your app details, then use `expo build:ios` or `expo build:android`.

## Known issues

- Business card scanning works best with good lighting and clear text
- LinkedIn QR scanning only gets basic info (name + profile URL)
- Voice transcription requires internet connection
- The AI sometimes generates overly formal messages (working on making them more natural)

Built this because I'm terrible at networking and needed help remembering who I talked to and what we discussed. Hope it helps you too.
