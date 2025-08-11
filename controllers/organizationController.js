import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Organization } from "../models/Organization.js";


export const register = async (req, res) => {
    const { name, email, password, official_website, social_links, phones, address, donation_wallet,logo } = req.body;

    // Empty field check
    if (
        !logo?.trim() ||
        !name?.trim() ||
        !email?.trim() ||
        !password?.trim() ||
        !official_website?.trim() ||
        !Array.isArray(social_links) || social_links.length === 0 ||
        !Array.isArray(phones) || phones.length === 0 ||
        !address?.country?.trim() ||
        !address?.city?.trim() ||
        !Array.isArray(donation_wallet) || donation_wallet.length === 0
    ) {
        return res.status(400).json({
            message: "All fields are required and must not be empty",
            status: 400
        });
    }

    try {
        // Check if organization exists
        let org = await Organization.findOne({ email });
        if (org) {
            return res.status(400).json({ message: "This email is already registered", status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new organization
        org = new Organization({
            logo,
            name,
            email,
            password: hashedPassword,
            official_website,
            social_links,
            phones,
            address,
            donation_wallet
        });

        await org.save();

        // Generate JWT
        const payload = { organization: { id: org._id, status: org.status } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(201).json({
            organization: {
                _id: org._id,
                name: org.name,
                email: org.email,
                status: org.status,
                role: "organization"  // Assuming role is always "organization"
            },
            token
        });

    } catch (error) {
        console.error("Organization Register Error:", error.message);
        res.status(500).json({ message: "Server error", status: 500 });
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find organization by email
        const org = await Organization.findOne({ email });
        if (!org) {
            return res.status(400).json({ message: "Organization not found", status: 400 });
        }

        // Compare password
        const matchPassword = await bcrypt.compare(password, org.password);
        if (!matchPassword) {
            return res.status(400).json({ message: "Password incorrect", status: 400 });
        }

        // Generate JWT
        const payload = { organization: { id: org._id, status: org.status } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(200).json({
            organization: {
                _id: org._id,
                name: org.name,
                email: org.email,
                status: org.status
            },
            token
        });

    } catch (error) {
        console.error("Organization Login Error:", error.message);
        res.status(500).json({ message: "Server error", status: 500 });
    }
};


// update org wallet
export const updateWallet = async (req, res) => {
    const { donation_wallet , org_id} = req.body;

    try {
       await Organization.findByIdAndUpdate(org_id,
                        { $push: { donation_wallet} },
                        { new: true }  // returns updated doc
                        );

        res.status(200).json({ message: "Donation wallet updated successfully", status: 200 });

    } catch (error) {
        console.error("Update Wallet Error:", error.message);
        res.status(500).json({ message: "Server error", status: 500 });
    }
};