import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import { generateVerificationCode } from '../utils/generateVerificationCode.js';
import { generateTokenAndSetCookie} from '../utils/generateTokenAndSetCookie.js'
import { sendPasswordResetEmail, sendResetSuccessfulEmail, sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/email.js';
import crypto from 'crypto'


export const signup = async(req,res)=>{
    const {email,password,name} = req.body;

    try{
        if(!email || !password || !name){
            throw new Error("All Fields are req")
        }
        const userAlreadyExist =  await User.find({email:email});
        if(userAlreadyExist.length !== 0){
            return res.status(400).json({
                success:false,
                message:"User Already Exist"
            }) 
        } 
        const hashedPass = await bcrypt.hash(password,10);
        const verificationToken = generateVerificationCode();
        const user = new User({
            email,
            password:hashedPass,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24*60*60*1000,

        })
        await user.save();

        generateTokenAndSetCookie(res,user._id); 
        await sendVerificationEmail(user.email, verificationToken);
        res.status(201).json({
            success:true,
            message:"User Created Successfully",
            user:{
                ...user._doc,
                password:undefined
            }
        })
    }catch(e){
        return res.status(500).json({
            success: false,
            message:e.message
        })
    }
}

export const verifyEmail = async(req,res)=>{
    const {code} = req.body;
    try{
        const user  = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt : {$gt: Date.now()}
        })
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Invalid or Expired Verification Code"
            })
        }
        user.isVerified = true,
        user.verificationToken = undefined,
        user.verificationTokenExpiresAt=undefined
        await user.save();

        await sendWelcomeEmail(user.email, user.name);
        res.status(200).json({
            success:true,
            message:"Email Verified successfully",
            user:{
                ...user._doc,
                password: undefined
            }
        })
    }catch(e){
        res.status(500).json({
            success:false,
            message:"Something went wrong while verifying email"
        })
    }
}

export const login = async(req,res)=>{
    const {email, password} = req.body;
    try{
        
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(403).json({
                success:false,
                message:"User not Exist, you need to signup"
            })
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            return res.status(401).json({
                success:false,
                message:"Wrong Password"
            })
        }
        generateTokenAndSetCookie(res,user._id);
        user.lastLogin = new Date();
        await user.save();

        return res.status(200).json({
            success:true,
            message:"Logged in Successfully",
            user:{
                ...user._doc,
                password:undefined
            }
        })
        
    }catch(e){
        res.status(500).json({
            success:false,
            message:"Something went wrong while logging in"
            
        })
        console.error(e);
    }
}
export const logout = async(req,res)=>{
    res.clearCookie("TOKEN") 
    console.log("LOG OUT")
    res.status(200).json({
        success:true,
        message:"Logged out successfully"
    })
}

export const forgotPassword = async(req,res)=>{
    const {email} = req.body;
    try{
        if(!email){
            return res.status(400).json({
                success:false,
                message:"Fill the email"
            })
        }
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User not found"
            })
        }
        
        //generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");

        const resetTokenExpiresAt = Date.now() + 15*60*1000;
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt =resetTokenExpiresAt;
        console.log(resetToken);

        await user.save();
        console.log("USER: ",user);
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}reset-password/${resetToken}`);
        res.status(200).json({
            success:true,
            message:"reset password request sent successfully"
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:"something went wrong while sending reset password url"
        })
    }
}

export const resetPassword = async(req,res)=>{
    const token = req.params.token;
    const {password} = req.body;
    try{
        if(!password){
            return res.status(400).json({
                success:false,
                message:"Password field is empty"
            })
        }
        const user = await User.findOne({
            resetPasswordToken:token, 
            resetPasswordExpiresAt:{$gt: Date.now()}});
        console.log(user)
        if(user.length === 0){
            return res.status(400).json({
                success:false,
                message:"Invalid or expired reset Token"
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt=undefined;
        await user.save();

        await sendResetSuccessfulEmail(user.email);
        return res.status(200).json({
            success:true,
            message:"Password Reset successful"
        })
        
    }catch(e){
        res.status(500).json({
            success:false,
            message:"Something went wrong while resetting password"
        })
        console.log("Error while resetting password: ",e);
    }
}

export const checkAuth = async(req,res)=>{
    try {
        const user  = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
        res.status(200).json({
            success:true,
            message:"user is Authorized",
            user
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Server Error"
        })
    }
}