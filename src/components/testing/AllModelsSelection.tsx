/**
 * All Models Selection Component
 *
 * Shows all available models from both datasets in one unified list
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

interface AllModelsSelectionProps {
  onSelectModel: (dataset: DatasetType, variantId: string) => Promise<void>;
  currentVariant?: ModelVariant | null;
  isLoading?: boolean;
}

export function AllModelsSelection({
  onSelectModel,
  currentVariant,
  isLoading = false,
}: AllModelsSelectionProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    currentVariant?.id || null
  );

  // Combine all models from both datasets
  const allModels: Array<{ dataset: DatasetType; variant: ModelVariant }> = [];

  Object.entries(MODEL_CONFIGS).forEach(([datasetKey, config]) => {
    const dataset = datasetKey as DatasetType;
    config.variants.forEach((variant) => {
      allModels.push({ dataset, variant });
    });
  });

  const handleModelSelect = async (
    dataset: DatasetType,
    variant: ModelVariant
  ) => {
    if (variant.id === currentVariant?.id) return;

    setSelectedVariantId(variant.id);

    try {
      await onSelectModel(dataset, variant.id);
    } catch (error) {
      setSelectedVariantId(null);
      Alert.alert(
        "Error",
        `Failed to load model: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const renderModelCard = (dataset: DatasetType, variant: ModelVariant) => {
    const isSelected = variant.id === currentVariant?.id;
    const isSelecting = isLoading && selectedVariantId === variant.id;

    return (
      <TouchableOpacity
        key={`${dataset}-${variant.id}`}
        style={[styles.modelCard, isSelected && styles.modelCardSelected]}
        onPress={() => handleModelSelect(dataset, variant)}
        disabled={isLoading}
      >
        <View style={styles.modelHeader}>
          <Text style={styles.modelName}>
            {variant.name} ({dataset.toUpperCase()})
          </Text>
          <Text style={styles.modelSize}>{variant.size}</Text>
        </View>

        <Text style={styles.modelDescription}>{variant.description}</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Dataset</Text>
            <Text style={styles.metricValue}>{dataset.toUpperCase()}</Text>
          </View>
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

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        Select any model from either dataset. The model determines which type of
        medical images you can analyze.
      </Text>

      {allModels.map(({ dataset, variant }) =>
        renderModelCard(dataset, variant)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerText: {
    fontSize: 16,
    color: meddefTheme.colors.text.secondary,
    marginBottom: meddefTheme.spacing.lg,
    textAlign: "center",
    lineHeight: 22,
  },
  modelCard: {
    backgroundColor: meddefTheme.colors.surface,
    borderRadius: meddefTheme.borderRadius.md,
    padding: meddefTheme.spacing.lg,
    marginBottom: meddefTheme.spacing.md,
    borderWidth: 2,
    borderColor: meddefTheme.colors.border,
    position: "relative",
  },
  modelCardSelected: {
    borderColor: meddefTheme.colors.primary,
    backgroundColor: "#f8faff",
  },
  modelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: meddefTheme.spacing.sm,
  },
  modelName: {
    fontSize: 18,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
    flex: 1,
    marginRight: meddefTheme.spacing.sm,
  },
  modelSize: {
    fontSize: 14,
    fontWeight: "600",
    color: meddefTheme.colors.primary,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: meddefTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: meddefTheme.borderRadius.sm,
  },
  modelDescription: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    marginBottom: meddefTheme.spacing.md,
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: meddefTheme.spacing.sm,
  },
  metric: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: meddefTheme.colors.text.muted,
    marginBottom: 4,
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
  },
  downloadInfo: {
    backgroundColor: "#fef3c7",
    paddingVertical: meddefTheme.spacing.sm,
    paddingHorizontal: meddefTheme.spacing.md,
    borderRadius: meddefTheme.borderRadius.sm,
    marginTop: meddefTheme.spacing.sm,
  },
  downloadText: {
    fontSize: 12,
    color: "#92400e",
    textAlign: "center",
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
    fontSize: 16,
    color: meddefTheme.colors.primary,
    fontWeight: "600",
  },
  selectedIndicator: {
    position: "absolute",
    top: meddefTheme.spacing.md,
    right: meddefTheme.spacing.md,
    backgroundColor: meddefTheme.colors.success,
    paddingHorizontal: meddefTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: meddefTheme.borderRadius.sm,
  },
  selectedIndicatorText: {
    color: meddefTheme.colors.surface,
    fontSize: 12,
    fontWeight: "600",
  },
});
