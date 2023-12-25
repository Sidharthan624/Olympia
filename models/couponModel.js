const mongoose = require('mongoose');

const Coupon = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        default: "Active"
    },
    isListed: {
        type: Boolean,
        default: true
    },
    appliedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model("Coupon", Coupon);
