import { AppError } from "../middleware/errorHandler";

export interface AIAnalysisResult {
  riskScore: number;
  confidence: number;
  category: string;
  severity: string;
  evidence: string[];
  recommendations: string[];
  explanation: string;
}

export class ResponseParser {
  public static parse(rawResponse: string): AIAnalysisResult {
    try {
      // Clean possible markdown formatting (e.g. ```json ... ```)
      let cleaned = rawResponse.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(cleaned);

      // Validate and sanitize the output structure
      const riskScore = typeof parsed.riskScore === "number" ? parsed.riskScore : parseInt(parsed.riskScore) || 0;
      const confidence = typeof parsed.confidence === "number" ? parsed.confidence : parseFloat(parsed.confidence) || 0.5;
      const category = typeof parsed.category === "string" ? parsed.category : "Suspicious";
      const severity = typeof parsed.severity === "string" ? parsed.severity.toLowerCase() : "medium";
      const evidence = Array.isArray(parsed.evidence) ? parsed.evidence : [];
      const recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
      const explanation = typeof parsed.explanation === "string" ? parsed.explanation : "No explanation provided.";

      return {
        riskScore: Math.min(100, Math.max(0, riskScore)),
        confidence: Math.min(1, Math.max(0, confidence)),
        category,
        severity: ["low", "medium", "high", "critical"].includes(severity) ? severity : "medium",
        evidence,
        recommendations,
        explanation,
      };
    } catch (error) {
      console.error("[RESPONSE_PARSER] Failed to parse raw AI response:", rawResponse);
      throw new AppError("The AI response could not be parsed as valid trust telemetry data.", 502, {
        code: "AI_PARSING_FAILED",
        raw_response: rawResponse,
      });
    }
  }
}
