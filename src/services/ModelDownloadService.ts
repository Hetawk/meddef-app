/**
 * MedDef Model Download Service
 *
 * Handles downloading PyTorch models from CI2P Laboratory server
 * and converting them for mobile use
 *
 * CI2P Laboratory
 * School of Information Science and Engineering
 * University of Jinan
 */

import {
  getModelUrl,
  getModelInfo,
  HOSTINGER_MODEL_CONFIG,
} from "../config/hostingerModelConfig";
import {
  appConfig,
  getModelUrl as getEnvModelUrl,
  logger,
} from "../config/environment";
import { DatasetType } from "../types/meddef";

export interface DownloadProgress {
  progress: number; // 0-100
  downloaded: number; // bytes
  total: number; // bytes
  status: "downloading" | "converting" | "complete" | "error";
  message?: string;
}

export class ModelDownloadService {
  private downloadQueue: Map<string, Promise<string>> = new Map();
  private downloadProgress: Map<string, DownloadProgress> = new Map();

  /**
   * Check if model is available locally
   */
  async isModelCached(
    dataset: DatasetType,
    variantId: string
  ): Promise<boolean> {
    try {
      // Check if model exists in local storage/cache
      // For React Native, this would check AsyncStorage or file system
      const cacheKey = `${dataset}_${variantId}`;

      // TODO: Implement actual cache check
      // For now, return false to always download
      return false;
    } catch (error) {
      console.error("Cache check failed:", error);
      return false;
    }
  }

  /**
   * Download model from server with progress tracking
   */
  async downloadModel(
    dataset: DatasetType,
    variantId: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    const cacheKey = `${dataset}_${variantId}`;

    // Check if download is already in progress
    if (this.downloadQueue.has(cacheKey)) {
      return this.downloadQueue.get(cacheKey)!;
    }

    // Check if already cached
    if (await this.isModelCached(dataset, variantId)) {
      return this.getCachedModelPath(dataset, variantId);
    }

    const downloadPromise = this.performDownload(
      dataset,
      variantId,
      onProgress
    );
    this.downloadQueue.set(cacheKey, downloadPromise);

    try {
      const result = await downloadPromise;
      this.downloadQueue.delete(cacheKey);
      return result;
    } catch (error) {
      this.downloadQueue.delete(cacheKey);
      throw error;
    }
  }

  /**
   * Perform the actual download
   */
  private async performDownload(
    dataset: DatasetType,
    variantId: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    try {
      const modelUrl = getModelUrl(dataset, variantId);
      const modelInfo = getModelInfo(dataset, variantId);

      if (!modelInfo) {
        throw new Error(`Model info not found for ${dataset}/${variantId}`);
      }

      console.log(`📥 Starting download: ${modelInfo.displayName}`);
      console.log(`🔗 URL: ${modelUrl}`);

      // Update progress - starting download
      const progressUpdate: DownloadProgress = {
        progress: 0,
        downloaded: 0,
        total: 0,
        status: "downloading",
        message: `Downloading ${modelInfo.displayName}...`,
      };

      this.downloadProgress.set(`${dataset}_${variantId}`, progressUpdate);
      onProgress?.(progressUpdate);

      // Download the file
      const response = await fetch(modelUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = parseInt(
        response.headers.get("content-length") || "0"
      );
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      // Read the stream with progress tracking
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        // Update progress
        const progress =
          contentLength > 0 ? (receivedLength / contentLength) * 80 : 0; // Reserve 20% for conversion
        const progressUpdate: DownloadProgress = {
          progress,
          downloaded: receivedLength,
          total: contentLength,
          status: "downloading",
          message: `Downloaded ${this.formatBytes(
            receivedLength
          )} of ${this.formatBytes(contentLength)}`,
        };

        this.downloadProgress.set(`${dataset}_${variantId}`, progressUpdate);
        onProgress?.(progressUpdate);
      }

      // Combine chunks
      const completeArray = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        completeArray.set(chunk, position);
        position += chunk.length;
      }

      // Update progress - converting
      const convertProgress: DownloadProgress = {
        progress: 85,
        downloaded: receivedLength,
        total: contentLength,
        status: "converting",
        message: "Converting PyTorch model for mobile use...",
      };

      this.downloadProgress.set(`${dataset}_${variantId}`, convertProgress);
      onProgress?.(convertProgress);

      // Save to cache and convert for mobile use
      const localPath = await this.saveAndConvertModel(
        dataset,
        variantId,
        completeArray,
        modelInfo.filename
      );

      // Update progress - complete
      const completeProgress: DownloadProgress = {
        progress: 100,
        downloaded: receivedLength,
        total: contentLength,
        status: "complete",
        message: "Model ready for use",
      };

      this.downloadProgress.set(`${dataset}_${variantId}`, completeProgress);
      onProgress?.(completeProgress);

      console.log(`✅ Download complete: ${modelInfo.displayName}`);
      return localPath;
    } catch (error) {
      console.error("Download failed:", error);

      const errorProgress: DownloadProgress = {
        progress: 0,
        downloaded: 0,
        total: 0,
        status: "error",
        message: `Download failed: ${error}`,
      };

      this.downloadProgress.set(`${dataset}_${variantId}`, errorProgress);
      onProgress?.(errorProgress);

      throw error;
    }
  }

  /**
   * Save downloaded model and convert for mobile use
   */
  private async saveAndConvertModel(
    dataset: DatasetType,
    variantId: string,
    modelData: Uint8Array,
    filename: string
  ): Promise<string> {
    try {
      // For React Native, save to Documents directory or cache
      // This is a simplified implementation

      const cacheKey = `${dataset}_${variantId}`;
      const localPath = `models/${cacheKey}/${filename}`;

      // TODO: Implement actual file saving for React Native
      // Example using react-native-fs:
      // const documentsPath = RNFS.DocumentDirectoryPath;
      // const modelDir = `${documentsPath}/models/${cacheKey}`;
      // await RNFS.mkdir(modelDir);
      // await RNFS.writeFile(`${modelDir}/${filename}`, modelData, 'base64');

      // For now, simulate conversion delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(`💾 Model saved to: ${localPath}`);
      return localPath;
    } catch (error) {
      console.error("Model save/conversion failed:", error);
      throw new Error(`Failed to save model: ${error}`);
    }
  }

  /**
   * Get cached model path
   */
  private getCachedModelPath(dataset: DatasetType, variantId: string): string {
    const cacheKey = `${dataset}_${variantId}`;
    return `models/${cacheKey}/model.tflite`; // Converted mobile model
  }

  /**
   * Get download progress for a specific model
   */
  getDownloadProgress(
    dataset: DatasetType,
    variantId: string
  ): DownloadProgress | null {
    return this.downloadProgress.get(`${dataset}_${variantId}`) || null;
  }

  /**
   * Cancel ongoing download
   */
  cancelDownload(dataset: DatasetType, variantId: string): void {
    const cacheKey = `${dataset}_${variantId}`;
    this.downloadQueue.delete(cacheKey);
    this.downloadProgress.delete(cacheKey);
  }

  /**
   * Clear all cached models
   */
  async clearCache(): Promise<void> {
    try {
      // TODO: Implement cache clearing for React Native
      // Remove all files from models directory
      console.log("🗑️ Clearing model cache...");
      this.downloadProgress.clear();
      console.log("✅ Cache cleared");
    } catch (error) {
      console.error("Cache clear failed:", error);
      throw error;
    }
  }

  /**
   * Get total cache size
   */
  async getCacheSize(): Promise<string> {
    try {
      // TODO: Implement cache size calculation
      return "0 MB";
    } catch (error) {
      console.error("Cache size calculation failed:", error);
      return "Unknown";
    }
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Start HTTP server on your VPS (helper for setup instructions)
   */
  static getServerSetupInstructions(): string {
    return `
# Setup Instructions for CI2P Laboratory VPS (31.97.41.230)

## 1. Start HTTP File Server
On your VPS, navigate to the models directory and start a simple HTTP server:

\`\`\`bash
cd /home/hetawk/models/2025/ci2p/meddef
python3 -m http.server 8000 --bind 0.0.0.0
\`\`\`

## 2. Configure Firewall
Ensure port 8000 is open:

\`\`\`bash
sudo ufw allow 8000
\`\`\`

## 3. Test Access
From another machine, test access:

\`\`\`bash
curl -I http://31.97.41.230:8000/roct/meddef_roct.pth
\`\`\`

## 4. Production Setup (Optional)
For production, consider using nginx or a dedicated API:

\`\`\`bash
# Install nginx
sudo apt install nginx

# Configure to serve models from your directory
sudo nano /etc/nginx/sites-available/meddef-models
\`\`\`

## 5. Enable CORS (if needed)
For web access, ensure CORS headers are set:

\`\`\`python
# Use this Python server instead for CORS support
python3 -c "
import http.server
import socketserver
from http.server import HTTPServer, SimpleHTTPRequestHandler

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

with HTTPServer(('0.0.0.0', 8000), CORSRequestHandler) as httpd:
    print('Server running on port 8000...')
    httpd.serve_forever()
"
\`\`\`
`;
  }
}

// Export singleton instance
export const modelDownloadService = new ModelDownloadService();
