import React from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const tableStyle = {
    height: 375,
    width: 500,
    position: 'absolute',
    top: 350,
    left: 15,

}

function createData(symbol, change, price, volume) {
    return {symbol, change, price, volume}
}

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
]



function Home() {
    return (
        <div>
            <h1>
                Home Page
            </h1>

            <TableContainer component={Paper} sx={tableStyle}>
                <Table>
                    <TableHead>
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
    )
}

export default Home