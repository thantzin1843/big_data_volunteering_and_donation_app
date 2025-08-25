// import express from 'express';
// import { login, register, updateWallet } from '../controllers/organizationController.js';

// const organizationRouter = express.Router();

// organizationRouter.post('/register', register);
// organizationRouter.post('/login',login);

// // update wallet
// organizationRouter.put('/updateWallet',updateWallet);

// export default organizationRouter
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import {
  register, login, updateWallet, updateProfile,
  getOrganizationById, getMe,
} from "../controllers/organizationController.js";
import { requireOrg } from "../middleware/auth.js";
import Organization from "../models/Organization.js";

const router = express.Router();

/* ---------- optional: upload storage for avatar/cover ---------- */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const sub = file.fieldname === "avatar" ? "avatars" : "covers";
    const dir = path.join(process.cwd(), "uploads", "org", sub);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || "");
    cb(null, `${req.params.id || "me"}-${file.fieldname}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

/* ---------- auth-less ---------- */
router.post("/register", register);
router.post("/login", login);
router.put("/updateWallet", updateWallet);

/* ---------- authenticated "me" ---------- */
router.get("/me", requireOrg, getMe);

/* ---------- other helpers (followers stub) ---------- */
router.get("/:id/followers", async (req, res) => {
  try {
    res.json({ count: 0, items: [] });
  } catch (err) {
    res.status(400).json({ message: err.message || "Bad request" });
  }
});

/* ---------- by id ---------- */
router.get("/:id", getOrganizationById);

/* ---------- optional uploads ---------- */
router.post("/:id/avatar", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });
    const url = `/uploads/org/avatars/${req.file.filename}`;
    const org = await Organization.findByIdAndUpdate(req.params.id, { logo: url }, { new: true });
    if (!org) return res.status(404).json({ message: "Organization not found" });
    res.json({ url, org: { _id: org._id, logo: org.logo } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/cover", upload.single("cover"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });
    const url = `/uploads/org/covers/${req.file.filename}`;
    const org = await Organization.findByIdAndUpdate(req.params.id, { $push: { images: url } }, { new: true });
    if (!org) return res.status(404).json({ message: "Organization not found" });
    res.json({ url, org: { _id: org._id, images: org.images || [] } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
