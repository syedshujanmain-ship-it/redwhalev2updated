// TTSPlayer - Text-to-Speech for AI messages
// Uses LemonFox TTS (heart voice) via Supabase Edge Function.
import { useState, useCallback, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { speakText, stopSpeech, isSpeaking as getIsSpeaking } from '@/utils/voiceUtils';

interface TTSPlayerProps {
  text: string;
}

export function TTSPlayer({ text }: TTSPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pollRef = useRef<number>(0);

  // Poll to detect when audio actually starts/ends
  useEffect(() => {
    if (!isLoading && !isPlaying) return;
    pollRef.current = window.setInterval(() => {
      const speaking = getIsSpeaking();
      if (isLoading && speaking) {
        setIsLoading(false);
        setIsPlaying(true);
      }
      if (isPlaying && !speaking) {
        setIsPlaying(false);
        setIsLoading(false);
      }
    }, 200);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [isLoading, isPlaying]);

  const speak = useCallback(async () => {
    setIsLoading(true);
    try {
      await speakText(text);
    } catch {
      toast.error('Voice playback failed. Please try again.');
    }
    setIsLoading(false);
    setIsPlaying(false);
  }, [text]);

  const stop = useCallback(() => {
    stopSpeech();
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const active = isLoading || isPlaying;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={active ? stop : speak}
      className="h-6 px-2 text-[10px] rounded-full"
      title={active ? 'Stop speaking' : 'Read aloud'}
    >
      {isLoading ? (
        <><Loader2 className="w-3 h-3 mr-1 animate-spin text-primary" /> Loading voice…</>
      ) : isPlaying ? (
        <><VolumeX className="w-3 h-3 mr-1 text-destructive" /> Stop</>
      ) : (
        <><Volume2 className="w-3 h-3 mr-1" /> Speak</>
      )}
    </Button>
  );
}
