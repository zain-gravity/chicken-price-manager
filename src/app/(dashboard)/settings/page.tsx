'use client';

import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { UserSettings, DEFAULT_SETTINGS } from '@/types';
import Link from 'next/link';

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
      <div className="min-h-screen bg-stone-50 p-4 pb-24">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-2xl h-40"></div>
          <div className="bg-white rounded-2xl h-40"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          ⚙️ Settings
        </h1>
        <div className="text-sm font-medium">
          {saveStatus === 'saving' && <span className="text-stone-500">Saving...</span>}
          {saveStatus === 'saved' && <span className="text-green-600">✓ Saved</span>}
          {saveStatus === 'error' && <span className="text-red-600">Error saving</span>}
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Shop Profile */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-stone-100">
            <h2 className="text-base font-semibold text-stone-900 mb-4">Shop Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-stone-700 mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-stone-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-stone-900 bg-white"
                  placeholder="e.g. Fresh Chicken Center"
                  required
                />
                <p className="mt-1 text-xs text-stone-500">
                  Displayed at the top of your price lists
                </p>
              </div>

              <div className="flex gap-3">
                <div className="w-1/3">
                  <label htmlFor="currency" className="block text-sm font-medium text-stone-700 mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-stone-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-stone-900 text-center bg-white"
                    placeholder="₹"
                    required
                  />
                </div>
                
                <div className="w-2/3">
                  <label htmlFor="defaultUnit" className="block text-sm font-medium text-stone-700 mb-1">
                    Default Unit
                  </label>
                  <select
                    id="defaultUnit"
                    value={settings.defaultUnit}
                    onChange={(e) => setSettings({ ...settings, defaultUnit: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-stone-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-stone-900 bg-white appearance-none"
                  >
                    <option value="per kg">per kg</option>
                    <option value="per piece">per piece</option>
                    <option value="per 500g">per 500g</option>
                    <option value="per pack">per pack</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Export Preferences */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-stone-100">
            <h2 className="text-base font-semibold text-stone-900 mb-4">Export Preferences</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Default Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['pdf', 'image', 'both'].map((format) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setSettings({ ...settings, defaultExportFormat: format as 'pdf' | 'image' | 'both' })}
                      className={`h-12 rounded-xl text-sm font-medium capitalize transition-all border ${
                        settings.defaultExportFormat === format
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Image Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, imageTheme: 'light' })}
                    className={`relative p-3 rounded-xl text-sm font-medium transition-all border text-left flex items-center gap-3 ${
                      settings.imageTheme === 'light'
                        ? 'border-red-600 bg-red-50'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-white border border-stone-200 shadow-sm flex items-center justify-center">
                      ☀️
                    </div>
                    <span className={settings.imageTheme === 'light' ? 'text-red-700' : 'text-stone-700'}>Light</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, imageTheme: 'dark' })}
                    className={`relative p-3 rounded-xl text-sm font-medium transition-all border text-left flex items-center gap-3 ${
                      settings.imageTheme === 'dark'
                        ? 'border-red-600 bg-red-50'
                        : 'border-stone-200 bg-stone-900 hover:bg-stone-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-stone-800 border border-stone-700 shadow-sm flex items-center justify-center">
                      🌙
                    </div>
                    <span className={settings.imageTheme === 'dark' ? 'text-red-700' : 'text-white'}>Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Settings */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-stone-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-semibold text-stone-900">Price List Footer</h2>
                <p className="text-xs text-stone-500">Show custom text at the bottom of lists</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, showFooter: !settings.showFooter })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showFooter ? 'bg-red-600' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showFooter ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {settings.showFooter && (
              <div className="mt-4">
                <textarea
                  value={settings.footerText}
                  onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-lg border border-stone-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-stone-900 text-sm bg-white resize-none"
                  placeholder="Prices may change without notice..."
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="w-full h-12 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="pt-6 border-t border-stone-200">
            <h3 className="text-sm font-semibold text-stone-900 mb-1">Data & Backup</h3>
            <p className="text-xs text-stone-500 mb-3">Download a copy of all your saved price lists.</p>
            <button
              onClick={handleExportBackup}
              className="w-full h-12 border-2 border-dashed border-stone-300 hover:border-red-400 hover:bg-red-50 text-stone-700 hover:text-red-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
            >
              ⬇️ Export Backup (JSON)
            </button>
          </div>

          <div className="pt-4">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full h-12 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 font-medium rounded-xl transition-colors flex items-center justify-center"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
