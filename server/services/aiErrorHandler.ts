import { AppError } from "../middleware/errorHandler";

export class AIErrorHandler {
  public static handle(error: any): never {
    console.error("[AI_ERROR_HANDLER] Critical error calling Gemini API:", error);
    
    const message = error.message || "";
    if (message.includes("quota") || message.includes("429")) {
      throw new AppError("AI service is currently busy. Please try again shortly.", 429, { code: "AI_RATE_LIMIT" });
    }
    if (message.includes("API key") || message.includes("auth") || message.includes("401") || message.includes("403")) {
      throw new AppError("Authentication with the AI service failed. Please contact administrator.", 503, { code: "AI_AUTH_ERROR" });
    }
    
    throw new AppError("The AI engine failed to analyze the requested content. Please try again.", 502, {
      original_error: message,
      code: "AI_GENERATION_FAILED"
    });
  }
}
