const calculateSubTotal = (cart) => {
    let subtotal = 0;
    for (const cartItem of cart) {
        const priceToUse = cartItem.product.sale_price !== 0 ? cartItem.product.sale_price : cartItem.product.discount_price;
        subtotal += priceToUse * cartItem.quantity;
    }
    return subtotal;
};

const calculateProductTotal = (cart) => {
    const productTotals = [];
    for (const cartItem of cart) {
        const priceToUse = cartItem.product.sale_price !== 0 ? cartItem.product.sale_price : cartItem.product.discount_price;
        const total = priceToUse * cartItem.quantity;
        productTotals.push(total);
    }
    return productTotals;
};
 const calculateOldPrice = (cart)=>{
    let subtotal = 0
    for (const cartItem of cart) {
        
        subtotal += cartItem.product.discount_price * cartItem.quantity;
    }
    return subtotal;
 }
 const discountedPrice = (cart)=>{
    let subtotal = 0
    for (const cartItem of cart) {
        
        subtotal += cartItem.product.sale_price * cartItem.quantity;
    }
    return subtotal;
 }

module.exports = {
    calculateProductTotal,
    calculateSubTotal,
    calculateOldPrice,
    discountedPrice 
};
