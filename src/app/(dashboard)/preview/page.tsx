'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PriceListData, UserSettings } from '@/types'
import { generatePDF } from '@/lib/export/pdf-generator'
import { generateImage } from '@/lib/export/image-generator'
import { shareFile, downloadFile, generateFileName } from '@/lib/share'

function PreviewContent() {
  const searchParams = useSearchParams()
  const urlDate = searchParams.get('date')
  const defaultDate = new Date().toISOString().split('T')[0]
  const viewDate = urlDate || defaultDate

  const [priceList, setPriceList] = useState<PriceListData | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [historyRes, settingsRes] = await Promise.all([
          fetch('/api/price-lists?limit=10'),
          fetch('/api/settings')
        ])
        const historyData = await historyRes.json()
        const settingsData = await settingsRes.json()

        if (historyData.success && historyData.data.length > 0) {
          const targetList = historyData.data.find((l: PriceListData) => l.date === viewDate)
          if (targetList) {
            setPriceList(targetList)
          }
        }
        if (settingsData.success && settingsData.data) {
          setSettings(settingsData.data.settings || settingsData.data)
        }
      } catch (error) {
        console.error('Failed to load preview:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [viewDate])

  const handleExportPDF = async (share = false) => {
    if (!priceList || !settings) return
    setIsExporting(share ? 'share-pdf' : 'pdf')
    try {
      const blob = await generatePDF(priceList, settings)
      const filename = generateFileName(priceList.shopName, priceList.date, 'pdf')
      
      if (share) {
        await shareFile(blob, filename, priceList.shopName)
      } else {
        downloadFile(blob, filename)
      }
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('Failed to generate PDF')
    } finally {
      setIsExporting(null)
    }
  }

  const handleExportImage = async (share = false) => {
    if (!priceList || !settings) return
    setIsExporting(share ? 'share-image' : 'image')
    try {
      const blob = await generateImage(priceList, settings)
      const filename = generateFileName(priceList.shopName, priceList.date, 'png')
      
      if (share) {
        await shareFile(blob, filename, priceList.shopName)
      } else {
        downloadFile(blob, filename)
      }
    } catch (error) {
      console.error('Image export failed:', error)
      alert('Failed to generate image')
    } finally {
      setIsExporting(null)
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
      <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
        <div className="h-96 bg-white/40 backdrop-blur rounded-3xl animate-pulse-subtle"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-14 bg-white/40 backdrop-blur rounded-2xl animate-pulse-subtle"></div>
          <div className="h-14 bg-white/40 backdrop-blur rounded-2xl animate-pulse-subtle"></div>
        </div>
      </div>
    )
  }

  if (!priceList) {
    return (
      <div className="p-4 sm:p-6 max-w-lg mx-auto mt-12 text-center">
        <div className="glass-panel rounded-3xl p-8 shadow-xl">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-2xl font-extrabold text-stone-900 mb-2">No prices found</h2>
          <p className="text-stone-600 font-medium mb-8">Create a price list for {formatDate(viewDate)} to see the preview.</p>
          <Link 
            href={`/dashboard?date=${viewDate}`}
            className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all hover:-translate-y-1 w-full"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const validItems = priceList.items.filter(item => item.price > 0)

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-8 pb-24">
      {/* Preview Card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none"></div>
        <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white p-8 text-center relative z-10">
          <h1 className="text-3xl font-extrabold mb-1 drop-shadow-sm">{priceList.shopName}</h1>
          <p className="text-sm font-medium opacity-90">{formatDate(priceList.date)}</p>
        </div>
        
        <div className="p-6 space-y-3 relative z-10">
          {validItems.map((item, idx) => (
            <div 
              key={idx}
              className={`flex items-center justify-between p-4 rounded-2xl ${idx % 2 === 0 ? 'bg-stone-50/80' : 'bg-transparent'} transition-colors`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                  {idx + 1}
                </div>
                <span className="font-bold text-stone-900 text-lg">{item.itemName}</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-red-600 text-xl">{settings?.currency || '₹'}{item.price}</span>
                <span className="text-stone-500 font-medium text-sm ml-1">/{item.unit || settings?.defaultUnit}</span>
              </div>
            </div>
          ))}
          {validItems.length === 0 && (
            <div className="text-center py-10 font-medium text-stone-500 bg-stone-50 rounded-2xl">
              No items with prices set.
            </div>
          )}
        </div>

        {settings?.showFooter && settings.footerText && (
          <div className="border-t border-stone-100/50 p-6 text-center bg-stone-50/50 relative z-10">
            <p className="italic text-stone-500 font-medium text-sm">{settings.footerText}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Link 
          href={`/dashboard?date=${viewDate}`}
          className="flex items-center justify-center h-14 rounded-2xl glass-button font-bold text-stone-800 transition-all w-full gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Edit Prices
        </Link>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleExportPDF(false)}
            disabled={!!isExporting}
            className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 shadow-red-500/30"
          >
            {isExporting === 'pdf' ? 'Generating...' : 'Export PDF'}
          </button>
          <button
            onClick={() => handleExportImage(false)}
            disabled={!!isExporting}
            className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 shadow-emerald-500/30"
          >
            {isExporting === 'image' ? 'Generating...' : 'Export Image'}
          </button>
          
          <button
            onClick={() => handleExportPDF(true)}
            disabled={!!isExporting}
            className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-stone-900 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 shadow-stone-900/30"
          >
            <ShareIcon />
            {isExporting === 'share-pdf' ? 'Sharing...' : 'Share PDF'}
          </button>
          <button
            onClick={() => handleExportImage(true)}
            disabled={!!isExporting}
            className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-stone-900 text-white font-bold hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 shadow-stone-900/30"
          >
            <ShareIcon />
            {isExporting === 'share-image' ? 'Sharing...' : 'Share Image'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-stone-500">Loading...</div>}>
      <PreviewContent />
    </Suspense>
  )
}

function ShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  )
}
