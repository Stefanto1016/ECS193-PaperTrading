const query = require('./query');
const queue = require('./queue');
const database = require('./mongo/database');

var userQueues = queue.getUserQueue();
var limitOrderLL = null;

function sleep(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

class limitOrder 
{
    constructor(userKey, stock, amount, price, sell, whenLessThan) 
    {
        this.userKey = userKey;
        this.stock = stock;
        this.amount = amount;
        this.price = price;
        this.sell = sell;
        this.whenLessThan = whenLessThan;
        this.previous = null;
        this.next = null;
    }

    async checkIfActivated()
    {
        var data = await query.getCurrentData([this.stock]);
        var ask = date["askPrice"];
        var bid = data["bidPrice"];
        if(this.sell)
        {
            var price = bid;
        }
        else
        {
            var price = ask;
        }
        if((this.whenLessThan == 1 && price <= this.price) || (this.whenLessThan == 0 && price >= this.price))
        {
            return(true)
        }
        else
        {
            return(false);
        }
    }

    async executeOrder()
    {
        //console.log("executing order")
        var alert = queue.createAlert();
        if(userQueues.get(this.userKey))
        {
            return(false);
        }
        userQueues.get(this.userKey).enqueue(alert);
        while(alert.alerted == 0)
        {
            await sleep(100);
        }
        let stocksHeld = await database.stockQuantity(this.userKey, this.stock);
        let buyingPower = await database.getBuyingPower(this.userKey);
        if(this.sell == 1)
        {
            if(stocksHeld < this.amount)
            {
                alert.unalert();
                return(false);
            }
            else
            {
                let newBuyingPower = buyingPower+this.price*this.amount;
                await database.updateStock(this.userKey, this.stock, stocksHeld-this.amount);
                await database.updateBuyingPower(this.userKey, newBuyingPower);
                alert.unalert();
                return(true);
            }
        }
        else
        {
            if(buyingPower < this.price*this.amount)
            {
                alert.unalert();
                return(false);
            }
            else
            {
                let newBuyingPower = buyingPower-this.price*this.amount;
                await database.updateStock(this.userKey, this.stock, stocksHeld+this.amount);
                await database.updateBuyingPower(this.userKey, newBuyingPower);
                alert.unalert();
                return(true);
            }
        }
    }
}

function addLimitOrder(userKey, stock, amount, price, sell, low)
{
    //console.log("adding limit order");
    var newOrder = new limitOrder(userKey, stock, amount, price, sell, low);
    newOrder.next = limitOrderLL;
    limitOrderLL = newOrder;
    return(true);
}

async function checkLimitOrders()
{
    //console.log("updating limit orders")
    var currentOrder = limitOrderLL;
    while(currentOrder != null)
    {
        var activated = await currentOrder.checkIfActivated();
        if(activated)
        {
            currentOrder.executeOrder();
            if(currentOrder.previous)
            {
                currentOrder.previous.next = currentOrder.next;
            }
            else
            {
                limitOrderLL = currentOrder.next;
            }
            if(currentOrder.next)
            {
                currentOrder.next.previous = currentOrder.previous;
            }
        }
        currentOrder = currentOrder.next;
    }
}


module.exports = 
{
     addLimitOrder, checkLimitOrders
}

