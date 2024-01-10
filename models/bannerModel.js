const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var bannerSchema = new mongoose.Schema({
    image:{
        type:String,
        required:true,
       
    },
    title:{
        type:String,
        required:true,
        
    },
    description:{
        type:String,
        required:true,
       
    },
    link:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now()
    },
    is_listed:{
        type:Boolean,
        default:true
    }
});

module.exports = mongoose.model('Banner', bannerSchema);