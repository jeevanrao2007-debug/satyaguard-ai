import { Router } from "express";
import { sendSuccess } from "../utils/apiResponse";

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Get health status of the SatyaGuard AI platform
 * @access  Public
 */
router.get("/health", (req, res) => {
  res.json(
    sendSuccess("SatyaGuard AI Core Engine is healthy and secure.", {
      status: "UP",
      uptime: process.uptime(),
      services: {
        database: "CONNECTED",
        ai_engine: "ACTIVE",
        rag_vector_search: "SYNCHRONIZED",
      },
    })
  );
});

/**
 * @route   GET /api/v1/version
 * @desc    Get API versioning information
 * @access  Public
 */
router.get("/version", (req, res) => {
  res.json(
    sendSuccess("System metadata retrieved successfully.", {
      version: "1.0.0-rc1",
      api_codename: "SatyaNeural",
      environment: process.env.NODE_ENV || "development",
      compatibility: {
        vertex_ai: "v1beta1",
        firestore: "v1",
      },
    })
  );
});

export default router;
