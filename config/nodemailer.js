const nodemailer = require('nodemailer')
require('dotenv').config
// const { prototype } = require('nodemailer/lib/mailer/mail-message')
const sendVerifyMail = async (req,email)=>{
    try {
        const otp = generateOTP(4)
        req.session.otp=otp
        const transporter=nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.AUTH_EMAIL,
                pass:process.env.AUTH_PASS
            }

        })
        const mailOptions = {
            from:'sidharthanvu2@gmail.com',
            to:email,
            subject:'Olympia online sports store account verification',
            html:`<p>This is your One Time Password:<strong>${otp}</strong></p>`
        }
        const information = await transporter.sendMail(mailOptions)
        console.log(information.messageId);
    } catch (error) {
        console.log(error.message);
    }
} 
function generateOTP(length) {
    const characters = '0123456789'
    let otp = ''
    for(let i=0;i<length;i++){
        const randomIndex = Math.floor(Math.random()*characters.length)
        otp+=characters[randomIndex]
    }
    console.log(otp);
    return otp
}
module.exports={
    sendVerifyMail
}