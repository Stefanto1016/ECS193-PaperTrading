const mongoose = require('mongoose');
const cacheSchema = require('./cacheSchema');

/* addCacheStock(symbol, history)
Adds a singular stock to the cache (Does error catching for if a stock is added already)
symbol => the symbol of the stock you want to add
history => 3D Array from your API call */
async function addCacheStock(symbol, history)
{
    try {
        const symbolCheck = await cacheSchema.findOne({symbol: symbol});
        
        if (symbolCheck != undefined) {
            console.log("ERROR: Unable to add stock: symbol already in cache");
            return;
        } else {
            const stock = {
                symbol: symbol,
                history: history
            }
            await new cacheSchema(stock).save();
        }

    } catch(error) {
        console.log(error);
    }
}

/* updateCacheStock(symbol, history)
This function wipes a stocks history and updates it with new data (w/ error catching)
symbol => the symbol of the stock you want to update
history => new/updated 3D Array from your API*/
async function updateCacheStock(symbol, history)
{
    try {
        const stock = await cacheSchema.findOne({symbol: symbol});
        
        if (stock == undefined) {
            console.log("ERROR: Unable to update stock: symbol is not in cache");
            return;
        } else {
            const update = {history : history};
            await cacheSchema.findOneAndUpdate({symbol: symbol}, update);
        }
    } catch(error) {
        console.log(error);
    }
}

/* getHistory(symbol)
This function returns the 3D Array history of a given symbol (w/ error catching) 
symbol => the symbol of the stock you want to pull from collection */
async function getHistory(symbol)
{
    try {
        const stock = await cacheSchema.findOne({symbol: symbol});
        
        if (stock == undefined) {
            console.log("ERROR: Unable to update stock: symbol is not in cache");
            return;
        } else {
            return(stock.history);
        }
    } catch(error) {
        console.log(error);
    }
}

/* deleteCacheStock(symbol)
This function will remove a stocks document from the cache given the symbol
symbol => the name of the stock you want to delete */
async function deleteCacheStock(symbol)
{
    try {
        const stock = await cacheSchema.findOne({symbol: symbol});
    
        if (stock == undefined) {
            console.log("ERROR: Unable to update stock: symbol is not in cache");
            return;
        } else {
            await cacheSchema.findOneAndDelete({symbol: symbol})
        }
    } catch(error) {
        console.log(error);
    }
}

module.exports = {addCacheStock, updateCacheStock, getHistory, deleteCacheStock};