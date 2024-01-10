const bcrypt=require('bcrypt')
const User=require('../../models/userModel')
const Product = require('../../models/productModel')
const Category = require('../../models/categoryModel')
const message = require('../../config/nodemailer')
const Address = require('../../models/addressModel')
const Order = require('../../models/orderModel') 
const Banner = require('../../models/bannerModel')

const securePassword = async (password)=>{
    try {
        const passswordHash =await bcrypt.hash(password,10)
        return passswordHash
    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister=async (req,res)=>{
    try {
        res.render('user/registration')
    } catch (error) {
        console.log(error.message);

    }
}

const insertUser = async(req,res)=>{
    
    try {
        

        const email = req.body.email
        const mobile = req.body.mobile
        const name = req.body.name
        const password = req.body.password
        if(!email || !password || !mobile|| !name){
            return res.render('user/registration',{
                message:"Please fill  all the fields"
            })
        }
        const existMail = await User.findOne({email:email})
        
        if(existMail){
            res.render('user/registration',{message:"This user already exists"})

        }else{
            req.session.userData = req.body
            req.session.email = email
           

            res.redirect('/otp')
        }
    } catch (error) {
        console.log(error.message)
    }
}
const loadOtp = async (req,res)=>{
    try {
        const userData=req.session.userData
        const email=userData.email
        const data=await message.sendVerifyMail(req,email)
        
        res.render('user/otp')
        
    } catch (error) {
        console.log(error.message);
    }
}


const verifyOTP = async (req,res)=>{
    try {
        const userData = req.session.userData
        const firstDigit = req.body.first
        const secondDigit =req.body.second
        const thirdDigit =req.body.third
        const fourthDigit =req.body.fourth
        const fullOTP = firstDigit+secondDigit+
        thirdDigit+fourthDigit
        


        if(fullOTP==req.session.otp){
            const secure_password = await securePassword(userData.password)
            const user = new User({
                name:userData.name,
                email:userData.email,
                mobile:userData.mobile,
                password:secure_password,
                isAdmin:0,
                isBlocked:0
                

            })
            console.log(user);

            const userDataSave=await user.save()
            if(userDataSave && userDataSave.isAdmin==0){
                res.redirect('/')
                
            }else{
                res.render('user/otp',{message:"Invalid OTP"})
                
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}


const resendOTP = async (req,res)=>{
    try {
        const userData=req.session.userData
        const email=userData.email
        const data=await message.sendVerifyMail(req,email)
        res.render('user/otp')
    } catch (error) {
        console.log(error.message);
    }
}


const loadLogin=async (req,res)=>{
    try {
        res.render('user/login')
    } catch (error) {
        console.log(error.msg);
    }
}
const verifyLogin=async(req,res)=>{

    try {

        const {email,password}=req.body

        const userData=await User.findOne({email:email})

        if(userData){

            const passwordMatch=await bcrypt.compare(password,userData.password)

            if(passwordMatch && userData.isAdmin == 0){

                if(userData.isBlocked == 1){

                    res.render('user/login',{message:"Your Account has been blocked!!!"})
                }
                req.session.user_id =userData._id
                console.log(req.session.user_id);

                res.redirect('/')
            }
            else{
                res.render('user/login',{message:"Invalid user"})

                
            }
        }else{
            res.render('user/login')
        }

    } catch (error) {
        console.log(error.message);
    }
}
const forgotPassword = async (req,res)=>{

    try {

        res.render('user/forgotPassword')

    } catch (error) {

        console.log(error.message)

    }
}
const forgotOTP = async (req,res)=>{

    try {


         const {email}=req.body

         const existingUser = await User.findOne({email:email})

         if(existingUser){
            
            req.session.user_id = existingUser._id
            
            const data=await message.sendVerifyMail(req,email)
            
            res.redirect('/forgotOTP')
          

         }else{
        res.render('user/forgotPassword',{message:"Email id is not registered!!!"})
        
         }

        

        

    } catch (error) {
        console.log(error.message)
    }
}
const enterOTP = async (req,res)=>{
    try {

        res.render('user/OTP2')

    } catch (error) {

        console.log(error.message);
    }
}
const verifyForgot = async (req,res)=>{

    try {

        const firstDigit = req.body.first
        const secondDigit =req.body.second
        const thirdDigit =req.body.third
        const fourthDigit =req.body.fourth
        const fullOTP = firstDigit+secondDigit+
        thirdDigit+fourthDigit
        
        if(fullOTP==req.session.otp){
            
            res.redirect('/resetPassword')

            }


        

    } catch (error) {

        console.log(error.message);

    }
}
const resetPassword =async (req,res)=>{
    try {
        res.render('user/resetPassword')
    } catch (error) {
        console.log(error.message);
    }
}
const updatePassword =async (req,res)=>{

    try {

        const user_id  = req.session.user_id
        const password = req.body.password
        
        const secure_password = await securePassword(password)
        
        const updateData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password}})

        if(updateData){ 

            res.redirect('/login')

        }

    } catch (error) {

        console.log(error.message);
        
    }


}
const walletHistory = async (req,res)=>{
    try {
        const user = req.session.user_id
        const orders = await Order.find({
            $and: [
              { user: user },
              {
                $or: [
                  { status: 'Returned' },
                  { $and: [{ status: 'Cancelled' }, { paymentMethod: { $ne: 'cashOnDelivery' } }] },
                  { $and: [{ status: { $nin: ['Cancelled', 'Returned'] } }, { paymentMethod: 'Wallet' }] },
                ],
              },
            ],
          })
          .sort({ orderDate: -1 }) 
          .exec();
          
       
        console.log(orders);
        res.render('user/walletHistory',{orders:orders})

        

    } catch (error) {
        console.log(error.message);
    }
}
const loadHome=async (req,res)=>{
    try {
        const banner = await Banner.find()
        res.render('user/home',{banner})
    } catch (error) {
        console.log(error.msg);
    }
}
const loadAboutus = async (req,res)=>{
    try {
        res.render('user/aboutus.ejs')
    } catch (error) {
        console.log(error.message)
    }
}
const loadContactUs = async (req,res)=>{
    try {
        res.render('user/contactus')
    } catch (error) {
        console.log(error.message);
    }
}
const listItems = async (req, res) => {
    try {
        const userData = req.session.user_id;

        
        const categoryData = await Category.find();

       
        const selectedCategory = req.query.category_name;

       
        const categoryFilter = selectedCategory ? { category: selectedCategory } : {};

        
        
        const sort = req.query.sort
        let sortOption = {};
        if (sort === 'asc') {
            sortOption = { discount_price: 1 }; 
        } else if (sort === 'desc') {
            sortOption = { discount_price: -1 }; 
        } else {
            
            sortOption = {};
        }
        const page = req.query.page ||1
        const itemsPerPage=6
        const totalProducts=await Product.countDocuments({...categoryFilter})
        const totalPages =Math.ceil(totalProducts/itemsPerPage)
        
        const options = {
            page : page,
            limit :itemsPerPage,
            sort:sortOption
        }


        
        const productData = await Product.paginate({...categoryFilter},options);
        await Product.populate(productData, { path: 'category' });
        

        res.render('user/shop', {
            user: userData,
            products: productData.docs,
            categories: categoryData,
            selectedCategory: selectedCategory, 
            totalPages:totalPages,
            currentPage:productData.page,
            sort:sort
        });
    } catch (error) {
        console.log(error);
    }
};


const productDetails = async (req,res)=>{
    

    try {
        const id=req.query.id

        const productData = await Product.findById({_id:id})

        
        res.render('user/productDetails',{product:productData})

    } catch (error) {

        console.log(error.message);
    }
}
const userProfile = async (req,res)=>{

    try {
        const id = req.session.user_id

        

        const userData = await User.findById({_id:id})

        const address = await Address.find({user:id})

        

        res.render('user/userProfile',{user:userData,address:address})

    } catch (error) {

        console.log(error.message);

    }
}
const addAddressForm = async (req,res)=>{

    try {

        res.render('user/addAddressForm')

    } catch (error) {

        console.log(error.message)
    }

}
const addAddress = async (req, res) => {
    try {
       
        const id = req.session.user_id
        const{name,addressLine,city,postalCode,state,country,isDefault} = req.body

      const address = new Address({
        user: id,
        name,
        addressLine,
        city,
        postalCode,
        state,
        country,
        isDefault
      });
  
      
      await address.save(); 

      
  
      res.redirect('myAccount'); 
    } catch (error) {
      console.error(error.message);
    }
  };
  const addBillingAddress = async (req, res) => {
    try {
       
        const id = req.session.user_id
        const{name,addressLine,city,postalCode,state,country,isDefault} = req.body

      const address = new Address({
        user: id,
        name,
        addressLine,
        city,
        postalCode,
        state,
        country,
        isDefault
      });
  
      
      await address.save(); 

      
  
      res.redirect('/checkout'); 
    } catch (error) {
      console.error(error.message);
    }
  };
  const editAddress = async (req,res)=>{
    try {
        const id = req.query.id
        console.log(id)
        const address = await Address.findOne({_id:id})
        console.log(address);
        res.render('user/editAddress',{address:address})
    } catch (error) {
        console.log(error.message);
    }
  }
  const updateAddress = async (req,res)=>{

    try {

        const id = req.body.address_id

        const{name,addressLine,city,postalCode,state,country}=req.body

        const updateAddress = await Address.findByIdAndUpdate({_id:id},{$set:{name,addressLine,city,postalCode,state,country}})
        res.redirect('/myAccount')
        
    } catch (error) {

        console.log(error.message);

    }


  }
  const deleteAddress = async(req,res)=>{

    try {

        const id = req.query.id
        const deleteData = await Address.findByIdAndDelete({_id:id})
        res.redirect('/myAccount')

    } catch (error) {

        console.log(error.message);
    }
  }
  const editProfile = async(req,res)=>{

    try {
        const id = req.session.user_id

        const user = await User.findById({_id:id})

        res.render('user/editProfile',{user:user})

    } catch (error) {

        console.log(error.message)

    }


  }

  const updateProfile = async(req,res)=>{

    try {

        const id = req.session.user_id

        const{name,email,mobile} = req.body
        console.log(req.file,"kfhjfkjdk");
        
        if(!req.file){

            const updateData = await User.findByIdAndUpdate({_id:id},{$set:{name,email,mobile}})

        }else{

            const updateData = await User.findByIdAndUpdate({_id:id},{$set:{name,email,mobile,image:req.file.filename}})

        }

        

        

        
        res.redirect('/myAccount')

        
    } catch (error) {

        console.log(error.message);
    }

  }
  const loadEditPassword = async (req,res)=>{

    try {

        res.render('user/editPassword')

    } catch (error) {

        console.log(error.message)
    }

  }
  const editPassword = async (req,res)=>{

    try {
        const oldPassword = req.body.oldPassword
        

        const password = req.body.password
        const id = req.session.user_id
        
        const user = await User.findById({_id:id})
        console.log(oldPassword);
        console.log(user.password);
        const passwordMatch = await bcrypt.compare(oldPassword,user.password)
        console.log(passwordMatch)
        if(!passwordMatch){

            res.render('user/editPassword',{message:"Incorrect Password"})
        }else{
            const secure_password = await securePassword(password)

            const updateData = await User.findByIdAndUpdate({_id:id},{$set:{password:secure_password}})
            console.log(updateData);

        if(updateData){ 

            res.redirect('/myAccount')

        }

        }
    } catch (error) {
        console.log(error.message);
    }

  }
  
const userLogout = async (req,res)=>{
    try {
        const user = req.session.user_id
        req.session.destroy()
        console.log(user);
        res.redirect('/login')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={loadLogin,
loadRegister,
loadHome,
verifyLogin,
insertUser,
loadOtp,
verifyOTP,
resendOTP,
userLogout,
listItems,
forgotPassword,
productDetails,
userProfile,
addAddressForm,
addAddress,
editAddress,
forgotOTP,
enterOTP,
verifyForgot,
resetPassword,
updatePassword,
updateAddress,
deleteAddress,
editProfile,
updateProfile,
loadEditPassword,
editPassword,
walletHistory,
loadAboutus,
loadContactUs,
addBillingAddress




}