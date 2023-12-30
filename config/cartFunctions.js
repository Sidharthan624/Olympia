const calculateSubTotal = (cart) => {
    let subtotal = 0;
    for (const cartItem of cart) {
        const priceToUse = cartItem.product.sale_price !== 0 ? cartItem.product.sale_price : cartItem.product.discount_price;
        subtotal += priceToUse * cartItem.quantity;
    }
    return Math.round(subtotal);
};

const calculateProductTotal = (cart) => {
    const productTotals = [];
    for (const cartItem of cart) {
        const priceToUse = cartItem.product.sale_price !== 0 ? cartItem.product.sale_price : cartItem.product.discount_price;
        const total = priceToUse * cartItem.quantity;
        productTotals.push(Math.round(total));
    }
    return Math.round(productTotals) ;
};

const calculateOldPrice = (cart) => {
    let subtotal = 0;
    for (const cartItem of cart) {
        subtotal += cartItem.product.discount_price * cartItem.quantity;
    }
    return Math.round(subtotal);
};

const discountedPrice = (cart) => {
    let subtotal = 0;
    for (const cartItem of cart) {
        subtotal += cartItem.product.sale_price * cartItem.quantity;
    }
    return Math.round(subtotal);
};


module.exports = {
    calculateProductTotal,
    calculateSubTotal,
    calculateOldPrice,
    discountedPrice 
};
