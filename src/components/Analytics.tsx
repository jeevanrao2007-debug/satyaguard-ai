import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Award,
  Zap,
  Info,
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { AnalyticsPayload, ApiResponse } from "../types";

// ─── Colour palettes (unchanged from original) ────────────────────────────────

const CATEGORY_COLORS = ["#EF4444", "#F59E0B", "#4F46E5", "#06B6D4", "#10B981", "#A855F7", "#F97316"];
const CHANNEL_COLORS = { text: "#4F46E5", image: "#06B6D4", audio: "#10B981" };

// ─── Component ────────────────────────────────────────────────────────────────

export default function Analytics() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/analytics");
      const json: ApiResponse<AnalyticsPayload> = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || `API error (status ${res.status})`);
      }
      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 text-cyber-text pb-12">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2">
            Analytics Suite <span className="text-xs font-mono font-normal py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">Advanced Telemetry</span>
          </h2>
          <p className="text-sm text-cyber-muted mt-1 font-light">Interactive reporting charts tracking security intelligence vector distribution and attack curves.</p>
        </div>
        <div className="py-24 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs font-mono text-cyber-muted">Aggregating telemetry from Firestore...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="space-y-6 text-cyber-text pb-12">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2">
            Analytics Suite <span className="text-xs font-mono font-normal py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">Advanced Telemetry</span>
          </h2>
        </div>
        <div className="py-16 flex flex-col items-center gap-4 glass-panel rounded-2xl border border-white/5 p-8">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-white">Failed to load analytics</p>
            <p className="text-xs text-cyber-muted font-mono max-w-sm">{error}</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="mt-2 px-5 py-2 flex items-center gap-2 text-xs font-mono bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-white rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Empty database state ─────────────────────────────────────────────────

  const isEmpty = data && data.totalScans === 0;

  // ── Derived chart data ───────────────────────────────────────────────────

  // Area chart: daily trend (last 14 days)
  const areaData = data?.dailyTrend.map(d => ({
    day: d.date,
    total: d.count,
  })) ?? [];

  // Channels pie chart
  const channelsData = data
    ? [
        { name: "Text Message", value: data.scanTypes.text, color: CHANNEL_COLORS.text },
        { name: "Image Screen", value: data.scanTypes.image, color: CHANNEL_COLORS.image },
        { name: "Audio Stream", value: data.scanTypes.audio, color: CHANNEL_COLORS.audio },
      ]
    : [];
  const channelsTotal = channelsData.reduce((s, c) => s + c.value, 0);

  // Category bar chart
  const categoryData = (data?.categories ?? []).slice(0, 7).map((c, i) => ({
    name: c.name,
    value: c.count,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  // Average confidence formatted as percentage
  const avgConfidenceDisplay = data ? `${data.averageConfidence}%` : "—";

  return (
    <div className="space-y-6 text-cyber-text pb-12">

      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2">
            Analytics Suite <span className="text-xs font-mono font-normal py-1 px-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">Advanced Telemetry</span>
          </h2>
          <p className="text-sm text-cyber-muted mt-1 font-light">Interactive reporting charts tracking security intelligence vector distribution and attack curves.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-mono bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-cyber-muted hover:text-white rounded-lg transition-all shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Top statistics indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-5 rounded-2xl glass-panel border border-white/5 bg-white/[0.01]">
          <p className="text-xs text-cyber-muted font-mono uppercase tracking-wider">Total Scans</p>
          <div className="flex justify-between items-baseline mt-2">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {isEmpty ? "0" : (data?.totalScans ?? "—").toLocaleString()}
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
              <Activity className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-[9px] text-cyber-muted font-mono mt-1">
            {data?.todayScans ?? 0} scans today
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 bg-white/[0.01]">
          <p className="text-xs text-cyber-muted font-mono uppercase tracking-wider">High Risk Scans</p>
          <div className="flex justify-between items-baseline mt-2">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {data?.highRiskScans ?? 0}
            </h3>
            <span className="text-[10px] text-red-400 font-mono flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" /> Critical+High
            </span>
          </div>
          <p className="text-[9px] text-cyber-muted font-mono mt-1">Immediate action needed</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 bg-white/[0.01]">
          <p className="text-xs text-cyber-muted font-mono uppercase tracking-wider">Avg Risk Score</p>
          <div className="flex justify-between items-baseline mt-2">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {data?.averageRiskScore ?? 0}/100
            </h3>
            <span className="text-[10px] text-indigo-300 font-mono flex items-center gap-0.5">
              <Zap className="w-3 h-3 animate-pulse" /> Computed
            </span>
          </div>
          <p className="text-[9px] text-cyber-muted font-mono mt-1">Across all scan types</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-white/5 bg-white/[0.01]">
          <p className="text-xs text-cyber-muted font-mono uppercase tracking-wider">Avg Confidence</p>
          <div className="flex justify-between items-baseline mt-2">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {avgConfidenceDisplay}
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Stable
            </span>
          </div>
          <p className="text-[9px] text-cyber-muted font-mono mt-1">AI classification confidence</p>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Daily trend area chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div>
            <h4 className="font-display font-semibold text-white text-base">Daily Scan Activity (Last 14 Days)</h4>
            <p className="text-xs text-cyber-muted font-light mt-0.5">Log frequency of all AI threat assessments over time.</p>
          </div>

          <div className="h-72 mt-4">
            {isEmpty ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-cyber-muted">
                <Activity className="w-8 h-8 opacity-30" />
                <p className="text-xs font-mono">No scan data yet. Run your first scan.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#F8FAFC"
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" name="Total Scans" dataKey="total" stroke="#4F46E5" fillOpacity={1} fill="url(#totalColor)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Media channels distribution */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div>
            <h4 className="font-display font-semibold text-white text-base">Incident Channels</h4>
            <p className="text-xs text-cyber-muted font-light mt-0.5">Breakdown of threat vectors across uploaded media types.</p>
          </div>

          <div className="h-56 flex items-center justify-center">
            {isEmpty ? (
              <div className="flex flex-col items-center gap-2 text-cyber-muted">
                <PieChart className="w-8 h-8 opacity-30" />
                <p className="text-xs font-mono">No data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {channelsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            {channelsData.map((c, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-cyber-muted">{c.name}</span>
                </div>
                <span className="text-white font-bold">
                  {c.value} ({channelsTotal > 0 ? ((c.value / channelsTotal) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: Category bar chart + Compliance block */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Threat category bar chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 space-y-4">
          <div>
            <h4 className="font-display font-semibold text-white text-base">Specific Threat Classifications</h4>
            <p className="text-xs text-cyber-muted font-light mt-0.5">Classification quantities detected and mitigated by Gemini decision trees.</p>
          </div>

          <div className="h-64 mt-4">
            {isEmpty || categoryData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-cyber-muted">
                <Award className="w-8 h-8 opacity-30" />
                <p className="text-xs font-mono">No classifications yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#F8FAFC"
                    }}
                  />
                  <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Severity distribution + Compliance block */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-semibold text-white text-base">Severity Distribution</h4>
            <p className="text-xs text-cyber-muted font-light mt-0.5">Breakdown by threat severity level.</p>
          </div>

          <div className="space-y-2.5 pt-2">
            {[
              { key: "critical", label: "Critical", color: "bg-red-500", textColor: "text-red-400" },
              { key: "high",     label: "High",     color: "bg-amber-500", textColor: "text-amber-400" },
              { key: "medium",   label: "Medium",   color: "bg-indigo-500", textColor: "text-indigo-400" },
              { key: "low",      label: "Low",      color: "bg-emerald-500", textColor: "text-emerald-400" },
            ].map(({ key, label, color, textColor }) => {
              const count = data?.severityDistribution[key as keyof typeof data.severityDistribution] ?? 0;
              const total = data?.totalScans || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className={textColor}>{label}</span>
                    <span className="text-white">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h5 className="text-xs font-semibold text-white">HIPAA &amp; GDPR Standards</h5>
                <p className="text-[10px] text-cyber-muted mt-0.5">All customer inputs are hashed in-memory and never stored on persistent disks unless explicitly authorized.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
              <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <h5 className="text-xs font-semibold text-white">Cross-Referencing</h5>
                <p className="text-[10px] text-cyber-muted mt-0.5">We maintain an active synchronization daemon linking latest news feeds from National Cybercrime departments.</p>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-center text-cyber-muted bg-white/5 py-2.5 rounded-xl border border-white/5">
            Integrity Key: <span className="text-white">HMAC_256_ACTIVE</span>
          </div>
        </div>

      </div>

    </div>
  );
}
