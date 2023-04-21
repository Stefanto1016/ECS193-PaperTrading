import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { Navigate } from 'react-router-dom';

import { StockChart } from '../components/LineChart';

import { createTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
    left: 775,

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

//const x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
//const y = [1, 2, 5, 3, 1, 2, 5, 8, 3, 4, 2]

function Game() {
    /*
    const chartData = {
        // x-axis labels
          labels: x,
          datasets: [
          {
            label: "Stock Price ($)",
            // corresponding y values
            data: y,
            fill: true,
            borderColor: "blue",
            tension: 0.1
          }
          ]
    }*/

    const profile = localStorage.getItem("profile");
    const [displayStart, setDisplayStart] = useState(true);
    const [displayLeaderboard, setDisplayLeaderboard] = useState(false);
    const [displayGame, setDisplayGame] = useState(false);
    const [displayEnd, setDisplayEnd] = useState(false);

    const [chartData, setChartData] = useState(emptyChart)

    const [stockSymbol, setStockSymbol] = useState('');
    const [stockDesc, setStockDesc] = useState('');
    const [stockMark, setStockMark] = useState('');

    const [displayStock, setStock] = useState(0);
    const [cutoff, setCutoff] = useState(0);
    const [histDataLen, setHistDataLen] = useState(0);
    const [trackedTimes, setTrackedTimes] = useState([]);
    const [trackedPrices, setTrackedPrices] = useState([]);

    const [option, setOption] = useState('')
    const [quantity, setQuantity] = useState(0)
    const [balance, setBalance] = useState(100000)
    const [ownedStocks, setOwnedStocks] = useState(0)
    const [buyError, setBuyError] = useState(false)
    const [sellError, setSellError] = useState(false)
    const [actionError, setActionError] = useState(false)
    const [quantityError, setQuantityError] = useState(false)
    const [validTransaction, setValidTransaction] = useState(false)

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
    }

    async function goPlay() {
        setDisplayStart(false)
        setDisplayEnd(false)
       
        setOption('')
        setQuantity(0)
        setBalance(100000)
        setOwnedStocks(0)

        const histData = await getHistData('GOOG')
        console.log(histData)
        const stockData = await getCurrentData(['GOOG'])

        setStockSymbol(stockData['GOOG'].symbol)
        setStockDesc(stockData['GOOG'].description)

        //console.log(histData[0].length)
        setHistDataLen(histData[0].length)
        //console.log(histDataLen)
        var middle = Math.floor(histData[0].length / 2)
        setCutoff(middle)
        console.log(middle)
        console.log(histData[0][middle-1].close)
        setStockMark(histData[0][middle-1].close)

        let times = []
        let prices = []

        for (const data of histData[0]) {
            //console.log(data.close)
            var date = new Date(data.datetime)
            const options = { month: 'short', day: 'numeric' };
            times.push(date.toLocaleString('en', options))
            prices.push(data.close)
        }

        //console.log(times)
        setTrackedTimes(times)
        //console.log(prices)
        setTrackedPrices(prices)

        const chartData = {
            // x-axis labels
              labels: times.slice(0, middle),
              datasets: [
              {
                label: "Stock Price ($)",
                // corresponding y values
                data: prices.slice(0, middle),
                fill: true,
                borderColor: "blue",
                tension: 0.1
              }
              ]
        }

        setChartData(chartData)
        setDisplayGame(true)
    }

    function StartInfo() {
        return (
            <Box display="flex" 
                    width={500} height={600} 
                    mx='auto'
                    mt={3}
                    border={0}>
                    <Paper elevation={3} sx={{width: 500,
                    height: 600}}>
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

                        <Typography variant='body2' mx='auto' textAlign='center' mt={1.75} border={0}>
                            or <span onClick={goPlay} style={{textDecoration: 'underline', cursor: 'pointer', color: 'blue'}}> play against yourself! </span>
                        </Typography>
                    </Paper>
            </Box>
        )
    }

    var leaderboardData = [{rank: 1, name: 'Jane Doe', balance: 120500},
                           {rank: 2, name: 'John Smith', balance: 120000},
                           {rank: 3, name: 'Bobby Brown', balance: 110000},
                           {rank: 4, name: 'Adam Miller', balance: 105000},
                           {rank: 5, name: 'Bill Lee', balance: 100000},
                           {rank: 6, name: 'Will Johnson', balance: 98000},
                           {rank: 7, name: 'Scott Williams', balance: 97000},
                           {rank: 8, name: 'Calvin Young', balance: 96500},
                          ]

    function LeaderboardInfo() {
        return (
            <Box display="flex" 
                    width={500} height={600} 
                    mx='auto'
                    mt={3}
                    border={0}>
                    <Paper elevation={3} sx={{width: 500,
                    height: 600}}>
                        <IconButton onClick={goStart} sx={{mt:2, ml:2, borderRadius:0, border:0}}>
                            <ArrowBackIcon/>
                            <Typography fontWeight='bold'>
                                 Back
                            </Typography>
                        </IconButton>


                        <Typography fontWeight='bold' variant='h4' textAlign='center' mt={1}>
                            Game Leaderboard
                        </Typography>

                        <TableContainer>
                            <Table sx={{ maxWidth: 450, mt: 1, mx: 'auto', border: 0}}>
                                <TableHead>
                                <TableRow sx={{ maxHeight: 50}}>
                                    <TableCell> # </TableCell>
                                    <TableCell> User </TableCell>
                                    <TableCell align='right'> Balance ($)</TableCell>
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                {leaderboardData.map((data) => (
                                    <TableRow
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                    <TableCell component="th" scope="row">
                                        {data.rank}
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
          if (numericQuantity * parseFloat(stockMark) > balance) {
            setBuyError(true)
            setSellError(false)
            setValidTransaction(false)
            setActionError(false)
            setQuantityError(false)
          } else {
            setBalance(parseFloat((balance - numericQuantity * parseFloat(stockMark)).toFixed(2)))
            setOwnedStocks(ownedStocks + numericQuantity)
            
            setBuyError(false)
            setSellError(false)
            setValidTransaction(true)
            setActionError(false)
            setQuantityError(false)
          }
        } else if (option == 'sell') {
          if (ownedStocks < numericQuantity) {
            setBuyError(false)
            setSellError(true)
            setValidTransaction(false)
            setActionError(false)
            setQuantityError(false)
          } else {
            setBalance(parseFloat((balance + numericQuantity * parseFloat(stockMark)).toFixed(2)))
            setOwnedStocks(ownedStocks - numericQuantity)
            
            setBuyError(false)
            setSellError(false)
            setValidTransaction(true)
            setActionError(false)
            setQuantityError(false)
          }
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
                    <ListItemText  primaryTypographyProps={{fontWeight: 'bold', fontSize: 20}}
                                    primary={'Account Buying Power ($): ' + balance}/>
                    <ListItemText  primaryTypographyProps={{fontWeight: 'bold', fontSize: 20}}
                                    primary={'Shares Owned: ' + ownedStocks}/>
                </List>
            </Box>

          
        )
    }

    function forwardDay() {
        if (cutoff + 1 == histDataLen) {
            goEnd()
        } else {
            setCutoff(cutoff + 1)
            console.log(trackedPrices)
            setStockMark(trackedPrices[cutoff])
            const chartData = {
                // x-axis labels
                labels: trackedTimes.slice(0, cutoff+1),
                datasets: [
                {
                  label: "Stock Price ($)",
                  // corresponding y values
                  data: trackedPrices.slice(0, cutoff+1),
                  fill: true,
                  borderColor: "blue",
                  tension: 0.1
                }
                ]
            }
            setChartData(chartData)
        }
    }

    function GameForwarding() {
        return (
            <Box sx={{ml: 5, mt: 3, border:0, maxWidth: 600, justifyContent: 'center'}}>
                <Typography variant='h5' fontWeight='bold' textAlign='center'>
                    {'Dates Remaining: ' + (histDataLen-cutoff)}
                </Typography>

                <Box sx={{mt: 2, border:0, display: 'flex', justifyContent: 'center'}}>
                    <Button variant='contained' onClick={forwardDay}>
                        Forward 1 Day
                    </Button>
                </Box>

            </Box>
        )
    }

    function EndInfo() {
        return (
            <Box display="flex" 
                 width={500} height={600} 
                 mx='auto'
                 mt={3}
                 border={0}>
                <Paper elevation={3} sx={{width: 500, height: 600}}>
                    <Typography fontWeight='bold' variant='h3' textAlign='center' mt={3}>
                        Game Over!
                    </Typography>

                    <Typography variant='h4' display='block' textAlign='center' mt={6} mx={4}>
                        {'Final Balance: ' + balance}
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
            {displayGame && <GameInfo/>}  
            {displayGame && PurchasingOptions()}
            {displayGame && <GameForwarding/>}
            {(displayGame) &&
                <div style={chartStyle}>
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