const mongoose=require('mongoose')

const dbConnection=()=>{
    try {
        const connect=mongoose.connect(`${process.env.MONGO_DB}`,{
            // useNewUrlParser:true,
            // useUnifiedTopology:true
        })
          console.log("Connected to mongodb")
    } catch (error) {
        console.log("Mongodb connection error:",err);
    }
}
module.exports=dbConnection