const mongoose = require("mongoose");

const cacheSchema = mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        uppercase: true
    },

    history: Array
    
})

module.exports = mongoose.model('cache', cacheSchema, 'cacheInfo');