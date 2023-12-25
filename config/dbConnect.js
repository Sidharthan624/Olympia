const mongoose=require('mongoose')

const dbConnection=()=>{
    try {
        const connect=mongoose.connect('mongodb://127.0.0.1:27017/olympia')
          console.log("Connected to mongodb")
    } catch (error) {
        console.log("Mongodb connection error:",err);
    }
}
module.exports=dbConnection