/**
 * Tab Bar Icons for MedDef App
 * Beautiful medical-themed icons for bottom navigation
 */

import React from "react";
import { Text, StyleSheet } from "react-native";

interface TabIconProps {
  routeName: string;
  focused: boolean;
  color: string;
  size?: number;
}

export function TabIcon({
  routeName,
  focused,
  color,
  size = 20,
}: TabIconProps) {
  const getIconEmoji = () => {
    const iconMap: { [key: string]: { focused: string; unfocused: string } } = {
      Home: { focused: "🏥", unfocused: "🏥" },
      Testing: { focused: "🧪", unfocused: "🧫" },
      Results: { focused: "📊", unfocused: "📈" },
      Analytics: { focused: "📉", unfocused: "📋" },
      Settings: { focused: "⚙️", unfocused: "🔧" },
    };

    const icons = iconMap[routeName];
    if (!icons) return "📱";

    return focused ? icons.focused : icons.unfocused;
  };

  return (
    <Text style={[styles.icon, { fontSize: size, color }]}>
      {getIconEmoji()}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: "center",
    // Add subtle shadow for better visibility
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
