import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Calendar, 
  Trash2, 
  Eye, 
  ShieldAlert, 
  FileText, 
  Image as ImageIcon, 
  Volume2, 
  ChevronLeft, 
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { ScanRecord } from "../types";

interface HistoryProps {
  scans: ScanRecord[];
  onSelectScan: (scan: ScanRecord) => void;
  onDeleteScan?: (scanId: string) => void;
  onClearHistory?: () => void;
  isLoading?: boolean;
}

export default function History({ scans, onSelectScan, onDeleteScan, onClearHistory, isLoading }: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "text" | "image" | "audio">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter scans
  const filteredScans = scans.filter((scan) => {
    const matchesSearch = 
      scan.contentPreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.result.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.result.explanation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "all" || scan.sourceType === selectedType;

    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredScans.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedScans = filteredScans.slice(startIndex, startIndex + itemsPerPage);

  const getSourceIcon = (type: "text" | "image" | "audio") => {
    switch (type) {
      case "text": return <FileText className="w-4 h-4 text-indigo-400" />;
      case "image": return <ImageIcon className="w-4 h-4 text-cyan-400" />;
      case "audio": return <Volume2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getSeverityBadge = (severity: "low" | "medium" | "high" | "critical") => {
    switch (severity) {
      case "critical": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "high": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "medium": return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
      case "low": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  return (
    <div className="space-y-6 text-cyber-text">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2">
            Audit Logs <span className="text-xs font-mono font-normal py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">Historical Scans</span>
          </h2>
          <p className="text-sm text-cyber-muted mt-1 font-light">Immutable catalog of past risk reports and diagnostic evidence.</p>
        </div>

        {onClearHistory && scans.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3.5 py-1.5 text-xs font-mono text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600/20 rounded-lg border border-red-500/20 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Purge Logs
          </button>
        )}
      </div>

      {/* Filter Row: Search & Tabs */}
      <div className="grid md:grid-cols-3 gap-4 items-center">
        
        {/* Search input */}
        <div className="md:col-span-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search key indicators or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/5 focus:border-indigo-500/30 text-sm text-white placeholder-cyber-muted focus:outline-none focus:ring-1 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        {/* Tab filters */}
        <div className="md:col-span-2 flex p-1 rounded-xl glass-panel border border-white/5 bg-black/20 w-fit justify-self-start md:justify-self-end">
          {(["all", "text", "image", "audio"] as const).map((type) => (
            <button
              key={type}
              onClick={() => { setSelectedType(type); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-xs font-medium uppercase font-mono transition-all ${
                selectedType === type ? "bg-white/10 text-white font-semibold" : "text-cyber-muted hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

      </div>

      {/* Main Logs Table / Cards */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-cyber-muted font-mono">Loading audit records...</p>
          </div>
        ) : paginatedScans.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-cyber-muted mx-auto animate-pulse" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">No diagnostic logs match your filter criteria.</p>
              <p className="text-xs text-cyber-muted max-w-sm mx-auto font-light leading-relaxed">
                Try revising your keywords or perform a new scanning sequence inside the Core Scanner.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {paginatedScans.map((scan) => (
              <div 
                key={scan.id}
                onClick={() => onSelectScan(scan)}
                className="p-4 sm:p-5 hover:bg-white/[0.02] active:bg-white/[0.04] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
              >
                
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-200">
                    {getSourceIcon(scan.sourceType)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-white truncate max-w-[240px] md:max-w-md">{scan.contentPreview}</p>
                      <span className="text-[10px] text-cyber-muted font-mono uppercase bg-white/5 px-2 py-0.25 rounded border border-white/5">
                        {scan.result.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-cyber-muted font-mono mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(scan.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${getSeverityBadge(scan.result.severity)}`}>
                      {scan.result.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{scan.result.riskScore}%</p>
                      <p className="text-[8px] text-cyber-muted font-mono uppercase">Risk Level</p>
                    </div>

                    {onDeleteScan && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteScan(scan.id); }}
                        className="p-2 bg-white/5 rounded-lg border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-cyber-muted hover:text-red-400"
                        title="Delete scan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/20 transition-all text-cyber-muted group-hover:text-white">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Panel */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <p className="text-xs text-cyber-muted font-mono">
            Showing <span className="text-white">{startIndex + 1}</span> to <span className="text-white">{Math.min(filteredScans.length, startIndex + itemsPerPage)}</span> of <span className="text-white">{filteredScans.length}</span> audit records
          </p>

          <div className="flex gap-2 font-mono">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 disabled:opacity-30 text-white border border-white/5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 disabled:opacity-30 text-white border border-white/5 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
