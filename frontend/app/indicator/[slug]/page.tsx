import { supabase } from '@/lib/supabase'
import Link from 'next/link'

async function getIndicator(slug: string) {
  const { data, error } = await supabase
    .from('indicators')
    .select(`
      *,
      data_points (
        value,
        period_date
      )
    `)
    .eq('slug', slug)
    .order('period_date', { referencedTable: 'data_points', ascending: true })
    .single()

  if (error) return null
  return data
}

export default async function IndicatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const indicator = await getIndicator(slug)

  if (!indicator) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-white/40">Indicator not found.</p>
      </main>
    )
  }

  const dataPoints = indicator.data_points ?? []
  const latest = dataPoints[dataPoints.length - 1]
  const previous = dataPoints[dataPoints.length - 2]
  const change = latest && previous
    ? parseFloat((latest.value - previous.value).toFixed(2))
    : null
  const isUp = change !== null && change > 0

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div>
          <span className="text-white font-semibold tracking-tight text-lg">Frontier IQ</span>
          <span className="text-white/30 text-sm ml-3">Ghana Economic Intelligence</span>
        </div>
        <Link href="/" className="text-white/30 text-xs hover:text-white/60 transition-colors">
          ← Back to Dashboard
        </Link>
      </header>

      <div className="px-8 py-10 max-w-4xl mx-auto">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-6">
          {indicator.category}
        </p>

        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-white">{indicator.name}</h1>
            <p className="text-white/40 text-sm mt-2">
              Source: {indicator.source} · Updated {indicator.frequency}
            </p>
          </div>

          {latest && (
            <div className="text-right">
              <p className="text-4xl font-bold text-white">
                {latest.value}
                <span className="text-lg font-normal text-white/30 ml-1">{indicator.unit}</span>
              </p>
              {change !== null && (
                <p className={`text-sm mt-1 ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isUp ? '▲' : '▼'} {Math.abs(change)} from previous
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-white/40 text-xs uppercase tracking-widest mb-4">Historical Data</h2>
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-left px-5 py-3 text-white/40 font-medium">Period</th>
                  <th className="text-right px-5 py-3 text-white/40 font-medium">Value</th>
                  <th className="text-right px-5 py-3 text-white/40 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {[...dataPoints].reverse().map((point: any, index: number, arr: any[]) => {
                  const prev = arr[index + 1]
                  const diff = prev
                    ? parseFloat((point.value - prev.value).toFixed(2))
                    : null
                  const up = diff !== null && diff > 0

                  return (
                    <tr key={point.period_date} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-white/70">
                        {new Date(point.period_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-3 text-right text-white font-medium">
                        {point.value} {indicator.unit}
                      </td>
                      <td className={`px-5 py-3 text-right text-xs font-medium ${diff === null ? 'text-white/20' : up ? 'text-red-400' : 'text-emerald-400'}`}>
                        {diff === null ? '—' : `${up ? '▲' : '▼'} ${Math.abs(diff)}`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}