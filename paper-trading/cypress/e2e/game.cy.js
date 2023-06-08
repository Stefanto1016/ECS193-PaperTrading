describe('Game E2E Test', function () {
    beforeEach(function () {
        cy.loginByGoogleApi()
      })

    it('Go to Game Page and Play Daily Challenge', function () {
        cy.wait(5000)

        // \/ For Personal Challenge
        // cy.get('.MuiTypography-body2 > span')
        // cy.contains('Game Over').should('be.visible')
        // cy.contains('You made it onto the leaderboard!').should('be.visible')
        // cy.contains('Final Balance').should('be.visisble')

        // Go to stocks page
        cy.get('[href="/game"]').as('btn').click()

        // Check URL
        cy.url().should('include', '/game')

        // Header should be visible
        cy.contains('The CompuTrade Stock Game').should('be.visible')

        // Start daily challenge
        cy.get('.css-1gawhhy-MuiStack-root > :nth-child(1)').as('btn').click()

        // Buy 2 of 0th stock
        cy.get('[data-testid="select"]').click()
        cy.get('.MuiList-root > [tabindex="0"]').click()
        cy.get('#outlined-basic').type(2)
        cy.get('.css-lucnt1 > .MuiButtonBase-root').as('btn').click()
        cy.get('#outlined-basic').clear()

        // This should be rendered after transaction
        cy.contains('Shares Owned: 2').should('be.visible')
        cy.contains('Transaction Completed').should('be.visible')

        cy.wait(2000)

        // Buy 3 of 4th stock
        cy.get(`[aria-label="stock-button4"]`).click()
        cy.get('[data-testid="select"]').click()
        cy.get('.MuiList-root > [tabindex="0"]').click()
        cy.get('#outlined-basic').type(3)
        cy.get('.css-lucnt1 > .MuiButtonBase-root').as('btn').click()
        cy.get('#outlined-basic').clear()


        // This should be rendered after transaction
        cy.contains('Shares Owned: 3').should('be.visible')
        cy.contains('Transaction Completed').should('be.visible')

        cy.wait(2000)


        // Buy 2 of 6th stock
        cy.get(`[aria-label="stock-button6"]`).click()
        cy.get('[data-testid="select"]').click()
        cy.get('.MuiList-root > [tabindex="0"]').click()
        cy.get('#outlined-basic').type(2)
        cy.get('.css-lucnt1 > .MuiButtonBase-root').as('btn').click()
        cy.get('#outlined-basic').clear()


        // This should be rendered after transaction
        cy.contains('Shares Owned: 2').should('be.visible')
        cy.contains('Transaction Completed').should('be.visible')

        cy.wait(2000)

        // Forward through 100 days
        for (var i = 0; i < 5; i++) {
            cy.get('.css-2wk6xx > :nth-child(3)').click()
        }

        // Sell all shares of 4th stock
        cy.get(`[aria-label="stock-button4"]`).click()
        cy.get('[data-testid="select"]').click()
        cy.get('.MuiList-root > [tabindex="-1"]').click()
        cy.get('#outlined-basic').type(3)
        cy.get('.css-lucnt1 > .MuiButtonBase-root').as('btn').click()
        cy.get('#outlined-basic').clear()

        // This should be rendered after transaction
        cy.contains('Shares Owned: 0').should('be.visible')
        cy.contains('Transaction Completed').should('be.visible')

        cy.wait(2000)
        
        for (var i = 0; i < 151; i++) {
            cy.get('.css-2wk6xx > :nth-child(1)').click({force:true})
        }

        // Finish Game
        cy.contains('Finish').click()

        // Some things that should be rendered after the game
        cy.contains('Game Over').should('be.visible')
        //cy.contains('You made it onto the leaderboard!').should('be.visible')
        cy.contains('Final Balance').should('be.visible')
        cy.contains('Additional Stats').should('be.visible')

        // Can't play daily challenge again
        cy.contains('Play Again').click()
        cy.contains('You have already completed today\'s daily challenge!').should('be.visible')
        cy.contains('OK').click()

        // Go back to game menu and view leaderboard
        cy.contains('Game Menu').click()

        cy.contains('View Leaderboard').click()

        cy.contains('Game Leaderboard').should('be.visible')

        // Go back to game menu
        cy.contains('Back').click()
        cy.contains('The CompuTrade Stock Game').should('be.visible')


    })
})