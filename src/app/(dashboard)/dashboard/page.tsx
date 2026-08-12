'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PriceItem, PriceListData, DEFAULT_ITEMS, UserSettings, DEFAULT_SETTINGS } from '@/types';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlDate = searchParams.get('date');
  const today = new Date().toISOString().split('T')[0];

  const [dateString, setDateString] = useState(urlDate || today);
  const [items, setItems] = useState<PriceItem[]>([]);
  const [shopName, setShopName] = useState('My Chicken Shop');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPreviousList, setHasPreviousList] = useState(false);

  // Sync date string if URL changes
  useEffect(() => {
    if (urlDate) {
      setDateString(urlDate);
    }
  }, [urlDate]);

  // Fetch data on mount and when dateString changes
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
          const selectedList = lists.find((l) => l.date === dateString);
          if (selectedList && selectedList.items && selectedList.items.length > 0) {
            setItems(
              selectedList.items.sort((a, b) => a.orderIndex - b.orderIndex)
            );
          } else {
            // Use default items if no list exists for this date
            setItems(DEFAULT_ITEMS.map((item) => ({ ...item })));
          }

          // Check if there's a previous list (any list before the currently selected date)
          setHasPreviousList(lists.some((l) => l.date < dateString));
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
  }, [dateString]);

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
            date: dateString,
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
  }, [items, shopName, loading, dateString, settings.defaultUnit]);

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
        const prevList = lists.find((l) => l.date < dateString);
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
    setDateString(newDate);
    router.push(`/dashboard?date=${newDate}`);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-stone-200 rounded w-2/3 mb-2"></div>
        <div className="h-5 bg-stone-200 rounded w-1/3 mb-6"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl h-16 p-4 shadow-sm mb-3"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with shop name and date */}
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="text-2xl font-bold text-stone-900 bg-transparent border-none focus:ring-2 focus:ring-red-600 rounded px-1 -mx-1 block w-full outline-none"
            placeholder="Shop Name"
          />
          <div className="mt-2 flex items-center">
            <input 
              type="date"
              value={dateString}
              onChange={handleDateChange}
              className="bg-stone-100 text-stone-700 font-medium px-3 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
        <div className="text-sm font-medium whitespace-nowrap min-h-[24px] flex items-center">
          {saving && <span className="text-stone-500">Saving...</span>}
          {saved && <span className="text-green-600">✓ Saved</span>}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Simplified Items list */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm p-2 sm:p-3 relative group flex items-center gap-3 transition-all border border-stone-100"
          >
            {/* Item name */}
            <div className="flex-1">
              <input
                type="text"
                value={item.itemName}
                onChange={(e) => updateItem(index, { itemName: e.target.value })}
                className="w-full bg-transparent border-none rounded-lg px-2 min-h-[48px] focus:outline-none focus:bg-stone-50 focus:ring-2 focus:ring-red-600 font-medium text-stone-900"
                placeholder="Item name"
              />
            </div>

            {/* Price row */}
            <div className="w-32 sm:w-40 relative flex-shrink-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-medium">
                {settings.currency}
              </span>
              <input
                type="number"
                value={item.price || ''}
                onChange={(e) =>
                  updateItem(index, { price: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-8 pr-3 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-red-600 font-bold text-red-600"
                placeholder="0"
              />
            </div>

            {/* Delete button */}
            <button
              onClick={() => deleteItem(index)}
              className="w-12 h-12 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={addItem}
          className="w-full h-14 border-2 border-dashed border-stone-300 text-stone-500 rounded-xl font-medium hover:border-red-600 hover:text-red-600 transition-colors flex items-center justify-center text-lg"
        >
          + Add Item
        </button>

        {hasPreviousList && (
          <button
            onClick={copyFromLastDay}
            className="w-full h-12 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors flex items-center justify-center"
          >
            📋 Copy from Previous Day
          </button>
        )}
      </div>

      {/* Preview button */}
      <div className="pt-8 mt-4 border-t border-stone-200">
        <button
          onClick={() => router.push(`/preview?date=${dateString}`)}
          className="w-full h-14 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 active:bg-red-800 shadow-sm transition-colors flex items-center justify-center"
        >
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
