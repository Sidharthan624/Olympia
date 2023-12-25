const mongoose = require('mongoose')
const orderSchema =  new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    address: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address',
    },
    orderDate: {
        type: Date,
        default:Date.now,

    },
    deliveryDate: {
        type:Date,
    },
    shiping:{
        type:String,
        default:'Free Shiping'
    },
    status:{
        type:String,
        default:'pending'
    },
    reason:{
        type:String
    },
    totalAmount :{
        type:Number,
        required:true,
    },
    paymentMethod:{
        type:String,
        required:true
    },
    paymentStatus:{
        type:String,
        required:true
    },
    items:[
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref:'Product'
            },
            quantity:Number,
            price:Number
        },
    ]

})
module.exports = mongoose.model('Order',orderSchema)