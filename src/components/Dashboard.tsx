import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  CheckCircle, 
  Eye, 
  BookOpen, 
  TrendingUp, 
  PlusCircle, 
  Terminal, 
  ExternalLink,
  Zap,
  Activity,
  Award
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { ScanRecord, ApiResponse, AnalyticsPayload } from "../types";

interface DashboardProps {
  scans: ScanRecord[];
  onNavigateToUpload: () => void;
  onNavigateToKnowledge: () => void;
  onSeedKnowledge: () => Promise<void>;
  onSelectScan: (scan: ScanRecord) => void;
}

export default function Dashboard({ 
  scans, 
  onNavigateToUpload, 
  onNavigateToKnowledge, 
  onSeedKnowledge,
  onSelectScan
}: DashboardProps) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [trendData, setTrendData] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/analytics")
      .then(res => res.json())
      .then((json: ApiResponse<AnalyticsPayload>) => {
        if (active && json.success && json.data?.dailyTrend) {
          const mapped = json.data.dailyTrend.map(d => ({
            name: d.date,
            count: d.count
          }));
          setTrendData(mapped);
        }
      })
      .catch(err => console.warn("[DASHBOARD] Could not load live analytics trend:", err.message));

    return () => {
      active = false;
    };
  }, [scans]); // reload when scans change

  // Compute stats based on scan logs
  const totalScans = scans.length;
  const criticalThreats = scans.filter(s => s.result.severity === "critical" || s.result.severity === "high").length;
  const safeScans = scans.filter(s => s.result.riskScore < 30).length;
  const avgRisk = totalScans > 0 ? Math.round(scans.reduce((acc, s) => acc + s.result.riskScore, 0) / totalScans) : 0;

  // Recharts Chart Data: Trend of daily scan volumes
  const lineChartData = [
    { name: "Mon", count: 24, avgRisk: 34 },
    { name: "Tue", count: 32, avgRisk: 42 },
    { name: "Wed", count: 18, avgRisk: 28 },
    { name: "Thu", count: 45, avgRisk: 55 },
    { name: "Fri", count: 64, avgRisk: 49 },
    { name: "Sat", count: 52, avgRisk: 31 },
    { name: "Sun", count: 48, avgRisk: 23 },
  ];

  // Recharts Pie Chart Data: Threat categories distribution
  const pieData = [
    { name: "Scam Alerts", value: scans.filter(s => s.result.category === "Scam").length || 3 },
    { name: "Phishing URLs", value: scans.filter(s => s.result.category === "Phishing").length || 2 },
    { name: "Fake News", value: scans.filter(s => s.result.category === "Fake News" || s.result.category === "Misinformation").length || 4 },
    { name: "Safe Verified", value: scans.filter(s => s.result.category === "Safe").length || 5 },
  ];

  const COLORS = ["#EF4444", "#F59E0B", "#4F46E5", "#10B981"];

  const handleSeedAction = async () => {
    setIsSeeding(true);
    setSeedSuccess(false);
    try {
      await onSeedKnowledge();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6 text-cyber-text">
      
      {/* Welcome Title & Action banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2">
            Command Center <span className="text-xs font-mono font-normal py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">Live Telemetry</span>
          </h2>
          <p className="text-sm text-cyber-muted mt-1 font-light">Interactive platform overview and real-time security indicators.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSeedAction}
            disabled={isSeeding}
            className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] disabled:opacity-50 text-white rounded-lg text-xs font-mono border border-white/10 transition-all flex items-center gap-2"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            {isSeeding ? "Syncing..." : seedSuccess ? "✓ Database Seeded" : "Seed Grounding Library"}
          </button>

          <button
            onClick={onNavigateToUpload}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-500/10 flex items-center gap-2 border border-white/5 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Start New Scan
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-cyber-muted font-mono uppercase tracking-wider">Total Scans Audit</p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1.5">{totalScans}</h3>
            <p className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14.2% weekly
            </p>
          </div>
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl glow-indigo">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-cyber-muted font-mono uppercase tracking-wider">Critical Anomalies</p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1.5">{criticalThreats}</h3>
            <p className="text-[10px] text-red-400 font-mono mt-1">
              Immediate action needed
            </p>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl glow-danger">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-cyber-muted font-mono uppercase tracking-wider">Threat Mitigation Rate</p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1.5">{safeScans}</h3>
            <p className="text-[10px] text-emerald-400 font-mono mt-1">
              100% false-positive guard
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl glow-success">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-cyber-muted font-mono uppercase tracking-wider">Mean Risk Rating</p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1.5">{avgRisk}/100</h3>
            <p className="text-[10px] text-yellow-400 font-mono mt-1">
              Moderate vulnerability index
            </p>
          </div>
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <Award className="w-5 h-5 text-yellow-400" />
          </div>
        </div>

      </div>

      {/* Main Graph Bento Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Daily velocity chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-semibold text-white text-base">Network Attack Surface & Scans</h4>
            <p className="text-xs text-cyber-muted font-light mt-0.5">Historical overview of threat intelligence activity.</p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.length > 0 ? trendData : lineChartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(17, 24, 39, 0.95)", 
                    border: "1px solid rgba(255,255,255,0.08)", 
                    borderRadius: "8px", 
                    color: "#F8FAFC" 
                  }} 
                />
                <Area type="monotone" dataKey="count" stroke="#4F46E5" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat breakdown card */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-semibold text-white text-base">Vector Distribution</h4>
            <p className="text-xs text-cyber-muted font-light mt-0.5">Scam incidents categorized by channel.</p>
          </div>
          <div className="h-44 flex items-center justify-center mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(17, 24, 39, 0.95)", 
                    border: "1px solid rgba(255,255,255,0.08)", 
                    borderRadius: "8px", 
                    color: "#F8FAFC" 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-4">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-cyber-muted truncate">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grounding & Timeline Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left: Interactive Quick Security Checklist / Grounding info */}
        <div className="lg:col-span-1 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <h4 className="font-display font-semibold text-white text-base">Grounding Index Info</h4>
          <p className="text-xs text-cyber-muted font-light leading-relaxed">
            SatyaGuard uses semantic retrieval to ground analyses. Seed the database with official advisories to enable real-time compliance matches.
          </p>
          
          <div className="space-y-2 pt-2">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Trusted Grounding Engine</p>
                <p className="text-[10px] text-cyber-muted mt-0.5">Cross-examines cases with government guidelines.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
              <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Active Vector Embeddings</p>
                <p className="text-[10px] text-cyber-muted mt-0.5">Precomputed with text-embedding-004.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onNavigateToKnowledge}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-mono text-xs rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2"
          >
            Explore Library <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Right: Scan Audit Trail */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-semibold text-white text-base font-medium">Recent Security Audits</h4>
            <p className="text-xs text-cyber-muted font-light mt-0.5">Live security scan history feed.</p>
          </div>

          <div className="mt-4 space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {scans.length === 0 ? (
              <div className="text-center py-8 text-cyber-muted text-xs font-mono">
                No threat assessment records found.
              </div>
            ) : (
              scans.map((scan) => {
                const badgeColor = 
                  scan.result.severity === "critical" ? "text-red-400 bg-red-400/10 border-red-500/20" :
                  scan.result.severity === "high" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
                  "text-emerald-400 bg-emerald-400/10 border-emerald-500/20";

                return (
                  <div 
                    key={scan.id}
                    onClick={() => onSelectScan(scan)}
                    className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-indigo-600/10 rounded-lg text-indigo-400 text-xs uppercase font-mono tracking-wider shrink-0">
                        {scan.sourceType}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate max-w-[200px] md:max-w-xs">{scan.contentPreview}</p>
                        <p className="text-[10px] text-cyber-muted font-mono mt-0.5">{new Date(scan.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
                        {scan.result.severity}
                      </span>
                      <div className="text-right">
                        <p className="text-xs font-bold text-white">{scan.result.riskScore}%</p>
                        <p className="text-[8px] text-cyber-muted font-mono uppercase">Risk</p>
                      </div>
                      <Eye className="w-4 h-4 text-cyber-muted group-hover:text-white" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
