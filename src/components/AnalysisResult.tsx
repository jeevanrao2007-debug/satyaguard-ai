import React from "react";
import { motion } from "motion/react";
import { 
  ShieldAlert, 
  CheckCircle, 
  Info, 
  ArrowLeft, 
  RefreshCw, 
  BookOpen, 
  AlertTriangle,
  FileCheck,
  ChevronRight,
  Database,
  Search,
  Activity,
  ThumbsUp
} from "lucide-react";
import { AnalysisResult } from "../types";

interface AnalysisResultProps {
  id?: string;
  result: AnalysisResult;
  originalContent: string;
  sourceType: "text" | "image" | "audio";
  onBack: () => void;
}

export default function AnalysisResultView({ id, result, originalContent, sourceType, onBack }: AnalysisResultProps) {
  
  // Decide colors and layout details based on risk score
  const isHighRisk = result.riskScore >= 70;
  const isMediumRisk = result.riskScore >= 30 && result.riskScore < 70;
  const isSafe = result.riskScore < 30;

  const strokeColor = 
    isHighRisk ? "#EF4444" : 
    isMediumRisk ? "#F59E0B" : 
    "#10B981";

  const glowClass = 
    isHighRisk ? "glow-danger" : 
    isMediumRisk ? "glow-indigo" : 
    "glow-success";

  const severityBadgeColor = 
    result.severity === "critical" ? "bg-red-500/10 border-red-500/20 text-red-400" :
    result.severity === "high" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
    result.severity === "medium" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";

  // Circular gauge parameters
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.riskScore / 100) * circumference;

  // Timeline processing steps
  const timelineSteps = [
    { label: "Upload Completed", description: "Metadata extraction complete.", icon: <FileCheck className="w-4 h-4 text-emerald-400" /> },
    { label: "Neural Auditing", description: "Gemini text-OCR/vocal sifting.", icon: <Activity className="w-4 h-4 text-indigo-400 animate-pulse" /> },
    { label: "Advisory Grounding", description: "RAG matching against bulletins.", icon: <Database className="w-4 h-4 text-cyan-400" /> },
    { label: "Decision Engine", description: "Calculating weight classification.", icon: <Search className="w-4 h-4 text-purple-400" /> },
    { label: "Verdict Generated", description: "Risk report published.", icon: <ThumbsUp className="w-4 h-4 text-emerald-400" /> }
  ];

  return (
    <div className="space-y-6 text-cyber-text pb-12">
      
      {/* Header back button */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-cyber-muted hover:text-white transition-all p-1.5 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5"
        >
          <ArrowLeft className="w-4 h-4" /> Go back to dashboard
        </button>

        <span className="text-xs font-mono text-cyber-muted uppercase">
          Scan Report ID: <span className="text-white">{id && !id.startsWith("pending-") ? `#${id}` : `#${Math.floor(Math.random() * 900000 + 100000)}`}</span>
        </span>
      </div>

      {/* Top Banner Alert */}
      <div className={`p-4 rounded-2xl border flex items-start gap-4 ${
        isHighRisk ? "bg-red-500/5 border-red-500/20 text-red-300" :
        isMediumRisk ? "bg-amber-500/5 border-amber-500/20 text-amber-300" :
        "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
      }`}>
        <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
          isHighRisk ? "text-red-400" : isMediumRisk ? "text-yellow-400" : "text-emerald-400"
        }`} />
        <div>
          <h3 className="font-semibold text-sm">
            {isHighRisk ? "Threat Flagged: High Risk of Digital Compromise" : 
             isMediumRisk ? "Vulnerability Warned: Suspicious Context Observed" : 
             "Verified Safe: No Fraud Signatures Detected"}
          </h3>
          <p className="text-xs text-cyber-muted mt-1 leading-relaxed">
            {isHighRisk ? "This content displays strong signals consistent with standard social engineering or digital extortion templates." :
             isMediumRisk ? "Some content cues warrant caution. Review evidence pointers and recommended steps carefully." :
             "Our automated systems verified this payload against modern compliance watchlists. No immediate anomalies observed."}
          </p>
        </div>
      </div>

      {/* Grid: Gauge Overview + Processing Pipeline */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Risk Gauge Block */}
        <div className={`p-6 rounded-2xl glass-panel border border-white/5 flex flex-col items-center justify-center text-center relative ${glowClass}`}>
          
          <p className="text-xs font-mono text-cyber-muted uppercase tracking-wider mb-4">Threat Vulnerability Index</p>
          
          {/* Circular SVG Gauge */}
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-white/5 fill-transparent"
                strokeWidth="8"
              />
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                className="fill-transparent"
                stroke={strokeColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-display font-bold text-white leading-none">{result.riskScore}%</span>
              <span className="text-[10px] text-cyber-muted font-mono mt-1 uppercase tracking-wider">Risk Metric</span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <span className={`text-[10px] font-mono px-2.5 py-1 rounded border uppercase ${severityBadgeColor}`}>
              Severity: {result.severity}
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded border border-white/10 bg-white/5 text-white uppercase">
              Category: {result.category}
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 w-full text-xs font-mono text-cyber-muted">
            Confidence Interval: <span className="text-white">{(result.confidence * 100).toFixed(0)}%</span>
          </div>

        </div>

        {/* Processing Pipeline Animated Timeline */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-semibold text-white text-base">Forensic Pipeline Activity</h4>
            <p className="text-xs text-cyber-muted font-light mt-0.5">Automated computational steps executed.</p>
          </div>

          <div className="mt-6 space-y-4 relative pl-3">
            {/* Thread timeline line connector */}
            <div className="absolute top-1 bottom-1 left-[19px] w-[1px] bg-white/5" />

            {timelineSteps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex items-start gap-4 relative"
              >
                <div className="w-8 h-8 rounded-full bg-cyber-bg border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
                  {step.icon}
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-white">{step.label}</h5>
                  <p className="text-[10px] text-cyber-muted font-mono mt-0.5">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: AI Explanation + Evidence & Action Checklist */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Left: Forensic Explanation */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <div className="p-2 bg-indigo-600/10 rounded-xl">
              <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-white text-base">Forensic Assessment</h4>
              <p className="text-[10px] text-cyber-muted font-mono uppercase mt-0.5">Decision explanation matrix</p>
            </div>
          </div>

          <p className="text-sm text-cyber-muted leading-relaxed font-light whitespace-pre-line">
            {result.explanation}
          </p>

          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <h5 className="text-xs font-mono text-white uppercase">Original scan payload metadata</h5>
            <div className="p-2.5 rounded bg-white/[0.01] text-xs font-mono text-cyber-muted max-h-32 overflow-y-auto whitespace-pre-wrap break-all border border-white/5">
              {originalContent}
            </div>
          </div>
        </div>

        {/* Right: Evidence and Remediation Steps */}
        <div className="space-y-6">
          
          {/* Evidence Card */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <h4 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" /> Threat Indicators Detected
            </h4>
            
            <div className="space-y-2.5">
              {result.evidence.map((ev, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                    {i+1}
                  </div>
                  <p className="text-xs text-cyber-muted leading-relaxed">{ev}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Counter-measures */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
            <h4 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" /> Recommended Action Items
            </h4>
            
            <div className="space-y-2.5">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-xs text-cyber-muted leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
