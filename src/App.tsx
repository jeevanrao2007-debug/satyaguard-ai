import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import UploadCenter from "./components/UploadCenter";
import AnalysisResultView from "./components/AnalysisResult";
import History from "./components/History";
import Analytics from "./components/Analytics";
import KnowledgeBase from "./components/KnowledgeBase";
import { ScanRecord, AnalysisResult, ApiResponse, ScansPage } from "./types";
import ParticlesBackground from "./components/ParticlesBackground";

export default function App() {
  // Navigation states: "landing" | "dashboard" | "upload" | "history" | "analytics" | "knowledge" | "result"
  const [currentView, setCurrentView] = useState<string>("landing");

  // Active selected scan details for report inspect
  const [activeAnalysis, setActiveAnalysis] = useState<{
    id?: string;
    result: AnalysisResult;
    originalContent: string;
    sourceType: "text" | "image" | "audio";
  } | null>(null);

  // Live scans loaded from Firestore via backend API
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [scansLoading, setScansLoading] = useState<boolean>(false);

  // ─── Load scans from backend ─────────────────────────────────────────────

  const loadScans = useCallback(async () => {
    setScansLoading(true);
    try {
      const res = await fetch("/api/v1/scans?limit=50&sortOrder=desc");
      if (!res.ok) return;
      const json: ApiResponse<ScansPage> = await res.json();
      if (json.success && json.data?.scans) {
        setScans(json.data.scans);
      }
    } catch (e) {
      console.warn("[APP] Could not load scans from backend:", (e as Error).message);
    } finally {
      setScansLoading(false);
    }
  }, []);

  // Load on first mount (once the user enters the dashboard)
  useEffect(() => {
    if (currentView !== "landing") {
      loadScans();
    }
  }, [currentView, loadScans]);

  // ─── Handle a newly completed scan ───────────────────────────────────────

  const handleAnalysisComplete = (
    result: AnalysisResult,
    originalContent: string,
    type: "text" | "image" | "audio"
  ) => {
    // Optimistically prepend a local record so the UI updates immediately
    const optimisticRecord: ScanRecord = {
      id: `pending-${Date.now()}`,
      userId: "system",
      sourceType: type,
      contentPreview:
        originalContent.length > 80
          ? `${originalContent.substring(0, 80)}...`
          : originalContent,
      createdAt: new Date().toISOString(),
      result,
    };

    setScans(prev => [optimisticRecord, ...prev]);
    setActiveAnalysis({
      id: optimisticRecord.id,
      result,
      originalContent,
      sourceType: type,
    });
    setCurrentView("result");

    // Re-fetch after 3 seconds to get the real Firestore ID
    setTimeout(() => loadScans(), 3000);
  };

  // ─── Inspect a past scan ─────────────────────────────────────────────────

  const handleSelectScan = (scan: ScanRecord) => {
    setActiveAnalysis({
      id: scan.id,
      result: scan.result,
      originalContent: scan.contentPreview,
      sourceType: scan.sourceType,
    });
    setCurrentView("result");
  };

  // ─── Delete a single scan ─────────────────────────────────────────────────

  const handleDeleteScan = async (scanId: string) => {
    try {
      await fetch(`/api/v1/scans/${scanId}`, { method: "DELETE" });
      setScans(prev => prev.filter(s => s.id !== scanId));
    } catch (e) {
      console.error("[APP] Failed to delete scan:", (e as Error).message);
    }
  };

  // ─── Purge all scans (history) ────────────────────────────────────────────

  const handlePurgeHistory = async () => {
    try {
      const res = await fetch("/api/v1/scans", { method: "DELETE" });
      if (res.ok) {
        setScans([]);
      }
    } catch (e) {
      console.error("[APP] Failed to purge scans:", (e as Error).message);
    }
  };

  // ─── Seed grounding knowledge base ───────────────────────────────────────

  const handleSeedDatabase = async () => {
    try {
      const response = await fetch("/api/v1/knowledge/seed", { method: "POST" });
      if (!response.ok) throw new Error("Failed to seed grounding library");
    } catch (e: any) {
      console.warn("Seeding grounding library failed:", e.message);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const renderActiveView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            scans={scans}
            onNavigateToUpload={() => setCurrentView("upload")}
            onNavigateToKnowledge={() => setCurrentView("knowledge")}
            onSeedKnowledge={handleSeedDatabase}
            onSelectScan={handleSelectScan}
          />
        );
      case "upload":
        return <UploadCenter onAnalysisComplete={handleAnalysisComplete} />;
      case "history":
        return (
          <History
            scans={scans}
            onSelectScan={handleSelectScan}
            onDeleteScan={handleDeleteScan}
            onClearHistory={handlePurgeHistory}
            isLoading={scansLoading}
          />
        );
      case "analytics":
        return <Analytics />;
      case "knowledge":
        return <KnowledgeBase />;
      case "result":
        if (!activeAnalysis) {
          setCurrentView("dashboard");
          return null;
        }
        return (
          <AnalysisResultView
            id={activeAnalysis.id}
            result={activeAnalysis.result}
            originalContent={activeAnalysis.originalContent}
            sourceType={activeAnalysis.sourceType}
            onBack={() => setCurrentView("dashboard")}
          />
        );
      default:
        return null;
    }
  };

  // Landing Page view requires no surrounding sidebar
  if (currentView === "landing") {
    return (
      <LandingPage
        onStartScanning={() => setCurrentView("upload")}
        onNavigateToDashboard={() => setCurrentView("dashboard")}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-cyber-bg text-cyber-text overflow-x-hidden font-sans relative">
      <ParticlesBackground />

      {/* Background neon floating circles */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Responsive Sidebar Left Rail */}
      <Sidebar
        currentView={currentView === "result" ? "upload" : currentView}
        onViewChange={(view) => {
          setActiveAnalysis(null);
          setCurrentView(view);
        }}
        onBackToLanding={() => setCurrentView("landing")}
      />

      {/* Master Content Frame */}
      <main className="flex-1 p-4 md:p-8 relative overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}
