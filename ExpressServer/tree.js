const query = require('./query');
let symbolRoot = null;
let nameRoot = null;
let symbolLookupTable = new Map();
let descLookupTable = new Map();

async function getStocks(heading)
{
    let symbolArray = [];
    let nameArray = [];
    let returnArr = [symbolArray, nameArray];
    let traversalRoot = symbolRoot;
    let traverse = 1;
    for(let i = 0; i < heading.length; i++)
    {
        if(traversalRoot.children[heading.charCodeAt(i)-65] == null)
        {
            i = heading.length;
            traverse = 0;
        }
        else
        {
            traversalRoot = traversalRoot.children[heading.charCodeAt(i)-65];
        }
    }
    if(traverse == 1)
    {
        traversalRoot.traverse(symbolArray, heading);
    }
    traversalRoot = nameRoot;
    traverse = 1;
    for(let i = 0; i < heading.length; i++)
    {
        if(traversalRoot.children[heading.charCodeAt(i)-65] == null)
        {
            i = heading.length;
            traverse = 0;
        }
        else
        {
            traversalRoot = traversalRoot.children[heading.charCodeAt(i)-65];
        }
    }
    if(traverse == 1)
    {
        traversalRoot.traverse(nameArray, heading);
    }
    for(let i = 0; i < nameArray.length; i++)
    {
        if(symbolLookupTable.get(nameArray[i]) != null)
        {
            nameArray[i] = symbolLookupTable.get(nameArray[i]);
        }
    }
    for(let i = 0; i < symbolArray.length; i++)
    {
        if(descLookupTable.get(symbolArray[i]) != null)
        {
            symbolArray[i] = descLookupTable.get(symbolArray[i]);
        }
    }
    return(returnArr);
}

async function createTree()
{
    let stockList = await query.getStockList();
    symbolRoot = new Node();
    nameRoot = new Node();
    for(let i = 0; i < stockList.length; i++)
    {
        symbolRoot.addChild(stockList[i]["symbol"]);
    }
    for(let i = 0; i < stockList.length; i++)
    {
        if(stockList[i]["description"] != null && stockList[i]["description"] != "Symbol not found")
        {
            let desc = stockList[i]["description"].replace(/[^a-zA-Z]/g, "").toUpperCase();
            symbolLookupTable.set(desc, [stockList[i]["description"], stockList[i]["symbol"]]);
            descLookupTable.set(stockList[i]["symbol"], [stockList[i]["symbol"], stockList[i]["description"]]);
            nameRoot.addChild(desc);
        }
    }
}


class Node
{
    constructor()
    {
        this.children = new Array(26).fill(null);
        this.end = 0;
    }

    addChild(word)
    {
        if(word.length == 0)
        {
            this.end = 1;
            return;
        }
        let firstLetter = word.charCodeAt(0)-65;
        if(this.children[firstLetter] == null)
        {
            this.children[firstLetter] = new Node();
        }
        let newChild = this.children[firstLetter];
        let newWord = word.substr(1, word.length - 1);
        newChild.addChild(newWord)
    }

    traverse(array, word)
    {
        for(let i = 0; i < 26; i++)
        {
            if(this.children[i] != null)
            {
                let newWord = word + String.fromCharCode(i+65);
                this.children[i].traverse(array, newWord);
            }
        }
        if(this.end == 1)
        {
            array.push(word);
        }
    }
}



module.exports = 
{
     getStocks, createTree
}
