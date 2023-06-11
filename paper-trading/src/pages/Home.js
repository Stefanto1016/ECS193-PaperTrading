import React, { useEffect } from 'react';
import { useState } from 'react';
import { PerformanceChart, StockChart } from '../components/LineChart';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";


import {List, ListItem, ListItemText, Typography } from '@mui/material';
import { textAlign } from '@mui/system';

import { NumericFormat } from 'react-number-format'

import { Navigate, useNavigate } from 'react-router';

import NavBar from '../components/NavBar';



const pageStyle = {
    height: "100vh",
    width: "100%"
}

const leftStyle = {
    height: "100%",
    width: "70%",
    float: "left",
    //overflow: "auto"
}
const accountStyle = {
    height: "100%",
    maxHeight: "173px"
}

const tableHeadStyle = {
    position: "sticky",
    background: "white",
    top: 0
}


const graphStyle = {
}

/*const tableStyle = {
    height: "70%",
    width: "100%",
    float: "left",
    textAlign: "center"
}

const tableStocksStyle = {
    height: "100%",
    maxHeight: "607px",
    overflow: "auto"
}*/

const tableStyle = {
    height: "100%",
    width: "100%",
    float: "left",
    textAlign: "center",
}

const tableStocksStyle = {
    height: "48%",
    maxHeight: "607px",
    overflow: "auto"
}

const tableTitle = {
    position: 'sticky'
} 

const newsStyle = {
    float: "right",
    width: "30%",
    height: "calc(48% + 305px)",
    maxHeight: "910px",
    textAlign: "center",
    overflow: "auto"
}

const newsArticles = {
}

const newsTitle = {
    position: "sticky",
    background: "white",
    top: 0
} 

const accountTitle = {
    position: "sticky",
    background: "white",
    textAlign: "center",
    top: 0
} 

const accountSummaryStyle = {
    float: "left",
    width: "30%",
    position: "center",
    marginLeft: "2%"
}


const cardStyle = {
    width: "100%",
    height: "85%",
    float: "left",
    textAlign: "center",
    justifyContent: "center",
}

const chartStyle = {
    height: "100%",
    width: "65%",
    float: "right",
    textAlign: "center",
}

const chartTitle = {
    position: 'sticky',
    marginBottom: "10px"
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

function createData(symbol, change, price, volume) {
    return {symbol, change, price, volume}
}

function createNews(title, desc, img, url) {
    return {title, desc, img, url}
}

function Home() {

    const profile = localStorage.getItem("profile");
    const navigate = useNavigate();

    const [topGainers, setTopGainers] = useState([]);
    const [news, setNews] = useState([]);
    const [accBalance, setAccBalance] = useState(0);
    const [buyPower, setBuyPower] = useState(0);
    const [chartData, setChartData] = useState(emptyChart);

    

    useEffect ( () => {
        if(profile){
            const prof = JSON.parse(localStorage.getItem("profile"));
            fetch("http://localhost:8000/getPortfolioData?" + new URLSearchParams({
                userKey: prof["email"]
        })).then(res => {return res.json()})
        .then(data => {setAccBalance(data.balance[Object.keys(data.balance)[0]]);
                    setBuyPower(Math.ceil(data.buyingPower * 100)/100);
                    getChartData(data)});
        }
  }, []);

    async function retryFetch(url) {
       var data = await fetch(url);
       while(data.status == 429) {
            await new Promise(r => setTimeout(r, 500));
            var data = await fetch(url);
       }
       data = await data.json();
       return(data);
    }

    async function getTopGainers() {
        var url = 'https://api.tdameritrade.com/v1/marketdata/$COMPX/movers?apikey=Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK&direction=up&change=percent'
        var data = await retryFetch(url);
        var topGainers = []
        for(const entry of data)
        {
          topGainers.push(createData(entry.symbol, (entry.change * 100).toFixed(2), entry.last, entry.totalVolume))
        }
    
        setTopGainers(topGainers)
    }

    async function getNews() {
        var url = 'https://www.alphavantage.co/query?function=NEWS_SENTIMENT&limit=10&apikey=AHIL20FGMVQ12R9U'
        var data = await retryFetch(url);
        var news = []
        if (data.feed != undefined) {
            for(const entry of data.feed)
            {
            news.push(createNews(entry.title, entry.summary, entry.banner_image, entry.url))
            }
        }  
    
        setNews(news)
    }

    useEffect(() => {
        getTopGainers()
        getNews()
    }, [])

    useEffect(() => {
        document.body.style.overflow = "hidden";
        window.scrollTo(0,0);
    })

    function newsClick(snews){
        window.open(snews.url);
    }

    function getChartData(data)
    {

        let times = []
        let prices = []
        for (const prev in data.balance) {
            times.push(prev)
            prices.push(data.balance[prev])
        }
        times = times.reverse();
        prices = prices.reverse();
        const chartData = {
        // x-axis labels
        labels: times,
        datasets: [
        {
            label: "Account Balance ($)",
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

    return (
        <div style={pageStyle}>
            {profile ? (
        <div style={pageStyle}>
            <NavBar/>
            <div style={leftStyle}>
                <div style={accountStyle}>
                    <div style={accountSummaryStyle}>
                        <Typography style={accountTitle} fontWeight='bold' variant='h4' textAlign='center' mt={3} mb={2} fontSize='30px'>
                            Account Summary
                        </Typography>
                        <Card sx={cardStyle}>
                            <CardContent>
                                <Typography variant='h5'>
                                    Account Balance
                                </Typography>
                                <NumericFormat value={accBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                <br />
                                <Typography variant='h5'>
                                    Buying Power
                                </Typography>
                                <NumericFormat value={buyPower.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                <br />
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div style={chartStyle}>
                        <Typography style={chartTitle} fontWeight='bold' variant='h4' textAlign='center' mt={3} mb={2} fontSize='30px'>
                            Performance History
                        </Typography>

                        <div style={graphStyle}>
                            <PerformanceChart chartData={chartData}/>
                        </div>
                    </div>
                </div>

                <div style={tableStyle}>
                    <Typography role="gainers-header" style={tableTitle} fontWeight='bold' variant='h4' textAlign='center' mt={4} mb={2} fontSize='30px'>
                        Top Stock Gainers
                    </Typography>
                    <TableContainer style={tableStocksStyle} component={Paper} >
                        <Table>
                            <TableHead style={tableHeadStyle}>
                                <TableRow>
                                    <TableCell> Symbol </TableCell>
                                    <TableCell align='right'> Change&nbsp;(%) </TableCell>
                                    <TableCell align='right'> Close Price </TableCell>
                                    <TableCell align='right'> Volume </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topGainers.map((gainer) => (
                                    <TableRow data-testid="gainers" sx={{height: 10}}>
                                        <TableCell component="th" scope="row">
                                            <Typography variant='subtitle2' 
                                                        onClick={() => navigate('/stocks', { state: gainer.symbol})}
                                                        sx={{textDecoration: 'underline', cursor: 'pointer', maxWidth: '5px'}}>
                                                {gainer.symbol} 
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">{gainer.change.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                        <TableCell align="right">{gainer.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                        <TableCell align="right">{gainer.volume.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>

            <div style={newsStyle}>
                <Typography style={newsTitle} fontWeight='bold' variant='h4' textAlign='center' mt={3} mb={2} fontSize='30px'>
                    Stock Market News
                </Typography>

                <List component={Paper} sx={newsArticles}>
                    {news.map((snews) => (
                        <ListItem data-testid="news" onClick={() => newsClick(snews)}>
                            <ListItemAvatar>
                            <Avatar 
                                alt="Logo"
                                src={snews.img}
                                variant="square"
                                
                            />
                            </ListItemAvatar>
                            <ListItemText primary={snews.title} secondary={snews.desc} />
                        </ListItem>
                            ))}
                </List>
            </div>
        </div>
            ) : (
                <Navigate to="/login"/>
            )}
        </div>
    )
}

export default Home