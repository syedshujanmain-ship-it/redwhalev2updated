import { useState, useEffect } from 'react';
import { Settings, Code2, Paintbrush, Key, Trash2, Moon, Sun, Github, FileDown, Wand2, Lock, Smartphone, Sparkles, Type, Monitor, ToggleLeft, ToggleRight, Plus, X, Trash2Icon, Brain, Zap, Globe, Crown, Rocket, Hammer, GraduationCap, Radio, ListOrdered, Waves, ChevronDown, Clock, Flame, Heart, Star, Ghost, Skull, Smile, Volume2, Check, RotateCcw } from 'lucide-react';
import { VoiceSelector } from '@/components/VoiceSelector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useGlowMode } from '@/contexts/GlowModeContext';

const FONT_OPTIONS = [
  { id: 'Inter', name: 'Inter', family: "'Inter', sans-serif" },
  { id: 'Poppins', name: 'Poppins', family: "'Poppins', sans-serif" },
  { id: 'Montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif" },
  { id: 'Nunito', name: 'Nunito', family: "'Nunito', sans-serif" },
  { id: 'Quicksand', name: 'Quicksand', family: "'Quicksand', sans-serif" },
  { id: 'Raleway', name: 'Raleway', family: "'Raleway', sans-serif" },
  { id: 'Outfit', name: 'Outfit', family: "'Outfit', sans-serif" },
  { id: 'DM Sans', name: 'DM Sans', family: "'DM Sans', sans-serif" },
  { id: 'Manrope', name: 'Manrope', family: "'Manrope', sans-serif" },
  { id: 'Space Grotesk', name: 'Space Grotesk', family: "'Space Grotesk', sans-serif" },
  { id: 'Sora', name: 'Sora', family: "'Sora', sans-serif" },
  { id: 'Syne', name: 'Syne', family: "'Syne', sans-serif" },
  { id: 'Lexend', name: 'Lexend', family: "'Lexend', sans-serif" },
  { id: 'Playfair Display', name: 'Playfair Display', family: "'Playfair Display', serif" },
  { id: 'Merriweather', name: 'Merriweather', family: "'Merriweather', serif" },
  { id: 'Libre Baskerville', name: 'Libre Baskerville', family: "'Libre Baskerville', serif" },
  { id: 'Oswald', name: 'Oswald', family: "'Oswald', sans-serif" },
  { id: 'Bebas Neue', name: 'Bebas Neue', family: "'Bebas Neue', sans-serif" },
  { id: 'Comfortaa', name: 'Comfortaa', family: "'Comfortaa', sans-serif" },
  { id: 'Josefin Sans', name: 'Josefin Sans', family: "'Josefin Sans', sans-serif" },
  { id: 'Cinzel', name: 'Cinzel', family: "'Cinzel', serif" },
  { id: 'Exo 2', name: 'Exo 2', family: "'Exo 2', sans-serif" },
  { id: 'Orbitron', name: 'Orbitron', family: "'Orbitron', sans-serif" },
  { id: 'Righteous', name: 'Righteous', family: "'Righteous', cursive" },
  { id: 'Rajdhani', name: 'Rajdhani', family: "'Rajdhani', sans-serif" },
  { id: 'Teko', name: 'Teko', family: "'Teko', sans-serif" },
  { id: 'Bodoni Moda', name: 'Bodoni Moda', family: "'Bodoni Moda', serif" },
  { id: 'Cormorant Garamond', name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif" },
  { id: 'Work Sans', name: 'Work Sans', family: "'Work Sans', sans-serif" },
  { id: 'Red Hat Display', name: 'Red Hat Display', family: "'Red Hat Display', sans-serif" },
  { id: 'Fira Code', name: 'Fira Code', family: "'Fira Code', monospace" },
  { id: 'JetBrains Mono', name: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
  { id: 'Inconsolata', name: 'Inconsolata', family: "'Inconsolata', monospace" },
  { id: 'Source Code Pro', name: 'Source Code Pro', family: "'Source Code Pro', monospace" },
  { id: 'Spectral', name: 'Spectral', family: "'Spectral', serif" },
];

function getSavedFont(): string {
  return localStorage.getItem('rw_font') || 'Inter';
}

function setSavedFont(id: string) {
  localStorage.setItem('rw_font', id);
  const font = FONT_OPTIONS.find(f => f.id === id);
  if (font) document.body.style.fontFamily = font.family;
}
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { downloadSourceCode } from '@/utils/downloadSourceCode';
import { downloadChatPDF } from '@/utils/downloadChatPDF';
import { GitHubPushDialog } from '@/components/GitHubPushDialog';
import { PasswordDialog } from '@/components/PasswordDialog';
import { RedWhaleEditor } from '@/components/RedWhaleEditor';
import { AndroidExportDialog } from '@/components/AndroidExportDialog';
import { CodeGenerator } from '@/components/CodeGenerator';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import type { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import type { AppSettings, CustomMood, CustomMode, DpiScale, CursorStyle, TypingIndicatorStyle } from '@/hooks/useAppSettings';
import type { ChatMode } from '@/components/chat/ModeSelector';

interface SettingsDrawerProps {
  onClearChat: () => void;
  messagesCount: number;
  messages: Message[];
  settings: AppSettings;
  setFontFamily: (font: string) => void;
  setDpiScale: (scale: DpiScale) => void;
  setMoodEnabled: (enabled: boolean) => void;
  setCursorStyle: (style: CursorStyle) => void;
  setTypingIndicatorStyle: (style: TypingIndicatorStyle) => void;
  setThinkingMode: (enabled: boolean) => void;
  setRedGlowEnabled: (enabled: boolean) => void;
  setBlueGlowEnabled: (enabled: boolean) => void;
  setGoldenGlowEnabled: (enabled: boolean) => void;
  setPurpleGlowEnabled: (enabled: boolean) => void;
  setAuroraEnabled: (enabled: boolean) => void;
  setFireflyEnabled: (enabled: boolean) => void;
  setStarfieldEnabled: (enabled: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
  setAutoScroll: (enabled: boolean) => void;
  setShowTimestamps: (enabled: boolean) => void;
  setCompactMode: (enabled: boolean) => void;
  setShowAvatar: (enabled: boolean) => void;
  setBubbleStyle: (style: 'modern' | 'classic' | 'minimal') => void;
  setGlowIntensity: (intensity: 'low' | 'medium' | 'high') => void;
  setFontSize: (size: 'small' | 'normal' | 'large') => void;
  setMessageSpacing: (spacing: 'compact' | 'normal' | 'spacious') => void;
  setQuickReply: (enabled: boolean) => void;
  // Ultra premium props
  setMessageBookmark: (enabled: boolean) => void;
  setShowWordCount: (enabled: boolean) => void;
  setShowTokenCount: (enabled: boolean) => void;
  setMessageReactions: (enabled: boolean) => void;
  setAutoTitle: (enabled: boolean) => void;
  setCodeCopyButton: (enabled: boolean) => void;
  setImageGenInChat: (enabled: boolean) => void;
  setVoiceInput: (enabled: boolean) => void;
  setTranslateMessages: (enabled: boolean) => void;
  setSummarizeChat: (enabled: boolean) => void;
  setContinueGeneration: (enabled: boolean) => void;
  setStopGeneration: (enabled: boolean) => void;
  setRetryGeneration: (enabled: boolean) => void;
  setForkConversation: (enabled: boolean) => void;
  setCompareModels: (enabled: boolean) => void;
  setChatStats: (enabled: boolean) => void;
  setShowCharCount: (enabled: boolean) => void;
  setMaxTokens: (tokens: number) => void;
  setTemperature: (temp: number) => void;
  setTopP: (p: number) => void;
  setCustomSystemPrompt: (prompt: string) => void;
  setMemoryEnabled: (enabled: boolean) => void;
  setStreamingEnabled: (enabled: boolean) => void;
  setSidebarCollapsible: (enabled: boolean) => void;
  setMarkdownPreview: (enabled: boolean) => void;
  setLatexRender: (enabled: boolean) => void;
  setMermaidRender: (enabled: boolean) => void;
  setJsonBeautify: (enabled: boolean) => void;
  setCsvPreview: (enabled: boolean) => void;
  // More light props
  setGreenGlowEnabled: (enabled: boolean) => void;
  setPinkGlowEnabled: (enabled: boolean) => void;
  setOrangeGlowEnabled: (enabled: boolean) => void;
  setTealGlowEnabled: (enabled: boolean) => void;
  setNeonPulseEnabled: (enabled: boolean) => void;
  setCyberGridEnabled: (enabled: boolean) => void;
  setDefaultAPIEnabled: (enabled: boolean) => void;
  addCustomMood: (mood: Omit<CustomMood, 'id'>) => string;
  removeCustomMood: (id: string) => void;
  addCustomMode: (mode: Omit<CustomMode, 'id'>) => string;
  removeCustomMode: (id: string) => void;
  resetSettings: () => void;
  tempChatEnabled?: boolean;
  onTempChatToggle?: (enabled: boolean) => void;
  selectedMode?: string;
  onModeChange?: (mode: ChatMode) => void;
}

const FONTS = [
  { label: 'System', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Inter', value: '"Inter", system-ui, sans-serif' },
  { label: 'Roboto', value: '"Roboto", system-ui, sans-serif' },
  { label: 'Poppins', value: '"Poppins", system-ui, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", system-ui, sans-serif' },
  { label: 'Montserrat', value: '"Montserrat", system-ui, sans-serif' },
  { label: 'Lato', value: '"Lato", system-ui, sans-serif' },
  { label: 'Nunito', value: '"Nunito", system-ui, sans-serif' },
  { label: 'Quicksand', value: '"Quicksand", system-ui, sans-serif' },
  { label: 'Raleway', value: '"Raleway", system-ui, sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Merriweather', value: '"Merriweather", serif' },
  { label: 'Fira Code', value: '"Fira Code", monospace' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { label: 'Oswald', value: '"Oswald", system-ui, sans-serif' },
  { label: 'Bebas Neue', value: '"Bebas Neue", system-ui, sans-serif' },
  { label: 'Comfortaa', value: '"Comfortaa", system-ui, sans-serif' },
  { label: 'Josefin Sans', value: '"Josefin Sans", system-ui, sans-serif' },
  { label: 'Cinzel', value: '"Cinzel", serif' },
  { label: 'Exo 2', value: '"Exo 2", system-ui, sans-serif' },
  // Ultra Premium Fonts
  { label: 'Space Grotesk', value: '"Space Grotesk", system-ui, sans-serif' },
  { label: 'Outfit', value: '"Outfit", system-ui, sans-serif' },
  { label: 'DM Sans', value: '"DM Sans", system-ui, sans-serif' },
  { label: 'Manrope', value: '"Manrope", system-ui, sans-serif' },
  { label: 'Libre Baskerville', value: '"Libre Baskerville", serif' },
  { label: 'Spectral', value: '"Spectral", serif' },
  { label: 'Inconsolata', value: '"Inconsolata", monospace' },
  { label: 'Source Code Pro', value: '"Source Code Pro", monospace' },
  { label: 'Sora', value: '"Sora", system-ui, sans-serif' },
  { label: 'Syne', value: '"Syne", system-ui, sans-serif' },
  { label: 'Space Mono', value: '"Space Mono", monospace' },
  { label: 'Bodoni Moda', value: '"Bodoni Moda", serif' },
  { label: 'Cormorant Garamond', value: '"Cormorant Garamond", serif' },
  { label: 'Teko', value: '"Teko", system-ui, sans-serif' },
  { label: 'Rajdhani', value: '"Rajdhani", system-ui, sans-serif' },
  { label: 'Orbitron', value: '"Orbitron", system-ui, sans-serif' },
  { label: 'Lexend', value: '"Lexend", system-ui, sans-serif' },
  { label: 'Work Sans', value: '"Work Sans", system-ui, sans-serif' },
  { label: 'Red Hat Display', value: '"Red Hat Display", system-ui, sans-serif' },
  { label: 'Righteous', value: '"Righteous", system-ui, sans-serif' },
];

const DPI_OPTIONS = [
  { label: 'Auto', value: 'auto' as const },
  { label: 'Small', value: 'small' as const },
  { label: 'Medium Small', value: 'medium-small' as const },
  { label: 'Medium', value: 'medium' as const },
  { label: 'Medium Big', value: 'medium-big' as const },
  { label: 'Big', value: 'big' as const },
];

const LUCIDE_ICONS = ['Zap', 'Brain', 'Globe', 'Crown', 'Rocket', 'Hammer', 'GraduationCap', 'Radio', 'Sparkles', 'Waves', 'Heart', 'Flame', 'Star', 'Smile', 'Ghost', 'Skull'];

const iconMap: Record<string, any> = {
  Zap, Brain, Globe, Crown, Rocket, Hammer, GraduationCap, Radio, Sparkles, Waves, Smile, Heart, Flame, Star, Ghost, Skull,
};

export function SettingsDrawer({
  onClearChat, messagesCount, messages,
  settings, setFontFamily, setDpiScale, setMoodEnabled,
  setCursorStyle, setTypingIndicatorStyle, setThinkingMode, setGoldenGlowEnabled, setPurpleGlowEnabled, setAuroraEnabled, setFireflyEnabled, setStarfieldEnabled, setSoundEffects, setAutoScroll, setShowTimestamps, setCompactMode, setShowAvatar, setBubbleStyle, setGlowIntensity, setFontSize, setMessageSpacing, setQuickReply,
  setMessageBookmark, setShowWordCount, setShowTokenCount, setMessageReactions, setAutoTitle, setCodeCopyButton, setImageGenInChat, setVoiceInput, setTranslateMessages, setSummarizeChat, setContinueGeneration, setStopGeneration, setRetryGeneration, setForkConversation, setCompareModels, setChatStats, setShowCharCount, setMaxTokens, setTemperature, setTopP, setCustomSystemPrompt, setMemoryEnabled, setStreamingEnabled, setSidebarCollapsible, setMarkdownPreview, setLatexRender, setMermaidRender, setJsonBeautify, setCsvPreview,
  setGreenGlowEnabled, setPinkGlowEnabled, setOrangeGlowEnabled, setTealGlowEnabled, setNeonPulseEnabled, setCyberGridEnabled, setDefaultAPIEnabled,
  
  addCustomMood, removeCustomMood, addCustomMode, removeCustomMode,
  resetSettings,
  tempChatEnabled = false, onTempChatToggle,
  selectedMode = 'auto',
  onModeChange,
}: SettingsDrawerProps) {
  const { glowMode, setGlowMode } = useGlowMode();
  const [open, setOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState(getSavedFont());

  useEffect(() => {
    const saved = getSavedFont();
    const font = FONT_OPTIONS.find(f => f.id === saved);
    if (font) document.body.style.fontFamily = font.family;
  }, []);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [androidExportOpen, setAndroidExportOpen] = useState(false);
  const [codeGenOpen, setCodeGenOpen] = useState(false);
  const [passDialogOpen, setPassDialogOpen] = useState(false);
  const [passTarget, setPassTarget] = useState<'download' | 'github' | 'editor' | 'android' | 'codegen' | 'newrw'>('download');
  const [showCustomMoodForm, setShowCustomMoodForm] = useState(false);
  const [showCustomModeForm, setShowCustomModeForm] = useState(false);
  const [customMoodName, setCustomMoodName] = useState('');
  const [customMoodPrompt, setCustomMoodPrompt] = useState('');
  const [customMoodIcon, setCustomMoodIcon] = useState('Zap');
  const [customModeName, setCustomModeName] = useState('');
  const [customModeInstructions, setCustomModeInstructions] = useState('');
  const [customModeIcon, setCustomModeIcon] = useState('Zap');
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setGithubDialogOpen(true);
    window.addEventListener('rw-open-github-push', handler);
    return () => window.removeEventListener('rw-open-github-push', handler);
  }, []);

  const requirePass = (target: 'download' | 'github' | 'editor' | 'android' | 'codegen' | 'newrw') => {
    setPassTarget(target);
    setPassDialogOpen(true);
  };

  const onPassSuccess = () => {
    if (passTarget === 'download') {
      handleDownloadSourceCode();
    } else if (passTarget === 'github') {
      setOpen(false);
      setGithubDialogOpen(true);
    } else if (passTarget === 'editor') {
      setOpen(false);
      setEditorOpen(true);
    } else if (passTarget === 'android') {
      setOpen(false);
      setAndroidExportOpen(true);
    } else if (passTarget === 'codegen') {
      setOpen(false);
      setCodeGenOpen(true);
    } else if (passTarget === 'newrw') {
      setOpen(false);
      setGithubDialogOpen(true);
      toast.success('NEW RW GitHub Source Code — Ready to push!');
    }
  };

  const handleDownloadSourceCode = async () => {
    const id = toast.loading('Preparing source code...');
    try {
      await downloadSourceCode();
      toast.dismiss(id);
      toast.success('Source code downloaded!');
    } catch {
      toast.dismiss(id);
      toast.error('Source code download failed');
    }
  };

  const handleDownloadChat = async () => {
    const id = toast.loading('Creating PDF...', { id: 'pdf-export' });
    try {
      await downloadChatPDF(messages);
      toast.success('PDF ready! Download started.', { id });
      setOpen(false);
    } catch {
      toast.error('❌ Failed to create PDF. Please try again.', { id });
    }
  };

  const publicItems = [
    {
      icon: theme === 'dark' ? Sun : Moon,
      label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
      desc: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      color: 'text-amber-500',
    },
    {
      icon: Trash2,
      label: 'Clear Chat',
      desc: 'Delete all conversation',
      onClick: () => { onClearChat(); setOpen(false); },
      color: 'text-red-500',
      disabled: messagesCount === 0,
    },
    {
      icon: FileDown,
      label: 'Export Chat as PDF',
      desc: 'Download full conversation as PDF',
      onClick: handleDownloadChat,
      color: 'text-rose-500',
      disabled: messagesCount === 0,
    },
    {
      icon: Key,
      label: 'API Settings',
      desc: 'API keys and configuration',
      onClick: () => { setOpen(false); navigate('/api-settings'); },
      color: 'text-blue-500',
    },
    {
      icon: RotateCcw,
      label: 'Reset Settings',
      desc: 'Restore all settings to default',
      onClick: () => { resetSettings(); setOpen(false); },
      color: 'text-orange-500',
    },
  ];

  const protectedItems = [
    {
      icon: Code2,
      label: 'Download Source Code',
      desc: 'Download complete project as ZIP',
      onClick: () => requirePass('download'),
      color: 'text-green-500',
    },
    {
      icon: Github,
      label: 'Push to GitHub',
      desc: 'Push code to GitHub & deploy on Vercel',
      onClick: () => requirePass('github'),
      color: 'text-slate-500',
    },
    {
      icon: Plus,
      label: 'NEW RW',
      desc: 'Create new Red Whale from GitHub source code',
      onClick: () => requirePass('newrw'),
      color: 'text-primary',
    },
    {
      icon: Wand2,
      label: 'Red Whale Editor',
      desc: 'AI-powered code editor — modify your app',
      onClick: () => requirePass('editor'),
      color: 'text-orange-500',
    },
    {
      icon: Smartphone,
      label: 'Export as Android App',
      desc: 'Generate Android Studio project ZIP',
      onClick: () => requirePass('android'),
      color: 'text-emerald-500',
    },
    {
      icon: Sparkles,
      label: 'AI Code Generator',
      desc: 'Generate any project — AI builds complete code ZIP',
      onClick: () => requirePass('codegen'),
      color: 'text-pink-500',
    },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-primary/10 transition-all"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 bg-card/95 backdrop-blur-2xl border-l border-border/50 flex flex-col h-full">
          <SheetHeader className="pb-4 border-b border-border/30 shrink-0">
            <SheetTitle className="text-base font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Settings
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto mt-4 space-y-2 px-1">
            {/* Public items */}
            {publicItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={item.onClick}
                disabled={item.disabled}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:pointer-events-none text-left"
              >
                <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </motion.button>
            ))}

            {/* Divider */}
            <div className="flex items-center gap-2 px-3 pt-2">
              <div className="flex-1 h-px bg-border/40" />
              <Lock className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50 font-medium">PROTECTED</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            {/* Protected items */}
            {protectedItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (publicItems.length + i) * 0.05 }}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group"
              >
                <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <Lock className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </motion.button>
            ))}

            {/* Default API Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setDefaultAPIEnabled(!settings.defaultAPIEnabled)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left border",
                  settings.defaultAPIEnabled
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/15"
                    : "hover:bg-muted/50 border-transparent"
                )}
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.defaultAPIEnabled ? 'text-cyan-400' : 'text-muted-foreground')}>
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Default Free APIs</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.defaultAPIEnabled ? 'ON — Using built-in API keys' : 'OFF — Custom APIs only'}
                  </p>
                </div>
                <div className={cn(
                  "w-8 h-5 rounded-full transition-colors relative shrink-0",
                  settings.defaultAPIEnabled ? "bg-cyan-500" : "bg-muted-foreground/30"
                )}>
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                    settings.defaultAPIEnabled ? "left-3.5" : "left-0.5"
                  )} />
                </div>
              </button>
            </div>

            {/* AI Mode Section — Prominent */}
            <div className="flex items-center gap-2 px-3 pt-4">
              <div className="flex-1 h-px bg-border/40" />
              <Sparkles className="w-3 h-3 text-primary/70" />
              <span className="text-[10px] text-primary/70 font-bold uppercase tracking-wider">AI Mode</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            {/* Current Mode Display */}
            <div className="px-3 py-2">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Current Mode</p>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-background shadow-sm">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">
                      {selectedMode ? selectedMode.toUpperCase() : 'AUTO'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Active AI behavior mode
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/70">
                  Change mode using the mode button in the chat input bar.
                </p>
              </div>
            </div>

            {/* Custom Modes List in Settings */}
            {settings.customModes.length > 0 && (
              <div className="px-3 py-1">
                <p className="text-[10px] text-muted-foreground/60 font-medium mb-1.5 uppercase tracking-wider">Your Custom Modes</p>
                <div className="space-y-1">
                  {settings.customModes.map(mode => {
                    const ModeIcon = (iconMap as any)[mode.icon] || Sparkles;
                    const isActive = selectedMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => onModeChange?.(mode.id as ChatMode)}
                        className={cn(
                          "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all",
                          isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                        )}
                      >
                        <ModeIcon className={cn("w-3.5 h-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                        <span className={cn("text-xs font-medium flex-1", isActive ? "text-primary" : "text-foreground")}>{mode.name}</span>
                        {isActive && <Check className="w-3 h-3 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Appearance Section */}
            <div className="flex items-center gap-2 px-3 pt-4">
              <div className="flex-1 h-px bg-border/40" />
              <Monitor className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50 font-medium">APPEARANCE</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            {/* Font Family — Large Dropdown List */}
            <div className="px-3 py-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <Type className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Font</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-muted border border-border hover:border-primary/30 transition-all text-left"
                >
                  <span className="text-sm font-medium" style={{ fontFamily: settings.fontFamily }}>
                    {FONTS.find(f => f.value === settings.fontFamily)?.label || 'System'}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", fontDropdownOpen && "rotate-180")} />
                </button>
                {fontDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl bg-card border border-border shadow-xl"
                  >
                    {FONTS.map(f => (
                      <button
                        key={f.value}
                        onClick={() => { setFontFamily(f.value); setFontDropdownOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all",
                          settings.fontFamily === f.value
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <span className="text-sm font-medium flex-1" style={{ fontFamily: f.value }}>
                          {f.label}
                        </span>
                        {settings.fontFamily === f.value && (
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* DPI Scale */}
            <div className="px-3 py-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Screen Size</span>
              </div>
              <div className="flex gap-1">
                {DPI_OPTIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDpiScale(d.value)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all",
                      settings.dpiScale === d.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-transparent hover:border-border"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setMoodEnabled(!settings.moodEnabled)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.moodEnabled ? 'text-primary' : 'text-muted-foreground')}>
                  {settings.moodEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Mood Selector</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.moodEnabled ? 'Visible in chat input' : 'Hidden from chat input'}
                  </p>
                </div>
              </button>
            </div>

            {/* Temporary Chat Toggle */}
            {onTempChatToggle && (
              <div className="px-3 py-2">
                <button
                  onClick={() => onTempChatToggle(!tempChatEnabled)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
                >
                  <div className={cn("p-1.5 rounded-lg bg-muted", tempChatEnabled ? 'text-amber-500' : 'text-muted-foreground')}>
                    {tempChatEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Temporary Chat</p>
                    <p className="text-[11px] text-muted-foreground">
                      {tempChatEnabled ? 'No history saved • Auto-clear' : 'Chat history saved normally'}
                    </p>
                  </div>
                </button>
              </div>
            )}



            {/* Premium Options Section */}
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Premium Options</p>
            </div>

            {/* Glow Intensity */}
            <div className="px-3 py-2 space-y-1.5">
              <p className="text-sm font-semibold text-foreground">Glow Intensity</p>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map((intensity) => (
                  <button
                    key={intensity}
                    onClick={() => setGlowIntensity(intensity)}
                    className={cn(
                      'flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all',
                      settings.glowIntensity === intensity
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                    )}
                  >
                    {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Effects Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setSoundEffects(!settings.soundEffects)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.soundEffects ? 'text-green-400' : 'text-muted-foreground')}>
                  {settings.soundEffects ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Sound Effects</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.soundEffects ? 'Audio feedback ON' : 'Sound effects OFF'}
                  </p>
                </div>
              </button>
            </div>

            {/* Auto Scroll Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setAutoScroll(!settings.autoScroll)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.autoScroll ? 'text-blue-400' : 'text-muted-foreground')}>
                  {settings.autoScroll ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Auto Scroll</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.autoScroll ? 'Auto-scroll to bottom ON' : 'Auto-scroll OFF'}
                  </p>
                </div>
              </button>
            </div>

            {/* Show Timestamps Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setShowTimestamps(!settings.showTimestamps)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.showTimestamps ? 'text-orange-400' : 'text-muted-foreground')}>
                  {settings.showTimestamps ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Show Timestamps</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.showTimestamps ? 'Message time ON' : 'Timestamps OFF'}
                  </p>
                </div>
              </button>
            </div>

            {/* Compact Mode Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setCompactMode(!settings.compactMode)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.compactMode ? 'text-violet-400' : 'text-muted-foreground')}>
                  {settings.compactMode ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Compact Mode</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.compactMode ? 'Tight layout ON' : 'Compact mode OFF'}
                  </p>
                </div>
              </button>
            </div>

            {/* Show Avatar Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setShowAvatar(!settings.showAvatar)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.showAvatar ? 'text-pink-400' : 'text-muted-foreground')}>
                  {settings.showAvatar ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Show Avatar</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.showAvatar ? 'Avatar icons ON' : 'Avatar hidden'}
                  </p>
                </div>
              </button>
            </div>

            {/* Bubble Style */}
            <div className="px-3 py-2 space-y-1.5">
              <p className="text-sm font-semibold text-foreground">Bubble Style</p>
              <div className="flex gap-1.5">
                {(['modern', 'classic', 'minimal'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setBubbleStyle(style)}
                    className={cn(
                      'flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all',
                      settings.bubbleStyle === style
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                    )}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="px-3 py-2 space-y-1.5">
              <p className="text-sm font-semibold text-foreground">Font Size</p>
              <div className="flex gap-1.5">
                {(['small', 'normal', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={cn(
                      'flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all',
                      settings.fontSize === size
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                    )}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Spacing */}
            <div className="px-3 py-2 space-y-1.5">
              <p className="text-sm font-semibold text-foreground">Message Spacing</p>
              <div className="flex gap-1.5">
                {(['compact', 'normal', 'spacious'] as const).map((spacing) => (
                  <button
                    key={spacing}
                    onClick={() => setMessageSpacing(spacing)}
                    className={cn(
                      'flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all',
                      settings.messageSpacing === spacing
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                    )}
                  >
                    {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Reply Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setQuickReply(!settings.quickReply)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.quickReply ? 'text-teal-400' : 'text-muted-foreground')}>
                  {settings.quickReply ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Quick Reply</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.quickReply ? 'Quick suggestions ON' : 'Quick reply OFF'}
                  </p>
                </div>
              </button>
            </div>

            {/* Ultra Premium Chat Options Section */}
            <div className="px-3 pt-4 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Ultra Premium AI Features</p>
            </div>

            {/* Message Bookmark Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setMessageBookmark(!settings.messageBookmark)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.messageBookmark ? 'text-yellow-400' : 'text-muted-foreground')}>
                  {settings.messageBookmark ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Message Bookmark</p>
                  <p className="text-[11px] text-muted-foreground">{settings.messageBookmark ? 'Save messages ON' : 'Bookmarks OFF'}</p>
                </div>
              </button>
            </div>

            {/* Message Reactions Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setMessageReactions(!settings.messageReactions)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.messageReactions ? 'text-rose-400' : 'text-muted-foreground')}>
                  {settings.messageReactions ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Message Reactions</p>
                  <p className="text-[11px] text-muted-foreground">{settings.messageReactions ? 'Emoji reactions ON' : 'Reactions OFF'}</p>
                </div>
              </button>
            </div>

            {/* Auto Title Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setAutoTitle(!settings.autoTitle)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.autoTitle ? 'text-violet-400' : 'text-muted-foreground')}>
                  {settings.autoTitle ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Auto Title</p>
                  <p className="text-[11px] text-muted-foreground">{settings.autoTitle ? 'Auto-generate titles ON' : 'Auto title OFF'}</p>
                </div>
              </button>
            </div>

            {/* Code Copy Button Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setCodeCopyButton(!settings.codeCopyButton)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.codeCopyButton ? 'text-cyan-400' : 'text-muted-foreground')}>
                  {settings.codeCopyButton ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Code Copy Button</p>
                  <p className="text-[11px] text-muted-foreground">{settings.codeCopyButton ? 'Copy code blocks ON' : 'Code copy OFF'}</p>
                </div>
              </button>
            </div>

            {/* Image Gen In Chat Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setImageGenInChat(!settings.imageGenInChat)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.imageGenInChat ? 'text-purple-400' : 'text-muted-foreground')}>
                  {settings.imageGenInChat ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Image Generation</p>
                  <p className="text-[11px] text-muted-foreground">{settings.imageGenInChat ? 'AI image gen ON' : 'Image gen OFF'}</p>
                </div>
              </button>
            </div>

            {/* Voice Input Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setVoiceInput(!settings.voiceInput)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.voiceInput ? 'text-green-400' : 'text-muted-foreground')}>
                  {settings.voiceInput ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Voice Input</p>
                  <p className="text-[11px] text-muted-foreground">{settings.voiceInput ? 'Voice typing ON' : 'Voice input OFF'}</p>
                </div>
              </button>
            </div>

            {/* Translate Messages Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setTranslateMessages(!settings.translateMessages)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.translateMessages ? 'text-blue-400' : 'text-muted-foreground')}>
                  {settings.translateMessages ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Translate Messages</p>
                  <p className="text-[11px] text-muted-foreground">{settings.translateMessages ? 'Translate ON' : 'Translate OFF'}</p>
                </div>
              </button>
            </div>

            {/* Summarize Chat Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setSummarizeChat(!settings.summarizeChat)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.summarizeChat ? 'text-amber-400' : 'text-muted-foreground')}>
                  {settings.summarizeChat ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Summarize Chat</p>
                  <p className="text-[11px] text-muted-foreground">{settings.summarizeChat ? 'Summarize ON' : 'Summarize OFF'}</p>
                </div>
              </button>
            </div>

            {/* Continue Generation Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setContinueGeneration(!settings.continueGeneration)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.continueGeneration ? 'text-emerald-400' : 'text-muted-foreground')}>
                  {settings.continueGeneration ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Continue Generation</p>
                  <p className="text-[11px] text-muted-foreground">{settings.continueGeneration ? 'Continue response ON' : 'Continue OFF'}</p>
                </div>
              </button>
            </div>

            {/* Stop Generation Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setStopGeneration(!settings.stopGeneration)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.stopGeneration ? 'text-red-400' : 'text-muted-foreground')}>
                  {settings.stopGeneration ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Stop Button</p>
                  <p className="text-[11px] text-muted-foreground">{settings.stopGeneration ? 'Stop gen button ON' : 'Stop button OFF'}</p>
                </div>
              </button>
            </div>

            {/* Retry Generation Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setRetryGeneration(!settings.retryGeneration)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.retryGeneration ? 'text-orange-400' : 'text-muted-foreground')}>
                  {settings.retryGeneration ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Retry / Regenerate</p>
                  <p className="text-[11px] text-muted-foreground">{settings.retryGeneration ? 'Regenerate ON' : 'Retry OFF'}</p>
                </div>
              </button>
            </div>

            {/* Fork Conversation Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setForkConversation(!settings.forkConversation)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.forkConversation ? 'text-pink-400' : 'text-muted-foreground')}>
                  {settings.forkConversation ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Fork Conversation</p>
                  <p className="text-[11px] text-muted-foreground">{settings.forkConversation ? 'Fork chat ON' : 'Fork OFF'}</p>
                </div>
              </button>
            </div>

            {/* Compare Models Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setCompareModels(!settings.compareModels)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.compareModels ? 'text-sky-400' : 'text-muted-foreground')}>
                  {settings.compareModels ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Compare Models</p>
                  <p className="text-[11px] text-muted-foreground">{settings.compareModels ? 'Side-by-side ON' : 'Compare OFF'}</p>
                </div>
              </button>
            </div>

            {/* Chat Stats Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setChatStats(!settings.chatStats)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.chatStats ? 'text-lime-400' : 'text-muted-foreground')}>
                  {settings.chatStats ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Chat Statistics</p>
                  <p className="text-[11px] text-muted-foreground">{settings.chatStats ? 'Stats panel ON' : 'Stats OFF'}</p>
                </div>
              </button>
            </div>

            {/* Show Word Count Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setShowWordCount(!settings.showWordCount)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.showWordCount ? 'text-teal-400' : 'text-muted-foreground')}>
                  {settings.showWordCount ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Word Count</p>
                  <p className="text-[11px] text-muted-foreground">{settings.showWordCount ? 'Word count ON' : 'Word count OFF'}</p>
                </div>
              </button>
            </div>

            {/* Show Token Count Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setShowTokenCount(!settings.showTokenCount)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.showTokenCount ? 'text-indigo-400' : 'text-muted-foreground')}>
                  {settings.showTokenCount ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Token Count</p>
                  <p className="text-[11px] text-muted-foreground">{settings.showTokenCount ? 'Token estimate ON' : 'Token count OFF'}</p>
                </div>
              </button>
            </div>

            {/* Show Char Count Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setShowCharCount(!settings.showCharCount)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.showCharCount ? 'text-fuchsia-400' : 'text-muted-foreground')}>
                  {settings.showCharCount ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Character Counter</p>
                  <p className="text-[11px] text-muted-foreground">{settings.showCharCount ? 'Char counter ON' : 'Char count OFF'}</p>
                </div>
              </button>
            </div>

            {/* Memory Enabled Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setMemoryEnabled(!settings.memoryEnabled)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.memoryEnabled ? 'text-amber-400' : 'text-muted-foreground')}>
                  {settings.memoryEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Conversation Memory</p>
                  <p className="text-[11px] text-muted-foreground">{settings.memoryEnabled ? 'Context memory ON' : 'Memory OFF'}</p>
                </div>
              </button>
            </div>

            {/* Streaming Enabled Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setStreamingEnabled(!settings.streamingEnabled)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.streamingEnabled ? 'text-cyan-400' : 'text-muted-foreground')}>
                  {settings.streamingEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Streaming Response</p>
                  <p className="text-[11px] text-muted-foreground">{settings.streamingEnabled ? 'Real-time stream ON' : 'Streaming OFF'}</p>
                </div>
              </button>
            </div>

            {/* Markdown Preview Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setMarkdownPreview(!settings.markdownPreview)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.markdownPreview ? 'text-emerald-400' : 'text-muted-foreground')}>
                  {settings.markdownPreview ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Markdown Preview</p>
                  <p className="text-[11px] text-muted-foreground">{settings.markdownPreview ? 'Live preview ON' : 'Markdown preview OFF'}</p>
                </div>
              </button>
            </div>

            {/* LaTeX Render Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setLatexRender(!settings.latexRender)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.latexRender ? 'text-sky-400' : 'text-muted-foreground')}>
                  {settings.latexRender ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">LaTeX Render</p>
                  <p className="text-[11px] text-muted-foreground">{settings.latexRender ? 'Math formulas ON' : 'LaTeX OFF'}</p>
                </div>
              </button>
            </div>

            {/* Mermaid Render Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setMermaidRender(!settings.mermaidRender)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.mermaidRender ? 'text-teal-400' : 'text-muted-foreground')}>
                  {settings.mermaidRender ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Mermaid Diagrams</p>
                  <p className="text-[11px] text-muted-foreground">{settings.mermaidRender ? 'Diagram render ON' : 'Mermaid OFF'}</p>
                </div>
              </button>
            </div>

            {/* JSON Beautify Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setJsonBeautify(!settings.jsonBeautify)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.jsonBeautify ? 'text-yellow-400' : 'text-muted-foreground')}>
                  {settings.jsonBeautify ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">JSON Beautify</p>
                  <p className="text-[11px] text-muted-foreground">{settings.jsonBeautify ? 'Pretty JSON ON' : 'JSON beautify OFF'}</p>
                </div>
              </button>
            </div>

            {/* CSV Preview Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setCsvPreview(!settings.csvPreview)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.csvPreview ? 'text-green-400' : 'text-muted-foreground')}>
                  {settings.csvPreview ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">CSV Preview</p>
                  <p className="text-[11px] text-muted-foreground">{settings.csvPreview ? 'Table preview ON' : 'CSV preview OFF'}</p>
                </div>
              </button>
            </div>

            {/* Sidebar Collapsible Toggle */}
            <div className="px-3 py-2">
              <button onClick={() => setSidebarCollapsible(!settings.sidebarCollapsible)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left">
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.sidebarCollapsible ? 'text-blue-400' : 'text-muted-foreground')}>
                  {settings.sidebarCollapsible ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Collapsible Sidebar</p>
                  <p className="text-[11px] text-muted-foreground">{settings.sidebarCollapsible ? 'Sidebar collapse ON' : 'Collapsible OFF'}</p>
                </div>
              </button>
            </div>

            {/* AI Model Settings Section */}
            <div className="px-3 pt-4 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">AI Model Settings</p>
            </div>

            {/* Temperature Slider */}
            <div className="px-3 py-2 space-y-1.5">
              <div className="flex justify-between">
                <p className="text-sm font-semibold text-foreground">Temperature</p>
                <span className="text-xs text-muted-foreground">{settings.temperature}</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={Math.round(settings.temperature * 10)}
                onChange={(e) => setTemperature(parseInt(e.target.value) / 10)}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            {/* Top-P Slider */}
            <div className="px-3 py-2 space-y-1.5">
              <div className="flex justify-between">
                <p className="text-sm font-semibold text-foreground">Top-P</p>
                <span className="text-xs text-muted-foreground">{settings.topP}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={Math.round(settings.topP * 10)}
                onChange={(e) => setTopP(parseInt(e.target.value) / 10)}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Focused</span>
                <span>Diverse</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div className="px-3 py-2 space-y-1.5">
              <p className="text-sm font-semibold text-foreground">Max Tokens</p>
              <div className="flex gap-1.5">
                {[2048, 4096, 8192, 16384, 32768].map((tokens) => (
                  <button
                    key={tokens}
                    onClick={() => setMaxTokens(tokens)}
                    className={cn(
                      'flex-1 py-1.5 px-1 rounded-lg text-[10px] font-medium border transition-all',
                      settings.maxTokens === tokens
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                    )}
                  >
                    {tokens >= 1000 ? `${tokens / 1000}k` : tokens}
                  </button>
                ))}
              </div>
            </div>

            {/* Thinking Mode Toggle */}
            <div className="px-3 py-2">
              <button
                onClick={() => setThinkingMode(!settings.thinkingMode)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
              >
                <div className={cn("p-1.5 rounded-lg bg-muted", settings.thinkingMode ? 'text-indigo-400' : 'text-muted-foreground')}>
                  {settings.thinkingMode ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Thinking Process</p>
                  <p className="text-[11px] text-muted-foreground">
                    {settings.thinkingMode ? 'AI shows chain of thought ON' : 'Direct answers only'}
                  </p>
                </div>
              </button>
            </div>

            {/* Voice Selector */}
            <VoiceSelector />

            {/* Light Mode — Blue | Red | Off */}
            <div className="px-3 py-2">
              <div className="flex gap-1.5">
                <button
                  onClick={() => { setGlowMode('blue'); toast.success('Blue Light ON'); }}
                  className={cn(
                    'flex-1 py-2 px-1 rounded-lg text-[10px] font-medium border transition-all min-h-9',
                    glowMode === 'blue'
                      ? 'bg-blue-500/15 border-blue-400/40 text-blue-600'
                      : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'
                  )}
                >
                  Blue
                </button>
                <button
                  onClick={() => { setGlowMode('redwhale'); toast.success('Red Light ON'); }}
                  className={cn(
                    'flex-1 py-2 px-1 rounded-lg text-[10px] font-medium border transition-all min-h-9',
                    glowMode === 'redwhale'
                      ? 'bg-red-500/15 border-red-400/40 text-red-600'
                      : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'
                  )}
                >
                  Red
                </button>
                <button
                  onClick={() => { setGlowMode('off'); toast.success('Glow OFF'); }}
                  className={cn(
                    'flex-1 py-2 px-1 rounded-lg text-[10px] font-medium border transition-all min-h-9',
                    glowMode === 'off'
                      ? 'bg-foreground/10 border-foreground/30 text-foreground'
                      : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'
                  )}
                >
                  Off
                </button>
              </div>
            </div>

            {/* Cursor Style Selector — Premium 4 styles */}
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-foreground mb-2">Cursor Style</p>
              <div className="grid grid-cols-4 gap-1.5">
                {(['beam', 'block', 'underline', 'glow'] as CursorStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setCursorStyle(style)}
                    className={cn(
                      "py-2 px-1 rounded-lg text-[10px] font-medium border transition-all",
                      settings.cursorStyle === style
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Typing Indicator Style — Premium 8 styles */}
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-foreground mb-2">Typing Indicator</p>
              <div className="grid grid-cols-4 gap-1.5">
                {(['dots', 'wave', 'pulse', 'orbit', 'neon', 'matrix', 'fire', 'heart', 'galaxy', 'rocket', 'crown', 'lightning', 'ocean', 'diamond', 'box_up', 'box_down', 'box_bounce'] as TypingIndicatorStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setTypingIndicatorStyle(style)}
                    className={cn(
                      "py-2 px-1 rounded-lg text-[10px] font-medium border transition-all",
                      settings.typingIndicatorStyle === style
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Moods */}
            <div className="flex items-center gap-2 px-3 pt-3">
              <div className="flex-1 h-px bg-border/40" />
              <Sparkles className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50 font-medium">CUSTOM MOODS</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            {settings.customMoods.map(mood => (
              <div key={mood.id} className="px-3 flex items-center gap-2 py-1">
                <span className="text-xs font-medium flex-1">{mood.name}</span>
                <button
                  onClick={() => removeCustomMood(mood.id)}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2Icon className="w-3 h-3" />
                </button>
              </div>
            ))}

            {!showCustomMoodForm ? (
              <button
                onClick={() => setShowCustomMoodForm(true)}
                className="mx-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors border border-dashed border-primary/30"
              >
                <Plus className="w-3 h-3" />
                Add Custom Mood
              </button>
            ) : (
              <div className="mx-3 p-2.5 rounded-xl bg-muted/50 border border-border/40 space-y-2">
                <input
                  type="text"
                  value={customMoodName}
                  onChange={e => setCustomMoodName(e.target.value)}
                  placeholder="Mood name"
                  className="w-full bg-background rounded-lg px-2.5 py-1.5 text-xs border border-border outline-none focus:border-primary"
                />
                <textarea
                  value={customMoodPrompt}
                  onChange={e => setCustomMoodPrompt(e.target.value)}
                  placeholder="System prompt for this mood..."
                  rows={2}
                  className="w-full bg-background rounded-lg px-2.5 py-1.5 text-xs border border-border outline-none focus:border-primary resize-none"
                />
                <div className="flex gap-1 flex-wrap">
                  {LUCIDE_ICONS.map(ic => {
                    const IconComp = iconMap[ic] || Zap;
                    return (
                      <button
                        key={ic}
                        onClick={() => setCustomMoodIcon(ic)}
                        className={cn(
                          "p-1 rounded-md transition-all",
                          customMoodIcon === ic ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                        )}
                      >
                        <IconComp className="w-3 h-3" />
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (customMoodName.trim() && customMoodPrompt.trim()) {
                        addCustomMood({ name: customMoodName.trim(), icon: customMoodIcon, prompt: customMoodPrompt.trim() });
                        setCustomMoodName('');
                        setCustomMoodPrompt('');
                        setShowCustomMoodForm(false);
                        toast.success('Custom mood added!');
                      }
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowCustomMoodForm(false); setCustomMoodName(''); setCustomMoodPrompt(''); }}
                    className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-[11px] font-medium hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Custom Modes */}
            <div className="flex items-center gap-2 px-3 pt-3">
              <div className="flex-1 h-px bg-border/40" />
              <Brain className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50 font-medium">CUSTOM MODES</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            {settings.customModes.map(mode => (
              <div key={mode.id} className="px-3 flex items-center gap-2 py-1">
                <span className="text-xs font-medium flex-1">{mode.name}</span>
                <button
                  onClick={() => removeCustomMode(mode.id)}
                  className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2Icon className="w-3 h-3" />
                </button>
              </div>
            ))}

            {!showCustomModeForm ? (
              <button
                onClick={() => setShowCustomModeForm(true)}
                className="mx-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors border border-dashed border-primary/30"
              >
                <Plus className="w-3 h-3" />
                Add Custom Mode
              </button>
            ) : (
              <div className="mx-3 p-2.5 rounded-xl bg-muted/50 border border-border/40 space-y-2">
                <input
                  type="text"
                  value={customModeName}
                  onChange={e => setCustomModeName(e.target.value)}
                  placeholder="Mode name (e.g. Chef Mode)"
                  className="w-full bg-background rounded-lg px-2.5 py-1.5 text-xs border border-border outline-none focus:border-primary"
                />
                <textarea
                  value={customModeInstructions}
                  onChange={e => setCustomModeInstructions(e.target.value)}
                  placeholder="Instructions: how should AI behave in this mode?"
                  rows={3}
                  className="w-full bg-background rounded-lg px-2.5 py-1.5 text-xs border border-border outline-none focus:border-primary resize-none"
                />
                <div className="flex gap-1 flex-wrap">
                  {LUCIDE_ICONS.map(ic => {
                    const IconComp = iconMap[ic] || Zap;
                    return (
                      <button
                        key={ic}
                        onClick={() => setCustomModeIcon(ic)}
                        className={cn(
                          "p-1 rounded-md transition-all",
                          customModeIcon === ic ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                        )}
                      >
                        <IconComp className="w-3 h-3" />
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (customModeName.trim() && customModeInstructions.trim()) {
                        addCustomMode({ name: customModeName.trim(), icon: customModeIcon, instructions: customModeInstructions.trim() });
                        setCustomModeName('');
                        setCustomModeInstructions('');
                        setShowCustomModeForm(false);
                        toast.success('Custom mode added!');
                      }
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowCustomModeForm(false); setCustomModeName(''); setCustomModeInstructions(''); }}
                    className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-[11px] font-medium hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 py-4 text-center border-t border-border/20">
            <p className="text-[10px] text-muted-foreground/50">
              Red Whale V2 v816 — By Shujan
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <PasswordDialog
        open={passDialogOpen}
        onOpenChange={setPassDialogOpen}
        onSuccess={onPassSuccess}
        title="Protected Access"
        description="Enter the developer password to unlock this feature."
      />

      <GitHubPushDialog open={githubDialogOpen} onOpenChange={setGithubDialogOpen} />
      <RedWhaleEditor open={editorOpen} onOpenChange={setEditorOpen} />
      <AndroidExportDialog open={androidExportOpen} onOpenChange={setAndroidExportOpen} />
      <CodeGenerator open={codeGenOpen} onOpenChange={setCodeGenOpen} />
    </>
  );
}
