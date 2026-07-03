import { Router } from "express";
import { AnalyticsService } from "../services/analyticsService";
import { sendSuccess } from "../utils/apiResponse";

const router = Router();

/**
 * @route   GET /api/v1/analytics
 * @desc    Return computed analytics aggregated from all Firestore scan documents
 * @access  Public
 */
router.get("/", async (req, res, next) => {
  try {
    const analytics = await AnalyticsService.getAnalytics();
    res.json(sendSuccess("Analytics computed successfully.", analytics));
  } catch (error) {
    next(error);
  }
});

export default router;
