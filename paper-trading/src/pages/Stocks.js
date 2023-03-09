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

  async function getNumDataPoints(company)
  {
     var client_id = 'Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK' 
     var retArr = [];
     const url = `https://api.tdameritrade.com/v1/marketdata/${company}/pricehistory?`;
     var params = new URLSearchParams({apikey: client_id, periodType: "month", period: 1, frequencyType: "daily", frequency: 1});
     var data = await retryFetch(url + params);
     retArr.push(data["candles"]);
     params = new URLSearchParams({apikey: client_id, periodType: "month", period: 6, frequencyType: "daily", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"]);
     params = new URLSearchParams({apikey: client_id, periodType: "year", period: 1, frequencyType: "daily", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"]);
     params = new URLSearchParams({apikey: client_id, periodType: "year", period: 5, frequencyType: "daily", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"]);
     params = new URLSearchParams({apikey: client_id, periodType: "year", period: 20, frequencyType: "daily", frequency: 1});
     data = await retryFetch(url + params);
     retArr.push(data["candles"]);
     return(retArr);
  }

  function primaryData() {
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

  function secondaryData() {
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


  useEffect ( () => {fetch("http://localhost:8000/getPortfolioData?" + new URLSearchParams({
          userKey: "grkoziol@ucdavis.edu"
    })).then(res => {return res.json()})
    .then(data => {setBalance(Math.ceil(data.buyingPower * 100)/100)});
  }, []);



  function changeOption(event) {
    setOption(event.target.value)
  }

  function changeQuantity(event) {
    setQuantity(parseInt(event.target.value))
  }

  function handleTransaction() {
    //console.log('Hi')
    if (!Number.isInteger(quantity) && quantity < 0) {
      return
    }

    //console.log(stockInfo.mark)
    //console.log(typeof stockInfo.mark)

    if (option == 'buy') {
      if (quantity * stockInfo.mark > balance) {
        return
      } else {
        setBalance(parseFloat((balance - quantity * stockInfo.askPrice).toFixed(2)))
        //console.log(typeof ownedStocks)
        //console.log(typeof quantity)
        setOwnedStocks(ownedStocks + quantity)
        fetch("http://localhost:8000/buyStock?" + new URLSearchParams({
          userKey: "grkoziol@ucdavis.edu",
          stock: stockInfo.symbol.toUpperCase(),
          amount: quantity
          }))
      }
    } else if (option == 'sell') {
      if (ownedStocks < quantity) {
        return
      } else {
        //console.log(balance + quantity)
        setBalance(parseFloat((balance + quantity * parseFloat(stockInfo.bidPrice)).toFixed(2)))
        setOwnedStocks(ownedStocks - quantity)
        fetch("http://localhost:8000/sellStock?" + new URLSearchParams({
          userKey: "grkoziol@ucdavis.edu",
          stock: stockInfo.symbol.toUpperCase(),
          amount: quantity
          }));
      }
    }
  }

  function purchasingOptions() {
    return (
      <Box sx={{ width: '100%', maxWidth:10000}}>
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
                   sx={{mt:1, ml:3}}/>

        <Button variant='contained' onClick={handleTransaction} sx={{height: 50, mt:3.3, mt:1, ml: 3}}>
          Confirm
        </Button>
      </Box>
    )
  }

  function handleClick(stock) {
    const array = [stock]
  
    getCurrentData(array).then(response =>
      {
        //console.log(response)
        if (Object.keys(response).length === 0 || stock == '') {
        
        } else {
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


            getNumDataPoints(stockAllCaps).then(response =>
              {
                //console.log(response[0])
                
                let times = []
                let prices = []
                for (const candle of response[0]) {
                  //console.log(candle)
                  times.push(new Date(candle.datetime))
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
              }
            )

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
  
  const SearchButton = () => (
    <IconButton onClick={() => handleClick(searchStock)}>
      <SearchIcon />
    </IconButton>
    )

    function changeStock(event) {
      setStock(event.target.value)
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
      />

    </Box>
    
    {dataVisibility && primaryData()}
    {dataVisibility && secondaryData()}
    {(dataVisibility) &&
      <div style={chartStyle}>
        {(<StockChart chartData={chartData}/>)}
      </div>
    }
    {dataVisibility && purchasingOptions()}

     {/*
      <button onClick={() => setChartData(chartData1)}> Chart 1 </button>
      <button onClick={() => setChartData(chartData2)}> Chart 2 </button>
      <div style={chartStyle}>
        <LineChart chartData={chartData}/>
      </div>
      */}
    </div>

  )
}

export default Stocks