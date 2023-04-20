import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { Navigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import Button from '@mui/material/Button';

import Stack from '@mui/material/Stack';

import { Typography } from '@mui/material';

function Game() {
    const profile = localStorage.getItem("profile");

    function StartInfo() {
        return (
            <Box display="flex" 
                    width={500} height={600} 
                    mx='auto'
                    mt={5}
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
                            <Button variant='contained'>
                                Play Now!
                            </Button>

                            <Button variant='contained'>
                                View Leaderboard
                            </Button>
                        </Stack>

                        <Typography variant='body2' mx='auto' textAlign='center' mt={1.75} border={0}>
                            or <span style={{textDecoration: 'underline', cursor: 'pointer', color: 'blue'}}> play against yourself! </span>
                        </Typography>
                    </Paper>
            </Box>
        )
    }

    return (
        <div>
            {profile ? (
        <div>
            <NavBar/> 
            <StartInfo/>
            
        </div>
            ) : (
                <Navigate to="/login"/>
            )}
        </div>
    )
}

export default Game;