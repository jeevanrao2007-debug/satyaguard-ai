import { FirebaseService } from "./firebaseService";
import { VectorService } from "./vectorService";
import { AppError } from "../middleware/errorHandler";

export interface KnowledgeChunkInput {
  title: string;
  text: string;
  sourceUrl: string;
}

export interface GroundingSource {
  title: string;
  sourceUrl: string;
  text: string;
  similarity: number;
}

interface InMemoryChunk {
  id: string;
  title: string;
  text: string;
  sourceUrl: string;
  embedding?: number[];
  createdAt: string;
}

export class GroundingService {
  private static COLLECTION_NAME = "knowledge";
  private static inMemoryStore: InMemoryChunk[] = [];
  private static isInitializedInMemory = false;

  private static initializeInMemory() {
    if (this.isInitializedInMemory) return;
    const defaultBulletins = [
      {
        title: "Advisory on UPI Payment Request Scams",
        sourceUrl: "https://cybercrime.gov.in/Webform/UPI_Advisory.aspx",
        text: "Fraudsters send unsolicited 'Request Money' requests on UPI apps like GPay, PhonePe, or Paytm pretending to be buyers, lottery coordinators, or customer support officers. UPI PIN is only required to SEND money, never to RECEIVE money. If a prompt asks for your PIN to receive money, it is a guaranteed scam."
      },
      {
        title: "Federal Warning on AI Voice Cloning Impersonation",
        sourceUrl: "https://www.fcc.gov/voice-cloning-scam-advisory",
        text: "AI Voice Cloning technology allows bad actors to synthesize a realistic clone of a family member, friend, or corporate officer's voice using as little as 3 seconds of audio. Scam calls often utilize these synthetic deepfakes with fake scenarios (accidents, arrests, urgent funds) to extort payments."
      },
      {
        title: "Fact-Check: RBI Financial Support Verification Scheme Fake Messages",
        sourceUrl: "https://www.rbi.org.in/commonman/English/Scripts/PressReleases.aspx",
        text: "The Reserve Bank of India (RBI) does not send text messages or emails regarding financial assistance schemes, lotteries, cash awards, or accounts setup verification. Any message claiming RBI is requesting verification details, OTPs, or processing fees to release funds is fraudulent."
      },
      {
        title: "Emergency Alert on OTP and SIM-Swap Attacks",
        sourceUrl: "https://www.cert-in.org.in/",
        text: "CERT-In warns against SIM-swap attacks and OTP harvesting scams. Fraudsters trick users into providing One-Time Passwords (OTPs) by posing as bank customer support or telecommunication executives upgrading SIM cards. Banks will never ask for your passwords, OTPs, or CVV numbers."
      }
    ];

    this.inMemoryStore = defaultBulletins.map((b, i) => ({
      id: `mem-${i}`,
      title: b.title,
      text: b.text,
      sourceUrl: b.sourceUrl,
      createdAt: new Date().toISOString()
    }));
    this.isInitializedInMemory = true;
  }

  private static computeKeywordSimilarity(query: string, text: string): number {
    const qWords = new Set(query.toLowerCase().match(/\b\w+\b/g) || []);
    const tWords = new Set(text.toLowerCase().match(/\b\w+\b/g) || []);
    if (qWords.size === 0 || tWords.size === 0) return 0;
    
    let intersection = 0;
    qWords.forEach(word => {
      if (tWords.has(word)) intersection++;
    });
    
    return intersection / Math.sqrt(qWords.size * tWords.size);
  }

  /**
   * Ingests a new trusted security bulletin or advisory into the Firestore knowledge base
   */
  public static async ingestChunk(input: KnowledgeChunkInput): Promise<string> {
    if (!input.title || !input.text || !input.sourceUrl) {
      throw new AppError("All fields (title, text, sourceUrl) are required for knowledge ingestion.", 400);
    }

    if (!FirebaseService.isAvailable()) {
      this.initializeInMemory();
      const id = "mem-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9);
      
      let embedding: number[] | undefined = undefined;
      if (VectorService.isAvailable()) {
        try {
          embedding = await VectorService.generateEmbedding(input.text);
        } catch (e) {
          console.warn("[RAG] Failed to generate embedding during offline ingest:", e);
        }
      }

      this.inMemoryStore.push({
        id,
        title: input.title,
        text: input.text,
        sourceUrl: input.sourceUrl,
        embedding,
        createdAt: new Date().toISOString()
      });
      console.log(`[RAG] Ingested document chunk in memory with ID: ${id}`);
      return id;
    }

    const db = FirebaseService.getDb();
    console.log(`[RAG] Generating embedding vector for trusted document: "${input.title}"`);
    const embedding = await VectorService.generateEmbedding(input.text);

    const docRef = db.collection(this.COLLECTION_NAME).doc();
    await docRef.set({
      title: input.title,
      text: input.text,
      sourceUrl: input.sourceUrl,
      embedding,
      createdAt: new Date().toISOString(),
    });

    console.log(`[RAG] Ingested document chunk with ID: ${docRef.id}`);
    return docRef.id;
  }

  /**
   * Semantically searches the trusted knowledge base to find relevant context for grounding
   */
  public static async retrieveRelevantContext(query: string, limit = 3): Promise<GroundingSource[]> {
    if (!FirebaseService.isAvailable()) {
      this.initializeInMemory();
      console.log(`[RAG] Grounding engine running in offline in-memory fallback mode for query: "${query}"`);
      
      const sources: GroundingSource[] = [];
      const canUseEmbeddings = VectorService.isAvailable();
      let queryEmbedding: number[] = [];
      if (canUseEmbeddings) {
        try {
          queryEmbedding = await VectorService.generateEmbedding(query);
        } catch (err) {
          console.warn("[RAG] Failed to generate query embedding in fallback, using keyword matching:", err);
        }
      }

      for (const data of this.inMemoryStore) {
        let similarity = 0;
        if (queryEmbedding.length > 0 && data.embedding && Array.isArray(data.embedding)) {
          similarity = VectorService.cosineSimilarity(queryEmbedding, data.embedding);
        } else {
          similarity = this.computeKeywordSimilarity(query, data.text + " " + data.title);
        }

        const threshold = (queryEmbedding.length > 0) ? 0.45 : 0.05;
        if (similarity > threshold) {
          sources.push({
            title: data.title,
            sourceUrl: data.sourceUrl,
            text: data.text,
            similarity,
          });
        }
      }

      if (sources.length === 0) {
        return this.inMemoryStore.slice(0, limit).map(doc => ({
          title: doc.title,
          sourceUrl: doc.sourceUrl,
          text: doc.text,
          similarity: 0.1
        }));
      }

      return sources.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
    }

    const db = FirebaseService.getDb();
    console.log(`[RAG] Finding grounding context for query: "${query}"`);
    
    const canUseEmbeddings = VectorService.isAvailable();
    let queryEmbedding: number[] = [];
    if (canUseEmbeddings) {
      try {
        queryEmbedding = await VectorService.generateEmbedding(query);
      } catch (err) {
        console.warn("[RAG] Failed to generate query embedding, using keyword matching:", err);
      }
    }

    // Retrieve all trusted references
    const snapshot = await db.collection(this.COLLECTION_NAME).get();
    const sources: GroundingSource[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      let similarity = 0;
      if (queryEmbedding.length > 0 && data.embedding && Array.isArray(data.embedding)) {
        similarity = VectorService.cosineSimilarity(queryEmbedding, data.embedding);
      } else {
        similarity = this.computeKeywordSimilarity(query, (data.text || "") + " " + (data.title || ""));
      }
      
      const threshold = (queryEmbedding.length > 0) ? 0.45 : 0.05;
      if (similarity > threshold) {
        sources.push({
          title: data.title || "",
          sourceUrl: data.sourceUrl || "",
          text: data.text || "",
          similarity,
        });
      }
    });

    return sources.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }

  /**
   * Helper to format retrieved grounding chunks into a structured prompt context
   */
  public static formatGroundingContext(sources: GroundingSource[]): string {
    if (sources.length === 0) {
      return "No official security advisories or matching public fact-checks found. Rely on standard safe security principles to evaluate.";
    }

    return sources
      .map((src, i) => `[Source ${i + 1}]: "${src.title}" (Link: ${src.sourceUrl})\nContent: ${src.text}`)
      .join("\n\n");
  }
}
