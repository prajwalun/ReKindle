import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { ThemeProvider } from "./src/contexts/ThemeContext"
import { LocationProvider } from "./src/contexts/LocationContext"
import { ErrorBoundary } from "./src/components/ErrorBoundary"
import MainScreen from "./src/screens/MainScreen"
import ContactFormScreen from "./src/screens/ContactFormScreen"
import CameraScreen from "./src/screens/CameraScreen"
import HistoryScreen from "./src/screens/HistoryScreen"
import type { RootStackParamList } from "./src/types"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  return (
    <ErrorBoundary>
      <LocationProvider>
        <ThemeProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator
              initialRouteName="Main"
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                gestureEnabled: true,
                gestureDirection: "horizontal",
              }}
            >
              <Stack.Screen
                name="Main"
                component={MainScreen}
                options={{
                  gestureEnabled: false, // Prevent swipe back from main screen
                }}
              />
              <Stack.Screen
                name="ContactForm"
                component={ContactFormScreen}
                options={{
                  animation: "slide_from_right",
                }}
              />
              <Stack.Screen
                name="Camera"
                component={CameraScreen}
                options={{
                  animation: "slide_from_bottom", // Camera slides from bottom like iOS
                  gestureDirection: "vertical",
                }}
              />
              <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{
                  animation: "slide_from_right",
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </LocationProvider>
    </ErrorBoundary>
  )
}
