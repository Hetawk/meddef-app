/**
 * MedDef: Enhanced Testing Screen with Real Adversarial Attack Testing
 *
 * Comprehensive testing interface with iOS optimizations and attack visualization
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as Device from "expo-device";
import {
  DatasetType,
  TestAsset,
  TestResult,
  EnhancedTestResult,
} from "../../types/meddef";
import { useMedDefTesting } from "../../hooks/useMedDefTesting";
import { useAssetManager } from "../../utils/assetManager";
import { meddefTheme, medicalColors } from "../../config/theme";
import {
  EnhancedConfidenceIndicator,
  MedicalAlert,
  MedicalButton,
  DAAMAttentionMap,
} from "../common/EnhancedMedicalUI";
import { MedDefCard, SectionHeader, MetricCard } from "../common/MedDefUI";

interface EnhancedTestingScreenProps {
  selectedDataset: DatasetType;
  onBack: () => void;
}

export const EnhancedTestingScreen: React.FC<EnhancedTestingScreenProps> = ({
  selectedDataset,
  onBack,
}) => {
  // State
  const [testMode, setTestMode] = useState<
    "standard" | "adversarial" | "robustness"
  >("standard");
  const [currentTest, setCurrentTest] = useState<TestAsset | null>(null);
  const [testResults, setTestResults] = useState<EnhancedTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [robustnessScore, setRobustnessScore] = useState<number | null>(null);

  // Hooks
  const {
    runTest,
    runAdversarialTest,
    runRobustnessEvaluation,
    isLoading,
    error,
    modelLoaded,
  } = useMedDefTesting();
  const { getRandomSample } = useAssetManager();

  // Safety checks for new functions
  const safeRunAdversarialTest =
    runAdversarialTest ||
    (async () => {
      throw new Error("Adversarial testing not available");
    });

  const safeRunRobustnessEvaluation =
    runRobustnessEvaluation ||
    (async () => {
      throw new Error("Robustness evaluation not available");
    });

  /**
   * Run standard MedDef testing
   */
  const handleStandardTest = useCallback(async () => {
    if (!modelLoaded) {
      Alert.alert("Error", "Model not loaded");
      return;
    }

    if (Device.osName === "iOS") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsRunning(true);
    try {
      const sampleAssets = getRandomSample(selectedDataset, 3);
      const results: EnhancedTestResult[] = [];

      for (const asset of sampleAssets) {
        setCurrentTest(asset);
        const result = await runTest(asset);
        // Convert TestResult to EnhancedTestResult
        const enhancedResult: EnhancedTestResult = {
          ...result,
          robustnessScore: result.confidence, // Use confidence as basic robustness indicator
        };
        results.push(enhancedResult);
      }

      setTestResults(results);
      setCurrentTest(null);

      if (Device.osName === "iOS") {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      }

      Alert.alert(
        "Testing Complete",
        `Processed ${results.length} medical images successfully!`,
        [{ text: "View Results" }]
      );
    } catch (err) {
      console.error("Standard test error:", err);
      Alert.alert(
        "Test Failed",
        err instanceof Error ? err.message : "Unknown error"
      );

      if (Device.osName === "iOS") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsRunning(false);
    }
  }, [modelLoaded, selectedDataset, runTest, getRandomSample]);

  /**
   * Run adversarial attack testing
   */
  const handleAdversarialTest = useCallback(async () => {
    if (!modelLoaded) {
      Alert.alert("Error", "Model not loaded");
      return;
    }

    if (Device.osName === "iOS") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setIsRunning(true);
    try {
      // Get clean assets only
      const cleanAssets = getRandomSample(selectedDataset, 2).filter(
        (asset) => asset.type === "clean"
      );

      if (cleanAssets.length === 0) {
        Alert.alert(
          "Error",
          "No clean assets available for adversarial testing"
        );
        return;
      }

      const results: EnhancedTestResult[] = [];

      for (const cleanAsset of cleanAssets) {
        setCurrentTest(cleanAsset);

        // Test FGSM attack
        const fgsmResult = await safeRunAdversarialTest(cleanAsset, "fgsm", {
          epsilon: 0.03,
        });
        results.push(fgsmResult);

        // Test PGD attack
        const pgdResult = await safeRunAdversarialTest(cleanAsset, "pgd", {
          epsilon: 0.03,
          iterations: 10,
          stepSize: 0.01,
        });
        results.push(pgdResult);
      }

      setTestResults(results);
      setCurrentTest(null);

      const averageRobustness =
        results.reduce((sum, r) => sum + (r.robustnessScore || 0), 0) /
        results.length;
      setRobustnessScore(averageRobustness);

      if (Device.osName === "iOS") {
        await Haptics.notificationAsync(
          averageRobustness > 0.7
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning
        );
      }

      Alert.alert(
        "Adversarial Testing Complete",
        `Model robustness score: ${(averageRobustness * 100).toFixed(1)}%`,
        [{ text: "Analyze Results" }]
      );
    } catch (err) {
      console.error("Adversarial test error:", err);
      Alert.alert(
        "Attack Test Failed",
        err instanceof Error ? err.message : "Unknown error"
      );

      if (Device.osName === "iOS") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsRunning(false);
    }
  }, [modelLoaded, selectedDataset, runAdversarialTest, getRandomSample]);

  /**
   * Run comprehensive robustness evaluation
   */
  const handleRobustnessEvaluation = useCallback(async () => {
    if (!modelLoaded) {
      Alert.alert("Error", "Model not loaded");
      return;
    }

    if (Device.osName === "iOS") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setIsRunning(true);
    try {
      const cleanAssets = getRandomSample(selectedDataset, 1).filter(
        (asset) => asset.type === "clean"
      );

      if (cleanAssets.length === 0) {
        Alert.alert(
          "Error",
          "No clean assets available for robustness evaluation"
        );
        return;
      }

      const cleanAsset = cleanAssets[0];
      setCurrentTest(cleanAsset);

      // Comprehensive attack configurations
      const attackConfigs = [
        { type: "fgsm" as const, config: { epsilon: 0.01 } },
        { type: "fgsm" as const, config: { epsilon: 0.03 } },
        { type: "fgsm" as const, config: { epsilon: 0.05 } },
        {
          type: "pgd" as const,
          config: { epsilon: 0.03, iterations: 10, stepSize: 0.01 },
        },
        { type: "medical_attention" as const, config: { epsilon: 0.03 } },
      ];

      const evaluation = await safeRunRobustnessEvaluation(
        cleanAsset,
        attackConfigs
      );

      setTestResults(evaluation.results);
      setRobustnessScore(evaluation.overallRobustness);
      setCurrentTest(null);

      if (Device.osName === "iOS") {
        await Haptics.notificationAsync(
          evaluation.overallRobustness > 0.8
            ? Haptics.NotificationFeedbackType.Success
            : evaluation.overallRobustness > 0.6
            ? Haptics.NotificationFeedbackType.Warning
            : Haptics.NotificationFeedbackType.Error
        );
      }

      Alert.alert(
        "Robustness Evaluation Complete",
        `Overall robustness: ${(evaluation.overallRobustness * 100).toFixed(
          1
        )}%\n` +
          `Weakest against: ${evaluation.weakestAttack}\n` +
          `Strongest against: ${evaluation.strongestDefense}`,
        [{ text: "View Details" }]
      );
    } catch (err) {
      console.error("Robustness evaluation error:", err);
      Alert.alert(
        "Evaluation Failed",
        err instanceof Error ? err.message : "Unknown error"
      );

      if (Device.osName === "iOS") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsRunning(false);
    }
  }, [modelLoaded, selectedDataset, runRobustnessEvaluation, getRandomSample]);

  /**
   * Render test mode selector
   */
  const renderTestModeSelector = () => (
    <View style={styles.modeSelector}>
      <SectionHeader
        title="Testing Mode"
        subtitle="Choose your evaluation approach"
      />
      <View style={styles.modeButtons}>
        {[
          { key: "standard", title: "🔬 Standard" },
          { key: "adversarial", title: "⚔️ Adversarial" },
          { key: "robustness", title: "🛡️ Robustness" },
        ].map((mode) => (
          <MedicalButton
            key={mode.key}
            title={mode.title}
            onPress={() => setTestMode(mode.key as any)}
            variant={testMode === mode.key ? "primary" : "secondary"}
            hapticType="selection"
          />
        ))}
      </View>
    </View>
  );

  /**
   * Render action buttons
   */
  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <MedicalButton
        title={isRunning ? "Running..." : getActionButtonTitle()}
        onPress={getActionButtonHandler()}
        variant="primary"
        disabled={isRunning || !modelLoaded}
        loading={isRunning}
        hapticType="heavy"
      />

      <MedicalButton
        title="← Back to Selection"
        onPress={onBack}
        variant="secondary"
        hapticType="light"
      />
    </View>
  );

  const getActionButtonTitle = () => {
    switch (testMode) {
      case "standard":
        return "🔬 Run Standard Test";
      case "adversarial":
        return "⚔️ Launch Attack Test";
      case "robustness":
        return "🛡️ Evaluate Robustness";
      default:
        return "Run Test";
    }
  };

  const getActionButtonSubtitle = () => {
    switch (testMode) {
      case "standard":
        return "Test with clean medical images";
      case "adversarial":
        return "Generate and test adversarial examples";
      case "robustness":
        return "Comprehensive attack evaluation";
      default:
        return "";
    }
  };

  const getActionButtonHandler = () => {
    switch (testMode) {
      case "standard":
        return handleStandardTest;
      case "adversarial":
        return handleAdversarialTest;
      case "robustness":
        return handleRobustnessEvaluation;
      default:
        return handleStandardTest;
    }
  };

  /**
   * Render test results
   */
  const renderTestResults = () => {
    if (testResults.length === 0) return null;

    return (
      <View style={styles.resultsSection}>
        <SectionHeader
          title="Test Results"
          subtitle={`${testResults.length} tests completed`}
        />

        {robustnessScore !== null && (
          <MedDefCard style={styles.robustnessCard}>
            <Text style={styles.robustnessTitle}>Overall Robustness Score</Text>
            <EnhancedConfidenceIndicator
              confidence={robustnessScore}
              label="Robustness"
              size="large"
              showAlert={true}
            />
          </MedDefCard>
        )}

        <ScrollView
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
        >
          {testResults.map((result, index) => (
            <MedDefCard key={index} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>
                  Test #{index + 1} - {result.predicted_label}
                </Text>
                <EnhancedConfidenceIndicator
                  confidence={result.confidence}
                  size="medium"
                  showAlert={false}
                />
              </View>

              {result.attackMetrics && (
                <View style={styles.attackMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Attack Success</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        {
                          color: result.attackMetrics.attackSuccess
                            ? medicalColors.error
                            : medicalColors.success,
                        },
                      ]}
                    >
                      {result.attackMetrics.attackSuccess ? "Yes" : "No"}
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Confidence Drop</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: medicalColors.warning },
                      ]}
                    >
                      {result.attackMetrics.confidenceDropPct.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Perturbation</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: medicalColors.info },
                      ]}
                    >
                      {result.attackMetrics.perturbationMagnitude.toFixed(4)}
                    </Text>
                  </View>
                </View>
              )}

              {result.attack_detected && (
                <MedicalAlert
                  type="warning"
                  title="Adversarial Pattern Detected"
                  message="DAAM analysis identified potential adversarial modifications"
                />
              )}

              <DAAMAttentionMap attentionMap={result.daam_attention} />
            </MedDefCard>
          ))}
        </ScrollView>
      </View>
    );
  };

  /**
   * Render current test status
   */
  const renderCurrentTest = () => {
    if (!currentTest) return null;

    return (
      <MedDefCard style={styles.currentTestCard}>
        <Text style={styles.currentTestTitle}>Currently Testing</Text>
        <Text style={styles.currentTestPath}>{currentTest.path}</Text>
        <Text style={styles.currentTestLabel}>
          Expected: {currentTest.true_label}
        </Text>
      </MedDefCard>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <SectionHeader
            title={`MedDef Testing: ${selectedDataset.toUpperCase()}`}
            subtitle="Advanced adversarial robustness evaluation"
          />
        </View>

        {error && (
          <MedicalAlert type="error" title="Testing Error" message={error} />
        )}

        {renderTestModeSelector()}
        {renderActionButtons()}
        {renderCurrentTest()}
        {renderTestResults()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: meddefTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: meddefTheme.spacing.lg,
    paddingBottom: meddefTheme.spacing.md,
  },
  modeSelector: {
    paddingHorizontal: meddefTheme.spacing.lg,
    marginBottom: meddefTheme.spacing.lg,
  },
  modeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: meddefTheme.spacing.md,
  },
  actionButtons: {
    paddingHorizontal: meddefTheme.spacing.lg,
    marginBottom: meddefTheme.spacing.lg,
    gap: meddefTheme.spacing.md,
  },
  currentTestCard: {
    marginHorizontal: meddefTheme.spacing.lg,
    marginBottom: meddefTheme.spacing.md,
    backgroundColor: medicalColors.info + "20",
    borderLeftWidth: 4,
    borderLeftColor: medicalColors.info,
  },
  currentTestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.xs,
  },
  currentTestPath: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  currentTestLabel: {
    fontSize: 14,
    color: medicalColors.info,
    fontWeight: "500",
    marginTop: meddefTheme.spacing.xs,
  },
  resultsSection: {
    paddingHorizontal: meddefTheme.spacing.lg,
    paddingBottom: meddefTheme.spacing.xl,
  },
  robustnessCard: {
    marginBottom: meddefTheme.spacing.lg,
    backgroundColor: medicalColors.success + "10",
    borderLeftWidth: 4,
    borderLeftColor: medicalColors.success,
  },
  robustnessTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.md,
    textAlign: "center",
  },
  resultsList: {
    maxHeight: 600,
  },
  resultCard: {
    marginBottom: meddefTheme.spacing.md,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: meddefTheme.spacing.md,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.text.primary,
    flex: 1,
  },
  attackMetrics: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: meddefTheme.spacing.md,
    gap: meddefTheme.spacing.sm,
  },
  metricItem: {
    flex: 1,
    backgroundColor: meddefTheme.colors.surface,
    padding: meddefTheme.spacing.sm,
    borderRadius: meddefTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: meddefTheme.colors.text.muted + "20",
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: meddefTheme.colors.text.secondary,
    marginBottom: meddefTheme.spacing.xs,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});
