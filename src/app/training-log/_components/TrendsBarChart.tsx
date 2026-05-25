'use client'

import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

interface TrendPoint {
  date: string
  volume: number
}

interface Props {
  data: TrendPoint[]
}

export default function TrendsBarChart({ data }: Props) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--text-faint)" fontSize={10} />
          <YAxis stroke="var(--text-faint)" fontSize={10} unit="t" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="volume" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
