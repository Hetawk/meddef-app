/**
 * Live MedDef Model Testing Hook
 *
 * Real-timexport function useLiveModelTesting(): LiveModelManager {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [currentDataset, setCurrentDataset] = useState<DatasetType | null>(
    null
  );
  const [currentVariant, setCurrentVariant] = useState<ModelVariant | null>(
    null
  );
  const [availableVariants, setAvailableVariants] = useState<ModelVariant[]>(
    []
  ); actual TensorFlow models
 */

import { useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import * as tf from "@tensorflow/tfjs";
import {
  DatasetType,
  TestAsset,
  TestResult,
  ModelVariant,
  MedicalLabel,
} from "../types/meddef";
import { MODEL_CONFIGS } from "../config/modelStrategy";
import { modelLoader } from "../core/RealMedDefModelLoader";

/**
 * Convert TensorFlow attention map to 2D array
 */
async function convertAttentionMapToArray(
  attentionTensor: tf.Tensor2D
): Promise<number[][]> {
  const data = await attentionTensor.data();
  const [height, width] = attentionTensor.shape;

  const result: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      row.push(data[y * width + x]);
    }
    result.push(row);
  }

  return result;
}

interface LiveModelManager {
  // Model Loading
  loadModel: (dataset: DatasetType, variantId?: string) => Promise<void>;
  unloadModel: () => Promise<void>;
  switchVariant: (variantId: string) => Promise<void>;

  // Live Testing
  runLiveTest: (
    imageUri: string,
    trueLabel?: MedicalLabel
  ) => Promise<TestResult>;
  runBatchTest: (
    imageUris: string[],
    trueLabels?: MedicalLabel[]
  ) => Promise<TestResult[]>;

  // State
  isLoading: boolean;
  loadingProgress: number;
  loadingMessage: string;
  error: string | null;
  modelLoaded: boolean;
  currentDataset: DatasetType | null;
  currentVariant: ModelVariant | null;
  availableVariants: ModelVariant[];

  // Model Info
  getModelInfo: () => {
    size: string;
    accuracy: number;
    defenseCapability: string;
    isOptimized: boolean;
    memoryUsage?: string;
  } | null;
}

export function useLiveModelTesting(): LiveModelManager {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [currentDataset, setCurrentDataset] = useState<DatasetType | null>(
    null
  );
  const [currentVariant, setCurrentVariant] = useState<ModelVariant | null>(
    null
  );
  const [availableVariants, setAvailableVariants] = useState<ModelVariant[]>(
    []
  );

  /**
   * Initialize TensorFlow on mount
   */
  useEffect(() => {
    const initTensorFlow = async () => {
      try {
        await modelLoader.initialize();
        console.log("✅ TensorFlow.js ready for live testing");
      } catch (err) {
        console.error("TensorFlow.js initialization failed:", err);
        setError("Failed to initialize TensorFlow.js");
      }
    };

    initTensorFlow();

    // Cleanup on unmount
    return () => {
      modelLoader.unloadModel();
    };
  }, []);

  /**
   * Load model for specified dataset and variant
   */
  const loadModel = useCallback(
    async (dataset: DatasetType, variantId?: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingMessage("Initializing...");

      try {
        const config = MODEL_CONFIGS[dataset];
        if (!config) {
          throw new Error(`No configuration found for dataset: ${dataset}`);
        }

        // Use default variant if none specified
        const targetVariantId = variantId || config.defaultVariant;
        const variant = config.variants.find((v) => v.id === targetVariantId);

        if (!variant) {
          throw new Error(
            `Variant ${targetVariantId} not found for ${dataset}`
          );
        }

        console.log(`🚀 Loading real model: ${variant.name} for ${dataset}...`);

        // Progress callback
        const onProgress = (progress: number, message: string) => {
          setLoadingProgress(progress);
          setLoadingMessage(message);
        };

        // For now, we'll need to get the actual model URL
        // This is a placeholder - in real implementation, you'd download from CI2P server
        const modelUrl =
          variant.downloadUrl || `models/${dataset}/${variant.id}/model.json`;

        // Load the actual TensorFlow model with progress tracking
        await modelLoader.loadModel(modelUrl, variant, dataset, onProgress);

        setCurrentDataset(dataset);
        setCurrentVariant(variant);
        setAvailableVariants(config.variants);
        setModelLoaded(true);

        console.log(
          `✅ ${variant.name} loaded successfully and ready for live testing`
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load model";
        console.error("Live model loading error:", errorMessage);
        setError(errorMessage);
        setModelLoaded(false);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Unload current model
   */
  const unloadModel = useCallback(async (): Promise<void> => {
    if (!modelLoaded) return;

    setIsLoading(true);
    try {
      console.log("🗑️ Unloading live model...");

      modelLoader.unloadModel();

      setModelLoaded(false);
      setCurrentDataset(null);
      setCurrentVariant(null);
      setAvailableVariants([]);

      console.log("✅ Live model unloaded");
    } catch (err) {
      console.error("Error unloading live model:", err);
    } finally {
      setIsLoading(false);
    }
  }, [modelLoaded]);

  /**
   * Switch to different model variant
   */
  const switchVariant = useCallback(
    async (variantId: string): Promise<void> => {
      if (!currentDataset) {
        throw new Error("No dataset loaded");
      }

      const config = MODEL_CONFIGS[currentDataset];
      const newVariant = config.variants.find((v) => v.id === variantId);

      if (!newVariant) {
        throw new Error(`Variant ${variantId} not found`);
      }

      if (currentVariant?.id === variantId) {
        return; // Already loaded
      }

      console.log(`🔄 Switching to ${newVariant.name}...`);

      // Unload current and load new variant
      await unloadModel();
      await loadModel(currentDataset, variantId);
    },
    [currentDataset, currentVariant, loadModel, unloadModel]
  );

  /**
   * Run live test on single image
   */
  const runLiveTest = useCallback(
    async (imageUri: string, trueLabel?: MedicalLabel): Promise<TestResult> => {
      if (!modelLoaded || !currentVariant || !currentDataset) {
        throw new Error("Model not loaded");
      }

      console.log(`🧪 Running LIVE test with ${currentVariant.name}...`);
      console.log(`📷 Image: ${imageUri}`);

      const startTime = Date.now();

      try {
        // Run prediction using real TensorFlow model
        const prediction = await modelLoader.predict(imageUri);

        const processingTime = Date.now() - startTime;

        // Create live result with safe attention map handling
        let daamAttention;
        if (prediction.attackDetection?.attention_map?.attention) {
          try {
            daamAttention = {
              values: await convertAttentionMapToArray(
                prediction.attackDetection.attention_map.attention
              ),
              width:
                prediction.attackDetection.attention_map.attention.shape[1],
              height:
                prediction.attackDetection.attention_map.attention.shape[0],
              scale: 1.0,
            };
          } catch (attentionError) {
            console.warn("Failed to process attention map:", attentionError);
            daamAttention = {
              values: Array(32)
                .fill(null)
                .map(() => Array(32).fill(0.5)),
              width: 32,
              height: 32,
              scale: 1.0,
            };
          }
        } else {
          daamAttention = {
            values: Array(32)
              .fill(null)
              .map(() => Array(32).fill(0.5)),
            width: 32,
            height: 32,
            scale: 1.0,
          };
        }

        const result: TestResult = {
          image_path: imageUri,
          predicted_label: prediction.prediction as MedicalLabel,
          confidence: prediction.confidence,
          attack_detected: prediction.attackDetection?.is_attack || false,
          daam_attention: daamAttention,
          processing_time: prediction.processingTime,
          timestamp: new Date().toISOString(),
        };

        console.log(`✅ LIVE test completed:`);
        console.log(
          `   Prediction: ${result.predicted_label} (${(
            result.confidence * 100
          ).toFixed(1)}%)`
        );
        console.log(
          `   Attack: ${result.attack_detected ? "DETECTED" : "CLEAN"}`
        );
        console.log(`   Processing: ${result.processing_time}ms`);

        // Small delay to prevent overwhelming the device
        await new Promise((resolve) => setTimeout(resolve, 100));

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Live test failed";
        console.error("Live test error:", errorMessage);
        throw new Error(`Live test failed: ${errorMessage}`);
      }
    },
    [modelLoaded, currentVariant, currentDataset]
  );

  /**
   * Run batch live testing
   */
  const runBatchTest = useCallback(
    async (
      imageUris: string[],
      trueLabels?: MedicalLabel[]
    ): Promise<TestResult[]> => {
      if (!modelLoaded) {
        throw new Error("Model not loaded");
      }

      console.log(
        `🧪 Running LIVE batch test with ${imageUris.length} images...`
      );

      const results: TestResult[] = [];
      const totalImages = imageUris.length;

      for (let i = 0; i < totalImages; i++) {
        try {
          console.log(`📊 Processing image ${i + 1}/${totalImages}...`);

          const trueLabel = trueLabels?.[i];
          const result = await runLiveTest(imageUris[i], trueLabel);
          results.push(result);

          console.log(`✅ Batch progress: ${i + 1}/${totalImages} completed`);

          // Small delay to prevent overwhelming the system
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (testError) {
          console.error(`❌ Failed to process image ${i + 1}:`, testError);
          // Continue with other images
        }
      }

      console.log(
        `🎯 LIVE batch test completed: ${results.length}/${totalImages} successful`
      );
      return results;
    },
    [runLiveTest, modelLoaded]
  );

  /**
   * Get current model information
   */
  const getModelInfo = useCallback(() => {
    if (!currentVariant) return null;

    const modelInfo = modelLoader.getModelInfo();

    return {
      size: currentVariant.size,
      accuracy: currentVariant.accuracy,
      defenseCapability: currentVariant.defenseCapability,
      isOptimized: currentVariant.isQuantized || currentVariant.isPruned,
      memoryUsage: "N/A", // Real memory info would come from TensorFlow.js
    };
  }, [currentVariant]);

  return {
    // Methods
    loadModel,
    unloadModel,
    switchVariant,
    runLiveTest,
    runBatchTest,

    // State
    isLoading,
    loadingProgress,
    loadingMessage,
    error,
    modelLoaded,
    currentDataset,
    currentVariant,
    availableVariants,

    // Info
    getModelInfo,
  };
}
