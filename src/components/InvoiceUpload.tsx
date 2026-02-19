'use client'

import { useState, useRef } from 'react'

interface InvoiceUploadResult {
  success: boolean
  message: string
  invoiceId?: string
  ocrData?: {
    vendorName: string
    issueDate: string
    totalAmount: number
    lineItemCount: number
  }
}

export default function InvoiceUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<InvoiceUploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files.length > 0) {
      setFile(files[0])
      setError(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('파일을 선택해주세요')
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/invoice/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '업로드 실패')
      } else {
        setResult(data)
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (err) {
      setError('업로드 중 오류가 발생했습니다')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">명세서 업로드</h1>

      <div className="bg-white rounded-lg shadow p-8">
        {/* 드래그 & 드롭 영역 */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />

          <label htmlFor="file-input" className="cursor-pointer">
            <div className="text-gray-600 mb-2">
              <p className="text-lg font-semibold">명세서 파일을 여기로 드래그하세요</p>
              <p className="text-sm">또는 클릭하여 파일 선택</p>
            </div>
            <p className="text-xs text-gray-500">
              지원 형식: JPEG, PNG, WebP, PDF (최대 20MB)
            </p>
          </label>
        </div>

        {/* 선택된 파일 표시 */}
        {file && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-semibold text-green-900">선택된 파일</p>
            <p className="text-green-700">{file.name}</p>
            <p className="text-xs text-green-600">
              크기: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-semibold text-red-900">오류</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 성공 메시지 */}
        {result && result.success && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-semibold text-green-900">성공</p>
            <p className="text-green-700">{result.message}</p>
            {result.ocrData && (
              <div className="mt-3 text-sm text-green-600 space-y-1">
                <p>거래처: {result.ocrData.vendorName}</p>
                <p>발행일: {result.ocrData.issueDate}</p>
                <p>총액: ₩{result.ocrData.totalAmount.toLocaleString()}</p>
                <p>라인 아이템: {result.ocrData.lineItemCount}개</p>
              </div>
            )}
          </div>
        )}

        {/* 업로드 버튼 */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-semibold"
          >
            {uploading ? '업로드 중...' : '업로드 및 OCR 인식'}
          </button>

          <button
            onClick={() => {
              setFile(null)
              if (fileInputRef.current) {
                fileInputRef.current.value = ''
              }
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            취소
          </button>
        </div>
      </div>

      {/* 안내 */}
      <div className="mt-8 bg-green-50 rounded-lg p-6 border border-green-200">
        <h2 className="font-bold text-green-900 mb-3">업로드 가이드</h2>
        <ul className="text-sm text-green-800 space-y-2">
          <li>• 거래처 명세서 (사진 또는 PDF)를 업로드하세요</li>
          <li>• OCR이 자동으로 거래처명, 발행일, 총액, 라인 아이템을 인식합니다</li>
          <li>• 인식 결과를 검수 화면에서 수정할 수 있습니다</li>
          <li>• 표준 품목으로 매핑한 후 승인하면 재고에 반영됩니다</li>
        </ul>
      </div>
    </div>
  )
}
