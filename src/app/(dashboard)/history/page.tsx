'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PriceListData, UserSettings } from '@/types'

export default function HistoryPage() {
  const router = useRouter()
  const [priceLists, setPriceLists] = useState<PriceListData[]>([])
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [historyRes, settingsRes] = await Promise.all([
          fetch('/api/price-lists?limit=50'),
          fetch('/api/settings')
        ])
        const historyData = await historyRes.json()
        const settingsData = await settingsRes.json()

        if (historyData.success) {
          setPriceLists(historyData.data)
        }
        if (settingsData.success && settingsData.data) {
          setSettings(settingsData.data.settings || settingsData.data)
        }
      } catch (error) {
        console.error('Failed to load history:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/price-lists/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setPriceLists(prev => prev.filter(l => l._id !== id))
      } else {
        alert('Failed to delete price list')
      }
    } catch (error) {
      console.error('Failed to delete', error)
      alert('Error deleting price list')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-stone-200 rounded animate-pulse mb-6"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Price History</h1>
        <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-sm font-medium">
          {priceLists.length} Total
        </span>
      </div>

      {priceLists.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-stone-200">
          <h3 className="text-lg font-medium text-stone-900 mb-2">No price lists yet</h3>
          <p className="text-stone-500 mb-6">Create your first one to start tracking history!</p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {priceLists.map((list) => {
            const validItems = list.items.filter(i => (i.price || 0) > 0)
            
            return (
              <div 
                key={list._id}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-stone-200 cursor-pointer hover:border-red-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => router.push(`/dashboard?date=${list.date}`)}
              >
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">{formatDate(list.date)}</h3>
                  <p className="text-stone-500 text-sm mt-1">{list.shopName}</p>
                  <p className="text-stone-600 font-medium mt-2">
                    {validItems.length} items priced
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard?date=${list.date}`); }}
                    className="h-10 px-4 rounded-xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition-colors flex-1 sm:flex-none"
                  >
                    View / Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(list._id!); }}
                    className="h-10 px-4 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors flex-1 sm:flex-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-stone-900 mb-2">Delete Price List?</h3>
            <p className="text-stone-500 mb-6">Are you sure you want to delete this price list? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                className="flex-1 h-12 rounded-xl font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(deleteConfirmId); }}
                className="flex-1 h-12 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
