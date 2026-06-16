// voiceService.ts - Speech-to-Text & Text-to-Speech
import { speakText } from '@/utils/voiceUtils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getEdgeFunctionUrl(name: string): string {
  if (!supabaseUrl) {
    throw new Error(
      'VITE_SUPABASE_URL not configured.\n\n' +
      'To fix voice on Vercel:\n' +
      '1. Go to Vercel Dashboard → Project Settings → Environment Variables\n' +
      '2. Add VITE_SUPABASE_URL (from Supabase Dashboard → API)\n' +
      '3. Add VITE_SUPABASE_ANON_KEY\n' +
      '4. Redeploy the app\n\n' +
      'See VERCEL_VOICE_SETUP.md for full guide.'
    );
  }
  return `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/${name}`;
}

// ========== Speech-to-Text ==========

/** Transcribe audio using edge function (Whisper API) via direct fetch */
export async function transcribeAudio(audioBlob: Blob, language?: string): Promise<string> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase not configured for voice.\n\n' +
      'Fix: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel environment variables.\n' +
      'Full guide: VERCEL_VOICE_SETUP.md'
    );
  }

  const base64 = await blobToBase64(audioBlob);
  const url = getEdgeFunctionUrl('speech-to-text');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ audioBase64: base64, language, mimeType: audioBlob.type || 'audio/webm' }),
  });

  if (res.status === 404) {
    throw new Error(
      `Edge Function "speech-to-text" not found (HTTP 404).\n\n` +
      'Fix: Deploy the Edge Function to Supabase:\n' +
      'supabase functions deploy speech-to-text\n\n' +
      'Full guide: VERCEL_VOICE_SETUP.md'
    );
  }
  if (res.status === 500) {
    const errBody = await res.json().catch(() => ({}));
    if (errBody.error?.includes('INTEGRATIONS_API_KEY')) {
      throw new Error(
        'Server configuration error: INTEGRATIONS_API_KEY missing.\n\n' +
        'Fix: Add INTEGRATIONS_API_KEY secret in Supabase Dashboard → Functions → Secrets\n\n' +
        'Full guide: VERCEL_VOICE_SETUP.md'
      );
    }
  }
  if (!res.ok) {
    let errMsg = `Speech-to-text HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      errMsg = errBody.error || errBody.message || errMsg;
    } catch {
      errMsg = await res.text() || errMsg;
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  return data?.text ?? '';
}

// ========== Text-to-Speech ==========

/** Speak text using LemonFox TTS (heart voice). Re-export from voiceUtils. */
export { speakText };

/** Edge-function TTS fallback (LemonFox) — returns audio URL */
export async function edgeTTS(input: string, voice: string = 'heart'): Promise<string> {
  if (!supabaseUrl) {
    throw new Error(
      'VITE_SUPABASE_URL not configured.\n\n' +
      'Fix: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Vercel environment variables.\n' +
      'Full guide: VERCEL_VOICE_SETUP.md'
    );
  }
  const res = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/functions/v1/text-to-speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, voice, response_format: 'mp3' }),
  });

  if (res.status === 404) {
    throw new Error(
      `Edge Function "text-to-speech" not found (HTTP 404).\n\n` +
      'Fix: Deploy the Edge Function to Supabase:\n' +
      'supabase functions deploy text-to-speech\n\n' +
      'Full guide: VERCEL_VOICE_SETUP.md'
    );
  }
  if (res.status === 500) {
    const errBody = await res.json().catch(() => ({}));
    if (errBody.error?.includes('INTEGRATIONS_API_KEY')) {
      throw new Error(
        'Server configuration error: INTEGRATIONS_API_KEY missing.\n\n' +
        'Fix: Add INTEGRATIONS_API_KEY secret in Supabase Dashboard → Functions → Secrets\n\n' +
        'Full guide: VERCEL_VOICE_SETUP.md'
      );
    }
  }
  if (res.status === 429) {
    const err = await res.json();
    throw new Error(`Quota exhausted: ${err.message ?? res.statusText}`);
  }
  if (res.status === 402) {
    const err = await res.json();
    throw new Error(`Insufficient balance: ${err.message ?? res.statusText}`);
  }
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.audioUrl;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
