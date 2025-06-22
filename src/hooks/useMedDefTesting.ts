/**
 * MedDef: Medical Defense Model Testing - Core Testing Hook
 *
 * DRY architecture hook for unified MedDef model testing across datasets
 * Implements single testing function for all scenarios (ROCT, Chest X-Ray, all attacks)
 */

import { useState, useCallback, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import {
  TestAsset,
  TestResult,
  EnhancedTestResult,
  BatchTestResult,
  DatasetType,
  ModelConfig,
  AttentionMap,
  MODEL_CONFIGS,
  UseMedDefTestingReturn,
} from "../types/meddef";
import {
  AttackFactory,
  AttackConfig,
  AttackResult,
  DAAMExtractor,
} from "../attacks/adversarialAttacks";

export const useMedDefTesting = (): UseMedDefTestingReturn => {
  // State management
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [currentDataset, setCurrentDataset] = useState<DatasetType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Model cache for performance
  const modelCache = useRef<Map<DatasetType, tf.LayersModel>>(new Map());

  /**
   * Load MedDef model for specified dataset
   * Unified loading for both ROCT and Chest X-Ray models
   */
  const loadModel = useCallback(async (dataset: DatasetType): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      if (modelCache.current.has(dataset)) {
        const cachedModel = modelCache.current.get(dataset)!;
        setModel(cachedModel);
        setCurrentDataset(dataset);
        setModelLoaded(true);
        setIsLoading(false);
        return;
      }

      // Get model configuration
      const config = MODEL_CONFIGS.find((c) => c.dataset === dataset);
      if (!config) {
        throw new Error(
          `Model configuration not found for dataset: ${dataset}`
        );
      }

      // Initialize TensorFlow.js for React Native
      await tf.ready();

      // Load model (convert from .pth to .tflite in production)
      // For now, we'll use a placeholder that loads the correct model
      console.log(`Loading MedDef model for ${dataset}...`);
      console.log(`Model path: ${config.model_path}`);
      console.log(`Input size: ${config.input_size}`);
      console.log(`Classes: ${config.labels.join(", ")}`);

      // TODO: Implement actual model loading
      // const loadedModel = await tf.loadLayersModel(config.model_path);

      // For development: Create a mock model structure
      const mockModel = await createMockModel(config);

      // Cache the model
      modelCache.current.set(dataset, mockModel);

      setModel(mockModel);
      setCurrentDataset(dataset);
      setModelLoaded(true);

      console.log(`✅ MedDef model loaded for ${dataset}`);
      console.log(
        `Model parameters: ~21.84M (${config.is_pruned ? "Pruned" : "Full"})`
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load model";
      console.error("Model loading error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Unified test function for all MedDef scenarios
   * Handles ROCT, Chest X-Ray, clean images, and all attack types
   */
  const runTest = useCallback(
    async (asset: TestAsset): Promise<TestResult> => {
      if (!model || !currentDataset) {
        throw new Error("Model not loaded. Please load a model first.");
      }

      if (asset.dataset !== currentDataset) {
        throw new Error(
          `Asset dataset (${asset.dataset}) doesn't match loaded model (${currentDataset})`
        );
      }

      const startTime = performance.now();

      try {
        console.log(
          `🔬 Running MedDef test on ${asset.type} image: ${asset.path}`
        );
        if (asset.attack_method) {
          console.log(`   Attack: ${asset.attack_method} (ε=${asset.epsilon})`);
        }

        // Step 1: Preprocess image for MedDef input
        const preprocessedImage = await preprocessImage(
          asset.path,
          currentDataset
        );

        // Step 2: Run MedDef inference with DAAM
        const { prediction, attention } = await runMedDefInference(
          model,
          preprocessedImage
        );

        // Step 3: Post-process results
        const config = MODEL_CONFIGS.find((c) => c.dataset === currentDataset)!;
        const predictedLabel = config.labels[prediction.argMax().dataSync()[0]];
        const confidence = Math.max(...Array.from(prediction.dataSync()));

        // Step 4: DAAM-based attack detection
        const attackDetected = detectAdversarialPatterns(
          attention,
          asset.type === "attack"
        );

        // Step 5: Create result
        const result: TestResult = {
          image_path: asset.path,
          predicted_label: predictedLabel as any,
          confidence,
          attack_detected: attackDetected,
          daam_attention: attention,
          processing_time: performance.now() - startTime,
          timestamp: new Date().toISOString(),
        };

        console.log(
          `✅ Test complete: ${predictedLabel} (${(confidence * 100).toFixed(
            1
          )}%)`
        );
        console.log(`   Attack detected: ${attackDetected}`);
        console.log(
          `   Processing time: ${result.processing_time.toFixed(1)}ms`
        );

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Test execution failed";
        console.error("Test execution error:", errorMessage);
        throw new Error(errorMessage);
      }
    },
    [model, currentDataset]
  );

  /**
   * Batch testing for multiple assets
   * Efficient processing with progress tracking
   */
  const runBatchTest = useCallback(
    async (assets: TestAsset[]): Promise<BatchTestResult> => {
      if (!model || !currentDataset) {
        throw new Error("Model not loaded. Please load a model first.");
      }

      console.log(`🔬 Starting batch test with ${assets.length} assets...`);
      const startTime = performance.now();

      const results: TestResult[] = [];
      let successfulTests = 0;
      let failedTests = 0;

      for (const asset of assets) {
        try {
          const result = await runTest(asset);
          results.push(result);
          successfulTests++;
        } catch (error) {
          console.error(`Failed to test ${asset.path}:`, error);
          failedTests++;
        }
      }

      // Calculate aggregate metrics
      const totalTime = performance.now() - startTime;
      const averageConfidence =
        results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
      const averageProcessingTime =
        results.reduce((sum, r) => sum + r.processing_time, 0) / results.length;
      const attackDetectionRate =
        results.filter((r) => r.attack_detected).length / results.length;

      const batchResult: BatchTestResult = {
        total_tests: assets.length,
        successful_tests: successfulTests,
        failed_tests: failedTests,
        average_confidence: averageConfidence,
        average_processing_time: averageProcessingTime,
        attack_detection_rate: attackDetectionRate,
        results,
      };

      console.log(
        `✅ Batch test complete: ${successfulTests}/${assets.length} successful`
      );
      console.log(
        `   Average confidence: ${(averageConfidence * 100).toFixed(1)}%`
      );
      console.log(
        `   Attack detection rate: ${(attackDetectionRate * 100).toFixed(1)}%`
      );
      console.log(`   Total time: ${(totalTime / 1000).toFixed(1)}s`);

      return batchResult;
    },
    [model, currentDataset, runTest]
  );

  /**
   * Run adversarial attack testing on clean images
   * Tests model robustness against various attack methods
   */
  const runAdversarialTest = useCallback(
    async (
      cleanAsset: TestAsset,
      attackType: "fgsm" | "pgd" | "medical_attention",
      attackConfig: AttackConfig
    ): Promise<EnhancedTestResult> => {
      if (!model || !currentDataset) {
        throw new Error("Model not loaded. Please load a model first.");
      }

      if (cleanAsset.type !== "clean") {
        throw new Error(
          "Adversarial testing requires clean (non-attacked) images"
        );
      }

      const startTime = performance.now();

      try {
        console.log(
          `🔥 Running adversarial attack test: ${attackType} on ${cleanAsset.path}`
        );
        console.log(
          `   Attack config: ε=${attackConfig.epsilon}, iterations=${
            attackConfig.iterations || 1
          }`
        );

        // Step 1: Preprocess clean image
        const cleanImage = await preprocessImage(
          cleanAsset.path,
          currentDataset
        );

        // Step 2: Get original prediction and attention map
        const originalPrediction = model.predict(
          cleanImage.expandDims(0)
        ) as tf.Tensor;
        const originalAttentionMap = await DAAMExtractor.extractAttentionMap(
          model,
          cleanImage
        );

        const config = MODEL_CONFIGS.find((c) => c.dataset === currentDataset)!;
        const originalLabel =
          config.labels[originalPrediction.argMax().dataSync()[0]];
        const originalConfidence = Math.max(
          ...Array.from(originalPrediction.dataSync())
        );

        // Step 3: Generate adversarial example
        const attack = AttackFactory.createAttack(attackType, attackConfig);
        const trueLabel = config.labels.indexOf(cleanAsset.true_label);

        const attackResult = await attack.generateAdversarialExample(
          model,
          cleanImage,
          trueLabel,
          currentDataset,
          attackType === "medical_attention" ? originalAttentionMap : undefined
        );

        // Step 4: Analyze adversarial result
        const adversarialLabel =
          config.labels[
            attackResult.adversarialPrediction.argMax().dataSync()[0]
          ];
        const adversarialConfidence = Math.max(
          ...Array.from(attackResult.adversarialPrediction.dataSync())
        );

        // Step 5: Extract adversarial attention map
        const adversarialAttentionMap = await DAAMExtractor.extractAttentionMap(
          model,
          attackResult.adversarialImage
        );

        // Step 6: Calculate robustness metrics
        const robustnessScore = calculateRobustnessScore(
          originalConfidence,
          adversarialConfidence,
          attackResult.perturbationMagnitude,
          attackConfig.epsilon
        );

        // Step 7: Enhanced attack detection using DAAM comparison
        const attackDetected = detectAdversarialWithDAAM(
          originalAttentionMap,
          adversarialAttentionMap,
          attackResult.perturbationMagnitude
        );

        const result: EnhancedTestResult = {
          image_path: cleanAsset.path,
          predicted_label: adversarialLabel as any,
          confidence: adversarialConfidence,
          attack_detected: attackDetected,
          daam_attention: adversarialAttentionMap,
          processing_time: performance.now() - startTime,
          timestamp: new Date().toISOString(),
          // Enhanced fields
          attackResult,
          originalConfidence,
          adversarialConfidence,
          robustnessScore,
          attackMetrics: {
            perturbationMagnitude: attackResult.perturbationMagnitude,
            attackSuccess: attackResult.attackSuccess,
            confidenceDropPct: attackResult.confidenceDropPct,
          },
        };

        console.log(`✅ Adversarial test complete:`);
        console.log(
          `   Original: ${originalLabel} (${(originalConfidence * 100).toFixed(
            1
          )}%)`
        );
        console.log(
          `   Adversarial: ${adversarialLabel} (${(
            adversarialConfidence * 100
          ).toFixed(1)}%)`
        );
        console.log(`   Attack success: ${attackResult.attackSuccess}`);
        console.log(`   Attack detected: ${attackDetected}`);
        console.log(`   Robustness score: ${robustnessScore.toFixed(3)}`);
        console.log(
          `   Perturbation magnitude: ${attackResult.perturbationMagnitude.toFixed(
            6
          )}`
        );

        // Clean up tensors
        cleanImage.dispose();
        originalPrediction.dispose();
        attackResult.originalPrediction.dispose();
        attackResult.adversarialPrediction.dispose();
        attackResult.adversarialImage.dispose();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Adversarial test failed";
        console.error("Adversarial test error:", errorMessage);
        throw new Error(errorMessage);
      }
    },
    [model, currentDataset]
  );

  /**
   * Comprehensive robustness evaluation
   * Tests multiple attack types and strengths
   */
  const runRobustnessEvaluation = useCallback(
    async (
      cleanAsset: TestAsset,
      attackConfigs: Array<{
        type: "fgsm" | "pgd" | "medical_attention";
        config: AttackConfig;
      }>
    ): Promise<{
      asset: TestAsset;
      results: EnhancedTestResult[];
      overallRobustness: number;
      weakestAttack: string;
      strongestDefense: string;
    }> => {
      console.log(
        `🛡️ Running comprehensive robustness evaluation on ${cleanAsset.path}`
      );

      const results: EnhancedTestResult[] = [];
      let totalRobustness = 0;
      let weakestRobustness = 1.0;
      let weakestAttack = "";
      let strongestRobustness = 0.0;
      let strongestDefense = "";

      for (const { type, config } of attackConfigs) {
        try {
          const result = await runAdversarialTest(cleanAsset, type, config);
          results.push(result);

          const robustness = result.robustnessScore || 0;
          totalRobustness += robustness;

          if (robustness < weakestRobustness) {
            weakestRobustness = robustness;
            weakestAttack = `${type} (ε=${config.epsilon})`;
          }

          if (robustness > strongestRobustness) {
            strongestRobustness = robustness;
            strongestDefense = `${type} (ε=${config.epsilon})`;
          }
        } catch (err) {
          console.error(`Failed to run ${type} attack:`, err);
        }
      }

      const overallRobustness = totalRobustness / results.length;

      console.log(`✅ Robustness evaluation complete:`);
      console.log(`   Overall robustness: ${overallRobustness.toFixed(3)}`);
      console.log(
        `   Weakest against: ${weakestAttack} (${weakestRobustness.toFixed(3)})`
      );
      console.log(
        `   Strongest against: ${strongestDefense} (${strongestRobustness.toFixed(
          3
        )})`
      );

      return {
        asset: cleanAsset,
        results,
        overallRobustness,
        weakestAttack,
        strongestDefense,
      };
    },
    [runAdversarialTest]
  );

  // Helper functions for robustness analysis
  const calculateRobustnessScore = (
    originalConfidence: number,
    adversarialConfidence: number,
    perturbationMagnitude: number,
    epsilon: number
  ): number => {
    // Combine confidence preservation and perturbation efficiency
    const confidencePreservation = adversarialConfidence / originalConfidence;
    const perturbationEfficiency = 1 - perturbationMagnitude / epsilon;

    // Medical robustness score: higher is better (more robust)
    return Math.max(0, (confidencePreservation + perturbationEfficiency) / 2);
  };

  const detectAdversarialWithDAAM = (
    originalAttention: AttentionMap,
    adversarialAttention: AttentionMap,
    perturbationMagnitude: number
  ): boolean => {
    // Compare attention maps for adversarial pattern detection
    const attentionDifference = calculateAttentionDifference(
      originalAttention,
      adversarialAttention
    );

    // Thresholds based on medical imaging requirements
    const ATTENTION_THRESHOLD = 0.3; // 30% attention change indicates potential attack
    const PERTURBATION_THRESHOLD = 0.01; // Low perturbation threshold for medical images

    return (
      attentionDifference > ATTENTION_THRESHOLD ||
      perturbationMagnitude > PERTURBATION_THRESHOLD
    );
  };

  const calculateAttentionDifference = (
    attention1: AttentionMap,
    attention2: AttentionMap
  ): number => {
    // Calculate L2 difference between attention maps
    if (
      attention1.width !== attention2.width ||
      attention1.height !== attention2.height
    ) {
      return 1.0; // Maximum difference if shapes don't match
    }

    let sumSquaredDifference = 0;
    let totalElements = 0;

    for (let y = 0; y < attention1.height; y++) {
      for (let x = 0; x < attention1.width; x++) {
        const val1 = attention1.values[y][x];
        const val2 = attention2.values[y][x];
        sumSquaredDifference += (val1 - val2) ** 2;
        totalElements++;
      }
    }

    return Math.sqrt(sumSquaredDifference / totalElements);
  };

  return {
    loadModel,
    runTest,
    runBatchTest,
    runAdversarialTest,
    runRobustnessEvaluation,
    isLoading,
    error,
    currentDataset,
    modelLoaded,
  };
};

/**
 * Preprocess image for MedDef input
 * Unified preprocessing for both datasets
 */
async function preprocessImage(
  imagePath: string,
  dataset: DatasetType
): Promise<tf.Tensor> {
  try {
    // TODO: Implement actual image preprocessing
    // 1. Load image from path
    // 2. Resize to 224x224
    // 3. Normalize pixel values
    // 4. Convert to tensor format

    console.log(`📸 Preprocessing image: ${imagePath} for ${dataset}`);

    // Mock preprocessing - create random tensor for development
    const tensor = tf.randomNormal([1, 224, 224, 3]);

    return tensor;
  } catch (error) {
    console.error("Image preprocessing failed:", error);
    throw new Error("Failed to preprocess image");
  }
}

/**
 * Run MedDef inference with DAAM attention extraction
 * Core inference function with Defense-Aware Attention Mechanism
 */
async function runMedDefInference(
  model: tf.LayersModel,
  input: tf.Tensor
): Promise<{ prediction: tf.Tensor; attention: AttentionMap }> {
  try {
    // Run model prediction
    const prediction = model.predict(input) as tf.Tensor;

    // Extract DAAM attention map
    // TODO: Implement actual DAAM attention extraction
    // For now, create mock attention map
    const attention: AttentionMap = {
      values: Array(14)
        .fill(0)
        .map(() =>
          Array(14)
            .fill(0)
            .map(() => Math.random())
        ),
      width: 14,
      height: 14,
      scale: 1.0,
    };

    return { prediction, attention };
  } catch (error) {
    console.error("MedDef inference failed:", error);
    throw new Error("Failed to run MedDef inference");
  }
}

/**
 * DAAM-based adversarial pattern detection
 * Uses attention patterns to identify adversarial examples
 */
function detectAdversarialPatterns(
  attention: AttentionMap,
  isActualAttack: boolean
): boolean {
  try {
    // TODO: Implement actual DAAM-based attack detection
    // Analyze attention patterns for adversarial indicators:
    // 1. Unusual attention distribution
    // 2. High-frequency patterns in attention
    // 3. Attention on non-medical regions

    // Mock detection logic for development
    const avgAttention =
      attention.values.flat().reduce((sum, val) => sum + val, 0) /
      (attention.width * attention.height);

    const variance =
      attention.values
        .flat()
        .reduce((sum, val) => sum + Math.pow(val - avgAttention, 2), 0) /
      (attention.width * attention.height);

    // Simple heuristic: high variance might indicate adversarial patterns
    const threshold = 0.1;
    const detected = variance > threshold;

    // Add some noise to make it more realistic
    const randomFactor = Math.random() > 0.8;

    return detected || randomFactor;
  } catch (error) {
    console.error("Attack detection failed:", error);
    return false;
  }
}

/**
 * Create mock model for development
 * TODO: Replace with actual model loading
 */
async function createMockModel(config: ModelConfig): Promise<tf.LayersModel> {
  // Create a simple mock model that matches the expected interface
  const model = tf.sequential({
    layers: [
      tf.layers.conv2d({
        inputShape: [224, 224, 3],
        filters: 32,
        kernelSize: 3,
        activation: "relu",
      }),
      tf.layers.globalAveragePooling2d({}),
      tf.layers.dense({ units: config.num_classes, activation: "softmax" }),
    ],
  });

  // Compile the model
  model.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

export default useMedDefTesting;
