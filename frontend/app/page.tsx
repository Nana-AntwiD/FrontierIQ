import { supabase } from '@/lib/supabase'

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

export default async function Home() {
  const indicators = await getIndicators()

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-5">
        <h1 className="text-xl font-semibold tracking-tight">Frontier IQ</h1>
        <p className="text-gray-400 text-sm mt-1">Ghana Economic Intelligence</p>
      </header>

      {/* Dashboard */}
      <div className="px-8 py-8">
        <h2 className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-6">
          Key Indicators
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {indicators.map((indicator: any) => {
            const latest = indicator.data_points?.[0]
            const previous = indicator.data_points?.[1]
            const change = latest && previous
              ? (latest.value - previous.value).toFixed(2)
              : null
            const isPositive = change && parseFloat(change) > 0

            return (
              <div
                key={indicator.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5"
              >
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                  {indicator.category}
                </p>
                <p className="text-sm font-medium text-white mb-3">
                  {indicator.name}
                </p>

                {latest ? (
                  <>
                    <p className="text-3xl font-bold text-white">
                      {latest.value}
                      <span className="text-sm font-normal text-gray-400 ml-1">
                        {indicator.unit}
                      </span>
                    </p>
                    {change && (
                      <p className={`text-xs mt-2 ${isPositive ? 'text-red-400' : 'text-green-400'}`}>
                        {isPositive ? '▲' : '▼'} {Math.abs(parseFloat(change))} from previous
                      </p>
                    )}
                    <p className="text-gray-600 text-xs mt-1">
                      {new Date(latest.period_date).toLocaleDateString('en-GB', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600 text-sm">No data yet</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}