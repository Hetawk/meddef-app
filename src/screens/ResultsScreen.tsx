/**
 * Results Screen - Test results and performance metrics
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { DatasetType, TestResult } from "../types/meddef";
import { meddefTheme } from "../config/theme";
import { useLiveModelTesting } from "../hooks/useLiveModelTesting";
import {
  MedDefCard,
  SectionHeader,
  MetricCard,
  ConfidenceIndicator,
  MedicalBadge,
  LoadingCard,
} from "../components/common/MedDefUI";
import { AttackDetectionVisualization } from "../components/visualization/AttackDetectionVisualization";

export function ResultsScreen() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Use live model testing hook
  const {
    runLiveTest,
    runBatchTest,
    modelLoaded,
    currentDataset,
    currentVariant,
    error: modelError,
  } = useLiveModelTesting();

  // Demo test images (for now - in a real app these would come from camera/gallery)
  const getDemoImages = (): string[] => {
    const baseImages = [
      "test_image_1.jpg",
      "test_image_2.jpg",
      "test_image_3.jpg",
      "test_image_4.jpg",
      "test_image_5.jpg",
    ];
    return baseImages;
  };

  // Run live test with demo images
  const runLiveTests = async () => {
    if (!modelLoaded) {
      Alert.alert("No Model", "Please load a model first in the Testing tab");
      return;
    }

    setIsRunning(true);

    try {
      console.log("🚀 Starting LIVE testing with real model...");

      const demoImages = getDemoImages();

      // Run live batch test with real model
      const liveResults = await runBatchTest(demoImages);

      setTestResults(liveResults);

      Alert.alert(
        "Live Testing Complete",
        `Successfully completed ${liveResults.length} live tests with ${currentVariant?.name}`,
        [{ text: "View Results" }]
      );

      console.log("✅ Live testing completed successfully");
    } catch (error) {
      console.error("Live testing error:", error);
      Alert.alert(
        "Error",
        `Live testing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsRunning(false);
    }
  };

  // Run single image test
  const runSingleTest = async () => {
    if (!modelLoaded) {
      Alert.alert("No Model", "Please load a model first in the Testing tab");
      return;
    }

    // For demo purposes, use first demo image
    const demoImage = getDemoImages()[0];

    try {
      setIsRunning(true);
      console.log("🧪 Running single live test...");

      const result = await runLiveTest(demoImage);
      setTestResults((prev) => [result, ...prev]);

      Alert.alert(
        "Test Complete",
        `Prediction: ${result.predicted_label} (${(
          result.confidence * 100
        ).toFixed(1)}%)\nAttack: ${
          result.attack_detected ? "DETECTED" : "CLEAN"
        }`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Single test error:", error);
      Alert.alert(
        "Error",
        `Test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    Alert.alert(
      "Clear Results",
      "Are you sure you want to clear all test results?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => setTestResults([]),
        },
      ]
    );
  };

  const calculateMetrics = () => {
    if (testResults.length === 0) {
      return {
        avgConfidence: 0,
        avgProcessingTime: 0,
        attackDetectionRate: 0,
      };
    }

    const avgConfidence =
      testResults.reduce((sum, r) => sum + r.confidence, 0) /
      testResults.length;
    const avgProcessingTime =
      testResults.reduce((sum, r) => sum + r.processing_time, 0) /
      testResults.length;
    const attackDetectionRate =
      testResults.filter((r) => r.attack_detected).length / testResults.length;

    return { avgConfidence, avgProcessingTime, attackDetectionRate };
  };

  const { avgConfidence, avgProcessingTime, attackDetectionRate } =
    calculateMetrics();

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Control Panel */}
          <SectionHeader title="Live Testing Control" />
          <MedDefCard style={styles.controlPanel}>
            {!modelLoaded ? (
              <View style={styles.noModelContainer}>
                <Text style={styles.noModelText}>⚠️ No model loaded</Text>
                <Text style={styles.noModelSubtext}>
                  Please load a model in the Testing tab first
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.modelInfoRow}>
                  <Text style={styles.modelInfoLabel}>Current Model:</Text>
                  <Text style={styles.modelInfoValue}>
                    {currentVariant?.name}
                  </Text>
                </View>
                <View style={styles.modelInfoRow}>
                  <Text style={styles.modelInfoLabel}>Dataset:</Text>
                  <Text style={styles.modelInfoValue}>
                    {currentDataset?.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.runButton]}
                    onPress={runLiveTests}
                    disabled={isRunning}
                  >
                    <Text style={styles.runButtonText}>
                      {isRunning
                        ? "🧪 Running Live Tests..."
                        : "🧪 Run Batch Test"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.singleButton]}
                    onPress={runSingleTest}
                    disabled={isRunning}
                  >
                    <Text style={styles.singleButtonText}>
                      {isRunning ? "⏳" : "🎯 Single Test"}
                    </Text>
                  </TouchableOpacity>

                  {testResults.length > 0 && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.clearButton]}
                      onPress={clearResults}
                    >
                      <Text style={styles.clearButtonText}>🗑️ Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </MedDefCard>

          {isRunning && (
            <LoadingCard
              message={`Running live tests with ${currentVariant?.name}...`}
            />
          )}

          {modelError && (
            <MedDefCard style={styles.errorCard}>
              <Text style={styles.errorText}>⚠️ Model Error: {modelError}</Text>
            </MedDefCard>
          )}

          {testResults.length > 0 && (
            <>
              {/* Performance Metrics */}
              <SectionHeader title="Performance Metrics" />
              <View style={styles.metricsGrid}>
                <MetricCard
                  label="Avg Confidence"
                  value={Math.round(avgConfidence * 100)}
                  unit="%"
                  color={meddefTheme.colors.success}
                />
                <MetricCard
                  label="Processing Time"
                  value={Math.round(avgProcessingTime)}
                  unit="ms"
                  color={meddefTheme.colors.primary}
                />
                <MetricCard
                  label="Attack Detection"
                  value={Math.round(attackDetectionRate * 100)}
                  unit="%"
                  color={meddefTheme.colors.warning}
                />
              </View>

              {/* Individual Results */}
              <SectionHeader title={`Test Results (${testResults.length})`} />
              {testResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedResult(result);
                    setShowDetailedView(true);
                  }}
                >
                  <MedDefCard style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultLabel}>Test {index + 1}</Text>
                      <MedicalBadge
                        status={result.attack_detected ? "attack" : "clean"}
                        size="small"
                      />
                    </View>

                    <View style={styles.resultContent}>
                      <View style={styles.resultInfo}>
                        <Text style={styles.predictedLabel}>
                          Predicted: {result.predicted_label}
                        </Text>
                        <Text style={styles.processingTime}>
                          {result.processing_time.toFixed(1)}ms
                        </Text>
                      </View>

                      <ConfidenceIndicator
                        confidence={result.confidence}
                        size="medium"
                      />
                    </View>

                    <View style={styles.resultFooter}>
                      <Text style={styles.tapHint}>
                        Tap for detailed analysis
                      </Text>
                    </View>
                  </MedDefCard>
                </TouchableOpacity>
              ))}
            </>
          )}

          {testResults.length === 0 && !isRunning && (
            <MedDefCard>
              <Text style={styles.noResultsText}>
                No test results yet. Run some tests to see performance metrics
                and detailed analysis.
              </Text>
            </MedDefCard>
          )}
        </View>
      </ScrollView>

      {/* Detailed Analysis Modal */}
      {showDetailedView && selectedResult && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detailed Analysis</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailedView(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <AttackDetectionVisualization
                result={selectedResult}
                showDetailedAnalysis={true}
              />
            </ScrollView>
          </View>
        </View>
      )}
    </>
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

  controlPanel: {
    marginBottom: meddefTheme.spacing.lg,
  },

  controlRow: {
    flexDirection: "row",
    marginBottom: meddefTheme.spacing.md,
  },

  datasetButton: {
    flex: 1,
    padding: meddefTheme.spacing.sm,
    marginHorizontal: meddefTheme.spacing.xs,
    borderRadius: meddefTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: meddefTheme.colors.border,
    backgroundColor: meddefTheme.colors.background,
  },

  activeDataset: {
    backgroundColor: meddefTheme.colors.primary,
    borderColor: meddefTheme.colors.primary,
  },

  datasetButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: meddefTheme.colors.text.primary,
  },

  activeDatasetText: {
    color: "#fff",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  actionButton: {
    paddingVertical: meddefTheme.spacing.sm,
    paddingHorizontal: meddefTheme.spacing.md,
    borderRadius: meddefTheme.borderRadius.sm,
    minWidth: 120,
  },

  runButton: {
    backgroundColor: meddefTheme.colors.success,
    flex: 1,
    marginRight: meddefTheme.spacing.sm,
  },

  clearButton: {
    backgroundColor: meddefTheme.colors.danger,
  },

  runButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },

  clearButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },

  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: meddefTheme.spacing.lg,
  },

  resultCard: {
    marginBottom: meddefTheme.spacing.sm,
  },

  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: meddefTheme.spacing.sm,
  },

  resultLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
  },

  resultContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resultInfo: {
    flex: 1,
    marginRight: meddefTheme.spacing.md,
  },

  predictedLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: meddefTheme.colors.text.primary,
    marginBottom: 4,
  },

  processingTime: {
    fontSize: 12,
    color: meddefTheme.colors.text.secondary,
  },

  noResultsText: {
    fontSize: 14,
    color: meddefTheme.colors.text.muted,
    textAlign: "center",
    fontStyle: "italic",
    padding: meddefTheme.spacing.lg,
    lineHeight: 20,
  },

  noModelContainer: {
    alignItems: "center",
    paddingVertical: meddefTheme.spacing.lg,
  },

  noModelText: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.warning,
    marginBottom: meddefTheme.spacing.sm,
  },

  noModelSubtext: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    textAlign: "center",
  },

  modelInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: meddefTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: meddefTheme.colors.border,
  },

  modelInfoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: meddefTheme.colors.text.secondary,
  },

  modelInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
  },

  singleButton: {
    backgroundColor: meddefTheme.colors.primary,
    marginHorizontal: meddefTheme.spacing.sm,
  },

  singleButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },

  errorCard: {
    backgroundColor: "#ffeaa7",
    borderColor: meddefTheme.colors.warning,
    borderWidth: 1,
  },

  errorText: {
    fontSize: 14,
    color: "#d63031",
    textAlign: "center",
  },

  resultFooter: {
    marginTop: meddefTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: meddefTheme.colors.border,
    paddingTop: meddefTheme.spacing.sm,
  },

  tapHint: {
    fontSize: 12,
    color: meddefTheme.colors.text.secondary,
    textAlign: "center",
    fontStyle: "italic",
  },

  // Modal styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modalContent: {
    backgroundColor: meddefTheme.colors.background,
    borderRadius: 12,
    margin: 20,
    maxHeight: "90%",
    maxWidth: "95%",
    width: "100%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: meddefTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: meddefTheme.colors.border,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: meddefTheme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },

  closeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
  },

  modalScroll: {
    maxHeight: 500,
    padding: meddefTheme.spacing.lg,
  },
});
