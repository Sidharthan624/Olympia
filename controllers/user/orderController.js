const User = require('../../models/userModel')
const Address = require('../../models/addressModel')
const Order = require('../../models/orderModel')
const Product = require('../../models/productModel')
const Cart = require ('../../models/cartModel')
const Coupon = require('../../models/couponModel')
require('dotenv').config()

const RazorPay = require('razorpay')


var instance = new RazorPay({
    key_id:process.env.RAZOR_PAY_ID,
    key_secret:process.env.RAZOR_PAY_SECRET
})

const {calculateProductTotal, calculateSubTotal,calculateOldPrice}=require('../../config/cartFunctions')

const loadChekout = async (req, res) => {
    try {
        const userId = req.session.user_id;

        const userData = await User.findById(userId);

        const cart = await Cart.findOne({ user: userId }).populate({
            path: "items.product",
            model: "Product",
        });

        if (!cart) {
            console.log("Cart not found");
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const cartItems = cart.items || [];
        if(cartItems.product=='undefined'){
            res.redirect('/shop')
        }
        
        // Validate quantity against product stock
        const invalidItems = cartItems.filter(item => item.quantity > item.product.stock);

        if (invalidItems.length > 0) {
            // Quantity validation failed
            return res.status(400).json({
                success: false,
                message: "Quantity of one or more items exceeds available stock",
            });
        }

        // Proceed with rendering the checkout page
        const subtotal = calculateSubTotal(cartItems);
        const productTotal = calculateProductTotal(cartItems);
        const oldPrice = calculateOldPrice(cartItems);
        const subtotalWithShipping = subtotal;
        const addressData = await Address.find({ user: userId });
        const coupon = await Coupon.findOne({ appliedUsers: userId });

        res.render("user/checkout", {
            userData,
            addressData,
            cart: cartItems,
            productTotal,
            subtotalWithShipping,
            coupon,
            oldPrice,
        });

    } catch (error) {
        console.error("Error fetching user data and address", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



const checkoutAddress= async (req,res) =>{
    try {
        const user = req.session.user_id

        const{name,addressLine,city,state,postalCode} = req.body

        const addressData = await Address.findOneAndUpdate({user:user},{$set:{addressLine,city,state,postalCode}})
        res.redirect('/checkout')

    } catch (error) {
        console.log(error.message);
    }
}
const applyCoupon = async (req, res) => {
    try {
        const couponCode = req.body.couponCode;
        const existCoupon = await Coupon.findOne({ couponCode });

        if (!existCoupon || existCoupon.status !== "Active") {
            return res.status(400).json({ error: "Invalid or inactive coupon code" });
        }

        const userId = req.session.user_id;

        // Check if the user has already applied the coupon
        if (existCoupon.appliedUsers.includes(userId)) {
            return res.status(400).json({ error: "Coupon is already applied by the user" });
        }

        const cart = await Cart.findOne({ user: userId }).populate({
            path: "items.product",
            model: "Product",
            
        }).exec();

        if (!cart) {
            return res.status(400).json({ error: "Cart not found" });
        }

        // Update products with the coupon discount
        // const discountAmount = (existCoupon.discountPercentage / 100) *product.discount_price ;

        for (const cartItem of cart.items) {
            const product = await Product.findById(cartItem.product._id);
            const discountAmount = (existCoupon.discountPercentage / 100) *product.discount_price 
            // Ensure that 'product' is a mongoose document
            product.sale_price = product.discount_price - discountAmount 
            await product.save();
        }
        

        // Save the coupon ID to the Coupon model
        existCoupon.appliedUsers.push(userId);
        await existCoupon.save();

        // Save the coupon ID in the cart
        cart.coupon = existCoupon._id;
        await cart.save();
        console.log(cart.items);
        

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const removeCoupon = async (req, res) => {
    try {
        const user = req.session.user_id;

        // Find the cart for the user
        const cart = await Cart.findOne({ user }).populate({
            path: 'items.product',
            model: 'Product'
        }).exec();

        // Remove the coupon from the user's applied coupons
        const removedCoupon = await Coupon.findOneAndUpdate(
            { appliedUsers: user },
            { $pull: { appliedUsers: user } },
            { new: true }
        );

        if (!removedCoupon) {
            // Handle the case where the coupon wasn't found in the Coupon model
            return res.status(404).send({ error: 'Coupon not found for the user' });
        }

        // Reset sale prices in the user's cart
        for (const cartItem of cart.items) {
            const product = await Product.findById(cartItem.product._id);
            product.sale_price = 0;
            await product.save();
        }

        // Save the changes to the cart
        await cart.save();

        // Send a response indicating success
        res.status(200).send({ message: 'Coupon successfully removed' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};










const razorPay = async(req,res)=>{

    try {
        const userId = req.session.user_id
        const {address,paymentMethod} = req.body
        const user =await User.findById(userId)
        const cart = await Cart.findOne({user:userId})
        .populate({
            path:"items.product",
            model:"Product"
        })
        .populate("user")

        if(!user || !cart){
            return res.status(500).json({success:false,error:"User or cart not found"})
        }
        if(!address){

            return res.status(400).json({error:"Billing address not selected"})

        }

        const cartItems = cart.items || []

        const totalAmount = cartItems.reduce(
            (acc, item) =>
                acc +
                ((item.product.sale_price !== 0 ? item.product.sale_price : item.product.discount_price) *
                    item.quantity ||
                    0),
            0
        );
        const options = {
            amount:Math.round(totalAmount * 100),
            currency:'INR',
            receipt:`order_${Date.now()}`,
            payment_capture:1
        }
        instance.orders.create(options,async(err,razorPay)=>{
            if(err){
                console.error("Error occured while placing order:",err)
                return res.status(400).json({success:false,error:"Payment Failed",user})
            }else{
                res.status(201).json({
                    success:true,
                    message:"Order placed successfully.",
                    order:razorPay
                })
            }
        })

        
    } catch (error) {

        console.error("An error occured while placing the order:",error)
        return res.status(400).json({success:false,error:"Payment failed"})
        
    }
}
const placeOrder = async (req, res) => {
    console.log("place order");
    try {
        console.log("place order");
        const userId = req.session.user_id;
        const user = await User.findOne({ _id: userId });
        const { address, paymentMethod } = req.body;

        const cart = await Cart.findOne({ user: user })
            .populate({
                path: 'items.product',
                model: 'Product'
            })
            .populate('user');

        if (!user || !cart) {
            return res.status(500).json({ error: 'User or cart not found' });
        }

        if (!address) {
            return res.status(400).json({ error: 'Billing address not selected' });
        }

        const cartItems = cart.items || [];
        const insufficientStockItem = cartItems.find((cartItem) => {
            return cartItem.quantity > cartItem.product.stock;
        });

        if (insufficientStockItem) {
            const errorMessage = `Insufficient stock for ${insufficientStockItem.product.name}`;
            return res.status(400).json({ success: false, error: errorMessage });
            // You can also use swal or any other method to display the error to the user on the frontend
        }

        // Calculate totalAmount
        const totalAmount = cartItems.reduce(
            (acc, item) =>
                acc +
                ((item.product.sale_price !== 0 ? item.product.sale_price : item.product.discount_price) *
                    item.quantity ||
                    0),
            0
        );

        // Check payment method and process accordingly
        if (paymentMethod === 'Wallet') {
            if (totalAmount <= user.walletBalance) {
                user.walletBalance -= totalAmount;
                await user.save();

                // Create and save order
                const order = new Order({
                    user: user,
                    address: address,
                    orderDate: new Date(),
                    status: 'Confirmed',
                    paymentMethod: paymentMethod,
                    paymentStatus: 'Success',
                    totalAmount: totalAmount,
                    deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
                    items: cartItems.map((cartItem) => ({
                        product: cartItem.product._id,
                        quantity: cartItem.quantity,
                        price: cartItem.product.discount_price
                    }))
                });
                await order.save();

                // Reduce product stock
                cartItems.forEach(async (cartItem) => {
                    const product = cartItem.product;
                    product.stock -= cartItem.quantity;
                    await product.save();
                });
            } else {
                return res.status(500).json({ success: false, error: 'Insufficient Balance' });
            }
        } else if (paymentMethod === 'onlinePayment' || paymentMethod === 'CashOnDelivery') {
            // Create and save order
            const order = new Order({
                user: userId,
                address: address,
                orderDate: new Date(),
                status: 'Confirmed',
                paymentMethod: paymentMethod,
                paymentStatus: paymentMethod === 'onlinePayment' ? 'Success' : 'Pending',
                deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
                totalAmount: totalAmount,
                items: cartItems.map((cartItem) => ({
                    product: cartItem.product._id,
                    quantity: cartItem.quantity,
                    price: cartItem.product.discount_price
                }))
            });
            await order.save();

            // Reduce product stock
            cartItems.forEach(async (cartItem) => {
                const product = cartItem.product;
                product.stock -= cartItem.quantity;
                product.sale_price=0
                await product.save();
            });
        }

        // Reset cart
        cart.items = [];
        cart.total = 0;
        await cart.save();

        res.status(200).json({ success: true, message: 'Order placed successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const loadOrderDetails = async (req,res)=>{
    try {
        const userId = req.session.user_id
        const userData = await User.findById(userId)
        console.log(userData);
        const order = await Order.find({user:userData._id})
        .populate('user')
        
        .populate({path:'items.product',
        model:'Product'
        
    }).sort({orderDate:-1})
    console.log(order)

    if(userData){
        res.render('user/orders',{userData,order})
    }else{
        res.redirect('/login')
    }


    } catch (error) {
        console.log(error.message);
    }
}
const loadOrderHistory = async(req,res)=>{

    try {
        const userId = req.session.user_id
        const orderId = req.params.id
        const userData = await User.findById(userId)
        const order = await Order.findById(orderId)
        .populate('user')
        .populate({
            path:"address",
            model:"Address"
        })
        .populate({
            path:"items.product",
            model:"Product"
        })
        res.render('user/orderDetails',{userData,order})

    } catch (error) {
        console.log(error.message);
    }
}
const orderCancel = async (req, res) => {
    try {
        const orderId = req.query.id;
        const userId = req.session.user_id;
        const userData = await User.findById(userId);
        const order = await Order.findById(orderId)
            .populate('user')
            .populate({
                path: 'address',
                model: 'Address',
            })
            .populate({
                path: 'items.product',
                model: 'Product',
            });
        const user = order.user;

        if (order.paymentMethod === 'Wallet' || order.paymentMethod === 'onlinePayment') {
            user.walletBalance += order.totalAmount;
            order.paymentStatus = 'Refunded';
            await user.save();
            await order.save();
        } else {
            order.paymentStatus = 'Declined';
            await order.save();
        }

        if (order.status === 'Confirmed') {
            // Increase stock for each product in the canceled order
            for (const item of order.items) {
                const product = item.product;
                product.stock += item.quantity;
                await product.save();
            }

            // Update order status to "Cancelled"
            const updateData = await Order.findByIdAndUpdate(
                { _id: orderId },
                { $set: { status: 'Cancelled' } }
            );
        }

        console.log(user.walletBalance);

        res.redirect('/orderSuccess');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const orderReturn = async (req, res) => {
    try {
        const orderId = req.query.id;

        const order = await Order.findOne({ _id: orderId })
            .populate('user')
            .populate({
                path: 'items.product',
                model: 'Product',
            });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        const user = order.user;

        // If the payment method is Wallet or onlinePayment, refund the wallet balance
        if (order.paymentMethod === 'Wallet' || order.paymentMethod === 'onlinePayment') {
            user.walletBalance += order.totalAmount;
            await user.save();
        }

        // Mark the order as Returned
        order.status = 'Returned';
        await order.save();

        // Restore the stock of the returned products
        for (const item of order.items) {
            const product = item.product;
            product.stock += item.quantity;
            await product.save();
        }

        res.status(200).json({ success: true, message: 'Return Successful' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = {
    loadChekout,
    checkoutAddress,
    placeOrder,
    loadOrderDetails,
    loadOrderHistory,
    orderCancel,
    razorPay,
    orderReturn,
    applyCoupon,
    removeCoupon

}