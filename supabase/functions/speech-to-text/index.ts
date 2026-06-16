// supabase/functions/speech-to-text/index.ts - Whisper v3 Speech-to-Text
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, X-Customer-Auth",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  let audioBase64: string | undefined;
  let language: string | undefined;
  let mimeType: string = "audio/webm";

  try {
    const body = await req.json();
    audioBase64 = body.audioBase64;
    language = body.language;
    mimeType = body.mimeType || "audio/webm";
    if (!audioBase64) throw new Error("Missing audioBase64");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const apiKey = Deno.env.get("INTEGRATIONS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Convert base64 to binary blob
  const base64Data = audioBase64.split(",")[1] || audioBase64;
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Map MIME type to file extension for Whisper API
  const extMap: Record<string, string> = {
    "audio/webm": "webm",
    "audio/mp4": "mp4",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/x-m4a": "m4a",
  };
  const ext = extMap[mimeType] || "webm";

  const formData = new FormData();
  formData.append("file", new Blob([bytes], { type: mimeType }), `recording.${ext}`);
  if (language) formData.append("language", language);
  formData.append("response_format", "json");

  try {
    const upstream = await fetch(
      "https://app-9wmtpvxmtm9t-api-DY8MNQoqOnMa.gateway.appmedo.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          "X-Gateway-Authorization": `Bearer ${apiKey}`,
        },
        body: formData,
      }
    );

    if (upstream.status === 429 || upstream.status === 402) {
      const errText = await upstream.text();
      return new Response(errText, {
        status: upstream.status,
        headers: corsHeaders,
      });
    }

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream error: ${upstream.status}` }),
        { status: 502, headers: corsHeaders }
      );
    }

    const data = await upstream.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: `Transcription failed: ${e.message}` }),
      { status: 500, headers: corsHeaders }
    );
  }
});
