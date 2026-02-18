"use client"

import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Bot, Cpu, BrainCircuit } from "lucide-react"

interface ModelColumnProps {
  modelName: string
  modelTag: string
  response: string
  isStreaming: boolean
  accentColor: string
  icon: "bot" | "cpu" | "brain"
}

const icons = {
  bot: Bot,
  cpu: Cpu,
  brain: BrainCircuit,
}

export function ModelColumn({
  modelName,
  modelTag,
  response,
  isStreaming,
  accentColor,
  icon,
}: ModelColumnProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [charIndex, setCharIndex] = useState(0)
  const textRef = useRef<HTMLDivElement>(null)
  const Icon = icons[icon]

  useEffect(() => {
    setDisplayedText("")
    setCharIndex(0)
  }, [response])

  useEffect(() => {
    if (!isStreaming || charIndex >= response.length) return

    const delay = Math.random() * 20 + 10
    const timer = setTimeout(() => {
      setDisplayedText(response.slice(0, charIndex + 1))
      setCharIndex((prev) => prev + 1)
      if (textRef.current) {
        textRef.current.scrollTop = textRef.current.scrollHeight
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [isStreaming, charIndex, response])

  const text = isStreaming ? displayedText : response
  const showCursor = isStreaming && charIndex < response.length

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="size-7 rounded flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}40` }}
        >
          <Icon className="size-3.5" style={{ color: accentColor }} />
        </div>
        <div className="flex flex-col">
          <Badge
            variant="outline"
            className="text-[10px] font-mono tracking-wider border-border w-fit"
            style={{ color: accentColor, borderColor: `${accentColor}40` }}
          >
            {modelTag}
          </Badge>
          <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
            {modelName}
          </span>
        </div>
      </div>
      <div
        ref={textRef}
        className="relative flex-1 min-h-[200px] max-h-[280px] overflow-y-auto rounded border border-border bg-input/50 p-4 font-mono text-xs leading-relaxed text-foreground/90 scrollbar-thin"
      >
        {/* Scanline overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded">
          <div
            className="absolute inset-x-0 h-8 opacity-[0.03] animate-scanline"
            style={{ background: `linear-gradient(transparent, ${accentColor}, transparent)` }}
          />
        </div>

        {text ? (
          <span>
            {text}
            {showCursor && (
              <span
                className="inline-block w-1.5 h-3.5 ml-0.5 align-text-bottom animate-text-stream"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </span>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/50">
            <Icon className="size-8 opacity-30" />
            <span className="text-[10px] uppercase tracking-widest">
              Awaiting prompt...
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
