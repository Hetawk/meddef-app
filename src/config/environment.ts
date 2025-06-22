/**
 * Environment Configuration for MedDef App
 *
 * CI2P Laboratory
 * School of Information Science and Engineering
 * University of Jinan
 */

import {
  CI2P_SERVER_HOST,
  CI2P_SERVER_PORT,
  CI2P_SERVER_PROTOCOL,
  CI2P_MODEL_BASE_PATH,
  APP_NAME,
  APP_VERSION,
  APP_ENVIRONMENT,
  LAB_NAME,
  INSTITUTION,
  INSTITUTION_SHORT,
  MAX_DOWNLOAD_RETRIES,
  DOWNLOAD_TIMEOUT_MS,
  CACHE_EXPIRY_DAYS,
  DEBUG_MODE,
  ENABLE_MOCK_MODELS,
  LOG_LEVEL,
  REQUIRE_AUTH,
  API_RATE_LIMIT,
} from "@env";

export interface AppConfig {
  server: {
    host: string;
    port: number;
    protocol: "http" | "https";
    basePath: string;
    baseUrl: string;
  };
  app: {
    name: string;
    version: string;
    environment: "development" | "production" | "staging";
  };
  laboratory: {
    name: string;
    institution: string;
    institutionShort: string;
  };
  download: {
    maxRetries: number;
    timeoutMs: number;
    cacheExpiryDays: number;
  };
  debug: {
    enabled: boolean;
    enableMockModels: boolean;
    logLevel: "debug" | "info" | "warn" | "error";
  };
  security: {
    requireAuth: boolean;
    apiRateLimit: number;
  };
}

// Parse environment variables with fallbacks
const parseBoolean = (
  value: string | undefined,
  defaultValue: boolean = false
): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === "true";
};

const parseNumber = (
  value: string | undefined,
  defaultValue: number
): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Main configuration object
export const appConfig: AppConfig = {
  server: {
    host: CI2P_SERVER_HOST || "31.97.41.230",
    port: parseNumber(CI2P_SERVER_PORT, 8000),
    protocol: (CI2P_SERVER_PROTOCOL as "http" | "https") || "http",
    basePath: CI2P_MODEL_BASE_PATH || "/2025/ci2p/meddef",
    get baseUrl() {
      return `${this.protocol}://${this.host}:${this.port}`;
    },
  },
  app: {
    name: APP_NAME || "MedDef",
    version: APP_VERSION || "1.0.0",
    environment:
      (APP_ENVIRONMENT as "development" | "production" | "staging") ||
      "development",
  },
  laboratory: {
    name: LAB_NAME || "CI2P Laboratory",
    institution:
      INSTITUTION ||
      "School of Information Science and Engineering, University of Jinan",
    institutionShort: INSTITUTION_SHORT || "University of Jinan",
  },
  download: {
    maxRetries: parseNumber(MAX_DOWNLOAD_RETRIES, 3),
    timeoutMs: parseNumber(DOWNLOAD_TIMEOUT_MS, 30000),
    cacheExpiryDays: parseNumber(CACHE_EXPIRY_DAYS, 7),
  },
  debug: {
    enabled: parseBoolean(DEBUG_MODE, true),
    enableMockModels: parseBoolean(ENABLE_MOCK_MODELS, false),
    logLevel: (LOG_LEVEL as "debug" | "info" | "warn" | "error") || "info",
  },
  security: {
    requireAuth: parseBoolean(REQUIRE_AUTH, false),
    apiRateLimit: parseNumber(API_RATE_LIMIT, 100),
  },
};

// Helper functions for common operations
export const getModelUrl = (
  dataset: "roct" | "chest_xray",
  filename: string
): string => {
  return `${appConfig.server.baseUrl}/${dataset}/${filename}`;
};

export const isProduction = (): boolean => {
  return appConfig.app.environment === "production";
};

export const isDevelopment = (): boolean => {
  return appConfig.app.environment === "development";
};

export const shouldUseMockModels = (): boolean => {
  return (
    appConfig.debug.enableMockModels ||
    (isDevelopment() && !appConfig.server.host)
  );
};

// Logging utility that respects log level
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (
      appConfig.debug.enabled &&
      ["debug"].includes(appConfig.debug.logLevel)
    ) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (
      appConfig.debug.enabled &&
      ["debug", "info"].includes(appConfig.debug.logLevel)
    ) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (
      appConfig.debug.enabled &&
      ["debug", "info", "warn"].includes(appConfig.debug.logLevel)
    ) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};

// Export server info for components
export const serverInfo = {
  host: appConfig.server.host,
  port: appConfig.server.port,
  protocol: appConfig.server.protocol,
  baseUrl: appConfig.server.baseUrl,
  available: true, // This could be checked dynamically
};

// Export laboratory info for branding
export const laboratoryInfo = {
  name: appConfig.laboratory.name,
  institution: appConfig.laboratory.institution,
  institutionShort: appConfig.laboratory.institutionShort,
  website: "https://www.ujn.edu.cn/", // University of Jinan website
};

// Configuration validation
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!appConfig.server.host) {
    errors.push("CI2P_SERVER_HOST is required");
  }

  if (!appConfig.laboratory.name) {
    errors.push("LAB_NAME is required");
  }

  if (!appConfig.laboratory.institution) {
    errors.push("INSTITUTION is required");
  }

  if (isProduction() && appConfig.server.protocol !== "https") {
    errors.push("HTTPS is required in production");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Initialize configuration (call this at app startup)
export const initializeConfig = (): void => {
  const validation = validateConfig();

  if (!validation.valid) {
    logger.error("Configuration validation failed:", validation.errors);
    if (isProduction()) {
      throw new Error(`Configuration errors: ${validation.errors.join(", ")}`);
    }
  }

  logger.info("MedDef App Configuration Loaded");
  logger.info(`Environment: ${appConfig.app.environment}`);
  logger.info(`Server: ${appConfig.server.baseUrl}`);
  logger.info(`Laboratory: ${appConfig.laboratory.name}`);
  logger.debug("Full config:", appConfig);
};
