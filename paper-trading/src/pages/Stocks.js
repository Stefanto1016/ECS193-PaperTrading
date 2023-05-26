import React, {useEffect} from 'react'
import { useState } from 'react';
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField'
import { StockChart } from '../components/LineChart';
import NavBar from '../components/NavBar';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';

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
import { ListItemIcon } from '@mui/material';

import { useLocation } from 'react-router';
import { useNavigate, Navigate } from 'react-router-dom';
import { NumericFormat } from 'react-number-format'


function Stocks() {
  const navigate = useNavigate();
  
  const numberWithCommas = (n) => n?.toString.replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';

  const profile = localStorage.getItem("profile");

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

  const addWatchlist = {
    height: 50, 
    mt:3.3, 
    mt:1.3, 
    ml: 3,
    backgroundColor: "green"
  }
  const removeWatchlist = {
    height: 50, 
    mt:3.3, 
    mt:1.3, 
    ml: 3,
    backgroundColor: "red"
  }


  // Accessing stock info from other pages
  const [externalStock, setExternalStock] = useState(useLocation().state)


  const [chartData, setChartData] = useState(emptyChart)
  const [fromOtherPage, setFromOtherPage] = useState(false)
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
              primary={stockInfo.mark.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' USD'}/>
            <ListItemText 
              primaryTypographyProps={{fontSize: 25, 
                                       color: (stockInfo.markChange > 0 ? 'green' : 'red'), mt:0.3}}
              primary={(stockInfo.markChange > 0 ? '+' : '') + stockInfo.markChange.toFixed(2)}/>
            <ListItemText 
              primaryTypographyProps={{fontSize: 25,
                                       color: (stockInfo.markChange > 0 ? 'green' : 'red'), mt:0.3}}
              primary={(stockInfo.markChange > 0 ? '+' : '') + stockInfo.markPercentChange.toFixed(2) + '%'}/>
          </List>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 400}}>
          <List component={Stack} direction='row' sx={{maxWidth: 800, ml:3}}>
            <ListItemText primary={stockInfo.exchangeName} secondary='EXCHANGE'/>
            <ListItemText primary={stockInfo.volatility} secondary='VOLATILITY'/>
            <ListItemText primary={stockInfo.peRatio.toFixed(2)} secondary='P/E'/>
            <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>
                                  {'Exchange: The market where stocks are bought and sold\n\n' +
                                   'Voltaility: The rate at which a stock price increases or decreases over a given period\n\n' +
                                   'P/E: The relation between a company\'s share price and its earnings per share'}                  
                            </span>} placement='top'>
                <IconButton disableRipple size='small'>
                  <InfoIcon />
                 </IconButton>
            </Tooltip>
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
              <ListItemText primary={"Volume (current): " + stockInfo.volume.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} />
              <Tooltip title="The number of shares of a stock traded today" placement='top'>
                <IconButton disableRipple size='small'>
                  <InfoIcon />
                 </IconButton>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={"Today's High ($): " + stockInfo.high.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/>
              <Tooltip title="The highest price of the share today" placement='top'>
                <IconButton disableRipple size='small'>
                  <InfoIcon />
                 </IconButton>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={"Today's Low ($): " + stockInfo.low.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/>
              <Tooltip title="The lowest price of the share today" placement='top'>
                <IconButton disableRipple size='small'>
                  <InfoIcon />
                 </IconButton>
              </Tooltip>
            </ListItem>
          </List>

          <List sx={{width: "100%", maxWidth: 360, justifyContent: 'flex-start'}}>
            <ListItem>
              <ListItemText primary={"52 Week High ($): " + stockInfo.week52High.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/>
              <Tooltip title="The highest price of the share within a 52 week period" placement='top'>
                <IconButton disableRipple size='small'>
                  <InfoIcon />
                 </IconButton>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={"Bid/Ask Price ($): " + stockInfo.bidPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' / ' + stockInfo.askPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/>
              <Tooltip title="The max/min price willing to be paid for a share" placement='top'>
                <IconButton disableRipple size='small'>
                  <InfoIcon />
                 </IconButton>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText primary={"52 Week Low ($): " + stockInfo.week52Low.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/>
              <Tooltip title="The lowest price of the share within a 52 week period" placement='top'>
                <IconButton disableRipple size='small'>
                  <InfoIcon />
                 </IconButton>
              </Tooltip>
            </ListItem>
          </List>
      
        </Stack>


        <Box sx={{ width: '100%', maxWidth: 1000}}>
          <List component={Stack} direction='row' sx={{maxWidth: 700, ml:3}}>
            <ListItemText  primaryTypographyProps={{fontWeight: 'bold', fontSize: 20}}
                           primary={'Account Buying Power ($): ' + balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/>
            <ListItemText  primaryTypographyProps={{fontWeight: 'bold', fontSize: 20}}
                           primary={'Shares Owned: ' + ownedStocks}/>
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
  const [buttonText, setButtonText] = useState("Add to Watchlist")
  const [watchListStyle, setWatchListStyle] = useState()


  useEffect ( () => {
    if (profile){
      const prof = JSON.parse(localStorage.getItem("profile"));
      fetch("http://localhost:8000/getPortfolioData?" + new URLSearchParams({
            userKey: prof["email"],
      })).then(res => {return res.json()})
      .then(data => {setBalance(data.buyingPower)});
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.scrollTo(0,0);
  })



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

  function handleWatchlist() {
    if(buttonText === "Add to Watchlist" && profile){
      console.log("it was add!")
      const prof = JSON.parse(localStorage.getItem("profile"));
      setButtonText("Remove from Watchlist");
      setWatchListStyle(removeWatchlist);
      const options = {
        method: 'POST',
        body: JSON.stringify({userKey: prof["email"], stock: stockInfo.symbol.toUpperCase()}),
        headers: {'Content-Type': 'application/json'}
      }
      fetch("http://localhost:8000/addWatchList", options);
      
    } else if (buttonText === "Remove from Watchlist" && profile) {
      console.log("it was remove!")
      const prof = JSON.parse(localStorage.getItem("profile"));
      setButtonText("Add to Watchlist");
      setWatchListStyle(addWatchlist);
      const options = {
        method: 'POST',
        body: JSON.stringify({userKey: prof["email"], stock: stockInfo.symbol.toUpperCase()}),
        headers: {'Content-Type': 'application/json'}
      }
      fetch("http://localhost:8000/removeWatchList", options);
    } else {
      console.log("tf?")
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
      if (numericQuantity * parseFloat(stockInfo.mark) > balance) {
        setBuyError(true)
        setSellError(false)
        setValidTransaction(false)
        setActionError(false)
        setQuantityError(false)
      } else {
        setBalance(parseFloat((balance - numericQuantity * parseFloat(stockInfo.askPrice))))
        setOwnedStocks(ownedStocks + numericQuantity)
        if(profile){
          const prof = JSON.parse(localStorage.getItem("profile"));
          const options = {
            method: 'POST',
            body: JSON.stringify({userKey: prof["email"], stock: stockInfo.symbol.toUpperCase(), amount: numericQuantity}),
            headers: {'Content-Type': 'application/json'}
          }
          fetch("http://localhost:8000/buyStock", options);
        }
        
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
        setBalance(parseFloat((balance + numericQuantity * parseFloat(stockInfo.bidPrice))))
        setOwnedStocks(ownedStocks - numericQuantity)
        if (profile){
          const prof = JSON.parse(localStorage.getItem("profile"));
          const options = {
            method: 'POST',
            body: JSON.stringify({userKey: prof["email"], stock: stockInfo.symbol.toUpperCase(), amount: numericQuantity}),
            headers: {'Content-Type': 'application/json'}
          } 
          fetch("http://localhost:8000/sellStock", options);
        }
        
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

        <Button variant='contained' onClick={handleWatchlist} sx={watchListStyle}>
          {buttonText}
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

    setQuantity(0);
    setOption("");
  
    getCurrentData(array).then(async response =>
      {
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
                
            let times = []
            let prices = []
            for (const candle of res[2]) {
              var date = new Date(candle.datetime)
              const options = { month: 'short', day: 'numeric' };
              times.push(date.toLocaleString('en', options))
              prices.push(candle.close)
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

            setChartData(chartData)

            setInterval('1M')

            setDataVisibility(true)

            setSearchList([])
        }
      }
    )
    if(profile){
      const prof = JSON.parse(localStorage.getItem("profile"));
      fetch("http://localhost:8000/getSpecificStock?" + new URLSearchParams({
            userKey: prof["email"],
            stock: stock.toString().toUpperCase()
        })).then(res => {return res.json()})
        .then(data => setOwnedStocks(data.quantity));
      fetch("http://localhost:8000/getWatchList?" + new URLSearchParams({
          userKey: prof["email"],
        })).then(res => {return res.json()})
        .then(data => {
          if(data.includes(stock.toString().toUpperCase())){
            setButtonText("Remove from Watchlist");
            setWatchListStyle(removeWatchlist);
          } else {
            setButtonText("Add to Watchlist");
            setWatchListStyle(addWatchlist);
          }
      });
    }
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
  
  // Main used to search for stock
  const MainSearchButton = () => (
    <IconButton
      role='main-search-button' 
      sx={{color: "white", 
      backgroundColor: "#2196f3",
      //ml: 1.5,
      "&:hover": { color: "#2196f3" }}}
      onClick={() => handleClick(searchStock.split('—')[0].trim())}>
      <SearchIcon />
    </IconButton>
    )

    const SearchButton = () => (
      <IconButton onClick={() => handleClick(searchStock.split('—')[0].trim())}>
        <SearchIcon />
      </IconButton>
      )

  const [searchList, setSearchList] = useState([])

  // Set stock to be searched
  function changeStock(event) {
    console.log(event.target.value)
    fetch("http://localhost:8000/getStocks?" + new URLSearchParams({
                heading: event.target.value
            })).then(res => {return res.json()})
            .then(data => {
              console.log(data)
              console.log(data[0][0]);

              var list = []
              for (const symbol of data[0]) {
                //console.log(symbol)
                if (symbol != null) {
                  list.push({"symbol": symbol[0] + ' — ' + symbol[1]})
                }
              }
              //console.log(list)
              setSearchList(list)});
    setStock(event.target.value)
  }


  // To change the time intervals displayed by stock graph
  const [interval, setInterval] = useState('1M')
  function changeInterval(event) {

    let times = []
    let prices = []

    switch(event.target.value) {
      case "1D":
        for (const candle of histData[0]) {
          var date = new Date(candle.datetime)
          const options = { hour: '2-digit', minute: '2-digit' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "5D":
        for (const candle of histData[1]) {
          var date = new Date(candle.datetime)
          const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "1M":
        for (const candle of histData[2]) {
          var date = new Date(candle.datetime)
          const options = { month: 'short', day: 'numeric' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "6M":
        for (const candle of histData[3]) {
          var date = new Date(candle.datetime)
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "1Y":
        for (const candle of histData[4]) {
          var date = new Date(candle.datetime)
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "5Y":
        for (const candle of histData[5]) {
          var date = new Date(candle.datetime)
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "Max":
        for (const candle of histData[6]) {
          var date = new Date(candle.datetime)
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          times.push(date.toLocaleString('en', options))
          prices.push(candle.close)
        }
        break
      case "YTD":
        for (const candle of histData[7]) {
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

  // To display stock information redirected from prev page
  function displayStock(symbol) {
    setFromOtherPage(true)
    handleClick(symbol)
    setExternalStock(null)
  }


  return (
    <div>
      {profile ? (
    <div className='Stocks'>
      <NavBar/>

      {externalStock ? (
        displayStock(externalStock)
      ) : null
      }

    {!dataVisibility && !fromOtherPage &&

    <Box
      sx={{
        width: 600,
        height: 500,
        maxWidth: '100%',
        mx: 'auto',
        mt: 25,
        textAlign: 'center',
        border : 0
      }}
    >
        <Typography fontWeight='bold' variant='h4' textAlign='center' mt={3}>
          Search for Stock Symbol
        </Typography>

        <Autocomplete
          freeSolo
          disableClearable
          filterOptions={(x) => x}
          options={searchList.map((option) => option.symbol)}
          onChange={(event, value) => {setStock(value); handleClick(value.split('—')[0].trim());}}
          renderInput={(params) => (
            <TextField
                      {...params}
                      role='main-search-bar'
                      sx={{minWidth: 500, mt: 3}}
                      onChange={changeStock}
                      onKeyPress= {(e) => {
                        if (e.key === 'Enter') {
                          handleClick(searchStock.split('—')[0].trim())
                        }
                      }}
                      InputProps={{
                                  ...params.InputProps,
                                  endAdornment: <MainSearchButton />,
                                  style: {
                                    borderRadius: "25px",
                                  }}}
                      error={!isValidStock}
                      helperText={
                        !isValidStock ? 'Invalid Symbol' : null
                      }
            />)
          }
        />

    </Box> 
    }

    {dataVisibility && 
    <Box
      sx={{
        width: 200,
        maxWidth: '100%',
        m: 3
      }}
    >
      <Autocomplete
        freeSolo
        disableClearable
        filterOptions={(x) => x}
        options={searchList.map((option) => option.symbol)}
        onChange={(event, value) => {setStock(value); handleClick(value.split('—')[0].trim());}}
        renderInput={(params) =>
          <TextField 
                    {...params}
                    label="Search for Symbol" 
                    variant="standard"
                    onChange={changeStock}
                    onKeyPress= {(e) => {
                      if (e.key === 'Enter') {
                        handleClick(searchStock.split('—')[0].trim())
                      }
                    }}
                    InputProps={{...params.InputProps, endAdornment: <SearchButton />}}
                    error={!isValidStock}
                    helperText={
                      !isValidStock ? 'Invalid Symbol' : null
                    }
          />
        }
      />
    </Box>
    }

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
      ) : (
        <Navigate to="/login"/>
      )}

    </div>

  )
}

export default Stocks