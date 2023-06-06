const query = require('./query');
const database = require('./mongo/database');
const daysIn10Years = 3650;
const msInYear = 31536000000; // not leap year
const numStocks = 10;
var dailyChallenge = null;
var dailyChallengeProfiles = null;
var personalChallengeProfiles = null;
var nextPersonalChallengeProfiles = null;


function sleep(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}


class Challenge
{
    constructor()
    {
        this.startDate = getRandomDate();
        this.stocks = [];
        this.stockData = [];
        this.initialized = 0;
    }

    InitializeCopy(startDate, stocks, stockData)
    {
        this.startDate = startDate
        this.stocks = stocks;
        this.stockData = stockData;
        this.initialized = 1;
    }

    async initialize()
    {
        let stockArr = await getRandomStocks(this.startDate);
        this.stocks = stockArr[0];
        this.stockData = stockArr[1];
        if(this.stockData == 0)
        {
            console.log("retrying challenge initialization");
            await this.initialize();
        }
        this.initialized = 1;
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
        this.day = Math.floor(this.challenge.stockData[0].length/2);
        this.finished = 0;
    }

    buy(stock, amount)
    {
        let price = this.challenge.stockData[stock][this.day][0];
        if(price*amount > this.buyingPower || stock <= 0)
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
        if(amount > this.stocks[stock] || stock <= 0)
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
        if(this.finished == 1)
        {
            return(1);
        }
        this.day += 1;
        if(this.day >= this.challenge.stockData[0].length)
        {
            this.finished = 1;
            console.log("challenge finished");
            return(1);
        }
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
    await dailyChallenge.initialize();
}

async function createPersonalChallengeList()
{
    var accountList = await database.getAccountList();
    personalChallengeProfiles = new Map();
    nextPersonalChallengeProfiles = new Map();
    for(let i = 0; i < accountList.length; i++)
    {
        personalChallengeProfiles.set(accountList[i], null);
        var challenge = new Challenge();
        setNextPersonalChallenge(accountList[i], challenge);
    }
}


async function createPersonalChallenge(userKey)
{
    var challenge = new Challenge();
    var newProfile = nextPersonalChallengeProfiles.get(userKey);
    while(newProfile == null)
    {
        await sleep(50);
        newProfile = nextPersonalChallengeProfiles.get(userKey);
    }
    personalChallengeProfiles.set(userKey, newProfile);
    setNextPersonalChallenge(userKey, challenge);
}

async function setNextPersonalChallenge(userKey, challenge)
{
    //console.log("setting next personal challenge for " + userKey);
    nextPersonalChallengeProfiles.set(userKey, null);
    await challenge.initialize();
    nextPersonalChallengeProfiles.set(userKey, new ChallengeProgress(challenge));
    //console.log("next personal challenge set for " + userKey);
}

function getDailyChallengeProfile(userKey)
{
    return(dailyChallengeProfiles.get(userKey));
}

function getPersonalChallengeProfile(userKey)
{
    return(personalChallengeProfiles.get(userKey));
}

function getDailyChallenge()
{
    return(dailyChallenge);
}

async function addUser(userKey)
{
    dailyChallengeProfiles.set(userKey, new ChallengeProgress(dailyChallenge));
    personalChallengeProfiles.set(userKey, null);
    var challenge = new Challenge();
    await challenge.initialize();
    nextPersonalChallengeProfiles.set(userKey, new ChallengeProgress(challenge));
}

function deleteUser(userKey)
{
    personalChallengeProfiles.delete(userKey);
    dailyChallengeProfiles.delete(userKey);
}




function getRandomDate()
{
    var date = new Date();
    const randNum = Math.floor(Math.random()*(daysIn10Years-730)+365);
    date.setDate(date.getDate()-randNum);
    return(date);
}

async function getRandomStocks(startDate)
{
    var stockList = await query.getStockList();
    var stocks = [];
    var stocksData = [];
    var retList = [stocks, stocksData];
    var startDateMinusYear = new Date(startDate.getTime());
    var startDatePlusYear = new Date(startDate.getTime());
    startDateMinusYear.setFullYear(startDate.getFullYear()-1);
    startDatePlusYear.setFullYear(startDate.getFullYear()+1);
    const googleArrayLength = (await query.getPreviousDataRange("GOOG", new Date(startDateMinusYear), new Date(startDatePlusYear))).length;
    //console.log(startDateMinusYear);
    while (stocks.length < numStocks)
    {
        var randNum = Math.floor(Math.random()*stockList.length);
        if(stockList[randNum] != null)
        {
            //console.log(stockList[randNum]["symbol"]);
            //console.log(stocks.length);
            let data = (await query.getPreviousDataRange(stockList[randNum]["symbol"], startDateMinusYear, startDatePlusYear));
            if(data.length == googleArrayLength)
            {
                stocks.push(stockList[randNum]["symbol"]);
                stocksData.push(data);
            }
            stockList[randNum] = null;
        }
    }
    return(retList);
}

/*async function getStockData(startDate, stocks)
{
    var startDateMinusYear = new Date(startDate.getTime());
    var startDatePlusYear = new Date(startDate.getTime());
    startDateMinusYear.setFullYear(startDate.getFullYear()-1);
    startDatePlusYear.setFullYear(startDate.getFullYear()+1);
    returnArr = [];
    for(let i = 0; i < numStocks; i++)
    {
        returnArr.push(await query.getPreviousDataRange(stocks[i], startDateMinusYear, startDatePlusYear));
        if(returnArr[i] == null || returnArr[i].length == 0)
        {
            console.log(stocks[i]);
            console.log(await query.getPreviousDataRange(stocks[i], startDateMinusYear, startDatePlusYear).length);
            return(0);
        }
    }
    return(returnArr);
}*/




module.exports = 
{
     createDailyChallenge, getDailyChallengeProfile, getDailyChallenge, createPersonalChallengeList, createPersonalChallenge, getPersonalChallengeProfile, addUser, deleteUser
}