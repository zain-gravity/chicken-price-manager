'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PriceListData } from '@/types'

export default function HistoryPage() {
  const router = useRouter()
  const [priceLists, setPriceLists] = useState<PriceListData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const historyRes = await fetch('/api/price-lists?limit=50')
        const historyData = await historyRes.json()

        if (historyData.success && historyData.data) {
          setPriceLists(historyData.data)
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
        <div className="h-8 w-48 bg-white/40 backdrop-blur rounded-2xl animate-pulse-subtle mb-6"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 glass-panel rounded-3xl animate-pulse-subtle"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-stone-900 drop-shadow-sm">Price History</h1>
        <span className="glass-panel text-stone-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
          {priceLists.length} Total
        </span>
      </div>

      {priceLists.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-stone-900 mb-2">No price lists yet</h3>
          <p className="text-stone-500 font-medium mb-8">Create your first one to start tracking history!</p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all hover:-translate-y-1"
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
                className="glass-panel rounded-3xl p-5 sm:p-6 cursor-pointer hover:border-red-400/50 hover:shadow-xl hover:shadow-red-500/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 group hover:-translate-y-0.5"
                onClick={() => router.push(`/dashboard?date=${list.date}`)}
              >
                <div>
                  <h3 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
                    <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {formatDate(list.date)}
                  </h3>
                  <p className="text-stone-600 font-medium text-sm mt-2">{list.shopName}</p>
                  <p className="text-stone-500 font-bold mt-1 text-sm bg-white/40 inline-block px-2 py-0.5 rounded-lg border border-white/50">
                    {validItems.length} items priced
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard?date=${list.date}`); }}
                    className="h-12 px-6 rounded-2xl glass-button text-stone-800 font-bold flex-1 sm:flex-none"
                  >
                    View / Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(list._id!); }}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/40 text-stone-400 hover:text-white hover:bg-red-500 border border-white/50 hover:border-red-500 transition-all shadow-sm opacity-60 sm:opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md">
          <div className="glass-panel bg-white/80 rounded-3xl p-8 max-w-sm w-full shadow-2xl border-white">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </div>
            <h3 className="text-2xl font-extrabold text-stone-900 mb-2 text-center">Delete Price List?</h3>
            <p className="text-stone-600 mb-8 text-center font-medium">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                className="flex-1 h-12 rounded-2xl font-bold text-stone-700 glass-button"
              >
                Cancel
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(deleteConfirmId); }}
                className="flex-1 h-12 rounded-2xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-500 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 transition-all"
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
