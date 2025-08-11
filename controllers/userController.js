import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";

export const register = async (req,res)=>{
    const {name, email, password,phone, address,skills, interests, dob, gender} = req.body;
    if (
    !name?.trim() ||
    !email?.trim() ||
    !password?.trim() ||
    !phone?.trim() ||
    !address?.country?.trim() ||
    !address?.city?.trim() ||
    !Array.isArray(skills) || skills.length === 0 ||
    !Array.isArray(interests) || interests.length === 0 ||
    !dob ||
    !gender?.trim()
    ) {
        return res.status(400).json({ 
            message: "All fields are required and must not be empty", 
            status: 400 
        });
    }
    try {
        let user = await User.findOne({email});
        if(user){
           return res.status(400).json({"message":"This email is already register","status":400})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        user = new User({
            name, email, password:hashedPassword, phone, address,skills, interests, dob, gender
        })

        await user.save();

        // jwt
        const payload = {user:{id:user._id, role:user.role}}
        jwt.sign(payload,process.env.JWT_SECRET,(err,token)=>{
            if(err) throw err;
            res.status(201).json({
                user:{
                    _id:user.id,
                    name:user.name,
                    email:user.email,
                    role:user.role
                },
                token
            })
        })

    } catch (error) {
        console.error(error.message)
    }
}

export const login = async(req,res)=>{
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user) res.status(400).json({"message":"User Not Found","status":400});

        const matchPassword = await bcrypt.compare(password, user.password);
        // console.log(matchPassword)
        if(!matchPassword){
            res.status(400).json({"message":"Password Incorrect","status":400});
        }

        const payload = {user:{id:user._id, role:user.role}}
        jwt.sign(payload, process.env.JWT_SECRET, (err,token)=>{
            if(err) throw err
            res.status(200).json({
                user:{
                    _id:user.id,
                     name:user.name,
                    email:user.email,
                    role:user.role
                },
                token
            })
        })
    } catch (error) {
        console.log(error.message)
    }
}

