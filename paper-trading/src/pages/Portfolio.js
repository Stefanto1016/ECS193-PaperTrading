import React, { useState, useEffect } from 'react'
import NavBar from '../components/NavBar';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { PerformanceChart, StockChart } from '../components/LineChart';
import {List, ListItem, ListItemText, Typography } from '@mui/material';
import { NumericFormat } from 'react-number-format'

import {Navigate, useNavigate} from 'react-router-dom';
import { borderRadius } from '@mui/system';

const client_id = "Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK";

const leftStyle = {
    marginBottom: "1%",
    width: "100%",
    display: "flex"
}

const accountStyle = {
    marginLeft: "1%",
    width: "49%",
    justifyContent: "center",
    alignItems: "center"
}

const cardStyle = {
    width: "100%",
    height: "85%",
    float: "left",
    textAlign: "center",
    justifyContent: "center"
}

const PerformanceStyle = {
    marginLeft: "1%",
    height: "100%",
    width: "50%",
    float: "right"
}

const ChartStyle = {
    height: "100%",
    width: "70%",
    float: "right"
}
const PerformanceTitleStyle = {
    textAlign: "center"
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

  const myStocksTable = {
    marginLeft: "1%",
    width: "48%",
    float: "left",
    height: "50%"
  }


  const watchListTable = {
    marginRight: "1%",
    width: "48%",
    float: "right"
  }

  const tableStyle = {
    maxHeight: "420px",
    width: "100%",
    float: "left",
    textAlign: "center"
  }

  const myStockTitle = {
    textAlign: "center"
  }

  /*const buttonCell = {
    //height: "5px",
    //weight: "5px"
  }

  const minusButton = {
    borderRadius: "50%", 
    backgroundColor: "red", 
    //maxWidth: "1px", 
    //minHeight: "1px", 
}*/

function Portfolio() {
    const navigate = useNavigate();
    const profile = localStorage.getItem("profile");

    const [stocks, setStocks] = useState([]);
    const [watchList, setWatchList] = useState([]);
    const [chartData, setChartData] = useState(emptyChart);
    const [accBalance, setAccBalance] = useState(0);
    const [buyPower, setBuyPower] = useState(0);

    useEffect(() => {
        document.body.style.overflow = "auto";
    })

    useEffect ( () => {
        if(profile){
            const prof = JSON.parse(localStorage.getItem("profile"));
            fetch("http://localhost:8000/getPortfolioData?" + new URLSearchParams({
                userKey: prof["email"]
            })).then(res => {return res.json()})
            .then(data => {setAccBalance(data.balance[Object.keys(data.balance)[0]].toFixed(2));
                        setBuyPower(Math.ceil(data.buyingPower * 100)/100);
                        getChartData(data);
                        getStocks(data.stocks)});

            fetch("http://localhost:8000/getWatchList?" + new URLSearchParams({
                userKey: prof["email"]
            })).then(res => {return res.json()})
            .then(data => {
                        getWatchList(data)});
        }
  }, []);

    function getChartData(data)
    {
        //console.log(response[0])

        let times = []
        let prices = []
        for (const prev in data.balance) {
            times.push(prev)
            prices.push(data.balance[prev])
        }
        times = times.reverse();
        prices = prices.reverse();
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

        setChartData(chartData) 
    }

    function createData(symbol, change, price, quantity) {
        return {symbol, change, price, quantity}
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

     async function getStocks(data){
        let keys = Object.keys(data);
        let st = [];
        for(const entry of keys)
        {
            let stData = await getCurrentData(entry);
            st.push(createData(entry, (stData[entry]['markPercentChangeInDouble']), stData[entry]['closePrice'], data[entry]));
        }
        setStocks(st);
    }
    async function getWatchList(data){
        let st = [];
        for(const entry of data)
        {
            let stData = await getCurrentData(entry);
            st.push(createData(entry, (stData[entry]['markPercentChangeInDouble']), stData[entry]['closePrice'], stData[entry]['totalVolume']));
        }
        setWatchList(st);
    }


    return (
        <div>
        {profile ? (
        <div style={{height: "100vh"}}>
            <NavBar/> 
            <div>
                <div style={leftStyle}>
                    <div style={accountStyle}>
                        <h1 style={PerformanceTitleStyle}>
                            Account Summary
                        </h1>
                        <Card>
                            <CardContent style={cardStyle}>
                                <Typography variant='h5'>
                                    Account Balance
                                </Typography>
                                <NumericFormat value={accBalance} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                <br />
                                <Typography variant='h5'>
                                    Buying Power
                                </Typography>
                                <NumericFormat value={buyPower} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                <br />
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div style={PerformanceStyle}>
                        <h1 style={PerformanceTitleStyle}>
                            Performance History
                        </h1>

                        <div >
                            <PerformanceChart chartData={chartData}/>
                        </div>
                    </div>
                </div>  

                <div style={myStocksTable}>
                    <h1 style={myStockTitle}>
                        My Stocks
                    </h1>
                        <TableContainer component={Paper} style={tableStyle}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell> Symbol </TableCell>
                                        <TableCell align='right'> Change&nbsp;(%) </TableCell>
                                        <TableCell align='right'> Close Price </TableCell>
                                        <TableCell align='right'> Total Owned </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stocks.map((gainer) => (
                                        <TableRow sx={{height: 10}}>
                                            <TableCell component="th" scope="row" onClick={() => navigate('/stocks', { state: gainer.symbol})} sx={{textDecoration: 'underline', cursor: 'pointer', maxWidth: '5px'}}>
                                                {gainer.symbol}
                                            </TableCell>
                                            <TableCell align="right">{gainer.change.toFixed(2)}</TableCell>
                                            <TableCell align="right">{gainer.price.toFixed(2)}</TableCell>
                                            <TableCell align="right">{gainer.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <div style={watchListTable}>

                        <h1 style={myStockTitle}>
                            My Watchlist
                        </h1>

                        <TableContainer component={Paper} style={tableStyle}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell> Symbol </TableCell>
                                        <TableCell align='right'> Change&nbsp;(%) </TableCell>
                                        <TableCell align='right'> Close Price </TableCell>
                                        <TableCell align='right'> Total Volume</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {watchList.map((gainer) => (
                                        <TableRow sx={{height: 10}}>
                                            <TableCell component="th" scope="row" onClick={() => navigate('/stocks', { state: gainer.symbol})} sx={{textDecoration: 'underline', cursor: 'pointer', maxWidth: '5px'}}>
                                                {gainer.symbol}
                                            </TableCell>
                                            <TableCell align="right">{gainer.change.toFixed(2)}</TableCell>
                                            <TableCell align="right">{gainer.price.toFixed(2)}</TableCell>
                                            <TableCell align="right">{gainer.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
        </div>
        ) : (
            <Navigate to="/login"/>
        )}
        </div>
    )
}

export default Portfolio