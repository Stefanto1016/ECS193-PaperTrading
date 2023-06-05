describe('Stocks E2E Stocks Tests', function () {
    beforeEach(function () {
      cy.loginByGoogleApi()
    })
  
    it('Go to Stocks Page and View Data', function () {
        cy.wait(5000)

        // Go to stocks page
        cy.get('[href="/stocks"]').as('btn').click()

        // Check URL
        cy.url().should('include', '/stocks')

        // Search TSLA stock
        cy.get('input').type('TSLA')
        cy.get('.MuiInputBase-root > .MuiButtonBase-root').as('btn').click()

        cy.wait(5000)

        // Data that should be rendered
        cy.contains('TSLA').should('be.visible')
        cy.contains('Tesla, Inc. - Common Stock').should('be.visible')
        cy.contains('Account Buying Power').should('be.visible')
        cy.contains('Shares Owned: 0').should('be.visible')
        cy.contains('Volume').should('be.visible')
        cy.contains('Today\'s High').should('be.visible')
        cy.contains('Today\'s Low').should('be.visible')
        cy.contains('52 Week High').should('be.visible')
        cy.contains('Bid/Ask Price').should('be.visible')
        cy.contains('52 Week Low').should('be.visible')
        
        // Chart 
        cy.get('canvas').should('be.visible')

        // Button Clicks
        cy.get('[value="5Y"]').as('btn').click()
        cy.get('[value="YTD"]').as('btn').click()
        cy.get('[value="1M"]').as('btn').click()
    })

    it('Conduct Two Searches in A Row', function () {
        cy.wait(5000)
        // Go to Stocks
        cy.get('[href="/stocks"]').as('btn').click()

        // Check URL
        cy.url().should('include', '/stocks')

        // Search TSLA stock
        cy.get('input').type('TSLA')
        cy.get('.MuiInputBase-root > .MuiButtonBase-root').as('btn').click()

        cy.wait(5000)

        // Data that should be rendered for TSLA
        cy.contains('TSLA').should('be.visible')
        cy.contains('Tesla, Inc. - Common Stock').should('be.visible')

        // Now search for another stock while on the TSLA stock page
        cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('AAPL')
        cy.get('.MuiInputBase-root > .MuiButtonBase-root').as('btn').click()

       // Data that should be rendered for TSLA
       cy.contains('AAPL').should('be.visible')
       cy.contains('Apple Inc. - Common Stock').should('be.visible') 
    })

    it('Buy/Sell Stocks and View Changes in Portfolio', function () {
        cy.wait(5000)

        // Go to Stocks
        cy.get('[href="/stocks"]').as('btn').click()

        // Check URL
        cy.url().should('include', '/stocks')

        // Search TSLA stock
        cy.get('input').type('TSLA')
        cy.get('.MuiInputBase-root > .MuiButtonBase-root').as('btn').click()

        cy.wait(5000)

        // Buy 2 shares of stock
        cy.get('[data-testid="select"]').click()
        cy.get('.MuiPaper-root > .MuiList-root > [tabindex="0"]').click()
        cy.get('#outlined-basic').type(2)
        cy.get('.css-1kffit8-MuiButtonBase-root-MuiButton-root').as('btn').click()

        // This should be rendered after transaction
        cy.contains('Shares Owned: 2').should('be.visible')
        cy.contains('Transaction Completed').should('be.visible')

        // Now go to portfolio
        cy.get('[href="/portfolio"]').as('btn').click()

        // Check URL
        cy.url().should('include', '/portfolio')

        // My Stocks should contain the newly added stocks
        cy.get('.css-2ja9mm-MuiTableCell-root').contains('TSLA').should('be.visible')
        cy.get('[data-testid="my-stocks"] > :nth-child(4)').contains('2').should('be.visible')

        // Go back to stocks page for TSLA to sell, but from the portfolio page
        cy.get('.css-2ja9mm-MuiTableCell-root').click()

        // Check URL
        cy.url().should('include', '/stocks')

        // Back at stocks page, now sell the stocks we just bought
        cy.get('[data-testid="select"]').click()
        cy.get('.MuiList-root > [tabindex="-1"]').click()
        cy.get('#outlined-basic').type(2)
        cy.get('.css-1kffit8-MuiButtonBase-root-MuiButton-root').as('btn').click()

        // This should be rendered after transaction
        cy.contains('Shares Owned: 0').should('be.visible')
        cy.contains('Transaction Completed').should('be.visible')

        // Now go back to portfolio
        cy.get('[href="/portfolio"]').as('btn').click()

        // Check URL
        cy.url().should('include', '/portfolio')

        // We should no longer have any stocks
        cy.get('.css-2ja9mm-MuiTableCell-root').should('not.exist')
        cy.get('[data-testid="my-stocks"] > :nth-child(4)').should('not.exist')
    })

    it('Add/Remove Stocks from Watchlist and View Changes in Portfolio', function () {
        cy.wait(5000)

        // Go to Stocks
        cy.get('[href="/stocks"]').as('btn').click()

        // Check URL
        cy.url().should('include', '/stocks')

        // Search AAPL stock which is not in our watchlist
        cy.get('input').type('AAPL')
        cy.get('.MuiInputBase-root > .MuiButtonBase-root').as('btn').click()

        cy.wait(5000)

        // This text should be rendered on the button
        cy.get('.css-1is42sn-MuiButtonBase-root-MuiButton-root').contains('Add to Watchlist').should('be.visible')

        // Add to watchlist
        cy.get('.css-1is42sn-MuiButtonBase-root-MuiButton-root').click()

        // Now go to portfolio
        cy.get('[href="/portfolio"]').as('btn').click()

        // Check URL
        cy.url().should('include', '/portfolio')

        // AAPL should appear in our watchlist
        cy.get('.css-2ja9mm-MuiTableCell-root').contains('AAPL').should('be.visible')

        // Go to back to Stocks
        cy.get('[href="/stocks"]').as('btn').click()

        // Check URL
        cy.url().should('include', '/stocks')

        // Search AAPL stock which is now in our watchlist (using autocomplete)
        cy.get('input').type('AAP')
        cy.contains('AAPL — Apple Inc. - Common Stock').click()
        //cy.get('.MuiInputBase-root > .MuiButtonBase-root').as('btn').click()

        // This text should be rendered on the button since it's on our watch list
        cy.get('.css-1pbef32-MuiButtonBase-root-MuiButton-root').contains('Remove from Watchlist').should('be.visible')

        // Now remove from watchlist
        cy.get('.css-1pbef32-MuiButtonBase-root-MuiButton-root').click()

        // Now go back to portfolio
        cy.get('[href="/portfolio"]').as('btn').click()

        // Check URL
        cy.url().should('include', '/portfolio')

        // AAPL should no longer be on our watchlist
        cy.get('.css-2ja9mm-MuiTableCell-root').should('not.exist')
    })
})
  

    