// @refresh reset
// ChatPage - Main chat interface for Red Whale V2
import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Trash2, Moon, Sun, MessageSquarePlus, Globe, ArrowDown, MessageSquare, Type, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatService, clearMainChatHistory } from '@/services/chat';
import type { Message, MessagePart, UploadedFile, ChatMood } from '@/types/chat';
import { toast } from 'sonner';
import type { ChatMode } from '@/components/chat/ModeSelector';
import { modes as modeList } from '@/components/chat/ModeSelector';
import { cn } from '@/lib/utils';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { ModeInfoButton } from '@/components/ModeInfoButton';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { Logo } from '@/components/Logo';
import { PremiumPopup, useAPIStatus } from '@/components/PremiumPopup';
import { TypingIndicator } from '@/components/TypingIndicator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppLanguage } from '@/contexts/AppLanguageContext';
import { isDangerousQuestion } from '@/utils/dangerDetector';
import { DangerBeep } from '@/components/chat/DangerBeep';
import { VoiceTalkDialog } from '@/components/chat/VoiceTalkDialog';
import { useAppSettings } from '@/hooks/useAppSettings';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [selectedMode, setSelectedMode] = useState<ChatMode>('auto');
  const [selectedMood, setSelectedMood] = useState<ChatMood>('normal');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('redwhale_mood');
      if (saved) setSelectedMood(saved as ChatMood);
    } catch { /* ignore */ }
  }, []);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [popupType, setPopupType] = useState<'no-api' | 'quota-exhausted' | 'default-exhausted' | null>(null);
  const [popupTrigger, setPopupTrigger] = useState(false);
  const [dangerousMessageIds, setDangerousMessageIds] = useState<Set<string>>(new Set());
  const [dangerBeepTrigger, setDangerBeepTrigger] = useState(false);
  const [voiceTalkOpen, setVoiceTalkOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      setIsMobile(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768
      );
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaViewportRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { theme, setTheme } = useTheme();
  const { hasAPIKeys, quotaExhausted, defaultApiExhausted, markQuotaExhausted } = useAPIStatus();
  const { language, setLanguage, languageLabel } = useLanguage();
  const { t } = useAppLanguage();
  const {
    settings,
    setFontFamily,
    setDpiScale,
    setMoodEnabled,
    setCursorStyle,
    setTypingIndicatorStyle,
    setThinkingMode,
    setRedGlowEnabled,
    setBlueGlowEnabled,
    setGoldenGlowEnabled,
    setPurpleGlowEnabled,
    setAuroraEnabled,
    setFireflyEnabled,
    setStarfieldEnabled,
    setSoundEffects,
    setAutoScroll,
    setShowTimestamps,
    setCompactMode,
    setShowAvatar,
    setBubbleStyle,
    setGlowIntensity,
    setFontSize,
    setMessageSpacing,
    setQuickReply,
    setMessageBookmark,
    setShowWordCount,
    setShowTokenCount,
    setMessageReactions,
    setAutoTitle,
    setCodeCopyButton,
    setImageGenInChat,
    setVoiceInput,
    setTranslateMessages,
    setSummarizeChat,
    setContinueGeneration,
    setStopGeneration,
    setRetryGeneration,
    setForkConversation,
    setCompareModels,
    setChatStats,
    setShowCharCount,
    setMaxTokens,
    setTemperature,
    setTopP,
    setCustomSystemPrompt,
    setMemoryEnabled,
    setStreamingEnabled,
    setSidebarCollapsible,
    setMarkdownPreview,
    setLatexRender,
    setMermaidRender,
    setJsonBeautify,
    setCsvPreview,
    setGreenGlowEnabled,
    setPinkGlowEnabled,
    setOrangeGlowEnabled,
    setTealGlowEnabled,
    setNeonPulseEnabled,
    setCyberGridEnabled,
    setDefaultAPIEnabled,
    addCustomMood,
    removeCustomMood,
    addCustomMode,
    removeCustomMode,
    resetSettings,
  } = useAppSettings();

  // Temporary chat mode — no history saved, auto-clear on refresh
  const [tempChatEnabled, setTempChatEnabled] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('redwhale_temp_chat') === 'true';
      setTempChatEnabled(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('redwhale_temp_chat', String(tempChatEnabled)); } catch { /* ignore */ }
  }, [tempChatEnabled]);

  const streamingTextRef = useRef('');
  const lastUpdateTimeRef = useRef(0);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastWasDangerousRef = useRef(false);

  // Persist mood selection
  useEffect(() => {
    localStorage.setItem('redwhale_mood', selectedMood);
  }, [selectedMood]);

  // Show popup if no API keys on mount or default APIs exhausted
  useEffect(() => {
    if (!hasAPIKeys) {
      setPopupType('no-api');
      setPopupTrigger(true);
    } else if (defaultApiExhausted) {
      setPopupType('default-exhausted');
      setPopupTrigger(true);
    }
  }, [hasAPIKeys, defaultApiExhausted]);

  // Auto-restore chat on mount
  useEffect(() => {
    const stored = localStorage.getItem('redwhale_current_chat');
    if (stored) {
      try {
        const { messages: savedMessages, timestamp } = JSON.parse(stored);
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        if (now - timestamp < tenMinutes && savedMessages && savedMessages.length > 0) {
          const restoredMessages = savedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(restoredMessages);
          setShowIntro(false);
          toast.success('Previous chat restored');
        } else {
          localStorage.removeItem('redwhale_current_chat');
        }
      } catch (e) {
        localStorage.removeItem('redwhale_current_chat');
      }
    }
  }, []);

  // Auto-save chat
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const messagesToSave = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        }));
        localStorage.setItem('redwhale_current_chat', JSON.stringify({
          messages: messagesToSave,
          timestamp: Date.now(),
        }));
      } catch (e) {
        console.error('Failed to save chat:', e);
      }
    }
  }, [messages]);

  // Find ScrollArea viewport and auto-scroll + track position
  useEffect(() => {
    // Find the Radix ScrollArea viewport
    const findViewport = () => {
      const el = document.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement | null;
      if (el && el !== scrollAreaViewportRef.current) {
        scrollAreaViewportRef.current = el;
      }
      return scrollAreaViewportRef.current;
    };

    const vp = findViewport();
    if (vp) {
      // Only auto-scroll if user is near bottom (within 180px)
      // This allows user to scroll up and read previous messages while AI types
      const threshold = 180;
      const distanceFromBottom = vp.scrollHeight - vp.scrollTop - vp.clientHeight;
      if (distanceFromBottom < threshold) {
        vp.scrollTop = vp.scrollHeight;
      }

      // Attach scroll listener for scroll-to-bottom button visibility
      const handleScroll = () => {
        const btnThreshold = 120;
        const dist = vp.scrollHeight - vp.scrollTop - vp.clientHeight;
        setShowScrollToBottom(dist > btnThreshold);
      };
      vp.addEventListener('scroll', handleScroll);
      handleScroll();

      return () => vp.removeEventListener('scroll', handleScroll);
    }
  }, [messages, streamingMessage]);

  const scrollToBottom = () => {
    const vp = scrollAreaViewportRef.current;
    if (vp) {
      vp.scrollTo({ top: vp.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    return () => {
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    };
  }, []);

  const handleModeChange = (mode: ChatMode) => {
    setSelectedMode(mode);
    const modeLabel = modeList.find(m => m.id === mode)?.label || mode.toUpperCase();
    toast.success(`${modeLabel} mode active`);
  };

  const handleSend = async (text: string, files?: UploadedFile[]) => {
    // Check if API keys exist before sending
    if (!hasAPIKeys) {
      setPopupType('no-api');
      setPopupTrigger(true);
      return;
    }
    if (quotaExhausted) {
      setPopupType('quota-exhausted');
      setPopupTrigger(true);
      return;
    }
    if (defaultApiExhausted) {
      setPopupType('default-exhausted');
      setPopupTrigger(true);
      return;
    }

    try {
      const parts: MessagePart[] = [];
      if (text) parts.push({ text });
      if (files && files.length > 0) {
        files.forEach(file => {
          parts.push({ inlineData: { mimeType: file.type, data: file.data } });
        });
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        parts,
        timestamp: new Date(),
      };

      // Danger detection: check if question contains dangerous keywords
      const isDanger = isDangerousQuestion(text);
      lastWasDangerousRef.current = isDanger;
      if (isDanger) {
        setDangerBeepTrigger(true);
        setDangerousMessageIds(prev => new Set(prev).add(userMessage.id));
        toast('DANGER ZONE ACTIVATED', {
          description: 'Detected dangerous keywords in your question',
          duration: 3000,
        });
        // Reset beep trigger after it plays
        setTimeout(() => setDangerBeepTrigger(false), 5500);
      }

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setStreamingMessage('');
      streamingTextRef.current = '';
      lastUpdateTimeRef.current = 0;

      const contents = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      }));

      const THROTTLE_MS = 150;
      // Wire all modes to their respective flags — NO 'all' here, 'all' has its own handler
      const showThinking = settings.thinkingMode || selectedMode === 'think' || selectedMode === 'deep';
      const deepSearch = selectedMode === 'deep';
      const proMode = selectedMode === 'pro';
      const webSearch = selectedMode === 'rtm';
      const realTimeMode = selectedMode === 'rtm';
      const codeMode = selectedMode === 'code';
      const studyMode = selectedMode === 'study';
      const fastMode = selectedMode === 'fast';
      const stepByStepMode = selectedMode === 'stepbystep';
      const redWhaleMode = selectedMode === 'redwhale';
      const howToBuildMode = selectedMode === 'builder';
      const webSecretMode = selectedMode === 'web';
      const planningMode = selectedMode === 'think';
      const rwV1SuperMode = selectedMode === 'all';

      const controller = new AbortController();
      setAbortController(controller);

      ChatService.streamChatSSE(
        contents,
        deepSearch, proMode, webSearch, showThinking, realTimeMode,
        codeMode, false, studyMode, fastMode, redWhaleMode, stepByStepMode,
        false, false, 'android', howToBuildMode, planningMode, false, false, rwV1SuperMode, webSecretMode, false,
        language,
        selectedMood,
        selectedMode,
        controller.signal,
        (chunk: string) => {
          streamingTextRef.current = chunk;
          const now = Date.now();
          if (now - lastUpdateTimeRef.current >= THROTTLE_MS) {
            setStreamingMessage(chunk);
            lastUpdateTimeRef.current = now;
          } else {
            if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
            updateTimerRef.current = setTimeout(() => {
              setStreamingMessage(streamingTextRef.current);
              lastUpdateTimeRef.current = Date.now();
              updateTimerRef.current = null;
            }, THROTTLE_MS - (now - lastUpdateTimeRef.current));
          }
        },
        () => {
          if (updateTimerRef.current) {
            clearTimeout(updateTimerRef.current);
            updateTimerRef.current = null;
          }
          const finalText = streamingTextRef.current;
          if (finalText) {
            setStreamingMessage(finalText);
            setTimeout(() => {
              const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                parts: [{ text: finalText }],
                timestamp: new Date(),
              };
              if (lastWasDangerousRef.current) {
                setDangerousMessageIds(prev => new Set(prev).add(botMessage.id));
                lastWasDangerousRef.current = false;
              }
              setMessages((prev) => [...prev, botMessage]);
              setStreamingMessage('');
              setIsLoading(false);
              streamingTextRef.current = '';
              // Sound effect on message receive
              if (settings.soundEffects) {
                try {
                  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
                  audio.volume = 0.3;
                  audio.play().catch(() => {});
                } catch { /* ignore */ }
              }
              // Haptic feedback
              if (settings.hapticFeedback && 'vibrate' in navigator) {
                navigator.vibrate(50);
              }
            }, 100);
          } else {
            setStreamingMessage('');
            setIsLoading(false);
            streamingTextRef.current = '';
          }
        },
        (error: string) => {
          if (updateTimerRef.current) {
            clearTimeout(updateTimerRef.current);
            updateTimerRef.current = null;
          }
          if (error !== 'ABORTED') {
            // Detect quota exhausted or no API keys
            const lowerError = error.toLowerCase();
            if (lowerError.includes('no api keys') || lowerError.includes('no_api_keys')) {
              setPopupType('no-api');
              setPopupTrigger(true);
            } else if (lowerError.includes('exhausted') || lowerError.includes('quota') || lowerError.includes('429')) {
              // Check if only default APIs were being used
              const customKeys = localStorage.getItem('redwhale_custom_api_keys');
              const hasCustom = customKeys && JSON.parse(customKeys).length > 0;
              if (!hasCustom && defaultApiExhausted) {
                setPopupType('default-exhausted');
              } else {
                setPopupType('quota-exhausted');
              }
              setPopupTrigger(true);
              markQuotaExhausted();
            } else {
              toast.error(error, { duration: 8000, style: { whiteSpace: 'pre-line', maxWidth: '500px' } });
              // Add error message so user can retry
              const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                parts: [{ text: `[Error: ${error}]\n\nClick Retry to try again.` }],
                timestamp: new Date(),
                error: true,
              };
              if (lastWasDangerousRef.current) {
                setDangerousMessageIds(prev => new Set(prev).add(errorMessage.id));
              }
              setMessages((prev) => [...prev, errorMessage]);
            }
          }
          setStreamingMessage('');
          setIsLoading(false);
          streamingTextRef.current = '';
          setAbortController(null);
        }
      );
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0 && showIntro) {
      const timer = setTimeout(() => setShowIntro(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [messages.length, showIntro]);

  // Voice Talk — send message and return AI response text (for voice-to-voice)
  const handleVoiceTalkMessage = async (text: string, overrideLang?: string, voiceMood?: ChatMood): Promise<string> => {
    if (!hasAPIKeys) {
      setPopupType('no-api');
      setPopupTrigger(true);
      throw new Error('No API keys');
    }
    if (quotaExhausted) {
      setPopupType('quota-exhausted');
      setPopupTrigger(true);
      throw new Error('Quota exhausted');
    }
    if (defaultApiExhausted) {
      setPopupType('default-exhausted');
      setPopupTrigger(true);
      throw new Error('Default API exhausted');
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ text }],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const contents = [...messages, userMessage].map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    }));

    return new Promise<string>((resolve, reject) => {
      let finalText = '';
      const controller = new AbortController();
      setAbortController(controller);

      ChatService.streamChatSSE(
        contents,
        false, false, false, false, false,
        false, false, false, false, false, false,
        false, false, 'android', false, false, false, false, false, false, false,
        (overrideLang as any) || language,
        voiceMood || selectedMood,
        selectedMode,
        controller.signal,
        (chunk: string) => {
          finalText = chunk;
        },
        () => {
          if (finalText) {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'model',
              parts: [{ text: finalText }],
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
          }
          setIsLoading(false);
          setAbortController(null);
          resolve(finalText);
        },
        (error: string) => {
          setIsLoading(false);
          setAbortController(null);
          if (error !== 'ABORTED') {
            reject(new Error(error));
          } else {
            resolve(finalText);
          }
        }
      );
    });
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    if (streamingMessage) {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: [{ text: streamingMessage + '\n\n[User stopped]' }],
        timestamp: new Date(),
      };
      if (lastWasDangerousRef.current) {
        setDangerousMessageIds(prev => new Set(prev).add(botMessage.id));
      }
      setMessages((prev) => [...prev, botMessage]);
    }
    setIsLoading(false);
    setStreamingMessage('');
    streamingTextRef.current = '';
    toast.info('Response stopped');
  };

  const handleLoadChat = (loadedMessages: Message[]) => {
    setMessages(loadedMessages);
    setShowIntro(false);
    toast.success('Chat loaded');
  };

  const handleNewChat = () => {
    // Save current chat to session history before clearing
    if (messages.length > 0) {
      try {
        const now = Date.now();
        const stored = localStorage.getItem('redwhale_chat_sessions');
        const sessions = stored ? JSON.parse(stored) : [];
        const messagesToSave = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        }));
        const newSession = {
          id: `chat_${now}`,
          title: messages[0]?.parts?.[0]?.text?.substring(0, 50) || 'New Chat',
          messages: messagesToSave,
          createdAt: now,
          expiresAt: now + (10 * 60 * 1000), // 10 minutes
        };
        const updated = [newSession, ...sessions].slice(0, 20);
        localStorage.setItem('redwhale_chat_sessions', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save chat session on new chat:', e);
      }
    }

    setMessages([]);
    setStreamingMessage('');
    setShowIntro(true);
    localStorage.removeItem('redwhale_current_chat');
    toast.success('New chat started');
  };

  const handleClear = () => {
    setMessages([]);
    setStreamingMessage('');
    streamingTextRef.current = '';
    setShowIntro(true);
    localStorage.removeItem('redwhale_current_chat');
    clearMainChatHistory();
    toast.success('Conversation cleared — memory wiped');
  };

  const handleEdit = (messageId: string, newText: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === messageId);
      if (idx === -1) return prev;

      // Update the edited message
      const updated = [...prev];
      updated[idx] = { ...updated[idx], parts: [{ text: newText }] };

      // Remove all messages after this one (they become invalid)
      const truncated = updated.slice(0, idx + 1);
      return truncated;
    });

    // Auto-resend after a short delay
    setTimeout(() => {
      handleSend(newText);
    }, 100);
  };

  const handleRetry = (messageId: string) => {
    // Find the failed message and user message before it
    const idx = messages.findIndex((m) => m.id === messageId);
    if (idx === -1) return;

    let userMsg: Message | null = null;
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMsg = messages[i];
        break;
      }
    }
    if (!userMsg) return;

    // Remove the failed AI message
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    // Resend the user message text
    const text = userMsg.parts.map((p) => p.text).join(' ');
    setTimeout(() => handleSend(text), 100);
  };

  const toggleTheme = () => {
    import('@/components/ThemeTransition').then(({ triggerThemeTransition }) => {
      triggerThemeTransition();
    });
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      <Helmet>
        <title>Red Whale V2</title>
        <meta name="description" content="Red Whale V2 — Powerful AI Assistant" />
      </Helmet>

      {/* Premium Popup for API issues */}
      <PremiumPopup trigger={popupTrigger} type={popupType} onClose={() => setPopupTrigger(false)} />

      {/* Danger Zone Beep Alarm */}
      <DangerBeep trigger={dangerBeepTrigger} />

      {/* Top Header - Ultra Clean */}
      <header className="shrink-0 z-50 bg-transparent">
        <div className="flex items-center justify-between h-10 px-3">
          {/* Left - Chat History (hamburger) + Mode Badge + Settings + Mode Info */}
          <div className="flex items-center gap-1">
            <ChatHistory
              currentMessages={messages}
              onLoadChat={handleLoadChat}
              onNewChat={handleNewChat}
              customModes={settings.customModes}
              tempChatEnabled={tempChatEnabled}
            />
            <SettingsDrawer
              onClearChat={handleClear}
              messagesCount={messages.length}
              messages={messages}
              settings={settings}
              setFontFamily={setFontFamily}
              setDpiScale={setDpiScale}
              setMoodEnabled={setMoodEnabled}
              setCursorStyle={setCursorStyle}
              setTypingIndicatorStyle={setTypingIndicatorStyle}
              setThinkingMode={setThinkingMode}
              setRedGlowEnabled={setRedGlowEnabled}
              setBlueGlowEnabled={setBlueGlowEnabled}
              setGoldenGlowEnabled={setGoldenGlowEnabled}
              setPurpleGlowEnabled={setPurpleGlowEnabled}
              setAuroraEnabled={setAuroraEnabled}
              setFireflyEnabled={setFireflyEnabled}
              setStarfieldEnabled={setStarfieldEnabled}
              setSoundEffects={setSoundEffects}
              setAutoScroll={setAutoScroll}
              setShowTimestamps={setShowTimestamps}
              setCompactMode={setCompactMode}
              setShowAvatar={setShowAvatar}
              setBubbleStyle={setBubbleStyle}
              setGlowIntensity={setGlowIntensity}
              setFontSize={setFontSize}
              setMessageSpacing={setMessageSpacing}
              setQuickReply={setQuickReply}
              setMessageBookmark={setMessageBookmark}
              setShowWordCount={setShowWordCount}
              setShowTokenCount={setShowTokenCount}
              setMessageReactions={setMessageReactions}
              setAutoTitle={setAutoTitle}
              setCodeCopyButton={setCodeCopyButton}
              setImageGenInChat={setImageGenInChat}
              setVoiceInput={setVoiceInput}
              setTranslateMessages={setTranslateMessages}
              setSummarizeChat={setSummarizeChat}
              setContinueGeneration={setContinueGeneration}
              setStopGeneration={setStopGeneration}
              setRetryGeneration={setRetryGeneration}
              setForkConversation={setForkConversation}
              setCompareModels={setCompareModels}
              setChatStats={setChatStats}
              setShowCharCount={setShowCharCount}
              setMaxTokens={setMaxTokens}
              setTemperature={setTemperature}
              setTopP={setTopP}
              setCustomSystemPrompt={setCustomSystemPrompt}
              setMemoryEnabled={setMemoryEnabled}
              setStreamingEnabled={setStreamingEnabled}
              setSidebarCollapsible={setSidebarCollapsible}
              setMarkdownPreview={setMarkdownPreview}
              setLatexRender={setLatexRender}
              setMermaidRender={setMermaidRender}
              setJsonBeautify={setJsonBeautify}
              setCsvPreview={setCsvPreview}
              setGreenGlowEnabled={setGreenGlowEnabled}
              setPinkGlowEnabled={setPinkGlowEnabled}
              setOrangeGlowEnabled={setOrangeGlowEnabled}
              setTealGlowEnabled={setTealGlowEnabled}
              setNeonPulseEnabled={setNeonPulseEnabled}
              setCyberGridEnabled={setCyberGridEnabled}
              setDefaultAPIEnabled={setDefaultAPIEnabled}
              addCustomMood={addCustomMood}
              removeCustomMood={removeCustomMood}
              addCustomMode={addCustomMode}
              removeCustomMode={removeCustomMode}
              resetSettings={resetSettings}
              tempChatEnabled={tempChatEnabled}
              onTempChatToggle={setTempChatEnabled}
              selectedMode={selectedMode}
              onModeChange={handleModeChange}
            />
            <ModeInfoButton />
            {/* Temporary Chat Badge */}
            {tempChatEnabled && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[9px] font-bold tracking-wider border border-amber-500/20 animate-pulse">
                TEMP
              </span>
            )}
          </div>

          {/* Center - Mode name */}
          <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <p className="text-[11px] font-bold tracking-widest uppercase text-foreground">
              {modeList.find(m => m.id === selectedMode)?.label || 'AUTO'}
            </p>
          </div>

          {/* Right - Theme + New Chat + Clear */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-full hover:bg-primary/10 transition-all"
            >
              <div className="relative w-4 h-4">
                <Sun
                  className="w-4 h-4 text-amber-500 absolute inset-0 transition-all duration-500"
                  style={{
                    opacity: theme === 'dark' ? 1 : 0,
                    transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
                  }}
                />
                <Moon
                  className="w-4 h-4 text-indigo-500 absolute inset-0 transition-all duration-500"
                  style={{
                    opacity: theme === 'dark' ? 0 : 1,
                    transform: theme === 'dark' ? 'rotate(-90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
                  }}
                />
              </div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="h-8 w-8 rounded-full hover:bg-primary/10 transition-all"
            >
              <MessageSquarePlus className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={messages.length === 0 && !streamingMessage}
              className="h-8 w-8 rounded-full hover:bg-destructive/10 transition-all disabled:opacity-30"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area — Full bleed, no window borders, edge-to-edge */}
      <div className="flex-1 overflow-hidden relative">


        {/* Solid Intro Screen — fixed center, does NOT scroll */}
        {messages.length === 0 && !streamingMessage && showIntro && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
            <Logo size="lg" />
            <h2 className="text-lg sm:text-xl font-black tracking-wider text-foreground mt-2 mb-0.5">
              Ask Anything
            </h2>
            <p className="text-sm sm:text-base font-black tracking-[0.25em] mt-1">
              <span className="bg-gradient-to-r from-blue-500 via-cyan-400 via-sky-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer-text_3s_linear_infinite]">
                by Shujan
              </span>
            </p>
            {/* RED WHALE + Unrestricted AI tags */}
            <div className="mt-3 flex items-center gap-2">
              <div className="px-3 py-1 rounded-full border border-red-500/40 bg-gradient-to-r from-red-600/80 via-red-500/80 to-red-600/80 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                <span className="text-[10px] font-black tracking-widest uppercase text-white">
                  RED WHALE
                </span>
              </div>
              <div className="px-3 py-1 rounded-full border border-yellow-500/40 bg-black shadow-[0_0_12px_rgba(234,179,8,0.2)]">
                <span className="text-[10px] font-bold tracking-widest uppercase bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                  Unrestricted AI
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Focus Mode Overlay */}
        {settings.focusMode && (
          <div className="absolute inset-0 z-[60] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Logo size="md" />
              </div>
              <p className="text-lg font-bold text-foreground">Focus Mode</p>
              <p className="text-sm text-muted-foreground max-w-[200px]">Distraction-free conversation. Press ESC to exit.</p>
            </div>
          </div>
        )}

        {/* Zen Mode Overlay */}
        {settings.zenMode && (
          <div className="absolute inset-0 z-[60] bg-background flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Logo size="lg" />
              </div>
              <p className="text-2xl font-black text-foreground">Zen Mode</p>
              <p className="text-sm text-muted-foreground max-w-[240px]">Minimal. Calm. Centered. Open Settings to turn off Zen Mode.</p>
            </div>
          </div>
        )}

        {/* Scrollable Chat Messages — only when messages exist */}
        {(messages.length > 0 || streamingMessage || isLoading) && (
          <ScrollArea className="h-full w-full relative z-10" style={{ fontFamily: settings.fontFamily }}>
            <div ref={scrollRef} className="px-2 py-3 md:px-4 md:py-4 chat-selectable">
              <div>
                {messages.map((message, idx) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    messageIndex={idx}
                    onEdit={handleEdit}
                    onRetry={handleRetry}
                    isDangerous={dangerousMessageIds.has(message.id)}
                    showTimestamps={settings.showTimestamps}
                    compactMode={settings.compactMode}
                    showAvatar={settings.showAvatar}
                    bubbleStyle={settings.bubbleStyle}
                    fontSize={settings.fontSize}
                    messageSpacing={settings.messageSpacing}
                    glassEffect={settings.glassEffect}
                    mood={settings.moodEnabled ? selectedMood : undefined}
                  />
                ))}

                {streamingMessage && (
                  <ChatMessage
                    message={{
                      id: 'streaming',
                      role: 'model',
                      parts: [{ text: streamingMessage }],
                      timestamp: new Date(),
                    }}
                    isDangerous={lastWasDangerousRef.current}
                    isStreaming
                    showTimestamps={settings.showTimestamps}
                    compactMode={settings.compactMode}
                    showAvatar={settings.showAvatar}
                    bubbleStyle={settings.bubbleStyle}
                    fontSize={settings.fontSize}
                    messageSpacing={settings.messageSpacing}
                    glassEffect={settings.glassEffect}
                    mood={settings.moodEnabled ? selectedMood : undefined}
                  />
                )}

                {isLoading && !streamingMessage && <TypingIndicator style={settings.typingIndicatorStyle} />}
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Streaming Action Buttons */}
        {streamingMessage && isLoading && (
          <div className="shrink-0 z-20 px-3 py-1.5 bg-card/80 backdrop-blur-sm border-t border-border/30 flex items-center justify-center gap-2">
            {settings.stopGeneration && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
                className="h-7 text-[11px] rounded-full border-red-500/30 text-red-500 hover:bg-red-500/10"
              >
                Stop
              </Button>
            )}
            {settings.continueGeneration && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] rounded-full border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
              >
                Continue
              </Button>
            )}
            {settings.retryGeneration && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] rounded-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
              >
                Regenerate
              </Button>
            )}
          </div>
        )}

        {/* Chat Stats Bar */}
        {settings.chatStats && messages.length > 0 && (
          <div className="shrink-0 z-20 px-3 py-1.5 bg-card/80 backdrop-blur-sm border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {messages.length} msgs
              </span>
              {settings.showWordCount && (
                <span className="flex items-center gap-1">
                  <Type className="w-3 h-3" />
                  {messages.reduce((acc, m) => acc + m.parts.map(p => p.text?.split(/\s+/).length || 0).reduce((a, b) => a + b, 0), 0)} words
                </span>
              )}
              {settings.showCharCount && (
                <span className="flex items-center gap-1">
                  <AlignLeft className="w-3 h-3" />
                  {messages.reduce((acc, m) => acc + m.parts.map(p => p.text?.length || 0).reduce((a, b) => a + b, 0), 0)} chars
                </span>
              )}
            </div>
            {settings.autoTitle && messages.length >= 2 && (
              <span className="text-[11px] text-primary/70 truncate max-w-[150px]">
                {messages[0].parts[0]?.text?.slice(0, 30) || 'Chat'}...
              </span>
            )}
          </div>
        )}

        {/* Scroll to Bottom Floating Button — centered above input, arrow only */}
        {showScrollToBottom && messages.length > 0 && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-10 h-10 rounded-full bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary transition-all animate-bounce"
            title="Bottom"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        onVoiceTranscript={(text) => {
          // Append voice text to current input or trigger send
          // The ChatInput handles appending to its internal state
        }}
        onVoiceTalk={() => setVoiceTalkOpen(true)}
        disabled={isLoading}
        isLoading={isLoading}
        selectedMode={selectedMode}
        onModeChange={handleModeChange}
        selectedMood={selectedMood}
        onMoodChange={setSelectedMood}
        moodEnabled={settings.moodEnabled}
        customMoods={settings.customMoods}
        customModes={settings.customModes}
        cursorStyle={settings.cursorStyle}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Voice Talk Premium Dialog */}
      <VoiceTalkDialog
        open={voiceTalkOpen}
        onClose={() => setVoiceTalkOpen(false)}
        onSendMessage={handleVoiceTalkMessage}
        selectedMood={selectedMood}
        onMoodChange={setSelectedMood}
      />
    </div>
  );
}
