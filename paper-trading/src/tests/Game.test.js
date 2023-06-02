import {render, screen, fireEvent, waitForElementToBeRemoved, waitFor} from '@testing-library/React'
import '@testing-library/jest-dom'
import { BrowserRouter, Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event'
import Game from '../pages/Game'

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

test('renders game menu', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)

    expect(screen.getByText(/The CompuTrade Stock Game/i))

    expect(screen.getByRole("button", { name: "Play Now!" }))
    expect(screen.getByRole("button", { name: "View Leaderboard"}))

    expect(screen.getByText(/Up for the challenge\?/i))
    expect(screen.getByText(/play against yourself!/))
})

test('renders leaderboard', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    userEvent.click(screen.getByRole("button", { name: "View Leaderboard"}))

    expect(screen.getByText(/Game Leaderboard/i))
    expect(screen.getByText(/#/i))
    expect(screen.getByText(/User/i))
    expect(screen.getByText(/Balance \(\$\)/i))
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument()
})

test('render daily challenge', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    userEvent.click(screen.getByRole("button", { name: "Play Now!"}))

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Daily Challenge.../i), {timeout: 20000});

    expect(screen.getByText(/Market Price \(\$\):/))
    expect(screen.getByText(/Balance \(\$\):/i))
    expect(screen.getByText(/Buying Power \(\$\):/i))
    expect(screen.getByText(/Shares Owned/i))
    expect(screen.getByRole("button", {name: "Confirm"})).toBeInTheDocument()
    expect(screen.getByRole("quantity-textfield")).toBeInTheDocument()
    expect(screen.getByRole("selected-action")).toBeInTheDocument()
    expect(screen.getByRole("button", {name: "Forward 1 Day"})).toBeInTheDocument()
    expect(screen.getByRole("button", {name: "Forward 1 Week (5 Dates)"})).toBeInTheDocument()
    expect(screen.getByRole("button", {name: "Forward 1 Month (20 Dates)"})).toBeInTheDocument()
    expect(screen.getByRole("button", {name: "Finish"})).toBeDisabled()
}, 20000)

test('render personal challenge', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    userEvent.click(screen.getByText(/play against yourself!/i))

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Personal Challenge.../i), {timeout: 20000});

    expect(screen.getByText(/Market Price \(\$\):/))
    expect(screen.getByText(/Balance \(\$\):/i))
    expect(screen.getByText(/Buying Power \(\$\):/i))
    expect(screen.getByText(/Shares Owned/i))
    expect(screen.getByRole("button", {name: "Confirm"})).toBeInTheDocument()
    expect(screen.getByRole("quantity-textfield")).toBeInTheDocument()
    expect(screen.getByRole("selected-action")).toBeInTheDocument()
    expect(screen.getByRole("button", {name: "Forward 1 Day"})).toBeInTheDocument()
    expect(screen.getByRole("button", {name: "Forward 1 Week (5 Dates)"})).toBeInTheDocument()
    expect(screen.getByRole("button", {name: "Forward 1 Month (20 Dates)"})).toBeInTheDocument()
    expect(screen.getByRole("button", {name: "Finish"})).toBeDisabled()
}, 20000)

test('change graphs in a challenge', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    userEvent.click(screen.getByRole("button", { name: "Play Now!"}))

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Daily Challenge.../i), {timeout: 20000});

    userEvent.click(screen.getByRole("button", {name: /stock-button2/i}))
    expect(screen.getByRole("button", {name: /stock-button2/i})).toEqual(screen.getByRole("button", {pressed: true}))

    userEvent.click(screen.getByRole("button", {name: /stock-button0/i}))
    expect(screen.getByRole("button", {name: /stock-button0/i})).toEqual(screen.getByRole("button", {pressed: true}))
    
    userEvent.click(screen.getByRole("button", {name: /stock-button1/i}))
    expect(screen.getByRole("button", {name: /stock-button1/i})).toEqual(screen.getByRole("button", {pressed: true}))

    userEvent.click(screen.getByRole("button", {name: /stock-button3/i}))
    expect(screen.getByRole("button", {name: /stock-button3/i})).toEqual(screen.getByRole("button", {pressed: true}))

    userEvent.click(screen.getByRole("button", {name: /stock-button6/i}))
    expect(screen.getByRole("button", {name: /stock-button6/i})).toEqual(screen.getByRole("button", {pressed: true}))

    userEvent.click(screen.getByRole("button", {name: /stock-button9/i}))
    expect(screen.getByRole("button", {name: /stock-button9/i})).toEqual(screen.getByRole("button", {pressed: true}))

    userEvent.click(screen.getByRole("button", {name: /stock-button7/i}))
    expect(screen.getByRole("button", {name: /stock-button7/i})).toEqual(screen.getByRole("button", {pressed: true}))

    userEvent.click(screen.getByRole("button", {name: /stock-button5/i}))
    expect(screen.getByRole("button", {name: /stock-button5/i})).toEqual(screen.getByRole("button", {pressed: true}))

    userEvent.click(screen.getByRole("button", {name: /stock-button4/i}))
    expect(screen.getByRole("button", {name: /stock-button4/i})).toEqual(screen.getByRole("button", {pressed: true}))

    userEvent.click(screen.getByRole("button", {name: /stock-button8/i}))
    expect(screen.getByRole("button", {name: /stock-button8/i})).toEqual(screen.getByRole("button", {pressed: true}))
}, 20000)

test('invalid action transaction', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    
    userEvent.click(screen.getByRole("button", { name: "Play Now!"}))

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Daily Challenge.../i), {timeout: 20000});

    userEvent.click(screen.getByRole("button", {name: "Confirm"}))

    expect(screen.getByText(/No Selected Action/i))

}, 20000)

test('invalid selling', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    
    userEvent.click(screen.getByRole("button", { name: "Play Now!"}))

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Daily Challenge.../i), {timeout: 20000});

    userEvent.click(screen.getByTestId("select"))
    userEvent.click(screen.getByText(/Sell/i))

    const textfieldInput = screen.getByRole('quantity-textfield').querySelector('input')
    fireEvent.change(textfieldInput, {target: {value: 999}})

    userEvent.click(screen.getByRole("button", {name: "Confirm"}))

    expect(await (waitFor(() => screen.getByText(/Insufficient Shares/i), {timeout:5000})))
}, 20000)

test('invalid buying', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    
    userEvent.click(screen.getByRole("button", { name: "Play Now!"}))

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Daily Challenge.../i), {timeout: 20000});

    userEvent.click(screen.getByTestId("select"))
    userEvent.click(screen.getByText("Buy"))

    const textfieldInput = screen.getByRole('quantity-textfield').querySelector('input')
    fireEvent.change(textfieldInput, {target: {value: 99999999}})

    userEvent.click(screen.getByRole("button", {name: "Confirm"}))

    expect(await (waitFor(() => screen.getByText(/Insufficient Funds/i), {timeout:5000})))
}, 20000)

test('invalid quantity', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    
    userEvent.click(screen.getByRole("button", { name: "Play Now!"}))

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Daily Challenge.../i), {timeout: 20000});

    userEvent.click(screen.getByTestId("select"))
    userEvent.click(screen.getByText("Buy"))

    const textfieldInput = screen.getByRole('quantity-textfield').querySelector('input')
    fireEvent.change(textfieldInput, {target: {value: ''}})

    userEvent.click(screen.getByRole("button", {name: "Confirm"}))

    expect(await (waitFor(() => screen.getByText(/No Quantity Provided/i), {timeout:5000})))
}, 20000)

test('valid buying', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    
    userEvent.click(screen.getByRole("button", { name: "Play Now!"}))

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Daily Challenge.../i), {timeout: 20000});

    userEvent.click(screen.getByTestId("select"))
    userEvent.click(screen.getByText("Buy"))

    const textfieldInput = screen.getByRole('quantity-textfield').querySelector('input')
    fireEvent.change(textfieldInput, {target: {value: 0}})

    userEvent.click(screen.getByRole("button", {name: "Confirm"}))

    expect(await (waitFor(() => screen.getByText(/Transaction Completed/i), {timeout:5000})))
}, 20000)

test('valid selling', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    
    userEvent.click(screen.getByRole("button", { name: "Play Now!"}))

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Daily Challenge.../i), {timeout: 20000});

    userEvent.click(screen.getByTestId("select"))
    userEvent.click(screen.getByText("Sell"))

    const textfieldInput = screen.getByRole('quantity-textfield').querySelector('input')
    fireEvent.change(textfieldInput, {target: {value: 0}})

    userEvent.click(screen.getByRole("button", {name: "Confirm"}))

    expect(await (waitFor(() => screen.getByText(/Transaction Completed/i), {timeout:5000})))
}, 20000)

test('day forwarding', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    
    userEvent.click(screen.getByRole("button", { name: "Play Now!"}))

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Daily Challenge.../i), {timeout: 20000});

    await (waitFor(() => userEvent.click(screen.getByRole("button", { name: "Forward 1 Day"})), {timeout:20000}))
    //await (waitFor(() => userEvent.click(screen.getByRole("button", { name: "Forward 1 Week (5 Dates)"})), {timeout:10000}))
    //await (waitFor(() => userEvent.click(screen.getByRole("button", { name: "Forward 1 Month (20 Dates)"})), {timeout:10000}))
    
    //expect(await (waitFor(() => screen.getByRole("button", { name: "Finish"}), {timeout:20000}))).toBeDisabled()
    expect(screen.getByRole("button", { name: "Finish"})).toBeDisabled()
}, 20000)

test('week forwarding', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    
    userEvent.click(screen.getByRole("button", { name: "Play Now!"}))

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Daily Challenge.../i), {timeout: 20000});

    //await (waitFor(() => userEvent.click(screen.getByRole("button", { name: "Forward 1 Day"})), {timeout:10000}))
    await (waitFor(() => userEvent.click(screen.getByRole("button", { name: "Forward 1 Week (5 Dates)"})), {timeout:20000}))
    //await (waitFor(() => userEvent.click(screen.getByRole("button", { name: "Forward 1 Month (20 Dates)"})), {timeout:10000}))
    
    //expect(await (waitFor(() => screen.getByRole("button", { name: "Finish"}), {timeout:20000}))).toBeDisabled()
    expect(screen.getByRole("button", { name: "Finish"})).toBeDisabled()
}, 20000)

test('month forwarding', async () => {
    render(<BrowserRouter> <Game /> </BrowserRouter>)
    
    userEvent.click(screen.getByRole("button", { name: "Play Now!"}))

    await waitForElementToBeRemoved(() => screen.queryByText(/Loading Daily Challenge.../i), {timeout: 20000});

    //await (waitFor(() => userEvent.click(screen.getByRole("button", { name: "Forward 1 Day"})), {timeout:10000}))
    //await (waitFor(() => userEvent.click(screen.getByRole("button", { name: "Forward 1 Week (5 Dates)"})), {timeout:10000}))
    await (waitFor(() => userEvent.click(screen.getByRole("button", { name: "Forward 1 Month (20 Dates)"})), {timeout:20000}))
    
    //expect(await (waitFor(() => screen.getByRole("button", { name: "Finish"}), {timeout:20000}))).toBeDisabled()
    expect(screen.getByRole("button", { name: "Finish"})).toBeDisabled()
}, 20000)
