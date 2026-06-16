// useAppSettings - Global app settings (font, DPI, mood on/off, custom moods/modes)
import { useState, useEffect, useCallback } from 'react';

export interface CustomMood {
  id: string;
  name: string;
  icon: string; // lucide icon name
  prompt: string;
}

export interface CustomMode {
  id: string;
  name: string;
  instructions: string;
  icon: string; // lucide icon name
}

export type DpiScale = 'auto' | 'small' | 'medium-small' | 'medium' | 'medium-big' | 'big';

export type TypingIndicatorStyle = 'dots' | 'wave' | 'pulse' | 'orbit' | 'neon' | 'matrix' | 'fire' | 'heart';
export type CursorStyle = 'beam' | 'block' | 'underline' | 'glow';

export type VoiceGender = 'female' | 'male';

export type ApiFormat = 'gemini' | 'openai';

export interface CustomProvider {
  enabled: boolean;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  format: ApiFormat;
}

export interface AppSettings {
  fontFamily: string;
  dpiScale: DpiScale;
  moodEnabled: boolean;
  customMoods: CustomMood[];
  customModes: CustomMode[];
  cursorStyle: CursorStyle;
  typingIndicatorStyle: TypingIndicatorStyle;
  thinkingMode: boolean;
  redGlowEnabled: boolean;
  blueGlowEnabled: boolean;
  goldenGlowEnabled: boolean;
  purpleGlowEnabled: boolean;
  auroraEnabled: boolean;
  fireflyEnabled: boolean;
  starfieldEnabled: boolean;
  selectedModel: string;
  // Premium options
  soundEffects: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  compactMode: boolean;
  showAvatar: boolean;
  bubbleStyle: 'modern' | 'classic' | 'minimal';
  glowIntensity: 'low' | 'medium' | 'high';
  fontSize: 'small' | 'normal' | 'large';
  lineHeight: 'tight' | 'normal' | 'relaxed';
  codeTheme: 'dark' | 'light' | 'auto';
  sendShortcut: 'enter' | 'shift-enter';
  autoSuggest: boolean;
  messageSpacing: 'compact' | 'normal' | 'spacious';
  borderRadius: 'sharp' | 'normal' | 'round';
  glassEffect: boolean;
  hapticFeedback: boolean;
  screenWakeLock: boolean;
  networkRetry: boolean;
  autoSaveDraft: boolean;
  showTypingSpeed: boolean;
  quickReply: boolean;
  voiceSpeed: 'slow' | 'normal' | 'fast';
  voiceGender: VoiceGender;
  selectedVoice: string | null;
  speechRate: number;
  speechPitch: number;
  premiumTTS: boolean;
  customProvider: CustomProvider;
  // Ultra Premium Chat Options (30+)
  messageBookmark: boolean;
  showWordCount: boolean;
  showTokenCount: boolean;
  messageReactions: boolean;
  autoTitle: boolean;
  codeCopyButton: boolean;
  imageGenInChat: boolean;
  voiceInput: boolean;
  translateMessages: boolean;
  summarizeChat: boolean;
  continueGeneration: boolean;
  stopGeneration: boolean;
  retryGeneration: boolean;
  forkConversation: boolean;
  compareModels: boolean;
  chatStats: boolean;
  showCharCount: boolean;
  maxTokens: number;
  temperature: number;
  topP: number;
  customSystemPrompt: string;
  memoryEnabled: boolean;
  streamingEnabled: boolean;
  focusMode: boolean;
  zenMode: boolean;
  sidebarCollapsible: boolean;
  markdownPreview: boolean;
  latexRender: boolean;
  mermaidRender: boolean;
  jsonBeautify: boolean;
  csvPreview: boolean;
  // More lights
  greenGlowEnabled: boolean;
  pinkGlowEnabled: boolean;
  orangeGlowEnabled: boolean;
  tealGlowEnabled: boolean;
  neonPulseEnabled: boolean;
  cyberGridEnabled: boolean;
  // Default API
  defaultAPIEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  fontFamily: '"Lexend", system-ui, -apple-system, sans-serif',
  dpiScale: 'auto',
  moodEnabled: true,
  customMoods: [],
  customModes: [],
  cursorStyle: 'beam',
  typingIndicatorStyle: 'dots',
  thinkingMode: false,
  redGlowEnabled: true,
  blueGlowEnabled: false,
  goldenGlowEnabled: false,
  purpleGlowEnabled: false,
  auroraEnabled: false,
  fireflyEnabled: false,
  starfieldEnabled: false,
  selectedModel: 'gemini-2.5-flash',
  // Premium defaults
  soundEffects: true,
  autoScroll: true,
  showTimestamps: false,
  compactMode: false,
  showAvatar: true,
  bubbleStyle: 'modern',
  glowIntensity: 'medium',
  fontSize: 'normal',
  lineHeight: 'normal',
  codeTheme: 'auto',
  sendShortcut: 'enter',
  autoSuggest: true,
  messageSpacing: 'normal',
  borderRadius: 'normal',
  glassEffect: false,
  hapticFeedback: false,
  screenWakeLock: false,
  networkRetry: true,
  autoSaveDraft: true,
  showTypingSpeed: false,
  quickReply: true,
  voiceSpeed: 'normal',
  voiceGender: 'female',
  selectedVoice: null,
  speechRate: 1.0,
  speechPitch: 1.0,
  premiumTTS: false,
  customProvider: {
    enabled: false,
    name: 'Custom API',
    baseUrl: '',
    apiKey: '',
    model: '',
    format: 'openai',
  },
  // Ultra Premium defaults
  messageBookmark: true,
  showWordCount: false,
  showTokenCount: false,
  messageReactions: true,
  autoTitle: true,
  codeCopyButton: true,
  imageGenInChat: true,
  voiceInput: true,
  translateMessages: true,
  summarizeChat: true,
  continueGeneration: true,
  stopGeneration: true,
  retryGeneration: true,
  forkConversation: false,
  compareModels: false,
  chatStats: false,
  showCharCount: true,
  maxTokens: 8192,
  temperature: 0.7,
  topP: 0.9,
  customSystemPrompt: '',
  memoryEnabled: true,
  streamingEnabled: true,
  focusMode: false,
  zenMode: false,
  sidebarCollapsible: true,
  markdownPreview: true,
  latexRender: true,
  mermaidRender: true,
  jsonBeautify: true,
  csvPreview: true,
  // More lights defaults
  greenGlowEnabled: false,
  pinkGlowEnabled: false,
  orangeGlowEnabled: false,
  tealGlowEnabled: true,
  neonPulseEnabled: false,
  cyberGridEnabled: false,
  // Default API default
  defaultAPIEnabled: true,
};

const STORAGE_KEY = 'redwhale_app_settings';

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Force enable default API keys (user provided new keys)
        parsed.defaultAPIEnabled = true;
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Apply font family to entire app — all text elements
  useEffect(() => {
    const style = document.getElementById('rw-font-override') as HTMLStyleElement | null;
    const css = `
      html, body, div, span, p, h1, h2, h3, h4, h5, h6, a, li, td, th, label, input, textarea, button, code, pre, blockquote, small, strong, em {
        font-family: ${settings.fontFamily} !important;
      }
    `;
    if (style) {
      style.textContent = css;
    } else {
      const newStyle = document.createElement('style');
      newStyle.id = 'rw-font-override';
      newStyle.textContent = css;
      document.head.appendChild(newStyle);
    }
  }, [settings.fontFamily]);

  // Apply DPI scale
  useEffect(() => {
    const html = document.documentElement;
    const scaleMap: Record<DpiScale, string> = {
      auto: '14px',
      small: '13px',
      'medium-small': '13.5px',
      medium: '14px',
      'medium-big': '15px',
      big: '16px',
    };
    html.style.fontSize = scaleMap[settings.dpiScale];
  }, [settings.dpiScale]);

  const setFontFamily = useCallback((font: string) => {
    setSettings(prev => ({ ...prev, fontFamily: font }));
  }, []);

  const setDpiScale = useCallback((scale: DpiScale) => {
    setSettings(prev => ({ ...prev, dpiScale: scale }));
  }, []);

  const setMoodEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, moodEnabled: enabled }));
  }, []);

  const setCursorStyle = useCallback((style: CursorStyle) => {
    setSettings(prev => ({ ...prev, cursorStyle: style }));
  }, []);

  const setTypingIndicatorStyle = useCallback((style: TypingIndicatorStyle) => {
    setSettings(prev => ({ ...prev, typingIndicatorStyle: style }));
  }, []);

  const setThinkingMode = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, thinkingMode: enabled }));
  }, []);

  const setRedGlowEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, redGlowEnabled: enabled }));
  }, []);

  const setBlueGlowEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, blueGlowEnabled: enabled }));
  }, []);

  const setGoldenGlowEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, goldenGlowEnabled: enabled }));
  }, []);

  const setPurpleGlowEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, purpleGlowEnabled: enabled }));
  }, []);

  const setAuroraEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, auroraEnabled: enabled }));
  }, []);

  const setFireflyEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, fireflyEnabled: enabled }));
  }, []);

  const setStarfieldEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, starfieldEnabled: enabled }));
  }, []);

  // Premium option setters
  const setSoundEffects = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, soundEffects: enabled }));
  }, []);
  const setAutoScroll = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, autoScroll: enabled }));
  }, []);
  const setShowTimestamps = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, showTimestamps: enabled }));
  }, []);
  const setCompactMode = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, compactMode: enabled }));
  }, []);
  const setShowAvatar = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, showAvatar: enabled }));
  }, []);
  const setBubbleStyle = useCallback((style: 'modern' | 'classic' | 'minimal') => {
    setSettings(prev => ({ ...prev, bubbleStyle: style }));
  }, []);
  const setGlowIntensity = useCallback((intensity: 'low' | 'medium' | 'high') => {
    setSettings(prev => ({ ...prev, glowIntensity: intensity }));
  }, []);
  const setFontSize = useCallback((size: 'small' | 'normal' | 'large') => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  }, []);
  const setLineHeight = useCallback((height: 'tight' | 'normal' | 'relaxed') => {
    setSettings(prev => ({ ...prev, lineHeight: height }));
  }, []);
  const setCodeTheme = useCallback((theme: 'dark' | 'light' | 'auto') => {
    setSettings(prev => ({ ...prev, codeTheme: theme }));
  }, []);
  const setSendShortcut = useCallback((shortcut: 'enter' | 'shift-enter') => {
    setSettings(prev => ({ ...prev, sendShortcut: shortcut }));
  }, []);
  const setAutoSuggest = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, autoSuggest: enabled }));
  }, []);
  const setMessageSpacing = useCallback((spacing: 'compact' | 'normal' | 'spacious') => {
    setSettings(prev => ({ ...prev, messageSpacing: spacing }));
  }, []);
  const setBorderRadius = useCallback((radius: 'sharp' | 'normal' | 'round') => {
    setSettings(prev => ({ ...prev, borderRadius: radius }));
  }, []);
  const setGlassEffect = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, glassEffect: enabled }));
  }, []);
  const setHapticFeedback = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, hapticFeedback: enabled }));
  }, []);
  const setScreenWakeLock = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, screenWakeLock: enabled }));
  }, []);
  const setNetworkRetry = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, networkRetry: enabled }));
  }, []);
  const setAutoSaveDraft = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, autoSaveDraft: enabled }));
  }, []);
  const setShowTypingSpeed = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, showTypingSpeed: enabled }));
  }, []);
  const setQuickReply = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, quickReply: enabled }));
  }, []);
  const setVoiceSpeed = useCallback((speed: 'slow' | 'normal' | 'fast') => {
    setSettings(prev => ({ ...prev, voiceSpeed: speed }));
  }, []);

  // Ultra premium setters
  const setMessageBookmark = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, messageBookmark: enabled })), []);
  const setShowWordCount = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, showWordCount: enabled })), []);
  const setShowTokenCount = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, showTokenCount: enabled })), []);
  const setMessageReactions = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, messageReactions: enabled })), []);
  const setAutoTitle = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, autoTitle: enabled })), []);
  const setCodeCopyButton = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, codeCopyButton: enabled })), []);
  const setImageGenInChat = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, imageGenInChat: enabled })), []);
  const setVoiceInput = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, voiceInput: enabled })), []);
  const setTranslateMessages = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, translateMessages: enabled })), []);
  const setSummarizeChat = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, summarizeChat: enabled })), []);
  const setContinueGeneration = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, continueGeneration: enabled })), []);
  const setStopGeneration = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, stopGeneration: enabled })), []);
  const setRetryGeneration = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, retryGeneration: enabled })), []);
  const setForkConversation = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, forkConversation: enabled })), []);
  const setCompareModels = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, compareModels: enabled })), []);
  const setChatStats = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, chatStats: enabled })), []);
  const setShowCharCount = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, showCharCount: enabled })), []);
  const setMaxTokens = useCallback((tokens: number) => setSettings(prev => ({ ...prev, maxTokens: tokens })), []);
  const setTemperature = useCallback((temp: number) => setSettings(prev => ({ ...prev, temperature: temp })), []);
  const setTopP = useCallback((p: number) => setSettings(prev => ({ ...prev, topP: p })), []);
  const setCustomSystemPrompt = useCallback((prompt: string) => setSettings(prev => ({ ...prev, customSystemPrompt: prompt })), []);
  const setMemoryEnabled = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, memoryEnabled: enabled })), []);
  const setStreamingEnabled = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, streamingEnabled: enabled })), []);
  const setFocusMode = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, focusMode: enabled })), []);
  const setZenMode = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, zenMode: enabled })), []);
  const setSidebarCollapsible = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, sidebarCollapsible: enabled })), []);
  const setMarkdownPreview = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, markdownPreview: enabled })), []);
  const setLatexRender = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, latexRender: enabled })), []);
  const setMermaidRender = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, mermaidRender: enabled })), []);
  const setJsonBeautify = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, jsonBeautify: enabled })), []);
  const setCsvPreview = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, csvPreview: enabled })), []);
  // More light setters
  const setGreenGlowEnabled = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, greenGlowEnabled: enabled })), []);
  const setPinkGlowEnabled = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, pinkGlowEnabled: enabled })), []);
  const setOrangeGlowEnabled = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, orangeGlowEnabled: enabled })), []);
  const setTealGlowEnabled = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, tealGlowEnabled: enabled })), []);
  const setNeonPulseEnabled = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, neonPulseEnabled: enabled })), []);
  const setCyberGridEnabled = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, cyberGridEnabled: enabled })), []);
  const setDefaultAPIEnabled = useCallback((enabled: boolean) => setSettings(prev => ({ ...prev, defaultAPIEnabled: enabled })), []);

  const setSelectedModel = useCallback((model: string) => {
    setSettings(prev => ({ ...prev, selectedModel: model }));
    localStorage.setItem('redwhale_custom_model', model);
  }, []);

  const setVoiceGender = useCallback((gender: VoiceGender) => {
    setSettings(prev => ({ ...prev, voiceGender: gender }));
  }, []);

  const setSelectedVoice = useCallback((voice: string | null) => {
    setSettings(prev => ({ ...prev, selectedVoice: voice }));
  }, []);

  const setSpeechRate = useCallback((rate: number) => {
    setSettings(prev => ({ ...prev, speechRate: Math.max(0.5, Math.min(2.0, rate)) }));
  }, []);

  const setSpeechPitch = useCallback((pitch: number) => {
    setSettings(prev => ({ ...prev, speechPitch: Math.max(0.5, Math.min(2.0, pitch)) }));
  }, []);

  const setPremiumTTS = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, premiumTTS: enabled }));
  }, []);

  const setCustomProvider = useCallback((provider: CustomProvider) => {
    setSettings(prev => ({ ...prev, customProvider: provider }));
  }, []);

  const addCustomMood = useCallback((mood: Omit<CustomMood, 'id'>) => {
    const newMood: CustomMood = { ...mood, id: `custom_${Date.now()}` };
    setSettings(prev => ({ ...prev, customMoods: [...prev.customMoods, newMood] }));
    return newMood.id;
  }, []);

  const removeCustomMood = useCallback((id: string) => {
    setSettings(prev => ({ ...prev, customMoods: prev.customMoods.filter(m => m.id !== id) }));
  }, []);

  const addCustomMode = useCallback((mode: Omit<CustomMode, 'id'>) => {
    const newMode: CustomMode = { ...mode, id: `custommode_${Date.now()}` };
    setSettings(prev => ({ ...prev, customModes: [...prev.customModes, newMode] }));
    return newMode.id;
  }, []);

  const removeCustomMode = useCallback((id: string) => {
    setSettings(prev => ({ ...prev, customModes: prev.customModes.filter(m => m.id !== id) }));
  }, []);

  return {
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
    setSelectedModel,
    setVoiceGender,
    setSelectedVoice,
    setSpeechRate,
    setSpeechPitch,
    setPremiumTTS,
    setCustomProvider,
    addCustomMood,
    removeCustomMood,
    addCustomMode,
    removeCustomMode,
    setSoundEffects,
    setAutoScroll,
    setShowTimestamps,
    setCompactMode,
    setShowAvatar,
    setBubbleStyle,
    setGlowIntensity,
    setFontSize,
    setLineHeight,
    setCodeTheme,
    setSendShortcut,
    setAutoSuggest,
    setMessageSpacing,
    setBorderRadius,
    setGlassEffect,
    setHapticFeedback,
    setScreenWakeLock,
    setNetworkRetry,
    setAutoSaveDraft,
    setShowTypingSpeed,
    setQuickReply,
    setVoiceSpeed,
    // Ultra premium setters
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
    setFocusMode,
    setZenMode,
    setSidebarCollapsible,
    setMarkdownPreview,
    setLatexRender,
    setMermaidRender,
    setJsonBeautify,
    setCsvPreview,
    // More light setters
    setGreenGlowEnabled,
    setPinkGlowEnabled,
    setOrangeGlowEnabled,
    setTealGlowEnabled,
    setNeonPulseEnabled,
    setCyberGridEnabled,
    setDefaultAPIEnabled,
  };
}
