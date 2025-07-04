"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import * as Location from "expo-location"

interface LocationContextType {
  location: Location.LocationObject | null
  address: string | null
  requestLocationPermission: () => Promise<boolean>
  getCurrentLocation: () => Promise<string | null>
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [address, setAddress] = useState<string | null>(null)

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        return false
      }

      const currentLocation = await Location.getCurrentPositionAsync({})
      setLocation(currentLocation)

      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      })

      if (addressResponse.length > 0) {
        const addr = addressResponse[0]
        const formattedAddress = `${addr.street || ""} ${addr.city || ""}, ${addr.region || ""}`.trim()
        setAddress(formattedAddress)
      }

      return true
    } catch (error) {
      console.error("Error getting location:", error)
      return false
    }
  }

  const getCurrentLocation = async (): Promise<string | null> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync()
      if (status !== "granted") {
        return null
      }

      const currentLocation = await Location.getCurrentPositionAsync({})
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      })

      if (addressResponse.length > 0) {
        const addr = addressResponse[0]
        return `${addr.city || ""}, ${addr.region || ""}`.trim()
      }

      return null
    } catch (error) {
      console.error("Error getting current location:", error)
      return null
    }
  }

  useEffect(() => {
    requestLocationPermission()
  }, [])

  return (
    <LocationContext.Provider value={{ location, address, requestLocationPermission, getCurrentLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}
