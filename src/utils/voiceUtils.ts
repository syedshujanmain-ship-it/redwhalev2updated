// voiceUtils.ts - RED WHALE V1 Human Voice Engine
// Uses LemonFox/OpenAI TTS via Supabase Edge Function.
// ALL browser / Google SpeechSynthesis code has been removed.

import { toast } from 'sonner';

let currentAudio: HTMLAudioElement | null = null;
let lastTtsUrl: string | null = null;
let lastTtsBlob: Blob | null = null;

export function getAudioProgress(): number {
  if (!currentAudio || !currentAudio.duration) return 0;
  return currentAudio.currentTime / currentAudio.duration;
}

export function getAudioDuration(): number {
  if (!currentAudio || !currentAudio.duration) return 0;
  return currentAudio.duration;
}

export function getAudioCurrentTime(): number {
  if (!currentAudio) return 0;
  return currentAudio.currentTime;
}

export function getLastTtsUrl(): string | null {
  return lastTtsUrl;
}

export async function downloadLastTts(filename = 'red-whale-voice.mp3'): Promise<void> {
  if (!lastTtsBlob && !lastTtsUrl) {
    toast.error('No voice recording available');
    return;
  }
  try {
    const blob = lastTtsBlob || (lastTtsUrl ? await (await fetch(lastTtsUrl)).blob() : null);
    if (!blob) {
      toast.error('Voice data not available');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast.success('Voice saved!');
  } catch {
    toast.error('Failed to download voice');
  }
}

// All known voices across OpenAI, LemonFox, and common TTS providers.
// The backend may not support all — fallback to 'shimmer' on failure.
export type TTSVoice =
  // Ultra — Best overall for Hindi, Hinglish & English (maps to shimmer)
  | 'ultra'
  // OpenAI (multilingual, supports Hindi natively)
  | 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'fable'
  | 'onyx' | 'nova' | 'sage' | 'shimmer' | 'verse' | 'sol'
  // LemonFox
  | 'bella' | 'heart' | 'adam'
  // Extended / commonly available in other providers
  | 'josh' | 'jessica' | 'matthew' | 'michael' | 'nicole'
  | 'ryan' | 'sarah' | 'arthur' | 'daniel' | 'lily'
  | 'thomas' | 'emma' | 'liam' | 'olivia'
  | 'amy' | 'clara' | 'dora' | 'antoni' | 'joshua' | 'dominic';

const DEFAULT_VOICE: TTSVoice = 'ultra';
const FALLBACK_VOICE: TTSVoice = 'shimmer';

function getEdgeFunctionUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) {
    console.error('[TTS] VITE_SUPABASE_URL missing');
    return '';
  }
  return `${url.replace(/\/+$/, '')}/functions/v1/text-to-speech`;
}

function getAnonKey(): string {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
}

export function getSavedVoice(): TTSVoice {
  try {
    const saved = localStorage.getItem('redwhale_tts_voice') as TTSVoice | null;
    const valid: TTSVoice[] = [
      'ultra', 'sol', 'shimmer', 'alloy', 'ash', 'ballad', 'coral', 'echo', 'fable',
      'onyx', 'nova', 'sage', 'verse',
      'bella', 'heart', 'adam',
      'josh', 'jessica', 'matthew', 'michael', 'nicole',
      'ryan', 'sarah', 'arthur', 'daniel', 'lily',
      'thomas', 'emma', 'liam', 'olivia',
    ];
    if (saved && valid.includes(saved)) return saved;
  } catch { /* ignore */ }
  return DEFAULT_VOICE;
}

export function setSavedVoice(voice: TTSVoice): void {
  try {
    localStorage.setItem('redwhale_tts_voice', voice);
  } catch { /* ignore */ }
}

// Speed control — 1.0 natural speech pace
const DEFAULT_SPEED = 1.0;

export function getSavedSpeed(): number {
  try {
    const saved = localStorage.getItem('redwhale_tts_speed');
    if (saved) {
      const n = parseFloat(saved);
      if (!isNaN(n) && n >= 0.5 && n <= 3.0) return n;
    }
  } catch { /* ignore */ }
  return DEFAULT_SPEED;
}

export function setSavedSpeed(speed: number): void {
  try {
    localStorage.setItem('redwhale_tts_speed', String(speed));
  } catch { /* ignore */ }
}

// ========== COMPREHENSIVE TTS TEXT CLEANUP ==========

export function stripEmojis(text: string): string {
  return text.replace(
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}]|[\u{2B06}]|[\u{2B07}]|[\u{2B05}]|[\u{27A1}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{2934}-\u{2935}]|[\u{25FB}-\u{25FE}]|[\u{3297}]|[\u{3299}]|[\u{3030}]|[\u{24C2}]|[\u{1F170}-\u{1F251}]|[\u{1F004}]|[\u{1F0CF}]|[\u{20E3}]/gu,
    ''
  );
}

export function prepareTextForTTS(text: string): string {
  let t = text;

  // 0. Unicode normalization + strip ALL invisible/zero-width chars that break TTS word formation
  t = t.normalize('NFC');
  // Remove: ZWNJ (\u200C), ZWJ (\u200D), ZWSP (\u200B), ZWNBSP (\uFEFF), soft hyphen (\u00AD),
  // MONGOLIAN vowel separator (\u180E), word joiner (\u2060), invisible plus (\u2064),
  // zero-width no-break space (\uFEFF), narrow no-break space (\u202F), no-break space (\u00A0),
  // hair space (\u200A), thin space (\u2009), figure space (\u2007), punctuation space (\u2008)
  t = t.replace(/[\u200B\u200C\u200D\uFEFF\u00AD\u180E\u2060\u2064\u00A0\u202F\u200A\u2009\u2007\u2008]/g, ' ');

  // Fix broken Devanagari conjuncts: ensure halant (्) is followed by a consonant
  // Remove orphaned halants that cause letter-by-letter reading
  t = t.replace(/[\u094D](?=\s|[\p{P}]|$)/gu, '');

  // Fix Devanagari vowel signs attached to wrong consonants
  // Ensure matras (ा, ि, ी, ु, ू, े, ै, ो, ौ) stay attached
  t = t.replace(/([\u0900-\u097F])(?=\1)/g, '$1');

  // Code blocks
  t = t.replace(/```[\s\S]*?```/g, ' ');
  t = t.replace(/`([^`]+)`/g, '$1');

  // Headers
  t = t.replace(/^#{1,6}\s+/gm, '');

  // Bold / italic
  t = t.replace(/\*\*(.+?)\*\*/g, '$1');
  t = t.replace(/\*(.+?)\*/g, '$1');
  t = t.replace(/__(.+?)__/g, '$1');
  t = t.replace(/_(.+?)_/g, '$1');

  // Bullets and numbers
  t = t.replace(/^[\s]*[•\-\*]\s+/gm, '');
  t = t.replace(/^\s*\d+\.\s+/gm, '');

  // Blockquotes
  t = t.replace(/^>\s?/gm, '');

  // Horizontal rules
  t = t.replace(/^(---+|===+|\*\*\*+)\s*$/gm, ' ');

  // Links
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Bare URLs
  t = t.replace(/https?:\/\/[^\s\)\]]+/g, '');

  // Emojis
  t = stripEmojis(t);

  // Formatting labels TTS shouldn't read (but preserve Devanagari)
  const labels = [
    'Bottom Line', 'Pro Tips', 'Hidden Gems', 'The Breakdown',
    'Why This Matters', 'The Logic', 'The Details', 'How It Works',
    'Materials', 'Ingredients', 'Requirements', 'Steps',
    'Final Check', 'Testing', 'Optional Ideas',
  ];
  for (const label of labels) {
    const re = new RegExp('\\b' + label + '\\b', 'gi');
    t = t.replace(re, '');
  }

  // Hashtags — TTS shouldn't read them
  t = t.replace(/#\w+/g, '');

  // Preserve Devanagari (Hindi script) — do NOT alter it
  // Only strip markdown symbols around Devanagari text
  t = t.replace(/([\u0900-\u097F]+)\*\*/g, '$1');
  t = t.replace(/\*\*([\u0900-\u097F]+)/g, '$1');

  // Table pipes
  t = t.replace(/\|/g, ' ');
  t = t.replace(/\n\s*[-:]+[-\s|:]*\n/g, '\n');

  // Replace ALL newlines with spaces — TTS pauses at line breaks
  t = t.replace(/\n/g, ' ');
  t = t.replace(/\s{2,}/g, ' ');

  // Fix Devanagari danda (।) to have space after for proper pause
  t = t.replace(/।/g, '। ');

  // Remove standalone punctuation that causes pauses
  t = t.replace(/\(\s*\)/g, '');
  t = t.replace(/\[\s*\]/g, '');

  // Remove stray markdown symbols inside text
  t = t.replace(/[~*_]{2,}/g, ' ');
  t = t.replace(/\b[-–—]{2,}\b/g, ' ');

  // Normalize multiple exclamation/question marks
  t = t.replace(/!{2,}/g, '!');
  t = t.replace(/\?{2,}/g, '?');

  return t.trim();
}

export function truncateForTTS(text: string, maxChars = 4000): string {
  if (text.length <= maxChars) return text;
  const truncated = text.slice(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQ = truncated.lastIndexOf('?');
  const lastEx = truncated.lastIndexOf('!');
  const lastBreak = Math.max(lastPeriod, lastQ, lastEx);
  if (lastBreak > maxChars * 0.7) {
    return truncated.slice(0, lastBreak + 1);
  }
  return truncated + '...';
}

// ========== MASSIVE HINGLISH → HINDI DICTIONARY ==========

const HINGLISH_MAP: Record<string, string> = {
  'hai': 'है',
  'nahi': 'नहीं',
  'nhi': 'नहीं',
  'nh': 'नहीं',
  'kya': 'क्या',
  'kaise': 'कैसे',
  'kyun': 'क्यों',
  'kyu': 'क्यों',
  'q': 'क्यों',
  'kaun': 'कौन',
  'kahan': 'कहाँ',
  'kab': 'कब',
  'kitna': 'कितना',
  'kitne': 'कितने',
  'kaunsa': 'कौनसा',
  'kaunsi': 'कौनसी',
  'kaunse': 'कौनसे',
  'acha': 'अच्छा',
  'achi': 'अच्छी',
  'ache': 'अच्छे',
  'accha': 'अच्छा',
  'theek': 'ठीक',
  'bura': 'बुरा',
  'buri': 'बुरी',
  'bure': 'बुरे',
  'bahut': 'बहुत',
  'zara': 'ज़रा',
  'thoda': 'थोड़ा',
  'thodi': 'थोड़ी',
  'thode': 'थोड़े',
  'bilkul': 'बिल्कुल',
  'haan': 'हाँ',
  'ji': 'जी',
  'sahi': 'सही',
  'galat': 'गलत',
  'saaf': 'साफ',
  'ganda': 'गंदा',
  'gandi': 'गंदी',
  'tez': 'तेज़',
  'dheema': 'धीमा',
  'sasta': 'सस्ता',
  'mahanga': 'महंगा',
  'kam': 'कम',
  'zyada': 'ज़्यादा',
  'jyaada': 'ज़्यादा',
  'mast': 'मस्त',
  'jhakaas': 'झकास',
  'bindaas': 'बिंदास',
  'khatarnak': 'खतरनाक',
  'solid': 'सॉलिड',
  'bekar': 'बेकार',
  'mushkil': 'मुश्किल',
  'asaan': 'आसान',
  'aasan': 'आसान',
  'asli': 'असली',
  'nakli': 'नकली',
  'sach': 'सच',
  'jhoot': 'झूठ',
  'badiya': 'बढ़िया',
  'bekaar': 'बेकार',
  'badhiya': 'बढ़िया',
  'mazedar': 'मज़ेदार',
  'khas': 'खास',
  'alag': 'अलग',
  'bhai': 'भाई',
  'behen': 'बहन',
  'dost': 'दोस्त',
  'yaar': 'यार',
  'pyaar': 'प्यार',
  'dil': 'दिल',
  'maa': 'माँ',
  'papa': 'पापा',
  'beta': 'बेटा',
  'beti': 'बेटी',
  'ladka': 'लड़का',
  'ladki': 'लड़की',
  'aadmii': 'आदमी',
  'aurat': 'औरत',
  'bachcha': 'बच्चा',
  'budha': 'बूढ़ा',
  'jawaan': 'जवान',
  'dostana': 'दोस्ताना',
  'dushman': 'दुश्मन',
  'mehman': 'मेहमान',
  'parivar': 'परिवार',
  'khushi': 'खुशी',
  'gham': 'गम',
  'maza': 'मज़ा',
  'masti': 'मस्ती',
  'dard': 'दर्द',
  'sukoon': 'सुकून',
  'ishq': 'इश्क',
  'mohabbat': 'मोहब्बत',
  'nafrat': 'नफ़रत',
  'pasand': 'पसंद',
  'ladai': 'लड़ाई',
  'jhagda': 'झगड़ा',
  'neend': 'नींद',
  'chain': 'चैन',
  'ghussa': 'गुस्सा',
  'gussa': 'गुस्सा',
  'dar': 'डर',
  'himmat': 'हिम्मत',
  'sharam': 'शर्म',
  'shukriya': 'शुक्रिया',
  'dhanyavaad': 'धन्यवाद',
  'namaste': 'नमस्ते',
  'alvida': 'अलविदा',
  'subah': 'सुबह',
  'sham': 'शाम',
  'raat': 'रात',
  'din': 'दिन',
  'saal': 'साल',
  'mahina': 'महीना',
  'hafta': 'हफ्ता',
  'chalo': 'चलो',
  'rukho': 'रुको',
  'ruk': 'रुक',
  'dekho': 'देखो',
  'sunno': 'सुनो',
  'samjho': 'समझो',
  'bolo': 'बोलो',
  'karo': 'करो',
  'jao': 'जाओ',
  'aao': 'आओ',
  'mat': 'मत',
  'kar': 'कर',
  'de': 'दे',
  'lena': 'लेना',
  'dena': 'देना',
  'aana': 'आना',
  'jaana': 'जाना',
  'paana': 'पाना',
  'sona': 'सोना',
  'rona': 'रोना',
  'hasna': 'हंसना',
  'nachna': 'नाचना',
  'gana': 'गाना',
  'khana': 'खाना',
  'peena': 'पीना',
  'banna': 'बनना',
  'milna': 'मिलना',
  'dikhna': 'दिखना',
  'lagna': 'लगना',
  'hona': 'होना',
  'mera': 'मेरा',
  'meri': 'मेरी',
  'mere': 'मेरे',
  'tera': 'तेरा',
  'teri': 'तेरी',
  'tere': 'तेरे',
  'uska': 'उसका',
  'uski': 'उसकी',
  'uske': 'उसके',
  'iska': 'इसका',
  'iski': 'इसकी',
  'iske': 'इसके',
  'hamara': 'हमारा',
  'hamari': 'हमारी',
  'hamare': 'हमारे',
  'tumhara': 'तुम्हारा',
  'tumhari': 'तुम्हारी',
  'tumhare': 'तुम्हारे',
  'yeh': 'ये',
  'woh': 'वो',
  'yahan': 'यहाँ',
  'wahan': 'वहाँ',
  'idhar': 'इधर',
  'udhar': 'उधर',
  'kahi': 'कहीं',
  'tum': 'तुम',
  'aap': 'आप',
  'main': 'मैं',
  'hum': 'हम',
  'tu': 'तू',
  'tujhe': 'तुझे',
  'mujhe': 'मुझे',
  'usse': 'उससे',
  'unse': 'उनसे',
  'isne': 'इसने',
  'usne': 'उसने',
  'tumne': 'तुमने',
  'aapne': 'आपने',
  'maine': 'मैंने',
  'unhone': 'उन्होंने',
  'inhone': 'इन्होंने',
  'sabne': 'सबने',
  'kisi': 'किसी',
  'kisne': 'किसने',
  'jinhe': 'जिन्हें',
  'jinhone': 'जिन्होंने',
  'jisko': 'जिसको',
  'jiske': 'जिसके',
  'kisko': 'किसको',
  'kiske': 'किसके',
  'abhi': 'अभी',
  'baad': 'बाद',
  'pehle': 'पहले',
  'aaj': 'आज',
  'kal': 'कल',
  'parso': 'परसों',
  'roz': 'रोज़',
  'hamesha': 'हमेशा',
  'kabhi': 'कभी',
  'zaroor': 'ज़रूर',
  'shayad': 'शायद',
  'tak': 'तक',
  'jab': 'जब',
  'tab': 'तब',
  'lekin': 'लेकिन',
  'magar': 'मगर',
  'par': 'पर',
  'aur': 'और',
  'ya': 'या',
  'toh': 'तो',
  'bhi': 'भी',
  'hi': 'ही',
  'na': 'ना',
  'mein': 'में',
  'se': 'से',
  'ko': 'को',
  'ke': 'के',
  'ki': 'की',
  'ka': 'का',
  'ne': 'ने',
  'kyunki': 'क्योंकि',
  'kisliye': 'किसलिए',
  'jisliye': 'जिसलिए',
  'hoga': 'होगा',
  'hogi': 'होगी',
  'honge': 'होंगे',
  'tha': 'था',
  'thi': 'थी',
  'the': 'थे',
  'raha': 'रहा',
  'rahi': 'रही',
  'rahe': 'रहे',
  'gaya': 'गया',
  'gayi': 'गयी',
  'gaye': 'गये',
  'aaya': 'आया',
  'aayi': 'आयी',
  'aaye': 'आये',
  'dekha': 'देखा',
  'dekhi': 'देखी',
  'dekhe': 'देखे',
  'liya': 'लिया',
  'liye': 'लिये',
  'diya': 'दिया',
  'diye': 'दिये',
  'piya': 'पिया',
  'piye': 'पिये',
  'suna': 'सुना',
  'suni': 'सुनी',
  'sune': 'सुने',
  'mil': 'मिल',
  'milgaya': 'मिलगया',
  'milgayi': 'मिलगयी',
  'karna': 'करना',
  'karni': 'करनी',
  'karne': 'करने',
  'karunga': 'करूँगा',
  'karungi': 'करूँगी',
  'karoge': 'करोगे',
  'karungaa': 'करूँगा',
  'karega': 'करेगा',
  'karegi': 'करेगी',
  'karenge': 'करेंगे',
  'karta': 'करता',
  'karti': 'करती',
  'karte': 'करते',
  'kiya': 'किया',
  'kari': 'करी',
  'kiye': 'किये',
  'hogaya': 'होगया',
  'hogayi': 'होगयी',
  'hogaye': 'होगये',
  'chahiye': 'चाहिए',
  'chahata': 'चाहता',
  'chahati': 'चाहती',
  'chahte': 'चाहते',
  'chahie': 'चाहिए',
  'zindagi': 'ज़िंदगी',
  'duniya': 'दुनिया',
  'waqt': 'वक्त',
  'sapna': 'सपना',
  'scene': 'सीन',
  'mood': 'मूड',
  'vibe': 'वाइब',
  'swag': 'स्वैग',
  'nalla': 'नल्ला',
  'chapri': 'छापरी',
  'sakht': 'सख्त',
  'bawaal': 'बवाल',
  'jugaad': 'जुगाड़',
  'desi': 'देसी',
  'videsi': 'विदेसी',
  'mehnat': 'मेहनत',
  'kamyabi': 'कामयाबी',
  'nakami': 'नाकामी',
  'safal': 'सफल',
  'asafal': 'असफल',
  'cool': 'कूल',
  'lit': 'लिट',
  'fire': 'फायर',
  'dope': 'डोप',
  'sab': 'सब',
  'koi': 'कोई',
  'kuch': 'कुछ',
  'har': 'हर',
  'dusra': 'दूसरा',
  'dusri': 'दूसरी',
  'dusre': 'दूसरे',
  'pehla': 'पहला',
  'pehli': 'पहली',
  'akhiri': 'आखिरी',
  'akhir': 'आखिर',
  'tareef': 'तारीफ',
  'taarif': 'तारीफ',
  'badnami': 'बदनामी',
  'izzat': 'इज़्ज़त',
  'beizzati': 'बेइज्जती',
  'muhabbat': 'मोहब्बत',
  'pyaarmuhabbat': 'प्यारमोहब्बत',
  'khayal': 'खयाल',
  'soch': 'सोच',
  'fikar': 'फिक्र',
  'waada': 'वादा',
  'jhoota': 'झूठा',
  'sacha': 'सच्चा',
  'kismat': 'किस्मत',
  'naseeb': 'नसीब',
  'taqdeer': 'तक़दीर',
  'hosh': 'होश',
  'behosh': 'बेहोश',
  'hoshiyaar': 'होशियार',
  'dimaag': 'दिमाग',
  'dimag': 'दिमाग',
  'dimaagkharab': 'दिमागखराब',
  'pagal': 'पागल',
  'paagal': 'पागल',
  'chutiya': 'चूतिया',
  'bewakoof': 'बेवकूफ',
  'bewkuf': 'बेवकूफ',
  'samajhdaar': 'समझदार',
  'budhhu': 'बुद्धू',
  'ek': 'एक',
  'do': 'दो',
  'teen': 'तीन',
  'chaar': 'चार',
  'paanch': 'पाँच',
  'chhe': 'छह',
  'saat': 'सात',
  'aath': 'आठ',
  'nau': 'नौ',
  'das': 'दस',
  'thora': 'थोड़ा',
  'paani': 'पानी',
  'roti': 'रोटी',
  'sabzi': 'सब्ज़ी',
  'daal': 'दाल',
  'chaawal': 'चावल',
  'chawal': 'चावल',
  'doodh': 'दूध',
  'chai': 'चाय',
  'namak': 'नमक',
  'cheeni': 'चीनी',
  'mirchi': 'मिर्ची',
  'taza': 'ताज़ा',
  'purana': 'पुराना',
  'nayaa': 'नया',
  'aankh': 'आंख',
  'kaan': 'कान',
  'naak': 'नाक',
  'munh': 'मुँह',
  'haath': 'हाथ',
  'paer': 'पैर',
  'paair': 'पैर',
  'sir': 'सर',
  'pet': 'पेट',
  'ghar': 'घर',
  'school': 'स्कूल',
  'college': 'कॉलेज',
  'dakan': 'दुकान',
  'bazaar': 'बाज़ार',
  'sadak': 'सड़क',
  'gaaon': 'गाँव',
  'sheher': 'शहर',
  'upar': 'ऊपर',
  'neeche': 'नीचे',
  'aage': 'आगे',
  'peeche': 'पीछे',
  'daaya': 'दायाँ',
  'baaya': 'बायाँ',
  'beech': 'बीच',
  'saamne': 'सामने',
  'kaam': 'काम',
  'paisa': 'पैसा',
  'paise': 'पैसे',
  'rupaye': 'रुपये',
  'naukri': 'नौकरी',
  'business': 'बिज़नेस',
  'sarkaar': 'सरकार',
  'police': 'पुलिस',
  'doctor': 'डॉक्टर',
  'vakeel': 'वकील',
  'laal': 'लाल',
  'neela': 'नीला',
  'hara': 'हरा',
  'peela': 'पीला',
  'kaala': 'काला',
  'safed': 'सफ़ेद',
  'bhura': 'भूरा',
  'kaisa': 'कैसा',
  'taisa': 'तैसा',
  'waisa': 'वैसा',
  'waisi': 'वैसी',
  'waise': 'वैसे',
  'sabse': 'सबसे',
  'bilqul': 'बिल्कुल',
  'zyadatar': 'ज़्यादातर',
  'khaastaurpar': 'खासतौरपर',
  'aam': 'आम',
  'shuru': 'शुरू',
  'khatam': 'खत्म',
  'khatm': 'खत्म',
  'dukh': 'दुख',
  'sukh': 'सुख',
  'darr': 'डर',
  'takleef': 'तकलीफ',
  'pareshani': 'परेशानी',
  'musibat': 'मुसीबत',
  'madad': 'मदद',
  'sahayata': 'सहायता',
  'madat': 'मदद',
  'fuddu': 'फुद्दू',
  'nalle': 'नाल्ले',
  'faltu': 'फालतू',
  'dhokebaaz': 'धोखेबाज़',
  'yaad': 'याद',
  'bhool': 'भूल',
  'bhol': 'भोल',
  'sawal': 'सवाल',
  'jawab': 'जवाब',
  'ilaj': 'इलाज',
  'khabar': 'खबर',
  'akhbaar': 'अख़बार',
  'tv': 'टीवी',
  'phone': 'फ़ोन',
  'computer': 'कंप्यूटर',
  'internet': 'इंटरनेट',
  'gadi': 'गाड़ी',
  'bike': 'बाइक',
  'bus': 'बस',
  'desh': 'देश',
  'zameen': 'ज़मीन',
  'aasmaan': 'आसमान',
  'taare': 'तारे',
  'chanda': 'चंदा',
  'mitti': 'मिट्टी',
  'pattar': 'पत्थर',
  'lakdi': 'लकड़ी',
  'phool': 'फूल',
  'ped': 'पेड़',
  'jhadi': 'झाड़ी',
  'makhi': 'मक्खी',
  'machhar': 'मच्छर',
  'chooha': 'चूहा',
  'kutta': 'कुत्ता',
  'billi': 'बिल्ली',
  'bandar': 'बंदर',
  'hathi': 'हाथी',
  'sher': 'शेर',
  'cheetah': 'चीता',
  'jungle': 'जंगल',
  'nadi': 'नदी',
  'samandar': 'समंदर',
  'pahaad': 'पहाड़',
  'dariya': 'दरिया',
  'jheel': 'झील',
  'mausam': 'मौसम',
  'thand': 'ठंड',
  'garmi': 'गर्मी',
  'baarish': 'बारिश',
  'bijli': 'बिजली',
  'badal': 'बादल',
  'dhup': 'धूप',
  'hawa': 'हवा',
  'rasta': 'रास्ता',
  'mod': 'मोड़',
  'seedha': 'सीधा',
  'ulta': 'उल्टा',
  'sachmuch': 'सचमुच',
  'waakai': 'वाकई',
  'jhooth': 'झूठ',
  'badmash': 'बदमाश',
  'shareef': 'शरीफ़',
  'bechara': 'बेचारा',
  'chatur': 'चतुर',
  'bhole': 'भोले',
  'kamina': 'कमीना',
  'darpok': 'डरपोक',
  'bahadur': 'बहादुर',
  'mehnati': 'मेहनती',
  'kaamchor': 'कामचोर',
  'besharam': 'बेशर्म',
  'sharmila': 'शर्मीला',
  'chichora': 'चिचोरा',
  'bhola': 'भोला',
  'swarg': 'स्वर्ग',
  'narak': 'नरक',
  'jannat': 'जन्नत',
  'dozakh': 'दोज़ख',
  'dua': 'दुआ',
  'prarthna': 'प्रार्थना',
  'mandir': 'मंदिर',
  'masjid': 'मस्जिद',
  'gurudwara': 'गुरुद्वारा',
  'church': 'चर्च',
  'mazaar': 'मज़ार',
  'kabar': 'कब्र',
  'shadi': 'शादी',
  'barbaadi': 'बर्बादी',
  'talaak': 'तलाक',
  'hasi': 'हंसी',
  'ansu': 'आँसू',
  'muskaan': 'मुस्कान',
  'aansoo': 'आँसू',
  'hansi': 'हँसी',
  'maut': 'मौत',
  'jeena': 'जीना',
  'marna': 'मरना',
  'jeet': 'जीत',
  'haar': 'हार',
  'nakamyabi': 'नाकामयाबी',
  'safalta': 'सफलता',
  'asafalta': 'असफलता',
  'lagan': 'लगन',
  'hausla': 'हौसला',
  'jazba': 'जज़्बा',
  'junoon': 'जुनून',
  'josh': 'जोश',
  'harqat': 'हरकत',
  'chup': 'चुप',
  'shor': 'शोर',
  'khamoshi': 'खामोशी',
  'shanti': 'शांति',
  'hinsa': 'हिंसा',
  'ahinsa': 'अहिंसा',
  'satya': 'सत्य',
  'asatya': 'असत्य',
  'nayay': 'न्याय',
  'anyay': 'अन्याय',
  'satyagrah': 'सत्याग्रह',
  'swaraj': 'स्वराज',
  'azadi': 'आज़ादी',
  'gulaami': 'गुलामी',
  'insaaf': 'इंसाफ़',
  'beinsafi': 'बेइंसाफ़ी',
  'imaandaari': 'ईमानदारी',
  'beimaani': 'बेईमानी',
  'wafaadaari': 'वफ़ादारी',
  'bewafai': 'बेवफ़ाई',
  'sachai': 'सचाई',
  'jhoothai': 'झूठाई',
  'bhalai': 'भलाई',
  'burai': 'बुराई',
  'neki': 'नेकी',
  'badi': 'बदी',
  'paap': 'पाप',
  'punya': 'पुण्य',
  'karma': 'कर्म',
  'bhagya': 'भाग्य',
  'muqaddar': 'मुक़द्दर',
  'manzil': 'मंज़िल',
  'safar': 'सफ़र',
  'mushafir': 'मुसाफ़िर',
  'kaarwaan': 'कारवां',
  'akela': 'अकेला',
  'tanha': 'तन्हा',
  'viraan': 'वीरान',
  'bheed': 'भीड़',
  'tanhai': 'तन्हाई',
  'yaadgaar': 'यादगार',
  'bhoolbhulaiya': 'भूलभुलैया',
  'bawandar': 'बवंडर',
  'tufaan': 'तूफ़ान',
  'toofan': 'तूफ़ान',
  'aandhi': 'आंधी',
  'bhookamp': 'भूकंप',
  'tsunami': 'सुनामी',
  'sailaab': 'सैलाब',
  'zila': 'ज़िला',
  'tehsil': 'तहसील',
  'panchayat': 'पंचायत',
  'sarkar': 'सरकार',
  'vidhaan': 'विधान',
  'kanoon': 'कानून',
  'adalat': 'अदालत',
  'vakil': 'वकील',
  'muqadma': 'मुक़दमा',
  'saza': 'सज़ा',
  'begl': 'बेगुनाह',
  'gunahgaar': 'गुनहगार',
  'chor': 'चोर',
  'daku': 'डाकू',
  'qatil': 'क़ातिल',
  'looter': 'लुटेरा',
  'dhandha': 'धंधा',
  'rojgaar': 'रोज़गार',
  'tankhwa': 'तनख़्वाह',
  'pagar': 'पगार',
  'daan': 'दान',
  'daanv': 'दाँव',
  'satta': 'सट्टा',
  'jua': 'जुआ',
  'sharaab': 'शराब',
  'cigarette': 'सिगरेट',
  'nashe': 'नशे',
  'nasha': 'नशा',
  'jhalli': 'झल्ली',
  'akalmand': 'अकलमंद',
  'bewaqoof': 'बेवकूफ़',
  'ullu': 'उल्लू',
  'jhalla': 'झल्ला',
  'jhant': 'झांट',
  'bhosadike': 'भोसड़ीके',
  'madarchod': 'मादरचोद',
  'behenchod': 'बहनचोद',
  'bhenchod': 'बहनचोद',
  'chutiye': 'चूतिए',
  'gaandu': 'गांडू',
  'randi': 'रंडी',
  'harami': 'हरामी',
  'kuttiya': 'कुत्तिया',
  'suar': 'सुअर',
  'kutte': 'कुत्ते',
  'gadha': 'गधा',
  'bakri': 'बकरी',
  'gaay': 'गाय',
  'bhains': 'भैंस',
  'bail': 'बैल',
  'ghoda': 'घोड़ा',
  'ghodi': 'घोड़ी',
  'khargosh': 'खरगोश',
  'kauva': 'कौवा',
  'tota': 'तोता',
  'mor': 'मोर',
  'batakh': 'बतख',
  'kukur': 'कुकुर',
  'bhaunra': 'भौंरा',
  'titli': 'तितली',
  'machli': 'मछली',
  'saamp': 'साँप',
  'chhipkali': 'छिपकली',
  'mendhak': 'मेंढक',
  'kachhua': 'कछुआ',
  'goh': 'गोह',
  'chinti': 'चींटी',
  'makdi': 'मकड़ी',
  'chimti': 'चिमटी',
  'til': 'तिल',
  'chini': 'चीनी',
  'mirch': 'मिर्च',
  'haldi': 'हल्दी',
  'dhaniya': 'धनिया',
  'jeera': 'जीरा',
  'lahsuni': 'लहसुनी',
  'adrak': 'अदरक',
  'pyaaz': 'प्याज',
  'tamatar': 'टमाटर',
  'aloo': 'आलू',
  'gobhi': 'गोभी',
  'palak': 'पालक',
  'methi': 'मेथी',
  'shimla': 'शिमला',
  'karela': 'करेला',
  'bhindi': 'भिंडी',
  'baingan': 'बैंगन',
  'muli': 'मूली',
  'gaajar': 'गाजर',
  'mooli': 'मूली',
  'shalgam': 'शलगम',
  'matar': 'मटर',
  'rajma': 'राजमा',
  'chana': 'चना',
  'moong': 'मूंग',
  'masoor': 'मसूर',
  'urad': 'उड़द',
  'toor': 'तूर',
  'salad': 'सलाद',
  'raita': 'रायता',
  'dahi': 'दही',
  'lassi': 'लस्सी',
  'chaach': 'छाछ',
  'sharbat': 'शर्बत',
  'coffee': 'कॉफ़ी',
  'shikanji': 'शिकंजी',
  'aamras': 'आमरस',
  'thandai': 'ठंडाई',
  'gulab': 'गुलाब',
  'kewda': 'केwड़ा',
  'ittar': 'इत्तर',
  'mehndi': 'मेहँदी',
  'sindoor': 'सिंदूर',
  'bangles': 'चूड़ी',
  'jhumka': 'झुमका',
  'nath': 'नथ',
  'maang': 'माँग',
  'bindi': 'बिंदी',
  'sari': 'साड़ी',
  'salwar': 'सलवार',
  'kameez': 'कमीज़',
  'kurta': 'कुर्ता',
  'pajama': 'पाजामा',
  'dhoti': 'धोती',
  'turban': 'पगड़ी',
  'topi': 'टोपी',
  'joota': 'जूता',
  'chappal': 'चप्पल',
  'sandals': 'सैंडल',
  'ghadi': 'घड़ी',
  'aaina': 'आईना',
  'kanghi': 'कंघी',
  'surma': 'सुरमा',
  'kaajal': 'काजल',
  'lipstick': 'लिपस्टिक',
  'nailpolish': 'नेलपॉलिश',
  'cream': 'क्रीम',
  'tel': 'तेल',
  'sabun': 'साबुन',
  'shampoo': 'शैम्पू',
  'paste': 'पेस्ट',
  'brush': 'ब्रश',
  'towel': 'तौलिया',
  'bartan': 'बर्तन',
  'kadhai': 'कड़ाही',
  'tawa': 'तवा',
  'patili': 'पतीली',
  'bhagona': 'भगोना',
  'chaanni': 'छन्नी',
  'belan': 'बेलन',
  'chakla': 'चकला',
  'silbatta': 'सिलबट्टा',
  'hamamdasta': 'हमामदस्ता',
  'jhaadu': 'झाड़ू',
  'poccha': 'पोछा',
  'kainchi': 'कैंची',
  'chhuri': 'छुरी',
  'chaku': 'चाकू',
  'kulhadi': 'कुल्हाड़ी',
  'gainti': 'गैंती',
  'belcha': 'बेलचा',
  'favda': 'फावड़ा',
  'kassi': 'कस्सी',
  'panja': 'पंजा',
  'suie': 'सुई',
  'dhaaga': 'धागा',
  'button': 'बटन',
  'zip': 'ज़िप',
  'hook': 'हुक',
  'tala': 'ताला',
  'chaabi': 'चाबी',
  'bati': 'बत्ती',
  'mombatti': 'मोमबत्ती',
  'lalten': 'लालटेन',
  'torch': 'टॉर्च',
  'batti': 'बत्ती',
  'switch': 'स्विच',
  'plug': 'प्लग',
  'wire': 'वायर',
  'taar': 'तार',
  'motor': 'मोटर',
  'pankha': 'पंखा',
  'cooler': 'कूलर',
  'ac': 'एसी',
  'heater': 'हीटर',
  'fridge': 'फ्रिज',
  'washing': 'वॉशिंग',
  'machine': 'मशीन',
  'geyser': 'गीज़र',
  'mixer': 'मिक्सर',
  'grinder': 'ग्राइंडर',
  'juicer': 'जूसर',
  'oven': 'ओवन',
  'microwave': 'माइक्रोवेव',
  'toaster': 'टोस्टर',
  'kettle': 'केटल',
  'sandwich': 'सैंडविच',
  'maker': 'मेकर',
  'iron': 'इस्त्री',
  'press': 'प्रेस',
  'vacuum': 'वैक्यूम',
  'cleaner': 'क्लीनर',
  'sofa': 'सोफ़ा',
  'table': 'टेबल',
  'chair': 'कुर्सी',
  'takhat': 'तख़्त',
  'palki': 'पालकी',
  'diwaan': 'दीवान',
  'takiya': 'तकिया',
  'gadda': 'गद्दा',
  'chaadar': 'चादर',
  'razai': 'रज़ाई',
  'jaalidar': 'जालीदार',
  'parda': 'पर्दा',
  'safa': 'सफ़ा',
  'malmal': 'मलमल',
  'resam': 'रेशम',
  'kaagaz': 'कागज़',
  'qalam': 'क़लम',
  'siyahi': 'सियाही',
  'ink': 'इंक',
  'pencil': 'पेंसिल',
  'rubber': 'रबर',
  'sharpener': 'शार्पनर',
  'scale': 'स्केल',
  'compass': 'कंपास',
  'dibba': 'डिब्बा',
  'thaali': 'थाली',
  'glass': 'गिलास',
  'lotaa': 'लोटा',
  'matka': 'मटका',
  'ghara': 'घड़ा',
  'surahi': 'सुराही',
  'katori': 'कटोरी',
  'chammach': 'चम्मच',
  'chhata': 'छाता',
  'topri': 'टोपरी',
  'jholaa': 'झोला',
  'basta': 'बस्ता',
  'potli': 'पोटली',
  'thela': 'ठेला',
  'rassi': 'रस्सी',
  'taant': 'तंत',
  'kapaas': 'कपास',
  'jute': 'जूट',
  'suti': 'सूती',
  'naylon': 'नायलॉन',
  'cheent': 'चींट',
  'factory': 'फ़ैक्टरी',
  'mill': 'मिल',
  'company': 'कंपनी',
  'dukaan': 'दुकान',
  'hotel': 'होटल',
  'restaurant': 'रेस्टोरेंट',
  'dhaba': 'ढाबा',
  'theka': 'ठेका',
  'adda': 'अड्डा',
  'chowk': 'चौक',
  // More modern / social Hinglish
  'ok': 'ओके',
  'nice': 'नाइस',
  'bro': 'भाई',
  'bhaiya': 'भैया',
  'hn': 'हाँ',
  'hnn': 'हाँ',
  'hmm': 'हम्म',
  'hmmm': 'हम्म',
  'bs': 'बस',
  'bss': 'बस',
  'bas': 'बस',
  'maam': 'मैम',
  'madam': 'मैडम',
  'janab': 'जनाब',
  'sahab': 'साहब',
  'wah': 'वाह',
  'waa': 'वाह',
  'arrey': 'अरे',
  'arre': 'अरे',
  'arey': 'अरे',
  'are': 'अरे',
  'k': 'के',
  'kki': 'की',
  'n': 'न',
  'y': 'ये',
  'yr': 'यार',
  'luv': 'लव',
  'x': 'एक्स',
  'msg': 'मैसेज',
  'msgd': 'मैसेज',
  'sms': 'एसएमएस',
  'call': 'कॉल',
  'photo': 'फोटो',
  'pic': 'पिक',
  'selfie': 'सेल्फी',
  'video': 'वीडियो',
  'song': 'सॉन्ग',
  'movie': 'मूवी',
  'film': 'फिल्म',
  'ticket': 'टिकट',
  'party': 'पार्टी',
  'plan': 'प्लान',
  'date': 'डेट',
  'time': 'टाइम',
  'love': 'लव',
  'kiss': 'किस',
  'miss': 'मिस',
  'sorry': 'सॉरी',
  'please': 'प्लीज़',
  'thankyou': 'थैंक्यू',
  'thanks': 'थैंक्स',
  'welcome': 'वेलकम',
  'bye': 'बाय',
  'tc': 'टेक केयर',
  'gn': 'गुड नाइट',
  'gm': 'गुड मॉर्निंग',
  'ge': 'गुड इवनिंग',
  'gf': 'गर्लफ्रेंड',
  'bf': 'बॉयफ्रेंड',
  'bday': 'बर्थडे',
  'happy': 'हैप्पी',
  'sad': 'सैड',
  'angry': 'एंग्री',
  'cute': 'क्यूट',
  'hot': 'हॉट',
  'sexy': 'सेक्सी',
  'smart': 'स्मार्ट',
  'beautiful': 'ब्यूटीफुल',
  'pretty': 'प्रिटी',
  'ugly': 'अगली',
  'fat': 'फैट',
  'thin': 'थिन',
  'tall': 'टॉल',
  'short': 'शॉर्ट',
  'long': 'लॉन्ग',
  'small': 'स्मॉल',
  'big': 'बिग',
  'huge': 'ह्यूज',
  'tiny': 'टाइनी',
  'fast': 'फास्ट',
  'slow': 'स्लो',
  'high': 'हाइ',
  'low': 'लो',
  'up': 'अप',
  'down': 'डाउन',
  'left': 'लेफ्ट',
  'right': 'राइट',
  'front': 'फ्रंट',
  'back': 'बैक',
  'side': 'साइड',
  'middle': 'मिडल',
  'center': 'सेंटर',
  'corner': 'कॉर्नर',
  'edge': 'एज',
  'line': 'लाइन',
  'circle': 'सर्कल',
  'square': 'स्क्वायर',
  'round': 'राउंड',
  'box': 'बॉक्स',
  'point': 'पॉइंट',
  'dot': 'डॉट',
  'zero': 'ज़ीरो',
  'one': 'वन',
  'two': 'टू',
  'three': 'थ्री',
  'four': 'फोर',
  'five': 'फाइव',
  'six': 'सिक्स',
  'seven': 'सेवन',
  'eight': 'एट',
  'nine': 'नाइन',
  'ten': 'टेन',
  'hundred': 'हंड्रेड',
  'thousand': 'थाउज़ेंड',
  'million': 'मिलियन',
  'billion': 'बिलियन',
};

/** Check if text contains Hinglish (Romanized Hindi) */
export function isHinglish(text: string): boolean {
  const words = text.toLowerCase().split(/[^\p{L}]+/gu).filter(Boolean);
  if (words.length === 0) return false;
  let hinglishCount = 0;
  for (const w of words) {
    if (HINGLISH_MAP[w] || /[\u0900-\u097F]/.test(w)) hinglishCount++;
  }
  return hinglishCount >= 2;
}

/** Convert Hinglish words to Devanagari Hindi.
 * Only replaces known Hinglish words; English words stay as-is.
 * OpenAI TTS voices speak Hindi Devanagari natively and smoothly. */
export function hinglishToHindi(text: string): string {
  return text.split(/(\s+)/).map(token => {
    if (/^\s+$/.test(token)) return token;

    const trailing = token.match(/[^\p{L}\p{N}]*$/u)?.[0] || '';
    const leading = token.match(/^[^\p{L}\p{N}]*/u)?.[0] || '';
    const core = token.slice(leading.length, token.length - trailing.length);
    const lower = core.toLowerCase();

    if (HINGLISH_MAP[lower]) {
      return leading + HINGLISH_MAP[lower] + trailing;
    }

    return token;
  }).join('');
}

// ========== HINGLISH PHONETIC SMOOTHING ==========
// Keeps text in Roman script but subtly respells tricky Hinglish words
// so OpenAI TTS pronounces them with natural Indian cadence instead of
// spelling letters or using an American English accent.
const PHONETIC_SMOOTH: Record<string, string> = {
  // Core verbs / auxiliaries — ensure vowel length
  'hai': 'hai', 'hain': 'hain', 'ho': 'ho', 'hoga': 'hoga', 'hogi': 'hogi',
  'tha': 'tha', 'thi': 'thi', 'the': 'the',
  'raha': 'raha', 'rahi': 'rahi', 'rahe': 'rahe',
  'gaya': 'gaya', 'gayi': 'gayi', 'gaye': 'gaye',
  'aaya': 'aaya', 'aayi': 'aayi', 'aaye': 'aaye',
  'kiya': 'kiya', 'kari': 'kari', 'kiye': 'kiye',
  'liya': 'liya', 'liye': 'liye', 'diya': 'diya', 'diye': 'diye',
  'karna': 'karna', 'karni': 'karni', 'karne': 'karne',
  'karta': 'karta', 'karti': 'karti', 'karte': 'karte',
  'karega': 'karega', 'karegi': 'karegi', 'karenge': 'karenge',
  'karunga': 'karunga', 'karungi': 'karungi',
  'chahiye': 'chahiye', 'chahata': 'chahata', 'chahati': 'chahati', 'chahte': 'chahte',
  'hona': 'hona', 'sona': 'sona', 'rona': 'rona', 'hasna': 'hasna',
  'aana': 'aana', 'jaana': 'jaana', 'paana': 'paana', 'milna': 'milna',
  'bolo': 'bolo', 'karo': 'karo', 'chalo': 'chalo', 'rukho': 'rukho', 'dekho': 'dekho',
  'lena': 'lena', 'dena': 'dena',
  // Negation & common
  'nahi': 'nahee', 'nhi': 'nahee', 'nh': 'nahee',
  'mat': 'mat', 'na': 'na',
  // Question words
  'kya': 'kyaa', 'kaun': 'kaun', 'kahan': 'kahaan', 'kab': 'kab',
  'kaise': 'kaise', 'kyun': 'kyoon', 'kyu': 'kyoon', 'kitna': 'kitna',
  // Pronouns & possessives
  'mera': 'mayra', 'meri': 'mayri', 'mere': 'mayray',
  'tera': 'tayra', 'teri': 'tayri', 'tere': 'tayray',
  'uska': 'ooska', 'uski': 'ooski', 'uske': 'ooskay',
  'iska': 'iska', 'iski': 'iski', 'iske': 'iskay',
  'hamara': 'hamaara', 'hamari': 'hamaari', 'hamare': 'hamaaray',
  'tumhara': 'tumhaara', 'tumhari': 'tumhaari', 'tumhare': 'tumhaaray',
  'tum': 'tum', 'aap': 'aap', 'main': 'main', 'hum': 'hum', 'tu': 'tu',
  'mujhe': 'mujhay', 'tujhe': 'tujhay', 'usse': 'ussay', 'unse': 'unsay',
  'yeh': 'yeh', 'woh': 'woh', 'yahan': 'yahaan', 'wahan': 'wahaan',
  'kisi': 'kisi', 'koi': 'koi', 'kuch': 'kuch', 'sab': 'sab',
  // Common nouns/adjectives
  'bhai': 'bhaee', 'yaar': 'yaar', 'dost': 'dost', 'dil': 'dil',
  'pyaar': 'pyaar', 'khushi': 'khushi', 'gham': 'gham', 'dard': 'dard',
  'sukoon': 'sukoon', 'maza': 'maza', 'masti': 'masti',
  'shanti': 'shaanti', 'chain': 'chain', 'neend': 'neend',
  'duniya': 'duniya', 'zindagi': 'zindagi', 'waqt': 'waqt',
  'sapna': 'sapna', 'kismat': 'kismat', 'naseeb': 'naseeb',
  'khayal': 'khayaal', 'soch': 'soch', 'fikar': 'fikar',
  'himmat': 'himmat', 'sharam': 'sharam', 'ghussa': 'ghussa', 'gussa': 'gussa',
  'dar': 'dar', 'dua': 'dua',
  'sach': 'sach', 'jhoot': 'jhooth', 'sachai': 'sachai',
  'izzat': 'izzat', 'beizzati': 'beizzati',
  'shukriya': 'shukriya', 'dhanyavaad': 'dhanyavaad', 'namaste': 'namaste',
  'subah': 'subah', 'sham': 'shaam', 'raat': 'raat', 'din': 'din',
  'aaj': 'aaj', 'kal': 'kal', 'abhi': 'abhi', 'pehle': 'pehlay',
  'hamesha': 'hamesha', 'kabhi': 'kabhi', 'zaroor': 'zaroor', 'shayad': 'shayad',
  'theek': 'theek', 'bura': 'bura', 'buri': 'buri', 'bure': 'bure',
  'acha': 'acha', 'achi': 'achi', 'ache': 'ache', 'accha': 'accha',
  'bahut': 'bahut', 'zyada': 'zyada', 'jyaada': 'jyaada', 'kam': 'kam',
  'bilkul': 'bilkul', 'sahi': 'sahi', 'galat': 'galat',
  'mast': 'mast', 'badiya': 'badiya', 'badhiya': 'badhiya', 'bekar': 'bekar',
  'thoda': 'thoda', 'thodi': 'thodi', 'thode': 'thode',
  // Social / casual
  'han': 'haan', 'haan': 'haan', 'ji': 'ji',
  'bas': 'bas', 'bss': 'bas', 'bs': 'bas',
  'hn': 'haan', 'hnn': 'haan',
  'bhaiya': 'bhaaiya', 'bhen': 'behen',
  'sorry': 'sorry', 'please': 'please', 'thanks': 'thanks', 'thankyou': 'thank you',
  'bye': 'bye', 'ok': 'okay', 'nice': 'nice',
  'love': 'love', 'luv': 'love',
  'bro': 'bro', 'yr': 'yaar',
  'msg': 'message', 'sms': 'sms', 'call': 'call',
  'photo': 'photo', 'pic': 'pic', 'selfie': 'selfie',
  'video': 'video', 'song': 'song', 'movie': 'movie',
  'party': 'party', 'plan': 'plan', 'time': 'time',
  'happy': 'happy', 'sad': 'sad', 'cute': 'cute',
  // Conjunctions & particles
  'aur': 'aur', 'ya': 'ya', 'lekin': 'lekin', 'magar': 'magar',
  'par': 'par', 'toh': 'toh', 'bhi': 'bhi', 'hi': 'hi', 'ke': 'kay',
  'ki': 'ki', 'ka': 'ka', 'ko': 'ko', 'se': 'say', 'mein': 'mein',
  'me': 'mein', 'ne': 'nay', 'tak': 'tak', 'jab': 'jab', 'tab': 'tab',
  'kyunki': 'kyoonki', 'kisliye': 'kisliye',
  // Numerics
  'ek': 'ek', 'do': 'do', 'teen': 'teen', 'chaar': 'chaar', 'paanch': 'paanch',
  'dusra': 'doosra', 'dusri': 'doosri',
  'sabse': 'sab say',
};

function smoothHinglishPhonetics(text: string): string {
  // Only apply to texts that have a mix of English and Hinglish
  // Pure English or pure Devanagari should pass through untouched
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  const hasHinglish = /\b(hai|nahi|kya|bhai|mera|tera|dost|yaar|pyaar|dil|khushi|maza|sukoon|zindagi|waqt|bilkul|zyada|kam|theek|acha|mast|badiya|haan|ji|bas|aur|lekin|toh|mein|ko|ke|ki|ka|se|ne|tak|jab|tab|ek|do|teen|hai\b|hoga|karega|karunga|lena|dena|aana|jaana|paana|sona|rona|hasna|bolo|karo|chalo|dekho|rukho|jao|aao|mat|nahi|nhi|kyun|kyu|kaise|kaun|kahan|kab|kitna|kaunsa|mera|meri|mere|tera|teri|tere|uska|uski|uske|hamara|hamari|hamare|tumhara|tumhari|tumhare|yeh|woh|yahan|wahan|kisi|koi|kuch|sab|mujhe|tujhe|usse|unse|yeh|woh|subah|sham|raat|din|aaj|kal|abhi|pehle|hamesha|kabhi|zaroor|shayad|bura|buri|bure|acha|achi|ache|accha|bahut|thoda|thodi|thode|sahi|galat|mast|badiya|badhiya|bekar|duniya|zindagi|waqt|sapna|kismat|naseeb|khayal|soch|fikar|himmat|sharam|ghussa|gussa|dar|dua|sach|jhoot|sachai|izzat|beizzati|shukriya|dhanyavaad|namaste|khushi|gham|dard|sukoon|maza|masti|shanti|chain|neend|pyaar|dil|yaar|dost|bhai)\b/i.test(text);

  if (hasDevanagari || !hasHinglish) return text;

  // Word-by-word replacement with case preservation
  return text.replace(/\b([a-zA-Z]+)\b/g, (match) => {
    const lower = match.toLowerCase();
    const replacement = PHONETIC_SMOOTH[lower];
    if (!replacement) return match;
    // Preserve first-letter capitalization
    if (match[0] === match[0].toUpperCase()) {
      return replacement[0].toUpperCase() + replacement.slice(1);
    }
    return replacement;
  });
}

function enhanceEmotions(text: string): string {
  let t = text;
  t = t.replace(/\b(haha|hehe|hihi|lol|lmao|rofl)\b/gi, (match) => {
    const lower = match.toLowerCase();
    if (lower === 'lol') return 'ha ha';
    if (lower === 'lmao') return 'ha ha ha';
    if (lower === 'rofl') return 'ha ha ha ha';
    return 'ha ha';
  });
  t = t.replace(/\b(sigh)\b/gi, 'sigh...');
  t = t.replace(/\b(wow)\b/gi, 'wow!');
  t = t.replace(/\b(omg|oh my god)\b/gi, 'oh my god!');
  t = t.replace(/\b(ugh|argh|grr)\b/gi, (match) => match + '...');

  // Replace English emotion interjections with Hindi equivalents for better pronunciation
  t = t.replace(/\b(yes yes|yesyes)\b/gi, 'हाँ हाँ');
  t = t.replace(/\b(no no|nono)\b/gi, 'नहीं नहीं');
  t = t.replace(/\b(ohh|ohhh)\b/gi, 'ओह');
  t = t.replace(/\b(ahh|ahhh)\b/gi, 'आह');
  t = t.replace(/\b(hmm|hmmm)\b/gi, 'हम्म');
  t = t.replace(/\b(umm|ummm)\b/gi, 'उम्म');

  t = t.replace(/\s{2,}/g, ' ').trim();
  return t;
}

// Split text into sentence chunks for sequential TTS playback
function splitIntoTTSChunks(text: string, maxChars = 4000): string[] {
  if (text.length <= maxChars) return [text];
  const sentences = text.match(/[^.!?।]+[.!?।]+|[^.!?।]+$/g) || [text];
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length <= maxChars) {
      current += sentence;
    } else {
      if (current) chunks.push(current.trim());
      current = sentence;
    }
  }
  if (current) chunks.push(current.trim());
  // Fallback: if a single sentence is longer than maxChars, split at word boundary
  const result: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxChars) {
      result.push(chunk);
    } else {
      let remaining = chunk;
      while (remaining.length > maxChars) {
        const spaceIdx = remaining.lastIndexOf(' ', maxChars);
        const splitAt = spaceIdx > maxChars * 0.5 ? spaceIdx : maxChars;
        result.push(remaining.slice(0, splitAt).trim());
        remaining = remaining.slice(splitAt).trim();
      }
      if (remaining) result.push(remaining);
    }
  }
  return result.filter(Boolean);
}

// ========== TTS CORE ==========

async function fetchTTS(text: string, voice: TTSVoice, speed: number): Promise<string> {
  const url = getEdgeFunctionUrl();
  const anonKey = getAnonKey();
  if (!url || !anonKey) {
    throw new Error('Supabase not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  // Map ultra -> shimmer for API compatibility
  const apiVoice = voice === 'ultra' ? 'shimmer' : voice;
  console.log('[TTS] Calling edge function voice:', voice, '->', apiVoice, 'speed:', speed, 'chars:', text.length);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ input: text, voice: apiVoice, response_format: 'mp3', speed }),
  });

  if (!res.ok) {
    let errMsg = `TTS HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      errMsg = errBody.error || errBody.message || errMsg;
    } catch {
      errMsg = await res.text() || errMsg;
    }
    console.error('[TTS] Edge function error:', errMsg);
    throw new Error(errMsg);
  }

  const data = await res.json();
  if (!data?.audioUrl) {
    console.error('[TTS] No audio URL in response:', data);
    throw new Error('No audio URL returned from TTS');
  }

  console.log('[TTS] Audio URL received');
  return data.audioUrl;
}

export function stopSpeech(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function isSpeaking(): boolean {
  return currentAudio !== null && !currentAudio.paused && !currentAudio.ended;
}

/**
 * Speak text using TTS with fallback voice on failure.
 * 1. Strip markdown
 * 2. Convert Hinglish → Hindi Devanagari
 * 3. Enhance emotions
 * 4. Truncate
 * 5. Call TTS at user-selected speed (default 1.3×)
 * 6. If voice fails, auto-fallback to shimmer
 */
export async function speakText(text: string): Promise<void> {
  if (!text || !text.trim()) return;

  stopSpeech();

  // 1. Strip markdown + fix whitespace
  let cleanText = prepareTextForTTS(text);
  // Replace all line breaks with spaces — TTS pauses at line breaks causing choppy speech
  cleanText = cleanText.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();

  // 2. Enhance emotions
  cleanText = enhanceEmotions(cleanText);

  // 3. Hinglish phonetic smoothing — keep Roman script but respell tricky words
  // so OpenAI TTS pronounces them naturally instead of with English accent
  cleanText = smoothHinglishPhonetics(cleanText);

  cleanText = cleanText.replace(/\s{2,}/g, ' ').trim();

  if (!cleanText.trim()) return;

  const voice = getSavedVoice();
  const speed = getSavedSpeed();

  // 4. Split into chunks for full playback without truncation (4000 chars = longer continuous audio)
  const chunks = splitIntoTTSChunks(cleanText, 4000);
  let chunkIndex = 0;

  // Preload buffer: fetch next chunk while current one plays so zero gap
  let nextAudioUrl: string | null = null;
  let nextBlob: Blob | null = null;

  const preloadNext = async (v: TTSVoice, idx: number) => {
    if (idx >= chunks.length) { nextAudioUrl = null; nextBlob = null; return; }
    try {
      const url = await fetchTTS(chunks[idx], v, speed);
      nextAudioUrl = url;
      const res = await fetch(url);
      nextBlob = await res.blob();
    } catch {
      nextAudioUrl = null;
      nextBlob = null;
    }
  };

  const playNextChunk = async (v: TTSVoice): Promise<void> => {
    if (chunkIndex >= chunks.length) return;

    const usePreload = nextAudioUrl && chunkIndex > 0;
    let audioUrl: string;

    if (usePreload && nextAudioUrl) {
      audioUrl = nextAudioUrl;
      if (chunkIndex === 0) {
        lastTtsUrl = audioUrl;
        lastTtsBlob = nextBlob;
      }
    } else {
      const chunk = chunks[chunkIndex];
      audioUrl = await fetchTTS(chunk, v, speed);
      if (chunkIndex === 0) {
        lastTtsUrl = audioUrl;
        try {
          const res = await fetch(audioUrl);
          lastTtsBlob = await res.blob();
        } catch {
          lastTtsBlob = null;
        }
      }
    }

    // Start preloading the chunk AFTER this one immediately
    const preloadIdx = chunkIndex + 1;
    if (preloadIdx < chunks.length) {
      preloadNext(v, preloadIdx);
    }

    const audio = new Audio(audioUrl);
    currentAudio = audio;

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        chunkIndex++;
        if (chunkIndex >= chunks.length) {
          console.log('[TTS] All chunks played');
          resolve();
        } else {
          playNextChunk(v).then(resolve).catch(reject);
        }
      };
      audio.onerror = (e) => {
        if (currentAudio === audio) currentAudio = null;
        console.error('[TTS] Audio playback error:', e);
        reject(new Error('Audio playback failed'));
      };
      audio.play().catch((err) => {
        if (currentAudio === audio) currentAudio = null;
        console.error('[TTS] Audio play() rejected:', err);
        reject(err);
      });
    });
  };

  const trySpeak = async (v: TTSVoice): Promise<void> => {
    chunkIndex = 0;
    nextAudioUrl = null;
    nextBlob = null;
    // Preload first chunk + second chunk in parallel for instant start
    if (chunks.length > 1) {
      preloadNext(v, 1);
    }
    await playNextChunk(v);
  };

  try {
    await trySpeak(voice);
  } catch (err: any) {
    console.error('[TTS] Primary voice failed:', voice, err.message);
    if (voice !== FALLBACK_VOICE) {
      console.log('[TTS] Trying fallback voice:', FALLBACK_VOICE);
      try {
        await trySpeak(FALLBACK_VOICE);
        return;
      } catch (fallbackErr: any) {
        console.error('[TTS] Fallback voice also failed:', fallbackErr.message);
      }
    }
    toast.error(`Voice playback failed: ${err.message}`);
    throw err;
  }
}

// ========== LEGACY COMPATIBILITY EXPORTS ==========

export function getVoiceGender(): 'female' | 'male' {
  return 'female';
}

export function getSelectedVoiceUri(): string | null {
  return null;
}

export function getSpeechRate(): number {
  return 1.0;
}

export function getSpeechPitch(): number {
  return 1.0;
}

export function getPremiumTTSEnabled(): boolean {
  return true;
}

export function loadVoices(): Promise<[]> {
  return Promise.resolve([]);
}

export function warmVoices(): void {
  // No-op
}
