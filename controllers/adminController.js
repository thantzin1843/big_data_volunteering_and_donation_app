// // controllers/adminController.js
// import jwt from "jsonwebtoken";
// import Admin from "../models/Admin.js";
// import * as OrgMod from "../models/Organization.js";
// import * as ActMod from "../models/Activity.js";

// const Organization = OrgMod.default || OrgMod.Organization || OrgMod;
// const Activity = ActMod.default || ActMod.Activity || ActMod;

// /* ============ helpers ============ */
// const sign = (admin) =>
//   jwt.sign(
//     { id: admin._id, role: "admin", email: admin.email },
//     process.env.JWT_SECRET || "dev_secret",
//     { expiresIn: "7d" }
//   );

// /* ============ auth ============ */
// export async function register(req, res) {
//   try {
//     const { name, email, password } = req.body;
//     const exists = await Admin.findOne({ email });
//     if (exists) return res.status(400).json({ message: "Admin already exists" });

//     const admin = await Admin.create({ name, email, password });
//     return res.status(201).json({
//       message: "Admin created",
//       admin: { id: admin._id, email: admin.email, name: admin.name },
//       token: sign(admin),
//     });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Failed to register admin" });
//   }
// }

// export async function login(req, res) {
//   try {
//     const { email, password } = req.body;
//     const admin = await Admin.findOne({ email });
//     if (!admin || !(await admin.matchPassword(password)))
//       return res.status(401).json({ message: "Invalid credentials" });

//     return res.json({
//       admin: { id: admin._id, email: admin.email, name: admin.name },
//       token: sign(admin),
//     });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Failed to login" });
//   }
// }

// /* ============ dashboard data ============ */
// export async function stats(_req, res) {
//   try {
//     const [orgPending, actPending, actApproved, actRejected] = await Promise.all([
//       Organization.countDocuments({ status: "pending" }),
//       Activity.countDocuments({ "approval.status": "pending" }),
//       Activity.countDocuments({ "approval.status": "approved" }),
//       Activity.countDocuments({ "approval.status": "rejected" }),
//     ]);

//     res.json({
//       organizations: { pending: orgPending },
//       activities: { pending: actPending, approved: actApproved, rejected: actRejected },
//     });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Failed to load stats" });
//   }
// }

// /* ============ moderation: activities ============ */
// export async function listActivities(req, res) {
//   try {
//     const q = {};
//     if (req.query.status) q["approval.status"] = req.query.status;
//     if (req.query.org_id) q.org_id = req.query.org_id;

//     const items = await Activity.find(q).sort({ createdAt: -1 }).lean();
//     res.json(items);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Failed to list activities" });
//   }
// }

// export async function approveActivity(req, res) {
//   try {
//     const { id } = req.params;
//     const { admin_id } = req.body || {};
//     const updated = await Activity.findByIdAndUpdate(
//       id,
//       {
//         $set: {
//           "approval.status": "approved",
//           "approval.by": admin_id || null,
//           "approval.reason": null,
//           "approval.at": new Date(),
//         },
//       },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ message: "Activity not found" });
//     res.json(updated);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Approval failed" });
//   }
// }

// export async function rejectActivity(req, res) {
//   try {
//     const { id } = req.params;
//     const { reason, admin_id } = req.body || {};
//     const updated = await Activity.findByIdAndUpdate(
//       id,
//       {
//         $set: {
//           "approval.status": "rejected",
//           "approval.by": admin_id || null,
//           "approval.reason": reason || "Not approved",
//           "approval.at": new Date(),
//         },
//       },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ message: "Activity not found" });
//     res.json(updated);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Rejection failed" });
//   }
// }

// /* ============ moderation: organizations ============ */
// export async function listOrganizations(req, res) {
//   try {
//     const q = {};
//     if (req.query.status) q.status = req.query.status;
//     const orgs = await Organization.find(q).sort({ createdAt: -1 }).lean();
//     res.json(orgs);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Failed to list organizations" });
//   }
// }

// export async function approveOrganization(req, res) {
//   try {
//     const updated = await Organization.findByIdAndUpdate(
//       req.params.id,
//       { $set: { status: "approved" } },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ message: "Organization not found" });
//     res.json(updated);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Org approval failed" });
//   }
// }

// export async function rejectOrganization(req, res) {
//   try {
//     const updated = await Organization.findByIdAndUpdate(
//       req.params.id,
//       { $set: { status: "rejected" } },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ message: "Organization not found" });
//     res.json(updated);
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: "Org rejection failed" });
//   }
// }

// controllers/adminController.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import * as OrgMod from "../models/Organization.js";
import * as ActMod from "../models/Activity.js";

const Organization = OrgMod.default || OrgMod.Organization || OrgMod;
const Activity = ActMod.default || ActMod.Activity || ActMod;

/* ============ helpers ============ */
const sign = (admin) =>
  jwt.sign(
    { id: admin._id, role: "admin", email: admin.email },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );

/* ============ auth ============ */
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: "Admin already exists" });

    const admin = await Admin.create({ name, email, password });
    return res.status(201).json({
      message: "Admin created",
      admin: { id: admin._id, email: admin.email, name: admin.name },
      token: sign(admin),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to register admin" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    return res.json({
      admin: { id: admin._id, email: admin.email, name: admin.name },
      token: sign(admin),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to login" });
  }
}

/* ============ dashboard data ============ */
export async function stats(_req, res) {
  try {
    // Organizations pending approval
    const orgPending = await Organization.countDocuments({ status: "pending" });

    // Activities by moderation state (based on single "status" field)
    const [actPending, actApproved, actRejected] = await Promise.all([
      Activity.countDocuments({ status: "pending" }),
      Activity.countDocuments({ status: { $in: ["upcoming", "currently working", "finished"] } }),
      Activity.countDocuments({ status: "rejected" }),
    ]);

    res.json({
      organizations: { pending: orgPending },
      activities: { pending: actPending, approved: actApproved, rejected: actRejected },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to load stats" });
  }
}

/* ============ moderation: activities ============ */
// GET /api/admin/activities?status=pending|approved|rejected&org_id=<id>
export async function listActivities(req, res) {
  try {
    const { status, org_id } = req.query;

    const q = {};
    if (org_id) q.org_id = org_id;

    if (status === "pending") {
      q.status = "pending";
    } else if (status === "approved") {
      q.status = { $in: ["upcoming", "currently working", "finished"] };
    } else if (status === "rejected") {
      q.status = "rejected";
    }

    const items = await Activity.find(q).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list activities" });
  }
}

// PUT /api/admin/activities/:id/approve
export async function approveActivity(req, res) {
  try {
    const { id } = req.params;
    // When approved, first visible state is "upcoming"
    const updated = await Activity.findByIdAndUpdate(
      id,
      { $set: { status: "upcoming" } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Activity not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Approval failed" });
  }
}

// PUT /api/admin/activities/:id/reject
export async function rejectActivity(req, res) {
  try {
    const { id } = req.params;
    const updated = await Activity.findByIdAndUpdate(
      id,
      { $set: { status: "rejected" } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Activity not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Rejection failed" });
  }
}

/* ============ moderation: organizations ============ */
// GET /api/admin/organizations?status=pending|approved|rejected
export async function listOrganizations(req, res) {
  try {
    const q = {};
    if (req.query.status) q.status = req.query.status;
    const orgs = await Organization.find(q).sort({ createdAt: -1 }).lean();
    res.json(orgs);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list organizations" });
  }
}

// PUT /api/admin/organizations/:id/approve
export async function approveOrganization(req, res) {
  try {
    const updated = await Organization.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "approved" } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Organization not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Org approval failed" });
  }
}

// PUT /api/admin/organizations/:id/reject
export async function rejectOrganization(req, res) {
  try {
    const updated = await Organization.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "rejected" } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Organization not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Org rejection failed" });
  }
}
