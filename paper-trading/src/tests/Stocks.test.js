import {render, screen,  waitForElementToBeRemove} from '@testing-library/React'
import '@testing-library/jest-dom'
import { BrowserRouter, Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event'
import Stocks from '../pages/Stocks'

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

test('change input of main search bar', async () => {
  
})
