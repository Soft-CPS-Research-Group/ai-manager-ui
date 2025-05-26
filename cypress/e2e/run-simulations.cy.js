/// <reference types="cypress" />

describe('Run Simulations Page Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.contains('.nav a.nav-link', 'Run Simulations').click()
  })

  it('should load simulations', () => {
    
  })
})
