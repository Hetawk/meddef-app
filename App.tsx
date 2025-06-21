/**
 * MedDef: Medical Defense Model Testing - Main App Component
 *
 * Beautiful React Native app for testing MedDef adversarial robustness
 * across Retinal OCT and Chest X-Ray medical imaging datasets
 */

import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Alert,
} from "react-native";
import { DatasetType, TestAsset, TestResult } from "./src/types/meddef";
import { DatasetSelection } from "./src/components/testing/DatasetSelection";
import { useMedDefTesting } from "./src/hooks/useMedDefTesting";
import { useAssetManager } from "./src/utils/assetManager";
import { meddefTheme } from "./src/config/theme";
import {
  MedDefCard,
  LoadingCard,
  ErrorCard,
  SectionHeader,
  MetricCard,
  ConfidenceIndicator,
  MedicalBadge,
} from "./src/components/common/MedDefUI";

export default function App() {
  // State management
  const [currentScreen, setCurrentScreen] = useState<
    "selection" | "testing" | "results"
  >("selection");
  const [selectedDataset, setSelectedDataset] = useState<DatasetType | null>(
    null
  );
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Hooks
  const { loadModel, runTest, isLoading, error, modelLoaded } =
    useMedDefTesting();
  const { loadAssets, getRandomSample } = useAssetManager();

  /**
   * Handle dataset selection and model loading
   */
  const handleDatasetSelection = async (dataset: DatasetType) => {
    try {
      setSelectedDataset(dataset);
      console.log(`📱 Selected dataset: ${dataset}`);

      // Load MedDef model
      await loadModel(dataset);

      // Load test assets
      await loadAssets(dataset);

      // Navigate to testing screen
      setCurrentScreen("testing");

      Alert.alert(
        "Model Loaded Successfully",
        `MedDef model for ${dataset} is ready for testing!`,
        [{ text: "Start Testing", onPress: () => runQuickTest(dataset) }]
      );
    } catch (err) {
      Alert.alert(
        "Loading Failed",
        err instanceof Error ? err.message : "Failed to load model",
        [{ text: "OK", onPress: () => setCurrentScreen("selection") }]
      );
    }
  };

  /**
   * Run a quick test with sample images
   */
  const runQuickTest = async (dataset: DatasetType) => {
    if (!modelLoaded) {
      Alert.alert("Error", "Model not loaded");
      return;
    }

    try {
      // Get sample assets for testing
      const sampleAssets = getRandomSample(dataset, 5);
      console.log(
        `🧪 Running quick test with ${sampleAssets.length} samples...`
      );

      const results: TestResult[] = [];

      for (const asset of sampleAssets) {
        try {
          const result = await runTest(asset);
          results.push(result);
          console.log(
            `✅ Test ${results.length}/${sampleAssets.length} complete`
          );
        } catch (testError) {
          console.error("Test failed:", testError);
        }
      }

      setTestResults(results);
      setCurrentScreen("results");

      Alert.alert(
        "Testing Complete",
        `Completed ${results.length}/${sampleAssets.length} tests successfully`,
        [{ text: "View Results" }]
      );
    } catch (err) {
      Alert.alert(
        "Testing Failed",
        err instanceof Error ? err.message : "Failed to run tests"
      );
    }
  };

  /**
   * Render dataset selection screen
   */
  const renderDatasetSelection = () => (
    <DatasetSelection
      onSelectDataset={handleDatasetSelection}
      isLoading={isLoading}
    />
  );

  /**
   * Render testing screen
   */
  const renderTestingScreen = () => (
    <View style={styles.container}>
      <SectionHeader
        title={`Testing ${selectedDataset?.toUpperCase()}`}
        subtitle="MedDef adversarial robustness evaluation"
      />

      {isLoading ? (
        <LoadingCard message="Running MedDef inference..." />
      ) : error ? (
        <ErrorCard
          error={error}
          onRetry={() => runQuickTest(selectedDataset!)}
        />
      ) : (
        <MedDefCard>
          <Text style={styles.testingText}>
            Model loaded successfully! Running sample tests...
          </Text>
        </MedDefCard>
      )}
    </View>
  );

  /**
   * Render results screen
   */
  const renderResultsScreen = () => {
    const avgConfidence =
      testResults.reduce((sum, r) => sum + r.confidence, 0) /
      testResults.length;
    const avgProcessingTime =
      testResults.reduce((sum, r) => sum + r.processing_time, 0) /
      testResults.length;
    const attackDetectionRate =
      testResults.filter((r) => r.attack_detected).length / testResults.length;

    return (
      <View style={styles.container}>
        <SectionHeader
          title="Test Results"
          subtitle={`${testResults.length} tests completed on ${selectedDataset}`}
        />

        {/* Performance Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard
            label="Average Confidence"
            value={Math.round(avgConfidence * 100)}
            unit="%"
            color={meddefTheme.colors.success}
          />
          <MetricCard
            label="Processing Speed"
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
        <SectionHeader title="Individual Results" />
        {testResults.map((result, index) => (
          <MedDefCard key={index} style={styles.resultCard}>
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
          </MedDefCard>
        ))}

        {/* Actions */}
        <MedDefCard style={styles.actionsCard}>
          <Text
            style={styles.actionButton}
            onPress={() => setCurrentScreen("selection")}
          >
            🔄 Test Another Dataset
          </Text>
          <Text
            style={styles.actionButton}
            onPress={() => runQuickTest(selectedDataset!)}
          >
            🧪 Run More Tests
          </Text>
        </MedDefCard>
      </View>
    );
  };

  /**
   * Main render function
   */
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={meddefTheme.colors.background}
      />

      {currentScreen === "selection" && renderDatasetSelection()}
      {currentScreen === "testing" && renderTestingScreen()}
      {currentScreen === "results" && renderResultsScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: meddefTheme.colors.background,
  },

  container: {
    flex: 1,
    padding: meddefTheme.spacing.md,
  },

  testingText: {
    fontSize: 16,
    color: meddefTheme.colors.text.primary,
    textAlign: "center",
    padding: meddefTheme.spacing.lg,
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

  actionsCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: meddefTheme.spacing.lg,
  },

  actionButton: {
    fontSize: 16,
    fontWeight: "600",
    color: meddefTheme.colors.primary,
    padding: meddefTheme.spacing.md,
    textAlign: "center",
  },
});
