import { FirebaseService } from "./firebaseService";
import { AIAnalysisResult } from "./responseParser";

// ─── Firestore document shape (flat) ────────────────────────────────────────

export interface ScanDocument {
  scanId: string;
  timestamp: string;
  scanType: "text" | "image" | "audio";
  /** For text: the actual text. For image/audio: descriptive label, NEVER binary */
  originalInput: string;
  riskScore: number;
  confidence: number;
  category: string;
  severity: string;
  explanation: string;
  evidence: string[];
  recommendations: string[];
  language: string;
  processingTime: number;
  status: "complete";
}

// ─── Shape returned to the frontend (matches existing ScanRecord type) ───────

export interface ScanRecordAPI {
  id: string;
  userId: string;
  sourceType: "text" | "image" | "audio";
  contentPreview: string;
  createdAt: string;
  result: {
    riskScore: number;
    confidence: number;
    category: string;
    severity: "low" | "medium" | "high" | "critical";
    evidence: string[];
    recommendations: string[];
    explanation: string;
  };
}

export interface ScansPage {
  scans: ScanRecordAPI[];
  total: number;
  page: number;
  limit: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class ScanService {
  private static readonly COLLECTION = "scans";

  /** Persist a completed AI analysis. Never stores binary media data. */
  public static async saveScan(params: {
    scanType: "text" | "image" | "audio";
    originalInput: string;          // text body, or "[Image: mime]", "[Audio: mime]"
    result: AIAnalysisResult;
    language: string;
    processingTime: number;
  }): Promise<string> {
    const { scanType, originalInput, result, language, processingTime } = params;

    if (!FirebaseService.isAvailable()) {
      console.warn("[SCAN_SERVICE] Firestore not configured — scan will not be persisted.");
      return `local-${Date.now()}`;
    }

    const db = FirebaseService.getDb();
    const docRef = db.collection(this.COLLECTION).doc();

    const doc: ScanDocument = {
      scanId: docRef.id,
      timestamp: new Date().toISOString(),
      scanType,
      originalInput,
      riskScore: result.riskScore,
      confidence: result.confidence,
      category: result.category,
      severity: result.severity,
      explanation: result.explanation,
      evidence: result.evidence,
      recommendations: result.recommendations,
      language,
      processingTime,
      status: "complete",
    };

    await docRef.set(doc);
    console.log(`[SCAN_SERVICE] Scan persisted → ${docRef.id} (${scanType}, risk=${result.riskScore})`);
    return docRef.id;
  }

  /**
   * Paginated scan list.
   * Ordering is done in Firestore; all other filters are applied in-memory
   * to avoid requiring composite indexes.
   */
  public static async getScans(params: {
    limit?: number;
    page?: number;
    search?: string;
    category?: string;
    severity?: string;
    scanType?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<ScansPage> {
    const limit = Math.min(params.limit || 20, 100);
    const page = Math.max(params.page || 1, 1);

    if (!FirebaseService.isAvailable()) {
      return { scans: [], total: 0, page, limit };
    }

    const db = FirebaseService.getDb();
    const order = params.sortOrder === "asc" ? "asc" : "desc";

    // Fetch ordered by timestamp; in-memory filters avoid composite-index issues
    const snapshot = await db
      .collection(this.COLLECTION)
      .orderBy("timestamp", order)
      .get();

    let docs: ScanDocument[] = snapshot.docs.map(d => d.data() as ScanDocument);

    // In-memory filters
    if (params.category) {
      docs = docs.filter(d => d.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params.severity) {
      docs = docs.filter(d => d.severity.toLowerCase() === params.severity!.toLowerCase());
    }
    if (params.scanType) {
      docs = docs.filter(d => d.scanType === params.scanType);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      docs = docs.filter(
        d =>
          d.originalInput.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.explanation.toLowerCase().includes(q)
      );
    }

    const total = docs.length;
    const start = (page - 1) * limit;
    const paged = docs.slice(start, start + limit);

    return {
      scans: paged.map(this.toScanRecordAPI),
      total,
      page,
      limit,
    };
  }

  /** Return a single scan by Firestore document ID. */
  public static async getScanById(id: string): Promise<ScanRecordAPI | null> {
    if (!FirebaseService.isAvailable()) return null;

    const db = FirebaseService.getDb();
    const doc = await db.collection(this.COLLECTION).doc(id).get();

    if (!doc.exists) return null;
    return this.toScanRecordAPI(doc.data() as ScanDocument);
  }

  /** Hard-delete a single scan document. */
  public static async deleteScan(id: string): Promise<void> {
    if (!FirebaseService.isAvailable()) return;
    const db = FirebaseService.getDb();
    await db.collection(this.COLLECTION).doc(id).delete();
    console.log(`[SCAN_SERVICE] Deleted scan → ${id}`);
  }

  /** Delete all scans from the collection. */
  public static async purgeAllScans(): Promise<void> {
    if (!FirebaseService.isAvailable()) return;
    const db = FirebaseService.getDb();
    const snapshot = await db.collection(this.COLLECTION).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`[SCAN_SERVICE] Purged all scans (${snapshot.size} documents)`);
  }

  // ─── Private mapper ────────────────────────────────────────────────────────

  private static toScanRecordAPI(doc: ScanDocument): ScanRecordAPI {
    const preview =
      doc.originalInput.length > 80
        ? `${doc.originalInput.substring(0, 80)}...`
        : doc.originalInput;

    return {
      id: doc.scanId,
      userId: "system",
      sourceType: doc.scanType,
      contentPreview: preview,
      createdAt: doc.timestamp,
      result: {
        riskScore: doc.riskScore,
        confidence: doc.confidence,
        category: doc.category,
        severity: doc.severity as "low" | "medium" | "high" | "critical",
        evidence: doc.evidence,
        recommendations: doc.recommendations,
        explanation: doc.explanation,
      },
    };
  }
}
