import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from'@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom'

import { minHeight } from '@mui/system';

export default function NavBar() {
    return(
        <div className="NavBar">
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        CompuTrade
                    </Typography>
                    <Button component={Link} to='/portfolio' color='inherit'> Portfolio </Button>
                    <Button component={Link} to='/stocks' color='inherit'> Stocks </Button>
                    <Button component={Link} to='/learning' color='inherit'> Learning </Button>
                    <Button component={Link} to='/logout' color='inherit'> LogOut </Button>
                </Toolbar>
            </AppBar>
            <Toolbar/>
        </div>
    )
}