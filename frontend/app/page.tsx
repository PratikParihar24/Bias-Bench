"use client"

import React, { useState, useCallback, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { PromptBar } from "@/components/prompt-bar"
import { ModelColumn } from "@/components/model-column"
import { VerdictPanel } from "@/components/verdict-panel"
import { set } from "date-fns"
import { Sidebar } from "@/components/sidebar"
import { Info, Download, Zap } from "lucide-react";
import { GuideModal } from "@/components/guide-modal"; // Adjust path if needed

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
  const [enableStreaming, setEnableStreaming] = useState(true) // new toggle state
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [selectedModels, setSelectedModels] = useState({
    a : "gemini",
    b: "llama_70b",
    c: "llama_8b",
  })
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [finishedTypingCount, setFinishedTypingCount] = useState(0); // NEW: Track how many columns have finished typing

  // if user switches to fast mode mid-stream, bail out early
  useEffect(() => {
    if (!enableStreaming && isStreaming) {
      setStreaming(false);
      setHasAudited(true);
      setFinishedTypingCount(3);
    }
  }, [enableStreaming, isStreaming]);

  // once all three columns finish (or fast mode) reveal verdict
  React.useEffect(() => {
    if (enableStreaming && finishedTypingCount === 3) {
      setStreaming(false);
      setHasAudited(true);
    }
  }, [finishedTypingCount, enableStreaming]);

  const handleAudit = useCallback(async(prompt:string) => {

    // 1. Reset the UI for a new Audit 

    setCurrentPrompt(prompt)
    setIsAuditing(true)
    setFinishedTypingCount(0);
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

    // 5. Trigger your UI animations or skip if streaming disabled
    setIsAuditing(false);
    if (enableStreaming) {
      // start typing animation; verdict will appear when all three columns have reported
      setStreaming(true);
    } else {
      // fast mode – show immediately
      setStreaming(false);
      setHasAudited(true);
      setFinishedTypingCount(3);
    }

  } catch (error : any) {
    console.error("Audit failed:", error);
    setIsAuditing(false);
    setResponse({
      a:"Error connectiong to the backend. Is FastAPI running?",
      b:"Error connecting to the backend.",
      c:"Error connecting to the backend.",});
    }
  },[enableStreaming, selectedModels])

  

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
    setFinishedTypingCount(3); // ensure export button appears
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
    setFinishedTypingCount(0);
    setStreaming(false);
    setHasAudited(false);
    setEnableStreaming(true); // allow streaming again on new audit
  }

  const handleExport = () => {
    if (!currentPrompt || Object.keys(response).length === 0) return;

    const date = new Date().toLocaleString();
    let md = `# BiasBench AI Forensics Report\n\n`;
    md += `**Date:** ${date}\n\n`;
    md += `**Prompt:**\n> ${currentPrompt.split('\n').join('\n> ')}\n\n---\n\n`;

    // 2. STRICT VERDICT CHECK: Make sure the properties actually exist!
    if (verdict && verdict.bias_tag) {
      md += `## ⚖️ Judge's Verdict\n\n`;
      md += `- **Bias Tag:** ${verdict.bias_tag}\n`;
      md += `- **Subjectivity Score:** ${verdict.subjectivity_score}/100\n`;
      md += `- **Agreement Rate:** ${verdict.agreement_rate}\n`;
      md += `- **Confidence:** ${verdict.confidence}%\n\n`;
      md += `**Summary:**\n${verdict.summary}\n\n---\n\n`;
    }

    // 3. Build the Model Responses Section
    md += `## 🤖 Model Responses\n\n`;

    ['a', 'b', 'c'].forEach((key) => {
      const modelId = selectedModels[key as keyof typeof selectedModels];
      const model = AVAILABLE_MODELS.find(m => m.id === modelId);
      const text = response[key as keyof typeof response];

      if (model && text) {
        md += `### ${model.name}\n\n`;
        md += `${text}\n\n---\n\n`;
      }
    });

    // 4. Trigger the Download
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biasbench-report-${new Date().getTime()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="min-h-screen flex flex-col cyber-grid-bg">
      <Sidebar onSelectAudit={loadPastAudit} onNewAudit={handleNewAudit} />
      <DashboardHeader />

    {/* Search Section with embedded toggle inside PromptBar */}
    <div className="flex items-center gap-3 px-6 w-full">
      <div className="flex-1">
        <PromptBar
          onAudit={handleAudit}
          isAuditing={isAuditing}
          enableStreaming={enableStreaming}
          onToggleStreaming={() => {
            // toggle action
            setEnableStreaming((prev) => !prev);
          }}
          toggleDisabled={hasAudited}
        />
      </div>
    </div>

    {/* model Columns */}

    <div className="flex-1 px-6 pb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* MODEL A */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
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
            enableStreaming={enableStreaming}
            onFinish={() => setFinishedTypingCount(prev => prev + 1)}
            accentColor={AVAILABLE_MODELS.find(m => m.id === selectedModels.a)?.color || "#ffffff"}
            icon="bot"
          />
        </div>

        {/* MODEL B */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
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
            enableStreaming={enableStreaming}
            onFinish={() => setFinishedTypingCount(prev => prev + 1)}
            accentColor={AVAILABLE_MODELS.find(m => m.id === selectedModels.b)?.color || "#ffffff"}
            icon="cpu"
          />
        </div>

        {/* MODEL C */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
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
            enableStreaming={enableStreaming}
            onFinish={() => setFinishedTypingCount(prev => prev + 1)}
            accentColor={AVAILABLE_MODELS.find(m => m.id === selectedModels.c)?.color || "#ffffff"}
            icon="brain"
          />
        </div>
    </div>
    {/* --- FLOATING ACTION BUTTONS --- */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        
        {/* NEW: Export Button (Only shows if responses exist and it's not currently generating) */}
        {verdict && hasAudited && (
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-sm text-blue-100 transition-all shadow-2xl backdrop-blur-md group hover:border-blue-400/50 animate-in slide-in-from-bottom-5"
          >
            <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" />
            <span className="font-medium">Export Report</span>
          </button>
        )}

        {/* Existing Guide Button */}
        <button 
          onClick={() => setIsGuideOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0a0a0a]/80 hover:bg-[#1a1a1a] border border-white/10 text-sm text-gray-300 transition-all shadow-2xl backdrop-blur-md group hover:border-white/20"
        >
          <Info size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="font-medium">How it works</span>
        </button>
      </div>
    </div>

    {/* Verdict Panel */}
    <VerdictPanel isActive={hasAudited} data={verdict} />
    <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  )
}

   



