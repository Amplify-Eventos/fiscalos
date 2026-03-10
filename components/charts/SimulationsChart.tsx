"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts"

interface SimulationData {
  nome: string
  impostoTotal: number
  economiaVsAtual: number
  regime: string
}

interface Props {
  data: SimulationData[]
  impostoAtual: number
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
}

export function SimulationsChart({ data, impostoAtual }: Props) {
  // Add current scenario as the first item for comparison
  const chartData = [
    {
      nome: 'Cenário Atual',
      imposto: impostoAtual,
      isCurrent: true,
      fill: '#ef4444' // red-500
    },
    ...data.slice(0, 4).map(sim => ({
      nome: sim.nome,
      imposto: sim.impostoTotal,
      isCurrent: false,
      fill: sim.economiaVsAtual > 0 ? '#22c55e' : '#f97316' // green-500 or orange-500
    }))
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md text-sm">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-slate-700">
            Imposto Anual: <span className="font-medium">{formatCurrency(payload[0].value)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="nome" 
            angle={-25}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12, fill: '#64748b' }}
            interval={0}
          />
          <YAxis 
            tickFormatter={(value) => `R$ ${value / 1000}k`}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
          <Bar 
            dataKey="imposto" 
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
