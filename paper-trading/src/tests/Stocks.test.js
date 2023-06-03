import {render, screen, fireEvent, waitForElementToBeRemove, waitFor} from '@testing-library/React'
import '@testing-library/jest-dom'
import { BrowserRouter, Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event'
import Stocks from '../pages/Stocks'

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

// beforeEach(() => {
//     jest.spyOn(window, "fetch").mockImplementation(mockFetch)
// })

// afterEach(() => {
//     jest.restoreAllMocks()
// })

test('renders the landing page', async () => {
    render(<BrowserRouter> <Stocks/> </BrowserRouter>)

    expect(screen.getByText(/Search For Stock Symbol/i))
    const textfield = screen.getByRole('main-search-bar')
    expect(textfield).toBeInTheDocument()
})

test('render data on screen after search', async () => {
    render(<BrowserRouter> <Stocks/> </BrowserRouter>)

    const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
    fireEvent.change(textfieldInput, {target: {value: 'TSLA'}})
    userEvent.click(screen.getByRole("button"))

    expect(await (waitFor(() => screen.getByText(/TSLA/i), {timeout:10000})))
    expect(await (waitFor(() => screen.getByText(/USD/i), {timeout:10000})))
    expect(await (waitFor(() => screen.getByText(/EXCHANGE/i), {timeout:10000})))
    expect(await (waitFor(() => screen.getByText(/VOLATILITY/i), {timeout:10000})))
    expect(await (waitFor(() => screen.getByText(/P\/E/i), {timeout:10000})))
    expect(await (waitFor(() => screen.getByText(/Volume \(current\):/i), {timeout:10000})))
    expect(await (waitFor(() => screen.getByText(/Today's High \(\$\)/i), {timeout:10000})))
    expect(await (waitFor(() => screen.getByText(/Today's Low \(\$\)/i), {timeout:10000})))
    expect(await (waitFor(() => screen.getByText(/52 Week High \(\$\):/i), {timeout:10000})))
    expect(await (waitFor(() => screen.getByText(/Bid\/Ask Price \(\$\):/i), {timeout:10000})))
    expect(await (waitFor(() => screen.getByText(/52 Week Low \(\$\):/i), {timeout:10000})))
    expect(await (waitFor(() => screen.getByText(/Account Buying Power \(\$\):/i), {timeout:10000})))
    expect(await (waitFor(() => screen.getByText(/Shares Owned:/i), {timeout:10000})))
    expect(screen.getByRole("button", {name: "Confirm"})).toBeInTheDocument()
    expect(screen.getByRole("button", {name: "Remove from Watchlist"})).toBeInTheDocument()
    expect(screen.getByRole("quantity-textfield")).toBeInTheDocument()
    expect(screen.getByRole("selected-action")).toBeInTheDocument()
}, 10000)

test('search with enter key', async () => {
  render(<BrowserRouter> <Stocks/> </BrowserRouter>)

  const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
  fireEvent.change(textfieldInput, {target: {value: 'TSLA'}})
  fireEvent.keyDown(textfieldInput, { key: "Enter" });

  expect(await (waitFor(() => screen.getByText(/TSLA/i), {timeout:10000})))
}, 10000)

test('invalid stock search', async () => {
  render(<BrowserRouter> <Stocks/> </BrowserRouter>)

  const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
  fireEvent.change(textfieldInput, {target: {value: 'FDASFASDFAS'}})
  userEvent.click(screen.getByRole("button"))

  expect(await (waitFor(() => screen.getByText(/Invalid Symbol/i), {timeout:10000})))
}, 10000)

test('do one search and another search afterwards', async () => {
  render(<BrowserRouter> <Stocks/> </BrowserRouter>)

  const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
  fireEvent.change(textfieldInput, {target: {value: 'TSLA'}})
  userEvent.click(screen.getByRole("button"))
  expect(await (waitFor(() => screen.getByText(/TSLA/i), {timeout:10000})))

  const secondTextfieldInput = await (waitFor(() => screen.getByRole('search-bar').querySelector('input'), {timeout:10000}))
  fireEvent.change(secondTextfieldInput, {target: {value: 'AAPL'}})
  userEvent.click(await (waitFor(() => screen.getByRole("button", {name: /search-button/i}), {timeout:10000})))
  
  expect(await (waitFor(() => screen.getByText(/AAPL/i), {timeout:10000})))

}, 10000)

test('change graphs of stocks page', async () => {
  render(<BrowserRouter> <Stocks /> </BrowserRouter>)
  
  const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
  fireEvent.change(textfieldInput, {target: {value: 'TSLA'}})
  userEvent.click(screen.getByRole("button"))
 
  expect(await (waitFor(() => screen.getByText(/TSLA/i), {timeout: 10000})))
  userEvent.click(await (waitFor(() => screen.getByRole("button", {name: "1D"}), {timeout: 10000})))
  expect(screen.getByRole("button", {name: "1D"})).toEqual(screen.getByRole("button", {pressed: true}))

  userEvent.click(screen.getByRole("button", {name: "5D"}))
  expect(screen.getByRole("button", {name: "5D"})).toEqual(screen.getByRole("button", {pressed: true}))
  
  userEvent.click(screen.getByRole("button", {name: "Max"}))
  expect(screen.getByRole("button", {name: "Max"})).toEqual(screen.getByRole("button", {pressed: true}))

  userEvent.click(screen.getByRole("button", {name: "YTD"}))
  expect(screen.getByRole("button", {name: "YTD"})).toEqual(screen.getByRole("button", {pressed: true}))

  userEvent.click(screen.getByRole("button", {name: "1Y"}))
  expect(screen.getByRole("button", {name: "1Y"})).toEqual(screen.getByRole("button", {pressed: true}))

  userEvent.click(screen.getByRole("button", {name: "5Y"}))
  expect(screen.getByRole("button", {name: "5Y"})).toEqual(screen.getByRole("button", {pressed: true}))

  userEvent.click(screen.getByRole("button", {name: "6M"}))
  expect(screen.getByRole("button", {name: "6M"})).toEqual(screen.getByRole("button", {pressed: true}))

  userEvent.click(screen.getByRole("button", {name: "1M"}))
  expect(screen.getByRole("button", {name: "1M"})).toEqual(screen.getByRole("button", {pressed: true}))
}, 20000)

test('adding/removing from watchlist', async () => {
  render(<BrowserRouter> <Stocks /> </BrowserRouter>)
  
  const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
  fireEvent.change(textfieldInput, {target: {value: 'TSLA'}})
  userEvent.click(screen.getByRole("button"))

  expect(await (waitFor(() => screen.getByRole("button", {name: "Remove from Watchlist"}), {timeout: 10000})))
  userEvent.click(screen.getByRole("button", {name: "Remove from Watchlist"}))
  expect(await (waitFor(() => screen.getByRole("button", {name: "Add to Watchlist"}), {timeout: 10000})))
  userEvent.click(screen.getByRole("button", {name: "Add to Watchlist"}))
  expect(await (waitFor(() => screen.getByRole("button", {name: "Remove from Watchlist"}), {timeout: 10000})))
}, 20000)

test('invalid action transaction', async () => {
  render(<BrowserRouter> <Stocks /> </BrowserRouter>)
  
  const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
  fireEvent.change(textfieldInput, {target: {value: 'TSLA'}})
  userEvent.click(screen.getByRole("button"))
  
  await (waitFor(() => userEvent.click(screen.getByRole("button", {name: "Confirm"})), {timeout:10000}))
  //userEvent.click(screen.getByRole("button", {name: "Confirm"}))

  expect(screen.getByText(/No Selected Action/i))

}, 20000)

test('invalid selling', async () => {
  render(<BrowserRouter> <Stocks /> </BrowserRouter>)
  
  const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
  fireEvent.change(textfieldInput, {target: {value: 'TSLA'}})
  userEvent.click(screen.getByRole("button"))
 
  //expect(await (waitFor(() => screen.getByText(/Shares Owned: undefined/i), {timeout : 10000})))
  userEvent.click(await (waitFor(() => screen.getByTestId("select"), {timeout:10000})))
  userEvent.click(screen.getByText("Sell"))

  const quantity = screen.getByRole('quantity-textfield').querySelector('input')
  fireEvent.change(quantity, {target: {value: '99999'}})

  userEvent.click(screen.getByRole("button", {name: "Confirm"}))

  expect(screen.getByText(/Insufficient Shares/i))
}, 20000)

test('invalid buying', async () => {
  render(<BrowserRouter> <Stocks /> </BrowserRouter>)
  
  const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
  fireEvent.change(textfieldInput, {target: {value: 'TSLA'}})
  userEvent.click(screen.getByRole("button"))
 
  //expect(await (waitFor(() => screen.getByText(/Shares Owned: undefined/i), {timeout : 10000})))
  userEvent.click(await (waitFor(() => screen.getByTestId("select"), {timeout:10000})))
  userEvent.click(screen.getByText("Buy"))

  const quantity = screen.getByRole('quantity-textfield').querySelector('input')
  fireEvent.change(quantity, {target: {value: '9999999'}})

  userEvent.click(screen.getByRole("button", {name: "Confirm"}))

  expect(screen.getByText(/Insufficient Funds/i))
}, 20000)

test('invalid quantity', async () => {
  render(<BrowserRouter> <Stocks /> </BrowserRouter>)
  
  const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
  fireEvent.change(textfieldInput, {target: {value: 'TSLA'}})
  userEvent.click(screen.getByRole("button"))
 
  //expect(await (waitFor(() => screen.getByText(/Shares Owned: undefined/i), {timeout : 10000})))
  userEvent.click(await (waitFor(() => screen.getByTestId("select"), {timeout:10000})))
  userEvent.click(screen.getByText("Buy"))

  const quantity = screen.getByRole('quantity-textfield').querySelector('input')
  fireEvent.change(quantity, {target: {value: ''}})

  userEvent.click(screen.getByRole("button", {name: "Confirm"}))

  expect(screen.getByText(/No Quantity/i))
}, 20000)

test('valid buying', async () => {
  render(<BrowserRouter> <Stocks /> </BrowserRouter>)
  
  const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
  fireEvent.change(textfieldInput, {target: {value: 'TSLA'}})
  userEvent.click(screen.getByRole("button"))
 
  //expect(await (waitFor(() => screen.getByText(/Shares Owned: undefined/i), {timeout : 10000})))
  userEvent.click(await (waitFor(() => screen.getByTestId("select"), {timeout:10000})))
  userEvent.click(screen.getByText("Buy"))

  const quantity = screen.getByRole('quantity-textfield').querySelector('input')
  fireEvent.change(quantity, {target: {value: '0'}})

  userEvent.click(screen.getByRole("button", {name: "Confirm"}))

  expect(screen.getByText(/Transaction Completed/i))
}, 20000)

test('valid selling', async () => {
  render(<BrowserRouter> <Stocks /> </BrowserRouter>)
  
  const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
  fireEvent.change(textfieldInput, {target: {value: 'TSLA'}})
  userEvent.click(screen.getByRole("button"))
 
  //expect(await (waitFor(() => screen.getByText(/Shares Owned: undefined/i), {timeout : 10000})))
  userEvent.click(await (waitFor(() => screen.getByTestId("select"), {timeout:10000})))
  userEvent.click(screen.getByText("Sell"))

  const quantity = screen.getByRole('quantity-textfield').querySelector('input')
  fireEvent.change(quantity, {target: {value: '0'}})

  userEvent.click(screen.getByRole("button", {name: "Confirm"}))

  expect(screen.getByText(/Transaction Completed/i))
}, 20000)

