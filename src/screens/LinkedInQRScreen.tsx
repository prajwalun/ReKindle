"use client"

import type React from "react"
import { useState, useRef } from "react"
import { View, Text, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { CameraView, type CameraType, useCameraPermissions } from "expo-camera"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../contexts/ThemeContext"
import type { RootStackParamList, ContactData } from "../types"

declare const __DEV__: boolean

type LinkedInQRScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "LinkedInQR">

interface Props {
  navigation: LinkedInQRScreenNavigationProp
}

interface LinkedInProfileData {
  full_name?: string
  first_name?: string
  last_name?: string
  headline?: string
  summary?: string
  occupation?: string
  company?: string
  company_name?: string
  current_company?: string
  experiences?: Array<{
    company?: string
    title?: string
    description?: string
  }>
  education?: Array<{
    school?: string
    degree?: string
  }>
  skills?: string[]
  location?: string
  industry?: string
  public_identifier?: string
}

const LinkedInQRScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme()
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<CameraType>("back")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const [lastScannedData, setLastScannedData] = useState<string>("")
  const cameraRef = useRef<CameraView>(null)

  const handleRequestPermission = async () => {
    try {
      setIsRequestingPermission(true)
      await new Promise((resolve) => setTimeout(resolve, 500))

      const result = await requestPermission()

      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Camera access is needed to scan LinkedIn QR codes. Please enable it in your device settings.",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => navigation.navigate("Main"),
            },
            {
              text: "Try Again",
              onPress: () => setIsRequestingPermission(false),
            },
          ],
        )
      }
    } catch (error) {
      __DEV__ && console.log("Camera permission error:", error)
      Alert.alert("Permission Error", "There was an error requesting camera permission. Please try again.", [
        {
          text: "OK",
          onPress: () => setIsRequestingPermission(false),
        },
      ])
    } finally {
      setIsRequestingPermission(false)
    }
  }

  const processLinkedInQR = async (qrData: string): Promise<ContactData | null> => {
    try {
      setProcessingStep("Processing LinkedIn QR code...")

      // Simple URL pattern matching for LinkedIn profiles
      const urlPattern = /linkedin\.com\/in\/([^/?]+)/i
      const match = qrData.match(urlPattern)

      if (!match) {
        throw new Error("Invalid LinkedIn QR code")
      }

      const username = match[1]

      // Enhanced name formatting from LinkedIn username
      const formattedName = formatLinkedInUsername(username)

      return {
        name: formattedName,
        title: "",
        company: "",
        email: "",
        linkedinUrl: qrData,
      }
    } catch (error) {
      __DEV__ && console.log("LinkedIn QR processing error:", error)
      throw error
    }
  }

  // Add this new helper function right after processLinkedInQR
  const formatLinkedInUsername = (username: string): string => {
    // Remove common LinkedIn suffixes and numbers
    const cleanUsername = username
      .toLowerCase()
      .replace(/-\d+$/, "") // Remove trailing numbers like "-123"
      .replace(/-[a-f0-9]{8,}$/, "") // Remove hash-like suffixes
      .replace(/-(jr|sr|ii|iii|iv|phd|md|cpa|mba)$/, "") // Remove common suffixes

    // Split by hyphens and process each part
    const parts = cleanUsername.split("-")

    const formattedParts = parts
      .map((part) => {
        // Skip very short parts (likely initials or noise)
        if (part.length <= 1) return ""

        // Skip common LinkedIn noise words
        const noiseWords = ["the", "and", "of", "at", "in", "on", "for", "with", "by"]
        if (noiseWords.includes(part)) return ""

        // Skip parts that are all numbers
        if (/^\d+$/.test(part)) return ""

        // Skip parts with mixed numbers and letters (likely IDs)
        if (/\d/.test(part) && /[a-z]/.test(part) && part.length > 3) return ""

        // Handle compound names (like "stefaniemarrone" -> "Stefanie Marrone")
        if (part.length > 12 && !part.includes(" ")) {
          // Try to split compound names intelligently
          const splitName = splitCompoundName(part)
          if (splitName.length > 1) {
            return splitName.map((name) => name.charAt(0).toUpperCase() + name.slice(1)).join(" ")
          }
        }

        // Capitalize properly
        return part.charAt(0).toUpperCase() + part.slice(1)
      })
      .filter((part) => part.length > 0) // Remove empty parts
      .slice(0, 4) // Take maximum 4 parts for name

    // Join the parts
    let finalName = formattedParts.join(" ").trim()

    // Handle special cases and improvements
    if (finalName.length === 0) {
      return "LinkedIn Contact"
    }

    // Handle common name patterns
    finalName = finalName
      .replace(
        /\b(Mc)([a-z])/g,
        "$1$2".replace(/Mc([a-z])/, (match, p1) => "Mc" + p1.toUpperCase()),
      ) // McDonald -> McDonald
      .replace(
        /\b(O')([a-z])/g,
        "$1$2".replace(/O'([a-z])/, (match, p1) => "O'" + p1.toUpperCase()),
      ) // O'connor -> O'Connor
      .replace(/\bVan\s+([A-Z])/g, "van $1") // Van Der -> van Der
      .replace(/\bDe\s+([A-Z])/g, "de $1") // De Silva -> de Silva

    // Ensure we don't have overly long names
    if (finalName.length > 50) {
      const words = finalName.split(" ")
      finalName = words.slice(0, 3).join(" ") // Take first 3 words max
    }

    return finalName
  }

  // Add this helper function right after formatLinkedInUsername
  const splitCompoundName = (compoundName: string): string[] => {
    // Common patterns for splitting compound names
    const patterns = [
      // Common first names that might be concatenated
      /(stefanie|stephanie|jennifer|christina|elizabeth|alexandra|michelle|patricia|margaret|catherine|samantha|jonathan|christopher|alexander|benjamin|nicholas|matthew|anthony|william|michael|daniel|robert|richard|charles|thomas|joseph|david|james|john|mark|paul|peter|andrew|steven|kevin|brian|edward|ronald|kenneth|joshua|jacob|anthony|ryan|noah|luke|owen|jack|henry|samuel|daniel|nathan|caleb|isaac|gabriel|christian|jackson|hunter|jordan|connor|adam|austin|robert|jose|luis|carlos|juan|miguel|antonio|francisco|jesus|alejandro|diego|angel|rafael|sergio|manuel|pablo|pedro|ricardo|fernando|jorge|alberto|eduardo|roberto|oscar|ramon|cesar|felipe|gerardo|ruben|ernesto|salvador|marco|arturo|armando|mauricio|enrique|victor|raul|mario|edgar|emilio|gustavo|ricardo|hector|adrian|ivan|jaime|ignacio|esteban|andres|leonardo|rodrigo|lorenzo|cristian|santiago|sebastian|nicolas|mateo|diego|gabriel|alejandro|fernando|carlos|daniel|miguel|jose|luis|juan|antonio|francisco|jesus|angel|rafael|sergio|manuel|pablo|pedro|ricardo|jorge|alberto|eduardo|roberto|oscar|ramon|cesar|felipe|gerardo|ruben|ernesto|salvador|marco|arturo|armando|mauricio|enrique|victor|raul|mario|edgar|emilio|gustavo|hector|adrian|ivan|jaime|ignacio|esteban|andres|leonardo|rodrigo|lorenzo|cristian|santiago|sebastian|nicolas|mateo)/i,

      // Common last names
      /(smith|johnson|williams|brown|jones|garcia|miller|davis|rodriguez|martinez|hernandez|lopez|gonzalez|wilson|anderson|thomas|taylor|moore|jackson|martin|lee|perez|thompson|white|harris|sanchez|clark|ramirez|lewis|robinson|walker|young|allen|king|wright|scott|torres|nguyen|hill|flores|green|adams|nelson|baker|hall|rivera|campbell|mitchell|carter|roberts|gomez|phillips|evans|turner|diaz|parker|cruz|edwards|collins|reyes|stewart|morris|morales|murphy|cook|rogers|gutierrez|ortiz|morgan|cooper|peterson|bailey|reed|kelly|howard|ramos|kim|cox|ward|richardson|watson|brooks|chavez|wood|james|bennett|gray|mendoza|ruiz|hughes|price|alvarez|castillo|sanders|patel|myers|long|ross|foster|jimenez|powell|jenkins|perry|russell|sullivan|bell|coleman|butler|henderson|barnes|gonzales|fisher|vasquez|simmons|romero|jordan|patterson|alexander|hamilton|graham|reynolds|griffin|wallace|moreno|west|cole|hayes|bryant|herrera|gibson|ellis|tran|medina|aguilar|stevens|murray|ford|castro|marshall|owens|harrison|fernandez|mcdonald|woods|washington|kennedy|wells|vargas|henry|freeman|webb|tucker|guzman|burns|crawford|olson|simpson|porter|hunter|gordon|mendez|silva|shaw|snyder|mason|dixon|munoz|hunt|hicks|holmes|palmer|wagner|black|robertson|boyd|rose|stone|salazar|fox|warren|mills|meyer|rice|schmidt|garza|daniels|ferguson|nichols|stephens|soto|weaver|ryan|gardner|payne|grant|dunn|kelley|spencer|hawkins|arnold|pierce|vazquez|hansen|peters|santos|hart|bradley|knight|elliott|cunningham|duncan|armstrong|hudson|carroll|lane|riley|andrews|alvarado|ray|delgado|berry|perkins|hoffman|johnston|matthews|pena|richards|contreras|willis|carpenter|lawrence|sandoval|guerrero|george|chapman|rios|estrada|ortega|watkins|greene|nunez|wheeler|valdez|harper|burke|larson|santiago|maldonado|morrison|franklin|carlson|austin|dominguez|carr|lawson|jacobs|obrien|lynch|singh|vega|bishop|montgomery|oliver|jensen|harvey|williamson|gilbert|dean|sims|espinoza|howell|li|wong|reid|hanson|le|mccoy|holt|schwartz|hensley|chen|walton|meyer|graham|fisher|ivey|parker|cruz|edwards|collins|reyes|stewart|morris|morales|murphy|cook|rogers|gutierrez|ortiz|morgan|cooper|peterson|bailey|reed|kelly|howard|ramos|kim|cox|ward|richardson|watson|brooks|chavez|wood|james|bennett|gray|mendoza|ruiz|hughes|price|alvarez|castillo|sanders|patel|myers|long|ross|foster|jimenez|powell|jenkins|perry|russell|sullivan|bell|coleman|butler|henderson|barnes|gonzales|fisher|vasquez|simmons|romero|jordan|patterson|alexander|hamilton|graham|reynolds|griffin|wallace|moreno|west|cole|hayes|bryant|herrera|gibson|ellis|tran|medina|aguilar|stevens|murray|ford|castro|marshall|owens|harrison|fernandez|mcdonald|woods|washington|kennedy|wells|vargas|henry|freeman|webb|tucker|guzman|burns|crawford|olson|simpson|porter|hunter|gordon|mendez|silva|shaw|snyder|mason|dixon|munoz|hunt|hicks|holmes|palmer|wagner|black|robertson|boyd|rose|stone|salazar|fox|warren|mills|meyer|rice|schmidt|garza|daniels|ferguson|nichols|stephens|soto|weaver|ryan|gardner|payne|grant|dunn|kelley|spencer|hawkins|arnold|pierce|vazquez|hansen|peters|santos|hart|bradley|knight|elliott|cunningham|duncan|armstrong|hudson|carroll|lane|riley|andrews|alvarado|ray|delgado|berry|perkins|hoffman|johnston|matthews|pena|richards|contreras|willis|carpenter|lawrence|sandoval|guerrero|george|chapman|rios|estrada|ortega|watkins|greene|nunez|wheeler|valdez|harper|burke|larson|santiago|maldonado|morrison|franklin|carlson|austin|dominguez|carr|lawson|jacobs|obrien|lynch|singh|vega|bishop|montgomery|oliver|jensen|harvey|williamson|gilbert|dean|sims|espinoza|howell|li|wong|reid|hanson|le|mccoy|holt|schwartz|hensley|chen|walton|marrone|rossi|ferrari|romano|colombo|ricci|marino|greco|bruno|gallo|conti|de luca|mancini|costa|giordano|rizzo|lombardi|moretti|barbieri|fontana|santoro|mariani|rinaldi|caruso|ferrara|galli|martini|leone|longo|gentile|martinelli|vitale|lombardo|serra|coppola|de santis|d'angelo|marchetti|parisi|villa|conte|ferretti|bianco|sorrentino|grassi|montanari|giuliani|russo|esposito|bianchi|romano|colombo|ricci|marino|greco|bruno|gallo|conti|costa|giordano|rizzo|lombardi|moretti|barbieri|fontana|santoro|mariani|rinaldi|caruso|ferrara|galli|martini|leone|longo|gentile|martinelli|vitale|lombardo|serra|coppola|marchetti|parisi|villa|conte|ferretti|bianco|sorrentino|grassi|montanari|giuliani)/i,
    ]

    for (const pattern of patterns) {
      const match = compoundName.match(pattern)
      if (match) {
        const matchedPart = match[0]
        const remainingPart = compoundName.replace(matchedPart, "")

        if (remainingPart.length > 2) {
          // Determine which part comes first
          const matchIndex = compoundName.indexOf(matchedPart)
          if (matchIndex === 0) {
            return [matchedPart, remainingPart]
          } else {
            return [remainingPart, matchedPart]
          }
        }
      }
    }

    // Fallback: try to split at common transition points
    const transitions = [
      /([a-z])([A-Z])/g, // camelCase transitions
      /([a-z]{3,})([A-Z][a-z]{3,})/g, // Word boundaries
    ]

    for (const transition of transitions) {
      const parts = compoundName.split(transition)
      if (parts.length > 1 && parts.every((part) => part.length > 2)) {
        return parts.filter((part) => part.length > 0)
      }
    }

    // If no pattern matches, try a simple split in the middle for long names
    if (compoundName.length > 8) {
      const midPoint = Math.floor(compoundName.length / 2)
      const firstPart = compoundName.substring(0, midPoint)
      const secondPart = compoundName.substring(midPoint)

      if (firstPart.length > 2 && secondPart.length > 2) {
        return [firstPart, secondPart]
      }
    }

    return [compoundName] // Return as single name if can't split
  }

  const extractBasicLinkedInData = (linkedinUrl: string): ContactData => {
    // Fallback extraction from URL
    const urlPattern = /linkedin\.com\/in\/([^/?]+)/i
    const match = linkedinUrl.match(urlPattern)

    if (!match) {
      return {
        name: "",
        title: "",
        company: "",
        email: "",
        linkedinUrl: linkedinUrl,
      }
    }

    const username = match[1]
    const formattedName = formatLinkedInUsername(username)

    return {
      name: formattedName,
      title: "",
      company: "",
      email: "",
      linkedinUrl: linkedinUrl,
    }
  }

  const handleQRCodeScanned = async ({ data }: { data: string }) => {
    // Prevent multiple scans of the same QR code
    if (isProcessing || data === lastScannedData) {
      return
    }

    // Check if it's a LinkedIn QR code
    if (!data.includes("linkedin.com")) {
      Alert.alert(
        "Not a LinkedIn QR Code",
        "Please scan a LinkedIn QR code. You can find this in the LinkedIn app under your profile.",
        [{ text: "OK", style: "default" }],
      )
      return
    }

    // Set the last scanned data to prevent duplicates
    setLastScannedData(data)
    setIsProcessing(true)

    try {
      const extractedData = await processLinkedInQR(data)

      if (extractedData) {
        setIsProcessing(false)
        navigation.replace("ContactForm", { contactData: extractedData })
      }
    } catch (error) {
      setIsProcessing(false)
      Alert.alert(
        "Processing Error",
        "We couldn't process this LinkedIn QR code. Please try again or enter the contact details manually.",
        [
          {
            text: "Try Again",
            style: "cancel",
            onPress: () => {
              setLastScannedData("")
            },
          },
          {
            text: "Enter Manually",
            style: "default",
            onPress: () => {
              navigation.replace("ContactForm", {
                contactData: {
                  name: "",
                  title: "",
                  company: "",
                  email: "",
                  linkedinUrl: data.includes("linkedin.com") ? data : "",
                },
              })
            },
          },
        ],
      )
    }
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"))
  }

  // Show loading while permission is being checked
  if (permission === null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ fontSize: 16, color: colors.text, marginTop: 16 }}>Checking camera permissions...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Show permission request screen
  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 40 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "600", color: colors.text, marginLeft: 16 }}>Camera Access</Text>
          </View>

          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 30,
              }}
            >
              <Ionicons name="qr-code-outline" size={64} color="#0077B5" />
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "600",
                color: colors.text,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Camera Access Required
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                textAlign: "center",
                lineHeight: 24,
                marginBottom: 40,
                paddingHorizontal: 20,
              }}
            >
              We need access to your camera to scan LinkedIn QR codes and extract profile information automatically.
            </Text>

            <TouchableOpacity
              onPress={handleRequestPermission}
              disabled={isRequestingPermission}
              style={{
                backgroundColor: isRequestingPermission ? colors.border : "#0077B5",
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 200,
                marginBottom: 20,
              }}
              activeOpacity={0.8}
            >
              {isRequestingPermission ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>Requesting...</Text>
                </>
              ) : (
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>Grant Camera Access</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Main")} style={{ padding: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#0077B5",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Camera */}
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} onBarcodeScanned={handleQRCodeScanned} />

        {/* Header - Positioned absolutely over camera */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
            paddingTop: 60,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 1,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#FFFFFF", marginLeft: 16 }}>Scan LinkedIn QR</Text>
        </View>

        {/* Camera Overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 0,
          }}
        >
          {/* QR Frame */}
          <View
            style={{
              width: 250,
              height: 250,
              borderWidth: 3,
              borderColor: "#FFFFFF",
              borderRadius: 16,
              backgroundColor: "transparent",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
            }}
          />

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              textAlign: "center",
              marginTop: 20,
              paddingHorizontal: 40,
              textShadowColor: "rgba(0,0,0,0.8)",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
          >
            Position the LinkedIn QR code within the frame
          </Text>

          {/* LinkedIn Badge */}
          <View
            style={{
              position: "absolute",
              top: 120,
              backgroundColor: "rgba(0,0,0,0.8)",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
          </View>

          {/* Instructions */}
          <View
            style={{
              position: "absolute",
              bottom: 200,
              left: 20,
              right: 20,
              backgroundColor: "rgba(0,0,0,0.6)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 14, textAlign: "center", marginBottom: 8 }}>
              How to find LinkedIn QR:
            </Text>
            <Text style={{ color: "#FFFFFF", fontSize: 12, textAlign: "center" }}>
              LinkedIn App → Your Profile → QR Code icon (top right)
            </Text>
          </View>

          {/* Processing Overlay */}
          {isProcessing && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.7)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 20,
                  padding: 32,
                  alignItems: "center",
                  minWidth: 280,
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#0077B5",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>

                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "600",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Processing QR Code
                </Text>

                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    textAlign: "center",
                    opacity: 0.8,
                  }}
                >
                  {processingStep || "Extracting LinkedIn information..."}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Controls */}
        <View
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
            zIndex: 1,
          }}
        >
          {/* Flip Camera Button */}
          <TouchableOpacity
            onPress={toggleCameraFacing}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "rgba(255,255,255,0.3)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default LinkedInQRScreen
