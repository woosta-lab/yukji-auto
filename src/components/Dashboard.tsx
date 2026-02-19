'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardStats {
  todayTotal: number
  monthTotal: number
  todayItemCount: number
  recentUploads: any[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">로딩 중...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">대시보드</h1>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-semibold mb-2">오늘 판매액</h2>
          <p className="text-3xl font-bold text-blue-600">
            ₩{(stats?.todayTotal || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-semibold mb-2">이번 달 판매액</h2>
          <p className="text-3xl font-bold text-green-600">
            ₩{(stats?.monthTotal || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-semibold mb-2">오늘 판매 품목</h2>
          <p className="text-3xl font-bold text-purple-600">{stats?.todayItemCount || 0}</p>
        </div>
      </div>

      {/* 빠른 접근 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">빠른 접근</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/pos-upload"
            className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
          >
            <h3 className="font-semibold text-blue-600">POS 업로드</h3>
            <p className="text-sm text-gray-600">엑셀 파일 업로드</p>
          </Link>

          <Link
            href="/invoice-upload"
            className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition"
          >
            <h3 className="font-semibold text-green-600">명세서 업로드</h3>
            <p className="text-sm text-gray-600">OCR 인식</p>
          </Link>

          <Link
            href="/pl"
            className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition"
          >
            <h3 className="font-semibold text-purple-600">P&L</h3>
            <p className="text-sm text-gray-600">손익계산서</p>
          </Link>

          <Link
            href="/settings"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold text-gray-600">설정</h3>
            <p className="text-sm text-gray-600">품목 관리</p>
          </Link>
        </div>
      </div>

      {/* 최근 업로드 */}
      {stats?.recentUploads && stats.recentUploads.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">최근 업로드</h2>
          <div className="space-y-2">
            {stats.recentUploads.map((upload) => (
              <div key={upload.id} className="flex justify-between items-center p-3 border-b">
                <div>
                  <p className="font-semibold">{upload.type}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(upload.uploaded_at).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
