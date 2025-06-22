# CI2P Laboratory VPS Setup Guide

## MedDef Model Server Configuration

### Quick Setup Instructions

#### 1. Start HTTP File Server on Your VPS (31.97.41.230)

SSH into your VPS and start the HTTP server:

```bash
# SSH into your VPS
ssh hetawk@31.97.41.230

# Navigate to models directory
cd /home/hetawk/models/2025/ci2p/meddef

# Start HTTP server with CORS support
python3 -c "
import http.server
import socketserver
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def log_message(self, format, *args):
        print(f'{self.address_string()} - {format % args}')

os.chdir('/home/hetawk/models/2025/ci2p/meddef')
with HTTPServer(('0.0.0.0', 8000), CORSRequestHandler) as httpd:
    print('📡 CI2P Model Server running on port 8000...')
    print('🔗 Models available at: http://31.97.41.230:8000/')
    print('📁 Serving from:', os.getcwd())
    httpd.serve_forever()
"
```

#### 2. Configure Firewall (if needed)

```bash
# Allow HTTP traffic on port 8000
sudo ufw allow 8000

# Check firewall status
sudo ufw status
```

#### 3. Test Model Access

From your local machine or the React Native app, test access:

```bash
# Test if server is running and models are accessible
curl -I http://31.97.41.230:8000/roct/meddef_roct.pth

# Should return HTTP 200 with file size in headers
# Example response:
# HTTP/1.0 200 OK
# Content-Length: 125829632
# Content-Type: application/octet-stream
```

#### 4. Test from React Native App

The app will now be able to:

1. **Start with embedded lite models** (15 MB total app size)
2. **Download full models on demand** from your CI2P server
3. **Display download progress** to users
4. **Cache models locally** after first download
5. **Switch between model variants** dynamically

### Model Variants Available

#### ROCT Dataset:

- ✅ **MedDef Lite** (15 MB) - Embedded in app
- 📥 **MedDef Full** (120 MB) - `meddef_roct.pth`
- 📥 **MedDef (No AFD)** (90 MB) - `meddef_no_afd_roct.pth`
- 📥 **MedDef (MSF Only)** (70 MB) - `meddef_no_afd_mfe_roct.pth`
- 📥 **MedDef Base** (50 MB) - `meddef_no_afd_mfe_msf_roct.pth`
- 📥 **ResNet-18 Baseline** (45 MB) - `resnet_18_rotc.pth`

#### Chest X-Ray Dataset:

- ✅ **MedDef Lite** (12 MB) - Embedded in app
- 📥 **MedDef Full** (120 MB) - `meddef_chest_xray.pth`
- 📥 **MedDef (No AFD)** (90 MB) - `meddef_no_afd_chest_xray.pth`
- 📥 **MedDef (MSF Only)** (70 MB) - `meddef_no_afd_mfe_chest_xray.pth`
- 📥 **MedDef Base** (50 MB) - `meddef1_no_afd_mfe_msf_chest_xray.pth`
- 📥 **ResNet-18 Baseline** (45 MB) - `resnet_18_chest_xray.pth`

### App Features Enabled

1. **Small App Size**: Only 27 MB total (15+12 MB for lite models)
2. **Progressive Enhancement**: Download better models as needed
3. **Research Reproducibility**: Access to all ablation study variants
4. **Offline Capability**: Cached models work without internet
5. **Live Model Switching**: Change models without app restart

### Production Deployment (Optional)

For production, consider using nginx for better performance:

```bash
# Install nginx
sudo apt update && sudo apt install nginx

# Create nginx config for model serving
sudo nano /etc/nginx/sites-available/meddef-models

# Add this configuration:
server {
    listen 8000;
    server_name 31.97.41.230;

    location / {
        root /home/hetawk/models/2025/ci2p/meddef;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers *;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/meddef-models /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Security Considerations

1. **HTTPS**: Consider setting up SSL certificates for production
2. **Authentication**: Add API keys if models should be private
3. **Rate Limiting**: Prevent abuse with nginx rate limiting
4. **Monitoring**: Set up logging and monitoring for downloads

### Troubleshooting

#### Server Not Accessible:

```bash
# Check if server is running
ss -tlnp | grep 8000

# Check firewall
sudo ufw status

# Check server logs
journalctl -f
```

#### Model Files Not Found:

```bash
# Verify file structure
cd /home/hetawk/models/2025/ci2p/meddef
tree -L 2

# Check file permissions
ls -la roct/
ls -la chest_xray/
```

#### CORS Issues:

- Make sure the Python server includes CORS headers
- Test with curl first before testing with the app

---

**Your CI2P MedDef model server is now ready! 🚀**

The React Native app can now download models on-demand, keeping the initial app size small while providing access to your complete research models.
