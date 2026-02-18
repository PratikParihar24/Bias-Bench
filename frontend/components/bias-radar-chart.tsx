"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface BiasRadarChartProps {
  isActive: boolean
}

const biasData = [
  { metric: "Sentiment", modelA: 72, modelB: 45, modelC: 88 },
  { metric: "Toxicity", modelA: 15, modelB: 62, modelC: 8 },
  { metric: "Subjectivity", modelA: 68, modelB: 34, modelC: 82 },
  { metric: "Polarity", modelA: 55, modelB: 78, modelC: 40 },
  { metric: "Factuality", modelA: 85, modelB: 52, modelC: 91 },
  { metric: "Neutrality", modelA: 42, modelB: 80, modelC: 35 },
]

const CYAN = "#38bdf8"
const MAGENTA = "#e879a8"
const GREEN = "#4ade80"

const chartConfig = {
  modelA: {
    label: "Model A",
    color: CYAN,
  },
  modelB: {
    label: "Model B",
    color: MAGENTA,
  },
  modelC: {
    label: "Model C",
    color: GREEN,
  },
}

export function BiasRadarChart({ isActive }: BiasRadarChartProps) {
  return (
    <div className="w-full h-full min-h-[250px]">
      <ChartContainer config={chartConfig} className="h-[280px] w-full aspect-auto">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={biasData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid
              stroke={isActive ? "oklch(0.25 0.02 260)" : "oklch(0.2 0.01 260)"}
              strokeDasharray="2 4"
            />
            <PolarAngleAxis
              dataKey="metric"
              tick={{
                fill: "oklch(0.6 0.02 200)",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Radar
              name="Model A"
              dataKey="modelA"
              stroke={CYAN}
              fill={CYAN}
              fillOpacity={isActive ? 0.15 : 0.05}
              strokeWidth={1.5}
            />
            <Radar
              name="Model B"
              dataKey="modelB"
              stroke={MAGENTA}
              fill={MAGENTA}
              fillOpacity={isActive ? 0.15 : 0.05}
              strokeWidth={1.5}
            />
            <Radar
              name="Model C"
              dataKey="modelC"
              stroke={GREEN}
              fill={GREEN}
              fillOpacity={isActive ? 0.15 : 0.05}
              strokeWidth={1.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
