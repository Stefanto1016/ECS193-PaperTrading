import React, {useEffect} from 'react'
import { useState } from 'react';
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { StockChart } from '../components/LineChart';
import NavBar from '../components/NavBar';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import Snackbar from '@mui/material/Snackbar';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import Stack from '@mui/material/Stack';
import { minWidth } from '@mui/system';



function Stocks() {


  const chartStyle = {
    //width: 650,
    //height: 500,
    position: 'absolute',
    top: 175,
    left: 775,

  }

  // Data for Chart 1
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

  const [chartData, setChartData] = useState(emptyChart);
  const [dataVisibility, setDataVisibility] = useState(false)

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
    //console.log(companyList)
     var companies = "";
     for(var i = 0; i < companyList.length; i++)
     {
          companies = companies.concat([companyList[i]]); //throw error if fail
     }
     //console.log(companies)
     const queryType = "quotes";
     const url = `https://api.tdameritrade.com/v1/marketdata/${queryType}?`;
     const params = new URLSearchParams({apikey: 'Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK', symbol: companies});
     //console.log(url+params)
     var data = await retryFetch(url + params);
     return(data);
  }

  const [histData, setHistData] = useState([]);

  // Gather historical data of stock market for various intervals
  async function getNumDataPoints(company)
  {
     var client_id = 'Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK' 
     var retArr = [];
     const url = `https://api.tdameritrade.com/v1/marketdata/${company}/pricehistory?`;
     var params = new URLSearchParams({apikey: client_id, periodType: "day", period: 1, frequencyType: "minute", frequency: 5});
     var data = await retryFetch(url + params);
     retArr.push(data["candles"]);
     params = new URLSearchParams({apikey: client_id, periodType: "day", period: 5, frequencyType: "minute", frequency: 30});
     data = await retryFetch(url + params);
     retArr.push(data["candles"]); 
     params = new URLSearchParams({apikey: client_id, periodType: "month", period: 1, frequencyType: "daily", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"]);
     params = new URLSearchParams({apikey: client_id, periodType: "month", period: 6, frequencyType: "daily", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"]);
     params = new URLSearchParams({apikey: client_id, periodType: "year", period: 1, frequencyType: "daily", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"]);
     params = new URLSearchParams({apikey: client_id, periodType: "year", period: 5, frequencyType: "weekly", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"]);
     params = new URLSearchParams({apikey: client_id, periodType: "year", period: 20, frequencyType: "weekly", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"]);
     params = new URLSearchParams({apikey: client_id, periodType: "ytd", period: 1, frequencyType: "daily", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"]);
     return(retArr);
  }

  // Displays primary data regarding a given stock
  function PrimaryData() {
    return (
      <div>
        <List component={Stack} direction='row' sx={{maxWidth: 800, ml:3}}>
            <ListItemText 
              primaryTypographyProps={{fontWeight: 'bold', fontSize: 30}}
              primary={stockInfo.symbol}
              secondaryTypographyProps={{fontWeight: 'light', fontSize: 15, color: 'gray'}}
              secondary={stockInfo.desc}/>
          </List>


        <Box sx={{ width: '100%', maxWidth: 400}}>
          <List component={Stack} direction='row' sx={{maxWidth: 800, ml:3}}>
            <ListItemText 
              primaryTypographyProps={{fontWeight: 'bold', fontSize: 30}}
              primary={stockInfo.mark + ' USD'}/>
            <ListItemText 
              primaryTypographyProps={{fontSize: 25, 
                                       color: (stockInfo.markChange > 0 ? 'green' : 'red'), mt:0.3}}
              primary={(stockInfo.markChange > 0 ? '+' : '') + stockInfo.markChange}/>
            <ListItemText 
              primaryTypographyProps={{fontSize: 25,
                                       color: (stockInfo.markChange > 0 ? 'green' : 'red'), mt:0.3}}
              primary={(stockInfo.markChange > 0 ? '+' : '') + stockInfo.markPercentChange + '%'}/>
          </List>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 360}}>
          <List component={Stack} direction='row' sx={{maxWidth: 800, ml:3}}>
            <ListItemText primary={stockInfo.exchangeName} secondary='EXCHANGE'/>
            <ListItemText primary={stockInfo.volatility} secondary='VOLATILITY'/>
            <ListItemText primary={stockInfo.peRatio} secondary='P/E'/>
          </List>
        </Box>
      </div>
    )
  }

  // Displays secondary data given a stock
  function SecondaryData() {
    return (
      <div>
        <Stack direction="row" spacing={2}>
          <List sx={{width: "100%", maxWidth: 360, ml:1.5}}>
            <ListItem>
              <ListItemText primary="Volume (current)" />
              <ListItemText align='right' primary={stockInfo.volume} />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary="Today's High ($)" />
              <ListItemText align='right' primary={stockInfo.high} />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary="Today's Low ($)" />
              <ListItemText align='right' primary={stockInfo.low} />
            </ListItem>
          </List>

          <List sx={{width: "100%", maxWidth: 360}}>
            <ListItem>
              <ListItemText primary="52 Week High ($)" />
              <ListItemText align='right' primary={stockInfo.week52High} />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary="Bid/Ask Price ($)" />
              <ListItemText align='right' primary={stockInfo.bidPrice + '/' + stockInfo.askPrice} />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary="52 Week Low ($)" />
              <ListItemText align='right' primary={stockInfo.week52Low} />
            </ListItem>
          </List>
      
        </Stack>


        <Box sx={{ width: '100%', maxWidth: 1000}}>
          <List component={Stack} direction='row' sx={{maxWidth: 700, ml:3}}>
            <ListItemText  primaryTypographyProps={{fontWeight: 'bold', fontSize: 20}}
                           primary={'Account Buying Power ($): ' + balance}/>
            <ListItemText  primaryTypographyProps={{fontWeight: 'bold', fontSize: 20}}
                           primary={'Amount of Stocks Owned: ' + ownedStocks}/>
          </List>
        </Box>
      </div>
    )
  }

  const [option, setOption] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [balance, setBalance] = useState(0)
  const [ownedStocks, setOwnedStocks] = useState(500)
  const [buyError, setBuyError] = useState(false)
  const [sellError, setSellError] = useState(false)
  const [actionError, setActionError] = useState(false)
  const [quantityError, setQuantityError] = useState(false)
  const [validTransaction, setValidTransaction] = useState(false)


  useEffect ( () => {fetch("http://localhost:8000/getPortfolioData?" + new URLSearchParams({
          userKey: "grkoziol@ucdavis.edu"
    })).then(res => {return res.json()})
    .then(data => {setBalance(Math.ceil(data.buyingPower * 100)/100)});
  }, []);


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

    //setQuantity(parseInt(event.target.value))
  }

  function handleTransaction() {
    //console.log('Hi')
    //setBuyError(false)
    //setSellError(false)
    //setValidTransaction(false)
    
    if (quantity === '') {
        setBuyError(false)
        setSellError(false)
        setValidTransaction(false)
        setActionError(false)
        setQuantityError(true)
        return
    }

    //console.log(stockInfo.mark)
    //console.log(typeof stockInfo.mark)
    const numericQuantity = parseInt(quantity)

    if (option == 'buy') {
      if (numericQuantity * parseFloat(stockInfo.mark) > balance) {
        setBuyError(true)
        setSellError(false)
        setValidTransaction(false)
        setActionError(false)
        setQuantityError(false)
      } else {
        setBalance(parseFloat((balance - numericQuantity * parseFloat(stockInfo.mark)).toFixed(2)))
        //console.log(typeof ownedStocks)
        //console.log(typeof quantity)
        setOwnedStocks(ownedStocks + numericQuantity)
        fetch("http://localhost:8000/buyStock?" + new URLSearchParams({
          userKey: "grkoziol@ucdavis.edu",
          stock: stockInfo.symbol.toUpperCase(),
          amount: numericQuantity
          }))
        
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
        //console.log("here")
        //console.log(parseFloat(stockInfo.bidPrice))
        //console.log(balance + numericQuantity * parseFloat(stockInfo.bidPrice))
        setBalance(parseFloat((balance + numericQuantity * parseFloat(stockInfo.mark)).toFixed(2)))
        setOwnedStocks(ownedStocks - numericQuantity)
        fetch("http://localhost:8000/sellStock?" + new URLSearchParams({
          userKey: "grkoziol@ucdavis.edu",
          stock: stockInfo.symbol.toUpperCase(),
          amount: numericQuantity
          }));
        
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
      <Box sx={{ width: '100%', maxWidth: 10000}}>
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

      {/*
        {buyError && 
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            Insufficient funds
          </Alert>
        }
        {sellError &&
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            Insufficient shares
          </Alert>
        }
        {validTransaction &&
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            Transaction complete
          </Alert>
        }
    */}
      
      
      
      </Box>      
    )
  }



  // All possible time intervals for stock graph  
  const intervals = [
    <ToggleButton value="1D" key="1D">
      1D
    </ToggleButton>,
    <ToggleButton value="5D" key="5D">
      5D
    </ToggleButton>,
    <ToggleButton value="1M" key="1M">
      1M
    </ToggleButton>,
    <ToggleButton value="6M" key="6M">
      6M
    </ToggleButton>,
    <ToggleButton value="1Y" key="1Y">
      1Y
    </ToggleButton>,
    <ToggleButton value="5Y" key="5Y">
      5Y
    </ToggleButton>,
    <ToggleButton value="Max" key="Max">
      Max
    </ToggleButton>,
    <ToggleButton value="YTD" key="YTD">
      YTD
    </ToggleButton>,
  ];

  // Get information related to a given stock
  function handleClick(stock) {
    const array = [stock]
  
    getCurrentData(array).then(async response =>
      {
        //console.log(response)
        if (Object.keys(response).length === 0 || stock == '') {
          setIsValidStock(false)
        } else {
            setIsValidStock(true)
            const stockAllCaps = stock.toUpperCase()
          
            setStockInfo(
              {
                symbol: response[stockAllCaps]['symbol'],
                desc: response[stockAllCaps]['description'],
                mark: response[stockAllCaps]['mark'],
                markChange: response[stockAllCaps]['markChangeInDouble'],
                markPercentChange: response[stockAllCaps]['markPercentChangeInDouble'],
                exchangeName: response[stockAllCaps]['exchangeName'],
                volatility: response[stockAllCaps]['volatility'],
                peRatio: response[stockAllCaps]['peRatio'],
                volume: response[stockAllCaps]['totalVolume'],
                high: response[stockAllCaps]['highPrice'],
                low: response[stockAllCaps]['lowPrice'],
                bidPrice: response[stockAllCaps]['bidPrice'],
                askPrice: response[stockAllCaps]['askPrice'],
                week52High: response[stockAllCaps]['52WkHigh'],
                week52Low: response[stockAllCaps]['52WkLow'],
              }
            )

            const res = await getNumDataPoints(stockAllCaps)
            setHistData(res)
            //getNumDataPoints(stockAllCaps).then(response =>
                //console.log(response[0])
                //setHistData(response)
                //console.log(response)
                
            let times = []
            let prices = []
            for (const candle of res[2]) {
              //console.log(candle)
              var date = new Date(candle.datetime)
              const options = { year: 'numeric', month: 'short', day: 'numeric' };
              times.push(date.toLocaleString('en', options))
              prices.push(candle.close)
            }
            //console.log(times)
            //console.log(prices)
            const chartData = {
            // x-axis labels
              labels: times,
              datasets: [
              {
                label: "Stock Price ($)",
                // corresponding y values
                data: prices,
                fill: true,
                borderColor: "blue",
                tension: 0.1
              }
              ]
            }
            console.log(chartData)

            setChartData(chartData)

            setInterval('1M')

            setDataVisibility(true)
        }
      }
    )

    fetch("http://localhost:8000/getSpecificStock?" + new URLSearchParams({
          userKey: "grkoziol@ucdavis.edu",
          stock: stock.toString().toUpperCase()
      })).then(res => {return res.json()})
      .then(data => setOwnedStocks(data.quantity));
  }

  const [searchStock, setStock] = useState('')
  const [stockInfo, setStockInfo] = useState(
                                            {symbol: '',
                                            desc: '',
                                            mark: '',
                                            markChange: '',
                                            markPercentChange: '',
                                            exchangeName: '',
                                            volatility: '',
                                            peRatio: '',
                                            volume: '',
                                            high: '',
                                            low: '',
                                            bidPrice: '',
                                            askPrice: '',
                                            week52High: '',
                                            week52Low: '',
                                          })
  const [isValidStock, setIsValidStock] = useState(true)
  
  // Button used to search for stock
  const SearchButton = () => (
    <IconButton onClick={() => handleClick(searchStock)}>
      <SearchIcon />
    </IconButton>
    )

  // Set stock to be searched
  function changeStock(event) {
    setStock(event.target.value)
  }

  // To change the time intervals displayed by stock graph
  const [interval, setInterval] = useState('1M')
  function changeInterval(event) {
    //console.log(event.target.value)
    //setInterval(event.target.value)
    let times = []
    let prices = []

    switch(event.target.value) {
      case "1D":
        for (const candle of histData[0]) {
          //console.log(candle)
          var date = new Date(candle.datetime)
          const options = { hour: '2-digit', minute: '2-digit' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "5D":
        for (const candle of histData[1]) {
          //console.log(candle)
          var date = new Date(candle.datetime)
          const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "1M":
        for (const candle of histData[2]) {
          //console.log(candle)
          var date = new Date(candle.datetime)
          const options = { month: 'short', day: 'numeric' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "6M":
        for (const candle of histData[3]) {
          //console.log(candle)
          var date = new Date(candle.datetime)
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "1Y":
        for (const candle of histData[4]) {
          //console.log(candle)
          var date = new Date(candle.datetime)
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "5Y":
        for (const candle of histData[5]) {
          //console.log(candle)
          var date = new Date(candle.datetime)
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "Max":
        for (const candle of histData[6]) {
          //console.log(candle)
          var date = new Date(candle.datetime)
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "YTD":
        for (const candle of histData[7]) {
          //console.log(candle)
          var date = new Date(candle.datetime)
          const options = { month: 'short', day: 'numeric' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
    }
    
    const chartData = {
      // x-axis labels
      labels: times,
      datasets: [
      {
        label: "Stock Price ($)",
        // corresponding y values
        data: prices,
        fill: true,
        borderColor: "blue",
        tension: 0.1
      }
      ]
    }
    console.log(chartData)

    setInterval(event.target.value)
    setChartData(chartData) 
  }

  return (
    <div className='Stocks'>
      <NavBar/> 

      <Box
      sx={{
        width: 1000,
        maxWidth: '100%',
        m: 2
      }}
    >
      <TextField id="standard-basic" 
                 label="Search for Symbol" 
                 variant="standard"
                 onChange={changeStock}
                 InputProps={{endAdornment: <SearchButton />}}
                 error={!isValidStock}
                 helperText={
                  !isValidStock ? 'Invalid Symbol' : null
                 }
      />

    </Box>

    {dataVisibility && <PrimaryData/>}
    {dataVisibility && <SecondaryData/>}

    {(dataVisibility) &&
      <div style={chartStyle}>
        <Box textAlign='center'>
          <ToggleButtonGroup onChange={changeInterval} value={interval}>
            {intervals}
          </ToggleButtonGroup>
        </Box>
        {(<StockChart chartData={chartData}/>)}
      </div>
    }
    {dataVisibility && PurchasingOptions()}

    </div>

  )
}

export default Stocks