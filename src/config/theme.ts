/**
 * MedDef: Medical Defense Model Testing - Theme Configuration
 *
 * Beautiful medical-grade design system for professional healthcare interface
 * Cross-platform optimized for iOS, Android, and Web
 */

import { Platform } from "react-native";
import { MedDefTheme } from "../types/meddef";

export const meddefTheme: MedDefTheme = {
  colors: {
    primary: "#2563eb", // Medical blue - professional and trustworthy
    success: "#16a34a", // Healthy green - positive medical outcomes
    warning: "#d97706", // Attention amber - caution alerts
    danger: "#dc2626", // Critical red - important medical alerts
    background: "#f8fafc", // Clean white-blue background
    surface: "#ffffff", // Pure white cards and surfaces
    border: "#e2e8f0", // Light gray border color
    text: {
      primary: "#1e293b", // Dark slate - primary text
      secondary: "#64748b", // Medium slate - secondary text
      muted: "#94a3b8", // Light slate - muted text
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },

  typography: {
    heading: Platform.select({
      ios: "SF Pro Display, system-ui, -apple-system, sans-serif",
      android: "Roboto, system-ui, sans-serif",
      default: "system-ui, -apple-system, sans-serif",
    }),
    body: Platform.select({
      ios: "SF Pro Text, system-ui, -apple-system, sans-serif",
      android: "Roboto, system-ui, sans-serif",
      default: "system-ui, -apple-system, sans-serif",
    }),
    mono: Platform.select({
      ios: "SF Mono, Consolas, Monaco, monospace",
      android: "Roboto Mono, monospace",
      default: "Consolas, Monaco, monospace",
    }),
  },
};

// Extended color palette for medical contexts
export const medicalColors = {
  // Confidence levels
  confidence: {
    high: "#16a34a", // >95% confidence
    medium: "#d97706", // 85-95% confidence
    low: "#dc2626", // <85% confidence
  },

  // Attack detection levels
  attack: {
    clean: "#16a34a", // No attack detected
    suspicious: "#d97706", // Potential attack patterns
    detected: "#dc2626", // Clear adversarial patterns
  },

  // Dataset specific colors
  datasets: {
    roct: "#3b82f6", // Blue for retinal OCT
    chest_xray: "#8b5cf6", // Purple for chest X-ray
  },

  // Performance indicators
  performance: {
    excellent: "#16a34a", // >97% accuracy
    good: "#65a30d", // 90-97% accuracy
    fair: "#d97706", // 80-90% accuracy
    poor: "#dc2626", // <80% accuracy
  },

  // Common medical UI colors
  success: "#16a34a",
  error: "#dc2626",
  warning: "#d97706",
  info: "#3b82f6",
};

// Cross-platform shadow configurations
export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
    },
  }),
};

// Animation configurations
export const animations = {
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: "ease-in-out",
    easeOut: "ease-out",
    easeIn: "ease-in",
  },
};

// Typography scale
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  weights: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing scale (extends theme.spacing)
export const spacing = {
  ...meddefTheme.spacing,
  "2xl": 48,
  "3xl": 64,
  "4xl": 80,
  "5xl": 96,
};

// Component-specific styling
export const componentStyles = {
  card: {
    backgroundColor: meddefTheme.colors.surface,
    borderRadius: meddefTheme.borderRadius.md,
    padding: meddefTheme.spacing.md,
    ...shadows.medium,
  },

  button: {
    primary: {
      backgroundColor: meddefTheme.colors.primary,
      borderRadius: meddefTheme.borderRadius.sm,
      paddingVertical: meddefTheme.spacing.sm,
      paddingHorizontal: meddefTheme.spacing.md,
    },
    secondary: {
      backgroundColor: "transparent",
      borderColor: meddefTheme.colors.primary,
      borderWidth: 1,
      borderRadius: meddefTheme.borderRadius.sm,
      paddingVertical: meddefTheme.spacing.sm,
      paddingHorizontal: meddefTheme.spacing.md,
    },
  },

  input: {
    backgroundColor: meddefTheme.colors.surface,
    borderColor: meddefTheme.colors.text.muted,
    borderWidth: 1,
    borderRadius: meddefTheme.borderRadius.sm,
    paddingVertical: meddefTheme.spacing.sm,
    paddingHorizontal: meddefTheme.spacing.md,
    fontSize: typography.sizes.base,
    color: meddefTheme.colors.text.primary,
  },

  confidenceBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: meddefTheme.colors.text.muted,
  },

  attentionHeatmap: {
    borderRadius: meddefTheme.borderRadius.sm,
    opacity: 0.7,
  },
};

// Medical-specific UI patterns
export const medicalUI = {
  // Diagnostic confidence indicators
  confidence: {
    high: {
      color: medicalColors.confidence.high,
      icon: "check-circle",
      label: "High Confidence",
    },
    medium: {
      color: medicalColors.confidence.medium,
      icon: "alert-circle",
      label: "Medium Confidence",
    },
    low: {
      color: medicalColors.confidence.low,
      icon: "x-circle",
      label: "Low Confidence",
    },
  },

  // Attack detection status
  attackStatus: {
    clean: {
      color: medicalColors.attack.clean,
      icon: "shield-check",
      label: "Clean Image",
    },
    suspicious: {
      color: medicalColors.attack.suspicious,
      icon: "shield",
      label: "Suspicious Patterns",
    },
    detected: {
      color: medicalColors.attack.detected,
      icon: "shield-x",
      label: "Attack Detected",
    },
  },

  // Performance status indicators
  performance: {
    excellent: {
      color: medicalColors.performance.excellent,
      icon: "trending-up",
      label: "Excellent",
    },
    good: {
      color: medicalColors.performance.good,
      icon: "check",
      label: "Good",
    },
    fair: {
      color: medicalColors.performance.fair,
      icon: "minus",
      label: "Fair",
    },
    poor: {
      color: medicalColors.performance.poor,
      icon: "trending-down",
      label: "Poor",
    },
  },
};

// Utility functions for theme usage
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.95) return medicalColors.confidence.high;
  if (confidence >= 0.85) return medicalColors.confidence.medium;
  return medicalColors.confidence.low;
};

export const getPerformanceColor = (accuracy: number): string => {
  if (accuracy >= 0.97) return medicalColors.performance.excellent;
  if (accuracy >= 0.9) return medicalColors.performance.good;
  if (accuracy >= 0.8) return medicalColors.performance.fair;
  return medicalColors.performance.poor;
};

export const getAttackColor = (
  attackDetected: boolean,
  confidence: number
): string => {
  if (!attackDetected && confidence >= 0.9) return medicalColors.attack.clean;
  if (attackDetected || confidence < 0.7) return medicalColors.attack.detected;
  return medicalColors.attack.suspicious;
};

// Export default theme
export default meddefTheme;
