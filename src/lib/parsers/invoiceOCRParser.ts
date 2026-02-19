import Tesseract from 'tesseract.js'

export interface InvoiceLineItem {
  rawItemName: string
  qty: number
  uom: string
  unitPrice: number
  lineTotal: number
}

export interface InvoiceData {
  vendorName: string
  issueDate: string
  totalAmount: number
  lineItems: InvoiceLineItem[]
}

/**
 * 이미지/PDF에서 OCR로 명세서 데이터 추출
 */
export async function parseInvoiceOCR(file: File): Promise<InvoiceData> {
  // 이미지 파일인 경우 직접 처리
  if (file.type.startsWith('image/')) {
    return parseInvoiceImage(file)
  }

  // PDF인 경우 (간단한 처리)
  throw new Error('PDF 파싱은 아직 지원하지 않습니다. 이미지 파일을 업로드해주세요.')
}

/**
 * 이미지 파일 OCR 처리
 */
async function parseInvoiceImage(file: File): Promise<InvoiceData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const imageData = e.target?.result as string

        // Tesseract OCR 실행
        const result = await Tesseract.recognize(imageData, 'kor+eng', {
          logger: (m) => console.log('OCR Progress:', m),
        })

        const text = result.data.text

        // OCR 결과에서 데이터 추출
        const extractedData = extractInvoiceData(text)

        resolve(extractedData)
      } catch (error) {
        reject(new Error(`OCR 처리 실패: ${error}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * OCR 텍스트에서 명세서 데이터 추출
 * 정규표현식 기반의 간단한 파싱
 */
function extractInvoiceData(text: string): InvoiceData {
  // 거래처명 추출 (첫 번째 줄 또는 "회사명" 키워드 근처)
  const vendorMatch = text.match(/(?:회사명|업체|거래처)[\s:]*([^\n]+)/i)
  const vendorName = vendorMatch ? vendorMatch[1].trim() : '미확인'

  // 발행일 추출
  const dateMatch = text.match(/(\d{4}[-/]\d{2}[-/]\d{2})/i)
  const issueDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]

  // 총액 추출 (숫자 + 원 또는 원화 기호)
  const totalMatch = text.match(/(?:합계|총액|금액)[\s:]*(\d+(?:,\d{3})*)\s*원?/i)
  const totalAmount = totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : 0

  // 라인 아이템 추출 (품목명, 수량, 단가, 금액)
  const lineItems = extractLineItems(text)

  return {
    vendorName,
    issueDate,
    totalAmount,
    lineItems,
  }
}

/**
 * 라인 아이템 추출
 * 각 행에서 품목명, 수량, 단가, 금액을 추출
 */
function extractLineItems(text: string): InvoiceLineItem[] {
  const items: InvoiceLineItem[] = []

  // 숫자 패턴을 포함한 행들을 찾기
  const lines = text.split('\n').filter((line) => line.trim().length > 0)

  for (const line of lines) {
    // 숫자가 포함된 행만 처리
    if (!/\d+/.test(line)) continue

    // 패턴: 품목명 + 수량 + 단가 + 금액
    // 예: "소고기 등심 5kg 50000 250000"
    const match = line.match(
      /(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|g|ea|box|l|ml|개|박스|kg)?[\s]*(\d+(?:,\d{3})*)\s*(\d+(?:,\d{3})*)/i
    )

    if (match) {
      items.push({
        rawItemName: match[1].trim(),
        qty: parseFloat(match[2]),
        uom: match[3] || 'ea',
        unitPrice: parseInt(match[4].replace(/,/g, '')),
        lineTotal: parseInt(match[5].replace(/,/g, '')),
      })
    }
  }

  return items
}

/**
 * 파일 유효성 검사
 */
export function validateInvoiceFile(file: File): string | null {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

  if (!validTypes.includes(file.type)) {
    return '지원하는 파일 형식: JPEG, PNG, WebP, PDF'
  }

  if (file.size > 20 * 1024 * 1024) {
    // 20MB
    return '파일 크기는 20MB 이하여야 합니다'
  }

  return null
}
