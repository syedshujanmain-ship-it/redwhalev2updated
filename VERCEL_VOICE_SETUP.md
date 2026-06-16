# Vercel Voice / Speech Setup Guide for Red Whale V2

## 🔊 Why Voice Doesn't Work on Vercel (And How to Fix It)

Voice features (Speech-to-Text, Text-to-Speech, Voice Talk) require **Supabase Edge Functions** to work. These run on Supabase's servers, NOT Vercel.

## ✅ Step-by-Step Fix

### Step 1: Connect Supabase Project

```bash
# Make sure your Supabase project is set up
# You need these environment variables in Vercel:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**How to get these:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Project Settings → API
4. Copy "URL" and "anon public" key
5. Add them to Vercel → Project Settings → Environment Variables

### Step 2: Deploy Edge Functions to Supabase

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the Edge Functions
supabase functions deploy speech-to-text
supabase functions deploy text-to-speech

# Verify deployment
supabase functions list
```

### Step 3: Set the INTEGRATIONS_API_KEY Secret

```bash
# This key is provided by the platform and is required for voice APIs
# Set it in Supabase Dashboard:
# 1. Go to https://supabase.com/dashboard/project/_/settings/functions
# 2. Click "New Secret"
# 3. Name: INTEGRATIONS_API_KEY
# 4. Value: (your platform-provided key)
# 5. Save and redeploy functions
```

### Step 4: Redeploy Vercel

After adding environment variables, redeploy:
```bash
# In Vercel Dashboard → Deployments → Redeploy
# Or push a new commit to trigger auto-deploy
```

## 🎤 How Voice Features Work

| Feature | How It Works | Requirements |
|---------|-------------|--------------|
| **Speech-to-Text** | Records audio → sends to Supabase Edge Function → Whisper API → returns text | Microphone permission, HTTPS, Supabase configured |
| **Text-to-Speech** | Sends text to Supabase Edge Function → LemonFox TTS → returns audio URL | Supabase configured |
| **Voice Talk** | Combines STT + Chat + TTS in a loop | All of the above + browser supports Web Audio |

## 🔐 HTTPS Requirement

**Microphone access requires HTTPS**. Vercel provides HTTPS automatically, so this is fine. But if testing locally, use:
```bash
npm run dev
# Opens on http://localhost:5173 (no mic on HTTP)
# For HTTPS local testing, use:
npx vite --host --https
```

## 📱 Mobile Browser Notes

- **iOS Safari**: Fully supported (WebKit Speech Recognition + Audio)
- **Android Chrome**: Fully supported
- **In-app browsers** (Instagram, Facebook): May block microphone
- **Solution**: Open in Safari/Chrome directly, not in-app browser

## 🛠️ Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Supabase not configured" | Missing env vars | Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Vercel |
| "HTTP 404" on voice | Edge Functions not deployed | Run `supabase functions deploy speech-to-text` |
| "Server configuration error" | Missing INTEGRATIONS_API_KEY | Add secret in Supabase Dashboard |
| Mic doesn't activate | Not HTTPS or permission denied | Ensure HTTPS, allow mic in browser |
| Audio plays but no sound | Browser autoplay policy | Click anywhere on page first to activate audio |
| iOS: no voice output | AudioContext suspended | Tap the screen once to resume AudioContext |

## 🧪 Test Voice on Vercel

1. Open your deployed app on Vercel (must be HTTPS)
2. Click the microphone icon in chat
3. Allow microphone when browser asks
4. Speak something
5. Text should appear in the chat input

## 📋 Full Setup Checklist

- [ ] Supabase project created and linked
- [ ] VITE_SUPABASE_URL added to Vercel env vars
- [ ] VITE_SUPABASE_ANON_KEY added to Vercel env vars
- [ ] Edge Functions deployed (`supabase functions deploy`)
- [ ] INTEGRATIONS_API_KEY secret set in Supabase
- [ ] App redeployed on Vercel after env var changes
- [ ] Tested on HTTPS (not HTTP)
- [ ] Microphone permission granted in browser
