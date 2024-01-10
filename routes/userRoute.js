const express=require('express')
const userRoute=express()
const userController=require('../controllers/user/userController')
const cartController = require('../controllers/user/cartController')
const orderController = require('../controllers/user/orderController')
const userAuth=require('../middlewares/userAuth')
const multer = require('../middlewares/multer')

//registration
userRoute.get('/register',userAuth.isLogout,userController.loadRegister)
userRoute.post('/register',userController.insertUser)
userRoute.get('/otp',userAuth.isLogout,userController.loadOtp)
userRoute.post('/otp',userController.verifyOTP)
userRoute.get('/resendOTP',userAuth.isLogout,userController.resendOTP)
userRoute.get('/forgotPassword',userController.forgotPassword)
userRoute.get('/forgotOTP',userController.enterOTP)
userRoute.post('/forgotPassword',userController.forgotOTP)
userRoute.post('/forgotOTP',userController.verifyForgot)
userRoute.get('/resetPassword',userController.resetPassword)
userRoute.post('/resetPassword',userController.updatePassword)
userRoute.get('/editPassword',userAuth.isLogin,userController.loadEditPassword)
userRoute.post('/editPassword',userAuth.isLogin,userController.editPassword)

//login
userRoute.get('/login',userAuth.isLogout,userController.loadLogin)
userRoute.post('/login',userController.verifyLogin)

//home
userRoute.get('/',userController.loadHome)
userRoute.get('/aboutus',userController.loadAboutus)
userRoute.get('/contactus',userAuth.isLogin,userController.loadContactUs)
userRoute.get('/shop',userAuth.isLogin,userController.listItems)
userRoute.get('/productDetails',userAuth.isLogin,userController.productDetails)




//UserProfile

userRoute.get('/myAccount',userAuth.isLogin,userController.userProfile)
userRoute.get('/addNewAddress',userController.addAddressForm)
userRoute.post('/addNewAddress',userController.addAddress)
userRoute.post('/addBillingAddress',userAuth.isLogin,userController.addBillingAddress)
userRoute.get('/editAddress',userController.editAddress)
userRoute.post('/editAddress',userController.updateAddress)
userRoute.get('/deleteAddress',userController.deleteAddress)
userRoute.get('/editProfile',userAuth.isLogin,userController.editProfile)
userRoute.post('/editProfile',multer.uploadProfilePic.single('image'),userController.updateProfile)


//Cart

userRoute.get('/cart',userAuth.isLogin,cartController.loadCart)
userRoute.post('/cart',cartController.addToCart)
userRoute.post('/updateCart', cartController.updateCart)
userRoute.delete('/removeCartItem',cartController.removeFromCart)

//checkout
userRoute.get('/checkout',orderController.loadChekout)
userRoute.post('/checkoutAddress',orderController.checkoutAddress)

//orders
userRoute.post('/checkout',orderController.placeOrder)
userRoute.get('/orderSuccess',orderController.loadOrderDetails)
userRoute.get('/orderDetails/:id',orderController.loadOrderHistory)
userRoute.get('/orderCancel',orderController.orderCancel)
userRoute.post('/razorPayOrder',userAuth.isLogin,orderController.razorPay)
userRoute.get('/orderReturn',userAuth.isLogin,orderController.orderReturn)
userRoute.post('/applyCoupon',userAuth.isLogin,orderController.applyCoupon)
userRoute.post('/removeCoupon',userAuth.isLogin,orderController.removeCoupon)
userRoute.get('/walletHistory',userAuth.isLogin,userController.walletHistory)



// logout
userRoute.get('/logout',userController.userLogout)
module.exports=userRoute
