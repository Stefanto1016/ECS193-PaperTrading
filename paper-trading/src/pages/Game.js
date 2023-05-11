import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { Navigate } from 'react-router-dom';

//import { Challenge } from 'ExpresServer/challenge.js'

import { StockChart } from '../components/LineChart';

import { createTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import CircularProgress from '@mui/material/CircularProgress';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import Stack from '@mui/material/Stack';

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField'

import Snackbar from '@mui/material/Snackbar';

import Alert from '@mui/material/Alert';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { Typography } from '@mui/material';  

const chartStyle = {
    //width: 650,
    //height: 500,
    position: 'absolute',
    top: 175,
    left: 750,

}

async function retryFetch(url) {
    var data = await fetch(url);
    while(data.status == 429) {
         await new Promise(r => setTimeout(r, 200));
         var data = await fetch(url);
    }
    data = await data.json();
    return(data);
}

// Get quote of a desired stock symbol
async function getCurrentData(companyList)//pass as array of strings listing company tag in caps without spaces
{
   var companies = "";
   for(var i = 0; i < companyList.length; i++)
   {
        companies = companies.concat([companyList[i]]); //throw error if fail
   }
   const queryType = "quotes";
   const url = `https://api.tdameritrade.com/v1/marketdata/${queryType}?`;
   const params = new URLSearchParams({apikey: 'Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK', symbol: companies});
   var data = await retryFetch(url + params);
   return(data);
}

// Gather historical data of stock market for various intervals
async function getHistData(company)
{
   var client_id = 'Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK' 
   var retArr = [];
   const url = `https://api.tdameritrade.com/v1/marketdata/${company}/pricehistory?`;
   var params = new URLSearchParams({apikey: client_id, periodType: "month", period: 1, frequencyType: "daily", frequency: 1});
   var data = await retryFetch(url + params);
   retArr.push(data["candles"]);
   return(retArr);
}

function getRandomDate()
{
    const daysIn20Years = 7305;
    var date = new Date();
    const randNum = Math.floor(Math.random()*(daysIn20Years-730)+365);
    date.setDate(date.getDate()-randNum);
    return(date);
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

/*
This function takes the symbol of a stock in all caps and returns the day the stock was listed
or 20 years ago, whichever is most recent, in epoch time.
*/

async function getStockListDate(company)
{
    var client_id = 'Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK'  
     const url = `https://api.tdameritrade.com/v1/marketdata/${company}/pricehistory?`;
     const params = new URLSearchParams({apikey: client_id, periodType: "year", period: 20, frequencyType: "daily", frequency: 1});
     const data = await retryFetch(url + params);
     if(data["candles"].length == 0)
     {
          return(Number.MAX_SAFE_INTEGER);
     }
     return(data["candles"][0]["datetime"]);
}

/*This function will return an array containing all daily data points for a company withing the given time period inclusive. Pass to
the function the company symbol in caps as well as the start and end date as instances of the date class. will return a 2d array where
the first dimension in the data point and the second dimension determines whether you get the price at that data point or the epoch time of that data point*/


async function getPreviousDataRange(company, startDate, endDate)
{
     var client_id = 'Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK'  
     const url = `https://api.tdameritrade.com/v1/marketdata/${company}/pricehistory?`;
     const params = new URLSearchParams({apikey: client_id, periodType: "year", period: 20, frequencyType: "daily", frequency: 1});
     var data = await retryFetch(url + params);
     var returnArr = [];
     for(let i = 0; i < data["candles"].length; i++)
     {
          if(data["candles"][i]["datetime"] >= startDate.getTime() && data["candles"][i]["datetime"] <= endDate.getTime())
          {
               returnArr.push([data["candles"][i]["close"], data["candles"][i]["datetime"]]);
          }
     }
     return(returnArr);
}

async function getRandomStocks(startDate)
{
    var stockList = await getStockList();
    var retList = [];
    var startDateMinusYear = new Date(startDate.getTime());
    var startDatePlusYear = new Date(startDate.getTime());
    startDateMinusYear.setFullYear(startDate.getFullYear()-1);
    startDatePlusYear.setFullYear(startDate.getFullYear()+1);
    const googleArrayLength = (await getPreviousDataRange("GOOG", new Date(startDateMinusYear), new Date(startDatePlusYear))).length;
    //console.log(startDateMinusYear);
    var numStocks = 10;
    while (retList.length < numStocks)
    {
        var randNum = Math.floor(Math.random()*stockList.length);
        if(stockList[randNum] != null)
        {
            //console.log(stockList[randNum]["symbol"]);
            //console.log(retList.length);
            if(await getStockListDate(stockList[randNum]["symbol"]) < startDateMinusYear.getTime() && ((await getPreviousDataRange(stockList[randNum]["symbol"], new Date(startDateMinusYear), new Date(startDatePlusYear))).length == googleArrayLength))
            {
                retList.push(stockList[randNum]["symbol"]);
            }
            stockList[randNum] = null;
        }
    }
    return(retList);
}

async function getStockData(startDate, stocks)
{
    var startDateMinusYear = new Date(startDate.getTime());
    var startDatePlusYear = new Date(startDate.getTime());
    startDateMinusYear.setFullYear(startDate.getFullYear()-1);
    startDatePlusYear.setFullYear(startDate.getFullYear()+1);
    var returnArr = [];
    var numStocks = 10;
    for(let i = 0; i < numStocks; i++)
    {
        returnArr.push(await getPreviousDataRange(stocks[i], startDateMinusYear, startDatePlusYear));
        if(returnArr[i].length == 0)
        {
            return(0);
        }
    }
    return(returnArr);
}

const emptyChart = {
    // x-axis labels
    labels: [],
    datasets: [
      {
        label: '',
        // corresponding y values
        data: [],
        fill: true,
        borderColor: "blue",
        tension: 0.1
      }
    ]
}

function Game() {
    const profile = localStorage.getItem("profile");

    const [displayStart, setDisplayStart] = useState(true);
    const [displayLeaderboard, setDisplayLeaderboard] = useState(false);
    const [displayLoading, setDisplayLoading] = useState(false);
    const [displayGame, setDisplayGame] = useState(false);
    const [displayEnd, setDisplayEnd] = useState(false);

    const [leaderboard, setLeaderboad] = useState([]);

    const [chartData, setChartData] = useState(emptyChart)

    const [curStock, setCurStock] = useState('');
    const [curStockIndex, setCurStockIndex] = useState('');
    const [stockSymbol, setStockSymbol] = useState('');
    const [stockDesc, setStockDesc] = useState('');
    const [stockMark, setStockMark] = useState('');

    const [stocksList, setStocksList] = useState([]);
    const [stockToggles, setStockToggles] = useState([]);

    const [quoteData, setQuoteData] = useState([]);
    const [histData, setHistData] = useState([]); 
    const [histDataLen, setHistDataLen] = useState(0);
    const [curStockTimes, setCurStockTimes] = useState([]);
    const [curStockPrices, setCurStockPrices] = useState([]);
    const [cutoff, setCutoff] = useState(0);

    const [option, setOption] = useState('')
    const [quantity, setQuantity] = useState([])
    const [balance, setBalance] = useState(10000)
    const [buyingPower, setBuyingPower] = useState(10000)
    const [ownedStocks, setOwnedStocks] = useState({})
    const [buyError, setBuyError] = useState(false)
    const [sellError, setSellError] = useState(false)
    const [actionError, setActionError] = useState(false)
    const [quantityError, setQuantityError] = useState(false)
    const [validTransaction, setValidTransaction] = useState(false)

    //const [disableWeekForward, setDisableWeekForward] = useState(false)
    //const [disableMonthForward, setDisableMonthForward] = useState(false)

    // While loading, set up game
    // useEffect(() => {
    //     if (displayLoading) {
    //         console.log("in here")
    //         goPlay()
    //     }
    // }, [displayLoading])

    useEffect(() => {
        fetch("http://localhost:8000/challengeGetLeaderboard?" + new URLSearchParams({
            })).then(res => {return res.json()})
            .then(data => {setLeaderboad(data)});
    }, [])

    //useEffect(())

    // Disable buttons when certain amount of dates remain
    // useEffect(() => {
    //     if (histDataLen - cutoff <= 5 && !disableWeekForward) {
    //         console.log('disable week')
    //         setDisableWeekForward(true)
    //     }
    //     if (histDataLen - cutoff <= 20 && !disableMonthForward) {
    //         console.log('disable month')
    //         setDisableMonthForward(true)
    //     }
    // }, [cutoff])

    async function getStockQuotes(stockData, firstStockName) {
        var stocksInfo = []
        for (const stock of stockData) {
            stocksInfo.push(await getCurrentData([stock]))
        }
        setQuoteData(stocksInfo)
        console.log(stocksInfo[0][firstStockName].symbol)
        console.log(stocksInfo[0][firstStockName].description)
        setStockSymbol(stocksInfo[0][firstStockName].symbol)
        setStockDesc(stocksInfo[0][firstStockName].description)
        setDisplayStart(false)
        setDisplayEnd(false)
        setDisplayLoading(false)
        setDisplayGame(true)
    }

    function getStockButtons(stockNames) {
        var stockButtons = []
        for (const stock of stockNames) {
            stockButtons.push(<ToggleButton value={stock} key={stock}> {stock} </ToggleButton>)
        }
        setStockToggles(stockButtons)
    }

    function getChartData(firstStockData, cutoff) {
        let times = []
        let prices = []

        for (const data of firstStockData) {
            //console.log(data.close)
            var date = new Date(data[1])
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            times.push(date.toLocaleString('en', options))
            prices.push(data[0])
        }

        //console.log(times)
        setCurStockTimes(times)
        //console.log(prices)
        setCurStockPrices(prices)

        const chartData = {
            // x-axis labels
              labels: times.slice(0, cutoff),
              datasets: [
              {
                label: "Stock Price ($)",
                // corresponding y values
                data: prices.slice(0, cutoff),
                fill: true,
                borderColor: "blue",
                tension: 0.1
              }
              ]
        }

        setChartData(chartData)
    }

    // To change the stocks displayed on the game page
    function changeStock(event) {
        let times = []
        let prices = []
        const options = { year: 'numeric', month: 'short', day: 'numeric' };

        switch(event.target.value) {
        case stocksList[0]:
            var stock = stocksList[0]
            setCurStock(stock)
            setCurStockIndex(0)
            setStockSymbol(quoteData[0][stock].symbol)
            setStockDesc(quoteData[0][stock].description)
            setStockMark(histData[0][cutoff-1][0].toFixed(2))
            for (const data of histData[0]) {
                var date = new Date(data[1])
                times.push(date.toLocaleString('en', options))
                prices.push(data[0])
            }
            break
        case stocksList[1]:
            var stock = stocksList[1]
            setCurStock(stock)
            setCurStockIndex(1)
            setStockSymbol(quoteData[1][stock].symbol)
            setStockDesc(quoteData[1][stock].description)
            setStockMark(histData[1][cutoff-1][0].toFixed(2))
            for (const data of histData[1]) {
                var date = new Date(data[1])
                times.push(date.toLocaleString('en', options))
                prices.push(data[0])
            }
            break
        case stocksList[2]:
            var stock = stocksList[2]
            setCurStock(stock)
            setCurStockIndex(2)
            setStockSymbol(quoteData[2][stock].symbol)
            setStockDesc(quoteData[2][stock].description)
            setStockMark(histData[2][cutoff-1][0].toFixed(2))
            for (const data of histData[2]) {
                var date = new Date(data[1])
                times.push(date.toLocaleString('en', options))
                prices.push(data[0])
            }
            break
        case stocksList[3]:
            var stock = stocksList[3]
            setCurStock(stock)
            setCurStockIndex(3)
            setStockSymbol(quoteData[3][stock].symbol)
            setStockDesc(quoteData[3][stock].description)
            setStockMark(histData[3][cutoff-1][0].toFixed(2))
            for (const data of histData[3]) {
                var date = new Date(data[1])
                times.push(date.toLocaleString('en', options))
                prices.push(data[0])
            }
            break
        case stocksList[4]:
            var stock = stocksList[4]
            setCurStock(stock)
            setCurStockIndex(4)
            setStockSymbol(quoteData[4][stock].symbol)
            setStockDesc(quoteData[4][stock].description)
            setStockMark(histData[4][cutoff-1][0].toFixed(2))
            for (const data of histData[4]) {
                var date = new Date(data[1])
                times.push(date.toLocaleString('en', options))
                prices.push(data[0])
            }
            break
        case stocksList[5]:
            var stock = stocksList[5]
            setCurStock(stock)
            setCurStockIndex(5)
            setStockSymbol(quoteData[5][stock].symbol)
            setStockDesc(quoteData[5][stock].description)
            setStockMark(histData[5][cutoff-1][0].toFixed(2))
            for (const data of histData[5]) {
                var date = new Date(data[1])
                times.push(date.toLocaleString('en', options))
                prices.push(data[0])
            }
            break
        case stocksList[6]:
            var stock = stocksList[6]
            setCurStock(stock)
            setCurStockIndex(6)
            setStockSymbol(quoteData[6][stock].symbol)
            setStockDesc(quoteData[6][stock].description)
            setStockMark(histData[6][cutoff-1][0].toFixed(2))
            for (const data of histData[6]) {
                var date = new Date(data[1])
                times.push(date.toLocaleString('en', options))
                prices.push(data[0])
            }
            break
        case stocksList[7]:
            var stock = stocksList[7]
            setCurStock(stock)
            setCurStockIndex(7)
            setStockSymbol(quoteData[7][stock].symbol)
            setStockDesc(quoteData[7][stock].description)
            setStockMark(histData[7][cutoff-1][0].toFixed(2))
            for (const data of histData[7]) {
                var date = new Date(data[1])
                times.push(date.toLocaleString('en', options))
                prices.push(data[0])
            }
            break
        case stocksList[8]:
            var stock = stocksList[8]
            setCurStock(stock)
            setCurStockIndex(8)
            setStockSymbol(quoteData[8][stock].symbol)
            setStockDesc(quoteData[8][stock].description)
            setStockMark(histData[8][cutoff-1][0].toFixed(2))
            for (const data of histData[8]) {
                var date = new Date(data[1])
                times.push(date.toLocaleString('en', options))
                prices.push(data[0])
            }
            break
        case stocksList[9]:
            var stock = stocksList[9]
            setCurStock(stock)
            setCurStockIndex(9)
            setStockSymbol(quoteData[9][stock].symbol)
            setStockDesc(quoteData[9][stock].description)
            setStockMark(histData[9][cutoff-1][0].toFixed(2))
            for (const data of histData[9]) {
                var date = new Date(data[1])
                times.push(date.toLocaleString('en', options))
                prices.push(data[0])
            }
            break
        }

        setCurStockTimes(times)
        setCurStockPrices(prices)
        const chartData = {
            // x-axis labels
            labels: times.slice(0, cutoff),
            datasets: [
            {
              label: "Stock Price ($)",
              // corresponding y values
              data: prices.slice(0, cutoff),
              fill: true,
              borderColor: "blue",
              tension: 0.1
            }
            ]
          }
          console.log(chartData)
      
          setCurStock(event.target.value)
          setChartData(chartData) 
    }

    // Button handlers
    function goLeaderboard() {
        setDisplayStart(false)
        setDisplayLeaderboard(true)
    }
    function goStart() {
        setDisplayLeaderboard(false)
        setDisplayStart(true)
    }

    function goEnd() {
        setDisplayGame(false)
        setDisplayEnd(true)

        // const prof = JSON.parse(localStorage.getItem("profile"))
        // fetch("http://localhost:8000/challengeGetBalance?" + new URLSearchParams({
        //         userKey: prof["email"],
        //         daily: 0
        //     })).then(res => {return res.json()})
        //     .then(data => {setBalance(data.balance.toFixed(2))
        //                    setDisplayGame(false)
        //                    setDisplayEnd(true)}); 
    }

    function goLoad() {
        setDisplayStart(false)
        setDisplayEnd(false)
        setDisplayLoading(true)
    }

    async function goPlay() {
        setDisplayLoading(true)
        setDisplayGame(false)

        const prof = JSON.parse(localStorage.getItem("profile"))
        const options = {
            method: 'PUT',
            body: JSON.stringify({userKey: prof["email"]}),
            headers: {'Content-Type': 'application/json'}
        }
        fetch("http://localhost:8000/challengeCreatePersonalChallenge", options)
            .then(res => {return res.json()})
            .then(data => {
                           console.log(data)
                           console.log(data.stockData)
                           setHistData(data.stockData)
                           setCutoff(data.currentDay + 1)
                           console.log(data.stockData.length)
                           setHistDataLen(data.stockData[0].length)
                           setStockMark(data.stockData[0][data.currentDay][0].toFixed(2))
                           setCurStock(data.stocks[0])
                           setStocksList(data.stocks)
                           setCurStockIndex(0)
                           getStockButtons(data.stocks)
                           getChartData(data.stockData[0], data.currentDay + 1)
                           getStockQuotes(data.stocks, data.stocks[0])

                           fetch("http://localhost:8000/challengeGetBalance?" + new URLSearchParams({
                                userKey: prof["email"],
                                daily: 0
                            })).then(res => {return res.json()})
                            .then(data => {setBalance(data.balance.toFixed(2))});


                            fetch("http://localhost:8000/challengeGetBuyingPower?" + new URLSearchParams({
                                userKey: prof["email"],
                                daily: 0
                            })).then(res => {return res.json()})
                            .then(data => {setBuyingPower(data.buyingPower.toFixed(2))});

                            fetch("http://localhost:8000/challengeGetStocks?" + new URLSearchParams({
                                userKey: prof["email"],
                                daily: 0
                            })).then(res => {return res.json()})
                            .then(data => {setOwnedStocks(data)});
                            });
       
        setOption('')
        setQuantity(0)

        // fetch("http://localhost:8000/challengeGetBalance?" + new URLSearchParams({
        //         userKey: prof["email"],
        //         daily: 0
        //     })).then(res => {return res.json()})
        //     .then(data => {setBalance(data.balance.toFixed(2))});


        // fetch("http://localhost:8000/challengeGetBuyingPower?" + new URLSearchParams({
        //         userKey: prof["email"],
        //         daily: 0
        //     })).then(res => {return res.json()})
        //     .then(data => {setBuyingPower(data.buyingPower.toFixed(2))});


        // fetch("http://localhost:8000/challengeGetStocks?" + new URLSearchParams({
        //         userKey: prof["email"],
        //         daily: 0
        //     })).then(res => {return res.json()})
        //     .then(data => {setOwnedStocks(data)});
        
        setDisplayStart(false)
        setDisplayEnd(false)
    }

    function StartInfo() {
        return (
            <Box display="flex" 
                    width={500} height={625} 
                    mx='auto'
                    mt={3}
                    border={0}>
                    <Paper elevation={3} sx={{width: 500,
                    height: 625}}>
                        <Typography fontWeight='bold' variant='h3' textAlign='center' mt={3}>
                            The CompuTrade Stock Game
                        </Typography>

                        <Typography variant='body1' display='block' mt={6} mx={4}>
                            Interact between 10 different stocks given half a year's worth of data and make your own transactions
                            throughout the remainder of the year! 
                            <br/>
                            <br/>
                            Observe the trends of the stocks, make your choices, and move on
                            to the next day, week, or month until you reach the very end! 
                            <br/>
                            <br/>
                            Play smart and try to maximize your
                            total earnings amongst a leaderboard!
                        </Typography>

                        <Typography fontWeight='bold' variant='h4' textAlign='center' mt={3}>
                            Up for the challenge?
                        </Typography>

                        <Stack direction="row" spacing={6} justifyContent='center' ml={3} mr={3} mt={3} border={0}>
                            <Button variant='contained' onClick={goPlay}>
                                Play Now!
                            </Button>

                            <Button variant='contained' onClick={goLeaderboard}>
                                View Leaderboard
                            </Button>
                        </Stack>

                        <Typography variant='body2' mx='auto' textAlign='center' mt={3} border={0}>
                            or <span onClick={goPlay} style={{textDecoration: 'underline', cursor: 'pointer', color: 'blue'}}> play against yourself! </span>
                        </Typography>
                    </Paper>
            </Box>
        )
    }

    function Loading() {
        return (
            <Box sx={{flexDirection: 'column', textAlign: 'center', mt: 30}}>
                <Typography variant='h5' textAlign='center'>
                    Loading game...
                </Typography>

                <br/>

                <CircularProgress />
            </Box>
        )
    }

    var leaderboardData = [{name: 'Jane Doe', balance: 120500},
                           {name: 'John Smith', balance: 120000},
                           {name: 'Bobby Brown', balance: 110000},
                           {name: 'Adam Miller', balance: 105000},
                           {name: 'Bill Lee', balance: 100000},
                           {name: 'Will Johnson', balance: 98000},
                           {name: 'Scott Williams', balance: 97000},
                           {name: 'Calvin Young', balance: 96500},
                          ]

    function LeaderboardInfo() {
        return (
            <Box display="flex" 
                    width={500} height={625} 
                    mx='auto'
                    mt={3}
                    border={0}>
                    <Paper elevation={3} sx={{width: 500,
                    height: 625}}>
                        <IconButton onClick={goStart} sx={{mt:2, ml:2, borderRadius:0, border:0}}>
                            <ArrowBackIcon/>
                            <Typography fontWeight='bold'>
                                 Back
                            </Typography>
                        </IconButton>


                        <Typography fontWeight='bold' variant='h4' textAlign='center' mt={2}>
                            Game Leaderboard
                        </Typography>

                        <TableContainer>
                            <Table sx={{ maxWidth: 450, mt: 2, mx: 'auto', border: 0}}>
                                <TableHead>
                                <TableRow sx={{ maxHeight: 50}}>
                                    <TableCell> # </TableCell>
                                    <TableCell> User </TableCell>
                                    <TableCell align='right'> Balance ($)</TableCell>
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                {leaderboard.map((data, index) => (
                                    <TableRow
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                    <TableCell component="th" scope="row">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell>{data.name}</TableCell>
                                    <TableCell align='right'>{data.balance}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
            </Box>
        )
    }

    // Change between option of buying/selling stock
    function changeOption(event) {
        setOption(event.target.value)
    }

    // Change the amount of stocks to buy or sell
    function changeQuantity(event) {
        const regex = /^[0-9\b]+$/;
        // Textfield for quantity only accepts integers
        if (event.target.value === "" || regex.test(event.target.value)) {
        setQuantity(event.target.value)
        }
    }

    function handleTransaction() {
        if (quantity === '') {
            setBuyError(false)
            setSellError(false)
            setValidTransaction(false)
            setActionError(false)
            setQuantityError(true)
            return
        }
    
        const numericQuantity = parseInt(quantity)
    
        if (option == 'buy') {
            const prof = JSON.parse(localStorage.getItem("profile"))
            const options = {
                method: 'POST',
                body: JSON.stringify({userKey: prof["email"], stock: curStockIndex, amount: numericQuantity, daily: 0}),
                headers: {'Content-Type': 'application/json'}
            }
            fetch("http://localhost:8000/challengeBuyStock", options)
            .then(res => {return res.json()})
            .then(data => {
                if (data.buyingPower === false) {
                    setBuyError(true)
                    setSellError(false)
                    setValidTransaction(false)
                    setActionError(false)
                    setQuantityError(false) 
                } else {
                    setBuyingPower(data.buyingPower.toFixed(2))
                    fetch("http://localhost:8000/challengeGetStocks?" + new URLSearchParams({
                        userKey: prof["email"],
                        daily: 0
                    })).then(res => {return res.json()})
                    .then(data => {setOwnedStocks(data)});
                    
                    setBuyError(false)
                    setSellError(false)
                    setValidTransaction(true)
                    setActionError(false)
                    setQuantityError(false) 
                }
            });

        //   if (numericQuantity * parseFloat(stockMark) > balance) {
        //     setBuyError(true)
        //     setSellError(false)
        //     setValidTransaction(false)
        //     setActionError(false)
        //     setQuantityError(false)
        //   } else {
        //     setBalance(parseFloat((balance - numericQuantity * parseFloat(stockMark)).toFixed(2)))
        //     var object = ownedStocks
        //     object[curStock] = object[curStock] + numericQuantity
        //     setOwnedStocks(object)
            
        //     setBuyError(false)
        //     setSellError(false)
        //     setValidTransaction(true)
        //     setActionError(false)
        //     setQuantityError(false)
        //   }
        } else if (option == 'sell') {
            const prof = JSON.parse(localStorage.getItem("profile"))
            const options = {
                method: 'POST',
                body: JSON.stringify({userKey: prof["email"], stock: curStockIndex, amount: numericQuantity, daily: 0}),
                headers: {'Content-Type': 'application/json'}
            }
            fetch("http://localhost:8000/challengeSellStock", options)
            .then(res => {return res.json()})
            .then(data => {
                if (data.buyingPower === false) {
                    setBuyError(false)
                    setSellError(true)
                    setValidTransaction(false)
                    setActionError(false)
                    setQuantityError(false) 
                } else {
                    setBuyingPower(data.buyingPower.toFixed(2))
                    fetch("http://localhost:8000/challengeGetStocks?" + new URLSearchParams({
                        userKey: prof["email"],
                        daily: 0
                    })).then(res => {return res.json()})
                    .then(data => {setOwnedStocks(data)});
                    
                    setBuyError(false)
                    setSellError(false)
                    setValidTransaction(true)
                    setActionError(false)
                    setQuantityError(false) 
                }
            });

        //   if (ownedStocks[curStock] < numericQuantity) {
        //     setBuyError(false)
        //     setSellError(true)
        //     setValidTransaction(false)
        //     setActionError(false)
        //     setQuantityError(false)
        //   } else {
        //     setBalance(parseFloat((balance + numericQuantity * parseFloat(stockMark)).toFixed(2)))
        //     var object = ownedStocks
        //     object[curStock] = object[curStock] - numericQuantity
        //     setOwnedStocks(object)
            
        //     setBuyError(false)
        //     setSellError(false)
        //     setValidTransaction(true)
        //     setActionError(false)
        //     setQuantityError(false)
        //   }
        } else {
            setBuyError(false)
            setSellError(false)
            setValidTransaction(false)
            setActionError(true)
            setQuantityError(false)
        }
      }

    // Handle closing of popup transaction alert
    const handleClose = (event, reason) => {
        // Need this condition so alert doesn't go away on mouse click
        if (reason === 'clickaway') {
            return;
        }
    
        // Close any of the possible alerts
        setBuyError(false)
        setSellError(false)
        setValidTransaction(false)
        setActionError(false)
        setQuantityError(false)
    };

    // GUI for purchasing or selling stock
    function PurchasingOptions() {
        return (
            <Box sx={{ width: '100%', maxWidth: 10000, ml:5}}>
                <FormControl>
                <InputLabel sx={{mt:1, ml:3}}>Action</InputLabel>
                <Select
                    value={option}
                    label='Action'
                    onChange={changeOption}
                    sx={{minWidth:250, mt: 1, ml: 3}}
                >
                    <MenuItem value={'buy'}> Buy </MenuItem>
                    <MenuItem value={'sell'}> Sell </MenuItem>
                </Select>
                </FormControl>

                <TextField id="outlined-basic" 
                        label="Quantity"
                        variant="outlined" 
                        onChange={changeQuantity}
                        value={quantity} 
                        sx={{mt:1, ml:3}}/>

                <Button variant='contained' onClick={handleTransaction} sx={{height: 50, mt:3.3, mt:1.3, ml: 3}}>
                Confirm
                </Button>


                <Snackbar open={validTransaction} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={2000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    Transaction Completed
                </Alert>
                </Snackbar>

                <Snackbar open={buyError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={2000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    Insufficient Funds
                </Alert>
                </Snackbar>

                <Snackbar open={sellError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={2000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    Insufficient Shares
                </Alert>
                </Snackbar>

                <Snackbar open={actionError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={2000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    No Selected Action
                </Alert>
                </Snackbar>

                <Snackbar open={quantityError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={2000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                    No Quantity Provided
                </Alert>
                </Snackbar>            
            </Box>      
        )
    }

    function GameInfo() {
        return (
            <Box sx={{mt:11, ml:5}}>
                <List component={Stack} direction='row' sx={{maxWidth: 800, ml:3}}>
                    <ListItemText 
                    primaryTypographyProps={{fontWeight: 'bold', fontSize: 30}}
                    primary={stockSymbol}
                    secondaryTypographyProps={{fontWeight: 'light', fontSize: 15, color: 'gray'}}
                    secondary={stockDesc}/>
                </List>

                <Typography fontWeight='bold' sx={{ml:3, fontSize: 30}}>
                    {'Market Price ($): ' + stockMark}
                </Typography>

                <List component={Stack} direction='row' sx={{maxWidth: 700, ml:3}}>
                    <ListItemText  primaryTypographyProps={{fontWeight: 'bold', fontSize: 18}}
                                    primary={'Balance ($): ' + balance}/>
                    <ListItemText  primaryTypographyProps={{fontWeight: 'bold', fontSize: 18}}
                                    primary={'Buying Power ($): ' + buyingPower}/>
                    <ListItemText  primaryTypographyProps={{fontWeight: 'bold', fontSize: 18}}
                                    primary={'Shares Owned: ' + ownedStocks[curStockIndex]}/>
                </List>
            </Box>

          
        )
    }

    function forwardDay() {
        const prof = JSON.parse(localStorage.getItem("profile"))
        const options = {
            method: 'POST',
            body: JSON.stringify({userKey: prof["email"], daily: 0}),
            headers: {'Content-Type': 'application/json'}
        }
        fetch("http://localhost:8000/challengeNextDay", options)
            .then(res => {return res.json()})
            .then(data => {
                if (data.isFinished) {
                    goEnd()
                } else {
                    setCutoff(data.currentDay + 1)
                    console.log(curStockPrices)
                    setStockMark(curStockPrices[data.currentDay].toFixed(2))
                    const chartData = {
                        // x-axis labels
                        labels: curStockTimes.slice(0, data.currentDay+1),
                        datasets: [
                        {
                        label: "Stock Price ($)",
                        // corresponding y values
                        data: curStockPrices.slice(0, data.currentDay+1),
                        fill: true,
                        borderColor: "blue",
                        tension: 0.1
                        }
                        ]
                    }
                    setChartData(chartData)
                    setBalance(data.balance.toFixed(2))
                }
            });

        // fetch("http://localhost:8000/challengeGetBalance?" + new URLSearchParams({
        //         userKey: prof["email"],
        //         daily: 0
        //     })).then(res => {return res.json()})
        //     .then(data => {setBalance(data.balance.toFixed(2))}); 


        // if (cutoff + 1 == histDataLen) {
        //     goEnd()
        // } else {
        //     setCutoff(cutoff + 1)
        //     console.log(curStockPrices)
        //     setStockMark(curStockPrices[cutoff].toFixed(2))
        //     const chartData = {
        //         // x-axis labels
        //         labels: curStockTimes.slice(0, cutoff+1),
        //         datasets: [
        //         {
        //           label: "Stock Price ($)",
        //           // corresponding y values
        //           data: curStockPrices.slice(0, cutoff+1),
        //           fill: true,
        //           borderColor: "blue",
        //           tension: 0.1
        //         }
        //         ]
        //     }
        //     setChartData(chartData)
        // }
    }

    // Forwards 5 dates
    function forwardWeek() {
        const prof = JSON.parse(localStorage.getItem("profile"))
        const options = {
            method: 'POST',
            body: JSON.stringify({userKey: prof["email"], daily: 0}),
            headers: {'Content-Type': 'application/json'}
        }
        fetch("http://localhost:8000/challengeNextWeek", options)
            .then(res => {return res.json()})
            .then(data => {
                if (data.isFinished) {
                    goEnd()
                } else {
                    setCutoff(data.currentDay + 1)
                    console.log(curStockPrices)
                    setStockMark(curStockPrices[data.currentDay].toFixed(2))
                    const chartData = {
                        // x-axis labels
                        labels: curStockTimes.slice(0, data.currentDay+1),
                        datasets: [
                        {
                        label: "Stock Price ($)",
                        // corresponding y values
                        data: curStockPrices.slice(0, data.currentDay+1),
                        fill: true,
                        borderColor: "blue",
                        tension: 0.1
                        }
                        ]
                    }
                    setChartData(chartData)
                    setBalance(data.balance.toFixed(2))
                }
            });

        // fetch("http://localhost:8000/challengeGetBalance?" + new URLSearchParams({
        //     userKey: prof["email"],
        //     daily: 0
        // })).then(res => {return res.json()})
        // .then(data => {setBalance(data.balance.toFixed(2))}); 
        // if (cutoff + 5 == histDataLen) {
        //     goEnd()
        // } else {
        //     setCutoff(cutoff + 5)
        //     console.log(curStockPrices)
        //     setStockMark(curStockPrices[cutoff+4].toFixed(2))
        //     const chartData = {
        //         // x-axis labels
        //         labels: curStockTimes.slice(0, cutoff+5),
        //         datasets: [
        //         {
        //           label: "Stock Price ($)",
        //           // corresponding y values
        //           data: curStockPrices.slice(0, cutoff+5),
        //           fill: true,
        //           borderColor: "blue",
        //           tension: 0.1
        //         }
        //         ]
        //     }
        //     setChartData(chartData)
        // }
    }

    // Forward 20 dates
    function forwardMonth() {
        const prof = JSON.parse(localStorage.getItem("profile"))
        const options = {
            method: 'POST',
            body: JSON.stringify({userKey: prof["email"], daily: 0}),
            headers: {'Content-Type': 'application/json'}
        }
        fetch("http://localhost:8000/challengeNextMonth", options)
            .then(res => {return res.json()})
            .then(data => {
                if (data.isFinished) {
                    goEnd()
                } else {
                    setCutoff(data.currentDay + 1)
                    console.log(curStockPrices)
                    setStockMark(curStockPrices[data.currentDay].toFixed(2))
                    const chartData = {
                        // x-axis labels
                        labels: curStockTimes.slice(0, data.currentDay+1),
                        datasets: [
                        {
                        label: "Stock Price ($)",
                        // corresponding y values
                        data: curStockPrices.slice(0, data.currentDay+1),
                        fill: true,
                        borderColor: "blue",
                        tension: 0.1
                        }
                        ]
                    }
                    setChartData(chartData)
                    setBalance(data.balance.toFixed(2))
                }
            });

        // fetch("http://localhost:8000/challengeGetBalance?" + new URLSearchParams({
        //     userKey: prof["email"],
        //     daily: 0
        // })).then(res => {return res.json()})
        // .then(data => {setBalance(data.balance.toFixed(2))}); 
        // if (cutoff + 20 == histDataLen) {
        //     goEnd()
        // } else {
        //     setCutoff(cutoff + 20)
        //     console.log(curStockPrices)
        //     setStockMark(curStockPrices[cutoff+19].toFixed(2))
        //     const chartData = {
        //         // x-axis labels
        //         labels: curStockTimes.slice(0, cutoff+20),
        //         datasets: [
        //         {
        //           label: "Stock Price ($)",
        //           // corresponding y values
        //           data: curStockPrices.slice(0, cutoff+20),
        //           fill: true,
        //           borderColor: "blue",
        //           tension: 0.1
        //         }
        //         ]
        //     }
        //     setChartData(chartData)
        // }
    }
    

    function GameForwarding() {
        return (
            <Box sx={{ml: 4, mt: 3, border:0, maxWidth: 680}}>
                <Typography variant='h5' fontWeight='bold' textAlign='center'>
                    {'Dates Remaining: ' + (histDataLen-cutoff)}
                </Typography>

                <Box sx={{mt: 2, border:0, display: 'flex', justifyContent: 'space-between'}}>
                    <Button size='medium' variant='contained' disabled={histDataLen - cutoff == 0} onClick={forwardDay}>
                        Forward 1 Day
                    </Button>

                    <Button size='medium' variant='contained' disabled={histDataLen - cutoff < 5} onClick={forwardWeek}>
                        Forward 1 Week (5 Dates)
                    </Button>

                    <Button size='medium' variant='contained' disabled={histDataLen - cutoff < 20} onClick={forwardMonth}>
                        Forward 1 Month (20 Dates)
                    </Button>
                </Box>

                <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                    <Button size='large' variant='contained' disabled={histDataLen - cutoff != 0} onClick={forwardDay}>
                        Finish
                    </Button>
                </Box>

            </Box>
        )
    }

    function EndInfo() {
        return (
            <Box display="flex" 
                 width={500} height={275} 
                 mx='auto'
                 mt={20}
                 border={0}>
                <Paper elevation={3} sx={{width: 500, height: 275}}>
                    <Typography fontWeight='bold' variant='h3' textAlign='center' mt={3}>
                        Game Over!
                    </Typography>

                    <Typography variant='h4' display='block' textAlign='center' mt={6} mx={4}>
                        {'Final Balance: $' + balance}
                    </Typography>

                    <Box sx={{display:'flex', justifyContent:'center', mt: 5}}>
                        <Button variant='contained' onClick={goPlay}>
                            Play Again?
                        </Button>
                    </Box>
                </Paper>
            </Box>
        )
    }

    return (
        <div>
            {profile ? (
        <div>
            <NavBar/> 

            {displayStart && <StartInfo/>}
            {displayLeaderboard && <LeaderboardInfo/>}
            {displayLoading && <Loading/>}
            {displayGame && <GameInfo/>}
            {displayGame && PurchasingOptions()}
            {displayGame && <GameForwarding/>}
            {(displayGame) &&
                <div style={chartStyle}>
                    <Box textAlign='center'>
                        <ToggleButtonGroup onChange={changeStock} value={curStock}>
                            {stockToggles}
                        </ToggleButtonGroup>
                    </Box>
                    {(<StockChart chartData={chartData}/>)}
                </div>
            }
            {displayEnd && <EndInfo/>}


            
        </div>
            ) : (
                <Navigate to="/login"/>
            )}
        </div>
    )
}

export default Game;