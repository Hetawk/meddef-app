# MedDef Environment Configuration Guide

## Overview

The MedDef app uses environment variables to manage sensitive configuration like server IPs, API keys, and deployment settings. This keeps secrets out of the source code and makes the app configurable across different environments.

## Setup Instructions

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Configure Your Settings

Edit `.env` with your actual values:

```env
# Your CI2P Laboratory VPS Server
CI2P_SERVER_HOST=31.97.41.230
CI2P_SERVER_PORT=8000
CI2P_SERVER_PROTOCOL=http

# Laboratory Information
LAB_NAME=CI2P Laboratory
INSTITUTION=School of Information Science and Engineering, University of Jinan
INSTITUTION_SHORT=University of Jinan

# App Settings
APP_ENVIRONMENT=development
DEBUG_MODE=true
```

### 3. Start Your Model Server

On your VPS (31.97.41.230):

```bash
cd /home/hetawk/models/2025/ci2p/meddef
python3 -m http.server 8000 --bind 0.0.0.0
```

### 4. Run the App

```bash
npm start
```

## Environment Variables Reference

### Server Configuration

| Variable               | Description              | Default             | Example           |
| ---------------------- | ------------------------ | ------------------- | ----------------- |
| `CI2P_SERVER_HOST`     | Your VPS IP address      | `31.97.41.230`      | `your.server.ip`  |
| `CI2P_SERVER_PORT`     | HTTP server port         | `8000`              | `8080`            |
| `CI2P_SERVER_PROTOCOL` | Protocol (http/https)    | `http`              | `https`           |
| `CI2P_MODEL_BASE_PATH` | Path to models on server | `/2025/ci2p/meddef` | `/path/to/models` |

### App Configuration

| Variable             | Description                          | Default       | Options                                |
| -------------------- | ------------------------------------ | ------------- | -------------------------------------- |
| `APP_ENVIRONMENT`    | Deployment environment               | `development` | `development`, `production`, `staging` |
| `DEBUG_MODE`         | Enable debug logging                 | `true`        | `true`, `false`                        |
| `ENABLE_MOCK_MODELS` | Use mock models instead of real ones | `false`       | `true`, `false`                        |
| `LOG_LEVEL`          | Logging verbosity                    | `info`        | `debug`, `info`, `warn`, `error`       |

### Laboratory Branding

| Variable            | Description            | Default                                                              |
| ------------------- | ---------------------- | -------------------------------------------------------------------- |
| `LAB_NAME`          | Laboratory name        | `CI2P Laboratory`                                                    |
| `INSTITUTION`       | Full institution name  | `School of Information Science and Engineering, University of Jinan` |
| `INSTITUTION_SHORT` | Short institution name | `University of Jinan`                                                |

### Download Settings

| Variable               | Description                             | Default |
| ---------------------- | --------------------------------------- | ------- |
| `MAX_DOWNLOAD_RETRIES` | Max retry attempts for failed downloads | `3`     |
| `DOWNLOAD_TIMEOUT_MS`  | Download timeout in milliseconds        | `30000` |
| `CACHE_EXPIRY_DAYS`    | Days to keep downloaded models          | `7`     |

## Security Features

### ✅ **Environment Variables**

- Sensitive data like IP addresses stored in `.env`
- `.env` file is gitignored - never committed to repository
- Different configurations for development/production

### ✅ **Configuration Validation**

- App validates required environment variables on startup
- Provides helpful error messages for missing configuration
- Prevents app from running with invalid settings in production

### ✅ **Development vs Production**

- Automatic HTTPS enforcement in production
- Debug logging only in development
- Mock model fallbacks for development without server access

## Usage in Code

### Import Configuration

```typescript
import { appConfig, getModelUrl, logger } from "./src/config/environment";
```

### Use Server Settings

```typescript
// Get dynamic model URL
const modelUrl = getModelUrl("roct", "meddef_roct.pth");
// Returns: http://31.97.41.230:8000/roct/meddef_roct.pth

// Access server info
console.log(appConfig.server.host); // 31.97.41.230
console.log(appConfig.server.baseUrl); // http://31.97.41.230:8000
```

### Use Laboratory Branding

```typescript
import { laboratoryInfo } from "./src/config/environment";

console.log(laboratoryInfo.name); // CI2P Laboratory
console.log(laboratoryInfo.institution); // School of Information Science and Engineering, University of Jinan
```

### Environment-Aware Logging

```typescript
import { logger } from "./src/config/environment";

logger.debug("Debug message"); // Only shows in development
logger.info("Info message"); // Shows in development/staging
logger.error("Error message"); // Always shows
```

## Different Environments

### Development (`.env`)

```env
APP_ENVIRONMENT=development
DEBUG_MODE=true
LOG_LEVEL=debug
CI2P_SERVER_PROTOCOL=http
ENABLE_MOCK_MODELS=false
```

### Production (`.env.production`)

```env
APP_ENVIRONMENT=production
DEBUG_MODE=false
LOG_LEVEL=error
CI2P_SERVER_PROTOCOL=https
REQUIRE_AUTH=true
```

### Testing (`.env.test`)

```env
APP_ENVIRONMENT=development
DEBUG_MODE=true
ENABLE_MOCK_MODELS=true
CI2P_SERVER_HOST=localhost
```

## Migration from Hardcoded Values

### Before (❌ Hardcoded)

```typescript
const serverUrl = "http://31.97.41.230:8000";
const labName = "CI2P Laboratory";
```

### After (✅ Environment-based)

```typescript
import { appConfig, laboratoryInfo } from "./config/environment";

const serverUrl = appConfig.server.baseUrl;
const labName = laboratoryInfo.name;
```

## Benefits

1. **🔒 Security**: Secrets not in source code
2. **🔧 Flexibility**: Easy to change settings without code changes
3. **🌍 Multi-environment**: Different configs for dev/staging/production
4. **👥 Team-friendly**: Each developer can have their own settings
5. **🚀 Deployment**: Production values separate from development

## Troubleshooting

### App Won't Start

- Check if `.env` file exists
- Verify all required variables are set
- Check for typos in variable names

### Models Won't Download

- Verify `CI2P_SERVER_HOST` is correct
- Check if server is running on specified port
- Test server access: `curl http://31.97.41.230:8000/roct/meddef_roct.pth`

### Wrong Laboratory Info

- Update `LAB_NAME`, `INSTITUTION` variables in `.env`
- Restart the app to reload configuration

---

**Your CI2P Laboratory MedDef app is now properly configured with environment variables! 🎯**
