import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month' // 'day' or 'month'
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    let dateFrom: string
    let dateTo: string

    if (period === 'day') {
      dateFrom = date
      dateTo = date
    } else {
      // 월별
      const [year, month] = date.split('-')
      dateFrom = `${year}-${month}-01`
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      dateTo = `${year}-${month}-${lastDay}`
    }

    // POS 매출 집계
    const { data: posSales } = await supabase
      .from('pos_sales_daily_item')
      .select('net_sales')
      .gte('sale_date', dateFrom)
      .lte('sale_date', dateTo)

    const totalRevenue = posSales?.reduce((sum, item) => sum + (item.net_sales || 0), 0) || 0

    // 명세서 기반 원가 집계
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('status', 'approved')
      .gte('issue_date', dateFrom)
      .lte('issue_date', dateTo)

    const totalCost = invoices?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0

    // 인건비 (옵션, 현재는 0)
    const laborCost = 0

    // 계산
    const grossProfit = totalRevenue - totalCost
    const operatingProfit = grossProfit - laborCost
    const costRatio = totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0
    const laborRatio = totalRevenue > 0 ? (laborCost / totalRevenue) * 100 : 0
    const profitRatio = totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0

    return NextResponse.json({
      period,
      dateFrom,
      dateTo,
      totalRevenue,
      totalCost,
      laborCost,
      grossProfit,
      operatingProfit,
      costRatio: costRatio.toFixed(2),
      laborRatio: laborRatio.toFixed(2),
      profitRatio: profitRatio.toFixed(2),
    })
  } catch (error) {
    console.error('P&L report error:', error)
    return NextResponse.json(
      { error: 'P&L 리포트 조회 실패' },
      { status: 500 }
    )
  }
}
