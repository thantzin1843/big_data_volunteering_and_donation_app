// // backend/controllers/activityController.js
// import { Activity } from "../models/Activity.js";

// /**
//  * Create activity
//  * Maps front-end field names (start_at/end_at, Requirements/Tags) to the schema.
//  */
// export const createActivity = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       category,
//       org_id,
//       location = {},
//       image,

//       // front-end names
//       start_at,
//       end_at,
//       Requirements,
//       Tags,

//       // schema names (accepted too)
//       start_date,
//       end_date,
//       requirements,
//       tags,

//       required_volunteers,
//       donation_include,
//       target_amount,
//       donations,
//       status
//     } = req.body;

//     const doc = {
//       title,
//       description,
//       category,
//       org_id,
//       image,
//       location: {
//         country: location.country ?? "Myanmar",
//         city: location.city ?? "",
//         address: location.address ?? "",
//         latitude: location.latitude ?? undefined,
//         longitude: location.longitude ?? undefined,
//       },
//       start_date: start_date || start_at ? new Date(start_date || start_at) : undefined,
//       end_date:   end_date   || end_at   ? new Date(end_date   || end_at)   : undefined,
//       required_volunteers: Number(required_volunteers ?? 0),
//       requirements: Array.isArray(requirements) ? requirements
//                   : Array.isArray(Requirements) ? Requirements : [],
//       tags: Array.isArray(tags) ? tags
//            : Array.isArray(Tags) ? Tags : [],
//       status: status || "pending",
//       donation_include: !!donation_include,
//       target_amount: Number(target_amount ?? 0),
//       donations: Array.isArray(donations) ? donations : [],
//     };

//     // basic guards (schema will also validate)
//     if (!doc.title?.trim()) {
//       return res.status(400).json({ message: "Validation failed", details: { title: { message: "title is required" } } });
//     }
//     if (!doc.org_id) {
//       return res.status(400).json({ message: "Validation failed", details: { org_id: { message: "org_id is required" } } });
//     }
//     if (!doc.start_date || !doc.end_date) {
//       return res.status(400).json({ message: "Validation failed", details: { date: { message: "start_date and end_date are required" } } });
//     }
//     if (doc.end_date <= doc.start_date) {
//       return res.status(400).json({ message: "Validation failed", details: { date: { message: "end_date must be after start_date" } } });
//     }

//     const saved = await new Activity(doc).save();
//     res.status(201).json({ message: "Activity created successfully", data: saved });
//   } catch (error) {
//     if (error?.name === "ValidationError") {
//       return res.status(400).json({ message: "Validation failed", details: error.errors });
//     }
//     console.error("Create Activity error:", error);
//     res.status(500).json({ message: "Failed to create activity", error: error.message });
//   }
// };

// /**
//  * List activities (optionally filter by org_id via ?org_id=)
//  */
// export const getAllActivities = async (req, res) => {
//   try {
//     const query = {};
//     if (req.query.org_id) query.org_id = req.query.org_id;
//     const activities = await Activity.find(query).populate("org_id", "name email");
//     res.status(200).json({ message: "Activities retrieved successfully", data: activities });
//   } catch (error) {
//     console.error("Get all activities error:", error);
//     res.status(500).json({ message: "Failed to retrieve activities", error: error.message });
//   }
// };

// /**
//  * Get one activity by id
//  */
// export const getActivityDetail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const activity = await Activity.findById(id).populate("org_id", "name email");
//     if (!activity) return res.status(404).json({ message: "Activity not found" });
//     res.status(200).json({ message: "Activity retrieved successfully", data: activity });
//   } catch (error) {
//     console.error("Get activity detail error:", error);
//     res.status(500).json({ message: "Failed to retrieve activity", error: error.message });
//   }
// };

// backend/controllers/activityController.js
import Activity from "../models/Activity.js";

/** Create new activity — always start as approval.pending */
export const createActivity = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      // support either start_at/end_at or start_date/end_date
      start_at,
      end_at,
      start_date,
      end_date,
      location,
      org_id,
      image,
      required_volunteers,
      requirements,
      tags,
      status, // lifecycle status (optional)
      donation_include,
      target_amount,
      donations,
    } = req.body;

    const doc = new Activity({
      title,
      description,
      category,
      org_id,
      image,
      location: location || {},
      start_date: start_date || start_at, // normalize
      end_date: end_date || end_at,       // normalize
      required_volunteers: Number(required_volunteers ?? 0),
      requirements: Array.isArray(requirements) ? requirements : [],
      tags: Array.isArray(tags) ? tags : [],
      status: status || "upcoming",       // lifecycle only
      approval: { status: "pending" },    // ✅ moderation always pending at creation
      donation_include: !!donation_include,
      target_amount: Number(target_amount ?? 0),
      donations: Array.isArray(donations) ? donations : [],
    });

    const saved = await doc.save();
    res.status(201).json({ message: "Activity created", data: saved });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create activity", error: error.message });
  }
};

/** List activities — support filters: org_id, approval, status */
export const getAllActivities = async (req, res) => {
  try {
    const q = {};
    if (req.query.org_id) q.org_id = req.query.org_id;
    if (req.query.approval) q["approval.status"] = req.query.approval; // "pending" | "approved" | "rejected"
    if (req.query.status) q.status = req.query.status; // lifecycle

    const items = await Activity.find(q).sort({ createdAt: -1 }).lean();
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve activities", error: error.message });
  }
};

/** Activity detail */
export const getActivityDetail = async (req, res) => {
  try {
    const item = await Activity.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: "Not found" });
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve activity", error: error.message });
  }
};
