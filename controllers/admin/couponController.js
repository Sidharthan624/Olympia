const Coupon =require('../../models/couponModel')
const Product = require('../../models/couponModel')
const User = require('../../models/userModel')
const Cart = require('../../models/cartModel')
const moment = require('moment')
const addCouponForm = async (req,res)=>{
    try {
       res.render('admin/addCoupon') 
    } catch (error) {
        console.log(error.message);
    }
}
const addCoupon = async (req, res) => {
    try {
        const { couponCode, discountPercentage, expiryDate } = req.body;

        // Check if the coupon code already exists
        const existingCoupon = await Coupon.findOne({ couponCode });

        if (existingCoupon) {
            // Coupon code already exists, respond with an error
            return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
        }

        // Check if the expiry date is less than the current date
        const currentDate = moment();
        const parsedExpiryDate = moment(expiryDate);

        if (parsedExpiryDate.isBefore(currentDate)) {
            return res.status(400).json({ success: false, message: 'Expiry date must be in the future.' });
        }

        // Coupon code does not exist, and expiry date is valid, proceed with adding the coupon
        const coupon = new Coupon({
            couponCode,
            discountPercentage,
            expiryDate: parsedExpiryDate.toDate() // Convert back to JavaScript Date object if needed
        });

        await coupon.save();

        // Respond with success
        return res.status(200).json({ success: true, message: 'Coupon added successfully.' });
    } catch (error) {
        console.log(error.message);
        // Handle other errors
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



const couponsList = async (req,res)=>{
    try {
        const coupons = await Coupon.find()
        res.render('admin/coupons',{coupons:coupons})
    } catch (error) {
        console.log(error.message);
    }
}
const couponAction = async(req,res)=>{
    try {
        const id = req.query.id
        
        const coupon = await Coupon.findById({_id:id})
        if(coupon.status=="Active"){
            coupon.status="Inactive"
            await coupon.save()
        }else{
            coupon.status="Active"
            await coupon.save()
        }
        res.redirect('/admin/coupons')

    } catch (error) {
        console.log(error.message);
    }
}
module.exports = {

    addCouponForm,
    addCoupon,
    couponsList,
    couponAction

}