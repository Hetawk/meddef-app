/**
 * MedDef: Medical Defense Model Testing - Common UI Components
 *
 * Beautiful, reusable components with medical-grade design
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { MedDefCardProps, ConfidenceIndicatorProps } from "../../types/meddef";
import { meddefTheme, shadows, getConfidenceColor } from "../../config/theme";

/**
 * Beautiful MedDef Card Component
 * Medical-grade card with consistent styling and shadows
 */
export const MedDefCard: React.FC<MedDefCardProps> = ({
  children,
  style,
  onPress,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </CardComponent>
  );
};

/**
 * Confidence Indicator Component
 * Visual indicator for diagnostic confidence levels
 */
export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  size = "medium",
}) => {
  const color = getConfidenceColor(confidence);
  const percentage = Math.round(confidence * 100);

  const containerHeight = size === "small" ? 6 : size === "large" ? 12 : 8;
  const fontSize = size === "small" ? 12 : size === "large" ? 18 : 14;

  return (
    <View style={styles.confidenceContainer}>
      <Text style={[styles.confidenceText, { fontSize, color }]}>
        {percentage}%
      </Text>
      <View style={[styles.confidenceBar, { height: containerHeight }]}>
        <View
          style={[
            styles.confidenceProgress,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height: containerHeight,
            },
          ]}
        />
      </View>
    </View>
  );
};

/**
 * Medical Badge Component
 * Status badges for medical contexts
 */
interface MedicalBadgeProps {
  status: "clean" | "attack" | "suspicious";
  size?: "small" | "medium" | "large";
}

export const MedicalBadge: React.FC<MedicalBadgeProps> = ({
  status,
  size = "medium",
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "clean":
        return { color: meddefTheme.colors.success, label: "Clean", icon: "✓" };
      case "attack":
        return { color: meddefTheme.colors.danger, label: "Attack", icon: "⚠" };
      case "suspicious":
        return {
          color: meddefTheme.colors.warning,
          label: "Suspicious",
          icon: "?",
        };
      default:
        return {
          color: meddefTheme.colors.text.muted,
          label: "Unknown",
          icon: "-",
        };
    }
  };

  const config = getStatusConfig(status);
  const padding = size === "small" ? 4 : size === "large" ? 12 : 8;
  const fontSize = size === "small" ? 10 : size === "large" ? 14 : 12;

  return (
    <View style={[styles.badge, { backgroundColor: config.color, padding }]}>
      <Text style={[styles.badgeText, { fontSize }]}>
        {config.icon} {config.label}
      </Text>
    </View>
  );
};

/**
 * Loading Card Component
 * Beautiful loading state for cards
 */
interface LoadingCardProps {
  height?: number;
  message?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  height = 120,
  message = "Loading...",
}) => {
  return (
    <MedDefCard style={[styles.loadingCard, { height }]}>
      <View style={styles.shimmer} />
      <Text style={styles.loadingText}>{message}</Text>
    </MedDefCard>
  );
};

/**
 * Error Card Component
 * Beautiful error display with retry functionality
 */
interface ErrorCardProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ error, onRetry }) => {
  return (
    <MedDefCard style={styles.errorCard}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>{error}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </MedDefCard>
  );
};

/**
 * Section Header Component
 * Consistent section headers with medical styling
 */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {action && <View style={styles.sectionAction}>{action}</View>}
    </View>
  );
};

/**
 * Metric Card Component
 * Display key metrics with beautiful formatting
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  trend?: "up" | "down" | "stable";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  color = meddefTheme.colors.primary,
  trend,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      case "stable":
        return "→";
      default:
        return null;
    }
  };

  return (
    <MedDefCard style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValue}>
        <Text style={[styles.metricNumber, { color }]}>
          {value}
          {unit && <Text style={styles.metricUnit}>{unit}</Text>}
        </Text>
        {trend && <Text style={styles.metricTrend}>{getTrendIcon()}</Text>}
      </View>
    </MedDefCard>
  );
};

const styles = StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: meddefTheme.colors.surface,
    borderRadius: meddefTheme.borderRadius.md,
    padding: meddefTheme.spacing.md,
    ...shadows.medium,
    marginVertical: meddefTheme.spacing.xs,
  },

  // Confidence indicator styles
  confidenceContainer: {
    minWidth: 80,
  },
  confidenceText: {
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  confidenceBar: {
    backgroundColor: meddefTheme.colors.text.muted,
    borderRadius: meddefTheme.borderRadius.sm,
    overflow: "hidden",
  },
  confidenceProgress: {
    borderRadius: meddefTheme.borderRadius.sm,
  },

  // Badge styles
  badge: {
    borderRadius: meddefTheme.borderRadius.sm,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: meddefTheme.colors.surface,
    fontWeight: "600",
  },

  // Loading card styles
  loadingCard: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: meddefTheme.colors.background,
  },
  shimmer: {
    width: "80%",
    height: 20,
    backgroundColor: meddefTheme.colors.text.muted,
    borderRadius: meddefTheme.borderRadius.sm,
    opacity: 0.3,
    marginBottom: meddefTheme.spacing.sm,
  },
  loadingText: {
    color: meddefTheme.colors.text.secondary,
    fontSize: 14,
  },

  // Error card styles
  errorCard: {
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderColor: meddefTheme.colors.danger,
    borderWidth: 1,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: meddefTheme.spacing.sm,
  },
  errorText: {
    color: meddefTheme.colors.danger,
    textAlign: "center",
    marginBottom: meddefTheme.spacing.md,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: meddefTheme.colors.danger,
    paddingHorizontal: meddefTheme.spacing.md,
    paddingVertical: meddefTheme.spacing.sm,
    borderRadius: meddefTheme.borderRadius.sm,
  },
  retryButtonText: {
    color: meddefTheme.colors.surface,
    fontWeight: "600",
    fontSize: 14,
  },

  // Section header styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: meddefTheme.spacing.md,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
  },
  sectionAction: {
    marginLeft: meddefTheme.spacing.md,
  },

  // Metric card styles
  metricCard: {
    alignItems: "center",
    minHeight: 80,
    justifyContent: "center",
  },
  metricLabel: {
    fontSize: 12,
    color: meddefTheme.colors.text.secondary,
    textAlign: "center",
    marginBottom: 4,
  },
  metricValue: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: "400",
    color: meddefTheme.colors.text.secondary,
  },
  metricTrend: {
    fontSize: 16,
    marginLeft: 4,
  },
});

export default {
  MedDefCard,
  ConfidenceIndicator,
  MedicalBadge,
  LoadingCard,
  ErrorCard,
  SectionHeader,
  MetricCard,
};
