/**
 * MedDef Model Management Strategy
 *
 * CI2P Laboratory - University of Jinan
 * Optimized approach for mobile deployment with VPS server hosting
 *
 * Model Naming Convention (as per MedDef Paper):
 * - "MedDef (Full DAAM)" = Complete model with all DAAM components jointly combined (AFD + MFE + MSF)
 * - "MedDef" refers to the full model with all three DAAM components working together
 * - "MedDef w/o AFD" = MedDef without Adversarial Feature Detection (MFE + MSF only)
 * - "MedDef w/o AFD+MFE" = MedDef with Multi-Scale Features only (MSF only)
 * - "MedDef w/o AFD+MFE+MSF" = MedDef baseline with attention only (no DAAM components)
 * - "ResNet-18 Baseline" = Standard ResNet-18 for comparison
 */

import { getModelUrl, getDatasetVariants } from "./hostingerModelConfig";
import { appConfig, getModelUrl as getEnvModelUrl } from "./environment";

export interface ModelVariant {
  id: string;
  name: string;
  description: string;
  size: string; // Display size
  accuracy: number;
  defenseCapability: string;
  downloadUrl?: string;
  isQuantized: boolean;
  isPruned: boolean;
  deploymentType: "embedded" | "download" | "server"; // Source type
  filename?: string; // Server filename
}

export interface ModelConfig {
  dataset: "roct" | "chest_xray";
  variants: ModelVariant[];
  defaultVariant: string; // ID of recommended variant
  serverInfo: {
    host: string;
    port: number;
    available: boolean;
  };
}

/**
 * Available model configurations for each dataset
 * Integrates with CI2P Laboratory VPS using environment configuration
 */
export const MODEL_CONFIGS: { [key: string]: ModelConfig } = {
  roct: {
    dataset: "roct",
    defaultVariant: "meddef_full_daam",
    serverInfo: {
      host: appConfig.server.host,
      port: appConfig.server.port,
      available: true,
    },
    variants: [
      // Complete MedDef model (Full DAAM) - the best performing model
      {
        id: "meddef_full_daam",
        name: "MedDef (Full DAAM)",
        description:
          "Complete MedDef model with all DAAM components jointly combined: AFD + MFE + MSF",
        size: "22 MB",
        accuracy: 0.9897,
        defenseCapability: "Maximum (AFD + MFE + MSF)",
        isQuantized: true,
        isPruned: false,
        deploymentType: "embedded",
      },

      // Server models (downloadable from CI2P VPS) - Original full models
      {
        id: "meddef_full_server",
        name: "MedDef Full (Server Download)",
        description:
          "Full uncompressed MedDef model from CI2P Laboratory server with all DAAM components",
        size: "120 MB",
        accuracy: 0.9897,
        defenseCapability: "Maximum (AFD + MFE + MSF)",
        isQuantized: false,
        isPruned: false,
        deploymentType: "download",
        filename: "meddef_roct.pth",
        downloadUrl: getEnvModelUrl("roct", "meddef_roct.pth"),
      },
      {
        id: "meddef_wo_afd",
        name: "MedDef w/o AFD",
        description:
          "MedDef without Adversarial Feature Detection (MFE + MSF only)",
        size: "85 MB",
        accuracy: 0.9979,
        defenseCapability: "High (MFE + MSF)",
        isQuantized: false,
        isPruned: false,
        deploymentType: "download",
        filename: "meddef_wo_afd_roct.pth",
        downloadUrl: getEnvModelUrl("roct", "meddef_wo_afd_roct.pth"),
      },
      {
        id: "meddef_wo_afd_mfe",
        name: "MedDef w/o AFD+MFE",
        description: "MedDef with Multi-Scale Features only (MSF only)",
        size: "70 MB",
        accuracy: 0.9917,
        defenseCapability: "Medium (MSF only)",
        isQuantized: false,
        isPruned: false,
        deploymentType: "download",
        filename: "meddef_wo_afd_mfe_roct.pth",
        downloadUrl: getEnvModelUrl("roct", "meddef_wo_afd_mfe_roct.pth"),
      },
      {
        id: "meddef_wo_afd_mfe_msf",
        name: "MedDef w/o AFD+MFE+MSF",
        description: "MedDef baseline with attention only (no DAAM components)",
        size: "50 MB",
        accuracy: 0.9928,
        defenseCapability: "Basic (Attention only)",
        isQuantized: false,
        isPruned: false,
        deploymentType: "download",
        filename: "meddef_wo_afd_mfe_msf_roct.pth",
        downloadUrl: getEnvModelUrl("roct", "meddef_wo_afd_mfe_msf_roct.pth"),
      },
      {
        id: "resnet18_baseline",
        name: "ResNet-18 Baseline",
        description: "Standard ResNet-18 for comparison",
        size: "45 MB",
        accuracy: 0.9959,
        defenseCapability: "None",
        isQuantized: false,
        isPruned: false,
        deploymentType: "download",
        filename: "resnet18_roct.pth",
        downloadUrl: getEnvModelUrl("roct", "resnet18_roct.pth"),
      },
    ],
  },

  chest_xray: {
    dataset: "chest_xray",
    defaultVariant: "meddef_full_daam",
    serverInfo: {
      host: appConfig.server.host,
      port: appConfig.server.port,
      available: true,
    },
    variants: [
      // Complete MedDef model (Full DAAM) - the best performing model
      {
        id: "meddef_full_daam",
        name: "MedDef (Full DAAM)",
        description:
          "Complete MedDef model with all DAAM components jointly combined: AFD + MFE + MSF",
        size: "18 MB",
        accuracy: 0.9767,
        defenseCapability: "Maximum (AFD + MFE + MSF)",
        isQuantized: true,
        isPruned: false,
        deploymentType: "embedded",
      },

      // Server models
      {
        id: "meddef_full_server",
        name: "MedDef Full (Server Download)",
        description:
          "Full uncompressed MedDef model for pneumonia detection with all DAAM components",
        size: "120 MB",
        accuracy: 0.9767,
        defenseCapability: "Maximum (AFD + MFE + MSF)",
        isQuantized: false,
        isPruned: false,
        deploymentType: "download",
        filename: "meddef_chest_xray.pth",
        downloadUrl: getEnvModelUrl("chest_xray", "meddef_chest_xray.pth"),
      },
      {
        id: "meddef_wo_afd",
        name: "MedDef w/o AFD",
        description:
          "MedDef without Adversarial Feature Detection (MFE + MSF only)",
        size: "85 MB",
        accuracy: 0.9779,
        defenseCapability: "High (MFE + MSF)",
        isQuantized: false,
        isPruned: false,
        deploymentType: "download",
        filename: "meddef_wo_afd_chest_xray.pth",
        downloadUrl: getEnvModelUrl(
          "chest_xray",
          "meddef_wo_afd_chest_xray.pth"
        ),
      },
      {
        id: "meddef_wo_afd_mfe",
        name: "MedDef w/o AFD+MFE",
        description: "MedDef with Multi-Scale Features only (MSF only)",
        size: "70 MB",
        accuracy: 0.9917,
        defenseCapability: "Medium (MSF only)",
        isQuantized: false,
        isPruned: false,
        deploymentType: "download",
        filename: "meddef_wo_afd_mfe_chest_xray.pth",
        downloadUrl: getEnvModelUrl(
          "chest_xray",
          "meddef_wo_afd_mfe_chest_xray.pth"
        ),
      },
      {
        id: "meddef_wo_afd_mfe_msf",
        name: "MedDef w/o AFD+MFE+MSF",
        description: "MedDef baseline with attention only (no DAAM components)",
        size: "50 MB",
        accuracy: 0.9794,
        defenseCapability: "Basic (Attention only)",
        isQuantized: false,
        isPruned: false,
        deploymentType: "download",
        filename: "meddef_wo_afd_mfe_msf_chest_xray.pth",
        downloadUrl: getEnvModelUrl(
          "chest_xray",
          "meddef_wo_afd_mfe_msf_chest_xray.pth"
        ),
      },
      {
        id: "resnet18_baseline",
        name: "ResNet-18 Baseline",
        description: "Standard ResNet-18 for comparison",
        size: "45 MB",
        accuracy: 0.7292,
        defenseCapability: "None",
        isQuantized: false,
        isPruned: false,
        deploymentType: "download",
        filename: "resnet18_chest_xray.pth",
        downloadUrl: getEnvModelUrl("chest_xray", "resnet18_chest_xray.pth"),
      },
    ],
  },
};

/**
 * Helper functions for model management
 */

// Get all variants for a dataset
export function getModelVariants(
  dataset: "roct" | "chest_xray"
): ModelVariant[] {
  return MODEL_CONFIGS[dataset]?.variants || [];
}

// Get embedded models (included in app)
export function getEmbeddedModels(
  dataset: "roct" | "chest_xray"
): ModelVariant[] {
  return getModelVariants(dataset).filter(
    (variant) => variant.deploymentType === "embedded"
  );
}

// Get downloadable models (from CI2P server)
export function getDownloadableModels(
  dataset: "roct" | "chest_xray"
): ModelVariant[] {
  return getModelVariants(dataset).filter(
    (variant) => variant.deploymentType === "download"
  );
}

// Get model by ID
export function getModelById(
  dataset: "roct" | "chest_xray",
  id: string
): ModelVariant | null {
  return getModelVariants(dataset).find((variant) => variant.id === id) || null;
}

// Check if server is available
export function isServerAvailable(dataset: "roct" | "chest_xray"): boolean {
  return MODEL_CONFIGS[dataset]?.serverInfo?.available || false;
}

// Get server info
export function getServerInfo(dataset: "roct" | "chest_xray") {
  return MODEL_CONFIGS[dataset]?.serverInfo || null;
}

/**
 * Model deployment strategy summary:
 *
 * 1. EMBEDDED MODELS (15-20 MB total app size):
 *    - MedDef Lite variants for each dataset
 *    - Quantized and pruned for mobile performance
 *    - Immediate availability, no download required
 *
 * 2. DOWNLOADABLE MODELS (CI2P VPS Server):
 *    - Full research models with complete defense mechanisms
 *    - Multiple variants showing ablation study results
 *    - Downloaded on-demand to keep app size small
 *    - Cached locally after first download
 *
 * 3. PERFORMANCE OPTIMIZATION:
 *    - Users start with embedded lite models
 *    - Can download full models for maximum performance
 *    - Progressive enhancement approach
 *    - Research reproducibility with actual model files
 */
