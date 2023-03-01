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
There is no error catching at this level, possible to make duplicate documents  */
async function addUser(email, username, stocks, balance)
{
    try {
        connect();
        const user = {
        email: email,
        username: username,
        stocks: stocks,
        balance: balance
        }

        await new userSchema(user).save()
    } finally {
        disconnect();
    }

}

/*  updateBalance(username, balance)
This function adds the date/amount to a users "balance" object
username => the username of a given user (subject to change, email might be easier)
balance => {"date" : Number Amount}  */
async function updateBalance(username, balance)
{
    connect();
    const user = await userSchema.findOne({username : username});
    
    const mergeBalance = {
        ...balance,
        ...user.balance
    };

    const update = {balance: mergeBalance};
    await userSchema.findOneAndUpdate(user, update);
    disconnect();
}

/*  addStock(username, stock) 
This function will add a NEW stock (no error catching) to a users "stocks" object 
username => the username of a given user 
stock => {"symbol" : Quantity}  */
async function addStock(username, stock)
{
    connect();
    const user = await userSchema.findOne({username : username});
    
    const mergeStocks = {
        ...user.stocks,
        ...stock
    };
    const update = {stocks: mergeStocks};
    await userSchema.findOneAndUpdate(user, update);
    disconnect();
}


/*  updateStock(username, symbol, newQuantity) 
This function will update the stock of the given symbol with "newQuantity" inside the users document
username => the username of a given user
symbol => the stock market symbol 
newQuantity => the quantity that the stock should be set too  */
async function updateStock(username, symbol, newQuantity)
{
    try {
        connect();
        const user = await userSchema.findOne({username : username});
        user.stocks[symbol] = newQuantity;
        await userSchema(user).save();
    } catch(error) {
        console.log(error);
    }
    disconnect();
}

/*  getUser(email)
This function returns the user document from MongoDB
email => the email address given when user logs in
 */
async function getUser(email)
{
    connect();
    const user = await userSchema.findOne({email : email});
    console.log(user);
    disconnect();
    return(user);
}

//  Testing function calls below 
//addUser("garretthilyer@gmail.com", "ghilyer", {"XOM": 25, "DIS": 14, "TSLA": 16}, {"2/23/2023": 10000})
//updateBalance("ghilyer", {"2/24/2023" : 4500});
//addStock("ghilyer", {"APPL": 15});
//updateStock("ghilyer", "APPL", 34);
//getUser("garretthilyer@gmail.com")