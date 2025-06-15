"use client"
import { Component, type ReactNode } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: "#FFFFFF",
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#FF3B30",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Ionicons name="warning-outline" size={40} color="#FFFFFF" />
          </View>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#000000",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Something went wrong
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: "#8E8E93",
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 32,
            }}
          >
            We're sorry, but something unexpected happened. Please try restarting the app.
          </Text>

          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: undefined })}
            style={{
              backgroundColor: "#007AFF",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    return this.props.children
  }
}
