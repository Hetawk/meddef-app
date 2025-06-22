/**
 * MedDef: Medical Defense Model Testing - Type Definitions
 *
 * Core types for the MedDef adversarial-resilient medical imaging system
 * with Defense-Aware Attention Mechanism (DAAM)
 *
 * CI2P Laboratory
 * School of Information Science and Engineering
 * University of Jinan
 */

// Dataset types for medical imaging
export type DatasetType = "roct" | "chest_xray";

// Medical classification labels
export type ROCTLabel = "CNV" | "DME" | "Drusen" | "Normal";
export type ChestXRayLabel = "Normal" | "Pneumonia";
export type MedicalLabel = ROCTLabel | ChestXRayLabel;

// Attack types supported by MedDef testing
export type AttackMethod = "fgsm" | "pgd" | "bim" | "jsma";

// Asset types for testing framework
export type AssetType = "clean" | "attack";

// Test asset interface for organized testing
export interface TestAsset {
  path: string;
  dataset: DatasetType;
  type: AssetType;
  attack_method?: AttackMethod;
  epsilon?: number;
  true_label: MedicalLabel;
  expected_confidence?: number;
}

// DAAM attention map for visualization
export interface AttentionMap {
  values: number[][];
  width: number;
  height: number;
  scale: number;
}

// MedDef test result with DAAM insights
export interface TestResult {
  image_path: string;
  predicted_label: MedicalLabel;
  confidence: number;
  attack_detected: boolean;
  daam_attention: AttentionMap;
  processing_time: number;
  timestamp: string;
}

// Enhanced test result with adversarial attack analysis
export interface EnhancedTestResult extends TestResult {
  attackResult?: {
    adversarialImage: any; // tf.Tensor - avoid importing tf in types
    originalPrediction: any;
    adversarialPrediction: any;
    perturbationMagnitude: number;
    attackSuccess: boolean;
    confidenceDropPct: number;
    attentionMap?: AttentionMap;
  };
  originalConfidence?: number;
  adversarialConfidence?: number;
  robustnessScore?: number;
  attackMetrics?: {
    perturbationMagnitude: number;
    attackSuccess: boolean;
    confidenceDropPct: number;
  };
}

// Batch testing results for performance analysis
export interface BatchTestResult {
  total_tests: number;
  successful_tests: number;
  failed_tests: number;
  average_confidence: number;
  average_processing_time: number;
  attack_detection_rate: number;
  results: TestResult[];
}

// Model configuration for different datasets
export interface ModelConfig {
  dataset: DatasetType;
  model_path: string;
  input_size: [number, number];
  num_classes: number;
  labels: MedicalLabel[];
  is_pruned: boolean;
  pruning_rate?: number;
}

// Performance metrics for validation
export interface PerformanceMetrics {
  clean_accuracy: number;
  adversarial_accuracy: number;
  attack_success_rate: number;
  average_confidence: number;
  attack_detection_accuracy: number;
  processing_speed: number; // images per second
}

// Attack configuration for testing
export interface AttackConfig {
  method: AttackMethod;
  epsilon: number;
  iterations?: number;
  step_size?: number;
  threshold?: number;
}

// Expected results for validation against research
export interface ExpectedResults {
  dataset: DatasetType;
  clean_accuracy_target: number;
  attack_robustness: {
    [key: string]: {
      asr_threshold: number;
      accuracy_threshold?: number;
    };
  };
}

// App state for React Native components
export interface AppState {
  currentDataset: DatasetType | null;
  modelLoaded: boolean;
  isLoading: boolean;
  selectedAsset: TestAsset | null;
  testResults: TestResult[];
  currentTest: TestResult | null;
  error: string | null;
}

// Theme configuration for medical-grade UI
export interface MedDefTheme {
  colors: {
    primary: string;
    success: string;
    warning: string;
    danger: string;
    background: string;
    surface: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    heading: string;
    body: string;
    mono: string;
  };
}

// Asset metadata for organized testing
export interface AssetMetadata {
  [dataset: string]: {
    clean: {
      [filename: string]: {
        label: MedicalLabel;
        confidence_target: string;
      };
    };
    attacks?: {
      [attack_folder: string]: {
        [filename: string]: {
          original_label: MedicalLabel;
          attack_success_threshold: string;
        };
      };
    };
  };
}

// Attack level configurations
export interface AttackLevels {
  [method: string]: number[];
}

// Component props for reusable UI components
export interface MedDefCardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}

export interface ConfidenceIndicatorProps {
  confidence: number;
  size?: "small" | "medium" | "large";
}

export interface AttentionHeatmapProps {
  attentionMap: AttentionMap;
  originalImage: string;
  opacity?: number;
}

export interface TestRunnerProps {
  testAsset: TestAsset;
  onResult: (result: TestResult) => void;
  onError: (error: string) => void;
}

export interface ResultDisplayProps {
  result: TestResult;
  showDetails?: boolean;
}

export interface MetricsDashboardProps {
  results: TestResult[];
  expectedResults?: ExpectedResults;
}

// Hook return types
export interface UseMedDefTestingReturn {
  loadModel: (dataset: DatasetType) => Promise<void>;
  runTest: (asset: TestAsset) => Promise<TestResult>;
  runBatchTest: (assets: TestAsset[]) => Promise<BatchTestResult>;
  runAdversarialTest: (
    cleanAsset: TestAsset,
    attackType: "fgsm" | "pgd" | "medical_attention",
    attackConfig: any // AttackConfig - avoid circular imports
  ) => Promise<EnhancedTestResult>;
  runRobustnessEvaluation: (
    cleanAsset: TestAsset,
    attackConfigs: Array<{
      type: "fgsm" | "pgd" | "medical_attention";
      config: any;
    }>
  ) => Promise<{
    asset: TestAsset;
    results: EnhancedTestResult[];
    overallRobustness: number;
    weakestAttack: string;
    strongestDefense: string;
  }>;
  isLoading: boolean;
  error: string | null;
  currentDataset: DatasetType | null;
  modelLoaded: boolean;
}

export interface UseAssetManagerReturn {
  loadAssets: (dataset: DatasetType) => Promise<TestAsset[]>;
  getCleanAssets: (dataset: DatasetType) => TestAsset[];
  getAttackAssets: (dataset: DatasetType, method?: AttackMethod) => TestAsset[];
  assets: TestAsset[];
  isLoading: boolean;
}

// Model management types
export interface ModelVariant {
  id: string;
  name: string;
  description: string;
  size: string;
  accuracy: number;
  defenseCapability: string;
  downloadUrl?: string;
  isQuantized: boolean;
  isPruned: boolean;
}

// Constants for attack levels (matching research parameters)
export const ATTACK_LEVELS: AttackLevels = {
  fgsm: [0.01, 0.05, 0.1],
  pgd: [0.01, 0.05, 0.1],
  bim: [0.05],
  jsma: [0.1], // threshold value
};

// Model specifications (matching research paper)
export const MODEL_CONFIGS: ModelConfig[] = [
  {
    dataset: "roct",
    model_path: "models/meddef_roct_full.tflite",
    input_size: [224, 224],
    num_classes: 4,
    labels: ["CNV", "DME", "Drusen", "Normal"],
    is_pruned: false,
  },
  {
    dataset: "chest_xray",
    model_path: "models/meddef_chest_xray_full.tflite",
    input_size: [224, 224],
    num_classes: 2,
    labels: ["Normal", "Pneumonia"],
    is_pruned: false,
  },
];

// Research-validated performance targets
export const PERFORMANCE_TARGETS: { [key in DatasetType]: PerformanceMetrics } =
  {
    roct: {
      clean_accuracy: 0.9752,
      adversarial_accuracy: 0.7, // at epsilon 0.05
      attack_success_rate: 0.67, // FGSM threshold
      average_confidence: 0.95,
      attack_detection_accuracy: 0.85,
      processing_speed: 10, // images per second
    },
    chest_xray: {
      clean_accuracy: 0.9752,
      adversarial_accuracy: 0.7,
      attack_success_rate: 0.67,
      average_confidence: 0.95,
      attack_detection_accuracy: 0.85,
      processing_speed: 10,
    },
  };
