import {render, screen, fireEvent, waitForElementToBeRemove, waitFor} from '@testing-library/React'
import '@testing-library/jest-dom'
import { BrowserRouter, Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event'
import Learning from '../pages/Learning'

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

test('renders card titles', async () => {
    render(<BrowserRouter> <Learning/> </BrowserRouter>)

    expect(screen.getAllByText(/Investopedia: Investing/i))
    expect(screen.getAllByText(/Investing: An Introduction/i))
    expect(screen.getAllByText(/How to Invest in Stocks: Beginners/i))
    expect(screen.getAllByText(/What Are Stock Fundamentals\?/i))
    expect(screen.getAllByText(/Investing for Beginners/i))
    expect(screen.getAllByText(/Stock market basics: 9 tips/i))
    expect(screen.getAllByText(/How does the stock market work\?/i))
    expect(screen.getAllByText(/Stock Market For Beginners/i))
})

test('there should be 8 cards', async () => {
    render(<BrowserRouter> <Learning/> </BrowserRouter>)

    const cards = screen.getAllByText(/Open this article!/i)

    expect(cards).toHaveLength(8)
})

test('click and open one of the cards', async () => {
    render(<BrowserRouter> <Learning/> </BrowserRouter>)

    const cards = screen.getAllByText(/Open this article!/i)

    userEvent.click(cards[0])

    expect(window.open).toHaveBeenCalled()
})