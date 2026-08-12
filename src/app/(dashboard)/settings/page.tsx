'use client';

import { useState, useEffect } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '@/types';

export default function SettingsPage() {
  const [shopName, setShopName] = useState('');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setShopName(data.data.shopName || '');
            setSettings({
              ...DEFAULT_SETTINGS,
              ...data.data.settings,
            });
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveStatus('saving');
    
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName, settings }),
      });
      
      const data = await res.json();
      if (data.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
    }
  };

  const handleExportBackup = async () => {
    try {
      const res = await fetch('/api/price-lists?limit=999');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chicken-price-backup-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Failed to export backup:', error);
      alert('Failed to export backup. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-lg mx-auto pb-24">
        <div className="animate-pulse-subtle space-y-4">
          <div className="h-8 bg-white/40 backdrop-blur rounded-2xl w-1/3 mb-6"></div>
          <div className="glass-panel rounded-3xl h-48"></div>
          <div className="glass-panel rounded-3xl h-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-stone-900 drop-shadow-sm flex items-center gap-3">
          <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          Settings
        </h1>
        <div className="text-sm font-bold bg-white/40 px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
          {saveStatus === 'idle' && <span className="text-stone-600">Ready</span>}
          {saveStatus === 'saving' && <span className="text-stone-600 animate-pulse">Saving...</span>}
          {saveStatus === 'saved' && <span className="text-green-600">✓ Saved</span>}
          {saveStatus === 'error' && <span className="text-red-600">Error saving</span>}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Shop Profile */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 hover:shadow-xl transition-all">
          <h2 className="text-xl font-extrabold text-stone-900 mb-6 flex items-center gap-2">
            <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Shop Profile
          </h2>
          
          <div className="space-y-5">
            <div>
              <label htmlFor="shopName" className="block text-sm font-bold text-stone-700 mb-2 ml-1">
                Shop Name
              </label>
              <input
                type="text"
                id="shopName"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full glass-input h-14 px-5 rounded-2xl text-stone-900 font-bold text-lg placeholder-stone-400"
                placeholder="e.g. Fresh Chicken Center"
                required
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/3">
                <label htmlFor="currency" className="block text-sm font-bold text-stone-700 mb-2 ml-1">
                  Currency
                </label>
                <input
                  type="text"
                  id="currency"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full glass-input h-14 px-5 rounded-2xl text-stone-900 font-extrabold text-center text-lg"
                  placeholder="₹"
                  required
                />
              </div>
              
              <div className="w-2/3">
                <label htmlFor="defaultUnit" className="block text-sm font-bold text-stone-700 mb-2 ml-1">
                  Default Unit
                </label>
                <div className="relative">
                  <select
                    id="defaultUnit"
                    value={settings.defaultUnit}
                    onChange={(e) => setSettings({ ...settings, defaultUnit: e.target.value })}
                    className="w-full glass-input h-14 px-5 rounded-2xl text-stone-900 font-bold appearance-none text-lg"
                  >
                    <option value="per kg">per kg</option>
                    <option value="per piece">per piece</option>
                    <option value="per 500g">per 500g</option>
                    <option value="per pack">per pack</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Preferences */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 hover:shadow-xl transition-all">
          <h2 className="text-xl font-extrabold text-stone-900 mb-6 flex items-center gap-2">
            <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Preferences
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-3 ml-1">
                Default Export Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['pdf', 'image', 'both'].map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => setSettings({ ...settings, defaultExportFormat: format as 'pdf' | 'image' | 'both' })}
                    className={`h-12 rounded-xl text-sm font-bold capitalize transition-all border-2 ${
                      settings.defaultExportFormat === format
                        ? 'border-red-500 bg-red-500/10 text-red-700 shadow-inner'
                        : 'border-white/40 bg-white/20 text-stone-600 hover:bg-white/40'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-3 ml-1">
                Image Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, imageTheme: 'light' })}
                  className={`p-3 rounded-2xl text-sm font-bold transition-all border-2 flex items-center gap-3 ${
                    settings.imageTheme === 'light'
                      ? 'border-red-500 bg-red-500/10 text-red-700 shadow-inner'
                      : 'border-white/40 bg-white/20 text-stone-600 hover:bg-white/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-lg">
                    ☀️
                  </div>
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, imageTheme: 'dark' })}
                  className={`p-3 rounded-2xl text-sm font-bold transition-all border-2 flex items-center gap-3 ${
                    settings.imageTheme === 'dark'
                      ? 'border-red-500 bg-stone-900/80 text-white shadow-inner'
                      : 'border-stone-800/20 bg-stone-800/40 text-stone-800 hover:bg-stone-800/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 shadow-sm flex items-center justify-center text-lg">
                    🌙
                  </div>
                  <span className={settings.imageTheme === 'dark' ? 'text-white' : 'text-stone-900'}>Dark</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
                <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Price List Footer
              </h2>
              <p className="text-sm font-medium text-stone-500 mt-1">Custom text at the bottom of lists</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, showFooter: !settings.showFooter })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors shadow-inner ${
                settings.showFooter ? 'bg-green-500' : 'bg-stone-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
                  settings.showFooter ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {settings.showFooter && (
            <div className="mt-6">
              <textarea
                value={settings.footerText}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                rows={3}
                className="w-full glass-input p-5 rounded-2xl text-stone-900 font-medium text-sm resize-none placeholder-stone-400"
                placeholder="e.g. Prices may change without notice..."
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saveStatus === 'saving'}
          className="w-full h-16 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl font-extrabold text-xl shadow-xl shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="mt-12 space-y-4">
        <div className="pt-8 border-t border-white/40">
          <button
            onClick={handleExportBackup}
            className="w-full h-14 glass-button text-stone-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Backup (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}
