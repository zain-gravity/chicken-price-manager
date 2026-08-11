'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PriceListData, UserSettings } from '@/types'
import { generatePDF } from '@/lib/export/pdf-generator'
import { generateImage } from '@/lib/export/image-generator'
import { shareFile, downloadFile, generateFileName } from '@/lib/share'

export default function PreviewPage() {
  const [priceList, setPriceList] = useState<PriceListData | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [historyRes, settingsRes] = await Promise.all([
          fetch('/api/price-lists'),
          fetch('/api/settings')
        ])
        const historyData = await historyRes.json()
        const settingsData = await settingsRes.json()

        if (historyData.success && historyData.data.length > 0) {
          const todayIso = new Date().toISOString().split('T')[0]
          
          // API returns sorted by date desc, filter for today's date
          const todaysList = historyData.data.find((l: PriceListData) => l.date === todayIso)
          
          if (todaysList) {
            setPriceList(todaysList)
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
  }, [])

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
        <div className="h-96 bg-stone-100 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-stone-100 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-stone-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!priceList) {
    return (
      <div className="p-4 sm:p-6 max-w-lg mx-auto mt-12 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <h2 className="text-xl font-bold text-stone-900 mb-2">No prices set for today</h2>
          <p className="text-stone-500 mb-6">Create today's price list to see the preview and export it.</p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors w-full"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const validItems = priceList.items.filter(item => item.price > 0)

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-6 pb-24">
      {/* Preview Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-200">
        <div className="bg-red-600 text-white p-6 text-center rounded-t-2xl">
          <h1 className="text-2xl font-bold mb-1">{priceList.shopName}</h1>
          <p className="text-sm opacity-90">{formatDate(priceList.date)}</p>
        </div>
        
        <div className="p-4 space-y-2">
          {validItems.map((item, idx) => (
            <div 
              key={idx}
              className={`flex items-center justify-between p-3 rounded-xl ${idx % 2 === 0 ? 'bg-stone-50' : 'bg-white'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </div>
                <span className="font-semibold text-stone-900">{item.itemName}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-red-600">{settings?.currency || '₹'}{item.price}</span>
                <span className="text-stone-500 text-sm ml-1">/{item.unit}</span>
              </div>
            </div>
          ))}
          {validItems.length === 0 && (
            <div className="text-center py-6 text-stone-500">
              No items with prices set.
            </div>
          )}
        </div>

        {settings?.showFooter && settings.footerText && (
          <div className="border-t border-stone-100 p-4 text-center bg-stone-50">
            <p className="italic text-stone-500 text-sm">{settings.footerText}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Link 
          href="/dashboard"
          className="flex items-center justify-center h-12 rounded-xl border-2 border-stone-200 font-medium text-stone-700 hover:bg-stone-50 transition-colors w-full"
        >
          Edit Prices
        </Link>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleExportPDF(false)}
            disabled={!!isExporting}
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-70"
          >
            {isExporting === 'pdf' ? 'Generating...' : 'Export as PDF'}
          </button>
          <button
            onClick={() => handleExportImage(false)}
            disabled={!!isExporting}
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-70"
          >
            {isExporting === 'image' ? 'Generating...' : 'Export as Image'}
          </button>
          
          <button
            onClick={() => handleExportPDF(true)}
            disabled={!!isExporting}
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-stone-800 text-white font-medium hover:bg-stone-900 transition-colors disabled:opacity-70"
          >
            <ShareIcon />
            {isExporting === 'share-pdf' ? 'Sharing...' : 'Share PDF'}
          </button>
          <button
            onClick={() => handleExportImage(true)}
            disabled={!!isExporting}
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-stone-800 text-white font-medium hover:bg-stone-900 transition-colors disabled:opacity-70"
          >
            <ShareIcon />
            {isExporting === 'share-image' ? 'Sharing...' : 'Share Image'}
          </button>
        </div>
      </div>
    </div>
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
