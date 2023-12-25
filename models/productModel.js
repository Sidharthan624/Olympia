const mongoose =require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const Product =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:[{
        type:String,
        required:true
    }],
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    brand:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    discount_price:{
        type:Number,
        required:true
    },
    stock:{
        type:Number
    },
    productColour:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:false
    },
    productAddDate:{
        type:Date,
        default:Date.now
    },
    is_listed:{
        type:Boolean,
        default:true
    },
    sale_price:{

        type:Number,
        default:0

    },
    
})
Product.plugin(mongoosePaginate)
module.exports = mongoose.model('Product',Product)