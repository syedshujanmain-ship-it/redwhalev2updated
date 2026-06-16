// FloatingTTSPlayer - Global floating TTS player bar
// Shows at top when any TTS is playing in chat
import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Download, Timer, Pause } from 'lucide-react';
import { isSpeaking, stopSpeech, downloadLastTts, getAudioProgress, getAudioDuration, getAudioCurrentTime } from '@/utils/voiceUtils';
import { cn } from '@/lib/utils';

export function FloatingTTSPlayer() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveData, setWaveData] = useState<number[]>(new Array(32).fill(0.1));
  const animRef = useRef<number>(0);
  const progressRef = useRef<number>(0);

  // Monitor TTS state + real progress
  useEffect(() => {
    let wasSpeaking = false;
    const check = () => {
      const speaking = isSpeaking();
      if (speaking && !wasSpeaking) {
        setVisible(true);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
      } else if (!speaking && wasSpeaking) {
        setTimeout(() => setVisible(false), 1200);
      }
      wasSpeaking = speaking;

      // Real timeline progress
      if (speaking) {
        setProgress(getAudioProgress() * 100);
        setCurrentTime(getAudioCurrentTime());
        setDuration(getAudioDuration());
      }
    };
    const timer = window.setInterval(check, 200);
    return () => clearInterval(timer);
  }, []);

  // Wave animation
  useEffect(() => {
    if (!visible) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    let t = 0;
    const animate = () => {
      t += 0.18;
      const data = new Array(32).fill(0).map((_, i) => {
        const base = Math.sin(t + i * 0.35) * 0.5 + 0.5;
        const sec = Math.sin(t * 1.4 + i * 0.5) * 0.25;
        const noise = Math.random() * 0.12;
        return Math.min(1, Math.max(0.08, base + sec + noise));
      });
      setWaveData(data);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [visible]);

  const handleStop = () => {
    stopSpeech();
    setVisible(false);
  };

  const handleDownload = () => {
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadLastTts(`red-whale-voice-${ts}.mp3`);
  };

  const fmt = (n: number) => {
    const m = Math.floor(n / 60);
    const s = String(Math.floor(n % 60)).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div
      className={cn(
        'fixed top-3 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-1.5rem)] max-w-md transition-all duration-500',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'
      )}
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-3 overflow-hidden">
        {/* Top row: icon, label, timer, close */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-foreground">Speaking</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 tabular-nums">
              <Timer className="w-3 h-3" />
              {fmt(currentTime)} / {fmt(duration)}
            </span>
            <button
              onClick={handleStop}
              className="w-6 h-6 rounded-full bg-muted/60 hover:bg-destructive/20 flex items-center justify-center transition-all"
            >
              <VolumeX className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>

        {/* Real timeline progress */}
        <div className="w-full h-1 bg-muted rounded-full mb-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Sound wave */}
        <div className="flex items-end justify-center gap-[2px] h-8 mb-2">
          {waveData.map((val, i) => {
            const height = Math.max(2, val * 28);
            const hue = 200 + (i / waveData.length) * 80;
            return (
              <div
                key={i}
                className="w-[3px] rounded-full transition-all duration-75"
                style={{
                  height: `${height}px`,
                  background: `hsl(${hue} 80% ${55 + val * 25}%)`,
                  opacity: 0.5 + val * 0.5,
                }}
              />
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStop}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-[11px] font-medium transition-all"
          >
            <Pause className="w-3 h-3" />
            Stop
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-medium transition-all"
          >
            <Download className="w-3 h-3" />
            Save Voice
          </button>
        </div>
      </div>
    </div>
  );
}
