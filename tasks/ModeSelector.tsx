// ModeSelector component - Premium mode selection with glowing effects
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sparkles, Crown, Brain, Globe, Radio, Zap, Check, Code2, Hammer, GraduationCap, Rocket, Waves, ListOrdered,
  Smile, Heart, Flame, Star, Ghost, Skull, Diamond, Swords, Shield, Eye, Moon, Sun, CloudRain, Snowflake,
   Mountain, Feather, Infinity, Target, Compass, Lightbulb, Music, Camera, Gamepad2, Trophy, Anchor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const iconMap: Record<string, React.ElementType> = {
  Zap, Brain, Globe, Crown, Rocket, Hammer, GraduationCap, Radio, Sparkles, Waves, Smile, Heart, Flame, Star, Ghost, Skull,
  Diamond, Swords, Shield, Eye, Moon, Sun, CloudRain, Snowflake,  Mountain, Feather, Infinity, Target, Compass, Lightbulb, Music, Camera, Gamepad2, Trophy, Anchor, Code2, ListOrdered,
};

export type ChatMode = 'auto' | 'normal' | 'pro' | 'deep' | 'web' | 'think' | 'rtm' | 'code' | 'builder' | 'study' | 'fast' | 'redwhale' | 'stepbystep';

interface CustomModeItem {
  id: string;
  name: string;
  icon: string;
  instructions: string;
}

interface ModeSelectorProps {
  selectedMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
  customModes?: CustomModeItem[];
}

interface ModeDef {
  id: ChatMode;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  glowColor: string;
  particleEmoji?: string;
}

const modes: ModeDef[] = [
  { id: 'auto', label: 'Auto', icon: Sparkles, description: 'Smart adaptive mode', color: 'text-purple-500', glowColor: 'shadow-purple-500/50', particleEmoji: '✨' },
  { id: 'stepbystep', label: 'Step-by-Step', icon: ListOrdered, description: 'Direct numbered steps', color: 'text-teal-400', glowColor: 'shadow-teal-400/50', particleEmoji: '📋' },
  { id: 'normal', label: 'Normal', icon: Zap, description: 'Balanced & powerful', color: 'text-blue-400', glowColor: 'shadow-blue-400/50', particleEmoji: '⚡' },
  { id: 'pro', label: 'RED WHALE PRO', icon: Crown, description: 'Elite deep answers', color: 'text-amber-400', glowColor: 'shadow-amber-400/50', particleEmoji: '👑' },
  { id: 'deep', label: 'Deep Search', icon: Brain, description: 'Comprehensive analysis', color: 'text-violet-400', glowColor: 'shadow-violet-400/50', particleEmoji: '🧠' },
  { id: 'web', label: 'Web Search', icon: Globe, description: 'Live web information', color: 'text-emerald-400', glowColor: 'shadow-emerald-400/50', particleEmoji: '🌐' },
  { id: 'rtm', label: 'RTM', icon: Radio, description: 'Real-time streaming', color: 'text-rose-400', glowColor: 'shadow-rose-400/50', particleEmoji: '📡' },
  { id: 'think', label: 'Thinking', icon: Brain, description: 'Show thought process', color: 'text-indigo-400', glowColor: 'shadow-indigo-400/50', particleEmoji: '💭' },
  { id: 'code', label: 'WHALE CODE', icon: Code2, description: 'Advanced coding', color: 'text-cyan-400', glowColor: 'shadow-cyan-400/50', particleEmoji: '💻' },
  { id: 'builder', label: 'WHALE BUILDER', icon: Hammer, description: 'Building guides', color: 'text-orange-400', glowColor: 'shadow-orange-400/50', particleEmoji: '🔨' },
  { id: 'study', label: 'WHALE STUDY', icon: GraduationCap, description: 'Educational answers', color: 'text-green-400', glowColor: 'shadow-green-400/50', particleEmoji: '📚' },
  { id: 'fast', label: 'WHALE FAST', icon: Rocket, description: 'Quick responses', color: 'text-red-400', glowColor: 'shadow-red-400/50', particleEmoji: '🚀' },
  { id: 'redwhale', label: 'RED WHALE V1', icon: Waves, description: 'Maximum power', color: 'text-primary', glowColor: 'shadow-primary/50', particleEmoji: '🐋' },
];

// Floating particles component
function FloatingParticles({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = [];
    const colors = ['#ef4444', '#3b82f6', '#a855f7', '#f97316', '#06b6d4', '#ec4899'];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = () => {
      if (particles.length < 30) {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 2 - 0.5,
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.6 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      spawn();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.003;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
        if (p.alpha <= 0 || p.y < -10) particles.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 rounded-3xl" />;
}

export function ModeSelector({ selectedMode, onModeChange, disabled, customModes = [] }: ModeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const currentMode = modes.find(m => m.id === selectedMode) || modes[0];
  const customCurrent = customModes.find(m => m.id === selectedMode);
  const Icon = customCurrent ? (iconMap[customCurrent.icon] || Sparkles) : currentMode.icon;
  const displayColor = customCurrent ? 'text-primary' : currentMode.color;
  const displayGlow = customCurrent ? 'shadow-primary/40' : currentMode.glowColor;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={cn(
            "h-11 w-11 shrink-0 rounded-2xl transition-all duration-500 relative overflow-visible",
            "hover:scale-110 hover:shadow-lg",
            displayGlow
          )}
          style={{ boxShadow: open ? `0 0 25px currentColor` : undefined }}
        >
          <motion.div
            animate={open ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Icon className={cn("w-5 h-5 transition-all duration-300", displayColor)} />
          </motion.div>
          {/* Glow ring */}
          <span className={cn(
            "absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none",
            open ? "opacity-100 scale-110" : "opacity-0 scale-90"
          )} style={{ boxShadow: `0 0 15px 2px currentColor` }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-72 rounded-3xl p-0 shadow-2xl border border-white/10 bg-gradient-to-b from-card/95 to-card/80 backdrop-blur-2xl overflow-hidden"
      >
        {/* Particle canvas overlay */}
        <FloatingParticles active={open} />

        <div className="relative z-10 p-3">
          <DropdownMenuLabel className="px-3 py-2 text-xs font-black tracking-[0.2em] uppercase opacity-60 text-center">
            NANO RED WHALE V2
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />

          <div className="grid gap-1 mt-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            {modes.map((mode, idx) => {
              const ModeIcon = mode.icon;
              const isSelected = mode.id === selectedMode;
              const isHovered = hoveredMode === mode.id;

              return (
                <DropdownMenuItem
                  key={mode.id}
                  onClick={() => { onModeChange(mode.id); setOpen(false); }}
                  onMouseEnter={() => setHoveredMode(mode.id)}
                  onMouseLeave={() => setHoveredMode(null)}
                  className={cn(
                    "cursor-pointer rounded-2xl p-3 transition-all duration-300 relative overflow-hidden group",
                    isSelected
                      ? "bg-gradient-to-r from-primary/15 to-transparent border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.15)]"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  {/* Glow effect on hover */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 30% 50%, ${mode.color.includes('red') ? 'rgba(239,68,68,0.1)' : mode.color.includes('blue') ? 'rgba(59,130,246,0.1)' : 'rgba(168,85,247,0.1)'}, transparent 70%)`
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between w-full relative z-10">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={isHovered ? { scale: 1.15, rotate: [0, -5, 5, 0] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "p-2.5 rounded-xl shadow-lg relative",
                          isSelected
                            ? `${mode.color} bg-gradient-to-br from-white/10 to-white/5 shadow-[0_0_12px_currentColor]`
                            : "bg-background/80 text-muted-foreground"
                        )}
                      >
                        <ModeIcon className={cn("w-4 h-4", isSelected ? mode.color : "")} />
                        {isSelected && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-ping" />
                        )}
                      </motion.div>
                      <div>
                        <p className={cn(
                          "font-bold text-sm tracking-tight",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {mode.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 font-medium leading-tight">
                          {mode.description}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn("p-1.5 rounded-full", mode.color.replace('text-', 'bg-') + String.fromCharCode(47) + '15')}
                      >
                        <Check className={cn("w-3.5 h-3.5", mode.color)} />
                      </motion.div>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}

            {customModes.length > 0 && (
              <>
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />
                <DropdownMenuLabel className="px-3 py-1 text-[10px] font-black tracking-widest uppercase opacity-40">CUSTOM</DropdownMenuLabel>
              </>
            )}

            {customModes.map((mode) => {
              const CustomIcon = iconMap[mode.icon] || Sparkles;
              const isSelected = mode.id === selectedMode;
              return (
                <DropdownMenuItem
                  key={mode.id}
                  onClick={() => { onModeChange(mode.id as ChatMode); setOpen(false); }}
                  className={cn(
                    "cursor-pointer rounded-2xl p-3 transition-all duration-300",
                    isSelected
                      ? "bg-gradient-to-r from-primary/15 to-transparent border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.15)]"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-background shadow-lg text-primary">
                        <CustomIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={cn("font-bold text-sm tracking-tight", isSelected ? "text-primary" : "text-foreground")}>{mode.name}</p>
                        <p className="text-[10px] text-muted-foreground/70 font-medium leading-tight">Custom mode</p>
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </motion.div>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
