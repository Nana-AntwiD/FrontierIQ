'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface SparklineProps {
  data: { value: number; period_date: string }[]
  positive: boolean
}

export default function Sparkline({ data, positive }: SparklineProps) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.period_date).getTime() - new Date(b.period_date).getTime()
  )

  return (
    <ResponsiveContainer width="100%" height={50}>
      <LineChart data={sorted}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={positive ? '#f87171' : '#34d399'}
          strokeWidth={1.5}
          dot={false}
        />
        <Tooltip
          contentStyle={{
            background: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#fff'
          }}
          formatter={(value: number) => [value, '']}
          labelFormatter={() => ''}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}