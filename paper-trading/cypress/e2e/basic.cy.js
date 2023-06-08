describe('Basic Routing/Viewing Tests', function () {
  beforeEach(function () {
    cy.loginByGoogleApi()
  })

  it('Login to Home and Check Rendering', function () {
    // NavBar Header, Buttons, and Text
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


    // Performance Chart
    cy.get('canvas').should('be.visible')

    // Card and Card Contents
    cy.get('.MuiCardContent-root').contains('Account Balance').should('be.visible')
    cy.get('.MuiCardContent-root').contains('Buying Power').should('be.visible')

    // At least one news article rendered and top gainers
    cy.get('[style="float: right; width: 30%; height: calc(48% + 305px); max-height: 910px; text-align: center; overflow: auto;"] > .MuiPaper-root > :nth-child(1)')
    .should('exist').should('be.visible')

    cy.get(':nth-child(1) > .css-1ex1afd-MuiTableCell-root').should('exist').should('be.visible')
  })

  it('Go to Portfolio, check data, and return to home', function () {
    cy.wait(5000)

    // NavBar Header Button Text
    cy.get('[href="/portfolio"]').click()

    // Check URL
    cy.url().should('include', '/portfolio')

    // Portfolio Page should have some key headers
    cy.contains('Account Summary').should('be.visible')
    cy.contains('Performance History').should('be.visible')
    cy.contains('My Stocks').should('be.visible')
    cy.contains('My Watchlist').should('be.visible')

    cy.get('.MuiCardContent-root').contains('Account Balance').should('be.visible')
    cy.get('.MuiCardContent-root').contains('Buying Power').should('be.visible')

    cy.get('canvas').should('be.visible')

    // Go Back to Home Page
    cy.get('.MuiIconButton-root').click()
    
    // Check URL
    cy.url().should('include', '/App')
  })

  it('Go to Learning, check contents, and return to home', function () {
    cy.wait(5000)

    // NavBar Header Button Text
    cy.get('[href="/learning"]').click()

    // Check URL
    cy.url().should('include', '/learning')

    // Learning Page should have some key article headers
    cy.contains('Investopedia: Investing').should('be.visible')
    cy.contains('Investing for Beginners').should('be.visible')
    cy.contains('Investing: An Introduction').should('be.visible')
    cy.contains('Stock market basics: 9 tips').should('be.visible')
    cy.contains('How to Invest in Stocks: Beginners').should('be.visible')
    cy.contains('How does the stock market work?').should('be.visible')
    cy.contains('What Are Stock Fundamentals?').should('be.visible')
    cy.contains('Stock Market For Beginners').should('be.visible')

    // Click one of the articles which opens in new tab
    cy.get(':nth-child(7) > .front').trigger('mouseover')
    cy.get(':nth-child(7) > .back > .newsButton').click()

    // Go Back to Home Page
    cy.get('.MuiIconButton-root').click()
    
    // Check URL
    cy.url().should('include', '/App')
  })
})