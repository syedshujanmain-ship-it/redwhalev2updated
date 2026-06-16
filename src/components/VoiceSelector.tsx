// VoiceSelector - Red Whale V1 Human Voice Engine
// 25 realistic voices across OpenAI, LemonFox, and common TTS providers.
// All voices support multilingual text including English, Hindi, Hinglish and many more.
import { useState, useCallback } from 'react';
import { Volume2, Play, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getSavedVoice, setSavedVoice, getSavedSpeed, setSavedSpeed, type TTSVoice
} from '@/utils/voiceUtils';

interface VoiceInfo {
  id: TTSVoice;
  name: string;
  desc: string;
  tag: string;
  tagClass: string;
}

export const VOICES: VoiceInfo[] = [
  // Top Best — Ultra (Perfect Hindi, Hinglish & English)
  { id: 'ultra',   name: 'Ultra',   desc: 'Best voice — perfect Hindi, Hinglish & English', tag: 'Top', tagClass: 'bg-red-500/20 text-red-600' },
  // Premium Picks — Best of the Best
  { id: 'shimmer', name: 'Shimmer', desc: 'Warm, expressive female — most human-like', tag: 'Premium', tagClass: 'bg-amber-500/20 text-amber-600' },
  { id: 'coral',   name: 'Coral',   desc: 'Bright, clear female — cheerful and natural', tag: 'Premium', tagClass: 'bg-amber-500/20 text-amber-600' },
  { id: 'nova',    name: 'Nova',    desc: 'Energetic, dynamic female — upbeat and lively', tag: 'Premium', tagClass: 'bg-amber-500/20 text-amber-600' },
  { id: 'sol',     name: 'Sol',     desc: 'Confident, articulate female — best for Hindi', tag: 'Premium', tagClass: 'bg-amber-500/20 text-amber-600' },
  { id: 'sage',    name: 'Sage',    desc: 'Calm, wise female — soothing and gentle', tag: 'Premium', tagClass: 'bg-amber-500/20 text-amber-600' },
  { id: 'ash',     name: 'Ash',     desc: 'Warm, friendly male — approachable and steady', tag: 'Premium', tagClass: 'bg-amber-500/20 text-amber-600' },
  { id: 'echo',    name: 'Echo',    desc: 'Deep, authoritative male — crisp and commanding', tag: 'Premium', tagClass: 'bg-amber-500/20 text-amber-600' },
  { id: 'alloy',   name: 'Alloy',   desc: 'Balanced, versatile male — professional and clear', tag: 'Premium', tagClass: 'bg-amber-500/20 text-amber-600' },
  { id: 'ballad',  name: 'Ballad',  desc: 'Smooth, musical male — rhythmic and rich', tag: 'Premium', tagClass: 'bg-amber-500/20 text-amber-600' },
  // Female voices
  { id: 'fable',   name: 'Fable',   desc: 'Storytelling female — rich, immersive, warm', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  { id: 'verse',   name: 'Verse',   desc: 'Poetic, melodic female — lyrical and smooth', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  { id: 'bella',   name: 'Bella',   desc: 'Soft, conversational female — natural warmth', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  { id: 'heart',   name: 'Heart',   desc: 'Expressive female — emotions, laughs, feelings', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  { id: 'jessica', name: 'Jessica', desc: 'Friendly, warm female — casual and relatable', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  { id: 'lily',    name: 'Lily',    desc: 'Sweet, youthful female — gentle and kind', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  { id: 'sarah',   name: 'Sarah',   desc: 'Professional female — clear and confident', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  { id: 'emma',    name: 'Emma',    desc: 'Bright, bubbly female — energetic and fun', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  { id: 'olivia',  name: 'Olivia',  desc: 'Elegant female — sophisticated and polished', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  { id: 'nicole',  name: 'Nicole',  desc: 'Smooth, sultry female — rich and velvety', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  { id: 'amy',     name: 'Amy',     desc: 'Warm, motherly female — nurturing and soft', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  { id: 'clara',   name: 'Clara',   desc: 'Clear, precise female — best for teaching', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  { id: 'dora',    name: 'Dora',    desc: 'Playful, adventurous female — fun and curious', tag: 'Female', tagClass: 'bg-pink-500/20 text-pink-600' },
  // Male voices
  { id: 'onyx',    name: 'Onyx',    desc: 'Powerful, bold male — strong and assertive', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
  { id: 'adam',    name: 'Adam',    desc: 'Clear, reliable male — steady and professional', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
  { id: 'josh',    name: 'Josh',    desc: 'Casual, cool male — laid-back and natural', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
  { id: 'matthew', name: 'Matthew', desc: 'Confident male — articulate and trustworthy', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
  { id: 'michael', name: 'Michael', desc: 'Warm, deep male — fatherly and reassuring', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
  { id: 'ryan',    name: 'Ryan',    desc: 'Energetic male — enthusiastic and youthful', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
  { id: 'arthur',  name: 'Arthur',  desc: 'Distinguished male — wise and cultured', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
  { id: 'daniel',  name: 'Daniel',  desc: 'Friendly male — easygoing and sincere', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
  { id: 'thomas',  name: 'Thomas',  desc: 'Steady male — calm and dependable', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
  { id: 'liam',    name: 'Liam',    desc: 'Youthful male — fresh and vibrant', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
  { id: 'antoni',  name: 'Antoni',  desc: 'Elegant male — refined and cultured accent', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
  { id: 'joshua',  name: 'Joshua',  desc: 'Warm, deep male — perfect for stories', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
  { id: 'dominic', name: 'Dominic', desc: 'British male — sophisticated and crisp', tag: 'Male', tagClass: 'bg-blue-500/20 text-blue-600' },
];

export function VoiceSelector({ className }: { className?: string }) {
  const [selected, setSelected] = useState<TTSVoice>(getSavedVoice);
  const [speed, setSpeed] = useState(getSavedSpeed());
  const [playing, setPlaying] = useState<TTSVoice | null>(null);

  const selectVoice = useCallback((voice: TTSVoice) => {
    setSelected(voice);
    setSavedVoice(voice);
  }, []);

  const updateSpeed = useCallback((val: number) => {
    setSpeed(val);
    setSavedSpeed(val);
  }, []);

  const testVoice = useCallback(async (voice: TTSVoice) => {
    setPlaying(voice);
    const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, '') + '/functions/v1/text-to-speech';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    if (!url || !anonKey) {
      setPlaying(null);
      return;
    }

    // Settings preview always in English — clean and clear
    const testText = `Hello! This is the ${voice} voice. How do I sound?`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ input: testText, voice, response_format: 'mp3', speed }),
      });
      const data = await res.json();
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.onended = () => setPlaying(null);
        audio.onerror = () => setPlaying(null);
        await audio.play();
      } else {
        setPlaying(null);
      }
    } catch {
      setPlaying(null);
    }
  }, [speed]);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Red Whale Voice Engine</h3>
            <p className="text-xs text-muted-foreground">25 ultra-realistic multilingual voices</p>
          </div>
        </div>

        {/* Speed Slider */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium">Speech Speed</span>
            </div>
            <span className="text-xs font-semibold text-primary">{speed.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={speed}
            onChange={(e) => updateSpeed(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-muted-foreground/20 accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Slow</span>
            <span>Normal</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Voice List */}
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
          {VOICES.map((v) => (
            <button
              key={v.id}
              onClick={() => selectVoice(v.id)}
              className={cn(
                'w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left',
                selected === v.id
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-transparent hover:bg-muted/50'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                selected === v.id ? 'border-primary' : 'border-muted-foreground/30'
              )}>
                {selected === v.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{v.name}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', v.tagClass)}>
                    {v.tag}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{v.desc}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); testVoice(v.id); }}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
                title="Test voice"
              >
                {playing === v.id ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Multilingual:</strong> All voices speak English, Hindi, Hinglish and 50+ languages smoothly without pauses.
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Fallback:</strong> If a voice fails, it automatically falls back
            to Shimmer so playback never breaks.
          </p>
        </div>
      </div>
    </div>
  );
}

function isHinglish(text: string): boolean {
  const hinglishWords = ['hai', 'nahi', 'kya', 'kaise', 'kyun', 'kaun', 'kahan', 'kab', 'kitna', 'acha', 'theek', 'bura', 'bahut', 'zara', 'thoda', 'bilkul', 'haan', 'ji', 'bhai', 'dost', 'yaar', 'pyaar', 'dil', 'khushi', 'gham', 'maza', 'masti', 'zindagi', 'duniya', 'waqt', 'sapna', 'dard', 'sukoon', 'ishq', 'mohabbat', 'shukriya', 'dhanyavaad', 'namaste', 'alvida', 'chalo', 'rukho', 'dekho', 'sunno', 'samjho', 'bolo', 'karo', 'jao', 'aao', 'mat', 'kar', 'de', 'mera', 'tera', 'uska', 'hamara', 'tumhara', 'yeh', 'woh', 'yahan', 'wahan', 'abhi', 'baad', 'pehle', 'aaj', 'kal', 'parso', 'roz', 'hamesha', 'kabhi', 'zaroor', 'shayad', 'lagta', 'lagti', 'lagte', 'jaisa', 'jaisi', 'jaise', 'lekin', 'magar', 'par', 'aur', 'ya', 'toh', 'bhi', 'hi', 'hoga', 'hogi', 'honge', 'thi', 'tha', 'the', 'karunga', 'karungi', 'karoge', 'kiya', 'kari', 'kiye', 'mil', 'gaya', 'gayi', 'gaye', 'chahiye', 'chahata', 'chahati', 'chahte', 'pasand', 'nafrat', 'ladai', 'jhagda', 'sach', 'jhoot', 'asli', 'nakli', 'sapna', 'neend', 'chain', 'bekar', 'mushkil', 'asaan', 'tez', 'dheema', 'dostana', 'behen', 'maa', 'papa', 'beta', 'beti', 'ladka', 'ladki', 'aadmii', 'aurat', 'bachcha', 'budha', 'jawaan', 'tum', 'aap', 'main', 'hum', 'tu', 'tujhe', 'mujhe', 'usse', 'unse', 'idhar', 'udhar', 'kahi', 'sab', 'koi', 'kuch', 'kam', 'zyada', 'accha', 'mast', 'jhakaas', 'bindaas', 'khatarnak', 'solid', 'scene', 'mood', 'vibe', 'swag', 'nalla', 'chapri', 'sakht', 'bawaal', 'jugaad', 'desi', 'videsi'];
  const words = text.toLowerCase().split(/[^\p{L}]+/gu).filter(Boolean);
  let count = 0;
  for (const w of words) {
    if (hinglishWords.includes(w)) count++;
  }
  return count >= 2;
}
