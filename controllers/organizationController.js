// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { Organization } from "../models/Organization.js";


// export const register = async (req, res) => {
//     const { name, email, password, official_website, social_links, phones, address, donation_wallet,logo } = req.body;

//     // Empty field check
//     if (
//         !logo?.trim() ||
//         !name?.trim() ||
//         !email?.trim() ||
//         !password?.trim() ||
//         !official_website?.trim() ||
//         !Array.isArray(social_links) || social_links.length === 0 ||
//         !Array.isArray(phones) || phones.length === 0 ||
//         !address?.country?.trim() ||
//         !address?.city?.trim() ||
//         !Array.isArray(donation_wallet) || donation_wallet.length === 0
//     ) {
//         return res.status(400).json({
//             message: "All fields are required and must not be empty",
//             status: 400
//         });
//     }

//     try {
//         // Check if organization exists
//         let org = await Organization.findOne({ email });
//         if (org) {
//             return res.status(400).json({ message: "This email is already registered", status: 400 });
//         }

//         // Hash password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // Create new organization
//         org = new Organization({
//             logo,
//             name,
//             email,
//             password: hashedPassword,
//             official_website,
//             social_links,
//             phones,
//             address,
//             donation_wallet
//         });

//         await org.save();

//         // Generate JWT
//         const payload = { organization: { id: org._id, status: org.status } };
//         const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

//         res.status(201).json({
//             organization: {
//                 _id: org._id,
//                 name: org.name,
//                 email: org.email,
//                 status: org.status,
//                 role: "organization"  // Assuming role is always "organization"
//             },
//             token
//         });

//     } catch (error) {
//         console.error("Organization Register Error:", error.message);
//         res.status(500).json({ message: "Server error", status: 500 });
//     }
// };


// export const login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Find organization by email
//         const org = await Organization.findOne({ email });
//         if (!org) {
//             return res.status(400).json({ message: "Organization not found", status: 400 });
//         }

//         // Compare password
//         const matchPassword = await bcrypt.compare(password, org.password);
//         if (!matchPassword) {
//             return res.status(400).json({ message: "Password incorrect", status: 400 });
//         }

//         // Generate JWT
//         const payload = { organization: { id: org._id, status: org.status } };
//         const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

//         res.status(200).json({
//             organization: {
//                 _id: org._id,
//                 name: org.name,
//                 email: org.email,
//                 status: org.status
//             },
//             token
//         });

//     } catch (error) {
//         console.error("Organization Login Error:", error.message);
//         res.status(500).json({ message: "Server error", status: 500 });
//     }
// };


// // update org wallet
// export const updateWallet = async (req, res) => {
//     const { donation_wallet , org_id} = req.body;

//     try {
//        await Organization.findByIdAndUpdate(org_id,
//                         { $push: { donation_wallet} },
//                         { new: true }  // returns updated doc
//                         );

//         res.status(200).json({ message: "Donation wallet updated successfully", status: 200 });

//     } catch (error) {
//         console.error("Update Wallet Error:", error.message);
//         res.status(500).json({ message: "Server error", status: 500 });
//     }
// };

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Organization from "../models/Organization.js";

/** Minimal, safe org payload for responses */
function safeOrg(org) {
  if (!org) return null;
  return {
    _id: org._id,
    name: org.name,
    email: org.email,
    status: org.status,
    logo: org.logo,
    official_website: org.official_website,
  };
}

function signToken(org) {
  const payload = { organization: { id: org._id, status: org.status } };
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.sign(payload, secret, { expiresIn: "1d" });
}

/* ============ REGISTER ============ */
export const register = async (req, res) => {
  const {
    orgname, name: rawName, email, password,
    phone, phones, address,
    username, socialLinks, social_links,
    official_website, donation_wallet, logo,
  } = req.body;

  const name = (rawName || orgname || "").trim();

  try {
    if (!name || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const exist = await Organization.findOne({ email });
    if (exist) return res.status(400).json({ message: "Organization already exists" });

    const hash = await bcrypt.hash(password, 10);

    const org = new Organization({
      name, email, password: hash,
      phone, phones, address, username,
      social_links: social_links || socialLinks,
      official_website, donation_wallet, logo,
    });

    await org.save();

    const token = signToken(org);
    return res.status(201).json({ organization: safeOrg(org), token });
  } catch (err) {
    console.error("Organization Register Error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/* ============ LOGIN ============ */
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const org = await Organization.findOne({ email });
    if (!org) return res.status(400).json({ message: "Organization not found" });

    const ok = await bcrypt.compare(password, org.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(org);
    return res.status(200).json({ organization: safeOrg(org), token });
  } catch (err) {
    console.error("Organization Login Error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/* ============ /me (JWT → org) ============ */
export const getMe = async (req, res) => {
  try {
    const org = await Organization.findById(req.orgId).select("-password");
    if (!org) return res.status(404).json({ message: "Organization not found" });
    return res.json(org);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/* ============ GET BY ID (optional, for other pages) ============ */
export const getOrganizationById = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id).select("-password");
    if (!org) return res.status(404).json({ message: "Organization not found" });
    return res.json(org);
  } catch (err) {
    return res.status(400).json({ message: err.message || "Bad request" });
  }
};

/* ============ UPDATE WALLET ============ */
export const updateWallet = async (req, res) => {
  const { org_id, amount, donation_wallet } = req.body;
  try {
    if (!org_id) return res.status(400).json({ message: "org_id is required" });

    let update;
    if (typeof amount === "number") update = { $inc: { wallet: amount } };
    else if (donation_wallet) update = { $push: { donation_wallet } };
    else return res.status(400).json({ message: "amount or donation_wallet is required" });

    const org = await Organization.findByIdAndUpdate(org_id, update, { new: true });
    if (!org) return res.status(404).json({ message: "Organization not found" });

    return res.json({ message: "Wallet updated", organization: safeOrg(org), wallet: org.wallet, donation_wallet: org.donation_wallet });
  } catch (err) {
    console.error("Update Wallet Error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

/* ============ UPDATE PROFILE ============ */
export const updateProfile = async (req, res) => {
  const { id } = req.params;
  const { name, official_website, phone, address, social_links, logo } = req.body;

  try {
    const update = {};
    if (typeof name === "string") update.name = name;
    if (typeof official_website === "string") update.official_website = official_website;
    if (typeof phone === "string") update.phone = phone;
    if (address) update.address = address;
    if (social_links) update.social_links = social_links;
    if (logo) update.logo = logo;

    const org = await Organization.findByIdAndUpdate(id, update, { new: true });
    if (!org) return res.status(404).json({ message: "Organization not found" });

    return res.json({ message: "Profile updated", organization: safeOrg(org) });
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
