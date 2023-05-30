import {render, screen, fireEvent, waitForElementToBeRemove, waitFor} from '@testing-library/React'
import '@testing-library/jest-dom'
import { BrowserRouter, Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event'
import Portfolio from '../pages/Portfolio'

jest.mock('react-chartjs-2', () => ({
    Line: () => null
}));

window.scrollTo = jest.fn()

class LocalStorageMock {
    constructor() {
      this.store = {};
    }
  
    clear() {
      this.store = {};
    }
  
    getItem(key) {
      return this.store[key] || null;
    }
  
    setItem(key, value) {
      this.store[key] = value;
    }
  
    removeItem(key) {
      delete this.store[key];
    }
}
  
global.localStorage = new LocalStorageMock;
global.localStorage.setItem("profile", JSON.stringify({'email': 'tosteven98@gmail.com'}))

test('renders main headers portfolio page', async () => {
    render(<BrowserRouter> <Portfolio/> </BrowserRouter>)

    expect(screen.getByText(/Account Summary/i))
    expect(screen.getByText(/Performance History/i))
    expect(screen.getByText(/My Stocks/i))
    expect(screen.getByText(/My Watchlist/i))
})

test('render account balance/buying power', async () => {
    render(<BrowserRouter> <Portfolio/> </BrowserRouter>)

    expect(screen.getByText(/Account Balance/i))
    expect(screen.getByText(/Buying Power/i))
})

test('check headers of table', async () => {
    render(<BrowserRouter> <Portfolio/> </BrowserRouter>)

    expect(screen.getAllByText(/Symbol/i))
    expect(screen.getAllByText(/Change \(%\)/i))
    expect(screen.getAllByText(/Close Price/i))
    expect(screen.getByText(/Total Owned/i))
    expect(screen.getByText(/Total Volume/i))
})

test('check amount of elements in an empty stocks list', async () => {
    render(<BrowserRouter> <Portfolio/> </BrowserRouter>)

    const myStocks = screen.queryByTestId("my-stocks")

    expect(myStocks).not.toBeInTheDocument()
})

test('check amount of elements in an empty watchlist', async () => {
    render(<BrowserRouter> <Portfolio/> </BrowserRouter>)

    const myWatchlist = screen.queryByTestId("my-watchlist")

    expect(myWatchlist).not.toBeInTheDocument()
})