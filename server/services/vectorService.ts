import { GoogleGenAI } from "@google/genai";
import { config } from "../config/config";
import { AppError } from "../middleware/errorHandler";
import { AIErrorHandler } from "./aiErrorHandler";

export class VectorService {
  private static aiClient: GoogleGenAI | null = null;
  private static EMBEDDING_MODEL = "gemini-embedding-2";

  public static isAvailable(): boolean {
    return !!config.geminiApiKey;
  }

  private static getClient(): GoogleGenAI {
    if (!this.aiClient) {
      const apiKey = config.geminiApiKey;
      if (!apiKey) {
        throw new AppError(
          "GEMINI_API_KEY environment variable is not configured. Please add it to your secrets panel.",
          503,
          { code: "AI_KEY_MISSING" }
        );
      }
      this.aiClient = new GoogleGenAI({ apiKey });
    }
    return this.aiClient;
  }

  /**
   * Generates a high-dimensional vector embedding for the given text chunk or query
   */
  public static async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim() === "") {
      throw new AppError("Content for embedding generation cannot be empty.", 400);
    }

    const client = this.getClient();

    try {
      const response = await client.models.embedContent({
        model: this.EMBEDDING_MODEL,
        contents: text,
      });

      const anyResponse = response as any;
      const values = anyResponse.embedding?.values || anyResponse.embeddings?.values || anyResponse.embeddings?.[0]?.values;

      if (!values || !Array.isArray(values)) {
        throw new Error("No embedding values returned from the Vertex AI model.");
      }

      return values;
    } catch (error) {
      return AIErrorHandler.handle(error);
    }
  }

  /**
   * Computes the cosine similarity between two numeric vectors
   */
  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
