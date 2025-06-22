/**
 * Attack Detection Visualization Component
 *
 * Displays DAAM attention maps and attack detection results
 * for medical image analysis
 *
 * CI2P Laboratory
 * School of Information Science and Engineering
 * University of Jinan
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { meddefTheme } from "../../config/theme";
import { MedDefCard } from "../common/MedDefUI";
import { TestResult } from "../../types/meddef";

interface AttackDetectionVisualizationProps {
  result: TestResult;
  showDetailedAnalysis?: boolean;
}

export function AttackDetectionVisualization({
  result,
  showDetailedAnalysis = true,
}: AttackDetectionVisualizationProps) {
  const { width: screenWidth } = Dimensions.get("window");
  const attentionMapSize = Math.min(screenWidth - 80, 300);

  const renderAttentionMap = () => {
    if (!result.daam_attention) return null;

    const { values, width, height } = result.daam_attention;
    const cellSize = attentionMapSize / Math.max(width, height);

    return (
      <View style={styles.attentionMapContainer}>
        <Text style={styles.sectionTitle}>DAAM Attention Map</Text>
        <Text style={styles.sectionSubtitle}>
          Focus areas in medical image analysis
        </Text>

        <View
          style={[
            styles.attentionGrid,
            { width: attentionMapSize, height: attentionMapSize },
          ]}
        >
          {values.map((row, y) =>
            row.map((intensity, x) => (
              <View
                key={`${x}-${y}`}
                style={[
                  styles.attentionCell,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: getAttentionColor(intensity),
                  },
                ]}
              />
            ))
          )}
        </View>

        <View style={styles.colorLegend}>
          <Text style={styles.legendText}>Low</Text>
          <View style={styles.legendGradient}>
            {Array.from({ length: 10 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.legendColor,
                  { backgroundColor: getAttentionColor(i / 9) },
                ]}
              />
            ))}
          </View>
          <Text style={styles.legendText}>High</Text>
        </View>
      </View>
    );
  };

  const renderDetectionSummary = () => (
    <MedDefCard style={styles.summaryCard}>
      <View style={styles.detectionHeader}>
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: result.attack_detected
                  ? meddefTheme.colors.danger
                  : meddefTheme.colors.success,
              },
            ]}
          />
          <Text style={styles.statusText}>
            {result.attack_detected ? "ATTACK DETECTED" : "CLEAN IMAGE"}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Prediction</Text>
          <Text style={styles.metricValue}>{result.predicted_label}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Confidence</Text>
          <Text style={styles.metricValue}>
            {(result.confidence * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Processing</Text>
          <Text style={styles.metricValue}>{result.processing_time}ms</Text>
        </View>
      </View>
    </MedDefCard>
  );

  const renderDetailedAnalysis = () => {
    if (!showDetailedAnalysis) return null;

    // Mock detailed analysis - in real app this would come from attack detection results
    const mockIndicators = {
      attention_dispersion: Math.random() * 2,
      prediction_uncertainty: Math.random() * 3,
      feature_magnitude: Math.random() * 10,
      gradient_consistency: Math.random() * 5,
    };

    return (
      <MedDefCard style={styles.analysisCard}>
        <Text style={styles.sectionTitle}>Detailed Analysis</Text>

        <View style={styles.indicatorsList}>
          <AnalysisIndicator
            label="Attention Dispersion"
            value={mockIndicators.attention_dispersion}
            threshold={1.0}
            description="Measures how scattered the model's attention is across the image"
          />
          <AnalysisIndicator
            label="Prediction Uncertainty"
            value={mockIndicators.prediction_uncertainty}
            threshold={2.0}
            description="Entropy of the prediction distribution"
          />
          <AnalysisIndicator
            label="Feature Magnitude"
            value={mockIndicators.feature_magnitude}
            threshold={5.0}
            description="L2 norm of input features"
          />
          <AnalysisIndicator
            label="Gradient Consistency"
            value={mockIndicators.gradient_consistency}
            threshold={3.0}
            description="Stability of gradients under small perturbations"
          />
        </View>
      </MedDefCard>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderDetectionSummary()}
      {renderAttentionMap()}
      {renderDetailedAnalysis()}
    </ScrollView>
  );
}

interface AnalysisIndicatorProps {
  label: string;
  value: number;
  threshold: number;
  description: string;
}

function AnalysisIndicator({
  label,
  value,
  threshold,
  description,
}: AnalysisIndicatorProps) {
  const isAnomalous = value > threshold;
  const normalizedValue = Math.min(value / (threshold * 2), 1);

  return (
    <View style={styles.indicator}>
      <View style={styles.indicatorHeader}>
        <Text style={styles.indicatorLabel}>{label}</Text>
        <Text
          style={[
            styles.indicatorValue,
            {
              color: isAnomalous
                ? meddefTheme.colors.danger
                : meddefTheme.colors.success,
            },
          ]}
        >
          {value.toFixed(2)}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${normalizedValue * 100}%`,
              backgroundColor: isAnomalous
                ? meddefTheme.colors.danger
                : meddefTheme.colors.success,
            },
          ]}
        />
      </View>

      <Text style={styles.indicatorDescription}>{description}</Text>
    </View>
  );
}

function getAttentionColor(intensity: number): string {
  // Convert attention intensity (0-1) to color
  const normalizedIntensity = Math.max(0, Math.min(1, intensity));

  if (normalizedIntensity < 0.5) {
    // Blue to white
    const factor = normalizedIntensity * 2;
    const blue = 255;
    const green = Math.round(255 * factor);
    const red = Math.round(255 * factor);
    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    // White to red
    const factor = (normalizedIntensity - 0.5) * 2;
    const red = 255;
    const green = Math.round(255 * (1 - factor));
    const blue = Math.round(255 * (1 - factor));
    return `rgb(${red}, ${green}, ${blue})`;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: meddefTheme.colors.background,
  },
  summaryCard: {
    marginBottom: meddefTheme.spacing.lg,
  },
  detectionHeader: {
    marginBottom: meddefTheme.spacing.md,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: meddefTheme.spacing.sm,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  metric: {
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
  },
  attentionMapContainer: {
    alignItems: "center",
    marginBottom: meddefTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    marginBottom: meddefTheme.spacing.lg,
    textAlign: "center",
  },
  attentionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: meddefTheme.colors.border,
  },
  attentionCell: {
    // Dynamic size set in component
  },
  colorLegend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: meddefTheme.spacing.md,
  },
  legendText: {
    fontSize: 12,
    color: meddefTheme.colors.text.secondary,
  },
  legendGradient: {
    flexDirection: "row",
    marginHorizontal: meddefTheme.spacing.sm,
  },
  legendColor: {
    width: 20,
    height: 12,
  },
  analysisCard: {
    marginBottom: meddefTheme.spacing.lg,
  },
  indicatorsList: {
    gap: meddefTheme.spacing.md,
  },
  indicator: {
    marginBottom: meddefTheme.spacing.md,
  },
  indicatorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  indicatorLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressBar: {
    height: 6,
    backgroundColor: meddefTheme.colors.border,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  indicatorDescription: {
    fontSize: 12,
    color: meddefTheme.colors.text.secondary,
    lineHeight: 16,
  },
});

export default AttackDetectionVisualization;
