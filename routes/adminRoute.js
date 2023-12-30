const express = require("express")
const adminRoute =express()
const multer = require('../middlewares/multer')
const adminController = require('../controllers/admin/adminController')
const categoryController = require('../controllers/admin/categoryController')
const productController = require('../controllers/admin/productController')
const orderController = require('../controllers/admin/orderController')
const couponController = require('../controllers/admin/couponController')
const adminAuth = require('../middlewares/adminAuth')

adminRoute.get('/',adminAuth.isLogout,adminController.loadAdminLogin)
adminRoute.post('/',adminController.verifyLogin)
adminRoute.get('/logout',adminController.adminLogout)

adminRoute.get('/home',adminAuth.isLogin,adminController.loadHome)

//add category

adminRoute.get('/category',adminAuth.isLogin,categoryController.loadCategory)
adminRoute.get('/addCategory',categoryController.loadCategoryform)
adminRoute.post('/addCategory',multer.uploadCategory.single('image'),categoryController.addCategory)
adminRoute.get('/editCategory',categoryController.loadEditCategory)
adminRoute.post('/editCategory',multer.uploadCategory.single('image'),categoryController.categoryEdit)
adminRoute.get('/listCategory',categoryController.listCategory)
adminRoute.get('/unlistCategory',categoryController.unlistCategory)
//products
adminRoute.get('/products',adminAuth.isLogin,productController.loadProducts)
adminRoute.get('/addProduct',adminAuth.isLogin,productController.loadProductForm)
adminRoute.post('/addProduct',adminAuth.isLogin,multer.uploadProduct.array('image'),productController.addProduct)
adminRoute.get('/editProduct',adminAuth.isLogin,productController.loadEditProductForm)
adminRoute.post('/editProduct',adminAuth.isLogin,multer.uploadProduct.array('image'),productController.updateProduct)
adminRoute.get('/deleteProduct/:id',adminAuth.isLogin,productController.deleteProduct)

adminRoute.get('/usersList',adminAuth.isLogin,adminController.listUsers)
adminRoute.get('/block',adminAuth.isLogin,adminController.blockUser)
adminRoute.get('/unBlock',adminAuth.isLogin,adminController.unBlockUser)

//orders

adminRoute.get('/orderlist',adminAuth.isLogin,orderController.ordersList)
adminRoute.get('/orderDetails',adminAuth.isLogin,orderController.orderDetails)
adminRoute.get('/orderStatusUpdate',adminAuth.isLogin,orderController.orderStatusUpdate)
adminRoute.get('/salesReport',adminAuth.isLogin,orderController.loadSalesReport)
//coupons
adminRoute.get('/addCoupon',adminAuth.isLogin,couponController.addCouponForm)
adminRoute.post('/addCoupon',adminAuth.isLogin,couponController.addCoupon)
adminRoute.get('/coupons',adminAuth.isLogin,couponController.couponsList)
adminRoute.get('/unlistCoupon',adminAuth.isLogin,couponController.couponAction)
module.exports = adminRoute