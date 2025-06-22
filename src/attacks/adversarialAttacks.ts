/**
 * MedDef: Adversarial Attack Implementations
 *
 * Real adversarial attack implementations for medical imaging
 * Includes FGSM, PGD, C&W, and medical-specific attacks
 */

import * as tf from "@tensorflow/tfjs";
import { AttentionMap, TestAsset, DatasetType } from "../types/meddef";

export interface AttackConfig {
  epsilon: number;
  iterations?: number;
  stepSize?: number;
  targetClass?: number;
  lossFunction?: "crossentropy" | "carlini_wagner" | "medical_focus";
}

export interface AttackResult {
  adversarialImage: tf.Tensor;
  originalPrediction: tf.Tensor;
  adversarialPrediction: tf.Tensor;
  perturbationMagnitude: number;
  attackSuccess: boolean;
  confidenceDropPct: number;
  attentionMap?: AttentionMap;
}

/**
 * Fast Gradient Sign Method (FGSM) Attack
 * Medical-optimized with attention preservation
 */
export class FGSMAttack {
  protected epsilon: number;
  private preserveAttention: boolean;

  constructor(config: AttackConfig, preserveAttention = true) {
    this.epsilon = config.epsilon;
    this.preserveAttention = preserveAttention;
  }

  async generateAdversarialExample(
    model: tf.LayersModel,
    image: tf.Tensor,
    trueLabel: number,
    dataset: DatasetType
  ): Promise<AttackResult> {
    const originalPrediction = model.predict(image.expandDims(0)) as tf.Tensor;
    const originalClass = originalPrediction.argMax(-1);
    const originalConfidence = originalPrediction.max();

    // Compute gradients
    const gradientFunction = tf.grad((img: tf.Tensor) => {
      const prediction = model.predict(img.expandDims(0)) as tf.Tensor;
      const numClasses = prediction.shape[prediction.shape.length - 1] || 2;
      return tf.losses.softmaxCrossEntropy(
        tf.oneHot(trueLabel, numClasses),
        prediction
      );
    });

    const gradients = gradientFunction(image);

    // Apply FGSM perturbation
    const signGradients = gradients.sign();
    const perturbation = signGradients.mul(this.epsilon);

    // Medical imaging constraint: preserve critical anatomical regions
    let constrainedPerturbation = perturbation;
    if (this.preserveAttention && dataset === "roct") {
      constrainedPerturbation = this.applyRetinalConstraints(
        perturbation,
        image
      );
    } else if (this.preserveAttention && dataset === "chest_xray") {
      constrainedPerturbation = this.applyChestXrayConstraints(
        perturbation,
        image
      );
    }

    const adversarialImage = image
      .add(constrainedPerturbation)
      .clipByValue(0, 1);

    // Get adversarial prediction
    const adversarialPrediction = model.predict(
      adversarialImage.expandDims(0)
    ) as tf.Tensor;
    const adversarialClass = adversarialPrediction.argMax(-1);
    const adversarialConfidence = adversarialPrediction.max();

    // Calculate metrics
    const perturbationMagnitude = perturbation.norm().dataSync()[0];
    const attackSuccess = !originalClass.equal(adversarialClass).dataSync()[0];
    const confidenceDropPct =
      ((originalConfidence.dataSync()[0] -
        adversarialConfidence.dataSync()[0]) /
        originalConfidence.dataSync()[0]) *
      100;

    // Clean up intermediate tensors
    gradients.dispose();
    signGradients.dispose();
    perturbation.dispose();
    originalClass.dispose();
    originalConfidence.dispose();
    adversarialClass.dispose();
    adversarialConfidence.dispose();

    return {
      adversarialImage: adversarialImage.clone(),
      originalPrediction: originalPrediction.clone(),
      adversarialPrediction: adversarialPrediction.clone(),
      perturbationMagnitude,
      attackSuccess,
      confidenceDropPct,
    };
  }

  private applyRetinalConstraints(
    perturbation: tf.Tensor,
    image: tf.Tensor
  ): tf.Tensor {
    // For retinal OCT: preserve foveal and optic disc regions
    const height = image.shape[0] as number;
    const width = image.shape[1] as number;
    const channels = (image.shape[2] as number) || 1;
    const centerY = Math.floor(height / 2);
    const centerX = Math.floor(width / 2);

    // Protect central region (fovea)
    const mask = tf.buffer([height, width, channels]);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        // Reduce perturbation strength near center
        const protectionFactor = distance < 50 ? 0.3 : 1.0;
        for (let c = 0; c < channels; c++) {
          mask.set(protectionFactor, y, x, c);
        }
      }
    }

    const maskTensor = mask.toTensor();
    const result = perturbation.mul(maskTensor);
    maskTensor.dispose();
    return result;
  }

  private applyChestXrayConstraints(
    perturbation: tf.Tensor,
    image: tf.Tensor
  ): tf.Tensor {
    // For chest X-ray: preserve lung boundaries and cardiac silhouette
    const height = image.shape[0] as number;
    const width = image.shape[1] as number;
    const channels = (image.shape[2] as number) || 1;

    const mask = tf.buffer([height, width, channels]);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Protect central lung regions
        const isLungRegion =
          y > height * 0.2 &&
          y < height * 0.8 &&
          x > width * 0.2 &&
          x < width * 0.8;
        const protectionFactor = isLungRegion ? 0.5 : 1.0;

        for (let c = 0; c < channels; c++) {
          mask.set(protectionFactor, y, x, c);
        }
      }
    }

    const maskTensor = mask.toTensor();
    const result = perturbation.mul(maskTensor);
    maskTensor.dispose();
    return result;
  }
}

/**
 * Projected Gradient Descent (PGD) Attack
 * Iterative attack with medical constraints
 */
export class PGDAttack extends FGSMAttack {
  private iterations: number;
  private stepSize: number;

  constructor(config: AttackConfig) {
    super(config);
    this.iterations = config.iterations || 10;
    this.stepSize = config.stepSize || config.epsilon / 4;
  }

  async generateAdversarialExample(
    model: tf.LayersModel,
    image: tf.Tensor,
    trueLabel: number,
    dataset: DatasetType
  ): Promise<AttackResult> {
    let adversarialImage = image.clone();
    const originalPrediction = model.predict(image.expandDims(0)) as tf.Tensor;

    // Iterative attack
    for (let i = 0; i < this.iterations; i++) {
      const gradientFunction = tf.grad((img: tf.Tensor) => {
        const prediction = model.predict(img.expandDims(0)) as tf.Tensor;
        const numClasses = prediction.shape[prediction.shape.length - 1] || 2;
        return tf.losses.softmaxCrossEntropy(
          tf.oneHot(trueLabel, numClasses),
          prediction
        );
      });

      const gradients = gradientFunction(adversarialImage);
      const signGradients = gradients.sign();

      // Apply step
      const oldAdversarialImage = adversarialImage;
      adversarialImage = adversarialImage.add(signGradients.mul(this.stepSize));

      // Project back to epsilon ball
      const perturbation = adversarialImage.sub(image);
      const clippedPerturbation = perturbation.clipByValue(
        -this.epsilon,
        this.epsilon
      );
      adversarialImage = image.add(clippedPerturbation).clipByValue(0, 1);

      // Clean up intermediate tensors
      gradients.dispose();
      signGradients.dispose();
      oldAdversarialImage.dispose();
      perturbation.dispose();
      clippedPerturbation.dispose();
    }

    const adversarialPrediction = model.predict(
      adversarialImage.expandDims(0)
    ) as tf.Tensor;

    // Calculate metrics
    const perturbationMagnitude = adversarialImage
      .sub(image)
      .norm()
      .dataSync()[0];
    const originalClass = originalPrediction.argMax(-1);
    const adversarialClass = adversarialPrediction.argMax(-1);
    const attackSuccess = !originalClass.equal(adversarialClass).dataSync()[0];

    const originalConfidence = originalPrediction.max().dataSync()[0];
    const adversarialConfidence = adversarialPrediction.max().dataSync()[0];
    const confidenceDropPct =
      ((originalConfidence - adversarialConfidence) / originalConfidence) * 100;

    // Clean up
    originalClass.dispose();
    adversarialClass.dispose();

    return {
      adversarialImage: adversarialImage.clone(),
      originalPrediction: originalPrediction.clone(),
      adversarialPrediction: adversarialPrediction.clone(),
      perturbationMagnitude,
      attackSuccess,
      confidenceDropPct,
    };
  }
}

/**
 * Medical-Specific Attack
 * Targets anatomical attention regions in medical images
 */
export class MedicalAttentionAttack {
  private epsilon: number;
  private targetAttentionReduction: number;

  constructor(config: AttackConfig & { targetAttentionReduction?: number }) {
    this.epsilon = config.epsilon;
    this.targetAttentionReduction = config.targetAttentionReduction || 0.7;
  }

  async generateAdversarialExample(
    model: tf.LayersModel,
    image: tf.Tensor,
    trueLabel: number,
    dataset: DatasetType,
    attentionMap?: AttentionMap
  ): Promise<AttackResult> {
    // If attention map provided, target high-attention regions
    if (attentionMap) {
      return this.generateAttentionTargetedAttack(
        model,
        image,
        trueLabel,
        attentionMap
      );
    }

    // Otherwise, generate simple gradient-based attack for medical images
    const originalPrediction = model.predict(image.expandDims(0)) as tf.Tensor;

    const gradientFunction = tf.grad((img: tf.Tensor) => {
      const prediction = model.predict(img.expandDims(0)) as tf.Tensor;
      const numClasses = prediction.shape[prediction.shape.length - 1] || 2;
      return tf.losses.softmaxCrossEntropy(
        tf.oneHot(trueLabel, numClasses),
        prediction
      );
    });

    const gradients = gradientFunction(image);
    const perturbation = gradients.sign().mul(this.epsilon);
    const adversarialImage = image.add(perturbation).clipByValue(0, 1);

    const adversarialPrediction = model.predict(
      adversarialImage.expandDims(0)
    ) as tf.Tensor;

    const perturbationMagnitude = perturbation.norm().dataSync()[0];
    const originalClass = originalPrediction.argMax(-1);
    const adversarialClass = adversarialPrediction.argMax(-1);
    const attackSuccess = !originalClass.equal(adversarialClass).dataSync()[0];

    const originalConfidence = originalPrediction.max().dataSync()[0];
    const adversarialConfidence = adversarialPrediction.max().dataSync()[0];
    const confidenceDropPct =
      ((originalConfidence - adversarialConfidence) / originalConfidence) * 100;

    // Clean up
    gradients.dispose();
    perturbation.dispose();
    originalClass.dispose();
    adversarialClass.dispose();

    return {
      adversarialImage: adversarialImage.clone(),
      originalPrediction: originalPrediction.clone(),
      adversarialPrediction: adversarialPrediction.clone(),
      perturbationMagnitude,
      attackSuccess,
      confidenceDropPct,
    };
  }

  private generateAttentionTargetedAttack(
    model: tf.LayersModel,
    image: tf.Tensor,
    trueLabel: number,
    attentionMap: AttentionMap
  ): AttackResult {
    // Target high-attention medical regions
    const originalPrediction = model.predict(image.expandDims(0)) as tf.Tensor;

    // Convert attention map to tensor
    const attentionTensor = tf.tensor2d(attentionMap.values);
    const normalizedAttention = attentionTensor.div(attentionTensor.max());

    // Create perturbation that targets high-attention regions
    const gradientFunction = tf.grad((img: tf.Tensor) => {
      const prediction = model.predict(img.expandDims(0)) as tf.Tensor;
      const numClasses = prediction.shape[prediction.shape.length - 1] || 2;
      return tf.losses.softmaxCrossEntropy(
        tf.oneHot(trueLabel, numClasses),
        prediction
      );
    });

    const gradients = gradientFunction(image);

    // Weight perturbation by attention
    const attentionWeightedGradients = gradients.mul(
      normalizedAttention.expandDims(-1)
    );
    const perturbation = attentionWeightedGradients.sign().mul(this.epsilon);
    const adversarialImage = image.add(perturbation).clipByValue(0, 1);

    const adversarialPrediction = model.predict(
      adversarialImage.expandDims(0)
    ) as tf.Tensor;

    const perturbationMagnitude = perturbation.norm().dataSync()[0];
    const originalClass = originalPrediction.argMax(-1);
    const adversarialClass = adversarialPrediction.argMax(-1);
    const attackSuccess = !originalClass.equal(adversarialClass).dataSync()[0];

    const originalConfidence = originalPrediction.max().dataSync()[0];
    const adversarialConfidence = adversarialPrediction.max().dataSync()[0];
    const confidenceDropPct =
      ((originalConfidence - adversarialConfidence) / originalConfidence) * 100;

    // Clean up
    attentionTensor.dispose();
    normalizedAttention.dispose();
    gradients.dispose();
    attentionWeightedGradients.dispose();
    perturbation.dispose();
    originalClass.dispose();
    adversarialClass.dispose();

    return {
      adversarialImage: adversarialImage.clone(),
      originalPrediction: originalPrediction.clone(),
      adversarialPrediction: adversarialPrediction.clone(),
      perturbationMagnitude,
      attackSuccess,
      confidenceDropPct,
      attentionMap: {
        values: attentionMap.values,
        width: attentionMap.width,
        height: attentionMap.height,
        scale: attentionMap.scale * (1 - confidenceDropPct / 100),
      },
    };
  }
}

/**
 * Attack Factory for creating different attack types
 */
export class AttackFactory {
  static createAttack(
    attackType: "fgsm" | "pgd" | "medical_attention",
    config: AttackConfig
  ): FGSMAttack | PGDAttack | MedicalAttentionAttack {
    switch (attackType) {
      case "fgsm":
        return new FGSMAttack(config);
      case "pgd":
        return new PGDAttack(config);
      case "medical_attention":
        return new MedicalAttentionAttack(config);
      default:
        throw new Error(`Unknown attack type: ${attackType}`);
    }
  }
}

/**
 * DAAM (Discriminative Attention Attribution Maps) Extractor
 * Extracts attention maps for medical image analysis
 */
export class DAAMExtractor {
  static async extractAttentionMap(
    model: tf.LayersModel,
    image: tf.Tensor,
    targetClass?: number
  ): Promise<AttentionMap> {
    // Get prediction
    const prediction = model.predict(image.expandDims(0)) as tf.Tensor;
    const predictedClass = targetClass || prediction.argMax(-1).dataSync()[0];
    const confidence = prediction.max().dataSync()[0];

    // Compute gradients with respect to input
    const gradientFunction = tf.grad((img: tf.Tensor) => {
      const pred = model.predict(img.expandDims(0)) as tf.Tensor;
      return pred.gather([predictedClass], 1);
    });

    const gradients = gradientFunction(image);

    // Generate attention map using Grad-CAM style approach
    const attentionValues = gradients.abs().mean(-1); // Average across channels
    const normalizedAttention = attentionValues.div(attentionValues.max());

    const attentionArray = normalizedAttention.dataSync() as Float32Array;
    const shape = normalizedAttention.shape;
    const height = shape[0] as number;
    const width = shape[1] as number;

    // Convert to 2D array format expected by AttentionMap
    const values2D: number[][] = [];
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        row.push(attentionArray[y * width + x]);
      }
      values2D.push(row);
    }

    // Clean up
    prediction.dispose();
    gradients.dispose();
    attentionValues.dispose();
    normalizedAttention.dispose();

    return {
      values: values2D,
      width: width,
      height: height,
      scale: confidence,
    };
  }
}
