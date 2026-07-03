export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  metadata?: Record<string, any>;
}

export interface ScansPage {
  scans: ScanRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface AnalyticsPayload {
  totalScans: number;
  todayScans: number;
  highRiskScans: number;
  averageRiskScore: number;
  averageConfidence: number;
  scanTypes: { text: number; image: number; audio: number };
  categories: { name: string; count: number }[];
  severityDistribution: { low: number; medium: number; high: number; critical: number };
  dailyTrend: { date: string; count: number }[];
}

export interface AnalysisResult {
  riskScore: number;
  confidence: number;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  evidence: string[];
  recommendations: string[];
  explanation: string;
}

export interface ScanRecord {
  id: string;
  userId: string;
  sourceType: "text" | "image" | "audio";
  contentPreview: string;
  result: AnalysisResult;
  createdAt: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  sourceUrl: string;
  text: string;
  category: "UPI Scam" | "AI Voice Clone" | "Banking Fraud" | "OTP Theft" | "General Safety";
  createdAt: string;
}
