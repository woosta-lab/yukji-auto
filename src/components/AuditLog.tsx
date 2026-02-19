'use client'

import { useEffect, useState } from 'react'

interface AuditLogEntry {
  id: string
  actor_user_id: string
  action: string
  entity: string
  entity_id: string
  details: any
  created_at: string
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/audit-log?limit=50')
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'upload':
        return 'bg-blue-100 text-blue-800'
      case 'edit':
        return 'bg-yellow-100 text-yellow-800'
      case 'approve':
        return 'bg-green-100 text-green-800'
      case 'close':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEntityLabel = (entity: string) => {
    const labels: Record<string, string> = {
      pos_report: 'POS 리포트',
      invoice: '명세서',
      pos_sales_daily_item: 'POS 판매',
    }
    return labels[entity] || entity
  }

  if (loading) {
    return <div className="p-8">로딩 중...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">감사 로그</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">시간</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">사용자</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">작업</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">대상</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">상세</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  로그가 없습니다
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(log.created_at).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                    {log.actor_user_id || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {getEntityLabel(log.entity)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.details ? (
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800">
                          상세보기
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 설명 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">감사 로그 정보</h3>
        <p className="text-sm text-blue-800">
          모든 업로드, 수정, 승인, 마감 작업이 기록됩니다. 이를 통해 언제 누가 어떤 작업을 했는지
          추적할 수 있습니다.
        </p>
      </div>
    </div>
  )
}
