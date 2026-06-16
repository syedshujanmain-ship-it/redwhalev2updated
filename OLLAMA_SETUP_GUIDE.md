# Ollama Local API Setup Guide for Red Whale V2

## ⚠️ IMPORTANT: Browser Security Limitation

**Ollama runs on `localhost:11434`**. Due to browser security (CORS), a website hosted on Vercel **CANNOT directly access your local machine's localhost**. This is a browser security feature, NOT a bug.

## ✅ Solutions (Pick One)

### Solution 1: Run Red Whale Locally (Recommended for Ollama)

```bash
# 1. Install Ollama
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh
# Windows: Download from https://ollama.com/download

# 2. Start Ollama server
ollama serve

# 3. Pull a model
ollama pull llama3.2
ollama pull qwen2.5

# 4. Set CORS to allow your local app
export OLLAMA_ORIGINS="*"
ollama serve

# 5. Run Red Whale locally
cd redwhale-v2
npm install
npm run dev

# 6. Open http://localhost:5173
# Go to Settings → API Settings → Provider URL
# Enter: http://localhost:11434/v1
```

### Solution 2: Use ngrok Tunnel (Access Ollama from Vercel)

```bash
# 1. Install ngrok
# https://ngrok.com/download

# 2. Set Ollama CORS
export OLLAMA_ORIGINS="*"

# 3. Start Ollama
ollama serve

# 4. In another terminal, expose Ollama to internet
ngrok http 11434

# 5. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# 6. In Red Whale (on Vercel), go to Settings → API Settings
# 7. Enter: https://abc123.ngrok.io/v1
# 8. Add your API key (any random string works for Ollama)
```

**⚠️ Security Warning**: ngrok exposes your Ollama to the internet. Use with caution. Turn off when not needed.

### Solution 3: Run Ollama on a VPS/Cloud Server

```bash
# 1. Rent a cheap VPS (Hetzner, DigitalOcean, AWS, etc.)
# 2. SSH into your server

# 3. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 4. Start Ollama with public access (bind to 0.0.0.0)
OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS="*" ollama serve

# 5. Open firewall port 11434
sudo ufw allow 11434

# 6. In Red Whale settings, enter:
# http://YOUR_SERVER_IP:11434/v1
```

## 🔧 Ollama CORS Configuration

### macOS
```bash
launchctl setenv OLLAMA_ORIGINS "*"
ollama serve
```

### Linux
```bash
OLLAMA_ORIGINS="*" ollama serve
# Or permanent:
sudo systemctl edit ollama.service
# Add: Environment="OLLAMA_ORIGINS=*"
sudo systemctl restart ollama
```

### Windows (PowerShell Admin)
```powershell
$env:OLLAMA_ORIGINS="*"
ollama serve
# Or permanent via System Properties → Environment Variables
```

## 🧪 Test Ollama is Working

```bash
curl http://localhost:11434/api/tags
# Should list your downloaded models

curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello!"
}'
```

## 📋 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Failed to fetch` | Ollama not running | Run `ollama serve` |
| `CORS error` | Ollama rejecting browser | Set `OLLAMA_ORIGINS="*"` |
| `Connection refused` | Wrong port/IP | Use `127.0.0.1:11434` not `localhost` |
| `model not found` | Model not downloaded | Run `ollama pull <model>` |
| `403 Forbidden` | ngrok auth | Sign up at ngrok.com and add auth token |

## 🎯 Quick Start Checklist

- [ ] Install Ollama
- [ ] Start Ollama server (`ollama serve`)
- [ ] Pull at least one model (`ollama pull llama3.2`)
- [ ] Set CORS (`OLLAMA_ORIGINS="*"`)
- [ ] Test with curl
- [ ] Enter URL in Red Whale Settings → API Settings
- [ ] Add any API key (Ollama doesn't require a real key)
- [ ] Start chatting!
