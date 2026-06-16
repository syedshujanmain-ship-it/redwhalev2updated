import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Key, Zap, AlertTriangle, Plus, ExternalLink, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';

type PopupType = 'no-api' | 'quota-exhausted' | 'default-exhausted' | null;

interface PremiumPopupProps {
  trigger?: boolean;
  type?: PopupType;
  onClose?: () => void;
}

export function PremiumPopup({ trigger, type, onClose }: PremiumPopupProps) {
  const [open, setOpen] = useState(false);
  const [popupType, setPopupType] = useState<PopupType>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (trigger && type) {
      setPopupType(type);
      setOpen(true);
    }
  }, [trigger, type]);

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleAddAPI = () => {
    setOpen(false);
    navigate('/api-settings');
  };

  const isNoAPI = popupType === 'no-api';
  const isQuota = popupType === 'quota-exhausted';
  const isDefaultExhausted = popupType === 'default-exhausted';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              {isNoAPI || isDefaultExhausted ? (
                <Key className="w-8 h-8 text-white" />
              ) : (
                <Zap className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <DialogTitle className="text-lg font-black">
            {isDefaultExhausted
              ? 'Default API Limit Finished'
              : isNoAPI
                ? 'API Key Required'
                : 'Quota Exhausted'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              {isDefaultExhausted
                ? 'Your default free API limit has finished for today. Default APIs refresh daily at midnight. Add your own API key to continue chatting without limits!'
                : isNoAPI
                  ? 'You need to add an API key to use Red Whale V2. No default keys are provided.'
                  : `All your API keys have reached their daily quota. Each key provides 20 requests per day.`}
            </p>
          </div>

          {/* Easy API Options */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground">Quick Setup Options:</h4>
            <div className="grid grid-cols-1 gap-2">
              {/* Option 1: FreeLLM API */}
              <button
                onClick={() => { setOpen(false); onClose?.(); window.location.href = '/api-settings?tab=allapi'; }}
                className="flex items-center gap-3 p-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">Use FreeLLM API</p>
                  <p className="text-[11px] text-muted-foreground">Free unlimited API — no signup needed. API ID: apf_h9p30mzs36zlle3pdv64cdak</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
              {/* Option 2: Gemini API */}
              <button
                onClick={() => { setOpen(false); onClose?.(); window.location.href = '/api-settings?tab=gemini'; }}
                className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">Add Gemini API Key</p>
                  <p className="text-[11px] text-muted-foreground">Free from Google AI Studio. 20 requests/day per key.</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
              {/* Option 3: Custom API */}
              <button
                onClick={() => { setOpen(false); onClose?.(); window.location.href = '/api-settings?tab=custom'; }}
                className="flex items-center gap-3 p-3 rounded-xl border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">Use Custom API</p>
                  <p className="text-[11px] text-muted-foreground">Connect OpenAI, Anthropic, or any provider.</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-primary font-medium">
              <Zap className="w-3 h-3 inline mr-1" />
              {isDefaultExhausted
                ? 'Default APIs refresh daily at midnight. Add your own key for unlimited access!'
                : 'Pro Tip: Add multiple API keys for more daily quota. 5 keys = 100 requests/day!'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleAddAPI} className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white font-bold">
              <Plus className="w-4 h-4 mr-2" />
              {isDefaultExhausted ? 'Add Your API Key' : 'Open API Settings'}
            </Button>
            {isDefaultExhausted && (
              <p className="text-[11px] text-muted-foreground text-center">
                Or come back tomorrow — default APIs reset at midnight
              </p>
            )}
            <Button variant="outline" onClick={handleClose} className="w-full">
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check API key status — checks ALL API sources
export function useAPIStatus() {
  const [hasAPIKeys, setHasAPIKeys] = useState(true);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [defaultApiExhausted, setDefaultApiExhausted] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        // Check 1: Custom Gemini API keys
        const stored = localStorage.getItem('redwhale_custom_api_keys');
        const keys = stored ? JSON.parse(stored) : [];
        if (keys.length > 0) {
          setHasAPIKeys(true);
          setDefaultApiExhausted(false);
          return;
        }

        // Check 2: All API / Custom API provider in app settings
        const appSettingsRaw = localStorage.getItem('redwhale_app_settings');
        if (appSettingsRaw) {
          const appSettings = JSON.parse(appSettingsRaw);
          if (appSettings.customProvider?.enabled && appSettings.customProvider?.apiKey) {
            setHasAPIKeys(true);
            setDefaultApiExhausted(false);
            return;
          }
        }

        // Check 3: FreeLLM All API tab selected
        const allApiTab = localStorage.getItem('redwhale_allapi_tab');
        if (allApiTab === 'allapi') {
          setHasAPIKeys(true);
          setDefaultApiExhausted(false);
          return;
        }

        // Check 4: Default APIs available
        const defaultApiEnabled = appSettingsRaw ? JSON.parse(appSettingsRaw).defaultAPIEnabled !== false : true;
        if (defaultApiEnabled) {
          const usageRaw = localStorage.getItem('redwhale_default_api_usage');
          if (usageRaw) {
            const usage = JSON.parse(usageRaw);
            const today = new Date().toISOString().split('T')[0];
            const totalAvailable = usage.filter((u: any) => u.lastResetDate !== today || u.usedCount < 20).length;
            if (totalAvailable > 0) {
              setHasAPIKeys(true);
              setDefaultApiExhausted(false);
              return;
            }
          } else {
            // No usage tracking yet - default APIs are fresh
            setHasAPIKeys(true);
            setDefaultApiExhausted(false);
            return;
          }
          // Default APIs exhausted
          setDefaultApiExhausted(true);
        }

        setHasAPIKeys(false);
      } catch {
        setHasAPIKeys(false);
      }
    };
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  const markQuotaExhausted = () => setQuotaExhausted(true);
  const resetQuota = () => setQuotaExhausted(false);

  return { hasAPIKeys, quotaExhausted, defaultApiExhausted, markQuotaExhausted, resetQuota };
}