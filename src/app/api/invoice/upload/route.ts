import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseInvoiceOCR, validateInvoiceFile } from '@/lib/parsers/invoiceOCRParser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const vendorId = formData.get('vendorId') as string

    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다' },
        { status: 400 }
      )
    }

    // 파일 유효성 검사
    const validationError = validateInvoiceFile(file)
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    // OCR 파싱
    const ocrData = await parseInvoiceOCR(file)

    // Supabase에 파일 저장
    const fileName = `invoices/${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: '파일 저장 실패' },
        { status: 500 }
      )
    }

    // invoices 테이블에 기록
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        vendor_id: vendorId || null,
        issue_date: ocrData.issueDate,
        total_amount: ocrData.totalAmount,
        status: 'draft',
        file_path: uploadData.path,
        created_by: 'owner', // 실제로는 인증된 사용자 ID
        created_at: new Date().toISOString(),
      })
      .select()

    if (invoiceError) {
      console.error('Invoice insert error:', invoiceError)
      return NextResponse.json(
        { error: '명세서 저장 실패' },
        { status: 500 }
      )
    }

    const invoiceId = invoiceData?.[0]?.id

    // invoice_items 테이블에 라인 아이템 저장
    const insertData = ocrData.lineItems.map((item) => ({
      invoice_id: invoiceId,
      raw_item_name: item.rawItemName,
      qty: item.qty,
      uom: item.uom,
      unit_price: item.unitPrice,
      line_total: item.lineTotal,
      std_item_id: null, // 검수 과정에서 매핑
      created_at: new Date().toISOString(),
    }))

    if (insertData.length > 0) {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(insertData)

      if (itemsError) {
        console.error('Items insert error:', itemsError)
        return NextResponse.json(
          { error: '라인 아이템 저장 실패' },
          { status: 500 }
        )
      }
    }

    // 감사 로그 기록
    await supabase.from('audit_log').insert({
      actor_user_id: 'owner',
      action: 'upload',
      entity: 'invoice',
      entity_id: invoiceId,
      details: {
        file_name: file.name,
        vendor_name: ocrData.vendorName,
        item_count: ocrData.lineItems.length,
      },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: '명세서가 업로드되었습니다',
      invoiceId,
      ocrData: {
        vendorName: ocrData.vendorName,
        issueDate: ocrData.issueDate,
        totalAmount: ocrData.totalAmount,
        lineItemCount: ocrData.lineItems.length,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '업로드 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
