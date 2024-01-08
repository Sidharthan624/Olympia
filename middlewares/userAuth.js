const User = require('../models/userModel')

const isLogin =async(req,res,next)=>{
    
    try {
        const userData = await User.findOne({_id:req.session.user_id})

        if(req.session.user_id && userData.isAdmin==0&&userData.isBlocked==0 ){
            
            next()
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
    }
}
const isLogout = async(req,res,next)=>{

    try {

        const userData = await User.findOne({_id:req.session.user_id})

        if(req.session.user_id && userData.isAdmin == 0){
            res.redirect('/')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message)
    }
}
module.exports={

    isLogin,
    isLogout
}