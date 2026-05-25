'use client'

import {
  LineChart, Line, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

interface WeeklyDay {
  dayLabel: string
  calories: number
  protein: number
  carbs: number
  fat: number
  water?: number
}

interface Props {
  days: WeeklyDay[]
}

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  fontSize: '12px',
}

export default function WeeklyTrendsCharts({ days }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* 热量 & 营养素折线图 */}
      <div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-3)" />
              <XAxis dataKey="dayLabel" stroke="var(--text-faint)" fontSize={10} />
              <YAxis stroke="var(--text-faint)" fontSize={10} width={30} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="calories" stroke="var(--accent)" strokeWidth={2} dot={{ r: 2, fill: 'var(--accent)' }} name="热量" />
              <Line type="monotone" dataKey="protein"  stroke="var(--accent)" strokeWidth={1.5} dot={false} name="蛋白质" />
              <Line type="monotone" dataKey="carbs"    stroke="var(--accent)" strokeWidth={1.5} dot={false} name="碳水" />
              <Line type="monotone" dataKey="fat"      stroke="var(--accent)" strokeWidth={1.5} dot={false} name="脂肪" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-3 mt-1.5">
          {(['热量', '蛋白质', '碳水', '脂肪'] as const).map((l) => (
            <span key={l} className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--text-low)' }}>
              <span className="w-2 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* 饮水柱状图 */}
      <div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-3)" />
              <XAxis dataKey="dayLabel" stroke="var(--text-faint)" fontSize={10} />
              <YAxis stroke="var(--text-faint)" fontSize={10} width={30} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="water" fill="var(--accent)" radius={[4, 4, 0, 0]} name="饮水 ml" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-1.5">
          <span className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--text-low)' }}>
            <span className="w-2 h-2 rounded-sm" style={{ background: 'var(--accent)' }} />饮水 ml
          </span>
        </div>
      </div>
    </div>
  )
}
