import { Router } from "express";
import { ScanService } from "../services/scanService";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../middleware/errorHandler";

const router = Router();

/**
 * @route  GET /api/v1/scans
 * @desc   Return paginated scan history with optional filters
 * @access Public
 */
router.get("/", async (req, res, next) => {
  try {
    const { limit, page, search, category, severity, scanType, sortOrder } = req.query;

    const result = await ScanService.getScans({
      limit: limit ? parseInt(limit as string, 10) : 20,
      page: page ? parseInt(page as string, 10) : 1,
      search: (search as string) || undefined,
      category: (category as string) || undefined,
      severity: (severity as string) || undefined,
      scanType: (scanType as string) || undefined,
      sortOrder: (sortOrder as "asc" | "desc") || "desc",
    });

    res.json(sendSuccess("Scan history retrieved successfully.", result));
  } catch (error) {
    next(error);
  }
});

/**
 * @route  GET /api/v1/scans/:id
 * @desc   Return one scan by ID
 * @access Public
 */
router.get("/:id", async (req, res, next) => {
  try {
    const scan = await ScanService.getScanById(req.params.id);
    if (!scan) {
      throw new AppError("Scan record not found.", 404, { id: req.params.id });
    }
    res.json(sendSuccess("Scan record retrieved.", scan));
  } catch (error) {
    next(error);
  }
});

/**
 * @route  DELETE /api/v1/scans
 * @desc   Permanently delete all scans (purge)
 * @access Public
 */
router.delete("/", async (req, res, next) => {
  try {
    await ScanService.purgeAllScans();
    res.json(sendSuccess("All scan records purged successfully.", null));
  } catch (error) {
    next(error);
  }
});

/**
 * @route  DELETE /api/v1/scans/:id
 * @desc   Permanently delete one scan
 * @access Public
 */
router.delete("/:id", async (req, res, next) => {
  try {
    await ScanService.deleteScan(req.params.id);
    res.json(sendSuccess("Scan record deleted successfully.", { id: req.params.id }));
  } catch (error) {
    next(error);
  }
});

export default router;
