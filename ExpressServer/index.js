const query = require('./query');
const database = require('./mongo/database');
const cache = require('./mongo/cache');
const list = require('./mongo/list');
const tree = require('./tree');
const queue = require('./queue');
const challenge = require('./challenge');
const limitOrder = require('./limitOrder');
const express = require('express');
const app = express();
const port = 8000;
const MSinMin = 1000*60;
var started = 0;
var currentDate = new Date();
var globalQueue = queue.getGlobalQueue();
var userQueues = queue.getUserQueue();
var userChallengeQueues = queue.getUserChallengeQueue();
var updating = 0;

/*var cors = require("cors");
app.use(cors);*/

function sleep(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
    var userList = await database.getAccountList();
    for(var i = 0; i < userList.length; i++)
    {
        userQueues.set(userList[i], queue.createQueue());
        userChallengeQueues.set(userList[i], queue.createQueue());
    }
    started = 1;
    await tree.createTree();
    await challenge.createDailyChallenge();
    await challenge.createPersonalChallengeList();
    globalQueue.run();
    while(globalQueue.getSize() != 0)
    {
        await sleep(20);
    }
    console.log("started");
    for(var i = 0; i < userList.length; i++)
    {
        userQueues.get(userList[i]).run();
        userChallengeQueues.get(userList[i]).run();
    }

})

process.on('exit', function() 
{
    database.disconnect();
    console.log("closing");
});

setInterval(update, 1000);

setInterval(limitOrder.checkLimitOrders, MSinMin*5)

app.get('/isUpdating', async (req, res) => 
{
    res.send({isUpdating: updating});
})

app.get('/createAccount', async (req, res) => 
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    globalQueue.enqueue(alert);
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const ret = createAccount(userKey);
    alert.unalert();
    res.send(ret);
})

app.get('/hasAccount', async (req, res) => 
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    globalQueue.enqueue(alert);
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    var ret = database.getUser(userKey);
    if(ret == null)
    {
        ret = false;
    }
    else
    {
        ret = true;
    }
    alert.unalert();
    res.send(ret);
})

app.get('/removeAccount', async (req, res) => 
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    globalQueue.enqueue(alert);
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const ret = removeAccount(userKey);
    alert.unalert();
    res.send(ret);
})


app.get('/buyStock', async (req, res) => 
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const stock = req.query.stock;
    const amount = parseFloat(req.query.amount);
    const st = await buyStock(userKey, stock, amount);
    const ret = {buyingPower: st};
    alert.unalert();
    res.send(ret);
})

//http://localhost:8000/limitOrder?userKey=thomasguelk@gmail.com&stock=GOOG&amount=10&price=100&sell=0&whenLessThan=0

app.get('/limitOrder', async (req, res) =>
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    globalQueue.enqueue(alert);
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const stock = req.query.stock;
    const amount = parseFloat(req.query.amount);
    const price = req.query.price;
    const sell = req.query.sell;
    const whenLessThan = req.query.whenLessThan;
    let ret = limitOrder.addLimitOrder(userKey, stock, amount, price, sell, whenLessThan)
    alert.unalert();
    res.send(ret);
})


app.get('/sellStock', async (req, res) => 
{ 
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const stock = req.query.stock;
    const amount = parseFloat(req.query.amount);
    const st = await sellStock(userKey, stock, amount);
    const ret = {buyingPower: st};
    alert.unalert();
    res.send(ret);
})



app.get('/getPortfolioData', async (req, res) => 
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const ret = await getPortfolioData(userKey);
    alert.unalert();
    res.send(ret);
})

app.get('/getSpecificStock', async (req, res) => 
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const stock = req.query.stock;
    const st = await stockQuantity(userKey, stock);
    const ret = {quantity: st};
    alert.unalert();
    res.send(ret);
})



app.get('/getHistoricalData', async (req, res) => 
{
    var alert = queue.createAlert();
    globalQueue.enqueue(alert);
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const stock = req.query.stock;
    const ret = await getHistoricalData(stock);
    alert.unalert();
    res.send(ret);
})

app.get('/getStocks', async(req, res) =>
{
    var alert = queue.createAlert();
    globalQueue.enqueue(alert);
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const heading = req.query.heading.replace(/[^a-zA-Z]/g, "").toUpperCase();
    let array = await tree.getStocks(heading);
    alert.unalert();
    res.send(array);
}
)

app.get('/challengeCreatePersonalChallenge', async(req, res) =>
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userChallengeQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    await challenge.createPersonalChallenge(userKey);
    var stockData = (await challenge.getPersonalChallengeProfile(userKey)).challenge.stockData;
    alert.unalert();
    res.send(stockData);
}
)

app.get('/challengeGetLeaderboard', async(req, res) =>
{
    var alert = queue.createAlert();
    globalQueue.enqueue(alert);
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    let leaderboard = await database.getLeaderboard();
    leaderboard.slice(0, 7);
    alert.unalert();
    res.send(leaderboard);
}
)

app.get('/challengeGetUserLeaderboardPosition', async(req, res) =>
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userChallengeQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    let leaderboard = await database.getLeaderboard();
    let position = null;
    for(let i = 0; i < leaderboard.size; i++)
    {
        if(leaderboard[i]["userKey"] == userKey)
        {
            position = i;
            i = leaderboard.size;
        }
    }
    leaderboard.slice(max(0, position-4), min(i-1, position+4));
    alert.unalert();
    res.send({position: position, leaderboard: leaderboard});
}
)

app.get('/challengeGetStockData', async(req, res) =>
{
    const daily = req.query.daily;
    var stockData = 0;
    if(daily == 1)
    {
        var alert = queue.createAlert();
        globalQueue.enqueue(alert);
        while(alert.alerted == 0)
        {
            await sleep(100);
        }
        stockData = (await challenge.getDailyChallenge()).stockData;
    }
    else
    {
        const userKey = req.query.userKey;
        var alert = queue.createAlert();
        if(started == 0)
        {
            globalQueue.enqueue(alert);
        }
        else
        {
            userChallengeQueues.get(userKey).enqueue(alert);
        }
        while(alert.alerted == 0)
        {
            await sleep(100);
        }
        stockData = challenge.getPersonalChallengeProfile(userKey).challenge.stockData;
    }
    alert.unalert();
    res.send(stockData);
}
)

app.get('/challengeGetBuyingPower', async(req, res) =>
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userChallengeQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const daily = req.query.daily;
    var buyingPower = 0;
    if(daily == 1)
    {
        buyingPower = (await challenge.getDailyChallengeProfile(userKey)).buyingPower;
    }
    else
    {
        buyingPower = challenge.getPersonalChallengeProfile(userKey).buyingPower;
    }
    alert.unalert();
    res.send({buyingPower : buyingPower});
}
)

app.get('/challengeGetBalance', async(req, res) =>
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userChallengeQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const daily = req.query.daily;
    var balance = 0;
    if(daily == 1)
    {
        balance = (await challenge.getDailyChallengeProfile(userKey)).balance;
    }
    else
    {
        balance = challenge.getPersonalChallengeProfile(userKey).balance;
    }
    alert.unalert();
    res.send({balance : balance});
}
)

//http://localhost:8000/challengeGetStocks?daily=1&userKey=thomasguelk@gmail.com
/*will return an array representing the number of each stock owned by the user*/
app.get('/challengeGetStocks', async(req, res) =>
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userChallengeQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const daily = req.query.daily;
    var stocks = [];
    if(daily == 1)
    {
        stocks = (await challenge.getDailyChallengeProfile(userKey)).stocks;
    }
    else
    {
        stocks = challenge.getPersonalChallengeProfile(userKey).stocks;
    }
    alert.unalert();
    res.send(stocks);
}
)

//http://localhost:8000/challengeBuyStock?daily=1&userKey=thomasguelk@gmail.com&stock=0&amount=2

app.get('/challengeBuyStock', async(req, res) =>
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userChallengeQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const daily = req.query.daily;
    const stock = req.query.stock;
    const amount = parseInt(req.query.amount);
    var buyingPower = 0;
    if(daily == 1)
    {
        buyingPower = (await challenge.getDailyChallengeProfile(userKey)).buy(stock, amount);
    }
    else
    {
        buyingPower = challenge.getPersonalChallengeProfile(userKey).buy(stock, amount);
    }
    alert.unalert();
    res.send({buyingPower : buyingPower});
}
)

app.get('/challengeSellStock', async(req, res) =>
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userChallengeQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const daily = req.query.daily;
    const stock = req.query.stock;
    const amount = parseInt(req.query.amount);
    var buyingPower = 0;
    if(daily == 1)
    {
        buyingPower = (await challenge.getDailyChallengeProfile(userKey)).sell(stock, amount);
    }
    else
    {
        buyingPower = challenge.getPersonalChallengeProfile(userKey).sell(stock, amount);
    }
    alert.unalert();
    res.send({buyingPower : buyingPower});
}
)


app.get('/challengeNextDay', async(req, res) =>
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userChallengeQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const daily = req.query.daily;
    var isFinished = 0;
    if(daily == 1)
    {
        var wasFinished = (await challenge.getDailyChallengeProfile(userKey)).finished;
        isFinished = (await challenge.getDailyChallengeProfile(userKey)).nextDay();
        if(wasFinished != isFinished)
        {
            database.addScore(userKey, (await challenge.getDailyChallengeProfile(userKey)).balance);
        }
    }
    else
    {
        isFinished = challenge.getPersonalChallengeProfile(userKey).nextDay();
    }
    alert.unalert();
    res.send({isFinished : isFinished});
}
)

app.get('/challengeNextWeek', async(req, res) =>
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userChallengeQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const daily = req.query.daily;
    var isFinished = 0;
    if(daily == 1)
    {
        for(let i = 0; i < 5; i++)
        {
            var wasFinished = (await challenge.getDailyChallengeProfile(userKey)).finished;
            isFinished = (await challenge.getDailyChallengeProfile(userKey)).nextDay();
            if(wasFinished != isFinished)
            {
                database.addScore(userKey, (await challenge.getDailyChallengeProfile(userKey)).balance);
            }
        }
    }
    else
    {
        for(let i = 0; i < 5; i++)
        {
            isFinished = challenge.getPersonalChallengeProfile(userKey).nextDay();
        }
    }
    alert.unalert();
    res.send({isFinished : isFinished});
}
)

app.get('/challengeNextMonth', async(req, res) => //just jumped 20 days cause im lazy, might change later
{
    const userKey = req.query.userKey;
    var alert = queue.createAlert();
    if(started == 0)
    {
        globalQueue.enqueue(alert);
    }
    else
    {
        userChallengeQueues.get(userKey).enqueue(alert);
    }
    while(alert.alerted == 0)
    {
        await sleep(100);
    }
    const daily = req.query.daily;
    var isFinished = 0;
    if(daily == 1)
    {
        for(let i = 0; i < 20; i++)
        {
            var wasFinished = (await challenge.getDailyChallengeProfile(userKey)).finished;
            isFinished = (await challenge.getDailyChallengeProfile(userKey)).nextDay();
            if(wasFinished != isFinished)
            {
                database.addScore(userKey, (await challenge.getDailyChallengeProfile(userKey)).balance);
            }
        }
    }
    else
    {
        for(let i = 0; i < 20; i++)
        {
            isFinished = challenge.getPersonalChallengeProfile(userKey).nextDay();
        }
    }
    alert.unalert();
    res.send({isFinished : isFinished});
}
)




async function update()
{
    var newDate = new Date();
    if(newDate.getDate() != currentDate.getDate())
    {
        updating = 1;
        var promises = [];
        promises.push(currentDate = newDate);
        promises.push(updateStockList());
        promises.push(updatePortfolioValues());
        promises.push(flushCache());
        promises.push(tree.createTree());
        promises.push(challenge.createDailyChallenge());
        promises.push(database.clearLeaderboard());
        await Promise.all(promises);
        updating = 0;
    }
}


async function createAccount(userKey)
{
    await database.addUser(userKey, 10000, [], 10000);
    userQueues.set(userKey, queue.createQueue());
    userQueues.get(userKey).run();
    userChallengeQueues.set(userKey, queue.createQueue());
    userChallengeQueues.get(userKey).run();
    challenge.createDailyChallengeProfile(userKey);
}

async function removeAccount(userKey)
{
    userQueues.delete(userKey);
    userChallengeQueues.delete(userKey);
    challenge.deleteUser(userKey);
    database.deleteUser(userKey);
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
    let numDataPoints = await query.getNumDataPoints("GOOG");
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