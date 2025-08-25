// import { adminAuth } from "../middleware/adminAuth.js";   // ← disable
import express from "express";
import {
  register, login, stats,
  listActivities, approveActivity, rejectActivity,
  listOrganizations, approveOrganization, rejectOrganization
} from "../controllers/adminController.js";

const router = express.Router();

// AUTH (keep these if you’ll test later)
router.post("/register", register);
router.post("/login", login);
router.get("/stats", /* adminAuth, */ stats);

// ❗ DEV ONLY: routes are public (remove adminAuth)
router.get("/activities", /* adminAuth, */ listActivities);
router.put("/activities/:id/approve", /* adminAuth, */ approveActivity);
router.put("/activities/:id/reject", /* adminAuth, */ rejectActivity);

router.get("/organizations", /* adminAuth, */ listOrganizations);
router.put("/organizations/:id/approve", /* adminAuth, */ approveOrganization);
router.put("/organizations/:id/reject", /* adminAuth, */ rejectOrganization);

export default router;
