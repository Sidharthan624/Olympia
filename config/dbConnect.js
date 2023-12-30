const mongoose=require('mongoose')

const dbConnection=()=>{
    try {
        const connect=mongoose.connect('mongodb+srv://sidharthanvu:7558911587@sidharthan.p0lwuqa.mongodb.net/olympia')
          console.log("Connected to mongodb")
    } catch (error) {
        console.log("Mongodb connection error:",err);
    }
}
module.exports=dbConnection