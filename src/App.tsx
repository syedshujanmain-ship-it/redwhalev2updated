import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { UICustomizationProvider } from '@/contexts/UICustomizationContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AppLanguageProvider } from '@/contexts/AppLanguageContext';
import { GlowModeProvider, useGlowMode } from '@/contexts/GlowModeContext';
import { ThemeTransitionOverlay } from '@/components/ThemeTransition';
import { FloatingTTSPlayer } from '@/components/chat/FloatingTTSPlayer';

import routes, { PageLoader } from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <GlowModeProvider>
      <LanguageProvider>
        <AppLanguageProvider>
          <UICustomizationProvider>
          <IntersectObserver />
          <GlowBackground />

        {/* Full-screen app container */}
        <ThemeTransitionOverlay />
        <FloatingTTSPlayer />
        <div className="relative z-10 h-full w-full">
          {/* Transparent content wrapper so glow shines through clearly */}
          <div className="w-full h-full overflow-hidden relative">
            <div className="flex flex-col h-full w-full overflow-hidden">
              <main className="flex-1 overflow-hidden">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {routes.map((route, index) => (
                      <Route
                        key={index}
                        path={route.path}
                        element={route.element}
                      />
                    ))}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </div>
        </div>
        <Toaster position="top-center" />
        </UICustomizationProvider>
        </AppLanguageProvider>
      </LanguageProvider>
      </GlowModeProvider>
    </Router>
  );
};

// GlowBackground — ambient edge glow, darker center, no top purple, higher blue
function GlowBackground() {
  const { glowMode } = useGlowMode();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const keyframes = `
    @keyframes float-x {
      0%, 100% { transform: translateX(0) scale(1); }
      50% { transform: translateX(14px) scale(1.04); }
    }
    @keyframes float-y {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-10px) scale(1.03); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* ===== OFF MODE: clean theme-aware background ===== */}
        {glowMode === 'off' && (
          <div className={cn("absolute inset-0", isDark ? "bg-[#0a0a0f]" : "bg-white")} />
        )}

        {/* ===== BLUE MODE: sides + bottom + light top, darker center ===== */}
        {glowMode === 'blue' && (
          <>
            <div className={cn("absolute inset-0", isDark ? "bg-[#040810]" : "bg-[#f8fbff]")} />

            {/* Bottom center — main glow */}
            <div className="absolute" style={{
              bottom: '-22%', left: '50%', transform: 'translateX(-50%)',
              width: '95%', height: '55%', borderRadius: '50%',
              background: isDark ? 'rgba(56,189,248,0.55)' : 'rgba(59,130,246,0.35)',
              filter: 'blur(130px)', animation: 'float-y 8s ease-in-out infinite',
            }} />

            {/* Bottom-left */}
            <div className="absolute" style={{
              bottom: '-15%', left: '-8%',
              width: '55%', height: '42%', borderRadius: '50%',
              background: isDark ? 'rgba(14,165,233,0.42)' : 'rgba(37,99,235,0.26)',
              filter: 'blur(100px)', animation: 'float-x 10s ease-in-out infinite',
            }} />

            {/* Bottom-right */}
            <div className="absolute" style={{
              bottom: '-12%', right: '-6%',
              width: '50%', height: '38%', borderRadius: '50%',
              background: isDark ? 'rgba(99,179,237,0.38)' : 'rgba(96,165,250,0.22)',
              filter: 'blur(90px)', animation: 'float-x 9s ease-in-out infinite reverse',
            }} />

            {/* Left side mid */}
            <div className="absolute" style={{
              top: '40%', left: '-12%',
              width: '30%', height: '45%', borderRadius: '50%',
              background: isDark ? 'rgba(37,99,235,0.22)' : 'rgba(59,130,246,0.13)',
              filter: 'blur(75px)', animation: 'float-y 11s ease-in-out infinite',
            }} />

            {/* Right side mid */}
            <div className="absolute" style={{
              top: '45%', right: '-10%',
              width: '28%', height: '40%', borderRadius: '50%',
              background: isDark ? 'rgba(96,165,250,0.20)' : 'rgba(37,99,235,0.11)',
              filter: 'blur(70px)', animation: 'float-y 10s ease-in-out infinite reverse',
            }} />

            {/* Center dark vignette — beech mein thoda neeche rahe */}
            <div className="absolute inset-0" style={{
              background: isDark
                ? 'radial-gradient(ellipse 50% 45% at 50% 55%, rgba(4,8,16,0.55) 0%, transparent 70%)'
                : 'radial-gradient(ellipse 50% 45% at 50% 55%, rgba(255,255,255,0.45) 0%, transparent 70%)',
            }} />

            {/* Fade from bottom half up to clean top */}
            <div className="absolute inset-x-0 bottom-0 h-[70%]" style={{
              background: isDark
                ? 'linear-gradient(to top, rgba(37,99,235,0.06) 0%, rgba(56,189,248,0.03) 40%, transparent 80%)'
                : 'linear-gradient(to top, rgba(59,130,246,0.04) 0%, rgba(37,99,235,0.02) 40%, transparent 80%)',
            }} />
          </>
        )}

        {/* ===== RED WHALE MODE: sides + bottom + light top, darker center ===== */}
        {glowMode === 'redwhale' && (
          <>
            <div className={cn("absolute inset-0", isDark ? "bg-[#120404]" : "bg-[#fff8f8]")} />

            {/* Bottom center — main glow */}
            <div className="absolute" style={{
              bottom: '-22%', left: '50%', transform: 'translateX(-50%)',
              width: '95%', height: '55%', borderRadius: '50%',
              background: isDark ? 'rgba(248,113,113,0.42)' : 'rgba(239,68,68,0.26)',
              filter: 'blur(130px)', animation: 'float-y 8s ease-in-out infinite',
            }} />

            {/* Bottom-left */}
            <div className="absolute" style={{
              bottom: '-15%', left: '-8%',
              width: '55%', height: '42%', borderRadius: '50%',
              background: isDark ? 'rgba(220,38,38,0.32)' : 'rgba(220,38,38,0.18)',
              filter: 'blur(100px)', animation: 'float-x 10s ease-in-out infinite',
            }} />

            {/* Bottom-right */}
            <div className="absolute" style={{
              bottom: '-12%', right: '-6%',
              width: '50%', height: '38%', borderRadius: '50%',
              background: isDark ? 'rgba(251,113,133,0.28)' : 'rgba(248,113,113,0.16)',
              filter: 'blur(90px)', animation: 'float-x 9s ease-in-out infinite reverse',
            }} />

            {/* Left side mid */}
            <div className="absolute" style={{
              top: '40%', left: '-12%',
              width: '30%', height: '45%', borderRadius: '50%',
              background: isDark ? 'rgba(220,38,38,0.16)' : 'rgba(239,68,68,0.09)',
              filter: 'blur(75px)', animation: 'float-y 11s ease-in-out infinite',
            }} />

            {/* Right side mid */}
            <div className="absolute" style={{
              top: '45%', right: '-10%',
              width: '28%', height: '40%', borderRadius: '50%',
              background: isDark ? 'rgba(251,113,133,0.14)' : 'rgba(220,38,38,0.08)',
              filter: 'blur(70px)', animation: 'float-y 10s ease-in-out infinite reverse',
            }} />

            {/* Top — subtle light */}
            <div className="absolute" style={{
              top: '-8%', left: '50%', transform: 'translateX(-50%)',
              width: '55%', height: '28%', borderRadius: '50%',
              background: isDark ? 'rgba(252,165,165,0.12)' : 'rgba(248,113,113,0.07)',
              filter: 'blur(80px)', animation: 'float-y 12s ease-in-out infinite',
            }} />

            {/* Center dark vignette */}
            <div className="absolute inset-0" style={{
              background: isDark
                ? 'radial-gradient(ellipse 50% 45% at 50% 55%, rgba(18,4,4,0.55) 0%, transparent 70%)'
                : 'radial-gradient(ellipse 50% 45% at 50% 55%, rgba(255,255,255,0.45) 0%, transparent 70%)',
            }} />

            {/* Fade from bottom half up to clean top */}
            <div className="absolute inset-x-0 bottom-0 h-[70%]" style={{
              background: isDark
                ? 'linear-gradient(to top, rgba(220,38,38,0.06) 0%, rgba(248,113,113,0.03) 40%, transparent 80%)'
                : 'linear-gradient(to top, rgba(239,68,68,0.04) 0%, rgba(220,38,38,0.02) 40%, transparent 80%)',
            }} />
          </>
        )}
      </div>
    </>
  );
}

export default App;
