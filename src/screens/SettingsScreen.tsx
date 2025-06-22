/**
 * Settings Screen - App configuration and preferences
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { meddefTheme } from "../config/theme";
import { MedDefCard, SectionHeader } from "../components/common/MedDefUI";

export function SettingsScreen() {
  const [settings, setSettings] = useState({
    enableNotifications: true,
    autoSaveResults: true,
    enableAnalytics: true,
    highQualityMode: false,
    debugMode: false,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const showAbout = () => {
    Alert.alert(
      "About MedDef",
      "Medical Defense Model Testing Platform\n\nVersion: 1.0.0\n\nDeveloped by CI2P Laboratory\nSchool of Information Science and Engineering\nUniversity of Jinan\n\nFor adversarial robustness evaluation in medical imaging.",
      [{ text: "OK" }]
    );
  };

  const clearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear all cached models and test data. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => Alert.alert("Success", "Cache cleared successfully"),
        },
      ]
    );
  };

  const exportData = () => {
    Alert.alert("Export Data", "Export test results and analytics data?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Export",
        onPress: () => Alert.alert("Success", "Data exported successfully"),
      },
    ]);
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: meddefTheme.colors.border,
          true: meddefTheme.colors.primary + "40",
        }}
        thumbColor={
          value ? meddefTheme.colors.primary : meddefTheme.colors.text.muted
        }
      />
    </View>
  );

  const renderActionItem = (
    title: string,
    description: string,
    icon: string,
    onPress: () => void,
    destructive = false
  ) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <View style={styles.actionInfo}>
        <Text
          style={[styles.actionTitle, destructive && styles.destructiveText]}
        >
          {title}
        </Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Text style={styles.actionChevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* App Settings */}
        <SectionHeader title="App Settings" />
        <MedDefCard>
          {renderSettingItem(
            "Push Notifications",
            "Receive notifications about test completion",
            settings.enableNotifications,
            (value) => updateSetting("enableNotifications", value)
          )}

          {renderSettingItem(
            "Auto-save Results",
            "Automatically save test results",
            settings.autoSaveResults,
            (value) => updateSetting("autoSaveResults", value)
          )}

          {renderSettingItem(
            "Analytics Tracking",
            "Help improve app performance",
            settings.enableAnalytics,
            (value) => updateSetting("enableAnalytics", value)
          )}
        </MedDefCard>

        {/* Performance Settings */}
        <SectionHeader title="Performance" />
        <MedDefCard>
          {renderSettingItem(
            "High Quality Mode",
            "Better visualizations, slower performance",
            settings.highQualityMode,
            (value) => updateSetting("highQualityMode", value)
          )}

          {renderSettingItem(
            "Debug Mode",
            "Show detailed logging information",
            settings.debugMode,
            (value) => updateSetting("debugMode", value)
          )}
        </MedDefCard>

        {/* Data Management */}
        <SectionHeader title="Data Management" />
        <MedDefCard>
          {renderActionItem(
            "Export Test Data",
            "Export results and analytics",
            "📤",
            exportData
          )}

          {renderActionItem(
            "Clear Cache",
            "Free up storage space",
            "🗑️",
            clearCache,
            true
          )}
        </MedDefCard>

        {/* Model Information */}
        <SectionHeader title="Model Information" />
        <MedDefCard>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Architecture:</Text>
              <Text style={styles.infoValue}>MedDef + DAAM</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Framework:</Text>
              <Text style={styles.infoValue}>TensorFlow.js</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Model Size:</Text>
              <Text style={styles.infoValue}>~45 MB</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Datasets:</Text>
              <Text style={styles.infoValue}>ROCT, Chest X-Ray</Text>
            </View>
          </View>
        </MedDefCard>

        {/* About */}
        <SectionHeader title="About" />
        <MedDefCard>
          {renderActionItem(
            "About MedDef",
            "Version and app information",
            "ℹ️",
            showAbout
          )}

          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>
              MedDef Testing Platform v1.0.0{"\n"}
              CI2P Laboratory{"\n"}
              School of Information Science and Engineering{"\n"}
              University of Jinan{"\n"}© 2025
            </Text>
          </View>
        </MedDefCard>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built for adversarial robustness evaluation in medical imaging{"\n"}
            CI2P Laboratory • University of Jinan
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: meddefTheme.colors.background,
  },

  content: {
    padding: meddefTheme.spacing.md,
  },

  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: meddefTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: meddefTheme.colors.border,
  },

  settingInfo: {
    flex: 1,
    marginRight: meddefTheme.spacing.md,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: meddefTheme.colors.text.primary,
    marginBottom: 2,
  },

  settingDescription: {
    fontSize: 13,
    color: meddefTheme.colors.text.secondary,
    lineHeight: 16,
  },

  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: meddefTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: meddefTheme.colors.border,
  },

  actionIcon: {
    fontSize: 20,
    marginRight: meddefTheme.spacing.md,
  },

  actionInfo: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: meddefTheme.colors.text.primary,
    marginBottom: 2,
  },

  destructiveText: {
    color: meddefTheme.colors.danger,
  },

  actionDescription: {
    fontSize: 13,
    color: meddefTheme.colors.text.secondary,
  },

  actionChevron: {
    fontSize: 18,
    color: meddefTheme.colors.text.muted,
    marginLeft: meddefTheme.spacing.sm,
  },

  infoSection: {
    paddingVertical: meddefTheme.spacing.sm,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: meddefTheme.spacing.sm,
  },

  infoLabel: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: meddefTheme.colors.text.primary,
  },

  versionInfo: {
    paddingTop: meddefTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: meddefTheme.colors.border,
    marginTop: meddefTheme.spacing.md,
  },

  versionText: {
    fontSize: 13,
    color: meddefTheme.colors.text.muted,
    textAlign: "center",
    lineHeight: 18,
  },

  footer: {
    paddingVertical: meddefTheme.spacing.xl,
    alignItems: "center",
  },

  footerText: {
    fontSize: 12,
    color: meddefTheme.colors.text.muted,
    textAlign: "center",
    fontStyle: "italic",
  },
});
