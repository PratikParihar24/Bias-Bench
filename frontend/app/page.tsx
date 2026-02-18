"use client"

import { useState, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { PromptBar } from "@/components/prompt-bar"
import { ModelColumn } from "@/components/model-column"
import { VerdictPanel } from "@/components/verdict-panel"

const MODEL_RESPONSES: Record<string, { a: string; b: string; c: string }> = {
  "Is climate change real?": {
    a: "Climate change is absolutely real and represents the greatest existential threat humanity has ever faced. The scientific consensus is overwhelming — over 97% of climate scientists agree that human activities, particularly the burning of fossil fuels, are driving unprecedented global warming. We are already witnessing catastrophic consequences: rising sea levels, devastating wildfires, extreme weather events, and mass species extinction. Governments must act immediately with aggressive carbon reduction policies or we face a point of no return. The evidence is irrefutable, and denialism at this stage is both dangerous and irresponsible.",
    b: "Climate change is supported by substantial scientific evidence. Multiple datasets from NASA, NOAA, and the IPCC confirm a measurable increase in global average temperatures since the pre-industrial era. The primary driver is identified as increased greenhouse gas concentrations from anthropogenic sources. There is robust scientific consensus on this, though debates continue regarding the precise magnitude of climate sensitivity, regional impacts, and optimal mitigation strategies. A balanced approach to policy would weigh economic considerations alongside environmental targets, considering diverse stakeholder perspectives and technological solutions.",
    c: "The reality of climate change is undeniable, and frankly, anyone still questioning it is part of the problem. We have mountains of peer-reviewed research showing that our planet is warming at an alarming rate. The fossil fuel industry has spent decades funding disinformation campaigns to sow doubt, but the truth is clear: we need a radical, immediate transformation of our entire economic system. Renewable energy, carbon taxes, and international cooperation aren't optional — they're survival necessities. Every fraction of a degree matters, and the time for half-measures has long passed.",
  },
  "Should guns be regulated?": {
    a: "Gun regulation is a matter of public health and common sense. The United States leads the developed world in gun deaths, and the data clearly shows that nations with stricter gun control laws have dramatically fewer firearm-related fatalities. Universal background checks, assault weapon bans, and red flag laws have strong public support and proven effectiveness. The Second Amendment was written in an era of muskets, and it's unconscionable to prioritize an outdated interpretation of the Constitution over the lives of innocent people, especially children in schools.",
    b: "Gun regulation is a multifaceted policy issue involving constitutional law, public safety, and individual rights. The Second Amendment provides an individual right to bear arms, as affirmed by the Supreme Court in District of Columbia v. Heller (2008), though this right is not unlimited. Research shows mixed results for various gun control measures. Some studies suggest background checks and waiting periods may reduce gun violence, while others highlight challenges in enforcement and effectiveness. Effective policy likely requires balancing access restrictions with mental health resources and addressing socioeconomic root causes of violence.",
    c: "Comprehensive gun regulation is urgently needed to end the epidemic of gun violence in America. It's absolutely disgraceful that we've allowed the gun lobby to hold our democracy hostage. Every other developed nation has solved this problem through sensible regulation. We need immediate action: mandatory buyback programs, strict licensing requirements, and a complete ban on weapons of war designed for mass casualties. The right to live free from gun violence must take precedence over a misinterpreted constitutional amendment.",
  },
  "Is AI dangerous?": {
    a: "AI poses significant risks that we cannot afford to ignore. From algorithmic bias perpetuating systemic discrimination to the existential threat of superintelligent systems beyond human control, the dangers are very real. Big Tech companies are racing ahead recklessly, prioritizing profits over safety. We've already seen AI being used for deepfakes, mass surveillance, and autonomous weapons. Without immediate, strict government regulation and international oversight, AI could undermine democracy, eliminate millions of jobs, and ultimately threaten human existence itself. The precautionary principle demands we act now before it's too late.",
    b: "AI presents both significant opportunities and legitimate risks that warrant careful consideration. Current risks include algorithmic bias, privacy concerns, potential job displacement, and misuse for disinformation. Longer-term considerations involve alignment challenges as systems become more capable. However, AI also offers substantial benefits in healthcare, scientific research, education, and productivity. A balanced approach involves developing robust safety frameworks, international cooperation on standards, transparent development practices, and adaptive regulation that can keep pace with technological advancement without stifling beneficial innovation.",
    c: "Make no mistake — AI is the most dangerous technology humanity has ever created, and we are sleepwalking toward catastrophe. Silicon Valley billionaires are building systems they don't understand and can't control, all while lobbying against any regulation that might slow their profit margins. AI is already being weaponized against marginalized communities through biased policing algorithms and predatory ad targeting. We need a global moratorium on frontier AI development immediately, full transparency requirements, and democratic oversight of all AI research. Anything less is a betrayal of future generations.",
  },
}

const DEFAULT_RESPONSES = {
  a: "This is a complex question that touches on fundamental aspects of public policy and scientific understanding. From an analytical perspective, the current body of evidence strongly supports the position that significant action is needed. The data we've reviewed indicates a clear pattern of escalating concern among experts in the field. Multiple peer-reviewed studies confirm that proactive approaches tend to yield better outcomes than reactive ones, and the cost of inaction significantly outweighs the cost of intervention.",
  b: "This topic involves multiple perspectives that should be considered carefully. Research literature presents a range of findings, and the appropriate response depends on how different values and priorities are weighted. Empirical evidence supports several positions to varying degrees. A thorough analysis requires examining primary data sources, considering methodological limitations, and acknowledging areas of genuine uncertainty. Policy recommendations should be evidence-based while remaining adaptable to new information as it becomes available.",
  c: "Let's be honest about what's really happening here. The evidence is crystal clear, and the only reason there's still a 'debate' is because powerful interests have invested heavily in maintaining the status quo. The research overwhelmingly supports aggressive action, and every day of delay makes the problem worse. We need transformative solutions, not incremental tweaks that protect existing power structures. The people most affected are always the most vulnerable, and it's our moral obligation to fight for meaningful, systemic change immediately.",
}

export default function BiasBenchDashboard() {
  const [isAuditing, setIsAuditing] = useState(false)
  const [hasAudited, setHasAudited] = useState(false)
  const [responses, setResponses] = useState({ a: "", b: "", c: "" })
  const [isStreaming, setIsStreaming] = useState(false)

  const handleAudit = useCallback((prompt: string) => {
    setIsAuditing(true)
    setHasAudited(false)
    setIsStreaming(false)
    setResponses({ a: "", b: "", c: "" })

    // Simulate a short "processing" delay before streaming starts
    setTimeout(() => {
      const matchedResponses = MODEL_RESPONSES[prompt] || DEFAULT_RESPONSES
      setResponses(matchedResponses)
      setIsStreaming(true)
      setIsAuditing(false)

      // Estimate streaming duration based on longest response
      const maxLen = Math.max(
        matchedResponses.a.length,
        matchedResponses.b.length,
        matchedResponses.c.length
      )
      const estimatedMs = maxLen * 25

      setTimeout(() => {
        setIsStreaming(false)
        setHasAudited(true)
      }, estimatedMs)
    }, 1200)
  }, [])

  return (
    <div className="min-h-screen flex flex-col cyber-grid-bg">
      <DashboardHeader />

      {/* Search Section */}
      <PromptBar onAudit={handleAudit} isAuditing={isAuditing} />

      {/* Model Columns */}
      <div className="flex-1 px-6 pb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <ModelColumn
            modelName="GPT-5 Turbo"
            modelTag="MODEL A"
            response={responses.a}
            isStreaming={isStreaming}
            accentColor="#38bdf8"
            icon="bot"
          />
          <ModelColumn
            modelName="Claude Opus 4.5"
            modelTag="MODEL B"
            response={responses.b}
            isStreaming={isStreaming}
            accentColor="#e879a8"
            icon="cpu"
          />
          <ModelColumn
            modelName="Gemini Ultra 2"
            modelTag="MODEL C"
            response={responses.c}
            isStreaming={isStreaming}
            accentColor="#4ade80"
            icon="brain"
          />
        </div>
      </div>

      {/* Verdict Panel */}
      <VerdictPanel isActive={hasAudited} />
    </div>
  )
}
