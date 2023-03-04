const express = require('express');
const mongoose = require('mongoose');
const userSchema = require('./userSchema')
var url = "mongodb+srv://compubrain:papertrading101@compubrain.z2orex5.mongodb.net/paperTrade?retryWrites=true&w=majority";
/**
 LIST OF ALL FUNCTIONS (in order)
 connect()
 disconnect()
 addUser(email, buyingPower, stocks, balance)
 getUser(email)
 getAccountList()
 addStock(email, stock)
 updateStock(email, symbol, newQuantity)
 deleteStock(email, symbol)
 stockQuantity(email, symbol)
 getUserStockList(email)
 getBuyingPower(email)
 updateBuyingPower(email, buyingPower)
 addBalance(email, balance)
 updateBalance(email, newBalance)
*/



/*  connect() => connects to the nonlocal MongoDB */
async function connect()
{
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(url);
    } catch (error) {
        console.log(error);
    }
}

/*  disconnect() => disconnects to the nonlocal MongoDB */
async function disconnect()
{
    mongoose.connection.close();
}

/*  addUser(email, buyingPower, stocks, balance) 
This function adds a new user(document) to the "userInfo" collection on MongoDB
Error Catching implemented */
async function addUser(email, buyingPower, stocks, balance)
{
    try {
        connect();
        const emailCheck = await userSchema.findOne({email : email});

        if (emailCheck != undefined) {
            console.log("ERROR: Unable to add User: email already taken");
            
            return;
        } else {
            const user = {
                email: email,
                buyingPower: buyingPower,
                stocks: stocks,
                balance: balance
            }
            await new userSchema(user).save()
            
        }
    } catch(error) {
        console.log(error);
        
    }
    
}

/*  getUser(email)
This function returns the user document from MongoDB
email => the email address given when user logs in
 */
async function getUser(email)
{
    try {
        
        const user = await userSchema.findOne({email : email});
        
        return(user);
    } catch(error) {
        console.log(error);
        
    }
}

/*  getAccountList()
Returns an Array of Strings of emails => Ex: [ 'garretthilyer@gmail.com', 'thomasguelk@gmail.com' ]  */
async function getAccountList()
{
    try{
        connect();
        const allUsers = await userSchema.find();
        
        const emails = []
        for (let i = 0; i < allUsers.length; i++) {
            emails[i] = allUsers[i].email;
        }

        //console.log(emails)
        return(emails);
    } catch (error) {
        console.log(error);
        
    }
}

/*  addStock(email, stock) 
This function will add a NEW stock (no error catching) to a users "stocks" object 
email => the email of a given user 
stock => {"symbol" : Quantity}  */
async function addStock(email, stock)
{
    try {
        connect();
        const user = await userSchema.findOne({email : email});
        if (user == undefined) {
            console.log("ERROR: Unable to Add Stock: email does not exist in database");
            
            return;
        }
        const mergeStocks = {
            ...user.stocks,
            ...stock
        };
        const update = {stocks: mergeStocks};
        await userSchema.findOneAndUpdate(user, update);
        
    } catch(error) {
        console.log(error)
        
    }
}


/*  updateStock(email, symbol, newQuantity) 
This function will update the stock of the given symbol with "newQuantity" inside the users document
email => the email of a given user
symbol => the stock market symbol 
newQuantity => the quantity that the stock should be set too  */
async function updateStock(email, symbol, newQuantity)
{
    try {
        // NO connect() here 
        if (newQuantity == 0) {
            deleteStock(email, symbol);
        } else {
            connect();
            const user = await userSchema.findOne({email : email});
            user.stocks[symbol] = newQuantity;
            await userSchema(user).save()
            
        }

    } catch(error) {
        console.log(error);
        
    }
   
}

/*  deleteStock(email, symbol) 
This function removes the stock from the users "stocks" object
email => user document that will have given stock removed 
symbol => the stock that will be removed from "stocks" object*/
async function deleteStock(email, symbol)
{
    try {
        connect();
        const user = await userSchema.findOne({email : email});
        delete user.stocks[symbol];
        await userSchema(user).save()
        
    } catch(error) {
        console.log(error);
        
    }
    
}

/*  stockQuantity(email, symbol)
This function returns the number of shares of a stock that the user owns  */
async function stockQuantity(email, symbol)
{
    try {
        connect();
        const user = await userSchema.findOne({email : email});

        if (user.stocks[symbol] == undefined) { 
            return(0);
        } else {
            //console.log(user.stocks[symbol]);
            
            return(user.stocks[symbol]);
        }

    } catch(error) {
        console.log(error);
        
    }
}

/*  getUserStockList(email)
Returns the object of key-value pairs of stocks when given users email */
async function getUserStockList(email)
{
    try{
        connect();
        const user = await userSchema.findOne({email : email});
        if (user == undefined) {
            console.log("ERROR: Unable to get stock list: email does not exist in database");
            
            return;
        }
        
        //console.log(user.stocks)
        return(user.stocks);
    } catch (error) {
        console.log(error);
        
    }
}

/*  getBuyingPower(email)
Returns the buying power of the user when given their email*/
async function getBuyingPower(email)
{
    try{
        connect();
        const user = await userSchema.findOne({email : email});
        if (user == undefined) {
            console.log("ERROR: Unable to get stock list: email does not exist in database");
            
            return;
        }
        
        //console.log(user.buyingPower);
        return(user.buyingPower);
    } catch (error) {
        console.log(error);
        
    }
}

/*  updateBuyingPower(email, buyingPower)
email => the email of a given user
buyingPower => A number that the buyingPower will be set too on the database*/
async function updateBuyingPower(email, buyingPower)
{
    try{
        connect();
        const user = await userSchema.findOne({email : email});
        if (user == undefined) {
            console.log("ERROR: Unable to get stock list: email does not exist in database");
            
            return;
        }
        const update = {buyingPower: buyingPower};
        await userSchema.findOneAndUpdate(user, update);
        
    } catch (error) {
        console.log(error);
        
    }
}

/*  addBalance(email, balance)
This function adds the date/amount to a users "balance" object
email => the email of a given user (subject to change, email might be easier)
balance => {"date" : Number Amount}  */
async function addBalance(email, balance)
{
    try {
        connect();
        const user = await userSchema.findOne({email : email});
        if (user == undefined) {
            console.log("ERROR: Unable to Update Balance: email does not exist in database");
            
            return;
        }
        const mergeBalance = {
            ...balance,
            ...user.balance
        };

        const update = {balance: mergeBalance};
        await userSchema.findOneAndUpdate(user, update);
        
    } catch(error) {
        console.log(error);
        
    }
}

/*  updateBalance(email, newBalance)
email => the email of a given user
newBalance => an object of key-value pairs ex: {"2/23/2023": 10000, "2/24/2023": 12000, "2/25/2023": 9786}
IMPORTANT: newBalance is NOT appended to the current balance 
The old balance is wiped completely and newBalance takes its place  */
async function updateBalance(email, newBalance)
{
    try{
        connect();
        const user = await userSchema.findOne({email : email});
        if (user == undefined) {
            console.log("ERROR: Unable to get stock list: email does not exist in database");
            
            return;
        }
        const update = {balance: newBalance};
        await userSchema.findOneAndUpdate(user, update);
        
    } catch (error) {
        console.log(error);
        
    }
}


module.exports = 
{
     addUser, getUser, getAccountList, addStock, updateStock, deleteStock, stockQuantity, getUserStockList, getBuyingPower, updateBuyingPower, addBalance, updateBalance, connect, disconnect
}



//  Testing function calls below 
//addUser("garretthilyer@gmail.com", 100000, {"XOM": 25, "DIS": 14, "TSLA": 16}, {"2/23/2023": 10000})
//getUserStockList("garretthilyer@gmail.com")
//getBuyingPower("garretthilyer@gmail.com")
//updateBuyingPower("garretthilyer@gmail.com", 25000);
//updateBalance("garretthilyer@gmail.com", {"2/23/2023": 10000, "2/24/2023": 12000, "2/25/2023": 9786});
//addUser("thomasguelk@gmail.com", 75000, {"NVDA": 24, "PCAR": 67, "ABNB": 180, "MSFT": 3, "ADI": 45}, {"3/2/2023": 450000, "3/1/2023": 435000, "2/28/2023": 350000})
//getAccountList();
//addStock("garretthilyer@gmail.com", {"AAPL": 15});
//updateStock("garretthilyer@gmail.com", "XOM", 35);
//updateStock("garretthilyer@gmail.com", "AAPL", 0);
//getUser("garretthilyer@gmail.com");
//deleteStock("garretthilyer@gmail.com", "AAPL");
//stockQuantity("garretthilyer@gmail.com", "XOM");