const express = require('express');
const mongoose = require('mongoose');
const userSchema = require('./userSchema')
var url = "mongodb+srv://compubrain:papertrading101@compubrain.z2orex5.mongodb.net/paperTrade?retryWrites=true&w=majority";

/*  connect() => connects to the nonlocal MongoDB */
async function connect()
{
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(url);
    } catch (error) {
        console.log(error)
    }
}

/*  disconnect() => disconnects to the nonlocal MongoDB */
async function disconnect()
{
    mongoose.connection.close()
}

/*  addUser(email, username, stocks, balance) 
This function adds a new user(document) to the "userInfo" collection on MongoDB
Error Catching implemented */
async function addUser(email, username, stocks, balance)
{
    try {
        connect();
        const userCheck = await userSchema.findOne({username : username});
        const emailCheck = await userSchema.findOne({email : email});

        if (userCheck != undefined) {
            console.log("ERROR: Unable to add User: username already taken");
            disconnect();
            return;
        } else if (emailCheck != undefined) {
            console.log("ERROR: Unable to add User: email already taken");
            disconnect();
            return;
        } else {
            const user = {
                email: email,
                username: username,
                stocks: stocks,
                balance: balance
            }
            await new userSchema(user).save()
            disconnect();
        }
    } catch(error) {
        console.log(error)
    }
    
}

/*  updateBalance(username, balance)
This function adds the date/amount to a users "balance" object
username => the username of a given user (subject to change, email might be easier)
balance => {"date" : Number Amount}  */
async function updateBalance(username, balance)
{
    try {
        connect();
        const user = await userSchema.findOne({username : username});
        if (user == undefined) {
            console.log("ERROR: Unable to Update Balance: username does not exist in database");
            disconnect();
            return;
        }
        const mergeBalance = {
            ...balance,
            ...user.balance
        };

        const update = {balance: mergeBalance};
        await userSchema.findOneAndUpdate(user, update);
        disconnect();
    } catch(error) {
        console.log(error)
    }
}

/*  addStock(username, stock) 
This function will add a NEW stock (no error catching) to a users "stocks" object 
username => the username of a given user 
stock => {"symbol" : Quantity}  */
async function addStock(username, stock)
{
    try {
        connect();
        const user = await userSchema.findOne({username : username});
        if (user == undefined) {
            console.log("ERROR: Unable to Add Stock: username does not exist in database");
            disconnect();
            return;
        }
        const mergeStocks = {
            ...user.stocks,
            ...stock
        };
        const update = {stocks: mergeStocks};
        await userSchema.findOneAndUpdate(user, update);
        disconnect();
    } catch(error) {
        console.log(error)
    }
}


/*  updateStock(username, symbol, newQuantity) 
This function will update the stock of the given symbol with "newQuantity" inside the users document
username => the username of a given user
symbol => the stock market symbol 
newQuantity => the quantity that the stock should be set too  */
async function updateStock(username, symbol, newQuantity)
{
    try {
        // NO connect() here 
        if (newQuantity == 0) {
            deleteStock(username, symbol);
        } else {
            connect();
            const user = await userSchema.findOne({username : username});
            user.stocks[symbol] = newQuantity;
            await userSchema(user).save()
            disconnect();
        }

    } catch(error) {
        console.log(error)
    }
   
}

/*  deleteStock(username, symbol) 
This function removes the stock from the users "stocks" object
username => user document that will have given stock removed 
symbol => the stock that will be removed from "stocks" object*/
async function deleteStock(username, symbol)
{
    try {
        connect();
        const user = await userSchema.findOne({username : username});
        delete user.stocks[symbol];
        await userSchema(user).save()
        disconnect();
    } catch(error) {
        console.log(error)
    }
    
}

/*  getUser(email)
This function returns the user document from MongoDB
email => the email address given when user logs in
 */
async function getUser(email)
{
    try {
        connect();
        const user = await userSchema.findOne({email : email});
        disconnect();
        return(user);
    } catch(error) {
        console.log(error)
    }
}

/*  stockQuantity(username, symbol)
This function returns the number of shares of a stock that the user owns  */
async function stockQuantity(username, symbol)
{
    try {
        connect();
        const user = await userSchema.findOne({username : username});

        if (user.stocks[symbol] == undefined) {
            console.log("ERROR: This User doesn't own any shares of this stock.")
            disconnect();
            return(0);
        } else {
            //console.log(user.stocks[symbol]);
            disconnect();
            return(user.stocks[symbol]);
        }

    } catch(error) {
        console.log(error)
    }
}

//  Testing function calls below 
//addUser("garretthilyer@gmail.com", "ghilyer", {"XOM": 25, "DIS": 14, "TSLA": 16}, {"2/23/2023": 10000})
//updateBalance("ghilyer", {"2/24/2023" : 4500});
//addStock("ghilyer", {"AAPL": 15});
//updateStock("ghilyer", "XOM", 35);
//updateStock("ghilyer", "AAPL", 0);
//getUser("garretthilyer@gmail.com");
//deleteStock("ghilyer", "AAPL");
//stockQuantity("ghilyer", "XOM");