/**
 * Model Selection Component
 *
 * Allows users to select different model variants with detailed information
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { DatasetType, ModelVariant } from "../../types/meddef";
import { meddefTheme } from "../../config/theme";
import { MODEL_CONFIGS } from "../../config/modelStrategy";
import { MedDefCard, SectionHeader, LoadingCard } from "../common/MedDefUI";

interface ModelSelectionProps {
  dataset: DatasetType;
  onSelectVariant: (variantId: string) => Promise<void>;
  currentVariant?: ModelVariant | null;
  isLoading?: boolean;
}

export function ModelSelection({
  dataset,
  onSelectVariant,
  currentVariant,
  isLoading = false,
}: ModelSelectionProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    currentVariant?.id || null
  );

  const config = MODEL_CONFIGS[dataset];
  if (!config) {
    return (
      <MedDefCard>
        <Text style={styles.errorText}>No models available for {dataset}</Text>
      </MedDefCard>
    );
  }

  const handleVariantSelect = async (variant: ModelVariant) => {
    if (variant.id === currentVariant?.id) return;

    setSelectedVariantId(variant.id);

    try {
      await onSelectVariant(variant.id);
    } catch (error) {
      Alert.alert(
        "Loading Failed",
        error instanceof Error ? error.message : "Failed to load model variant"
      );
      setSelectedVariantId(currentVariant?.id || null);
    }
  };

  const renderVariantCard = (variant: ModelVariant) => {
    const isSelected = variant.id === currentVariant?.id;
    const isSelecting = selectedVariantId === variant.id && isLoading;

    return (
      <TouchableOpacity
        key={variant.id}
        style={[styles.variantCard, isSelected && styles.selectedVariant]}
        onPress={() => handleVariantSelect(variant)}
        disabled={isLoading}
      >
        <View style={styles.variantHeader}>
          <View style={styles.variantTitleContainer}>
            <Text
              style={[styles.variantName, isSelected && styles.selectedText]}
            >
              {variant.name}
            </Text>
            <View style={styles.badgeContainer}>
              {variant.isQuantized && (
                <View style={[styles.badge, styles.quantizedBadge]}>
                  <Text style={styles.badgeText}>Optimized</Text>
                </View>
              )}
              {variant.id === config.defaultVariant && (
                <View style={[styles.badge, styles.recommendedBadge]}>
                  <Text style={styles.badgeText}>Recommended</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.variantSize}>{variant.size}</Text>
        </View>

        <Text style={styles.variantDescription}>{variant.description}</Text>

        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Accuracy</Text>
            <Text style={styles.metricValue}>
              {(variant.accuracy * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Defense</Text>
            <Text
              style={[
                styles.metricValue,
                { color: getDefenseColor(variant.defenseCapability) },
              ]}
            >
              {variant.defenseCapability}
            </Text>
          </View>
        </View>

        {variant.downloadUrl && !variant.isQuantized && (
          <View style={styles.downloadInfo}>
            <Text style={styles.downloadText}>📥 Cloud download required</Text>
          </View>
        )}

        {isSelecting && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedIndicatorText}>✓ Active</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getDefenseColor = (capability: string): string => {
    switch (capability) {
      case "Maximum":
        return meddefTheme.colors.success;
      case "Very High":
        return meddefTheme.colors.primary;
      case "High":
        return meddefTheme.colors.warning;
      default:
        return meddefTheme.colors.danger;
    }
  };

  if (isLoading && !selectedVariantId) {
    return <LoadingCard message="Loading model variants..." />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SectionHeader
        title={`${dataset.toUpperCase()} Models`}
        subtitle="Choose your preferred model variant"
      />

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🎯 Model Selection Guide</Text>
        <Text style={styles.infoText}>
          • <Text style={styles.bold}>Lite</Text>: Fast, optimized for mobile
          {"\n"}• <Text style={styles.bold}>Standard</Text>: Balanced
          performance{"\n"}• <Text style={styles.bold}>Full</Text>: Maximum
          accuracy (requires download){"\n"}•{" "}
          <Text style={styles.bold}>Baseline</Text>: Standard CNN for comparison
        </Text>
      </View>

      <View style={styles.variantsContainer}>
        {config.variants.map(renderVariantCard)}
      </View>

      {currentVariant && (
        <MedDefCard style={styles.currentModelInfo}>
          <Text style={styles.currentModelTitle}>Currently Active</Text>
          <Text style={styles.currentModelName}>{currentVariant.name}</Text>
          <View style={styles.currentModelStats}>
            <Text style={styles.statItem}>
              📊 {(currentVariant.accuracy * 100).toFixed(1)}% accuracy
            </Text>
            <Text style={styles.statItem}>
              🛡️ {currentVariant.defenseCapability} defense
            </Text>
            <Text style={styles.statItem}>📱 {currentVariant.size} size</Text>
          </View>
        </MedDefCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  infoCard: {
    backgroundColor: meddefTheme.colors.primary + "10",
    padding: meddefTheme.spacing.md,
    borderRadius: meddefTheme.borderRadius.md,
    marginBottom: meddefTheme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: meddefTheme.colors.primary,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.primary,
    marginBottom: meddefTheme.spacing.sm,
  },

  infoText: {
    fontSize: 14,
    color: meddefTheme.colors.text.primary,
    lineHeight: 20,
  },

  bold: {
    fontWeight: "600",
  },

  variantsContainer: {
    marginBottom: meddefTheme.spacing.lg,
  },

  variantCard: {
    backgroundColor: meddefTheme.colors.surface,
    borderRadius: meddefTheme.borderRadius.md,
    padding: meddefTheme.spacing.md,
    marginBottom: meddefTheme.spacing.md,
    borderWidth: 2,
    borderColor: meddefTheme.colors.border,
    position: "relative",
  },

  selectedVariant: {
    borderColor: meddefTheme.colors.primary,
    backgroundColor: meddefTheme.colors.primary + "05",
  },

  variantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: meddefTheme.spacing.sm,
  },

  variantTitleContainer: {
    flex: 1,
  },

  variantName: {
    fontSize: 18,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.xs,
  },

  selectedText: {
    color: meddefTheme.colors.primary,
  },

  variantSize: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.secondary,
  },

  badgeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: meddefTheme.spacing.xs,
    marginBottom: meddefTheme.spacing.xs,
  },

  quantizedBadge: {
    backgroundColor: meddefTheme.colors.success,
  },

  recommendedBadge: {
    backgroundColor: meddefTheme.colors.primary,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },

  variantDescription: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    marginBottom: meddefTheme.spacing.md,
    lineHeight: 18,
  },

  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  metric: {
    flex: 1,
    alignItems: "center",
  },

  metricLabel: {
    fontSize: 12,
    color: meddefTheme.colors.text.muted,
    marginBottom: 2,
  },

  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
  },

  downloadInfo: {
    marginTop: meddefTheme.spacing.sm,
    padding: meddefTheme.spacing.sm,
    backgroundColor: meddefTheme.colors.warning + "20",
    borderRadius: meddefTheme.borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: meddefTheme.colors.warning,
  },

  downloadText: {
    fontSize: 12,
    color: meddefTheme.colors.warning,
    fontWeight: "500",
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: meddefTheme.borderRadius.md,
  },

  loadingText: {
    fontSize: 14,
    fontWeight: "500",
    color: meddefTheme.colors.primary,
  },

  selectedIndicator: {
    position: "absolute",
    top: meddefTheme.spacing.sm,
    right: meddefTheme.spacing.sm,
    backgroundColor: meddefTheme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  selectedIndicatorText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },

  currentModelInfo: {
    borderLeftWidth: 4,
    borderLeftColor: meddefTheme.colors.success,
  },

  currentModelTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: meddefTheme.colors.text.secondary,
    marginBottom: meddefTheme.spacing.xs,
  },

  currentModelName: {
    fontSize: 18,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.sm,
  },

  currentModelStats: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  statItem: {
    fontSize: 12,
    color: meddefTheme.colors.text.secondary,
    marginRight: meddefTheme.spacing.md,
    marginBottom: meddefTheme.spacing.xs,
  },

  errorText: {
    fontSize: 16,
    color: meddefTheme.colors.danger,
    textAlign: "center",
    padding: meddefTheme.spacing.lg,
  },
});
