/**
 * MedDef: Enhanced Medical UI Components with iOS Optimizations
 *
 * Professional medical interface with haptic feedback and native iOS feel
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as Device from "expo-device";
import { MedicalLabel, AttentionMap } from "../../types/meddef";
import {
  meddefTheme,
  medicalColors,
  getConfidenceColor,
} from "../../config/theme";

/**
 * Enhanced Confidence Indicator with Haptic Feedback
 */
interface EnhancedConfidenceIndicatorProps {
  confidence: number;
  label?: string;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
  showAlert?: boolean;
}

export const EnhancedConfidenceIndicator: React.FC<
  EnhancedConfidenceIndicatorProps
> = ({ confidence, label, onPress, size = "medium", showAlert = true }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const color = getConfidenceColor(confidence);
  const percentage = Math.round(confidence * 100);

  // Trigger haptic feedback based on confidence level
  React.useEffect(() => {
    if (Device.osName === "iOS" && showAlert) {
      if (confidence < 0.7) {
        // Strong haptic for low confidence - medical alert
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (confidence < 0.9) {
        // Medium haptic for medium confidence
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        // Light haptic for high confidence
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [confidence, showAlert]);

  // Animate confidence bar
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: confidence,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [confidence]);

  const handlePress = async () => {
    if (Device.osName === "iOS") {
      await Haptics.selectionAsync();
    }

    if (onPress) {
      onPress();
    } else if (showAlert) {
      const alertTitle = getConfidenceAlertTitle(confidence);
      const alertMessage = getConfidenceAlertMessage(confidence, label);

      Alert.alert(alertTitle, alertMessage, [{ text: "OK", style: "default" }]);
    }
  };

  const containerHeight = size === "small" ? 6 : size === "large" ? 12 : 8;
  const fontSize = size === "small" ? 12 : size === "large" ? 18 : 14;

  return (
    <TouchableOpacity
      style={styles.enhancedConfidenceContainer}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.confidenceHeader}>
        <Text style={[styles.confidenceText, { fontSize, color }]}>
          {percentage}%
        </Text>
        {label && <Text style={styles.confidenceLabel}>{label}</Text>}
        <Text style={styles.confidenceIcon}>
          {getConfidenceIcon(confidence)}
        </Text>
      </View>

      <View style={[styles.confidenceBar, { height: containerHeight }]}>
        <Animated.View
          style={[
            styles.confidenceProgress,
            {
              width: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: color,
              height: containerHeight,
            },
          ]}
        />
      </View>

      {/* Medical context indicator */}
      <View style={styles.medicalContext}>
        <Text style={[styles.contextText, { color }]}>
          {getConfidenceContext(confidence)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Medical Alert Component with Haptic Feedback
 */
interface MedicalAlertProps {
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  onDismiss?: () => void;
  autoHaptic?: boolean;
}

export const MedicalAlert: React.FC<MedicalAlertProps> = ({
  type,
  title,
  message,
  onDismiss,
  autoHaptic = true,
}) => {
  React.useEffect(() => {
    if (Device.osName === "iOS" && autoHaptic) {
      switch (type) {
        case "error":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case "warning":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case "success":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  }, [type, autoHaptic]);

  const alertConfig = getAlertConfig(type);

  return (
    <View style={[styles.alertContainer, { borderColor: alertConfig.color }]}>
      <View style={styles.alertHeader}>
        <Text style={styles.alertIcon}>{alertConfig.icon}</Text>
        <Text style={[styles.alertTitle, { color: alertConfig.color }]}>
          {title}
        </Text>
        {onDismiss && (
          <TouchableOpacity
            onPress={async () => {
              if (Device.osName === "iOS") {
                await Haptics.selectionAsync();
              }
              onDismiss();
            }}
            style={styles.dismissButton}
          >
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.alertMessage}>{message}</Text>
    </View>
  );
};

/**
 * Enhanced Medical Button with Haptic Feedback
 */
interface MedicalButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  hapticType?: "light" | "medium" | "heavy" | "selection";
}

export const MedicalButton: React.FC<MedicalButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  hapticType = "medium",
}) => {
  const handlePress = async () => {
    if (disabled || loading) return;

    // iOS haptic feedback
    if (Device.osName === "iOS") {
      switch (hapticType) {
        case "light":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "medium":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "heavy":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case "selection":
          await Haptics.selectionAsync();
          break;
      }
    }

    onPress();
  };

  const buttonConfig = getButtonConfig(variant);
  const sizeConfig = getButtonSizeConfig(size);

  return (
    <TouchableOpacity
      style={[
        styles.medicalButton,
        buttonConfig.style,
        sizeConfig.style,
        disabled && styles.disabledButton,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.buttonText,
          buttonConfig.textStyle,
          sizeConfig.textStyle,
        ]}
      >
        {loading ? "..." : title}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * DAAM Attention Heatmap with Enhanced Visualization
 */
interface DAAMAttentionMapProps {
  attentionMap: AttentionMap;
  imageUri?: string;
  showLegend?: boolean;
  interactive?: boolean;
  onRegionPress?: (x: number, y: number, value: number) => void;
}

export const DAAMAttentionMap: React.FC<DAAMAttentionMapProps> = ({
  attentionMap,
  imageUri,
  showLegend = true,
  interactive = true,
  onRegionPress,
}) => {
  const handleRegionPress = async (x: number, y: number) => {
    if (!interactive) return;

    const value = attentionMap.values[y]?.[x] ?? 0;

    if (Device.osName === "iOS") {
      // Haptic intensity based on attention value
      if (value > 0.8) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (value > 0.5) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    onRegionPress?.(x, y, value);

    // Show attention value alert
    Alert.alert(
      "DAAM Attention",
      `Position: (${x}, ${y})\nAttention Value: ${(value * 100).toFixed(
        1
      )}%\n\nThis region has ${getAttentionDescription(
        value
      )} attention from the MedDef model.`,
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.attentionMapContainer}>
      <Text style={styles.attentionMapTitle}>🧠 DAAM Attention Map</Text>

      {/* Attention Grid */}
      <View style={styles.attentionGrid}>
        {attentionMap.values.map((row, y) =>
          row.map((value, x) => (
            <TouchableOpacity
              key={`${x}-${y}`}
              style={[
                styles.attentionCell,
                {
                  backgroundColor: getAttentionColor(value),
                  opacity: 0.7 + value * 0.3,
                },
              ]}
              onPress={() => handleRegionPress(x, y)}
              activeOpacity={0.5}
            />
          ))
        )}
      </View>

      {/* Legend */}
      {showLegend && (
        <View style={styles.attentionLegend}>
          <Text style={styles.legendTitle}>Attention Intensity</Text>
          <View style={styles.legendBar}>
            <View
              style={[
                styles.legendSegment,
                { backgroundColor: getAttentionColor(0.1) },
              ]}
            />
            <View
              style={[
                styles.legendSegment,
                { backgroundColor: getAttentionColor(0.3) },
              ]}
            />
            <View
              style={[
                styles.legendSegment,
                { backgroundColor: getAttentionColor(0.5) },
              ]}
            />
            <View
              style={[
                styles.legendSegment,
                { backgroundColor: getAttentionColor(0.7) },
              ]}
            />
            <View
              style={[
                styles.legendSegment,
                { backgroundColor: getAttentionColor(0.9) },
              ]}
            />
          </View>
          <View style={styles.legendLabels}>
            <Text style={styles.legendLabel}>Low</Text>
            <Text style={styles.legendLabel}>High</Text>
          </View>
        </View>
      )}

      {/* DAAM Components Indicator */}
      <View style={styles.daamComponents}>
        <Text style={styles.componentTitle}>🛡️ DAAM Active Components:</Text>
        <View style={styles.componentsList}>
          <View
            style={[
              styles.componentBadge,
              { backgroundColor: medicalColors.attack.clean },
            ]}
          >
            <Text style={styles.componentText}>AFD</Text>
          </View>
          <View
            style={[
              styles.componentBadge,
              { backgroundColor: medicalColors.confidence.high },
            ]}
          >
            <Text style={styles.componentText}>MFE</Text>
          </View>
          <View
            style={[
              styles.componentBadge,
              { backgroundColor: medicalColors.datasets.roct },
            ]}
          >
            <Text style={styles.componentText}>MSF</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Helper Functions
const getConfidenceIcon = (confidence: number): string => {
  if (confidence >= 0.95) return "✅";
  if (confidence >= 0.85) return "⚠️";
  return "❌";
};

const getConfidenceContext = (confidence: number): string => {
  if (confidence >= 0.95) return "High Diagnostic Confidence";
  if (confidence >= 0.85) return "Moderate Confidence";
  return "Low Confidence - Review Required";
};

const getConfidenceAlertTitle = (confidence: number): string => {
  if (confidence >= 0.95) return "High Confidence Result";
  if (confidence >= 0.85) return "Moderate Confidence";
  return "⚠️ Low Confidence Alert";
};

const getConfidenceAlertMessage = (
  confidence: number,
  label?: string
): string => {
  const baseMessage = label ? `Prediction: ${label}\n` : "";

  if (confidence >= 0.95) {
    return `${baseMessage}The MedDef model shows high confidence (${Math.round(
      confidence * 100
    )}%) in this diagnosis. The DAAM attention mechanism indicates strong medical feature detection.`;
  } else if (confidence >= 0.85) {
    return `${baseMessage}The model shows moderate confidence (${Math.round(
      confidence * 100
    )}%). Consider additional validation or expert review.`;
  } else {
    return `${baseMessage}⚠️ Low confidence detected (${Math.round(
      confidence * 100
    )}%). This result requires medical professional review. The DAAM system may have detected adversarial patterns or unclear medical features.`;
  }
};

const getAlertConfig = (type: string) => {
  switch (type) {
    case "error":
      return { color: meddefTheme.colors.danger, icon: "🚨" };
    case "warning":
      return { color: meddefTheme.colors.warning, icon: "⚠️" };
    case "success":
      return { color: meddefTheme.colors.success, icon: "✅" };
    default:
      return { color: meddefTheme.colors.primary, icon: "ℹ️" };
  }
};

const getButtonConfig = (variant: string) => {
  switch (variant) {
    case "danger":
      return {
        style: { backgroundColor: meddefTheme.colors.danger },
        textStyle: { color: meddefTheme.colors.surface },
      };
    case "success":
      return {
        style: { backgroundColor: meddefTheme.colors.success },
        textStyle: { color: meddefTheme.colors.surface },
      };
    case "secondary":
      return {
        style: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: meddefTheme.colors.primary,
        },
        textStyle: { color: meddefTheme.colors.primary },
      };
    default:
      return {
        style: { backgroundColor: meddefTheme.colors.primary },
        textStyle: { color: meddefTheme.colors.surface },
      };
  }
};

const getButtonSizeConfig = (size: string) => {
  switch (size) {
    case "small":
      return {
        style: { paddingVertical: 8, paddingHorizontal: 12 },
        textStyle: { fontSize: 12 },
      };
    case "large":
      return {
        style: { paddingVertical: 16, paddingHorizontal: 24 },
        textStyle: { fontSize: 18 },
      };
    default:
      return {
        style: { paddingVertical: 12, paddingHorizontal: 20 },
        textStyle: { fontSize: 14 },
      };
  }
};

const getAttentionColor = (value: number): string => {
  // Create a heatmap color from blue (low) to red (high)
  const red = Math.min(255, Math.floor(value * 255));
  const blue = Math.max(0, Math.floor((1 - value) * 255));
  return `rgb(${red}, 0, ${blue})`;
};

const getAttentionDescription = (value: number): string => {
  if (value > 0.8) return "very high";
  if (value > 0.6) return "high";
  if (value > 0.4) return "moderate";
  if (value > 0.2) return "low";
  return "very low";
};

const styles = StyleSheet.create({
  // Enhanced Confidence Indicator
  enhancedConfidenceContainer: {
    backgroundColor: meddefTheme.colors.surface,
    borderRadius: meddefTheme.borderRadius.md,
    padding: meddefTheme.spacing.md,
    minWidth: 120,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  confidenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: meddefTheme.spacing.xs,
  },
  confidenceText: {
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  confidenceLabel: {
    fontSize: 10,
    color: meddefTheme.colors.text.secondary,
    marginLeft: meddefTheme.spacing.xs,
  },
  confidenceIcon: {
    fontSize: 16,
  },
  confidenceBar: {
    backgroundColor: meddefTheme.colors.text.muted,
    borderRadius: meddefTheme.borderRadius.sm,
    overflow: "hidden",
    marginBottom: meddefTheme.spacing.xs,
  },
  confidenceProgress: {
    borderRadius: meddefTheme.borderRadius.sm,
  },
  medicalContext: {
    alignItems: "center",
  },
  contextText: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
  },

  // Medical Alert
  alertContainer: {
    backgroundColor: meddefTheme.colors.surface,
    borderWidth: 1,
    borderRadius: meddefTheme.borderRadius.md,
    padding: meddefTheme.spacing.md,
    marginVertical: meddefTheme.spacing.xs,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: meddefTheme.spacing.sm,
  },
  alertIcon: {
    fontSize: 20,
    marginRight: meddefTheme.spacing.sm,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  dismissButton: {
    padding: meddefTheme.spacing.xs,
  },
  dismissText: {
    fontSize: 16,
    color: meddefTheme.colors.text.muted,
  },
  alertMessage: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    lineHeight: 20,
  },

  // Medical Button
  medicalButton: {
    borderRadius: meddefTheme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonText: {
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  disabledButton: {
    opacity: 0.5,
  },

  // DAAM Attention Map
  attentionMapContainer: {
    backgroundColor: meddefTheme.colors.surface,
    borderRadius: meddefTheme.borderRadius.md,
    padding: meddefTheme.spacing.md,
    margin: meddefTheme.spacing.sm,
  },
  attentionMapTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.md,
    textAlign: "center",
  },
  attentionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    aspectRatio: 1,
    backgroundColor: meddefTheme.colors.background,
    borderRadius: meddefTheme.borderRadius.sm,
    padding: 2,
  },
  attentionCell: {
    width: "7.14%", // 14x14 grid
    aspectRatio: 1,
    margin: 0.5,
    borderRadius: 1,
  },
  attentionLegend: {
    marginTop: meddefTheme.spacing.md,
    alignItems: "center",
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.xs,
  },
  legendBar: {
    flexDirection: "row",
    height: 8,
    width: "80%",
    borderRadius: 4,
    overflow: "hidden",
  },
  legendSegment: {
    flex: 1,
  },
  legendLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: meddefTheme.spacing.xs,
  },
  legendLabel: {
    fontSize: 10,
    color: meddefTheme.colors.text.secondary,
  },
  daamComponents: {
    marginTop: meddefTheme.spacing.md,
    alignItems: "center",
  },
  componentTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.xs,
  },
  componentsList: {
    flexDirection: "row",
    gap: meddefTheme.spacing.xs,
  },
  componentBadge: {
    paddingHorizontal: meddefTheme.spacing.sm,
    paddingVertical: meddefTheme.spacing.xs,
    borderRadius: meddefTheme.borderRadius.sm,
  },
  componentText: {
    color: meddefTheme.colors.surface,
    fontSize: 10,
    fontWeight: "600",
  },
});

// All components are already exported individually above
