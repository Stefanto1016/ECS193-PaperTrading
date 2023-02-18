import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from'@mui/material/Button';
import Typography from '@mui/material/Typography';
import { minHeight } from '@mui/system';

export default function NavBar() {
    return(
        <div className="NavBar">
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        CompuTrade
                    </Typography>
                    <Button color='inherit'> Portfolio </Button>
                    <Button color='inherit'> Stocks </Button>
                    <Button color='inherit'> Learning </Button>
                    <Button color='inherit'> LogOut </Button>
                </Toolbar>
            </AppBar>
            <Toolbar/>
        </div>
    )
}