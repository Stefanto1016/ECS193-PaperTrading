const client_id = "Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK";

async function getCurrentData(companyList)//pass as array of strings listing company tag in caps without spaces
{
     var companies = "";
     for(var i = 0; i < companyList.length; i++)
     {
          companies = companies.concat([companyList[i]]); //throw error if fail
     }
     const queryType = "quotes";
     const url = `https://api.tdameritrade.com/v1/marketdata/${queryType}?`;
     const params = new URLSearchParams({apikey: client_id, symbol: companies});
     var data = await fetch(url + params);
     data = data.json();
     return(data);
}


async function getPreviousData(company, periodType, period, frequencyType, frequency)
{
     const url = `https://api.tdameritrade.com/v1/marketdata/${company}/pricehistory?`;
     const params = new URLSearchParams({apikey: client_id, periodType: periodType, period: period, frequencyType: frequencyType, frequency: frequency});
     var data = await fetch(url + params);
     data = data.json();
     return(data);
}

getCurrentData(["GOOG"]).then(response =>
     {
          console.log(response["GOOG"]["askPrice"]);
     })


getPreviousData("GOOG", "year", "5", "monthly", "1").then(response =>
     {
          console.log(response["candles"][0]["close"]);
     });