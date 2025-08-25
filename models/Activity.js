// // import mongoose from "mongoose";

// // const activitySchema = new mongoose.Schema({
// //     image:{
// //         type: String,
// //         required: true,
// //         default: "https://example.com/default-image.jpg" // Default image URL
// //     },
// //     title: {
// //         type: String,
// //         required: true,
// //         trim: true
// //     },
// //     description: {
// //         type: String,
// //         required: true
// //     },
// //     category: {
// //         type: String,
// //         required: true,
// //         trim: true
// //     },
// //     org_id: {
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: "Organization",
// //         required: true
// //     },
// //     location: {
// //         country: { type: String, default: "Myanmar", trim: true },
// //         city: { type: String, trim: true },
// //         address: { type: String, trim: true },
// //         latitude: { type: Number },
// //         longitude: { type: Number }
// //     },
// //     start_date: {
// //         type: Date,
// //         required: true
// //     },
// //     end_date: {
// //         type: Date,
// //         required: true
// //     },
// //     required_volunteers: {
// //         type: Number,
// //         min: 0,
// //         required: true
// //     },
// //     registered_volunteers: [{
// //         type: mongoose.Schema.Types.ObjectId,
// //         ref: "User"
// //     }],
// //     requirements: {
// //         type: [String],
// //         default: []
// //     },
// //     tags: {
// //         type: [String],
// //         default: []
// //     },
// //     status: {
// //         type: String,
// //         enum: ["upcoming", "currently working", "finished"],
// //         default: "upcoming"
// //     },
// //     donation_include: {
// //         type: Boolean,
// //         default: false
// //     },
// //     donations: [{
// //         user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
// //         date: { type: Date, default: Date.now },
// //         amount: { type: Number, min: 0 },
// //         payment_method: { type: String, trim: true },
// //         acc_name: { type: String, trim: true },
// //         acc_number: { type: String, trim: true },
// //         status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" }
// //     }],
// //     target_amount: {
// //         type: Number,
// //         min: 0
// //     }
// // }, { timestamps: true });

// // export const Activity = mongoose.models?.Activity || mongoose.model("Activity", activitySchema);


// import mongoose from "mongoose";

// const activitySchema = new mongoose.Schema({
//   image: {
//     type: String,
//     default: "https://example.com/default-image.jpg" // default is enough, no need "required"
//   },
//   title: { type: String, required: true, trim: true },
//   description: { type: String, default: "" },
//   category: { type: String, default: "", trim: true },

//   org_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },

//   location: {
//     country: { type: String, default: "Myanmar", trim: true },
//     city: { type: String, trim: true },
//     address: { type: String, trim: true },
//     latitude: { type: Number },
//     longitude: { type: Number }
//   },

//   // accept either naming
//   start_date: { type: Date, required: true },
//   end_date:   { type: Date, required: true },
//   start_at:   { type: Date }, // not required, useful for reads if you keep sending these
//   end_at:     { type: Date },

//   required_volunteers: { type: Number, min: 0, default: 0 },

//   registered_volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

//   // accept either casing
//   requirements: { type: [String], default: [] },
//   Requirements: { type: [String], default: [] },
//   tags: { type: [String], default: [] },
//   Tags: { type: [String], default: [] },

//   // include the statuses your UI expects, too
//   status: {
//     type: String,
//     enum: ["pending", "upcoming", "in_progress", "currently_working", "finished"],
//     default: "pending"
//   },

//   donation_include: { type: Boolean, default: false },
//   donations: [{
//     user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     date: { type: Date, default: Date.now },
//     amount: { type: Number, min: 0 },
//     payment_method: { type: String, trim: true },
//     acc_name: { type: String, trim: true },
//     acc_number: { type: String, trim: true },
//     status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" }
//   }],
//   target_amount: { type: Number, min: 0, default: 0 }
// }, { timestamps: true });

// // Keep a pre-save to mirror start_at/end_at ↔ start_date/end_date
// activitySchema.pre("validate", function(next) {
//   if (!this.start_date && this.start_at) this.start_date = this.start_at;
//   if (!this.end_date   && this.end_at)   this.end_date   = this.end_at;
//   if (!this.requirements?.length && this.Requirements?.length) this.requirements = this.Requirements;
//   if (!this.tags?.length && this.Tags?.length) this.tags = this.Tags;
//   next();
// });

// export const Activity = mongoose.models?.Activity || mongoose.model("Activity", activitySchema);
// export default Activity;


// backend/models/Activity.js
import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    reason: { type: String, default: null },
    at: { type: Date, default: null },
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: "https://example.com/default-image.jpg",
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },

    org_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    location: {
      country: { type: String, default: "Myanmar", trim: true },
      city: { type: String, trim: true },
      address: { type: String, trim: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },

    // we normalize client start_at/end_at -> start_date/end_date
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },

    required_volunteers: { type: Number, min: 0, required: true, default: 0 },
    registered_volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    requirements: { type: [String], default: [] },
    tags: { type: [String], default: [] },

    // lifecycle status (separate from moderation)
    status: {
      type: String,
      enum: ["upcoming", "in_progress", "currently_working", "finished"],
      default: "upcoming",
    },

    // moderation
    approval: { type: approvalSchema, default: () => ({}) },

    donation_include: { type: Boolean, default: false },
    donations: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
        amount: { type: Number, min: 0 },
        payment_method: { type: String, trim: true },
        acc_name: { type: String, trim: true },
        acc_number: { type: String, trim: true },
        status: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
      },
    ],
    target_amount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

export const Activity = mongoose.models?.Activity || mongoose.model("Activity", activitySchema);
export default Activity;
