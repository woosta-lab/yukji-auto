import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0]

    // 오늘 판매액
    const { data: todaySales } = await supabase
      .from('pos_sales_daily_item')
      .select('net_sales')
      .eq('sale_date', today)

    const todayTotal = todaySales?.reduce((sum, item) => sum + (item.net_sales || 0), 0) || 0

    // 이번 달 판매액
    const { data: monthSales } = await supabase
      .from('pos_sales_daily_item')
      .select('net_sales')
      .gte('sale_date', monthStart)
      .lte('sale_date', today)

    const monthTotal = monthSales?.reduce((sum, item) => sum + (item.net_sales || 0), 0) || 0

    // 오늘 판매 품목 수
    const { data: todayItems } = await supabase
      .from('pos_sales_daily_item')
      .select('item_code')
      .eq('sale_date', today)

    const todayItemCount = new Set(todayItems?.map((item) => item.item_code) || []).size

    // 최근 업로드
    const { data: recentUploads } = await supabase
      .from('pos_reports')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      todayTotal,
      monthTotal,
      todayItemCount,
      recentUploads,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: '대시보드 데이터 조회 실패' },
      { status: 500 }
    )
  }
}
