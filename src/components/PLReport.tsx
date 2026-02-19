'use client'

import { useEffect, useState } from 'react'

interface PLData {
  period: string
  dateFrom: string
  dateTo: string
  totalRevenue: number
  totalCost: number
  laborCost: number
  grossProfit: number
  operatingProfit: number
  costRatio: string
  laborRatio: string
  profitRatio: string
}

export default function PLReport() {
  const [plData, setPlData] = useState<PLData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'day' | 'month'>('month')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchPLReport()
  }, [period, date])

  const fetchPLReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pl/report?period=${period}&date=${date}`)
      const data = await response.json()
      setPlData(data)
    } catch (error) {
      console.error('Failed to fetch P&L report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">로딩 중...</div>
  }

  if (!plData) {
    return <div className="p-8">데이터를 불러올 수 없습니다</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">P&L 손익계산서</h1>

      {/* 기간 선택 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-semibold mb-2">기간</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'day' | 'month')}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="day">일별</option>
              <option value="month">월별</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">날짜</label>
            <input
              type={period === 'day' ? 'date' : 'month'}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* P&L 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">
            {plData.dateFrom} ~ {plData.dateTo}
          </h2>
        </div>

        <table className="w-full">
          <tbody>
            <tr className="border-b border-gray-200 bg-blue-50">
              <td className="px-6 py-4 font-semibold text-gray-700">매출액</td>
              <td className="px-6 py-4 text-right font-bold text-blue-600">
                ₩{plData.totalRevenue.toLocaleString()}
              </td>
            </tr>

            <tr className="border-b border-gray-200">
              <td className="px-6 py-4 font-semibold text-gray-700">원가</td>
              <td className="px-6 py-4 text-right">
                ₩{plData.totalCost.toLocaleString()}
              </td>
            </tr>

            <tr className="border-b border-gray-200 bg-gray-50">
              <td className="px-6 py-4 font-semibold text-gray-700">원가율</td>
              <td className="px-6 py-4 text-right text-gray-600">
                {plData.costRatio}%
              </td>
            </tr>

            <tr className="border-b border-gray-200">
              <td className="px-6 py-4 font-semibold text-gray-700">매출총이익</td>
              <td className="px-6 py-4 text-right font-bold text-green-600">
                ₩{plData.grossProfit.toLocaleString()}
              </td>
            </tr>

            <tr className="border-b border-gray-200">
              <td className="px-6 py-4 font-semibold text-gray-700">인건비</td>
              <td className="px-6 py-4 text-right">
                ₩{plData.laborCost.toLocaleString()}
              </td>
            </tr>

            <tr className="border-b border-gray-200 bg-gray-50">
              <td className="px-6 py-4 font-semibold text-gray-700">인건비율</td>
              <td className="px-6 py-4 text-right text-gray-600">
                {plData.laborRatio}%
              </td>
            </tr>

            <tr className="bg-purple-50">
              <td className="px-6 py-4 font-bold text-gray-900">영업이익</td>
              <td className="px-6 py-4 text-right font-bold text-purple-600 text-lg">
                ₩{plData.operatingProfit.toLocaleString()}
              </td>
            </tr>

            <tr className="bg-purple-50">
              <td className="px-6 py-4 font-bold text-gray-900">영업이익율</td>
              <td className="px-6 py-4 text-right font-bold text-purple-600 text-lg">
                {plData.profitRatio}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 주의사항 */}
      <div className="mt-8 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <h3 className="font-bold text-yellow-900 mb-2">주의사항</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• 매출액: POS 시스템에서 수집한 실매출액</li>
          <li>• 원가: 승인된 명세서의 총액</li>
          <li>• 인건비: 별도 입력 필요 (현재 0원)</li>
          <li>• 기타 지출(임차료, 유틸리티 등)은 포함되지 않음</li>
        </ul>
      </div>
    </div>
  )
}
