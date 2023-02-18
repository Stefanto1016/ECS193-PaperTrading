import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export default function NavBar() {
    return(
        <div className="NavBar">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="title" color="inherit">
                        CompuTrade
                    </Typography>
                </Toolbar>
            </AppBar>
        </div>
    )
}