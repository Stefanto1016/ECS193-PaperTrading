import {render, screen, fireEvent, waitForElementToBeRemove, waitFor} from '@testing-library/React'
import '@testing-library/jest-dom'
import { BrowserRouter, Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event'
import Home from '../pages/Home'

jest.mock('react-chartjs-2', () => ({
    Line: () => null
}));

window.scrollTo = jest.fn()
window.open = jest.fn()

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

test('renders main headers home page', async () => {
    render(<BrowserRouter> <Home/> </BrowserRouter>)

    expect(screen.getByText(/Account Summary/i))
    expect(screen.getByText(/Performance History/i))
    expect(screen.getByText(/Top Stock Gainers/i))
    expect(screen.getByText(/Stock Market News/i))
})

test('render account balance/buying power', async () => {
    render(<BrowserRouter> <Home/> </BrowserRouter>)

    expect(screen.getByText(/Account Balance/i))
    expect(screen.getByText(/Buying Power/i))
})

test('number of top gainers should be 10', async () => {
    render(<BrowserRouter> <Home/> </BrowserRouter>)

    const gainers = await waitFor(() => screen.findAllByTestId("gainers"), {timeout:10000})

    expect(gainers).toHaveLength(10)
}, 10000)

test('number of news should be 50', async () => {
    render(<BrowserRouter> <Home/> </BrowserRouter>)

    const news = await waitFor(() => screen.findAllByTestId("news"), {timeout:20000})

    expect(news).toHaveLength(50)
}, 20000)

test('click one of the news articles', async () => {
    render(<BrowserRouter> <Home/> </BrowserRouter>)

    const news = await waitFor(() => screen.findAllByTestId("news"), {timeout:20000})

    userEvent.click(news[0])

    expect(window.open).toHaveBeenCalled()
}, 20000)