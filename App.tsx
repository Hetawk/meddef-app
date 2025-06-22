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
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { meddefTheme } from "./src/config/theme";
import { BottomTabNavigator } from "./src/navigation/BottomTabNavigator";
import { initializeConfig } from "./src/config/environment";

export default function App() {
  // Initialize environment configuration and TensorFlow.js on app startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize environment configuration
        initializeConfig();

        // Initialize TensorFlow.js for React Native
        console.log("🚀 Initializing TensorFlow.js for React Native...");

        // Wait for TensorFlow to be ready
        await tf.ready();
        console.log("✅ TensorFlow.js initialized successfully");
        console.log(`📊 TensorFlow.js backend: ${tf.getBackend()}`);

        // Set up platform-specific optimizations
        if (Platform.OS === "ios" || Platform.OS === "android") {
          // Use React Native backend
          console.log("📱 Using React Native TensorFlow.js backend");
        }
      } catch (error) {
        console.error("❌ TensorFlow.js initialization failed:", error);
        // Continue anyway - app can still work with mock data
        console.log("📱 Continuing with mock data fallback");
      }
    };

    initializeApp();
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
