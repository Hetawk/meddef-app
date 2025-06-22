/**
 * MedDef: Simplified Testing Hook for Debugging
 *
 * Minimal version to isolate and fix runtime issues
 */

import { useState, useCallback } from "react";
import {
  TestAsset,
  TestResult,
  DatasetType,
  UseMedDefTestingReturn,
} from "../types/meddef";

export const useMedDefTestingSimple = () => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [currentDataset, setCurrentDataset] = useState<DatasetType | null>(
    null
  );

  /**
   * Load MedDef model for specified dataset
   */
  const loadModel = useCallback(async (dataset: DatasetType): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Loading model for ${dataset}...`);

      // Simulate model loading
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCurrentDataset(dataset);
      setModelLoaded(true);

      console.log(`✅ Model loaded for ${dataset}`);
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
   * Run test on asset
   */
  const runTest = useCallback(
    async (asset: TestAsset): Promise<TestResult> => {
      if (!modelLoaded) {
        throw new Error("Model not loaded. Please load a model first.");
      }

      console.log(`🔬 Running test on ${asset.path}`);

      // Simulate test execution
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result: TestResult = {
        image_path: asset.path,
        predicted_label: asset.true_label, // Mock: use true label as prediction
        confidence: 0.85 + Math.random() * 0.1, // Mock confidence
        attack_detected: asset.type === "attack",
        daam_attention: {
          values: Array(10)
            .fill(null)
            .map(() =>
              Array(10)
                .fill(null)
                .map(() => Math.random())
            ),
          width: 10,
          height: 10,
          scale: 1.0,
        },
        processing_time: 100 + Math.random() * 400,
        timestamp: new Date().toISOString(),
      };

      return result;
    },
    [modelLoaded]
  );

  /**
   * Run batch test (simplified)
   */
  const runBatchTest = useCallback(
    async (assets: TestAsset[]) => {
      console.log(`🔬 Running batch test with ${assets.length} assets`);

      const results: TestResult[] = [];
      for (const asset of assets) {
        const result = await runTest(asset);
        results.push(result);
      }

      return {
        total_tests: assets.length,
        successful_tests: results.length,
        failed_tests: 0,
        average_confidence:
          results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
        attack_detection_rate:
          results.filter((r) => r.attack_detected).length / results.length,
        total_time: results.reduce((sum, r) => sum + r.processing_time, 0),
        results,
      };
    },
    [runTest]
  );

  return {
    loadModel,
    runTest,
    runBatchTest,
    isLoading,
    error,
    currentDataset,
    modelLoaded,
  };
};
