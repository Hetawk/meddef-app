/**
 * MedDef: Medical Defense Model Testing - Main App Component
 *
 * Beautiful React Native app for testing MedDef adversarial robustness
 * across Retinal OCT and Chest X-Ray medical imaging datasets
 *
 * CI2P Laboratory
 * School of Information Science and Engineering
 * University of Jinan
 */

import React, { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { meddefTheme } from "./src/config/theme";
import { BottomTabNavigator } from "./src/navigation/BottomTabNavigator";
import { initializeConfig } from "./src/config/environment";

export default function App() {
  // Initialize environment configuration on app startup
  useEffect(() => {
    initializeConfig();
  }, []);
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar
          barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
          backgroundColor={
            Platform.OS === "android"
              ? meddefTheme.colors.primary
              : meddefTheme.colors.background
          }
        />
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
