/**
 * MedDef: Medical Defense Model Testing - Asset Manager
 *
 * Utility functions for managing and organizing test assets
 * Handles clean images, attack images, and metadata loading
 */

import {
  TestAsset,
  DatasetType,
  AttackMethod,
  AssetMetadata,
  ATTACK_LEVELS,
} from "../types/meddef";

/**
 * Asset Manager Class
 * Handles loading and organizing test images for MedDef testing
 */
export class AssetManager {
  private assets: Map<DatasetType, TestAsset[]> = new Map();
  private metadata: AssetMetadata | null = null;

  /**
   * Load all assets for a specific dataset
   */
  async loadAssets(dataset: DatasetType): Promise<TestAsset[]> {
    try {
      console.log(`📁 Loading assets for ${dataset} dataset...`);

      // Load metadata first
      if (!this.metadata) {
        this.metadata = await this.loadMetadata();
      }

      const assets: TestAsset[] = [];

      // Load clean images
      const cleanAssets = await this.loadCleanAssets(dataset);
      assets.push(...cleanAssets);

      // Load attack images
      const attackAssets = await this.loadAttackAssets(dataset);
      assets.push(...attackAssets);

      // Cache the assets
      this.assets.set(dataset, assets);

      console.log(`✅ Loaded ${assets.length} assets for ${dataset}`);
      console.log(`   Clean images: ${cleanAssets.length}`);
      console.log(`   Attack images: ${attackAssets.length}`);

      return assets;
    } catch (error) {
      console.error(`Failed to load assets for ${dataset}:`, error);
      throw new Error(`Failed to load assets for ${dataset}`);
    }
  }

  /**
   * Get clean (non-attacked) images for a dataset
   */
  getCleanAssets(dataset: DatasetType): TestAsset[] {
    const allAssets = this.assets.get(dataset) || [];
    return allAssets.filter((asset) => asset.type === "clean");
  }

  /**
   * Get attack images for a dataset, optionally filtered by attack method
   */
  getAttackAssets(dataset: DatasetType, method?: AttackMethod): TestAsset[] {
    const allAssets = this.assets.get(dataset) || [];
    const attackAssets = allAssets.filter((asset) => asset.type === "attack");

    if (method) {
      return attackAssets.filter((asset) => asset.attack_method === method);
    }

    return attackAssets;
  }

  /**
   * Get assets by attack method and epsilon level
   */
  getAttackAssetsByEpsilon(
    dataset: DatasetType,
    method: AttackMethod,
    epsilon: number
  ): TestAsset[] {
    return this.getAttackAssets(dataset, method).filter(
      (asset) => asset.epsilon === epsilon
    );
  }

  /**
   * Get random sample of assets for quick testing
   */
  getRandomSample(dataset: DatasetType, count: number = 10): TestAsset[] {
    const allAssets = this.assets.get(dataset) || [];
    const shuffled = [...allAssets].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Load clean images for a dataset
   */
  private async loadCleanAssets(dataset: DatasetType): Promise<TestAsset[]> {
    const assets: TestAsset[] = [];
    const basePath = `assets/test_images/${dataset}/clean`;

    try {
      // TODO: In production, use actual file system to scan directory
      // For now, create mock clean assets based on metadata
      const datasetMetadata = this.metadata?.[dataset];
      if (datasetMetadata?.clean) {
        for (const [filename, info] of Object.entries(datasetMetadata.clean)) {
          const asset: TestAsset = {
            path: `${basePath}/${filename}`,
            dataset,
            type: "clean",
            true_label: info.label,
            expected_confidence: this.parseConfidenceTarget(
              info.confidence_target
            ),
          };
          assets.push(asset);
        }
      } else {
        // Fallback: create default clean assets
        assets.push(...this.createDefaultCleanAssets(dataset, basePath));
      }

      console.log(`📸 Loaded ${assets.length} clean images for ${dataset}`);
      return assets;
    } catch (error) {
      console.error(`Failed to load clean assets for ${dataset}:`, error);
      return [];
    }
  }

  /**
   * Load attack images for a dataset
   */
  private async loadAttackAssets(dataset: DatasetType): Promise<TestAsset[]> {
    const assets: TestAsset[] = [];
    const basePath = `assets/test_images/${dataset}/attacks`;

    try {
      // Load assets for each attack method and epsilon level
      for (const [method, epsilons] of Object.entries(ATTACK_LEVELS)) {
        for (const epsilon of epsilons) {
          const folderName = this.getAttackFolderName(
            method as AttackMethod,
            epsilon
          );
          const folderPath = `${basePath}/${folderName}`;

          const attackAssets = await this.loadAttackAssetsFromFolder(
            folderPath,
            dataset,
            method as AttackMethod,
            epsilon
          );

          assets.push(...attackAssets);
        }
      }

      console.log(`⚔️ Loaded ${assets.length} attack images for ${dataset}`);
      return assets;
    } catch (error) {
      console.error(`Failed to load attack assets for ${dataset}:`, error);
      return [];
    }
  }

  /**
   * Load attack assets from a specific folder
   */
  private async loadAttackAssetsFromFolder(
    folderPath: string,
    dataset: DatasetType,
    method: AttackMethod,
    epsilon: number
  ): Promise<TestAsset[]> {
    const assets: TestAsset[] = [];

    try {
      // TODO: In production, scan actual directory for files
      // For now, create mock assets based on clean images
      const cleanAssets = this.getCleanAssets(dataset);

      for (const cleanAsset of cleanAssets) {
        const filename = this.getAttackFilename(cleanAsset.path, method);
        const asset: TestAsset = {
          path: `${folderPath}/${filename}`,
          dataset,
          type: "attack",
          attack_method: method,
          epsilon,
          true_label: cleanAsset.true_label,
        };
        assets.push(asset);
      }

      return assets;
    } catch (error) {
      console.error(`Failed to load attack assets from ${folderPath}:`, error);
      return [];
    }
  }

  /**
   * Load metadata from JSON file
   */
  private async loadMetadata(): Promise<AssetMetadata> {
    try {
      // TODO: In production, load from actual file
      // For now, return mock metadata
      const mockMetadata: AssetMetadata = {
        roct: {
          clean: {
            "cnv_001.png": { label: "CNV", confidence_target: ">95%" },
            "cnv_002.png": { label: "CNV", confidence_target: ">95%" },
            "dme_001.png": { label: "DME", confidence_target: ">95%" },
            "dme_002.png": { label: "DME", confidence_target: ">95%" },
            "drusen_001.png": { label: "Drusen", confidence_target: ">95%" },
            "drusen_002.png": { label: "Drusen", confidence_target: ">95%" },
            "normal_001.png": { label: "Normal", confidence_target: ">95%" },
            "normal_002.png": { label: "Normal", confidence_target: ">95%" },
          },
        },
        chest_xray: {
          clean: {
            "normal_001.png": { label: "Normal", confidence_target: ">95%" },
            "normal_002.png": { label: "Normal", confidence_target: ">95%" },
            "pneumonia_001.png": {
              label: "Pneumonia",
              confidence_target: ">95%",
            },
            "pneumonia_002.png": {
              label: "Pneumonia",
              confidence_target: ">95%",
            },
          },
        },
      };

      console.log("📋 Loaded asset metadata");
      return mockMetadata;
    } catch (error) {
      console.error("Failed to load metadata:", error);
      throw new Error("Failed to load asset metadata");
    }
  }

  /**
   * Create default clean assets if metadata is not available
   */
  private createDefaultCleanAssets(
    dataset: DatasetType,
    basePath: string
  ): TestAsset[] {
    const assets: TestAsset[] = [];

    if (dataset === "roct") {
      const labels = ["CNV", "DME", "Drusen", "Normal"] as const;
      for (const label of labels) {
        for (let i = 1; i <= 2; i++) {
          assets.push({
            path: `${basePath}/${label.toLowerCase()}_${i
              .toString()
              .padStart(3, "0")}.png`,
            dataset,
            type: "clean",
            true_label: label,
            expected_confidence: 0.95,
          });
        }
      }
    } else if (dataset === "chest_xray") {
      const labels = ["Normal", "Pneumonia"] as const;
      for (const label of labels) {
        for (let i = 1; i <= 2; i++) {
          assets.push({
            path: `${basePath}/${label.toLowerCase()}_${i
              .toString()
              .padStart(3, "0")}.png`,
            dataset,
            type: "clean",
            true_label: label,
            expected_confidence: 0.95,
          });
        }
      }
    }

    return assets;
  }

  /**
   * Get attack folder name based on method and epsilon
   */
  private getAttackFolderName(method: AttackMethod, epsilon: number): string {
    if (method === "jsma") {
      return `${method}_threshold_${epsilon}`;
    }
    return `${method}_eps_${epsilon.toFixed(2)}`;
  }

  /**
   * Get attack filename based on original filename and method
   */
  private getAttackFilename(
    originalPath: string,
    method: AttackMethod
  ): string {
    const filename = originalPath.split("/").pop() || "";
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    const extension = filename.includes(".")
      ? filename.split(".").pop()
      : "png";
    return `${nameWithoutExt}_${method}.${extension}`;
  }

  /**
   * Parse confidence target string to number
   */
  private parseConfidenceTarget(target: string): number {
    const match = target.match(/(\d+)%/);
    return match ? parseInt(match[1]) / 100 : 0.95;
  }
}

// Singleton instance for global use
export const assetManager = new AssetManager();

/**
 * Hook for using asset manager in React components
 */
export const useAssetManager = () => {
  const loadAssets = async (dataset: DatasetType) => {
    return await assetManager.loadAssets(dataset);
  };

  const getCleanAssets = (dataset: DatasetType) => {
    return assetManager.getCleanAssets(dataset);
  };

  const getAttackAssets = (dataset: DatasetType, method?: AttackMethod) => {
    return assetManager.getAttackAssets(dataset, method);
  };

  const getRandomSample = (dataset: DatasetType, count: number = 10) => {
    return assetManager.getRandomSample(dataset, count);
  };

  return {
    loadAssets,
    getCleanAssets,
    getAttackAssets,
    getRandomSample,
  };
};

export default assetManager;
