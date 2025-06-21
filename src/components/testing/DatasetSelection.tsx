/**
 * MedDef: Medical Defense Model Testing - Dataset Selection Screen
 *
 * Beautiful dataset selection interface for ROCT vs Chest X-Ray
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { DatasetType } from "../../types/meddef";
import { MedDefCard, SectionHeader } from "../common/MedDefUI";
import { meddefTheme, shadows, medicalColors } from "../../config/theme";

interface DatasetSelectionProps {
  onSelectDataset: (dataset: DatasetType) => void;
  isLoading?: boolean;
}

const { width } = Dimensions.get("window");

export const DatasetSelection: React.FC<DatasetSelectionProps> = ({
  onSelectDataset,
  isLoading = false,
}) => {
  const datasets = [
    {
      id: "roct" as DatasetType,
      title: "Retinal OCT",
      description: "Optical Coherence Tomography retinal imaging",
      classes: ["CNV", "DME", "Drusen", "Normal"],
      icon: "👁️",
      color: medicalColors.datasets.roct,
      features: [
        "4-class classification",
        "Retinal pathology detection",
        "21.84M parameters",
        "DAAM-enhanced features",
      ],
      performance: {
        accuracy: "97.52%",
        robustness: "FGSM ε=0.05",
      },
    },
    {
      id: "chest_xray" as DatasetType,
      title: "Chest X-Ray",
      description: "Pneumonia detection in chest radiographs",
      classes: ["Normal", "Pneumonia"],
      icon: "🫁",
      color: medicalColors.datasets.chest_xray,
      features: [
        "2-class classification",
        "Pneumonia detection",
        "21.84M parameters",
        "DAAM-enhanced features",
      ],
      performance: {
        accuracy: "97.52%",
        robustness: "FGSM ε=0.05",
      },
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <SectionHeader
        title="MedDef Testing"
        subtitle="Select a medical imaging dataset to begin adversarial robustness testing"
      />

      <View style={styles.datasetGrid}>
        {datasets.map((dataset) => (
          <TouchableOpacity
            key={dataset.id}
            style={[styles.datasetCard, { borderColor: dataset.color }]}
            onPress={() => onSelectDataset(dataset.id)}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <View style={styles.datasetHeader}>
              <Text style={styles.datasetIcon}>{dataset.icon}</Text>
              <View style={styles.datasetTitleContainer}>
                <Text style={styles.datasetTitle}>{dataset.title}</Text>
                <Text style={styles.datasetDescription}>
                  {dataset.description}
                </Text>
              </View>
            </View>

            <View style={styles.classesContainer}>
              <Text style={styles.classesLabel}>Classes:</Text>
              <View style={styles.classesGrid}>
                {dataset.classes.map((className, index) => (
                  <View
                    key={index}
                    style={[styles.classChip, { borderColor: dataset.color }]}
                  >
                    <Text style={[styles.classText, { color: dataset.color }]}>
                      {className}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.featuresContainer}>
              {dataset.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.performanceContainer}>
              <View style={styles.performanceMetric}>
                <Text style={styles.performanceLabel}>Clean Accuracy</Text>
                <Text
                  style={[
                    styles.performanceValue,
                    { color: meddefTheme.colors.success },
                  ]}
                >
                  {dataset.performance.accuracy}
                </Text>
              </View>
              <View style={styles.performanceMetric}>
                <Text style={styles.performanceLabel}>Robustness</Text>
                <Text
                  style={[styles.performanceValue, { color: dataset.color }]}
                >
                  {dataset.performance.robustness}
                </Text>
              </View>
            </View>

            <View
              style={[styles.selectButton, { backgroundColor: dataset.color }]}
            >
              <Text style={styles.selectButtonText}>
                {isLoading ? "Loading..." : "Select Dataset"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoSection}>
        <MedDefCard style={styles.infoCard}>
          <Text style={styles.infoTitle}>About MedDef</Text>
          <Text style={styles.infoText}>
            MedDef is a novel adversarial-resilient medical imaging system with
            Defense-Aware Attention Mechanism (DAAM). It integrates adversarial
            robustness directly into feature extraction through three
            synergistic components:
          </Text>
          <View style={styles.componentsContainer}>
            <Text style={styles.componentItem}>
              🛡️ Adversarial Feature Detection (AFD)
            </Text>
            <Text style={styles.componentItem}>
              🔬 Medical Feature Extraction (MFE)
            </Text>
            <Text style={styles.componentItem}>
              📊 Multi-Scale Feature Analysis (MSF)
            </Text>
          </View>
        </MedDefCard>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: meddefTheme.colors.background,
    padding: meddefTheme.spacing.md,
  },

  datasetGrid: {
    gap: meddefTheme.spacing.lg,
  },

  datasetCard: {
    backgroundColor: meddefTheme.colors.surface,
    borderRadius: meddefTheme.borderRadius.lg,
    padding: meddefTheme.spacing.lg,
    borderWidth: 2,
    ...shadows.medium,
  },

  datasetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: meddefTheme.spacing.md,
  },

  datasetIcon: {
    fontSize: 48,
    marginRight: meddefTheme.spacing.md,
  },

  datasetTitleContainer: {
    flex: 1,
  },

  datasetTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
    marginBottom: 4,
  },

  datasetDescription: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
  },

  classesContainer: {
    marginBottom: meddefTheme.spacing.md,
  },

  classesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.sm,
  },

  classesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: meddefTheme.spacing.xs,
  },

  classChip: {
    borderWidth: 1,
    borderRadius: meddefTheme.borderRadius.sm,
    paddingHorizontal: meddefTheme.spacing.sm,
    paddingVertical: meddefTheme.spacing.xs,
  },

  classText: {
    fontSize: 12,
    fontWeight: "500",
  },

  featuresContainer: {
    marginBottom: meddefTheme.spacing.md,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  featureBullet: {
    fontSize: 16,
    color: meddefTheme.colors.primary,
    marginRight: meddefTheme.spacing.sm,
  },

  featureText: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    flex: 1,
  },

  performanceContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: meddefTheme.spacing.lg,
    paddingVertical: meddefTheme.spacing.md,
    backgroundColor: meddefTheme.colors.background,
    borderRadius: meddefTheme.borderRadius.sm,
  },

  performanceMetric: {
    alignItems: "center",
  },

  performanceLabel: {
    fontSize: 12,
    color: meddefTheme.colors.text.secondary,
    marginBottom: 4,
  },

  performanceValue: {
    fontSize: 18,
    fontWeight: "700",
  },

  selectButton: {
    borderRadius: meddefTheme.borderRadius.sm,
    paddingVertical: meddefTheme.spacing.md,
    alignItems: "center",
  },

  selectButtonText: {
    color: meddefTheme.colors.surface,
    fontSize: 16,
    fontWeight: "600",
  },

  infoSection: {
    marginTop: meddefTheme.spacing.xl,
  },

  infoCard: {
    backgroundColor: "#f0f9ff",
    borderColor: meddefTheme.colors.primary,
    borderWidth: 1,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.sm,
  },

  infoText: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: meddefTheme.spacing.md,
  },

  componentsContainer: {
    gap: meddefTheme.spacing.xs,
  },

  componentItem: {
    fontSize: 14,
    color: meddefTheme.colors.text.primary,
    lineHeight: 20,
  },
});

export default DatasetSelection;
