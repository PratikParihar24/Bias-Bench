"use client"

import { Shield, Activity } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border pl-20">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="size-7 text-primary" />
          <div className="absolute inset-0 blur-md bg-primary/30 rounded-full" />
        </div>
        <div>
          <h1 className="text-xl font-mono font-bold tracking-wider text-foreground ">
            BIASBENCH
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
            AI Bias Forensics Lab
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-secondary">
          <Activity className="size-3 text-primary animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">
            SYS:ONLINE
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-secondary">
          <div className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">
            v2.4.1
          </span>
        </div>
      </div>
    </header>
  )
}
