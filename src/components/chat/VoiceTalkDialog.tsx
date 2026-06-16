// VoiceTalkDialog - Premium Live Voice-to-Voice Interface
// Background mode: no text display, voice only. Supports English + Hindi.
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic, X, Volume2, Sparkles, Radio, ArrowRight, Globe,
  Zap, Smile, Frown, Flame, Heart, Briefcase, Laugh,
  Skull, Drama, Gamepad2, Music, Eye, MicOff,
  Stethoscope, Brain, Bot, Paintbrush, Search, Shield,
  Feather, Sun, Meh, AlertTriangle, Target, EyeOff,
  Flower2, HelpCircle, Compass, AlertOctagon, Sunrise,
  Star, ThumbsDown, HeartHandshake, HeartCrack, Cloud,
  Activity, Download, Timer, Pause,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { transcribeAudio } from '@/services/voiceService';
import {
  speakText, stopSpeech, downloadLastTts,
  getAudioProgress, getAudioDuration, getAudioCurrentTime,
  getSavedVoice, setSavedVoice, type TTSVoice,
} from '@/utils/voiceUtils';
import { VOICES } from '@/components/VoiceSelector';
import type { ChatMood } from '@/types/chat';

interface VoiceTalkDialogProps {
  open: boolean;
  onClose: () => void;
  onSendMessage: (text: string, overrideLang?: string, mood?: ChatMood) => Promise<string>;
  selectedMood?: ChatMood;
  onMoodChange?: (mood: ChatMood) => void;
}

type VoicePhase = 'idle' | 'listening' | 'processing' | 'speaking';

function isMobileDevice(): boolean {
  return typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
  );
}

const MOODS: { id: ChatMood; label: string; icon: React.ElementType; color: string; glowColor: string }[] = [
  { id: 'normal', label: 'Normal', icon: Smile, color: 'text-emerald-500', glowColor: 'rgba(34,197,94,0.30)' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-emerald-500', glowColor: 'rgba(34,197,94,0.40)' },
  { id: 'funny', label: 'Funny', icon: Laugh, color: 'text-amber-500', glowColor: 'rgba(245,158,11,0.35)' },
  { id: 'angry', label: 'Angry', icon: Flame, color: 'text-red-600', glowColor: 'rgba(220,38,38,0.35)' },
  { id: 'romantic', label: 'Romantic', icon: Heart, color: 'text-pink-500', glowColor: 'rgba(236,72,153,0.35)' },
  { id: 'professional', label: 'Pro', icon: Briefcase, color: 'text-blue-500', glowColor: 'rgba(59,130,246,0.35)' },
  { id: 'savage', label: 'Savage', icon: Skull, color: 'text-purple-500', glowColor: 'rgba(168,85,247,0.35)' },
  { id: 'dramatic', label: 'Drama', icon: Drama, color: 'text-rose-500', glowColor: 'rgba(244,63,94,0.35)' },
  { id: 'gamer', label: 'Gamer', icon: Gamepad2, color: 'text-cyan-500', glowColor: 'rgba(6,182,212,0.35)' },
  { id: 'vibes', label: 'Vibes', icon: Music, color: 'text-violet-500', glowColor: 'rgba(139,92,246,0.35)' },
  { id: 'detective', label: 'Detective', icon: Search, color: 'text-stone-500', glowColor: 'rgba(120,113,108,0.35)' },
  { id: 'philosophical', label: 'Philosopher', icon: Brain, color: 'text-indigo-500', glowColor: 'rgba(99,102,241,0.35)' },
  { id: 'motivational', label: 'Motivator', icon: Zap, color: 'text-orange-500', glowColor: 'rgba(249,115,22,0.35)' },
  { id: 'poetic', label: 'Poetic', icon: Feather, color: 'text-pink-400', glowColor: 'rgba(244,114,182,0.35)' },
  { id: 'gangster', label: 'Gangster', icon: Shield, color: 'text-neutral-500', glowColor: 'rgba(115,115,115,0.35)' },
  { id: 'childish', label: 'Childish', icon: Sun, color: 'text-cyan-500', glowColor: 'rgba(6,182,212,0.35)' },
  { id: 'dark', label: 'Dark', icon: EyeOff, color: 'text-slate-500', glowColor: 'rgba(100,116,139,0.35)' },
  { id: 'flirty', label: 'Flirty', icon: HeartHandshake, color: 'text-rose-400', glowColor: 'rgba(251,113,133,0.35)' },
  { id: 'sarcastic', label: 'Sarcastic', icon: Meh, color: 'text-purple-400', glowColor: 'rgba(192,132,252,0.35)' },
  { id: 'confident', label: 'Confident', icon: Target, color: 'text-emerald-400', glowColor: 'rgba(52,211,153,0.35)' },
  { id: 'peaceful', label: 'Peaceful', icon: Flower2, color: 'text-teal-400', glowColor: 'rgba(45,212,191,0.35)' },
  { id: 'curious', label: 'Curious', icon: Compass, color: 'text-cyan-400', glowColor: 'rgba(34,211,238,0.35)' },
  { id: 'hopeful', label: 'Hopeful', icon: Sunrise, color: 'text-yellow-400', glowColor: 'rgba(250,204,21,0.35)' },
  { id: 'surprised', label: 'Surprised', icon: Star, color: 'text-pink-400', glowColor: 'rgba(244,114,182,0.35)' },
  { id: 'calm', label: 'Calm', icon: Cloud, color: 'text-sky-300', glowColor: 'rgba(125,211,252,0.35)' },
  { id: 'energetic', label: 'Energetic', icon: Activity, color: 'text-lime-400', glowColor: 'rgba(163,230,53,0.35)' },
];

export function VoiceTalkDialog({
  open, onClose, onSendMessage, selectedMood = 'normal', onMoodChange,
}: VoiceTalkDialogProps) {
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [waveData, setWaveData] = useState<number[]>(new Array(32).fill(0.05));
  const [continuousMode, setContinuousMode] = useState(true);
  const [langMode, setLangMode] = useState<'en' | 'hi'>('en');
  const [showMoods, setShowMoods] = useState(false);
  const [showSpeakingPopup, setShowSpeakingPopup] = useState(false);
  const [speakElapsed, setSpeakElapsed] = useState(0);
  const [popupWave, setPopupWave] = useState<number[]>(new Array(40).fill(0.1));
  const [activeVoice, setActiveVoice] = useState<TTSVoice>(getSavedVoice);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const speakTimerRef = useRef<number>(0);
  const popupAnimRef = useRef<number>(0);

  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const pendingTranscriptRef = useRef('');

  const hasBrowserSTT = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  // Cleanup on unmount / close
  const stopAudioVisualization = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setWaveData(new Array(64).fill(0.05));
  }, []);

  const cleanup = useCallback(() => {
    stopSpeech();
    stopAudioVisualization();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      try { recorderRef.current.stop(); } catch { /* ignore */ }
    }
  }, [stopAudioVisualization]);

  useEffect(() => {
    mountedRef.current = true;
    if (!open) {
      cleanup();
      setPhase('idle');
      setShowSpeakingPopup(false);
      setSpeakElapsed(0);
    }
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [open, cleanup]);

  // Speaking popup timer + real audio progress
  useEffect(() => {
    if (phase === 'speaking') {
      setShowSpeakingPopup(true);
      setSpeakElapsed(0);
      speakTimerRef.current = window.setInterval(() => {
        setSpeakElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (speakTimerRef.current) {
        clearInterval(speakTimerRef.current);
        speakTimerRef.current = 0;
      }
      if (phase !== 'processing') {
        setShowSpeakingPopup(false);
      }
    }
    return () => {
      if (speakTimerRef.current) {
        clearInterval(speakTimerRef.current);
      }
    };
  }, [phase]);

  // Real audio progress polling for popup timeline
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrent, setAudioCurrent] = useState(0);
  const [audioTotal, setAudioTotal] = useState(0);
  useEffect(() => {
    if (!showSpeakingPopup) return;
    const timer = window.setInterval(() => {
      setAudioProgress(getAudioProgress() * 100);
      setAudioCurrent(getAudioCurrentTime());
      setAudioTotal(getAudioDuration());
    }, 200);
    return () => clearInterval(timer);
  }, [showSpeakingPopup]);

  // Popup wave animation
  useEffect(() => {
    if (!showSpeakingPopup) {
      if (popupAnimRef.current) cancelAnimationFrame(popupAnimRef.current);
      return;
    }
    let t = 0;
    const animate = () => {
      t += 0.15;
      const data = new Array(40).fill(0).map((_, i) => {
        const base = Math.sin(t + i * 0.25) * 0.5 + 0.5;
        const secondary = Math.sin(t * 1.3 + i * 0.4) * 0.3;
        const noise = Math.random() * 0.15;
        return Math.min(1, Math.max(0.05, base + secondary + noise));
      });
      setPopupWave(data);
      popupAnimRef.current = requestAnimationFrame(animate);
    };
    popupAnimRef.current = requestAnimationFrame(animate);
    return () => {
      if (popupAnimRef.current) cancelAnimationFrame(popupAnimRef.current);
    };
  }, [showSpeakingPopup]);

  // Real-time audio visualization with noise filtering
  const startAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let frameCount = 0;
      const throttleEvery = isMobileDevice() ? 5 : 3;

      const updateWave = () => {
        if (!mountedRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        frameCount++;
        if (frameCount % throttleEvery === 0) {
          const normalized = Array.from(dataArray).slice(0, 32).map(v => v / 255);
          setWaveData(normalized);
        }
        animationRef.current = requestAnimationFrame(updateWave);
      };
      updateWave();
    } catch {
      let t = 0;
      let frameCount = 0;
      const throttleEvery = isMobileDevice() ? 5 : 3;
      const syntheticWave = () => {
        if (!mountedRef.current) return;
        t += 0.12;
        frameCount++;
        if (frameCount % throttleEvery === 0) {
          const data = new Array(32).fill(0).map((_, i) => {
            const base = Math.sin(t + i * 0.3) * 0.5 + 0.5;
            const noise = Math.random() * 0.12;
            return Math.min(1, base + noise);
          });
          setWaveData(data);
        }
        animationRef.current = requestAnimationFrame(syntheticWave);
      };
      syntheticWave();
    }
  }, []);

  // Fast voice input processing — background mode, no text display
  const processVoiceInput = useCallback(async (inputText: string) => {
    if (!inputText.trim()) {
      setPhase('idle');
      return;
    }

    setPhase('processing');

    try {
      const overrideLang = langMode === 'hi' ? 'hindi' : 'english';
      const response = await onSendMessage(inputText, overrideLang, selectedMood);
      if (!mountedRef.current) return;
      setPhase('speaking');
      try {
        await speakText(response);
      } catch {
        // TTS failed — continue silently
      }
      if (!mountedRef.current) return;

      if (continuousMode) {
        setTimeout(() => startRecording(), 80);
      } else {
        setPhase('idle');
      }
    } catch (e: any) {
      toast.error(e.message || 'Voice processing failed', { duration: 3000 });
      if (mountedRef.current) setPhase('idle');
    }
  }, [onSendMessage, continuousMode, langMode, selectedMood]);

  // Cloud fallback (Whisper) - fast 8s timeout
  const startFallbackRecording = useCallback(async () => {
    pendingTranscriptRef.current = '';

    let mimeType = '';
    try {
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
      }
    } catch { /* ignore */ }

    if (!mimeType) {
      toast.error('Recording not supported on this browser.', { duration: 5000 });
      setPhase('idle');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        stopAudioVisualization();
        const finalTranscript = pendingTranscriptRef.current;
        if (finalTranscript.trim()) {
          await processVoiceInput(finalTranscript);
          return;
        }
        setPhase('processing');
        try {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const text = await transcribeAudio(blob);
          if (!text.trim()) {
            toast.info('No speech detected. Try again.', { duration: 3000 });
            setPhase('idle');
            return;
          }
          await processVoiceInput(text);
        } catch (e: any) {
          toast.error(e.message || 'Voice processing failed', { duration: 3000 });
          if (mountedRef.current) setPhase('idle');
        }
      };

      recorder.onerror = () => {
        toast.error('Recording error. Please try again.', { duration: 3000 });
        if (mountedRef.current) setPhase('idle');
      };

      recorder.start(100);
      setPhase('listening');
      startAudioVisualization();
      toast.info('Listening...', { duration: 1500 });

      // Fast 8-second auto-stop
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 8000);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow mic permission.', { duration: 5000 });
      } else if (err.name === 'NotFoundError') {
        toast.error('No microphone found.', { duration: 5000 });
      } else {
        toast.error(err.message || 'Could not start recording.', { duration: 5000 });
      }
      if (mountedRef.current) setPhase('idle');
    }
  }, [processVoiceInput, startAudioVisualization, stopAudioVisualization]);

  // Browser SpeechRecognition - fast for English
  const startRecording = useCallback(() => {
    if (langMode === 'hi' || !hasBrowserSTT) {
      startFallbackRecording();
      return;
    }

    pendingTranscriptRef.current = '';

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setPhase('listening');
      startAudioVisualization();
    };

    recognition.onresult = (event: any) => {
      const results = event.results;
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < results.length; i++) {
        if (results[i].isFinal) {
          finalText += results[i][0].transcript;
        } else {
          interimText += results[i][0].transcript;
        }
      }
      pendingTranscriptRef.current = finalText || interimText;
    };

    recognition.onend = async () => {
      stopAudioVisualization();
      const finalTranscript = pendingTranscriptRef.current;
      if (!finalTranscript.trim()) {
        setPhase('idle');
        return;
      }
      await processVoiceInput(finalTranscript);
    };

    recognition.onerror = (event: any) => {
      stopAudioVisualization();
      if (event.error === 'network') {
        toast.info('Switching to cloud voice...', { duration: 2000 });
        setPhase('idle');
        setTimeout(() => startFallbackRecording(), 500);
        return;
      }
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast.error(`Voice error: ${event.error}`, { duration: 3000 });
      }
      if (mountedRef.current) setPhase('idle');
    };

    try {
      recognition.start();
    } catch {
      toast.error('Failed to start voice recognition');
      setPhase('idle');
    }
  }, [hasBrowserSTT, langMode, processVoiceInput, startAudioVisualization, stopAudioVisualization, startFallbackRecording]);

  const stopRecording = useCallback(() => {
    stopAudioVisualization();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      try { recorderRef.current.stop(); } catch { /* ignore */ }
    }
    stopSpeech();
  }, [stopAudioVisualization]);

  const handleMicTap = useCallback(() => {
    if (phase === 'idle') {
      startRecording();
    } else if (phase === 'listening') {
      stopRecording();
    } else if (phase === 'speaking') {
      stopSpeech();
      setPhase('idle');
    }
  }, [phase, startRecording, stopRecording]);

  const phaseLabels: Record<VoicePhase, string> = {
    idle: 'Tap to Speak',
    listening: 'Listening...',
    processing: 'Thinking...',
    speaking: 'Speaking...',
  };

  const currentMood = MOODS.find(m => m.id === selectedMood) || MOODS[0];
  const MoodIcon = currentMood.icon;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
      {/* Subtle aurora glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, hsl(210 100% 55% / 0.06) 0%, transparent 60%)',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden will-change-transform">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'absolute rounded-full voice-particle',
              i % 3 === 0 && 'w-1.5 h-1.5 bg-primary/40',
              i % 3 === 1 && 'w-1 h-1 bg-accent/40',
              i % 3 === 2 && 'w-0.5 h-0.5 bg-destructive/30'
            )}
            style={{
              left: `${5 + (i * 15) % 90}%`,
              bottom: '-10px',
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${6 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* Top toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
        {/* Language toggle */}
        <button
          onClick={() => {
            const next = langMode === 'en' ? 'hi' : 'en';
            setLangMode(next);
            toast.info(next === 'en' ? 'English mode' : 'Hindi mode', {
              duration: 1500,
              icon: <Globe className="w-4 h-4" />,
            });
          }}
          title={langMode === 'en' ? 'English (tap for Hindi)' : 'Hindi (tap for English)'}
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center transition-all border backdrop-blur-md min-h-9 min-w-9',
            'bg-card/80 border-border/50 hover:border-primary/30 active:scale-95'
          )}
        >
          <span
            className={cn(
              'w-2.5 h-2.5 rounded-full transition-colors shadow-sm',
              langMode === 'en' ? 'bg-blue-500 shadow-blue-500/30' : 'bg-orange-500 shadow-orange-500/30'
            )}
          />
        </button>

        {/* Mood selector */}
        <div className="relative">
          <button
            onClick={() => setShowMoods(!showMoods)}
            className={cn(
              'relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all border backdrop-blur-md min-h-9 overflow-hidden isolate',
              selectedMood !== 'normal'
                ? `border-primary/50 bg-primary/5`
                : 'bg-card/80 border-border/50 hover:border-primary/30 active:scale-95'
            )}
          >
            <MoodIcon className={cn('w-3.5 h-3.5', currentMood.color)} />
            <span className="hidden sm:inline">{currentMood.label}</span>
          </button>
          {showMoods && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMoods(false)} />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-2 shadow-2xl min-w-[140px] max-h-56 overflow-y-auto">
                {MOODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        onMoodChange?.(m.id);
                        setShowMoods(false);
                        toast.info(`${m.label} mode`, { duration: 1000 });
                      }}
                      className={cn(
                        'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all overflow-hidden',
                        selectedMood === m.id
                          ? 'text-primary border border-primary/30 bg-primary/5'
                          : 'text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      <Icon className={cn('w-3.5 h-3.5', m.color)} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Continuous mode toggle */}
        <button
          onClick={() => setContinuousMode(!continuousMode)}
          className={cn(
            'flex items-center gap-1 px-2 py-1.5 rounded-full text-[11px] font-medium transition-all border backdrop-blur-md min-h-9',
            continuousMode
              ? 'bg-primary/15 border-primary/40 text-primary'
              : 'bg-card/80 border-border/50 text-muted-foreground'
          )}
        >
          <ArrowRight className="w-3 h-3" />
          <span className="hidden sm:inline">{continuousMode ? 'Auto' : 'Manual'}</span>
        </button>

        {/* Voice selector */}
        <div className="relative">
          <button
            onClick={() => setShowVoicePicker(!showVoicePicker)}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all border backdrop-blur-md min-h-9 min-w-9',
              'bg-card/80 border-border/50 hover:border-primary/30 active:scale-95'
            )}
            title="Change Voice"
          >
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          </button>
          {showVoicePicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowVoicePicker(false)} />
              <div className="absolute top-full right-0 mt-1.5 z-50 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-2 shadow-2xl w-52 max-h-72 overflow-y-auto">
                {VOICES.map((v) => (
                  <div
                    key={v.id}
                    className={cn(
                      'flex items-center gap-1 w-full px-2 py-1 rounded-xl text-xs font-medium transition-all',
                      activeVoice === v.id
                        ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                        : 'text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    <button
                      onClick={() => {
                        setActiveVoice(v.id);
                        setSavedVoice(v.id);
                        setShowVoicePicker(false);
                        toast.info(`${v.name} voice active`, { duration: 1000 });
                      }}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <span className={cn('w-2 h-2 rounded-full shrink-0', activeVoice === v.id ? 'bg-primary' : 'bg-muted-foreground/30')} />
                      <span className="flex-1">{v.name}</span>
                      <span className={cn('text-[9px] px-1 py-0.5 rounded-full font-semibold shrink-0', v.tagClass)}>{v.tag}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const prev = getSavedVoice();
                        setSavedVoice(v.id as TTSVoice);
                        speakText('Hello, this is Red Whale voice preview.').then(() => {
                          setSavedVoice(prev);
                        }).catch(() => {
                          setSavedVoice(prev);
                        });
                        toast.info(`${v.name} preview`, { duration: 1500 });
                      }}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-primary/20 transition-all shrink-0"
                      title={`Preview ${v.name}`}
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-card/80 border border-border/50 hover:bg-card hover:border-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg min-h-9 min-w-9"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Title */}
      <div className="relative z-10 mb-1 mt-10">
        <h2 className="text-xl font-bold text-center">
          <span className={cn(
            'transition-all duration-500 voice-shimmer',
            phase === 'idle' && 'text-foreground',
            phase === 'listening' && 'text-destructive',
            phase === 'processing' && 'text-accent',
            phase === 'speaking' && 'text-primary'
          )}>
            {phaseLabels[phase]}
          </span>
        </h2>
      </div>

      {/* Subtitle with noise cancellation hint */}
      <p className="relative z-10 text-xs text-muted-foreground mb-3 text-center">
        {phase === 'idle' && (
          <span className="flex items-center gap-1 justify-center">
            <MicOff className="w-3 h-3" />
            {continuousMode ? 'Flowing conversation mode' : 'Tap the orb to start'}
          </span>
        )}
        {phase === 'listening' && (
          <span className="flex items-center gap-1 justify-center">
            <Zap className="w-3 h-3 text-destructive" />
            Speak clearly — noise cancelled
          </span>
        )}
        {phase === 'processing' && 'AI is thinking...'}
        {phase === 'speaking' && 'AI is responding'}
      </p>

      {/* Real-time Audio Waveform */}
      <div className="relative z-10 flex items-end justify-center gap-[3px] h-20 mb-5 px-4 will-change-transform">
        {waveData.map((val, i) => {
          const isActive = phase === 'listening' || phase === 'speaking';
          const height = isActive
            ? Math.max(4, val * 70)
            : 4 + Math.sin(i * 0.5) * 2;
          const hue = 200 + (i / waveData.length) * 120;
          return (
            <div
              key={i}
              className="w-[4px] rounded-full transition-all duration-100"
              style={{
                height: `${height}px`,
                background: isActive
                  ? `hsl(${hue} 80% ${50 + val * 30}%)`
                  : `hsl(var(--muted-foreground) / 0.12)`,
                boxShadow: isActive
                  ? `0 0 ${2 + val * 4}px hsl(${hue} 80% 60% / ${0.3 + val * 0.5})`
                  : 'none',
                opacity: isActive ? 0.7 + val * 0.3 : 0.25,
                willChange: 'height',
              }}
            />
          );
        })}
      </div>

      {/* Premium Orb + Mic Button */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          {/* Pulse rings */}
          {[10, 20, 30].map((margin, i) => (
            <div
              key={i}
              className={cn(
                'absolute inset-0 rounded-full border-2 transition-opacity duration-500',
                phase === 'listening' && 'border-destructive/30 voice-mic-ring',
                phase === 'speaking' && 'border-primary/30 voice-mic-ring',
                (phase === 'idle' || phase === 'processing') && 'opacity-0'
              )}
              style={{ margin: `-${margin}px`, animationDelay: `${i * 0.4}s` }}
            />
          ))}

          {/* Orb button */}
          <button
            onClick={handleMicTap}
            disabled={phase === 'processing'}
            className={cn(
              'relative w-[56px] h-[56px] sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-500',
              'border-2 active:scale-95 touch-manipulation',
              phase === 'idle' && 'bg-gradient-to-br from-primary to-primary/80 border-primary/40 hover:scale-110 shadow-xl shadow-primary/25',
              phase === 'listening' && 'bg-gradient-to-br from-destructive to-destructive/80 border-destructive/50 scale-105 voice-orb-glow shadow-2xl shadow-destructive/30',
              phase === 'processing' && 'bg-gradient-to-br from-accent to-accent/80 border-accent/40 scale-95 opacity-80 shadow-lg',
              phase === 'speaking' && 'bg-gradient-to-br from-primary to-primary/80 border-primary/50 scale-105 voice-orb-glow shadow-2xl shadow-primary/30',
              'disabled:cursor-not-allowed'
            )}
          >
            {/* Inner glow */}
            <div
              className={cn(
                'absolute inset-2 rounded-full opacity-50',
                phase === 'idle' && 'bg-gradient-to-br from-primary-foreground/20 to-transparent',
                phase === 'listening' && 'bg-gradient-to-br from-destructive-foreground/30 to-transparent voice-orb-inner-pulse',
                phase === 'speaking' && 'bg-gradient-to-br from-primary-foreground/30 to-transparent voice-orb-inner-pulse',
              )}
            />

            {/* Icon */}
            <span className={cn(
              'relative z-10 text-primary-foreground transition-transform duration-300',
              phase === 'listening' && 'animate-pulse',
              phase === 'speaking' && 'animate-pulse'
            )}>
              {phase === 'idle' && <Mic className="w-6 h-6" />}
              {phase === 'listening' && <Radio className="w-6 h-6" />}
              {phase === 'processing' && <Sparkles className="w-6 h-6" />}
              {phase === 'speaking' && <Volume2 className="w-6 h-6" />}
            </span>
          </button>
        </div>

        {/* Bottom hint */}
        <p className="mt-3 text-[11px] text-muted-foreground/60 text-center max-w-[200px]">
          {phase === 'idle' && (continuousMode ? 'Tap to start a flowing conversation' : 'Tap the orb to speak')}
          {phase === 'listening' && 'Tap to stop'}
          {phase === 'processing' && 'Please wait...'}
          {phase === 'speaking' && 'Tap to stop'}
        </p>
      </div>

      {/* ===== SPEAKING POPUP — Premium Timeline & Wave ===== */}
      {showSpeakingPopup && (
        <div className="absolute bottom-6 left-4 right-4 z-50">
          <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-2xl animate-fade-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-bold text-foreground">Speaking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground tabular-nums">
                  <Timer className="w-3 h-3" />
                  <span>{audioTotal > 0 ? `${Math.floor(audioCurrent / 60)}:${String(Math.floor(audioCurrent % 60)).padStart(2, '0')} / ${Math.floor(audioTotal / 60)}:${String(Math.floor(audioTotal % 60)).padStart(2, '0')}` : `${Math.floor(speakElapsed / 60)}:${String(speakElapsed % 60).padStart(2, '0')}`}</span>
                </div>
                <button
                  onClick={() => setShowSpeakingPopup(false)}
                  className="w-6 h-6 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-all"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Real timeline progress */}
            <div className="w-full h-1 bg-muted rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
                style={{ width: `${audioProgress > 0 ? audioProgress : Math.min(100, (speakElapsed / 30) * 100)}%` }}
              />
            </div>

            {/* Sound wave */}
            <div className="flex items-end justify-center gap-[2px] h-10 mb-3">
              {popupWave.map((val, i) => {
                const height = Math.max(3, val * 36);
                const hue = 180 + (i / popupWave.length) * 80;
                return (
                  <div
                    key={i}
                    className="w-[3px] rounded-full transition-all duration-75"
                    style={{
                      height: `${height}px`,
                      background: `hsl(${hue} 80% ${50 + val * 25}%)`,
                      opacity: 0.5 + val * 0.5,
                    }}
                  />
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  stopSpeech();
                  setPhase('idle');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium transition-all"
              >
                <Pause className="w-3.5 h-3.5" />
                Stop
              </button>
              <button
                onClick={() => {
                  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
                  downloadLastTts(`red-whale-voice-${ts}.mp3`);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
