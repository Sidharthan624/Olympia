const express=require('express')
const session=require('express-session')
const mongoose=require('mongoose')
const mongodb=require('mongodb')
const dbConnection = require('./config/dbConnect')
const path=require('path')
const userRoute=require('./routes/userRoute')
const adminRoute=require('./routes/adminRoute')
const config =require("./config/config")
require('dotenv').config()
const port=3000
const app=express()

dbConnection()


app.set('view engine','ejs')
app.set("views","./views")

app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'/public/assets')))
app.use(express.static(path.join(__dirname,'/public/userassets')))
app.use(express.static(path.join(__dirname,'/public/assets1')))


app.use(session({

    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true
}))

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
      next();
  });

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/',userRoute)
app.use('/admin',adminRoute)



// Error route for undefined routes:
adminRoute.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

userRoute.get('*', (req, res) => {
  res.status(404).send('Page not found');
});





const server=app.listen(port,()=>{

 console.log(`Server listening at http://localhost:${port}` )

})