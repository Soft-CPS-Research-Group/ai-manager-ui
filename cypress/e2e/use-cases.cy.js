/// <reference types="cypress" />

describe('Use Cases Page Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.contains('.nav a.nav-link', 'Use Cases').click()
  })

  it('should', () => {
    
  })
})
