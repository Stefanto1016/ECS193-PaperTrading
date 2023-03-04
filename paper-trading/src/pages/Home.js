import React, { useEffect } from 'react';
import { useState } from 'react';
import { PerformanceChart } from '../components/LineChart';
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

const pageStyle = {
    maxHeight: "90vh",
    height: "90vh",
    width: "100vw"
}

const leftStyle = {
    height: "100%",
    width: "70%",
    float: "left"

}
const accountStyle = {
    height: "40%"
}

const tableHeadStyle = {
    position: "sticky",
    background: "white",
    top: 0
}


const graphStyle = {
    //height: 400
}

const tableStyle = {
    height: "58%",
    width: "100%",
    float: "left",
    textAlign: "center"
}

const tableStocksStyle = {
    height: "75%"
}

const tableTitle = {
    position: 'sticky'
} 

const newsStyle = {
    float: "right",
    width: "30%",
    height: "101%",
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
    top: 0
} 

const accountSummaryStyle = {
    float: "left",
    width: "30%",
    position: "center"
}


const cardStyle = {
    width: "100%",
    height: "85%",
    float: "left",
    textAlign: "center",
    justifyContent: "center"
}

const chartStyle = {
    maxHeight: 500,
    height: "100%",
    width: "60%",
    float: "right",
    textAlign: "center"
}

const chartTitle = {
    position: 'sticky',
    marginBottom: "-1px"
}




const chartData = {
    // x-axis labels
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [
      {
        label: "Total Balance (in the hundred thousands)",
        // corresponding y values
        data: [3.2, 2.7, 1.9, 2.5, 3.0, 3.1, 4.0, 3.5, 3.2, 3.6, 3.9, 3.4],
        fill: true,
        borderColor: "blue",
        tension: 0.1
      }
    ]
  }

  /*
  async function retryFetch(url)
  {
       var data = await fetch(url);
       while(data.status == 429)
       {
            await new Promise(r => setTimeout(r, 200));
            var data = await fetch(url);
       }
       data = await data.json();
       return(data);
  }*/


//let topGainers = []

/*
async function getTopGainers() {
    var url = 'https://api.tdameritrade.com/v1/marketdata/$COMPX/movers?apikey=Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK&direction=up&change=percent'
    var data = await retryFetch(url);
    var topGainers = []
     for(const entry of data)
     {
        topGainers.push(createData(entry.symbol, entry.change, entry.close, entry.totalVolume))
     }

     console.log(topGainers)
}*/

function createData(symbol, change, price, volume) {
    return {symbol, change, price, volume}
}

/*
const topGainers = [
    createData('TEST', 42.00, 13, 5000000),
    createData('TEST', 42.00, 13, 5000000),
    createData('TEST', 42.00, 13, 5000000),
    createData('TEST', 42.00, 13, 5000000),
    createData('TEST', 42.00, 13, 5000000),
    createData('TEST', 42.00, 13, 5000000),
    createData('TEST', 42.00, 13, 5000000),
    createData('TEST', 42.00, 13, 5000000),
    createData('TEST', 42.00, 13, 5000000),
    createData('TEST', 42.00, 13, 5000000)
]*/

const newsimage = 'https://cdn.pixabay.com/photo/2022/11/01/11/30/breaking-news-7562021__340.jpg'

function createNews(title, desc, img) {
    return {title, desc, img}
}

/*
const news = [
    createNews('This is the Title of the News Article', 'This is the Desc of the News Article'),
    createNews('This is the Title of the News Article', 'This is the Desc of the News Article'),
    createNews('This is the Title of the News Article', 'This is the Desc of the News Article'),
    createNews('This is the Title of the News Article', 'This is the Desc of the News Article'),
    createNews('This is the Title of the News Article', 'This is the Desc of the News Article'),
    createNews('This is the Title of the News Article', 'This is the Desc of the News Article'),
    createNews('This is the Title of the News Article', 'This is the Desc of the News Article'),
    createNews('This is the Title of the News Article', 'This is the Desc of the News Article'),
    createNews('This is the Title of the News Article', 'This is the Desc of the News Article'),
    createNews('This is the Title of the News Article', 'This is the Desc of the News Article'),
]*/

function Home() {
    const [topGainers, setTopGainers] = useState([]);
    const [news, setNews] = useState([]);

    async function retryFetch(url) {
       var data = await fetch(url);
       while(data.status == 429) {
            await new Promise(r => setTimeout(r, 200));
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
    
        //console.log(topGainers)
        setTopGainers(topGainers)
    }

    async function getNews() {
        var url = 'https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=AAPL&limit=10&apikey=AHIL20FGMVQ12R9U'
        var data = await retryFetch(url);
        var news = []
        for(const entry of data.feed)
        {
          news.push(createNews(entry.title, entry.summary, entry.banner_image))
        }
    
        //console.log(news)
        setNews(news)
    }

    useEffect(() => {
        getTopGainers()
        getNews()
    }, [])

    useEffect(() => {
        document.body.style.overflow = "hidden";
    })

    return (
        <div style={pageStyle}>
            <div style={leftStyle}>
                <div style={accountStyle}>
                    <div style={accountSummaryStyle}>
                        <h1 style={accountTitle}>
                            Account Summary
                        </h1>
                        <Card sx={cardStyle}>
                            <CardContent>
                                <Typography variant='h5'>
                                    Account Balance
                                </Typography>
                                <Typography variant='h6'>
                                    $1,000,000
                                </Typography>
                                <br />
                                <Typography variant='h5'>
                                    Buying Power
                                </Typography>
                                <Typography variant='h6'>
                                    $1,000,000
                                </Typography>
                                <br />
                                <Typography variant='h5'>
                                    Cash Value
                                </Typography>
                                <Typography variant='h6'>
                                    $1,000,000
                                </Typography>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div style={chartStyle}>
                        <h1 style={chartTitle}>
                            Performance History
                        </h1>

                        <div style={graphStyle}>
                            <PerformanceChart chartData={chartData}/>
                        </div>
                    </div>
                </div>

                <div style={tableStyle}>
                    <h1 style={tableTitle}>
                        Top Stock Gainers
                    </h1>

                    <TableContainer component={Paper} sx={tableStocksStyle}>
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
                                    <TableRow sx={{height: 10}}>
                                        <TableCell component="th" scope="row">
                                            {gainer.symbol}
                                        </TableCell>
                                        <TableCell align="right">{gainer.change}</TableCell>
                                        <TableCell align="right">{gainer.price}</TableCell>
                                        <TableCell align="right">{gainer.volume}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>

            <div style={newsStyle}>
                <h1 style={newsTitle}>
                    Stock Market News
                </h1>

                <List component={Paper} sx={newsArticles}>
                    {news.map((snews) => (
                        <ListItem>
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
    )
}

export default Home