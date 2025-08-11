import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    image:{
        type: String,
        required: true,
        default: "https://example.com/default-image.jpg" // Default image URL
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    org_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },
    location: {
        country: { type: String, default: "Myanmar", trim: true },
        city: { type: String, trim: true },
        address: { type: String, trim: true },
        latitude: { type: Number },
        longitude: { type: Number }
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    required_volunteers: {
        type: Number,
        min: 0,
        required: true
    },
    registered_volunteers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    requirements: {
        type: [String],
        default: []
    },
    tags: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        enum: ["upcoming", "currently working", "finished"],
        default: "upcoming"
    },
    donation_include: {
        type: Boolean,
        default: false
    },
    donations: [{
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
        amount: { type: Number, min: 0 },
        payment_method: { type: String, trim: true },
        acc_name: { type: String, trim: true },
        acc_number: { type: String, trim: true },
        status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" }
    }],
    target_amount: {
        type: Number,
        min: 0
    }
}, { timestamps: true });

export const Activity = mongoose.models?.Activity || mongoose.model("Activity", activitySchema);


