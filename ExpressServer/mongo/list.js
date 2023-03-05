const mongoose = require('mongoose');
const listSchema = require('./listSchema');

/* addList(listName, stocks)
This function adds a new list to the 'listInfo' collection
listname => the name of the list of stocks you want to add
The name is entirely up to you. You want 2 lists so name ideas:
'ALL_STOCKS' and 'CACHE_STOCKS. You have to use these names later to set and get them
stocks => an Array of all the symbols in that list*/
async function addList(listName, stocks)
{
    try {
        const nameCheck = await listSchema.findOne({listName : listName});

        if (nameCheck != undefined) {
            console.log("ERROR: Unable to add list: already in collection");
            return;
        } else {
            const newList = {
                listName : listName,
                stocks : stocks
            }
            await new listSchema(newList).save();
        }

    } catch(error) {
        console.log(error);
    }
}

/* setList(listName, stocks)
This function will wipe the old list and add the new list of stocks to the document
listName => the name of the list you want to set: "ALL_STOCKS" or "CACHE_STOCKS"
stocks => the new array data you want the document to hold*/
async function setList(listName, stocks)
{
    try {
        const list = await listSchema.findOne({listName : listName});

        if (list == undefined) {
            console.log("ERROR: Unable to set list: list name is not in collection");
            return;
        } else {
            const update = {stocks : stocks};
            await listSchema.findOneAndUpdate(list, update);
        }
    } catch(error) {
        console.log(error);
    }
}

/* getList(listName)
This function returns the array of stocks of a given listName*/
async function getList(listName)
{
    try {
        const list = await listSchema.findOne({listName : listName});

        if (list == undefined) {
            console.log("ERROR: Unable to get list: list name is not in collection");
            return;
        } else {
            return(list.stocks);
        }
    } catch(error) {
        console.log(error);
    }
}

module.exports = {addList, setList, getList}