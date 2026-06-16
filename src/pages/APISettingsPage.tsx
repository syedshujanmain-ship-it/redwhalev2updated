// API Settings Page - Add your own Gemini API keys and choose models
import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, Key, Settings, Save, X, ChevronLeft, ExternalLink, CheckCircle2, AlertCircle, Globe, Zap, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { resetAPIKeyRotation, fetchCustomModels, selectBestModel } from '@/services/chat';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Available Gemini models
const GEMINI_MODELS = [
  { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
  { value: 'gemini-exp-1206', label: 'Gemini Experimental 1206' },
  { value: 'gemini-2.0-flash-thinking-exp-1219', label: 'Gemini 2.0 Flash Thinking' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Default)' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash 8B' },
];

interface CustomAPIKey {
  id: string;
  key: string;
  label: string;
  addedAt: string;
}

interface CustomProvider {
  enabled: boolean;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  format: 'gemini' | 'openai';
}

const DEFAULT_PROVIDER: CustomProvider = {
  enabled: false,
  name: 'Custom API',
  baseUrl: '',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  format: 'openai',
};

export function APISettingsPage() {
  const navigate = useNavigate();
  const [customKeys, setCustomKeys] = useState<CustomAPIKey[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeKeyIndex, setActiveKeyIndex] = useState<number>(0);

  // Custom provider state
  const [provider, setProvider] = useState<CustomProvider>(DEFAULT_PROVIDER);
  const [detectedFormat, setDetectedFormat] = useState<string>('OpenAI Compatible');
  const [detectedName, setDetectedName] = useState<string>('Custom API');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);


  // Auto-detect API format and provider name from URL
  const autoDetect = useCallback((url: string) => {
    const lower = url.toLowerCase();
    let format: 'gemini' | 'openai' = 'openai';
    let name = 'Custom API';

    if (lower.includes('generativelanguage.googleapis.com') || lower.includes('gemini')) {
      format = 'gemini';
      name = 'Google Gemini';
    } else if (lower.includes('openai.com')) {
      format = 'openai';
      name = 'OpenAI';
    } else if (lower.includes('anthropic')) {
      format = 'openai';
      name = 'Anthropic Claude';
    } else if (lower.includes('groq')) {
      format = 'openai';
      name = 'Groq';
    } else if (lower.includes('ollama') || lower.includes('localhost:11434')) {
      format = 'openai';
      name = 'Ollama (Local)';
    } else if (lower.includes('localhost') || lower.includes('127.0.0.1')) {
      format = 'openai';
      name = 'Local Server';
    }

    setDetectedFormat(format === 'gemini' ? 'Google Gemini Format' : 'OpenAI Compatible');
    setDetectedName(name);
    return { format, name };
  }, []);

  // Fetch models from custom API and auto-select best
  const handleFetchModels = useCallback(async () => {
    if (!provider.baseUrl || !provider.apiKey) return;
    setFetchingModels(true);
    try {
      const models = await fetchCustomModels(provider.baseUrl, provider.apiKey);
      setAvailableModels(models);
      if (models.length > 0) {
        const best = selectBestModel(models);
        setProvider(prev => ({ ...prev, model: best }));
        toast.success(`Found ${models.length} models. Best: ${best}`);
      } else {
        toast.error('No models found. Enter a model name manually.');
      }
    } catch (e) {
      toast.error('Could not fetch models. Enter a model name manually.');
    } finally {
      setFetchingModels(false);
    }
  }, [provider.baseUrl, provider.apiKey]);



  // Load settings on mount
  useEffect(() => {
    const stored = localStorage.getItem('redwhale_custom_api_keys');
    if (stored) {
      try {
        const keys = JSON.parse(stored);
        setCustomKeys(keys);
      } catch (e) {
        console.error('Failed to load custom API keys:', e);
      }
    }

    const storedModel = localStorage.getItem('redwhale_custom_model');
    if (storedModel) {
      setSelectedModel(storedModel);
    }

    const storedIndex = localStorage.getItem('redwhale_api_key_index');
    if (storedIndex) {
      setActiveKeyIndex(parseInt(storedIndex, 10));
    }

    // Load custom provider from app settings
    const appSettings = localStorage.getItem('redwhale_app_settings');
    if (appSettings) {
      try {
        const parsed = JSON.parse(appSettings);
        if (parsed.customProvider) {
          const loaded = { ...DEFAULT_PROVIDER, ...parsed.customProvider };
          setProvider(loaded);
          autoDetect(loaded.baseUrl);
        }
      } catch (e) {
        console.error('Failed to load custom provider:', e);
      }
    }
  }, [autoDetect]);

  // Save custom provider to app settings
  const saveCustomProvider = (updated: CustomProvider) => {
    setProvider(updated);
    const appSettings = localStorage.getItem('redwhale_app_settings');
    let parsed = {};
    if (appSettings) {
      try { parsed = JSON.parse(appSettings); } catch { /* ignore */ }
    }
    localStorage.setItem('redwhale_app_settings', JSON.stringify({ ...parsed, customProvider: updated }));
    toast.success('Custom provider saved');
  };

  // Save custom keys to localStorage
  const saveCustomKeys = (keys: CustomAPIKey[]) => {
    localStorage.setItem('redwhale_custom_api_keys', JSON.stringify(keys));
    setCustomKeys(keys);
  };

  // Add new API key
  const handleAddKey = () => {
    if (!newKeyInput.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    // Validate API key format - accept both AIzaSy and AQ. prefixed keys
    const trimmed = newKeyInput.trim();
    if (!trimmed.startsWith('AIzaSy') && !trimmed.startsWith('AQ.')) {
      toast.error('Invalid API key format. Keys should start with "AIzaSy" or "AQ."');
      return;
    }
    if (trimmed.length < 20) {
      toast.error('API key too short. Please enter a complete key.');
      return;
    }

    const newKey: CustomAPIKey = {
      id: Date.now().toString(),
      key: newKeyInput.trim(),
      label: newKeyLabel.trim() || `API Key ${customKeys.length + 1}`,
      addedAt: new Date().toISOString(),
    };

    const updatedKeys = [...customKeys, newKey];
    saveCustomKeys(updatedKeys);
    
    // CRITICAL FIX: Reset API key rotation to use new keys immediately
    resetAPIKeyRotation();
    
    setNewKeyInput('');
    setNewKeyLabel('');
    setShowAddDialog(false);
    toast.success('API key added successfully! It will be used for your next request.');
  };

  // Remove API key
  const handleRemoveKey = (id: string) => {
    const updatedKeys = customKeys.filter(k => k.id !== id);
    saveCustomKeys(updatedKeys);
    
    // CRITICAL FIX: Reset API key rotation after removing keys
    resetAPIKeyRotation();
    
    toast.success('API key removed');
  };

  // Save model selection
  const handleSaveModel = () => {
    localStorage.setItem('redwhale_custom_model', selectedModel);
    toast.success('Model saved successfully');
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    localStorage.removeItem('redwhale_custom_api_keys');
    localStorage.removeItem('redwhale_custom_model');
    setCustomKeys([]);
    setSelectedModel('gemini-2.5-flash');
    
    // Also clear custom provider
    const updated = { ...DEFAULT_PROVIDER };
    setProvider(updated);
    const appSettings = localStorage.getItem('redwhale_app_settings');
    let parsed = {};
    if (appSettings) {
      try { parsed = JSON.parse(appSettings); } catch { /* ignore */ }
    }
    localStorage.setItem('redwhale_app_settings', JSON.stringify({ ...parsed, customProvider: updated }));
    
    resetAPIKeyRotation();
    
    toast.success('All API settings cleared.');
  };

  return (
    <>
      <Helmet>
        <title>API Settings - Red Whale V2</title>
      </Helmet>

      <div className="flex h-screen flex-col bg-background overflow-hidden">
        {/* Header */}
        <header className="shrink-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">API Settings</h1>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleResetToDefaults}>
              Reset All
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <ScrollArea className="flex-1 w-full">
          <div className="container max-w-2xl py-8 px-4 space-y-6">

            {/* Provider Selector Tabs */}
            <Tabs
              value={provider.enabled ? 'allapi' : 'gemini'}
              onValueChange={(val) => {
                if (val === 'gemini') {
                  saveCustomProvider({ ...provider, enabled: false });
                } else {
                  saveCustomProvider({ ...provider, enabled: true, name: 'All API' });
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="gemini" className="gap-1.5 px-1 sm:px-3">
                  <Zap className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">Gemini</span>
                </TabsTrigger>
                <TabsTrigger value="allapi" className="gap-1.5 px-1 sm:px-3">
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">All API</span>
                </TabsTrigger>
              </TabsList>

              {/* Gemini Provider Tab */}
              <TabsContent value="gemini" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gemini Model</CardTitle>
                    <CardDescription>
                      Choose which Gemini model to use. All models are completely unrestricted.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="model-select">Select Model</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger id="model-select">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          {GEMINI_MODELS.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleSaveModel} className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save Model
                    </Button>
                  </CardContent>
                </Card>

                {/* Gemini API Keys Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Gemini API Keys</CardTitle>
                    <CardDescription>
                      Add your own Gemini API keys. At least one key is required.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Plus className="mr-2 h-4 w-4" /> Add API Key
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New API Key</DialogTitle>
                          <DialogDescription>
                            Enter your Gemini API key from Google AI Studio.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="api-key">API Key</Label>
                            <Input
                              id="api-key" type="password" placeholder="AIzaSy..."
                              value={newKeyInput}
                              onChange={(e) => setNewKeyInput(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleAddKey} className="flex-1">
                              <Plus className="mr-2 h-4 w-4" /> Add
                            </Button>
                            <Button variant="outline" onClick={() => { setShowAddDialog(false); setNewKeyInput(''); setNewKeyLabel(''); }}>
                              <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {customKeys.length > 0 ? (
                      <div className="space-y-2">
                        {customKeys.map((apiKey, index) => {
                          const isActive = index === activeKeyIndex;
                          return (
                            <div key={apiKey.id} className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${isActive ? 'border-primary bg-primary/5' : ''}`}>
                              <div className="flex items-center gap-3">
                                {isActive ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Key className="h-4 w-4 text-muted-foreground" />}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{apiKey.label}</p>
                                    {isActive && <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">ACTIVE</span>}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{apiKey.key.substring(0, 15)}...{apiKey.key.substring(apiKey.key.length - 4)}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveKey(apiKey.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-6 text-center">
                        <Key className="mx-auto h-10 w-10 text-destructive" />
                        <p className="mt-2 text-sm text-muted-foreground">No API keys added. Add one to use Red Whale.</p>
                        <Button variant="outline" className="mt-3" onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}>
                          <ExternalLink className="mr-2 h-4 w-4" /> Get API Key
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* All API Tab — Only Endpoint + Model Name */}
              <TabsContent value="allapi" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Custom API</CardTitle>
                    <CardDescription>
                      Enter your API endpoint and model name. That's all you need.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Endpoint URL */}
                    <div className="space-y-2">
                      <Label htmlFor="allapi-url">Endpoint URL</Label>
                      <Input
                        id="allapi-url"
                        placeholder="https://api.openai.com/v1"
                        value={provider.baseUrl}
                        onChange={(e) => {
                          const url = e.target.value;
                          const { format } = autoDetect(url);
                          setProvider(prev => ({ ...prev, baseUrl: url, format, name: 'All API' }));
                        }}
                      />
                    </div>

                    {/* API Key */}
                    <div className="space-y-2">
                      <Label htmlFor="allapi-key">API Key</Label>
                      <Input
                        id="allapi-key"
                        type="password"
                        placeholder="Paste your API key here"
                        value={provider.apiKey}
                        onChange={(e) => setProvider(prev => ({ ...prev, apiKey: e.target.value }))}
                      />
                    </div>

                    {/* Model Name */}
                    <div className="space-y-2">
                      <Label htmlFor="allapi-model">Model Name</Label>
                      <Input
                        id="allapi-model"
                        placeholder="gpt-3.5-turbo"
                        value={provider.model}
                        onChange={(e) => setProvider(prev => ({ ...prev, model: e.target.value }))}
                      />
                    </div>

                    {/* Save & Activate */}
                    <Button
                      onClick={() => {
                        if (!provider.baseUrl || !provider.apiKey || !provider.model) {
                          toast.error('URL, key, and model are all required');
                          return;
                        }
                        saveCustomProvider({ ...provider, enabled: true, name: 'All API' });
                        resetAPIKeyRotation();
                        toast.success('API activated! Redirecting to chat...');
                        setTimeout(() => navigate('/'), 600);
                      }}
                      className="w-full"
                      disabled={!provider.baseUrl || !provider.apiKey || !provider.model}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Activate & Chat
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Presets */}
                <Card className="border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-primary">Quick Presets</CardTitle>
                    <CardDescription>One-click auto-fill for popular APIs</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'OpenAI', url: 'https://api.openai.com/v1' },
                      { name: 'Ollama Local', url: 'http://localhost:11434/v1' },
                      { name: 'Groq', url: 'https://api.groq.com/openai/v1' },
                      { name: 'Local Server', url: 'http://localhost:8000/v1' },
                    ].map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const { format } = autoDetect(preset.url);
                          setProvider(prev => ({
                            ...prev,
                            baseUrl: preset.url,
                            format,
                            name: 'All API',
                          }));
                          toast.success(`${preset.name} preset loaded. Enter API key + model.`);
                        }}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
