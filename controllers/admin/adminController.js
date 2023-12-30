const bcrypt = require('bcrypt')
const User = require('../../models/userModel')
const Order = require('../../models/orderModel')
const Product = require('../../models/productModel')
const Category = require('../../models/categoryModel')
const {
    getDailyDataArray,
    getYearlyDataArray,
    getMonthlyDataArray,
    getCategoryWiseDataArray
} = require('../../config/chartData');


const loadAdminLogin =async (req,res)=>{
    try {
        res.render('admin/login')
    } catch (error) {
        console.log(error.message)
        
    }
}
const verifyLogin = async (req,res)=>{
    try {
        const {email,password}=req.body
        const userData = await User.findOne({email:email})
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch&&userData.isAdmin==1)
            {
                req.session.user_id = userData._id
        res.redirect('/admin/home')
    }else{
        res.render('admin/login',{message:"Email and password are incorrect"})


        
        }
        }else{
            res.render("admin/login")
        }
    } catch (error) {
        console.log(error.message);
    }

}
const loadHome =async (req,res)=>{
    try {
        let query = {}
        
        const userData = await User.findById(req.session.user_id)
        const totalRevenue = await Order.aggregate([
            {$match:{"paymentStatus":"Success"}},
            {$group:{_id:null,totalAmount:{$sum:"$totalAmount"}}}
        ])
        const totalUsers = await User.countDocuments({isBlocked:0})
        const totalOrders = await Order.countDocuments()
        const totalProducts = await Product.countDocuments()
        const totalCategories = await Category.countDocuments()
        const orders = await Order.find().populate("user").limit(10).sort({orderDate:-1})
        const monthlyEarnings = await Order.aggregate([
            {
                $match:{
                    "paymentStatus":"Success",
                    orderDate:{
                        $gte:new Date(new Date().getFullYear(),new Date().getMonth(),1),
                    }
                }
            },
            {$group:{_id:null,monthlyAmount:{$sum:"$totalAmount"}}}
        ])
        const totalRevenueValue = totalRevenue.length>0?totalRevenue[0].totalAmount:0
        const monthlyEarningsValue = monthlyEarnings.length>0?monthlyEarnings[0].monthlyAmount:0
        const newUsers = await User.find({is_blocked:1,isAdmin:0}).sort({date:-1}).limit(5)
        const monthlyDataArray = await getMonthlyDataArray()
        const dailyDataArray = await getDailyDataArray()
        const yearlyDataArray = await getYearlyDataArray()
        const monthlyOrderCounts = monthlyDataArray.map((item)=>item.count)
        const dailyOrderCounts = dailyDataArray.map((item)=>item.count)
        const yearlyOrderCounts = yearlyDataArray.map((item)=>item.count)
        console.log(monthlyDataArray,"monthlyDataArray");
        console.log(dailyOrderCounts,"dailyOrderCounts");
        console.log(yearlyOrderCounts,"yearlyOrderCounts");
        const { categoryNames, categoryDataArray } = await getCategoryWiseDataArray()
        console.log(categoryNames,categoryDataArray);
        if (userData){
            res.render("admin/adminHome",
            {
                admin:userData,
                totalRevenue:totalRevenueValue,
                totalOrders,
                totalCategories,
                totalProducts,
                totalUsers,
                newUsers,
                orders,
                monthlyEarningsValue,
                monthlyOrderCounts,
                dailyOrderCounts,
                yearlyOrderCounts,
                categoryNames,
                categoryDataArray
            }
            )
        }
        else{
            res.status(404).send("User not found")
        }
    } catch (error) {
        console.log(error.message)
        
    }
}
const adminLogout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        
    }
}
const listUsers = async (req,res)=>{
    try {
        const userData =await User.find()
        res.render('admin/userList',{userData})
    } catch (error) {
        console.log(error.message);
    }
}
const blockUser = async (req,res)=>{
    try {
        const userId = req.query.id
        
       
            const userData = await User.findByIdAndUpdate({_id:userId},{$set:{isBlocked:1}})
            res.redirect('/admin/usersList')
            
        }
       
     catch (error) {
        console.log(error.message)
    }
}
const unBlockUser = async (req,res)=>{
    try {
        const userId = req.query.id
        
        
       
            const userData = await User.findByIdAndUpdate({_id:userId},{$set:{isBlocked:0}})
            res.redirect('/admin/usersList')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports ={
    loadAdminLogin,
    verifyLogin,
    loadHome,
    adminLogout,
    listUsers,
    blockUser,
    unBlockUser
}