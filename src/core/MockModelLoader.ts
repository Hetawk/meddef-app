/**
 * Mock MedDef Model Loader
 *
 * Simulates model loading and inference for demo purposes
 * This replaces TensorFlow.js temporarily for app stability
 *
 * CI2P Laboratory
 * School of Information Science and Engineering
 * University of Jinan
 */

import { DatasetType, ModelVariant } from "../types/meddef";

// Mock tensor interface
interface MockTensor {
  shape: number[];
  data: number[];
  dispose: () => void;
}

// Mock loaded model interface
interface LoadedModel {
  variant: ModelVariant;
  dataset: DatasetType;
  inputShape: [number, number, number];
  outputClasses: string[];
  mockLoaded: boolean;
}

export class MedDefModelLoader {
  private loadedModel: LoadedModel | null = null;
  private isInitialized = false;

  /**
   * Initialize Mock Model Loader
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🚀 Initializing Mock MedDef Model Loader...");

      // Simulate initialization delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("✅ Mock Model Loader initialized successfully");
      this.isInitialized = true;
    } catch (error) {
      console.error("❌ Mock initialization failed:", error);
      this.isInitialized = true;
    }
  }

  /**
   * Load a model variant (mock)
   */
  async loadModel(dataset: DatasetType, variant: ModelVariant): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`📥 Loading ${variant.name} for ${dataset} (MOCK)...`);

      // Unload existing model
      if (this.loadedModel) {
        this.unloadModel();
      }

      // Simulate model loading delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get dataset configuration
      const inputShape: [number, number, number] = [224, 224, 3];
      const outputClasses = this.getOutputClasses(dataset);

      this.loadedModel = {
        variant,
        dataset,
        inputShape,
        outputClasses,
        mockLoaded: true,
      };

      console.log(`✅ ${variant.name} loaded successfully (MOCK)`);
      console.log(`📊 Input shape: [${inputShape.join(", ")}]`);
      console.log(`🏷️ Classes: ${outputClasses.join(", ")}`);
    } catch (error) {
      console.error("Mock model loading failed:", error);
      throw new Error(`Failed to load ${variant.name}: ${error}`);
    }
  }

  /**
   * Unload current model
   */
  unloadModel(): void {
    if (this.loadedModel) {
      console.log("🗑️ Unloading mock model...");
      this.loadedModel = null;
      console.log("✅ Mock model unloaded");
    }
  }

  /**
   * Run prediction (mock)
   */
  async predict(imageData: MockTensor): Promise<{
    predictedClass: string;
    confidence: number;
    classDistribution: number[];
  }> {
    if (!this.loadedModel) {
      throw new Error("No model loaded");
    }

    console.log("🧠 Running mock prediction...");

    try {
      // Simulate processing time
      await new Promise((resolve) =>
        setTimeout(resolve, 100 + Math.random() * 200)
      );

      // Generate realistic mock predictions
      const predictions = this.makeRealisticPredictions(
        this.loadedModel.dataset,
        this.loadedModel.variant
      );

      console.log(
        `🎯 Mock prediction: ${predictions.predictedClass} (${(
          predictions.confidence * 100
        ).toFixed(1)}%)`
      );

      return predictions;
    } catch (error) {
      console.error("Mock prediction failed:", error);
      throw new Error(`Prediction failed: ${error}`);
    }
  }

  /**
   * Detect adversarial attacks (mock)
   */
  async detectAttack(imageData: MockTensor): Promise<{
    isAttack: boolean;
    attackProbability: number;
    attentionMap: number[][];
  }> {
    if (!this.loadedModel) {
      throw new Error("No model loaded");
    }

    console.log("🛡️ Running mock attack detection...");

    // Simulate processing delay
    await new Promise((resolve) =>
      setTimeout(resolve, 50 + Math.random() * 100)
    );

    // Generate mock attack detection
    const isAttack = Math.random() > 0.7; // 30% chance of attack
    const attackProbability = isAttack
      ? 0.6 + Math.random() * 0.4
      : Math.random() * 0.3;

    // Generate mock attention map
    const attentionMap = Array.from({ length: 64 }, () =>
      Array.from({ length: 64 }, () => Math.random())
    );

    console.log(
      `🛡️ Attack detection: ${isAttack ? "ATTACK DETECTED" : "CLEAN"} (${(
        attackProbability * 100
      ).toFixed(1)}%)`
    );

    return {
      isAttack,
      attackProbability,
      attentionMap,
    };
  }

  /**
   * Get model info
   */
  getModelInfo(): {
    memoryUsage: string;
    isLoaded: boolean;
  } | null {
    if (!this.loadedModel) return null;

    return {
      memoryUsage: "15.2 MB",
      isLoaded: true,
    };
  }

  /**
   * Generate realistic predictions based on dataset and model
   */
  private makeRealisticPredictions(
    dataset: DatasetType,
    variant: ModelVariant
  ): {
    predictedClass: string;
    confidence: number;
    classDistribution: number[];
  } {
    const classes = this.getOutputClasses(dataset);

    // Better models have higher confidence
    const baseConfidence = variant.accuracy * 0.9; // Convert accuracy to confidence range
    const confidence = Math.max(
      0.5,
      baseConfidence + (Math.random() - 0.5) * 0.3
    );

    // Pick a random class with bias toward realistic labels
    const predictedIndex = Math.floor(Math.random() * classes.length);
    const predictedClass = classes[predictedIndex];

    // Generate class distribution with predicted class being highest
    const distribution = new Array(classes.length)
      .fill(0)
      .map(() => Math.random() * 0.3);
    distribution[predictedIndex] = confidence;

    // Normalize to sum to 1
    const sum = distribution.reduce((a, b) => a + b, 0);
    const normalizedDistribution = distribution.map((v) => v / sum);

    return {
      predictedClass,
      confidence: normalizedDistribution[predictedIndex],
      classDistribution: normalizedDistribution,
    };
  }

  /**
   * Get output classes for dataset
   */
  private getOutputClasses(dataset: DatasetType): string[] {
    switch (dataset) {
      case "roct":
        return ["CNV", "DME", "Drusen", "Normal"];
      case "chest_xray":
        return ["Normal", "Pneumonia"];
      default:
        return ["Unknown"];
    }
  }

  /**
   * Static helper to load image (mock)
   */
  static async loadImageFromUri(uri: string): Promise<MockTensor> {
    try {
      console.log(`📷 Loading mock image from: ${uri}`);

      // Simulate image loading
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Create mock tensor
      const mockTensor: MockTensor = {
        shape: [224, 224, 3],
        data: new Array(224 * 224 * 3).fill(0).map(() => Math.random()),
        dispose: () => {
          console.log("🗑️ Mock tensor disposed");
        },
      };

      console.log("📷 Mock image loaded successfully");
      return mockTensor;
    } catch (error) {
      console.error("Mock image loading failed:", error);
      throw new Error(`Failed to load image: ${error}`);
    }
  }
}

// Export singleton instance
export const modelLoader = new MedDefModelLoader();
