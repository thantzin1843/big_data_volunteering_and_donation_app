// backend/routes/activityRouter.js
import { Router } from "express";
import {
  createActivity,
  getAllActivities,
  getActivityDetail,
} from "../controllers/activityController.js";

const router = Router();

// POST /api/activities  (org creates — starts pending)
router.post("/", createActivity);

// GET /api/activities?org_id=...&approval=approved&status=upcoming
router.get("/", getAllActivities);

// GET /api/activities/:id
router.get("/:id", getActivityDetail);

export default router;
