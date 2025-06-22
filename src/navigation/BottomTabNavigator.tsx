/**
 * Bottom Tab Navigator for MedDef App
 * Provides navigation between main app sections
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform, StyleSheet, Text } from "react-native";
import { meddefTheme } from "../config/theme";
import { TabIcon } from "../components/navigation/TabIcon";

// Screen components
import { HomeScreen } from "../screens/HomeScreen";
import { TestingScreen } from "../screens/TestingScreen";
import { ResultsScreen } from "../screens/ResultsScreen";
import { AnalyticsScreen } from "../screens/AnalyticsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon
            routeName={route.name}
            focused={focused}
            color={color}
            size={size}
          />
        ),
        tabBarActiveTintColor: meddefTheme.colors.primary,
        tabBarInactiveTintColor: meddefTheme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: meddefTheme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: meddefTheme.colors.border,
          paddingTop: Platform.OS === "ios" ? 5 : 8,
          paddingBottom: Platform.OS === "ios" ? 25 : 8,
          height: Platform.OS === "ios" ? 90 : 70,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.15,
              shadowRadius: 8,
            },
            android: {
              elevation: 12,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerStyle: {
          backgroundColor: meddefTheme.colors.primary,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
            },
            android: {
              elevation: 4,
            },
          }),
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "MedDef Home",
          headerTitle: "🏥 MedDef Testing",
        }}
      />
      <Tab.Screen
        name="Testing"
        component={TestingScreen}
        options={{
          title: "Test Models",
          headerTitle: "🧪 Model Testing",
        }}
      />
      <Tab.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          title: "Results",
          headerTitle: "📊 Test Results",
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: "Analytics",
          headerTitle: "📈 Performance Analytics",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerTitle: "⚙️ App Settings",
        }}
      />
    </Tab.Navigator>
  );
}
