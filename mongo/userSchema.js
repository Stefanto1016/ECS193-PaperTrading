const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true
    },

    stocks: Object,

    balance: Object
})

module.exports = mongoose.model('users', userSchema, 'userInfo');