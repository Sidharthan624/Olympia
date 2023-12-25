const mongoose = require('mongoose')
const Address = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },

    name:{

        type:String,
        required:true

    },
    addressLine:{

        type:String,
        required:true
    },
    city:{

        type:String,
        required:true

    },
    postalCode:{

        type:Number,
        required:true

    },
    state:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    isDefault:{
        type:Boolean,
        default:false
    },
    isListed:{
        type:Boolean,
        default:true
    }

})
module.exports = mongoose.model('Address',Address)