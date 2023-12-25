const Cart = require('../../models/cartModel')
const User = require('../../models/userModel')
const {calculateProductTotal,calculateSubTotal} = require('../../config/cartFunctions')
const{calculateOldPrice} = require('../../config/cartFunctions')

const loadCart = async (req,res)=>{
    try {

        const userId = req.session.user_id

        const userData = await User.findById(userId)

        if(userData) {

            const userCart = await Cart.findOne({user:userId}).populate("items.product")

            if(userCart){

                const cart = userCart ? userCart.items : []

                const subtotal = calculateSubTotal(cart)
            
                const productTotal = calculateProductTotal(cart)
                 
                // const discountedPrice = discountedPrice(cart)

                
                const subtotalWithShipping = subtotal
                
                let outOfStockError= false

                if(cart.length > 0 ) {

                    for(const cartItem of cart){

                        const product = cartItem.product

                        if(product.quantity<cartItem.length){
                            outOfStockError = true
                            break
                        }
                    }
                }
                let maxQuantityErr = false
                if(cart.length > 0 ) {
                    for( const cartItem of cart){
                        const product = cartItem.product
                        if(cartItem.quantity >2) {
                            maxQuantityErr = true
                            break
                        }
                    }
                }
                res.render('user/cart',{userData,
                    productTotal,
                    subtotalWithShipping,
                    outOfStockError,
                    maxQuantityErr,
                    cart
                    
                    
                })
            }else{
                res.render("user/cart",{userData,cart:null})
            }
        }else{
            res.redirect('/login')
        }



       
    } catch (error) {
        console.error("Error Loading cart",error)
        res.status(500).send("Error loading cart")
    }
}
const addToCart = async (req,res)=>{
    try{
        const userId = req.session.user_id
        const product_Id = req.body.productData_id
        const {qty} = req.body
        const existingCart = await Cart.findOne({ user: userId })
        let newCart = {}
        if(existingCart){
            const existingCartItem = existingCart.items.find((item)=>item.product.toString() === product_Id)
            if(existingCartItem){
                existingCartItem.quantity += parseInt(qty)
            }else{
                existingCart.items.push({
                    product:product_Id,
                    quantity:parseInt(qty)
                })
            }
            existingCart.total = existingCart.items.reduce((total,item) => total + (item.quantity || 0),0)
            await existingCart.save()

        }else{
            newCart = new Cart({
                user:userId,
                items:[{ product:product_Id,quantity:parseInt(qty)}],
                total:parseInt(qty,0),
                
                
            })
           

            await newCart.save()
        }
        res.redirect('/cart')
    }catch(error){
        console.error("Error adding product to cart:",error);
    }
}
 const updateCartItemQuantity = async (req, res) => {
    const { productId, newQuantity } = req.body;

    try {
        // Assuming you are using Mongoose for MongoDB
        const result = await Cart.updateOne(
            { 'items._id': productId },
            { $set: { 'items.$.quantity': newQuantity } }
        );

        if (result.nModified > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Failed to update quantity.' });
        }
    } catch (error) {
        console.error('Error updating quantity in the database:', error);
        res.json({ success: false, message: 'Internal server error.' });
    }
};
const removeFromCart = async (req,res) => {
    try {
        const userId = req.session.user_id
        const productId = req.query.productId

        const existingCart = await Cart.findOne({ user: userId})
        if(existingCart){
            const updatedItems = existingCart.items.filter((item) => item.product.toString() !== productId)
            existingCart.items = updatedItems
            existingCart.total = updatedItems.reduce((total,item) => total + (item.quantity || 0),0)
            await existingCart.save()
            res.json({ success:true,toaster:true})
        }else{
            res.json({ success:false,error:"Cart not found"})
        }
    } catch (error) {
        console.error("Error removing cart item:",error)
        res.json({success:false,error: "Internal server error"})
    }
}

module.exports = {
    loadCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart
}
