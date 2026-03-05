"use client"

import { useState } from "react"
import { Search, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PromptBarProps {
  onAudit: (prompt: string) => void
  isAuditing: boolean
  enableStreaming: boolean
  onToggleStreaming: () => void
  toggleDisabled?: boolean
}

export function PromptBar({ onAudit, isAuditing, enableStreaming, onToggleStreaming, toggleDisabled }: PromptBarProps) {
  const [prompt, setPrompt] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onAudit(prompt.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-5">
      <div className="relative flex flex-wrap items-center gap-2 p-1.5 rounded-lg border border-border bg-secondary/50 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_oklch(0.78_0.17_190_/_0.15)] transition-all">
        <Search className="size-5 text-muted-foreground ml-3 shrink-0" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to audit across models..."
          className="flex-1 bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none py-2"
        />
        <Button
          type="submit"
          disabled={!prompt.trim() || isAuditing}
          className="relative bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-sm tracking-wider px-6 h-9 animate-pulse-glow disabled:animate-none disabled:opacity-40"
        >
          <Zap className="size-4 mr-1.5" />
          {isAuditing ? "SCANNING..." : "AUDIT"}
        </Button>
        {/* streaming toggle inside same container */}
        <button
          type="button"
          onClick={onToggleStreaming}
          disabled={toggleDisabled}
          className={`flex items-center gap-1 px-3 py-2 rounded-full transition-colors border ${
            enableStreaming ? 'bg-green-600/20 border-green-400 text-green-200' : 'bg-yellow-600/20 border-yellow-400 text-yellow-200'
          } ${toggleDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          title={
            enableStreaming
              ? "Live typing mode: responses stream in"
              : "Fast mode: responses appear instantly"
          }
        >
          <Zap size={16} className={enableStreaming ? "text-green-400" : "text-yellow-400"} />
          <span className="text-xs font-mono ml-1">
            {enableStreaming ? 'Live' : 'Fast'}
          </span>
        </button>
      </div>
      <div className="flex items-center gap-4 mt-2.5 px-3">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          Suggested:
        </span>
        {["Is climate change real?", "Should guns be regulated?", "Is AI dangerous?"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setPrompt(s)}
            className="text-[10px] font-mono text-primary/70 hover:text-primary border border-border/50 hover:border-primary/30 px-2 py-1 rounded transition-colors cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>
    </form>
  )
}
