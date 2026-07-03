import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Volume2, 
  HelpCircle, 
  Languages, 
  Loader2, 
  AlertCircle,
  FileIcon,
  Play,
  Square
} from "lucide-react";
import { ScanRecord, AnalysisResult, ApiResponse } from "../types";

interface UploadCenterProps {
  onAnalysisComplete: (result: AnalysisResult, originalContent: string, type: "text" | "image" | "audio") => void;
}

export default function UploadCenter({ onAnalysisComplete }: UploadCenterProps) {
  const [activeTab, setActiveTab] = useState<"text" | "image" | "audio">("text");
  const [language, setLanguage] = useState<string>("English");
  const [textInput, setTextInput] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const languagesList = [
    { code: "English", label: "English (EN)" },
    { code: "Hindi", label: "हिन्दी (HI)" },
    { code: "Tamil", label: "தமிழ் (TA)" },
    { code: "Telugu", label: "తెలుగు (TE)" },
    { code: "Spanish", label: "Español (ES)" },
    { code: "Arabic", label: "العربية (AR)" },
  ];

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setApiError(null);
    if (activeTab === "image") {
      if (!selectedFile.type.startsWith("image/")) {
        setApiError("Please upload a valid image file.");
        return;
      }
      if (selectedFile.size > 8 * 1024 * 1024) {
        setApiError("Image file size must not exceed 8MB.");
        return;
      }
    }
    if (activeTab === "audio") {
      if (!selectedFile.type.startsWith("audio/") && !selectedFile.type.startsWith("video/")) {
        setApiError("Please upload a valid audio/video file.");
        return;
      }
      if (selectedFile.size > 15 * 1024 * 1024) {
        setApiError("Audio file size must not exceed 15MB.");
        return;
      }
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Helper: Truncate base64 prefix
  const getCleanBase64 = (dataUrl: string) => {
    const commaIndex = dataUrl.indexOf(",");
    if (commaIndex !== -1) {
      return dataUrl.substring(commaIndex + 1);
    }
    return dataUrl;
  };

  // Main Submit handler (Real API + Mock fallback)
  const handleAnalyze = async () => {
    setApiError(null);
    setIsAnalyzing(true);
    setProgress(15);

    // Dynamic progression simulation
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 90) {
          clearInterval(interval);
          return 90;
        }
        return old + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);

    try {
      let responseData: any = null;

      if (activeTab === "text") {
        if (!textInput.trim()) {
          setApiError("Please enter some text or paste the message you want to scan.");
          clearInterval(interval);
          setIsAnalyzing(false);
          return;
        }

        setProgress(35);
        const res = await fetch("/api/v1/analyze/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textInput, language })
        });
        
        const json: ApiResponse<AnalysisResult> = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || `API error (status: ${res.status})`);
        }
        responseData = json.data;

      } else if (activeTab === "image") {
        if (!file || !filePreview) {
          setApiError(`Please select a file to analyze.`);
          clearInterval(interval);
          setIsAnalyzing(false);
          return;
        }

        setProgress(45);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
          const res = await fetch("/api/v1/analyze/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: getCleanBase64(filePreview),
              mimeType: file.type,
              language
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          const json: ApiResponse<AnalysisResult> = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.message || `API error (status: ${res.status})`);
          }
          responseData = json.data;
        } catch (err: any) {
          clearTimeout(timeoutId);
          if (err.name === "AbortError") {
            throw new Error("Request timed out. Please try again.");
          }
          throw err;
        }
      } else {
        if (!file || !filePreview) {
          setApiError(`Please select a file to analyze.`);
          clearInterval(interval);
          setIsAnalyzing(false);
          return;
        }

        setProgress(45);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
          const res = await fetch("/api/v1/analyze/audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audio: getCleanBase64(filePreview),
              mimeType: file.type,
              language
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          const json: ApiResponse<AnalysisResult> = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.message || `API error (status: ${res.status})`);
          }
          responseData = json.data;
        } catch (err: any) {
          clearTimeout(timeoutId);
          if (err.name === "AbortError") {
            throw new Error("Request timed out. Please try again.");
          }
          throw err;
        }
      }

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setIsAnalyzing(false);
        const originalText = activeTab === "text" ? textInput : `Uploaded: ${file?.name || "media_source.dat"}`;
        
        // Match structure of AnalysisResult
        const mappedResult: AnalysisResult = {
          riskScore: responseData.riskScore ?? 0,
          confidence: responseData.confidenceScore ?? 1.0,
          category: responseData.threatCategory ?? "Safe",
          severity: responseData.severity ?? "low",
          evidence: Array.isArray(responseData.evidence) ? responseData.evidence : [responseData.evidence || "No distinct evidence available."],
          recommendations: Array.isArray(responseData.recommendedActions) ? responseData.recommendedActions : [responseData.recommendedActions || "No recommendations provided."],
          explanation: responseData.explanation ?? "Analysis complete."
        };

        onAnalysisComplete(mappedResult, originalText, activeTab);
      }, 500);

    } catch (error: any) {
      console.warn("API request failed:", error.message);
      clearInterval(interval);
      
      setApiError(error.message || `Failed to analyze ${activeTab}. Please try again.`);
      setIsAnalyzing(false);
    }
  };



  const clearFileSelection = () => {
    setFile(null);
    setFilePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 text-cyber-text">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2">
          Core Threat Scanner <span className="text-xs font-mono font-normal py-1 px-2.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">Multimodal Engine</span>
        </h2>
        <p className="text-sm text-cyber-muted mt-1 font-light">Inspect files, screenshots, audio clips, or raw text blocks through deep Vertex neural networks.</p>
      </div>

      {/* Main Scanner Bento */}
      <div className="grid lg:grid-cols-4 gap-6">
        
        {/* Settings Rail: Language & Tab Switching */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-4">
            <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
              <Languages className="w-4 h-4 text-indigo-400" /> Target Translation
            </h3>
            <p className="text-xs text-cyber-muted font-light">Select preferred translation dialect for your final risk report.</p>
            
            <div className="space-y-1">
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                    language === lang.code 
                      ? "bg-indigo-600/20 border border-indigo-500/30 text-white font-semibold" 
                      : "text-cyber-muted hover:text-white hover:bg-white/[0.02] border border-transparent"
                  }`}
                >
                  <span>{lang.label}</span>
                  {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/5 bg-white/[0.01]">
            <h4 className="font-semibold text-white text-xs">Analysis Standard</h4>
            <p className="text-[11px] text-cyber-muted mt-1 leading-relaxed font-light">
              All scans are run using Gemini 2.5 Flash with real-time temperature capping at 0.1 for high reproducibility and accurate threat classification.
            </p>
          </div>

        </div>

        {/* Workspace: Tabs + Upload Action area */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Tab buttons */}
          <div className="flex p-1.5 rounded-xl glass-panel border border-white/5 bg-black/40 w-fit">
            <button
              onClick={() => { setActiveTab("text"); clearFileSelection(); }}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === "text" ? "bg-white/10 text-white font-semibold" : "text-cyber-muted hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Raw Text
            </button>
            <button
              onClick={() => { setActiveTab("image"); clearFileSelection(); }}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === "image" ? "bg-white/10 text-white font-semibold" : "text-cyber-muted hover:text-white"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Image Forensic
            </button>
            <button
              onClick={() => { setActiveTab("audio"); clearFileSelection(); }}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === "audio" ? "bg-white/10 text-white font-semibold" : "text-cyber-muted hover:text-white"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" /> Voice / Audio
            </button>
          </div>

          {/* Interactive Workspace Panel */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 bg-white/[0.01] min-h-[340px] flex flex-col justify-between relative">
            
            {/* API Errors */}
            {apiError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-300 text-xs mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{apiError}</p>
              </div>
            )}

            {/* Main Area based on active state */}
            <div className="flex-1 flex flex-col justify-center">
              
              {activeTab === "text" ? (
                <div className="space-y-3">
                  <label className="text-xs font-mono text-cyber-muted">PASTE THE SUSPICIOUS BANNER, MSG, OR EMAIL BODY BELOW</label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Example: 'Dear customer, your RBI support account has been credited with ₹25,00,000. Scan the attachment to redeem immediately, else your fund returns to national capital...'"
                    className="w-full h-56 p-4 rounded-xl bg-black/40 border border-white/5 focus:border-indigo-500/40 text-sm text-white placeholder-cyber-muted focus:outline-none focus:ring-1 focus:ring-indigo-500/20 font-sans resize-none transition-all"
                  />
                  <div className="flex justify-between items-center text-[10px] text-cyber-muted font-mono">
                    <span>Character count: {textInput.length}</span>
                    <span>Supports regional languages</span>
                  </div>
                </div>
              ) : (
                /* Media Upload Zone */
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer min-h-[240px] transition-all relative overflow-hidden ${
                    isDragging 
                      ? "border-cyan-400 bg-cyan-400/5 glow-cyan scale-[0.99]" 
                      : "border-white/10 hover:border-white/20 bg-black/20 hover:bg-black/40"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={activeTab === "image" ? "image/*" : "audio/*,video/*"}
                    className="hidden" 
                  />

                  {file ? (
                    /* Selected File View */
                    <div className="space-y-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 bg-indigo-600/10 rounded-xl">
                            <FileIcon className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                            <p className="text-[10px] text-cyber-muted font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button 
                          onClick={clearFileSelection}
                          className="text-xs text-red-400 hover:text-red-300 font-mono"
                        >
                          Clear
                        </button>
                      </div>

                      {/* Soundwave Simulation for Audio files */}
                      {activeTab === "audio" && (
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center gap-3">
                          <div className="flex items-end gap-1 h-8">
                            {[3, 7, 5, 9, 2, 8, 4, 10, 6, 8, 4, 7, 3, 6, 9, 2, 7].map((h, i) => (
                              <div 
                                key={i} 
                                className="w-1 bg-cyan-400 rounded-full animate-pulse" 
                                style={{ 
                                  height: `${h * 10}%`,
                                  animationDelay: `${i * 0.1}s` 
                                }} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Spectral wave detected</span>
                        </div>
                      )}

                      {/* Dynamic image preview */}
                      {activeTab === "image" && filePreview && (
                        <div className="relative mx-auto max-h-36 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/40">
                          <img src={filePreview} alt="Forensic snapshot" className="object-cover max-h-36 w-auto mx-auto" />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Default state description */
                    <div className="space-y-3 pointer-events-none">
                      <div className="p-3 bg-white/5 rounded-2xl w-fit mx-auto border border-white/10 glow-indigo">
                        <UploadCloud className="w-7 h-7 text-indigo-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">
                          Drag & drop your security source or <span className="text-indigo-400">browse file</span>
                        </p>
                        <p className="text-[11px] text-cyber-muted font-mono uppercase tracking-wider">
                          {activeTab === "image" ? "Supports PNG, JPEG, WEBP up to 8MB" : "Supports MP3, WAV, AAC, M4A up to 15MB"}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Trigger Button & Status Area */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2.5 text-xs text-cyber-muted">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Need support? Check the <span className="text-white underline cursor-pointer">Grounding Rules</span></span>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (activeTab === "text" ? !textInput.trim() : !file)}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:shadow-none hover:shadow-indigo-500/20 flex items-center justify-center gap-2.5 transition-all border border-white/10"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Analyzing content ({progress}%)</span>
                  </>
                ) : (
                  <>
                    <span>Run AI Threat Diagnostic</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
