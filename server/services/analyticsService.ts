import { FirebaseService } from "./firebaseService";
import { ScanDocument } from "./scanService";

// ─── Returned payload shape ───────────────────────────────────────────────────

export interface CategoryStat {
  name: string;
  count: number;
}

export interface DailyTrendPoint {
  date: string;   // "Jun 28" format for chart labels
  count: number;
}

export interface AnalyticsPayload {
  totalScans: number;
  todayScans: number;
  highRiskScans: number;
  averageRiskScore: number;
  averageConfidence: number;
  scanTypes: {
    text: number;
    image: number;
    audio: number;
  };
  categories: CategoryStat[];
  severityDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  dailyTrend: DailyTrendPoint[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class AnalyticsService {
  private static readonly COLLECTION = "scans";

  /**
   * Reads all scan documents from Firestore and computes aggregate analytics.
   * All calculations are done in-memory from raw Firestore data — no separate
   * analytics collection needed.
   */
  public static async getAnalytics(): Promise<AnalyticsPayload> {
    // If Firebase is not configured, return a zeroed payload
    if (!FirebaseService.isAvailable()) {
      return AnalyticsService.emptyPayload();
    }

    const db = FirebaseService.getDb();
    const snapshot = await db
      .collection(this.COLLECTION)
      .orderBy("timestamp", "desc")
      .get();

    const docs: ScanDocument[] = snapshot.docs.map(d => d.data() as ScanDocument);

    if (docs.length === 0) {
      return AnalyticsService.emptyPayload();
    }

    // ── Basic aggregates ───────────────────────────────────────────────────

    const totalScans = docs.length;

    // "Today" relative to current UTC date
    const todayPrefix = new Date().toISOString().substring(0, 10); // "2024-06-29"
    const todayScans = docs.filter(d => d.timestamp.startsWith(todayPrefix)).length;

    const highRiskScans = docs.filter(
      d => d.severity === "high" || d.severity === "critical"
    ).length;

    const averageRiskScore =
      Math.round(docs.reduce((acc, d) => acc + (d.riskScore || 0), 0) / totalScans);

    const averageConfidence =
      Math.round(
        (docs.reduce((acc, d) => acc + (d.confidence || 0), 0) / totalScans) * 100
      );

    // ── Scan type distribution ─────────────────────────────────────────────

    const scanTypes = { text: 0, image: 0, audio: 0 };
    for (const d of docs) {
      if (d.scanType === "text") scanTypes.text++;
      else if (d.scanType === "image") scanTypes.image++;
      else if (d.scanType === "audio") scanTypes.audio++;
    }

    // ── Category breakdown ────────────────────────────────────────────────

    const categoryMap: Record<string, number> = {};
    for (const d of docs) {
      const cat = d.category || "Unknown";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    }
    const categories: CategoryStat[] = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // ── Severity distribution ────────────────────────────────────────────

    const severityDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const d of docs) {
      const s = d.severity as keyof typeof severityDistribution;
      if (s in severityDistribution) severityDistribution[s]++;
    }

    // ── Daily trend (last 14 days) ────────────────────────────────────────

    const dailyTrend = AnalyticsService.buildDailyTrend(docs, 14);

    return {
      totalScans,
      todayScans,
      highRiskScans,
      averageRiskScore,
      averageConfidence,
      scanTypes,
      categories,
      severityDistribution,
      dailyTrend,
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Builds an array of {date, count} for the last N days, in ascending order. */
  private static buildDailyTrend(docs: ScanDocument[], days: number): DailyTrendPoint[] {
    const countByDate: Record<string, number> = {};

    // Pre-fill the last N days with zero counts
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); // "Jun 29"
      const key = d.toISOString().substring(0, 10); // "2024-06-29"
      countByDate[key] = 0;
    }

    for (const doc of docs) {
      const key = doc.timestamp.substring(0, 10);
      if (key in countByDate) {
        countByDate[key]++;
      }
    }

    // Map back to labeled points
    return Object.entries(countByDate).map(([isoDate, count]) => {
      const d = new Date(isoDate + "T12:00:00Z");
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { date: label, count };
    });
  }

  private static emptyPayload(): AnalyticsPayload {
    // Build a 14-day trend with all zeroes for an empty DB
    const dailyTrend: DailyTrendPoint[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyTrend.push({ date: label, count: 0 });
    }

    return {
      totalScans: 0,
      todayScans: 0,
      highRiskScans: 0,
      averageRiskScore: 0,
      averageConfidence: 0,
      scanTypes: { text: 0, image: 0, audio: 0 },
      categories: [],
      severityDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      dailyTrend,
    };
  }
}
