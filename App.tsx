import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { ThemeProvider } from "./src/contexts/ThemeContext"
import MainScreen from "./src/screens/MainScreen"
import ContactFormScreen from "./src/screens/ContactFormScreen"
import CameraScreen from "./src/screens/CameraScreen"
import HistoryScreen from "./src/screens/HistoryScreen"
import type { RootStackParamList } from "./src/types"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="ContactForm" component={ContactFormScreen} />
          <Stack.Screen name="Camera" component={CameraScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  )
}
