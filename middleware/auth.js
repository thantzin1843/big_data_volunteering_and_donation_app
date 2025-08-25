// middleware/auth.js
import jwt from "jsonwebtoken";

/**
 * Require an authenticated organization.
 * Accepts token from:
 *   - Authorization: Bearer <token>
 *   - cookie: org_token / token (optional)
 */
export function requireOrg(req, res, next) {
  try {
    const hdr = req.headers.authorization || "";
    const bearer = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    const cookieTok = req.cookies?.org_token || req.cookies?.token;
    const token = bearer || cookieTok;

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const decoded = jwt.verify(token, secret); // { organization: { id, status }, ... }

    const orgId = decoded?.organization?.id;
    if (!orgId) return res.status(401).json({ message: "Invalid token" });

    req.orgId = orgId;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
