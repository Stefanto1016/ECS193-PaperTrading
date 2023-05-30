import {render, screen, fireEvent, waitForElementToBeRemove, waitFor} from '@testing-library/React'
import '@testing-library/jest-dom'
import { BrowserRouter, Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event'
import Home from '../pages/Home'
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

test('routing home to portfolio', async () => {
    render(<BrowserRouter> <Home/> </BrowserRouter>)

    userEvent.click(screen.getByText(/Portfolio/i))

    expect(window.location.pathname).toBe("/portfolio")
})

test('routing home to stocks', async () => {
    render(<BrowserRouter> <Home/> </BrowserRouter>)

    userEvent.click(screen.getByText(/Stocks/i))

    expect(window.location.pathname).toBe("/stocks")
})

test('routing home to learning', async () => {
    render(<BrowserRouter> <Home/> </BrowserRouter>)

    userEvent.click(screen.getByText(/Learning/i))

    expect(window.location.pathname).toBe("/learning")
})

test('routing home to game', async () => {
    render(<BrowserRouter> <Home/> </BrowserRouter>)

    userEvent.click(screen.getByText(/Game/i))

    expect(window.location.pathname).toBe("/game")
})

// test('routing home to logout', async () => {
//     render(<BrowserRouter> <Home/> </BrowserRouter>)

//     userEvent.click(screen.getByText(/LogOut/i))

//     //expect(window.location.pathname).toBe("/logout")
// })

test('routing portfolio to home', async () => {
    render(<BrowserRouter> <Portfolio/> </BrowserRouter>)

    userEvent.click(screen.getByRole("link", {name: /home/i}))

    expect(window.location.pathname).toBe("/App")
})