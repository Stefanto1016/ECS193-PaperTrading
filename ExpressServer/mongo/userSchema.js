const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true
    },

    buyingPower: Number,

    stocks: Object,

    balance: Object,

    watchList: Array
})

module.exports = mongoose.model('user', userSchema, 'userInfo');