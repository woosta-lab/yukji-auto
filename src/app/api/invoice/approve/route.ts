import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceId, updates } = body

    if (!invoiceId) {
      return NextResponse.json(
        { error: '명세서 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 라인 아이템 업데이트 (std_item_id 매핑)
    if (updates && Array.isArray(updates)) {
      for (const update of updates) {
        const { itemId, stdItemId } = update

        const { error } = await supabase
          .from('invoice_items')
          .update({ std_item_id: stdItemId })
          .eq('id', itemId)

        if (error) {
          console.error('Item update error:', error)
          return NextResponse.json(
            { error: '라인 아이템 업데이트 실패' },
            { status: 500 }
          )
        }
      }
    }

    // 명세서 상태 변경 (draft -> approved)
    const { error: approveError } = await supabase
      .from('invoices')
      .update({
        status: 'approved',
        approved_by: 'owner', // 실제로는 인증된 사용자 ID
        approved_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)

    if (approveError) {
      console.error('Approve error:', approveError)
      return NextResponse.json(
        { error: '명세서 승인 실패' },
        { status: 500 }
      )
    }

    // 승인된 명세서의 라인 아이템에서 재고 원장 생성
    const { data: items } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)

    if (items) {
      const ledgerEntries = items.map((item) => ({
        std_item_id: item.std_item_id,
        date: new Date().toISOString().split('T')[0],
        qty_delta: item.qty,
        reason: 'inbound',
        ref_type: 'invoice',
        ref_id: invoiceId,
        created_by: 'owner',
        created_at: new Date().toISOString(),
      }))

      const { error: ledgerError } = await supabase
        .from('inventory_ledger')
        .insert(ledgerEntries)

      if (ledgerError) {
        console.error('Ledger insert error:', ledgerError)
        // 경고만 하고 계속 진행
      }
    }

    // 감사 로그 기록
    await supabase.from('audit_log').insert({
      actor_user_id: 'owner',
      action: 'approve',
      entity: 'invoice',
      entity_id: invoiceId,
      details: {
        item_count: items?.length || 0,
      },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: '명세서가 승인되었습니다',
    })
  } catch (error) {
    console.error('Approve error:', error)
    return NextResponse.json(
      { error: '승인 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
