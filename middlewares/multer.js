const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,'public/assets/imgs/category')
    },
    filename: function (res,file,cb){
        const fileName = Date.now() + path.extname(file.originalname)
        cb(null,fileName)
    }
})
const storageproductIMG = multer.diskStorage({
    destination:function (res,file,cb){
        cb(null,'public/assets/imgs/productIMG')
    },
    filename:function(req,file,cb){
        const fileName = Date.now() + path.extname(file.originalname)
        cb(null,fileName)
    }
})
const storageprofilePic = multer.diskStorage({
   
    destination:function (res,file,cb){
        cb(null,'public/assets/imgs/profilePic')
    },
    filename:function(req,file,cb){
        console.log(file,"llll");
        const fileName = Date.now() + path.extname(file.originalname)
        cb(null,fileName)
    }
})


module.exports = {
    uploadCategory:multer({storage:storage}),
    uploadProduct:multer({storage:storageproductIMG}),
    uploadProfilePic:multer({storage:storageprofilePic}),
    

}