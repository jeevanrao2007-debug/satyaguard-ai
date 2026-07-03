import { Router } from "express";
import { AIService } from "../services/aiService";
import { ScanService } from "../services/scanService";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../middleware/errorHandler";

const router = Router();

/**
 * @route   POST /api/v1/analyze/text
 * @desc    Analyze text content for threats, then persist result
 * @access  Public
 */
router.post("/text", async (req, res, next) => {
  try {
    const { text, language } = req.body;
    if (!text) {
      throw new AppError("Text payload is required.", 400);
    }

    const startTime = Date.now();
    const result = await AIService.analyzeText(text, language || "English");
    const processingTime = Date.now() - startTime;

    // Persist to Firestore in the background — never block the HTTP response
    ScanService.saveScan({
      scanType: "text",
      originalInput: text,           // store the actual text
      result,
      language: language || "English",
      processingTime,
    }).catch(err =>
      console.error("[ANALYZE] Failed to persist text scan:", err.message)
    );

    res.json(sendSuccess("Text analysis completed successfully.", result));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/analyze/image
 * @desc    Analyze image base64 payload for threats, then persist result
 * @access  Public
 */
router.post("/image", async (req, res, next) => {
  try {
    const { image, mimeType, language } = req.body;
    if (!image) {
      throw new AppError("Image base64 payload is required.", 400);
    }
    if (!mimeType) {
      throw new AppError("Image mimeType is required.", 400);
    }
    if (!mimeType.startsWith("image/")) {
      throw new AppError("Invalid media format. Must be a valid image mimeType.", 400);
    }

    const startTime = Date.now();
    const result = await AIService.analyzeImage(image, mimeType, language || "English");
    const processingTime = Date.now() - startTime;

    // SECURITY: never store the binary — store a safe descriptive label only
    ScanService.saveScan({
      scanType: "image",
      originalInput: `[Image forensic scan: ${mimeType}]`,
      result,
      language: language || "English",
      processingTime,
    }).catch(err =>
      console.error("[ANALYZE] Failed to persist image scan:", err.message)
    );

    res.json(sendSuccess("Image forensic analysis completed successfully.", result));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/analyze/audio
 * @desc    Analyze audio base64 payload for deepfakes, then persist result
 * @access  Public
 */
router.post("/audio", async (req, res, next) => {
  try {
    const { audio, mimeType, language } = req.body;
    if (!audio) {
      throw new AppError("Audio base64 payload is required.", 400);
    }
    if (!mimeType) {
      throw new AppError("Audio mimeType is required.", 400);
    }
    if (!mimeType.startsWith("audio/") && !mimeType.startsWith("video/")) {
      throw new AppError("Invalid media format. Must be a valid audio/video mimeType.", 400);
    }

    const startTime = Date.now();
    const result = await AIService.analyzeAudio(audio, mimeType, language || "English");
    const processingTime = Date.now() - startTime;

    // SECURITY: never store the binary — store a safe descriptive label only
    ScanService.saveScan({
      scanType: "audio",
      originalInput: `[Audio forensic scan: ${mimeType}]`,
      result,
      language: language || "English",
      processingTime,
    }).catch(err =>
      console.error("[ANALYZE] Failed to persist audio scan:", err.message)
    );

    res.json(sendSuccess("Audio manipulation analysis completed successfully.", result));
  } catch (error) {
    next(error);
  }
});

export default router;
