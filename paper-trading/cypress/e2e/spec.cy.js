describe('Login to Hone', function () {
  beforeEach(function () {
    cy.loginByGoogleApi()
  })

  it('Login to Home', function () {
    cy.contains('CompuTrade').should('be.visible')
  })
})