const mongoose = require("mongoose");

const listSchema = mongoose.Schema({
    
    listName: {
        type: String,
        required: true,
        uppercase: true
    },

    stocks: Array
    
})

module.exports = mongoose.model('list', listSchema, 'listInfo');