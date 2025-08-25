import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
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
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
            'Please fill a valid email address'
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    official_website: {
        type: String,
        trim: true
    },
    social_links: [{
        name: { type: String, trim: true },
        link: { type: String, trim: true }
    }],
    phones: {
        type: [String],
        default: []
    },
    images: {
        type: [String],
        default: []
    },
    logo: {
        type: String,
    },
    address: {
        country: { type: String, default: "Myanmar", trim: true },
        city: { type: String, default: "Yangon", trim: true }
    },
    donation_wallet: [{
        acc_name: { type: String, trim: true },
        bank: { type: String, trim: true },
        qr: { type: String, trim: true }, // store QR image path or URL
        acc_no: { type: String, trim: true }  // account number
    }]
}, { timestamps: true });

export default mongoose.model("Organization", organizationSchema);