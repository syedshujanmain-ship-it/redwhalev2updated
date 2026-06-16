import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type GlowMode = 'blue' | 'redwhale' | 'off';

interface GlowModeContextType {
  glowMode: GlowMode;
  setGlowMode: (mode: GlowMode) => void;
}

const GlowModeContext = createContext<GlowModeContextType>({
  glowMode: 'blue',
  setGlowMode: () => {},
});

export function GlowModeProvider({ children }: { children: React.ReactNode }) {
  const [glowMode, setGlowModeState] = useState<GlowMode>(() => {
    const saved = localStorage.getItem('rw_glow_mode') as GlowMode;
    if (saved === 'redwhale' || saved === 'off') return saved;
    return 'blue';
  });

  const setGlowMode = useCallback((mode: GlowMode) => {
    setGlowModeState(mode);
    localStorage.setItem('rw_glow_mode', mode);
  }, []);

  return (
    <GlowModeContext.Provider value={{ glowMode, setGlowMode }}>
      {children}
    </GlowModeContext.Provider>
  );
}

export function useGlowMode() {
  return useContext(GlowModeContext);
}
