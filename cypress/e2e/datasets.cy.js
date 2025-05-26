/// <reference types="cypress" />

describe('Datasets Page Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.contains('.nav a.nav-link', 'Datasets').click()
  })

  it('should', () => {
    
  })
})
