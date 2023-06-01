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

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

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

    // 0 for personal challenge, 1 for daily challenge
    const [gameType, setGameType] = useState(null);

    const [completedDaily, setCompletedDaily] = useState(null);

    const [dialogOpen, setDialogOpen] = useState(false);

    const [leaderboard, setLeaderboad] = useState([]);
    const [leaderboardPosition, setLeaderboadPosition] = useState(null);
    const [leaderboardSuccess, setLeaderboadSuccess] = useState(false);
    const [leaderboardFail, setLeaderboadFail] = useState(true);

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

    const [totalStocksBought, setTotalStocksBought] = useState(0)
    const [moneySpent, setMoneySpent] = useState(0)
    const [stocksListBought, setStocksListBought] = useState(Array(10).fill(0))
    const [mostPurchasedStock, setMostPurchasedStock] = useState('N/A')
    const [mostPurchasedStockAmount, setMostPurchasedStockAmount] = useState(0)
    const [highestAmountBought, setHighestAmountBought] = useState(0)
    const [highestAmountStock, setHighestAmountStock] = useState('N/A')
    const [highestSingleSpending, setHighestSingleSpending] = useState(0)
    const [highestSingleSpendingStock, setHighestSingleSpendingStock] = useState('N/A')

    useEffect(() => {
        document.body.style.overflow = "hidden";
        window.scrollTo(0,0);
    })

    useEffect(() => {
        fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetLeaderboard?" + new URLSearchParams({
            })).then(res => {return res.json()})
            .then(data => {console.log(data); setLeaderboad(data.slice(0, 8))});
    }, [])

    useEffect(() => {
        const prof = JSON.parse(localStorage.getItem("profile"))
        fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetUserLeaderboardPosition?" + new URLSearchParams({
            userKey: prof["email"],
            today: 1
            })).then(res => {return res.json()})
            .then(data => {console.log(data); setLeaderboadPosition(data.position)});
    }, [])

    useEffect(() => {
        const prof = JSON.parse(localStorage.getItem("profile"))
        fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeHasCompletedDaily?" + new URLSearchParams({
            userKey: prof["email"],
            })).then(res => {return res.json()})
            .then(data => {console.log(data); setCompletedDaily(data.isFinished)});
    }, [])

    useEffect(() => {
        if (gameType != null) {
            goPlay()
        }
    }, [gameType])

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
            setStockMark(histData[0][cutoff-1][0])
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
            setStockMark(histData[1][cutoff-1][0])
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
            setStockMark(histData[2][cutoff-1][0])
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
            setStockMark(histData[3][cutoff-1][0])
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
            setStockMark(histData[4][cutoff-1][0])
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
            setStockMark(histData[5][cutoff-1][0])
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
            setStockMark(histData[6][cutoff-1][0])
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
            setStockMark(histData[7][cutoff-1][0])
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
            setStockMark(histData[8][cutoff-1][0])
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
            setStockMark(histData[9][cutoff-1][0])
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

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };
    
    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    function NoteDialog() {
        return (
        <Dialog
            open={dialogOpen}
            onClose={handleDialogClose}
            PaperProps={{ sx: { width: "35%" } }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title" style={{textDecoration:'underline'}} textAlign="center">
                {"Note"}
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description" textAlign='center'>
                You have already completed today's daily challenge!
            </DialogContentText>
            </DialogContent>
            <DialogActions style={{ justifyContent: "center" }}>
                <Button variant='contained' onClick={handleDialogClose}>OK</Button>
            </DialogActions>
        </Dialog>
        )
    }

    // Button handlers
    function goLeaderboard() {
        setDisplayStart(false)
        setDisplayLeaderboard(true)
    }
    function goStart() {
        setDisplayEnd(false)
        setDisplayLeaderboard(false)
        setDisplayStart(true)
        setGameType(null)
    }

    function goEnd() {
        const isAllZero = stocksListBought.every(item => item === 0);
        console.log(isAllZero)

        if (!isAllZero) {
            var maxIndex = stocksListBought.indexOf(Math.max(...stocksListBought));
            setMostPurchasedStock(stocksList[maxIndex])
            setMostPurchasedStockAmount(stocksListBought[maxIndex])
        }

        setDisplayGame(false)
        setDisplayEnd(true)

    }

    function goLoad() {
        setDisplayStart(false)
        setDisplayEnd(false)
        setDisplayLoading(true)
    }

    async function goPlay() {
        if (gameType == 1 && completedDaily == true) {
            handleDialogOpen()
            setGameType(null)
            console.log('already completed daily')
            return
        }

        setDisplayLoading(true)
        setDisplayGame(false)
        setLeaderboadSuccess(false)
        setLeaderboadFail(true)

        const prof = JSON.parse(localStorage.getItem("profile"))
        const options = {
            method: 'PUT',
            body: JSON.stringify({userKey: prof["email"]}),
            headers: {'Content-Type': 'application/json'}
        }

        // Create personal challenge
        if (gameType == 0) {
            fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeCreatePersonalChallenge", options)
                .then(res => {return res.json()})
                .then(data => {
                            console.log('Personal Challlenge Creating...')
                            console.log(data)
                            console.log(data.stockData)
                            setHistData(data.stockData)
                            setCutoff(data.currentDay + 1)
                            console.log(data.stockData.length)
                            setHistDataLen(data.stockData[0].length)
                            setStockMark(data.stockData[0][data.currentDay][0])
                            setCurStock(data.stocks[0])
                            setStocksList(data.stocks)
                            setCurStockIndex(0)
                            getStockButtons(data.stocks)
                            getChartData(data.stockData[0], data.currentDay + 1)
                            getStockQuotes(data.stocks, data.stocks[0])

                            fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetBalance?" + new URLSearchParams({
                                    userKey: prof["email"],
                                    daily: gameType
                                })).then(res => {return res.json()})
                                .then(data => {setBalance(data.balance)});


                                fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetBuyingPower?" + new URLSearchParams({
                                    userKey: prof["email"],
                                    daily: gameType
                                })).then(res => {return res.json()})
                                .then(data => {setBuyingPower(data.buyingPower)});

                                fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetStocks?" + new URLSearchParams({
                                    userKey: prof["email"],
                                    daily: gameType
                                })).then(res => {return res.json()})
                                .then(data => {setOwnedStocks(data)});
                                });
        } else {
            fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetStockData?" + new URLSearchParams({
                    userKey: prof["email"],
                    daily: gameType
                })).then(res => {return res.json()})
                .then(data => {
                                    if (data.currentDay == data.stockData[0].length) {
                                        console.log('already completed daily challenge')
                                        return;
                                    } else {
                                        console.log('Daily Challlenge Creating...')
                                        console.log(data)
                                        console.log(data.stockData)
                                        setHistData(data.stockData)
                                        setCutoff(data.currentDay + 1)
                                        console.log(data.stockData.length)
                                        setHistDataLen(data.stockData[0].length)
                                        console.log('Current Day: ' + data.currentDay)
                                        console.log(data.stockData[0])
                                        setStockMark(data.stockData[0][data.currentDay][0])
                                        setCurStock(data.stocks[0])
                                        setStocksList(data.stocks)
                                        setCurStockIndex(0)
                                        getStockButtons(data.stocks)
                                        getChartData(data.stockData[0], data.currentDay + 1)
                                        getStockQuotes(data.stocks, data.stocks[0])

                                        fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetBalance?" + new URLSearchParams({
                                                userKey: prof["email"],
                                                daily: gameType
                                            })).then(res => {return res.json()})
                                            .then(data => {setBalance(data.balance)});


                                            fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetBuyingPower?" + new URLSearchParams({
                                                userKey: prof["email"],
                                                daily: gameType
                                            })).then(res => {return res.json()})
                                            .then(data => {setBuyingPower(data.buyingPower)});

                                            fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetStocks?" + new URLSearchParams({
                                                userKey: prof["email"],
                                                daily: gameType
                                            })).then(res => {return res.json()})
                                            .then(data => {setOwnedStocks(data)});
                                    }
                            })
        }
       
        setOption('')
        setQuantity(0)

        setTotalStocksBought(0)
        setMoneySpent(0)
        setStocksListBought(Array(10).fill(0))
        setMostPurchasedStock('N/A')
        setMostPurchasedStockAmount(0)
        setHighestAmountBought(0)
        setHighestAmountStock('N/A')
        setHighestSingleSpending(0)
        setHighestSingleSpendingStock('N/A')
        
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
                            <Button variant='contained' onClick={() => {setGameType(1)}}>
                                Play Now!
                            </Button>

                            <Button variant='contained' onClick={goLeaderboard}>
                                View Leaderboard
                            </Button>
                        </Stack>

                        <Typography variant='body2' mx='auto' textAlign='center' mt={3} border={0}>
                            or <span onClick={() => {setGameType(0)}} 
                                style={{textDecoration: 'underline', cursor: 'pointer', color: 'blue'}}> play against yourself! </span>
                        </Typography>
                    </Paper>
            </Box>
        )
    }

    function Loading() {
        return (
            <Box sx={{flexDirection: 'column', textAlign: 'center', mt: 30}}>
                <Typography variant='h5' textAlign='center'>
                    {'Loading ' + (gameType ? 'Daily Challenge...' : 'Personal Challenge...')}
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
                                    <TableCell>{data.userKey}</TableCell>
                                    <TableCell align='right'>{data.score.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
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
                body: JSON.stringify({userKey: prof["email"], stock: curStockIndex, amount: numericQuantity, daily: gameType}),
                headers: {'Content-Type': 'application/json'}
            }
            fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeBuyStock", options)
            .then(res => {return res.json()})
            .then(data => {
                if (data.buyingPower === false) {
                    setBuyError(true)
                    setSellError(false)
                    setValidTransaction(false)
                    setActionError(false)
                    setQuantityError(false) 
                } else {
                    setBuyingPower(data.buyingPower)
                    fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetStocks?" + new URLSearchParams({
                        userKey: prof["email"],
                        daily: gameType
                    })).then(res => {return res.json()})
                    .then(data => {setOwnedStocks(data)});
                    

                    setTotalStocksBought(totalStocksBought + numericQuantity)
                    setMoneySpent(moneySpent + parseFloat(stockMark) * numericQuantity)

                    var list = stocksListBought
                    list[curStockIndex] += numericQuantity
                    setStocksListBought(list)

                    if (parseFloat(stockMark) * numericQuantity > highestSingleSpending) {
                        setHighestSingleSpending(parseFloat(stockMark) * numericQuantity)
                        setHighestSingleSpendingStock(stockSymbol)
                    }

                    if (numericQuantity > highestAmountBought) {
                        setHighestAmountBought(numericQuantity)
                        setHighestAmountStock(stockSymbol)
                    }

                    setBuyError(false)
                    setSellError(false)
                    setValidTransaction(true)
                    setActionError(false)
                    setQuantityError(false) 
                }
            });
        } else if (option == 'sell') {
            const prof = JSON.parse(localStorage.getItem("profile"))
            const options = {
                method: 'POST',
                body: JSON.stringify({userKey: prof["email"], stock: curStockIndex, amount: numericQuantity, daily: gameType}),
                headers: {'Content-Type': 'application/json'}
            }
            fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeSellStock", options)
            .then(res => {return res.json()})
            .then(data => {
                if (data.buyingPower === false) {
                    setBuyError(false)
                    setSellError(true)
                    setValidTransaction(false)
                    setActionError(false)
                    setQuantityError(false) 
                } else {
                    setBuyingPower(data.buyingPower)
                    fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetStocks?" + new URLSearchParams({
                        userKey: prof["email"],
                        daily: gameType
                    })).then(res => {return res.json()})
                    .then(data => {setOwnedStocks(data)});
                    
                    setBuyError(false)
                    setSellError(false)
                    setValidTransaction(true)
                    setActionError(false)
                    setQuantityError(false) 
                }
            });
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
                    {'Market Price ($): ' + stockMark.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </Typography>

                <List component={Stack} direction='row' sx={{maxWidth: 700, ml:3}}>
                    <ListItemText  primaryTypographyProps={{fontWeight: 'bold', fontSize: 18}}
                                    primary={'Balance ($): ' + balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/>
                    <ListItemText  primaryTypographyProps={{fontWeight: 'bold', fontSize: 18}}
                                    primary={'Buying Power ($): ' + buyingPower.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/>
                    <ListItemText  primaryTypographyProps={{fontWeight: 'bold', fontSize: 18}}
                                    primary={'Shares Owned: ' + ownedStocks[curStockIndex].toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}/>
                </List>
            </Box>

          
        )
    }

    function forwardDay() {
        const prof = JSON.parse(localStorage.getItem("profile"))
        const options = {
            method: 'POST',
            body: JSON.stringify({userKey: prof["email"], daily: gameType}),
            headers: {'Content-Type': 'application/json'}
        }
        fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeNextDay", options)
            .then(res => {return res.json()})
            .then(data => {
                if (data.isFinished) {
                    if (gameType == 1) {
                        setCompletedDaily(true)
                        fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetUserLeaderboardPosition?" + new URLSearchParams({
                        userKey: prof["email"],
                        today: 1
                        })).then(res => {return res.json()})
                        .then(data => {
                            console.log(leaderboardPosition)
                            console.log(data.position)
                            if (leaderboardPosition == false && data.position != false) {
                                // You made it to the leaderboard
                                console.log('YES')
                                setLeaderboadSuccess(true)
                                setLeaderboadFail(false)
                            }
                            goEnd()
                        });
                    } else {
                        goEnd()
                    }
                } else {
                    setCutoff(data.currentDay + 1)
                    console.log(curStockPrices)
                    setStockMark(curStockPrices[data.currentDay])
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
                    console.log(data)
                    setBalance(data.balance)
                }
            });
    }

    // Forwards 5 dates
    function forwardWeek() {
        const prof = JSON.parse(localStorage.getItem("profile"))
        const options = {
            method: 'POST',
            body: JSON.stringify({userKey: prof["email"], daily: gameType}),
            headers: {'Content-Type': 'application/json'}
        }
        fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeNextWeek", options)
            .then(res => {return res.json()})
            .then(data => {
                if (data.isFinished) {
                    if (gameType == 1) {
                        setCompletedDaily(true)
                        fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetUserLeaderboardPosition?" + new URLSearchParams({
                        userKey: prof["email"],
                        today: 1
                        })).then(res => {return res.json()})
                        .then(data => {
                            if (leaderboardPosition == false && data.position != false) {
                                // You made it to the leaderboard
                                console.log('YES')
                                setLeaderboadSuccess(true)
                                setLeaderboadFail(false)         
                            }
                            goEnd()
                        });
                    } else {
                        goEnd()
                    }
                } else {
                    setCutoff(data.currentDay + 1)
                    console.log(curStockPrices)
                    setStockMark(curStockPrices[data.currentDay])
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
                    setBalance(data.balance)
                }
            });
    }

    // Forward 20 dates
    function forwardMonth() {
        const prof = JSON.parse(localStorage.getItem("profile"))
        const options = {
            method: 'POST',
            body: JSON.stringify({userKey: prof["email"], daily: gameType}),
            headers: {'Content-Type': 'application/json'}
        }
        fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeNextMonth", options)
            .then(res => {return res.json()})
            .then(data => {
                if (data.isFinished) {
                    if (gameType == 1) {
                        setCompletedDaily(true)
                        fetch("https://api-dot-papertrading-378100.uw.r.appspot.com/challengeGetUserLeaderboardPosition?" + new URLSearchParams({
                        userKey: prof["email"],
                        today: 1
                        })).then(res => {return res.json()})
                        .then(data => {
                            if (leaderboardPosition == false && data.position != false) {
                                // You made it to the leaderboard
                                setLeaderboadSuccess(true)
                                setLeaderboadFail(false)
                            }
                            goEnd()
                        });
                    } else {
                        goEnd()
                    }
                } else {
                    setCutoff(data.currentDay + 1)
                    console.log(curStockPrices)
                    setStockMark(curStockPrices[data.currentDay])
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
                    setBalance(data.balance)
                }
            });
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
                 width={500} height={625} 
                 mx='auto'
                 mt={3}
                 border={0}>
                <Paper elevation={3} sx={{width: 500, height: 625}}>
                    <Typography fontWeight='bold' variant='h3' textAlign='center' mt={3}>
                        Game Over!
                    </Typography>

                    {
                        leaderboardFail &&

                        <Typography variant='h4' display='block' textAlign='center' mt={6} mx={4} style={{whiteSpace: 'pre-line'}}>
                            {'Final Balance: $' + balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </Typography>

                    }                    

                    {   leaderboardSuccess &&

                        <Box>
                            <Typography variant='h6' display='block' textAlign='center' mt={1} mx={4} style={{whiteSpace: 'pre-line'}}
                                        sx={{color: "#4caf50"}}>
                                {'Congratulations!\n You made it onto the leaderboard!'}
                            </Typography>

                        

                            <Typography variant='h4' display='block' textAlign='center' mt={1} mb={-4} mx={4} style={{whiteSpace: 'pre-line'}}>
                                {'Final Balance: $' + balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </Typography>
                        </Box>
                         
                    }
                    
                    <Typography variant='h5' display='block' textAlign='center' mt={6} mx={4}
                                sx={{textDecoration: 'underline', color: "#757575"}}
                    >
                        Additional Stats
                    </Typography>

                    <Typography variant='body1' display='block' textAlign='center' mt={2} mx={4}
                                sx={{color: "#757575"}}
                    >
                        {"Total Shares Purchased: " + totalStocksBought.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                    </Typography>

                    <Typography variant='body1' display='block' textAlign='center' mt={2} mx={4}
                                sx={{color: "#757575"}}
                    >
                        {"Total Money Spent: $" + moneySpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </Typography>

                    <Typography variant='body1' display='block' textAlign='center' mt={2} mx={4}
                                sx={{color: "#757575"}}
                    >
                        {"Total Money Earned: $" + (parseFloat(balance) - (10000 - moneySpent)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </Typography>  

                    <Typography variant='body1' display='block' textAlign='center' mt={2} mx={4}
                                sx={{color: "#757575"}}
                    >
                        {"Most Purchased Stock: " + mostPurchasedStock + " (" + mostPurchasedStockAmount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) + ")"}
                    </Typography> 


                    <Typography variant='body1' display='block' textAlign='center' mt={2} mx={4}
                                sx={{color: "#757575"}}
                    >
                        {"Highest Spending in One Transaction: $" + highestSingleSpending.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + " (" + highestSingleSpendingStock + ")"}
                    </Typography> 


                    <Typography variant='body1' display='block' textAlign='center' mt={2} mx={4}
                                sx={{color: "#757575"}}
                    >
                        {"Most Shares Bought in One Transaction: " + highestAmountBought.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) + " (" + highestAmountStock + ")"}
                    </Typography>  


                    <Stack direction="row" spacing={6} justifyContent='center' ml={3} mr={3} mt={6} border={0}>
                            <Button variant='contained' onClick={gameType ? handleDialogOpen : goPlay}>
                                Play Again
                            </Button>

                            <Button variant='contained' onClick={goStart}>
                                Game Menu
                            </Button>
                    </Stack>

                    {/* <Box sx={{display:'flex', justifyContent:'center', mt: 5}}>
                        <Button variant='contained' onClick={goPlay}>
                            Play Again?
                        </Button>
                    </Box> */}
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
            {displayStart && <NoteDialog/>}
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
            {displayEnd && <NoteDialog/>}


            
        </div>
            ) : (
                <Navigate to="/login"/>
            )}
        </div>
    )
}

export default Game;