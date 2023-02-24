const express = require('express');
const mongoose = require('mongoose');
var url = "mongodb+srv://compubrain:papertrading101@compubrain.z2orex5.mongodb.net/paperTrade?retryWrites=true&w=majority";
const userSchema = require('./userSchema')

// allows for connection to MongoDB database
async function connect()
{
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(url);
    } catch (error) {
        console.log(error)
    }
}

async function disconnect()
{
    mongoose.connection.close()
}

// add a user to mongoDB database
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

// updates a given users balance log 
async function updateBalance(username, balance)
{
    connect();
    const user = await userSchema.findOne({username : username});
    const newBalance = balance;
    
    const mergeBalance = {
        ...newBalance,
        ...user.balance
    };

    const update = {balance: mergeBalance};
    await userSchema.findOneAndUpdate(user, update);
    disconnect();
}

//addUser("garretthilyer@gmail.com", "ghilyer", {"XOM": 25, "DIS": 14, "TSLA": 16}, {"2/23/2023": 10000})
updateBalance("ghilyer", {"2/24/2023" : 4500});
