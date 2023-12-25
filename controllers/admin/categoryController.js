const Category =require('../../models/categoryModel')
const product = require('../../models/productModel')

const fs = require('fs')

const loadCategoryform = async(req,res)=>{
    
        try {
            res.render('admin/addCategory')
        } catch (error) {
            console.log(error.message)
        }
    

}
const loadCategory = async(req,res)=>{
    try {
        const categorydata = await Category.find()
        res.render('admin/category',{categorydata,message:""})
    } catch (error) {
        console.log(error.message)
    }
}
const addCategory = async (req,res)=>{
    try {
        let{name,description}=req.body
        let image=''
        if(req.file){
            image=req.file.filename
        }
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp("^" + name, "i") } })
        if(existingCategory){
            res.render('admin/addCategory',{error:"Category with the same name already exists"})

        }else{
            const category = new Category({
                name:name,
                image,
                description:description
            })
            const categoryData =await category.save()
            res.redirect('/admin/category')
        }
    } catch (error) {

        console.log(error.message);
    }
}
const loadEditCategory = async(req,res)=>{
    try {
        const id =req.query.id
        const categoryData = await Category.findById(id)
        res.render('admin/editCategory',{category:categoryData})

    } catch (error) {
        console.log(error.message);
    }
}
const categoryEdit = async (req,res)=>{
    try {
        let id = req.body.category_id
        const updateData = await Category.findById(id)
        if(req.body.name){
            


            updateData.name = req.body.name
           
        }
        if(req.body.description){
            updateData.description = req.body.description
        }
        if(req.body.file){
            updateData.image = req.file.filename
        }
        await updateData.save()
        res.redirect('/admin/category')
    } catch (error) {
       console.log(error.message); 
    }
}
const listCategory = async (req,res)=>{
    try {
        const id = req.query.id
        const categoryData = await Category.findByIdAndUpdate({_id:id},{$set:{is_listed:true}})
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message)
    }
}
const unlistCategory = async(req,res)=>{
    try {
        const id =req.query.id
        const categoryData = await Category.findByIdAndUpdate({_id:id},{$set:{is_listed:false}})
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message)
    }
}
module.exports = {
    loadCategoryform,
    loadCategory,
    addCategory,
    loadEditCategory,
    categoryEdit,
    listCategory,
    unlistCategory
}