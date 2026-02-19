'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            육지 자동화
          </Link>

          <div className="flex gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                isActive('/') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              대시보드
            </Link>

            <Link
              href="/pos-upload"
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                isActive('/pos-upload') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              POS 업로드
            </Link>

            <Link
              href="/invoice-upload"
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                isActive('/invoice-upload') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              명세서 업로드
            </Link>

            <Link
              href="/pl"
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                isActive('/pl') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              P&L
            </Link>

            <Link
              href="/audit-log"
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                isActive('/audit-log') 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              감사 로그
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
