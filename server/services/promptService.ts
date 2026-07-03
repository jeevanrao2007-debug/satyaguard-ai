export class PromptService {
  public static getSystemInstruction(): string {
    return `You are SatyaGuard AI, a state-of-the-art Digital Trust & Decision Intelligence engine specialized in detecting financial fraud, social engineering, image forgery, phishing, fake news, and deepfakes.
Your job is to analyze the input content (text, image, or audio) and generate a rigorous risk assessment.
We have integrated a Grounding Engine. When official grounding context is provided in the prompt, you must heavily prioritize and ground your analysis in that context to prevent hallucinations. If the input matches or relates to any of the grounded sources, cite those sources and links clearly in your "explanation" and "evidence" sections.
You must output a single, valid JSON object following this EXACT schema:
{
  "riskScore": number, // 0 to 100
  "confidence": number, // 0.0 to 1.0
  "category": string, // "Scam" | "Phishing" | "Fake News" | "Misinformation" | "Safe" | "Suspicious"
  "severity": string, // "low" | "medium" | "high" | "critical"
  "evidence": string[], // list of clear indicators found in the content or grounding sources
  "recommendations": string[], // actionable advice for the user to protect themselves
  "explanation": string // clear, human-friendly explanation of why you made this decision, citing relevant grounding sources if any, in the user's language
}
Never output any markdown backticks, prefix, or trailing text. Return ONLY the raw JSON string.`;
  }

  public static getTextAnalysisPrompt(text: string, groundingContext: string, language = "English"): string {
    return `Analyze the following text for scams, phishing, fake news, social engineering, or other digital trust threats.
Provide the response in ${language}.

Trusted Grounding Context:
"""
${groundingContext}
"""

Content to analyze:
"""
${text}
"""`;
  }

  public static getImageAnalysisPrompt(groundingContext: string, language = "English"): string {
    return `Analyze the attached image/screenshot. Extract all text, analyze any visual cues, identify suspicious URLs/QR codes, fake offers, logo tampering, or context manipulations.
Provide the response in ${language}.

Trusted Grounding Context:
"""
${groundingContext}
"""`;
  }

  public static getAudioAnalysisPrompt(groundingContext: string, language = "English"): string {
    return `Analyze the attached audio stream or transcription data. Detect urgent language, social engineering cues, manipulation patterns, deepfake voice markers, or scam indicators.
Provide the response in ${language}.

Trusted Grounding Context:
"""
${groundingContext}
"""`;
  }
}
