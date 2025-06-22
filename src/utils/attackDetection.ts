/**
 * Lightweight Attack Detection for MedDef Mobile
 *
 * Mobile-optimized attack detection using statistical methods
 * instead of memory-intensive gradient computations
 *
 * CI2P Laboratory
 * School of Information Science and Engineering
 * University of Jinan
 */

import * as tf from "@tensorflow/tfjs";
import { DatasetType, ModelVariant } from "../types/meddef";

export interface AttentionMap {
  attention: tf.Tensor2D;
  focus_regions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    intensity: number;
  }>;
  anomaly_score: number;
}

export interface AttackDetectionResult {
  is_attack: boolean;
  confidence: number;
  method: "lightweight" | "statistical" | "mobile";
  attention_map?: AttentionMap;
  anomaly_indicators: {
    attention_dispersion: number;
    prediction_uncertainty: number;
    feature_magnitude: number;
    gradient_consistency: number;
  };
  explanation: string;
}

/**
 * Lightweight Mobile Attack Detector
 * Memory-efficient version for React Native
 */
export class LightweightDetector {
  private attackThreshold: number = 0.6;
  private uncertaintyThreshold: number = 0.4;

  constructor(private dataset: DatasetType, private variant: ModelVariant) {
    if (dataset === "chest_xray") {
      this.attackThreshold = 0.65;
      this.uncertaintyThreshold = 0.35;
    } else if (dataset === "roct") {
      this.attackThreshold = 0.7;
      this.uncertaintyThreshold = 0.3;
    }
  }

  /**
   * Generate simple attention map using image statistics
   */
  private async generateSimpleAttentionMap(
    image: tf.Tensor4D,
    prediction: tf.Tensor
  ): Promise<AttentionMap> {
    try {
      const [, height, width] = image.shape.slice(1);

      // Use image statistics instead of gradients
      const imageMean = image.mean(-1, true).squeeze([0, -1]) as tf.Tensor2D;
      const maxMean = imageMean.max();
      const attention = imageMean.div(maxMean.add(1e-8)) as tf.Tensor2D;

      // Calculate anomaly score from prediction entropy (with safety checks)
      const predictionData = await prediction.data();
      const dataArray = Array.from(predictionData);

      // Ensure valid probabilities (normalize if needed)
      const sum = dataArray.reduce((s, p) => s + Math.max(0, p), 0);
      const normalizedArray =
        sum > 0
          ? dataArray.map((p) => Math.max(1e-8, p) / sum)
          : dataArray.map(() => 1 / dataArray.length);

      // Calculate entropy safely
      let entropy = 0;
      for (const p of normalizedArray) {
        if (p > 1e-8) {
          // Avoid log(0)
          entropy -= p * Math.log(p);
        }
      }
      const normalizedEntropy = Math.min(
        1.0,
        entropy / Math.log(normalizedArray.length)
      );

      // Clean up
      imageMean.dispose();
      maxMean.dispose();

      return {
        attention,
        focus_regions: [], // Simplified - no regions for mobile
        anomaly_score: normalizedEntropy,
      };
    } catch (error) {
      console.error("Error generating attention map:", error);

      const [, height, width] = image.shape.slice(1);
      const fallbackAttention = tf
        .ones([height, width])
        .mul(0.5) as tf.Tensor2D;

      return {
        attention: fallbackAttention,
        focus_regions: [],
        anomaly_score: 0.5,
      };
    }
  }

  /**
   * Lightweight attack detection using statistical methods
   */
  async detectAttack(
    model: tf.LayersModel,
    image: tf.Tensor4D,
    prediction: tf.Tensor
  ): Promise<AttackDetectionResult> {
    try {
      console.log("🔍 Running lightweight attack detection...");

      const predictionData = await prediction.data();
      const dataArray = Array.from(predictionData);

      // Debug: Log raw prediction data
      console.log(
        `🔍 Raw predictions: [${dataArray.map((p) => p.toFixed(4)).join(", ")}]`
      );

      // Ensure valid probabilities and handle edge cases
      const sum = dataArray.reduce((s, p) => s + Math.max(0, p), 0);
      const normalizedArray =
        sum > 0
          ? dataArray.map((p) => Math.max(1e-8, p) / sum)
          : dataArray.map(() => 1 / dataArray.length);

      const maxConfidence = Math.max(...normalizedArray);
      console.log(`🔍 Max confidence: ${(maxConfidence * 100).toFixed(2)}%`);

      // Calculate entropy safely
      let entropy = 0;
      for (const p of normalizedArray) {
        if (p > 1e-8) {
          // Avoid log(0)
          entropy -= p * Math.log(p);
        }
      }
      const normalizedEntropy = Math.min(
        1.0,
        entropy / Math.log(normalizedArray.length)
      );
      console.log(
        `🔍 Normalized entropy: ${(normalizedEntropy * 100).toFixed(2)}%`
      );

      const anomalyIndicators = {
        attention_dispersion: normalizedEntropy,
        prediction_uncertainty: Math.min(
          0.99,
          Math.max(0.01, 1 - maxConfidence)
        ), // Clamp to valid range
        feature_magnitude: Math.sqrt(
          normalizedArray.reduce((sum: number, p: number) => sum + p * p, 0)
        ),
        gradient_consistency: Math.max(0, Math.min(1, 1 - normalizedEntropy)), // Clamp to [0,1]
      };

      const uncertaintyScore = anomalyIndicators.prediction_uncertainty;
      const entropyScore = anomalyIndicators.attention_dispersion;
      const attackScore = Math.min(
        1.0,
        Math.max(0.0, uncertaintyScore * 0.4 + entropyScore * 0.6)
      ); // Clamp final score
      const isAttack = attackScore > this.attackThreshold;

      // Skip attention map generation to save memory
      const simpleAttention = tf.ones([56, 56]).mul(0.5) as tf.Tensor2D;
      const attentionMap: AttentionMap = {
        attention: simpleAttention,
        focus_regions: [],
        anomaly_score: normalizedEntropy,
      };

      const explanation = isAttack
        ? `Attack detected: High uncertainty (${(
            uncertaintyScore * 100
          ).toFixed(1)}%) and entropy (${(entropyScore * 100).toFixed(1)}%)`
        : `Clean image: Low uncertainty (${(uncertaintyScore * 100).toFixed(
            1
          )}%) and stable predictions`;

      console.log(
        `✅ Attack detection: ${isAttack ? "ATTACK" : "CLEAN"} (score: ${(
          attackScore * 100
        ).toFixed(1)}%)`
      );

      return {
        is_attack: isAttack,
        confidence: attackScore,
        method: "lightweight",
        attention_map: attentionMap,
        anomaly_indicators: anomalyIndicators,
        explanation,
      };
    } catch (error) {
      console.error("Attack detection error:", error);

      // Ultra-safe fallback with clamped values
      const simpleAttention = tf.ones([28, 28]).mul(0.5) as tf.Tensor2D;
      return {
        is_attack: false,
        confidence: 0.5, // Safe middle value
        method: "statistical",
        attention_map: {
          attention: simpleAttention,
          focus_regions: [],
          anomaly_score: 0.5,
        },
        anomaly_indicators: {
          attention_dispersion: 0.5,
          prediction_uncertainty: 0.5,
          feature_magnitude: 0.5,
          gradient_consistency: 0.5,
        },
        explanation: "Attack detection failed, assuming clean image",
      };
    }
  }
}

/**
 * Factory function to create detector
 */
export function createAttackDetector(
  dataset: DatasetType,
  variant: ModelVariant
): LightweightDetector {
  return new LightweightDetector(dataset, variant);
}

/**
 * Main attack detection function
 */
export async function detectAdversarialAttack(
  model: tf.LayersModel,
  image: tf.Tensor4D,
  prediction: tf.Tensor,
  dataset: DatasetType,
  variant: ModelVariant
): Promise<AttackDetectionResult> {
  const detector = createAttackDetector(dataset, variant);
  return detector.detectAttack(model, image, prediction);
}
