// VoiceInput component - Voice chat functionality
// Voice recording uses browser-native SpeechRecognition.
// Voice output uses LemonFox TTS (heart voice) via Supabase Edge Function.
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { speakText, stopSpeech } from '@/utils/voiceUtils';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
        toast.success(`Heard: "${transcript}"`);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          toast.error(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Failed to stop recognition:', error);
      }
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('🎤 Listening... Speak now');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast.error('Failed to start voice input. Please try again.');
      }
    }
  };

  const toggleSpeaking = () => {
    const newState = !isSpeakingEnabled;
    setIsSpeakingEnabled(newState);

    if (!newState) {
      stopSpeech();
      toast.info('Voice output disabled');
    } else {
      toast.success('🔊 Voice output enabled');
    }
  };

  // Expose speak function globally so chat can auto-read AI responses
  useEffect(() => {
    (window as any).nanoSpeakResponse = (text: string) => {
      if (isSpeakingEnabled) {
        speakText(text).catch(() => {
          // TTS failed silently — don't break chat
        });
      }
    };

    return () => {
      delete (window as any).nanoSpeakResponse;
    };
  }, [isSpeakingEnabled]);

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={isListening ? "default" : "outline"}
        size="icon"
        onClick={toggleListening}
        disabled={disabled}
        title={isListening ? "Stop listening" : "Start voice input"}
        className={isListening ? "animate-pulse" : ""}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </Button>

      <Button
        type="button"
        variant={isSpeakingEnabled ? "default" : "outline"}
        size="icon"
        onClick={toggleSpeaking}
        disabled={disabled}
        title={isSpeakingEnabled ? "Disable voice output" : "Enable voice output"}
      >
        {isSpeakingEnabled ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
