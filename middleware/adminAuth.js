// backend/middleware/adminAuth.js
import jwt from "jsonwebtoken";

export function adminAuth(req, res, next) {
  // 0) Dev bypass via header secret (for local dev only)
  const devSecret = process.env.ADMIN_DEV_SECRET;
  if (devSecret) {
    const given = req.headers["x-admin-secret"];
    if (given && given === devSecret) {
      req.admin = { id: "dev", email: "dev@local", role: "admin" };
      return next();
    }
  }

  // 1) Normal JWT path (kept for when you add admin login properly)
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }
    req.admin = { id: payload.id, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
