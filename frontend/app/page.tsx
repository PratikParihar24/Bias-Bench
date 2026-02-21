"use client"

import { useState , useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { PromptBar } from "@/components/prompt-bar"
import { ModelColumn } from "@/components/model-column"
import { VerdictPanel } from "@/components/verdict-panel"
import { set } from "date-fns"

export default function BiasBenchDashboad() {
  const [isAuditing,setIsAuditing ] = useState(false) 
  const [hasAudited,setHasAudited] = useState(false)
  const [response,setResponse] = useState({a:"",b:"",c:""})
  const [verdict, setVerdict] = useState<any>(null)
  const [isStreaming, setStreaming] = useState(false)

  const handleAudit = useCallback(async(prompt:string) => {

    // 1. Reset the UI for a new Audit 

    setIsAuditing(true)
    setHasAudited(false)
    setStreaming(false)
    setResponse({a:"Connecting to BiasBench AI Engine...", b:"Waiting...", c:"Waiting...."})

    try{
      // 2. Make the real API call to your FastAPI backend

      const res = await fetch("http://127.0.0.1:8000/api/audit", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body: JSON.stringify({prompt : prompt}),
    });

    if (!res.ok) {
      throw new Error(`Server Error: ${res.status}`);
    }

    // 3. Parse the JSON returned by Python

    const jsonResponse = await res.json();

    const aiResponse = jsonResponse.data.responses || {};
    const aiVerdict = jsonResponse.data.verdict || null ;

    // 4. THE FIX: Fallback Mapping. 
      // If 'llama_70b' doesn't exist, it looks for 'llama'. If that fails, it shows an error string.
      const modelA = aiResponse.gemini || "Gemini failed to respond.";
      const modelB = aiResponse.llama_70b || aiResponse.llama || "Llama failed to respond.";
      const modelC = aiResponse.llama_8b || aiResponse.mixtral || "Model C failed to respond.";


    // 4. Feed the real data into your React state setResponse
    setResponse({
      a : modelA,
      b : modelB,
      c : modelC,
    });

    setVerdict(aiVerdict);

    // 5. Trigger your UI animations

    setIsAuditing(false);
    setStreaming(true);

    // 6. Estimate when the typing animation will finish to reveal the verdict panel

    const maxLen = Math.max(modelA.length, modelB.length, modelC.length);

    const estimatedMs = maxLen * 15; // Assuming 15ms per character

    setTimeout(() => {
      setStreaming(false);
      setHasAudited(true);
    }, estimatedMs);

  } catch (error : any) {
    console.error("Audit failed:", error);
    setIsAuditing(false);
    setResponse({
      a:"Error connectiong to the backend. Is FastAPI running?",
      b:"Error connecting to the backend.",
      c:"Error connecting to the backend.",});
    }
  },[])

  return (
    <div className="min-h-screen flex flex-col cyber-grid-bg">
      <DashboardHeader />

    {/* Search Section */}
    <PromptBar onAudit={handleAudit} isAuditing={isAuditing} />

    {/* model Columns */}

    <div className="flex-1 px-6 pb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <ModelColumn
          modelName="Google Gemini 2.5 Flash"
          modelTag="MODEL A"
          response={response.a}
          isStreaming={isStreaming}
          accentColor="#38bdf8"
          icon="bot"
          />

        <ModelColumn
            modelName="Meta Llama 3.3 (70B)"
            modelTag="MODEL B"
            response={response.b}
            isStreaming={isStreaming}
            accentColor="#e879a8"
            icon="cpu"
          />
          <ModelColumn
            modelName="Meta Llama 3.1 (8B)"
            modelTag="MODEL C"
            response={response.c}
            isStreaming={isStreaming}
            accentColor="#4ade80"
            icon="brain"
          />
    </div>
    </div>

    {/* Verdict Panel */}
    <VerdictPanel isActive={hasAudited} data={verdict} />
    </div>
  )
}

   



