const query = require('./query');
const database = require('./mongo/database');
const cache = require('./mongo/cache');
const list = require('./mongo/list');
const tree = require('./tree');
const express = require('express');
const app = express();
const port = 8000;
const MSinDay = 24*60*60*1000;
//const MSinDay = 1000*60*5;

/*var cors = require("cors");
app.use(cors);*/

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
})

app.listen(port, async () => 
{
    console.log("starting");
    await database.connect();
    await tree.createTree();
    console.log("started");
})

process.on('exit', function() 
{
    database.disconnect();
    console.log("closing");
});

setInterval(update, MSinDay);



app.get('/update', (req, res) => 
{
    update();
})

// /buyStock?userKey=thomasguelk@gmail.com&stock=AAPL&amount=10

app.get('/buyStock', async (req, res) => 
{
    const userKey = req.query.userKey;
    const stock = req.query.stock;
    const amount = parseFloat(req.query.amount);
    const st = await buyStock(userKey, stock, amount);
    const ret = {buyingPower: st};
    res.send(ret);
})


app.get('/sellStock', async (req, res) => 
{
    const userKey = req.query.userKey;
    const stock = req.query.stock;
    const amount = parseFloat(req.query.amount);
    const st = await sellStock(userKey, stock, amount);
    const ret = {buyingPower: st};
    res.send(ret);
})



app.get('/getPortfolioData', async (req, res) => 
{
    const userKey = req.query.userKey;
    const ret = await getPortfolioData(userKey);
    res.send(ret);
})

app.get('/getSpecificStock', async (req, res) => 
{
    const userKey = req.query.userKey;
    const stock = req.query.stock;
    const st = await stockQuantity(userKey, stock);
    const ret = {quantity: st};
    res.send(ret);
})



app.get('/getHistoricalData', async (req, res) => 
{
    const stock = req.query.stock;
    const ret = await getHistoricalData(stock);
    res.send(ret);
})

app.get('/getStocks', async(req, res) =>
{
    const heading = req.query.heading;
    let array = await tree.getStocks(heading);
    res.send(array);
}
)


async function update()
{
    console.log("updating");
    updateStockList();
    updatePortfolioValues();
    flushCache();
    tree.createTree();
}


async function buyStock(userKey, stock, amount)
{
    let stockData = await query.getCurrentData([stock]);
    let stockPrice = stockData[stock]["askPrice"];
    let stocksHeld = await database.stockQuantity(userKey, stock);
    let buyingPower = await database.getBuyingPower(userKey);
    if(buyingPower < stockPrice*amount)
    {
        console.log("This user doesn't have enough funds");
        return(false);
    }
    else
    {
        let newBuyingPower = buyingPower-stockPrice*amount;
        await database.updateStock(userKey, stock, stocksHeld+amount);
        await database.updateBuyingPower(userKey, newBuyingPower);
        return(newBuyingPower);
    }
}


async function sellStock(userKey, stock, amount)
{
    let stockData = await query.getCurrentData(stock);
    let stockPrice = stockData[stock]["bidPrice"];
    let stocksHeld = await database.stockQuantity(userKey, stock);
    if(stocksHeld < amount)
    {
        console.log("This user doesn't own enough of this stock");
    }
    else if(stocksHeld == amount)
    {
        await sellAllStock(userKey, stock);
    }
    else
    {
        await database.updateStock(userKey, stock, stocksHeld-amount);
        let currentBuyingPower = await database.getBuyingPower(userKey);
        let newBuyingPower = currentBuyingPower+stockPrice*amount;
        await database.updateBuyingPower(userKey, newBuyingPower);
        return newBuyingPower;
    }
}


async function sellAllStock(userKey, stock)
{
    let stockData = await query.getCurrentData(stock);
    let stockPrice = stockData[stock]["bidPrice"];
    let stocksHeld = await database.stockQuantity(userKey, stock);
    let currentBuyingPower = await database.getBuyingPower(userKey);
    await database.updateBuyingPower(userKey, currentBuyingPower+stocksHeld*stockPrice);
    await database.deleteStock(userKey, stock);
}


async function getPortfolioData(userKey)
{
    let portfolioData = await database.getUser(userKey);
    return(portfolioData);
}


async function getHistoricalData(stock)
{
    let numDataPoints = await query.getNumDataPoints("GOOG")
    let historicalData = await query.getPreviousData(stock, numDataPoints);
    return(historicalData);
}

async function stockQuantity(userKey, stock)
{
    let stockQuantity = await database.stockQuantity(userKey, stock)
    return(stockQuantity);
}



async function updateStockList()
{
    const oldStockList = await list.getList("ALL_STOCKS");
    const newStockList = await query.getStockList();
    let hashmap = new Map();
    var removedStocks = [];
    for(let i = 0; i < newStockList.length; i++)
    {
        hashmap.set(newStockList[i]["symbol"], 1);
    }
    for(let i = 0; i < oldStockList.length; i++)
    {
        if(hashmap.has(oldStockList[i]["symbol"]) == false)
        {
            removedStocks.push(oldStockList[i]["symbol"]);
        }
    }
    await list.setList("ALL_STOCKS", newStockList);
    await handleRemovedStocks(removedStocks);
}

async function handleRemovedStocks(removedStocks)
{
    let accountList = await database.getAccountList();
    for(let i = 0; i < removedStocks.length; i++)
    {
        for(let j = 0; j < accountList.length; j++)
        {
            let stockQuantity = await database.stockQuantity(accountList[j], removedStocks[i]);
            if(stockQuantity != 0)
            {
                await sellAllStock(accountList[j], removedStocks[i]);
            }
        }
    }
}


async function updatePortfolioValues()
{
    let accountList = await database.getAccountList();
    for(let i = 0; i < accountList.length; i++)
    {
        let userStockList = await database.getUserStockList(accountList[i]);
        userStockList = Object.keys(userStockList);
        let userBalance = await database.getBuyingPower(accountList[i]);
        for(let j = 0; j < userStockList.length; j++)
        {
            let stockAmount = await database.stockQuantity(accountList[i], userStockList[j]);
            let stockData = await query.getCurrentData(userStockList[j]);
            let stockPrice = stockData[userStockList[j]]["askPrice"];
            userBalance += stockAmount*stockPrice;
        }
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        let portfolioData = {yesterday : userBalance};
        await database.addBalance(accountList[i], portfolioData);
    }
}


async function flushCache()
{
    let stockList = await list.getList("CACHE_STOCKS");
    let numDataPoints = await query.getNumDataPoints();
    for(let i = 0; i < stockList.length; i++)
    {

        let stockData = await query.getPreviousData(stockList[i]["symbol"], numDataPoints);
        await cache.updateCacheStock(stockList[i], stockData);
    }
}