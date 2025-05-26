/// <reference types="cypress" />

describe('Schema Page Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.contains('.nav a.nav-link', 'Schema').click()
  })

  it('should', () => {
    
  })
})
