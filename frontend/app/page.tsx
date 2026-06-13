import { supabase } from '@/lib/supabase'
import Sparkline from './components/Sparkline'

async function getIndicators() {
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

  if (error) return []
  return data
}

const CATEGORY_ORDER = ['Monetary', 'Prices', 'Currency', 'Fixed Income', 'Fiscal', 'Growth']

export default async function Home() {
  const indicators = await getIndicators()

  const grouped = CATEGORY_ORDER.reduce((acc: any, category) => {
    acc[category] = indicators.filter((i: any) => i.category === category)
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div>
          <span className="text-white font-semibold tracking-tight text-lg">Frontier IQ</span>
          <span className="text-white/30 text-sm ml-3">Ghana Economic Intelligence</span>
        </div>
        <div className="text-white/30 text-xs">
          Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </header>

      {/* Body */}
      <div className="px-8 py-10 max-w-7xl mx-auto">

        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-white">Economic Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">
            Key macroeconomic indicators for Ghana, updated automatically.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-10">
          {CATEGORY_ORDER.map((category) => {
            const items = grouped[category]
            if (!items || items.length === 0) return null

            return (
              <section key={category}>
                {/* Category label */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
                    {category}
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Indicator cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                  {items.map((indicator: any) => {
                    const latest = indicator.data_points?.[0]
                    const previous = indicator.data_points?.[1]
                    const change = latest && previous
                      ? parseFloat((latest.value - previous.value).toFixed(2))
                      : null
                    const isUp = change !== null && change > 0

                    return (
                      <a
                        href={`/indicator/${indicator.slug}`}
                         key={indicator.id}
                          className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-5 hover:border-white/20 transition-colors block"
                             >
                        {/* Name */}
                        <p className="text-white/50 text-xs mb-3">{indicator.name}</p>

                        {latest ? (
                          <>
                            {/* Value */}
                            <p className="text-2xl font-semibold text-white leading-none">
                              {latest.value}
                              <span className="text-sm font-normal text-white/30 ml-1">
                                {indicator.unit}
                              </span>
                            </p>

                            {/* Change */}
                            {change !== null && (
                              <p className={`text-xs mt-2 font-medium ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                                {isUp ? '▲' : '▼'} {Math.abs(change)} from previous
                              </p>
                            )}

                            {/* Sparkline */}
                            {indicator.data_points.length > 1 && (
                              <div className="mt-4">
                                <Sparkline
                                  data={indicator.data_points}
                                  positive={isUp}
                                />
                              </div>
                            )}

                            {/* Date */}
                            <p className="text-white/20 text-xs mt-3">
                              {new Date(latest.period_date).toLocaleDateString('en-GB', {
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </>
                        ) : (
                          <p className="text-white/20 text-sm mt-2">No data yet</p>
                        )}
                      </a>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}