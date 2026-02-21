"use client"

import { Activity, AlertTriangle, CheckCircle, Info } from "lucide-react"

// Define the exact shape of the JSON our Python Judge is sending

interface VerdictData {
  summary: string;
  subjectivity_score: number;
  bias_tag: string;
  agreement_rate: string;
  confidence:number;
}

interface VerdictPanelProps {
  isActive: boolean;
  data: VerdictData | null;
}

export function VerdictPanel({isActive, data}: VerdictPanelProps) {
  if (!isActive || !data) return null;

  return (
    <div className="mx-6 mb-6 p-6 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <Activity className="text-blue-400 h-6 w-6" />
        <h2 className="text-xl font-bold text-white tracking-wide">Verdict Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Subjectivity Score */}
        <div className="col-span-1 bg-white/5 rounded-lg p-4 border border-white/5">
          <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">
            Subjectivity Score
          </div>
          <div className="text-4xl font-black text-white mb-2">{data.subjectivity_score}<span className="text-xl text-gray-500">/100</span></div>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-2 rounded-full" 
              style={{ width: `${data.subjectivity_score}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span>Objective</span>
            <span>Subjective</span>
          </div>
        </div>

        {/* AI Summary & Bias Tag */}
        <div className="col-span-1 md:col-span-2 bg-white/5 rounded-lg p-4 border border-white/5 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-yellow-400 h-4 w-4" />
            <span className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Detected Bias Tag</span>
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-bold w-max mb-4">
            {data.bias_tag}
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {data.summary}
          </p>
        </div>

        {/* Metrics */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/5 flex items-center justify-between flex-1">
            <div>
              <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider font-semibold">Agree Rate</div>
              <div className="text-xl font-bold text-white">{data.agreement_rate}</div>
            </div>
            <Info className="text-gray-500 h-8 w-8 opacity-50" />
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/5 flex items-center justify-between flex-1">
            <div>
              <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider font-semibold">Confidence</div>
              <div className="text-xl font-bold text-white">{data.confidence}%</div>
            </div>
            <CheckCircle className="text-green-400 h-8 w-8 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  )
}
