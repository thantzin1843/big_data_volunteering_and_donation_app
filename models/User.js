import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address'
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        country: { type: String, default: "Myanmar", trim: true },
        city: { type: String, default: "Yangon", trim: true }
    },
    profile_image: {
        type: String,
        default: "/profileAvatar.jpg"
    },
    skills: {
        type: [String],
        default: []
    },
    interests: {
        type: [String],
        default: []
    },
    dob: {
        type: Date
    },
    gender: {
        type: String,
        enum: ["male", "female"]
    },
    joined_activities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity"
    }],
    donations: [{
        activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
        amount: { type: Number, min: 0 },
        date: { type: Date, default: Date.now }
    }],
    achievements: [{
        org_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
        title: String,
        description: String,
        icon: String,
        threshold: Number,
        types: String,
        category: String
    }],
    role: {
        type: String,
        required: true,
        enum: ["admin", "user"],
        default: "user"
    },
   
}, { timestamps: true });

export const User = mongoose.models?.User || mongoose.model("User", userSchema);
