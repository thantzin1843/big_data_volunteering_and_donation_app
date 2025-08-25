import express from "express";
const router = express.Router();

// GET /api/notifications?org_id=xxx
router.get("/", (req, res) => {
  const { org_id } = req.query;
  if (!org_id) return res.json([]);         // or res.status(400).json({ message:"org_id required" })
  return res.json([]);                      // later: return real notifications
});

export default router;
