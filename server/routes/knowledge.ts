import { Router } from "express";
import { GroundingService } from "../services/groundingService";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../middleware/errorHandler";

const router = Router();

/**
 * @route   POST /api/v1/knowledge/ingest
 * @desc    Ingest a new trusted cybersecurity advisory or warning bulletin
 * @access  Public
 */
router.post("/ingest", async (req, res, next) => {
  try {
    const { title, text, sourceUrl } = req.body;
    if (!title || !text || !sourceUrl) {
      throw new AppError("All parameters (title, text, sourceUrl) are required.", 400);
    }

    const chunkId = await GroundingService.ingestChunk({ title, text, sourceUrl });
    res.json(sendSuccess("Cybersecurity advisory successfully ingested and vectorized.", { chunkId }));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/knowledge/search
 * @desc    Test semantic retrieval on the trusted cybersecurity knowledge base
 * @access  Public
 */
router.post("/search", async (req, res, next) => {
  try {
    const { query, limit } = req.body;
    if (!query) {
      throw new AppError("Search query is required.", 400);
    }

    const matches = await GroundingService.retrieveRelevantContext(query, limit || 3);
    res.json(sendSuccess("Semantic RAG retrieval completed.", {
      query,
      resultsCount: matches.length,
      matches,
    }));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/knowledge/seed
 * @desc    Seed the database with real official cyber bulletins for demo purposes
 * @access  Public
 */
router.post("/seed", async (req, res, next) => {
  try {
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

    const results = [];
    for (const b of defaultBulletins) {
      const id = await GroundingService.ingestChunk(b);
      results.push({ title: b.title, id });
    }

    res.json(sendSuccess("Trusted cybersecurity knowledge base seeded successfully.", { seededCount: results.length, bulletins: results }));
  } catch (error) {
    next(error);
  }
});

export default router;
