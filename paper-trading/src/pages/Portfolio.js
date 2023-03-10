import React, { useState, useEffect } from 'react'
import NavBar from '../components/NavBar';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { PerformanceChart, StockChart } from '../components/LineChart';
import {List, ListItem, ListItemText, Typography } from '@mui/material';
import { NumericFormat } from 'react-number-format'

const client_id = "Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK";

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

function Portfolio() {
    const [stocks, setStocks] = useState([]);
    const [chartData, setChartData] = useState(emptyChart);
    const [accBalance, setAccBalance] = useState(0);
    const [buyPower, setBuyPower] = useState(0);

    useEffect(() => {
        document.body.style.overflow = "scroll";
    })

    useEffect ( () => {fetch("http://localhost:8000/getPortfolioData?" + new URLSearchParams({
          userKey: "grkoziol@ucdavis.edu"
    })).then(res => {return res.json()})
    .then(data => {setAccBalance(data.balance[Object.keys(data.balance)[0]]);
                setBuyPower(Math.ceil(data.buyingPower * 100)/100);
                getChartData(data)});
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
        let final = [];
        for(const entry of keys)
        {
            let stData = await getCurrentData(entry);
            console.log(stData)
            st.push(createData(entry, (stData[entry]['netChange']), stData[entry]['closePrice'], data[entry]));
        }
        setStocks(st);
    }


    useEffect ( () => {fetch("http://localhost:8000/getPortfolioData?" + new URLSearchParams({
        userKey: "grkoziol@ucdavis.edu"
        })).then(res => {return res.json()})
        .then(data => {getStocks(data.stocks)});
    }, []);

    return (
        <div>
            <NavBar/> 
            <h1>
                Portfolio Page
            </h1>
            <div>
            <div>
                    <div>
                        <h1>
                            Account Summary
                        </h1>
                        <Card>
                            <CardContent>
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
                    
                    <div>
                        <h1>
                            Performance History
                        </h1>

                        <div>
                            <PerformanceChart chartData={chartData}/>
                        </div>
                    </div>
                </div>
                    <h1>
                        My Stocks
                    </h1>

                    <TableContainer component={Paper}>
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
                                        <TableCell component="th" scope="row">
                                            {gainer.symbol}
                                        </TableCell>
                                        <TableCell align="right">{gainer.change}</TableCell>
                                        <TableCell align="right">{gainer.price}</TableCell>
                                        <TableCell align="right">{gainer.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
        </div>
    )
}

export default Portfolio