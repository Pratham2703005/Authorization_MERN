import { mailTrapClient ,sender} from "./mailtrap.config.js"
import {PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE  } from '../mailtrap/emailTemplates.js';
export const sendVerificationEmail = async(email , verificationToken)=>{
    const recipient = [{email}]
    try{
        const response = await mailTrapClient.send({
            from : sender,
            to:recipient,
            subject:"Verify your Email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category:"Email Verification"
        })
        console.log("Mail Send Successfully", response);
    }catch(e){
        console.error("Error sending verification email: ",e)
        throw new Error(`Error sending verification email: ${e}`);
    }
}

export const sendWelcomeEmail = async(email,name)=>{
    const recipient = [{email}];
    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recipient,
            template_uuid:"943ee0a1-9091-4bec-a122-813c1102192e",
            template_variables: {
                "name": name
            }
        })
        console.log("Mail Send Successfully", response);
    }catch(e){
        console.error("Error sending verification email: ",e)
        throw new Error(`Error sending verification email: ${e}`);
    }
}

export const sendPasswordResetEmail = async(email, resetUrl)=>{
    const recipient = [{email}];
    try{
        const response =await mailTrapClient.send({
            from : sender,
            to:recipient,
            subject:"Reset your Password",
            html:PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}",resetUrl),
            category: "Password Reset",
        })
        console.log("Reset Password url sent successfully",response)
    }catch(e){
        console.error("Error while sending password reset url: ", e);
    }   

}
export const sendResetSuccessfulEmail = async(email)=>{
    const recipient = [{email}];
    try{
        const response = await mailTrapClient.send({
            from:sender,
            to:recipient,
            html:PASSWORD_RESET_SUCCESS_TEMPLATE ,
            subject:"Password reset Successfully",
            category:"password reset successful"
        })
    }catch(e){
        console.log("Error while resetting password: ",e);
    }
}