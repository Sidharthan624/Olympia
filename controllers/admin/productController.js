const Product = require('../../models/productModel')
const Category =require('../../models/categoryModel')
const fs = require('fs')

const gender=['gents','ladies']

const loadProducts =async (req,res)=>{
    try {
        const products = await Product.find()
        const categories = await Category.find()
        
        res.render('admin/products',{products,categories})
    } catch (error) {
        console.log(error.message);
    }
}
const loadProductForm = async (req,res)=>{
    try {
        let categories = await Category.find({})
            res.render('admin/addProduct',{categories,gender})
    }catch (error) {
        console.log(error.message)
    }
}

const addProduct = async(req,res)=>{
    try {
        
        const image  = req.files.map((x)=>x.filename)
        
        const {name,categoryData,price,discountPrice,productColour,gender,brand,description,stockInput}=req.body
        
        const category=Category.find({category:categoryData})
        const sizeData = req.body.sizes
        
        const addProducts =new Product({
            name:name,
            category:categoryData,
            price:price,
            discount_price:discountPrice,
            productColour:productColour,
            gender:gender,
            brand:brand,
            description:description,
            stock:stockInput,
            image
        })
        await addProducts.save()
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message)
    }
}
const loadEditProductForm = async(req,res)=>{
    try {
        const id = req.query.id
        const product = await Product.findOne({_id:id})
        let categories = await Category.find({})
        res.render('admin/editProduct',{categories,gender,product})
    } catch (error) {
        console.log(error.message);
    }
}
// 
const updateProduct = async (req, res) => {
    try {
        console.log('product update');
        // Assuming product is fetched from the database somewhere in your code
        const product = await Product.findById(req.body.product_id);

        const images = [];
        const deleteData = []; // Initialize deleteData

        // Assuming req.files contains the uploaded files
        

        const newImages = req.files.map((x) => x.filename);

        const { name, categoryData, price, discountPrice, productColour, gender, brand, description,stockInput } = req.body;
        

        
        if (req.body.deletecheckbox) {
           
            deleteData.push(req.body.deletecheckbox);
            
           
            const deleteIndices = deleteData.flat().map(x => Number(x));

          
            images.push(...product.image.filter((img, idx) => !deleteIndices.includes(idx)));
        } else {
            
            images.push(...product.image.map((img) => img));
        }

       
        images.push(...newImages);

        
       await Product.findByIdAndUpdate(
            { _id: req.body.product_id },
            {
                $set: {
                    name,
                    category: categoryData,
                    price,
                    discount_price: discountPrice,
                    productColour,
                    gender,
                    brand,
                    description,
                    stock: stockInput,
                    image: images, 
                },
            }
        );

        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
        
        res.status(500).send('Internal Server Error');
    }
};

const deleteProduct =async(req,res)=>{
    try {
        const productId = req.params.id
        const result = await Product.findByIdAndDelete(productId)
        if(result && result.image !=''){
            try {
                result.image.map((value)=>fs.unlinkSync('public/assets/images/productIMG/'+ value))
            } catch (error) {
                console.log(error.message)
            }
        }
        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message)
    }
}
module.exports = {
    loadProducts,
    loadProductForm,
    addProduct,
    loadEditProductForm,
    updateProduct,
    deleteProduct
}