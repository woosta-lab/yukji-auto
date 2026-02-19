import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Audit log error:', error)
      return NextResponse.json(
        { error: '감사 로그 조회 실패' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      logs: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error('Audit log error:', error)
    return NextResponse.json(
      { error: '감사 로그 조회 실패' },
      { status: 500 }
    )
  }
}
