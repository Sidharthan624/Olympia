const Banner = require("../../models/bannerModel")


const loadBanner = async(req,res)=>{
  try {

    const banner = await Banner.find()
    
    
    const itemsperpage = 2;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(banner.length / 2);
    const currentproduct = banner.slice(startindex,endindex);

    res.render("admin/banner",{totalpages,currentpage,banner:currentproduct})
    
  } catch (error) {
    res.status(500).render('users/page-500', { error });
  }
}

const loadAddBanner = async(req,res)=>{
  try {

    res.render("admin/addBanner")
    
  } catch (error) {
    res.status(500).render('users/page-500', { error });
  }
}


const addBanner = async(req,res)=>{
  try {

    let {title,description,link} = req.body
    let image = ""

    if(req.file){
      image = req.file.filename
    }

    const existingBanner = await Banner.findOne({title})

    if(existingBanner){
      return res.render("admin/addBanner",{error:"banner with same title is alrady exist"})
    }else{

      const banner = new Banner({
        title,
        description,
        link,
        date:Date.now(),
        image:image
      })

      const bannerData = await banner.save()
      res.redirect("/admin/loadBanner")

    }


    
  } catch (error) {
    res.status(500).render('users/page-500', { error });
  }
}

const loadEditForm = async (req, res) => {
  try {
    const id = req.query.id;

    // Assuming Banner is a mongoose model
    const bannerData = await Banner.findById(id);

    // Pass the bannerData to the rendering engine
    res.render("admin/editBanner", { bannerData });
  } catch (error) {
    console.log(error.message);
    // Handle the error and possibly send an error response to the client
    res.status(500).send("Internal Server Error");
  }
};

const updateBanner = async (req, res) => {
  try {
    const id = req.body.banner_id;

    // Find the banner by ID
    const updateData = await Banner.findById(id);

    // Check if the banner is not found
    if (!updateData) {
      console.log("Banner not found for ID:", id);
      return res.status(404).send("Banner not found");
    }

    // Update properties if they exist in the request body
    if (req.body.title) {
      updateData.title = req.body.title;
    }
    if (req.body.description) {
      updateData.description = req.body.description;
    }
    if (req.body.link) {
      updateData.link = req.body.link;
    }
    if (req.file) {
      updateData.image = req.file.filename;
    }

    // Save the updated data
    await updateData.save();
    res.redirect("/admin/loadBanner");
  } catch (error) {
    console.log(error.message);
    // Handle the error and possibly send an error response to the client
    res.status(500).send("Internal Server Error");
  }
};

const deleteBanner = async (req, res) => {
  try {
    const id = req.params.id;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({ success: false, error: 'Banner not found' });
    }

    res.status(200).json({ success: true, message: 'Banner deleted successfully' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Error occurred while deleting banner' });
  }
}





module.exports = {
  loadBanner,
  loadAddBanner,
  addBanner,
  loadEditForm,
  updateBanner,
  deleteBanner
}