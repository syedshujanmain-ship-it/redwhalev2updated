// supabase/functions/text-to-speech/index.ts - LemonFox TTS
// Returns audio as base64 data URL — no storage bucket needed
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

  let input: string;
  let voice: string;
  let responseFormat: string;
  let speed: number;

  try {
    const body = await req.json();
    input = body.input;
    voice = body.voice ?? "shimmer";
    responseFormat = body.response_format ?? "mp3";
    speed = typeof body.speed === "number" ? body.speed : 1.0;
    // Clamp speed to valid range
    if (speed < 0.25) speed = 0.25;
    if (speed > 4.0) speed = 4.0;
    if (!input) throw new Error("Missing input");
    // Cap input length to keep generation fast
    if (input.length > 4000) {
      input = input.slice(0, 4000) + "...";
    }
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

  try {
    const upstream = await fetch(
      "https://app-9wmtpvxmtm9t-api-GYX1lzGw01Xa.gateway.appmedo.com/v1/audio/speech",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Gateway-Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ input, voice, response_format: responseFormat, speed }),
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
      const errText = await upstream.text();
      return new Response(
        JSON.stringify({ error: `Upstream error ${upstream.status}: ${errText}` }),
        { status: 502, headers: corsHeaders }
      );
    }

    // Read audio bytes and convert to base64 (chunked to avoid stack overflow)
    const audioBuffer = await upstream.arrayBuffer();
    const bytes = new Uint8Array(audioBuffer);
    const CHUNK = 32768; // process 32KB at a time
    let binary = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK) as any);
    }
    const base64 = btoa(binary);
    const mimeType = upstream.headers.get("content-type") ?? "audio/mpeg";
    const audioUrl = `data:${mimeType};base64,${base64}`;

    return new Response(
      JSON.stringify({ audioUrl }),
      { status: 200, headers: corsHeaders }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: `TTS failed: ${e.message}` }),
      { status: 500, headers: corsHeaders }
    );
  }
});
