const Order = require('../../models/orderModel')
const Address = require('../../models/addressModel')
const User = require('../../models/userModel')

const Product = require('../../models/productModel')
const dateFun = require('../../config/dateData')

const ordersList = async (req,res)=>{
    try {
        
        const orders = await Order.find().sort({orderDate:-1})
        
        res.render('admin/orders',{order:orders})
    } catch (error) {
        console.log(error.message);
    }
}
const orderDetails = async(req,res)=>{
    try {
        const orderId = req.query.id
        const order = await Order.findById(orderId)
        .populate("user")
        .populate({
            path:"address",
            model:"Address",
        })
        .populate({
            path:"items.product",
            model:"Product"
        })
        res.render('admin/orderDetails',{order})
    } catch (error) {
        console.log(error.message);
    }
}
const orderStatusUpdate = async(req,res)=>{
    try {
        const orderId = req.query.id
        const status = req.query.status
        const order = await Order.findOne({_id:orderId})
        .populate("user")
        .populate({
            path:"address",
            model:"Address"
        })
        .populate({
            path:"items.product",
            model:"Product"
        })
        const updateData = await Order.findByIdAndUpdate({_id:orderId},{$set:{status:status}})
        res.render("admin/orderDetails",{order})
    } catch (error) {
        console.log(error.message);
    }
}
const loadSalesReport = async (req,res)=>{
    let query ={}
    if(req.query.status){
        if(req.query.status === "Daily"){
            query.orderDate = dateFun.getDailyDateRange()

        }else if(req.query.status === "Weekly"){
            query.orderDate = dateFun.getMonthlyDateRange()

        }
        else if (req.query.status === "Yearly"){
            query.orderDate = dateFun.getYearlyDateRange()
        }else if(req.query.status === "All"){
            query["status"] = "Delivered"
        }
    }
    try {
        const orders = await Order.find(query)
        .populate("user")
        .populate({
            path:"address",
            model:"Address"
        })
        .populate({
            path:"items.product",
            model:"Product"
        })
        .sort({orderDate:-1})
        const totalRevenue = orders.reduce((acc,order)=>acc+order.totalAmount,0)
        const totalSales = orders.length
        const totalProductsSold = orders.reduce((acc,order)=>acc+order.items.length,0)
        res.render("admin/salesReport",{
            orders,
            totalRevenue,
            totalSales,
            totalProductsSold,
            req
        })

    } catch (error) {
        console.error("Error fetching orders:",err)
        res.status(500).send("Error fetching orders")
    }
}

const dateFilter = async (req, res) => {
    const start = req.params.start;
    const end = req.params.end;

    let query = {};

    if (start && end) {
        
        query.orderDate = { $gte:start,
        $lt:end };
    }

    try {
        const orders = await Order.find(query)
            .populate("user")
            .populate({
                path: "address",
                model: "Address"
            })
            .populate({
                path: "items.product",
                model: "Product"
            })
            .sort({ orderDate: -1 });

            

        const totalRevanue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const totalSales = orders.length;
        const totalProductSold = orders.reduce((acc, order) => acc + order.items.length, 0);

        const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.orderDate).toLocaleDateString();
            const deliveryDate = new Date(order.deliveryDate).toLocaleDateString();
        
            // Check if orderDate is greater than or equal to start
            // and deliveryDate is less than or equal to end
            return orderDate >= start && deliveryDate <= end;
        });
        

       

        res.status(200).json({ success: true, totalProductSold, totalSales, totalRevanue, orders, message: "return successfully" });

    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, error: "Error fetching orders" });
    }
};
const downloadPdf = ()=>{
    const pdfPath = path.join(_dirname,'path/to/your/pdf.pdf')
    fs.readFile(pdfPath,(err,data)=>{
        if(err){
            res.status(500).send('Error occured while reading the PDF file')

        }else{
            res.setHeader('Content-Disposition','attachment;"your_pdf_file.pdf"')
            res.setHeader('Content-Type','application/pdf')
            res.status(200).json({success:true,data,message:"download successfull"})
        }
    })
}

module.exports = {
    ordersList,
    orderStatusUpdate,
    orderDetails,
    loadSalesReport,
    downloadPdf,
    dateFilter

}