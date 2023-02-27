import React from 'react'
import { useState } from 'react';
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import LineChart from '../components/LineChart';
import NavBar from '../components/NavBar';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

import Stack from '@mui/material/Stack';


function Stocks() {

  const chartStyle = {
    width: 650,
    position: 'absolute',
    top: 175,
    left: 775,

  }

  // Data for Chart 1
  const chartData1 = {
    // x-axis labels
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [
      {
        label: "Cost of Stock in $ (x100)",
        // corresponding y values
        data: [3.2, 2.7, 1.9, 2.5, 3.0, 3.1, 4.0, 3.5, 3.2, 3.6, 3.9, 3.4],
        fill: true,
        borderColor: "blue",
        tension: 0.1
      }
    ]
  }

  // Datafor Chart 2
  const chartData2 = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: "Cost of Stock in $ (x100)",
        data: [1.2, 1.7, 1.0, 1.8, 2.0, 1.8, 2.1],
        fill: true,
        borderColor: "red",
        tension: 0.1
      }
    ]
  };

  const [chartData, setChartData] = useState(chartData1);
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

  function handleClick() {
    setDataVisibility(true)
  }

  function primaryData() {
    return (
      <div>
        <List component={Stack} direction='row' sx={{maxWidth: 800, ml:3}}>
            <ListItemText 
              primaryTypographyProps={{fontWeight: 'bold', fontSize: 30}}
              primary='TSLA'
              secondaryTypographyProps={{fontWeight: 'light', fontSize: 15, color: 'gray'}}
              secondary='TESLA, INC'/>
          </List>


        <Box sx={{ width: '100%', maxWidth: 400}}>
          <List component={Stack} direction='row' sx={{maxWidth: 800, ml:3}}>
            <ListItemText 
              primaryTypographyProps={{fontWeight: 'bold', fontSize: 30}}
              primary='196.88 USD'/>
            <ListItemText 
              primaryTypographyProps={{fontSize: 25, color: 'red', mt:0.3}}
              primary='-5.19'/>
            <ListItemText 
              primaryTypographyProps={{fontSize: 25, color: 'red', mt:0.3}}
              primary='(-2.57%)'/>
          </List>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 360}}>
          <List component={Stack} direction='row' sx={{maxWidth: 800, ml:3}}>
            <ListItemText primary='50' secondary='EPS'/>
            <ListItemText primary='50' secondary='MARKET CAP'/>
            <ListItemText primary='50' secondary='P/E'/>
          </List>
        </Box>
      </div>
    )
  }

  function secondaryData() {
    return (
      <Stack direction="row" spacing={2}>
        <List sx={{width: "100%", maxWidth: 360}}>
          <ListItem>
            <ListItemText primary="Volume (current)" />
            <ListItemText align='right' primary="500" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Today's High ($)" />
            <ListItemText align='right' primary="500" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Today's Low ($)" />
            <ListItemText align='right' primary="500" />
          </ListItem>
        </List>

        <List sx={{width: "100%", maxWidth: 360}}>
          <ListItem>
            <ListItemText primary="52 Week High ($)" />
            <ListItemText align='right' primary="500" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Bid/Ask Price ($)" />
            <ListItemText align='right' primary="500" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="52 Week Low ($)" />
            <ListItemText align='right' primary="500" />
          </ListItem>
        </List>
      
      </Stack>
    )
  }

  
  const SearchButton = () => (
    <IconButton onClick={handleClick}>
      <SearchIcon />
    </IconButton>
    )


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
                 InputProps={{endAdornment: <SearchButton />}}
      />

    </Box>
    
    {dataVisibility && primaryData()}
    {dataVisibility && secondaryData()}
    {dataVisibility && 
      <div style={chartStyle}>
        <LineChart chartData={chartData1}/>
      </div>
    }





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