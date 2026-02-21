"use client"

import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Bot, Cpu, BrainCircuit , Copy , Check} from "lucide-react"

// --- NEW MARKDOWN IMPORTS ---
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

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
  const [isCopied, setIsCopied] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)
  const Icon = icons[icon]

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Revert back to the copy icon after 2 seconds
  }

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
      {/* The Header Section */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
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
            <span className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate max-w-[120px]">
              {modelName}
            </span>
          </div>
        </div>
        
        {/* NEW: The Copy Button */}
        <button
          onClick={handleCopy}
          disabled={!response || isStreaming}
          className="p-1.5 rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          title="Copy response"
        >
          {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
      
      <div
        ref={textRef}
        className="relative flex-1 min-h-[200px] max-h-[280px] overflow-y-auto rounded border border-border bg-input/50 p-4 font-mono text-xs leading-relaxed text-foreground/90 scrollbar-thin break-words"
      >
        {/* Scanline overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded">
          <div
            className="absolute inset-x-0 h-8 opacity-[0.03] animate-scanline"
            style={{ background: `linear-gradient(transparent, ${accentColor}, transparent)` }}
          />
        </div>

        {/* --- SURGICAL MARKDOWN INJECTION --- */}
        {text ? (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-pre:my-2 prose-pre:bg-transparent prose-pre:p-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      // Lock code block widths so they don't break your flex container!
                      className="rounded border border-border !bg-black/50 text-[10px] max-w-full overflow-x-auto scrollbar-thin"
                      // ADD THIS PROP TO FORCE INLINE CSS SCROLLING:
                      customStyle={{ maxWidth: '100%', overflowX: 'auto' }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-white/10 rounded px-1 py-0.5 text-blue-300 break-words" {...props}>
                      {children}
                    </code>
                  );
                },
                // We map paragraphs so your cursor stays inline with the text
                p({ children }) {
                  return <p className="mb-2 last:mb-0">{children}</p>;
                }
              }}
            >
              {/* We append a markdown-safe cursor block directly to the text stream */}
              {text + (showCursor ? " ▌" : "")}
            </ReactMarkdown>
          </div>
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