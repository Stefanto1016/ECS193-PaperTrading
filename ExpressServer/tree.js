const query = require('./query');
let root;

async function getStocks(heading)
{
    let array = [];
    let traversalRoot = root;
    for(let i = 0; i < heading.length; i++)
    {
        if(traversalRoot.children[heading.charCodeAt(i)-65] == null)
        {
            return(array);
        }
        traversalRoot = traversalRoot.children[heading.charCodeAt(i)-65]
    }
    traversalRoot.traverse(array, heading);
    return(array);
}

async function createTree()
{
    let stockList = await query.getStockList();
    root = new Node();
    for(let i = 0; i < stockList.length; i++)
    {
        root.addChild(stockList[i]["symbol"]);
    }
}


class Node
{
    constructor()
    {
        this.children = new Array(26).fill(null);;
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
