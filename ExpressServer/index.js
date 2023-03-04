const query = require('./query');
const database = require('./mongo/database');
const express = require('express');
const app = express();
const port = 3000;
//const MSinHour = 24*60*60*1000;
const MSinDay = 1000;



app.listen(port, () => 
{
    database.connect();
    console.log("starting");
})

process.on('exit', function() 
{
    database.disconnect();
    console.log("closing");
});

setInterval(function() 
{
  console.log("updating");
  //updateStockList();
  //updatePortfolioValues();
  //flushCache();
}, MSinDay);


// /buyStock?userKey=thomasguelk@gmail.com&stock=AAPL&amount=10

app.get('/buyStock', (req, res) => 
{
    const userKey = req.query.userKey;
    const stock = req.query.stock;
    const amount = parseFloat(req.query.amount);
    const ret = buyStock(userKey, stock, amount);
    res.send(ret);
})


app.get('/sellStock', (req, res) => 
{
    const userKey = req.query.userKey;
    const stock = req.query.stock;
    const amount = parseFloat(req.query.amount);
    const ret = sellStock(userKey, stock, amount);
    res.send(ret);
})

app.get('/sellAllStock', (req, res) => 
{
    const userKey = req.query.userKey;
    const stock = req.query.stock;
    const ret = sellStock(userKey, stock);
    res.send(ret);
})


app.get('/getPortfolioData', (req, res) => 
{
    const userKey = req.query.userKey;
    const ret = getPortfolioData(userKey);
    res.send(ret);
})


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
        return(true);
    }
}


async function sellStock(userKey, stock, amount)
{
    let stockData = await query.getCurrentData([removedStocks[i]]);
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
        await database.updateBuyingPower(userKey, currentBuyingPower+amount*stockPrice);
    }
}


async function sellAllStock(userKey, stock)
{
    let stockData = await query.getCurrentData([removedStocks[i]]);
    let stockPrice = stockData[stock]["bidPrice"];
    let stocksHeld = await database.stockQuantity(userKey, stock);
    let currentBuyingPower = await database.getBuyingPower(userKey);
    await database.updateBuyingPower(userKey, currentBuyingPower+stocksHeld*stockPrice);
    await database.deleteStock(userKey, stock);
}


async function getPortfolioData(userKey)
{
    let portfolioData = await database.getPortfolioData(userKey);
    return(portfolioData);
}


async function updateStockList()
{
    const oldStockList = await database.getStockList();
    const newStockList = await query.getStockList();
    let hashmap = new Map();
    var removedStocks = [];
    for(let i = 0; i < newStockList.length; i++)
    {
        hashmap.set(newStockList[i], 1);
    }
    for(let i = 0; i < oldStockList.length; i++)
    {
        if(hashmap.has(oldStockList[i]) == false)
        {
            removedStocks.push(oldStockList[i]);
        }
    }
    await database.setStockList(newStockList);
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
        let userBalance = await database.getBuyingPower(accountList[i]);
        for(let j = 0; j < userStockList.length; j++)
        {
            let stockAmount = database.stockQuantity(getAccountList[i], userStockList[j]);
            let stockData = await query.getCurrentData([removedStocks[i]]);
            let stockPrice = stockData[stock]["askPrice"];
            userBalance += stockAmount*stockPrice;
        }
        let portfolioData = await database.getPortfolioData(accountList[i]);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        portfolioData.push([userBalance, yesterday]);
        await database.updatePortfolioData(accountList[i], portfolioData);
    }
}


async function flushCache()
{
    let stockList = await database.getCachedStocks();
    let numDataPoints = await query.getNumDataPoints();
    for(let i = 0; i < stockList.length; i++)
    {
      let stockData = await query.getPreviousData(stockList[i], numDataPoints);
      await database.updateStockCache(stockList[i], stockData);
    }
}