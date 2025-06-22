/**
 * Testing Screen - Simplified model testing interface
 * Select Model → Select Image → Run Inference → View Results
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { DatasetType } from "../types/meddef";
import { meddefTheme } from "../config/theme";
import { MODEL_CONFIGS } from "../config/modelStrategy";
import { AllModelsSelection } from "../components/testing/AllModelsSelection";
import { ImageSelector } from "../components/testing/ImageSelector";
import { useLiveModelTesting } from "../hooks/useLiveModelTesting";
import {
  MedDefCard,
  SectionHeader,
  LoadingCard,
  ErrorCard,
  MetricCard,
} from "../components/common/MedDefUI";

export function TestingScreen({ navigation }: { navigation?: any }) {
  const [step, setStep] = useState<"model" | "image" | "testing">("model");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // Use live model testing hook
  const {
    loadModel,
    unloadModel,
    runLiveTest,
    isLoading,
    error,
    modelLoaded,
    currentDataset,
    currentVariant,
    getModelInfo,
  } = useLiveModelTesting();

  const handleModelSelection = async (
    dataset: DatasetType,
    variantId: string
  ) => {
    try {
      // Get variant info before loading
      const config = MODEL_CONFIGS[dataset];
      const variant = config?.variants.find((v) => v.id === variantId);

      await loadModel(dataset, variantId);
      setStep("image");

      Alert.alert(
        "Model Loaded!",
        `${variant?.name || "Model"} is ready. Now select a test image.`,
        [{ text: "Got it" }]
      );
    } catch (err) {
      Alert.alert(
        "Error",
        `Failed to load model: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const handleImageSelection = (imageUri: string) => {
    setSelectedImageUri(imageUri);
    setStep("testing");
  };

  const handleRunTest = async () => {
    if (!selectedImageUri || !modelLoaded) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    try {
      const result = await runLiveTest(selectedImageUri);

      // Navigate to Results screen with the result
      Alert.alert(
        "Test Complete!",
        `Prediction: ${result.predicted_label}\nConfidence: ${(
          result.confidence * 100
        ).toFixed(1)}%\nAttack Detected: ${
          result.attack_detected ? "Yes" : "No"
        }`,
        [
          {
            text: "View Details",
            onPress: () => navigation?.navigate("Results", { result }),
          },
          { text: "Run Another Test", onPress: () => setStep("image") },
        ]
      );
    } catch (err) {
      Alert.alert(
        "Error",
        `Failed to run test: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const renderModelSelection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <SectionHeader
          title="Select Model"
          subtitle="Choose your preferred model for testing"
        />

        {isLoading ? (
          <LoadingCard message="Loading model..." />
        ) : error ? (
          <ErrorCard error={error} onRetry={() => setStep("model")} />
        ) : (
          <AllModelsSelection
            onSelectModel={handleModelSelection}
            currentVariant={currentVariant}
            isLoading={isLoading}
          />
        )}
      </View>
    </ScrollView>
  );

  const renderImageSelection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => setStep("model")}
        >
          <Text style={styles.navigationButtonText}>
            ← Back to Model Selection
          </Text>
        </TouchableOpacity>

        <SectionHeader
          title={`Select Test Image`}
          subtitle={`Testing with ${
            currentVariant?.name
          } (${currentDataset?.toUpperCase()})`}
        />

        <MedDefCard style={styles.modelInfo}>
          <Text style={styles.modelInfoTitle}>Active Model</Text>
          <Text style={styles.modelInfoText}>{currentVariant?.name}</Text>
          <Text style={styles.modelInfoSubtext}>
            {currentVariant?.description}
          </Text>
        </MedDefCard>

        <ImageSelector
          dataset={currentDataset!}
          onImageSelect={handleImageSelection}
          selectedImage={selectedImageUri}
        />

        {selectedImageUri && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setStep("testing")}
          >
            <Text style={styles.continueButtonText}>Continue to Testing</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  const renderTestingInterface = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <SectionHeader
          title="Run Test"
          subtitle="Ready to analyze your selected image"
        />

        <MedDefCard style={styles.testSetup}>
          <Text style={styles.setupTitle}>Test Configuration</Text>

          <View style={styles.setupRow}>
            <Text style={styles.setupLabel}>Model:</Text>
            <Text style={styles.setupValue}>{currentVariant?.name}</Text>
          </View>

          <View style={styles.setupRow}>
            <Text style={styles.setupLabel}>Dataset:</Text>
            <Text style={styles.setupValue}>
              {currentDataset?.toUpperCase()}
            </Text>
          </View>

          <View style={styles.setupRow}>
            <Text style={styles.setupLabel}>Image:</Text>
            <Text style={styles.setupValue}>Selected ✓</Text>
          </View>
        </MedDefCard>

        <TouchableOpacity
          style={[styles.testButton, isLoading && styles.testButtonDisabled]}
          onPress={handleRunTest}
          disabled={isLoading}
        >
          <Text style={styles.testButtonText}>
            {isLoading ? "Running Test..." : "🔬 Run Inference"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep("image")}
        >
          <Text style={styles.backButtonText}>← Change Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep("model")}
        >
          <Text style={styles.backButtonText}>← Change Model</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressStep, styles.progressStepActive]}>
            <Text style={styles.progressText}>1</Text>
          </View>
          <View
            style={[
              styles.progressLine,
              step !== "model" && styles.progressLineActive,
            ]}
          />
          <View
            style={[
              styles.progressStep,
              step !== "model" && styles.progressStepActive,
            ]}
          >
            <Text style={styles.progressText}>2</Text>
          </View>
          <View
            style={[
              styles.progressLine,
              step === "testing" && styles.progressLineActive,
            ]}
          />
          <View
            style={[
              styles.progressStep,
              step === "testing" && styles.progressStepActive,
            ]}
          >
            <Text style={styles.progressText}>3</Text>
          </View>
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Model</Text>
          <Text style={styles.progressLabel}>Image</Text>
          <Text style={styles.progressLabel}>Test</Text>
        </View>
      </View>

      {/* Main Content */}
      {step === "model" && renderModelSelection()}
      {step === "image" && renderImageSelection()}
      {step === "testing" && renderTestingInterface()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: meddefTheme.colors.background,
  },
  content: {
    padding: meddefTheme.spacing.lg,
  },

  // Progress Indicator
  progressContainer: {
    backgroundColor: meddefTheme.colors.surface,
    paddingVertical: meddefTheme.spacing.md,
    paddingHorizontal: meddefTheme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: meddefTheme.colors.border,
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: meddefTheme.spacing.sm,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: meddefTheme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  progressStepActive: {
    backgroundColor: meddefTheme.colors.primary,
  },
  progressText: {
    color: meddefTheme.colors.background,
    fontSize: 14,
    fontWeight: "600",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: meddefTheme.colors.border,
    marginHorizontal: meddefTheme.spacing.sm,
  },
  progressLineActive: {
    backgroundColor: meddefTheme.colors.primary,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: meddefTheme.spacing.xl,
  },
  progressLabel: {
    fontSize: 12,
    color: meddefTheme.colors.text.secondary,
    fontWeight: "500",
  },

  // Model Info
  modelInfo: {
    marginBottom: meddefTheme.spacing.lg,
  },
  modelInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: meddefTheme.colors.primary,
    marginBottom: meddefTheme.spacing.xs,
  },
  modelInfoText: {
    fontSize: 18,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.xs,
  },
  modelInfoSubtext: {
    fontSize: 14,
    color: meddefTheme.colors.text.secondary,
  },

  // Test Setup
  testSetup: {
    marginBottom: meddefTheme.spacing.lg,
  },
  setupTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: meddefTheme.colors.text.primary,
    marginBottom: meddefTheme.spacing.md,
  },
  setupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: meddefTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: meddefTheme.colors.border,
  },
  setupLabel: {
    fontSize: 16,
    color: meddefTheme.colors.text.secondary,
    fontWeight: "500",
  },
  setupValue: {
    fontSize: 16,
    color: meddefTheme.colors.text.primary,
    fontWeight: "600",
  },

  // Buttons
  backButton: {
    backgroundColor: meddefTheme.colors.surface,
    paddingVertical: meddefTheme.spacing.md,
    paddingHorizontal: meddefTheme.spacing.lg,
    borderRadius: meddefTheme.borderRadius.md,
    alignItems: "center",
    marginBottom: meddefTheme.spacing.md,
    borderWidth: 1,
    borderColor: meddefTheme.colors.border,
  },
  backButtonSmall: {
    flex: 1,
    marginHorizontal: meddefTheme.spacing.xs,
  },
  backButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: meddefTheme.spacing.md,
  },
  backButtonText: {
    color: meddefTheme.colors.text.secondary,
    fontSize: 16,
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: meddefTheme.colors.primary,
    paddingVertical: meddefTheme.spacing.md,
    paddingHorizontal: meddefTheme.spacing.lg,
    borderRadius: meddefTheme.borderRadius.md,
    alignItems: "center",
    marginTop: meddefTheme.spacing.lg,
  },
  continueButtonText: {
    color: meddefTheme.colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  testButton: {
    backgroundColor: meddefTheme.colors.success,
    paddingVertical: meddefTheme.spacing.lg,
    paddingHorizontal: meddefTheme.spacing.lg,
    borderRadius: meddefTheme.borderRadius.md,
    alignItems: "center",
    marginBottom: meddefTheme.spacing.md,
  },
  testButtonDisabled: {
    backgroundColor: meddefTheme.colors.border,
  },
  testButtonText: {
    color: meddefTheme.colors.background,
    fontSize: 18,
    fontWeight: "700",
  },
  navigationButton: {
    backgroundColor: meddefTheme.colors.surface,
    paddingVertical: meddefTheme.spacing.md,
    paddingHorizontal: meddefTheme.spacing.lg,
    borderRadius: meddefTheme.borderRadius.md,
    alignItems: "center",
    marginBottom: meddefTheme.spacing.md,
    borderWidth: 1,
    borderColor: meddefTheme.colors.border,
  },
  navigationButtonSmall: {
    flex: 1,
    marginHorizontal: meddefTheme.spacing.xs,
  },
  navigationButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: meddefTheme.spacing.md,
  },
  navigationButtonText: {
    color: meddefTheme.colors.text.secondary,
    fontSize: 16,
    fontWeight: "500",
  },
});
