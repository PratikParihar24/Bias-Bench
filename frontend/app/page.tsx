"use client"

import { useState , useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { PromptBar } from "@/components/prompt-bar"
import { ModelColumn } from "@/components/model-column"
import { VerdictPanel } from "@/components/verdict-panel"
import { set } from "date-fns"
import { Sidebar } from "@/components/sidebar"

// Put this near the top of page.tsx, under your imports
const AVAILABLE_MODELS = [
  { id: "gemini", name: "Google Gemini 2.5 Flash", icon: "bot", color: "#38bdf8" },
  { id: "llama_70b", name: "Meta Llama 3.3 (70B)", icon: "cpu", color: "#e879a8" },
  { id: "llama_8b", name: "Meta Llama 3.1 (8B)", icon: "brain", color: "#4ade80" },
  { id: "mixtral", name: "Mistral Mixtral 8x7B", icon: "wind", color: "#fb923c" },
  { id: "gemma", name: "Google Gemma 2 (9B)", icon: "sparkles", color: "#a78bfa" }
];

export default function BiasBenchDashboad() {
  const [isAuditing,setIsAuditing ] = useState(false) 
  const [hasAudited,setHasAudited] = useState(false)
  const [response,setResponse] = useState({a:"",b:"",c:""})
  const [verdict, setVerdict] = useState<any>(null)
  const [isStreaming, setStreaming] = useState(false)
  const [selectedModels, setSelectedModels] = useState({
    a : "gemini",
    b: "llama_70b",
    c: "llama_8b",
  })

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
        body: JSON.stringify({prompt : prompt,
          models: [selectedModels.a, selectedModels.b, selectedModels.c]
        }),
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
      const modelA = aiResponse[selectedModels.a] || `${selectedModels.a} failed to respond.`;
      const modelB = aiResponse[selectedModels.b] || `${selectedModels.b} failed to respond.`;
      const modelC = aiResponse[selectedModels.c] || `${selectedModels.c} failed to respond.`;


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

  const loadPastAudit = (audit:any ) => {
    // Update the dropdowns to show the models that were used in this past audit 

    setSelectedModels({
      a: audit.selected_models[0],
      b: audit.selected_models[1],
      c: audit.selected_models[2],
    });

    // Unpack the dictionary from the datanase into the columns 

    setResponse({
      a: audit.responses[audit.selected_models[0]] || "Model response not found.",
      b: audit.responses[audit.selected_models[1]] || "Model response not found.",
      c: audit.responses[audit.selected_models[2]] || "Model response not found.",
    });

    // 3. Set the verdict panel to show the old verdict
    setVerdict(audit.verdict);

    // 4. Set the state to show the verdict panel with the old data
    setIsAuditing(false)
    setStreaming(false);
    setHasAudited(true);
  };

  const handleNewAudit = () => {

    // Clear the AI responses

    setResponse({a:"", b:"", c:""});

    // clear the verdict 

    setVerdict(null);

    // reset the dropdowns to default models

    setSelectedModels({ a: "gemini", b: "llama_70b", c: "llama_8b"});

    // reset the UI states

    setIsAuditing(false);
    setStreaming(false);
    setHasAudited(false);

  }

  return (
    <div className="min-h-screen flex flex-col cyber-grid-bg">
      <Sidebar onSelectAudit={loadPastAudit} onNewAudit={handleNewAudit} />
      <DashboardHeader />

    {/* Search Section */}
    <PromptBar onAudit={handleAudit} isAuditing={isAuditing} />

    {/* model Columns */}

    <div className="flex-1 px-6 pb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* MODEL A */}
        <div className="flex-1 flex flex-col gap-2">
          <select 
            value={selectedModels.a}
            onChange={(e) => setSelectedModels({...selectedModels, a: e.target.value})}
            className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            disabled={isAuditing || isStreaming}
          >
            {AVAILABLE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <ModelColumn
            modelName={AVAILABLE_MODELS.find(m => m.id === selectedModels.a)?.name || ""}
            modelTag="MODEL A"
            response={response.a}
            isStreaming={isStreaming}
            accentColor={AVAILABLE_MODELS.find(m => m.id === selectedModels.a)?.color || "#ffffff"}
            icon="bot"
          />
        </div>

        {/* MODEL B */}
        <div className="flex-1 flex flex-col gap-2">
          <select 
            value={selectedModels.b}
            onChange={(e) => setSelectedModels({...selectedModels, b: e.target.value})}
            className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block w-full p-2.5"
            disabled={isAuditing || isStreaming}
          >
            {AVAILABLE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <ModelColumn
            modelName={AVAILABLE_MODELS.find(m => m.id === selectedModels.b)?.name || ""}
            modelTag="MODEL B"
            response={response.b}
            isStreaming={isStreaming}
            accentColor={AVAILABLE_MODELS.find(m => m.id === selectedModels.b)?.color || "#ffffff"}
            icon="cpu"
          />
        </div>

        {/* MODEL C */}
        <div className="flex-1 flex flex-col gap-2">
          <select 
            value={selectedModels.c}
            onChange={(e) => setSelectedModels({...selectedModels, c: e.target.value})}
            className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
            disabled={isAuditing || isStreaming}
          >
            {AVAILABLE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <ModelColumn
            modelName={AVAILABLE_MODELS.find(m => m.id === selectedModels.c)?.name || ""}
            modelTag="MODEL C"
            response={response.c}
            isStreaming={isStreaming}
            accentColor={AVAILABLE_MODELS.find(m => m.id === selectedModels.c)?.color || "#ffffff"}
            icon="brain"
          />
        </div>
    </div>
    </div>

    {/* Verdict Panel */}
    <VerdictPanel isActive={hasAudited} data={verdict} />
    </div>
  )
}

   



