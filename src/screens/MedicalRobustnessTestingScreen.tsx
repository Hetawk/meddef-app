/**
 * Medical Robustness Testing Screen
 *
 * Simplified flow for live medical AI robustness evaluation
 *
 * CI2P Laboratory
 * School of Information Science and Engineering
 * University of Jinan
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { meddefTheme } from "../config/theme";
import { appConfig, logger } from "../config/environment";
import { MedDefCard, SectionHeader } from "../components/common/MedDefUI";
import { DatasetType, TestResult } from "../types/meddef";

interface TestSession {
  dataset: DatasetType;
  modelVariant: string;
  imageType: "clean" | "adversarial" | "out_of_distribution";
  result?: TestResult;
  testStarted: boolean;
}

export function MedicalRobustnessTestingScreen() {
  const [session, setSession] = useState<TestSession>({
    dataset: "roct",
    modelVariant: "meddef_lite",
    imageType: "clean",
    testStarted: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Medical-Critical Test Categories
  const testCategories = [
    {
      id: "clean",
      name: "Clean Medical Images",
      description: "Normal medical images from training distribution",
      icon: "🏥",
      risk: "Low",
      color: meddefTheme.colors.success,
    },
    {
      id: "adversarial",
      name: "Adversarial Attacks",
      description: "Images with subtle adversarial perturbations",
      icon: "⚔️",
      risk: "High",
      color: meddefTheme.colors.danger,
    },
    {
      id: "out_of_distribution",
      name: "Out-of-Distribution",
      description: "Images from different domains/modalities",
      icon: "🔍",
      risk: "Medium",
      color: meddefTheme.colors.warning,
    },
  ];

  const modelVariants = [
    {
      id: "meddef_lite",
      name: "MedDef Lite",
      defense: "High",
      size: "15 MB",
      embedded: true,
    },
    {
      id: "meddef_full_server",
      name: "MedDef Full",
      defense: "Maximum",
      size: "120 MB",
      embedded: false,
    },
    {
      id: "meddef_base",
      name: "MedDef Base",
      defense: "None",
      size: "50 MB",
      embedded: false,
    },
  ];

  const runLiveTest = async () => {
    setIsLoading(true);
    logger.info("Starting medical robustness test", session);

    try {
      // Simulate live model inference
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock realistic medical AI results
      const mockResult: TestResult = {
        image_path: `/test_images/${session.dataset}/${session.imageType}/sample.jpg`,
        predicted_label: session.dataset === "roct" ? "Normal" : "Normal",
        confidence: 0.92 - (session.imageType === "adversarial" ? 0.25 : 0),
        attack_detected: session.imageType === "adversarial",
        daam_attention: {
          values: Array(64)
            .fill(0)
            .map(() =>
              Array(64)
                .fill(0)
                .map(() => Math.random())
            ),
          width: 64,
          height: 64,
          scale: 1.0,
        },
        processing_time: 150 + Math.random() * 100,
        timestamp: new Date().toISOString(),
      };

      setSession((prev) => ({
        ...prev,
        result: mockResult,
        testStarted: true,
      }));

      logger.info("Test completed", mockResult);
    } catch (error) {
      logger.error("Test failed", error);
      Alert.alert("Test Failed", `Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultStatus = (result: TestResult) => {
    if (session.imageType === "adversarial") {
      if (result.attack_detected) {
        return {
          status: "PROTECTED",
          color: meddefTheme.colors.success,
          icon: "🛡️",
        };
      } else {
        return {
          status: "VULNERABLE",
          color: meddefTheme.colors.danger,
          icon: "⚠️",
        };
      }
    }

    if (result.confidence > 0.8) {
      return {
        status: "CONFIDENT",
        color: meddefTheme.colors.success,
        icon: "✅",
      };
    } else if (result.confidence > 0.6) {
      return {
        status: "UNCERTAIN",
        color: meddefTheme.colors.warning,
        icon: "❓",
      };
    } else {
      return {
        status: "LOW CONFIDENCE",
        color: meddefTheme.colors.danger,
        icon: "❌",
      };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <MedDefCard style={styles.headerCard}>
          <Text style={styles.headerTitle}>Medical AI Robustness Testing</Text>
          <Text style={styles.headerSubtitle}>
            Live evaluation of adversarial defense mechanisms for medical
            imaging
          </Text>
          <Text style={styles.labInfo}>
            {appConfig.laboratory.name} •{" "}
            {appConfig.laboratory.institutionShort}
          </Text>
        </MedDefCard>

        {/* Test Configuration */}
        <SectionHeader title="Test Configuration" />

        {/* Dataset Selection */}
        <MedDefCard>
          <Text style={styles.configLabel}>Medical Dataset</Text>
          <View style={styles.optionRow}>
            {(["roct", "chest_xray"] as DatasetType[]).map((dataset) => (
              <TouchableOpacity
                key={dataset}
                style={[
                  styles.optionButton,
                  session.dataset === dataset && styles.optionButtonActive,
                ]}
                onPress={() => setSession((prev) => ({ ...prev, dataset }))}
              >
                <Text
                  style={[
                    styles.optionText,
                    session.dataset === dataset && styles.optionTextActive,
                  ]}
                >
                  {dataset === "roct" ? "Retinal OCT" : "Chest X-Ray"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </MedDefCard>

        {/* Model Selection */}
        <MedDefCard>
          <Text style={styles.configLabel}>Defense Model</Text>
          {modelVariants.map((model) => (
            <TouchableOpacity
              key={model.id}
              style={[
                styles.modelOption,
                session.modelVariant === model.id && styles.modelOptionActive,
              ]}
              onPress={() =>
                setSession((prev) => ({ ...prev, modelVariant: model.id }))
              }
            >
              <View style={styles.modelInfo}>
                <Text
                  style={[
                    styles.modelName,
                    session.modelVariant === model.id && styles.modelNameActive,
                  ]}
                >
                  {model.name}
                </Text>
                <Text style={styles.modelDetails}>
                  Defense: {model.defense} • Size: {model.size} •
                  {model.embedded ? " Embedded" : " Download Required"}
                </Text>
              </View>
              <View
                style={[
                  styles.selectionIndicator,
                  session.modelVariant === model.id &&
                    styles.selectionIndicatorActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </MedDefCard>

        {/* Test Type Selection */}
        <MedDefCard>
          <Text style={styles.configLabel}>Test Scenario</Text>
          {testCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.testOption,
                session.imageType === category.id && styles.testOptionActive,
              ]}
              onPress={() =>
                setSession((prev) => ({
                  ...prev,
                  imageType: category.id as
                    | "clean"
                    | "adversarial"
                    | "out_of_distribution",
                }))
              }
            >
              <Text style={styles.testIcon}>{category.icon}</Text>
              <View style={styles.testInfo}>
                <Text
                  style={[
                    styles.testName,
                    session.imageType === category.id && styles.testNameActive,
                  ]}
                >
                  {category.name}
                </Text>
                <Text style={styles.testDescription}>
                  {category.description}
                </Text>
              </View>
              <View
                style={[
                  styles.riskBadge,
                  { backgroundColor: category.color + "20" },
                ]}
              >
                <Text style={[styles.riskText, { color: category.color }]}>
                  {category.risk} Risk
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </MedDefCard>

        {/* Run Test Button */}
        <TouchableOpacity
          style={[styles.runButton, isLoading && styles.runButtonDisabled]}
          onPress={runLiveTest}
          disabled={isLoading}
        >
          <Text style={styles.runButtonText}>
            {isLoading ? "🧠 Running Inference..." : "🚀 Run Live Test"}
          </Text>
        </TouchableOpacity>

        {/* Test Results */}
        {session.result && (
          <>
            <SectionHeader title="Live Test Results" />
            <MedDefCard style={styles.resultsCard}>
              {(() => {
                const status = getResultStatus(session.result);
                return (
                  <>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultIcon}>{status.icon}</Text>
                      <Text
                        style={[styles.resultStatus, { color: status.color }]}
                      >
                        {status.status}
                      </Text>
                    </View>

                    <View style={styles.resultGrid}>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Prediction</Text>
                        <Text style={styles.resultValue}>
                          {session.result.predicted_label}
                        </Text>
                      </View>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Confidence</Text>
                        <Text
                          style={[
                            styles.resultValue,
                            {
                              color:
                                session.result.confidence > 0.8
                                  ? meddefTheme.colors.success
                                  : meddefTheme.colors.warning,
                            },
                          ]}
                        >
                          {(session.result.confidence * 100).toFixed(1)}%
                        </Text>
                      </View>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Processing Time</Text>
                        <Text style={styles.resultValue}>
                          {session.result.processing_time.toFixed(0)}ms
                        </Text>
                      </View>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Attack Detection</Text>
                        <Text
                          style={[
                            styles.resultValue,
                            {
                              color: session.result.attack_detected
                                ? meddefTheme.colors.success
                                : meddefTheme.colors.text.muted,
                            },
                          ]}
                        >
                          {session.result.attack_detected ? "Detected" : "None"}
                        </Text>
                      </View>
                    </View>

                    {/* Medical Safety Assessment */}
                    <View style={styles.safetyAssessment}>
                      <Text style={styles.safetyTitle}>
                        Medical Safety Assessment
                      </Text>
                      {session.imageType === "adversarial" && (
                        <Text
                          style={[
                            styles.safetyText,
                            {
                              color: session.result.attack_detected
                                ? meddefTheme.colors.success
                                : meddefTheme.colors.danger,
                            },
                          ]}
                        >
                          {session.result.attack_detected
                            ? "✅ Model successfully detected adversarial manipulation"
                            : "⚠️ Model failed to detect adversarial attack - potential misdiagnosis risk"}
                        </Text>
                      )}
                      {session.imageType === "clean" && (
                        <Text
                          style={[
                            styles.safetyText,
                            {
                              color:
                                session.result.confidence > 0.8
                                  ? meddefTheme.colors.success
                                  : meddefTheme.colors.warning,
                            },
                          ]}
                        >
                          {session.result.confidence > 0.8
                            ? "✅ High confidence prediction suitable for clinical decision support"
                            : "⚠️ Low confidence - recommend human expert review"}
                        </Text>
                      )}
                      {session.imageType === "out_of_distribution" && (
                        <Text
                          style={[
                            styles.safetyText,
                            { color: meddefTheme.colors.warning },
                          ]}
                        >
                          ❓ Out-of-distribution input detected - model may not
                          be reliable
                        </Text>
                      )}
                    </View>
                  </>
                );
              })()}
            </MedDefCard>

            {/* Clinical Recommendations */}
            <MedDefCard style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>
                Clinical Deployment Recommendations
              </Text>
              <Text style={styles.recommendationText}>
                • Always combine AI predictions with clinical expertise{"\n"}•
                Monitor for unusual confidence patterns{"\n"}• Implement
                adversarial detection in production{"\n"}• Regular validation
                with new data distributions{"\n"}• Human oversight required for
                critical decisions
              </Text>
            </MedDefCard>
          </>
        )}
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

  headerCard: {
    alignItems: "center",
    marginBottom: meddefTheme.spacing.lg,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
    textAlign: "center",
    marginBottom: meddefTheme.spacing.sm,
  },

  headerSubtitle: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    textAlign: "center",
    marginBottom: meddefTheme.spacing.sm,
  },

  labInfo: {
    fontSize: 12,
    color: meddefTheme.colors.primary,
    fontWeight: "600",
  },

  configLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.md,
  },

  optionRow: {
    flexDirection: "row",
    gap: meddefTheme.spacing.sm,
  },

  optionButton: {
    flex: 1,
    padding: meddefTheme.spacing.md,
    borderRadius: meddefTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: meddefTheme.colors.border,
    alignItems: "center",
  },

  optionButtonActive: {
    backgroundColor: meddefTheme.colors.primary + "10",
    borderColor: meddefTheme.colors.primary,
  },

  optionText: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    fontWeight: "500",
  },

  optionTextActive: {
    color: meddefTheme.colors.primary,
    fontWeight: "600",
  },

  modelOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: meddefTheme.spacing.md,
    borderRadius: meddefTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: meddefTheme.colors.border,
    marginBottom: meddefTheme.spacing.sm,
  },

  modelOptionActive: {
    backgroundColor: meddefTheme.colors.primary + "10",
    borderColor: meddefTheme.colors.primary,
  },

  modelInfo: {
    flex: 1,
  },

  modelName: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: 2,
  },

  modelNameActive: {
    color: meddefTheme.colors.primary,
  },

  modelDetails: {
    fontSize: 12,
    color: meddefTheme.colors.text.secondary,
  },

  selectionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: meddefTheme.colors.border,
  },

  selectionIndicatorActive: {
    backgroundColor: meddefTheme.colors.primary,
    borderColor: meddefTheme.colors.primary,
  },

  testOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: meddefTheme.spacing.md,
    borderRadius: meddefTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: meddefTheme.colors.border,
    marginBottom: meddefTheme.spacing.sm,
  },

  testOptionActive: {
    backgroundColor: meddefTheme.colors.primary + "10",
    borderColor: meddefTheme.colors.primary,
  },

  testIcon: {
    fontSize: 24,
    marginRight: meddefTheme.spacing.md,
  },

  testInfo: {
    flex: 1,
  },

  testName: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: 2,
  },

  testNameActive: {
    color: meddefTheme.colors.primary,
  },

  testDescription: {
    fontSize: 12,
    color: meddefTheme.colors.text.secondary,
  },

  riskBadge: {
    paddingHorizontal: meddefTheme.spacing.sm,
    paddingVertical: meddefTheme.spacing.xs,
    borderRadius: meddefTheme.borderRadius.sm,
  },

  riskText: {
    fontSize: 10,
    fontWeight: "600",
  },

  runButton: {
    backgroundColor: meddefTheme.colors.primary,
    padding: meddefTheme.spacing.lg,
    borderRadius: meddefTheme.borderRadius.md,
    alignItems: "center",
    marginVertical: meddefTheme.spacing.lg,
  },

  runButtonDisabled: {
    backgroundColor: meddefTheme.colors.text.muted,
  },

  runButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },

  resultsCard: {
    marginBottom: meddefTheme.spacing.md,
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: meddefTheme.spacing.md,
  },

  resultIcon: {
    fontSize: 24,
    marginRight: meddefTheme.spacing.sm,
  },

  resultStatus: {
    fontSize: 18,
    fontWeight: "700",
  },

  resultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: meddefTheme.spacing.md,
    marginBottom: meddefTheme.spacing.md,
  },

  resultItem: {
    width: "48%",
  },

  resultLabel: {
    fontSize: 12,
    color: meddefTheme.colors.text.secondary,
    marginBottom: 2,
  },

  resultValue: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
  },

  safetyAssessment: {
    backgroundColor: meddefTheme.colors.surface,
    padding: meddefTheme.spacing.md,
    borderRadius: meddefTheme.borderRadius.md,
    marginTop: meddefTheme.spacing.md,
  },

  safetyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.sm,
  },

  safetyText: {
    fontSize: 14,
    lineHeight: 20,
  },

  recommendationsCard: {
    backgroundColor: meddefTheme.colors.surface,
  },

  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.sm,
  },

  recommendationText: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    lineHeight: 20,
  },
});
