'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PriceItem, PriceListData, DEFAULT_ITEMS, UserSettings, DEFAULT_SETTINGS } from '@/types';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlDate = searchParams.get('date');
  const today = new Date().toISOString().split('T')[0];

  const currentDate = urlDate || today;
  const [items, setItems] = useState<PriceItem[]>([]);
  const [shopName, setShopName] = useState('My Chicken Shop');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPreviousList, setHasPreviousList] = useState(false);

  // Fetch data on mount and when currentDate changes
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch settings
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.success && settingsData.data) {
            setShopName(settingsData.data.shopName || 'My Chicken Shop');
            setSettings({ ...DEFAULT_SETTINGS, ...settingsData.data.settings });
          }
        }

        // Fetch price lists (latest first)
        const listRes = await fetch('/api/price-lists?limit=10');
        if (listRes.ok) {
          const listResponse = await listRes.json();
          const lists: PriceListData[] = listResponse.data || [];

          // Check if there's a list for the selected date
          const selectedList = lists.find((l) => l.date === currentDate);
          if (selectedList && selectedList.items && selectedList.items.length > 0) {
            setItems(
              selectedList.items.sort((a, b) => a.orderIndex - b.orderIndex)
            );
          } else {
            // Use default items if no list exists for this date
            setItems(DEFAULT_ITEMS.map((item) => ({ ...item })));
          }

          // Check if there's a previous list (any list before the currently selected date)
          setHasPreviousList(lists.some((l) => l.date < currentDate));
        } else {
          setItems(DEFAULT_ITEMS.map((item) => ({ ...item })));
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please refresh.');
        setItems(DEFAULT_ITEMS.map((item) => ({ ...item })));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentDate]);

  // Debounced auto-save
  useEffect(() => {
    if (loading || items.length === 0) return;

    const timer = setTimeout(async () => {
      setSaving(true);
      setSaved(false);
      setError(null);
      try {
        const res = await fetch('/api/price-lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopName,
            date: currentDate,
            items: items.map((item, index) => ({
              itemName: item.itemName,
              price: item.price || 0,
              unit: item.unit || settings.defaultUnit,
              note: item.note || '',
              orderIndex: index,
            })),
          }),
        });

        if (res.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } else {
          throw new Error('Save failed');
        }
      } catch (err) {
        console.error('Failed to save:', err);
        setError('Failed to auto-save. Check your connection.');
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [items, shopName, loading, currentDate, settings.defaultUnit]);

  const updateItem = (index: number, updates: Partial<PriceItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        itemName: '',
        price: 0,
        unit: settings.defaultUnit || 'per kg',
        note: '',
        orderIndex: prev.length,
      },
    ]);
  };

  const deleteItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const copyFromLastDay = async () => {
    try {
      const listRes = await fetch('/api/price-lists?limit=10');
      if (listRes.ok) {
        const listResponse = await listRes.json();
        const lists: PriceListData[] = listResponse.data || [];
        const prevList = lists.find((l) => l.date < currentDate);
        if (prevList && prevList.items.length > 0) {
          setItems(
            prevList.items
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((item, index) => ({
                ...item,
                orderIndex: index,
              }))
          );
        } else {
          alert('No previous price list found.');
        }
      }
    } catch (err) {
      console.error('Failed to copy from last day:', err);
      alert('Failed to copy from previous day.');
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    router.push(`/dashboard?date=${newDate}`);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse-subtle">
        <div className="h-10 bg-white/40 backdrop-blur rounded-2xl w-2/3 mb-2"></div>
        <div className="h-5 bg-white/40 backdrop-blur rounded-full w-1/3 mb-6"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel rounded-2xl h-20 p-4 shadow-sm mb-3 border-white/40"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with shop name and date */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 glass-panel p-6 rounded-3xl mb-8">
        <div className="flex-1 w-full">
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="text-3xl font-extrabold text-stone-900 bg-transparent border-none focus:ring-0 px-0 block w-full outline-none placeholder-stone-400 drop-shadow-sm transition-all"
            placeholder="Your Shop Name"
          />
          <div className="mt-3 flex items-center gap-3">
            <div className="relative">
              <input 
                type="date"
                value={currentDate}
                onChange={handleDateChange}
                className="glass-input text-stone-700 font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm"
              />
            </div>
            {saving && <span className="text-stone-500 text-sm font-semibold animate-pulse">Saving...</span>}
            {saved && <span className="text-green-600 text-sm font-semibold">✓ Saved</span>}
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-panel bg-red-500/10 border-red-500/20 text-red-700 p-4 rounded-2xl font-semibold backdrop-blur-md">
          {error}
        </div>
      )}

      {/* Simplified Items list */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="glass-panel rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all hover:shadow-lg hover:-translate-y-0.5 group"
          >
            {/* Item name */}
            <div className="flex-1">
              <input
                type="text"
                value={item.itemName}
                onChange={(e) => updateItem(index, { itemName: e.target.value })}
                className="w-full glass-input rounded-xl px-4 min-h-[52px] font-bold text-stone-900 placeholder-stone-400 text-lg"
                placeholder="Item name"
              />
            </div>

            {/* Price row */}
            <div className="w-36 sm:w-44 relative flex-shrink-0">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-lg">
                {settings.currency}
              </span>
              <input
                type="number"
                value={item.price || ''}
                onChange={(e) =>
                  updateItem(index, { price: parseFloat(e.target.value) || 0 })
                }
                className="w-full glass-input rounded-xl pl-10 pr-4 min-h-[52px] font-extrabold text-red-600 text-lg shadow-inner"
                placeholder="0"
              />
            </div>

            {/* Delete button */}
            <button
              onClick={() => deleteItem(index)}
              className="w-12 h-12 flex items-center justify-center text-stone-400 hover:text-white hover:bg-red-500/80 rounded-xl transition-all flex-shrink-0 backdrop-blur-md opacity-60 sm:opacity-0 group-hover:opacity-100 hover:opacity-100 shadow-sm"
              title="Delete Item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="space-y-4 pt-4">
        <button
          onClick={addItem}
          className="w-full h-16 glass-panel border-dashed border-2 border-stone-400/50 text-stone-600 rounded-2xl font-bold hover:border-red-500/70 hover:text-red-600 hover:bg-white/30 transition-all flex items-center justify-center text-lg gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Item
        </button>

        {hasPreviousList && (
          <button
            onClick={copyFromLastDay}
            className="w-full h-14 glass-button text-stone-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy from Previous Day
          </button>
        )}
      </div>

      {/* Preview button */}
      <div className="pt-10 mt-6 border-t border-white/30">
        <button
          onClick={() => router.push(`/preview?date=${currentDate}`)}
          className="w-full h-16 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl font-extrabold text-xl shadow-xl shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          Preview & Export
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-stone-500">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
