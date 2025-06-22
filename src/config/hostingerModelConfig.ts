/**
 * MedDef Model Deployment Strategy for CI2P Laboratory Server
 *
 * Configuration for CI2P Laboratory model server using environment variables
 *
 * CI2P Laboratory
 * School of Information Science and Engineering
 * University of Jinan
 */

import { appConfig } from "./environment";

// Your actual server structure:
/*
31.97.41.230:/home/hetawk/models/2025/ci2p/meddef/
├── chest_xray/
│   ├── meddef1_no_afd_mfe_msf_chest_xray.pth
│   ├── meddef_chest_xray.pth
│   ├── meddef_no_afd_chest_xray.pth
│   ├── meddef_no_afd_mfe_chest_xray.pth
│   └── resnet_18_chest_xray.pth
└── roct/
    ├── meddef_no_afd_mfe_msf_roct.pth
    ├── meddef_no_afd_mfe_roct.pth
    ├── meddef_no_afd_roct.pth
    ├── meddef_roct.pth
    └── resnet_18_rotc.pth
*/

export interface ServerModelConfig {
  baseUrl: string;
  serverInfo: {
    host: string;
    port: number;
    path: string;
    useSSH: boolean;
    sshUser?: string;
  };
  datasets: {
    [dataset: string]: {
      variants: {
        [variantId: string]: {
          filename: string;
          displayName: string;
          description: string;
          size: string;
          accuracy: number;
          defenseCapability: string;
          isQuantized: boolean;
          isPruned: boolean;
          downloadUrl: string;
        };
      };
    };
  };
}

export const HOSTINGER_MODEL_CONFIG: ServerModelConfig = {
  baseUrl: appConfig.server.baseUrl, // Uses environment variables
  serverInfo: {
    host: appConfig.server.host,
    port: appConfig.server.port,
    path: appConfig.server.basePath,
    useSSH: false, // Using HTTP for mobile app
    sshUser: "hetawk",
  },

  datasets: {
    roct: {
      variants: {
        meddef_full: {
          filename: "meddef_roct.pth",
          displayName: "MedDef (Full DAAM)",
          description:
            "Complete MedDef model with all DAAM components jointly combined: AFD + MFE + MSF",
          size: "120 MB",
          accuracy: 0.9897,
          defenseCapability: "Maximum (AFD + MFE + MSF)",
          isQuantized: false,
          isPruned: false,
          downloadUrl: "/roct/meddef_roct.pth",
        },
        meddef_wo_afd: {
          filename: "meddef_wo_afd_roct.pth",
          displayName: "MedDef w/o AFD",
          description:
            "MedDef without Adversarial Feature Detection (MFE + MSF only)",
          size: "85 MB",
          accuracy: 0.9979,
          defenseCapability: "High (MFE + MSF)",
          isQuantized: false,
          isPruned: false,
          downloadUrl: "/roct/meddef_wo_afd_roct.pth",
        },
        meddef_wo_afd_mfe: {
          filename: "meddef_wo_afd_mfe_roct.pth",
          displayName: "MedDef ROCT w/o AFD+MFE",
          description: "MedDef with Multi-Scale Features only (MSF only)",
          size: "70 MB",
          accuracy: 0.9917,
          defenseCapability: "Medium (MSF only)",
          isQuantized: false,
          isPruned: false,
          downloadUrl: "/roct/meddef_no_afd_mfe_roct.pth",
        },
        meddef_wo_afd_mfe_msf: {
          filename: "meddef_wo_afd_mfe_msf_roct.pth",
          displayName: "MedDef w/o AFD+MFE+MSF",
          description:
            "MedDef baseline with attention only (no DAAM components)",
          size: "50 MB",
          accuracy: 0.9928,
          defenseCapability: "Basic (Attention only)",
          isQuantized: false,
          isPruned: false,
          downloadUrl: "/roct/meddef_wo_afd_mfe_msf_roct.pth",
        },
        resnet18_baseline: {
          filename: "resnet_18_rotc.pth",
          displayName: "ResNet-18 Baseline",
          description: "Standard ResNet-18 for comparison",
          size: "45 MB",
          accuracy: 0.9959,
          defenseCapability: "None",
          isQuantized: false,
          isPruned: false,
          downloadUrl: "/roct/resnet_18_rotc.pth",
        },
      },
    },

    chest_xray: {
      variants: {
        meddef_full: {
          filename: "meddef_chest_xray.pth",
          displayName: "MedDef (Full DAAM)",
          description:
            "Complete MedDef model with all DAAM components jointly combined: AFD + MFE + MSF",
          size: "120 MB",
          accuracy: 0.9767,
          defenseCapability: "Maximum (AFD + MFE + MSF)",
          isQuantized: false,
          isPruned: false,
          downloadUrl: "/chest_xray/meddef_chest_xray.pth",
        },
        meddef_wo_afd: {
          filename: "meddef_wo_afd_chest_xray.pth",
          displayName: "MedDef w/o AFD",
          description:
            "MedDef without Adversarial Feature Detection (MFE + MSF only)",
          size: "90 MB",
          accuracy: 0.9524,
          defenseCapability: "High (MFE + MSF)",
          isQuantized: false,
          isPruned: false,
          downloadUrl: "/chest_xray/meddef_no_afd_chest_xray.pth",
        },
        meddef_wo_afd_mfe: {
          filename: "meddef_wo_afd_mfe_chest_xray.pth",
          displayName: "MedDef w/o AFD+MFE",
          description: "MedDef with Multi-Scale Features only (MSF only)",
          size: "70 MB",
          accuracy: 0.9569,
          defenseCapability: "Medium (MSF only)",
          isQuantized: false,
          isPruned: false,
          downloadUrl: "/chest_xray/meddef_no_afd_mfe_chest_xray.pth",
        },
        meddef_wo_afd_mfe_msf: {
          filename: "meddef_wo_afd_mfe_msf_chest_xray.pth",
          displayName: "MedDef w/o AFD+MFE+MSF",
          description:
            "MedDef baseline with attention only (no DAAM components)",
          size: "50 MB",
          accuracy: 0.9794,
          defenseCapability: "Basic (Attention only)",
          isQuantized: false,
          isPruned: false,
          downloadUrl: "/chest_xray/meddef_wo_afd_mfe_msf_chest_xray.pth",
        },
        resnet18_baseline: {
          filename: "resnet_18_chest_xray.pth",
          displayName: "ResNet-18 Baseline",
          description: "Standard ResNet-18 for comparison",
          size: "45 MB",
          accuracy: 0.7292,
          defenseCapability: "None",
          isQuantized: false,
          isPruned: false,
          downloadUrl: "/chest_xray/resnet_18_chest_xray.pth",
        },
      },
    },
  },
};

// Helper function to build full URLs
export function getModelUrl(dataset: string, variantId: string): string {
  const config = HOSTINGER_MODEL_CONFIG;
  const variant = config.datasets[dataset]?.variants[variantId];

  if (!variant) {
    throw new Error(
      `Model variant ${variantId} not found for dataset ${dataset}`
    );
  }

  return config.baseUrl + variant.downloadUrl;
}

// Helper function to get all variants for a dataset
export function getDatasetVariants(dataset: string) {
  return HOSTINGER_MODEL_CONFIG.datasets[dataset]?.variants || {};
}

// Helper function to get model info
export function getModelInfo(dataset: string, variantId: string) {
  const variant = HOSTINGER_MODEL_CONFIG.datasets[dataset]?.variants[variantId];
  return variant || null;
}

// Model info structure for each model
export interface ModelInfo {
  name: string;
  version: string;
  description: string;
  dataset: string;
  architecture: string;
  inputShape: [number, number, number];
  outputClasses: string[];
  accuracy: number;
  defenseCapability: string;
  trainingDetails: {
    epochs: number;
    batchSize: number;
    optimizer: string;
    learningRate: number;
  };
  metrics: {
    cleanAccuracy: number;
    adversarialAccuracy: number;
    attackDetectionRate: number;
  };
  ci2p: {
    laboratory: "CI2P Laboratory";
    institution: "School of Information Science and Engineering, University of Jinan";
    researchers: string[];
    publicationUrl?: string;
  };
}

// Example model_info.json content for your server
export const EXAMPLE_MODEL_INFO: ModelInfo = {
  name: "MedDef ROCT Lite",
  version: "1.0.0",
  description:
    "Quantized MedDef model for retinal OCT classification with DAAM attention mechanism",
  dataset: "roct",
  architecture: "MedDef + DAAM",
  inputShape: [224, 224, 3],
  outputClasses: ["CNV", "DME", "Drusen", "Normal"],
  accuracy: 0.89,
  defenseCapability: "High adversarial robustness with attention-based defense",
  trainingDetails: {
    epochs: 100,
    batchSize: 32,
    optimizer: "Adam",
    learningRate: 0.001,
  },
  metrics: {
    cleanAccuracy: 0.89,
    adversarialAccuracy: 0.71,
    attackDetectionRate: 0.85,
  },
  ci2p: {
    laboratory: "CI2P Laboratory",
    institution:
      "School of Information Science and Engineering, University of Jinan",
    researchers: ["Your Name", "Co-researchers"],
    publicationUrl: "https://your-paper-url.com",
  },
};
