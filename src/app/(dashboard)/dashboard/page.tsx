'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PriceItem, PriceListData, DEFAULT_ITEMS, UserSettings, DEFAULT_SETTINGS } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<PriceItem[]>([]);
  const [shopName, setShopName] = useState('My Chicken Shop');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPreviousList, setHasPreviousList] = useState(false);

  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  const displayDate = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Fetch data on mount
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
        const listRes = await fetch('/api/price-lists?limit=5');
        if (listRes.ok) {
          const listResponse = await listRes.json();
          const lists: PriceListData[] = listResponse.data || [];

          // Check if there's a today's list
          const todayList = lists.find((l) => l.date === dateString);
          if (todayList) {
            setItems(
              todayList.items.sort((a, b) => a.orderIndex - b.orderIndex)
            );
          } else {
            // Use default items
            setItems(DEFAULT_ITEMS.map((item) => ({ ...item })));
          }

          // Check if there's a previous (non-today) list
          setHasPreviousList(lists.some((l) => l.date !== dateString));
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
              price: item.price,
              unit: item.unit,
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
  }, [items, shopName, loading, dateString]);

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

  const moveItem = (index: number, direction: 'up' | 'down') => {
    setItems((prev) => {
      const newItems = [...prev];
      if (direction === 'up' && index > 0) {
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      } else if (direction === 'down' && index < newItems.length - 1) {
        [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
      }
      return newItems;
    });
  };

  const copyFromLastDay = async () => {
    try {
      const listRes = await fetch('/api/price-lists?limit=10');
      if (listRes.ok) {
        const listResponse = await listRes.json();
        const lists: PriceListData[] = listResponse.data || [];
        const prevList = lists.find((l) => l.date !== dateString);
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

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-stone-200 rounded w-2/3 mb-2"></div>
        <div className="h-5 bg-stone-200 rounded w-1/3 mb-6"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl h-40 p-4 shadow-sm mb-3"></div>
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
          <p className="text-stone-500 mt-1 font-medium">{displayDate}</p>
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

      {/* Items list */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm p-4 relative group transition-all"
          >
            {/* Item name */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={item.itemName}
                onChange={(e) => updateItem(index, { itemName: e.target.value })}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-red-600 w-full font-medium"
                placeholder="Item name (e.g. Curry Cut)"
              />
            </div>

            {/* Price + unit row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-medium">
                  {settings.currency}
                </span>
                <input
                  type="number"
                  value={item.price || ''}
                  onChange={(e) =>
                    updateItem(index, { price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-8 pr-3 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
                  placeholder="0"
                />
              </div>

              <select
                value={item.unit}
                onChange={(e) => updateItem(index, { unit: e.target.value })}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-700"
              >
                <option value="per kg">per kg</option>
                <option value="per piece">per piece</option>
                <option value="per 500g">per 500g</option>
                <option value="per pack">per pack</option>
              </select>
            </div>

            {/* Note */}
            <div className="mt-3">
              <input
                type="text"
                value={item.note || ''}
                onChange={(e) => updateItem(index, { note: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 min-h-[40px] text-sm focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-stone-400"
                placeholder="Note (optional, e.g. Fresh stock)"
              />
            </div>

            {/* Mobile controls */}
            <div className="flex justify-end gap-2 mt-3 border-t border-stone-100 pt-3">
              <button
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                className="flex-1 max-w-[60px] min-h-[44px] flex items-center justify-center bg-stone-50 text-stone-600 rounded-xl disabled:opacity-30 border border-stone-200"
              >
                ▲
              </button>
              <button
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                className="flex-1 max-w-[60px] min-h-[44px] flex items-center justify-center bg-stone-50 text-stone-600 rounded-xl disabled:opacity-30 border border-stone-200"
              >
                ▼
              </button>
              <button
                onClick={() => deleteItem(index)}
                className="flex-1 max-w-[60px] min-h-[44px] flex items-center justify-center bg-red-50 text-red-600 rounded-xl border border-red-100 ml-auto"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={addItem}
          className="w-full min-h-[56px] border-2 border-dashed border-stone-300 text-stone-500 rounded-xl font-medium hover:border-red-600 hover:text-red-600 transition-colors flex items-center justify-center text-lg"
        >
          + Add Item
        </button>

        {hasPreviousList && (
          <button
            onClick={copyFromLastDay}
            className="w-full min-h-[48px] bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition-colors flex items-center justify-center"
          >
            📋 Copy from Last Day
          </button>
        )}
      </div>

      {/* Preview button */}
      <div className="pt-8 mt-4 border-t border-stone-200">
        <button
          onClick={() => router.push('/preview')}
          className="w-full h-14 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 active:bg-red-800 shadow-sm transition-colors flex items-center justify-center"
        >
          Preview & Export
        </button>
      </div>
    </div>
  );
}
