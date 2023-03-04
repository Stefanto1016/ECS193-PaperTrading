const client_id = "Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK";


/*
This function takes a request and continues to retry it so long as the
request returns 429 for too many requests.
*/

async function retryFetch(url)
{
     var data = await fetch(url);
     while(data.status == 429)
     {
          await new Promise(r => setTimeout(r, 200));
          var data = await fetch(url);
     }
     data = await data.json();
     return(data);
}

/*
This function takes the symbol of a stock in all caps and returns the amount of data points
to be provided for each timer period. This function will work so long as the company passed
was first listed at least 20 years ago and is currently listed. I used GOOG in my testing 
but decided against hard coding it
*/

async function getNumDataPoints(company)
{
     var retArr = [];
     const url = `https://api.tdameritrade.com/v1/marketdata/${company}/pricehistory?`;
     var params = new URLSearchParams({apikey: client_id, periodType: "month", period: 1, frequencyType: "daily", frequency: 1});
     var data = await retryFetch(url + params);
     retArr.push(data["candles"].length);
     params = new URLSearchParams({apikey: client_id, periodType: "month", period: 6, frequencyType: "daily", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"].length);
     params = new URLSearchParams({apikey: client_id, periodType: "year", period: 1, frequencyType: "daily", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"].length);
     params = new URLSearchParams({apikey: client_id, periodType: "year", period: 5, frequencyType: "daily", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"].length);
     params = new URLSearchParams({apikey: client_id, periodType: "year", period: 20, frequencyType: "daily", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"].length);
     return(retArr);
}

/*
This function takes the symbol of a stock in all caps and returns the day the stock was listed
or 20 years ago, whichever is most recent, in epoch time.
*/

async function getStockListDate(company)
{
     const url = `https://api.tdameritrade.com/v1/marketdata/${company}/pricehistory?`;
     const params = new URLSearchParams({apikey: client_id, periodType: "year", period: 20, frequencyType: "daily", frequency: 1});
     const data = await retryFetch(url + params);
     return(data["candles"][0]["datetime"]);
}

/*
This function will return all current data about a stock. Pass to function the symbol of
a stock as a string in all caps. For a full list of available information check out 
"https://developer.tdameritrade.com/quotes/apis/get/marketdata/%7Bsymbol%7D/quotes"
using the apikey listed at the top of this document
*/

async function getCurrentData(companyList)
{
     var companies = "";
     for(var i = 0; i < companyList.length; i++)
     {
          companies = companies.concat([companyList[i]]);
     }
     const queryType = "quotes";
     const url = `https://api.tdameritrade.com/v1/marketdata/${queryType}?`;
     const params = new URLSearchParams({apikey: client_id, symbol: companies});
     var data = await retryFetch(url + params);
     return(data);
}

/*
This function will return an array containing around 50 data points spread over a given time period. 
Pass to function the company symbol in caps as a string and the array taken from the getNumDataPoints function.
will return a 3d array where the first dimension is the timer period of the data in the following order: 1 month, 
6 months, 1 year, 5 years, 20 years, the second dimension determines which data point, the third dimension 
determines whether you get the price at that data point or the epoch time of that data point.
*/

async function getPreviousData(company, numDataPoints)
{
     const url = `https://api.tdameritrade.com/v1/marketdata/${company}/pricehistory?`;
     const params = new URLSearchParams({apikey: client_id, periodType: "year", period: 20, frequencyType: "daily", frequency: 1});
     var data = await retryFetch(url + params);
     var returnArr = [];
     for(var i = 0; i < 5; i++)
     {
          if(data["candles"].length >= numDataPoints[i])
          {
               var arr = [];
               for(var j = data["candles"].length-numDataPoints[i]; j < data["candles"].length; j+=Math.ceil(numDataPoints[i]/50))
               {
                    arr.push([data["candles"][j]["close"], data["candles"][j]["datetime"]]);
               }
               returnArr.push(arr);
          }
     }
     return(returnArr);
}

/*
This function will return a list the symbols of all elligible stocks. As of now, that is simply any stock listed
on the NYSE or the NASDAQ
*/

async function getStockList()
{
     var url =  "https://api.tdameritrade.com/v1/instruments?apikey=Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK&symbol=[A-Z]*&projection=symbol-regex";
     var data = await retryFetch(url);
     var returnList = [];
     for(var index in data)
     {
          if(data[index]["exchange"] == "NYSE" || data[index]["exchange"] == "NASDAQ")
          {
               returnList.push(data[index]);
          }
     }
     return(returnList);
}



module.exports = 
{
     getNumDataPoints, getStockListDate, getCurrentData, getPreviousData, getStockList
}
