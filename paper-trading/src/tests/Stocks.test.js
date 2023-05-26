import {render, screen, fireEvent, waitForElementToBeRemove, waitFor} from '@testing-library/React'
import '@testing-library/jest-dom'
import { BrowserRouter, Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event'
import Stocks from '../pages/Stocks'

jest.mock('react-chartjs-2', () => ({
  Line: () => null
}));
// global.fetch = jest.fn(() =>
//   Promise.resolve({
//     json: () => Promise.resolve({data: 'Mocked Data'}),
//   })
// );

// beforeEach(() => {
//   fetch.mockClear();
// });

// const mockedUsedNavigate = jest.fn();
// const mockedUsedLocation = jest.fn();
// jest.mock('react-router-dom', () => ({
//    ...jest.requireActual('react-router-dom'),
//   useNavigate: () => mockedUsedNavigate,
//   useLocation: () => mockedUsedLocation
// }));

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
global.localStorage.setItem("profile", JSON.stringify({'email': 'test@gmail.com'}))

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

    expect(await (waitFor(() => screen.getByText(/TSLA/i), {timeout:5000})))
    expect(await (waitFor(() => screen.getByText(/USD/i), {timeout:5000})))
    expect(await (waitFor(() => screen.getByText(/EXCHANGE/i), {timeout:5000})))
    expect(await (waitFor(() => screen.getByText(/VOLATILITY/i), {timeout:5000})))
    expect(await (waitFor(() => screen.getByText(/P\/E/i), {timeout:5000})))
    expect(await (waitFor(() => screen.getByText(/Volume \(current\):/i), {timeout:5000})))
    expect(await (waitFor(() => screen.getByText(/Today's High \(\$\)/i), {timeout:5000})))
    expect(await (waitFor(() => screen.getByText(/Today's Low \(\$\)/i), {timeout:5000})))
    expect(await (waitFor(() => screen.getByText(/52 Week High \(\$\):/i), {timeout:5000})))
    expect(await (waitFor(() => screen.getByText(/Bid\/Ask Price \(\$\):/i), {timeout:5000})))
    expect(await (waitFor(() => screen.getByText(/52 Week Low \(\$\):/i), {timeout:5000})))
    expect(await (waitFor(() => screen.getByText(/Account Buying Power \(\$\):/i), {timeout:5000})))
    expect(await (waitFor(() => screen.getByText(/Shares Owned:/i), {timeout:5000})))
}, 5000)

test('do one search and another search afterwards', async () => {
  render(<BrowserRouter> <Stocks/> </BrowserRouter>)

  const textfieldInput = screen.getByRole('main-search-bar').querySelector('input')
  fireEvent.change(textfieldInput, {target: {value: 'TSLA'}})
  userEvent.click(screen.getByRole("button"))
  expect(await (waitFor(() => screen.getByText(/TSLA/i), {timeout:6000})))

  const secondTextfieldInput = await (waitFor(() => screen.getByRole('search-bar').querySelector('input'), {timeout:6000}))
  fireEvent.change(secondTextfieldInput, {target: {value: 'AAPL'}})
  userEvent.click(await (waitFor(() => screen.getByRole("button", {name: /search-button/i}), {timeout:6000})))
  
  expect(await (waitFor(() => screen.getByText(/AAPL/i), {timeout:6000})))

}, 6000)
