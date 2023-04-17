const query = require('./query');
const database = require('./mongo/database');
const daysIn20Years = 7305;
const msInYear = 31536000000; // not leap year
const numStocks = 10;
var dailyChallenge = null;
var dailyChallengeProfiles = null;


class Challenge
{
    constructor()
    {
        this.startDate = getRandomDate();
        this.stocks = [];
        this.stockData = [];
    }

    InitializeCopy(startDate, stocks, stockData)
    {
        this.startDate = startDate
        this.stocks = stocks;
        this.stockData = stockData;
    }

    async initialize()
    {
        this.stocks = await getRandomStocks(this.startDate);
        this.stockData = await getStockData(this.startDate, this.stocks);
        if(this.stockData == 0)
        {
            console.log("retrying challenge initialization");
            await this.initialize();
        }
    }
}

class ChallengeProgress
{
    constructor(challenge)
    {
        this.balance = 10000;
        this.buyingPower = 10000;
        this.challenge = challenge;
        this.stocks = new Array(numStocks).fill(0);
        this.day = this.challenge.stockData[0].length/2;
    }

    buy(stock, amount)
    {
        let price = this.challenge.stockData[stock][this.day][0];
        if(price*amount > this.buyingPower)
        {
            console.log("This user doesn't have enough funds");
            return(false);
        }
        else
        {
            this.stocks[stock] += amount;
            this.buyingPower -= price*amount;
            return(this.buyingPower);
        }
    }

    sell(stock, amount)
    {
        let price = this.challenge.stockData[stock][this.day][0];
        if(amount > this.stocks[stock])
        {
            console.log("This user doesn't have enough of this stock");
            return(false);
        }
        else
        {
            this.stocks[stock] -= amount;
            this.buyingPower += price*amount;
            return(this.buyingPower);
        }
    }

    nextDay()
    {
        if(this.day == this.challenge.stockData.length)
        {
            console.log("challenge finished");
            return(1);
        }
        this.day += 1;
        var newBalance = this.buyingPower;
        for(let i = 0; i < numStocks; i++)
        {
            newBalance += this.stocks[i]*this.challenge.stockData[i][this.day][0];
        }
        this.balance = newBalance;
        if(this.day == this.challenge.stockData[0].length)
        {
            return(1);
        }
        else
        {
            return(0);
        }
    }
}

async function createDailyChallenge()
{
    dailyChallenge = new Challenge();
    await dailyChallenge.initialize();
    var accountList = await database.getAccountList();
    var profiles = new Map();
    for(let i = 0; i < accountList.length; i++)
    {
        profiles.set(accountList[i], new ChallengeProgress(dailyChallenge));
    }
    dailyChallengeProfiles = profiles;
}

function getDailyChallengeProfiles()
{
    return(dailyChallengeProfiles);
}

function getDailyChallenge()
{
    return(dailyChallenge);
}




function getRandomDate()
{
    var date = new Date();
    const randNum = Math.floor(Math.random()*(daysIn20Years-730)+365);
    date.setDate(date.getDate()-randNum);
    return(date);
}

async function getRandomStocks(startDate)
{
    var stockList = await query.getStockList();
    var retList = [];
    var startDateMinusYear = new Date(startDate.getTime());
    startDateMinusYear.setFullYear(startDateMinusYear.getFullYear()-1);
    while (retList.length < numStocks)
    {
        console.log(retList.length);
        var randNum = Math.floor(Math.random()*stockList.length);
        if(stockList[randNum] != null)
        {
            console.log(stockList[randNum]["symbol"]);
            if(await query.getStockListDate(stockList[randNum]["symbol"]) < startDateMinusYear.getTime())
            {
                retList.push(stockList[randNum]["symbol"]);
            }
            stockList[randNum] = null;
        }
    }
    return(retList);
}

async function getStockData(startDate, stocks)
{
    var startDateMinusYear = new Date(startDate.getTime());
    var startDatePlusYear = new Date(startDate.getTime());
    startDateMinusYear.setFullYear(startDate.getFullYear()-1);
    startDatePlusYear.setFullYear(startDate.getFullYear()+1);
    returnArr = [];
    for(let i = 0; i < numStocks; i++)
    {
        returnArr.push(await query.getPreviousDataRange(stocks[i], startDateMinusYear, startDatePlusYear));
        if(returnArr[i].length == 0)
        {
            return(0);
        }
    }
    return(returnArr);
}




module.exports = 
{
     createDailyChallenge, getDailyChallengeProfiles, getDailyChallenge
}