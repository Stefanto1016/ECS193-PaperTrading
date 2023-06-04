describe('Home Page Rendering', function () {
  beforeEach(function () {
    cy.loginByGoogleApi()
  })

  it('Login to Home and Check Rendering', function () {
    // NavBar Header Button Text
    cy.get('.MuiIconButton-root').should('be.visible')
    cy.contains('CompuTrade').should('be.visible')
    cy.contains('Portfolio').should('be.visible')
    cy.contains('Stocks').should('be.visible')
    cy.contains('Learning').should('be.visible')
    cy.contains('Game').should('be.visible')
    cy.contains('LogOut').should('be.visible')

    // Home Page Headers
    cy.contains('Account Summary').should('be.visible')
    cy.contains('Performance History').should('be.visible')
    cy.contains('Stock Market News').should('be.visible')
    cy.contains('Top Stock Gainers').should('be.visible')

  })
})

describe('Portfolio Viewing/Routing', function () {
  beforeEach(function () {
    cy.loginByGoogleApi()
  })

  it('Go to Portfolio, check data, and return to home', function () {
    // NavBar Header Button Text
    cy.get('[href="/portfolio"]').click()

    // Check URL
    cy.url().should('include', '/portfolio')

    // Portfolio Page should have some key headers
    cy.contains('Account Summary').should('be.visible')
    cy.contains('Performance History').should('be.visible')
    cy.contains('My Stocks').should('be.visible')
    cy.contains('My Watchlist').should('be.visible')

    // Go Back to Home Page
    cy.get('.MuiIconButton-root').click()
    
    // Check URL
    cy.url().should('include', '/App')
  })
})