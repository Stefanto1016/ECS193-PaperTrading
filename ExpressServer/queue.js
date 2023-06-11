function sleep(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}


class Queue 
{
    constructor() 
    {
        this.arr = [];
        this.size = 0;
    }


    enqueue(object) 
    {
        this.arr[this.size] = object;
        this.size += 1;
    }


    dequeue() 
    {
        if(this.size == 0)
        {
            return(null);
        }
        var newArr = [];
        var output = this.arr[0];
        for(let i = 1; i < this.size; i++)
        {
            newArr.push(this.arr[i]);
        }
        this.arr = newArr;
        this.size -= 1;
        output.alert();
        return(output);
    }


    getSize() 
    {
        return this.size;
    }


    isEmpty() 
    {
        return this.size == 0;
    }

    async run(delay1, delay2)
    {
        while(1)
        {
            await sleep(delay1);
            var alert = this.dequeue();
            if(alert != null)
            {
                while(alert.alerted == 1)
                {
                    await sleep(delay2);
                }
            }
        }
    }
}

var globalQueue = new Queue();
var userQueues = new Map();
var userChallengeQueues = new Map();

function createQueue()
{
    return(new Queue());
}

class Alert
{
    constructor()
    {
        this.alerted = 0;
    }

    alert()
    {
        this.alerted = 1;
    }

    unalert()
    {
        this.alerted = 0;
    }
}


function createAlert()
{
    return(new Alert());
}

function getGlobalQueue()
{
    return(globalQueue);
}

function getUserQueue()
{
    return(userQueues);
}

function getUserChallengeQueue()
{
    return(userChallengeQueues);
}

module.exports = 
{
     createQueue, createAlert, getGlobalQueue, getUserQueue, getUserChallengeQueue
}

