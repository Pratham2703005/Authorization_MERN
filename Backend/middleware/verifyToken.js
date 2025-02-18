import jwt from 'jsonwebtoken'
import 'dotenv/config'
export const verifyToken = (req,res,next)=>{
    console.log("COOKIES :", req.cookies)
    try{
        const token  = req.cookies.TOKEN;
        console.log("TOKEN : ", token)
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token missing"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({
                success:false,
                message:"Invalid Token"
            })
        }
        req.userId = decoded.userId;
        next();
    }catch(e){
        console.log("Error in verifyToken : ", e);
        res.status(500).json({
            success:false,
            message:"Server Error",
            error: e.message

        })
    }
}