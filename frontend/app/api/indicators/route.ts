import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabase
    .from('indicators')
    .select(`
      *,
      data_points (
        value,
        period_date
      )
    `)
    .order('period_date', { referencedTable: 'data_points', ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}