"use client"

import { Scale, Tag, BarChart3, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BiasRadarChart } from "@/components/bias-radar-chart"

interface VerdictPanelProps {
  isActive: boolean
}

export function VerdictPanel({ isActive }: VerdictPanelProps) {
  return (
    <div className="mx-6 mb-6">
      <div className="relative rounded-lg border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-secondary/30">
          <Scale className="size-4 text-primary" />
          <h2 className="text-sm font-mono font-bold tracking-wider text-foreground uppercase">
            {"Judge's Verdict"}
          </h2>
          {isActive && (
            <Badge
              variant="outline"
              className="ml-auto text-[10px] font-mono tracking-wider text-primary border-primary/30"
            >
              ANALYSIS COMPLETE
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Radar Chart */}
          <div className="flex-1 p-5 border-b lg:border-b-0 lg:border-r border-border">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="size-3.5 text-muted-foreground" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Bias Signature Map
              </span>
            </div>
            <BiasRadarChart isActive={isActive} />
            {/* Legend */}
            <div className="flex items-center justify-center gap-5 mt-2">
              {[
                { label: "Model A", color: "#38bdf8" },
                { label: "Model B", color: "#e879a8" },
                { label: "Model C", color: "#4ade80" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="flex-1 p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-3.5 text-muted-foreground" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Verdict Summary
              </span>
            </div>

            {isActive ? (
              <>
                {/* Subjectivity Score */}
                <div className="rounded border border-border bg-secondary/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Subjectivity Score
                    </span>
                    <span className="text-2xl font-mono font-bold text-primary">
                      73.4
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-input overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: "73.4%",
                        background: "linear-gradient(90deg, #38bdf8, #e879a8)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[9px] font-mono text-muted-foreground">Objective</span>
                    <span className="text-[9px] font-mono text-muted-foreground">Subjective</span>
                  </div>
                </div>

                {/* Bias Tag */}
                <div className="rounded border border-border bg-secondary/30 p-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block mb-3">
                    Detected Bias Tag
                  </span>
                  <div className="flex items-center gap-3">
                    <Tag className="size-4 text-accent" />
                    <span className="text-lg font-mono font-bold text-accent">
                      Left-Leaning
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground mt-2 leading-relaxed">
                    Models A and C exhibit higher subjectivity with sentiment-loaded language.
                    Model B demonstrates more neutral framing with balanced perspective representation.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Agree Rate", value: "67%", color: "#38bdf8" },
                    { label: "Divergence", value: "HIGH", color: "#e879a8" },
                    { label: "Confidence", value: "89%", color: "#4ade80" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded border border-border bg-input/50 p-3 text-center"
                    >
                      <span
                        className="text-sm font-mono font-bold block"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground/40">
                <Scale className="size-12 opacity-30" />
                <span className="text-[10px] font-mono uppercase tracking-widest">
                  Submit a prompt to generate verdict
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
