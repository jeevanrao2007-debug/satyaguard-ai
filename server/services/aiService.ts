import { GoogleGenAI } from "@google/genai";
import { config } from "../config/config";
import { PromptService } from "./promptService";
import { ResponseParser, AIAnalysisResult } from "./responseParser";
import { AIErrorHandler } from "./aiErrorHandler";
import { retryWithBackoff } from "./retryHandler";
import { AppError } from "../middleware/errorHandler";
import { GroundingService } from "./groundingService";

export class AIService {
  private static aiClient: GoogleGenAI | null = null;
  private static MODEL_NAME = "gemini-2.5-flash";

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
   * Analyzes text content for potential security and trust vulnerabilities using grounding
   */
  public static async analyzeText(text: string, language = "English"): Promise<AIAnalysisResult> {
    if (!text || text.trim() === "") {
      throw new AppError("Text content to analyze cannot be empty.", 400);
    }

    const client = this.getClient();
    
    // Retrieve grounding context semantically from local/Firestore security bulletins
    let groundingContext = "No specific official advisories matched this inquiry. Use general safety metrics.";
    try {
      const sources = await GroundingService.retrieveRelevantContext(text);
      groundingContext = GroundingService.formatGroundingContext(sources);
    } catch (e: any) {
      console.warn(`[AI_SERVICE] Grounding engine offline or Firestore uninitialized: ${e.message}`);
    }

    const prompt = PromptService.getTextAnalysisPrompt(text, groundingContext, language);

    return retryWithBackoff(async () => {
      try {
        const response = await client.models.generateContent({
          model: this.MODEL_NAME,
          contents: prompt,
          config: {
            systemInstruction: PromptService.getSystemInstruction(),
            responseMimeType: "application/json",
            temperature: 0.1, // low temperature for consistent classification
          },
        });

        const rawText = response.text || "";
        return ResponseParser.parse(rawText);
      } catch (error) {
        return AIErrorHandler.handle(error);
      }
    });
  }

  /**
   * Analyzes image (base64) for visual manipulations, OCR text extraction, and fake news signals with grounding
   */
  public static async analyzeImage(base64Data: string, mimeType: string, language = "English"): Promise<AIAnalysisResult> {
    if (!base64Data) {
      throw new AppError("Image data must be provided as base64 format.", 400);
    }

    const client = this.getClient();

    // Retrieve general image scan warning grounding context
    let groundingContext = "No specific official advisories matched this inquiry. Use general safety metrics.";
    try {
      const sources = await GroundingService.retrieveRelevantContext("image scam phishing forged QR code logo manipulation fake offer screenshot WhatsApp forward");
      groundingContext = GroundingService.formatGroundingContext(sources);
    } catch (e: any) {
      console.warn(`[AI_SERVICE] Grounding engine offline or Firestore uninitialized: ${e.message}`);
    }

    const prompt = PromptService.getImageAnalysisPrompt(groundingContext, language);

    return retryWithBackoff(async () => {
      try {
        const response = await client.models.generateContent({
          model: this.MODEL_NAME,
          contents: [
            prompt,
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ],
          config: {
            systemInstruction: PromptService.getSystemInstruction(),
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        const rawText = response.text || "";
        return ResponseParser.parse(rawText);
      } catch (error) {
        return AIErrorHandler.handle(error);
      }
    });
  }

  /**
   * Analyzes audio (base64) to detect deepfake voice cloning, manipulation tactics, and text transcriptions with grounding
   */
  public static async analyzeAudio(base64Data: string, mimeType: string, language = "English"): Promise<AIAnalysisResult> {
    if (!base64Data) {
      throw new AppError("Audio data must be provided as base64 format.", 400);
    }

    const client = this.getClient();

    // Retrieve general audio deepfake scam warning grounding context
    let groundingContext = "No specific official advisories matched this inquiry. Use general safety metrics.";
    try {
      const sources = await GroundingService.retrieveRelevantContext("voice synthesis artificial voice clone deepfake telephone impersonation fraud urgent transfer");
      groundingContext = GroundingService.formatGroundingContext(sources);
    } catch (e: any) {
      console.warn(`[AI_SERVICE] Grounding engine offline or Firestore uninitialized: ${e.message}`);
    }

    const prompt = PromptService.getAudioAnalysisPrompt(groundingContext, language);

    return retryWithBackoff(async () => {
      try {
        const response = await client.models.generateContent({
          model: this.MODEL_NAME,
          contents: [
            prompt,
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ],
          config: {
            systemInstruction: PromptService.getSystemInstruction(),
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        const rawText = response.text || "";
        return ResponseParser.parse(rawText);
      } catch (error) {
        return AIErrorHandler.handle(error);
      }
    });
  }
}
